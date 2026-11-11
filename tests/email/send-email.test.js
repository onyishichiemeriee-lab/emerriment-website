/* Tests for netlify/functions/send-email.js
   Carries forward the original 26 scenarios and adds the
   hardening scenarios. */
"use strict";

const assert = require("assert");
const H = require("./helpers");

const suite = H.createSuite("send-email");
const { test } = suite;

const FN = "netlify/functions/send-email.js";

const fn = () => H.load(FN);
const post = (body, extra = {}) => fn().handler({ httpMethod: "POST", body, ...extra });
const parse = (r) => JSON.parse(r.body);

// Exactly what js/script.js submitQuiz() sends (no "type").
function homepageBody(over = {}) {
    return JSON.stringify({
        name: "Ada", email: "ada@example.com", skinType: "Oily", concern: "Acne",
        oilLevel: "High", sensitivity: "Low", score: 50,
        recommendation: "Your skin needs hydration and consistency.", ...over
    });
}

const minutesAgo = (m) => new Date(Date.now() - m * 60e3).toISOString();
const hoursAgo = (h) => new Date(Date.now() - h * 3600e3).toISOString();

function noLeak(r) {
    H.assertNoLeak(assert, r.body, "response");
    H.assertLogsClean(assert, ["ada@example.com", "Ada@Example.com"]);
}


/* =============== Public endpoint =============== */

test("valid homepage report: one email, correct lead marked Sent, unrelated lead untouched", async () => {
    const other = H.addLead({ email: "someone@example.com" });
    const lead = H.addLead();
    const r = await post(homepageBody());
    assert.strictEqual(r.statusCode, 200, r.body);
    assert.deepStrictEqual(parse(r), { success: true, message: "Email sent successfully." });
    assert.strictEqual(H.mail.sent.length, 1);
    const sent = H.mail.sent[0];
    assert.strictEqual(sent.payload.to, "ada@example.com");
    assert.strictEqual(sent.payload.from, "EMerriment <onboarding@resend.dev>");
    assert.strictEqual(sent.payload.subject, "🌿 Your EMerriment Skin Report Is Ready");
    assert.strictEqual(sent.options.idempotencyKey, "report-lead-" + lead.id);
    assert(sent.payload.headers["List-Unsubscribe"].includes("/.netlify/functions/unsubscribe?l=" + lead.id));
    assert.strictEqual(lead.email_status, "Sent");
    assert(lead.last_email_sent);
    assert.strictEqual(other.email_status, "Pending");
    assert.strictEqual(other.last_email_sent, null);
    noLeak(r);
});

test("explicit type=report is accepted", async () => {
    H.addLead();
    const r = await post(homepageBody({ type: "report" }));
    assert.strictEqual(r.statusCode, 200, r.body);
});

test("non-POST is rejected", async () => {
    for (const m of ["GET", "PUT", "DELETE", "OPTIONS"]) {
        const r = await fn().handler({ httpMethod: m });
        assert.strictEqual(r.statusCode, 405, m);
    }
});

test("missing email is rejected", async () => {
    H.addLead();
    const r = await post(JSON.stringify({ name: "Ada" }));
    assert.strictEqual(r.statusCode, 400);
    assert.strictEqual(H.mail.attempts.length, 0);
});

test("invalid emails and multiple recipients are rejected", async () => {
    const bad = ["", "   ", "plain", "a@b", "@example.com", "a@@example.com", "a@example.com,b@example.com",
        "a@example.com; b@example.com", "a@example.com b@example.com", "A <a@example.com>", "a b@example.com",
        "a@exa mple.com", "x".repeat(65) + "@example.com", "a@" + "b".repeat(250) + ".com",
        123, null, ["a@example.com"], { a: 1 }, true];
    for (const email of bad) {
        H.addLead({ email: typeof email === "string" ? email : "ada@example.com" });
        const r = await post(JSON.stringify({ email }));
        assert.strictEqual(r.statusCode, 400, "email=" + JSON.stringify(email) + " -> " + r.statusCode);
    }
    assert.strictEqual(H.mail.attempts.length, 0);
});

test("malformed JSON and non-object bodies return generic 400", async () => {
    for (const body of ["{not json", "", "null", "[]", "\"string\"", "42", "{\"email\":"]) {
        const r = await post(body);
        assert.strictEqual(r.statusCode, 400, "body=" + body + " -> " + r.body);
        assert.deepStrictEqual(parse(r), { success: false, error: "Invalid request." });
    }
    assert.strictEqual(H.mail.attempts.length, 0);
});

test("oversized request is rejected with 413", async () => {
    H.addLead();
    const r = await post(homepageBody({ name: "x".repeat(11000) }));
    assert.strictEqual(r.statusCode, 413);
    assert.strictEqual(H.mail.attempts.length, 0);
});

test("field types, lengths and score range are validated", async () => {
    H.addLead();
    const cases = [{ name: 5 }, { name: "x".repeat(101) }, { skinType: {} }, { concern: "c".repeat(61) },
        { oilLevel: ["High"] }, { sensitivity: "s".repeat(61) }, { recommendation: "r".repeat(501) },
        { score: 101 }, { score: -1 }, { score: "50" }, { score: true }, { type: 7 }];
    for (const over of cases) {
        const r = await post(homepageBody(over));
        assert.strictEqual(r.statusCode, 400, JSON.stringify(over) + " -> " + r.statusCode);
    }
    const inf = await post(homepageBody().replace('"score":50', '"score":1e999'));
    assert.strictEqual(inf.statusCode, 400, "score Infinity");
    assert.strictEqual(H.mail.attempts.length, 0);
});

test("unexpected fields (lead id, admin flag, html) are rejected", async () => {
    const lead = H.addLead();
    for (const over of [{ leadId: lead.id }, { id: lead.id }, { admin: true }, { isAdmin: true },
        { html: "<b>x</b>" }, { content: "<a href=x>x</a>" }, { subject: "Hi" }, { to: "victim@example.com" }]) {
        const r = await post(homepageBody(over));
        assert.strictEqual(r.statusCode, 400, JSON.stringify(over));
    }
    assert.strictEqual(H.mail.attempts.length, 0);
    assert.strictEqual(lead.email_status, "Pending");
});

test("newsletter with arbitrary HTML is refused", async () => {
    H.addLead();
    const r = await post(JSON.stringify({ type: "newsletter", email: "ada@example.com",
        subject: "Verify your account", title: "Urgent", content: "<a href='https://evil.example'>Login</a>" }));
    assert.strictEqual(r.statusCode, 403);
    assert.deepStrictEqual(parse(r), { success: false, error: "This email type is not available." });
    assert.strictEqual(H.mail.attempts.length, 0);
});

test("welcome, lessons and unknown types are refused", async () => {
    H.addLead();
    for (const over of [{ type: "welcome" }, { type: "day" }, { type: "Report" }, { type: "admin" },
        { type: "" }, { type: "1" }, { type: "14" }]) {
        const r = await post(homepageBody(over));
        assert.strictEqual(r.statusCode, 403, JSON.stringify(over));
    }
    assert.strictEqual(H.mail.attempts.length, 0);
});


/* =============== Lead eligibility =============== */

test("missing lead: generic 409, nothing sent", async () => {
    const r = await post(homepageBody({ email: "stranger@example.com" }));
    assert.strictEqual(r.statusCode, 409);
    assert.deepStrictEqual(parse(r), { success: false, error: "Email could not be sent." });
    assert.strictEqual(H.mail.attempts.length, 0);
});

test("ineligible leads are refused (sent, sending, old, future, missing or invalid timestamps)", async () => {
    const cases = [
        { email_status: "Sent" },
        { email_status: "Sending" },
        { email_status: null },
        { email_status: "Failed" },
        { last_email_sent: new Date().toISOString() },
        { submitted_at: minutesAgo(31) },
        { submitted_at: new Date(Date.now() + 10 * 60e3).toISOString() },
        { submitted_at: null },
        { submitted_at: "not-a-date" }
    ];
    for (const over of cases) {
        H.reset();
        H.addLead(over);
        const r = await post(homepageBody());
        assert.strictEqual(r.statusCode, 409, JSON.stringify(over) + " -> " + r.statusCode);
        assert.strictEqual(H.mail.attempts.length, 0, JSON.stringify(over));
    }
});

test("server-side created_at takes precedence over browser submitted_at", async () => {
    H.addLead({ created_at: hoursAgo(2), submitted_at: new Date().toISOString() });
    const r = await post(homepageBody());
    assert.strictEqual(r.statusCode, 409);
});

test("multiple leads for one address: the newest is selected", async () => {
    const oldSentAt = hoursAgo(72);
    const old = H.addLead({ submitted_at: oldSentAt, email_status: "Sent", last_email_sent: oldSentAt });
    const fresh = H.addLead();
    const older = H.addLead({ submitted_at: minutesAgo(10) });
    const r = await post(homepageBody());
    assert.strictEqual(r.statusCode, 200, r.body);
    assert.strictEqual(fresh.email_status, "Sent");
    assert.strictEqual(older.email_status, "Pending", "older pending lead not touched");
    assert.strictEqual(older.last_email_sent, null);
    assert.strictEqual(old.email_status, "Sent");
    assert.strictEqual(old.last_email_sent, oldSentAt, "old lead unchanged");
});

test("address matching is normalized (case and spaces); stored address is used", async () => {
    const lead = H.addLead({ email: " Ada@Example.com " });
    const r = await post(homepageBody({ email: "ada@EXAMPLE.com  " }));
    assert.strictEqual(r.statusCode, 200, r.body);
    assert.strictEqual(H.mail.sent[0].payload.to, "Ada@Example.com", "sent to stored address, trimmed");
    assert.strictEqual(lead.email_status, "Sent");
});

test("addresses that merely contain the requested address are not matched", async () => {
    H.addLead({ email: "xada@example.com" });
    H.addLead({ email: "ada@example.com.evil" });
    const r = await post(homepageBody());
    assert.strictEqual(r.statusCode, 409);
    assert.strictEqual(H.mail.attempts.length, 0);
});

test("LIKE wildcards in an address are matched literally", async () => {
    H.addLead({ email: "a_b@example.com" });
    const r = await post(homepageBody({ email: "a%b@example.com" }));
    assert.strictEqual(r.statusCode, 409);
    const r2 = await post(homepageBody({ email: "axb@example.com" }));
    assert.strictEqual(r2.statusCode, 409);
});


/* =============== Duplicates and concurrency =============== */

test("repeated sequential requests send only once", async () => {
    H.addLead();
    const a = await post(homepageBody());
    const b = await post(homepageBody());
    const c = await post(homepageBody());
    assert.deepStrictEqual([a.statusCode, b.statusCode, c.statusCode], [200, 409, 409]);
    assert.strictEqual(H.mail.attempts.length, 1);
});

test("ten simultaneous requests for one lead send exactly once", async () => {
    const lead = H.addLead();
    H.mail.delayMs = 20;
    const results = await Promise.all(Array.from({ length: 10 }, () => post(homepageBody())));
    const codes = results.map((r) => r.statusCode);
    assert.strictEqual(codes.filter((c) => c === 200).length, 1, codes.join(","));
    assert.strictEqual(codes.filter((c) => c === 409).length, 9, codes.join(","));
    assert.strictEqual(H.mail.attempts.length, 1);
    assert.strictEqual(lead.email_status, "Sent");
});

test("two simultaneous leads for one normalized address: at most one email", async () => {
    for (let round = 0; round < 25; round++) {
        H.reset();
        const a = H.addLead({ email: "ada@example.com" });
        const b = H.addLead({ email: " ADA@example.com" });
        H.mail.delayMs = round % 3 === 0 ? 0 : 5;
        const results = await Promise.all([
            post(homepageBody({ email: "ada@example.com" })),
            post(homepageBody({ email: "Ada@Example.com" })),
            post(homepageBody({ email: "ada@example.com" }))
        ]);
        assert(H.mail.attempts.length <= 1, `round ${round}: ${H.mail.attempts.length} sends, codes ${results.map((r) => r.statusCode)}`);
        // No claim may be left behind.
        for (const lead of [a, b]) {
            assert(["Pending", "Sent"].includes(lead.email_status), `round ${round}: left ${lead.email_status}`);
        }
        assert.strictEqual([a, b].filter((l) => l.email_status === "Sent").length, H.mail.attempts.length);
    }
});

test("two requests that each claim a different lead for one address: at most one email", async () => {
    // Request 1 reads the address while only lead A exists; lead B (newer) is
    // inserted right after, so request 2 picks B. Both pass the first check and
    // both claim; only the post-claim re-check can stop a double send.
    for (let round = 0; round < 10; round++) {
        H.reset();
        const a = H.addLead({ submitted_at: minutesAgo(2) });
        let b = null;
        let selects = 0;
        const claimedIds = new Set();
        H.db.failWhen = (q) => {
            // The 2nd read is request 2's first look-up: B appears just before it.
            if (q.mode === "select" && ++selects === 2) {
                b = H.addLead({ email: "ADA@example.com", submitted_at: minutesAgo(1) });
            }
            if (q.mode === "update" && q.changes && q.changes.email_status === "Sending") {
                const id = q.filters.find(([op, c]) => op === "eq" && c === "id")[2];
                const row = H.db.tables.leads.find((l) => l.id === id);
                if (row && row.email_status === "Pending") claimedIds.add(id);
            }
            return false;
        };
        H.mail.delayMs = 5;
        const mod = fn();
        const results = await Promise.all([
            mod.handler({ httpMethod: "POST", body: homepageBody() }),
            mod.handler({ httpMethod: "POST", body: homepageBody({ email: "Ada@example.com" }) })
        ]);
        assert.strictEqual(claimedIds.size, 2, `round ${round}: scenario must produce two successful claims (got ${claimedIds.size})`);
        assert(H.mail.attempts.length <= 1, `round ${round}: ${H.mail.attempts.length} sends, codes ${results.map((r) => r.statusCode)}`);
        for (const lead of [a, b]) {
            assert(["Pending", "Sent"].includes(lead.email_status), `round ${round}: claim left as ${lead.email_status}`);
        }
    }
});

test("post-claim re-check: a competing claim that appears after the first check makes this request back off", async () => {
    const mine = H.addLead({ submitted_at: minutesAgo(1) });
    const rival = H.addLead({ submitted_at: minutesAgo(2) });
    // Simulate a rival request claiming its lead right after our claim.
    const fnModule = fn();
    let injected = false;
    const origFail = H.db.failWhen;
    H.db.failWhen = (q) => {
        if (!injected && q.mode === "update" && q.changes && q.changes.email_status === "Sending") {
            injected = true;
            rival.email_status = "Sending";
        }
        return origFail ? origFail(q) : false;
    };
    const r = await fnModule.handler({ httpMethod: "POST", body: homepageBody() });
    assert.strictEqual(r.statusCode, 409, r.body);
    assert.strictEqual(H.mail.attempts.length, 0);
    assert.strictEqual(mine.email_status, "Pending", "own claim released");
    assert.strictEqual(mine.last_email_sent, null);
    assert.strictEqual(rival.email_status, "Sending", "rival state not overwritten");
});

test("24-hour limit: another lead for the address emailed within a day blocks a new report", async () => {
    H.addLead({ submitted_at: hoursAgo(1), email_status: "Sent", last_email_sent: hoursAgo(1) });
    const fresh = H.addLead();
    const r = await post(homepageBody());
    assert.strictEqual(r.statusCode, 409);
    assert.strictEqual(H.mail.attempts.length, 0);
    assert.strictEqual(fresh.email_status, "Pending");
});

test("24-hour limit expires: a report sent 25 hours ago does not block", async () => {
    H.addLead({ submitted_at: hoursAgo(25), email_status: "Sent", last_email_sent: hoursAgo(25) });
    H.addLead();
    const r = await post(homepageBody());
    assert.strictEqual(r.statusCode, 200, r.body);
});

test("abandoned claim: an old 'Sending' lead does not block the address forever", async () => {
    const abandoned = H.addLead({ submitted_at: hoursAgo(3), email_status: "Sending" });
    H.addLead();
    const r = await post(homepageBody());
    assert.strictEqual(r.statusCode, 200, r.body);
    assert.strictEqual(abandoned.email_status, "Sending", "abandoned lead itself is left as is");
});

test("live claim: a recent 'Sending' lead for the address blocks a second report", async () => {
    H.addLead({ submitted_at: minutesAgo(1), email_status: "Sending" });
    H.addLead();
    const r = await post(homepageBody());
    assert.strictEqual(r.statusCode, 409);
});


/* =============== Delivery =============== */

test("Resend rejection: 502 generic, claim released, no false Sent, no leak", async () => {
    const lead = H.addLead();
    H.mail.mode = "error";
    const r = await post(homepageBody());
    assert.strictEqual(r.statusCode, 502);
    assert.deepStrictEqual(parse(r), { success: false, error: "Email could not be sent. Please try again later." });
    assert.strictEqual(lead.email_status, "Pending");
    assert.strictEqual(lead.last_email_sent, null);
    noLeak(r);
});

test("Resend exception: 502, claim released, retry then succeeds once", async () => {
    const lead = H.addLead();
    H.mail.mode = "throw";
    const r1 = await post(homepageBody());
    assert.strictEqual(r1.statusCode, 502);
    assert.strictEqual(lead.email_status, "Pending");
    noLeak(r1);
    H.mail.mode = "ok";
    const r2 = await post(homepageBody());
    assert.strictEqual(r2.statusCode, 200);
    assert.strictEqual(lead.email_status, "Sent");
    assert.strictEqual(H.mail.sent.length, 1);
    assert.strictEqual(H.mail.attempts[0].options.idempotencyKey, H.mail.attempts[1].options.idempotencyKey,
        "retry reuses the per-lead idempotency key");
});

test("idempotency: the key is per lead and stable", async () => {
    const a = H.addLead({ email: "a@example.com" });
    const b = H.addLead({ email: "b@example.com" });
    await post(homepageBody({ email: "a@example.com" }));
    await post(homepageBody({ email: "b@example.com" }));
    assert.deepStrictEqual(H.mail.sent.map((s) => s.options.idempotencyKey),
        ["report-lead-" + a.id, "report-lead-" + b.id]);
});

test("missing server configuration: generic 500, nothing sent, no variable names leaked", async () => {
    for (const missing of ["SUPABASE_SERVICE_ROLE_KEY", "RESEND_API_KEY", "SUPABASE_URL"]) {
        H.reset();
        H.setEnv({ [missing]: undefined });
        H.addLead();
        const r = await post(homepageBody());
        assert.strictEqual(r.statusCode, 500, missing);
        assert(!r.body.includes("SUPABASE") && !r.body.includes("RESEND"), "config name leaked");
        assert.strictEqual(H.mail.attempts.length, 0);
    }
});

test("database failure during lookup: generic 500, nothing sent, no DB detail", async () => {
    H.addLead();
    H.db.failWhen = (q) => q.mode === "select";
    const r = await post(homepageBody());
    assert.strictEqual(r.statusCode, 500);
    assert.deepStrictEqual(parse(r), { success: false, error: "Something went wrong. Please try again later." });
    assert.strictEqual(H.mail.attempts.length, 0);
    noLeak(r);
});

test("database failure on the post-claim re-check: claim released, nothing sent", async () => {
    const lead = H.addLead();
    let selects = 0;
    H.db.failWhen = (q) => q.mode === "select" && ++selects === 2;
    const r = await post(homepageBody());
    assert.strictEqual(r.statusCode, 500);
    assert.strictEqual(H.mail.attempts.length, 0);
    assert.strictEqual(lead.email_status, "Pending");
});

test("status update after delivery fails: still 200 (email went out), lead stays claimed so no resend", async () => {
    const lead = H.addLead();
    H.db.failWhen = (q) => q.mode === "update" && q.changes && q.changes.email_status === "Sent";
    const r = await post(homepageBody());
    assert.strictEqual(r.statusCode, 200);
    assert.strictEqual(lead.email_status, "Sending");
    H.db.failWhen = null;
    const again = await post(homepageBody());
    assert.strictEqual(again.statusCode, 409);
    assert.strictEqual(H.mail.attempts.length, 1);
});

test("schema rejects 'Sending' (strict default): fails closed, never marks Sent, nothing sent", async () => {
    H.db.rejectValues = { email_status: ["Sending"] };
    const lead = H.addLead();
    const r = await post(homepageBody());
    assert.strictEqual(r.statusCode, 500);
    assert.strictEqual(H.mail.attempts.length, 0);
    assert.strictEqual(lead.email_status, "Pending");
    assert.strictEqual(lead.last_email_sent, null);
    assert(H.logs.some((l) => l.includes("status_value_sending_rejected")), "clear log stage");
});

test("compat mode (explicit opt-in): single send under concurrency, reverts exactly on failure", async () => {
    H.setEnv({ EMAIL_CLAIM_COMPAT_MODE: "sent-before-delivery" });
    H.db.rejectValues = { email_status: ["Sending"] };
    const lead = H.addLead();
    H.mail.delayMs = 10;
    const mod = H.load(FN);
    assert.strictEqual(mod._internal.CLAIM_MODE, "sent-before-delivery");
    const results = await Promise.all(Array.from({ length: 5 }, () =>
        mod.handler({ httpMethod: "POST", body: homepageBody() })));
    assert.strictEqual(results.filter((r) => r.statusCode === 200).length, 1);
    assert.strictEqual(H.mail.attempts.length, 1);
    assert.strictEqual(lead.email_status, "Sent");

    H.reset();
    H.db.rejectValues = { email_status: ["Sending"] };
    const lead2 = H.addLead();
    H.mail.mode = "error";
    const r = await mod.handler({ httpMethod: "POST", body: homepageBody() });
    assert.strictEqual(r.statusCode, 502);
    assert.strictEqual(lead2.email_status, "Pending");
    assert.strictEqual(lead2.last_email_sent, null);
});

test("release never overwrites a state changed by another request", async () => {
    const lead = H.addLead();
    H.mail.mode = "error";
    // Another actor changes the lead while delivery is in flight.
    H.mail.delayMs = 15;
    const pending = post(homepageBody());
    await new Promise((r) => setTimeout(r, 8));
    lead.email_status = "Sent";
    lead.last_email_sent = "2026-01-01T00:00:00.000Z";
    const r = await pending;
    assert.strictEqual(r.statusCode, 502);
    assert.strictEqual(lead.email_status, "Sent", "foreign state preserved");
    assert.strictEqual(lead.last_email_sent, "2026-01-01T00:00:00.000Z");
});


/* =============== Content =============== */

test("content comes from the stored lead and is HTML-escaped", async () => {
    H.addLead({
        name: "<script>alert(1)</script><a href='https://evil.example'>x</a>",
        concern: "\"><img src=x onerror=alert(1)>",
        recommendation: "<b>bold</b> & co"
    });
    const r = await post(homepageBody({ name: "Request Name Should Not Be Used" }));
    assert.strictEqual(r.statusCode, 200, r.body);
    const html = H.mail.sent[0].payload.html;
    assert(!html.includes("<script>alert(1)"));
    assert(!html.includes("<a href='https://evil.example'>"));
    assert(!html.includes("<img src=x"));
    assert(html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
    assert(html.includes("&lt;b&gt;bold&lt;/b&gt; &amp; co"));
    assert(!html.includes("Request Name Should Not Be Used"));
});

test("report preserves every homepage value and uses a signed tracking pixel without the address", async () => {
    const lead = H.addLead({ name: "Chiamaka O'Neil", skin_type: "Combination", concern: "Dark Spots",
        oil_level: "Moderate", sensitivity: "High", score: 60, recommendation: "Your skin needs hydration and consistency." });
    const r = await post(homepageBody());
    assert.strictEqual(r.statusCode, 200, r.body);
    const html = H.mail.sent[0].payload.html;
    for (const s of ["Chiamaka O&#39;Neil", "Combination", "Dark Spots", "Moderate", "High", "60/100",
        "Your skin needs hydration and consistency."]) {
        assert(html.includes(s), "missing " + s);
    }
    assert(html.includes("/.netlify/functions/email-open?l=" + lead.id + "&amp;t="), "signed pixel");
    assert(!html.includes("email-open?email="), "no address in pixel URL");
    assert(!html.includes("ada%40example.com") && !html.includes("ada@example.com"), "address not in HTML");
});

test("base64-encoded body (Netlify) is handled", async () => {
    H.addLead();
    const r = await post(Buffer.from(homepageBody()).toString("base64"), { isBase64Encoded: true });
    assert.strictEqual(r.statusCode, 200, r.body);
});

test("EMAIL_FROM overrides the sender only when well-formed", async () => {
    H.setEnv({ EMAIL_FROM: "EMerriment <hello@emerriment.com>" });
    H.addLead();
    await post(homepageBody());
    assert.strictEqual(H.mail.sent[0].payload.from, "EMerriment <hello@emerriment.com>");
    H.reset();
    H.setEnv({ EMAIL_FROM: "bad\r\nBcc: x@evil.example" });
    H.addLead();
    await post(homepageBody());
    assert.strictEqual(H.mail.sent[0].payload.from, "EMerriment <onboarding@resend.dev>");
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
