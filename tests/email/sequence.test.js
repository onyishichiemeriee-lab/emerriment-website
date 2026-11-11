/* Tests for netlify/functions/email-sequence.js */
"use strict";

const assert = require("assert");
const H = require("./helpers");

const suite = H.createSuite("email-sequence");
const { test } = suite;

const FN = "netlify/functions/email-sequence.js";
const run = () => H.load(FN).handler({});

const hoursAgo = (h) => new Date(Date.now() - h * 3600e3).toISOString();
const hoursAhead = (h) => new Date(Date.now() + h * 3600e3).toISOString();

function dueLead(over = {}) {
    return H.addLead({
        email_status: "Sent",
        last_email_sent: hoursAgo(25),
        email_sequence_day: 1,
        next_email_due: hoursAgo(1),
        ...over
    });
}

test("schedule configuration is unchanged (@daily)", async () => {
    assert.deepStrictEqual(H.load(FN).config, { schedule: "@daily" });
});

test("sends the lesson for the lead's current day and advances by one day", async () => {
    const reportSentAt = hoursAgo(25);
    const lead = dueLead({ email_sequence_day: 3, last_email_sent: reportSentAt });
    const before = Date.now();
    const r = await run();
    assert.strictEqual(r.statusCode, 200, r.body);
    assert.strictEqual(H.mail.sent.length, 1);
    const lessons = H.load("emails/index.js");
    assert.strictEqual(H.mail.sent[0].payload.subject, lessons[3]({ name: "Ada" }).subject);
    assert(H.mail.sent[0].payload.html.includes("Hello <strong>Ada</strong>"));
    assert.strictEqual(H.mail.sent[0].payload.to, "ada@example.com");
    assert.strictEqual(lead.email_sequence_day, 4);
    const due = new Date(lead.next_email_due).getTime();
    assert(due >= before + 864e5 - 1000 && due <= Date.now() + 864e5 + 1000, "next lesson 24h later");
    assert(lead.last_sequence_email_sent);
    assert.strictEqual(lead.email_status, "Sent", "report status untouched");
    assert.strictEqual(lead.last_email_sent, reportSentAt, "report timestamp untouched");
});

test("not-due leads are not emailed", async () => {
    const lead = dueLead({ next_email_due: hoursAhead(2) });
    await run();
    assert.strictEqual(H.mail.attempts.length, 0);
    assert.strictEqual(lead.email_sequence_day, 1);
});

test("a brand-new quiz lead (due 24h after the quiz) is not emailed yet", async () => {
    H.addLead();
    await run();
    assert.strictEqual(H.mail.attempts.length, 0);
});

test("full journey: 14 lessons in order, one per run, then nothing (no Day 15)", async () => {
    const lead = dueLead();
    const subjects = [];
    for (let i = 0; i < 16; i++) {
        lead.next_email_due = hoursAgo(1);
        await run();
        subjects.push(H.mail.sent.length);
    }
    assert.strictEqual(H.mail.sent.length, 14, "exactly 14 emails");
    assert.strictEqual(lead.email_sequence_day, 15, "completed marker");
    const lessons = H.load("emails/index.js");
    H.mail.sent.forEach((s, i) => {
        assert.strictEqual(s.payload.subject, lessons[i + 1]({ name: "Ada" }).subject, "day " + (i + 1));
        assert.strictEqual(s.options.idempotencyKey, `sequence-lead-${lead.id}-day-${i + 1}`);
    });
});

test("leads already past Day 14, or with no/invalid day, are not selected or emailed", async () => {
    for (const day of [15, 16, 0, -1, null, 2.5, "abc"]) {
        H.reset();
        dueLead({ email_sequence_day: day });
        await run();
        assert.strictEqual(H.mail.attempts.length, 0, "day " + JSON.stringify(day));
    }
});

test("Resend rejection: day not advanced, due time restored, retried successfully next run", async () => {
    const due = hoursAgo(1);
    const lead = dueLead({ email_sequence_day: 5, next_email_due: due });
    H.mail.mode = "error";
    const r = await run();
    assert.strictEqual(r.statusCode, 200);
    assert.strictEqual(lead.email_sequence_day, 5);
    assert.strictEqual(lead.next_email_due, due, "due time restored for retry");
    H.mail.mode = "ok";
    await run();
    assert.strictEqual(H.mail.sent.length, 1);
    assert.strictEqual(lead.email_sequence_day, 6);
});

test("Resend exception: same safe behaviour, no leak", async () => {
    const lead = dueLead();
    H.mail.mode = "throw";
    const r = await run();
    assert.strictEqual(lead.email_sequence_day, 1);
    H.assertNoLeak(assert, r.body, "response");
    H.assertLogsClean(assert, ["ada@example.com"]);
});

test("duplicate scheduled invocation: two overlapping runs send each lesson once", async () => {
    const leads = [dueLead({ email: "a@example.com" }), dueLead({ email: "b@example.com" }), dueLead({ email: "c@example.com" })];
    H.mail.delayMs = 15;
    const mod = H.load(FN);
    await Promise.all([mod.handler({}), mod.handler({}), mod.handler({})]);
    assert.strictEqual(H.mail.attempts.length, 3, "one email per lead");
    for (const l of leads) assert.strictEqual(l.email_sequence_day, 2);
});

test("unsubscribed lead is skipped", async () => {
    const lead = dueLead({ status: "Unsubscribed" });
    await run();
    assert.strictEqual(H.mail.attempts.length, 0);
    assert.strictEqual(lead.email_sequence_day, 1);
});

test("a lead whose address unsubscribed on another lead is skipped (normalized match)", async () => {
    H.addLead({ email: " ADA@example.com", status: "Unsubscribed", next_email_due: hoursAhead(5) });
    dueLead({ email: "ada@example.com" });
    dueLead({ email: "other@example.com" });
    await run();
    assert.strictEqual(H.mail.attempts.length, 1);
    assert.strictEqual(H.mail.attempts[0].payload.to, "other@example.com");
});

test("if the status column rejects 'Unsubscribed', the sequence still runs", async () => {
    H.db.rejectValues = { status: ["Unsubscribed"] };
    dueLead();
    const r = await run();
    assert.strictEqual(r.statusCode, 200);
    assert.strictEqual(H.mail.attempts.length, 1);
});

test("unsubscribe list cannot be read: no marketing email is sent", async () => {
    dueLead();
    H.db.failWhen = (q) => q.mode === "select" && q.filters.some(([, c]) => c === "status");
    const r = await run();
    assert.strictEqual(r.statusCode, 500);
    assert.strictEqual(H.mail.attempts.length, 0);
});

test("invalid or missing stored addresses are skipped without sending", async () => {
    for (const email of ["", "not-an-address", null, "a@b", "x@example.com, y@example.com"]) {
        dueLead({ email });
    }
    const good = dueLead({ email: "good@example.com" });
    await run();
    assert.strictEqual(H.mail.attempts.length, 1);
    assert.strictEqual(good.email_sequence_day, 2);
});

test("lesson emails are escaped and carry signed tracking + unsubscribe header", async () => {
    const lead = dueLead({ name: "<script>alert(1)</script>" });
    await run();
    const sent = H.mail.sent[0];
    assert(!sent.payload.html.includes("<script>alert(1)"));
    assert(sent.payload.html.includes("&lt;script&gt;"));
    assert(sent.payload.html.includes(`email-open?l=${lead.id}&amp;t=`));
    assert(sent.payload.headers["List-Unsubscribe"].includes(`unsubscribe?l=${lead.id}&t=`));
    assert.strictEqual(sent.payload.headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");
});

test("missing server configuration: 500, nothing sent", async () => {
    H.setEnv({ RESEND_API_KEY: undefined });
    dueLead();
    const r = await run();
    assert.strictEqual(r.statusCode, 500);
    assert.strictEqual(H.mail.attempts.length, 0);
    assert(!r.body.includes("RESEND"));
});

test("database failure on the due-lead query: 500, generic body", async () => {
    dueLead();
    H.db.failWhen = (q) => q.mode === "select";
    const r = await run();
    assert.strictEqual(r.statusCode, 500);
    H.assertNoLeak(assert, r.body, "response");
});

test("progress update fails after delivery: lead stays claimed (not resent by the next run)", async () => {
    const lead = dueLead();
    H.db.failWhen = (q) => q.mode === "update" && q.changes && q.changes.email_sequence_day === 2;
    await run();
    assert.strictEqual(H.mail.attempts.length, 1);
    H.db.failWhen = null;
    await run();
    assert.strictEqual(H.mail.attempts.length, 1, "lease prevents an immediate resend");
    assert(new Date(lead.next_email_due).getTime() > Date.now(), "lease in the future");
});

test("batch size is bounded per run", async () => {
    for (let i = 0; i < 60; i++) dueLead({ email: `p${i}@example.com` });
    await run();
    assert.strictEqual(H.mail.attempts.length, 50);
    await run();
    assert.strictEqual(H.mail.attempts.length, 60);
});

test("existing in-progress leads keep their schedule (day and due time read as stored)", async () => {
    // Postgres returns timestamps like "2026-11-09T08:00:00+00:00"; the
    // conditional claim must match that exact stored value.
    const pgFormat = new Date(Date.now() - 2 * 3600e3).toISOString().replace(/\.\d{3}Z$/, "+00:00");
    const lead = dueLead({ email_sequence_day: 9, next_email_due: pgFormat });
    await run();
    assert.strictEqual(H.mail.sent.length, 1);
    assert.strictEqual(lead.email_sequence_day, 10);
});

/* =============== Overdue guard =============== */

test("overdue guard: a lesson overdue by more than 7 days is left untouched (no mass send)", async () => {
    const staleDue = hoursAgo(8 * 24);
    const stale = dueLead({ email: "stale@example.com", next_email_due: staleDue });
    const fresh = dueLead({ email: "fresh@example.com", next_email_due: hoursAgo(6 * 24) });
    const r = await run();
    assert.strictEqual(H.mail.attempts.length, 1);
    assert.strictEqual(H.mail.attempts[0].payload.to, "fresh@example.com");
    assert.strictEqual(stale.email_sequence_day, 1, "stale lead not advanced");
    assert.strictEqual(stale.next_email_due, staleDue, "stale lead not modified");
    assert(JSON.parse(r.body).summary.skipped_overdue === 1);
    assert.strictEqual(fresh.email_sequence_day, 2);
});

test("overdue guard can be disabled (0) or changed (days)", async () => {
    H.setEnv({ EMAIL_SEQUENCE_MAX_OVERDUE_DAYS: "0" });
    dueLead({ next_email_due: hoursAgo(90 * 24) });
    await run();
    assert.strictEqual(H.mail.attempts.length, 1, "disabled");
    H.reset();
    H.setEnv({ EMAIL_SEQUENCE_MAX_OVERDUE_DAYS: "2" });
    dueLead({ next_email_due: hoursAgo(3 * 24) });
    await run();
    assert.strictEqual(H.mail.attempts.length, 0, "2-day limit");
});


/* =============== Delivery records (after migration) =============== */

function enableDeliveries() {
    H.db.missingTables.delete("email_deliveries");
    H.db.tables.email_deliveries = [];
}

test("with email_deliveries: each lesson is recorded as sent with the provider id", async () => {
    enableDeliveries();
    const lead = dueLead({ email_sequence_day: 4 });
    await run();
    const rows = H.db.tables.email_deliveries;
    assert.strictEqual(rows.length, 1);
    assert.deepStrictEqual(
        { lead_id: rows[0].lead_id, kind: rows[0].kind, day: rows[0].sequence_day, status: rows[0].status },
        { lead_id: lead.id, kind: "sequence", day: 4, status: "sent" });
    assert.strictEqual(rows[0].provider_message_id, "email_1");
});

test("with email_deliveries: crash after sending (progress not saved) never resends that lesson", async () => {
    enableDeliveries();
    const lead = dueLead({ email_sequence_day: 6 });
    // Simulate: lesson 6 was sent, then the run died before advancing.
    H.db.tables.email_deliveries.push({ id: "d1", lead_id: lead.id, kind: "sequence", sequence_day: 6, status: "sent" });
    await run();
    assert.strictEqual(H.mail.attempts.length, 0, "no duplicate");
    assert.strictEqual(lead.email_sequence_day, 7, "moved on to the next lesson");
});

test("with email_deliveries: an interrupted send (record left 'sending') is not resent", async () => {
    enableDeliveries();
    const lead = dueLead({ email_sequence_day: 2 });
    H.db.tables.email_deliveries.push({ id: "d1", lead_id: lead.id, kind: "sequence", sequence_day: 2, status: "sending" });
    await run();
    assert.strictEqual(H.mail.attempts.length, 0);
    assert.strictEqual(lead.email_sequence_day, 3);
});

test("with email_deliveries: failed delivery removes the record so the retry works", async () => {
    enableDeliveries();
    const lead = dueLead();
    H.mail.mode = "error";
    await run();
    assert.strictEqual(H.db.tables.email_deliveries.length, 0);
    assert.strictEqual(lead.email_sequence_day, 1);
    H.mail.mode = "ok";
    await run();
    assert.strictEqual(H.mail.sent.length, 1);
    assert.strictEqual(lead.email_sequence_day, 2);
});

test("with email_deliveries: overlapping runs still send once", async () => {
    enableDeliveries();
    const leads = [dueLead({ email: "a@example.com" }), dueLead({ email: "b@example.com" })];
    H.mail.delayMs = 10;
    const mod = H.load(FN);
    await Promise.all([mod.handler({}), mod.handler({}), mod.handler({})]);
    assert.strictEqual(H.mail.attempts.length, 2);
    assert.strictEqual(H.db.tables.email_deliveries.length, 2);
    for (const l of leads) assert.strictEqual(l.email_sequence_day, 2);
});

test("progress update retried once: a single transient failure still advances", async () => {
    const lead = dueLead();
    let failures = 0;
    H.db.failWhen = (q) => q.mode === "update" && q.changes && q.changes.email_sequence_day === 2 && failures++ === 0;
    await run();
    assert.strictEqual(H.mail.attempts.length, 1);
    assert.strictEqual(lead.email_sequence_day, 2);
});


/* =============== Abandoned report claims =============== */

test("abandoned report claim (Sending, lead older than 35 min) is reset to Pending", async () => {
    const abandoned = H.addLead({ email: "x@example.com", email_status: "Sending", submitted_at: hoursAgo(2) });
    const live = H.addLead({ email: "y@example.com", email_status: "Sending", submitted_at: new Date(Date.now() - 60e3).toISOString() });
    const r = await run();
    assert.strictEqual(abandoned.email_status, "Pending");
    assert.strictEqual(abandoned.last_email_sent, null, "not marked as sent");
    assert.strictEqual(live.email_status, "Sending", "in-flight claim untouched");
    assert.strictEqual(JSON.parse(r.body).summary.recovered_report_claims, 1);
});

test("abandoned report claim whose report is recorded as sent becomes Sent", async () => {
    enableDeliveries();
    const lead = H.addLead({ email_status: "Sending", submitted_at: hoursAgo(2) });
    H.db.tables.email_deliveries.push({ id: "d1", lead_id: lead.id, kind: "report", sequence_day: 0, status: "sent" });
    await run();
    assert.strictEqual(lead.email_status, "Sent");
    assert(lead.last_email_sent);
});

test("recovery is harmless when the database rejects 'Sending'", async () => {
    H.db.rejectValues = { email_status: ["Sending"] };
    dueLead();
    const r = await run();
    assert.strictEqual(r.statusCode, 200);
    assert.strictEqual(H.mail.attempts.length, 1);
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
