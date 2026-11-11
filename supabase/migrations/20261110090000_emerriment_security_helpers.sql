-- =====================================================================
-- EMerriment security migration 1/5 — admin check and privilege guard
-- ---------------------------------------------------------------------
-- STATUS: PREPARED, NOT APPLIED. Review with the output of
-- supabase/audit/01_read_only_security_audit.sql before applying.
--
-- What it does
--   * public.emerriment_is_admin(): true when the signed-in user's profile has
--     is_admin = true. Used by the RLS policies in later migrations.
--   * A trigger on public.profiles that blocks anyone except an existing
--     administrator (or the service role / SQL editor) from changing
--     is_admin, and blocks removing the last administrator.
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
end
$$;


-- ---------------------------------------------------------------------
-- is_admin()
-- SECURITY DEFINER so it can read profiles without being blocked by the
-- profiles RLS policies (and without recursion). search_path is pinned.
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
-- Privilege guard on profiles.is_admin
-- ---------------------------------------------------------------------
-- SECURITY INVOKER on purpose: current_user must be the CALLER's role.
-- (Inside a SECURITY DEFINER function current_user would be the owner.)
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

    -- UPDATE
    if new.id is distinct from old.id and is_api_user then
        raise exception 'Not allowed to change a profile id.'
            using errcode = '42501';
    end if;

    if new.is_admin is distinct from old.is_admin then

        if is_api_user and not public.emerriment_is_admin() then
            raise exception 'Only an administrator can change administrator access.'
                using errcode = '42501';
        end if;

        -- Never remove the last administrator.
        if coalesce(old.is_admin, false) and not coalesce(new.is_admin, false) then
            if (select count(*) from public.profiles p where p.is_admin is true and p.id <> old.id) = 0 then
                raise exception 'Cannot remove the last administrator.'
                    using errcode = '42501';
            end if;
        end if;

    end if;

    return new;

end;
$$;

revoke all on function public.emerriment_guard_profile_privileges() from public;

drop trigger if exists emerriment_guard_profile_privileges on public.profiles;

create trigger emerriment_guard_profile_privileges
    before insert or update on public.profiles
    for each row
    execute function public.emerriment_guard_profile_privileges();

commit;
