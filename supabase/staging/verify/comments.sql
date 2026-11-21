-- READ-ONLY: every table/column/schema comment, keyed by name, CR removed (schema metadata only).
select c.oid::regclass::text || coalesce('.' || a.attname, '') k, md5(replace(d.description, E'\r', '')) v
from pg_description d join pg_class c on c.oid = d.objoid join pg_namespace n on n.oid = c.relnamespace
left join pg_attribute a on a.attrelid = d.objoid and a.attnum = d.objsubid and d.objsubid > 0
where d.classoid = 'pg_class'::regclass and n.nspname in ('public', 'emerriment_private')
union all select 'schema ' || n.nspname, md5(replace(d.description, E'\r', '')) from pg_description d join pg_namespace n on n.oid = d.objoid
where d.classoid = 'pg_namespace'::regclass and n.nspname in ('public', 'emerriment_private')
order by 1;
