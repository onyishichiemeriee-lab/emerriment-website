-- READ-ONLY: schema ACLs, default privileges, project markers and the anon/authenticated table-ACL baseline.
select 'schema-acl' cat, n.nspname k, coalesce(n.nspacl::text, '(default)') v from pg_namespace n where n.nspname in ('public', 'emerriment_private')
union all select 'schema-usage', n.nspname || ' ' || r, has_schema_privilege(r, n.oid, 'USAGE')::text || '/create=' || has_schema_privilege(r, n.oid, 'CREATE')::text
  from pg_namespace n, unnest(array['anon', 'authenticated', 'service_role']) r where n.nspname in ('public', 'emerriment_private')
union all select 'default-acl', pg_get_userbyid(d.defaclrole) || ' in ' || coalesce(n.nspname, '(all schemas)') || ' on ' ||
         case d.defaclobjtype when 'r' then 'tables' when 'S' then 'sequences' when 'f' then 'functions' when 'T' then 'types' when 'n' then 'schemas' else d.defaclobjtype::text end,
         d.defaclacl::text
  from pg_default_acl d left join pg_namespace n on n.oid = d.defaclnamespace
union all select 'setting', name, setting from pg_settings where setting ilike '%ayxakyyvomlzrsfznpeq%' or setting ilike '%ioeulnjrozkbetaongbv%'
union all select 'baseline', 'anon/authenticated table ACL md5',
         md5(string_agg(c.relname || ':' || a.grantee::regrole::text || ':' || a.privilege_type, ',' order by c.relname, a.grantee::regrole::text, a.privilege_type))
  from pg_class c join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public', aclexplode(c.relacl) a
  where c.relkind = 'r' and a.grantee in ('anon'::regrole, 'authenticated'::regrole)
order by 1, 2;
