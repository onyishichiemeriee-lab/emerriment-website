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

test("rollback removes purchases and the consent trigger but keeps the consent evidence columns", async () => {
    const db = await migrated();
    await S.applyRollback(db);
    assert.strictEqual(await scalar(db, "select to_regclass('public.purchases') is null"), true);
    assert.strictEqual(Number(await scalar(db, "select count(*) from pg_trigger where tgname = 'emerriment_guard_lead_consent'")), 0);
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
