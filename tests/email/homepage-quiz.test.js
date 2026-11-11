/* Tests for submitQuiz() — the homepage-style quiz caller — in every copy:
   js/script.js (index.html), article/js/script.js (article/index.html),
   encyclopediaCMS/js/script.js (encyclopediaCMS/index.html) and the
   login-required variant skinquiz/js/script.js (skinquiz/index.html).
   Each function is extracted from the real file and run against a fake
   page, a fake Supabase client and a fake fetch. */
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const H = require("./helpers");

const suite = H.createSuite("homepage quiz caller");
const { test } = suite;

function extractSubmitQuiz(file = "js/script.js") {
    const src = fs.readFileSync(path.join(H.ROOT, file), "utf8");
    const start = src.indexOf("async function submitQuiz() {");
    assert(start >= 0, "submitQuiz not found");
    let depth = 0;
    for (let i = src.indexOf("{", start); i < src.length; i++) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}" && --depth === 0) return src.slice(start, i + 1);
    }
    throw new Error("unbalanced submitQuiz");
}

function element(id, value = "") {
    return { id, value, innerHTML: "", innerText: "", style: { display: "" }, scrollIntoView() { this.scrolled = true; } };
}

function setup({ file = "js/script.js", insertError = null, fetchResult = { ok: true }, fetchThrows = false, user = null, profileError = null } = {}) {
    const els = {
        loading: element("loading"), analysisText: element("analysisText"), results: element("results"),
        recommendedProducts: element("recommendedProducts"), productRecommendations: element("productRecommendations"),
        name: element("name", "Ada"), email: element("email", "ada@example.com"), skinType: element("skinType", "Oily"),
        concern: element("concern", "Acne"), oilLevel: element("oilLevel", "High"), sensitivity: element("sensitivity", "Low")
    };
    const calls = { inserts: [], updates: [], fetches: [], alerts: [], selectAfterInsert: false, getUser: 0 };
    const supabaseClient = {
        auth: { getUser: async () => { calls.getUser++; return { data: { user } }; } },
        from(table) {
            return {
                insert(rows) {
                    calls.inserts.push({ table, rows });
                    const result = { data: null, error: table === "leads" ? insertError : null };
                    const p = Promise.resolve(result);
                    p.select = () => { calls.selectAfterInsert = true; return Promise.resolve(result); };
                    return p;
                },
                update(changes) {
                    const entry = { table, changes };
                    calls.updates.push(entry);
                    return { eq: async (c, v) => { entry.eq = [c, v]; return { error: table === "profiles" ? profileError : null }; } };
                }
            };
        }
    };
    const context = {
        document: { getElementById: (id) => els[id] || null },
        supabaseClient,
        // The real page also defines window.supabase (the library). It must not be used.
        supabase: { createClient() {} },
        fetch: async (url, opts) => {
            calls.fetches.push({ url, opts });
            if (fetchThrows) throw new Error("network down");
            return fetchResult;
        },
        alert: (m) => calls.alerts.push(m),
        setTimeout: (f) => { f(); return 0; },
        console: { log() {}, error() {}, warn() {} },
        Promise, JSON, Date
    };
    vm.createContext(context);
    vm.runInContext(extractSubmitQuiz(file) + "\nthis.submitQuiz = submitQuiz;", context);
    return { run: () => context.submitQuiz(), els, calls };
}

// Copies that support anonymous visitors (same intended behaviour).
for (const file of ["js/script.js", "article/js/script.js", "encyclopediaCMS/js/script.js"]) {

const t = (title, fn) => test(`[${file}] ${title}`, fn);
const setup0 = setup;
// eslint-disable-next-line no-shadow
const setupFor = (opts = {}) => setup0({ file, ...opts });

t("anonymous visitor, email sent: success message, loading hidden, results kept", async () => {
    const s = setupFor();
    await s.run();
    assert.strictEqual(s.calls.inserts.length, 1);
    assert.strictEqual(s.calls.inserts[0].table, "leads");
    assert.strictEqual(s.calls.fetches.length, 1);
    assert.strictEqual(s.calls.fetches[0].url, "/.netlify/functions/send-email");
    assert.deepStrictEqual(Object.keys(JSON.parse(s.calls.fetches[0].opts.body)).sort(),
        ["concern", "email", "name", "oilLevel", "recommendation", "score", "sensitivity", "skinType"]);
    assert.deepStrictEqual(s.calls.alerts, ["🎉 Your skin report has been generated and sent to your email."]);
    assert.strictEqual(s.els.loading.style.display, "none");
    assert(s.els.results.innerHTML.includes("EMerriment Skin Analysis"), "results rendered");
    assert(s.els.results.scrolled);
    assert.strictEqual(s.calls.updates.length, 0, "anonymous: no profile update, no client lead update");
});

t("lead row is not read back and not updated by the browser", async () => {
    const s = setupFor();
    await s.run();
    assert.strictEqual(s.calls.selectAfterInsert, false);
    assert(!s.calls.updates.some((u) => u.table === "leads"));
});

t("email fails (502): quiz kept, clear message, loading hidden", async () => {
    const s = setupFor({ fetchResult: { ok: false, status: 502 } });
    await s.run();
    assert.deepStrictEqual(s.calls.alerts, ["Your quiz results are saved and shown below, but we couldn't send your email right now."]);
    assert.strictEqual(s.els.loading.style.display, "none");
    assert(s.els.results.innerHTML.includes("EMerriment Skin Analysis"));
});

t("email request throws (offline): same safe outcome", async () => {
    const s = setupFor({ fetchThrows: true });
    await s.run();
    assert.strictEqual(s.calls.alerts.length, 1);
    assert(s.calls.alerts[0].includes("couldn't send your email"));
    assert.strictEqual(s.els.loading.style.display, "none");
});

t("quiz could not be saved: error message, no email request, loading hidden", async () => {
    const s = setupFor({ insertError: { message: "denied" } });
    await s.run();
    assert.deepStrictEqual(s.calls.alerts, ["Unable to save your quiz. Please try again."]);
    assert.strictEqual(s.calls.fetches.length, 0);
    assert.strictEqual(s.els.loading.style.display, "none");
});

t("logged-in user: profile updated and quiz_results saved with the existing client (bug at old line 9852 fixed)", async () => {
    const s = setupFor({ user: { id: "user-1" } });
    await s.run();
    const profile = s.calls.updates.find((u) => u.table === "profiles");
    assert(profile, "profile updated");
    assert.deepStrictEqual(profile.eq, ["id", "user-1"]);
    assert.strictEqual(profile.changes.current_skin_type, "Oily");
    const quiz = s.calls.inserts.find((i) => i.table === "quiz_results");
    assert(quiz, "quiz_results saved");
    assert.strictEqual(quiz.rows.user_id, "user-1");
    assert.strictEqual(s.els.loading.style.display, "none");
});

t("logged-in user with a profile error: still finishes and shows the result", async () => {
    const s = setupFor({ user: { id: "user-1" }, profileError: { message: "x" } });
    await s.run();
    assert.strictEqual(s.calls.alerts.length, 1);
    assert.strictEqual(s.els.loading.style.display, "none");
});

}

/* ---------- skinquiz/: login-required variant (intended behaviour kept) ---------- */

const SKIN = "skinquiz/js/script.js";

test(`[${SKIN}] anonymous visitor is asked to log in; nothing saved or sent (previously crashed)`, async () => {
    const s = setup({ file: SKIN });
    await s.run();
    assert.deepStrictEqual(s.calls.alerts, ["Please log in before submitting your skin quiz."]);
    assert.strictEqual(s.calls.inserts.length, 0);
    assert.strictEqual(s.calls.fetches.length, 0);
    assert.strictEqual(s.els.loading.style.display, "none");
});

test(`[${SKIN}] logged-in user: lead saved, email requested, profile + quiz_results saved, loading hidden`, async () => {
    const s = setup({ file: SKIN, user: { id: "user-9" } });
    await s.run();
    assert.strictEqual(s.calls.inserts.filter((i) => i.table === "leads").length, 1);
    assert.strictEqual(s.calls.selectAfterInsert, false, "lead not read back");
    assert.strictEqual(s.calls.fetches.length, 1);
    assert.deepStrictEqual(Object.keys(JSON.parse(s.calls.fetches[0].opts.body)).sort(),
        ["concern", "email", "name", "oilLevel", "recommendation", "score", "sensitivity", "skinType"]);
    assert.deepStrictEqual(s.calls.updates.find((u) => u.table === "profiles").eq, ["id", "user-9"]);
    assert.strictEqual(s.calls.inserts.find((i) => i.table === "quiz_results").rows.user_id, "user-9");
    assert(!s.calls.updates.some((u) => u.table === "leads"), "no browser lead update");
    assert.deepStrictEqual(s.calls.alerts, ["🎉 Your skin report has been generated and sent to your email."]);
    assert.strictEqual(s.els.loading.style.display, "none");
});

test(`[${SKIN}] logged-in user, email fails: results kept, clear message, loading hidden`, async () => {
    const s = setup({ file: SKIN, user: { id: "user-9" }, fetchThrows: true });
    await s.run();
    assert.deepStrictEqual(s.calls.alerts, ["Your quiz results are saved and shown below, but we couldn't send your email right now."]);
    assert.strictEqual(s.els.loading.style.display, "none");
    assert(s.calls.inserts.some((i) => i.table === "quiz_results"), "quiz result still saved");
});

test(`[${SKIN}] lead save error: message, no email, loading hidden`, async () => {
    const s = setup({ file: SKIN, user: { id: "user-9" }, insertError: { message: "denied" } });
    await s.run();
    assert.deepStrictEqual(s.calls.alerts, ["Unable to save your quiz. Please try again."]);
    assert.strictEqual(s.calls.fetches.length, 0);
    assert.strictEqual(s.els.loading.style.display, "none");
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
