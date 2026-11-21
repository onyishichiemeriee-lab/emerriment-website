-- =====================================================================
-- EMerriment STAGING — read-only preflight before importing the schema
-- ---------------------------------------------------------------------
-- Run with --read-only on the staging ref:
--   bash supabase/staging/run-on-staging.sh --remote=<staging-ref> --read-only supabase/staging/01_preflight_fresh_project_read_only.sql
-- Every row must be PASS before step 02 (import). Counts and names only.
-- =====================================================================
with facts as (
    select
        (select count(*) from pg_class where relnamespace = 'public'::regnamespace and relkind in ('r', 'p')) as public_tables,
        (select count(*) from pg_proc where pronamespace = 'public'::regnamespace) as public_functions,
        (select count(*) from pg_policies where schemaname = 'public') as public_policies,
        to_regnamespace('emerriment_private') is not null as private_schema,
        to_regnamespace('emerriment_backup') is not null as backup_schema,
        to_regclass('supabase_migrations.schema_migrations') is not null as history_table,
        (xpath('/row/c/text()', query_to_xml('select count(*) as c from auth.users', false, true, '')))[1]::text::int as auth_users,
        (select count(*) from storage.buckets) as buckets,
        (select count(*) from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal) as auth_triggers,
        current_setting('server_version') as server_version
)
select check_name, expected, actual, case when expected = actual then 'PASS' else 'FAIL' end as result
from facts, lateral (values
    ('public tables',                      '0',     public_tables::text),
    ('public functions',                   '0',     public_functions::text),
    ('public policies',                    '0',     public_policies::text),
    ('emerriment_private schema present',  'false', private_schema::text),
    ('emerriment_backup schema present',   'false', backup_schema::text),
    ('migration history table present',    'false', history_table::text),
    ('auth.users rows',                    '0',     auth_users::text),
    ('storage buckets',                    '0',     buckets::text),
    ('triggers on auth.users',             '0',     auth_triggers::text),
    ('server major version',               '17',    split_part(server_version, '.', 1))
) as c(check_name, expected, actual);
