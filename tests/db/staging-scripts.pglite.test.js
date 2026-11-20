/* =========================================
   Staging setup scripts — local validation (PGlite, no network)
   -----------------------------------------
   Runs the repository's staging scripts (supabase/staging/) on a local
   database shaped like a freshly imported staging project:
     production-sim schema + all eight migrations, then the objects that a
     schema-only import does NOT bring (signup trigger, bucket) removed, and
     minimal Supabase storage pieces added (storage.objects with RLS,
     storage.foldername, the platform's protect-delete trigger).
   Checks the guards (refusals change nothing) and the happy paths:
     03 refuses on any database other than the reviewed staging baseline;
     04 structural setup, then refuses a second run;
     seed_synthetic.sql guards, seeding and idempotency;
     07 is simulated (three auth.users rows; the signup trigger makes profiles);
     08 promotion + storage policy UUID, then refuses a second run;
     09 supplementary checks: every expectation PASS (39/39).
   The privilege baseline of 03 is specific to the real staging import, so
   only its refusal path can run here.
   Usage: node tests/db/staging-scripts.pglite.test.js
========================================= */
"use strict";

const assert = require("assert");
const S = require("./supabase-sim");
const P = require("./production-sim");

const STAGING_ALIGN = S.read("supabase/staging/03_align_privileges.sql");
const STRUCTURAL = S.read("supabase/staging/04_structural_setup.sql");
const SEED = S.read("supabase/staging/seed_synthetic.sql");
const PROMOTE = S.read("supabase/staging/08_promote_admin_and_storage.sql");
const SUPPLEMENTARY = S.read("supabase/staging/09_supplementary_security_checks.sql");

const FRESH_STAGING_SQL = `
-- the real import has RLS on all 25 tables (the dump enables it on emerriment_private.rls_baseline too)
alter table emerriment_private.rls_baseline enable row level security;
-- what a schema-only import does not bring
drop trigger on_auth_user_created on auth.users;
delete from storage.buckets;
-- minimal Supabase storage (columns the scripts use)
alter table storage.buckets add column avif_autodetection boolean default false;
alter table storage.buckets enable row level security;
grant select, insert, update, delete on storage.buckets to anon, authenticated, service_role;
create table storage.objects (
    id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets (id),
    name text, owner uuid, metadata jsonb, created_at timestamptz default now()
);
alter table storage.objects enable row level security;
grant select, insert, update, delete on storage.objects to anon, authenticated, service_role;
create function storage.foldername(name text) returns text[] language sql immutable as $$
    select (string_to_array(name, '/'))[1:greatest(array_length(string_to_array(name, '/'), 1) - 1, 0)]
$$;
grant execute on function storage.foldername(text) to anon, authenticated, service_role;
-- Supabase's storage.protect_delete: direct SQL deletes are rejected (use the Storage API)
create function storage.protect_delete() returns trigger language plpgsql as $$
begin
    raise exception 'Direct deletion from storage tables is not allowed. Use the Storage API instead.' using errcode = '42501';
end $$;
create trigger protect_objects_delete before delete on storage.objects for each statement execute function storage.protect_delete();
`;

const ACCOUNTS_SQL = `
insert into auth.users (id, email, raw_user_meta_data) values
  (gen_random_uuid(), 'staging-admin@example.test',  '{"full_name":"Staging Admin"}'),
  (gen_random_uuid(), 'staging-user-a@example.test', '{"full_name":"Staging User A"}'),
  (gen_random_uuid(), 'staging-user-b@example.test', '{"full_name":"Staging User B"}');
`;

async function freshStaging() {
    // The migrations need the live data shape (e.g. an administrator) to run, so migrate the seeded
    // copy, then empty it: a schema-only import has no rows at all (incl. emerriment_private.rls_baseline).
    const db = await P.createProductionDatabase({ seed: true });
    await P.applyProductionMigrations(db);
    const tables = (await db.query(`select string_agg(format('%I.%I', n.nspname, c.relname), ', ') as t from pg_class c
        join pg_namespace n on n.oid = c.relnamespace where n.nspname in ('public', 'emerriment_private') and c.relkind = 'r'`)).rows[0].t;
    await db.exec(`truncate table ${tables} cascade; delete from auth.users;`);
    await db.exec(FRESH_STAGING_SQL);
    return db;
}
async function expectRefusal(db, sql, pattern) {
    let message = null;
    try { await db.exec(sql); } catch (error) { message = error.message; }
    try { await db.exec("rollback"); } catch { /* no open transaction */ }   // scripts with begin; leave it aborted
    assert.ok(message, "expected the script to refuse");
    assert.match(message, pattern);
}
const one = async (db, sql) => (await db.query(sql)).rows[0];
async function state(db) {
    return one(db, `select
        (select count(*) from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal)::int as auth_triggers,
        (select count(*) from storage.buckets)::int as buckets,
        (select count(*) from pg_policies where schemaname = 'storage')::int as storage_policies,
        (select count(*) from pg_event_trigger where evtname = 'ensure_rls')::int as ensure_rls,
        (select count(*) from public.profiles where is_admin)::int as admins,
        (select md5(string_agg(c.relname || coalesce(c.relacl::text, ''), ',' order by c.relname)) from pg_class c
          where c.relnamespace = 'public'::regnamespace and c.relkind = 'r') as acl`);
}
async function setUp() {
    const db = await freshStaging();
    await db.exec(STRUCTURAL);
    await db.exec("set emerriment.seed_target = 'staging';\n" + SEED);
    await db.exec(ACCOUNTS_SQL);
    await db.exec(PROMOTE);
    return db;
}

const tests = [];
const test = (title, fn) => tests.push({ title, fn });

test("03 privilege alignment refuses a database that is not the reviewed staging baseline, changing nothing", async () => {
    const db = await freshStaging();
    const before = await state(db);
    await expectRefusal(db, STAGING_ALIGN, /Refusing: anon\/authenticated privileges differ from the reviewed staging baseline/);
    assert.deepStrictEqual(await state(db), before);
    await db.exec("create schema emerriment_backup");
    await expectRefusal(db, STAGING_ALIGN, /Refusing: emerriment_backup exists/);
});

test("04 structural setup creates trigger, bucket, 4 placeholder policies and ensure_rls; a second run refuses", async () => {
    const db = await freshStaging();
    await db.exec(STRUCTURAL);
    const s = await state(db);
    assert.deepStrictEqual([s.auth_triggers, s.buckets, s.storage_policies, s.ensure_rls], [1, 1, 4, 1]);
    const b = await one(db, "select public, file_size_limit::text as l, allowed_mime_types::text as m from storage.buckets where id = 'article-images'");
    assert.deepStrictEqual(b, { public: true, l: "5242880", m: "{image/jpeg,image/png,image/webp,image/gif,image/avif}" });
    const p = await one(db, "select count(*)::int as n from pg_policies where schemaname = 'storage' and coalesce(qual, with_check) like '%00000000-0000-0000-0000-000000000000%'");
    assert.strictEqual(p.n, 4);
    const before = await state(db);
    await expectRefusal(db, STRUCTURAL, /Refusing: auth\.users already has a trigger/);
    assert.deepStrictEqual(await state(db), before);
});

test("04 refuses when this looks like production (emerriment_backup present)", async () => {
    const db = await freshStaging();
    await db.exec("create schema emerriment_backup");
    await expectRefusal(db, STRUCTURAL, /Refusing: emerriment_backup exists/);
    const s = await state(db);
    assert.deepStrictEqual([s.auth_triggers, s.buckets, s.storage_policies, s.ensure_rls], [0, 0, 0, 0]);
});

test("seed refuses without the staging marker and on a production-like database; seeds 3/3/3 once (idempotent)", async () => {
    const db = await freshStaging();
    await expectRefusal(db, SEED, /seed_target/);
    await db.exec("create schema emerriment_backup");
    await expectRefusal(db, "set emerriment.seed_target = 'staging';\n" + SEED, /looks like PRODUCTION/);
    await db.exec("drop schema emerriment_backup");
    await db.exec("set emerriment.seed_target = 'staging';\n" + SEED);
    await db.exec("set emerriment.seed_target = 'staging';\n" + SEED);
    const c = await one(db, `select (select count(*) from public.encyclopedia_articles)::int a, (select count(*) from public.products)::int p,
        (select count(*) from public.leads)::int l, (select count(*) from public.leads where email not like '%@example.test' or marketing_consent)::int bad`);
    assert.deepStrictEqual(c, { a: 3, p: 3, l: 3, bad: 0 });
});

test("signup trigger (from 04) creates non-admin profiles; 08 promotes only the admin and sets the policy UUID; a second run refuses", async () => {
    const db = await freshStaging();
    await db.exec(STRUCTURAL);
    await expectRefusal(db, PROMOTE, /Refusing: auth\.users is not exactly the three synthetic staging accounts/);
    await db.exec(ACCOUNTS_SQL);
    const profiles = await one(db, "select count(*)::int n, count(*) filter (where is_admin)::int admins, count(*) filter (where full_name like 'Staging %')::int named from public.profiles");
    assert.deepStrictEqual(profiles, { n: 3, admins: 0, named: 3 });
    await db.exec(PROMOTE);
    const admin = await one(db, "select id::text from auth.users where email = 'staging-admin@example.test'");
    const r = await one(db, `select (select string_agg(id::text, ',') from public.profiles where is_admin) as admins,
        (select count(*) from pg_policies p, regexp_matches(coalesce(p.qual, '') || ' ' || coalesce(p.with_check, ''),
           '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', 'g') m where p.schemaname = 'storage' and m[1] <> '${admin.id}')::int as other_uuids,
        (select count(*) from pg_policies where schemaname = 'storage' and coalesce(qual, with_check) like '%${admin.id}%')::int as admin_policies`);
    assert.deepStrictEqual(r, { admins: admin.id, other_uuids: 0, admin_policies: 4 });
    const before = await state(db);
    await expectRefusal(db, PROMOTE, /Refusing: profiles are not exactly the three trigger-created, non-admin profiles/);
    assert.deepStrictEqual(await state(db), before);
});

let supplementary = null;
test("09 supplementary checks: all 39 expectations PASS and every fixture is rolled back", async () => {
    const db = await setUp();
    const results = await db.exec(SUPPLEMENTARY);
    const rows = results.find((r) => r.rows && r.rows.length && r.rows[0].test_id !== undefined).rows;
    supplementary = rows;
    const failed = rows.filter((r) => r.result !== "PASS").map((r) => `${r.test_id}: expected ${r.expected}, got ${r.actual}`);
    assert.deepStrictEqual(failed, []);
    assert.strictEqual(rows.length, 39);
    const after = await one(db, "select (select count(*) from public.purchases)::int pu, (select count(*) from storage.objects)::int so, (select count(*) from pg_proc where proname = 'emr_try')::int f");
    assert.deepStrictEqual(after, { pu: 0, so: 0, f: 0 });
});

test("09 detects a weakened storage policy and a non-admin administrator", async () => {
    const db = await setUp();
    await db.exec(`alter policy "Give access to a folder qt2lnz_1" on storage.objects with check (bucket_id = 'article-images');`);
    await db.exec(`update public.profiles set is_admin = true where email = 'staging-user-b@example.test';`);
    const rows = (await db.exec(SUPPLEMENTARY)).find((r) => r.rows && r.rows.length && r.rows[0].test_id !== undefined).rows;
    const failed = rows.filter((r) => r.result !== "PASS").map((r) => r.test_id).sort();
    for (const id of ["STO-05", "STO-06", "SIGNUP-03"]) assert.ok(failed.includes(id), id + " should fail; failed: " + failed.join(","));
});

test("09 refuses on a production-like database and without the staging accounts", async () => {
    const db = await freshStaging();
    await expectRefusal(db, SUPPLEMENTARY, /the three @example\.test staging accounts \(step 07\) are missing/);
    await db.exec("create schema emerriment_backup");
    await expectRefusal(db, SUPPLEMENTARY, /looks like PRODUCTION/);
});

async function run() {
    const started = Date.now();
    let pass = 0, fail = 0;
    console.log("Staging setup scripts (PGlite)");
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
    if (supplementary) {
        const g = {};
        for (const r of supplementary) { const c = r.test_id.split("-")[0]; g[c] = (g[c] || 0) + (r.result === "PASS" ? 1 : 0); }
        console.log("\n09 on the local copy: " + Object.entries(g).map(([k, v]) => `${k} ${v}`).join(", "));
    }
    console.log(`\nstaging scripts validation (PGlite): ${pass} passed, ${fail} failed in ${Math.round((Date.now() - started) / 1000)}s`);
    return { pass, fail };
}

module.exports = { run, tests };

if (require.main === module) {
    run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
