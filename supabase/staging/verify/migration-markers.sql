-- READ-ONLY: one or more objects each EMerriment migration creates (true = present).
-- Run on staging BEFORE step 05 (migration repair): all eight migration rows must be true,
-- together with a clean compare-with-production.js result, before the history is recorded.
-- The last row is true only before the repair (afterwards the history table exists).
-- When a new migration is added, add a marker row for it here.
select '20261110085900 leads identity' m, (select attidentity from pg_attribute where attrelid = 'public.leads'::regclass and attname = 'id') = 'd' ok
union all select '20261110090000 security helpers', to_regprocedure('emerriment_private.request_role()') is not null and to_regclass('emerriment_private.rls_baseline') is not null and to_regprocedure('public.emerriment_is_admin()') is not null
union all select '20261110090100 leads rls', exists (select 1 from pg_trigger where tgname = 'emerriment_guard_lead_insert') and exists (select 1 from pg_policies where policyname = 'emerriment_leads_restrict_select')
union all select '20261110090200 user data rls', exists (select 1 from pg_policies where policyname = 'emerriment_profiles_own_select') and exists (select 1 from pg_policies where policyname = 'emerriment_profiles_restrict_delete')
union all select '20261110090300 content admin rls', (select count(*) from pg_policies where tablename = 'encyclopedia_articles' and policyname like 'emerriment%') > 0
union all select '20261110090400 email delivery', to_regclass('public.email_deliveries') is not null
union all select '20261113090000 production hardening', to_regprocedure('public.emerriment_set_admin(uuid,boolean)') is not null and exists (select 1 from pg_policies where policyname = 'emerriment_products_public_read')
              and to_regclass('public.emerriment_articles_status_idx') is not null and not has_function_privilege('anon', 'public.handle_new_user()', 'EXECUTE')
union all select '20261117090000 consent and purchases', to_regclass('public.purchases') is not null and exists (select 1 from pg_trigger where tgname = 'emerriment_guard_lead_consent_change')
              and exists (select 1 from pg_attribute where attrelid = 'public.leads'::regclass and attname = 'marketing_consent_token_hash' and not attisdropped)
union all select 'zz history table absent (expected only before step 05)',to_regclass('supabase_migrations.schema_migrations') is null
order by 1;
