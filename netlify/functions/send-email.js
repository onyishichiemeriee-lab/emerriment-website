const { Resend } = require("resend");

const { createClient } = require("@supabase/supabase-js");

const emails = require("../../emails");

const {
    isValidEmail,
    normalizeEmail,
    findLeadsForAddress,
    leadCreatedTime,
    toTime,
    buildTracking,
    unsubscribeHeaders,
    sendWithResend,
    isValueRejected
} = require("../lib/email-common");

const {
    reserveDelivery,
    completeDelivery,
    releaseDelivery
} = require("../lib/email-deliveries");


/* =========================================
   EMerriment Email Function
   -----------------------------------------
   Public endpoint used by the homepage skin
   quiz to send the personalized Skin Report.

   Security model:
   - Only the "report" email type is public.
     Newsletter, welcome and lesson emails have
     no legitimate public caller and are refused.
   - The browser never proves eligibility: the
     recipient must have a recent, unsent lead,
     verified server-side with the service-role
     key. Browser-supplied lead ids are ignored.
   - Addresses are compared after normalization
     (trimmed, case-insensitive).
   - At most one report per address per 24 hours,
     including when several leads exist for it.
   - Each lead is claimed with an atomic
     conditional update before sending, then
     re-checked for competing leads; competing
     claims back off.
   - Report content is rendered from the stored
     lead and HTML-escaped by the template.
   - Responses are generic; logs contain no
     addresses, provider errors or credentials.
========================================= */


/* -----------------------------------------
   CONFIGURATION
----------------------------------------- */

const PUBLIC_EMAIL_TYPES = ["report"];

const MAX_BODY_BYTES = 10 * 1024;

// A lead must have been created within this
// window to receive its report email.
const LEAD_MAX_AGE_MS = 30 * 60 * 1000;

// Tolerance for browser clocks that run ahead
// (submitted_at is set by the browser).
const LEAD_FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

// A "Sending" claim can only be taken while its
// lead is inside the eligibility window, and a
// function run lasts seconds. A "Sending" lead
// older than this is an abandoned claim and no
// longer blocks its address.
const IN_FLIGHT_WINDOW_MS = LEAD_MAX_AGE_MS + 2 * 60 * 1000;

const RECIPIENT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const STATUS_PENDING = "Pending";
const STATUS_SENDING = "Sending";
const STATUS_SENT = "Sent";

// Compatibility switch for databases whose
// email_status column rejects "Sending".
// Default ("strict"): refuse to send rather than
// mark an email Sent before delivery.
// "sent-before-delivery": claim with "Sent" plus a
// claim timestamp, and revert it if delivery
// fails. Only enable after confirming the schema
// cannot accept "Sending".
const CLAIM_MODE =
    process.env.EMAIL_CLAIM_COMPAT_MODE === "sent-before-delivery"
        ? "sent-before-delivery"
        : "strict";

const FIELD_LIMITS = {
    name: 100,
    skinType: 60,
    concern: 60,
    oilLevel: 60,
    sensitivity: 60,
    recommendation: 500
};

const ALLOWED_FIELDS = new Set([
    "type",
    "email",
    "score",
    ...Object.keys(FIELD_LIMITS)
]);


/* -----------------------------------------
   CLIENTS (server-side credentials only)
----------------------------------------- */

let resendClient = null;
let supabaseClient = null;

function getClients() {

    const resendKey = process.env.RESEND_API_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!resendKey || !supabaseUrl || !serviceRoleKey) {
        return null;
    }

    if (!resendClient) {
        resendClient = new Resend(resendKey);
    }

    if (!supabaseClient) {
        supabaseClient = createClient(
            supabaseUrl,
            serviceRoleKey,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false
                }
            }
        );
    }

    return {
        resend: resendClient,
        supabase: supabaseClient
    };

}


/* -----------------------------------------
   RESPONSES
----------------------------------------- */

function respond(statusCode, body) {

    return {
        statusCode,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
        },
        body: JSON.stringify(body)
    };

}

const RESPONSES = {

    sent: () =>
        respond(200, {
            success: true,
            message: "Email sent successfully."
        }),

    methodNotAllowed: () =>
        respond(405, {
            success: false,
            error: "Method Not Allowed"
        }),

    tooLarge: () =>
        respond(413, {
            success: false,
            error: "Request is too large."
        }),

    invalid: () =>
        respond(400, {
            success: false,
            error: "Invalid request."
        }),

    forbidden: () =>
        respond(403, {
            success: false,
            error: "This email type is not available."
        }),

    // Same response for missing, ineligible,
    // duplicate and rate-limited requests, so it
    // does not reveal whether a lead exists.
    notSent: () =>
        respond(409, {
            success: false,
            error: "Email could not be sent."
        }),

    deliveryFailed: () =>
        respond(502, {
            success: false,
            error: "Email could not be sent. Please try again later."
        }),

    serverError: () =>
        respond(500, {
            success: false,
            error: "Something went wrong. Please try again later."
        })

};


/* -----------------------------------------
   VALIDATION
----------------------------------------- */

function readBody(event) {

    let raw = event.body || "";

    if (event.isBase64Encoded && raw) {
        raw = Buffer.from(raw, "base64").toString("utf8");
    }

    return raw;

}

function validateRequest(body) {

    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body)
    ) {
        return { ok: false, reason: "invalid" };
    }

    // Type: defaults to "report", which is what
    // the homepage quiz relies on.
    const type =
        body.type === undefined ? "report" : body.type;

    if (typeof type !== "string") {
        return { ok: false, reason: "invalid" };
    }

    if (!PUBLIC_EMAIL_TYPES.includes(type)) {
        return { ok: false, reason: "forbidden" };
    }

    // Unexpected fields (e.g. newsletter "content",
    // "subject", a lead id, an admin flag) are
    // rejected rather than silently ignored.
    for (const key of Object.keys(body)) {
        if (!ALLOWED_FIELDS.has(key)) {
            return { ok: false, reason: "invalid" };
        }
    }

    if (typeof body.email !== "string") {
        return { ok: false, reason: "invalid" };
    }

    const email = normalizeEmail(body.email);

    if (!isValidEmail(email)) {
        return { ok: false, reason: "invalid" };
    }

    for (const [field, limit] of Object.entries(FIELD_LIMITS)) {

        const value = body[field];

        if (value === undefined || value === null) {
            continue;
        }

        if (typeof value !== "string" || value.length > limit) {
            return { ok: false, reason: "invalid" };
        }

    }

    if (body.score !== undefined && body.score !== null) {

        const score = body.score;

        if (
            typeof score !== "number" ||
            !Number.isFinite(score) ||
            score < 0 ||
            score > 100
        ) {
            return { ok: false, reason: "invalid" };
        }

    }

    return { ok: true, type, email };

}


/* -----------------------------------------
   LEAD ELIGIBILITY
----------------------------------------- */

function newestLead(leads) {

    let newest = null;
    let newestTime = -Infinity;

    for (const lead of leads) {

        const time = leadCreatedTime(lead);

        if (time !== null && time > newestTime) {
            newest = lead;
            newestTime = time;
        }

    }

    return newest;

}

function isLeadEligible(lead, now) {

    if (!lead) {
        return false;
    }

    if (lead.email_status !== STATUS_PENDING) {
        return false;
    }

    if (lead.last_email_sent) {
        return false;
    }

    const createdAt = leadCreatedTime(lead);

    if (createdAt === null) {
        return false;
    }

    if (createdAt < now - LEAD_MAX_AGE_MS) {
        return false;
    }

    if (createdAt > now + LEAD_FUTURE_TOLERANCE_MS) {
        return false;
    }

    return true;

}

// True when another lead for the same address
// was emailed in the last 24 hours, or holds a
// live "Sending" claim.
function hasCompetingLead(leads, leadId, now) {

    return leads.some((other) => {

        if (other.id === leadId) {
            return false;
        }

        const sentAt = toTime(other.last_email_sent);

        if (sentAt !== null && sentAt >= now - RECIPIENT_COOLDOWN_MS) {
            return true;
        }

        if (other.email_status === STATUS_SENDING) {

            const createdAt = leadCreatedTime(other);

            if (createdAt !== null && createdAt >= now - IN_FLIGHT_WINDOW_MS) {
                return true;
            }

        }

        return false;

    });

}


/* -----------------------------------------
   ATOMIC CLAIM
   -----------------------------------------
   A conditional UPDATE only matches while the
   lead is still Pending with no send recorded.
   Postgres row locking lets only one concurrent
   request win.

   Every later update is conditioned on the exact
   state this request wrote, so it can never
   overwrite a state set by another request.
----------------------------------------- */

async function claimLead(supabase, leadId) {

    if (CLAIM_MODE === "strict") {

        const { data, error } = await supabase
            .from("leads")
            .update({ email_status: STATUS_SENDING })
            .eq("id", leadId)
            .eq("email_status", STATUS_PENDING)
            .is("last_email_sent", null)
            .select("id");

        if (error) {

            if (isValueRejected(error)) {
                // Fail closed: never mark Sent before
                // delivery without explicit opt-in.
                throw new Error("status_value_sending_rejected");
            }

            throw new Error("lead_claim_failed");

        }

        return Array.isArray(data) && data.length === 1
            ? { status: STATUS_SENDING, claimedAt: null }
            : null;

    }

    // Compatibility mode (explicit opt-in only).
    const claimedAt = new Date().toISOString();

    const { data, error } = await supabase
        .from("leads")
        .update({
            email_status: STATUS_SENT,
            last_email_sent: claimedAt
        })
        .eq("id", leadId)
        .eq("email_status", STATUS_PENDING)
        .is("last_email_sent", null)
        .select("id");

    if (error) {
        throw new Error("lead_claim_failed");
    }

    return Array.isArray(data) && data.length === 1
        ? { status: STATUS_SENT, claimedAt }
        : null;

}

// Restricts an update to the exact state this
// request's claim wrote.
function whereClaimed(query, leadId, claim) {

    query = query
        .eq("id", leadId)
        .eq("email_status", claim.status);

    if (claim.claimedAt) {
        query = query.eq("last_email_sent", claim.claimedAt);
    } else {
        query = query.is("last_email_sent", null);
    }

    return query;

}

async function markSent(supabase, leadId, claim) {

    const { error } = await whereClaimed(
        supabase
            .from("leads")
            .update({
                email_status: STATUS_SENT,
                last_email_sent: new Date().toISOString()
            }),
        leadId,
        claim
    );

    return !error;

}

async function releaseClaim(supabase, leadId, claim) {

    const { error } = await whereClaimed(
        supabase
            .from("leads")
            .update({
                email_status: STATUS_PENDING,
                last_email_sent: null
            }),
        leadId,
        claim
    );

    return !error;

}


/* -----------------------------------------
   HANDLER
----------------------------------------- */

exports.handler = async (event) => {

    if (event.httpMethod !== "POST") {
        return RESPONSES.methodNotAllowed();
    }

    const rawBody = readBody(event);

    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
        return RESPONSES.tooLarge();
    }

    let body;

    try {
        body = JSON.parse(rawBody || "{}");
    } catch (error) {
        return RESPONSES.invalid();
    }

    const request = validateRequest(body);

    if (!request.ok) {
        return request.reason === "forbidden"
            ? RESPONSES.forbidden()
            : RESPONSES.invalid();
    }

    const clients = getClients();

    if (!clients) {
        console.error("SEND EMAIL: required server configuration is missing.");
        return RESPONSES.serverError();
    }

    const { resend, supabase } = clients;

    let leadId = null;
    let claim = null;
    let reservation = null;

    try {

        const now = Date.now();

        /* ---------- Eligible lead ---------- */

        const leads = await findLeadsForAddress(supabase, request.email);

        if (leads === null) {
            throw new Error("lead_lookup_failed");
        }

        const lead = newestLead(leads);

        if (!isLeadEligible(lead, now)) {
            console.warn("SEND EMAIL: no eligible lead for request.");
            return RESPONSES.notSent();
        }

        leadId = lead.id;

        /* ---------- Per-address limit ---------- */

        if (hasCompetingLead(leads, leadId, now)) {
            console.warn("SEND EMAIL: address limit active.", { leadId });
            return RESPONSES.notSent();
        }

        /* ---------- Atomic claim ---------- */

        claim = await claimLead(supabase, leadId);

        if (!claim) {
            console.warn("SEND EMAIL: lead already claimed.", { leadId });
            return RESPONSES.notSent();
        }

        /* ---------- Post-claim re-check ----------
           Two leads for one address can pass the
           first check at the same moment. Each claim
           is committed before its re-check, so at
           least one of two competing requests sees
           the other here and backs off. */

        const recheck = await findLeadsForAddress(supabase, request.email);

        if (recheck === null) {
            throw new Error("lead_recheck_failed");
        }

        if (hasCompetingLead(recheck, leadId, Date.now())) {

            const released = await releaseClaim(supabase, leadId, claim);

            console.warn(
                "SEND EMAIL: competing lead found after claim; backed off.",
                { leadId, claimReleased: released }
            );

            claim = null;

            return RESPONSES.notSent();

        }

        /* ---------- Recipient: the stored lead ---------- */

        const recipient =
            typeof lead.email === "string" ? lead.email.trim() : "";

        if (
            !isValidEmail(recipient) ||
            normalizeEmail(recipient) !== request.email
        ) {
            throw new Error("stored_recipient_invalid");
        }

        /* ---------- Delivery record (at most once) ----------
           Uses the email_deliveries table when the
           migration has been applied; otherwise this
           step is skipped. */

        reservation = await reserveDelivery(supabase, {
            leadId,
            kind: "report",
            day: 0
        });

        if (reservation.state === "duplicate") {

            const released = await releaseClaim(supabase, leadId, claim);

            console.warn(
                "SEND EMAIL: report already recorded for lead.",
                { leadId, claimReleased: released }
            );

            claim = null;
            reservation = null;

            return RESPONSES.notSent();

        }

        /* ---------- Render from stored lead ---------- */

        const tracking = buildTracking(leadId);

        const template = emails.report({
            name: lead.name,
            email: recipient,
            skinType: lead.skin_type,
            concern: lead.concern,
            oilLevel: lead.oil_level,
            sensitivity: lead.sensitivity,
            score: lead.score,
            recommendation: lead.recommendation,
            tracking
        });

        /* ---------- Send ---------- */

        const delivery = await sendWithResend(
            resend,
            {
                to: recipient,
                subject: template.subject,
                html: template.html,
                headers: unsubscribeHeaders(tracking)
            },
            // Resend de-duplicates repeats of the
            // same key, as a second safety net.
            `report-lead-${leadId}`
        );

        if (!delivery.ok) {

            await releaseDelivery(supabase, reservation);

            const released = await releaseClaim(supabase, leadId, claim);

            console.error(
                "SEND EMAIL: delivery failed.",
                { leadId, claimReleased: released }
            );

            claim = null;
            reservation = null;

            return RESPONSES.deliveryFailed();

        }

        /* ---------- Record success ---------- */

        // From here on the email has been sent: nothing
        // may be released.
        const deliveredReservation = reservation;
        reservation = null;

        await completeDelivery(supabase, deliveredReservation, delivery.id);

        const recorded = await markSent(supabase, leadId, claim);

        claim = null;

        if (!recorded) {
            // Delivered. The lead stays claimed, so it
            // cannot be sent again.
            console.error(
                "SEND EMAIL: email sent but status update failed.",
                { leadId }
            );
        }

        console.log(
            "SEND EMAIL: report sent.",
            { leadId, emailId: delivery.id }
        );

        return RESPONSES.sent();

    } catch (error) {

        // Release a reservation and claim taken before
        // the failure (nothing was sent) so a
        // legitimate retry remains possible.
        if (reservation) {
            try {
                await releaseDelivery(supabase, reservation);
            } catch (releaseError) {
                // Logged below.
            }
        }

        if (leadId && claim) {
            try {
                await releaseClaim(supabase, leadId, claim);
            } catch (releaseError) {
                // Logged below.
            }
        }

        console.error(
            "SEND EMAIL: unexpected failure.",
            {
                leadId,
                stage: error && /^[a-z_]+$/.test(error.message)
                    ? error.message
                    : "unknown"
            }
        );

        return RESPONSES.serverError();

    }

};


// Exposed for automated tests only.
exports._internal = {
    validateRequest,
    isLeadEligible,
    hasCompetingLead,
    newestLead,
    CLAIM_MODE
};
