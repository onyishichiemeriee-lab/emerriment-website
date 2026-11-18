/* =========================================
   Visitor-to-customer journey — database rules (PGlite)
   -----------------------------------------
   Migration 20261117090000 on the production-shaped copy:
   marketing consent captured separately from the quiz report, server
   timestamps, allow-listed wording versions, verified purchases that a
   browser cannot create, customer onboarding delivery records.
   Usage: node tests/db/journey.pglite.test.js
========================================= */
"use strict";

const assert = require("assert");
const S = require("./supabase-sim");
const P = require("./production-sim");

const { tryAs, as, scalar } = S;
const { ID } = P;
const A = { user: ID.userA };
const ADMIN = { user: ID.admin };

const tests = [];
const test = (title, fn) => tests.push({ title, fn });

async function migrated() {
    const db = await P.createProductionDatabase();
    await P.applyProductionMigrations(db);
    return db;
}

const HOMEPAGE = "insert into public.leads (name, email, skin_type, concern, oil_level, sensitivity, score, recommendation, quiz_version, source, status, email_status, email_sequence_day, next_email_due, tags";

function quizInsert(email, extraCols = "", extraVals = "") {
    return `${HOMEPAGE}${extraCols}) values ('Ada', '${email}', 'Oily', 'Acne', 'High', 'Low', 50, 'r', '2.0', 'Skin Quiz', 'New Lead', 'Pending', 1, now() + interval '1 day', '["quiz"]'${extraVals})`;
}

const lead = async (db, email) => (await db.query(
    "select marketing_consent, marketing_consent_at, marketing_consent_source, marketing_consent_version, marketing_consent_withdrawn_at from public.leads where email = $1", [email])).rows[0];

test("existing leads are NOT enrolled: every pre-existing lead has marketing_consent = false", async () => {
    const db = await migrated();
    assert.strictEqual(Number(await scalar(db, "select count(*) from public.leads where marketing_consent")), 0);
    assert(Number(await scalar(db, "select count(*) from public.leads")) >= 3);
    await db.close();
});

test("C: quiz without the opt-in → report only; consent stays false with no timestamp", async () => {
    const db = await migrated();
    const r = await tryAs(db, "anon", quizInsert("no-optin@example.test"));
    assert(r.ok, r.error && r.error.message);
    const l = await lead(db, "no-optin@example.test");
    assert.strictEqual(l.marketing_consent, false);
    assert.strictEqual(l.marketing_consent_at, null);
    assert.strictEqual(l.marketing_consent_source, null);
    await db.close();
});

test("D: explicit opt-in → consent true, server timestamp, source and wording version recorded", async () => {
    const db = await migrated();
    const r = await tryAs(db, "anon", quizInsert("optin@example.test",
        ", marketing_consent, marketing_consent_source, marketing_consent_version",
        ", true, 'homepage_quiz', 'quiz-optin-2026-11-17'"));
    assert(r.ok, r.error && r.error.message);
    const l = await lead(db, "optin@example.test");
    assert.strictEqual(l.marketing_consent, true);
    assert(Math.abs(new Date(l.marketing_consent_at).getTime() - Date.now()) < 60e3, "server time");
    assert.strictEqual(l.marketing_consent_source, "homepage_quiz");
    assert.strictEqual(l.marketing_consent_version, "quiz-optin-2026-11-17");
    await db.close();
});

test("consent cannot be recorded with an unknown wording version or source", async () => {
    const db = await migrated();
    for (const [source, version] of [["homepage_quiz", "made-up-version"], ["evil_site", "quiz-optin-2026-11-17"], ["homepage_quiz", null]]) {
        const r = await tryAs(db, "anon", quizInsert("bad@example.test",
            ", marketing_consent, marketing_consent_source, marketing_consent_version",
            `, true, ${source ? `'${source}'` : "null"}, ${version ? `'${version}'` : "null"}`));
        assert(!r.ok && r.error.code === "P0001", `${source}/${version} accepted`);
    }
    await db.close();
});

test("visitors cannot forge consent timestamps or a withdrawal (column privileges)", async () => {
    const db = await migrated();
    for (const col of ["marketing_consent_at", "marketing_consent_withdrawn_at"]) {
        const r = await tryAs(db, "anon", `insert into public.leads (email, ${col}) values ('x@example.test', '2020-01-01')`);
        assert(!r.ok && r.error.code === "42501", col);
    }
    // A declined choice with source/version supplied is stored as a plain "no".
    await as(db, "anon", quizInsert("declined@example.test",
        ", marketing_consent, marketing_consent_source, marketing_consent_version",
        ", false, 'homepage_quiz', 'quiz-optin-2026-11-17'"));
    const l = await lead(db, "declined@example.test");
    assert.strictEqual(l.marketing_consent, false);
    assert.strictEqual(l.marketing_consent_version, null);
    await db.close();
});

test("withdrawal: the service role (unsubscribe function) records it; the consent evidence stays", async () => {
    const db = await migrated();
    await as(db, "anon", quizInsert("leaving@example.test",
        ", marketing_consent, marketing_consent_source, marketing_consent_version",
        ", true, 'quiz_page', 'quiz-optin-2026-11-17'"));
    await as(db, "service_role", "update public.leads set status = 'Unsubscribed', marketing_consent = false, marketing_consent_withdrawn_at = now() where email = 'leaving@example.test'");
    const l = await lead(db, "leaving@example.test");
    assert.strictEqual(l.marketing_consent, false);
    assert(l.marketing_consent_withdrawn_at, "withdrawal time");
    assert(l.marketing_consent_at && l.marketing_consent_version, "original consent evidence kept");
    await db.close();
});

test("K: a purchase cannot be created, read or changed from a browser (anon or signed-in user)", async () => {
    const db = await migrated();
    const forge = "insert into public.purchases (email, product_code, provider, provider_order_ref, verified_by) values ('a@example.test', '21-days', 'selar', 'FAKE-1', 'browser')";
    for (const who of ["anon", A]) {
        const r = await tryAs(db, who, forge);
        assert(!r.ok && r.error.code === "42501", JSON.stringify(who));
        const read = await tryAs(db, who, "select * from public.purchases");
        assert(!read.ok || read.result.rows.length === 0);
    }
    assert.strictEqual(Number(await scalar(db, "select count(*) from public.purchases")), 0);
    await db.close();
});

test("verified purchases: the service role records one per order; admins can read them (CMS)", async () => {
    const db = await migrated();
    const ins = (ref) => `insert into public.purchases (email, product_code, provider, provider_order_ref, amount, currency, verified_by) values ('buyer@example.test', '21-days-to-glow', 'selar', '${ref}', 5000, 'NGN', 'admin: Selar order checked')`;
    await as(db, "service_role", ins("SEL-1001"));
    const dup = await tryAs(db, "service_role", ins("SEL-1001"));
    assert(!dup.ok && dup.error.code === "23505", "same order twice");
    assert.strictEqual((await as(db, ADMIN, "select * from public.purchases")).rows.length, 1);
    assert.strictEqual((await tryAs(db, A, "select * from public.purchases")).result.rows.length, 0);
    const badCurrency = await tryAs(db, "service_role", "insert into public.purchases (email, product_code, provider, provider_order_ref, currency, verified_by) values ('b@example.test', 'x', 'selar', 'SEL-2', 'naira', 'admin: x')");
    assert(!badCurrency.ok && badCurrency.error.code === "23514");
    await db.close();
});

test("customer onboarding delivery records: at most once per purchase and day; target rules enforced", async () => {
    const db = await migrated();
    const pid = (await as(db, "service_role", "insert into public.purchases (email, product_code, provider, provider_order_ref, verified_by) values ('buyer@example.test', 'p', 'manual', 'M-1', 'admin: checked') returning id")).rows[0].id;
    await as(db, "service_role", `insert into public.email_deliveries (purchase_id, kind, sequence_day) values ('${pid}', 'customer', 0)`);
    const again = await tryAs(db, "service_role", `insert into public.email_deliveries (purchase_id, kind, sequence_day) values ('${pid}', 'customer', 0)`);
    assert(!again.ok && again.error.code === "23505");
    const noTarget = await tryAs(db, "service_role", "insert into public.email_deliveries (kind, sequence_day) values ('customer', 3)");
    assert(!noTarget.ok && noTarget.error.code === "23514");
    const reportNoLead = await tryAs(db, "service_role", "insert into public.email_deliveries (kind, sequence_day) values ('report', 0)");
    assert(!reportNoLead.ok && reportNoLead.error.code === "23514");
    for (const who of ["anon", A, ADMIN]) {
        const r = await tryAs(db, who, "select * from public.email_deliveries");
        assert(!r.ok && r.error.code === "42501");
    }
    await db.close();
});

// ---------------------------------------------------------------------
// Consent guards (insert and update): who may record or change consent
// ---------------------------------------------------------------------

const OPTIN = [", marketing_consent, marketing_consent_source, marketing_consent_version", ", true, 'homepage_quiz', 'quiz-optin-2026-11-17'"];

async function consentingLead(db, email) {
    await as(db, "anon", quizInsert(email, ...OPTIN));
    return (await db.query("select id from public.leads where email = $1", [email])).rows[0].id;
}

const idOf = async (db, email) => Number(await scalar(db, "select id from public.leads where email = $1", [email]));
const consenting = async (db) => Number(await scalar(db, "select count(*) from public.leads where marketing_consent"));

test("signed-in user: cannot forge consent on insert (bad wording, forged time) or change any lead's consent", async () => {
    const db = await migrated();
    const badVersion = await tryAs(db, A, quizInsert("user-a@example.test",
        ", marketing_consent, marketing_consent_source, marketing_consent_version", ", true, 'homepage_quiz', 'v-forged'"));
    assert(!badVersion.ok && badVersion.error.code === "P0001");
    const forgedTime = await tryAs(db, A, "insert into public.leads (email, marketing_consent_at) values ('user-a@example.test', '2020-01-01')");
    assert(!forgedTime.ok && forgedTime.error.code === "42501");
    const id = await consentingLead(db, "victim@example.test");
    // RLS: a non-admin's update reaches no row; nothing changes.
    for (const set of ["marketing_consent = true", "marketing_consent = false", "marketing_consent_version = 'x'"]) {
        const r = await tryAs(db, A, `update public.leads set ${set} where id = ${id}`);
        assert(!r.ok || r.result.affectedRows === 0, set);
    }
    const l = await lead(db, "victim@example.test");
    assert.strictEqual(l.marketing_consent, true);
    assert.strictEqual(l.marketing_consent_version, "quiz-optin-2026-11-17");
    await db.close();
});

test("administrator: cannot opt a lead in, rewrite consent evidence or withdraw it; admin inserts follow the quiz rules", async () => {
    const db = await migrated();
    const oldId = await idOf(db, "one@example.test");
    const optIn = await tryAs(db, ADMIN, `update public.leads set marketing_consent = true where id = ${oldId}`);
    assert(!optIn.ok && optIn.error.code === "P0001", "admin opt-in on someone's behalf");
    const optInFull = await tryAs(db, ADMIN, `update public.leads set marketing_consent = true, marketing_consent_at = now(), marketing_consent_source = 'homepage_quiz', marketing_consent_version = 'quiz-optin-2026-11-17' where id = ${oldId}`);
    assert(!optInFull.ok && optInFull.error.code === "P0001", "admin manufactured full evidence");
    const id = await consentingLead(db, "evidence@example.test");
    for (const set of ["marketing_consent_at = now() - interval '1 year'", "marketing_consent_source = 'quiz_page'", "marketing_consent_version = 'quiz-optin-2026-11-17-b'"]) {
        const r = await tryAs(db, ADMIN, `update public.leads set ${set} where id = ${id}`);
        assert(!r.ok && r.error.code === "P0001", set);
    }
    const withdraw = await tryAs(db, ADMIN, `update public.leads set marketing_consent = false where id = ${id}`);
    assert(!withdraw.ok && withdraw.error.code === "42501", "admin withdrawal must go through Unsubscribed");
    // Admin insert: no extra power. Unknown source refused; time column not writable.
    const adminInsert = await tryAs(db, ADMIN, quizInsert("admin-made@example.test",
        ", marketing_consent, marketing_consent_source, marketing_consent_version", ", true, 'cms', 'quiz-optin-2026-11-17'"));
    assert(!adminInsert.ok && adminInsert.error.code === "P0001");
    const adminTime = await tryAs(db, ADMIN, "insert into public.leads (email, marketing_consent, marketing_consent_source, marketing_consent_version, marketing_consent_at) values ('t@example.test', true, 'homepage_quiz', 'quiz-optin-2026-11-17', '2020-01-01')");
    assert(!adminTime.ok && adminTime.error.code === "42501");
    // Ordinary CMS edits (whole row sent back, consent unchanged) still work.
    const row = (await db.query("select * from public.leads where id = $1", [id])).rows[0];
    const cms = await tryAs(db, ADMIN, "update public.leads set notes = 'called back', status = 'Unsubscribed', marketing_consent = $2, marketing_consent_at = $3, marketing_consent_source = $4, marketing_consent_version = $5, marketing_consent_withdrawn_at = $6 where id = $1",
        [id, row.marketing_consent, row.marketing_consent_at, row.marketing_consent_source, row.marketing_consent_version, row.marketing_consent_withdrawn_at]);
    assert(cms.ok && cms.result.affectedRows === 1, cms.error && cms.error.message);
    assert.strictEqual(await consenting(db), 1, "only the person's own opt-in");
    await db.close();
});

test("unauthorised updates: nobody switches consent on or rewrites evidence (service role, SQL Editor); server inserts follow the quiz rules", async () => {
    const db = await migrated();
    const oldId = await idOf(db, "two@example.test");
    for (const who of ["service_role", "postgres"]) {
        const r = await tryAs(db, who, `update public.leads set marketing_consent = true, marketing_consent_at = now(), marketing_consent_source = 'homepage_quiz', marketing_consent_version = 'quiz-optin-2026-11-17' where id = ${oldId}`);
        assert(!r.ok && r.error.code === "P0001", who + " manufactured consent");
    }
    const id = await consentingLead(db, "kept@example.test");
    const rewrite = await tryAs(db, "service_role", `update public.leads set marketing_consent_version = 'other' where id = ${id}`);
    assert(!rewrite.ok && rewrite.error.code === "P0001");
    const svcInsert = await tryAs(db, "service_role", "insert into public.leads (email, marketing_consent, marketing_consent_source, marketing_consent_version) values ('svc@example.test', true, 'import', 'quiz-optin-2026-11-17')");
    assert(!svcInsert.ok && svcInsert.error.code === "P0001");
    // Inconsistent evidence is refused even from a direct connection.
    const bare = await tryAs(db, "postgres", "insert into public.leads (email, marketing_consent) values ('bare@example.test', true)");
    assert(!bare.ok && bare.error.code === "23514", "consent without source/version");
    assert.strictEqual(await consenting(db), 1);
    await db.close();
});

test("authorised withdrawal: the service role withdraws with the SERVER time; repeats and never-consented leads change nothing", async () => {
    const db = await migrated();
    const id = await consentingLead(db, "bye@example.test");
    await as(db, "service_role", `update public.leads set marketing_consent = false, marketing_consent_withdrawn_at = '2001-01-01T00:00:00Z' where id = ${id}`);
    const first = await lead(db, "bye@example.test");
    assert.strictEqual(first.marketing_consent, false);
    assert(Math.abs(new Date(first.marketing_consent_withdrawn_at).getTime() - Date.now()) < 60e3, "server time, not the supplied one");
    assert(first.marketing_consent_at && first.marketing_consent_source && first.marketing_consent_version, "evidence kept");
    await as(db, "service_role", `update public.leads set marketing_consent = false, marketing_consent_withdrawn_at = now() + interval '1 day' where id = ${id}`);
    assert.strictEqual(new Date((await lead(db, "bye@example.test")).marketing_consent_withdrawn_at).getTime(), new Date(first.marketing_consent_withdrawn_at).getTime(), "first withdrawal time kept");
    const neverId = await idOf(db, "three@example.test");
    await as(db, "service_role", `update public.leads set marketing_consent = false, marketing_consent_withdrawn_at = now() where id = ${neverId}`);
    assert.strictEqual((await lead(db, "three@example.test")).marketing_consent_withdrawn_at, null, "no withdrawal without a consent");
    await db.close();
});

test("unsubscribe flow (the exact updates of unsubscribe.js): status, then consent withdrawn on every lead with the address", async () => {
    const db = await migrated();
    const yes = await consentingLead(db, "same@example.test");
    await as(db, "anon", quizInsert("SAME@example.test"));
    const ids = (await db.query("select id from public.leads where lower(email) = 'same@example.test' order by id")).rows.map((r) => r.id);
    assert.strictEqual(ids.length, 2);
    await as(db, "service_role", "update public.leads set status = 'Unsubscribed' where id = any($1::bigint[])", [ids]);
    const r = await tryAs(db, "service_role", "update public.leads set marketing_consent = $2, marketing_consent_withdrawn_at = $3 where id = any($1::bigint[])", [ids, false, new Date().toISOString()]);
    assert(r.ok && r.result.affectedRows === 2, r.error && r.error.message);
    const rows = (await db.query("select id, status, marketing_consent, marketing_consent_withdrawn_at from public.leads where id = any($1::bigint[])", [ids])).rows;
    for (const row of rows) {
        assert.strictEqual(row.status, "Unsubscribed");
        assert.strictEqual(row.marketing_consent, false);
    }
    assert(rows.find((x) => x.id === yes).marketing_consent_withdrawn_at, "the consenting lead records a withdrawal");
    assert.strictEqual(rows.find((x) => x.id !== yes).marketing_consent_withdrawn_at, null);
    assert.strictEqual(await consenting(db), 0, "the lesson query finds nobody");
    await db.close();
});


// ---------------------------------------------------------------------
// Rollbacks
// ---------------------------------------------------------------------

// Every row of every public table: changes if any data does.
async function fingerprint(db) {
    const tables = (await db.query("select relname from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r' order by 1")).rows.map((r) => r.relname);
    const out = {};
    for (const t of tables) {
        out[t] = (await db.query(`select count(*)::text || ':' || coalesce(md5(string_agg(x::text, '|' order by x::text)), '-') f from public.${t} x`)).rows[0].f;
    }
    return out;
}

// Migrations 1–6 security state: policies, RLS, API privileges, functions
// and triggers (excluding only migration 7's consent guards and columns).
async function securityState(db) {
    const q = async (sql) => (await db.query(sql)).rows.map((r) => Object.values(r).join(" ")).join("\n");
    return {
        policies: await q("select tablename, policyname, cmd, permissive, roles::text, qual, with_check from pg_policies where schemaname = 'public' order by 1, 2"),
        rls: await q("select relname, relrowsecurity, relforcerowsecurity from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r' order by 1"),
        tableGrants: await q("select table_name, grantee, privilege_type from information_schema.role_table_grants where table_schema = 'public' and grantee in ('anon', 'authenticated') order by 1, 2, 3"),
        columnGrants: await q("select table_name, column_name, grantee, privilege_type from information_schema.column_privileges where table_schema = 'public' and grantee in ('anon', 'authenticated') and column_name not like 'marketing_consent%' order by 1, 2, 3, 4"),
        triggers: await q("select tgrelid::regclass::text, tgname from pg_trigger where not tgisinternal and tgname not like 'emerriment_guard_lead_consent%' order by 1, 2"),
        functions: await q("select p.oid::regprocedure::text from pg_proc p where p.pronamespace in ('public'::regnamespace, 'emerriment_private'::regnamespace) and p.proname not like 'emerriment_guard_lead_consent%' order by 1")
    };
}

async function populated() {
    const db = await migrated();
    await consentingLead(db, "kept-consent@example.test");
    const gone = await consentingLead(db, "kept-withdrawal@example.test");
    await as(db, "service_role", `update public.leads set marketing_consent = false where id = ${gone}`);
    const pid = (await as(db, "service_role", "insert into public.purchases (email, product_code, provider, provider_order_ref, amount, currency, verified_by) values ('buyer@example.test', '21-days-to-glow', 'selar', 'SEL-77', 5000, 'NGN', 'admin: checked') returning id")).rows[0].id;
    await as(db, "service_role", `insert into public.email_deliveries (lead_id, kind, sequence_day, status) values (${gone}, 'report', 0, 'sent')`);
    await as(db, "service_role", `insert into public.email_deliveries (purchase_id, kind, sequence_day, status) values ('${pid}', 'customer', 0, 'sent')`);
    return db;
}

const guardCount = async (db) => Number(await scalar(db, "select count(*) from pg_trigger where tgname like 'emerriment_guard_lead_consent%'"));

test("migration 7 rollback: keeps every row (leads, consent evidence, purchases, delivery history); removes only the two consent guards", async () => {
    const db = await populated();
    const before = await fingerprint(db);
    assert.strictEqual(await guardCount(db), 2);
    await S.applyMigration7Rollback(db);
    assert.deepStrictEqual(await fingerprint(db), before, "data changed");
    assert.strictEqual(await guardCount(db), 0);
    assert.strictEqual(Number(await scalar(db, "select count(*) from pg_proc where proname like 'emerriment_guard_lead_consent%'")), 0);
    assert.strictEqual(await consenting(db), 1);
    assert.strictEqual(Number(await scalar(db, "select count(*) from public.leads where marketing_consent_withdrawn_at is not null")), 1);
    assert.strictEqual(Number(await scalar(db, "select count(*) from public.purchases")), 1);
    assert.strictEqual(Number(await scalar(db, "select count(*) from public.email_deliveries")), 2);
    // Visitors can no longer submit consent; the quiz itself still works.
    const consent = await tryAs(db, "anon", quizInsert("after-rb@example.test", ...OPTIN));
    assert(!consent.ok && consent.error.code === "42501");
    const plain = await tryAs(db, "anon", quizInsert("after-rb@example.test"));
    assert(plain.ok, plain.error && plain.error.message);
    // Re-applying migration 7 restores both guards without touching data.
    const afterRb = await fingerprint(db);
    await P.applyProductionMigrations(db, ["20261117090000_emerriment_marketing_consent_and_purchases.sql"]);
    assert.deepStrictEqual(await fingerprint(db), afterRb);
    assert.strictEqual(await guardCount(db), 2);
    await db.close();
});

test("migration 7 rollback: migrations 1–6 protections identical before and after; nothing granted to anon/authenticated", async () => {
    const db = await populated();
    const before = await securityState(db);
    await S.applyMigration7Rollback(db);
    assert.deepStrictEqual(await securityState(db), before);
    for (const t of ["leads", "email_deliveries", "purchases", "profiles", "ai_messages"]) {
        const r = await tryAs(db, "anon", `select * from public.${t}`);
        assert(!r.ok && r.error.code === "42501", "anon reads " + t);
    }
    assert.strictEqual((await as(db, A, "select * from public.leads")).rows.length, 0, "user A reads leads");
    await tryAs(db, A, `update public.profiles set is_admin = true where id = '${ID.userA}'`);
    assert.notStrictEqual(await scalar(db, `select is_admin from public.profiles where id = '${ID.userA}'`), true, "self-promotion");
    const forge = await tryAs(db, A, "insert into public.purchases (email, product_code, provider, provider_order_ref, verified_by) values ('a@example.test', 'x', 'selar', 'F-1', 'browser')");
    assert(!forge.ok && forge.error.code === "42501");
    await db.close();
});

test("migration 7 rollback: the 03b live security suite still passes completely afterwards", async () => {
    const db = await populated();
    await db.exec(S.read("supabase/backups/20261113_create_backup.sql"));
    await S.applyMigration7Rollback(db);
    const results = await db.exec(S.read("supabase/audit/03b_comprehensive_live_security_checks.sql"));
    const rows = results[results.length - 1].rows;
    const summary = Object.fromEntries(rows.filter((r) => r.test_id === "SUMMARY").map((r) => [r.operation, r.actual]));
    const failed = rows.filter((r) => r.test_id !== "SUMMARY" && r.result === "FAIL").map((f) => `${f.test_id}: ${f.actual}`);
    assert.deepStrictEqual(failed, []);
    assert.strictEqual(summary.OVERALL, "PASS");
    await db.close();
});

test("migration 7 rollback refuses to run when migration 7 is not applied, and changes nothing", async () => {
    const db = await P.createProductionDatabase();
    await P.applyProductionMigrations(db, P.PRODUCTION_MIGRATIONS.slice(0, 7));
    const before = await fingerprint(db);
    await assert.rejects(() => S.applyMigration7Rollback(db), /migration 7 is not applied/);
    assert.deepStrictEqual(await fingerprint(db), before);
    await db.close();
});

test("full security rollback refuses to run without the explicit all-seven confirmation, and then changes nothing", async () => {
    const db = await populated();
    const before = await fingerprint(db);
    const state = await securityState(db);
    await assert.rejects(() => db.exec(S.read("supabase/rollback/emerriment_security_rollback.sql")), /FULL security rollback/);
    await db.exec("rollback");
    assert.deepStrictEqual(await fingerprint(db), before);
    assert.deepStrictEqual(await securityState(db), state);
    const r = await tryAs(db, "anon", "select * from public.leads");
    assert(!r.ok && r.error.code === "42501", "leads must stay private");
    await db.close();
});

test("full security rollback (confirmed): removes purchases and both consent guards, keeps the consent evidence columns", async () => {
    const db = await migrated();
    await S.applyRollback(db);
    assert.strictEqual(await scalar(db, "select to_regclass('public.purchases') is null"), true);
    assert.strictEqual(await guardCount(db), 0);
    assert.strictEqual(Number(await scalar(db, "select count(*) from information_schema.columns where table_name = 'leads' and column_name like 'marketing_consent%'")), 5);
    await P.applyProductionMigrations(db);
    assert.strictEqual(await scalar(db, "select to_regclass('public.purchases') is not null"), true);
    await db.close();
});


async function run() {
    let pass = 0;
    let fail = 0;
    const started = Date.now();
    for (const t of tests) {
        try { await t.fn(); pass++; console.log("  ✅ " + t.title); }
        catch (error) { fail++; console.log("  ❌ " + t.title + "\n     " + (error && error.message)); }
    }
    console.log(`\njourney rules (PGlite): ${pass} passed, ${fail} failed in ${Math.round((Date.now() - started) / 1000)}s`);
    return { pass, fail };
}

module.exports = { run, tests };
if (require.main === module) run().then(({ fail }) => process.exit(fail ? 1 : 0));
