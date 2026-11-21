-- READ-ONLY: per-object metadata (no row data): table flags and ACLs (default ACLs made explicit),
-- constraints, functions (definition md5 with carriage returns removed — production's bodies were
-- written with CRLF line endings, staging's with LF), function ACLs, schemas and schema ACLs.
with s as (select oid, nspname from pg_namespace where nspname in ('public', 'emerriment_private')),
tbl as (select c.oid, s.nspname, c.relname, c.relrowsecurity, c.relforcerowsecurity, c.relacl, pg_get_userbyid(c.relowner) own
        from pg_class c join s on s.oid = c.relnamespace where c.relkind in ('r', 'p'))
select 'table' cat, nspname || '.' || relname k, concat_ws('|', relrowsecurity, relforcerowsecurity, own) v from tbl
union all select 'table-acl', t.nspname || '.' || t.relname || ' ' || a.grantee::regrole::text, string_agg(a.privilege_type || case when a.is_grantable then '*' else '' end || '/' || a.grantor::regrole::text, ',' order by a.privilege_type, a.grantor::regrole::text)
  from tbl t, aclexplode(coalesce(t.relacl, acldefault('r', (select relowner from pg_class where oid = t.oid)))) a group by 1, 2
union all select 'constraint', t.nspname || '.' || t.relname || '.' || n.conname, n.contype::text || '|' || pg_get_constraintdef(n.oid) from tbl t join pg_constraint n on n.conrelid = t.oid
union all select 'function', p.oid::regprocedure::text, concat_ws('|', md5(replace(pg_get_functiondef(p.oid), E'\r', '')), pg_get_userbyid(p.proowner), p.prosecdef, p.provolatile, array_to_string(p.proconfig, ';'))
  from pg_proc p join s on s.oid = p.pronamespace
union all select 'function-acl', p.oid::regprocedure::text || ' ' || a.grantee::regrole::text, string_agg(a.privilege_type || '/' || a.grantor::regrole::text, ',' order by 1)
  from pg_proc p join s on s.oid = p.pronamespace, aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a group by 1, 2
union all select 'schema', n.nspname, pg_get_userbyid(n.nspowner) from pg_namespace n join s on s.oid = n.oid
union all select 'schema-acl', n.nspname || ' ' || a.grantee::regrole::text, string_agg(a.privilege_type || case when a.is_grantable then '*' else '' end || '/' || a.grantor::regrole::text, ',' order by a.privilege_type)
  from pg_namespace n join s on s.oid = n.oid, aclexplode(coalesce(n.nspacl, acldefault('n', n.nspowner))) a group by 1, 2
order by 1, 2;
