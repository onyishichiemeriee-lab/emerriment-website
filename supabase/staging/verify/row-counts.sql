-- READ-ONLY (staging only): row count of every application table. Counts only, no row contents.
select n.nspname || '.' || c.relname as tbl,
       (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from %I.%I', n.nspname, c.relname), false, true, '')))[1]::text::int as rows
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname in ('public', 'emerriment_private') and c.relkind in ('r', 'p')
order by 1;
