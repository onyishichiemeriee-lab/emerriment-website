/* =========================================
   03b comprehensive live security checks — local validation
   -----------------------------------------
   Runs supabase/audit/03b_comprehensive_live_security_checks.sql against the
   local production-schema copy (tests/db/production-sim.js, PGlite):
     * migrated database: every test passes;
     * independent check that nothing changed (all tables, admins);
     * the un-migrated live state: weaknesses are reported as FAIL;
     * ten deliberately introduced weaknesses, each on a fresh database:
       the matching test IDs FAIL, and a missing function is reported as
       an unexpected error, not as a successful refusal.
   No network, no Supabase.  Usage: node tests/db/security-03b.pglite.test.js
========================================= */
"use strict";

const assert = require("assert");
const S = require("./supabase-sim");
const P = require("./production-sim");

const SCRIPT = S.read("supabase/audit/03b_comprehensive_live_security_checks.sql");

const tests = [];
const test = (title, fn) => tests.push({ title, fn });

async function migrated() {
    const db = await P.createProductionDatabase();
    await P.applyProductionMigrations(db);
    await db.exec(S.read("supabase/backups/20261113_create_backup.sql"));
    return db;
}

async function run03b(db) {
    const results = await db.exec(SCRIPT);
    const rows = results[results.length - 1].rows;
    const summary = Object.fromEntries(rows.filter((r) => r.test_id === "SUMMARY").map((r) => [r.operation, r.actual]));
    const detail = rows.filter((r) => r.test_id !== "SUMMARY");
    return { rows, summary, detail, failed: detail.filter((r) => r.result === "FAIL") };
}

// Independent of the script's own RB-* checks.
async function fingerprint(db) {
    const tables = (await db.query("select relname from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r' order by 1")).rows.map((r) => r.relname);
    const out = {};
    for (const t of tables) {
        out[t] = (await db.query(`select count(*)::text || ':' || coalesce(md5(string_agg(x::text, '|' order by x::text)), '-') f from public.${t} x`)).rows[0].f;
    }
    out.__admins = (await db.query("select string_agg(id::text, ',' order by id) a from public.profiles where is_admin")).rows[0].a;
    out.__users = (await db.query("select count(*)::text c from auth.users")).rows[0].c;
    return out;
}

let cleanRun = null;

test("migrated production copy: every test passes, no skips, no unexpected errors", async () => {
    const db = await migrated();
    const before = await fingerprint(db);
    const r = await run03b(db);
    cleanRun = r;
    assert.deepStrictEqual(r.failed.map((f) => `${f.test_id}: ${f.actual} [${f.sqlstate}]`), []);
    assert.strictEqual(r.summary.OVERALL, "PASS");
    assert.strictEqual(r.summary["Unexpected errors"], "0");
    assert.strictEqual(r.summary["Skipped (optional)"], "0");
    assert(Number(r.summary["Total tests"]) >= 300, "total " + r.summary["Total tests"]);
    assert.deepStrictEqual(await fingerprint(db), before, "data changed");
    await db.close();
});

test("every category is covered and every expected refusal is a real 42501 or a filtered 0-row write", async () => {
    const r = cleanRun;
    const cats = new Set(r.detail.map((d) => d.category));
    for (const c of ["identity", "cross-user", "admin protection", "leads", "ai", "public content", "cms", "permissions", "rollback", "setup"]) {
        assert(cats.has(c), "missing category " + c);
    }
    for (const actor of ["anon", "user A", "user B", "admin", "service"]) {
        assert(r.detail.some((d) => d.actor === actor), "missing actor " + actor);
    }
    // Cross-user: 10 tables x 8 checks x 2 directions + profiles 6 x 2.
    assert.strictEqual(r.detail.filter((d) => /^ISO-/.test(d.test_id)).length, 172);
    for (const d of r.detail.filter((x) => x.result === "PASS" && x.sqlstate && x.sqlstate !== "00000")) {
        assert.strictEqual(d.sqlstate, "42501", `${d.test_id} passed with ${d.sqlstate}`);
    }
    // "0 rows affected" may only count as a refusal for UPDATE/DELETE (a
    // successful TRUNCATE or function call also reports 0 rows).
    for (const d of r.detail.filter((x) => x.result === "PASS" && x.actual === "affected 0 rows")) {
        assert(/UPDATE|DELETE|publish/i.test(d.operation), `${d.test_id} (${d.operation}) passed on 0 rows`);
    }
    for (const d of r.detail.filter((x) => /^(INSERT|TRUNCATE|EXECUTE|emerriment_set_admin)/.test(x.operation) && x.expected === "42501")) {
        assert.strictEqual(d.sqlstate, "42501", d.test_id);
    }
    // Guards are matched by message, not just SQLSTATE.
    for (const id of ["ADM-1-2", "ADM-1-3", "ADM-1-5", "ADM-A-2"]) {
        const d = r.detail.find((x) => x.test_id === id);
        assert(d && d.result === "PASS" && /administrator/.test(d.actual), id);
    }
});

test("running the script twice gives the same result and leaves the data unchanged", async () => {
    const db = await migrated();
    const before = await fingerprint(db);
    const r1 = await run03b(db);
    const r2 = await run03b(db);
    assert.strictEqual(r1.summary.OVERALL, "PASS");
    assert.strictEqual(r2.summary.OVERALL, "PASS");
    assert.strictEqual(r1.summary["Total tests"], r2.summary["Total tests"]);
    assert.deepStrictEqual(await fingerprint(db), before);
    await db.close();
});

test("un-migrated live state: the known weaknesses FAIL (and missing functions are unexpected errors)", async () => {
    const db = await P.createProductionDatabase();
    const before = await fingerprint(db);
    const r = await run03b(db);
    const failed = new Set(r.failed.map((f) => f.test_id));
    for (const id of ["LEAD-01", "ADM-1-1", "AI-inject-1", "PRM-truncate-leads-anon", "PUB-anon-4", "AI-ai_events-anon"]) {
        assert(failed.has(id), "not detected: " + id);
    }
    const setAdmin = r.failed.find((f) => f.test_id === "ADM-1-2");
    assert(setAdmin && setAdmin.sqlstate === "42883", "missing function must be an unexpected error, got " + (setAdmin && setAdmin.sqlstate));
    assert.strictEqual(r.summary.OVERALL, "FAIL");
    assert(Number(r.summary["Unexpected errors"]) > 0);
    assert.deepStrictEqual(await fingerprint(db), before, "the run changed data on the un-migrated database");
    await db.close();
});

const MUTATIONS = [
    ["leads readable by visitors", "drop policy emerriment_leads_restrict_select on public.leads; grant select on public.leads to anon;", ["LEAD-01"]],
    ["self-promotion possible", "grant update (is_admin) on public.profiles to authenticated; alter table public.profiles disable trigger emerriment_guard_profile_privileges;", ["ADM-1-1", "ADM-2-1"]],
    ["AI message injection", "drop policy emerriment_ai_messages_restrict_conversation_insert on public.ai_messages;", ["AI-inject-1", "AI-inject-2"]],
    ["cross-user read of AI memory", "drop policy emerriment_ai_memory_restrict_select on public.ai_memory; create policy leak on public.ai_memory for select to authenticated using (true);", ["ISO-ai_memory-1-2", "ISO-ai_memory-2-3"]],
    ["visitors may TRUNCATE leads", "grant truncate on public.leads to anon;", ["LEAD-05", "PRM-truncate-leads-anon"]],
    ["drafts exposed", "create policy leak on public.encyclopedia_articles for select to anon using (true);", ["PUB-anon-2", "PUB-anon-3"]],
    ["admin function missing", "drop function public.emerriment_set_admin(uuid, boolean);", ["ADM-1-2", "ADM-A-1"]],
    ["public rating summary broken", "revoke execute on function public.emerriment_article_rating_summary(uuid) from anon;", ["PUB-anon-8"]],
    ["forged ownership on insert", "drop policy emerriment_quiz_results_restrict_insert on public.quiz_results; create policy leak on public.quiz_results for insert to authenticated with check (true);", ["ISO-quiz_results-1-6", "ISO-quiz_results-2-6"]],
    ["last-admin protection removed", "alter table public.profiles disable trigger emerriment_guard_profile_privileges;", ["ADM-A-2"]]
];

for (const [name, sql, mustFail] of MUTATIONS) {
    test(`detects a deliberately introduced weakness: ${name}`, async () => {
        const db = await migrated();
        await db.exec(sql);
        const before = await fingerprint(db);
        const r = await run03b(db);
        const failed = new Set(r.failed.map((f) => f.test_id));
        for (const id of mustFail) {
            assert(failed.has(id), `${id} did not fail (failed: ${[...failed].join(", ") || "none"})`);
        }
        assert.strictEqual(r.summary.OVERALL, "FAIL");
        if (name === "admin function missing") {
            assert.strictEqual(r.failed.find((f) => f.test_id === "ADM-1-2").sqlstate, "42883");
        }
        assert.deepStrictEqual(await fingerprint(db), before, "a successful attack was not rolled back");
        await db.close();
    });
}


/* ---------------- Runner ---------------- */

async function run() {
    let pass = 0;
    let fail = 0;
    const started = Date.now();
    for (const t of tests) {
        try {
            await t.fn();
            pass++;
            console.log("  ✅ " + t.title);
        } catch (error) {
            fail++;
            console.log("  ❌ " + t.title + "\n     " + (error && error.message));
        }
    }
    if (cleanRun) {
        const s = cleanRun.summary;
        console.log(`\n03b on the migrated copy: total ${s["Total tests"]}, passed ${s.Passed}, failed ${s.Failed}, skipped ${s["Skipped (optional)"]}, unexpected ${s["Unexpected errors"]}, overall ${s.OVERALL}`);
        const byCat = {};
        for (const d of cleanRun.detail.filter((x) => x.result !== "INFO")) byCat[d.category] = (byCat[d.category] || 0) + 1;
        console.log("by category: " + Object.entries(byCat).map(([k, v]) => `${k} ${v}`).join(", "));
    }
    console.log(`\n03b validation (PGlite): ${pass} passed, ${fail} failed in ${Math.round((Date.now() - started) / 1000)}s`);
    return { pass, fail };
}

module.exports = { run, tests };

if (require.main === module) {
    run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
