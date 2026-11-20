-- =====================================================================
-- EMerriment STAGING — step 08: promote the synthetic administrator and
-- point the 4 article-images storage policies at it
-- ---------------------------------------------------------------------
-- * Promotion uses the documented bootstrap path: a trusted direct UPDATE
--   of public.profiles by the database owner (the profile-privilege guard
--   blocks the same change from anon/authenticated API requests).
-- * The storage policies created by step 04 carry the placeholder UUID
--   00000000-0000-0000-0000-000000000000; it is replaced with the staging
--   administrator's UUID. Policy names, roles, commands and conditions
--   stay identical to production; only the account UUID differs.
-- * Accounts are looked up by their synthetic @example.test addresses
--   (created by step 07); no UUID is hard-coded here.
-- Atomic: refuses unless auth.users is exactly the three synthetic accounts
-- with untouched non-admin profiles (made by the signup trigger) and the 4
-- placeholder policies; rolls back unless every post-check holds.
--
-- Run:
--   bash supabase/staging/run-on-staging.sh --remote=<staging-ref> supabase/staging/08_promote_admin_and_storage.sql
-- =====================================================================
do $p8$
declare
    admin_uid uuid; user_a uuid; user_b uuid;
    placeholder constant text := '00000000-0000-0000-0000-000000000000';
    uuid_re constant text := '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
    cond text; v text;
begin
    -- ---------- guards ----------
    if to_regnamespace('emerriment_backup') is not null then raise exception 'Refusing: production marker present.'; end if;
    if (select count(*) from auth.users) <> 3
       or (select count(*) from auth.users where email in ('staging-admin@example.test', 'staging-user-a@example.test', 'staging-user-b@example.test')) <> 3 then
        raise exception 'Refusing: auth.users is not exactly the three synthetic staging accounts.';
    end if;
    select id into admin_uid from auth.users where email = 'staging-admin@example.test';
    select id into user_a    from auth.users where email = 'staging-user-a@example.test';
    select id into user_b    from auth.users where email = 'staging-user-b@example.test';
    -- the signup trigger created the profiles, none is an administrator yet
    if (select string_agg(p.id::text || '=' || p.email || '=' || coalesce(p.is_admin, false), ',' order by p.email) from public.profiles p) is distinct from
       admin_uid || '=staging-admin@example.test=false,' || user_a || '=staging-user-a@example.test=false,' || user_b || '=staging-user-b@example.test=false' then
        raise exception 'Refusing: profiles are not exactly the three trigger-created, non-admin profiles.';
    end if;
    -- exactly the 4 step-04 policies, and the only UUID literal in them is the placeholder
    if (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects'
          and coalesce(qual, with_check) like '%' || placeholder || '%') <> 4 then
        raise exception 'Refusing: expected the 4 placeholder storage policies from step 04.';
    end if;
    if exists (select 1 from pg_policies p, regexp_matches(coalesce(p.qual, '') || ' ' || coalesce(p.with_check, ''), uuid_re, 'g') m
               where p.schemaname = 'storage' and m[1] <> placeholder) then
        raise exception 'Refusing: a storage policy contains a UUID other than the placeholder.';
    end if;

    -- ---------- 1. promote the staging administrator ----------
    update public.profiles set is_admin = true where id = admin_uid;

    -- ---------- 2. storage policies -> staging administrator ----------
    cond := format($c$((bucket_id = 'article-images'::text) AND ((storage.foldername(name))[1] = 'admin'::text) AND ((storage.foldername(name))[2] = 'assets'::text) AND (( SELECT (auth.uid())::text AS uid) = %L::text))$c$, admin_uid::text);
    execute format('alter policy %I on storage.objects using %s', 'Give access to a folder qt2lnz_0', cond);
    execute format('alter policy %I on storage.objects with check %s', 'Give access to a folder qt2lnz_1', cond);
    execute format('alter policy %I on storage.objects using %s', 'Give access to a folder qt2lnz_2', cond);
    execute format('alter policy %I on storage.objects using %s', 'Give access to a folder qt2lnz_3', cond);

    -- ---------- post-conditions ----------
    if (select string_agg(id::text, ',') from public.profiles where is_admin is true) is distinct from admin_uid::text then
        raise exception 'Post-check failed: administrator set is not exactly the staging admin.';
    end if;
    if (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects'
          and qual is not distinct from case when cmd = 'INSERT' then null else cond end
          and with_check is not distinct from case when cmd = 'INSERT' then cond else null end
          and roles = '{public}' and permissive = 'PERMISSIVE') <> 4 then
        raise exception 'Post-check failed: storage policies are not the expected 4 definitions.';
    end if;
    if exists (select 1 from pg_policies p, regexp_matches(coalesce(p.qual, '') || ' ' || coalesce(p.with_check, ''), uuid_re, 'g') m
               where p.schemaname = 'storage' and m[1] <> admin_uid::text) then
        raise exception 'Post-check failed: a storage policy contains a UUID other than the staging administrator.';
    end if;
    raise notice 'Admin promotion and storage policy update OK.';
end
$p8$;

select 'admin promoted; storage policies set to the staging administrator' as status;
