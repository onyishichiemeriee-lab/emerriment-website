/* =========================================
   EMerriment — migrations against the PRODUCTION-SHAPED database
   -----------------------------------------
   Builds the live schema, policies and grants (tests/db/production-sim.js),
   checks that the live weaknesses are reproduced, applies all seven
   migrations in filename order, then checks every table as:
     anonymous visitor · user A · user B · administrator · service role
   using the same role switch + JWT claims PostgREST uses (not the
   privileged SQL editor role).

   A pass shows the SQL behaves as designed on PostgreSQL 17 (PGlite) with
   the live schema. It is not a substitute for the post-migration checks
   on Supabase itself (supabase/audit/03_live_rls_role_checks.sql).

   Usage: npm run test:db
========================================= */
"use strict";

const assert = require("assert");
const S = require("./supabase-sim");
const P = require("./production-sim");

const { as, tryAs, scalar } = S;
const { ID } = P;
const A = { user: ID.userA };
const B = { user: ID.userB };
const ADMIN = { user: ID.admin };

const tests = [];
const test = (title, fn) => tests.push({ title, fn });

const PRIVATE_OWNER_TABLES = [
    "quiz_results", "reading_history", "saved_articles", "saved_products", "favorite_articles",
    "ai_conversations", "ai_messages", "ai_memory", "article_ratings"
];
const ADMIN_ONLY_TABLES = [
    "ai_events", "ai_feedback", "ai_questions", "ai_settings", "website_settings",
    "product_clicks", "collections", "collection_articles"
];

async function live() {
    return P.createProductionDatabase();
}

async function migrated() {
    const db = await P.createProductionDatabase();
    await P.applyProductionMigrations(db);
    return db;
}

// Rows visible to `who`; a permission error counts as "nothing visible".
async function visible(db, who, sql) {
    const r = await tryAs(db, who, sql);
    if (!r.ok) {
        assert.strictEqual(r.error.code, "42501", "unexpected error: " + r.error.message);
        return [];
    }
    return r.result.rows;
}

// Number of rows a write changed; refusal (permission / RLS check) = 0.
async function changed(db, who, sql) {
    const r = await tryAs(db, who, sql);
    if (!r.ok) {
        assert(["42501", "P0001", "23514"].includes(r.error.code), "unexpected error: " + r.error.message);
        return 0;
    }
    return r.result.affectedRows;
}

async function refused(db, who, sql) {
    const r = await tryAs(db, who, sql);
    return !r.ok && ["42501", "P0001"].includes(r.error.code);
}

const n = async (db, sql) => Number(await scalar(db, sql));


/* ============ 1. The live weaknesses are reproduced ============ */

test("LIVE STATE: anyone can read every lead (names and email addresses)", async () => {
    const db = await live();
    assert.strictEqual((await visible(db, "anon", "select email from public.leads")).length, 3);
    await db.close();
});

test("LIVE STATE: a signed-in user can make themselves an administrator", async () => {
    const db = await live();
    assert.strictEqual(await changed(db, A, `update public.profiles set is_admin = true where id = '${ID.userA}'`), 1);
    await db.close();
});

test("LIVE STATE: ai_events is publicly readable; leads have no id; products and ratings are unreadable to the website", async () => {
    const db = await live();
    assert.strictEqual((await visible(db, "anon", "select * from public.ai_events")).length, 1);
    assert.strictEqual(await n(db, "select count(*) from public.leads where id is null"), 3);
    assert.strictEqual((await visible(db, "anon", "select * from public.products")).length, 0);
    assert.strictEqual((await visible(db, "anon", "select * from public.article_ratings")).length, 0);
    await db.close();
});

test("LIVE STATE: user A can add a message to user B's conversation", async () => {
    const db = await live();
    assert.strictEqual(await changed(db, A,
        `insert into public.ai_messages (conversation_id, user_id, role, content) values ('${ID.convB}', '${ID.userA}', 'user', 'injected')`), 1);
    await db.close();
});


/* ============ 2. Applying the migrations ============ */

test("all seven migrations apply in filename order and can be re-applied safely", async () => {
    const db = await migrated();
    const policies = await n(db, "select count(*) from pg_policies where schemaname = 'public'");
    await P.applyProductionMigrations(db);
    assert.strictEqual(await n(db, "select count(*) from pg_policies where schemaname = 'public'"), policies);
    assert.strictEqual(await n(db, "select count(*) from public.profiles where is_admin"), 1);
    await db.close();
});

test("live policies are kept (none dropped); RLS stays enabled on all 22 tables", async () => {
    const db = await migrated();
    assert.strictEqual(await n(db, "select count(*) from pg_policies where schemaname = 'public' and policyname not like 'emerriment\\_%'"), 27);
    assert.strictEqual(await n(db, `select count(*) from pg_class where relnamespace = 'public'::regnamespace
        and relname = any (array[${P.TABLES.map((t) => `'${t}'`).join(",")}]) and relrowsecurity`), 22);
    await db.close();
});

test("leads repair: every lead gets a unique id (oldest first), a primary key, and new leads are numbered automatically", async () => {
    const db = await live();
    const before = (await db.query("select name, email, submitted_at from public.leads order by submitted_at")).rows;
    await P.applyProductionMigrations(db);
    const after = (await db.query("select id, name, email, submitted_at from public.leads order by submitted_at")).rows;
    assert.deepStrictEqual(after.map((r) => Number(r.id)), [1, 2, 3]);
    assert.deepStrictEqual(after.map(({ name, email, submitted_at }) => ({ name, email, submitted_at })), before, "personal fields unchanged");
    assert.strictEqual(await scalar(db, "select contype from pg_constraint where conrelid = 'public.leads'::regclass and contype = 'p'"), "p");
    await as(db, "service_role", "insert into public.leads (name, email) values ('New', 'new@example.test')");
    assert.strictEqual(await n(db, "select id from public.leads where email = 'new@example.test'"), 4);
    await db.close();
});

test("leads repair: quoted state values are cleaned and the defaults fixed", async () => {
    const db = await migrated();
    const states = (await db.query("select distinct email_status, status, source, quiz_version from public.leads")).rows;
    assert.deepStrictEqual(states, [{ email_status: "Pending", status: "New Lead", source: "Skin Quiz", quiz_version: "2.0" }]);
    await as(db, "service_role", "insert into public.leads (name, email) values ('D', 'd@example.test')");
    assert.strictEqual(await scalar(db, "select email_status from public.leads where email = 'd@example.test'"), "Pending");
    await db.close();
});

test("email_deliveries is created with a foreign key to leads.id (bigint) and is service-role only", async () => {
    const db = await migrated();
    assert.strictEqual(await scalar(db, "select format_type(atttypid, atttypmod) from pg_attribute where attrelid = 'public.email_deliveries'::regclass and attname = 'lead_id'"), "bigint");
    await as(db, "service_role", "insert into public.email_deliveries (lead_id, kind) values (1, 'report')");
    const dup = await tryAs(db, "service_role", "insert into public.email_deliveries (lead_id, kind) values (1, 'report')");
    assert(!dup.ok && dup.error.code === "23505", "second report for the same lead must be refused");
    for (const who of ["anon", A, ADMIN]) {
        assert.strictEqual((await visible(db, who, "select * from public.email_deliveries")).length, 0);
    }
    await db.close();
});


/* ============ 3. Anonymous visitors ============ */

test("anon: no access to any private or admin-only table (read, insert, update, delete)", async () => {
    const db = await migrated();
    for (const t of ["profiles", ...PRIVATE_OWNER_TABLES, ...ADMIN_ONLY_TABLES, "leads"]) {
        assert.strictEqual((await visible(db, "anon", `select * from public.${t}`)).length, 0, "read " + t);
        assert.strictEqual(await changed(db, "anon", `update public.${t} set id = id`), 0, "update " + t);
        assert.strictEqual(await changed(db, "anon", `delete from public.${t}`), 0, "delete " + t);
    }
    assert(await refused(db, "anon", `insert into public.quiz_results (user_id, score) values ('${ID.userA}', 1)`));
    assert(await refused(db, "anon", `insert into public.profiles (id) values ('${ID.userA}')`));
    assert(await refused(db, "anon", "insert into public.ai_events default values"));
    await db.close();
});

test("anon: TRUNCATE is refused on every table", async () => {
    const db = await migrated();
    for (const t of P.TABLES) {
        assert(await refused(db, "anon", `truncate public.${t} cascade`), t);
        assert(await refused(db, A, `truncate public.${t} cascade`), t);
    }
    await db.close();
});

test("anon: reads published articles only, approved products only, and links between the two only", async () => {
    const db = await migrated();
    assert.deepStrictEqual((await visible(db, "anon", "select slug from public.encyclopedia_articles")).map((r) => r.slug), ["acne"]);
    assert.deepStrictEqual((await visible(db, "anon", "select name from public.products")).map((r) => r.name), ["Approved cleanser"]);
    const links = await visible(db, "anon", "select article_id, product_id from public.article_products");
    assert.deepStrictEqual(links, [{ article_id: ID.published, product_id: ID.approved }]);
    for (const t of ["encyclopedia_articles", "products", "article_products"]) {
        assert.strictEqual(await changed(db, "anon", `update public.${t} set id = id`), 0, t);
        assert.strictEqual(await changed(db, "anon", `delete from public.${t}`), 0, t);
    }
    await db.close();
});

test("anon: article rating summary gives the average and count only, and only for published articles", async () => {
    const db = await migrated();
    const r = (await as(db, "anon", `select * from public.emerriment_article_rating_summary('${ID.published}')`)).rows[0];
    assert.strictEqual(Number(r.average), 3);
    assert.strictEqual(r.total, 2);
    assert.deepStrictEqual(Object.keys(r).sort(), ["average", "total"]);
    const d = (await as(db, "anon", `select * from public.emerriment_article_rating_summary('${ID.draft}')`)).rows[0];
    assert.strictEqual(d.total, 0);
    await db.close();
});

test("anon: the view counter adds exactly 1 to a published article and nothing to a draft", async () => {
    const db = await migrated();
    assert.strictEqual((await as(db, "anon", `select public.emerriment_increment_article_views('${ID.published}') v`)).rows[0].v, 6);
    assert.strictEqual((await as(db, "anon", `select public.emerriment_increment_article_views('${ID.draft}') v`)).rows[0].v, null);
    assert.strictEqual(await n(db, `select views from public.encyclopedia_articles where id = '${ID.draft}'`), 0);
    await db.close();
});

test("anon: the homepage quiz insert works (homepage payload); counters and read-back are refused", async () => {
    const db = await migrated();
    const ok = await tryAs(db, "anon", `insert into public.leads (name, email, skin_type, concern, oil_level, sensitivity, score,
        recommendation, submitted_at, quiz_version, source, status, email_status, last_email_sent, email_sequence_day,
        last_sequence_email_sent, next_email_due, tags, notes)
        values ('Ada', 'ada@example.test', 'Oily', 'Acne', 'High', 'Low', 50, 'Hydrate.', now(), '2.0', 'Skin Quiz',
        'New Lead', 'Pending', null, 1, now(), now() + interval '1 day', '["quiz"]', null)`);
    assert(ok.ok, ok.error && ok.error.message);
    assert.strictEqual(await scalar(db, "select email_status from public.leads where email = 'ada@example.test'"), "Pending");
    assert(Number(await scalar(db, "select id from public.leads where email = 'ada@example.test'")) > 0, "lead got an id");
    assert(await refused(db, "anon", "insert into public.leads (email, emails_opened) values ('x@example.test', 99)"));
    assert(await refused(db, "anon", "insert into public.leads (id, email) values (999, 'x@example.test')"));
    assert(await refused(db, "anon", "insert into public.leads (email) values ('y@example.test') returning *"));
    await db.close();
});

test("anon: functions that are not part of the website API cannot be executed", async () => {
    const db = await migrated();
    for (const f of ["handle_new_user()", "rls_auto_enable()", "emerriment_guard_profile_privileges()",
        "emerriment_guard_lead_insert()", "emerriment_set_admin(uuid,boolean)"]) {
        assert.strictEqual(await scalar(db, `select has_function_privilege('anon', 'public.${f}', 'execute')`), false, f);
    }
    for (const f of ["handle_new_user()", "rls_auto_enable()"]) {
        assert.strictEqual(await scalar(db, `select has_function_privilege('authenticated', 'public.${f}', 'execute')`), false, f);
    }
    await db.close();
});


/* ============ 4. User A vs user B ============ */

test("cross-user isolation: A sees only A's rows in every per-user table, B only B's", async () => {
    const db = await migrated();
    for (const t of PRIVATE_OWNER_TABLES) {
        for (const [who, id] of [[A, ID.userA], [B, ID.userB]]) {
            const owners = (await visible(db, who, `select user_id from public.${t}`)).map((r) => r.user_id);
            assert(owners.length >= 1, `${t}: owner sees own rows`);
            assert(owners.every((o) => o === id), `${t}: saw another user's row`);
        }
    }
    await db.close();
});

test("cross-user isolation: A cannot change or delete B's rows in any per-user table", async () => {
    const db = await migrated();
    for (const t of PRIVATE_OWNER_TABLES) {
        assert.strictEqual(await changed(db, A, `update public.${t} set user_id = user_id where user_id = '${ID.userB}'`), 0, "update " + t);
        assert.strictEqual(await changed(db, A, `delete from public.${t} where user_id = '${ID.userB}'`), 0, "delete " + t);
        assert.strictEqual(await n(db, `select count(*) from public.${t} where user_id = '${ID.userB}'`), 1, t + " B row intact");
    }
    await db.close();
});

test("ownership cannot be forged: A cannot create rows for B or hand A's rows to B", async () => {
    const db = await migrated();
    const forged = [
        `insert into public.quiz_results (user_id, score) values ('${ID.userB}', 1)`,
        `insert into public.saved_products (user_id, product_id) values ('${ID.userB}', '${ID.approved}')`,
        `insert into public.favorite_articles (user_id, article_id) values ('${ID.userB}', '${ID.draft}')`,
        `insert into public.ai_conversations (user_id, title) values ('${ID.userB}', 'x')`,
        `insert into public.ai_memory (user_id, memory_key) values ('${ID.userB}', 'k')`,
        `insert into public.article_ratings (user_id, article_id, rating) values ('${ID.userB}', '${ID.draft}', 1)`
    ];
    for (const sql of forged) {
        assert(await refused(db, A, sql), sql);
    }
    for (const t of ["quiz_results", "ai_conversations", "ai_memory", "reading_history"]) {
        assert.strictEqual(await changed(db, A, `update public.${t} set user_id = '${ID.userB}' where user_id = '${ID.userA}'`), 0, t);
    }
    await db.close();
});

test("AI chat: A cannot add messages to B's conversation, but can to A's own", async () => {
    const db = await migrated();
    assert(await refused(db, A,
        `insert into public.ai_messages (conversation_id, user_id, role, content) values ('${ID.convB}', '${ID.userA}', 'user', 'injected')`));
    assert.strictEqual(await changed(db, A,
        `insert into public.ai_messages (conversation_id, user_id, role, content) values ('${ID.convA}', '${ID.userA}', 'user', 'hello')`), 1);
    assert.strictEqual(await changed(db, A, `update public.ai_messages set conversation_id = '${ID.convB}' where user_id = '${ID.userA}'`), 0);
    assert.strictEqual(await n(db, `select count(*) from public.ai_messages where conversation_id = '${ID.convB}'`), 1);
    await db.close();
});

test("users see only their own profile and cannot read admin-only tables or leads", async () => {
    const db = await migrated();
    assert.deepStrictEqual((await visible(db, A, "select id from public.profiles")).map((r) => r.id), [ID.userA]);
    for (const t of [...ADMIN_ONLY_TABLES, "leads"]) {
        assert.strictEqual((await visible(db, A, `select * from public.${t}`)).length, 0, t);
        assert.strictEqual(await changed(db, A, `delete from public.${t}`), 0, t);
    }
    assert.deepStrictEqual((await visible(db, A, "select slug from public.encyclopedia_articles")).map((r) => r.slug), ["acne"]);
    await db.close();
});

test("dashboard flows still work for the owner (save/unsave, reading progress, rating again, memory upsert)", async () => {
    const db = await migrated();
    assert.strictEqual(await changed(db, A, `delete from public.saved_articles where user_id = '${ID.userA}'`), 1);
    assert.strictEqual(await changed(db, A, `insert into public.saved_articles (user_id, article_id) values ('${ID.userA}', '${ID.published}')`), 1);
    assert.strictEqual(await changed(db, A, `insert into public.reading_history (user_id, article_id, last_position) values ('${ID.userA}', '${ID.published}', 40)
        on conflict (user_id, article_id) do update set last_position = excluded.last_position`), 1);
    assert.strictEqual(await changed(db, A, `insert into public.article_ratings (user_id, article_id, rating) values ('${ID.userA}', '${ID.published}', 5)
        on conflict (user_id, article_id) do update set rating = excluded.rating`), 1);
    assert.strictEqual(await changed(db, A, `insert into public.ai_memory (user_id, memory_key, memory_value) values ('${ID.userA}', 'skin', 'combination')
        on conflict (user_id, memory_key) do update set memory_value = excluded.memory_value`), 1);
    assert.strictEqual(await changed(db, A, `update public.profiles set full_name = 'Ada', current_skin_score = 70 where id = '${ID.userA}'`), 1);
    assert.strictEqual(await changed(db, A, `update public.ai_conversations set archived = true where id = '${ID.convA}'`), 1);
    await db.close();
});


/* ============ 5. Administrator protection ============ */

test("self-promotion is impossible: direct update, insert as admin, or the admin function", async () => {
    const db = await migrated();
    assert(await refused(db, A, `update public.profiles set is_admin = true where id = '${ID.userA}'`), "direct update");
    assert(await refused(db, A, `update public.profiles set id = '${ID.admin}' where id = '${ID.userA}'`), "id change");
    assert(await refused(db, A, `select public.emerriment_set_admin('${ID.userA}', true)`), "admin function");
    await db.exec(`delete from public.profiles where id = '${ID.userA}'`);
    assert(await refused(db, A, `insert into public.profiles (id, is_admin) values ('${ID.userA}', true)`), "insert as admin");
    assert.strictEqual(await n(db, "select count(*) from public.profiles where is_admin"), 1);
    await db.close();
});

test("signup cannot create an administrator, even with is_admin in the sign-up metadata", async () => {
    const db = await migrated();
    await db.exec("begin; set local role supabase_auth_admin;");
    await db.exec(`insert into auth.users (id, email, raw_user_meta_data) values
        ('00000000-0000-4000-8000-0000000000c9', 'new@example.test', '{"full_name":"New","is_admin":true}')`);
    await db.exec("commit");
    assert.strictEqual(await scalar(db, "select is_admin from public.profiles where id = '00000000-0000-4000-8000-0000000000c9'"), false);
    await db.close();
});

test("only an administrator can grant or remove admin access (CMS toggle), and never the last admin", async () => {
    const db = await migrated();
    assert(await refused(db, ADMIN, `update public.profiles set is_admin = true where id = '${ID.userA}'`), "direct column write refused even for admins");
    await as(db, ADMIN, `select public.emerriment_set_admin('${ID.userA}', true)`);
    assert.strictEqual(await scalar(db, `select is_admin from public.profiles where id = '${ID.userA}'`), true);
    await as(db, ADMIN, `select public.emerriment_set_admin('${ID.userA}', false)`);
    assert.strictEqual(await scalar(db, `select is_admin from public.profiles where id = '${ID.userA}'`), false);
    const last = await tryAs(db, ADMIN, `select public.emerriment_set_admin('${ID.admin}', false)`);
    assert(!last.ok && /last administrator/.test(last.error.message));
    assert(await refused(db, "anon", `select public.emerriment_set_admin('${ID.userA}', true)`));
    await db.close();
});


/* ============ 6. Administrator (CMS) ============ */

test("admin CMS: full encyclopedia management, including drafts, publish and delete", async () => {
    const db = await migrated();
    assert.strictEqual((await visible(db, ADMIN, "select * from public.encyclopedia_articles")).length, 2);
    assert.strictEqual(await changed(db, ADMIN, "insert into public.encyclopedia_articles (title, slug, status) values ('New', 'new', 'draft')"), 1);
    assert.strictEqual(await changed(db, ADMIN, "update public.encyclopedia_articles set status = 'published' where slug = 'new'"), 1);
    assert.strictEqual(await changed(db, ADMIN, `update public.encyclopedia_articles set content = 'Edited' where id = '${ID.published}'`), 1);
    assert.strictEqual(await changed(db, ADMIN, "delete from public.encyclopedia_articles where slug = 'new'"), 1);
    for (const who of [A, "anon"]) {
        assert.strictEqual(await changed(db, who, `update public.encyclopedia_articles set content = 'Hacked' where id = '${ID.published}'`), 0);
        assert(await refused(db, who, "insert into public.encyclopedia_articles (title, slug, status) values ('X', 'x', 'published')"));
    }
    await db.close();
});

test("admin CMS: products, collections, settings, AI analytics, leads and all profiles", async () => {
    const db = await migrated();
    assert.strictEqual((await visible(db, ADMIN, "select * from public.products")).length, 2, "incl. unapproved");
    assert.strictEqual(await changed(db, ADMIN, `update public.products set is_approved = true where id = '${ID.unapproved}'`), 1);
    for (const t of ADMIN_ONLY_TABLES) {
        assert((await visible(db, ADMIN, `select * from public.${t}`)).length >= 1, "admin reads " + t);
    }
    assert.strictEqual(await changed(db, ADMIN, "update public.website_settings set site_name = 'EMerriment'"), 1);
    assert.strictEqual((await visible(db, ADMIN, "select * from public.leads")).length, 3);
    assert.strictEqual((await visible(db, ADMIN, "select * from public.profiles")).length, 3);
    assert.strictEqual((await visible(db, ADMIN, "select * from public.ai_messages")).length, 2);
    await db.close();
});


/* ============ 7. Netlify functions (service role) ============ */

test("service role: reads and claims a lead by id, records the delivery, unsubscribes", async () => {
    const db = await migrated();
    const r = await as(db, "service_role", "update public.leads set email_status = 'Sending' where id = 3 and email_status = 'Pending' and last_email_sent is null returning id");
    assert.strictEqual(r.rows.length, 1);
    await as(db, "service_role", "insert into public.email_deliveries (lead_id, kind) values (3, 'report')");
    await as(db, "service_role", "update public.leads set email_status = 'Sent', last_email_sent = now() where id = 3");
    await as(db, "service_role", "update public.leads set status = 'Unsubscribed' where id = 3");
    await as(db, "service_role", "insert into public.product_clicks (email, product) values ('three@example.test', 'cleanser')");
    assert.strictEqual(await scalar(db, "select status from public.leads where id = 3"), "Unsubscribed");
    await db.close();
});


/* ============ 8. Storage, rollback, verification SQL ============ */

test("storage: article-images accepts images up to 5 MB only", async () => {
    const db = await migrated();
    const b = (await db.query("select file_size_limit, allowed_mime_types from storage.buckets where id = 'article-images'")).rows[0];
    assert.strictEqual(Number(b.file_size_limit), 5242880);
    assert(!b.allowed_mime_types.includes("image/svg+xml"));
    await db.close();
});

test("rollback removes every EMerriment object and restores the previous grants; lead ids are kept", async () => {
    const db = await migrated();
    await S.applyRollback(db);
    assert.strictEqual(await n(db, "select count(*) from pg_policies where policyname like 'emerriment\\_%'"), 0);
    assert.strictEqual(await n(db, "select count(*) from pg_proc where proname like 'emerriment\\_%'"), 0);
    assert.strictEqual(await n(db, "select count(*) from pg_policies where schemaname = 'public'"), 27);
    assert.strictEqual(await scalar(db, "select has_table_privilege('anon', 'public.leads', 'select')"), true);
    assert.strictEqual(await n(db, "select count(*) from public.leads where id is null"), 0);
    // And the migrations can be applied again afterwards.
    await P.applyProductionMigrations(db);
    assert.strictEqual((await visible(db, "anon", "select * from public.leads")).length, 0);
    await db.close();
});

test("verification SQL (02) and the role checks (03) run on the migrated database, all checks pass, no data changes", async () => {
    const db = await migrated();
    const snapshot = async () => (await db.query("select count(*) c, sum(id) s from public.leads")).rows[0];
    const before = await snapshot();
    await db.exec(S.read("supabase/audit/02_post_migration_verification.sql"));
    await db.exec(S.read("supabase/audit/03_live_rls_role_checks.sql"));
    const checks = (await db.query("select who, check_name, expected, actual, pass from emerriment_rls_check order by n")).rows;
    assert(checks.length >= 60, "only " + checks.length + " checks ran");
    const failed = checks.filter((c) => !c.pass);
    assert.deepStrictEqual(failed, [], "role checks failed: " + JSON.stringify(failed));
    assert.deepStrictEqual(await snapshot(), before);
    await db.close();
});


test("the role checks (03) detect the live weaknesses before the migrations", async () => {
    const db = await live();
    // 03 needs the helper function names only for the admin checks; on the
    // un-migrated database those calls fail and are reported, not thrown.
    await db.exec(S.read("supabase/audit/03_live_rls_role_checks.sql"));
    const failed = (await db.query("select check_name from emerriment_rls_check where not pass")).rows.map((r) => r.check_name);
    for (const expected of ["read leads", "set own is_admin", "read ai_events", "truncate leads", "read products (approved only)"]) {
        assert(failed.includes(expected), "not detected: " + expected + " (failed: " + failed.join(", ") + ")");
    }
    await db.close();
});


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
    console.log(`\nproduction schema (PGlite): ${pass} passed, ${fail} failed in ${Math.round((Date.now() - started) / 1000)}s`);
    return { pass, fail };
}

module.exports = { run, tests };

if (require.main === module) {
    run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
