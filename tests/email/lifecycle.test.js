/* Visitor-to-customer lifecycle: consent-gated lessons, unsubscribe
   suppression, retries, verified-customer onboarding, checkout clicks,
   transactional email after unsubscribing, report guidance.
   Fake Supabase and fake Resend only — no network, no real emails.
   Journey scenarios (see PRODUCTION_ACTIVATION_CHECKLIST.md): C, D, G, H,
   I, J, L. */
"use strict";

const assert = require("assert");
const H = require("./helpers");

const suite = H.createSuite("lifecycle (consent, suppression, customers)");
const { test } = suite;

const sequence = () => H.load("netlify/functions/email-sequence.js").handler({});
const onboardingRun = () => H.load("netlify/functions/customer-onboarding.js").handler({});
const hoursAgo = (h) => new Date(Date.now() - h * 3600e3).toISOString();
const daysAgo = (d) => hoursAgo(d * 24);

function dueLead(over = {}) {
    return H.addLead({ email_status: "Sent", last_email_sent: hoursAgo(25), email_sequence_day: 1, next_email_due: hoursAgo(1), ...over });
}

function addPurchase(over = {}) {
    const row = {
        id: "purchase-" + Math.random().toString(36).slice(2, 8),
        email: "buyer@example.com",
        lead_id: null,
        product_code: "21-days-to-glow",
        provider: "selar",
        provider_order_ref: "SEL-" + Math.random().toString(36).slice(2, 8),
        verified_at: new Date().toISOString(),
        verified_by: "admin: Selar order checked",
        refunded_at: null,
        ...over
    };
    (H.db.tables.purchases = H.db.tables.purchases || []).push(row);
    return row;
}

// The real table has two unique keys: (lead_id, kind, day) for lessons and
// a PARTIAL one on (purchase_id, kind, day) for customer rows only. The fake
// cannot express "partial", so each scenario installs the key it exercises.
function enableDeliveries(key = "purchase") {
    H.db.missingTables.delete("email_deliveries");
    H.db.tables.email_deliveries = H.db.tables.email_deliveries || [];
    H.db.unique.email_deliveries = [key === "lead" ? ["lead_id", "kind", "sequence_day"] : ["purchase_id", "kind", "sequence_day"]];
}

/* ---------- Lessons: consent ---------- */

test("C: a lead who did not opt in receives no lesson (requested report only)", async () => {
    dueLead({ marketing_consent: false });
    const r = await sequence();
    assert.strictEqual(r.statusCode, 200);
    assert.strictEqual(H.mail.sent.length, 0);
});

test("D: an opted-in lead receives the due lesson", async () => {
    dueLead({ marketing_consent: true });
    await sequence();
    assert.strictEqual(H.mail.sent.length, 1);
    assert.match(H.mail.sent[0].payload.subject, /skin type/i);
});

test("consent column missing (migration not applied): nothing is sent and the run says why", async () => {
    dueLead({ marketing_consent: true });
    H.db.missingColumns.add("marketing_consent");
    const r = await sequence();
    assert.strictEqual(r.statusCode, 200);
    assert.strictEqual(H.mail.sent.length, 0);
    assert.strictEqual(JSON.parse(r.body).summary.consent_column_missing, true);
});

test("consent withdrawn after selection but before sending: the claim refuses, nothing is sent", async () => {
    const lead = dueLead({ marketing_consent: true });
    let first = true;
    H.db.failWhen = (q) => {
        if (first && q.table === "leads" && q.mode === "update") { first = false; lead.marketing_consent = false; }
        return false;
    };
    await sequence();
    assert.strictEqual(H.mail.sent.length, 0);
    assert.strictEqual(lead.email_sequence_day, 1, "lesson not advanced");
});

/* ---------- G: unsubscribe suppresses all marketing ---------- */

test("G: unsubscribing withdraws consent on every lead with that address; later runs send nothing", async () => {
    const c = H.load("netlify/lib/email-common.js");
    const a = dueLead({ email: "ada@example.com" });
    const b = dueLead({ email: " ADA@example.com ", email_sequence_day: 5 });
    const r = await H.load("netlify/functions/unsubscribe.js").handler({ httpMethod: "POST", queryStringParameters: { l: a.id, t: c.signLink("unsubscribe", a.id) } });
    assert.strictEqual(r.statusCode, 200);
    for (const lead of [a, b]) {
        assert.strictEqual(lead.status, "Unsubscribed");
        assert.strictEqual(lead.marketing_consent, false);
        assert(lead.marketing_consent_withdrawn_at, "withdrawal time recorded");
    }
    await sequence();
    assert.strictEqual(H.mail.sent.length, 0);
});

test("L: an address that unsubscribed from lessons still receives a report it explicitly requests", async () => {
    H.addLead({ email: "ada@example.com", status: "Unsubscribed", submitted_at: daysAgo(10), email_status: "Sent", last_email_sent: daysAgo(10), marketing_consent: false });
    H.addLead({ email: "ada@example.com" });
    const r = await H.load("netlify/functions/send-email.js").handler({ httpMethod: "POST", body: JSON.stringify({ name: "Ada", email: "ada@example.com", skinType: "Oily", concern: "Acne", oilLevel: "High", sensitivity: "Low", score: 50, recommendation: "Hydrate." }) });
    assert.strictEqual(r.statusCode, 200, r.body);
    assert.strictEqual(H.mail.sent.length, 1);
    assert.match(H.mail.sent[0].payload.subject, /Skin Report/);
});

/* ---------- H: retries never duplicate ---------- */

test("H: the scheduled run retried three times (with delivery records) sends each lesson once", async () => {
    enableDeliveries("lead");
    dueLead({ email: "one@example.com" });
    dueLead({ email: "two@example.com" });
    await Promise.all([sequence(), sequence(), sequence()]);
    assert.strictEqual(H.mail.sent.length, 2);
    assert.strictEqual(H.db.tables.email_deliveries.length, 2);
});

/* ---------- Customers ---------- */

test("verified customers get onboarding instead of nurture lessons", async () => {
    dueLead({ email: "buyer@example.com" });
    addPurchase({ email: "Buyer@Example.com" });
    const r = await sequence();
    assert.strictEqual(H.mail.sent.length, 0);
    assert.strictEqual(JSON.parse(r.body).summary.skipped_customer, 1);
});

test("J: clicking a product link records a click only — no purchase, no customer status", async () => {
    const lead = H.addLead({ email: "clicker@example.com" });
    const c = H.load("netlify/lib/email-common.js");
    const target = "https://selar.com/4h1454";
    const r = await H.load("netlify/functions/track-click.js").handler({ httpMethod: "GET", queryStringParameters: { l: lead.id, url: target, t: c.signLink(`click:${target}`, lead.id) } });
    assert.strictEqual(r.statusCode, 302);
    assert.strictEqual((H.db.tables.purchases || []).length, 0, "a click must never create a purchase");
    assert(!H.db.ops.some((o) => o.table === "purchases" && o.mode !== "select"), "no write to purchases");
    assert.strictEqual(lead.status, "New Lead");
});

test("I: customer onboarding is OFF unless CUSTOMER_ONBOARDING_ENABLED=true", async () => {
    enableDeliveries();
    addPurchase();
    const r = await onboardingRun();
    assert.strictEqual(r.statusCode, 200);
    assert.strictEqual(H.mail.sent.length, 0);
    assert.match(JSON.parse(r.body).message, /disabled/);
});

test("I: a verified purchase gets the day-0 welcome once; repeated runs do not resend", async () => {
    H.setEnv({ CUSTOMER_ONBOARDING_ENABLED: "true" });
    enableDeliveries();
    const p = addPurchase();
    await onboardingRun();
    await onboardingRun();
    await Promise.all([onboardingRun(), onboardingRun()]);
    assert.strictEqual(H.mail.sent.length, 1);
    assert.match(H.mail.sent[0].payload.subject, /Welcome/);
    assert(H.mail.sent[0].payload.html.includes("21 Days To Glow Challenge"));
    assert(H.mail.sent[0].payload.html.includes("Selar"), "points to Selar's own receipt instead of repeating it");
    assert.strictEqual(H.mail.sent[0].options.idempotencyKey, `customer-${p.id}-day-0`);
});

test("I: days 3 and 10 follow in order, one per run; day 10 only with a reply inbox", async () => {
    H.setEnv({ CUSTOMER_ONBOARDING_ENABLED: "true" });
    enableDeliveries();
    addPurchase({ verified_at: daysAgo(11) });
    await onboardingRun();
    await onboardingRun();
    let r = await onboardingRun();
    assert.deepStrictEqual(H.mail.sent.map((m) => m.payload.subject.slice(0, 12)), ["🌿 Welcome —", "Three habits"]);
    assert.strictEqual(JSON.parse(r.body).summary.skipped_feedback_no_reply_inbox, 1);
    H.setEnv({ CUSTOMER_ONBOARDING_ENABLED: "true", EMAIL_REPLY_TO: "care@emerriment.com" });
    r = await onboardingRun();
    assert.strictEqual(H.mail.sent.length, 3);
    assert.match(H.mail.sent[2].payload.subject, /How is it going/);
    assert.strictEqual(H.mail.sent[2].payload.replyTo, "care@emerriment.com");
});

test("I: refunded, unsubscribed or old (>30 days) purchases get nothing", async () => {
    H.setEnv({ CUSTOMER_ONBOARDING_ENABLED: "true" });
    enableDeliveries();
    addPurchase({ email: "refund@example.com", refunded_at: new Date().toISOString() });
    addPurchase({ email: "old@example.com", verified_at: daysAgo(40) });
    addPurchase({ email: "gone@example.com" });
    H.addLead({ email: "gone@example.com", status: "Unsubscribed" });
    await onboardingRun();
    assert.strictEqual(H.mail.sent.length, 0);
});

test("I: without delivery records (table/column missing) onboarding sends nothing (fails closed)", async () => {
    H.setEnv({ CUSTOMER_ONBOARDING_ENABLED: "true" });
    addPurchase();
    const r = await onboardingRun();
    assert.strictEqual(H.mail.sent.length, 0);
    assert.strictEqual(JSON.parse(r.body).summary.delivery_log_unavailable, true);
});

test("I: Resend failure releases the reservation; the next run sends it once", async () => {
    H.setEnv({ CUSTOMER_ONBOARDING_ENABLED: "true" });
    enableDeliveries();
    addPurchase();
    H.mail.mode = "error";
    await onboardingRun();
    assert.strictEqual(H.db.tables.email_deliveries.length, 0, "failed send must not block the retry");
    H.mail.mode = "ok";
    await onboardingRun();
    assert.strictEqual(H.mail.sent.length, 1);
});

test("no purchases table yet: onboarding reports it and sends nothing", async () => {
    H.setEnv({ CUSTOMER_ONBOARDING_ENABLED: "true" });
    H.db.missingTables.add("purchases");
    const r = await onboardingRun();
    assert.strictEqual(r.statusCode, 200);
    assert.strictEqual(JSON.parse(r.body).summary.purchases_table_missing, true);
});

/* ---------- Content ---------- */

test("report email: concern-specific guidance, encyclopedia link, 'not a medical diagnosis', preview text", async () => {
    const report = H.load("emails/report.js");
    for (const [concern, word] of [["Acne", "acne"], ["Hyperpigmentation", "hyperpigmentation"], ["Rosacea", "rosacea"], ["Eczema", "eczema"], ["Dark Spots", "dark spots"]]) {
        const html = report({ name: "Ada", concern, skinType: "Oily" }).html;
        assert(html.includes(`What to learn next about ${word}`), concern);
        assert(html.includes("When to see a professional"), concern);
        assert(html.includes("encyclopedia.html?search="), concern);
    }
    const html = report({ name: "Ada", concern: "Acne", skinType: "Oily" }).html;
    assert(html.includes("not a medical diagnosis"));
    assert(html.includes("Oily skin still needs moisture"));
    assert(/display:none;max-height:0[^>]*>Your skin profile/.test(html), "preview text");
    assert(!/cure|guarantee|clinically proven/i.test(html), "no unsupported claims");
});

test("onboarding and report templates escape names and make no unsupported claims", async () => {
    const onboarding = H.load("emails/customer-onboarding.js");
    for (const day of onboarding.DAYS) {
        const t = onboarding[day]({ name: "<script>alert(1)</script>", productName: "<b>x</b>" });
        assert(!t.html.includes("<script>alert(1)"), "day " + day);
        assert(t.html.includes("&lt;script&gt;"), "day " + day);
        assert(!/cure|guarantee|clinically proven|miracle/i.test(t.html), "day " + day);
        assert(t.preheader && t.preheader.length < 120, "day " + day + " preheader");
    }
});

test("reply-to: only a valid EMAIL_REPLY_TO is used; otherwise no reply-to is set", async () => {
    H.addLead();
    H.setEnv({ EMAIL_REPLY_TO: "not-an-address" });
    await H.load("netlify/functions/send-email.js").handler({ httpMethod: "POST", body: JSON.stringify({ name: "Ada", email: "ada@example.com", skinType: "Oily", concern: "Acne", oilLevel: "High", sensitivity: "Low", score: 50, recommendation: "Hydrate." }) });
    assert.strictEqual(H.mail.sent.length, 1);
    assert(!("replyTo" in H.mail.sent[0].payload));
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
