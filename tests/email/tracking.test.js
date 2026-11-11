/* Tests for email-open.js, track-click.js and unsubscribe.js */
"use strict";

const assert = require("assert");
const H = require("./helpers");

const suite = H.createSuite("tracking and unsubscribe");
const { test } = suite;

const common = () => H.load("netlify/lib/email-common.js");
const open = (q) => H.load("netlify/functions/email-open.js").handler({ httpMethod: "GET", queryStringParameters: q });
const click = (q) => H.load("netlify/functions/track-click.js").handler({ httpMethod: "GET", queryStringParameters: q });
const unsub = (method, q, body) => H.load("netlify/functions/unsubscribe.js").handler({ httpMethod: method, queryStringParameters: q, body });

function isPixel(r) {
    return r.statusCode === 200 && r.headers["Content-Type"] === "image/gif" && r.isBase64Encoded === true;
}


/* =============== Signed links =============== */

test("link signatures are per purpose and per lead, and reject tampering", async () => {
    const c = common();
    const t = c.signLink("open", "lead-1");
    assert.strictEqual(t.length, 32);
    assert(c.verifyLink("open", "lead-1", t));
    assert(!c.verifyLink("open", "lead-2", t), "other lead");
    assert(!c.verifyLink("unsubscribe", "lead-1", t), "other purpose");
    assert(!c.verifyLink("open", "lead-1", t.slice(0, 31) + (t[31] === "A" ? "B" : "A")), "tampered");
    assert(!c.verifyLink("open", "lead-1", undefined));
    assert(!c.verifyLink("open", "lead-1", ""));
});

test("signing uses EMAIL_LINK_SECRET when set; links never contain keys or addresses", async () => {
    H.setEnv({ EMAIL_LINK_SECRET: "x".repeat(40) });
    const withSecret = common().signLink("open", "lead-1");
    H.setEnv();
    const derived = common().signLink("open", "lead-1");
    assert.notStrictEqual(withSecret, derived);
    const url = common().buildTracking("lead-1").pixelUrl;
    H.assertNoLeak(assert, url, "url");
    assert(!url.includes("@"));
});

test("without any signing secret, no links are produced", async () => {
    H.setEnv({ SUPABASE_SERVICE_ROLE_KEY: undefined });
    const t = common().buildTracking("lead-1");
    assert.strictEqual(t.pixelUrl, null);
    assert.strictEqual(t.unsubscribeUrl, null);
});


/* =============== Open tracking =============== */

test("signed open: counts once for every lead of that address, returns pixel", async () => {
    const a = H.addLead({ emails_opened: 2 });
    const b = H.addLead({ email: " ADA@example.com", emails_opened: 3 });
    const other = H.addLead({ email: "other@example.com", emails_opened: 7 });
    const r = await open({ l: a.id, t: common().signLink("open", a.id) });
    assert(isPixel(r));
    assert.strictEqual(a.emails_opened, 4);
    assert.strictEqual(b.emails_opened, 4);
    assert(a.last_opened_at);
    assert.strictEqual(other.emails_opened, 7);
});

test("tampered or unsigned open link: pixel returned, nothing counted", async () => {
    const a = H.addLead({ emails_opened: 2 });
    for (const q of [{ l: a.id, t: "x".repeat(32) }, { l: a.id }, { t: common().signLink("open", a.id) },
        { l: "other", t: common().signLink("open", a.id) }, { l: "../../x", t: "y" }, {}]) {
        const r = await open(q);
        assert(isPixel(r), JSON.stringify(q));
    }
    assert.strictEqual(a.emails_opened, 2);
});

test("legacy ?email= links are still counted by default (emails already sent)", async () => {
    const a = H.addLead({ emails_opened: 1 });
    const r = await open({ email: "ada@example.com" });
    assert(isPixel(r));
    assert.strictEqual(a.emails_opened, 2);
});

test("legacy counting can be switched off with EMAIL_OPEN_ALLOW_LEGACY=false", async () => {
    H.setEnv({ EMAIL_OPEN_ALLOW_LEGACY: "false" });
    const a = H.addLead({ emails_opened: 1 });
    const r = await open({ email: "ada@example.com" });
    assert(isPixel(r));
    assert.strictEqual(a.emails_opened, 1);
});

test("open tracking never errors or leaks: DB failure still returns the pixel, no address logged", async () => {
    const a = H.addLead();
    H.db.failWhen = () => true;
    const r = await open({ l: a.id, t: common().signLink("open", a.id) });
    assert(isPixel(r));
    const r2 = await open({ email: "ada@example.com" });
    assert(isPixel(r2));
    H.assertLogsClean(assert, ["ada@example.com"]);
});


/* =============== Click tracking =============== */

test("open redirect blocked: foreign, javascript:, http:, credentialed and malformed URLs go to the site", async () => {
    const home = "https://emerriment216.netlify.app";
    for (const url of ["https://evil.example/phish", "javascript:alert(1)", "http://emerriment.com/",
        "https://emerriment.com@evil.example/", "https://user:pw@emerriment.com/", "//evil.example",
        "https://emerriment.com.evil.example/", "not a url", undefined, "x".repeat(3000)]) {
        const r = await click({ url, email: "ada@example.com" });
        assert.strictEqual(r.statusCode, 302);
        assert.strictEqual(r.headers.Location, home, "url=" + url);
    }
});

test("approved destinations are redirected to as given", async () => {
    for (const url of ["https://selar.com/4h1454", "https://emerriment.com/quiz.html", "https://emerriment216.netlify.app/article/index.html"]) {
        const r = await click({ url });
        assert.strictEqual(r.headers.Location, new URL(url).toString());
    }
});

test("unsigned click links (including legacy ?email=) redirect but change no counters", async () => {
    const a = H.addLead({ emails_clicked: 1 });
    await click({ email: "ada@example.com", url: "https://selar.com/x", product: "Glow" });
    assert.strictEqual(a.emails_clicked, 1);
    assert.strictEqual(H.db.tables.product_clicks.length, 0);
});

test("signed click link: counts the click and records the product", async () => {
    const a = H.addLead({ emails_clicked: 1 });
    const url = "https://selar.com/4h1454";
    const t = common().signLink(`click:${url}`, a.id);
    const r = await click({ l: a.id, url, product: "Fade & Glow Bundle", t });
    assert.strictEqual(r.headers.Location, url);
    assert.strictEqual(a.emails_clicked, 2);
    assert.strictEqual(H.db.tables.product_clicks.length, 1);
    assert.strictEqual(H.db.tables.product_clicks[0].product, "Fade & Glow Bundle");
});

test("a signature for one destination cannot be reused for another", async () => {
    const a = H.addLead({ emails_clicked: 1 });
    const t = common().signLink("click:https://selar.com/a", a.id);
    const r = await click({ l: a.id, url: "https://selar.com/b", t });
    assert.strictEqual(r.headers.Location, "https://selar.com/b");
    assert.strictEqual(a.emails_clicked, 1);
});


/* =============== Unsubscribe =============== */

test("GET shows a confirmation page and changes nothing (safe for link scanners)", async () => {
    const a = H.addLead({ status: "New Lead" });
    const r = await unsub("GET", { l: a.id, t: common().signLink("unsubscribe", a.id) });
    assert.strictEqual(r.statusCode, 200);
    assert(r.body.includes("<form method=\"POST\">"));
    assert.strictEqual(a.status, "New Lead");
    assert(!r.body.includes("ada@example.com"), "address not shown");
});

test("POST unsubscribes every lead with the same normalized address only", async () => {
    const a = H.addLead();
    const b = H.addLead({ email: "  Ada@EXAMPLE.com" });
    const other = H.addLead({ email: "other@example.com" });
    const r = await unsub("POST", { l: a.id, t: common().signLink("unsubscribe", a.id) });
    assert.strictEqual(r.statusCode, 200);
    assert(r.body.includes("You have been unsubscribed"));
    assert.strictEqual(a.status, "Unsubscribed");
    assert.strictEqual(b.status, "Unsubscribed");
    assert.strictEqual(other.status, "New Lead");
});

test("one-click unsubscribe POST from a mail client works", async () => {
    const a = H.addLead();
    const r = await unsub("POST", { l: a.id, t: common().signLink("unsubscribe", a.id) }, "List-Unsubscribe=One-Click");
    assert.strictEqual(r.statusCode, 200);
    assert.strictEqual(a.status, "Unsubscribed");
});

test("invalid or tampered unsubscribe links do nothing", async () => {
    const a = H.addLead();
    for (const q of [{ l: a.id, t: "x".repeat(32) }, { l: a.id }, {}, { l: "lead-999", t: common().signLink("unsubscribe", a.id) },
        { l: a.id, t: common().signLink("open", a.id) }]) {
        const r = await unsub("POST", q);
        assert.strictEqual(r.statusCode, 400, JSON.stringify(q));
    }
    assert.strictEqual(a.status, "New Lead");
});

test("signed link for a lead that no longer exists: invalid page, nothing changed", async () => {
    const r = await unsub("POST", { l: "lead-gone", t: common().signLink("unsubscribe", "lead-gone") });
    assert.strictEqual(r.statusCode, 400);
});

test("if the status column rejects 'Unsubscribed', the sequence is ended instead (day 15)", async () => {
    H.db.rejectValues = { status: ["Unsubscribed"] };
    const a = H.addLead({ email_sequence_day: 4 });
    const done = H.addLead({ email: "ada@example.com", email_sequence_day: 15 });
    const r = await unsub("POST", { l: a.id, t: common().signLink("unsubscribe", a.id) });
    assert.strictEqual(r.statusCode, 200);
    assert.strictEqual(a.email_sequence_day, 15);
    assert.strictEqual(done.email_sequence_day, 15);
});

test("unsubscribed lead then receives no sequence email", async () => {
    const a = H.addLead({ email_status: "Sent", email_sequence_day: 2, next_email_due: new Date(Date.now() - 3600e3).toISOString() });
    await unsub("POST", { l: a.id, t: common().signLink("unsubscribe", a.id) });
    await H.load("netlify/functions/email-sequence.js").handler({});
    assert.strictEqual(H.mail.attempts.length, 0);
});

test("unsubscribe database failure: generic error page, no leak", async () => {
    const a = H.addLead();
    H.db.failWhen = (q) => q.mode === "update";
    const r = await unsub("POST", { l: a.id, t: common().signLink("unsubscribe", a.id) });
    assert.strictEqual(r.statusCode, 500);
    H.assertNoLeak(assert, r.body, "response");
    H.assertLogsClean(assert, ["ada@example.com"]);
});

test("other HTTP methods are refused", async () => {
    const a = H.addLead();
    const r = await unsub("DELETE", { l: a.id, t: common().signLink("unsubscribe", a.id) });
    assert.strictEqual(r.statusCode, 405);
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
