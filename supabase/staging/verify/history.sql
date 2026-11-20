-- READ-ONLY: recorded migration versions (history metadata only).
select 'history' cat, 'versions' k,
       (xpath('/row/v/text()', query_to_xml('select string_agg(version, '','' order by version) as v from supabase_migrations.schema_migrations', false, true, '')))[1]::text v
union all select 'history', 'statements recorded for versions (count)',
       (xpath('/row/c/text()', query_to_xml('select count(*) filter (where statements is not null and cardinality(statements) > 0) as c from supabase_migrations.schema_migrations', false, true, '')))[1]::text;
