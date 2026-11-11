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

test("schedule: registered @daily in netlify.toml; no ineffective exports.config left", async () => {
    // exports.config is NOT recognised by Netlify for exports.handler-style
    // functions (verified with zip-it-and-ship-it 16.2.2), so the schedule
    // lives in netlify.toml.
    const fs = require("fs");
    const path = require("path");
    const toml = fs.readFileSync(path.join(H.ROOT, "netlify.toml"), "utf8");
    assert(/\[functions\."email-sequence"\]\s*\r?\nschedule = "@daily"/.test(toml), "schedule not registered");
    assert.strictEqual(H.load(FN).config, undefined, "misleading exports.config still present");
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
    // Stale leads are now excluded in the query (so they cannot crowd out new
    // subscribers); the run reports that leads are being held back.
    assert.strictEqual(JSON.parse(r.body).summary.overdue_leads_held_back, true);
    assert(H.logs.some((l) => l.includes("overdue by more than the configured limit")), "warning logged");
    assert.strictEqual(fresh.email_sequence_day, 2);
});

test("no starvation: 60 stale overdue leads cannot block a new subscriber (overdue-guard mode)", async () => {
    for (let i = 0; i < 60; i++) dueLead({ email: `old${i}@example.com`, next_email_due: hoursAgo((10 + i) * 24) });
    const fresh = dueLead({ email: "new@example.com", next_email_due: hoursAgo(2) });
    await run();
    assert.strictEqual(H.mail.attempts.length, 1);
    assert.strictEqual(H.mail.attempts[0].payload.to, "new@example.com");
    assert.strictEqual(fresh.email_sequence_day, 2);
});


/* =============== Activation switch =============== */

test("disabled by default: nothing is sent and leads are not modified", async () => {
    H.setEnv({ EMAIL_SEQUENCE_ENABLED: undefined });
    const due = hoursAgo(1);
    const lead = dueLead({ next_email_due: due });
    const r = await run();
    assert.strictEqual(r.statusCode, 200);
    assert.strictEqual(JSON.parse(r.body).message, "Email sequence is disabled.");
    assert.strictEqual(H.mail.attempts.length, 0);
    assert.strictEqual(lead.email_sequence_day, 1);
    assert.strictEqual(lead.next_email_due, due);
});

test("disabled: only the exact value \"true\" enables sending", async () => {
    for (const value of ["1", "yes", "TRUE", "on", ""]) {
        H.reset();
        H.setEnv({ EMAIL_SEQUENCE_ENABLED: value });
        dueLead();
        await run();
        assert.strictEqual(H.mail.attempts.length, 0, "enabled by " + JSON.stringify(value));
    }
});

test("disabled: abandoned report claims are still tidied (no email sent)", async () => {
    H.setEnv({ EMAIL_SEQUENCE_ENABLED: undefined });
    const abandoned = H.addLead({ email_status: "Sending", submitted_at: hoursAgo(2) });
    await run();
    assert.strictEqual(abandoned.email_status, "Pending");
    assert.strictEqual(H.mail.attempts.length, 0);
});


/* =============== Start-after cutoff =============== */

test("EMAIL_SEQUENCE_START_AFTER: historical leads are untouched, new ones continue", async () => {
    const cutoff = hoursAgo(48);
    H.setEnv({ EMAIL_SEQUENCE_START_AFTER: cutoff });
    const oldDue = hoursAgo(1);
    const historical = dueLead({ email: "old@example.com", submitted_at: hoursAgo(30 * 24), next_email_due: oldDue });
    const joined = dueLead({ email: "new@example.com", submitted_at: hoursAgo(25) });
    await run();
    assert.strictEqual(H.mail.attempts.length, 1);
    assert.strictEqual(H.mail.attempts[0].payload.to, "new@example.com");
    assert.strictEqual(historical.email_sequence_day, 1);
    assert.strictEqual(historical.next_email_due, oldDue, "historical lead not modified");
    assert.strictEqual(joined.email_sequence_day, 2);
});

test("EMAIL_SEQUENCE_START_AFTER: a new subscriber is never excluded for being overdue (catch-up after an outage)", async () => {
    H.setEnv({ EMAIL_SEQUENCE_START_AFTER: hoursAgo(40 * 24) });
    const lead = dueLead({ submitted_at: hoursAgo(30 * 24), email_sequence_day: 3, next_email_due: hoursAgo(20 * 24) });
    await run();
    assert.strictEqual(H.mail.attempts.length, 1);
    assert.strictEqual(lead.email_sequence_day, 4, "one lesson per run, then 24h later");
});

test("EMAIL_SEQUENCE_START_AFTER: many historical leads cannot block new subscribers", async () => {
    H.setEnv({ EMAIL_SEQUENCE_START_AFTER: hoursAgo(10 * 24) });
    for (let i = 0; i < 60; i++) dueLead({ email: `h${i}@example.com`, submitted_at: hoursAgo(90 * 24), next_email_due: hoursAgo(80 * 24 - i) });
    const fresh = dueLead({ email: "fresh@example.com", submitted_at: hoursAgo(26) });
    await run();
    assert.deepStrictEqual(H.mail.attempts.map((a) => a.payload.to), ["fresh@example.com"]);
    assert.strictEqual(fresh.email_sequence_day, 2);
});

test("invalid EMAIL_SEQUENCE_START_AFTER is ignored with a warning (overdue guard applies)", async () => {
    H.setEnv({ EMAIL_SEQUENCE_START_AFTER: "not-a-date" });
    dueLead();
    await run();
    assert.strictEqual(H.mail.attempts.length, 1);
    assert(H.logs.some((l) => l.includes("EMAIL_SEQUENCE_START_AFTER is not a valid date")));
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
