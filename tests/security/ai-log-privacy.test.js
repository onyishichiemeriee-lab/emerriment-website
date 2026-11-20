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

test("source: browser AI scripts log no memory values, history, safety analysis, profile, quiz results or replies", () => {
    for (const file of ["ai/js/ai-api.js", "ai/js/context-engine.js", "js/context-engine.js"]) {
        const bad = rawArgs(file, ["memoryResult", "safetyResult", "data", "context", "value", "message", "errorText", "profile", "quizResults", "memories"]);
        assert.deepStrictEqual(bad, [], file + ": " + JSON.stringify(bad));
    }
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
