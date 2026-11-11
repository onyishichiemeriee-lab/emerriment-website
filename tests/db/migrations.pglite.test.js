/* =========================================
   EMerriment migration tests on real PostgreSQL (PGlite)
   -----------------------------------------
   Applies the five migrations from supabase/migrations to a disposable
   in-memory database that imitates Supabase (see supabase-sim.js), then
   checks the actual RLS behaviour for anon, signed-in users, admins and
   the service role.

   A pass here means the SQL behaves as designed on PostgreSQL with the
   assumed schema. It does NOT prove the live Supabase database is secure:
   the real schema, existing policies, PostgREST and the auth service are
   not part of this environment. See tests/db/README.md.

   Usage: npm run test:db
========================================= */
"use strict";

const assert = require("assert");
const S = require("./supabase-sim");

const { IDS, as, tryAs, scalar } = S;
const U1 = { user: IDS.user1 };
const U2 = { user: IDS.user2 };
const ADMIN = { user: IDS.admin };

const tests = [];
const test = (title, fn) => tests.push({ title, fn });

// Scenarios for the database state BEFORE the migrations.
const SCENARIOS = {
    "rls-off": {},                              // tables created without RLS
    "legacy-allow-all": { legacyPermissive: true } // RLS on, "allow all" policies
};

async function migrated(options = {}) {
    const db = await S.createDatabase(options);
    await S.applyMigrations(db);
    return db;
}

const rows = (r) => r.result ? r.result.rows : r.rows;
const affected = (r) => (r.result || r).affectedRows;
const denied = (r) => !r.ok && ["42501", "P0001", "23514"].includes(r.error.code);

async function count(db, table) {
    return Number(await scalar(db, `select count(*) from public.${table}`));
}

const HOMEPAGE_LEAD = {
    name: "Ada", email: "ada@example.test", skin_type: "Oily", concern: "Acne",
    oil_level: "High", sensitivity: "Low", score: 50,
    recommendation: "Your skin needs hydration and consistency.",
    quiz_version: "2.0", source: "Skin Quiz", status: "New Lead",
    email_status: "Pending", email_sequence_day: 1
};

async function insertLead(db, who, over = {}) {
    const lead = { ...HOMEPAGE_LEAD, ...over };
    const cols = Object.keys(lead);
    const sql = `insert into public.leads (${cols.join(", ")}) values (${cols.map((_, i) => "$" + (i + 1)).join(", ")})`;
    return tryAs(db, who, sql, Object.values(lead));
}


/* =============== Applying the migrations =============== */

for (const [name, opts] of Object.entries(SCENARIOS)) {
    test(`[${name}] all five migrations apply in the documented order`, async () => {
        const db = await migrated(opts);
        const policies = Number(await scalar(db, "select count(*) from pg_policies where policyname like 'emerriment\\_%'"));
        assert(policies >= 60, "only " + policies + " EMerriment policies");
        assert.strictEqual(await scalar(db, "select to_regprocedure('public.emerriment_is_admin()') is not null"), true);
        await db.close();
    });
}

test("enum status columns: migration 5 adds 'Sending' and 'Unsubscribed'; the service role can then claim a lead", async () => {
    const db = await migrated({ emailStatusType: "lead_email_status", statusType: "lead_status" });
    const labels = (await db.query("select e.enumlabel from pg_enum e join pg_type t on t.oid = e.enumtypid where t.typname in ('lead_email_status','lead_status') order by 1")).rows.map((r) => r.enumlabel);
    for (const v of ["New Lead", "Pending", "Sending", "Sent", "Unsubscribed"]) assert(labels.includes(v), v);
    const r = await as(db, "service_role", "update public.leads set email_status = 'Sending' where email = 'existing@example.test' returning id");
    assert.strictEqual(r.rows.length, 1);
    await db.close();
});

test("CHECK constraint on email_status is NOT altered automatically; 'Sending' stays rejected (send-email then fails closed)", async () => {
    const db = await migrated({ emailStatusCheck: true });
    const r = await tryAs(db, "service_role", "update public.leads set email_status = 'Sending' where email = 'existing@example.test'");
    assert(!r.ok && r.error.code === "23514", "expected a check violation");
    await db.close();
});

// A failed migration leaves its explicit transaction aborted on that
// connection; the SQL Editor uses a new connection per run, psql needs
// ROLLBACK. Tests do the same.
async function expectMigrationFailure(db, file, pattern) {
    await assert.rejects(db.exec(S.migrationSql(file)), pattern);
    await db.exec("rollback");
}

test("failure recovery: migration 1 aborts without an administrator and leaves nothing behind; succeeds once an admin exists", async () => {
    const db = await S.createDatabase({ withoutAdmin: true });
    await expectMigrationFailure(db, S.MIGRATIONS[1], /no administrator profile exists/);
    assert.strictEqual(await scalar(db, "select to_regnamespace('emerriment_private') is null"), true);
    assert.strictEqual(await scalar(db, "select to_regprocedure('public.emerriment_is_admin()') is null"), true);
    await db.exec(`update public.profiles set is_admin = true where id = '${IDS.admin}'`);
    await db.exec(S.migrationSql(S.MIGRATIONS[1]));
    assert.strictEqual(await scalar(db, "select to_regprocedure('public.emerriment_is_admin()') is not null"), true);
    await db.close();
});

test("failure recovery: migrations 2–4 refuse to run before migration 1 and change nothing", async () => {
    const db = await S.createDatabase();
    for (const file of S.MIGRATIONS.slice(2)) {
        await expectMigrationFailure(db, file, /apply migration 20261110090000 first/);
    }
    assert.strictEqual(Number(await scalar(db, "select count(*) from pg_policies where policyname like 'emerriment\\_%'")), 0);
    assert.strictEqual(await scalar(db, "select relrowsecurity from pg_class where oid = 'public.leads'::regclass"), false);
    await db.close();
});

test("migration 1 refuses to run when profiles uses FORCE ROW LEVEL SECURITY", async () => {
    const db = await S.createDatabase({ forceProfilesRls: true });
    await expectMigrationFailure(db, S.MIGRATIONS[1], /FORCE ROW LEVEL SECURITY/);
    assert.strictEqual(await scalar(db, "select to_regnamespace('emerriment_private') is null"), true);
    await db.close();
});

for (const [name, opts] of Object.entries(SCENARIOS)) {
    test(`[${name}] re-running every migration is safe and keeps the ORIGINAL RLS baseline`, async () => {
        const db = await migrated(opts);
        const before = (await db.query("select table_name, rls_enabled from emerriment_private.rls_baseline order by 1")).rows;
        const policiesBefore = await scalar(db, "select count(*) from pg_policies");
        await S.applyMigrations(db);
        await S.applyMigrations(db);
        const after = (await db.query("select table_name, rls_enabled from emerriment_private.rls_baseline order by 1")).rows;
        assert.deepStrictEqual(after, before);
        assert.strictEqual(await scalar(db, "select count(*) from pg_policies"), policiesBefore);
        const expected = name === "rls-off" ? false : true;
        assert(before.length >= 20, "baseline rows: " + before.length);
        assert(before.every((r) => r.rls_enabled === expected), "baseline must record the pre-migration state");
        assert(before.every((r) => r.table_name.startsWith("public.")), "schema-qualified names");
        await db.close();
    });
}

test("the read-only audit and verification SQL run without errors and change no data", async () => {
    const db = await S.createDatabase();
    const counts = async () => Promise.all(["leads", "profiles", "quiz_results"].map((t) => count(db, t)));
    const before = await counts();
    await db.exec(S.read("supabase/audit/01_read_only_security_audit.sql"));
    await S.applyMigrations(db);
    await db.exec(S.read("supabase/audit/01_read_only_security_audit.sql"));
    await db.exec(S.read("supabase/audit/02_post_migration_verification.sql"));
    assert.deepStrictEqual(await counts(), before);
    await db.close();
});


/* =============== Leads privacy =============== */

for (const [name, opts] of Object.entries(SCENARIOS)) {
    test(`[${name}] anonymous quiz visitors can insert a lead (homepage payload)`, async () => {
        const db = await migrated(opts);
        const r = await insertLead(db, "anon", { next_email_due: new Date(Date.now() + 864e5).toISOString() });
        assert(r.ok, r.error && r.error.message);
        assert.strictEqual(await count(db, "leads"), 2);
        await db.close();
    });

    test(`[${name}] anon and ordinary users cannot read, change or delete leads`, async () => {
        const db = await migrated(opts);
        for (const who of ["anon", U1]) {
            assert.strictEqual(rows(await as(db, who, "select * from public.leads")).length, 0, "select");
            assert.strictEqual(affected(await as(db, who, "update public.leads set name = 'x'")), 0, "update");
            assert.strictEqual(affected(await as(db, who, "delete from public.leads")), 0, "delete");
        }
        assert.strictEqual(await scalar(db, "select name from public.leads where email = 'existing@example.test'"), "Existing");
        assert.strictEqual(await count(db, "leads"), 1);
        await db.close();
    });

    test(`[${name}] inserting with RETURNING (old .select() read-back) is refused for visitors`, async () => {
        const db = await migrated(opts);
        const r = await tryAs(db, "anon", "insert into public.leads (name, email) values ('A', 'a@example.test') returning *");
        assert(!r.ok && r.error.code === "42501", "read-back must be refused (quiz pages no longer do this)");
        await db.close();
    });
}

test("visitor-supplied email state is normalised on insert", async () => {
    const db = await migrated();
    const r = await insertLead(db, "anon", {
        email: "tamper@example.test", email_status: "Sent", last_email_sent: new Date().toISOString(),
        email_sequence_day: 9, status: "Unsubscribed", next_email_due: new Date().toISOString(),
        submitted_at: "2000-01-01T00:00:00Z"
    });
    assert(r.ok, r.error && r.error.message);
    const lead = (await db.query("select * from public.leads where email = 'tamper@example.test'")).rows[0];
    assert.strictEqual(lead.email_status, "Pending");
    assert.strictEqual(lead.last_email_sent, null);
    assert.strictEqual(lead.email_sequence_day, 1);
    assert.strictEqual(lead.status, "New Lead");
    assert(new Date(lead.next_email_due).getTime() > Date.now() + 23 * 3600e3, "first lesson pushed ~24h out");
    assert(Math.abs(new Date(lead.submitted_at).getTime() - Date.now()) < 60e3, "server time, not browser time");
    await db.close();
});

test("lead content limits: invalid email, oversized name/recommendation are rejected", async () => {
    const db = await migrated();
    for (const over of [{ email: "x" }, { email: "no-at-sign" }, { email: null }, { email: "a".repeat(250) + "@x.io" },
        { name: "n".repeat(101) }, { recommendation: "r".repeat(1001) }]) {
        const r = await insertLead(db, "anon", over);
        assert(denied(r), "accepted " + JSON.stringify(over).slice(0, 60));
    }
    await db.close();
});

test("rate limit: 3 leads per address per 10 minutes (case and spaces ignored); other addresses unaffected", async () => {
    const db = await migrated();
    for (const email of ["ada@example.test", " ADA@example.test", "Ada@Example.Test "]) {
        const r = await insertLead(db, "anon", { email });
        assert(r.ok, r.error && r.error.message);
    }
    const fourth = await insertLead(db, "anon", { email: "ada@example.test" });
    assert(!fourth.ok && /Too many quiz submissions/.test(fourth.error.message));
    assert((await insertLead(db, "anon", { email: "bob@example.test" })).ok);
    await db.close();
});

test("rate limit: the service role and administrators are not limited", async () => {
    const db = await migrated();
    for (let i = 0; i < 5; i++) {
        assert((await insertLead(db, "service_role", { email: "svc@example.test" })).ok);
        assert((await insertLead(db, ADMIN, { email: "adm@example.test" })).ok);
    }
    await db.close();
});

test("administrators can read, update and delete leads (CMS subscribers page)", async () => {
    const db = await migrated();
    assert.strictEqual(rows(await as(db, ADMIN, "select * from public.leads")).length, 1);
    assert.strictEqual(affected(await as(db, ADMIN, "update public.leads set emails_sent = 1")), 1);
    assert.strictEqual(affected(await as(db, ADMIN, "delete from public.leads")), 1);
    await db.close();
});

test("the service role (Netlify functions) reads and claims leads as before", async () => {
    const db = await migrated();
    const r = await as(db, "service_role",
        "update public.leads set email_status = 'Sending' where email = 'existing@example.test' and email_status = 'Sent' returning id");
    assert.strictEqual(r.rows.length, 1);
    assert.strictEqual(rows(await as(db, "service_role", "select * from public.leads")).length, 1);
    await db.close();
});


/* =============== Profiles and admin privileges =============== */

test("profiles: users see only their own; anonymous visitors see none", async () => {
    const db = await migrated({ legacyPermissive: true });
    assert.deepStrictEqual(rows(await as(db, U1, "select id from public.profiles")).map((r) => r.id), [IDS.user1]);
    assert.strictEqual(rows(await as(db, "anon", "select id from public.profiles")).length, 0);
    assert.strictEqual(rows(await as(db, ADMIN, "select id from public.profiles")).length, 3);
    await db.close();
});

test("self-promotion is blocked: a user cannot set is_admin on their own profile", async () => {
    const db = await migrated({ legacyPermissive: true });
    const r = await tryAs(db, U1, `update public.profiles set is_admin = true where id = '${IDS.user1}'`);
    assert(!r.ok && /Only an administrator/.test(r.error.message));
    assert.strictEqual(await scalar(db, `select is_admin from public.profiles where id = '${IDS.user1}'`), false);
    await db.close();
});

test("ordinary profile edits still work; other users' profiles cannot be changed", async () => {
    const db = await migrated({ legacyPermissive: true });
    assert.strictEqual(affected(await as(db, U1, `update public.profiles set full_name = 'New Name' where id = '${IDS.user1}'`)), 1);
    assert.strictEqual(affected(await as(db, U1, `update public.profiles set full_name = 'Hacked' where id = '${IDS.user2}'`)), 0);
    assert.strictEqual(await scalar(db, `select full_name from public.profiles where id = '${IDS.user2}'`), "User Two");
    await db.close();
});

test("profile creation: own row only, never as administrator", async () => {
    const db = await migrated({ legacyPermissive: true });
    await db.exec(`insert into auth.users (id) values ('00000000-0000-4000-8000-000000000003')`);
    const other = await tryAs(db, U1, "insert into public.profiles (id, full_name) values ('00000000-0000-4000-8000-000000000003', 'x')");
    assert(denied(other), "created another user's profile");
    await db.exec(`delete from public.profiles where id = '${IDS.user1}'`);
    const admin = await tryAs(db, U1, `insert into public.profiles (id, full_name, is_admin) values ('${IDS.user1}', 'x', true)`);
    assert(!admin.ok && /administrator profile/.test(admin.error.message));
    const own = await tryAs(db, U1, `insert into public.profiles (id, full_name) values ('${IDS.user1}', 'Me') on conflict (id) do update set full_name = excluded.full_name`);
    assert(own.ok, own.error && own.error.message); // admin/auth.js upsert pattern
    await db.close();
});

test("signup trigger path: the auth service (no JWT) can create profiles", async () => {
    const db = await migrated();
    await db.exec("insert into auth.users (id) values ('00000000-0000-4000-8000-000000000004')");
    // As the table owner with no JWT claims — how Supabase signup triggers
    // (SECURITY DEFINER handle_new_user) usually run. The real
    // supabase_auth_admin role is not reproduced here.
    await db.exec("insert into public.profiles (id, full_name) values ('00000000-0000-4000-8000-000000000004', 'New')");
    assert.strictEqual(await count(db, "profiles"), 4);
    await db.close();
});

test("administrators can grant and remove admin access for others (CMS toggle)", async () => {
    const db = await migrated();
    assert.strictEqual(affected(await as(db, ADMIN, `update public.profiles set is_admin = true where id = '${IDS.user1}'`)), 1);
    assert.strictEqual(affected(await as(db, ADMIN, `update public.profiles set is_admin = false where id = '${IDS.user1}'`)), 1);
    await db.close();
});

for (const [name, opts] of Object.entries(SCENARIOS)) {
    test(`[${name}] last administrator cannot be demoted or deleted — by an admin, the service role or the SQL editor`, async () => {
        const db = await migrated(opts);
        for (const who of [ADMIN, "service_role", "postgres"]) {
            const demote = await tryAs(db, who, `update public.profiles set is_admin = false where id = '${IDS.admin}'`);
            assert(!demote.ok && /last administrator/.test(demote.error.message), "demote as " + JSON.stringify(who));

            const del = await tryAs(db, who, `delete from public.profiles where id = '${IDS.admin}'`);
            if (who === ADMIN && name === "rls-off") {
                // No policy grants profile deletion through the API (the CMS
                // never deletes profiles), so the row is simply not affected.
                assert(del.ok && affected(del) === 0, "admin API delete should affect nothing");
            } else {
                // Wherever a delete would otherwise be allowed (service role,
                // SQL editor, pre-existing allow-all policies) the trigger stops it.
                assert(!del.ok && /last administrator/.test(del.error.message), "delete as " + JSON.stringify(who));
            }
        }
        assert.strictEqual(await scalar(db, `select is_admin from public.profiles where id = '${IDS.admin}'`), true);
        await db.close();
    });
}

test("deleting the last administrator's auth account is blocked too (cascade fires the guard)", async () => {
    const db = await migrated();
    await assert.rejects(db.exec(`delete from auth.users where id = '${IDS.admin}'`), /last administrator/);
    assert.strictEqual(await count(db, "profiles"), 3);
    await db.close();
});

test("with two administrators, one can be removed; then the remaining one is protected", async () => {
    const db = await migrated();
    await db.exec(`insert into public.profiles (id, full_name, is_admin) values ('${IDS.admin2}', 'Admin 2', true)`);
    assert.strictEqual(affected(await as(db, ADMIN, `update public.profiles set is_admin = false where id = '${IDS.admin2}'`)), 1);
    const last = await tryAs(db, ADMIN, `update public.profiles set is_admin = false where id = '${IDS.admin}'`);
    assert(!last.ok && /last administrator/.test(last.error.message));
    await db.close();
});

test("ordinary users cannot delete profiles", async () => {
    const db = await migrated({ legacyPermissive: true });
    assert.strictEqual(affected(await as(db, U1, `delete from public.profiles where id = '${IDS.user1}'`)), 0);
    assert.strictEqual(await count(db, "profiles"), 3);
    await db.close();
});


/* =============== Per-user data =============== */

for (const [name, opts] of Object.entries(SCENARIOS)) {
    test(`[${name}] quiz_results: own rows only; no writes into other users' rows; admins see all`, async () => {
        const db = await migrated(opts);
        assert.deepStrictEqual(rows(await as(db, U1, "select user_id from public.quiz_results")).map((r) => r.user_id), [IDS.user1]);
        assert.strictEqual(rows(await as(db, "anon", "select * from public.quiz_results")).length, 0);
        const forged = await tryAs(db, U1, `insert into public.quiz_results (user_id, score) values ('${IDS.user2}', 1)`);
        assert(denied(forged), "inserted a row for another user");
        assert.strictEqual(affected(await as(db, U1, `update public.quiz_results set score = 0 where user_id = '${IDS.user2}'`)), 0);
        assert((await tryAs(db, U1, `insert into public.quiz_results (user_id, score) values ('${IDS.user1}', 70)`)).ok, "own insert");
        assert.strictEqual(rows(await as(db, ADMIN, "select * from public.quiz_results")).length, 3);
        await db.close();
    });

    test(`[${name}] reading_history: users see only their own rows`, async () => {
        const db = await migrated(opts);
        assert.deepStrictEqual(rows(await as(db, U2, "select user_id from public.reading_history")).map((r) => r.user_id), [IDS.user2]);
        await db.close();
    });

    test(`[${name}] ai_messages: visible only through your own conversation`, async () => {
        const db = await migrated(opts);
        assert.deepStrictEqual(rows(await as(db, U1, "select content from public.ai_messages")).map((r) => r.content), ["mine"]);
        const intoOther = await tryAs(db, U1, `insert into public.ai_messages (conversation_id, role, content) values ('${IDS.conv2}', 'user', 'x')`);
        assert(denied(intoOther), "wrote into another user's conversation");
        assert((await tryAs(db, U1, `insert into public.ai_messages (conversation_id, role, content) values ('${IDS.conv1}', 'user', 'ok')`)).ok);
        await db.close();
    });

    test(`[${name}] article ratings stay readable by everyone; writes are owner-only`, async () => {
        const db = await migrated(opts);
        assert.strictEqual(rows(await as(db, "anon", "select rating from public.article_ratings")).length, 1, "average rating must stay visible");
        const forged = await tryAs(db, U1, `insert into public.article_ratings (user_id, article_id, rating) values ('${IDS.user2}', '${IDS.article}', 1)`);
        assert(denied(forged));
        assert((await tryAs(db, U2, `insert into public.article_ratings (user_id, article_id, rating) values ('${IDS.user2}', '${IDS.article}', 5)`)).ok);
        await db.close();
    });
}


/* =============== Content and admin-only tables =============== */

for (const [name, opts] of Object.entries(SCENARIOS)) {
    test(`[${name}] articles: public can read but not edit; admins can edit`, async () => {
        const db = await migrated(opts);
        assert.strictEqual(rows(await as(db, "anon", "select title from public.encyclopedia_articles")).length, 1, "public read");
        for (const who of ["anon", U1]) {
            const r = await tryAs(db, who, "update public.encyclopedia_articles set content = 'defaced', views = 999");
            assert(!r.ok || affected(r) === 0, "edited by " + JSON.stringify(who));
            const ins = await tryAs(db, who, "insert into public.encyclopedia_articles (title) values ('spam')");
            assert(denied(ins), "inserted by " + JSON.stringify(who));
        }
        assert.strictEqual(await scalar(db, "select content from public.encyclopedia_articles"), "Original content");
        assert.strictEqual(affected(await as(db, ADMIN, "update public.encyclopedia_articles set title = 'Acne (updated)'")), 1);
        await db.close();
    });

    test(`[${name}] view counter: anyone can add exactly one view through the function`, async () => {
        const db = await migrated(opts);
        const r = await as(db, "anon", "select public.emerriment_increment_article_views($1) as views", [IDS.article]);
        assert.strictEqual(r.rows[0].views, 6);
        await as(db, U1, "select public.emerriment_increment_article_views($1)", [IDS.article]);
        assert.strictEqual(await scalar(db, "select views from public.encyclopedia_articles"), 7);
        assert.strictEqual(await scalar(db, "select content from public.encyclopedia_articles"), "Original content");
        await db.close();
    });

    test(`[${name}] settings and analytics tables are admin-only`, async () => {
        const db = await migrated(opts);
        for (const who of ["anon", U1]) {
            assert.strictEqual(rows(await as(db, who, "select * from public.website_settings")).length, 0);
            assert(denied(await tryAs(db, who, "insert into public.ai_settings (setting_key) values ('x')")));
            assert(denied(await tryAs(db, who, "insert into public.product_clicks (product) values ('x')")));
        }
        assert.strictEqual(rows(await as(db, ADMIN, "select * from public.website_settings")).length, 1);
        assert.strictEqual(affected(await as(db, ADMIN, "update public.website_settings set setting_value = 'EM'")), 1);
        assert((await tryAs(db, "service_role", "insert into public.product_clicks (product) values ('Glow')")).ok, "track-click uses the service role");
        await db.close();
    });
}


/* =============== Email delivery records =============== */

test("email_deliveries: unique per (lead, kind, day); a second reservation fails with 23505", async () => {
    const db = await migrated();
    const leadId = await scalar(db, "select id from public.leads limit 1");
    const reserve = (kind, day) => tryAs(db, "service_role",
        "insert into public.email_deliveries (lead_id, kind, sequence_day) values ($1, $2, $3) returning id", [leadId, kind, day]);
    assert((await reserve("report", 0)).ok);
    const dup = await reserve("report", 0);
    assert(!dup.ok && dup.error.code === "23505");
    assert((await reserve("sequence", 1)).ok);
    assert((await reserve("sequence", 2)).ok);
    const dupLesson = await reserve("sequence", 2);
    assert(!dupLesson.ok && dupLesson.error.code === "23505");
    for (const [kind, day] of [["newsletter", 0], ["sequence", 15], ["sequence", -1]]) {
        assert(!(await reserve(kind, day)).ok, `accepted ${kind}/${day}`);
    }
    await db.close();
});

test("email_deliveries: completing and releasing a reservation work for the service role", async () => {
    const db = await migrated();
    const leadId = await scalar(db, "select id from public.leads limit 1");
    const id = (await as(db, "service_role", "insert into public.email_deliveries (lead_id, kind, sequence_day) values ($1, 'sequence', 3) returning id", [leadId])).rows[0].id;
    assert.strictEqual(affected(await as(db, "service_role", "update public.email_deliveries set status = 'sent', provider_message_id = 'em_1', sent_at = now() where id = $1 and status = 'sending'", [id])), 1);
    assert.strictEqual(affected(await as(db, "service_role", "delete from public.email_deliveries where id = $1 and status = 'sending'", [id])), 0, "a sent record is never released");
    await db.close();
});

test("email_deliveries: not accessible to visitors or signed-in users at all", async () => {
    const db = await migrated();
    for (const who of ["anon", U1, ADMIN]) {
        const r = await tryAs(db, who, "select * from public.email_deliveries");
        assert(!r.ok && r.error.code === "42501", "readable by " + JSON.stringify(who));
    }
    await db.close();
});

test("email_deliveries: deleting a lead removes its delivery records", async () => {
    const db = await migrated();
    const leadId = await scalar(db, "select id from public.leads limit 1");
    await as(db, "service_role", "insert into public.email_deliveries (lead_id, kind, sequence_day) values ($1, 'report', 0)", [leadId]);
    await as(db, ADMIN, "delete from public.leads where id = $1", [leadId]);
    assert.strictEqual(await count(db, "email_deliveries"), 0);
    await db.close();
});


/* =============== Private helpers =============== */

test("private helper schema is not reachable by API roles", async () => {
    const db = await migrated();
    for (const who of ["anon", U1]) {
        const r = await tryAs(db, who, "select * from emerriment_private.rls_baseline");
        assert(!r.ok && r.error.code === "42501");
        const f = await tryAs(db, who, "select emerriment_private.enable_rls('public.leads')");
        assert(!f.ok && f.error.code === "42501");
    }
    await db.close();
});

test("request_role reads both PostgREST JWT setting formats", async () => {
    const db = await migrated();
    await db.exec("begin");
    await db.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify({ role: "anon" })]);
    assert.strictEqual(await scalar(db, "select emerriment_private.request_role()"), "anon");
    await db.exec("rollback");
    await db.exec("begin");
    await db.query("select set_config('request.jwt.claim.role', 'authenticated', true)");
    assert.strictEqual(await scalar(db, "select emerriment_private.request_role()"), "authenticated");
    await db.exec("rollback");
    assert.strictEqual(await scalar(db, "select emerriment_private.request_role()"), "");
    await db.close();
});


/* =============== Rollback =============== */

test("[rls-off] rollback restores the previous state exactly (RLS off, no EMerriment objects, data intact)", async () => {
    const db = await migrated();
    await insertLead(db, "anon");
    const leadsBefore = await count(db, "leads");
    await S.applyRollback(db);
    assert.strictEqual(Number(await scalar(db, "select count(*) from pg_policies where policyname like 'emerriment\\_%'")), 0);
    assert.strictEqual(Number(await scalar(db, "select count(*) from pg_trigger where tgname like 'emerriment\\_%'")), 0);
    assert.strictEqual(Number(await scalar(db, "select count(*) from pg_proc where proname like 'emerriment\\_%'")), 0);
    assert.strictEqual(await scalar(db, "select to_regnamespace('emerriment_private') is null"), true);
    assert.strictEqual(await scalar(db, "select to_regclass('public.email_deliveries') is null"), true);
    const rlsOn = (await db.query(`select relname from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r' and relrowsecurity`)).rows;
    assert.deepStrictEqual(rlsOn, [], "RLS must be switched back off");
    assert.strictEqual(await count(db, "leads"), leadsBefore, "no data lost");
    // Previous (open) behaviour is back — the site keeps working after a rollback.
    assert.strictEqual(rows(await as(db, "anon", "select * from public.encyclopedia_articles")).length, 1);
    assert((await insertLead(db, "anon", { email: "after@example.test" })).ok);
    await db.close();
});

test("[legacy-allow-all] rollback keeps RLS on and the pre-existing policies untouched", async () => {
    const db = await migrated({ legacyPermissive: true });
    await S.applyRollback(db);
    const legacy = Number(await scalar(db, "select count(*) from pg_policies where policyname = 'legacy allow all'"));
    assert.strictEqual(legacy, S.APP_TABLES.length);
    const rlsOff = (await db.query(`select relname from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r' and not relrowsecurity and relname = any($1)`, [S.APP_TABLES])).rows;
    assert.deepStrictEqual(rlsOff, []);
    await db.close();
});

test("rollback then re-apply works (and records a fresh baseline)", async () => {
    const db = await migrated();
    await S.applyRollback(db);
    await S.applyMigrations(db);
    assert.strictEqual(rows(await as(db, "anon", "select * from public.leads")).length, 0);
    assert.strictEqual(await scalar(db, "select bool_or(rls_enabled) from emerriment_private.rls_baseline"), false);
    await db.close();
});


/* =============== Runner =============== */

(async () => {
    const PGlite = await S.loadPGlite();
    const probe = await PGlite.create();
    const version = await scalar(probe, "select version()");
    await probe.close();
    process.stdout.write(`\n# migrations on PGlite — ${version}\n`);
    let pass = 0;
    let fail = 0;
    const started = Date.now();
    // Optional: DB_TEST_FILTER="text" runs only tests whose title contains it.
    const filter = process.env.DB_TEST_FILTER;
    for (const t of tests.filter((x) => !filter || x.title.includes(filter))) {
        try {
            await t.fn();
            pass++;
            process.stdout.write(`PASS  ${t.title}\n`);
        } catch (e) {
            fail++;
            process.stdout.write(`FAIL  ${t.title}\n      ${e && (e.message || e)}\n`);
        }
    }
    process.stdout.write(`migrations (PGlite): ${pass} passed, ${fail} failed in ${Math.round((Date.now() - started) / 1000)}s\n`);
    process.exit(fail ? 1 : 0);
})();
