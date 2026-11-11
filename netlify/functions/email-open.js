const { createClient } = require("@supabase/supabase-js");

const {
    verifyLink,
    isValidLeadId,
    isValidEmail,
    normalizeEmail,
    findLeadsForAddress
} = require("../lib/email-common");


/* =========================================
   EMerriment Email Open Tracking
   -----------------------------------------
   Returns a 1×1 transparent GIF in every case,
   so the response never reveals whether an
   address or lead exists.

   Current links:  ?l=<lead id>&t=<signature>
   Only a valid signature updates the counters.

   Legacy links:   ?email=<address>
   Emails sent before this change carry the
   address in the URL. They are still counted so
   open statistics for emails already in inboxes
   are kept, but anyone who knows an address can
   inflate its counter. Set
   EMAIL_OPEN_ALLOW_LEGACY=false to stop counting
   them once those emails are old (e.g. 30 days
   after deployment).
========================================= */


const PIXEL =
    "R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

function pixelResponse() {

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "image/gif",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        },
        isBase64Encoded: true,
        body: PIXEL
    };

}

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

// Same counting rule as before: every lead record
// for the address gets the highest current count
// plus one.
async function recordOpen(supabase, leads) {

    if (!leads || leads.length === 0) {
        return;
    }

    const currentCount = Math.max(
        ...leads.map((lead) => Number(lead.emails_opened || 0))
    );

    await supabase
        .from("leads")
        .update({
            emails_opened: currentCount + 1,
            last_opened_at: new Date().toISOString()
        })
        .in("id", leads.map((lead) => lead.id));

}

exports.handler = async (event) => {

    try {

        const params = event.queryStringParameters || {};

        const supabase = getSupabase();

        if (!supabase) {
            return pixelResponse();
        }

        /* ---------- Signed link ---------- */

        if (params.l !== undefined || params.t !== undefined) {

            if (
                !isValidLeadId(params.l) ||
                !verifyLink("open", params.l, params.t)
            ) {
                return pixelResponse();
            }

            const { data: rows, error } = await supabase
                .from("leads")
                .select("id, email")
                .eq("id", params.l)
                .limit(1);

            const lead = !error && Array.isArray(rows) ? rows[0] : null;

            if (lead) {
                const leads = await findLeadsForAddress(supabase, lead.email, 200);
                await recordOpen(supabase, leads);
            }

            return pixelResponse();

        }

        /* ---------- Legacy link ---------- */

        if (
            process.env.EMAIL_OPEN_ALLOW_LEGACY !== "false" &&
            typeof params.email === "string"
        ) {

            const email = normalizeEmail(params.email);

            if (isValidEmail(email)) {
                const leads = await findLeadsForAddress(supabase, email, 200);
                await recordOpen(supabase, leads);
            }

        }

        return pixelResponse();

    } catch (error) {

        // Tracking must never break the email.
        console.error("EMAIL OPEN: tracking failed.");

        return pixelResponse();

    }

};
