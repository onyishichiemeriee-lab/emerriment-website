/* =========================================
   EMerriment — article view counter (WP4G)
   -----------------------------------------
   Focused checks of public.emerriment_increment_article_views(uuid) on the
   PRODUCTION-SHAPED database (tests/db/production-sim.js) after all
   migrations, through the same role switch + JWT claims PostgREST uses.

   The function comes from migration 20261113090000 §4 (published-only,
   atomic). The 2026-11-21 read-only audit found exactly this definition on
   production AND staging (md5 of the whitespace-normalised source:
   76249a959083ee57ffb97553231959d3); this suite checks the repository
   definition still produces that fingerprint.

   Concurrency: PGlite is a single connection, so "parallel" calls are
   queued and executed one after another. The concurrency test below proves
   that queued calls do not lose increments and that the function is one
   atomic UPDATE (which PostgreSQL row-locks); it is NOT a multi-session
   race test. True concurrent-session testing remains unperformed.

   Usage: node tests/db/article-counter.pglite.test.js   (part of npm run test:db)
========================================= */
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const S = require("./supabase-sim");
const P = require("./production-sim");

const { as, tryAs, scalar } = S;
const { ID } = P;
const USER_A = { user: ID.userA };
const LIVE_SOURCE_MD5 = "76249a959083ee57ffb97553231959d3";
const MISSING = "00000000-0000-4000-8000-00000000dead";
const FN = "public.emerriment_increment_article_views(uuid)";

const tests = [];
const test = (title, fn) => tests.push({ title, fn });
const n = async (db, sql) => Number(await scalar(db, sql));
const views = (db, id) => n(db, `select coalesce(views, 0) from public.encyclopedia_articles where id = '${id}'`);
const totalViews = (db) => n(db, "select coalesce(sum(coalesce(views, 0)), 0) from public.encyclopedia_articles");
const call = async (db, who, arg) => (await as(db, who, `select public.emerriment_increment_article_views(${arg}) as v`)).rows[0].v;

let db;

test("setup: production-shaped database with all migrations applied", async () => {
    db = await P.createProductionDatabase();
    await P.applyProductionMigrations(db);
    assert.strictEqual(await n(db, `select count(*) from public.encyclopedia_articles where id = '${ID.published}' and status = 'published'`), 1);
    assert.strictEqual(await n(db, `select count(*) from public.encyclopedia_articles where id = '${ID.draft}' and status <> 'published'`), 1);
});

/* ---------- behaviour ---------- */

test("published article: one call adds exactly 1 and returns the new count", async () => {
    const before = await views(db, ID.published);
    const returned = await call(db, "anon", `'${ID.published}'`);
    assert.strictEqual(returned, before + 1);
    assert.strictEqual(await views(db, ID.published), before + 1);
});

test("draft article: returns NULL and its count does not change", async () => {
    const before = await views(db, ID.draft);
    assert.strictEqual(await call(db, "anon", `'${ID.draft}'`), null);
    assert.strictEqual(await call(db, USER_A, `'${ID.draft}'`), null);
    assert.strictEqual(await views(db, ID.draft), before);
});

test("nonexistent UUID: returns NULL and no article count changes", async () => {
    const before = await totalViews(db);
    assert.strictEqual(await call(db, "anon", `'${MISSING}'`), null);
    assert.strictEqual(await totalViews(db), before);
});

test("NULL id: returns NULL safely and no article count changes", async () => {
    const before = await totalViews(db);
    assert.strictEqual(await call(db, "anon", "null"), null);
    assert.strictEqual(await call(db, USER_A, "null::uuid"), null);
    assert.strictEqual(await totalViews(db), before);
});

test("malformed id is rejected by the uuid type before the function runs (no change)", async () => {
    const before = await totalViews(db);
    const r = await tryAs(db, "anon", "select public.emerriment_increment_article_views('not-a-uuid')");
    assert(!r.ok && r.error.code === "22P02", "expected invalid_text_representation, got " + (r.ok ? "success" : r.error.code));
    assert.strictEqual(await totalViews(db), before);
});

test("repeated calls: each call adds exactly 1, returned values are consecutive", async () => {
    const before = await views(db, ID.published);
    const returned = [];
    for (let i = 0; i < 5; i++) returned.push(await call(db, "anon", `'${ID.published}'`));
    assert.deepStrictEqual(returned, [1, 2, 3, 4, 5].map((k) => before + k));
    assert.strictEqual(await views(db, ID.published), before + 5);
});

test("queued 'concurrent' calls (single PGlite connection) lose no increment", async () => {
    const before = await views(db, ID.published);
    const calls = 25;
    const results = await Promise.all(Array.from({ length: calls }, (_, i) =>
        call(db, i % 2 ? "anon" : USER_A, `'${ID.published}'`)));
    assert.strictEqual(await views(db, ID.published), before + calls);
    assert.deepStrictEqual([...results].sort((a, b) => a - b), Array.from({ length: calls }, (_, i) => before + i + 1));
});

/* ---------- permissions ---------- */

test("anon may execute the function", async () => {
    assert.strictEqual(await scalar(db, `select has_function_privilege('anon', '${FN}', 'EXECUTE')`), true);
    assert.strictEqual(typeof await call(db, "anon", `'${ID.published}'`), "number");
});

test("authenticated may execute the function", async () => {
    assert.strictEqual(await scalar(db, `select has_function_privilege('authenticated', '${FN}', 'EXECUTE')`), true);
    assert.strictEqual(typeof await call(db, USER_A, `'${ID.published}'`), "number");
});

test("PUBLIC has no EXECUTE grant; a role without an explicit grant is refused", async () => {
    const publicGrant = await scalar(db, `select coalesce(bool_or(a.grantee = 0), false)
        from pg_proc p, aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
        where p.oid = '${FN}'::regprocedure and a.privilege_type = 'EXECUTE'`);
    assert.strictEqual(publicGrant, false, "PUBLIC can execute the counter");
    await db.exec("create role emr_counter_probe nologin; grant usage on schema public to emr_counter_probe;");
    let code = null;
    try {
        await db.exec(`set role emr_counter_probe; select public.emerriment_increment_article_views('${ID.published}');`);
    } catch (error) {
        code = error.code;
    } finally {
        await db.exec("reset role;");
    }
    assert.strictEqual(code, "42501", "a role without a grant could execute the counter");
    await db.exec("drop owned by emr_counter_probe; drop role emr_counter_probe;");
});

test("the grants are exactly anon, authenticated and service_role (plus the owner)", async () => {
    const grantees = await scalar(db, `select string_agg(coalesce(r.rolname, 'PUBLIC'), ',' order by coalesce(r.rolname, 'PUBLIC'))
        from pg_proc p, aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
        left join pg_roles r on r.oid = a.grantee
        where p.oid = '${FN}'::regprocedure and a.privilege_type = 'EXECUTE'`);
    assert.strictEqual(grantees, "anon,authenticated,postgres,service_role");
});

// Matches production and staging (read-only check 2026-11-21): anon has no
// write privilege at all; authenticated holds table UPDATE because the admin
// CMS edits articles, and Row Level Security limits every update to
// administrators (emerriment_encyclopedia_articles_admin_all + the
// restrictive emerriment_encyclopedia_articles_restrict_update).
test("anon cannot UPDATE articles at all (no privilege)", async () => {
    assert.strictEqual(await scalar(db, "select has_table_privilege('anon', 'public.encyclopedia_articles', 'UPDATE')"), false);
    assert.strictEqual(await scalar(db, "select has_column_privilege('anon', 'public.encyclopedia_articles', 'views', 'UPDATE')"), false);
    const before = await totalViews(db);
    const r = await tryAs(db, "anon", `update public.encyclopedia_articles set views = views + 100 where id = '${ID.published}'`);
    assert(!r.ok && r.error.code === "42501", "anon direct update was not refused");
    assert.strictEqual(await totalViews(db), before);
});

test("a signed-in non-administrator cannot UPDATE any article (RLS: 0 rows), including views", async () => {
    const before = await totalViews(db);
    for (const sql of [
        `update public.encyclopedia_articles set views = views + 100 where id = '${ID.published}'`,
        `update public.encyclopedia_articles set views = views + 100 where id = '${ID.draft}'`,
        "update public.encyclopedia_articles set views = 999999"
    ]) {
        const r = await tryAs(db, USER_A, sql);
        assert(!r.ok ? ["42501", "P0001"].includes(r.error.code) : r.result.affectedRows === 0, "non-admin update changed rows: " + sql);
    }
    assert.strictEqual(await totalViews(db), before);
    const policies = await scalar(db, `select string_agg(polname || ':' || polpermissive::text, ',' order by polname) from pg_policy
        where polrelid = 'public.encyclopedia_articles'::regclass and polcmd in ('w', '*')`);
    assert.strictEqual(policies, "emerriment_encyclopedia_articles_admin_all:true,emerriment_encyclopedia_articles_restrict_update:false");
});

/* ---------- definition ---------- */

test("owner is postgres; SECURITY DEFINER; search_path is empty; volatile SQL function returning integer", async () => {
    const r = (await db.query(`select pg_get_userbyid(p.proowner) as owner, p.prosecdef, p.proconfig, p.provolatile::text as vol,
        l.lanname, pg_get_function_result(p.oid) as result
        from pg_proc p join pg_language l on l.oid = p.prolang where p.oid = '${FN}'::regprocedure`)).rows[0];
    assert.strictEqual(r.owner, "postgres");
    assert.strictEqual(r.prosecdef, true);
    assert.deepStrictEqual(r.proconfig, ['search_path=""']);
    assert.strictEqual(r.vol, "v");
    assert.strictEqual(r.lanname, "sql");
    assert.strictEqual(r.result, "integer");
});

test("atomic: the body is ONE UPDATE with the published condition (no SELECT-then-UPDATE)", async () => {
    const src = String(await scalar(db, `select btrim(regexp_replace(prosrc, '\\s+', ' ', 'g')) from pg_proc where oid = '${FN}'::regprocedure`));
    assert.strictEqual(src, "update public.encyclopedia_articles set views = coalesce(views, 0) + 1 where id = $1 and status = 'published' returning views::integer;");
    assert(!/\bselect\b/i.test(src) && (src.match(/;/g) || []).length === 1);
});

test("the repository definition is byte-for-byte the one audited on production and staging", async () => {
    const md5 = await scalar(db, `select md5(regexp_replace(prosrc, '\\s+', ' ', 'g')) from pg_proc where oid = '${FN}'::regprocedure`);
    assert.strictEqual(md5, LIVE_SOURCE_MD5);
});

test("only one overload exists and no other function calls the counter", async () => {
    assert.strictEqual(await n(db, "select count(*) from pg_proc p join pg_namespace s on s.oid = p.pronamespace where s.nspname = 'public' and p.proname = 'emerriment_increment_article_views'"), 1);
    assert.strictEqual(await n(db, "select count(*) from pg_proc where proname <> 'emerriment_increment_article_views' and prosrc ilike '%emerriment_increment_article_views%'"), 0);
});

test("re-applying migration 20261113090000 is idempotent (same definition and grants)", async () => {
    const snapshot = () => scalar(db, `select md5(regexp_replace(prosrc, '\\s+', ' ', 'g')) || '|' || array_to_string(proacl, ',') || '|' || prosecdef::text
        from pg_proc where oid = '${FN}'::regprocedure`);
    const before = await snapshot();
    const sql = fs.readFileSync(path.join(__dirname, "..", "..", "supabase", "migrations", "20261113090000_emerriment_production_hardening.sql"), "utf8");
    await db.exec(sql);
    assert.strictEqual(await snapshot(), before);
});

test("teardown", async () => {
    await db.close();
});

/* ---------- the staging verification script, run offline ---------- */

const SCRIPT = fs.readFileSync(path.join(__dirname, "..", "..", "supabase", "staging", "verify", "article-counter-rollback.sql"), "utf8");

// A staging-shaped database: migrations, the three staging accounts and the
// synthetic articles from supabase/staging/seed_synthetic.sql.
async function stagingLike({ extraSql = "" } = {}) {
    const s = await P.createProductionDatabase({ seed: false });
    // Accounts first: a migration refuses to run without an administrator profile.
    await s.exec(`
        insert into auth.users (id, email) values
          ('00000000-0000-4000-8000-0000000000a1', 'staging-admin@example.test'),
          ('00000000-0000-4000-8000-0000000000a2', 'staging-user-a@example.test'),
          ('00000000-0000-4000-8000-0000000000a3', 'staging-user-b@example.test');
        insert into public.profiles (id, email) select id, email from auth.users
          where not exists (select 1 from public.profiles p where p.id = auth.users.id);
        update public.profiles set is_admin = (id = '00000000-0000-4000-8000-0000000000a1');`);
    await P.applyProductionMigrations(s);
    await s.exec(`
        insert into public.encyclopedia_articles (id, title, slug, content, status, views) values
          ('00000000-0000-4000-8000-0000000000f1', 'Staging: acne basics', 'staging-acne-basics', 'Synthetic', 'published', 1),
          ('00000000-0000-4000-8000-0000000000f2', 'Staging: hydration basics', 'staging-hydration-basics', 'Synthetic', 'published', 0),
          ('00000000-0000-4000-8000-0000000000f3', 'Staging: unpublished draft', 'staging-draft', 'Synthetic', 'draft', 0);
        ${extraSql}`);
    return s;
}

async function runScript(s) {
    const out = await s.exec(SCRIPT);
    const withRows = out.filter((r) => r.rows && r.rows.length && "test_id" in r.rows[0]);
    return withRows.length ? withRows[withRows.length - 1].rows : [];
}

const countsOf = (s) => scalar(s, "select string_agg(slug || '=' || coalesce(views, 0), ',' order by slug) from public.encyclopedia_articles");

test("staging script (offline): 9 pass / 0 fail, and every counter is unchanged afterwards", async () => {
    const s = await stagingLike();
    const before = await countsOf(s);
    const rows = await runScript(s);
    const failed = rows.filter((r) => r.result !== "PASS").map((r) => `${r.test_id} expected ${r.expected} got ${r.actual}`);
    assert.deepStrictEqual(failed, []);
    assert.deepStrictEqual(rows.map((r) => r.test_id).sort(), ["CNT-01", "CNT-02", "CNT-03", "CNT-04", "CNT-05", "CNT-06", "CNT-07", "CNT-08", "RB-01"]);
    assert.strictEqual(rows[0].summary, "9 pass / 0 fail");
    assert.strictEqual(await countsOf(s), before, "the script left a change behind");
    assert.strictEqual(await scalar(s, "select count(*)::int from pg_class where relname = 'emr_counter'"), 0, "temp table left behind");
    await s.close();
});

test("staging script (offline): refuses on a production-like database (emerriment_backup present)", async () => {
    const s = await stagingLike({ extraSql: "create schema emerriment_backup;" });
    const before = await countsOf(s);
    await assert.rejects(() => s.exec(SCRIPT), /emerriment_backup exists/);
    await s.exec("rollback;").catch(() => {});
    assert.strictEqual(await countsOf(s), before);
    await s.close();
});

test("staging script (offline): refuses without the staging accounts, with real articles, or without the fixtures", async () => {
    for (const [label, extraSql, message] of [
        ["no staging accounts", "delete from auth.users where email = 'staging-user-b@example.test';", /staging accounts are missing/],
        ["a non-synthetic article", "insert into public.encyclopedia_articles (id, title, slug, status, views) values ('00000000-0000-4000-8000-0000000000f9', 'Real', 'real-article', 'published', 7);", /non-synthetic articles exist/],
        ["draft fixture missing", "update public.encyclopedia_articles set status = 'published' where slug = 'staging-draft';", /synthetic fixtures/]
    ]) {
        const s = await stagingLike({ extraSql });
        const before = await countsOf(s);
        await assert.rejects(() => s.exec(SCRIPT), message, label);
        await s.exec("rollback;").catch(() => {});
        assert.strictEqual(await countsOf(s), before, label + ": counts changed");
        await s.close();
    }
});

test("staging script: guarded runner only, no production reference, no hard-coded fixture UUIDs", () => {
    assert(/run-on-staging\.sh --remote=ayxakyyvomlzrsfznpeq/.test(SCRIPT));
    assert(!/ioeulnjrozkbetaongbv/.test(SCRIPT), "production project ref in the script");
    const uuids = SCRIPT.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi) || [];
    assert.deepStrictEqual(uuids, ["00000000-0000-4000-8000-00000000dead"], "only the synthetic 'nonexistent' UUID may appear");
    assert(/\nrollback;\s*$/i.test(SCRIPT), "the script must end with ROLLBACK");
    assert(!/\b(insert into|delete from|truncate|drop table)\s+public\.encyclopedia_articles/i.test(SCRIPT), "the script must not create or delete articles");
});

(async () => {
    const started = Date.now();
    let pass = 0, fail = 0;
    process.stdout.write("\n# article view counter (PGlite, production-shaped)\n");
    for (const t of tests) {
        try {
            await t.fn();
            pass++;
            process.stdout.write(`PASS  ${t.title}\n`);
        } catch (error) {
            fail++;
            process.stdout.write(`FAIL  ${t.title}\n      ${String(error && error.message || error).split("\n").join("\n      ")}\n`);
            if (t.title.startsWith("setup")) break;
        }
    }
    process.stdout.write(`article view counter (PGlite): ${pass} passed, ${fail} failed in ${Math.round((Date.now() - started) / 1000)}s\n`);
    process.exit(fail ? 1 : 0);
})();
