-- READ-ONLY structural fingerprint of the EMerriment application schemas.
-- Same query on staging and production; returns counts and md5 hashes only.
with s as (select oid, nspname from pg_namespace where nspname in ('public', 'emerriment_private')),
tbl as (select c.oid, s.nspname, c.relname, c.relrowsecurity, c.relforcerowsecurity, c.relacl::text acl, pg_get_userbyid(c.relowner) own
        from pg_class c join s on s.oid = c.relnamespace where c.relkind in ('r', 'p')),
col as (select t.nspname, t.relname, a.attname, format_type(a.atttypid, a.atttypmod) typ, a.attnotnull, a.attidentity, a.attgenerated,
               pg_get_expr(d.adbin, d.adrelid) def, a.attacl::text acl
        from tbl t join pg_attribute a on a.attrelid = t.oid and a.attnum > 0 and not a.attisdropped
        left join pg_attrdef d on d.adrelid = a.attrelid and d.adnum = a.attnum),
con as (select t.nspname, t.relname, n.conname, n.contype, pg_get_constraintdef(n.oid) def from tbl t join pg_constraint n on n.conrelid = t.oid),
idx as (select t.nspname, t.relname, i.relname iname, pg_get_indexdef(x.indexrelid) def
        from tbl t join pg_index x on x.indrelid = t.oid join pg_class i on i.oid = x.indexrelid),
pol as (select schemaname, tablename, policyname, permissive, roles::text r, cmd, qual, with_check from pg_policies where schemaname in ('public', 'emerriment_private')),
fun as (select s.nspname, p.proname, pg_get_function_identity_arguments(p.oid) args, md5(pg_get_functiondef(p.oid)) def, p.proacl::text acl, pg_get_userbyid(p.proowner) own
        from pg_proc p join s on s.oid = p.pronamespace),
trg as (select t.nspname, t.relname, g.tgname, pg_get_triggerdef(g.oid) def, g.tgenabled from tbl t join pg_trigger g on g.tgrelid = t.oid and not g.tgisinternal),
seq as (select s.nspname, c.relname, c.relacl::text acl from pg_class c join s on s.oid = c.relnamespace where c.relkind = 'S'),
sch as (select n.nspname, n.nspacl::text acl, pg_get_userbyid(n.nspowner) own from pg_namespace n join s on s.oid = n.oid),
dfl as (select pg_get_userbyid(defaclrole) r, coalesce(n.nspname, '') nsp, defaclobjtype, defaclacl::text acl
        from pg_default_acl d left join pg_namespace n on n.oid = d.defaclnamespace where n.nspname in ('public', 'emerriment_private') or d.defaclnamespace = 0)
select 'tables' item, count(*)::text n, md5(string_agg(concat_ws('|', nspname, relname, relrowsecurity, relforcerowsecurity, acl, own), ';' order by nspname, relname)) h from tbl
union all select 'tables.public', count(*)::text, null from tbl where nspname = 'public'
union all select 'tables.rls_enabled', count(*) filter (where relrowsecurity)::text || '/' || count(*), null from tbl
union all select 'columns', count(*)::text, md5(string_agg(concat_ws('|', nspname, relname, attname, typ, attnotnull, attidentity, attgenerated, def, acl), ';' order by nspname, relname, attname)) from col
union all select 'constraints', count(*)::text, md5(string_agg(concat_ws('|', nspname, relname, conname, contype, def), ';' order by nspname, relname, conname)) from con
union all select 'constraints.by_type', string_agg(contype::text || '=' || c, ',' order by contype::text), null from (select contype, count(*) c from con group by 1) z
union all select 'indexes', count(*)::text, md5(string_agg(concat_ws('|', nspname, relname, iname, def), ';' order by nspname, relname, iname)) from idx
union all select 'policies', count(*)::text, md5(string_agg(concat_ws('|', schemaname, tablename, policyname, permissive, r, cmd, qual, with_check), ';' order by schemaname, tablename, policyname)) from pol
union all select 'functions', count(*)::text, md5(string_agg(concat_ws('|', nspname, proname, args, def, acl, own), ';' order by nspname, proname, args)) from fun
union all select 'function names', string_agg(nspname || '.' || proname, ',' order by nspname, proname), null from fun
union all select 'triggers', count(*)::text, md5(string_agg(concat_ws('|', nspname, relname, tgname, def, tgenabled), ';' order by nspname, relname, tgname)) from trg
union all select 'trigger names', string_agg(relname || ':' || tgname, ',' order by relname, tgname), null from trg
union all select 'sequences', count(*)::text, md5(coalesce(string_agg(concat_ws('|', nspname, relname, acl), ';' order by nspname, relname), '')) from seq
union all select 'schemas', string_agg(nspname, ',' order by nspname), md5(string_agg(concat_ws('|', nspname, acl, own), ';' order by nspname)) from sch
union all select 'default privileges', count(*)::text, md5(coalesce(string_agg(concat_ws('|', r, nsp, defaclobjtype, acl), ';' order by r, nsp, defaclobjtype), '')) from dfl
union all select 'grants: tables with S/I/U/D per role',
       string_agg(r || '=' || s || '/' || i || '/' || u || '/' || d, ',' order by r),
       md5(string_agg(m, ';' order by r))
  from (select r.r,
               count(*) filter (where has_table_privilege(r.r, t.oid, 'SELECT')) s, count(*) filter (where has_table_privilege(r.r, t.oid, 'INSERT')) i,
               count(*) filter (where has_table_privilege(r.r, t.oid, 'UPDATE')) u, count(*) filter (where has_table_privilege(r.r, t.oid, 'DELETE')) d,
               string_agg(concat_ws('|', t.nspname, t.relname, has_table_privilege(r.r, t.oid, 'SELECT'), has_table_privilege(r.r, t.oid, 'INSERT'),
                          has_table_privilege(r.r, t.oid, 'UPDATE'), has_table_privilege(r.r, t.oid, 'DELETE'), has_table_privilege(r.r, t.oid, 'TRUNCATE')), ',' order by t.nspname, t.relname) m
        from (values ('anon'), ('authenticated'), ('service_role')) r(r) cross join tbl t group by r.r) z
union all select 'grants: functions executable per role',
       string_agg(r || '=' || e, ',' order by r), md5(string_agg(m, ';' order by r))
  from (select r.r, count(*) filter (where has_function_privilege(r.r, p.oid, 'EXECUTE')) e,
               string_agg(p.oid::regprocedure::text || '=' || has_function_privilege(r.r, p.oid, 'EXECUTE'), ',' order by p.oid::regprocedure::text) m
        from (values ('anon'), ('authenticated'), ('service_role')) r(r)
        cross join pg_proc p join s on s.oid = p.pronamespace group by r.r) z
union all select 'leads rows (count only)', (xpath('/row/c/text()', query_to_xml('select count(*) as c from public.leads', false, true, '')))[1]::text, null
union all select 'emerriment_private usable by anon/authenticated',
       (has_schema_privilege('anon', 'emerriment_private', 'USAGE') or has_schema_privilege('authenticated', 'emerriment_private', 'USAGE'))::text, null
union all select 'emerriment_backup schema present', (to_regnamespace('emerriment_backup') is not null)::text, null
union all select 'event triggers', coalesce(string_agg(evtname || ':' || evtfoid::regproc::text, ',' order by evtname), '(none)'), null
       from pg_event_trigger where evtfoid::regproc::text like '%rls_auto_enable%' or evtfoid::regproc::text like 'public.%' or evtfoid::regproc::text like 'emerriment%'
union all select 'triggers on auth.users', coalesce((select string_agg(tgname::text, ',') from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal), '(none)'), null
union all select 'storage buckets', coalesce((select string_agg(id, ',') from storage.buckets), '(none)'), null
union all select 'migration history rows', case when to_regclass('supabase_migrations.schema_migrations') is null then 'no table'
       else (xpath('/row/c/text()', query_to_xml('select count(*) as c from supabase_migrations.schema_migrations', false, true, '')))[1]::text end, null;
