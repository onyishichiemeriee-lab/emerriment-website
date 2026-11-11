const { createClient } = require("@supabase/supabase-js");

const {
    verifyLink,
    isValidLeadId,
    findLeadsForAddress,
    isValueRejected,
    getSiteUrl
} = require("../lib/email-common");


/* =========================================
   EMerriment Unsubscribe
   -----------------------------------------
   Links are signed per lead (HMAC); the email
   address is never in the URL.

   GET  → confirmation page (does not change
          anything, so link scanners cannot
          unsubscribe people by accident).
   POST → unsubscribes every lead with the same
          address. Also handles mail-client
          one-click unsubscribe (RFC 8058).

   Data change (no schema change):
   - status = "Unsubscribed" on the address's
     leads; the 14-day sequence skips them.
   - If the status column rejects that value,
     the sequence is ended instead by moving the
     leads to day 15 ("completed").
========================================= */


const STATUS_UNSUBSCRIBED = "Unsubscribed";
const COMPLETED_DAY = 15;


function getSupabase() {

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        return null;
    }

    return createClient(url, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
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
            "Referrer-Policy": "no-referrer"
        },
        body: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>
<body style="margin:0;padding:40px 16px;background:#F8F5EF;font-family:Arial,sans-serif;color:#334155;">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:18px;padding:40px;text-align:center;box-shadow:0 15px 40px rgba(0,0,0,.08);">
<h1 style="margin:0 0 8px;color:#07111E;font-size:28px;">🌿 EMerriment</h1>
<h2 style="color:#07111E;font-size:20px;">${title}</h2>
<p style="line-height:1.7;">${message}</p>
${form || ""}
<p style="margin-top:30px;"><a href="${siteUrl}" style="color:#0E7490;">Return to EMerriment</a></p>
</div>
</body>
</html>`
    };

}

const PAGES = {

    confirm: () =>
        page(
            200,
            "Unsubscribe from EMerriment emails?",
            "You will stop receiving the EMerriment skin education emails.",
            `<form method="POST">
<button type="submit" style="background:#00E5FF;color:#07111E;border:0;padding:14px 26px;border-radius:10px;font-weight:bold;font-size:16px;cursor:pointer;">Unsubscribe</button>
</form>`
        ),

    done: () =>
        page(
            200,
            "You have been unsubscribed",
            "You will no longer receive EMerriment skin education emails."
        ),

    invalid: () =>
        page(
            400,
            "This link is not valid",
            "This unsubscribe link is invalid or incomplete. Please use the link from your most recent EMerriment email."
        ),

    failed: () =>
        page(
            500,
            "Something went wrong",
            "We could not update your preferences right now. Please try again later."
        )

};


async function unsubscribeLead(supabase, leadId) {

    const { data: rows, error: findError } = await supabase
        .from("leads")
        .select("id, email")
        .eq("id", leadId)
        .limit(1);

    if (findError) {
        return isValueRejected(findError) ? "invalid" : "failed";
    }

    const lead = Array.isArray(rows) ? rows[0] : null;

    if (!lead) {
        return "invalid";
    }

    // Every lead with the same normalized address.
    const sameAddress = await findLeadsForAddress(supabase, lead.email, 200);

    if (sameAddress === null) {
        return "failed";
    }

    const ids = Array.from(
        new Set([lead.id, ...sameAddress.map((row) => row.id)])
    );

    const { error: statusError } = await supabase
        .from("leads")
        .update({ status: STATUS_UNSUBSCRIBED })
        .in("id", ids);

    if (!statusError) {
        return "done";
    }

    if (!isValueRejected(statusError)) {
        return "failed";
    }

    // Fallback: end the sequence for these leads.
    const { error: endError } = await supabase
        .from("leads")
        .update({ email_sequence_day: COMPLETED_DAY })
        .in("id", ids)
        .lte("email_sequence_day", COMPLETED_DAY - 1);

    return endError ? "failed" : "done";

}


exports.handler = async (event) => {

    const params = event.queryStringParameters || {};
    const leadId = params.l;
    const token = params.t;

    if (
        !isValidLeadId(leadId) ||
        !verifyLink("unsubscribe", leadId, token)
    ) {
        return PAGES.invalid();
    }

    if (event.httpMethod === "GET" || event.httpMethod === "HEAD") {
        return PAGES.confirm();
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: { "Allow": "GET, POST" },
            body: ""
        };
    }

    const supabase = getSupabase();

    if (!supabase) {
        console.error("UNSUBSCRIBE: required server configuration is missing.");
        return PAGES.failed();
    }

    try {

        const outcome = await unsubscribeLead(supabase, leadId);

        if (outcome === "done") {
            console.log("UNSUBSCRIBE: completed.", { leadId });
            return PAGES.done();
        }

        if (outcome === "invalid") {
            return PAGES.invalid();
        }

        console.error("UNSUBSCRIBE: update failed.", { leadId });
        return PAGES.failed();

    } catch (error) {

        console.error("UNSUBSCRIBE: unexpected failure.", { leadId });
        return PAGES.failed();

    }

};
