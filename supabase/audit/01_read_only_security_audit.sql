-- =====================================================================
-- EMerriment — READ-ONLY Supabase security audit
-- ---------------------------------------------------------------------
-- Run in the Supabase SQL Editor and save the output BEFORE applying any
-- migration in supabase/migrations/. Every query reads metadata only
-- (schema, policies, grants). No customer rows are returned; the admin
-- check returns a count only.
--
-- Nothing in this file changes the database.
-- =====================================================================

-- Tables used by the EMerriment code (found by scanning the repository)
-- plus the table proposed by the email migration.
with app_tables(name) as (
    values
        ('leads'), ('profiles'), ('quiz_results'), ('reading_history'),
        ('saved_articles'), ('saved_products'), ('favorite_articles'),
        ('article_ratings'), ('article_products'), ('encyclopedia_articles'),
        ('products'), ('product_clicks'), ('collections'),
        ('collection_articles'), ('website_settings'), ('ai_settings'),
        ('ai_conversations'), ('ai_messages'), ('ai_memory'), ('ai_feedback'),
        ('ai_events'), ('ai_questions'), ('email_deliveries')
)

-- 1. Which tables exist, and is RLS enabled / forced?
select a.name as table_name,
       c.oid is not null as exists,
       c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as rls_forced
from app_tables a
left join pg_class c
       on c.relname = a.name
      and c.relnamespace = 'public'::regnamespace
      and c.relkind = 'r'
order by 1;

-- 2. Any OTHER public tables not referenced by the code (review them too).
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
where c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
order by 1;

-- 3. Columns, types, nullability and defaults.
select table_name, column_name, data_type, udt_name, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
order by table_name, ordinal_position;

-- 4. Constraints (primary keys, unique, check, foreign keys).
select conrelid::regclass as table_name, conname, contype,
       pg_get_constraintdef(oid) as definition
from pg_constraint
where connamespace = 'public'::regnamespace
order by 1, 2;

-- 5. Enum types and their values (e.g. if email_status / status are enums).
select t.typname as enum_type, e.enumsortorder, e.enumlabel
from pg_type t
join pg_enum e on e.enumtypid = t.oid
join pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'public'
order by 1, 2;

-- 6. Indexes.
select tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
order by 1, 2;

-- 7. Every RLS policy and its expressions.
select tablename, policyname, permissive, roles, cmd,
       qual as using_expression, with_check as check_expression
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 8. Table privileges granted to the API roles.
select grantee, table_name, string_agg(privilege_type, ', ' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public' and grantee in ('anon', 'authenticated', 'public')
group by grantee, table_name
order by table_name, grantee;

-- 9. Column-level privileges (if any were configured).
select grantee, table_name, column_name, privilege_type
from information_schema.column_privileges
where table_schema = 'public' and grantee in ('anon', 'authenticated')
order by table_name, column_name, grantee;

-- 10. Triggers on public tables (including signup triggers on auth.users).
select event_object_schema, event_object_table, trigger_name,
       action_timing, event_manipulation, action_statement
from information_schema.triggers
where event_object_schema in ('public', 'auth')
order by 1, 2, 3;

-- 11. Functions in public: security definer? search_path pinned?
select p.proname as function_name,
       pg_get_function_identity_arguments(p.oid) as arguments,
       p.prosecdef as security_definer,
       p.proconfig as settings,
       pg_get_userbyid(p.proowner) as owner
from pg_proc p
where p.pronamespace = 'public'::regnamespace
order by 1;

-- 12. Who may execute those functions.
select routine_name, grantee, privilege_type
from information_schema.routine_privileges
where routine_schema = 'public' and grantee in ('anon', 'authenticated', 'public')
order by 1, 2;

-- 13. Views in public (views bypass RLS unless security_invoker is set).
select c.relname as view_name,
       coalesce((select option_value from pg_options_to_table(c.reloptions)
                 where option_name = 'security_invoker'), 'false') as security_invoker
from pg_class c
where c.relnamespace = 'public'::regnamespace and c.relkind in ('v', 'm')
order by 1;

-- 14. Storage buckets and whether they are public.
select id, name, public from storage.buckets order by 1;

-- 15. Number of administrators (count only — no personal data).
select count(*) as admin_count from public.profiles where is_admin is true;

-- 16. Distinct status values in use (values only — no personal data).
select 'email_status' as column_name, email_status::text as value, count(*) from public.leads group by 2
union all
select 'status', status::text, count(*) from public.leads group by 2
order by 1, 2;

-- 17. Does the email table hold duplicate addresses? (counts only)
select count(*) as leads_total,
       count(distinct lower(btrim(email))) as distinct_addresses
from public.leads;
