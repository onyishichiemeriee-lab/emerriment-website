-- =====================================================================
-- !!! FULL SECURITY ROLLBACK — ALL SEVEN MIGRATIONS AT ONCE !!!
-- This is NOT a rollback for migration 7 (20261117090000). It removes the
-- protections of migrations 1–6 as well (lead privacy, admin protection,
-- least-privilege grants) and drops email_deliveries and purchases.
-- To undo migration 7 only, use emerriment_migration7_rollback.sql.
--
-- It refuses to run unless the session first confirms the intent:
--     set emerriment.full_rollback = 'all-seven-migrations';
-- =====================================================================
--
-- =====================================================================
-- EMerriment — rollback for migrations 20261110090000 … 20261110090400
-- and 20261113090000 (migration 0, 20261110085900, is kept — see below)
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

-- 0. Explicit confirmation (see the header). Nothing has changed yet.
do $$
begin
    if coalesce(current_setting('emerriment.full_rollback', true), '') <> 'all-seven-migrations' then
        raise exception 'EMerriment: this is the FULL security rollback (all seven migrations). To undo migration 7 only, run emerriment_migration7_rollback.sql. To really run this one, first: set emerriment.full_rollback = ''all-seven-migrations'';';
    end if;
end
$$;

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
drop trigger if exists emerriment_guard_lead_consent on public.leads;
drop trigger if exists emerriment_guard_lead_consent_change on public.leads;

drop function if exists public.emerriment_guard_profile_privileges();
drop function if exists public.emerriment_guard_lead_insert();
drop function if exists public.emerriment_guard_lead_consent();
drop function if exists public.emerriment_guard_lead_consent_change();

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

-- Migration 6 (20261113090000) functions.
drop function if exists public.emerriment_set_admin(uuid, boolean);
drop function if exists public.emerriment_article_rating_summary(uuid);

-- Dropped after the policies that used it. EMerriment-specific name, so
-- no pre-existing function is affected.
drop function if exists public.emerriment_is_admin();

-- 3b. Migration 6 grants: back to Supabase's defaults as they were before
--     (ALL on every public table, EXECUTE on functions, for the API roles).
grant all on all tables in schema public to anon, authenticated;
do $$
begin
    if to_regprocedure('public.handle_new_user()') is not null then
        grant execute on function public.handle_new_user() to anon, authenticated;
    end if;
    if to_regprocedure('public.rls_auto_enable()') is not null then
        grant execute on function public.rls_auto_enable() to anon, authenticated;
    end if;
    if to_regclass('storage.buckets') is not null then
        begin
            update storage.buckets set allowed_mime_types = null, file_size_limit = null
             where id = 'article-images';
        exception when undefined_column or insufficient_privilege then
            null;
        end;
    end if;
end
$$;

-- 4. Indexes.
drop index if exists public.emerriment_leads_address_idx;
drop index if exists public.emerriment_leads_submitted_at_idx;
do $$
declare
    i record;
begin
    for i in select indexname from pg_indexes
              where schemaname = 'public' and indexname like 'emerriment\_%\_idx'
    loop
        execute format('drop index if exists public.%I', i.indexname);
    end loop;
end
$$;

-- Migration 0 (20261110085900) is intentionally NOT reverted: the lead ids
-- and primary key it added are a data repair (every id was NULL) and the
-- quoted status values it cleaned up were never recognised by any code.
-- To restore the previous lead values exactly, use the backup table
-- emerriment_backup.leads_20261113 (supabase/backups/README.md).

-- 5. Delivery history (comment out to keep it).
drop table if exists public.email_deliveries;

-- Migration 7 (20261117090000): verified purchases (after email_deliveries,
-- which references it). The leads consent columns are intentionally KEPT:
-- they are consent evidence; drop them manually only if you are sure.
drop table if exists public.purchases;

-- 6. Private helper schema (baseline table, enable_rls, request_role).
drop schema if exists emerriment_private cascade;

notify pgrst, 'reload schema';

commit;
