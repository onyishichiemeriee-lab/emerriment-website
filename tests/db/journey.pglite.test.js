/* =========================================
   Visitor-to-customer journey — database rules (PGlite)
   -----------------------------------------
   Migration 20261117090000 on the production-shaped copy:
   DOUBLE OPT-IN marketing consent (a quiz box only records a request;
   consent becomes active only through a confirmation token, by the
   service role), server timestamps, allow-listed wording versions,
   verified purchases that a browser cannot create, customer onboarding
   and confirmation delivery records, migration-7-only rollback.
   Usage: node tests/db/journey.pglite.test.js
========================================= */
"use strict";

const assert = require("assert");
const crypto = require("crypto");
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

// Exactly what the quiz pages send when the box is ticked (no consent flag).
const REQUEST = [", marketing_consent_source, marketing_consent_version", ", 'homepage_quiz', 'quiz-optin-2026-11-17'"];

const COLS = "marketing_consent, marketing_consent_requested_at, marketing_consent_source, marketing_consent_version, marketing_consent_at, marketing_consent_token_hash, marketing_consent_token_expires_at, marketing_consent_withdrawn_at, status";
const lead = async (db, email) => (await db.query(`select ${COLS} from public.leads where email = $1 order by id desc limit 1`, [email])).rows[0];
const byId = async (db, id) => (await db.query(`select ${COLS} from public.leads where id = $1`, [id])).rows[0];
const idOf = async (db, email) => Number(await scalar(db, "select id from public.leads where email = $1 order by id desc limit 1", [email]));
const active = async (db) => Number(await scalar(db, "select count(*) from public.leads where marketing_consent"));
const near = (value, ms = 60e3) => value && Math.abs(new Date(value).getTime() - Date.now()) < ms;

const newToken = () => crypto.randomBytes(32).toString("base64url");
const hashOf = (token) => crypto.createHash("sha256").update(token).digest("hex");

async function requestLead(db, email, who = "anon") {
    await as(db, who, quizInsert(email, ...REQUEST));
    return idOf(db, email);
}

// What netlify/lib/consent-confirmation.js does (service role).
async function issueToken(db, id, { token = newToken(), who = "service_role", expires = "now() + interval '7 days'" } = {}) {
    const r = await tryAs(db, who, `update public.leads set marketing_consent_token_hash = $1, marketing_consent_token_expires_at = ${expires} where id = $2 and marketing_consent_token_hash is null`, [hashOf(token), id]);
    return { token, r };
}

// What netlify/functions/confirm-subscription.js does on POST (service role).
function activate(db, token, who = "service_role") {
    return tryAs(db, who, "update public.leads set marketing_consent = true where marketing_consent_token_hash = $1 and marketing_consent = false and marketing_consent_withdrawn_at is null and marketing_consent_token_expires_at > now()", [hashOf(token)]);
}

async function confirmedLead(db, email) {
    const id = await requestLead(db, email);
    const { token } = await issueToken(db, id);
    const r = await activate(db, token);
    assert(r.ok && r.result.affectedRows === 1, r.error && r.error.message);
    return id;
}


// ---------------------------------------------------------------------
// Quiz submission: request only
// ---------------------------------------------------------------------

test("existing leads are NOT enrolled: no active consent, no request, no token on any pre-existing lead", async () => {
    const db = await migrated();
    assert.strictEqual(await active(db), 0);
    assert.strictEqual(Number(await scalar(db, "select count(*) from public.leads where marketing_consent_requested_at is not null or marketing_consent_token_hash is not null or marketing_consent_at is not null")), 0);
    assert(Number(await scalar(db, "select count(*) from public.leads")) >= 3);
    await db.close();
});

test("C: no checkbox → no request, no consent (the report is a separate, requested email)", async () => {
    const db = await migrated();
    const r = await tryAs(db, "anon", quizInsert("no-optin@example.test"));
    assert(r.ok, r.error && r.error.message);
    const l = await lead(db, "no-optin@example.test");
    assert.strictEqual(l.marketing_consent, false);
    for (const c of ["marketing_consent_requested_at", "marketing_consent_source", "marketing_consent_version", "marketing_consent_at", "marketing_consent_token_hash"]) {
        assert.strictEqual(l[c], null, c);
    }
    await db.close();
});

test("D: checkbox → a PENDING request only: consent false, server request time, source and wording; not confirmed", async () => {
    const db = await migrated();
    const r = await tryAs(db, "anon", quizInsert("optin@example.test", ...REQUEST));
    assert(r.ok, r.error && r.error.message);
    const l = await lead(db, "optin@example.test");
    assert.strictEqual(l.marketing_consent, false, "not active until confirmed");
    assert(near(l.marketing_consent_requested_at), "server time");
    assert.strictEqual(l.marketing_consent_source, "homepage_quiz");
    assert.strictEqual(l.marketing_consent_version, "quiz-optin-2026-11-17");
    assert.strictEqual(l.marketing_consent_at, null);
    assert.strictEqual(l.marketing_consent_token_hash, null);
    await db.close();
});

test("a request needs an allow-listed wording version and source", async () => {
    const db = await migrated();
    for (const [source, version] of [["homepage_quiz", "made-up-version"], ["evil_site", "quiz-optin-2026-11-17"], ["homepage_quiz", null], [null, "quiz-optin-2026-11-17"]]) {
        const r = await tryAs(db, "anon", quizInsert("bad@example.test", ", marketing_consent_source, marketing_consent_version",
            `, ${source ? `'${source}'` : "null"}, ${version ? `'${version}'` : "null"}`));
        assert(!r.ok && r.error.code === "P0001", `${source}/${version} accepted`);
    }
    await db.close();
});

test("anonymous forgery: consent itself, request/confirmation times, tokens and withdrawals are not writable (column privileges)", async () => {
    const db = await migrated();
    for (const [col, val] of [["marketing_consent", "true"], ["marketing_consent_requested_at", "'2020-01-01'"], ["marketing_consent_at", "'2020-01-01'"],
        ["marketing_consent_token_hash", `'${"a".repeat(64)}'`], ["marketing_consent_token_expires_at", "'2030-01-01'"], ["marketing_consent_withdrawn_at", "'2020-01-01'"]]) {
        const r = await tryAs(db, "anon", `insert into public.leads (email, ${col}) values ('x@example.test', ${val})`);
        assert(!r.ok && r.error.code === "42501", col);
    }
    assert.strictEqual(await active(db), 0);
    await db.close();
});

test("signed-in user (API): same forgeries refused; cannot activate, confirm or change any lead's consent", async () => {
    const db = await migrated();
    const forged = await tryAs(db, A, "insert into public.leads (email, marketing_consent) values ('user-a@example.test', true)");
    assert(!forged.ok && forged.error.code === "42501");
    const badVersion = await tryAs(db, A, quizInsert("user-a@example.test", ", marketing_consent_source, marketing_consent_version", ", 'homepage_quiz', 'v-forged'"));
    assert(!badVersion.ok && badVersion.error.code === "P0001");
    const id = await requestLead(db, "victim@example.test");
    const { token } = await issueToken(db, id);
    // RLS: a non-admin's update reaches no row.
    for (const set of ["marketing_consent = true", "marketing_consent_token_hash = null", "marketing_consent_version = 'x'"]) {
        const r = await tryAs(db, A, `update public.leads set ${set} where id = ${id}`);
        assert(!r.ok || r.result.affectedRows === 0, set);
    }
    const viaToken = await activate(db, token, A);
    assert(!viaToken.ok || viaToken.result.affectedRows === 0, "user activated with a token");
    assert.strictEqual(await active(db), 0);
    await db.close();
});


// ---------------------------------------------------------------------
// Administrators and the server cannot manufacture consent
// ---------------------------------------------------------------------

test("administrator (API): cannot opt anyone in — not by flag, not with a live token, not with forged evidence; cannot issue tokens or withdraw directly", async () => {
    const db = await migrated();
    const insert = await tryAs(db, ADMIN, "insert into public.leads (email, marketing_consent) values ('admin-made@example.test', true)");
    assert(!insert.ok && insert.error.code === "42501", "admin inserted active consent");
    const oldId = await idOf(db, "one@example.test");
    const flag = await tryAs(db, ADMIN, `update public.leads set marketing_consent = true where id = ${oldId}`);
    assert(!flag.ok && flag.error.code === "P0001");
    const id = await requestLead(db, "pending@example.test");
    const { token } = await issueToken(db, id);
    const withToken = await activate(db, token, ADMIN);
    assert(!withToken.ok && withToken.error.code === "P0001", "admin activated with a live token");
    for (const set of ["marketing_consent_at = now()", "marketing_consent_requested_at = now() - interval '1 day'", "marketing_consent_source = 'quiz_page'", "marketing_consent_version = 'other'"]) {
        const r = await tryAs(db, ADMIN, `update public.leads set ${set} where id = ${id}`);
        assert(!r.ok && r.error.code === "P0001", set);
    }
    const newTok = await tryAs(db, ADMIN, `update public.leads set marketing_consent_token_hash = '${"b".repeat(64)}', marketing_consent_token_expires_at = now() + interval '1 day' where id = ${oldId}`);
    assert(!newTok.ok && ["42501", "P0001"].includes(newTok.error.code), "admin issued a token");
    const confirmed = await confirmedLead(db, "subscriber@example.test");
    const withdraw = await tryAs(db, ADMIN, `update public.leads set marketing_consent = false where id = ${confirmed}`);
    assert(!withdraw.ok && withdraw.error.code === "42501", "direct withdrawal must go through Unsubscribed");
    // Ordinary CMS edits (whole row sent back, consent unchanged) still work.
    const row = (await db.query("select * from public.leads where id = $1", [confirmed])).rows[0];
    const cms = await tryAs(db, ADMIN, `update public.leads set notes = 'called back', marketing_consent = $2, marketing_consent_requested_at = $3, marketing_consent_source = $4, marketing_consent_version = $5, marketing_consent_at = $6, marketing_consent_token_hash = $7, marketing_consent_token_expires_at = $8, marketing_consent_withdrawn_at = $9 where id = $1`,
        [confirmed, row.marketing_consent, row.marketing_consent_requested_at, row.marketing_consent_source, row.marketing_consent_version, row.marketing_consent_at, row.marketing_consent_token_hash, row.marketing_consent_token_expires_at, row.marketing_consent_withdrawn_at]);
    assert(cms.ok && cms.result.affectedRows === 1, cms.error && cms.error.message);
    assert.strictEqual(await active(db), 1, "only the confirmed subscriber");
    await db.close();
});

test("service role: inserts are never active, no activation without a live token; SQL Editor (privileged direct connection): no activation by UPDATE, inserts without consistent evidence refused, a fully evidenced insert is accepted (operator path)", async () => {
    const db = await migrated();
    await as(db, "service_role", "insert into public.leads (email, marketing_consent, marketing_consent_source, marketing_consent_version) values ('svc@example.test', true, 'homepage_quiz', 'quiz-optin-2026-11-17')");
    const svc = await lead(db, "svc@example.test");
    assert.strictEqual(svc.marketing_consent, false, "service-role insert stays a request");
    assert(near(svc.marketing_consent_requested_at));
    const unknown = await tryAs(db, "service_role", "insert into public.leads (email, marketing_consent_source, marketing_consent_version) values ('svc2@example.test', 'import', 'quiz-optin-2026-11-17')");
    assert(!unknown.ok && unknown.error.code === "P0001");
    const id = await idOf(db, "svc@example.test");
    const noToken = await tryAs(db, "service_role", `update public.leads set marketing_consent = true where id = ${id}`);
    assert(!noToken.ok && noToken.error.code === "P0001", "activation without a token");
    const { token } = await issueToken(db, id);
    const editor = await activate(db, token, "postgres");
    assert(!editor.ok && editor.error.code === "P0001", "SQL Editor activated");
    const bare = await tryAs(db, "postgres", "insert into public.leads (email, marketing_consent) values ('bare@example.test', true)");
    assert(!bare.ok && bare.error.code === "23514", "active consent without request/confirmation evidence");
    // Documented, not endorsed: the trusted direct connection is a privileged
    // operator path that bypasses the API consent restrictions. With complete,
    // consistent evidence its INSERT is accepted (only the CHECK constraint
    // applies). Rolled back, so nothing is kept.
    await db.exec("begin");
    await db.query(`insert into public.leads (email, marketing_consent_requested_at, marketing_consent_source,
                        marketing_consent_version, marketing_consent, marketing_consent_at)
                    values ('operator@example.test', now(), 'quiz_page', 'quiz-optin-2026-11-17', true, now())`);
    assert.strictEqual((await lead(db, "operator@example.test")).marketing_consent, true,
        "the SQL Editor's privileged insert path is as documented");
    await db.exec("rollback");
    assert.strictEqual(await active(db), 0);
    await db.close();
});


// ---------------------------------------------------------------------
// Confirmation tokens
// ---------------------------------------------------------------------

test("explicit confirmation activates consent: server confirmation time, token destroyed, request evidence unchanged", async () => {
    const db = await migrated();
    const id = await requestLead(db, "yes@example.test");
    const before = await byId(db, id);
    const { token } = await issueToken(db, id);
    assert.strictEqual((await byId(db, id)).marketing_consent_token_hash, hashOf(token), "only the hash is stored");
    const r = await activate(db, token);
    assert(r.ok && r.result.affectedRows === 1, r.error && r.error.message);
    const after = await byId(db, id);
    assert.strictEqual(after.marketing_consent, true);
    assert(near(after.marketing_consent_at), "server confirmation time");
    assert.strictEqual(after.marketing_consent_token_hash, null, "single use");
    assert.strictEqual(after.marketing_consent_token_expires_at, null);
    for (const c of ["marketing_consent_requested_at", "marketing_consent_source", "marketing_consent_version"]) {
        assert.deepStrictEqual(after[c], before[c], c + " preserved");
    }
    await db.close();
});

test("token reuse and unknown tokens change nothing (atomic, idempotent)", async () => {
    const db = await migrated();
    const id = await requestLead(db, "twice@example.test");
    const { token } = await issueToken(db, id);
    assert.strictEqual((await activate(db, token)).result.affectedRows, 1);
    const firstAt = (await byId(db, id)).marketing_consent_at;
    const again = await activate(db, token);
    assert(again.ok && again.result.affectedRows === 0, "reuse");
    assert.deepStrictEqual((await byId(db, id)).marketing_consent_at, firstAt, "confirmation time unchanged");
    const unknown = await activate(db, newToken());
    assert(unknown.ok && unknown.result.affectedRows === 0);
    await db.close();
});

test("expired tokens are rejected; tokens cannot be issued expired, for longer than 8 days, malformed, or without a pending request", async () => {
    const db = await migrated();
    // A token that has since expired (written directly: the server could not issue it).
    const id = await requestLead(db, "late@example.test");
    const token = newToken();
    await as(db, "postgres", `update public.leads set marketing_consent_token_hash = '${hashOf(token)}', marketing_consent_token_expires_at = now() + interval '1 second' where id = ${id}`);
    await new Promise((r) => setTimeout(r, 1500));
    const late = await activate(db, token);
    assert(late.ok && late.result.affectedRows === 0, "expired token activated");
    const forced = await tryAs(db, "service_role", `update public.leads set marketing_consent = true where id = ${id}`);
    assert(!forced.ok && forced.error.code === "P0001", "expired token bypassed");
    const id2 = await requestLead(db, "rules@example.test");
    for (const expires of ["now() - interval '1 minute'", "now() + interval '9 days'"]) {
        const r = (await issueToken(db, id2, { expires })).r;
        assert(!r.ok && r.error.code === "P0001", expires);
    }
    const malformed = await tryAs(db, "service_role", `update public.leads set marketing_consent_token_hash = 'not-a-hash', marketing_consent_token_expires_at = now() + interval '1 day' where id = ${id2}`);
    assert(!malformed.ok && malformed.error.code === "23514");
    const noRequest = (await issueToken(db, await idOf(db, "two@example.test"))).r;
    assert(!noRequest.ok && noRequest.error.code === "P0001", "token without a request");
    const confirmed = await confirmedLead(db, "already@example.test");
    const forConfirmed = (await issueToken(db, confirmed)).r;
    assert(!forConfirmed.ok && forConfirmed.error.code === "P0001", "token for an active subscriber");
    await db.close();
});

test("one active subscriber per address: a repeated quiz and second confirmation never create a duplicate", async () => {
    const db = await migrated();
    const first = await requestLead(db, "dup@example.test");
    await as(db, "anon", quizInsert("DUP@example.test", ...REQUEST));
    const second = await idOf(db, "DUP@example.test");
    const t1 = (await issueToken(db, first)).token;
    const t2 = (await issueToken(db, second)).token;
    assert.strictEqual((await activate(db, t1)).result.affectedRows, 1);
    const dup = await activate(db, t2);
    assert(!dup.ok && dup.error.code === "23505", "second active consent for the same address");
    assert.strictEqual(Number(await scalar(db, "select count(*) from public.leads where marketing_consent and lower(btrim(email)) = 'dup@example.test'")), 1);
    await db.close();
});


// ---------------------------------------------------------------------
// Withdrawal and unsubscribe
// ---------------------------------------------------------------------

test("authorised withdrawal: service role withdraws with the SERVER time; repeats and never-requested leads change nothing", async () => {
    const db = await migrated();
    const id = await confirmedLead(db, "bye@example.test");
    await as(db, "service_role", `update public.leads set marketing_consent = false, marketing_consent_withdrawn_at = '2001-01-01T00:00:00Z' where id = ${id}`);
    const first = await byId(db, id);
    assert.strictEqual(first.marketing_consent, false);
    assert(near(first.marketing_consent_withdrawn_at), "server time, not the supplied one");
    assert(first.marketing_consent_at && first.marketing_consent_source && first.marketing_consent_version, "evidence kept");
    await as(db, "service_role", `update public.leads set marketing_consent = false, marketing_consent_withdrawn_at = now() + interval '1 day' where id = ${id}`);
    assert.strictEqual(new Date((await byId(db, id)).marketing_consent_withdrawn_at).getTime(), new Date(first.marketing_consent_withdrawn_at).getTime(), "first withdrawal time kept");
    const never = await idOf(db, "three@example.test");
    await as(db, "service_role", `update public.leads set marketing_consent = false, marketing_consent_withdrawn_at = now() where id = ${never}`);
    assert.strictEqual((await byId(db, never)).marketing_consent_withdrawn_at, null);
    await db.close();
});

test("unsubscribe flow (the exact updates of unsubscribe.js): every lead of the address withdrawn, outstanding tokens destroyed, no later activation", async () => {
    const db = await migrated();
    const confirmed = await confirmedLead(db, "same@example.test");
    const pending = await requestLead(db, "Same@example.test");
    const { token } = await issueToken(db, pending);
    await as(db, "anon", quizInsert("SAME@example.test"));
    const plain = await idOf(db, "SAME@example.test");
    const ids = [confirmed, pending, plain];
    await as(db, "service_role", "update public.leads set status = 'Unsubscribed' where id = any($1::bigint[])", [ids]);
    const r = await tryAs(db, "service_role", "update public.leads set marketing_consent = $2, marketing_consent_withdrawn_at = $3, marketing_consent_token_hash = null, marketing_consent_token_expires_at = null where id = any($1::bigint[])", [ids, false, new Date().toISOString()]);
    assert(r.ok && r.result.affectedRows === 3, r.error && r.error.message);
    for (const id of ids) {
        const l = await byId(db, id);
        assert.strictEqual(l.status, "Unsubscribed");
        assert.strictEqual(l.marketing_consent, false);
        assert.strictEqual(l.marketing_consent_token_hash, null, "token destroyed");
    }
    assert((await byId(db, confirmed)).marketing_consent_withdrawn_at);
    assert((await byId(db, pending)).marketing_consent_withdrawn_at, "pending request withdrawn too");
    assert.strictEqual((await byId(db, plain)).marketing_consent_withdrawn_at, null);
    const late = await activate(db, token);
    assert(late.ok && late.result.affectedRows === 0, "confirmed after unsubscribing");
    assert.strictEqual(await active(db), 0, "the lesson query finds nobody");
    await db.close();
});

test("an administrator marking a lead Unsubscribed (CMS) withdraws its consent and destroys its token automatically", async () => {
    const db = await migrated();
    const confirmed = await confirmedLead(db, "cms-a@example.test");
    const pending = await requestLead(db, "cms-b@example.test");
    const { token } = await issueToken(db, pending);
    for (const id of [confirmed, pending]) {
        const r = await tryAs(db, ADMIN, `update public.leads set status = 'Unsubscribed' where id = ${id}`);
        assert(r.ok && r.result.affectedRows === 1, r.error && r.error.message);
        const l = await byId(db, id);
        assert.strictEqual(l.marketing_consent, false);
        assert(l.marketing_consent_withdrawn_at);
        assert.strictEqual(l.marketing_consent_token_hash, null);
    }
    assert.strictEqual((await activate(db, token)).result.affectedRows, 0);
    await db.close();
});

test("request and confirmation evidence is never rewritten — not even by the server or the SQL Editor", async () => {
    const db = await migrated();
    const id = await confirmedLead(db, "kept@example.test");
    for (const who of ["service_role", "postgres"]) {
        for (const set of ["marketing_consent_requested_at = now() - interval '1 day'", "marketing_consent_source = 'quiz_page'", "marketing_consent_version = 'other'", "marketing_consent_at = now() - interval '1 day'"]) {
            const r = await tryAs(db, who, `update public.leads set ${set} where id = ${id}`);
            assert(!r.ok && r.error.code === "P0001", `${who}: ${set}`);
        }
    }
    await db.close();
});


// ---------------------------------------------------------------------
// Purchases and delivery records
// ---------------------------------------------------------------------

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

test("delivery records: customer emails once per purchase and day; confirmation emails once per lead; target rules enforced", async () => {
    const db = await migrated();
    const pid = (await as(db, "service_role", "insert into public.purchases (email, product_code, provider, provider_order_ref, verified_by) values ('buyer@example.test', 'p', 'manual', 'M-1', 'admin: checked') returning id")).rows[0].id;
    await as(db, "service_role", `insert into public.email_deliveries (purchase_id, kind, sequence_day) values ('${pid}', 'customer', 0)`);
    const again = await tryAs(db, "service_role", `insert into public.email_deliveries (purchase_id, kind, sequence_day) values ('${pid}', 'customer', 0)`);
    assert(!again.ok && again.error.code === "23505");
    const leadId = await requestLead(db, "confirm-me@example.test");
    await as(db, "service_role", `insert into public.email_deliveries (lead_id, kind, sequence_day) values (${leadId}, 'confirm', 0)`);
    const confirmAgain = await tryAs(db, "service_role", `insert into public.email_deliveries (lead_id, kind, sequence_day) values (${leadId}, 'confirm', 0)`);
    assert(!confirmAgain.ok && confirmAgain.error.code === "23505", "second confirmation email for the lead");
    const noTarget = await tryAs(db, "service_role", "insert into public.email_deliveries (kind, sequence_day) values ('customer', 3)");
    assert(!noTarget.ok && noTarget.error.code === "23514");
    const confirmNoLead = await tryAs(db, "service_role", "insert into public.email_deliveries (kind, sequence_day) values ('confirm', 0)");
    assert(!confirmNoLead.ok && confirmNoLead.error.code === "23514");
    for (const who of ["anon", A, ADMIN]) {
        const r = await tryAs(db, who, "select * from public.email_deliveries");
        assert(!r.ok && r.error.code === "42501");
    }
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
    await confirmedLead(db, "kept-consent@example.test");
    const gone = await confirmedLead(db, "kept-withdrawal@example.test");
    await as(db, "service_role", `update public.leads set marketing_consent = false where id = ${gone}`);
    const pending = await requestLead(db, "kept-pending@example.test");
    await issueToken(db, pending);
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
    assert.strictEqual(await active(db), 1);
    assert.strictEqual(Number(await scalar(db, "select count(*) from public.leads where marketing_consent_withdrawn_at is not null")), 1);
    assert.strictEqual(Number(await scalar(db, "select count(*) from public.leads where marketing_consent_token_hash is not null")), 1, "pending token kept");
    assert.strictEqual(Number(await scalar(db, "select count(*) from public.purchases")), 1);
    assert.strictEqual(Number(await scalar(db, "select count(*) from public.email_deliveries")), 2);
    // Visitors can no longer submit consent; the quiz itself still works.
    const consent = await tryAs(db, "anon", quizInsert("after-rb@example.test", ...REQUEST));
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
    assert.strictEqual(Number(await scalar(db, "select count(*) from information_schema.columns where table_name = 'leads' and column_name like 'marketing_consent%'")), 8);
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
