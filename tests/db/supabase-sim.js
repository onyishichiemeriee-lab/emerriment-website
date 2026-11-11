/* =========================================
   Disposable Supabase-like database for migration tests
   -----------------------------------------
   Uses PGlite (real PostgreSQL compiled to WebAssembly, in memory).
   Nothing here connects to Supabase or reads any credential.

   What is reproduced
   * API roles anon / authenticated / service_role (BYPASSRLS), and
     supabase_auth_admin, switched with SET ROLE like PostgREST does.
   * JWT claims through the `request.jwt.claims` setting, and auth.uid() /
     auth.role() written the same way Supabase defines them.
   * Supabase's default privileges: tables, functions and sequences created
     in `public` are granted to anon, authenticated and service_role.
   * The EMerriment tables and columns the repository code uses.

   What is NOT reproduced (see tests/db/README.md)
   * PostgREST itself (HTTP, JWT signature checks, schema cache, Prefer
     headers), GoTrue/auth service, Supabase extensions and event triggers,
     concurrent connections, and the real production schema.
========================================= */
"use strict";

const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");

const ROOT = path.resolve(__dirname, "..", "..");

const MIGRATIONS = [
    // Documented execution order (supabase/README.md): 5 first, then 1–4.
    "20261110090400_emerriment_email_delivery.sql",
    "20261110090000_emerriment_security_helpers.sql",
    "20261110090100_emerriment_leads_rls.sql",
    "20261110090200_emerriment_user_data_rls.sql",
    "20261110090300_emerriment_content_admin_rls.sql"
];

const IDS = {
    admin: "00000000-0000-4000-8000-00000000000a",
    admin2: "00000000-0000-4000-8000-00000000000b",
    user1: "00000000-0000-4000-8000-000000000001",
    user2: "00000000-0000-4000-8000-000000000002",
    article: "00000000-0000-4000-8000-0000000000a1",
    conv1: "00000000-0000-4000-8000-0000000000c1",
    conv2: "00000000-0000-4000-8000-0000000000c2"
};

let PGliteClass = null;

async function loadPGlite() {
    if (!PGliteClass) {
        const entry = require.resolve("@electric-sql/pglite", { paths: [ROOT, process.cwd()] });
        PGliteClass = (await import(pathToFileURL(entry).href)).PGlite;
    }
    return PGliteClass;
}

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const migrationSql = (file) => read(path.join("supabase", "migrations", file));


/* ---------------- Platform (Supabase-like) ---------------- */

const PLATFORM_SQL = `
create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;
create role supabase_auth_admin nologin noinherit;

create schema auth;
grant usage on schema auth to anon, authenticated, service_role, supabase_auth_admin;

-- Same definitions Supabase uses.
create function auth.uid() returns uuid language sql stable as $$
    select coalesce(
        nullif(current_setting('request.jwt.claim.sub', true), ''),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    )::uuid
$$;
create function auth.role() returns text language sql stable as $$
    select coalesce(
        nullif(current_setting('request.jwt.claim.role', true), ''),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
    )::text
$$;
grant execute on function auth.uid(), auth.role() to anon, authenticated, service_role, supabase_auth_admin;

create table auth.users (id uuid primary key, email text);

grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

-- Referenced by the read-only audit (query 14).
create schema storage;
create table storage.buckets (id text primary key, name text, public boolean);
`;


/* ---------------- EMerriment tables (from repository code) ---------------- */

function appSchemaSql({ emailStatusType = "text", statusType = "text", emailStatusCheck = false } = {}) {
    return `
${emailStatusType !== "text" ? `create type public.${emailStatusType} as enum ('Pending', 'Sent');` : ""}
${statusType !== "text" ? `create type public.${statusType} as enum ('New Lead');` : ""}

create table public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    full_name text,
    is_admin boolean not null default false,
    current_skin_score integer,
    current_skin_type text,
    current_concern text,
    current_recommendation text,
    last_quiz_date timestamptz
);

create table public.leads (
    id uuid primary key default gen_random_uuid(),
    name text,
    email text,
    skin_type text,
    concern text,
    oil_level text,
    sensitivity text,
    score integer,
    recommendation text,
    submitted_at timestamptz default now(),
    created_at timestamptz not null default now(),
    quiz_version text,
    source text,
    status ${statusType === "text" ? "text" : "public." + statusType},
    email_status ${emailStatusType === "text" ? "text" : "public." + emailStatusType}
        ${emailStatusCheck ? "check (email_status in ('Pending', 'Sent'))" : ""},
    last_email_sent timestamptz,
    email_sequence_day integer,
    last_sequence_email_sent timestamptz,
    next_email_due timestamptz,
    tags text[],
    notes text,
    emails_opened integer default 0,
    emails_clicked integer default 0,
    emails_sent integer default 0,
    last_opened_at timestamptz,
    last_clicked_at timestamptz
);

create table public.quiz_results (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users (id),
    skin_type text, concern text, oil_level text, sensitivity text,
    score integer, recommendation text,
    created_at timestamptz default now()
);

create table public.encyclopedia_articles (
    id uuid primary key default gen_random_uuid(),
    title text, slug text, content text, category text,
    views integer default 0,
    updated_at timestamptz
);

create table public.reading_history (id uuid primary key default gen_random_uuid(), user_id uuid, article_id uuid, read_at timestamptz default now(), last_position integer);
create table public.saved_articles (id uuid primary key default gen_random_uuid(), user_id uuid, article_id uuid);
create table public.saved_products (id uuid primary key default gen_random_uuid(), user_id uuid, product_id uuid);
create table public.favorite_articles (id uuid primary key default gen_random_uuid(), user_id uuid, article_id uuid);
create table public.article_ratings (id uuid primary key default gen_random_uuid(), user_id uuid, article_id uuid, rating integer);
create table public.ai_conversations (id uuid primary key default gen_random_uuid(), user_id uuid, updated_at timestamptz default now());
create table public.ai_messages (id uuid primary key default gen_random_uuid(), conversation_id uuid references public.ai_conversations (id), role text, content text, created_at timestamptz default now());
create table public.ai_memory (id uuid primary key default gen_random_uuid(), user_id uuid, memory text);
create table public.products (id uuid primary key default gen_random_uuid(), name text, price numeric);
create table public.collections (id uuid primary key default gen_random_uuid(), name text);
create table public.collection_articles (id uuid primary key default gen_random_uuid(), collection_id uuid, article_id uuid);
create table public.article_products (id uuid primary key default gen_random_uuid(), article_id uuid, product_id uuid);
create table public.website_settings (id uuid primary key default gen_random_uuid(), setting_key text, setting_value text);
create table public.ai_settings (id uuid primary key default gen_random_uuid(), setting_key text, setting_value text, updated_at timestamptz);
create table public.ai_feedback (id uuid primary key default gen_random_uuid(), user_id uuid, rating integer);
create table public.ai_events (id uuid primary key default gen_random_uuid(), event text);
create table public.ai_questions (id uuid primary key default gen_random_uuid(), question text, answered boolean);
create table public.product_clicks (id uuid primary key default gen_random_uuid(), email text, product text, clicked_at timestamptz);
`;
}

const APP_TABLES = [
    "profiles", "leads", "quiz_results", "encyclopedia_articles", "reading_history",
    "saved_articles", "saved_products", "favorite_articles", "article_ratings",
    "ai_conversations", "ai_messages", "ai_memory", "products", "collections",
    "collection_articles", "article_products", "website_settings", "ai_settings",
    "ai_feedback", "ai_events", "ai_questions", "product_clicks"
];

// A common pre-existing state: RLS on, with "Enable access for all users"
// style policies created from the dashboard.
function legacyPermissiveSql() {
    return APP_TABLES.map((t) => `
alter table public.${t} enable row level security;
create policy "legacy allow all" on public.${t} for all to anon, authenticated using (true) with check (true);`).join("\n");
}

const SEED_SQL = `
insert into auth.users (id, email) values
  ('${IDS.admin}', 'admin@example.test'),
  ('${IDS.admin2}', 'admin2@example.test'),
  ('${IDS.user1}', 'user1@example.test'),
  ('${IDS.user2}', 'user2@example.test');

insert into public.profiles (id, full_name, is_admin) values
  ('${IDS.admin}', 'Admin', true),
  ('${IDS.user1}', 'User One', false),
  ('${IDS.user2}', 'User Two', false);

insert into public.leads (name, email, email_status, email_sequence_day, status, submitted_at)
values ('Existing', 'existing@example.test', 'Sent', 3, 'New Lead', now() - interval '3 days');

insert into public.quiz_results (user_id, skin_type, score) values
  ('${IDS.user1}', 'Oily', 50), ('${IDS.user2}', 'Dry', 60);

insert into public.encyclopedia_articles (id, title, slug, content, views)
values ('${IDS.article}', 'Acne', 'acne', 'Original content', 5);

insert into public.article_ratings (user_id, article_id, rating) values ('${IDS.user1}', '${IDS.article}', 4);

insert into public.ai_conversations (id, user_id) values ('${IDS.conv1}', '${IDS.user1}'), ('${IDS.conv2}', '${IDS.user2}');
insert into public.ai_messages (conversation_id, role, content) values
  ('${IDS.conv1}', 'user', 'mine'), ('${IDS.conv2}', 'user', 'theirs');

insert into public.website_settings (setting_key, setting_value) values ('site_name', 'EMerriment');
insert into public.reading_history (user_id, article_id) values ('${IDS.user1}', '${IDS.article}'), ('${IDS.user2}', '${IDS.article}');
`;


/* ---------------- Database helpers ---------------- */

async function createDatabase(options = {}) {
    const PGlite = await loadPGlite();
    const db = await PGlite.create();
    await db.exec(PLATFORM_SQL);
    await db.exec(appSchemaSql(options));
    if (options.legacyPermissive) {
        await db.exec(legacyPermissiveSql());
    }
    if (options.seed !== false) {
        await db.exec(SEED_SQL);
    }
    if (options.withoutAdmin) {
        await db.exec("update public.profiles set is_admin = false");
    }
    if (options.forceProfilesRls) {
        await db.exec("alter table public.profiles enable row level security; alter table public.profiles force row level security;");
    }
    return db;
}

async function applyMigrations(db, files = MIGRATIONS) {
    for (const file of files) {
        await db.exec(migrationSql(file));
    }
}

async function applyRollback(db) {
    await db.exec(read("supabase/rollback/emerriment_security_rollback.sql"));
}

// Runs `sql` as an API request with the given identity, like PostgREST:
// sets the JWT claims, switches role, runs, commits (or rolls back on error).
//   who: "anon" | "service_role" | "postgres" | { user: <uuid> }
async function as(db, who, sql, params = []) {
    let role;
    let claims = null;
    if (who === "anon") {
        role = "anon";
        claims = { role: "anon" };
    } else if (who === "service_role") {
        role = "service_role";
        claims = { role: "service_role" };
    } else if (who === "postgres") {
        role = null;
    } else if (who && who.user) {
        role = "authenticated";
        claims = { role: "authenticated", sub: who.user };
    } else {
        throw new Error("unknown identity");
    }

    await db.exec("begin");
    try {
        if (claims) {
            await db.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify(claims)]);
        }
        if (role) {
            await db.exec(`set local role ${role}`);
        }
        const result = await db.query(sql, params);
        await db.exec("commit");
        return result;
    } catch (error) {
        await db.exec("rollback");
        throw error;
    }
}

// Like `as`, but returns the error instead of throwing.
async function tryAs(db, who, sql, params = []) {
    try {
        return { ok: true, result: await as(db, who, sql, params) };
    } catch (error) {
        return { ok: false, error };
    }
}

async function scalar(db, sql, params = []) {
    const r = await db.query(sql, params);
    const row = r.rows[0];
    return row ? Object.values(row)[0] : undefined;
}

module.exports = {
    ROOT,
    MIGRATIONS,
    IDS,
    APP_TABLES,
    loadPGlite,
    createDatabase,
    applyMigrations,
    applyRollback,
    migrationSql,
    read,
    as,
    tryAs,
    scalar
};
