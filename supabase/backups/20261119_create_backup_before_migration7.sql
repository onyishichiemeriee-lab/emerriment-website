-- =====================================================================
-- EMerriment — in-database backup BEFORE migration 7 (suffix 20261119)
-- ---------------------------------------------------------------------
-- STATUS: PREPARED, NOT RUN. Run only with the owner's approval, after
-- supabase/audit/04_migration7_preflight_read_only.sql passed (49 PASS,
-- 0 FAIL) and before
-- supabase/migrations/20261117090000_emerriment_marketing_consent_and_purchases.sql.
-- The suffix is a label; manifest_20261119.backed_up_at records the time.
--
-- WHAT IT CREATES (inside the private schema emerriment_backup, next to
-- the 2026-11-13 backup, which is NEVER touched; every new object ends in
-- _20261119):
--   Data
--     <table>_20261119        full copy of each public table (23 expected)
--     manifest_20261119       per table: source, copy, row count, MD5
--                             fingerprint (same snapshot as the copy)
--     settings_20261119       session settings used for the fingerprints
--     baseline_20261119       counts and the executing role
--   Structure (recorded definitions)
--     columns_20261119, constraints_20261119, indexes_20261119,
--     sequences_20261119, triggers_20261119, functions_20261119,
--     views_20261119, types_20261119, rls_20261119, policies_20261119
--   Access (complete: raw ACLs, owners, default privileges, and the same
--   ACLs expanded per grantee, built-in defaults included)
--     objects_acl_20261119, column_acl_20261119, default_acl_20261119,
--     table_grants_20261119, column_grants_20261119,
--     function_grants_20261119, schema_grants_20261119
--   Platform
--     bucket_settings_20261119, event_triggers_20261119,
--     migration_history_20261119
--
-- EFFECTS ON PRODUCTION
--   * Reads public tables (ACCESS SHARE locks: site, quiz and CMS keep
--     working), counts auth.users and storage.objects. Creates, changes or
--     deletes nothing in public, auth or storage; no sequence is read with
--     nextval or changed.
--   * Adds ~50 tables to emerriment_backup (a few MB). They contain
--     personal data: no access for PUBLIC, anon, authenticated or
--     service_role; RLS enabled on every one.
--   * Creating tables fires Supabase's own DDL event triggers (PostgREST /
--     GraphQL schema reload). Harmless: the schema is not exposed.
--   * One transaction at REPEATABLE READ: one consistent snapshot. Either
--     everything is written or nothing is.
--
-- SAFETY STOPS (the transaction aborts, nothing is written):
--   * backup 20261119 already exists (never overwritten);
--   * migration 7 is already applied;
--   * the public schema does not hold exactly 23 tables;
--   * row level security could hide rows from the executing role (it must
--     be a superuser, have BYPASSRLS, or own every RLS table that does not
--     force RLS) — otherwise a copy could be silently incomplete;
--   * any copy's row count or fingerprint differs from the live table.
--
-- HOW TO RUN: Supabase → SQL Editor → New query → paste this whole file →
-- Run. The last statement is a read-only summary (23 rows,
-- copy_matches = true). Then run 20261119_verify_backup.sql.
-- Restore and limitations: supabase/backups/README.md.
-- =====================================================================

begin;
set transaction isolation level repeatable read;

-- Fingerprints are row text; fix every setting that changes it.
set local timezone = 'UTC';
set local datestyle = 'ISO, MDY';
set local intervalstyle = 'postgres';
set local extra_float_digits = 1;
set local bytea_output = 'hex';

-- ---------------------------------------------------------------------
-- Safety stops
-- ---------------------------------------------------------------------
do $$
declare
    n int;
    hidden text;
begin
    if to_regclass('emerriment_backup.manifest_20261119') is not null then
        raise exception 'EMerriment: backup 20261119 already exists; not overwritten.';
    end if;

    if to_regclass('public.purchases') is not null
       or exists (select 1 from pg_attribute where attrelid = 'public.leads'::regclass
                     and attname = 'marketing_consent' and not attisdropped) then
        raise exception 'EMerriment: migration 7 objects already exist; this backup must be taken BEFORE migration 7.';
    end if;

    select count(*) into n from pg_class
     where relnamespace = 'public'::regnamespace and relkind in ('r', 'p');
    if n <> 23 then
        raise exception 'EMerriment: expected 23 public tables, found %. Re-run the preflight before backing up.', n;
    end if;

    -- RLS visibility: unless the role is a superuser or has BYPASSRLS, RLS
    -- applies to every RLS table it does not own (directly or through
    -- membership) and to every table that forces RLS.
    if not exists (select 1 from pg_roles where rolname = current_user and (rolsuper or rolbypassrls)) then
        select string_agg(relname, ', ' order by relname) into hidden
          from pg_class
         where relnamespace = 'public'::regnamespace and relkind in ('r', 'p') and relrowsecurity
           and (relforcerowsecurity or not pg_has_role(current_user, relowner, 'USAGE'));
        if hidden is not null then
            raise exception 'EMerriment: row level security applies to role % on: %. A backup could silently miss rows. Run as the table owner (postgres), a superuser or a BYPASSRLS role.',
                current_user, hidden;
        end if;
    end if;
end
$$;

create schema if not exists emerriment_backup;
revoke all on schema emerriment_backup from public;
revoke all on schema emerriment_backup from anon, authenticated, service_role;


-- ---------------------------------------------------------------------
-- 1. Table copies + manifest (row count and content fingerprint)
--    Fingerprint = MD5 of every row's text, sorted byte-wise
--    (COLLATE "C"), joined by newlines; duplicates and NULLs included.
-- ---------------------------------------------------------------------
create table emerriment_backup.settings_20261119 as
    select name, setting
      from pg_settings
     where name in ('TimeZone', 'DateStyle', 'IntervalStyle', 'extra_float_digits', 'bytea_output', 'server_version');

create table emerriment_backup.manifest_20261119 (
    table_name    text primary key,
    backup_table  text not null unique,
    row_count     bigint not null,
    content_md5   text   not null,
    backed_up_at  timestamptz not null default now()
);

do $$
declare
    t text;
    live_count bigint;
    live_md5 text;
    copy_count bigint;
    copy_md5 text;
begin
    for t in
        select relname from pg_class
         where relnamespace = 'public'::regnamespace and relkind in ('r', 'p')
         order by 1
    loop
        if octet_length(t || '_20261119') > 63 then
            raise exception 'EMerriment: table name % is too long for a backup copy name; aborted.', t;
        end if;

        execute format('create table emerriment_backup.%I as table public.%I', t || '_20261119', t);

        execute format($f$select count(*), md5(coalesce(string_agg(x::text, E'\n' order by x::text collate "C"), ''))
                            from public.%I x$f$, t)
           into live_count, live_md5;
        execute format($f$select count(*), md5(coalesce(string_agg(x::text, E'\n' order by x::text collate "C"), ''))
                            from emerriment_backup.%I x$f$, t || '_20261119')
           into copy_count, copy_md5;

        if live_count <> copy_count or live_md5 <> copy_md5 then
            raise exception 'EMerriment: copy of % does not match the live table; aborted.', t;
        end if;

        insert into emerriment_backup.manifest_20261119 (table_name, backup_table, row_count, content_md5)
        values (t, t || '_20261119', live_count, live_md5);
    end loop;
end
$$;


-- ---------------------------------------------------------------------
-- 2. Structure (copies are plain tables, so record what they lack)
-- ---------------------------------------------------------------------
create table emerriment_backup.columns_20261119 as
    select table_name, ordinal_position, column_name, data_type, udt_schema, udt_name,
           column_default, is_nullable, is_identity, identity_generation, is_generated, generation_expression
      from information_schema.columns
     where table_schema = 'public';

create table emerriment_backup.constraints_20261119 as
    select c.conrelid::regclass::text as table_name, c.conname as constraint_name,
           c.contype::text as constraint_type, pg_get_constraintdef(c.oid) as definition
      from pg_constraint c
     where c.connamespace = 'public'::regnamespace;

create table emerriment_backup.indexes_20261119 as
    select tablename as table_name, indexname as index_name, indexdef as definition
      from pg_indexes
     where schemaname = 'public';

create table emerriment_backup.sequences_20261119 as
    select s.schemaname, s.sequencename, s.data_type::text as data_type,
           s.start_value, s.min_value, s.max_value, s.increment_by, s.cycle, s.cache_size,
           s.last_value,                                   -- NULL = never used
           (s.last_value is not null) as is_called,
           (select d.refobjid::regclass::text || '.' || a.attname
              from pg_depend d
              join pg_attribute a on a.attrelid = d.refobjid and a.attnum = d.refobjsubid
             where d.classid = 'pg_class'::regclass and d.objid = c.oid and d.deptype in ('a', 'i')
             limit 1) as owned_by,
           pg_get_userbyid(c.relowner) as owner
      from pg_sequences s
      join pg_class c on c.relname = s.sequencename and c.relnamespace = to_regnamespace(s.schemaname::text)
     where s.schemaname = 'public';

create table emerriment_backup.triggers_20261119 as
    select t.tgrelid::regclass::text as table_name, t.tgname as trigger_name,
           t.tgenabled::text as enabled, pg_get_triggerdef(t.oid) as definition
      from pg_trigger t
      join pg_class c on c.oid = t.tgrelid
      join pg_proc p on p.oid = t.tgfoid
     where not t.tgisinternal
       and (c.relnamespace = 'public'::regnamespace or p.pronamespace = 'public'::regnamespace);

create table emerriment_backup.functions_20261119 as
    select p.oid::regprocedure::text as function_name, n.nspname as schema_name,
           pg_get_userbyid(p.proowner) as owner, p.prosecdef as security_definer,
           p.proacl::text as acl, pg_get_functiondef(p.oid) as definition
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname in ('public', 'emerriment_private') and p.prokind in ('f', 'p');

create table emerriment_backup.views_20261119 as
    select c.relname as view_name, c.relkind::text as kind, pg_get_userbyid(c.relowner) as owner,
           pg_get_viewdef(c.oid) as definition
      from pg_class c
     where c.relnamespace = 'public'::regnamespace and c.relkind in ('v', 'm');

create table emerriment_backup.types_20261119 as
    select t.typname as type_name, t.typtype::text as kind, pg_get_userbyid(t.typowner) as owner,
           case t.typtype
               when 'e' then (select string_agg(quote_literal(e.enumlabel), ', ' order by e.enumsortorder)
                                from pg_enum e where e.enumtypid = t.oid)
               when 'd' then format_type(t.typbasetype, t.typtypmod)
                             || coalesce(' ' || (select string_agg(pg_get_constraintdef(k.oid), ' ')
                                                   from pg_constraint k where k.contypid = t.oid), '')
           end as definition
      from pg_type t
     where t.typnamespace = 'public'::regnamespace and t.typtype in ('e', 'd');

create table emerriment_backup.rls_20261119 as
    select relname as table_name, relrowsecurity as rls_enabled, relforcerowsecurity as rls_forced
      from pg_class
     where relnamespace = 'public'::regnamespace and relkind in ('r', 'p');

create table emerriment_backup.policies_20261119 as
    select * from pg_policies where schemaname in ('public', 'storage');


-- ---------------------------------------------------------------------
-- 3. Access: raw ACLs and owners, default privileges, and the same ACLs
--    expanded per grantee (acldefault fills in built-in defaults where an
--    ACL is NULL, so nothing is hidden by information_schema visibility)
-- ---------------------------------------------------------------------
create table emerriment_backup.objects_acl_20261119 as
    select 'schema'::text as object_type, n.nspname::text as object_name, pg_get_userbyid(n.nspowner) as owner,
           n.nspacl::text as acl
      from pg_namespace n
     where n.nspname in ('public', 'emerriment_private', 'emerriment_backup', 'storage', 'auth')
    union all
    select case c.relkind when 'r' then 'table' when 'p' then 'table' when 'v' then 'view'
                          when 'm' then 'materialized view' when 'S' then 'sequence' else c.relkind::text end,
           c.oid::regclass::text, pg_get_userbyid(c.relowner), c.relacl::text
      from pg_class c
     where c.relnamespace in ('public'::regnamespace, 'emerriment_private'::regnamespace)
       and c.relkind in ('r', 'p', 'v', 'm', 'S')
    union all
    select 'function', p.oid::regprocedure::text, pg_get_userbyid(p.proowner), p.proacl::text
      from pg_proc p
     where p.pronamespace in ('public'::regnamespace, 'emerriment_private'::regnamespace);

create table emerriment_backup.column_acl_20261119 as
    select a.attrelid::regclass::text as table_name, a.attname as column_name, a.attacl::text as acl
      from pg_attribute a
      join pg_class c on c.oid = a.attrelid
     where c.relnamespace = 'public'::regnamespace and c.relkind in ('r', 'p')
       and a.attnum > 0 and not a.attisdropped and a.attacl is not null;

create table emerriment_backup.default_acl_20261119 as
    select pg_get_userbyid(d.defaclrole) as for_role,
           case when d.defaclnamespace = 0 then '(all schemas)' else d.defaclnamespace::regnamespace::text end as in_schema,
           d.defaclobjtype::text as object_type, d.defaclacl::text as acl
      from pg_default_acl d;

create table emerriment_backup.table_grants_20261119 as
    select c.oid::regclass::text as table_name,
           case when x.grantee = 0 then 'PUBLIC' else pg_get_userbyid(x.grantee) end as grantee,
           pg_get_userbyid(x.grantor) as grantor, x.privilege_type, x.is_grantable
      from pg_class c
     cross join lateral aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) x
     where c.relnamespace = 'public'::regnamespace and c.relkind in ('r', 'p', 'v', 'm');

create table emerriment_backup.column_grants_20261119 as
    select a.attrelid::regclass::text as table_name, a.attname as column_name,
           case when x.grantee = 0 then 'PUBLIC' else pg_get_userbyid(x.grantee) end as grantee,
           x.privilege_type
      from pg_attribute a
      join pg_class c on c.oid = a.attrelid
     cross join lateral aclexplode(a.attacl) x
     where c.relnamespace = 'public'::regnamespace and c.relkind in ('r', 'p')
       and a.attnum > 0 and not a.attisdropped and a.attacl is not null;

create table emerriment_backup.function_grants_20261119 as
    select p.oid::regprocedure::text as function_name,
           case when x.grantee = 0 then 'PUBLIC' else pg_get_userbyid(x.grantee) end as grantee,
           x.privilege_type
      from pg_proc p
     cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) x
     where p.pronamespace in ('public'::regnamespace, 'emerriment_private'::regnamespace);

create table emerriment_backup.schema_grants_20261119 as
    select n.nspname::text as schema_name,
           case when x.grantee = 0 then 'PUBLIC' else pg_get_userbyid(x.grantee) end as grantee,
           x.privilege_type
      from pg_namespace n
     cross join lateral aclexplode(coalesce(n.nspacl, acldefault('n', n.nspowner))) x
     where n.nspname in ('public', 'emerriment_private', 'emerriment_backup', 'storage', 'auth');


-- ---------------------------------------------------------------------
-- 4. Platform context (settings and counts only)
-- ---------------------------------------------------------------------
create table emerriment_backup.bucket_settings_20261119 as
    select id, name, public, file_size_limit, allowed_mime_types from storage.buckets;

create table emerriment_backup.event_triggers_20261119 as
    select evtname, evtevent, evtfoid::regproc::text as function_name, evtenabled::text as enabled,
           evttags::text as tags
      from pg_event_trigger;

create table emerriment_backup.migration_history_20261119 (version text, name text);
do $$
begin
    if to_regclass('supabase_migrations.schema_migrations') is not null then
        if exists (select 1 from pg_attribute where attrelid = 'supabase_migrations.schema_migrations'::regclass
                      and attname = 'name' and not attisdropped) then
            execute 'insert into emerriment_backup.migration_history_20261119 (version, name)
                     select version::text, name::text from supabase_migrations.schema_migrations';
        else
            execute 'insert into emerriment_backup.migration_history_20261119 (version)
                     select version::text from supabase_migrations.schema_migrations';
        end if;
    end if;
end
$$;

create table emerriment_backup.baseline_20261119 as
    select 1 as n, 'executing role'::text as item, current_user::text as value
    union all select 2, 'role is superuser', (select rolsuper::text from pg_roles where rolname = current_user)
    union all select 3, 'role has BYPASSRLS', (select rolbypassrls::text from pg_roles where rolname = current_user)
    union all select 4, 'public tables',
        (select count(*) from pg_class where relnamespace = 'public'::regnamespace and relkind in ('r', 'p'))::text
    union all select 5, 'leads rows', (select count(*) from public.leads)::text
    union all select 6, 'email_deliveries rows', (select count(*) from public.email_deliveries)::text
    union all select 7, 'profiles rows', (select count(*) from public.profiles)::text
    union all select 8, 'administrators', (select count(*) from public.profiles where is_admin)::text
    union all select 9, 'auth.users rows (count only, not copied)',
        case when to_regclass('auth.users') is not null then
            (xpath('/row/c/text()', query_to_xml('select count(*) as c from auth.users', false, true, '')))[1]::text end
    union all select 10, 'storage.objects rows (count only, files not copied)',
        case when to_regclass('storage.objects') is not null then
            (xpath('/row/c/text()', query_to_xml('select count(*) as c from storage.objects', false, true, '')))[1]::text end
    union all select 11, 'public policies', (select count(*) from pg_policies where schemaname = 'public')::text
    union all select 12, 'emerriment_ policies',
        (select count(*) from pg_policies where schemaname = 'public' and policyname like 'emerriment\_%')::text
    union all select 13, 'leads max(id)', (select coalesce(max(id), 0) from public.leads)::text;


-- ---------------------------------------------------------------------
-- 5. Lock the backup down: no access for PUBLIC or any API role, RLS on
--    (the owner — postgres in the SQL Editor — still reads it for recovery)
-- ---------------------------------------------------------------------
do $$
declare
    t text;
begin
    for t in select relname from pg_class
              where relnamespace = 'emerriment_backup'::regnamespace and relkind = 'r'
                and relname like '%\_20261119'
    loop
        execute format('revoke all on emerriment_backup.%I from public, anon, authenticated, service_role', t);
        execute format('alter table emerriment_backup.%I enable row level security', t);
    end loop;
end
$$;

commit;


-- ---------------------------------------------------------------------
-- Read-only summary (the SQL Editor shows this result). Fingerprints were
-- already compared inside the transaction (any mismatch aborted it); this
-- re-checks that each copy exists with the recorded row count.
-- live_rows_now is informational: a quiz submitted during or after the
-- run legitimately makes it differ for leads.
-- ---------------------------------------------------------------------
select m.table_name,
       m.backup_table,
       m.row_count,
       case when to_regclass('emerriment_backup.' || quote_ident(m.backup_table)) is null then false
            else (xpath('/row/c/text()', query_to_xml(format(
                  'select count(*) as c from emerriment_backup.%I', m.backup_table), false, true, '')))[1]::text::bigint = m.row_count
       end as copy_matches,
       (xpath('/row/c/text()', query_to_xml(format(
           'select count(*) as c from public.%I', m.table_name), false, true, '')))[1]::text::bigint as live_rows_now
  from emerriment_backup.manifest_20261119 m
 order by 1;
