-- =====================================================================
-- EMerriment STAGING — article view counter verification (rolled back)
-- ---------------------------------------------------------------------
-- Calls public.emerriment_increment_article_views() exactly as the website
-- does (SET LOCAL ROLE anon + anon JWT claims) against the synthetic
-- staging fixtures and checks:
--   CNT-01  published fixture: the call returns initial + 1
--   CNT-02  published fixture: the stored count is initial + 1 (inside the test)
--   CNT-03  draft fixture: the call returns NULL
--   CNT-04  draft fixture: the stored count is unchanged
--   CNT-05  nonexistent UUID: returns NULL
--   CNT-06  NULL id: returns NULL
--   CNT-07  nonexistent / NULL: no article count changed
--   CNT-08  anon cannot UPDATE articles directly (42501)
--   RB-01   after the deliberate rollback every count equals its initial value
--
-- Nothing is kept: all calls run inside a block that always ends with a
-- deliberate error (EMRB7), which undoes every change; RB-01 confirms it,
-- and the whole script finishes with ROLLBACK. No article is created,
-- deleted or modified, and no UUID is hard-coded (fixtures are found by
-- their synthetic slugs).
--
-- Guards (the script refuses to run otherwise):
--   * emerriment_backup must not exist (it exists only on production);
--   * the three staging accounts (staging-admin/-user-a/-user-b@example.test)
--     must exist;
--   * every article must be a synthetic staging article (slug staging-%);
--   * exactly one published 'staging-acne-basics' and one draft
--     'staging-draft' must exist.
--
-- Run (NOT --read-only: the function writes, then everything is undone):
--   bash supabase/staging/run-on-staging.sh --remote=ayxakyyvomlzrsfznpeq supabase/staging/verify/article-counter-rollback.sql
-- Expected: 9 pass / 0 fail. Prepared in WP4G (2026-11-21); not yet run.
-- =====================================================================
begin;

create temp table emr_counter (seq serial, test_id text, operation text, expected text, actual text, result text) on commit drop;

do $cnt$
declare
    pub_id uuid; draft_id uuid;
    pub_initial integer; draft_initial integer; total_initial bigint;
    missing_id constant uuid := '00000000-0000-4000-8000-00000000dead';
    got integer; got_total bigint; denied text;
    results jsonb := '[]';
begin
    -- ---------- guards ----------
    if to_regnamespace('emerriment_backup') is not null then
        raise exception 'Refusing: emerriment_backup exists — this looks like PRODUCTION.';
    end if;
    if (select count(*) from auth.users where email in ('staging-admin@example.test', 'staging-user-a@example.test', 'staging-user-b@example.test')) <> 3 then
        raise exception 'Refusing: the three @example.test staging accounts are missing — this is not the staging project.';
    end if;
    if exists (select 1 from public.encyclopedia_articles where slug is null or slug not like 'staging-%') then
        raise exception 'Refusing: non-synthetic articles exist — this is not the synthetic staging data set.';
    end if;
    if (select count(*) from public.encyclopedia_articles where slug = 'staging-acne-basics' and status = 'published') <> 1
       or (select count(*) from public.encyclopedia_articles where slug = 'staging-draft' and status = 'draft') <> 1 then
        raise exception 'Refusing: the synthetic fixtures (published staging-acne-basics, draft staging-draft) were not found exactly once.';
    end if;
    if exists (select 1 from public.encyclopedia_articles where id = missing_id) then
        raise exception 'Refusing: the "nonexistent" test UUID exists.';
    end if;

    select id, coalesce(views, 0) into pub_id, pub_initial from public.encyclopedia_articles where slug = 'staging-acne-basics';
    select id, coalesce(views, 0) into draft_id, draft_initial from public.encyclopedia_articles where slug = 'staging-draft';
    select coalesce(sum(coalesce(views, 0)), 0) into total_initial from public.encyclopedia_articles;

    -- ---------- calls (always undone by EMRB7) ----------
    begin
        perform set_config('request.jwt.claims', '{"role":"anon"}', true);
        perform set_config('role', 'anon', true);

        got := public.emerriment_increment_article_views(pub_id);
        results := results || jsonb_build_object('id', 'CNT-01', 'op', 'published fixture: returned value', 'exp', (pub_initial + 1)::text, 'got', coalesce(got::text, '<null>'));

        got := public.emerriment_increment_article_views(draft_id);
        results := results || jsonb_build_object('id', 'CNT-03', 'op', 'draft fixture: returned value', 'exp', '<null>', 'got', coalesce(got::text, '<null>'));

        got := public.emerriment_increment_article_views(missing_id);
        results := results || jsonb_build_object('id', 'CNT-05', 'op', 'nonexistent UUID: returned value', 'exp', '<null>', 'got', coalesce(got::text, '<null>'));

        got := public.emerriment_increment_article_views(null);
        results := results || jsonb_build_object('id', 'CNT-06', 'op', 'NULL id: returned value', 'exp', '<null>', 'got', coalesce(got::text, '<null>'));

        begin
            update public.encyclopedia_articles set views = coalesce(views, 0) + 100 where id = pub_id;
            denied := 'allowed';
        exception when insufficient_privilege then
            denied := '42501';
        end;
        results := results || jsonb_build_object('id', 'CNT-08', 'op', 'anon direct UPDATE of an article', 'exp', '42501', 'got', denied);

        perform set_config('role', 'none', true);

        results := results
          || jsonb_build_object('id', 'CNT-02', 'op', 'published fixture: stored count inside the test', 'exp', (pub_initial + 1)::text,
               'got', (select coalesce(views, 0)::text from public.encyclopedia_articles where id = pub_id))
          || jsonb_build_object('id', 'CNT-04', 'op', 'draft fixture: stored count inside the test', 'exp', draft_initial::text,
               'got', (select coalesce(views, 0)::text from public.encyclopedia_articles where id = draft_id));
        select coalesce(sum(coalesce(views, 0)), 0) into got_total from public.encyclopedia_articles;
        results := results || jsonb_build_object('id', 'CNT-07', 'op', 'all counts: only the published fixture changed (+1)', 'exp', (total_initial + 1)::text, 'got', got_total::text);

        raise exception using errcode = 'EMRB7', message = 'roll back the counter test';
    exception when sqlstate 'EMRB7' then null;
    end;

    -- ---------- confirm the rollback ----------
    results := results || jsonb_build_object('id', 'RB-01', 'op', 'after rollback: published / draft / total counts as before',
        'exp', pub_initial || '/' || draft_initial || '/' || total_initial,
        'got', (select coalesce(views, 0) from public.encyclopedia_articles where id = pub_id) || '/'
            || (select coalesce(views, 0) from public.encyclopedia_articles where id = draft_id) || '/'
            || (select coalesce(sum(coalesce(views, 0)), 0) from public.encyclopedia_articles));

    insert into emr_counter (test_id, operation, expected, actual, result)
    select r->>'id', r->>'op', r->>'exp', r->>'got', case when r->>'exp' = r->>'got' then 'PASS' else 'FAIL' end
      from jsonb_array_elements(results) r;
end
$cnt$;

select test_id, operation, expected, actual, result,
       (select count(*) filter (where result = 'PASS') || ' pass / ' || count(*) filter (where result = 'FAIL') || ' fail' from emr_counter) as summary
  from emr_counter order by test_id;

rollback;
