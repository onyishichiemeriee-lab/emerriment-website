/* =========================================
   EMerriment — marketing consent confirmation (double opt-in)
   -----------------------------------------
   Ticking the optional box on a quiz only records a REQUEST
   (leads.marketing_consent_requested_at, set by the database). This
   module sends the one confirmation email for that request; consent
   becomes active only when the person presses "Confirm" on the page the
   email links to (netlify/functions/confirm-subscription.js).

   Tokens
   - 32 random bytes from the operating system CSPRNG, base64url (43
     characters). Only the SHA-256 hash and the expiry are stored; the
     raw token exists only in the email and the person's browser.
   - Never logged, never placed in analytics, never in tracked links.
   - Single use: the database destroys the hash when consent is
     activated, and on unsubscribe.

   At most one confirmation email per request
   - The token is claimed with a conditional update (only one concurrent
     run can attach a token to a lead).
   - email_deliveries (lead, 'confirm', 0) is reserved before sending;
     Resend idempotency key consent-confirm-lead-<id>.
   - Per address: nothing is sent if the address already has an active
     subscription, has unsubscribed, or was sent a confirmation in the
     last 24 hours.
   - Fails closed: without the migration (columns or delivery records
     missing) nothing is sent.
   - Off unless EMAIL_CONFIRMATION_ENABLED=true — its own switch,
     independent of the lessons (EMAIL_SEQUENCE_ENABLED) and of customer
     onboarding (CUSTOMER_ONBOARDING_ENABLED). A person can confirm while
     the lessons are still off; confirming never sends a lesson. While it
     is off the database is not even read, and the quiz pages hide the
     opt-in box (netlify/functions/email-features.js).

   Independent of the quiz report: callers must never let a failure
   here affect the report response.
========================================= */
"use strict";

const crypto = require("crypto");

const emails = { consentConfirmation: require("../../emails/consent-confirmation") };

const {
    isValidEmail,
    normalizeEmail,
    findLeadsForAddress,
    leadCreatedTime,
    toTime,
    getSiteUrl,
    sendWithResend
} = require("./email-common");

const {
    reserveDelivery,
    completeDelivery,
    releaseDelivery
} = require("./email-deliveries");


const TOKEN_BYTES = 32;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const TOKEN_TTL_MS = emails.consentConfirmation.EXPIRY_DAYS * 24 * 60 * 60 * 1000;
const ADDRESS_COOLDOWN_MS = 24 * 60 * 60 * 1000;

// Same window as the report: only a request made in the last 30 minutes
// is confirmed from the quiz submission.
const REQUEST_MAX_AGE_MS = 30 * 60 * 1000;

const STATUS_UNSUBSCRIBED = "Unsubscribed";


function generateToken() {
    return crypto.randomBytes(TOKEN_BYTES).toString("base64url");
}

function isTokenShape(token) {
    return typeof token === "string" && TOKEN_PATTERN.test(token);
}

function hashToken(token) {
    return crypto.createHash("sha256").update(token, "utf8").digest("hex");
}

function buildConfirmUrl(token) {
    return `${getSiteUrl()}/.netlify/functions/confirm-subscription?t=${token}`;
}

const isUnsubscribed = (lead) => String(lead.status || "") === STATUS_UNSUBSCRIBED;

// Independent of EMAIL_SEQUENCE_ENABLED and CUSTOMER_ONBOARDING_ENABLED.
// Production only: outside production the switch is always off
// (netlify/lib/environment.js).
const isConfirmationEnabled = () => require("./environment").marketingSwitch("EMAIL_CONFIRMATION_ENABLED");

// The request this quiz submission made, if confirmation is due.
function pendingRequest(leads, now) {

    const candidates = leads
        .filter((lead) =>
            lead.marketing_consent_requested_at &&
            lead.marketing_consent !== true &&
            !lead.marketing_consent_withdrawn_at &&
            !lead.marketing_consent_token_hash &&
            !isUnsubscribed(lead))
        .filter((lead) => {
            const created = leadCreatedTime(lead);
            return created !== null && now - created <= REQUEST_MAX_AGE_MS && created - now <= 5 * 60 * 1000;
        })
        .sort((a, b) => (leadCreatedTime(b) || 0) - (leadCreatedTime(a) || 0));

    return candidates[0] || null;

}

// Why the address must not get a (new) confirmation email, or null.
function addressBlock(leads, leadId, now) {

    if (leads.some((lead) => lead.marketing_consent === true)) {
        return "already_subscribed";
    }

    if (leads.some(isUnsubscribed)) {
        return "unsubscribed";
    }

    const recentlySent = leads.some((lead) => {
        if (lead.id === leadId || !lead.marketing_consent_token_hash) {
            return false;
        }
        const expires = toTime(lead.marketing_consent_token_expires_at);
        return expires !== null && expires - TOKEN_TTL_MS > now - ADDRESS_COOLDOWN_MS;
    });

    return recentlySent ? "recently_sent" : null;

}

async function clearToken(supabase, leadId, tokenHash) {
    try {
        await supabase
            .from("leads")
            .update({ marketing_consent_token_hash: null, marketing_consent_token_expires_at: null })
            .eq("id", leadId)
            .eq("marketing_consent_token_hash", tokenHash);
    } catch (error) {
        // Logged by the caller; the token expires on its own.
    }
}

// Returns { state } — "sent", or why nothing was sent. Never throws.
async function sendConsentConfirmation(supabase, resend, email) {

    const now = Date.now();
    let leadId = null;
    let tokenHash = null;
    let reservation = null;

    if (!isConfirmationEnabled()) {
        return { state: "disabled" };
    }

    try {

        const normalized = normalizeEmail(email);

        if (!normalized) {
            return { state: "invalid" };
        }

        const leads = await findLeadsForAddress(supabase, normalized, 200);

        if (leads === null) {
            return { state: "lookup_failed" };
        }

        const lead = pendingRequest(leads, now);

        if (!lead) {
            return { state: "no_request" };
        }

        leadId = lead.id;

        const blocked = addressBlock(leads, leadId, now);

        if (blocked) {
            console.log("CONSENT CONFIRMATION: not sent.", { leadId, reason: blocked });
            return { state: blocked };
        }

        const recipient = typeof lead.email === "string" ? lead.email.trim() : "";

        if (!isValidEmail(recipient) || normalizeEmail(recipient) !== normalized) {
            return { state: "invalid" };
        }

        /* ---------- Claim: attach a token (only one run wins) ---------- */

        const token = generateToken();
        tokenHash = hashToken(token);

        const { data: claimed, error: claimError } = await supabase
            .from("leads")
            .update({
                marketing_consent_token_hash: tokenHash,
                marketing_consent_token_expires_at: new Date(now + TOKEN_TTL_MS).toISOString()
            })
            .eq("id", leadId)
            .eq("marketing_consent", false)
            .is("marketing_consent_token_hash", null)
            .is("marketing_consent_withdrawn_at", null)
            .select("id");

        if (claimError || !Array.isArray(claimed) || claimed.length !== 1) {
            tokenHash = null;
            return { state: claimError ? "claim_failed" : "already_claimed" };
        }

        /* ---------- Delivery record (required) ---------- */

        reservation = await reserveDelivery(supabase, { leadId, kind: "confirm", day: 0 });

        if (reservation.state !== "reserved") {
            const state = reservation.state === "duplicate" ? "duplicate" : "unavailable";
            reservation = null;
            await clearToken(supabase, leadId, tokenHash);
            tokenHash = null;
            return { state };
        }

        /* ---------- Send ---------- */

        const template = emails.consentConfirmation({
            name: lead.name,
            confirmUrl: buildConfirmUrl(token)
        });

        const delivery = await sendWithResend(
            resend,
            { to: recipient, subject: template.subject, html: template.html },
            `consent-confirm-lead-${leadId}`
        );

        if (!delivery.ok) {
            await releaseDelivery(supabase, reservation);
            reservation = null;
            await clearToken(supabase, leadId, tokenHash);
            tokenHash = null;
            console.error("CONSENT CONFIRMATION: delivery failed.", { leadId });
            return { state: "delivery_failed" };
        }

        const delivered = reservation;
        reservation = null;
        tokenHash = null;
        await completeDelivery(supabase, delivered, delivery.id);

        console.log("CONSENT CONFIRMATION: sent.", { leadId, emailId: delivery.id });
        return { state: "sent" };

    } catch (error) {

        if (reservation) {
            try { await releaseDelivery(supabase, reservation); } catch (e) { /* below */ }
        }
        if (tokenHash && leadId) {
            await clearToken(supabase, leadId, tokenHash);
        }
        console.error("CONSENT CONFIRMATION: unexpected failure.", { leadId });
        return { state: "failed" };

    }

}

module.exports = {
    sendConsentConfirmation,
    isConfirmationEnabled,
    generateToken,
    hashToken,
    isTokenShape,
    buildConfirmUrl,
    TOKEN_TTL_MS,
    _internal: { pendingRequest, addressBlock }
};
