/* AI assistant page (ai/index.html) in jsdom: guest and signed-in states.
   Regression tests for the WP4B preview finding "logged-out visitors see
   permanent Loading... placeholders". The assistant is free for guests, so
   the profile card must always reach a final state and chat must keep
   working when profile, memory, context or history saving fail.
   The /.netlify/functions/ai-chat call is answered by a fake (mock mode);
   no network, synthetic data only. */
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const H = require("../email/helpers");
const { load, USER } = require("./dom-harness");

const suite = H.createSuite("AI assistant page: guest and signed-in states (jsdom)");
const { test } = suite;

const FIELDS = ["skinType", "skinConcern", "skinSensitivity", "skinScore"];

function fakeFetch(w, reply = { success: true, reply: "A gentle cleanser is mild.", mode: "mock", memoryAction: null }) {
    w.__aiRequests = [];
    w.fetch = async (url, init) => {
        w.__aiRequests.push({ url: String(url), body: init && init.body ? String(init.body) : "" });
        return { ok: true, status: 200, json: async () => reply };
    };
}

async function open(opts = {}) {
    const p = await load("ai/index.html", { ...opts, before: (w) => { fakeFetch(w); if (opts.before) opts.before(w); } });
    if (p.window.EMAIProfileReady) await p.window.EMAIProfileReady;
    await p.settle(50);
    const text = (id) => p.document.getElementById(id).textContent.trim();
    return { ...p, text };
}

async function chat(p, message = "What is a gentle cleanser?") {
    const input = p.document.getElementById("messageInput");
    input.value = message;
    p.document.getElementById("sendButton").click();
    await p.settle(400);
    return input;
}

const trackTables = () => (w) => {
    w.__tablesSeen = [];
    const inner = w.__fakeFrom;
    w.__fakeFrom = (t) => { w.__tablesSeen.push(t); return inner(t); };
};

test("guest: no field is left on 'Loading...'; a sign-in / quiz hint is shown", async () => {
    const p = await open({ signedIn: false, before: trackTables() });
    for (const id of FIELDS) assert(!/loading/i.test(p.text(id)), id + " still loading: " + p.text(id));
    const card = p.document.querySelector(".profile-card");
    assert.strictEqual(card.dataset.state, "guest");
    assert.strictEqual(card.getAttribute("aria-busy"), "false");
    const hint = p.document.getElementById("profileHint");
    assert(hint && !hint.hidden && /chatting as a guest/.test(hint.textContent));
    assert(hint.querySelector('a[href="../login.html"]') && hint.querySelector('a[href="../quiz.html"]'));
    assert(!p.window.__tablesSeen.includes("profiles") && !p.window.__tablesSeen.includes("quiz_results"), "private tables queried for a guest");
    assert.deepStrictEqual(p.events.errors, []);
    p.window.close();
});

test("guest: chat works in mock mode and the input is re-enabled", async () => {
    const p = await open({ signedIn: false });
    const input = await chat(p);
    assert.strictEqual(p.window.__aiRequests.length, 1);
    assert(/\/\.netlify\/functions\/ai-chat$/.test(new URL(p.window.__aiRequests[0].url, "https://local.test/").pathname));
    assert(p.document.body.textContent.includes("A gentle cleanser is mild."), "reply not shown");
    assert.strictEqual(input.disabled, false);
    assert.strictEqual(p.document.getElementById("sendButton").disabled, false);
    assert(!p.window.__aiRequests[0].body.includes(USER.id), "guest request carries a user id");
    p.window.close();
});

test("signed in: all four fields come from the user's own profile and latest quiz", async () => {
    const p = await open({ rows: {
        profiles: [{ id: USER.id, current_skin_type: "Oily", current_concern: "Acne", current_skin_score: 72 }],
        quiz_results: [{ user_id: USER.id, skin_type: "Combination", concern: "Dark spots", sensitivity: "High", score: 65 }]
    } });
    assert.strictEqual(p.text("skinType"), "Combination");
    assert.strictEqual(p.text("skinConcern"), "Dark spots");
    assert.strictEqual(p.text("skinSensitivity"), "High");
    assert.strictEqual(p.text("skinScore"), "72");
    assert.strictEqual(p.document.querySelector(".profile-card").dataset.state, "signed-in");
    const hint = p.document.getElementById("profileHint");
    assert(!hint || hint.hidden, "hint shown to a user with a profile");
    // Personal values are shown on the page but never logged.
    const out = p.events.console.join("\n");
    for (const v of ["Combination", "Dark spots", USER.email]) assert(!out.includes(v), "console contains " + v);
    p.window.close();
});

test("signed in without a quiz: profile columns are used, missing values say 'Not set'", async () => {
    const p = await open({ rows: { profiles: [{ id: USER.id, current_skin_type: "Dry", current_concern: null, current_skin_score: 0 }], quiz_results: [] } });
    assert.strictEqual(p.text("skinType"), "Dry");
    assert.strictEqual(p.text("skinConcern"), "Not set");
    assert.strictEqual(p.text("skinSensitivity"), "Not set");
    assert.strictEqual(p.text("skinScore"), "--");
    p.window.close();
});

test("signed in, brand-new user: 'take the skin quiz' hint instead of empty fields", async () => {
    const p = await open({ rows: { profiles: [{ id: USER.id }], quiz_results: [] } });
    for (const id of FIELDS) assert(!/loading/i.test(p.text(id)));
    const hint = p.document.getElementById("profileHint");
    assert(hint && !hint.hidden && /No skin profile yet/.test(hint.textContent));
    p.window.close();
});

test("signed in, profile and quiz both fail: 'Not available', logged as categories, chat still works", async () => {
    const err = Object.assign(new Error("row for marker-person@example.test"), { name: "PostgrestError", code: "PGRST301" });
    const p = await open({ rows: { profiles: err, quiz_results: err } });
    assert.strictEqual(p.text("skinType"), "Not available");
    assert.strictEqual(p.document.querySelector(".profile-card").dataset.state, "unavailable");
    assert(!p.events.console.join("\n").includes("marker-person@example.test"), "raw error logged");
    const input = await chat(p);
    assert(p.document.body.textContent.includes("A gentle cleanser is mild."));
    assert.strictEqual(input.disabled, false);
    p.window.close();
});

test("signed in: memory, context and history-saving failures do not block the reply", async () => {
    const p = await open({ rows: { profiles: [{ id: USER.id, current_skin_type: "Oily" }], quiz_results: [] } });
    p.window.AIMemory = { processMessage: async () => { throw new Error("memory down"); } };
    p.window.ContextEngine = { buildContext: async () => { throw new Error("context down"); } };
    p.window.saveMessage = async () => { throw new Error("history down"); };
    const input = await chat(p);
    assert(p.document.body.textContent.includes("A gentle cleanser is mild."), "reply blocked");
    assert.strictEqual(input.disabled, false, "input left disabled");
    assert(!p.document.body.textContent.includes("couldn't process that"), "error shown although the reply arrived");
    p.window.close();
});

test("Supabase library missing: profile card says 'Not available', no uncaught error", async () => {
    const p = await open({ supabaseLoads: false });
    for (const id of FIELDS) assert(!/loading/i.test(p.text(id)));
    assert.strictEqual(p.document.querySelector(".profile-card").dataset.state, "unavailable");
    assert(!p.events.errors.some((e) => /uncaught/.test(e)), p.events.errors.join("; "));
    p.window.close();
});

test("source: profile values use textContent; the production-only OpenAI guard is unchanged", () => {
    const src = fs.readFileSync(path.join(H.ROOT, "ai/js/ai.js"), "utf8");
    const block = src.slice(src.indexOf("function setProfileCard"), src.indexOf("async function loadUserSkinProfile"));
    assert(!/innerHTML/.test(block), "profile card uses innerHTML");
    const fn = fs.readFileSync(path.join(H.ROOT, "netlify/functions/ai-chat.js"), "utf8");
    assert(/openAiAllowed/.test(fn) && /getOpenAiKey/.test(fn), "OpenAI guard missing from ai-chat.js");
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
