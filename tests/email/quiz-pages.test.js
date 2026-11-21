/* Tests for saveQuizResult() in every quiz.html implementation:
   js/quiz.js (quiz.html), skinquiz/js/quiz.js, encyclopediaCMS/js/quiz.js,
   article/js/quiz.js. These pages save the lead (and, for signed-in users,
   the quiz result). js/quiz.js (the live quiz.html) also requests the
   visitor's report email since 2026-11-17 (the page asks for the address
   "to email you a copy"); the legacy copies still send none. */
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const H = require("./helpers");

const suite = H.createSuite("quiz.html pages");
const { test } = suite;

function extract(file) {
    const src = fs.readFileSync(path.join(H.ROOT, file), "utf8");
    const start = src.indexOf("async function saveQuizResult(");
    assert(start >= 0, file + ": saveQuizResult not found");
    let depth = 0;
    for (let i = src.indexOf("{", src.indexOf(")", start)); i < src.length; i++) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}" && --depth === 0) return src.slice(start, i + 1);
    }
    throw new Error("unbalanced");
}

function setup(file, { user = null, leadError = null, consent = undefined } = {}) {
    const calls = { inserts: [], upserts: 0, selects: 0, fetches: 0, requests: [] };
    const chain = (table, kind, rows) => {
        const result = { data: null, error: table === "leads" ? leadError : null };
        const p = Promise.resolve(result);
        p.select = () => {
            if (table === "leads") calls.selects++;
            const q = Promise.resolve(result);
            q.single = () => Promise.resolve(result);
            q.maybeSingle = () => Promise.resolve(result);
            return q;
        };
        return p;
    };
    const supabaseClient = {
        auth: { getUser: async () => ({ data: { user }, error: null }) },
        from(table) {
            return {
                insert(rows) { calls.inserts.push({ table, rows }); return chain(table, "insert", rows); },
                upsert(rows) { calls.upserts++; calls.inserts.push({ table, rows }); return chain(table, "upsert", rows); }
            };
        }
    };
    const context = {
        supabaseClient,
        supabase: { createClient() {} },
        fetch: async (url, opts) => { calls.fetches++; calls.requests.push({ url, body: JSON.parse(opts.body) }); return { ok: true }; },
        console: { log() {}, error() {}, warn() {} },
        quizData: { name: "Ada", email: "ada@example.com", skinType: "Oily", concern: "Acne",
            oilLevel: "High", sensitivity: "Low", score: 72, recommendation: "Hydrate." },
        Promise, JSON, Date
    };
    vm.createContext(context);
    vm.runInContext(extract(file) + "\nthis.saveQuizResult = saveQuizResult;", context);
    const data = { name: "Ada", email: "ada@example.com", skin_type: "Oily", concern: "Acne", oil_level: "High", sensitivity: "Low" };
    if (consent !== undefined) data.marketing_consent = consent;
    return { run: () => context.saveQuizResult(data, 72, "Hydrate."), calls };
}

const FILES = ["js/quiz.js", "skinquiz/js/quiz.js", "encyclopediaCMS/js/quiz.js", "article/js/quiz.js"];

for (const file of FILES) {

    test(`[${file}] anonymous visitor: lead inserted, never read back, no upsert${file === "js/quiz.js" ? ", one report email request" : ", no email"}`, async () => {
        const s = setup(file);
        const result = await s.run();
        const leads = s.calls.inserts.filter((i) => i.table === "leads");
        assert.strictEqual(leads.length, 1);
        assert.strictEqual(s.calls.selects, 0, "lead read back (needs anonymous SELECT on leads)");
        assert.strictEqual(s.calls.upserts, 0, "upsert needs UPDATE permission on leads");
        if (file === "js/quiz.js") {
            assert.strictEqual(s.calls.fetches, 1, "exactly one report request");
            assert.strictEqual(s.calls.requests[0].url, "/.netlify/functions/send-email");
            assert.deepStrictEqual(Object.keys(s.calls.requests[0].body).sort(),
                ["concern", "email", "name", "oilLevel", "recommendation", "score", "sensitivity", "skinType"]);
            assert.strictEqual(result.reportEmailSent, true);
        } else {
            assert.strictEqual(s.calls.fetches, 0, "legacy copy sends no email");
        }
        assert.strictEqual(leads[0].rows.email, "ada@example.com");
        if (file !== "article/js/quiz.js") assert.strictEqual(result.success, true);
    });

    test(`[${file}] lead save error is reported, not swallowed`, async () => {
        const s = setup(file, { leadError: { message: "denied" } });
        if (file === "article/js/quiz.js") {
            await assert.rejects(s.run());
        } else {
            const result = await s.run();
            assert.strictEqual(result.success, false);
        }
    });
}

for (const file of ["js/quiz.js", "skinquiz/js/quiz.js"]) {
    test(`[${file}] signed-in user: quiz result saved with their own user id`, async () => {
        const s = setup(file, { user: { id: "user-5" } });
        const result = await s.run();
        const quiz = s.calls.inserts.find((i) => i.table === "quiz_results");
        assert(quiz, "quiz_results inserted");
        assert.strictEqual(quiz.rows.user_id, "user-5");
        assert.strictEqual(result.quizResultSaved, true);
    });
}

test("[js/quiz.js] no opt-in: lead carries no consent fields (database default = no lessons)", async () => {
    const s = setup("js/quiz.js", { consent: false });
    await s.run();
    const row = s.calls.inserts.find((i) => i.table === "leads").rows;
    assert(!("marketing_consent" in row) && !("marketing_consent_source" in row));
});

test("[js/quiz.js] ticked box: a REQUEST only (source quiz_page + wording version), never consent itself", async () => {
    const s = setup("js/quiz.js", { consent: true });
    await s.run();
    const row = s.calls.inserts.find((i) => i.table === "leads").rows;
    assert(!("marketing_consent" in row), "double opt-in: the browser never sends consent itself");
    assert.strictEqual(row.marketing_consent_source, "quiz_page");
    assert.strictEqual(row.marketing_consent_version, "quiz-optin-2026-11-17");
    assert(!("marketing_consent_at" in row), "the timestamp is set by the database");
});

test("[js/quiz.js] lead save fails: no report email is requested", async () => {
    const s = setup("js/quiz.js", { leadError: { message: "denied" } });
    await s.run();
    assert.strictEqual(s.calls.fetches, 0);
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
