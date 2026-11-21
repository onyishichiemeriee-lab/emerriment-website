/* Visitor journey in a browser DOM (jsdom): consent UI on both quiz forms,
   privacy-safe analytics, checkout clicks as intent only, and static
   guards for the lifecycle automation. No network. */
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const H = require("../email/helpers");

const suite = H.createSuite("visitor journey (consent UI, analytics, automation guards)");
const { test } = suite;

const read = (p) => fs.readFileSync(path.join(H.ROOT, p), "utf8");

// Resolves after DOMContentLoaded, when the helper attaches its listeners
// (as in a real browser). Link navigation is suppressed in the test page.
async function pageWithAnalytics(body) {
    const dom = new JSDOM(`<!doctype html><html><body>${body}</body></html>`, { url: "https://local.test/index.html", runScripts: "outside-only" });
    const sent = [];
    dom.window.gtag = (...args) => sent.push(args);
    dom.window.eval(read("js/analytics.js"));
    if (dom.window.document.readyState === "loading") {
        await new Promise((resolve) => dom.window.document.addEventListener("DOMContentLoaded", resolve));
    }
    dom.window.document.addEventListener("click", (event) => event.preventDefault());
    return { dom, window: dom.window, document: dom.window.document, sent };
}

test("homepage quiz: optional consent box, unticked by default, separate from the report; error area; analytics before the quiz script", async () => {
    const dom = new JSDOM(read("index.html"));
    const d = dom.window.document;
    const box = d.getElementById("marketingConsent");
    assert(box && box.type === "checkbox", "consent checkbox");
    assert.strictEqual(box.checked, false, "must not be pre-ticked");
    const label = box.closest("label").textContent;
    assert(/Optional/.test(label) && /unsubscribe/i.test(label) && /14-day/.test(label));
    assert(/one email, because you asked for it/.test(d.querySelector(".quiz-privacy-note").textContent));
    assert(d.getElementById("quizFormError").hidden);
    assert(d.getElementById("quizSubmit"));
    const scripts = [...d.querySelectorAll("script[src]")].map((s) => s.getAttribute("src"));
    assert(scripts.indexOf("js/analytics.js") >= 0 && scripts.indexOf("js/analytics.js") < scripts.indexOf("js/script.js"));
});

test("quiz.html: explains the report email and offers the same optional, unticked consent", async () => {
    const d = new JSDOM(read("quiz.html")).window.document;
    const box = d.getElementById("marketingConsent");
    assert(box && box.checked === false);
    assert(/Optional/.test(box.closest("label").textContent));
    assert(/email you a copy of your results/.test(d.querySelector(".quiz-email-note").textContent));
});

/* ---------- Opt-in box only while confirmation emails are on ---------- */

// Runs js/consent-optin.js on the real page markup with a fake
// /.netlify/functions/email-features answer.
async function pageWithOptIn(file, answer) {
    const dom = new JSDOM(read(file), { url: "https://local.test/" + file, runScripts: "outside-only" });
    const w = dom.window;
    const requests = [];
    w.fetch = (url, opts) => {
        requests.push({ url, opts });
        if (answer === "reject") return Promise.reject(new Error("offline"));
        if (answer === "500") return Promise.resolve({ ok: false, json: async () => ({ consentConfirmation: true }) });
        return Promise.resolve({ ok: true, json: async () => answer });
    };
    w.eval(read("js/consent-optin.js"));
    for (let i = 0; i < 5; i++) await new Promise((r) => setImmediate(r));
    const d = w.document;
    const box = d.getElementById("marketingConsent");
    return { d, box, block: box.closest("[data-marketing-optin]"), requests };
}

for (const file of ["index.html", "quiz.html"]) {

    test(`${file}: the opt-in box ships hidden and disabled, and its script loads before the quiz script`, async () => {
        const d = new JSDOM(read(file)).window.document;
        const box = d.getElementById("marketingConsent");
        const block = box.closest("[data-marketing-optin]");
        assert(block, "box inside the [data-marketing-optin] block");
        assert(block.hidden && box.disabled && !box.checked);
        assert(block.querySelector(".quiz-confirm-note"), "the confirmation promise is inside the hidden block too");
        const scripts = [...d.querySelectorAll("script[src]")].map((s) => s.getAttribute("src"));
        const quizScript = file === "index.html" ? "js/script.js" : "js/quiz.js";
        assert(scripts.includes("js/consent-optin.js"));
        if (file === "index.html") assert(scripts.indexOf("js/consent-optin.js") < scripts.indexOf(quizScript));
    });

    test(`${file}: confirmation emails ON → box shown and usable, unticked`, async () => {
        const p = await pageWithOptIn(file, { consentConfirmation: true });
        assert.strictEqual(p.requests.length, 1);
        assert.strictEqual(p.requests[0].url, "/.netlify/functions/email-features");
        assert.strictEqual(p.requests[0].opts.credentials, "omit");
        assert.strictEqual(p.block.hidden, false);
        assert.strictEqual(p.box.disabled, false);
        assert.strictEqual(p.box.checked, false, "never pre-ticked");
    });

    for (const [label, answer] of [["OFF", { consentConfirmation: false }], ["unknown answer", { consentConfirmation: "true" }], ["server error", "500"], ["network failure", "reject"]]) {
        test(`${file}: confirmation emails ${label} → no box, no confirmation promise, nothing can be ticked`, async () => {
            const p = await pageWithOptIn(file, answer);
            assert.strictEqual(p.block.hidden, true);
            assert.strictEqual(p.box.disabled, true);
            assert.strictEqual(p.box.checked, false);
        });
    }
}

test("quiz callers count only an ENABLED, ticked box as a request", async () => {
    assert(/consentBox\.checked && !consentBox\.disabled/.test(read("js/script.js")), "js/script.js");
    assert(/box\.checked && !box\.disabled/.test(read("js/quiz.js")), "js/quiz.js");
});

test("analytics: only allow-listed events and parameters; no email, name or quiz answers ever leave the page", async () => {
    const p = await pageWithAnalytics("");
    assert.strictEqual(p.window.emTrack("lead_submit", { success: true, email: "ada@example.com", name: "Ada", concern: "Acne", skinType: "Oily" }), true);
    assert.strictEqual(p.window.emTrack("made_up_event", {}), false);
    p.window.emTrack("checkout_click", { product: "someone@example.com" });
    assert.deepStrictEqual(JSON.parse(JSON.stringify(p.sent)), [
        ["event", "lead_submit", { success: true }],
        ["event", "checkout_click", {}]
    ]);
});

test("analytics: without Google Analytics on the page, emTrack does nothing and never throws", async () => {
    const dom = new JSDOM("<!doctype html><body></body>", { url: "https://local.test/quiz.html", runScripts: "outside-only" });
    dom.window.eval(read("js/analytics.js"));
    assert.strictEqual(dom.window.emTrack("quiz_complete", { form: "quiz_page" }), false);
});

test("J: a click on a Selar link is recorded as checkout INTENT with the product slug only", async () => {
    const p = await pageWithAnalytics(`<a id="buy" href="https://selar.com/4h1454?ref=x" target="_blank">View Product</a><a id="other" href="encyclopedia.html">Read</a>`);
    const click = (id) => p.document.getElementById(id).dispatchEvent(new p.window.MouseEvent("click", { bubbles: true, cancelable: true }));
    click("other");
    click("buy");
    assert.deepStrictEqual(JSON.parse(JSON.stringify(p.sent)), [["event", "checkout_click", { product: "4h1454", placement: "index" }]]);
});

test("quiz_start fires once, on the first interaction with the quiz form", async () => {
    const p = await pageWithAnalytics(`<div class="quiz-form"><select id="skinType"><option>Oily</option></select><input id="email"></div>`);
    for (const id of ["skinType", "email", "skinType"]) {
        p.document.getElementById(id).dispatchEvent(new p.window.Event("change", { bubbles: true }));
    }
    assert.deepStrictEqual(JSON.parse(JSON.stringify(p.sent)), [["event", "quiz_start", { form: "homepage" }]]);
});

test("K: no browser file writes or reads the purchases table; customer status cannot come from the browser", async () => {
    const offenders = [];
    (function walk(dir) {
        for (const e of fs.readdirSync(path.join(H.ROOT, dir), { withFileTypes: true })) {
            if (["node_modules", ".git", "tests", "supabase", "netlify", "EMerriment Authentication V2", "EMerriment Authentication V3 — VERIFIED BACKUP", "ROOT AUTH BACKUP BEFORE V2"].includes(e.name)) continue;
            const rel = dir ? `${dir}/${e.name}` : e.name;
            if (e.isDirectory()) walk(rel);
            else if (/\.(js|html)$/.test(e.name) && /from\(\s*["']purchases["']\s*\)/.test(read(rel))) offenders.push(rel);
        }
    })("");
    assert.deepStrictEqual(offenders, []);
});

test("automation guards: lessons filter AND claim on consent; onboarding scheduled but off by default", async () => {
    const seq = read("netlify/functions/email-sequence.js");
    assert((seq.match(/\.eq\("marketing_consent", true\)/g) || []).length >= 2, "consent in the query and in the claim");
    assert(/isMissingConsentColumn/.test(seq));
    const onb = read("netlify/functions/customer-onboarding.js");
    assert(/marketingSwitch\("CUSTOMER_ONBOARDING_ENABLED"\)/.test(onb));
    assert(/return isProduction\(\) && process\.env\[name\] === "true";/.test(read("netlify/lib/environment.js")),
        "switches count only in production and only as exactly \"true\"");
    assert(/from\("purchases"\)/.test(onb));
    const toml = read("netlify.toml");
    assert(/\[functions\."customer-onboarding"\]\s*\r?\nschedule = "0 7 \* \* \*"/.test(toml));
    // Settings lines only (comments mention the switch names).
    const settings = toml.split(/\r?\n/).filter((line) => !line.trim().startsWith("#")).join("\n");
    assert(!/EMAIL_SEQUENCE_ENABLED\s*=\s*"?true/.test(settings), "the sequence must not be switched on in netlify.toml");
    assert(!/CUSTOMER_ONBOARDING_ENABLED\s*=\s*"?true/.test(settings));
    assert(!/EMAIL_CONFIRMATION_ENABLED\s*=\s*"?true/.test(settings), "confirmation emails must not be switched on in netlify.toml");
    // Each sender reads only its own switch.
    const lib = read("netlify/lib/consent-confirmation.js");
    assert(/marketingSwitch\("EMAIL_CONFIRMATION_ENABLED"\)/.test(lib));
    assert(!/(EMAIL_SEQUENCE_ENABLED|CUSTOMER_ONBOARDING_ENABLED)/.test(lib.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "")), "confirmation does not depend on the other switches");
    assert(!/EMAIL_CONFIRMATION_ENABLED/.test(seq), "lessons depend only on EMAIL_SEQUENCE_ENABLED");
    assert(!/EMAIL_CONFIRMATION_ENABLED|EMAIL_SEQUENCE_ENABLED/.test(onb), "onboarding depends only on its own switch");
});

test("schedules: both scheduled functions run at 07:00 UTC = 08:00 Africa/Lagos (Netlify cron is UTC)", async () => {
    const toml = read("netlify.toml");
    const crons = Object.fromEntries([...toml.matchAll(/\[functions\."([^"]+)"\]\s*\r?\nschedule = "([^"]+)"/g)].map((m) => [m[1], m[2]]));
    assert.deepStrictEqual(Object.keys(crons).sort(), ["customer-onboarding", "email-sequence"]);
    // Lagos has no daylight saving: check a winter and a summer date.
    for (const [name, cron] of Object.entries(crons)) {
        const [minute, hour, dom, month, dow] = cron.split(" ");
        assert.deepStrictEqual([dom, month, dow], ["*", "*", "*"], name + " runs daily");
        for (const date of ["2026-01-15", "2026-07-15"]) {
            const utc = new Date(`${date}T${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:00Z`);
            const lagos = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit", hour12: false }).format(utc);
            assert.strictEqual(lagos, "08:00", `${name} on ${date}: ${cron} UTC is ${lagos} in Lagos`);
        }
    }
    const plan = read("docs/EMAIL_LIFECYCLE_PLAN.md");
    assert(/`0 7 \* \* \*`[^\n]*07:00 UTC[^\n]*08:00 Africa\/Lagos/.test(plan), "schedule table documents the Lagos time");
});

test("timing values are stored as UTC instants (ISO strings / timestamptz), never local wall-clock text", async () => {
    for (const f of ["netlify/functions/email-sequence.js", "netlify/functions/customer-onboarding.js", "js/script.js"]) {
        const src = read(f);
        assert(!/toLocale(Date|Time)?String\(/.test(src.split("function quickSearch")[0]), f + " formats local time for storage");
        assert(!/getHours\(|setHours\(/.test(src), f + " uses local-clock arithmetic");
    }
    assert(/next_email_due: new Date\(sentAt\.getTime\(\) \+ LESSON_GAP_MS\)\.toISOString\(\)/.test(read("netlify/functions/email-sequence.js")));
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
