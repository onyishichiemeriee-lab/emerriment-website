-- =====================================================================
-- EMerriment — READ-ONLY post-migration verification
-- ---------------------------------------------------------------------
-- Run in the Supabase SQL Editor AFTER applying the migrations (staging
-- first). Every query reads metadata only; no customer rows are returned.
-- Expected results are noted above each query.
-- Nothing in this file changes the database.
-- =====================================================================

-- 1. Helper objects exist. Expect 8 rows:
--    public: emerriment_is_admin (definer), emerriment_guard_profile_privileges
--    (invoker), emerriment_guard_lead_insert (definer),
--    emerriment_increment_article_views (definer) — each with search_path="";
--    emerriment_private: enable_rls, qualified_name, request_role,
--    rls_was_enabled.
select n.nspname as schema, p.proname as function_name,
       pg_get_function_identity_arguments(p.oid) as arguments,
       p.prosecdef as security_definer, p.proconfig as settings
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where (n.nspname = 'public' and p.proname like 'emerriment\_%')
   or n.nspname = 'emerriment_private'
order by 1, 2;

-- 2. Triggers. Expect emerriment_guard_profile_privileges on profiles
--    (INSERT, UPDATE, DELETE) and emerriment_guard_lead_insert on leads (INSERT).
select event_object_table, trigger_name, action_timing, event_manipulation
from information_schema.triggers
where trigger_name like 'emerriment\_%'
order by 1, 2, 4;

-- 3. RLS now enabled on every EMerriment table (expect rls_enabled = true).
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
where c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
  and c.relname in ('leads','profiles','quiz_results','reading_history','saved_articles',
                    'saved_products','favorite_articles','article_ratings','ai_conversations',
                    'ai_messages','ai_memory','encyclopedia_articles','products','collections',
                    'collection_articles','article_products','website_settings','ai_settings',
                    'ai_feedback','ai_events','ai_questions','product_clicks','email_deliveries')
order by 1;

-- 4. The RLS state recorded BEFORE the migrations (used by the rollback).
select table_name, rls_enabled as rls_enabled_before, recorded_at
from emerriment_private.rls_baseline
order by 1;

-- 5. All EMerriment policies (restrictive ones must target {anon,authenticated}).
select tablename, policyname, permissive, roles, cmd
from pg_policies
where schemaname = 'public' and policyname like 'emerriment\_%'
order by tablename, policyname;

-- 6. Pre-existing (non-EMerriment) policies still in place — review that the
--    restrictive EMerriment policies bound them as intended.
select tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and policyname not like 'emerriment\_%'
order by tablename, policyname;

-- 7. email_deliveries: unique key and no API grants.
--    Expect the unique constraint, and no rows for anon/authenticated below.
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.email_deliveries'::regclass;

select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'email_deliveries'
  and grantee in ('anon', 'authenticated');

-- 8. Status values now accepted (enum labels, if the columns are enums).
select t.typname, e.enumlabel
from pg_type t join pg_enum e on e.enumtypid = t.oid
where t.typname in (
    select udt_name from information_schema.columns
    where table_schema = 'public' and table_name = 'leads'
      and column_name in ('email_status', 'status'))
order by 1, e.enumsortorder;

-- 9. Administrators still present (count only).
select count(*) as admin_count from public.profiles where is_admin is true;
