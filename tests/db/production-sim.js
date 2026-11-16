/* =========================================
   Production-shaped Supabase database for migration tests
   -----------------------------------------
   Reproduces the LIVE EMerriment database as read (metadata only) on
   2026-11-13 from the Supabase SQL Editor:
     * the 22 public tables with their real columns, types, defaults,
       foreign keys and unique keys (including leads.id: bigint, nullable,
       no default, no primary key — every live lead had id NULL);
     * RLS enabled on every table (not forced);
     * the 27 live policies, verbatim;
     * Supabase's default grants (ALL to anon/authenticated/service_role,
       EXECUTE on functions);
     * public.handle_new_user() + the auth.users trigger (live definition),
       public.rls_auto_enable() (function only; event triggers are not
       created here);
     * storage.buckets row "article-images" (public, no limits).
   Data is synthetic: no production row is copied.

   Not reproduced: PostgREST/HTTP, GoTrue, JWT signatures, the realtime /
   graphql schemas, event triggers. See tests/db/README.md.
========================================= */
"use strict";

const S = require("./supabase-sim");

// Filename order = the order the Supabase CLI and the runbook apply them.
const PRODUCTION_MIGRATIONS = [
    "20261110085900_emerriment_leads_identity.sql",
    "20261110090000_emerriment_security_helpers.sql",
    "20261110090100_emerriment_leads_rls.sql",
    "20261110090200_emerriment_user_data_rls.sql",
    "20261110090300_emerriment_content_admin_rls.sql",
    "20261110090400_emerriment_email_delivery.sql",
    "20261113090000_emerriment_production_hardening.sql"
];

const ID = {
    admin: "00000000-0000-4000-8000-0000000000aa",
    userA: "00000000-0000-4000-8000-00000000000a",
    userB: "00000000-0000-4000-8000-00000000000b",
    published: "00000000-0000-4000-8000-0000000000e1",
    draft: "00000000-0000-4000-8000-0000000000e2",
    approved: "00000000-0000-4000-8000-0000000000f1",
    unapproved: "00000000-0000-4000-8000-0000000000f2",
    convA: "00000000-0000-4000-8000-0000000000ca",
    convB: "00000000-0000-4000-8000-0000000000cb"
};

const PLATFORM_SQL = `
create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;
create role supabase_auth_admin nologin noinherit;

create schema auth;
grant usage on schema auth to anon, authenticated, service_role, supabase_auth_admin;
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
create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}'::jsonb);
grant insert, select on auth.users to supabase_auth_admin;

grant usage on schema public to anon, authenticated, service_role, supabase_auth_admin;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

create schema storage;
grant usage on schema storage to anon, authenticated, service_role;
create table storage.buckets (id text primary key, name text, public boolean,
    file_size_limit bigint, allowed_mime_types text[]);
insert into storage.buckets (id, name, public) values ('article-images', 'article-images', true);
`;

// Live columns (information_schema, 2026-11-13).
const SCHEMA_SQL = `
create table public.profiles (
    id uuid not null primary key references auth.users (id) on delete cascade,
    full_name text, avatar_url text, created_at timestamptz default now(),
    current_skin_score integer default 0, current_skin_type text, current_concern text,
    last_quiz_date timestamptz, current_recommendation text,
    is_admin boolean default false, email text
);

create table public.leads (
    id bigint, name text, email text, skin_type text, concern text, oil_level text,
    sensitivity text, score bigint, recommendation text default ''::text,
    created_at timestamptz, submitted_at timestamptz default now(),
    quiz_version text default '''2.0'''::text, source text default '''Skin Quiz'''::text,
    status text default '''New Lead'''::text, email_status text default '''pending'''::text,
    last_email_sent timestamptz, tags text default '{}'::text, notes text,
    email_sequence_day integer not null default 1, last_sequence_email_sent timestamptz,
    next_email_due timestamptz, emails_sent integer default 0, emails_opened integer default 0,
    emails_clicked integer default 0, last_opened_at timestamp, last_clicked_at timestamp
);

create table public.encyclopedia_articles (
    id uuid not null default gen_random_uuid() primary key, title text not null, slug text unique,
    category text, summary text, content text, featured_image text, reading_time integer,
    created_at timestamptz default now(), status text default 'draft'::text, published_at timestamptz,
    difficulty text default 'Beginner'::text, seo_keywords text[], related_conditions text[],
    author text default 'EMerriment'::text, is_featured boolean default false,
    updated_at timestamptz default now(), views integer default 0
);

create table public.products (
    id uuid not null default gen_random_uuid() primary key, name text, description text, category text,
    price numeric, selar_link text, featured boolean default false, quiz_recommended boolean default false,
    image text, created_at timestamp default now(), is_approved boolean not null default false,
    ingredients text[] not null default '{}', skin_types text[] not null default '{}',
    concerns text[] not null default '{}', benefits text[] not null default '{}',
    related_articles uuid[] not null default '{}'
);

create table public.quiz_results (
    id uuid not null default gen_random_uuid() primary key,
    user_id uuid references auth.users (id) on delete cascade,
    skin_type text, concern text, oil_level text, sensitivity text, score integer,
    recommendation text, created_at timestamptz default now()
);

create table public.reading_history (
    id uuid not null default gen_random_uuid() primary key,
    user_id uuid references public.profiles (id) on delete cascade,
    article_id uuid references public.encyclopedia_articles (id) on delete cascade,
    progress integer default 0, last_position integer default 0, read_at timestamptz default now(),
    unique (user_id, article_id)
);

create table public.saved_articles (
    id uuid not null default gen_random_uuid() primary key,
    user_id uuid not null references auth.users (id),
    created_at timestamptz not null default timezone('utc'::text, now()),
    article_id uuid not null references public.encyclopedia_articles (id) on delete cascade,
    constraint saved_articles_user_article_unique unique (user_id, article_id)
);

create table public.saved_products (
    id uuid not null default gen_random_uuid() primary key,
    user_id uuid references auth.users (id), product_id uuid references public.products (id),
    created_at timestamp default now()
);

create table public.favorite_articles (
    id uuid not null default gen_random_uuid() primary key,
    user_id uuid references auth.users (id) on delete cascade,
    article_id uuid references public.encyclopedia_articles (id) on delete cascade,
    created_at timestamptz default now()
);

create table public.article_ratings (
    id uuid not null default gen_random_uuid() primary key,
    user_id uuid references public.profiles (id) on delete cascade,
    article_id uuid references public.encyclopedia_articles (id) on delete cascade,
    rating integer, helpful boolean, feedback text,
    created_at timestamptz default now(), updated_at timestamptz default now(),
    unique (user_id, article_id)
);

create table public.ai_conversations (
    id uuid not null default gen_random_uuid() primary key,
    user_id uuid references auth.users (id) on delete cascade,
    title text default 'New Conversation'::text, created_at timestamptz default now(),
    updated_at timestamptz default now(), is_pinned boolean default false, archived boolean default false,
    last_message text, message text, role text
);

create table public.ai_messages (
    id uuid not null default gen_random_uuid() primary key,
    conversation_id uuid references public.ai_conversations (id) on delete cascade,
    user_id uuid references auth.users (id) on delete cascade,
    role text, content text not null, created_at timestamptz default now()
);

create table public.ai_memory (
    id uuid not null default gen_random_uuid() primary key,
    user_id uuid references auth.users (id) on delete cascade,
    memory_key text not null, memory_value text, importance integer default 1,
    created_at timestamptz default now(), updated_at timestamptz default now(),
    constraint ai_memory_user_key_unique unique (user_id, memory_key)
);

create table public.ai_events (
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamptz not null default timezone('utc'::text, now())
);

create table public.ai_feedback (
    id uuid not null default gen_random_uuid() primary key,
    conversation_id uuid references public.ai_conversations (id) on delete cascade,
    rating integer, feedback text, created_at timestamptz default now()
);

create table public.ai_questions (
    id uuid not null default gen_random_uuid() primary key,
    question text, answered boolean default false, created_at timestamptz default now()
);

create table public.ai_settings (
    id uuid not null default gen_random_uuid() primary key,
    setting_key text unique, setting_value text, updated_at timestamptz default now()
);

create table public.article_products (
    id uuid not null default gen_random_uuid() primary key,
    article_id uuid references public.encyclopedia_articles (id) on delete cascade,
    product_id uuid references public.products (id) on delete cascade
);

create table public.collections (
    id uuid not null default gen_random_uuid() primary key,
    user_id uuid references public.profiles (id) on delete cascade,
    name text not null, description text, created_at timestamptz default now()
);

create table public.collection_articles (
    id uuid not null default gen_random_uuid() primary key,
    collection_id uuid references public.collections (id) on delete cascade,
    article_id uuid references public.encyclopedia_articles (id) on delete cascade,
    created_at timestamptz default now(),
    unique (collection_id, article_id)
);

create table public.product_clicks (
    id uuid not null default gen_random_uuid() primary key,
    email text, product text, clicked_at timestamp default now()
);

create table public.website_settings (
    id uuid not null default gen_random_uuid() primary key,
    site_name text, tagline text, contact_email text, contact_phone text,
    primary_color text default '#D4AF37'::text, updated_at timestamptz default now()
);

-- Live functions (definitions as read).
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path to 'public' as $function$
begin
  insert into public.profiles (id, email, full_name, is_admin)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), false);
  return new;
end;
$function$;
create trigger on_auth_user_created after insert on auth.users
    for each row execute function public.handle_new_user();

create function public.rls_auto_enable() returns event_trigger
language plpgsql security definer set search_path to 'pg_catalog' as $function$
begin
  return;
end;
$function$;
`;

const TABLES = [
    "ai_conversations", "ai_events", "ai_feedback", "ai_memory", "ai_messages", "ai_questions",
    "ai_settings", "article_products", "article_ratings", "collection_articles", "collections",
    "encyclopedia_articles", "favorite_articles", "leads", "product_clicks", "products", "profiles",
    "quiz_results", "reading_history", "saved_articles", "saved_products", "website_settings"
];

// The 27 live policies (pg_policies, 2026-11-13), verbatim.
const LIVE_POLICIES_SQL = `
${TABLES.map((t) => `alter table public.${t} enable row level security;`).join("\n")}

create policy "Users can create conversations" on public.ai_conversations for insert to public with check (auth.uid() = user_id);
create policy "Users can update conversations" on public.ai_conversations for update to public using (auth.uid() = user_id);
create policy "Users can view own conversations" on public.ai_conversations for select to public using (auth.uid() = user_id);
create policy "Enable read access for all users" on public.ai_events for select to public using (true);
create policy "Users can manage own AI memory" on public.ai_memory for all to public using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can insert own messages" on public.ai_messages for insert to public with check (auth.uid() = user_id);
create policy "Users can view own messages" on public.ai_messages for select to public using (auth.uid() = user_id);
create policy "Admins can insert encyclopedia articles" on public.encyclopedia_articles for insert to authenticated
    with check (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true));
create policy "Anyone can read published encyclopedia articles" on public.encyclopedia_articles for select to anon, authenticated using (status = 'published'::text);
create policy "Users can add favorites" on public.favorite_articles for insert to public with check (auth.uid() = user_id);
create policy "Users can remove favorites" on public.favorite_articles for delete to public using (auth.uid() = user_id);
create policy "Users can view their own favorites" on public.favorite_articles for select to public using (auth.uid() = user_id);
create policy "Allow public inserts" on public.leads for insert to public with check (true);
create policy "Enable read access for all users" on public.leads for select to public using (true);
create policy "Users can create own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles for insert to public with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update to public using (auth.uid() = id);
create policy "Users can view own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users can view their own profile" on public.profiles for select to public using (auth.uid() = id);
create policy "Users can insert their own quiz results" on public.quiz_results for insert to public with check (auth.uid() = user_id);
create policy "Users can update their own quiz results" on public.quiz_results for update to public using (auth.uid() = user_id);
create policy "Users can view their own quiz results" on public.quiz_results for select to public using (auth.uid() = user_id);
create policy "Users can insert their own reading history" on public.reading_history for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can view their own reading history" on public.reading_history for select to authenticated using (auth.uid() = user_id);
create policy "Users can save their own articles" on public.saved_articles for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can view their own articles" on public.saved_articles for select to public using (auth.uid() = user_id);
`;

// Synthetic data shaped like the live data (ids NULL, quoted defaults).
const SEED_SQL = `
insert into auth.users (id, email, raw_user_meta_data) values
  ('${ID.admin}', 'admin@example.test', '{"full_name":"Admin"}'),
  ('${ID.userA}', 'a@example.test', '{"full_name":"User A"}'),
  ('${ID.userB}', 'b@example.test', '{"full_name":"User B","is_admin":true}');
update public.profiles set is_admin = true where id = '${ID.admin}';

-- Leads exactly as the live table holds them: no id; most with the
-- quoted defaults, some written by the homepage with clean values.
insert into public.leads (name, email, submitted_at) values
  ('Old One', 'one@example.test', now() - interval '30 days'),
  ('Old Two', 'two@example.test', now() - interval '20 days');
insert into public.leads (name, email, submitted_at, status, email_status, source, quiz_version, tags)
values ('Newer', 'three@example.test', now() - interval '2 days', 'New Lead', 'Pending', 'Skin Quiz', '2.0', '["quiz"]');

insert into public.encyclopedia_articles (id, title, slug, content, status, views) values
  ('${ID.published}', 'Acne', 'acne', 'Published body', 'published', 5),
  ('${ID.draft}', 'Draft', 'draft', 'Unpublished body', 'draft', 0);
insert into public.products (id, name, is_approved) values
  ('${ID.approved}', 'Approved cleanser', true), ('${ID.unapproved}', 'Unreviewed serum', false);
insert into public.article_products (article_id, product_id) values
  ('${ID.published}', '${ID.approved}'), ('${ID.published}', '${ID.unapproved}'), ('${ID.draft}', '${ID.approved}');

insert into public.article_ratings (user_id, article_id, rating, feedback) values
  ('${ID.userA}', '${ID.published}', 4, 'A private comment'), ('${ID.userB}', '${ID.published}', 2, 'B private comment');

insert into public.quiz_results (user_id, skin_type, score) values ('${ID.userA}', 'Oily', 50), ('${ID.userB}', 'Dry', 60);
insert into public.reading_history (user_id, article_id) values ('${ID.userA}', '${ID.published}'), ('${ID.userB}', '${ID.published}');
insert into public.saved_articles (user_id, article_id) values ('${ID.userA}', '${ID.published}'), ('${ID.userB}', '${ID.published}');
insert into public.saved_products (user_id, product_id) values ('${ID.userA}', '${ID.approved}'), ('${ID.userB}', '${ID.approved}');
insert into public.favorite_articles (user_id, article_id) values ('${ID.userA}', '${ID.published}'), ('${ID.userB}', '${ID.published}');

insert into public.ai_conversations (id, user_id, title) values ('${ID.convA}', '${ID.userA}', 'A chat'), ('${ID.convB}', '${ID.userB}', 'B chat');
insert into public.ai_messages (conversation_id, user_id, role, content) values
  ('${ID.convA}', '${ID.userA}', 'user', 'A secret'), ('${ID.convB}', '${ID.userB}', 'user', 'B secret');
insert into public.ai_memory (user_id, memory_key, memory_value) values
  ('${ID.userA}', 'skin', 'oily'), ('${ID.userB}', 'skin', 'dry');
insert into public.ai_events default values;
insert into public.ai_feedback (conversation_id, rating) values ('${ID.convA}', 5);
insert into public.ai_questions (question) values ('What is niacinamide?');
insert into public.ai_settings (setting_key, setting_value) values ('mode', 'mock');
insert into public.collections (id, user_id, name) values ('00000000-0000-4000-8000-0000000000d1', '${ID.admin}', 'Starter routine');
insert into public.collection_articles (collection_id, article_id) values ('00000000-0000-4000-8000-0000000000d1', '${ID.published}');
insert into public.product_clicks (email, product) values ('one@example.test', 'cleanser');
insert into public.website_settings (site_name, contact_email) values ('EMerriment', 'hello@example.test');
`;

async function createProductionDatabase({ seed = true } = {}) {
    const PGlite = await S.loadPGlite();
    const db = await PGlite.create();
    await db.exec(PLATFORM_SQL);
    await db.exec(SCHEMA_SQL);
    await db.exec(LIVE_POLICIES_SQL);
    if (seed) {
        await db.exec(SEED_SQL);
    }
    return db;
}

async function applyProductionMigrations(db, files = PRODUCTION_MIGRATIONS) {
    for (const file of files) {
        await db.exec(S.migrationSql(file));
    }
}

module.exports = {
    ID,
    TABLES,
    PRODUCTION_MIGRATIONS,
    createProductionDatabase,
    applyProductionMigrations
};
