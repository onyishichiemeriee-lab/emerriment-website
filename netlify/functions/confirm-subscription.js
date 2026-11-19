const { createClient } = require("@supabase/supabase-js");

const { getSiteUrl } = require("../lib/email-common");
const { isTokenShape, hashToken } = require("../lib/consent-confirmation");


/* =========================================
   EMerriment — confirm the 14-day lessons (double opt-in)
   -----------------------------------------
   GET / HEAD → a page explaining what is being confirmed, with a
                Confirm button. Changes NOTHING and does not even read
                the database, so mail security scanners and link
                previews that open the link cannot subscribe anyone.
   POST       → the explicit confirmation. One conditional update by
                the service role activates consent only while the
                token's lead holds a pending request, the token has not
                expired and nothing was withdrawn; the database (update
                guard, migration 7) sets the confirmation time and
                destroys the token. Atomic and idempotent: a second
                POST finds no live token and changes nothing.

   The raw token is never stored or logged; only its SHA-256 hash is
   compared. Responses are generic and never reveal an address.
========================================= */


const MAX_BODY_BYTES = 2048;


function getSupabase() {

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        return null;
    }

    return createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false }
    });

}


function page(statusCode, title, message, form) {

    const siteUrl = getSiteUrl();

    return {
        statusCode,
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
            "X-Robots-Tag": "noindex",
            "Referrer-Policy": "no-referrer",
            "X-Frame-Options": "DENY",
            "Content-Security-Policy":
                "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"
        },
        body: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex">
<title>${title}</title>
</head>
<body style="margin:0;padding:40px 16px;background:#F8F5EF;font-family:Arial,sans-serif;color:#334155;">
<main style="max-width:520px;margin:0 auto;background:#fff;border-radius:18px;padding:40px;text-align:center;box-shadow:0 15px 40px rgba(0,0,0,.08);">
<p style="margin:0 0 8px;color:#07111E;font-size:28px;font-weight:bold;">🌿 EMerriment</p>
<h1 style="color:#07111E;font-size:20px;">${title}</h1>
${message}
${form || ""}
<p style="margin-top:30px;"><a href="${siteUrl}" style="color:#0E7490;">Return to EMerriment</a></p>
</main>
</body>
</html>`
    };

}

const PAGES = {

    // The token is only placed in a hidden field of our own form.
    ask: (token) =>
        page(
            200,
            "Confirm your skin education emails",
            `<p style="line-height:1.7;">You asked for EMerriment's free <strong>14-day skin education emails</strong>:
one short lesson a day for two weeks. Press <strong>Confirm</strong> to start them.</p>
<p style="line-height:1.7;font-size:14px;color:#64748B;">Nothing happens until you press the button. Every lesson has a one-click unsubscribe link.
If you didn't ask for this, just close this page.</p>`,
            `<form method="POST" action="/.netlify/functions/confirm-subscription">
<input type="hidden" name="t" value="${token}">
<input type="hidden" name="confirm" value="yes">
<button type="submit" style="background:#00E5FF;color:#07111E;border:0;padding:14px 26px;border-radius:10px;font-weight:bold;font-size:16px;cursor:pointer;">Confirm</button>
</form>`
        ),

    // Confirming never sends anything itself. The lessons have their own
    // switch (EMAIL_SEQUENCE_ENABLED); promise a date only while it is on.
    confirmed: () =>
        page(200, "You're subscribed",
            process.env.EMAIL_SEQUENCE_ENABLED === "true"
                ? `<p style="line-height:1.7;">Thank you for confirming. Your first lesson arrives within the next day or two.
You can unsubscribe at any time from any lesson.</p>`
                : `<p style="line-height:1.7;">Thank you for confirming. The 14-day lessons have not started yet; your first lesson
will arrive when they begin. You can unsubscribe at any time from any lesson.</p>`),

    // Used, unknown or already confirmed elsewhere: deliberately the same
    // answer, so the page reveals nothing about any address.
    used: () =>
        page(400, "This link is no longer valid",
            `<p style="line-height:1.7;">This confirmation link has already been used or is not valid.
If you already confirmed, you're subscribed and there is nothing more to do.</p>`),

    expired: () =>
        page(410, "This link has expired",
            `<p style="line-height:1.7;">Confirmation links work for 7 days. You have not been subscribed.
To ask again, take the skin quiz and tick the box for the 14-day emails.</p>`),

    invalid: () =>
        page(400, "This link is not valid",
            `<p style="line-height:1.7;">This confirmation link is incomplete. Please use the button in your EMerriment confirmation email.</p>`),

    failed: () =>
        page(500, "Something went wrong",
            `<p style="line-height:1.7;">We could not confirm right now. You have not been subscribed. Please try the link again later.</p>`)

};


function readForm(event) {

    let raw = event.body || "";

    if (event.isBase64Encoded && raw) {
        raw = Buffer.from(raw, "base64").toString("utf8");
    }

    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
        return null;
    }

    return new URLSearchParams(raw);

}


// "confirmed" | "used" | "expired" | "failed"
async function confirm(supabase, tokenHash) {

    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
        .from("leads")
        .update({ marketing_consent: true })
        .eq("marketing_consent_token_hash", tokenHash)
        .eq("marketing_consent", false)
        .is("marketing_consent_withdrawn_at", null)
        .gt("marketing_consent_token_expires_at", nowIso)
        .select("id");

    if (!error && Array.isArray(data) && data.length === 1) {
        console.log("CONFIRM SUBSCRIPTION: consent activated.", { leadId: data[0].id });
        return "confirmed";
    }

    // Not activated: find out why (by hash only).
    const { data: rows, error: findError } = await supabase
        .from("leads")
        .select("id, marketing_consent, marketing_consent_token_expires_at, status")
        .eq("marketing_consent_token_hash", tokenHash)
        .limit(1);

    if (findError) {
        return "failed";
    }

    const lead = Array.isArray(rows) ? rows[0] : null;

    if (!lead) {
        // Already used (the database destroyed the token), withdrawn, or unknown.
        return error ? "failed" : "used";
    }

    if (error && error.code === "23505") {
        // The address already has an active subscription (unique per
        // address): nothing new to activate. Retire this token.
        await supabase
            .from("leads")
            .update({ marketing_consent_token_hash: null, marketing_consent_token_expires_at: null })
            .eq("id", lead.id)
            .eq("marketing_consent_token_hash", tokenHash);
        console.log("CONFIRM SUBSCRIPTION: address already subscribed.", { leadId: lead.id });
        return "used";
    }

    if (lead.marketing_consent === true) {
        // Already confirmed (idempotent repeat).
        return "used";
    }

    const expires = new Date(lead.marketing_consent_token_expires_at).getTime();

    if (!Number.isFinite(expires) || expires <= Date.now()) {
        return "expired";
    }

    if (String(lead.status || "") === "Unsubscribed") {
        return "used";
    }

    console.error("CONFIRM SUBSCRIPTION: activation refused.", { leadId: lead.id, code: error ? error.code : "none" });
    return "failed";

}


exports.handler = async (event) => {

    const method = event.httpMethod;

    if (method === "GET" || method === "HEAD") {
        const token = (event.queryStringParameters || {}).t;
        return isTokenShape(token) ? PAGES.ask(token) : PAGES.invalid();
    }

    if (method !== "POST") {
        return { statusCode: 405, headers: { "Allow": "GET, POST" }, body: "" };
    }

    const form = readForm(event);
    const token = form ? form.get("t") : null;

    if (!form || form.get("confirm") !== "yes" || !isTokenShape(token)) {
        return PAGES.invalid();
    }

    const supabase = getSupabase();

    if (!supabase) {
        console.error("CONFIRM SUBSCRIPTION: required server configuration is missing.");
        return PAGES.failed();
    }

    try {
        const outcome = await confirm(supabase, hashToken(token));
        return PAGES[outcome]();
    } catch (error) {
        console.error("CONFIRM SUBSCRIPTION: unexpected failure.");
        return PAGES.failed();
    }

};


// Exposed for automated tests only.
exports._internal = { confirm, PAGES };
