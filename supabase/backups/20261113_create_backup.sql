-- =====================================================================
-- EMerriment — in-database backup before the security migrations
-- ---------------------------------------------------------------------
-- Why in the database: the Supabase Free plan includes no project
-- backups (Database → Backups: "Free Plan does not include project
-- backups"). None of the migrations drops a table, so a full copy inside
-- the same database is enough to restore any row or access rule they
-- touch. (It does not protect against losing the whole project; for that,
-- see supabase/backups/README.md → off-site copy.)
--
-- Creates schema emerriment_backup with:
--   * <table>_20261113 — a full copy of each of the 22 public tables
--   * policies_20261113 — every public policy (pg_policies)
--   * table_grants_20261113 / function_grants_20261113 — API privileges
--   * manifest_20261113 — row counts at backup time, for verification
-- The schema is not exposed through the website API and API roles have
-- no privileges on it.
--
-- Run once (it refuses to overwrite an existing backup).
-- =====================================================================

begin;

do $$
begin
    if to_regnamespace('emerriment_backup') is not null
       and to_regclass('emerriment_backup.manifest_20261113') is not null then
        raise exception 'EMerriment: backup 20261113 already exists; not overwritten.';
    end if;
end
$$;

create schema if not exists emerriment_backup;
revoke all on schema emerriment_backup from public;
revoke all on schema emerriment_backup from anon, authenticated;

create table emerriment_backup.manifest_20261113 (
    table_name text primary key,
    row_count bigint not null,
    backed_up_at timestamptz not null default now()
);

do $$
declare
    t text;
    c bigint;
begin
    for t in
        select c.relname from pg_class c
         where c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
         order by 1
    loop
        execute format('create table emerriment_backup.%I as table public.%I', t || '_20261113', t);
        execute format('select count(*) from emerriment_backup.%I', t || '_20261113') into c;
        insert into emerriment_backup.manifest_20261113 (table_name, row_count) values (t, c);
    end loop;
end
$$;

create table emerriment_backup.policies_20261113 as
    select * from pg_policies where schemaname in ('public', 'storage');

create table emerriment_backup.table_grants_20261113 as
    select grantee, table_schema, table_name, privilege_type
      from information_schema.role_table_grants
     where table_schema = 'public' and grantee in ('anon', 'authenticated', 'service_role');

create table emerriment_backup.function_grants_20261113 as
    select p.oid::regprocedure::text as function_name,
           has_function_privilege('anon', p.oid, 'execute') as anon_execute,
           has_function_privilege('authenticated', p.oid, 'execute') as authenticated_execute
      from pg_proc p
     where p.pronamespace = 'public'::regnamespace;

create table emerriment_backup.bucket_settings_20261113 as
    select id, public, file_size_limit, allowed_mime_types from storage.buckets;

-- Nothing in the backup is reachable by API roles.
do $$
declare
    t text;
begin
    for t in select c.relname from pg_class c
              where c.relnamespace = 'emerriment_backup'::regnamespace and c.relkind = 'r'
    loop
        execute format('revoke all on emerriment_backup.%I from public, anon, authenticated', t);
    end loop;
end
$$;

commit;

-- Verification: every table's copy has exactly the live row count.
select m.table_name,
       m.row_count as backed_up,
       (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from public.%I', m.table_name), false, true, '')))[1]::text::bigint as live,
       m.row_count = (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from public.%I', m.table_name), false, true, '')))[1]::text::bigint as matches
  from emerriment_backup.manifest_20261113 m
 order by 1;
