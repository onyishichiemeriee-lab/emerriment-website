/* Double opt-in for the 14-day lessons: the confirmation email sent with
   the quiz report (netlify/lib/consent-confirmation.js), the
   confirm-subscription page, and the unsubscribe interaction.
   Fake Supabase and fake Resend only — no network, no real emails.
   The database rules themselves (who may activate, token destruction,
   one subscriber per address) are covered by tests/db/journey.pglite.test.js. */
"use strict";

const assert = require("assert");
const crypto = require("crypto");
const H = require("./helpers");

const suite = H.createSuite("consent confirmation (double opt-in)");

// Confirmation emails have their own switch. Every test starts with it ON
// (and, from the shared defaults, the lessons ON); tests of other
// combinations override it.
const env = (over = {}) => H.setEnv({ EMAIL_CONFIRMATION_ENABLED: "true", ...over });
const test = (title, fn) => suite.test(title, async () => { env(); await fn(); });

const minutesAgo = (m) => new Date(Date.now() - m * 60e3).toISOString();
const sha256 = (s) => crypto.createHash("sha256").update(s, "utf8").digest("hex");

const QUIZ_BODY = { name: "Ada", email: "ada@example.com", skinType: "Oily", concern: "Acne", oilLevel: "High", sensitivity: "Low", score: 50, recommendation: "Hydrate." };

function enableDeliveries() {
    H.db.missingTables.delete("email_deliveries");
    H.db.tables.email_deliveries = H.db.tables.email_deliveries || [];
    H.db.unique.email_deliveries = [["lead_id", "kind", "sequence_day"]];
}

// A fresh quiz lead that ticked the box (what the database records).
function requestLead(over = {}) {
    return H.addLead({
        marketing_consent: false,
        marketing_consent_requested_at: new Date().toISOString(),
        marketing_consent_source: "homepage_quiz",
        marketing_consent_version: "quiz-optin-2026-11-17",
        marketing_consent_token_hash: null,
        marketing_consent_token_expires_at: null,
        marketing_consent_withdrawn_at: null,
        ...over
    });
}

const submitQuiz = (body = QUIZ_BODY) =>
    H.load("netlify/functions/send-email.js").handler({ httpMethod: "POST", body: JSON.stringify(body) });

const confirmFn = () => H.load("netlify/functions/confirm-subscription.js");

const confirmations = () => H.mail.sent.filter((m) => /Please confirm/.test(m.payload.subject));
const reports = () => H.mail.sent.filter((m) => /Skin Report/.test(m.payload.subject));

function tokenFrom(message) {
    const m = /confirm-subscription\?t=([A-Za-z0-9_-]{43})/.exec(message.payload.html);
    assert(m, "confirmation link present");
    return m[1];
}

function post(token, extra = "&confirm=yes") {
    return confirmFn().handler({ httpMethod: "POST", body: `t=${encodeURIComponent(token)}${extra}` });
}

/* ---------- Sending the confirmation with the report ---------- */

test("ticked box: the report AND one separate confirmation email; only the token's hash is stored", async () => {
    enableDeliveries();
    const lead = requestLead();
    const r = await submitQuiz();
    assert.strictEqual(r.statusCode, 200, r.body);
    assert.strictEqual(reports().length, 1, "report sent");
    assert.strictEqual(confirmations().length, 1, "one confirmation");
    const msg = confirmations()[0];
    assert.strictEqual(msg.payload.to, "ada@example.com");
    assert.strictEqual(msg.options.idempotencyKey, `consent-confirm-lead-${lead.id}`);
    const token = tokenFrom(msg);
    assert.strictEqual(lead.marketing_consent_token_hash, sha256(token), "hash of the emailed token");
    assert.notStrictEqual(lead.marketing_consent_token_hash, token);
    const ttl = new Date(lead.marketing_consent_token_expires_at).getTime() - Date.now();
    assert(ttl > 6.9 * 864e5 && ttl <= 7 * 864e5, "expires in 7 days");
    assert.strictEqual(lead.marketing_consent, false, "still not subscribed until confirmed");
    const rows = H.db.tables.email_deliveries.filter((d) => d.kind === "confirm");
    assert.strictEqual(rows.length, 1);
    assert.strictEqual(rows[0].status, "sent");
    assert(!/<img/i.test(msg.payload.html), "no tracking pixel");
    H.assertLogsClean(assert, [token]);
});

test("box not ticked: report only, no confirmation, no token", async () => {
    enableDeliveries();
    const lead = H.addLead({ marketing_consent: false });
    await submitQuiz();
    assert.strictEqual(reports().length, 1);
    assert.strictEqual(confirmations().length, 0);
    assert(!lead.marketing_consent_token_hash);
});

test("EMAIL_CONFIRMATION_ENABLED off: no confirmation is sent, no token issued, the database is not even read for it (report unaffected)", async () => {
    env({ EMAIL_CONFIRMATION_ENABLED: undefined });
    enableDeliveries();
    const lead = requestLead();
    const lib = H.load("netlify/lib/consent-confirmation.js");
    const before = H.db.ops.length;
    assert.strictEqual((await lib.sendConsentConfirmation(require("@supabase/supabase-js").createClient(), new (require("resend").Resend)(), "ada@example.com")).state, "disabled");
    assert.strictEqual(H.db.ops.length, before, "no database access while switched off");
    const r = await submitQuiz();
    assert.strictEqual(r.statusCode, 200);
    assert.strictEqual(reports().length, 1);
    assert.strictEqual(confirmations().length, 0);
    assert(!lead.marketing_consent_token_hash);
});

test("only the exact value \"true\" switches confirmation emails on", async () => {
    for (const value of ["1", "TRUE", "yes", " true", ""]) {
        H.reset(); env({ EMAIL_CONFIRMATION_ENABLED: value }); enableDeliveries();
        requestLead();
        await submitQuiz();
        assert.strictEqual(confirmations().length, 0, JSON.stringify(value));
    }
});

test("without delivery records (migration not applied): fails closed, token removed, report unaffected", async () => {
    const lead = requestLead();
    const r = await submitQuiz();
    assert.strictEqual(r.statusCode, 200);
    assert.strictEqual(confirmations().length, 0);
    assert.strictEqual(lead.marketing_consent_token_hash, null, "claimed token cleared again");
});

test("a confirmation failure never changes the report response", async () => {
    enableDeliveries();
    requestLead();
    H.db.failWhen = (q) => q.table === "leads" && q.mode === "update" && q.changes && "marketing_consent_token_hash" in q.changes;
    const r = await submitQuiz();
    assert.strictEqual(r.statusCode, 200, r.body);
    assert.strictEqual(reports().length, 1);
    assert.strictEqual(confirmations().length, 0);
    H.assertLogsClean(assert);
});

test("Resend refuses the confirmation: reservation released and token cleared (nothing left half-done)", async () => {
    enableDeliveries();
    const lead = requestLead();
    const lib = H.load("netlify/lib/consent-confirmation.js");
    const supabase = require("@supabase/supabase-js").createClient();
    H.mail.mode = "error";
    const { Resend } = require("resend");
    const out = await lib.sendConsentConfirmation(supabase, new Resend(), "ada@example.com");
    assert.strictEqual(out.state, "delivery_failed");
    assert.strictEqual(lead.marketing_consent_token_hash, null);
    assert.strictEqual(H.db.tables.email_deliveries.filter((d) => d.kind === "confirm").length, 0);
    H.assertLogsClean(assert);
});

test("repeated and concurrent submissions send at most one confirmation per request", async () => {
    enableDeliveries();
    requestLead();
    const lib = H.load("netlify/lib/consent-confirmation.js");
    const supabase = require("@supabase/supabase-js").createClient();
    const { Resend } = require("resend");
    const runs = await Promise.all([1, 2, 3].map(() => lib.sendConsentConfirmation(supabase, new Resend(), "ada@example.com")));
    assert.strictEqual(runs.filter((r) => r.state === "sent").length, 1, JSON.stringify(runs));
    assert.strictEqual(confirmations().length, 1);
    const again = await lib.sendConsentConfirmation(supabase, new Resend(), "ada@example.com");
    assert.notStrictEqual(again.state, "sent");
    assert.strictEqual(confirmations().length, 1);
});

test("no confirmation for an address that is already subscribed, unsubscribed, or was sent one in the last 24 h", async () => {
    enableDeliveries();
    const lib = H.load("netlify/lib/consent-confirmation.js");
    const supabase = require("@supabase/supabase-js").createClient();
    const { Resend } = require("resend");
    const send = () => lib.sendConsentConfirmation(supabase, new Resend(), "ada@example.com");

    H.addLead({ submitted_at: minutesAgo(60 * 24 * 5), created_at: minutesAgo(60 * 24 * 5), marketing_consent: true });
    requestLead();
    assert.strictEqual((await send()).state, "already_subscribed");

    H.reset(); env(); enableDeliveries();
    H.addLead({ submitted_at: minutesAgo(60 * 24 * 5), created_at: minutesAgo(60 * 24 * 5), marketing_consent: false, status: "Unsubscribed" });
    requestLead();
    assert.strictEqual((await send()).state, "unsubscribed");

    H.reset(); env(); enableDeliveries();
    requestLead({ created_at: minutesAgo(120), submitted_at: minutesAgo(120), marketing_consent_token_hash: "a".repeat(64), marketing_consent_token_expires_at: new Date(Date.now() + 7 * 864e5 - 3600e3).toISOString() });
    requestLead();
    assert.strictEqual((await send()).state, "recently_sent");

    assert.strictEqual(confirmations().length, 0);
});

test("an old request (not from this quiz submission) is not confirmed from a new report request", async () => {
    enableDeliveries();
    requestLead({ created_at: minutesAgo(45), submitted_at: minutesAgo(45) });
    const lib = H.load("netlify/lib/consent-confirmation.js");
    const out = await lib.sendConsentConfirmation(require("@supabase/supabase-js").createClient(), new (require("resend").Resend)(), "ada@example.com");
    assert.strictEqual(out.state, "no_request");
});

/* ---------- Template ---------- */

test("template: links only to this site's confirmation page, escapes the name, no promotion", () => {
    const tpl = H.load("emails/consent-confirmation.js");
    const good = "https://emerriment216.netlify.app/.netlify/functions/confirm-subscription?t=" + "A".repeat(43);
    const out = tpl({ name: "<b>Ada</b>", confirmUrl: good });
    assert(out.html.includes("&lt;b&gt;Ada&lt;/b&gt;"));
    assert(!out.html.includes("<b>Ada</b>"));
    assert(/ignore this email/i.test(out.html));
    for (const bad of [
        "https://evil.example/collect?t=" + "A".repeat(43),
        "http://emerriment216.netlify.app/.netlify/functions/confirm-subscription?t=" + "A".repeat(43),
        good + "&x=1",
        "javascript:alert(1)",
        undefined
    ]) {
        assert.throws(() => tpl({ name: "Ada", confirmUrl: bad }), /consent_confirmation_url_invalid/, String(bad));
    }
});

/* ---------- Confirmation page ---------- */

test("GET only shows a Confirm button: no database access, no change (safe for mail scanners)", async () => {
    const lead = requestLead({ marketing_consent_token_hash: sha256("T".repeat(43)), marketing_consent_token_expires_at: new Date(Date.now() + 864e5).toISOString() });
    const r = await confirmFn().handler({ httpMethod: "GET", queryStringParameters: { t: "T".repeat(43) } });
    assert.strictEqual(r.statusCode, 200);
    assert(/<form method="POST"/.test(r.body));
    assert(/name="confirm" value="yes"/.test(r.body));
    assert.strictEqual(r.headers["Cache-Control"], "no-store");
    assert.strictEqual(r.headers["Referrer-Policy"], "no-referrer");
    assert.strictEqual(H.db.ops.length, 0, "no database access on GET");
    assert.strictEqual(lead.marketing_consent, false);
});

test("malformed tokens never reach the page or the database", async () => {
    for (const t of [undefined, "", "short", "A".repeat(42), "A".repeat(44), '"><script>x</script>' + "A".repeat(20)]) {
        const r = await confirmFn().handler({ httpMethod: "GET", queryStringParameters: t === undefined ? {} : { t } });
        assert.strictEqual(r.statusCode, 400, String(t));
        assert(!r.body.includes("<script>x"));
    }
    const r = await post('"><script>' + "A".repeat(33));
    assert.strictEqual(r.statusCode, 400);
    assert.strictEqual(H.db.ops.length, 0);
    const put = await confirmFn().handler({ httpMethod: "PUT" });
    assert.strictEqual(put.statusCode, 405);
});

test("POST without the explicit confirm=yes changes nothing", async () => {
    const token = "C".repeat(43);
    const lead = requestLead({ marketing_consent_token_hash: sha256(token), marketing_consent_token_expires_at: new Date(Date.now() + 864e5).toISOString() });
    const r = await post(token, "");
    assert.strictEqual(r.statusCode, 400);
    assert.strictEqual(lead.marketing_consent, false);
    assert.strictEqual(H.db.ops.length, 0);
});

test("end to end: quiz → email → Confirm → consent active; the link cannot be used twice", async () => {
    enableDeliveries();
    const lead = requestLead();
    await submitQuiz();
    const token = tokenFrom(confirmations()[0]);

    const r = await post(token);
    assert.strictEqual(r.statusCode, 200, r.body);
    assert(/You're subscribed/.test(r.body));
    assert.strictEqual(lead.marketing_consent, true);

    const update = H.db.ops.find((o) => o.table === "leads" && o.mode === "update" && o.changes && o.changes.marketing_consent === true);
    assert.deepStrictEqual(Object.keys(update.changes), ["marketing_consent"], "only the flag: the database sets the time and destroys the token");
    const cols = update.filters.map((f) => f[0] + ":" + f[1]);
    for (const c of ["eq:marketing_consent_token_hash", "eq:marketing_consent", "is:marketing_consent_withdrawn_at", "gt:marketing_consent_token_expires_at"]) {
        assert(cols.includes(c), "activation is conditional on " + c);
    }

    const again = await post(token);
    assert.strictEqual(again.statusCode, 400);
    assert(/no longer valid/.test(again.body));
    H.assertLogsClean(assert, [token]);
});

test("base64-encoded form bodies (as Netlify may send them) are accepted", async () => {
    const token = "B".repeat(43);
    const lead = requestLead({ marketing_consent_token_hash: sha256(token), marketing_consent_token_expires_at: new Date(Date.now() + 864e5).toISOString() });
    const body = Buffer.from(`t=${token}&confirm=yes`).toString("base64");
    const r = await confirmFn().handler({ httpMethod: "POST", body, isBase64Encoded: true });
    assert.strictEqual(r.statusCode, 200, r.body);
    assert.strictEqual(lead.marketing_consent, true);
});

test("oversized bodies are refused before any database access", async () => {
    const r = await confirmFn().handler({ httpMethod: "POST", body: "t=" + "A".repeat(43) + "&confirm=yes&pad=" + "x".repeat(4096) });
    assert.strictEqual(r.statusCode, 400);
    assert.strictEqual(H.db.ops.length, 0);
});

test("expired link: 410, not subscribed", async () => {
    const token = "E".repeat(43);
    const lead = requestLead({ marketing_consent_token_hash: sha256(token), marketing_consent_token_expires_at: minutesAgo(1) });
    const r = await post(token);
    assert.strictEqual(r.statusCode, 410);
    assert(/expired/.test(r.body));
    assert.strictEqual(lead.marketing_consent, false);
});

test("unknown token: the same generic answer as a used one (reveals nothing)", async () => {
    requestLead({ marketing_consent_token_hash: sha256("K".repeat(43)), marketing_consent_token_expires_at: new Date(Date.now() + 864e5).toISOString() });
    const r = await post("U".repeat(43));
    assert.strictEqual(r.statusCode, 400);
    assert(/no longer valid/.test(r.body));
    assert(!r.body.includes("ada@example.com"));
});

test("database failure: 'not subscribed' page, no internal detail shown or logged", async () => {
    const token = "F".repeat(43);
    requestLead({ marketing_consent_token_hash: sha256(token), marketing_consent_token_expires_at: new Date(Date.now() + 864e5).toISOString() });
    H.db.failWhen = (q) => q.table === "leads";
    const r = await post(token);
    assert.strictEqual(r.statusCode, 500);
    assert(/have not been subscribed/.test(r.body));
    H.assertNoLeak(assert, r.body, "page");
    H.assertLogsClean(assert, [token]);
});

test("missing server configuration: fails closed", async () => {
    env({ SUPABASE_SERVICE_ROLE_KEY: undefined });
    const r = await post("G".repeat(43));
    assert.strictEqual(r.statusCode, 500);
});

/* ---------- Unsubscribe ---------- */

test("unsubscribing withdraws a PENDING request and destroys its outstanding token", async () => {
    const c = H.load("netlify/lib/email-common.js");
    const token = "P".repeat(43);
    const lead = requestLead({ marketing_consent_token_hash: sha256(token), marketing_consent_token_expires_at: new Date(Date.now() + 864e5).toISOString() });
    const r = await H.load("netlify/functions/unsubscribe.js").handler({ httpMethod: "POST", queryStringParameters: { l: lead.id, t: c.signLink("unsubscribe", lead.id) } });
    assert.strictEqual(r.statusCode, 200);
    assert.strictEqual(lead.status, "Unsubscribed");
    assert.strictEqual(lead.marketing_consent_token_hash, null);
    assert(lead.marketing_consent_withdrawn_at);
    const after = await post(token);
    assert.strictEqual(after.statusCode, 400);
    assert.strictEqual(lead.marketing_consent, false);
});

/* ---------- Independent switches ---------- */

const sequenceRun = () => H.load("netlify/functions/email-sequence.js").handler({});
const onboardingRun = () => H.load("netlify/functions/customer-onboarding.js").handler({});
const lessons = () => H.mail.sent.filter((m) => !/Please confirm|Skin Report/.test(m.payload.subject));
const features = async () => JSON.parse((await H.load("netlify/functions/email-features.js").handler({ httpMethod: "GET" })).body);

test("confirmation ON + lessons OFF: the confirmation email works and the person can confirm, but no lesson is sent", async () => {
    env({ EMAIL_SEQUENCE_ENABLED: undefined });
    enableDeliveries();
    assert.deepStrictEqual(await features(), { consentConfirmation: true }, "the quiz offers the box");
    const lead = requestLead({ next_email_due: minutesAgo(60) });
    await submitQuiz();
    assert.strictEqual(confirmations().length, 1);
    const page = await post(tokenFrom(confirmations()[0]));
    assert.strictEqual(page.statusCode, 200);
    assert.strictEqual(lead.marketing_consent, true, "double opt-in completed while the lessons are off");
    assert(/have not started yet/.test(page.body), "no promise of a lesson date while the lessons are off");
    assert(!/within the next day or two/.test(page.body));
    const sentBefore = H.mail.sent.length;
    const run = await sequenceRun();
    assert.strictEqual(run.statusCode, 200);
    assert.strictEqual(H.mail.sent.length, sentBefore, "confirmed consent alone never triggers a lesson");
    assert.strictEqual(lessons().length, 0);
});

test("confirmation ON + lessons ON: the confirm page promises the first lesson soon", async () => {
    enableDeliveries();
    requestLead();
    await submitQuiz();
    const page = await post(tokenFrom(confirmations()[0]));
    assert(/within the next day or two/.test(page.body));
});

test("confirmation OFF (lessons ON): no confirmation email, the box is not offered, nothing to confirm", async () => {
    env({ EMAIL_CONFIRMATION_ENABLED: undefined });
    enableDeliveries();
    assert.deepStrictEqual(await features(), { consentConfirmation: false }, "the quiz hides the box");
    const lead = requestLead();
    await submitQuiz();
    assert.strictEqual(confirmations().length, 0);
    assert.strictEqual(lead.marketing_consent_token_hash, null);
    assert.strictEqual(lead.marketing_consent, false);
    await sequenceRun();
    assert.strictEqual(lessons().length, 0, "an unconfirmed request never receives lessons");
});

test("feature endpoint: exposes only the confirmation switch, never cached; other switches do not change it", async () => {
    env({ EMAIL_CONFIRMATION_ENABLED: undefined, EMAIL_SEQUENCE_ENABLED: "true", CUSTOMER_ONBOARDING_ENABLED: "true" });
    const fn = H.load("netlify/functions/email-features.js");
    const r = await fn.handler({ httpMethod: "GET" });
    assert.strictEqual(r.statusCode, 200);
    assert.strictEqual(r.headers["Cache-Control"], "no-store");
    assert.deepStrictEqual(JSON.parse(r.body), { consentConfirmation: false });
    assert.strictEqual((await fn.handler({ httpMethod: "POST" })).statusCode, 405);
    assert.strictEqual(H.db.ops.length, 0, "no database access");
});

test("lessons ON: only confirmed, active consent receives lessons (pending, withdrawn and unsubscribed never do)", async () => {
    const due = { email_status: "Sent", last_email_sent: minutesAgo(25 * 60), email_sequence_day: 1, next_email_due: minutesAgo(60) };
    H.addLead({ ...due, email: "pending@example.com", marketing_consent: false, marketing_consent_requested_at: minutesAgo(26 * 60) });
    H.addLead({ ...due, email: "withdrawn@example.com", marketing_consent: true, marketing_consent_withdrawn_at: minutesAgo(10) });
    H.addLead({ ...due, email: "never@example.com", marketing_consent: false });
    H.addLead({ ...due, email: "gone@example.com", marketing_consent: true, status: "Unsubscribed" });
    H.addLead({ ...due, email: "confirmed@example.com", marketing_consent: true, marketing_consent_at: minutesAgo(25 * 60) });
    await sequenceRun();
    assert.deepStrictEqual(H.mail.sent.map((m) => m.payload.to), ["confirmed@example.com"]);
});

test("unsubscribe suppresses every marketing send: no lessons, no new confirmation email", async () => {
    enableDeliveries();
    const c = H.load("netlify/lib/email-common.js");
    const due = { email_status: "Sent", last_email_sent: minutesAgo(25 * 60), email_sequence_day: 1, next_email_due: minutesAgo(60), submitted_at: minutesAgo(25 * 60), created_at: minutesAgo(25 * 60) };
    const subscribed = H.addLead({ ...due, marketing_consent: true, marketing_consent_at: minutesAgo(24 * 60) });
    const u = await H.load("netlify/functions/unsubscribe.js").handler({ httpMethod: "POST", queryStringParameters: { l: subscribed.id, t: c.signLink("unsubscribe", subscribed.id) } });
    assert.strictEqual(u.statusCode, 200);
    assert.strictEqual(subscribed.marketing_consent, false);

    await sequenceRun();
    assert.strictEqual(lessons().length, 0, "no lesson after unsubscribing");

    // A new quiz with the box ticked: the requested report still arrives,
    // but no confirmation email goes to an unsubscribed address.
    requestLead();
    await submitQuiz();
    assert.strictEqual(reports().length, 1);
    assert.strictEqual(confirmations().length, 0);
    await sequenceRun();
    assert.strictEqual(lessons().length, 0);
});

test("CUSTOMER_ONBOARDING_ENABLED stays independent: confirmation and lessons ON do not switch onboarding on", async () => {
    env({ EMAIL_SEQUENCE_ENABLED: "true", CUSTOMER_ONBOARDING_ENABLED: undefined });
    H.db.tables.purchases = [{ id: "purchase-1", email: "buyer@example.com", lead_id: null, product_code: "21-days-to-glow", provider: "selar", provider_order_ref: "SEL-1", verified_at: new Date().toISOString(), verified_by: "admin", refunded_at: null }];
    await onboardingRun();
    assert.strictEqual(H.mail.sent.length, 0);
    const lib = H.load("netlify/lib/consent-confirmation.js");
    env({ EMAIL_CONFIRMATION_ENABLED: undefined, CUSTOMER_ONBOARDING_ENABLED: "true" });
    assert.strictEqual(lib.isConfirmationEnabled(), false, "onboarding does not switch confirmation on");
});

module.exports = suite;
