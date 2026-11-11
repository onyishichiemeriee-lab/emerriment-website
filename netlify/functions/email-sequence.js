const { createClient } = require("@supabase/supabase-js");
const { Resend } = require("resend");

// Import all email lessons
const emails = require("../../emails");

const {
    isValidEmail,
    normalizeEmail,
    buildTracking,
    unsubscribeHeaders,
    sendWithResend,
    isValueRejected,
    leadCreatedTime
} = require("../lib/email-common");

const {
    reserveDelivery,
    completeDelivery,
    releaseDelivery,
    wasDelivered
} = require("../lib/email-deliveries");


/* =========================================
   EMerriment 14-Day Email Sequence
   -----------------------------------------
   Runs on a schedule. For each lead whose next
   lesson is due, sends that day's lesson and
   moves the lead to the next day.

   Intended schedule (unchanged):
   - The quiz creates the lead with
     email_sequence_day = 1 and next_email_due =
     24 hours after the quiz.
   - Each successful send advances the day by one
     and sets the next lesson 24 hours later.
   - After Day 14 is sent the lead moves to day 15,
     which means "completed" (the admin dashboard
     already treats day > 14 as completed). No
     Day 15 email exists or is sent.

   Protections:
   - Only days 1–14 are selected.
   - Each lead is claimed with a conditional
     update on its current day and due time, so
     overlapping runs cannot send a lesson twice.
   - A failed send releases the claim and is
     retried on the next run; the day only
     advances after Resend accepts the email.
   - Unsubscribed addresses are skipped.
   - Invalid addresses are skipped.
   - Each run is bounded in size and time.
========================================= */


const DAY_MS = 24 * 60 * 60 * 1000;

const FIRST_DAY = 1;
const LAST_DAY = 14;

// Leads processed per run, and time budget per
// run, so the function finishes before Netlify's
// time limit and respects Resend's rate limit.
const BATCH_SIZE = 50;
const TIME_BUDGET_MS = 20 * 1000;

// While a lesson is being sent, its due time is
// pushed forward by this lease so other runs skip
// it. If the run crashes the lead is retried once
// the lease expires.
const CLAIM_LEASE_MS = 2 * 60 * 60 * 1000;

const STATUS_UNSUBSCRIBED = "Unsubscribed";

/* -----------------------------------------
   ACTIVATION AND ELIGIBILITY
   -----------------------------------------
   EMAIL_SEQUENCE_ENABLED=true
     Required for any lesson to be sent. The
     function is registered on a daily schedule
     (netlify.toml); until this is set it only
     tidies abandoned report claims and sends
     nothing.

   EMAIL_SEQUENCE_START_AFTER=<ISO date/time>
     Recommended when enabling. Only leads that
     joined at or after this moment receive
     lessons; older (historical) leads are left
     untouched. Leads after the cutoff are never
     excluded for being overdue — after an outage
     they simply continue, one lesson per run.

   Without a cutoff, a lead whose lesson is more
   than EMAIL_SEQUENCE_MAX_OVERDUE_DAYS (default
   7) overdue is skipped and left untouched, so
   activating the schedule cannot bulk-email old
   leads. Skips are reported in the run summary
   and logged as a warning (never silent).
----------------------------------------- */

function isSequenceEnabled() {

    return process.env.EMAIL_SEQUENCE_ENABLED === "true";

}

function sequenceStartAfter() {

    const raw = process.env.EMAIL_SEQUENCE_START_AFTER;

    if (raw === undefined || raw === "") {
        return null;
    }

    const time = new Date(raw).getTime();

    if (!Number.isFinite(time)) {
        console.warn("EMAIL SEQUENCE: EMAIL_SEQUENCE_START_AFTER is not a valid date; ignored.");
        return null;
    }

    return time;

}

// Lessons overdue for longer than this are left
// untouched when no start cutoff is configured.
// EMAIL_SEQUENCE_MAX_OVERDUE_DAYS=0 disables it.
function maxOverdueMs() {

    const raw = process.env.EMAIL_SEQUENCE_MAX_OVERDUE_DAYS;

    if (raw === undefined || raw === "") {
        return 7 * DAY_MS;
    }

    const days = Number(raw);

    if (!Number.isFinite(days) || days < 0) {
        return 7 * DAY_MS;
    }

    return days === 0 ? Infinity : days * DAY_MS;

}

// Report claims ("Sending") can only be taken in
// the first 30 minutes of a lead's life. A lead
// still "Sending" well after that is an abandoned
// claim (the report function stopped mid-send).
const ABANDONED_REPORT_CLAIM_MS = 35 * 60 * 1000;


function getClients() {

    const resendKey = process.env.RESEND_API_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!resendKey || !supabaseUrl || !serviceRoleKey) {
        return null;
    }

    return {
        resend: new Resend(resendKey),
        supabase: createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        })
    };

}


function respond(statusCode, body) {

    return {
        statusCode,
        body: JSON.stringify(body)
    };

}


// Normalized addresses that have unsubscribed on
// any of their leads. Returns null on error.
async function loadUnsubscribedAddresses(supabase) {

    const { data, error } = await supabase
        .from("leads")
        .select("email")
        .eq("status", STATUS_UNSUBSCRIBED);

    if (error) {

        // The status column does not accept the
        // value, so no lead can be unsubscribed.
        if (isValueRejected(error)) {
            return new Set();
        }

        return null;

    }

    return new Set(
        (Array.isArray(data) ? data : [])
            .map((row) => normalizeEmail(row.email))
            .filter(Boolean)
    );

}


async function processLead(supabase, resend, lead, unsubscribed) {

    const day = Number(lead.email_sequence_day);

    if (!Number.isInteger(day) || day < FIRST_DAY || day > LAST_DAY) {
        return "skipped_invalid_day";
    }

    const lesson = emails[day];

    if (typeof lesson !== "function") {
        return "skipped_missing_lesson";
    }

    if (
        lead.status === STATUS_UNSUBSCRIBED ||
        unsubscribed.has(normalizeEmail(lead.email))
    ) {
        return "skipped_unsubscribed";
    }

    const recipient =
        typeof lead.email === "string" ? lead.email.trim() : "";

    if (!isValidEmail(recipient)) {
        return "skipped_invalid_email";
    }

    const startAfter = sequenceStartAfter();

    if (startAfter !== null) {

        // Historical lead: joined before the sequence was activated.
        const joinedAt = leadCreatedTime(lead);

        if (joinedAt === null || joinedAt < startAfter) {
            return "skipped_before_start";
        }

    } else {

        const dueTime = new Date(lead.next_email_due).getTime();

        if (Number.isFinite(dueTime) && Date.now() - dueTime > maxOverdueMs()) {
            return "skipped_overdue";
        }

    }

    /* ---------- Claim ----------
       Matches only if no other run has changed this
       lead's day or due time since it was read. */

    const claimUntil =
        new Date(Date.now() + CLAIM_LEASE_MS).toISOString();

    const { data: claimed, error: claimError } = await supabase
        .from("leads")
        .update({ next_email_due: claimUntil })
        .eq("id", lead.id)
        .eq("email_sequence_day", lead.email_sequence_day)
        .eq("next_email_due", lead.next_email_due)
        .select("id");

    if (claimError) {
        return "failed_claim";
    }

    if (!Array.isArray(claimed) || claimed.length !== 1) {
        return "skipped_already_claimed";
    }

    /* ---------- Delivery record (at most once) ----------
       With the email_deliveries table, a lesson that
       was already sent — or whose send was
       interrupted — is never sent again. */

    const reservation = await reserveDelivery(supabase, {
        leadId: lead.id,
        kind: "sequence",
        day
    });

    if (reservation.state === "duplicate") {

        // Already handled for this day: move on rather
        // than staying stuck or sending a duplicate.
        const advanced = await advanceLead(supabase, lead, day, claimUntil);

        return advanced ? "skipped_already_delivered" : "failed_advance";

    }

    /* ---------- Render and send ---------- */

    const tracking = buildTracking(lead.id);

    let email;

    try {
        email = lesson({
            name: lead.name,
            email: recipient,
            tracking
        });
    } catch (error) {
        email = null;
    }

    const delivery = email
        ? await sendWithResend(
            resend,
            {
                to: recipient,
                subject: email.subject,
                html: email.html,
                headers: unsubscribeHeaders(tracking)
            },
            `sequence-lead-${lead.id}-day-${day}`
        )
        : { ok: false };

    if (!delivery.ok) {

        // Nothing was sent: remove the reservation and
        // put the original due time back so the next
        // run retries this lesson. Only if this run
        // still holds the claim.
        await releaseDelivery(supabase, reservation);

        await supabase
            .from("leads")
            .update({ next_email_due: lead.next_email_due })
            .eq("id", lead.id)
            .eq("email_sequence_day", lead.email_sequence_day)
            .eq("next_email_due", claimUntil);

        return "failed_delivery";

    }

    /* ---------- Advance ---------- */

    await completeDelivery(supabase, reservation, delivery.id);

    const advanced = await advanceLead(supabase, lead, day, claimUntil);

    if (!advanced) {
        // Delivered but progress not saved. With the
        // email_deliveries table the lesson can never
        // be resent (the next run finds the record and
        // advances). Without it, the claim lease plus
        // the Resend idempotency key are the guard.
        console.error(
            "EMAIL SEQUENCE: sent but progress not saved.",
            { leadId: lead.id, day }
        );
        return "sent_not_advanced";
    }

    return day === LAST_DAY ? "sent_completed" : "sent";

}


// Moves the lead to the next day, only while this
// run still holds its claim. One retry on error.
async function advanceLead(supabase, lead, day, claimUntil) {

    for (let attempt = 0; attempt < 2; attempt++) {

        const sentAt = new Date();

        const { error } = await supabase
            .from("leads")
            .update({
                email_sequence_day: day + 1,
                last_sequence_email_sent: sentAt.toISOString(),
                next_email_due: new Date(sentAt.getTime() + DAY_MS).toISOString()
            })
            .eq("id", lead.id)
            .eq("email_sequence_day", lead.email_sequence_day)
            .eq("next_email_due", claimUntil);

        if (!error) {
            return true;
        }

    }

    return false;

}


// Recovery for report claims abandoned mid-send
// (see ABANDONED_REPORT_CLAIM_MS). Such a lead is
// outside the 30-minute report window, so it can
// never be emailed again automatically; this only
// corrects its status so it is not stuck in
// "Sending". If the delivery table proves the
// report went out, it becomes "Sent", otherwise
// "Pending" (not confirmed sent).
async function recoverAbandonedReportClaims(supabase) {

    const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("email_status", "Sending")
        .limit(50);

    if (error) {
        // Includes databases that reject the value.
        return 0;
    }

    let recovered = 0;

    for (const lead of data || []) {

        const createdAt = leadCreatedTime(lead);

        if (createdAt === null || Date.now() - createdAt < ABANDONED_REPORT_CLAIM_MS) {
            continue;
        }

        const delivered = await wasDelivered(supabase, {
            leadId: lead.id,
            kind: "report",
            day: 0
        });

        const changes = delivered
            ? { email_status: "Sent", last_email_sent: new Date().toISOString() }
            : { email_status: "Pending" };

        const { error: updateError } = await supabase
            .from("leads")
            .update(changes)
            .eq("id", lead.id)
            .eq("email_status", "Sending");

        if (!updateError) {
            recovered++;
        }

    }

    return recovered;

}


exports.handler = async () => {

    const clients = getClients();

    if (!clients) {
        console.error("EMAIL SEQUENCE: required server configuration is missing.");
        return respond(500, { error: "Email sequence is not configured." });
    }

    const { supabase, resend } = clients;

    const startedAt = Date.now();

    const summary = {};

    const count = (outcome) => {
        summary[outcome] = (summary[outcome] || 0) + 1;
    };

    try {

        /* ---------- Disabled: tidy only, send nothing ---------- */

        if (!isSequenceEnabled()) {

            try {
                const recovered = await recoverAbandonedReportClaims(supabase);
                if (recovered) {
                    summary.recovered_report_claims = recovered;
                }
            } catch (recoveryError) {
                count("failed_report_claim_recovery");
            }

            console.log("EMAIL SEQUENCE: disabled (EMAIL_SEQUENCE_ENABLED is not \"true\"); no lessons sent.", summary);

            return respond(200, {
                message: "Email sequence is disabled.",
                summary
            });

        }

        const now = new Date().toISOString();

        /* ---------- Due leads ----------
           Eligibility filters are applied IN THE QUERY,
           so leads that will be skipped never occupy the
           batch (otherwise old overdue leads could crowd
           out new subscribers indefinitely). */

        const startAfter = sequenceStartAfter();
        const overdueLimit = maxOverdueMs();

        let query = supabase
            .from("leads")
            .select("*")
            .gte("email_sequence_day", FIRST_DAY)
            .lte("email_sequence_day", LAST_DAY)
            .lte("next_email_due", now);

        let overdueCutoff = null;

        if (startAfter !== null) {
            query = query.gte("submitted_at", new Date(startAfter).toISOString());
        } else if (overdueLimit !== Infinity) {
            overdueCutoff = new Date(Date.now() - overdueLimit).toISOString();
            query = query.gte("next_email_due", overdueCutoff);
        }

        const { data: leads, error } = await query
            .order("next_email_due", { ascending: true })
            .limit(BATCH_SIZE);

        if (error) {
            throw new Error("due_leads_lookup_failed");
        }

        // Not silent: report when overdue leads are being held back.
        if (overdueCutoff !== null) {

            const { data: heldBack, error: heldBackError } = await supabase
                .from("leads")
                .select("id")
                .gte("email_sequence_day", FIRST_DAY)
                .lte("email_sequence_day", LAST_DAY)
                .lt("next_email_due", overdueCutoff)
                .limit(1);

            if (!heldBackError && Array.isArray(heldBack) && heldBack.length > 0) {
                summary.overdue_leads_held_back = true;
                console.warn(
                    "EMAIL SEQUENCE: some leads are overdue by more than the configured limit and are not being emailed. " +
                    "Set EMAIL_SEQUENCE_START_AFTER (recommended) or EMAIL_SEQUENCE_MAX_OVERDUE_DAYS to decide how historical leads are treated."
                );
            }

        }

        const unsubscribed = await loadUnsubscribedAddresses(supabase);

        if (unsubscribed === null) {
            // Without the unsubscribe list we cannot
            // safely send marketing email.
            throw new Error("unsubscribe_lookup_failed");
        }

        for (const lead of leads || []) {

            if (Date.now() - startedAt > TIME_BUDGET_MS) {
                count("deferred_time_budget");
                continue;
            }

            try {
                count(await processLead(supabase, resend, lead, unsubscribed));
            } catch (leadError) {
                count("failed_unexpected");
            }

        }

        try {
            const recovered = await recoverAbandonedReportClaims(supabase);
            if (recovered) {
                summary.recovered_report_claims = recovered;
            }
        } catch (recoveryError) {
            count("failed_report_claim_recovery");
        }

        console.log("EMAIL SEQUENCE: run complete.", summary);

        return respond(200, {
            message: "Email sequence completed.",
            summary
        });

    } catch (err) {

        console.error(
            "EMAIL SEQUENCE: run failed.",
            {
                stage: err && /^[a-z_]+$/.test(err.message) ? err.message : "unknown",
                summary
            }
        );

        return respond(500, { error: "Email sequence failed." });

    }

};

// The daily schedule is registered in netlify.toml:
//   [functions."email-sequence"]
//   schedule = "@daily"
// An `exports.config = { schedule }` export is NOT recognised by Netlify
// for this (Lambda-style `exports.handler`) function format — verified
// with Netlify's bundler (zip-it-and-ship-it 16.2.2): it reports no
// schedule. Sending additionally requires EMAIL_SEQUENCE_ENABLED=true.
