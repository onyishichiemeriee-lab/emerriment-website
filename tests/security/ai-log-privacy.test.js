/* AI log privacy (Work Package 3B).
   Server logs of netlify/functions/ai-chat.js never contain the visitor's
   message, user id, skin profile, quiz results, conversation history,
   memories, AI replies, raw provider responses or provider error text —
   while operational lines (mode, context counts, success/failure, status,
   error category) remain. Production behaviour is unchanged and previews
   still cannot call OpenAI. Source checks cover the browser AI scripts.
   Unique marker strings stand in for private data. Fake fetch; no network. */
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const H = require("../email/helpers");

const suite = H.createSuite("AI log privacy (offline)");
const { test } = suite;

const M = {
    message: "MARKER-MESSAGE-7f3a which cleanser for my oily skin",
    userId: "MARKER-USERID-2b9c",
    skin: "MARKER-SKINPROFILE-91de",
    memory: "MARKER-MEMORY-4c11",
    quiz: "MARKER-QUIZ-0a7e",
    history: "MARKER-HISTORY-5d20",
    reply: "MARKER-AI-REPLY-8e44",
    providerError: "MARKER-PROVIDER-ERROR-3f9b",
    rawBody: "MARKER-RAW-BODY-c6a1",
};
const PRIVATE = [M.message, M.userId, M.skin, M.memory, M.quiz, M.history, M.reply, M.providerError, M.rawBody];
const CONTEXT = {
    userId: M.userId,
    skinProfile: { skin_type: M.skin, concern: M.skin },
    memory: { skinType: M.memory, allergy: M.memory },
    quizResults: [{ score: 42, skin_type: M.quiz }],
    conversationHistory: [{ role: "user", content: M.history }, { role: "assistant", content: M.history }],
};
const SYNTH_KEY = "sk-synthetic-test-key-not-real-0000000000";
const OPENAI = "https://api.openai.com/";

async function run(env, upstream) {
    H.reset();
    H.setEnv({ EMERRIMENT_AI_MODE: undefined, EMERRIMENT_OPENAI_KEY: undefined, OPENAI_MODEL: undefined, ...env });
    const original = global.fetch;
    const calls = [];
    global.fetch = async (url) => { calls.push(String(url)); return upstream ? upstream(String(url)) : { ok: false, status: 599, text: async () => "{}", json: async () => ({}) }; };
    try {
        const fn = H.load("netlify/functions/ai-chat.js");
        const res = await fn.handler({ httpMethod: "POST", headers: { origin: "https://emerriment.com" }, body: JSON.stringify({ message: M.message, context: CONTEXT, safety: { riskLevel: "LOW", matched: M.message } }) });
        let body = {}; try { body = JSON.parse(res.body); } catch { /* */ }
        return { status: res.statusCode, body, logs: H.logs.join("\n"), openai: calls.filter((u) => u.startsWith(OPENAI)).length };
    } finally { global.fetch = original; }
}
const leaks = (logs) => PRIVATE.filter((p) => logs.includes(p));
const textResponse = (status, text) => ({ ok: status < 300, status, text: async () => text, json: async () => JSON.parse(text) });

test("preview (mock): no message, user id, profile, memories, quiz, history or reply in the logs", async () => {
    const r = await run({ EMERRIMENT_CONTEXT: "deploy-preview", EMERRIMENT_AI_MODE: "live", EMERRIMENT_OPENAI_KEY: SYNTH_KEY });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.openai, 0, "a preview called OpenAI");
    assert.deepStrictEqual(leaks(r.logs), [], "private data logged");
    if (typeof r.body.reply === "string" && r.body.reply.length > 20) {
        assert.ok(!r.logs.includes(r.body.reply.slice(0, 60)), "the AI reply was logged");
    }
});

test("production (live): OpenAI is called and its reply returned — but neither prompt nor reply is logged", async () => {
    const r = await run({ EMERRIMENT_CONTEXT: "production", EMERRIMENT_AI_MODE: "live", EMERRIMENT_OPENAI_KEY: SYNTH_KEY },
        () => textResponse(200, JSON.stringify({ output_text: M.reply, id: "resp_synthetic" })));
    assert.strictEqual(r.openai, 1, "production must still call OpenAI");
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.reply, M.reply, "production reply unchanged");
    assert.strictEqual(r.body.mode, "live");
    assert.deepStrictEqual(leaks(r.logs), [], "private data logged");
    assert.ok(!r.logs.includes(SYNTH_KEY), "key logged");
});

test("production: provider error text is not logged, only status/type/code", async () => {
    const r = await run({ EMERRIMENT_CONTEXT: "production", EMERRIMENT_AI_MODE: "live", EMERRIMENT_OPENAI_KEY: SYNTH_KEY },
        () => textResponse(400, JSON.stringify({ error: { message: M.providerError + " " + M.message, type: "invalid_request_error", code: "context_length_exceeded" } })));
    assert.strictEqual(r.status, 400);
    assert.deepStrictEqual(leaks(r.logs), [], "provider error text or prompt logged");
    assert.ok(r.logs.includes("invalid_request_error") && r.logs.includes("context_length_exceeded"), "error category missing from the logs");
});

test("production: an unparseable provider body is not logged, only status and size", async () => {
    const r = await run({ EMERRIMENT_CONTEXT: "production", EMERRIMENT_AI_MODE: "live", EMERRIMENT_OPENAI_KEY: SYNTH_KEY },
        () => textResponse(200, "<html>" + M.rawBody + " " + M.reply + "</html>"));
    assert.strictEqual(r.status, 502);
    assert.deepStrictEqual(leaks(r.logs), [], "raw body logged");
    assert.ok(/Invalid AI response/.test(r.logs) && /"bytes":\d+/.test(r.logs), "operational error line missing");
});

test("production: an empty reply logs a count, not the response object", async () => {
    const r = await run({ EMERRIMENT_CONTEXT: "production", EMERRIMENT_AI_MODE: "live", EMERRIMENT_OPENAI_KEY: SYNTH_KEY },
        () => textResponse(200, JSON.stringify({ output: [{ type: "reasoning", summary: M.reply }] })));
    assert.strictEqual(r.status, 502);
    assert.deepStrictEqual(leaks(r.logs), [], "response object logged");
});

test("operational logs remain: mode, context counts, request and outcome", async () => {
    const r = await run({ EMERRIMENT_CONTEXT: "production", EMERRIMENT_AI_MODE: "live", EMERRIMENT_OPENAI_KEY: SYNTH_KEY },
        () => textResponse(200, JSON.stringify({ output_text: M.reply })));
    for (const line of ["EMerriment AI MODE", "AI context received", "\"skinProfile\":true", "\"memories\":2", "\"quizResults\":1", "\"conversationHistory\":2", "EMerriment AI response generated", "OPENAI KEY CHECK"]) {
        assert.ok(r.logs.includes(line), "missing operational log: " + line);
    }
    assert.ok(!/"length":\d+/.test(r.logs.split("OPENAI KEY CHECK")[1] || ""), "key length logged");
});

test("unknown / missing context: no OpenAI request and nothing private logged", async () => {
    for (const ctx of [{ EMERRIMENT_CONTEXT: undefined, CONTEXT: undefined }, { EMERRIMENT_CONTEXT: "branch-deploy" }]) {
        const r = await run({ ...ctx, EMERRIMENT_AI_MODE: "live", EMERRIMENT_OPENAI_KEY: SYNTH_KEY });
        assert.strictEqual(r.openai, 0);
        assert.deepStrictEqual(leaks(r.logs), []);
    }
});

/* ---------------- Source checks ---------------- */

// Every console call's argument list, with string literals removed.
function consoleArgs(src) {
    const out = [];
    const re = /console\.(log|info|warn|error|debug)\(/g;
    let m;
    while ((m = re.exec(src))) {
        let i = m.index + m[0].length, d = 1;
        while (i < src.length && d) { if (src[i] === "(") d++; else if (src[i] === ")") d--; i++; }
        const args = src.slice(m.index + m[0].length, i - 1).replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g, '""');
        out.push({ line: src.slice(0, m.index).split("\n").length, args: args.replace(/\s+/g, " ").trim() });
    }
    return out;
}
const read = (p) => fs.readFileSync(path.join(H.ROOT, p), "utf8");

// Top-level arguments of a console call (commas inside (), [], {} do not split).
function topLevel(args) {
    const parts = []; let depth = 0, cur = "";
    for (const ch of args) {
        if ("([{".includes(ch)) depth++;
        if (")]}".includes(ch)) depth--;
        if (ch === "," && depth === 0) { parts.push(cur.trim()); cur = ""; } else cur += ch;
    }
    if (cur.trim()) parts.push(cur.trim());
    return parts;
}
// An argument that hands a raw value to the console: a bare identifier or
// member expression from the forbidden list, or JSON.stringify of one.
function rawArgs(file, names) {
    const member = new RegExp(`^(${names.join("|")})(\\.[A-Za-z_]+)*$`);
    return consoleArgs(read(file))
        .map(({ line, args }) => ({ line, raw: topLevel(args).filter((a) => member.test(a) || /^JSON\.stringify\(/.test(a)) }))
        .filter((x) => x.raw.length);
}

test("source: ai-chat.js passes no message, context, profile, memory, reply or raw provider data to console", () => {
    const bad = rawArgs("netlify/functions/ai-chat.js", ["message", "context", "responseText", "data", "reply", "errorText", "body", "safety", "memory", "localError", "error"]);
    assert.deepStrictEqual(bad, [], "sensitive console arguments: " + JSON.stringify(bad));
});

const BROWSER_AI_FILES = ["ai/js/ai-api.js", "ai/js/context-engine.js", "js/context-engine.js", "ai/js/ai-memory.js",
    "ai/js/ai-database.js", "ai/js/ai.js", "ai/js/knowledge-engine.js", "ai/product-engine.js", "admin/ai/js/ai-admin.js"];
const RAW_ERROR_NAMES = ["error", "authError", "memoryError", "safetyError", "profileError", "userError", "memorySaveError"];

test("source: browser AI scripts log no memory values, history, safety analysis, profile, quiz results or replies", () => {
    for (const file of BROWSER_AI_FILES) {
        const bad = rawArgs(file, ["memoryResult", "safetyResult", "data", "context", "value", "message", "errorText", "profile", "quizResults", "memories", "user", "session"]);
        assert.deepStrictEqual(bad, [], file + ": " + JSON.stringify(bad));
    }
});

test("source: no AI module hands a raw Supabase/Auth/JS error object to the console (only emrSafeError / errorCategory)", () => {
    for (const file of [...BROWSER_AI_FILES, "netlify/functions/ai-chat.js"]) {
        const bad = rawArgs(file, RAW_ERROR_NAMES);
        assert.deepStrictEqual(bad, [], file + ": " + JSON.stringify(bad));
        if (file !== "netlify/functions/ai-chat.js" && /emrSafeError\(/.test(read(file))) {
            assert.ok(/function emrSafeError\(error\)/.test(read(file)), file + " uses emrSafeError without defining it");
        }
    }
});

/* ---------------- Browser AI modules (vm, fake Supabase) ---------------- */

const vm = require("vm");
const B = {
    userId: "MARKER-BROWSER-USERID-61aa",
    email: "marker-browser-user-61aa@example.test",
    memory: "MARKER-BROWSER-MEMORY-61aa",
    message: "MARKER-BROWSER-MESSAGE-61aa",
    profile: "MARKER-BROWSER-PROFILE-61aa",
};
const BROWSER_PRIVATE = Object.values(B);
// A PostgREST-style error whose message/details/hint quote private row values.
const pgError = () => ({
    name: "PostgrestError", code: "23505",
    message: `duplicate key value for ${B.email}`,
    details: `Key (user_id, memory_key)=(${B.userId}, skinType) already exists. Failing row contains (${B.memory}, ${B.message}, ${B.profile}).`,
    hint: `retry for ${B.email}`,
});
const authError = () => ({ name: "AuthApiError", status: 401, code: "bad_jwt", message: `invalid session for ${B.email} (${B.userId})` });

function fakeSupabase({ user = { id: B.userId, email: B.email }, auth = null } = {}) {
    const result = () => ({ data: null, error: pgError() });
    const chain = new Proxy({}, {
        get(_, prop) {
            if (prop === "then") return (resolve) => resolve(result());
            return () => chain;
        }
    });
    return {
        auth: {
            getUser: async () => (auth ? { data: { user: null }, error: auth } : { data: { user }, error: null }),
            getSession: async () => ({ data: { session: null }, error: null }),
        },
        from: () => chain,
        rpc: () => chain,
    };
}
function loadBrowser(files, supabase) {
    const out = [];
    const capture = (...args) => out.push(args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" "));
    const ctx = { console: { log: capture, info: capture, warn: capture, error: capture, debug: capture }, setTimeout, clearTimeout, Promise, Date, JSON, Math, Object, Array, String, Number, Boolean, RegExp, Error, Map, Set, URL, encodeURIComponent };
    ctx.window = ctx; ctx.supabaseClient = supabase; ctx.document = { getElementById: () => null, querySelector: () => null, addEventListener() {} };
    ctx.addEventListener = () => {}; ctx.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
    vm.createContext(ctx);
    for (const f of files) vm.runInContext(read(f), ctx, { filename: f });
    return { ctx, logs: () => out.join("\n") };
}
const browserLeaks = (logs) => BROWSER_PRIVATE.filter((p) => logs.includes(p) || logs.toLowerCase().includes(p.toLowerCase()));

test("ai-memory.js: a failing save logs code 23505, never the user id, email, memory value or row details", async () => {
    const { ctx, logs } = loadBrowser(["ai/js/ai-memory.js"], fakeSupabase());
    const saved = await ctx.AIMemory.save("skinType", B.memory, 1);
    assert.strictEqual(saved, false, "the failed save must still report failure");
    assert.deepStrictEqual(browserLeaks(logs()), [], "private data in the console: " + logs());
    assert.ok(/AIMemory Save Error/.test(logs()) && /23505/.test(logs()), "operational error line missing");
});

test("ai-memory.js: an authentication error logs its category, not the email or user id", async () => {
    const { ctx, logs } = loadBrowser(["ai/js/ai-memory.js"], fakeSupabase({ auth: authError() }));
    const user = await ctx.AIMemory.getCurrentUser();
    assert.strictEqual(user, null);
    assert.deepStrictEqual(browserLeaks(logs()), [], logs());
    assert.ok(/AuthApiError/.test(logs()) && /401/.test(logs()), "auth error category missing");
});

test("ai-database.js: a failing message save logs the error code, never the message text or row", async () => {
    const { ctx, logs } = loadBrowser(["ai/js/ai-database.js"], fakeSupabase());
    await vm.runInContext(`saveMessage("user", ${JSON.stringify(B.message)})`, ctx);
    assert.deepStrictEqual(browserLeaks(logs()), [], logs());
    assert.ok(/23505/.test(logs()), "error code missing");
});

test("context-engine.js (both copies): failing profile/quiz/history/memory reads log codes only", async () => {
    for (const file of ["ai/js/context-engine.js", "js/context-engine.js"]) {
        const { ctx, logs } = loadBrowser([file], fakeSupabase());
        await ctx.ContextEngine.buildContext(B.userId);
        assert.deepStrictEqual(browserLeaks(logs()), [], file + ": " + logs());
        assert.ok(/23505/.test(logs()), file + ": error codes missing");
    }
});

test("context-engine.js: an authentication error does not leak the email or user id", async () => {
    const { ctx, logs } = loadBrowser(["ai/js/context-engine.js"], fakeSupabase({ auth: authError() }));
    await ctx.ContextEngine.buildContext();
    assert.deepStrictEqual(browserLeaks(logs()), [], logs());
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
