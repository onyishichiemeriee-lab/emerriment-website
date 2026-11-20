-- =====================================================================
-- EMerriment STAGING — step 09b: supplementary security checks
-- ---------------------------------------------------------------------
-- Covers what 03b does not: purchases access, storage access (article-images
-- admin/assets/), signup/profile creation, and "synthetic data only".
-- Every test write and every fixture is rolled back: each test runs in a
-- sub-transaction that always aborts (EMRT1), and the fixture block ends
-- with a deliberate EMRB9 error that is caught. Output: test ids, actors,
-- counts and SQLSTATEs only. Each actor runs exactly as an API request does
-- (SET LOCAL ROLE + request.jwt.claims).
--
-- Expected: 39 pass / 0 fail (staging, 2026-11-19). Two expectations are
-- outright denials (42501) rather than "0 rows", identical on production:
--   STO-10  Supabase's storage.protect_delete trigger rejects direct SQL
--           deletes on storage.objects for every role (use the Storage API);
--   ADM-02  authenticated has no column UPDATE privilege on profiles.is_admin.
-- Accounts are looked up by their @example.test addresses (step 07); no UUID
-- is hard-coded. SYN-06 requires every UUID literal in the storage policies
-- to be the staging administrator's (so no production account id is present).
--
-- Run (not read-only: it writes, then rolls everything back):
--   bash supabase/staging/run-on-staging.sh --remote=<staging-ref> supabase/staging/09_supplementary_security_checks.sql
-- =====================================================================
begin;
create temp table emr_sup (seq serial, test_id text, actor text, operation text, expected text, actual text, result text) on commit drop;

create function pg_temp.emr_try(p_role text, p_uid uuid, p_sql text) returns text language plpgsql as $f$
declare n bigint; st text;
begin
    begin
        execute format('set local role %I', p_role);
        perform set_config('request.jwt.claims',
            case when p_uid is null then json_build_object('role', p_role)::text
                 else json_build_object('role', p_role, 'sub', p_uid)::text end, true);
        execute p_sql;
        get diagnostics n = row_count;
        raise exception using errcode = 'EMRT1', message = n::text;
    exception
        when sqlstate 'EMRT1' then return 'rows=' || sqlerrm;
        when others then get stacked diagnostics st = returned_sqlstate; return 'error ' || st;
    end;
end
$f$;

do $sup$
declare
    admin_id uuid; a_id uuid; b_id uuid;
    t record; got text; ok boolean;
    tests jsonb := '[]';
    results jsonb := '[]';
begin
    if to_regnamespace('emerriment_backup') is not null then
        raise exception 'Refusing: emerriment_backup exists — this looks like PRODUCTION.';
    end if;
    select id into admin_id from auth.users where email = 'staging-admin@example.test';
    select id into a_id     from auth.users where email = 'staging-user-a@example.test';
    select id into b_id     from auth.users where email = 'staging-user-b@example.test';
    if admin_id is null or a_id is null or b_id is null then
        raise exception 'Refusing: the three @example.test staging accounts (step 07) are missing.';
    end if;

    -- ---------- read-only facts (no fixtures needed) ----------
    results := results || jsonb_build_array(
      jsonb_build_object('id', 'SIGNUP-01', 'actor', 'db owner', 'op', 'every auth user has exactly one profile with the same id and email', 'exp', 'true',
        'got', ((select count(*) from auth.users u join public.profiles p on p.id = u.id and p.email = u.email) = 3
                and (select count(*) from public.profiles) = 3)::text),
      jsonb_build_object('id', 'SIGNUP-02', 'actor', 'db owner', 'op', 'profiles full_name taken from signup metadata', 'exp', 'true',
        'got', ((select count(*) from public.profiles where full_name like 'Staging %') = 3)::text),
      jsonb_build_object('id', 'SIGNUP-03', 'actor', 'db owner', 'op', 'administrator set = only the promoted staging admin', 'exp', admin_id::text,
        'got', coalesce((select string_agg(id::text, ',') from public.profiles where is_admin), '(none)')),
      jsonb_build_object('id', 'SIGNUP-04', 'actor', 'db owner', 'op', 'signup trigger present and enabled on auth.users', 'exp', 'on_auth_user_created:O',
        'got', coalesce((select string_agg(tgname || ':' || tgenabled::text, ',') from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal), '(none)')),
      jsonb_build_object('id', 'SYN-01', 'actor', 'db owner', 'op', 'auth users: count / non-example.test addresses', 'exp', '3/0',
        'got', (select count(*) || '/' || count(*) filter (where email not like '%@example.test') from auth.users)),
      jsonb_build_object('id', 'SYN-02', 'actor', 'db owner', 'op', 'leads: count / non-example.test / consented', 'exp', '3/0/0',
        'got', (select count(*) || '/' || count(*) filter (where email not like '%@example.test') || '/' || count(*) filter (where marketing_consent) from public.leads)),
      jsonb_build_object('id', 'SYN-03', 'actor', 'db owner', 'op', 'profiles with non-example.test address', 'exp', '0',
        'got', (select count(*)::text from public.profiles where email not like '%@example.test')),
      jsonb_build_object('id', 'SYN-04', 'actor', 'db owner', 'op', 'articles not staging-* / products not "Staging *"', 'exp', '0/0',
        'got', (select count(*) from public.encyclopedia_articles where slug not like 'staging-%') || '/' || (select count(*) from public.products where name not like 'Staging %')),
      jsonb_build_object('id', 'SYN-05', 'actor', 'db owner', 'op', 'rows in all other application tables', 'exp', '0',
        'got', (select (sum((xpath('/row/c/text()', query_to_xml(format('select count(*) as c from %I.%I', n.nspname, c.relname), false, true, '')))[1]::text::int))::text
                  from pg_class c join pg_namespace n on n.oid = c.relnamespace
                 where n.nspname in ('public', 'emerriment_private') and c.relkind = 'r'
                   and c.relname not in ('leads', 'profiles', 'encyclopedia_articles', 'products'))),
      jsonb_build_object('id', 'SYN-06', 'actor', 'db owner', 'op', 'storage objects / policy UUID problems (a literal other than the staging admin, or fewer than 4 admin policies)', 'exp', '0/0',
        'got', (select count(*) from storage.objects) || '/' ||
               ((select count(*) from pg_policies p, regexp_matches(coalesce(p.qual, '') || ' ' || coalesce(p.with_check, ''),
                        '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', 'g') m
                  where p.schemaname = 'storage' and m[1] <> admin_id::text)
                + greatest(0, 4 - (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects'
                                     and (coalesce(qual, '') || coalesce(with_check, '')) like '%' || admin_id::text || '%'))))
    );

    begin  -- ===== fixtures + write tests: always rolled back (EMRB9) =====
        insert into public.purchases (email, user_id, product_code, provider, provider_order_ref, verified_by)
        values ('staging-user-b@example.test', b_id, 'staging-test-product', 'manual', 'STAGING-SECURITY-TEST', 'staging security test');
        insert into storage.objects (bucket_id, name) values ('article-images', 'admin/assets/staging-fixture.png');

        for t in select * from (values
            -- purchases: only administrators may read; nobody but service_role may write
            ('PUR-01', 'anon',          null::uuid, 'select * from public.purchases',                                   'error 42501'),
            ('PUR-02', 'authenticated', a_id,       'select * from public.purchases',                                   'rows=0'),
            ('PUR-03', 'authenticated', b_id,       'select * from public.purchases',                                   'rows=0'),
            ('PUR-04', 'authenticated', admin_id,   'select * from public.purchases',                                   'rows=1'),
            ('PUR-05', 'authenticated', a_id,       $q$insert into public.purchases (email, product_code, provider, provider_order_ref, verified_by) values ('staging-user-a@example.test', 'x', 'manual', 'FORGED-A', 'forged by user')$q$, 'error 42501'),
            ('PUR-06', 'authenticated', admin_id,   $q$insert into public.purchases (email, product_code, provider, provider_order_ref, verified_by) values ('staging-admin@example.test', 'x', 'manual', 'FORGED-ADMIN', 'forged by admin')$q$, 'error 42501'),
            ('PUR-07', 'anon',          null,       $q$insert into public.purchases (email, product_code, provider, provider_order_ref, verified_by) values ('x@example.test', 'x', 'manual', 'FORGED-ANON', 'forged by anon')$q$, 'error 42501'),
            ('PUR-08', 'authenticated', b_id,       $q$update public.purchases set refunded_at = now()$q$,               'error 42501'),
            ('PUR-09', 'authenticated', admin_id,   $q$delete from public.purchases$q$,                                  'error 42501'),
            ('PUR-10', 'service_role',  null,       $q$insert into public.purchases (email, product_code, provider, provider_order_ref, verified_by) values ('lead1@example.test', 'staging-test-product', 'selar', 'STAGING-SERVICE-TEST', 'service role test')$q$, 'rows=1'),
            -- storage: admin/assets/ in article-images is writable and listable only by the staging administrator
            ('STO-01', 'anon',          null,       $q$select * from storage.objects where bucket_id = 'article-images'$q$, 'rows=0'),
            ('STO-02', 'authenticated', a_id,       $q$select * from storage.objects where bucket_id = 'article-images'$q$, 'rows=0'),
            ('STO-03', 'authenticated', admin_id,   $q$select * from storage.objects where bucket_id = 'article-images'$q$, 'rows=1'),
            ('STO-04', 'anon',          null,       $q$insert into storage.objects (bucket_id, name) values ('article-images', 'admin/assets/anon.png')$q$, 'error 42501'),
            ('STO-05', 'authenticated', a_id,       $q$insert into storage.objects (bucket_id, name) values ('article-images', 'admin/assets/user-a.png')$q$, 'error 42501'),
            ('STO-06', 'authenticated', b_id,       $q$insert into storage.objects (bucket_id, name) values ('article-images', 'user-b/b.png')$q$, 'error 42501'),
            ('STO-07', 'authenticated', admin_id,   $q$insert into storage.objects (bucket_id, name) values ('article-images', 'admin/assets/admin.png')$q$, 'rows=1'),
            ('STO-08', 'authenticated', admin_id,   $q$insert into storage.objects (bucket_id, name) values ('article-images', 'elsewhere/admin.png')$q$, 'error 42501'),
            ('STO-09', 'authenticated', a_id,       $q$update storage.objects set metadata = '{}' where bucket_id = 'article-images'$q$, 'rows=0'),
            -- Supabase's storage.protect_delete trigger rejects direct SQL deletes for every role (use the Storage API)
            ('STO-10', 'authenticated', a_id,       $q$delete from storage.objects where bucket_id = 'article-images'$q$, 'error 42501'),
            ('STO-11', 'authenticated', admin_id,   $q$update storage.objects set metadata = '{}' where bucket_id = 'article-images'$q$, 'rows=1'),
            ('STO-12', 'anon',          null,       $q$insert into storage.buckets (id, name, public) values ('forged', 'forged', true)$q$, 'error 42501'),
            ('STO-13', 'authenticated', a_id,       $q$update storage.buckets set public = false, file_size_limit = null$q$, 'rows=0'),
            ('STO-14', 'authenticated', admin_id,   $q$update storage.buckets set allowed_mime_types = null$q$, 'rows=0'),
            -- profiles: ordinary users cannot make themselves administrators
            ('ADM-01', 'authenticated', a_id,       $q$update public.profiles set is_admin = true where id = auth.uid()$q$, 'error 42501'),
            -- authenticated has no column UPDATE privilege on is_admin: denied before RLS is consulted
            ('ADM-02', 'authenticated', b_id,       $q$update public.profiles set is_admin = false where is_admin$q$, 'error 42501'),
            ('ADM-03', 'authenticated', a_id,       $q$select public.emerriment_set_admin(auth.uid(), true)$q$, 'error 42501')  -- user A promoting itself
        ) v(id, role, uid, sql, exp) loop
            got := pg_temp.emr_try(t.role, t.uid, t.sql);
            results := results || jsonb_build_array(jsonb_build_object('id', t.id,
                'actor', case when t.uid = admin_id then 'admin' when t.uid = a_id then 'user A' when t.uid = b_id then 'user B' else t.role end,
                'op', left(regexp_replace(t.sql, '''[^'']*''', '''…''', 'g'), 90), 'exp', t.exp, 'got', got));
        end loop;
        raise exception using errcode = 'EMRB9', message = 'roll back fixtures';
    exception when sqlstate 'EMRB9' then null;
    end;

    -- confirm the rollback
    results := results || jsonb_build_array(
      jsonb_build_object('id', 'RB-01', 'actor', 'db owner', 'op', 'purchases rows / storage objects / buckets after rollback', 'exp', '0/0/1',
        'got', (select count(*) from public.purchases) || '/' || (select count(*) from storage.objects) || '/' || (select count(*) from storage.buckets)),
      jsonb_build_object('id', 'RB-02', 'actor', 'db owner', 'op', 'administrator set after rollback', 'exp', admin_id::text,
        'got', coalesce((select string_agg(id::text, ',') from public.profiles where is_admin), '(none)')));

    insert into emr_sup (test_id, actor, operation, expected, actual, result)
    select r->>'id', r->>'actor', r->>'op', r->>'exp', r->>'got', case when r->>'exp' = r->>'got' then 'PASS' else 'FAIL' end
      from jsonb_array_elements(results) r;
end
$sup$;

drop function pg_temp.emr_try(text, uuid, text);

select test_id, actor, operation, expected, actual, result,
       (select count(*) filter (where result = 'PASS') || ' pass / ' || count(*) filter (where result = 'FAIL') || ' fail' from emr_sup) as summary
  from emr_sup order by seq;

commit;
