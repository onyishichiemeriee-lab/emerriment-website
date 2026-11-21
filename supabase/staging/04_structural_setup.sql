-- =====================================================================
-- EMerriment STAGING — step 04: objects outside the exported schemas
-- ---------------------------------------------------------------------
-- The schema-only dump covers public and emerriment_private only, so a
-- new staging project lacks:
--   1. the auth.users signup trigger on_auth_user_created -> public.handle_new_user()
--   2. the storage bucket article-images (public, 5 MB, 5 image types; no files)
--   3. the 4 storage.objects policies for admin/assets/ — identical to
--      production except the account UUID: a placeholder that matches no
--      user (no production account id is copied). Step 07 replaces it
--      with the staging administrator's UUID.
--   4. the event trigger ensure_rls -> public.rls_auto_enable() (Supabase's
--      "auto-enable RLS on new public tables" feature; only ever ENABLES RLS)
--
-- Executed successfully on staging 2026-11-19 (verbatim below).
-- Atomic: refuses unless this is the empty staging database without these
-- objects; rolls back unless every post-check matches production.
--
-- Run:
--   bash supabase/staging/run-on-staging.sh --remote=<staging-ref> supabase/staging/04_structural_setup.sql
-- =====================================================================
do $setup$
declare
    v text;
    placeholder constant text := '00000000-0000-0000-0000-000000000000';
    cond text;
begin
    -- ---------- refuse unless this is the empty staging database ----------
    if to_regnamespace('emerriment_backup') is not null then raise exception 'Refusing: emerriment_backup exists (production marker).'; end if;
    if (select count(*) from auth.users) <> 0 then raise exception 'Refusing: auth.users is not empty.'; end if;
    if (select count(*) from public.leads) <> 0 or (select count(*) from public.profiles) <> 0 then raise exception 'Refusing: application tables are not empty.'; end if;
    if to_regprocedure('public.handle_new_user()') is null or to_regprocedure('public.rls_auto_enable()') is null then raise exception 'Refusing: imported functions missing.'; end if;
    if exists (select 1 from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal) then raise exception 'Refusing: auth.users already has a trigger.'; end if;
    if exists (select 1 from storage.buckets) then raise exception 'Refusing: storage already has buckets.'; end if;
    if exists (select 1 from pg_policies where schemaname = 'storage') then raise exception 'Refusing: storage already has policies.'; end if;
    if exists (select 1 from pg_event_trigger where evtname = 'ensure_rls') then raise exception 'Refusing: ensure_rls already exists.'; end if;

    -- ---------- 1. signup trigger ----------
    create trigger on_auth_user_created after insert on auth.users
        for each row execute function public.handle_new_user();

    -- ---------- 2. bucket (metadata only; no objects) ----------
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types, avif_autodetection)
    values ('article-images', 'article-images', true, 5242880,
            array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'], false);

    -- ---------- 3. storage policies (production definitions, placeholder UUID) ----------
    cond := format($c$((bucket_id = 'article-images'::text) AND ((storage.foldername(name))[1] = 'admin'::text) AND ((storage.foldername(name))[2] = 'assets'::text) AND (( SELECT (auth.uid())::text AS uid) = %L::text))$c$, placeholder);
    execute format('create policy %I on storage.objects as permissive for select using %s', 'Give access to a folder qt2lnz_0', cond);
    execute format('create policy %I on storage.objects as permissive for insert with check %s', 'Give access to a folder qt2lnz_1', cond);
    execute format('create policy %I on storage.objects as permissive for update using %s', 'Give access to a folder qt2lnz_2', cond);
    execute format('create policy %I on storage.objects as permissive for delete using %s', 'Give access to a folder qt2lnz_3', cond);

    -- ---------- 4. ensure_rls event trigger ----------
    create event trigger ensure_rls on ddl_command_end
        when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
        execute function public.rls_auto_enable();

    -- ---------- post-conditions ----------
    -- tgtype 5 = FOR EACH ROW (1) + INSERT (4), AFTER; enabled 'O' = origin (normal)
    select tgfoid::regprocedure::text || ' | ' || tgtype || ' | ' || tgenabled::text || ' | ' || tgnargs into v
      from pg_trigger where tgrelid = 'auth.users'::regclass and tgname = 'on_auth_user_created';
    if v is distinct from 'handle_new_user() | 5 | O | 0' and v is distinct from 'public.handle_new_user() | 5 | O | 0' then
        raise exception 'Post-check failed: signup trigger is %', v;
    end if;
    -- static test of the trigger function against profiles (no account is created):
    -- every NOT NULL column without a default must be one the function fills.
    select string_agg(attname, ',') into v from pg_attribute a
     where a.attrelid = 'public.profiles'::regclass and a.attnum > 0 and not a.attisdropped and a.attnotnull
       and not a.atthasdef and a.attidentity = '' and a.attgenerated = '' and a.attname not in ('id', 'email', 'full_name', 'is_admin');
    if v is not null then raise exception 'Post-check failed: profiles needs columns handle_new_user does not set: %', v; end if;
    if (select count(*) from pg_attribute where attrelid = 'public.profiles'::regclass and attname in ('id', 'email', 'full_name', 'is_admin') and not attisdropped) <> 4 then
        raise exception 'Post-check failed: profiles lacks a column handle_new_user writes.';
    end if;

    select concat_ws(' | ', public, file_size_limit, allowed_mime_types::text, avif_autodetection) into v from storage.buckets where id = 'article-images';
    if v is distinct from 't | 5242880 | {image/jpeg,image/png,image/webp,image/gif,image/avif} | f' then raise exception 'Post-check failed: bucket is %', v; end if;
    if (select count(*) from storage.objects) <> 0 then raise exception 'Post-check failed: storage has objects.'; end if;
    if (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects' and qual is not distinct from case when cmd = 'INSERT' then null else cond end
          and with_check is not distinct from case when cmd = 'INSERT' then cond else null end and roles = '{public}' and permissive = 'PERMISSIVE') <> 4 then
        raise exception 'Post-check failed: storage policies differ from the expected definitions.';
    end if;

    select concat_ws(' | ', evtevent, evtfoid::regproc::text, pg_get_userbyid(evtowner), evtenabled::text, evttags::text) into v from pg_event_trigger where evtname = 'ensure_rls';
    if v is distinct from 'ddl_command_end | rls_auto_enable | postgres | O | {"CREATE TABLE","CREATE TABLE AS","SELECT INTO"}' then
        raise exception 'Post-check failed: ensure_rls is %', v;
    end if;
    if (select count(*) filter (where relrowsecurity) from pg_class c join pg_namespace n on n.oid = c.relnamespace
         where n.nspname in ('public', 'emerriment_private') and c.relkind in ('r', 'p')) <> 25 then
        raise exception 'Post-check failed: RLS no longer on all 25 tables.';
    end if;
    if (select count(*) from auth.users) <> 0 or (select count(*) from public.profiles) <> 0 then raise exception 'Post-check failed: rows appeared.'; end if;

    raise notice 'Staging structural setup OK.';
end
$setup$;

select 'structural setup applied' as status;
