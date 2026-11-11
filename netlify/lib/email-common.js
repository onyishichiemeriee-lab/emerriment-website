/* =========================================
   EMerriment Email System — Shared Helpers
   -----------------------------------------
   Server-side only. Used by the Netlify
   email functions. Never import this file
   from browser code.

   Lives outside netlify/functions so Netlify
   does not deploy it as its own function.
========================================= */

const crypto = require("crypto");


/* -----------------------------------------
   SITE AND SENDER
----------------------------------------- */

// Fallback matches the site URL already used in
// the email layout. Netlify sets URL to the site's
// primary address at build and run time.
const DEFAULT_SITE_URL = "https://emerriment216.netlify.app";

// Resend's shared test sender. Kept as the default
// so behaviour does not change until a verified
// domain is configured through EMAIL_FROM.
const DEFAULT_SENDER = "EMerriment <onboarding@resend.dev>";

function getSiteUrl() {

    const candidate = process.env.URL;

    if (
        typeof candidate === "string" &&
        /^https:\/\/[A-Za-z0-9.-]+(:\d+)?$/.test(candidate.replace(/\/+$/, ""))
    ) {
        return candidate.replace(/\/+$/, "");
    }

    return DEFAULT_SITE_URL;

}

const SENDER_PATTERN =
    /^(?:[^<>\r\n]{1,100}\s)?<?[^\s@<>]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}>?$/;

let senderWarningShown = false;

function getSender() {

    const configured = process.env.EMAIL_FROM;

    // Accept "Name <address>" or a bare address.
    if (
        typeof configured === "string" &&
        configured.length <= 200 &&
        SENDER_PATTERN.test(configured.trim())
    ) {
        return configured.trim();
    }

    // Never fall back silently: Resend's test sender only delivers to the
    // Resend account owner, so real visitors receive nothing. Logged once
    // per function instance; no address or secret is logged.
    if (!senderWarningShown) {
        senderWarningShown = true;
        console.warn(
            typeof configured === "string" && configured.trim()
                ? "EMAIL CONFIG: EMAIL_FROM is not a valid sender; using the Resend test sender, which only delivers to the Resend account owner."
                : "EMAIL CONFIG: EMAIL_FROM is not set; using the Resend test sender, which only delivers to the Resend account owner."
        );
    }

    return DEFAULT_SENDER;

}

function isUsingTestSender() {

    return getSender() === DEFAULT_SENDER;

}


/* -----------------------------------------
   EMAIL ADDRESSES
----------------------------------------- */

const EMAIL_PATTERN =
    /^[^\s@,;:<>"'()[\]\\]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

function isValidEmail(email) {

    if (typeof email !== "string") {
        return false;
    }

    if (email.length > 254) {
        return false;
    }

    const atIndex = email.lastIndexOf("@");

    if (atIndex < 1 || atIndex > 64) {
        return false;
    }

    return EMAIL_PATTERN.test(email);

}

// Comparison key for "the same address":
// surrounding spaces and letter case ignored.
function normalizeEmail(email) {

    return typeof email === "string"
        ? email.trim().toLowerCase()
        : "";

}

// Escapes LIKE/ILIKE wildcards so an address is
// matched literally.
function escapeLikePattern(value) {

    return String(value).replace(/[\\%_]/g, (c) => "\\" + c);

}

// Finds every lead whose stored address matches
// the given address after normalization.
//
// The database filter is deliberately broad
// (case-insensitive "contains") so stored values
// with stray spaces or different capitalisation
// are found; the exact comparison is then done
// here. Returns null on database error.
async function findLeadsForAddress(supabase, email, limit = 50) {

    const normalized = normalizeEmail(email);

    if (!normalized) {
        return [];
    }

    const { data, error } = await supabase
        .from("leads")
        .select("*")
        .ilike("email", `%${escapeLikePattern(normalized)}%`)
        .order("submitted_at", {
            ascending: false,
            nullsFirst: false
        })
        .limit(limit);

    if (error) {
        return null;
    }

    return (Array.isArray(data) ? data : []).filter(
        (lead) => normalizeEmail(lead.email) === normalized
    );

}


/* -----------------------------------------
   TIMESTAMPS
----------------------------------------- */

function toTime(value) {

    if (!value) {
        return null;
    }

    const time = new Date(value).getTime();

    return Number.isFinite(time) ? time : null;

}

// Prefer a server-generated created_at (if the
// table has one) over the browser-set submitted_at.
function leadCreatedTime(lead) {

    if (!lead) {
        return null;
    }

    const created = toTime(lead.created_at);

    return created !== null
        ? created
        : toTime(lead.submitted_at);

}


/* -----------------------------------------
   SIGNED LINKS (tracking + unsubscribe)
   -----------------------------------------
   Links carry the lead id and an HMAC, never
   the email address. Without a valid HMAC the
   endpoints do nothing.
----------------------------------------- */

// Minimum length for an explicit secret (32 characters; a 64-character hex
// value from 32 random bytes is recommended).
const MIN_SECRET_LENGTH = 32;

let secretWarningShown = false;

function explicitSecret(name) {

    const value = process.env[name];

    if (typeof value !== "string" || value.length === 0) {
        return null;
    }

    if (value.length < MIN_SECRET_LENGTH) {
        if (!secretWarningShown) {
            secretWarningShown = true;
            // The value itself is never logged.
            console.warn(`EMAIL CONFIG: ${name} is shorter than ${MIN_SECRET_LENGTH} characters and is ignored.`);
        }
        return null;
    }

    return value;

}

// Key derived from the service-role key. Used when EMAIL_LINK_SECRET is
// not set, and always accepted when verifying so links sent before
// EMAIL_LINK_SECRET was introduced keep working. HMAC is one-way, so the
// service-role key cannot be recovered from it.
function derivedSecret() {

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (typeof serviceKey === "string" && serviceKey.length > 0) {
        return crypto
            .createHmac("sha256", serviceKey)
            .update("emerriment-email-link-signing-v1")
            .digest("hex");
    }

    return null;

}

// Secret used to SIGN new links.
function getLinkSecret() {

    return explicitSecret("EMAIL_LINK_SECRET") || derivedSecret();

}

// Secrets accepted when VERIFYING a link, newest first:
// current secret, previous secret (EMAIL_LINK_SECRET_PREVIOUS, during a
// rotation), and the derived key (links sent before a secret was set).
// Once all emails signed with the derived key are old (e.g. 60 days after
// EMAIL_LINK_SECRET was set), EMAIL_LINK_ACCEPT_DERIVED=false stops
// accepting it.
function getVerificationSecrets() {

    const current = explicitSecret("EMAIL_LINK_SECRET");

    const acceptDerived =
        !current || process.env.EMAIL_LINK_ACCEPT_DERIVED !== "false";

    return [
        current,
        explicitSecret("EMAIL_LINK_SECRET_PREVIOUS"),
        acceptDerived ? derivedSecret() : null
    ].filter((secret, index, all) => secret && all.indexOf(secret) === index);

}

function isValidLeadId(id) {

    return (
        (typeof id === "string" || typeof id === "number") &&
        /^[A-Za-z0-9-]{1,64}$/.test(String(id))
    );

}

function signWith(secret, purpose, leadId) {

    return crypto
        .createHmac("sha256", secret)
        .update(`${purpose}:${leadId}`)
        .digest("base64url")
        .slice(0, 32);

}

function signLink(purpose, leadId) {

    const secret = getLinkSecret();

    if (!secret || !isValidLeadId(leadId)) {
        return null;
    }

    return signWith(secret, purpose, leadId);

}

function verifyLink(purpose, leadId, token) {

    if (typeof token !== "string" || token.length !== 32 || !isValidLeadId(leadId)) {
        return false;
    }

    const given = Buffer.from(token);
    let valid = false;

    // Check every accepted secret (no early exit, so timing does not reveal
    // which one matched).
    for (const secret of getVerificationSecrets()) {
        const expected = Buffer.from(signWith(secret, purpose, leadId));
        if (expected.length === given.length && crypto.timingSafeEqual(expected, given)) {
            valid = true;
        }
    }

    return valid;

}

function buildFunctionUrl(functionName, purpose, leadId) {

    const token = signLink(purpose, leadId);

    if (!token) {
        return null;
    }

    const params = new URLSearchParams({
        l: String(leadId),
        t: token
    });

    return `${getSiteUrl()}/.netlify/functions/${functionName}?${params.toString()}`;

}

// Tracking data passed to email templates.
function buildTracking(leadId) {

    return {
        pixelUrl: buildFunctionUrl("email-open", "open", leadId),
        unsubscribeUrl: buildFunctionUrl("unsubscribe", "unsubscribe", leadId)
    };

}

function unsubscribeHeaders(tracking) {

    if (!tracking || !tracking.unsubscribeUrl) {
        return undefined;
    }

    return {
        "List-Unsubscribe": `<${tracking.unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
    };

}


/* -----------------------------------------
   DELIVERY
----------------------------------------- */

// Sends through Resend and reports only success
// or failure. Provider errors are never returned
// or logged, because they can contain addresses.
async function sendWithResend(resend, message, idempotencyKey) {

    try {

        const payload = {
            from: getSender(),
            to: message.to,
            subject: message.subject,
            html: message.html
        };

        if (message.headers) {
            payload.headers = message.headers;
        }

        const response = await resend.emails.send(
            payload,
            idempotencyKey ? { idempotencyKey } : undefined
        );

        if (
            !response ||
            response.error ||
            !response.data ||
            !response.data.id
        ) {
            return { ok: false };
        }

        return { ok: true, id: response.data.id };

    } catch (error) {

        return { ok: false };

    }

}


/* -----------------------------------------
   DATABASE ERRORS
----------------------------------------- */

// Postgres codes meaning "this value is not
// allowed for the column" (check constraint,
// invalid enum value, not-null violation).
const VALUE_REJECTED_CODES = ["23514", "22P02", "23502"];

function isValueRejected(error) {

    return Boolean(
        error &&
        VALUE_REJECTED_CODES.includes(error.code)
    );

}


module.exports = {
    DEFAULT_SENDER,
    DEFAULT_SITE_URL,
    getSiteUrl,
    getSender,
    isUsingTestSender,
    isValidEmail,
    normalizeEmail,
    escapeLikePattern,
    findLeadsForAddress,
    toTime,
    leadCreatedTime,
    isValidLeadId,
    signLink,
    verifyLink,
    buildFunctionUrl,
    buildTracking,
    unsubscribeHeaders,
    sendWithResend,
    isValueRejected
};
