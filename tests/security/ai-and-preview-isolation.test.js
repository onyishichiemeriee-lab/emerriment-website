/* AI and preview-secret isolation (Work Package 2A).
   * OpenAI is called from PRODUCTION ONLY: in a deploy preview, branch deploy,
     local or unknown context no request reaches api.openai.com and the key
     is not used, whatever EMERRIMENT_AI_MODE / EMERRIMENT_OPENAI_KEY say.
     Production behaviour is unchanged.
   * The Free-plan preview matrix: a deploy preview that receives NO server
     Supabase credentials and no email/link secrets (only the public staging
     URL + anon key for the browser build). Every function then answers in a
     controlled way, creates no database client and sends nothing.
   Fake Supabase/Resend/fetch, synthetic values only. No network. */
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const H = require("../email/helpers");

const suite = H.createSuite("AI and preview-secret isolation (offline)");
const { test } = suite;

const OPENAI = "https://api.openai.com/";
const SYNTH_KEY = "sk-synthetic-test-key-not-real-0000000000";
const PREVIEW = { EMERRIMENT_CONTEXT: "deploy-preview", DEPLOY_PRIME_URL: "https://deploy-preview-7--emerriment216.netlify.app" };

// Records every fetch; answers like a failing upstream so no real work happens.
function withFetch(fn) {
    return async () => {
        const original = global.fetch;
        const calls = [];
        global.fetch = async (url, opts = {}) => {
            calls.push({ url: String(url), auth: (opts.headers || {}).Authorization || (opts.headers || {}).authorization || null });
            return { ok: false, status: 599, json: async () => ({ error: { message: "synthetic" } }), text: async () => "synthetic" };
        };
        try { await fn(calls); } finally { global.fetch = original; }
    };
}
const openAiCalls = (calls) => calls.filter((c) => c.url.startsWith(OPENAI));
async function ask(over) {
    H.setEnv({ EMERRIMENT_AI_MODE: undefined, EMERRIMENT_OPENAI_KEY: undefined, OPENAI_MODEL: undefined, ...over });
    const fn = H.load("netlify/functions/ai-chat.js");
    const res = await fn.handler({ httpMethod: "POST", headers: { origin: "https://emerriment.com" }, body: JSON.stringify({ message: "Which cleanser suits oily skin?" }) });
    let body = {};
    try { body = JSON.parse(res.body); } catch { /* not JSON */ }
    return { status: res.statusCode, body };
}

/* ---------------- OpenAI: production only ---------------- */

test("production + live + key: OpenAI is called with the configured key (behaviour unchanged)", withFetch(async (calls) => {
    await ask({ EMERRIMENT_CONTEXT: "production", EMERRIMENT_AI_MODE: "live", EMERRIMENT_OPENAI_KEY: SYNTH_KEY });
    const o = openAiCalls(calls);
    assert.strictEqual(o.length, 1, "exactly one OpenAI request in production");
    assert.strictEqual(o[0].auth, "Bearer " + SYNTH_KEY);
}));

test("production + live + no key: 'not configured', no request (unchanged)", withFetch(async (calls) => {
    const r = await ask({ EMERRIMENT_CONTEXT: "production", EMERRIMENT_AI_MODE: "live" });
    assert.strictEqual(r.status, 500);
    assert.strictEqual(openAiCalls(calls).length, 0);
}));

test("deploy preview + live + key PRESENT: no OpenAI request, mock answer, key unused", withFetch(async (calls) => {
    const r = await ask({ ...PREVIEW, EMERRIMENT_AI_MODE: "live", EMERRIMENT_OPENAI_KEY: SYNTH_KEY });
    assert.strictEqual(openAiCalls(calls).length, 0, "OpenAI called from a preview");
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.mode, "mock");
    assert.ok(!calls.some((c) => c.auth && c.auth.includes(SYNTH_KEY)), "key sent somewhere");
    assert.strictEqual(H.load("netlify/lib/environment.js").getOpenAiKey(), null, "key readable outside production");
}));

test("deploy preview + live + key ABSENT: no OpenAI request, mock answer (not a 500)", withFetch(async (calls) => {
    const r = await ask({ ...PREVIEW, EMERRIMENT_AI_MODE: "live" });
    assert.strictEqual(openAiCalls(calls).length, 0);
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.mode, "mock");
}));

test("deploy preview + mock: mock answer, no network request at all", withFetch(async (calls) => {
    const r = await ask({ ...PREVIEW, EMERRIMENT_AI_MODE: "mock", EMERRIMENT_OPENAI_KEY: SYNTH_KEY });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.mode, "mock");
    assert.strictEqual(openAiCalls(calls).length, 0);
}));

test("unknown, missing, branch-deploy and dev contexts: never an OpenAI request", withFetch(async (calls) => {
    for (const ctx of [{ EMERRIMENT_CONTEXT: undefined, CONTEXT: undefined }, { EMERRIMENT_CONTEXT: "staging" }, { EMERRIMENT_CONTEXT: "branch-deploy" }, { EMERRIMENT_CONTEXT: "dev" }]) {
        for (const mode of ["live", "LIVE", "openai", ""]) {
            await ask({ ...ctx, EMERRIMENT_AI_MODE: mode || undefined, EMERRIMENT_OPENAI_KEY: SYNTH_KEY });
        }
    }
    assert.strictEqual(openAiCalls(calls).length, 0, "OpenAI called outside production: " + openAiCalls(calls).length);
}));

test("environment guard: openAiAllowed / getOpenAiKey are production-only", () => {
    for (const [ctx, allowed] of [["production", true], ["deploy-preview", false], ["branch-deploy", false], ["dev", false], [undefined, false], ["bogus", false]]) {
        H.setEnv({ EMERRIMENT_CONTEXT: ctx, EMERRIMENT_OPENAI_KEY: SYNTH_KEY });
        const env = H.load("netlify/lib/environment.js");
        assert.strictEqual(env.openAiAllowed(), allowed, String(ctx));
        assert.strictEqual(env.getOpenAiKey(), allowed ? SYNTH_KEY : null, String(ctx));
    }
});

test("source: the only OpenAI request is behind the production guard; the key comes from getOpenAiKey", () => {
    const src = fs.readFileSync(path.join(H.ROOT, "netlify", "functions", "ai-chat.js"), "utf8");
    assert.ok(!/process\.env\.EMERRIMENT_OPENAI_KEY/.test(src), "ai-chat reads the key directly");
    assert.strictEqual((src.match(/fetch\(\s*OPENAI_API_URL/g) || []).length, 1, "one OpenAI call site");
    const at = src.search(/fetch\(\s*OPENAI_API_URL/);
    const guard = src.lastIndexOf("if (!openAiAllowed() || !key)", at);
    assert.ok(guard > 0 && at - guard < 600, "guard immediately before the OpenAI request");
});

/* ---------------- Free-plan preview matrix: no server secrets ---------------- */

test("preview with NO server Supabase credentials and no link/email secrets: every function is controlled, no client, nothing sent", withFetch(async (calls) => {
    H.reset();
    H.setEnv({ ...PREVIEW, SUPABASE_URL: undefined, SUPABASE_SERVICE_ROLE_KEY: undefined, STAGING_SUPABASE_PROJECT_REF: undefined,
        RESEND_API_KEY: undefined, EMAIL_FROM: undefined, EMAIL_LINK_SECRET: undefined, EMERRIMENT_OPENAI_KEY: undefined,
        EMAIL_CONFIRMATION_ENABLED: "true", EMAIL_SEQUENCE_ENABLED: "true", CUSTOMER_ONBOARDING_ENABLED: "true" });
    const env = H.load("netlify/lib/environment.js");
    assert.strictEqual(env.getServerSupabaseConfig().ok, false);
    const fake = "A".repeat(43);
    const runs = {
        "send-email": () => H.load("netlify/functions/send-email.js").handler({ httpMethod: "POST", body: JSON.stringify({ name: "Ada", email: "ada@example.test", skinType: "Oily", concern: "Acne", oilLevel: "High", sensitivity: "Low", score: 50, recommendation: "Hydrate." }) }),
        "confirm-subscription": () => H.load("netlify/functions/confirm-subscription.js").handler({ httpMethod: "POST", body: "t=" + fake + "&confirm=yes" }),
        unsubscribe: () => H.load("netlify/functions/unsubscribe.js").handler({ httpMethod: "POST", queryStringParameters: { l: "1", t: fake } }),
        "email-open": () => H.load("netlify/functions/email-open.js").handler({ httpMethod: "GET", queryStringParameters: { l: "1", t: fake } }),
        "track-click": () => H.load("netlify/functions/track-click.js").handler({ httpMethod: "GET", queryStringParameters: { l: "1", url: "https://emerriment.com/", t: fake } }),
        "email-sequence": () => H.load("netlify/functions/email-sequence.js").handler({}),
        "customer-onboarding": () => H.load("netlify/functions/customer-onboarding.js").handler({}),
        "email-features": () => H.load("netlify/functions/email-features.js").handler({ httpMethod: "GET" }),
        "ai-chat": () => H.load("netlify/functions/ai-chat.js").handler({ httpMethod: "POST", headers: { origin: "https://emerriment.com" }, body: JSON.stringify({ message: "hello" }) }),
    };
    const statuses = {};
    for (const [name, run] of Object.entries(runs)) {
        const res = await run();
        assert.ok(res && Number.isInteger(res.statusCode), name + ": no controlled response");
        statuses[name] = res.statusCode;
    }
    assert.deepStrictEqual(H.db.clientUrls, [], "a database client was created: " + H.db.clientUrls.join(","));
    assert.strictEqual(H.mail.attempts.length, 0, "an email provider was called");
    assert.strictEqual(openAiCalls(calls).length, 0, "OpenAI was called");
    assert.strictEqual(statuses["ai-chat"], 200, "AI assistant still answers (mock) without a database");
    assert.strictEqual(JSON.parse((await runs["email-features"]()).body).consentConfirmation, false);
}));

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
