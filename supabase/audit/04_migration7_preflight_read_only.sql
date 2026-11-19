-- =====================================================================
-- EMerriment — migration 7 PREFLIGHT (READ-ONLY)
-- ---------------------------------------------------------------------
-- For: supabase/migrations/20261117090000_emerriment_marketing_consent_and_purchases.sql
--      (final version: double opt-in, consent insert + update guards,
--       purchases, 'customer' and 'confirm' delivery kinds)
--
-- WHAT IT DOES
--   One single SELECT statement. It reads catalog metadata and COUNTS
--   only. It creates, changes, locks or deletes nothing, and returns no
--   personal data (no email addresses, names or ids of people).
--   (The xml helpers below run small dynamic SELECTs so that a missing
--   table shows up as a failed row instead of aborting the whole check.)
--
-- HOW TO RUN (Supabase → SQL Editor → New query)
--   1. Paste this whole file and press Run. Nothing else.
--   2. Result: one table, failures first. Columns:
--        severity  BLOCKER  — must be PASS before migration 7 is applied
--                  WARN     — investigate, does not by itself block
--                  INFO     — numbers to record (baseline), no pass/fail
--        result    PASS / FAIL / INFO
--   3. Copy the whole result (or export CSV) and keep it with the
--      migration 7 approval.
--
-- GO only if every BLOCKER row is PASS. See the "Blocking discrepancies"
-- notes in supabase/PRODUCTION_RUNBOOK.md and the comments per section.
-- =====================================================================

with checks (n, severity, section, check_name, expected, actual, ok) as (

-- ---------------------------------------------------------------------
-- A. Platform
-- ---------------------------------------------------------------------
select 101, 'BLOCKER', 'A platform', 'Postgres 13 or newer (gen_random_uuid built in)',
       '>= 130000', current_setting('server_version'),
       current_setting('server_version_num')::int >= 130000
union all
select 102, 'BLOCKER', 'A platform', 'gen_random_uuid() available',
       'present', coalesce(to_regprocedure('gen_random_uuid()')::text, 'MISSING'),
       to_regprocedure('gen_random_uuid()') is not null
union all
select 103, 'BLOCKER', 'A platform', 'auth.users exists (purchases.user_id FK)',
       'present', coalesce(to_regclass('auth.users')::text, 'MISSING'),
       to_regclass('auth.users') is not null
union all
select 104, 'BLOCKER', 'A platform', 'SQL Editor session is a trusted direct connection (request_role = '''')',
       '''''',
       case when to_regprocedure('emerriment_private.request_role()') is null then 'request_role() MISSING'
            else '''' || (xpath('/row/v/text()', query_to_xml(
                     'select coalesce(emerriment_private.request_role(), ''<null>'') || ''#'' as v', false, true, '')))[1]::text || '''' end,
       to_regprocedure('emerriment_private.request_role()') is not null
       and (xpath('/row/v/text()', query_to_xml(
               'select coalesce(emerriment_private.request_role(), ''<null>'') || ''#'' as v', false, true, '')))[1]::text = '#'

-- ---------------------------------------------------------------------
-- B. Migration history (Supabase CLI)
-- ---------------------------------------------------------------------
union all
select 201, 'WARN', 'B history', 'supabase_migrations.schema_migrations exists',
       'present', coalesce(to_regclass('supabase_migrations.schema_migrations')::text, 'MISSING'),
       to_regclass('supabase_migrations.schema_migrations') is not null
union all
select 202, 'WARN', 'B history', 'migrations 1–6 (7 files) recorded as applied',
       '7 of 7: 20261110085900 090000 090100 090200 090300 090400 20261113090000',
       case when to_regclass('supabase_migrations.schema_migrations') is null then 'no history table'
            else (xpath('/row/v/text()', query_to_xml($q$
                select count(*) || ' of 7' as v from supabase_migrations.schema_migrations
                 where version in ('20261110085900','20261110090000','20261110090100','20261110090200',
                                   '20261110090300','20261110090400','20261113090000')$q$, false, true, '')))[1]::text end,
       to_regclass('supabase_migrations.schema_migrations') is not null
       and (xpath('/row/v/text()', query_to_xml($q$
                select count(*) as v from supabase_migrations.schema_migrations
                 where version in ('20261110085900','20261110090000','20261110090100','20261110090200',
                                   '20261110090300','20261110090400','20261113090000')$q$, false, true, '')))[1]::text = '7'
union all
select 203, 'BLOCKER', 'B history', 'migration 7 (20261117090000) NOT recorded yet',
       'absent',
       case when to_regclass('supabase_migrations.schema_migrations') is null then 'no history table (absent)'
            else (xpath('/row/v/text()', query_to_xml($q$
                select case when count(*) = 0 then 'absent' else 'RECORDED' end as v
                  from supabase_migrations.schema_migrations where version = '20261117090000'$q$, false, true, '')))[1]::text end,
       to_regclass('supabase_migrations.schema_migrations') is null
       or (xpath('/row/v/text()', query_to_xml($q$
                select count(*) as v from supabase_migrations.schema_migrations where version = '20261117090000'$q$, false, true, '')))[1]::text = '0'
union all
select 204, 'INFO', 'B history', 'all recorded versions',
       '(record)',
       case when to_regclass('supabase_migrations.schema_migrations') is null then 'no history table'
            else coalesce((xpath('/row/v/text()', query_to_xml($q$
                select string_agg(version, ' ' order by version) as v from supabase_migrations.schema_migrations$q$, false, true, '')))[1]::text, '(none)') end,
       null

-- ---------------------------------------------------------------------
-- C. public.leads (migration 7 adds 8 columns, 3 indexes, 1 CHECK,
--    2 triggers and column grants here)
-- ---------------------------------------------------------------------
union all
select 301, 'BLOCKER', 'C leads', 'public.leads exists',
       'present', coalesce(to_regclass('public.leads')::text, 'MISSING'), to_regclass('public.leads') is not null
union all
select 302, 'BLOCKER', 'C leads', 'leads.id type (purchases.lead_id is bigint)',
       'bigint',
       coalesce((select format_type(atttypid, atttypmod) from pg_attribute
                  where attrelid = to_regclass('public.leads') and attname = 'id' and not attisdropped), 'MISSING'),
       (select format_type(atttypid, atttypmod) from pg_attribute
         where attrelid = to_regclass('public.leads') and attname = 'id' and not attisdropped) = 'bigint'
union all
select 303, 'BLOCKER', 'C leads', 'leads.id NOT NULL and identity (migration 1)',
       'not null, identity',
       coalesce((select case when attnotnull then 'not null' else 'NULLABLE' end || ', '
                        || case when attidentity in ('a','d') then 'identity' else 'NO IDENTITY' end
                   from pg_attribute where attrelid = to_regclass('public.leads') and attname = 'id'), 'MISSING'),
       coalesce((select attnotnull and attidentity in ('a','d')
                   from pg_attribute where attrelid = to_regclass('public.leads') and attname = 'id'), false)
union all
select 304, 'BLOCKER', 'C leads', 'primary key leads_pkey on (id)',
       'leads_pkey PRIMARY KEY (id)',
       coalesce((select string_agg(conname || ' ' || pg_get_constraintdef(oid), '; ')
                   from pg_constraint where conrelid = to_regclass('public.leads') and contype = 'p'), 'NO PRIMARY KEY'),
       exists (select 1 from pg_constraint where conrelid = to_regclass('public.leads') and contype = 'p'
                  and conname = 'leads_pkey' and pg_get_constraintdef(oid) = 'PRIMARY KEY (id)')
union all
select 305, 'BLOCKER', 'C leads', 'no lead with id NULL or duplicate id',
       '0 null, 0 duplicate',
       (select count(*) filter (where id is null) || ' null, ' || (count(id) - count(distinct id)) || ' duplicate' from public.leads),
       (select count(*) filter (where id is null) = 0 and count(id) = count(distinct id) from public.leads)
union all
select 306, 'INFO', 'C leads', 'lead rows (baseline; 79 on 2026-11-13, may have grown)',
       '>= 79', (select count(*)::text from public.leads), null
union all
select 307, 'BLOCKER', 'C leads', 'columns migration 7 relies on: email, status, next_email_due',
       'email, next_email_due, status',
       (select coalesce(string_agg(attname || ':' || format_type(atttypid, atttypmod), ', ' order by attname), 'MISSING')
          from pg_attribute where attrelid = to_regclass('public.leads') and not attisdropped and attnum > 0
           and attname in ('email', 'status', 'next_email_due')),
       (select count(*) from pg_attribute where attrelid = to_regclass('public.leads') and not attisdropped
           and attname in ('email', 'status', 'next_email_due')) = 3
union all
select 308, 'INFO', 'C leads', 'leads.status / email_status types (text in the 2026-11-13 snapshot)',
       'text, text',
       (select string_agg(attname || ':' || format_type(atttypid, atttypmod), ', ' order by attname)
          from pg_attribute where attrelid = to_regclass('public.leads') and attname in ('status', 'email_status')),
       null
union all
select 309, 'WARN', 'C leads', 'no existing CHECK constraint on leads (none in the snapshot)',
       '(none)',
       coalesce((select string_agg(conname || ': ' || pg_get_constraintdef(oid), '; ')
                   from pg_constraint where conrelid = to_regclass('public.leads') and contype = 'c'), '(none)'),
       not exists (select 1 from pg_constraint where conrelid = to_regclass('public.leads') and contype = 'c')
union all
select 310, 'BLOCKER', 'C leads', 'RLS enabled on leads',
       'enabled', (select case when relrowsecurity then 'enabled' else 'DISABLED' end
                            || case when relforcerowsecurity then ' (forced)' else '' end
                     from pg_class where oid = to_regclass('public.leads')),
       (select relrowsecurity from pg_class where oid = to_regclass('public.leads'))
union all
select 311, 'BLOCKER', 'C leads', 'all 8 emerriment_leads_* policies present (migration 3)',
       '8: admin_delete admin_select admin_update quiz_insert restrict_delete restrict_insert restrict_select restrict_update',
       (select count(*) || ': ' || coalesce(string_agg(replace(policyname, 'emerriment_leads_', ''), ' ' order by policyname), '')
          from pg_policies where schemaname = 'public' and tablename = 'leads' and policyname like 'emerriment\_leads\_%'),
       (select count(*) filter (where policyname in (
                 'emerriment_leads_admin_delete','emerriment_leads_admin_select','emerriment_leads_admin_update',
                 'emerriment_leads_quiz_insert','emerriment_leads_restrict_delete','emerriment_leads_restrict_insert',
                 'emerriment_leads_restrict_select','emerriment_leads_restrict_update')) = 8
          from pg_policies where schemaname = 'public' and tablename = 'leads')
union all
-- The two original live policies were deliberately left in place by
-- migration 3; the restrictive policies above (and the revoked table
-- privileges, rows 315–316) neutralise them. 03b passed with them present.
select 3115, 'WARN', 'C leads', 'other leads policies are only the 2 known legacy ones (neutralised by the restrictive policies)',
       'Allow public inserts; Enable read access for all users',
       coalesce((select string_agg(policyname || ' [' || permissive || ' ' || cmd || ']', '; ' order by policyname)
                   from pg_policies where schemaname = 'public' and tablename = 'leads' and policyname not like 'emerriment\_leads\_%'), '(none)'),
       coalesce((select bool_and(policyname in ('Allow public inserts', 'Enable read access for all users') and permissive = 'PERMISSIVE')
                   from pg_policies where schemaname = 'public' and tablename = 'leads' and policyname not like 'emerriment\_leads\_%'), true)
union all
select 312, 'BLOCKER', 'C leads', 'the 4 restrictive leads policies are RESTRICTIVE',
       '4 restrictive',
       (select count(*) filter (where permissive = 'RESTRICTIVE') || ' restrictive'
          from pg_policies where schemaname = 'public' and tablename = 'leads' and policyname like 'emerriment\_leads\_restrict\_%'),
       (select count(*) filter (where permissive = 'RESTRICTIVE') = 4
          from pg_policies where schemaname = 'public' and tablename = 'leads' and policyname like 'emerriment\_leads\_restrict\_%')
union all
select 313, 'BLOCKER', 'C leads', 'quiz insert guard trigger emerriment_guard_lead_insert (migration 3) present and enabled',
       'present, enabled (O)',
       coalesce((select 'present, enabled (' || tgenabled::text || ')' from pg_trigger
                  where tgrelid = to_regclass('public.leads') and tgname = 'emerriment_guard_lead_insert'), 'MISSING'),
       exists (select 1 from pg_trigger where tgrelid = to_regclass('public.leads')
                  and tgname = 'emerriment_guard_lead_insert' and tgenabled = 'O')
union all
select 314, 'INFO', 'C leads', 'all non-internal triggers on leads',
       'emerriment_guard_lead_insert',
       coalesce((select string_agg(tgname::text || '(' || tgenabled::text || ')', ', ' order by tgname) from pg_trigger
                  where tgrelid = to_regclass('public.leads') and not tgisinternal), '(none)'),
       null
union all
select 315, 'BLOCKER', 'C leads', 'visitors have NO table-level privileges on leads',
       'anon: no select/insert/update/delete',
       'select=' || has_table_privilege('anon', 'public.leads', 'select')
       || ' insert=' || has_table_privilege('anon', 'public.leads', 'insert')
       || ' update=' || has_table_privilege('anon', 'public.leads', 'update')
       || ' delete=' || has_table_privilege('anon', 'public.leads', 'delete'),
       not (has_table_privilege('anon', 'public.leads', 'select') or has_table_privilege('anon', 'public.leads', 'insert')
            or has_table_privilege('anon', 'public.leads', 'update') or has_table_privilege('anon', 'public.leads', 'delete'))
union all
select 316, 'BLOCKER', 'C leads', 'signed-in users have NO table-level INSERT on leads (column grants only)',
       'authenticated insert=false',
       'authenticated insert=' || has_table_privilege('authenticated', 'public.leads', 'insert'),
       not has_table_privilege('authenticated', 'public.leads', 'insert')
union all
select 317, 'BLOCKER', 'C leads', 'quiz column grants still in place (visitors can insert email, cannot insert id)',
       'anon email=true, anon id=false',
       'anon email=' || has_column_privilege('anon', 'public.leads', 'email', 'insert')
       || ', anon id=' || has_column_privilege('anon', 'public.leads', 'id', 'insert'),
       has_column_privilege('anon', 'public.leads', 'email', 'insert')
       and not has_column_privilege('anon', 'public.leads', 'id', 'insert')
union all
select 318, 'INFO', 'C leads', 'columns visitors may insert (baseline)',
       '19 quiz columns (migration 6)',
       (select count(*) || ': ' || string_agg(column_name, ' ' order by column_name)
          from information_schema.column_privileges
         where table_schema = 'public' and table_name = 'leads' and grantee = 'anon' and privilege_type = 'INSERT'),
       null

-- ---------------------------------------------------------------------
-- D. public.email_deliveries (migration 7 adds purchase_id, replaces the
--    kind CHECK by NAME, adds a target CHECK and a unique index)
-- ---------------------------------------------------------------------
union all
select 401, 'BLOCKER', 'D email_deliveries', 'public.email_deliveries exists',
       'present', coalesce(to_regclass('public.email_deliveries')::text, 'MISSING'),
       to_regclass('public.email_deliveries') is not null
union all
select 402, 'BLOCKER', 'D email_deliveries', 'columns and types',
       'created_at:timestamptz id:uuid kind:text lead_id:bigint provider_message_id:text sent_at:timestamptz sequence_day:integer status:text',
       coalesce((select string_agg(attname || ':' || replace(format_type(atttypid, atttypmod), 'timestamp with time zone', 'timestamptz'), ' ' order by attname)
                   from pg_attribute where attrelid = to_regclass('public.email_deliveries') and attnum > 0 and not attisdropped), 'MISSING'),
       coalesce((select string_agg(attname || ':' || replace(format_type(atttypid, atttypmod), 'timestamp with time zone', 'timestamptz'), ' ' order by attname)
                   from pg_attribute where attrelid = to_regclass('public.email_deliveries') and attnum > 0 and not attisdropped), '')
       = 'created_at:timestamptz id:uuid kind:text lead_id:bigint provider_message_id:text sent_at:timestamptz sequence_day:integer status:text'
union all
select 403, 'BLOCKER', 'D email_deliveries', 'lead_id has the same type as leads.id',
       'equal',
       coalesce((select format_type(atttypid, atttypmod) from pg_attribute where attrelid = to_regclass('public.email_deliveries') and attname = 'lead_id'), 'MISSING')
       || ' vs ' || coalesce((select format_type(atttypid, atttypmod) from pg_attribute where attrelid = to_regclass('public.leads') and attname = 'id'), 'MISSING'),
       (select format_type(atttypid, atttypmod) from pg_attribute where attrelid = to_regclass('public.email_deliveries') and attname = 'lead_id')
       = (select format_type(atttypid, atttypmod) from pg_attribute where attrelid = to_regclass('public.leads') and attname = 'id')
union all
select 404, 'BLOCKER', 'D email_deliveries', 'kind CHECK is named exactly email_deliveries_kind_check (migration 7 drops it by this name)',
       'email_deliveries_kind_check: report, sequence',
       coalesce((select string_agg(conname || ': ' || pg_get_constraintdef(oid), '; ')
                   from pg_constraint where conrelid = to_regclass('public.email_deliveries') and contype = 'c'
                    and pg_get_constraintdef(oid) like '%kind%'), 'NO kind CHECK'),
       (select count(*) = 1 and bool_and(conname = 'email_deliveries_kind_check')
          from pg_constraint where conrelid = to_regclass('public.email_deliveries') and contype = 'c'
           and pg_get_constraintdef(oid) like '%kind%')
union all
select 405, 'INFO', 'D email_deliveries', 'all constraints (baseline)',
       'pkey, lead FK, one_per_email, kind/sequence_day/status checks',
       coalesce((select string_agg(conname::text || ' [' || contype::text || ']', ', ' order by conname)
                   from pg_constraint where conrelid = to_regclass('public.email_deliveries')), '(none)'),
       null
union all
select 406, 'BLOCKER', 'D email_deliveries', 'at-most-once key email_deliveries_one_per_email UNIQUE (lead_id, kind, sequence_day)',
       'UNIQUE (lead_id, kind, sequence_day)',
       coalesce((select pg_get_constraintdef(oid) from pg_constraint
                  where conrelid = to_regclass('public.email_deliveries') and conname = 'email_deliveries_one_per_email'), 'MISSING'),
       (select pg_get_constraintdef(oid) from pg_constraint
         where conrelid = to_regclass('public.email_deliveries') and conname = 'email_deliveries_one_per_email')
       = 'UNIQUE (lead_id, kind, sequence_day)'
union all
select 407, 'BLOCKER', 'D email_deliveries', 'RLS enabled, no policies (service role only)',
       'enabled, 0 policies',
       coalesce((select case when relrowsecurity then 'enabled' else 'DISABLED' end from pg_class where oid = to_regclass('public.email_deliveries')), 'MISSING')
       || ', ' || (select count(*) from pg_policies where schemaname = 'public' and tablename = 'email_deliveries') || ' policies',
       coalesce((select relrowsecurity from pg_class where oid = to_regclass('public.email_deliveries')), false)
       and (select count(*) from pg_policies where schemaname = 'public' and tablename = 'email_deliveries') = 0
union all
select 408, 'BLOCKER', 'D email_deliveries', 'no API privileges for anon / authenticated',
       'all false',
       case when to_regclass('public.email_deliveries') is null then 'MISSING' else
       'anon=' || (has_table_privilege('anon', 'public.email_deliveries', 'select') or has_table_privilege('anon', 'public.email_deliveries', 'insert')
                   or has_table_privilege('anon', 'public.email_deliveries', 'update') or has_table_privilege('anon', 'public.email_deliveries', 'delete'))
       || ' authenticated=' || (has_table_privilege('authenticated', 'public.email_deliveries', 'select') or has_table_privilege('authenticated', 'public.email_deliveries', 'insert')
                   or has_table_privilege('authenticated', 'public.email_deliveries', 'update') or has_table_privilege('authenticated', 'public.email_deliveries', 'delete')) end,
       to_regclass('public.email_deliveries') is not null
       and not (has_table_privilege('anon', 'public.email_deliveries', 'select') or has_table_privilege('anon', 'public.email_deliveries', 'insert')
                or has_table_privilege('anon', 'public.email_deliveries', 'update') or has_table_privilege('anon', 'public.email_deliveries', 'delete')
                or has_table_privilege('authenticated', 'public.email_deliveries', 'select') or has_table_privilege('authenticated', 'public.email_deliveries', 'insert')
                or has_table_privilege('authenticated', 'public.email_deliveries', 'update') or has_table_privilege('authenticated', 'public.email_deliveries', 'delete'))
union all
select 409, 'INFO', 'D email_deliveries', 'delivery rows by kind/status (baseline)',
       '(record)',
       case when to_regclass('public.email_deliveries') is null then 'MISSING' else
       coalesce((xpath('/row/v/text()', query_to_xml($q$
           select count(*) || ' total' || coalesce(' — ' || (select string_agg(k, ', ' order by k) from (
                  select kind || '/' || status || '=' || count(*) as k from public.email_deliveries group by kind, status) s), '') as v
             from public.email_deliveries$q$, false, true, '')))[1]::text, '0 total') end,
       null
union all
select 410, 'BLOCKER', 'D email_deliveries', 'existing rows satisfy the NEW checks (kind in report/sequence, lead_id set)',
       '0 violating rows',
       case when to_regclass('public.email_deliveries') is null then 'MISSING' else
       (xpath('/row/v/text()', query_to_xml($q$
           select count(*) || ' violating rows' as v from public.email_deliveries
            where kind not in ('report', 'sequence') or lead_id is null$q$, false, true, '')))[1]::text end,
       to_regclass('public.email_deliveries') is not null
       and (xpath('/row/v/text()', query_to_xml($q$
           select count(*) as v from public.email_deliveries where kind not in ('report', 'sequence') or lead_id is null$q$, false, true, '')))[1]::text = '0'

-- ---------------------------------------------------------------------
-- E. Functions and administrator protections (migrations 2 and 6)
-- ---------------------------------------------------------------------
union all
select 501, 'BLOCKER', 'E admin', 'emerriment_private schema and request_role() exist (the new guards call it at run time)',
       'present, present',
       coalesce(to_regnamespace('emerriment_private')::text, 'schema MISSING') || ', '
       || coalesce(to_regprocedure('emerriment_private.request_role()')::text, 'request_role MISSING'),
       to_regnamespace('emerriment_private') is not null and to_regprocedure('emerriment_private.request_role()') is not null
union all
select 502, 'BLOCKER', 'E admin', 'visitors cannot use the emerriment_private schema',
       'anon=false authenticated=false',
       'anon=' || coalesce(has_schema_privilege('anon', to_regnamespace('emerriment_private')::oid, 'usage')::text, 'n/a')
       || ' authenticated=' || coalesce(has_schema_privilege('authenticated', to_regnamespace('emerriment_private')::oid, 'usage')::text, 'n/a'),
       to_regnamespace('emerriment_private') is not null
       and not has_schema_privilege('anon', to_regnamespace('emerriment_private')::oid, 'usage')
       and not has_schema_privilege('authenticated', to_regnamespace('emerriment_private')::oid, 'usage')
union all
select 503, 'BLOCKER', 'E admin', 'emerriment_is_admin() exists, SECURITY DEFINER, search_path pinned',
       'security definer, search_path set',
       coalesce((select case when prosecdef then 'security definer' else 'INVOKER' end || ', '
                        || case when proconfig::text like '%search_path%' then 'search_path set' else 'NO search_path' end
                   from pg_proc where oid = to_regprocedure('public.emerriment_is_admin()')), 'MISSING'),
       coalesce((select prosecdef and proconfig::text like '%search_path%' from pg_proc
                  where oid = to_regprocedure('public.emerriment_is_admin()')), false)
union all
select 504, 'BLOCKER', 'E admin', 'emerriment_set_admin(uuid, boolean): authenticated may execute, anon may not',
       'authenticated=true anon=false',
       case when to_regprocedure('public.emerriment_set_admin(uuid, boolean)') is null then 'MISSING' else
       'authenticated=' || has_function_privilege('authenticated', 'public.emerriment_set_admin(uuid, boolean)', 'execute')
       || ' anon=' || has_function_privilege('anon', 'public.emerriment_set_admin(uuid, boolean)', 'execute') end,
       to_regprocedure('public.emerriment_set_admin(uuid, boolean)') is not null
       and has_function_privilege('authenticated', 'public.emerriment_set_admin(uuid, boolean)', 'execute')
       and not has_function_privilege('anon', 'public.emerriment_set_admin(uuid, boolean)', 'execute')
union all
select 505, 'BLOCKER', 'E admin', 'profile privilege guard trigger present and enabled',
       'emerriment_guard_profile_privileges (O)',
       coalesce((select tgname::text || ' (' || tgenabled::text || ')' from pg_trigger
                  where tgrelid = to_regclass('public.profiles') and tgname = 'emerriment_guard_profile_privileges'), 'MISSING'),
       exists (select 1 from pg_trigger where tgrelid = to_regclass('public.profiles')
                  and tgname = 'emerriment_guard_profile_privileges' and tgenabled = 'O')
union all
select 506, 'BLOCKER', 'E admin', 'nobody can set profiles.is_admin through a column grant',
       'anon=false authenticated=false',
       'anon=' || has_column_privilege('anon', 'public.profiles', 'is_admin', 'update')
       || ' authenticated=' || has_column_privilege('authenticated', 'public.profiles', 'is_admin', 'update'),
       not has_column_privilege('anon', 'public.profiles', 'is_admin', 'update')
       and not has_column_privilege('authenticated', 'public.profiles', 'is_admin', 'update')
union all
select 507, 'BLOCKER', 'E admin', 'at least one administrator exists (count only)',
       '>= 1', (select count(*)::text from public.profiles where is_admin),
       (select count(*) >= 1 from public.profiles where is_admin)
union all
select 508, 'BLOCKER', 'E admin', 'guard functions are not callable through the API',
       'anon/authenticated execute = false',
       case when to_regprocedure('public.emerriment_guard_lead_insert()') is null then 'emerriment_guard_lead_insert MISSING' else
       'lead_insert: anon=' || has_function_privilege('anon', 'public.emerriment_guard_lead_insert()', 'execute')
       || ' auth=' || has_function_privilege('authenticated', 'public.emerriment_guard_lead_insert()', 'execute') end,
       to_regprocedure('public.emerriment_guard_lead_insert()') is not null
       and not has_function_privilege('anon', 'public.emerriment_guard_lead_insert()', 'execute')
       and not has_function_privilege('authenticated', 'public.emerriment_guard_lead_insert()', 'execute')
union all
select 509, 'BLOCKER', 'E admin', 'RLS enabled on every public table',
       '0 tables without RLS',
       coalesce((select count(*) || ' without RLS' || coalesce(': ' || string_agg(relname, ', '), '')
                   from pg_class where relnamespace = 'public'::regnamespace and relkind in ('r', 'p') and not relrowsecurity), '0'),
       (select count(*) = 0 from pg_class where relnamespace = 'public'::regnamespace and relkind in ('r', 'p') and not relrowsecurity)
union all
select 510, 'INFO', 'E admin', 'baseline: public tables / emerriment_* policies / all public policies',
       '(record; the migration 7 rollback compares against these)',
       (select count(*) from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r') || ' tables / '
       || (select count(*) from pg_policies where schemaname = 'public' and policyname like 'emerriment\_%') || ' emerriment_ policies / '
       || (select count(*) from pg_policies where schemaname = 'public') || ' policies',
       null
union all
select 511, 'INFO', 'E admin', 'event triggers (rls_auto_enable expected; migration 7 enables RLS on purchases itself)',
       '(record)',
       coalesce((select string_agg(evtname::text || ' -> ' || evtfoid::regproc::text || ' (' || evtenabled::text || ')', ', ') from pg_event_trigger), '(none)'),
       null

-- ---------------------------------------------------------------------
-- F. Migration 7 objects must NOT exist yet (a FAIL here means migration
--    7 was partly or fully applied before: stop and investigate)
-- ---------------------------------------------------------------------
union all
select 601, 'BLOCKER', 'F not yet applied', 'no leads.marketing_consent* columns',
       '0 of 8',
       (select count(*) || coalesce(': ' || string_agg(attname, ' '), '') from pg_attribute
         where attrelid = to_regclass('public.leads') and attname like 'marketing\_consent%' and not attisdropped),
       (select count(*) = 0 from pg_attribute
         where attrelid = to_regclass('public.leads') and attname like 'marketing\_consent%' and not attisdropped)
union all
select 602, 'BLOCKER', 'F not yet applied', 'no public.purchases table',
       'absent', coalesce(to_regclass('public.purchases')::text, 'absent'), to_regclass('public.purchases') is null
union all
select 603, 'BLOCKER', 'F not yet applied', 'no email_deliveries.purchase_id column',
       'absent',
       coalesce((select 'PRESENT' from pg_attribute where attrelid = to_regclass('public.email_deliveries')
                  and attname = 'purchase_id' and not attisdropped), 'absent'),
       not exists (select 1 from pg_attribute where attrelid = to_regclass('public.email_deliveries')
                      and attname = 'purchase_id' and not attisdropped)
union all
select 604, 'BLOCKER', 'F not yet applied', 'none of the 5 new indexes exist',
       '0',
       (select count(*) || coalesce(': ' || string_agg(c.relname, ' '), '') from pg_class c
         where c.relnamespace = 'public'::regnamespace and c.relkind = 'i' and c.relname in (
               'emerriment_leads_marketing_consent_idx', 'emerriment_leads_active_consent_address_idx',
               'emerriment_leads_consent_token_idx', 'emerriment_purchases_email_idx',
               'email_deliveries_one_per_customer_email')),
       (select count(*) = 0 from pg_class c
         where c.relnamespace = 'public'::regnamespace and c.relkind = 'i' and c.relname in (
               'emerriment_leads_marketing_consent_idx', 'emerriment_leads_active_consent_address_idx',
               'emerriment_leads_consent_token_idx', 'emerriment_purchases_email_idx',
               'email_deliveries_one_per_customer_email'))
union all
select 605, 'BLOCKER', 'F not yet applied', 'new constraints absent (leads_marketing_consent_evidence_check, email_deliveries_target_check)',
       '0',
       (select count(*) || coalesce(': ' || string_agg(conname, ' '), '') from pg_constraint
         where conname in ('leads_marketing_consent_evidence_check', 'email_deliveries_target_check', 'purchases_one_per_order')),
       (select count(*) = 0 from pg_constraint
         where conname in ('leads_marketing_consent_evidence_check', 'email_deliveries_target_check', 'purchases_one_per_order'))
union all
select 606, 'BLOCKER', 'F not yet applied', 'consent guard functions absent',
       '0',
       (select count(*) || coalesce(': ' || string_agg(proname, ' '), '') from pg_proc
         where pronamespace = 'public'::regnamespace
           and proname in ('emerriment_guard_lead_consent', 'emerriment_guard_lead_consent_change')),
       (select count(*) = 0 from pg_proc where pronamespace = 'public'::regnamespace
           and proname in ('emerriment_guard_lead_consent', 'emerriment_guard_lead_consent_change'))
union all
select 607, 'BLOCKER', 'F not yet applied', 'consent guard triggers absent',
       '0',
       (select count(*) || coalesce(': ' || string_agg(tgname, ' '), '') from pg_trigger
         where tgname in ('emerriment_guard_lead_consent', 'emerriment_guard_lead_consent_change')),
       (select count(*) = 0 from pg_trigger
         where tgname in ('emerriment_guard_lead_consent', 'emerriment_guard_lead_consent_change'))
union all
select 608, 'BLOCKER', 'F not yet applied', 'purchases policy absent',
       '0',
       (select count(*)::text from pg_policies where policyname = 'emerriment_purchases_admin_read'),
       (select count(*) = 0 from pg_policies where policyname = 'emerriment_purchases_admin_read')
union all
select 609, 'BLOCKER', 'F not yet applied', 'email_deliveries kinds still limited to report/sequence',
       'no customer/confirm',
       coalesce((select pg_get_constraintdef(oid) from pg_constraint
                  where conrelid = to_regclass('public.email_deliveries') and conname = 'email_deliveries_kind_check'), 'MISSING'),
       coalesce((select pg_get_constraintdef(oid) not like '%customer%' and pg_get_constraintdef(oid) not like '%confirm%'
                   from pg_constraint where conrelid = to_regclass('public.email_deliveries') and conname = 'email_deliveries_kind_check'), false)
union all
select 610, 'BLOCKER', 'F not yet applied', 'email_deliveries.lead_id still NOT NULL (migration 7 relaxes it)',
       'not null',
       coalesce((select case when attnotnull then 'not null' else 'NULLABLE' end from pg_attribute
                  where attrelid = to_regclass('public.email_deliveries') and attname = 'lead_id'), 'MISSING'),
       coalesce((select attnotnull from pg_attribute
                  where attrelid = to_regclass('public.email_deliveries') and attname = 'lead_id'), false)
)

select severity,
       section,
       check_name,
       expected,
       actual,
       case when severity = 'INFO' then 'INFO' when ok then 'PASS' else 'FAIL' end as result
  from checks
 order by case when severity <> 'INFO' and not coalesce(ok, false) then 0 else 1 end,
          n;
