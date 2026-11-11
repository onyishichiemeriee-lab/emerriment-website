-- =====================================================================
-- EMerriment — rollback for migrations 20261110090000 … 20261110090400
-- ---------------------------------------------------------------------
-- Removes ONLY what those migrations created: policies, triggers,
-- functions and indexes whose names start with "emerriment_", the
-- email_deliveries table and the emerriment_private schema.
-- Pre-existing policies were never dropped, so afterwards the database is
-- back to its previous access rules.
--
-- RLS state is restored from emerriment_private.rls_baseline, which
-- migration 1 filled BEFORE any table's RLS was switched on: tables that
-- had RLS OFF are switched off again. (Without this, a table that was
-- open before would become completely inaccessible once the EMerriment
-- policies are gone.)
--
-- Not reverted:
--   * Enum values added by migration 5 (Postgres cannot remove enum
--     values); they are harmless if unused.
--   * Data: leads rows, profiles etc. are never touched by the migrations
--     or by this rollback. Dropping email_deliveries removes only the
--     delivery history (comment that line out to keep it).
--
-- After rollback, the website code on this branch keeps working: article
-- views fall back to the old update, and the email functions run without
-- email_deliveries.
-- =====================================================================

begin;

-- 1. All emerriment_* policies on public tables.
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

-- 2. Restore the RLS state recorded before the migrations.
do $$
declare
    b record;
begin
    if to_regclass('emerriment_private.rls_baseline') is null then
        raise notice 'EMerriment rollback: no RLS baseline found; RLS left as is. Compare with your saved audit (query 1).';
        return;
    end if;

    for b in select table_name, rls_enabled from emerriment_private.rls_baseline loop
        if to_regclass(b.table_name) is null then
            continue;
        end if;
        if not b.rls_enabled then
            execute format('alter table %s disable row level security', b.table_name);
            raise notice 'EMerriment rollback: RLS switched back OFF on % (as before).', b.table_name;
        end if;
    end loop;
end
$$;

-- 3. Triggers and functions.
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
         where pronamespace = 'public'::regnamespace
           and proname = 'emerriment_increment_article_views'
    loop
        execute format('drop function if exists public.emerriment_increment_article_views(%s)', f.args);
    end loop;
end
$$;

-- Dropped after the policies that used it. EMerriment-specific name, so
-- no pre-existing function is affected.
drop function if exists public.emerriment_is_admin();

-- 4. Indexes.
drop index if exists public.emerriment_leads_address_idx;
drop index if exists public.emerriment_leads_submitted_at_idx;

-- 5. Delivery history (comment out to keep it).
drop table if exists public.email_deliveries;

-- 6. Private helper schema (baseline table, enable_rls, request_role).
drop schema if exists emerriment_private cascade;

notify pgrst, 'reload schema';

commit;
