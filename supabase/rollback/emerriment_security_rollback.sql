-- =====================================================================
-- EMerriment — rollback for migrations 20261110090000 … 20261110090400
-- ---------------------------------------------------------------------
-- Removes ONLY what those migrations created (all names start with
-- "emerriment_", plus is_admin, increment_article_views and
-- email_deliveries). Pre-existing policies were never dropped, so after
-- this the database is back to its previous access rules.
--
-- Not reverted automatically:
--   * RLS stays ENABLED on tables where it was turned on. If a table had
--     RLS disabled before (see your saved audit output, query 1), disable
--     it again manually:  alter table public.<name> disable row level security;
--   * Enum values added by migration 5 cannot be removed (Postgres
--     limitation); they are harmless if unused.
--   * Indexes emerriment_leads_* are dropped below.
--
-- After rollback, the website code on this branch keeps working:
-- article views fall back to the old update, and the email functions run
-- without email_deliveries.
-- =====================================================================

begin;

-- All emerriment_* policies on public tables.
do $$
declare
    p record;
begin
    for p in
        select tablename, policyname from pg_policies
         where schemaname = 'public' and policyname like 'emerriment\_%'
    loop
        execute format('drop policy if exists %I on public.%I', p.policyname, p.tablename);
        raise notice 'EMerriment rollback: dropped policy % on %.', p.policyname, p.tablename;
    end loop;
end
$$;

drop trigger if exists emerriment_guard_profile_privileges on public.profiles;
drop trigger if exists emerriment_guard_lead_insert on public.leads;

drop function if exists public.emerriment_guard_profile_privileges();
drop function if exists public.emerriment_guard_lead_insert();

do $$
declare
    f record;
begin
    for f in
        select pg_get_function_identity_arguments(oid) as args
          from pg_proc
         where pronamespace = 'public'::regnamespace and proname = 'increment_article_views'
    loop
        execute format('drop function if exists public.increment_article_views(%s)', f.args);
    end loop;
end
$$;

-- Dropped last (the policies above depended on it). It has an
-- EMerriment-specific name, so no pre-existing function is affected.
drop function if exists public.emerriment_is_admin();

drop index if exists public.emerriment_leads_address_idx;
drop index if exists public.emerriment_leads_submitted_at_idx;

-- Removes the delivery history. Comment out to keep it.
drop table if exists public.email_deliveries;

commit;
