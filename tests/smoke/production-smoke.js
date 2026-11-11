/* =========================================
   EMerriment production smoke test — READ-ONLY
   -----------------------------------------
   Usage:  node tests/smoke/production-smoke.js https://emerriment216.netlify.app

   Sends only GET requests that cannot write data or send email:
   * no form or quiz submissions, no POST requests;
   * never requests /.netlify/functions/email-sequence (on a deploy where it
     is not registered as scheduled, any request would RUN the sequence);
   * never calls tracking endpoints with an email address or a lead id;
   * never calls ai-chat with a body.

   Expectations describe the HARDENED code on security/supabase-email-
   finalization. Run it before deploying to record the current state, and
   after deploying to confirm the result.
========================================= */
"use strict";

const BASE = (process.argv[2] || "").replace(/\/+$/, "");

if (!/^https:\/\/[A-Za-z0-9.-]+$/.test(BASE)) {
    console.error("Usage: node tests/smoke/production-smoke.js https://<site>");
    process.exit(2);
}

const UA = "EMerriment-smoke-test/1.0 (read-only)";

async function get(path, { follow = false } = {}) {
    let res;
    // Retry transient network errors (not HTTP errors) up to twice.
    for (let attempt = 0; ; attempt++) {
        try {
            res = await fetch(BASE + path, {
                method: "GET",
                redirect: follow ? "follow" : "manual",
                headers: { "User-Agent": UA }
            });
            break;
        } catch (error) {
            if (attempt >= 2) throw error;
            await new Promise((r) => setTimeout(r, 1500));
        }
    }
    const type = res.headers.get("content-type") || "";
    let body = "";
    if (/text|json|html/.test(type)) {
        body = (await res.text()).slice(0, 3000);
    } else {
        await res.arrayBuffer();
    }
    return { status: res.status, headers: res.headers, type, body };
}

const results = [];

function record(area, check, ok, observed) {
    results.push({ area, check, ok, observed });
}

const PUBLIC_PAGES = [
    "/", "/quiz.html", "/login.html", "/signup.html", "/forgot-password.html",
    "/reset-password.html", "/dashboard.html", "/encyclopedia.html",
    "/article/article.html", "/ai/index.html", "/privacy.html", "/terms.html",
    "/admin/loginCMS.html", "/js/script.js", "/js/supabase.js", "/js/auth.js"
];

const INTERNAL_FILES = [
    "/package.json", "/package-lock.json", "/netlify.toml",
    "/netlify/functions/send-email.js", "/netlify/lib/email-common.js",
    "/emails/day1.js", "/emails/layout.js", "/local-ai/server.js",
    "/tests/email/helpers.js", "/supabase/README.md",
    "/supabase/migrations/20261110090000_emerriment_security_helpers.sql",
    "/test-emails.js", "/deno.lock"
];

const HEADERS = [
    "content-security-policy", "x-frame-options", "x-content-type-options",
    "strict-transport-security", "referrer-policy", "permissions-policy"
];

(async () => {

    // Pages may be redirected by Netlify's "pretty URLs" (e.g. /admin/loginCMS.html
    // → /admin/logincms); follow redirects and require a final 200.
    for (const p of PUBLIC_PAGES) {
        const r = await get(p, { follow: true });
        record("public pages", `GET ${p} → 200`, r.status === 200, r.status);
    }

    const home = await get("/");
    for (const h of HEADERS) {
        record("security headers", `${h} present on /`, Boolean(home.headers.get(h)), home.headers.get(h) ? "present" : "missing");
    }
    const csp = home.headers.get("content-security-policy") || "";
    record("security headers", "frame-ancestors 'none' in CSP", /frame-ancestors 'none'/.test(csp), csp ? "checked" : "no CSP");

    for (const p of INTERNAL_FILES) {
        const r = await get(p);
        record("internal files", `GET ${p} → 404`, r.status === 404, r.status);
    }

    // Function method/parameter guards — none of these write data.
    const send = await get("/.netlify/functions/send-email");
    record("functions", "send-email: GET → 405", send.status === 405, send.status);

    const ai = await get("/.netlify/functions/ai-chat");
    record("functions", "ai-chat: GET → 405", ai.status === 405, ai.status);

    const open = await get("/.netlify/functions/email-open");
    record("functions", "email-open: no params → 200 image/gif (never an error page)",
        open.status === 200 && /image\/gif/.test(open.type), `${open.status} ${open.type}`);

    const openBad = await get("/.netlify/functions/email-open?l=00000000-0000-4000-8000-000000000000&t=" + "x".repeat(32));
    record("functions", "email-open: forged signature → 200 image/gif (nothing counted)",
        openBad.status === 200 && /image\/gif/.test(openBad.type), `${openBad.status} ${openBad.type}`);

    // Where a redirect actually leads: its origin (scheme + host + port).
    // Netlify appends the request's query string to a function redirect
    // (observed 2026-11-11: /?url=...), so only the destination ORIGIN
    // decides whether it is an open redirect.
    const originOf = (loc) => {
        try { return new URL(loc, BASE).origin; } catch (e) { return "invalid"; }
    };
    const SITE_ORIGIN = new URL(BASE).origin;

    const clickNone = await get("/.netlify/functions/track-click");
    const clickNoneLoc = clickNone.headers.get("location") || "";
    record("functions", "track-click: no params → 302 to the site",
        clickNone.status === 302 && originOf(clickNoneLoc) === SITE_ORIGIN, `${clickNone.status} ${clickNoneLoc}`);

    for (const foreign of ["https://evil.example/phish", "//evil.example/x", "https://emerriment216.netlify.app.evil.example/"]) {
        const r = await get("/.netlify/functions/track-click?url=" + encodeURIComponent(foreign));
        const loc = r.headers.get("location") || "";
        record("functions", `track-click: ${foreign} is NOT followed (lands on the site itself)`,
            r.status === 302 && originOf(loc) === SITE_ORIGIN, `${r.status} → origin ${originOf(loc)}`);
    }

    const unsubNone = await get("/.netlify/functions/unsubscribe");
    record("functions", "unsubscribe: no/invalid token → 400 page, nothing changed",
        unsubNone.status === 400, unsubNone.status);

    const unsubForged = await get("/.netlify/functions/unsubscribe?l=00000000-0000-4000-8000-000000000000&t=" + "x".repeat(32));
    record("functions", "unsubscribe: forged token → 400",
        unsubForged.status === 400, unsubForged.status);

    // Report
    let failed = 0;
    let area = "";
    for (const r of results) {
        if (r.area !== area) {
            area = r.area;
            console.log(`\n# ${area}`);
        }
        if (!r.ok) failed++;
        console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.check}   [observed: ${r.observed}]`);
    }
    console.log(`\nsmoke (${BASE}): ${results.length - failed} passed, ${failed} failed`);
    console.log("Not checked here (would write data or send email): quiz submission, report email, signup/login, " +
        "password reset, dashboard/CMS data access, unsubscribe/tracking with real tokens, email-sequence.");
    process.exit(failed ? 1 : 0);

})().catch((e) => {
    console.error("smoke test error:", e && e.message);
    process.exit(2);
});
