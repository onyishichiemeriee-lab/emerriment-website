const { createClient } = require("@supabase/supabase-js");

const {
    verifyLink,
    isValidLeadId,
    getSiteUrl,
    DEFAULT_SITE_URL
} = require("../lib/email-common");


/* =========================================
   EMerriment Email Click Tracking
   -----------------------------------------
   Redirects to a destination and, for signed
   links, records the click.

   - Redirects only to approved hosts (the
     EMerriment site and the Selar shop). Any
     other destination goes to the homepage, so
     this cannot be used as an open redirect.
   - Counters change only for links signed for
     that lead and destination; unsigned or
     tampered links just redirect.

   No email template currently creates tracked
   links. Link format for future use:
   ?l=<lead id>&url=<destination>&product=<name>
     &t=<signLink("click:" + url, leadId)>
========================================= */


// Only hosts EMerriment actually controls (or its shop provider).
// emerriment.com is deliberately NOT listed: on 2026-11-11 it was not a
// registered domain (.com registry RDAP: 404), and allowing a domain you
// do not own would let whoever registers it receive redirected visitors.
// Once you own a domain, add it with EMAIL_EXTRA_REDIRECT_HOSTS
// (comma-separated host names, e.g. "emerriment.com,www.emerriment.com").
const ALLOWED_HOSTS = new Set([
    "emerriment216.netlify.app",
    "selar.com",
    "www.selar.com",
    "selar.co"
]);

const HOST_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

function allowedHosts() {

    const hosts = new Set(ALLOWED_HOSTS);

    try {
        hosts.add(new URL(getSiteUrl()).host);
    } catch (error) {
        // Keep the fixed list.
    }

    for (const host of String(process.env.EMAIL_EXTRA_REDIRECT_HOSTS || "").split(",")) {
        const clean = host.trim().toLowerCase();
        if (HOST_PATTERN.test(clean)) {
            hosts.add(clean);
        }
    }

    return hosts;

}

function safeDestination(value) {

    if (typeof value !== "string" || value.length > 2000) {
        return null;
    }

    let url;

    try {
        url = new URL(value);
    } catch (error) {
        return null;
    }

    if (url.protocol !== "https:") {
        return null;
    }

    if (url.username || url.password) {
        return null;
    }

    if (!allowedHosts().has(url.host.toLowerCase())) {
        return null;
    }

    return url.toString();

}

function redirect(location) {

    return {
        statusCode: 302,
        headers: {
            Location: location,
            "Cache-Control": "no-store",
            "Referrer-Policy": "no-referrer"
        },
        body: ""
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

exports.handler = async (event) => {

    const params = event.queryStringParameters || {};

    const destination =
        safeDestination(params.url) || (getSiteUrl() || DEFAULT_SITE_URL);

    try {

        const signed =
            safeDestination(params.url) !== null &&
            isValidLeadId(params.l) &&
            verifyLink(`click:${params.url}`, params.l, params.t);

        if (!signed) {
            return redirect(destination);
        }

        const supabase = getSupabase();

        if (!supabase) {
            return redirect(destination);
        }

        const { data: rows, error } = await supabase
            .from("leads")
            .select("id, email, emails_clicked")
            .eq("id", params.l)
            .limit(1);

        const lead = !error && Array.isArray(rows) ? rows[0] : null;

        if (lead) {

            await supabase
                .from("leads")
                .update({
                    emails_clicked: Number(lead.emails_clicked || 0) + 1,
                    last_clicked_at: new Date().toISOString()
                })
                .eq("id", lead.id);

            const product =
                typeof params.product === "string"
                    ? params.product.slice(0, 120)
                    : "";

            if (product) {

                const { error: productError } = await supabase
                    .from("product_clicks")
                    .insert({
                        email: lead.email,
                        product,
                        clicked_at: new Date().toISOString()
                    });

                if (productError) {
                    // Tracking must not block the visitor.
                    console.error("TRACK CLICK: product click not recorded.");
                }

            }

        }

        return redirect(destination);

    } catch (error) {

        console.error("TRACK CLICK: tracking failed.");

        return redirect(destination);

    }

};
