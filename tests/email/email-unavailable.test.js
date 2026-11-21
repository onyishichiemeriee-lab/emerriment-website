/* Controlled "email unavailable" outcome (WP4C).
   Outside production send-email answers 503 {code: "email_not_configured"}
   BEFORE any database or provider work, with no secrets, addresses or
   stack traces in the response or logs. Production behaviour (sent 200,
   misconfiguration 500) is unchanged. The quiz pages tell the visitor
   the truth (never a false "sent"). Fake Supabase / Resend only. */
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const H = require("./helpers");

const suite = H.createSuite("email unavailable outside production (503 email_not_configured)");
const { test } = suite;

const FN = "netlify/functions/send-email.js";
const QUIZ = JSON.stringify({ name: "Ada", email: "ada@example.com", skinType: "Oily", concern: "Acne", oilLevel: "High", sensitivity: "Low", score: 50, recommendation: "Your skin needs hydration and consistency." });
const STAGING_REF = "stagingtestproject01";
const SECRETS = ["test-resend-key-not-real", "test-service-role-not-real", "SECRET-SERVICE-ROLE-synthetic", "SECRET-RESEND-synthetic"];

function assertClean(r) {
    for (const s of [...SECRETS, "ada@example.com", "Ada", "at Object.", "stack"]) {
        assert(!r.body.includes(s), "response contains " + s);
    }
    H.assertLogsClean(assert, ["ada@example.com", ...SECRETS]);
}

for (const context of ["deploy-preview", "branch-deploy", "dev"]) {
    test(`${context}, no server credentials (the real preview): 503 email_not_configured, nothing touched`, async () => {
        H.setEnv({ EMERRIMENT_CONTEXT: context, RESEND_API_KEY: undefined, SUPABASE_URL: undefined, SUPABASE_SERVICE_ROLE_KEY: undefined });
        const lead = H.addLead();
        const r = await H.load(FN).handler({ httpMethod: "POST", body: QUIZ });
        assert.strictEqual(r.statusCode, 503, r.body);
        assert.deepStrictEqual(JSON.parse(r.body), { success: false, code: "email_not_configured", error: "Email isn't available right now." });
        assert.strictEqual(r.headers["Cache-Control"], "no-store");
        assert.strictEqual(H.mail.attempts.length, 0, "provider called");
        assert.deepStrictEqual(H.db.clientUrls, [], "a database client was created");
        assert.strictEqual(lead.email_status, "Pending");
        assertClean(r);
    });
}

test("preview WITH (mistakenly inherited) mail key and staging service key: still 503, Resend never constructed or called", async () => {
    H.setEnv({ EMERRIMENT_CONTEXT: "deploy-preview", STAGING_SUPABASE_PROJECT_REF: STAGING_REF, SUPABASE_URL: `https://${STAGING_REF}.supabase.co`, SUPABASE_SERVICE_ROLE_KEY: "SECRET-SERVICE-ROLE-synthetic", RESEND_API_KEY: "SECRET-RESEND-synthetic" });
    const lead = H.addLead();
    const r = await H.load(FN).handler({ httpMethod: "POST", body: QUIZ });
    assert.strictEqual(r.statusCode, 503);
    assert.strictEqual(JSON.parse(r.body).code, "email_not_configured");
    assert.strictEqual(H.mail.attempts.length, 0);
    assert.deepStrictEqual(H.db.clientUrls, [], "no claim / reservation work may happen outside production");
    assert.strictEqual(lead.email_status, "Pending");
    assert(!H.db.ops.some((o) => o.changes), "a database write happened");
    assertClean(r);
});

test("outside production, invalid requests are still rejected with 400 (validation first)", async () => {
    H.setEnv({ EMERRIMENT_CONTEXT: "deploy-preview" });
    const r = await H.load(FN).handler({ httpMethod: "POST", body: JSON.stringify({ email: "not-an-email" }) });
    assert.strictEqual(r.statusCode, 400);
});

test("production unchanged: configured → 200 sent", async () => {
    H.setEnv();   // TEST_ENV is production with fake credentials
    H.addLead();
    const r = await H.load(FN).handler({ httpMethod: "POST", body: QUIZ });
    assert.strictEqual(r.statusCode, 200, r.body);
    assert.strictEqual(H.mail.sent.length, 1);
});

test("production unchanged: missing mail key is still a 500 server error (not disguised as 'unavailable')", async () => {
    H.setEnv({ RESEND_API_KEY: undefined });
    H.addLead();
    const r = await H.load(FN).handler({ httpMethod: "POST", body: QUIZ });
    assert.strictEqual(r.statusCode, 500);
    assert.strictEqual(JSON.parse(r.body).code, undefined);
    assert.strictEqual(H.mail.attempts.length, 0);
    assertClean(r);
});

/* ---------- Frontend: quiz.html (js/quiz.js) ---------- */

function extract(src, signature) {
    const start = src.indexOf(signature);
    assert(start >= 0, signature + " not found");
    let depth = 0;
    for (let i = src.indexOf("{", src.indexOf(")", start)); i < src.length; i++) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}" && --depth === 0) return src.slice(start, i + 1);
    }
    throw new Error("unbalanced " + signature);
}

function quizSandbox(sendEmailResponse) {
    const src = fs.readFileSync(path.join(H.ROOT, "js/quiz.js"), "utf8");
    const logs = [];
    const fake = {
        from: () => ({ insert: async () => ({ error: null }) }),
        auth: { getUser: async () => ({ data: { user: null }, error: null }) }
    };
    const context = {
        supabaseClient: fake, window: {}, console: { log: (...a) => logs.push(a.join(" ")), warn: (...a) => logs.push(a.join(" ")), error: (...a) => logs.push(a.join(" ")) },
        fetch: async () => sendEmailResponse, document: { getElementById: () => null }
    };
    context.window = context;
    vm.createContext(context);
    vm.runInContext(extract(src, "async function saveQuizResult(") + "\nthis.saveQuizResult = saveQuizResult;", context);
    return { context, logs };
}

const DATA = { name: "Ada", email: "ada@example.com", skin_type: "Oily", concern: "Acne", oil_level: "High", sensitivity: "Low", goal: "Glow", routine: "Basic" };
const resp = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

test("quiz.html: 503 email_not_configured → status 'unavailable' (not 'sent', not a generic failure)", async () => {
    const { context } = quizSandbox(resp(503, { success: false, code: "email_not_configured" }));
    const out = await context.saveQuizResult(DATA, 72, "Hydrate.");
    assert.strictEqual(out.success, true);
    assert.strictEqual(out.reportEmailSent, false);
    assert.strictEqual(out.reportEmailStatus, "unavailable");
});

test("quiz.html: 200 → 'sent'; 500 / 502 / network error → 'failed'", async () => {
    assert.strictEqual((await quizSandbox(resp(200, { success: true })).context.saveQuizResult(DATA, 72, "x")).reportEmailStatus, "sent");
    for (const r of [resp(500, {}), resp(502, {}), resp(503, { code: "something_else" })]) {
        assert.strictEqual((await quizSandbox(r).context.saveQuizResult(DATA, 72, "x")).reportEmailStatus, "failed");
    }
    const { context } = quizSandbox(null);
    context.fetch = async () => { throw new Error("offline"); };
    assert.strictEqual((await context.saveQuizResult(DATA, 72, "x")).reportEmailStatus, "failed");
});

test("quiz.html: the results notice text never claims a report was sent unless it was", () => {
    const src = fs.readFileSync(path.join(H.ROOT, "js/quiz.js"), "utf8");
    const fn = extract(src, "function showReportEmailNotice(");
    assert(/status === "sent"\s*\?\s*"📩 We've sent/.test(fn), "'sent' wording must be tied to status === 'sent'");
    assert(/Email isn't available on this site right now/.test(fn));
    assert(!/innerHTML/.test(fn), "notice must use textContent");
    assert(/showReportEmailNotice\(saveResult\)/.test(src), "notice not shown after results");
});

test("homepage quiz (js/script.js): 503 email_not_configured gets its own honest message", () => {
    const src = fs.readFileSync(path.join(H.ROOT, "js/script.js"), "utf8");
    assert(/emailResponse\.status === 503/.test(src) && /reply\.code === "email_not_configured"/.test(src));
    assert(/else if \(emailUnavailable\)/.test(src));
    assert(/if \(emailSent\) \{\s*alert\("🎉 Your skin report has been generated and sent/.test(src), "'sent' alert must stay tied to emailSent");
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
