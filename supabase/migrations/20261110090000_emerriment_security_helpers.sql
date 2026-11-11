-- =====================================================================
-- EMerriment security migration 1/5 — helpers, admin check, privilege guard
-- ---------------------------------------------------------------------
-- STATUS: PREPARED, NOT APPLIED. Review with the output of
-- supabase/audit/01_read_only_security_audit.sql before applying.
-- Must run BEFORE migrations 2, 3 and 4 (they check for it).
--
-- What it does
--   * Schema emerriment_private (not exposed through the website API):
--       - rls_baseline: records each table's RLS state BEFORE these
--         migrations change it, so the rollback can restore it exactly.
--       - enable_rls(table): records the baseline, then enables RLS.
--       - request_role(): the API role of the current request
--         ('anon' / 'authenticated' / 'service_role' / '') read from the
--         request's JWT claims (replaces the deprecated auth.role()).
--   * public.emerriment_is_admin(): true when the signed-in user's
--     profile has is_admin = true. Used by the policies in 2–4.
--   * Trigger on public.profiles:
--       - only an existing administrator (or a trusted server role) can
--         change is_admin or create an administrator profile;
--       - the last administrator can never be demoted or deleted
--         (serialised with an advisory lock, so two admins demoting each
--         other at the same moment cannot leave zero admins);
--       - a profile id cannot be changed through the API.
--
-- Why
--   Admin pages decide access in the browser (admin/*.js) and
--   admin/js/user-detailsCMS.js toggles is_admin with a direct update.
--   Without a database rule, any signed-in user could run
--   supabase.from("profiles").update({ is_admin: true }) on their own row.
--
-- Preserves
--   * The current administrator account(s): nothing is changed for them.
--   * The CMS "toggle admin" button keeps working for administrators.
--   * Signup: rows created by the auth trigger / service role are allowed.
--
-- Safe to re-run (create or replace / if not exists / drop-and-create of
-- EMerriment-named objects only).
--
-- PENDING VERIFICATION against the audit output:
--   * public.profiles is not FORCE ROW LEVEL SECURITY (audit query 1). If
--     it is, emerriment_is_admin() would be subject to profiles policies.
--
-- Rollback: supabase/rollback/emerriment_security_rollback.sql
-- =====================================================================

begin;

-- Refuse to continue if there is no administrator, so the CMS cannot be
-- locked out by the policies that follow.
do $$
begin
    if not exists (select 1 from public.profiles where is_admin is true) then
        raise exception 'EMerriment: no administrator profile exists; aborting so the CMS is not locked out.';
    end if;

    if exists (select 1 from pg_class
               where oid = 'public.profiles'::regclass and relforcerowsecurity) then
        raise exception 'EMerriment: public.profiles uses FORCE ROW LEVEL SECURITY; review emerriment_is_admin() before applying.';
    end if;
end
$$;


-- ---------------------------------------------------------------------
-- Private helpers (not reachable through the website API)
-- ---------------------------------------------------------------------
create schema if not exists emerriment_private;
revoke all on schema emerriment_private from public;
revoke all on schema emerriment_private from anon, authenticated;

create table if not exists emerriment_private.rls_baseline (
    table_name   text primary key,
    rls_enabled  boolean not null,
    recorded_at  timestamptz not null default now()
);

revoke all on table emerriment_private.rls_baseline from public;

-- Stable "schema.table" name, independent of the session's search_path.
create or replace function emerriment_private.qualified_name(target regclass)
returns text
language sql
stable
set search_path = ''
as $$
    select pg_catalog.format('%I.%I', n.nspname, c.relname)
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
     where c.oid = target;
$$;

revoke all on function emerriment_private.qualified_name(regclass) from public;

-- Records the table's current RLS state (first time only), then enables RLS.
create or replace function emerriment_private.enable_rls(target regclass)
returns void
language plpgsql
set search_path = ''
as $$
begin
    insert into emerriment_private.rls_baseline (table_name, rls_enabled)
    select emerriment_private.qualified_name(target), c.relrowsecurity
      from pg_catalog.pg_class c
     where c.oid = target
    on conflict (table_name) do nothing;

    execute pg_catalog.format('alter table %s enable row level security',
                              emerriment_private.qualified_name(target));
end;
$$;

revoke all on function emerriment_private.enable_rls(regclass) from public;

-- Was RLS already enabled on this table before the EMerriment migrations?
create or replace function emerriment_private.rls_was_enabled(target regclass)
returns boolean
language sql
stable
set search_path = ''
as $$
    select coalesce(
        (select b.rls_enabled from emerriment_private.rls_baseline b
          where b.table_name = emerriment_private.qualified_name(target)),
        false
    );
$$;

revoke all on function emerriment_private.rls_was_enabled(regclass) from public;

-- Role of the current API request, from the JWT claims PostgREST sets.
-- '' for connections that are not API requests (SQL editor, auth service).
create or replace function emerriment_private.request_role()
returns text
language sql
stable
set search_path = ''
as $$
    select coalesce(
        nullif(current_setting('request.jwt.claim.role', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role',
        ''
    );
$$;

revoke all on function emerriment_private.request_role() from public;


-- ---------------------------------------------------------------------
-- emerriment_is_admin()
-- SECURITY DEFINER so it can read profiles without being blocked by the
-- profiles RLS policies (and without recursion). search_path is pinned.
-- Uniquely named so an existing public.is_admin() is never replaced.
-- ---------------------------------------------------------------------
create or replace function public.emerriment_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select coalesce(
        (select p.is_admin from public.profiles p where p.id = (select auth.uid())),
        false
    );
$$;

revoke all on function public.emerriment_is_admin() from public;
grant execute on function public.emerriment_is_admin() to anon, authenticated, service_role;


-- ---------------------------------------------------------------------
-- Privilege guard on profiles
-- SECURITY INVOKER on purpose: current_user must be the CALLER's role.
-- (Inside a SECURITY DEFINER function current_user would be the owner.)
-- ---------------------------------------------------------------------
create or replace function public.emerriment_guard_profile_privileges()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
    -- Requests through the API run as "anon" or "authenticated".
    -- The service role, the auth signup trigger and the SQL editor run as
    -- other roles and are trusted.
    is_api_user boolean := current_user in ('anon', 'authenticated');
begin

    if tg_op = 'INSERT' then
        if is_api_user and coalesce(new.is_admin, false) and not public.emerriment_is_admin() then
            raise exception 'Not allowed to create an administrator profile.'
                using errcode = '42501';
        end if;
        return new;
    end if;

    -- Demoting or deleting an administrator: serialise all such changes so
    -- the "is there another admin?" check below cannot race.
    if coalesce(old.is_admin, false)
       and (tg_op = 'DELETE' or not coalesce(new.is_admin, false)) then

        perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('emerriment_admin_change'));

        if tg_op = 'UPDATE' and is_api_user and not public.emerriment_is_admin() then
            raise exception 'Only an administrator can change administrator access.'
                using errcode = '42501';
        end if;

        if (select count(*) from public.profiles p
            where p.is_admin is true and p.id <> old.id) = 0 then
            raise exception 'Cannot remove the last administrator.'
                using errcode = '42501';
        end if;

    end if;

    if tg_op = 'DELETE' then
        return old;
    end if;

    -- UPDATE
    if new.id is distinct from old.id and is_api_user then
        raise exception 'Not allowed to change a profile id.'
            using errcode = '42501';
    end if;

    if new.is_admin is distinct from old.is_admin
       and is_api_user and not public.emerriment_is_admin() then
        raise exception 'Only an administrator can change administrator access.'
            using errcode = '42501';
    end if;

    return new;

end;
$$;

revoke all on function public.emerriment_guard_profile_privileges() from public;

drop trigger if exists emerriment_guard_profile_privileges on public.profiles;

create trigger emerriment_guard_profile_privileges
    before insert or update or delete on public.profiles
    for each row
    execute function public.emerriment_guard_profile_privileges();

commit;
