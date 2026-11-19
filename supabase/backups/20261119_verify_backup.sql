-- =====================================================================
-- EMerriment — verify the 20261119 backup (READ-ONLY)
-- ---------------------------------------------------------------------
-- Changes no data. The five SET lines only fix this SQL Editor session's
-- output format to the one the backup used for its fingerprints (they are
-- Supabase's defaults anyway); then ONE SELECT reads the backup and the
-- catalog. Every reference to a backup table is guarded, so a missing
-- table shows as a FAIL row instead of breaking the query.
--
-- Run after 20261119_create_backup_before_migration7.sql, and again right
-- before migration 7. Supabase → SQL Editor → New query → paste → Run.
-- One result table, failures first.
--   BLOCKER  must be PASS (otherwise do not rely on this backup)
--   WARN     explained in the row; investigate
--   INFO     values to record
-- After migration 7 the live tables differ from the backup by design: the
-- "live tables still equal" WARN and the "migration 7 applied" INFO then
-- show it. The backup itself must still pass every BLOCKER.
-- =====================================================================

set timezone = 'UTC';
set datestyle = 'ISO, MDY';
set intervalstyle = 'postgres';
set extra_float_digits = 1;
set bytea_output = 'hex';

with
g as (
    select to_regclass('emerriment_backup.manifest_20261119') is not null as has_manifest,
           to_regclass('emerriment_backup.settings_20261119') is not null as has_settings
),
s as (
    select g.*,
           case when not g.has_settings then 'settings_20261119 MISSING'
                else (xpath('/row/v/text()', query_to_xml($q$
                    select case
                             when count(*) < 5 then 'incomplete (' || count(*) || ' of 5 recorded)'
                             when count(*) filter (where current_setting(name) <> setting) = 0 then 'ok'
                             else string_agg(name || ': now ' || current_setting(name) || ', backup ' || setting, '; ' order by name)
                                  filter (where current_setting(name) <> setting)
                           end as v
                      from emerriment_backup.settings_20261119
                     where name in ('TimeZone', 'DateStyle', 'IntervalStyle', 'extra_float_digits', 'bytea_output')$q$,
                    false, true, '')))[1]::text
           end as settings_state
      from g
),
r as (
    select s.*,
           -- copies listed in the manifest that do not exist
           case when not s.has_manifest then 'manifest MISSING'
                else (xpath('/row/v/text()', query_to_xml($q$
                    select count(*) filter (where to_regclass('emerriment_backup.' || quote_ident(backup_table)) is null)
                           || ' missing'
                           || coalesce(': ' || string_agg(backup_table, ', ' order by backup_table)
                                  filter (where to_regclass('emerriment_backup.' || quote_ident(backup_table)) is null), '') as v
                      from emerriment_backup.manifest_20261119$q$, false, true, '')))[1]::text
           end as missing_copies,
           case when not s.has_manifest then 'manifest MISSING'
                else (xpath('/row/v/text()', query_to_xml(
                    'select count(*)::text as v from emerriment_backup.manifest_20261119', false, true, '')))[1]::text
           end as manifest_count,
           -- row count AND fingerprint of every copy (a missing copy counts as a mismatch)
           case when not s.has_manifest then 'manifest MISSING'
                when s.settings_state <> 'ok' then 'NOT CHECKED: session settings differ from the backup'
                else (xpath('/row/v/text()', query_to_xml($q$
                    select count(*) filter (where not ok) || ' mismatches'
                           || coalesce(': ' || string_agg(table_name, ', ' order by table_name) filter (where not ok), '') as v
                      from (select m.table_name,
                                   case when to_regclass('emerriment_backup.' || quote_ident(m.backup_table)) is null then false
                                        else (xpath('/row/c/text()', query_to_xml(format(
                                                 'select count(*) as c from emerriment_backup.%I', m.backup_table), false, true, '')))[1]::text::bigint = m.row_count
                                             and (xpath('/row/h/text()', query_to_xml(format(
                                                 $f$select md5(coalesce(string_agg(x::text, E'\n' order by x::text collate "C"), '')) as h
                                                      from emerriment_backup.%I x$f$, m.backup_table), false, true, '')))[1]::text = m.content_md5
                                   end as ok
                              from emerriment_backup.manifest_20261119 m) t$q$, false, true, '')))[1]::text
           end as fingerprints,
           -- live tables compared with the backup (informational)
           case when not s.has_manifest then 'manifest MISSING'
                when s.settings_state <> 'ok' then 'NOT CHECKED: session settings differ from the backup'
                else (xpath('/row/v/text()', query_to_xml($q$
                    select count(*) filter (where not ok) || ' tables changed'
                           || coalesce(': ' || string_agg(table_name, ', ' order by table_name) filter (where not ok), '') as v
                      from (select m.table_name,
                                   case when to_regclass('public.' || quote_ident(m.table_name)) is null then false
                                        else (xpath('/row/h/text()', query_to_xml(format(
                                                 $f$select md5(coalesce(string_agg(x::text, E'\n' order by x::text collate "C"), '')) as h
                                                      from public.%I x$f$, m.table_name), false, true, '')))[1]::text = m.content_md5
                                   end as ok
                              from emerriment_backup.manifest_20261119 m) t$q$, false, true, '')))[1]::text
           end as live_state,
           case when not s.has_manifest then 'manifest MISSING'
                else (xpath('/row/v/text()', query_to_xml($q$
                    select coalesce('in public now, not in backup: ' || (select string_agg(relname, ', ' order by relname) from pg_class
                                        where relnamespace = 'public'::regnamespace and relkind in ('r', 'p')
                                          and relname not in (select table_name from emerriment_backup.manifest_20261119)) || '. ', '')
                        || coalesce('in backup, not in public now: ' || (select string_agg(table_name, ', ' order by table_name)
                                        from emerriment_backup.manifest_20261119
                                       where to_regclass('public.' || quote_ident(table_name)) is null) || '. ', '')
                        || 'compared.' as v$q$, false, true, '')))[1]::text
           end as table_set_diff
      from s
),
meta (t, required_rows) as (
    values ('columns_20261119', true), ('constraints_20261119', true), ('indexes_20261119', true),
           ('sequences_20261119', true), ('triggers_20261119', true), ('functions_20261119', true),
           ('rls_20261119', true), ('policies_20261119', true),
           ('objects_acl_20261119', true), ('table_grants_20261119', true), ('column_grants_20261119', true),
           ('function_grants_20261119', true), ('schema_grants_20261119', true),
           ('settings_20261119', true), ('baseline_20261119', true),
           ('column_acl_20261119', false), ('default_acl_20261119', false), ('views_20261119', false),
           ('types_20261119', false), ('bucket_settings_20261119', false), ('event_triggers_20261119', false),
           ('migration_history_20261119', false)
),
mc as (
    select t, required_rows, to_regclass('emerriment_backup.' || t) is not null as present,
           case when to_regclass('emerriment_backup.' || t) is null then null
                else (xpath('/row/v/text()', query_to_xml(format('select count(*) as v from emerriment_backup.%I', t), false, true, '')))[1]::text::bigint
           end as n
      from meta
),
bk as (
    select c.oid, c.relname, c.relrowsecurity
      from pg_class c
     where c.relnamespace = to_regnamespace('emerriment_backup') and c.relkind = 'r'
       and (c.relname like '%\_20261119' or c.relname like '%\_prerestore\_%')
),
checks (n, severity, check_name, expected, actual, ok) as (

select 1, 'BLOCKER', 'backup 20261119 exists (manifest)',
       'present', case when has_manifest then 'present' else 'MISSING' end, has_manifest
  from r
union all
select 2, 'BLOCKER', 'session output settings equal the ones recorded at backup time (checked before fingerprints)',
       'ok', settings_state, settings_state = 'ok'
  from r
union all
select 3, 'BLOCKER', 'manifest lists 23 tables',
       '23', manifest_count, manifest_count = '23'
  from r
union all
select 4, 'BLOCKER', 'every table copy named in the manifest exists',
       '0 missing', missing_copies, missing_copies like '0 missing%'
  from r
union all
select 5, 'BLOCKER', 'every copy matches its manifest row count AND fingerprint',
       '0 mismatches', fingerprints, fingerprints like '0 mismatches%'
  from r
union all
select 6, 'WARN', 'live tables still equal the backup (differences are expected after quiz submissions, after other writes, and after migration 7)',
       '0 tables changed', live_state, live_state like '0 tables changed%'
  from r
union all
select 7, 'INFO', 'table set: public now vs backup', '(record)', table_set_diff, null
  from r
union all
select 8, 'INFO', 'baseline recorded at backup time (counts are the snapshot, not fixed values)',
       '(record: preflight showed 23 tables, 80 leads)',
       case when to_regclass('emerriment_backup.baseline_20261119') is null then 'MISSING' else
       (xpath('/row/v/text()', query_to_xml($q$select string_agg(item || '=' || coalesce(value, 'n/a'), '; ' order by n) as v
                                                  from emerriment_backup.baseline_20261119$q$, false, true, '')))[1]::text end,
       null
union all
select 9, 'BLOCKER', 'backup taken by a role that sees every row (superuser, BYPASSRLS or table owner — enforced by the backup script)',
       'executing role recorded',
       case when to_regclass('emerriment_backup.baseline_20261119') is null then 'baseline MISSING' else
       (xpath('/row/v/text()', query_to_xml($q$select string_agg(item || '=' || coalesce(value, 'n/a'), ', ' order by n) as v
                                                  from emerriment_backup.baseline_20261119 where n <= 3$q$, false, true, '')))[1]::text end,
       to_regclass('emerriment_backup.baseline_20261119') is not null
       and (xpath('/row/v/text()', query_to_xml($q$select count(*)::text as v from emerriment_backup.baseline_20261119
                                                    where n = 1 and value is not null$q$, false, true, '')))[1]::text = '1'
union all
select 10, 'BLOCKER', 'required metadata present and not empty (structure, access, settings, baseline)',
       'all present, > 0 rows',
       coalesce((select string_agg(t || '=' || coalesce(n::text, 'MISSING'), ' ' order by t) from mc
                  where required_rows and (not present or n = 0)), 'all present, > 0 rows'),
       (select bool_and(present and n > 0) from mc where required_rows)
union all
select 11, 'BLOCKER', 'optional metadata tables present (may legitimately be empty)',
       'all present',
       (select coalesce(string_agg(t || ' MISSING', ' ' order by t) filter (where not present), 'all present')
               || ' (' || string_agg(t || '=' || coalesce(n::text, '-'), ' ' order by t) || ')'
          from mc where not required_rows),
       (select bool_and(present) from mc where not required_rows)
union all
select 12, 'WARN', 'CLI migration history captured: migrations 1–6 (7 versions)',
       '7',
       case when to_regclass('emerriment_backup.migration_history_20261119') is null then 'MISSING' else
       (xpath('/row/v/text()', query_to_xml($q$select count(*)::text as v from emerriment_backup.migration_history_20261119
           where version in ('20261110085900','20261110090000','20261110090100','20261110090200',
                             '20261110090300','20261110090400','20261113090000')$q$, false, true, '')))[1]::text end,
       to_regclass('emerriment_backup.migration_history_20261119') is not null
       and (xpath('/row/v/text()', query_to_xml($q$select count(*)::text as v from emerriment_backup.migration_history_20261119
           where version in ('20261110085900','20261110090000','20261110090100','20261110090200',
                             '20261110090300','20261110090400','20261113090000')$q$, false, true, '')))[1]::text = '7'
union all
select 13, 'BLOCKER', 'key protections are in the captured definitions (quiz guard, profile guard, request_role)',
       '3 of 3',
       case when to_regclass('emerriment_backup.triggers_20261119') is null or to_regclass('emerriment_backup.functions_20261119') is null then 'MISSING' else
       (xpath('/row/v/text()', query_to_xml($q$select
            ((select count(*) from emerriment_backup.triggers_20261119 where trigger_name in ('emerriment_guard_lead_insert', 'emerriment_guard_profile_privileges'))
           + (select count(*) from emerriment_backup.functions_20261119 where function_name = 'emerriment_private.request_role()')) || ' of 3' as v$q$, false, true, '')))[1]::text end,
       to_regclass('emerriment_backup.triggers_20261119') is not null and to_regclass('emerriment_backup.functions_20261119') is not null
       and (xpath('/row/v/text()', query_to_xml($q$select
            ((select count(*) from emerriment_backup.triggers_20261119 where trigger_name in ('emerriment_guard_lead_insert', 'emerriment_guard_profile_privileges'))
           + (select count(*) from emerriment_backup.functions_20261119 where function_name = 'emerriment_private.request_role()'))::text as v$q$, false, true, '')))[1]::text = '3'
union all
select 14, 'BLOCKER', 'nobody but the owner can use the backup schema (PUBLIC, anon, authenticated, service_role)',
       'no USAGE, no CREATE',
       case when to_regnamespace('emerriment_backup') is null then 'schema MISSING' else
       coalesce((select string_agg(rn || ' has ' || p, ', ') from unnest(array['public', 'anon', 'authenticated', 'service_role']) rn
                  cross join unnest(array['usage', 'create']) p
                 where has_schema_privilege(rn, to_regnamespace('emerriment_backup')::oid, p)), 'no USAGE, no CREATE') end,
       to_regnamespace('emerriment_backup') is not null
       and not exists (select 1 from unnest(array['public', 'anon', 'authenticated', 'service_role']) rn
                        cross join unnest(array['usage', 'create']) p
                       where has_schema_privilege(rn, to_regnamespace('emerriment_backup')::oid, p))
union all
select 15, 'BLOCKER', 'backup tables (20261119 and pre-restore copies): no privilege for PUBLIC/API roles, RLS on, no policies',
       '0 granted, 0 without RLS, 0 policies',
       (select count(*) filter (where exists (select 1 from unnest(array['public', 'anon', 'authenticated', 'service_role']) rn
                                               where has_table_privilege(rn, bk.oid, 'select,insert,update,delete,truncate,references,trigger')))
               || ' granted, ' || count(*) filter (where not relrowsecurity) || ' without RLS, '
               || (select count(*) from pg_policies where schemaname = 'emerriment_backup') || ' policies (' || count(*) || ' tables checked)'
          from bk),
       (select count(*) > 0
               and count(*) filter (where exists (select 1 from unnest(array['public', 'anon', 'authenticated', 'service_role']) rn
                                                   where has_table_privilege(rn, bk.oid, 'select,insert,update,delete,truncate,references,trigger'))) = 0
               and count(*) filter (where not relrowsecurity) = 0
               and (select count(*) from pg_policies where schemaname = 'emerriment_backup') = 0
          from bk)
union all
select 16, 'WARN', 'no default privileges would grant API roles access to FUTURE objects in emerriment_backup',
       '0 entries',
       (select count(*) || ' entries' || coalesce(': ' || string_agg(distinct pg_get_userbyid(d.defaclrole) || ' -> '
                    || case when x.grantee = 0 then 'PUBLIC' else pg_get_userbyid(x.grantee) end || ' ' || x.privilege_type, ', '), '')
          from pg_default_acl d
         cross join lateral aclexplode(d.defaclacl) x
         where (d.defaclnamespace = 0 or d.defaclnamespace = to_regnamespace('emerriment_backup'))
           and (x.grantee = 0 or x.grantee in (select oid from pg_roles where rolname in ('anon', 'authenticated', 'service_role')))),
       (select count(*) = 0
          from pg_default_acl d
         cross join lateral aclexplode(d.defaclacl) x
         where (d.defaclnamespace = 0 or d.defaclnamespace = to_regnamespace('emerriment_backup'))
           and (x.grantee = 0 or x.grantee in (select oid from pg_roles where rolname in ('anon', 'authenticated', 'service_role'))))
union all
select 17, 'WARN', 'earlier backup 20261113 still present (never touched by this backup)',
       'present',
       coalesce(to_regclass('emerriment_backup.manifest_20261113')::text, 'absent'),
       to_regclass('emerriment_backup.manifest_20261113') is not null
union all
select 18, 'INFO', 'tables in emerriment_backup (20261113 / 20261119 / pre-restore copies)',
       '(record)',
       (select count(*) filter (where relname like '%\_20261113') || ' / ' || count(*) filter (where relname like '%\_20261119')
               || ' / ' || count(*) filter (where relname like '%\_prerestore\_%')
          from pg_class where relnamespace = to_regnamespace('emerriment_backup') and relkind = 'r'),
       null
union all
select 19, 'INFO', 'migration 7 applied since the backup',
       '(no before migration 7, yes after)',
       case when to_regclass('public.purchases') is null then 'no' else 'yes' end,
       null
)

select severity, check_name, expected, actual,
       case when severity = 'INFO' then 'INFO' when ok then 'PASS' else 'FAIL' end as result
  from checks
 order by case when severity <> 'INFO' and not coalesce(ok, false) then 0 else 1 end, n;
