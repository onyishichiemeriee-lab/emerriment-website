-- =====================================================================
-- EMerriment STAGING — step 03: align API-role privileges with production
-- ---------------------------------------------------------------------
-- Why: when the schema dump is imported, Supabase's default privileges
-- (ALTER DEFAULT PRIVILEGES ... GRANT ALL ON TABLES TO anon, authenticated)
-- fire for every new table, so anon/authenticated receive TRUNCATE,
-- REFERENCES, TRIGGER and MAINTAIN that production revoked long ago.
-- pg_dump only emits GRANTs relative to "no privileges", so it cannot take
-- those extras away. This script removes exactly the extras.
--
-- Executed successfully on staging 2026-11-19 (verbatim below).
-- Self-checking and atomic: refuses unless the anon/authenticated table
-- privileges are exactly the reviewed post-import baseline, and rolls
-- everything back unless they afterwards equal production's fingerprint.
-- If production's schema has changed since 2026-11-19 the baseline will
-- not match and the script refuses: regenerate the REVOKE list with
--   node supabase/staging/verify/compare-with-production.js --staging=<ref> --emit-acl-revokes
-- and update both fingerprints after review.
-- Default privileges are intentionally NOT changed: they are identical
-- to production's (future tables need explicit revokes in both).
--
-- Run:
--   bash supabase/staging/run-on-staging.sh --remote=<staging-ref> supabase/staging/03_align_privileges.sql
-- =====================================================================
do $align$
declare
    acl_md5 text;
    n_rows bigint := 0;
    t record;
    svc_before text; svc_after text;
    pol_before int; pol_after int;
    rls_before int; rls_after int;
begin
    -- ---------- refuse unless this is the reviewed, empty staging database ----------
    if to_regnamespace('emerriment_backup') is not null then
        raise exception 'Refusing: emerriment_backup exists (production marker).';
    end if;
    if to_regclass('supabase_migrations.schema_migrations') is not null then
        raise exception 'Refusing: migration history table exists (staging has none yet).';
    end if;
    if (select count(*) from auth.users) <> 0 then
        raise exception 'Refusing: auth.users is not empty.';
    end if;
    for t in select c.oid::regclass as r from pg_class c join pg_namespace n on n.oid = c.relnamespace
             where n.nspname in ('public', 'emerriment_private') and c.relkind in ('r', 'p') loop
        execute format('select count(*) from %s', t.r) into acl_md5;
        n_rows := n_rows + acl_md5::bigint;
    end loop;
    if n_rows <> 0 then
        raise exception 'Refusing: application tables contain % rows (leads must be empty).', n_rows;
    end if;
    if (select count(*) from public.leads) <> 0 then
        raise exception 'Refusing: public.leads is not empty.';
    end if;

    select md5(string_agg(c.relname || ':' || a.grantee::regrole::text || ':' || a.privilege_type, ',' order by c.relname, a.grantee::regrole::text, a.privilege_type))
      into acl_md5
      from pg_class c join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public', aclexplode(c.relacl) a
     where c.relkind = 'r' and a.grantee in ('anon'::regrole, 'authenticated'::regrole);
    if acl_md5 is distinct from 'c273d2a3d592df580dc6cf4db1c35ff8' then
        raise exception 'Refusing: anon/authenticated privileges differ from the reviewed staging baseline (got %).', acl_md5;
    end if;

    -- things that must not change
    select string_agg(c.relname || ':' || coalesce(c.relacl::text, ''), ',' order by c.relname) into svc_before
      from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname in ('public', 'emerriment_private') and c.relkind in ('r', 'p', 'S');
    select count(*) into pol_before from pg_policies where schemaname in ('public', 'emerriment_private');
    select count(*) filter (where relrowsecurity) into rls_before from pg_class c join pg_namespace n on n.oid = c.relnamespace
     where n.nspname in ('public', 'emerriment_private') and c.relkind in ('r', 'p');

    -- ---------- 1. remove the extra privileges (only TRUNCATE, REFERENCES, TRIGGER, MAINTAIN) ----------
    revoke maintain, references, trigger, truncate on table
        public.ai_conversations, public.ai_events, public.ai_feedback, public.ai_memory, public.ai_messages, public.ai_questions,
        public.ai_settings, public.article_ratings, public.collection_articles, public.collections, public.email_deliveries,
        public.favorite_articles, public.product_clicks, public.profiles, public.purchases, public.quiz_results,
        public.reading_history, public.saved_articles, public.saved_products, public.website_settings
        from anon;
    revoke references, trigger, truncate on table
        public.article_products, public.encyclopedia_articles, public.leads, public.products
        from anon;                                   -- production keeps MAINTAIN (and SELECT) for anon here
    revoke references, trigger, truncate on table
        public.ai_conversations, public.ai_events, public.ai_feedback, public.ai_memory, public.ai_messages, public.ai_questions,
        public.ai_settings, public.article_products, public.article_ratings, public.collection_articles, public.collections,
        public.encyclopedia_articles, public.favorite_articles, public.leads, public.product_clicks, public.products,
        public.profiles, public.quiz_results, public.reading_history, public.saved_articles, public.saved_products,
        public.website_settings
        from authenticated;                          -- production keeps MAINTAIN for authenticated here
    revoke maintain, references, trigger, truncate on table public.email_deliveries, public.purchases from authenticated;

    -- ---------- 2. emerriment_private: make the stored ACL explicit, as in production ----------
    -- (USAGE is already denied to anon/authenticated; these statements only write the ACL out.)
    revoke all on schema emerriment_private from public;
    revoke all on schema emerriment_private from anon, authenticated;

    -- ---------- post-conditions (any failure rolls everything back) ----------
    select md5(string_agg(c.relname || ':' || a.grantee::regrole::text || ':' || a.privilege_type, ',' order by c.relname, a.grantee::regrole::text, a.privilege_type))
      into acl_md5
      from pg_class c join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public', aclexplode(c.relacl) a
     where c.relkind = 'r' and a.grantee in ('anon'::regrole, 'authenticated'::regrole);
    if acl_md5 is distinct from 'c5787f6d2cd12e5216b2854ac103bef3' then
        raise exception 'Post-check failed: anon/authenticated privileges do not match production (got %).', acl_md5;
    end if;
    if (select nspacl::text from pg_namespace where nspname = 'emerriment_private') is distinct from '{postgres=UC/postgres}' then
        raise exception 'Post-check failed: emerriment_private ACL is not {postgres=UC/postgres}.';
    end if;
    if has_schema_privilege('anon', 'emerriment_private', 'USAGE') or has_schema_privilege('authenticated', 'emerriment_private', 'USAGE') then
        raise exception 'Post-check failed: emerriment_private is usable by anon/authenticated.';
    end if;
    -- service_role and postgres entries unchanged: compare ACLs with anon/authenticated entries removed
    select string_agg(c.relname || ':' || coalesce(c.relacl::text, ''), ',' order by c.relname) into svc_after
      from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname in ('public', 'emerriment_private') and c.relkind in ('r', 'p', 'S');
    if replace(regexp_replace(svc_before, '(anon|authenticated)=[a-zA-Z]*/postgres,?', '', 'g'), ',}', '}')
       is distinct from replace(regexp_replace(svc_after, '(anon|authenticated)=[a-zA-Z]*/postgres,?', '', 'g'), ',}', '}') then
        raise exception 'Post-check failed: privileges of roles other than anon/authenticated changed.';
    end if;
    select count(*) into pol_after from pg_policies where schemaname in ('public', 'emerriment_private');
    select count(*) filter (where relrowsecurity) into rls_after from pg_class c join pg_namespace n on n.oid = c.relnamespace
     where n.nspname in ('public', 'emerriment_private') and c.relkind in ('r', 'p');
    if pol_after <> pol_before or rls_after <> rls_before then
        raise exception 'Post-check failed: policies or RLS changed.';
    end if;
    raise notice 'Staging privilege alignment OK: anon/authenticated ACL now % (production), emerriment_private ACL explicit, % policies, RLS on % tables.', acl_md5, pol_after, rls_after;
end
$align$;

select 'aligned' as status;
