-- READ-ONLY production isolation check: counts and booleans only (no names, emails or ids).
-- Run on PRODUCTION with --read-only only:
--   npx supabase@3.1.0 db query --remote=ioeulnjrozkbetaongbv --read-only --file supabase/staging/verify/production-isolation.sql --output-format json
-- Expected after staging work: every "staging marker" count 0; leads total unchanged
-- unless real visitors submitted the quiz; migration history 8; storage policies
-- contain exactly one UUID (the production administrator's) and no staging/placeholder UUID.
select 'leads total' k, count(*)::text v from public.leads
union all select 'leads newest submission (date only)', coalesce(greatest(max(created_at), max(submitted_at))::date::text, '-') from public.leads
union all select 'leads with @example.test (staging marker)', count(*)::text from public.leads where email like '%@example.test'
union all select 'leads marketing_consent = true', count(*)::text from public.leads where marketing_consent
union all select 'leads with a pending consent request', count(*)::text from public.leads where marketing_consent_requested_at is not null
union all select 'auth users with @example.test', count(*)::text from auth.users where email like '%@example.test'
union all select 'auth users created in the last 24 hours', count(*)::text from auth.users where created_at >= now() - interval '1 day'
union all select 'profiles with @example.test', count(*)::text from public.profiles where email like '%@example.test'
union all select 'staging seed articles (slug staging-%)', count(*)::text from public.encyclopedia_articles where slug like 'staging-%'
union all select 'staging seed products (name Staging %)', count(*)::text from public.products where name like 'Staging %'
union all select 'purchases rows', count(*)::text from public.purchases
union all select 'email_deliveries rows', count(*)::text from public.email_deliveries
union all select 'administrator count', count(*)::text from public.profiles where is_admin
union all select 'storage policies: count / distinct UUIDs (expect 4 / 1) / placeholder UUID present (expect false)',
       (select count(*) from pg_policies where schemaname = 'storage') || ' / ' ||
       (select count(distinct m[1]) from pg_policies p, regexp_matches(coalesce(p.qual, '') || ' ' || coalesce(p.with_check, ''),
               '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', 'g') m where p.schemaname = 'storage') || ' / ' ||
       exists (select 1 from pg_policies p, regexp_matches(coalesce(p.qual, '') || ' ' || coalesce(p.with_check, ''),
               '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', 'g') m
               where p.schemaname = 'storage' and m[1] = '00000000-0000-0000-0000-000000000000')::text
union all select 'bucket article-images settings', (select concat_ws(' | ', public, file_size_limit, allowed_mime_types::text) from storage.buckets where id = 'article-images')
union all select 'migration history versions', (xpath('/row/c/text()', query_to_xml('select count(*) as c from supabase_migrations.schema_migrations', false, true, '')))[1]::text
union all select 'emerriment_backup present', (to_regnamespace('emerriment_backup') is not null)::text
union all select 'website_settings rows', count(*)::text from public.website_settings;
