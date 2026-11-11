-- =====================================================================
-- EMerriment security migration 4/5 — content and admin-only tables
-- ---------------------------------------------------------------------
-- STATUS: PREPARED, NOT APPLIED. Requires migration 1 (is_admin).
--
-- Content tables (public website reads them):
--   encyclopedia_articles, products, collections, collection_articles,
--   article_products
--   -> Reading is NOT changed by this migration (existing read policies
--      stay exactly as they are, so drafts are not accidentally exposed).
--   -> Writing (insert/update/delete) is limited to administrators.
--      The public article page previously incremented `views` with a
--      direct update, which required visitors to have UPDATE permission
--      on articles (i.e. could rewrite article content). It now calls
--      public.emerriment_increment_article_views(), defined below, instead.
--
-- Admin-only tables (only the CMS uses them):
--   website_settings, ai_settings, ai_feedback, ai_events, ai_questions,
--   product_clicks
--   -> Only administrators (and the service role used by Netlify
--      functions) can read or write them.
--
-- PENDING VERIFICATION against the audit output:
--   * No public page reads website_settings / ai_settings (none found in
--     the repository).
--   * No browser code inserts into ai_feedback / ai_events / ai_questions
--     (none found in the repository).
--   * encyclopedia_articles.id type (handled automatically) and that a
--     `views` column exists.
--
-- Rollback: supabase/rollback/emerriment_security_rollback.sql
-- =====================================================================

begin;

do $$
begin
    if to_regprocedure('public.emerriment_is_admin()') is null
       or to_regprocedure('emerriment_private.enable_rls(regclass)') is null then
        raise exception 'EMerriment: apply migration 20261110090000 first.';
    end if;
end
$$;

do $$
declare
    t text;
    admin_expr text := '((select public.emerriment_is_admin()))';
begin
    -- Content: admin-only writes; reads untouched.
    foreach t in array array[
        'encyclopedia_articles', 'products', 'collections',
        'collection_articles', 'article_products'
    ]
    loop
        if to_regclass('public.' || t) is null then
            raise notice 'EMerriment: table % not found; skipped.', t;
            continue;
        end if;

        perform emerriment_private.enable_rls(format('public.%I', t)::regclass);

        -- If RLS was OFF before, the public could read everything; switching
        -- it on must not hide articles/products from the website. Keep that
        -- read access exactly. (If RLS was already on, the existing read
        -- policies are left as they are.)
        if not emerriment_private.rls_was_enabled(format('public.%I', t)::regclass) then
            execute format('drop policy if exists %I on public.%I', 'emerriment_' || t || '_keep_open_read', t);
            execute format('create policy %I on public.%I for select to anon, authenticated using (true)',
                           'emerriment_' || t || '_keep_open_read', t);
            raise notice 'EMerriment: % had RLS off; its open read access is preserved.', t;
        end if;

        execute format('drop policy if exists %I on public.%I', 'emerriment_' || t || '_restrict_insert', t);
        execute format('create policy %I on public.%I as restrictive for insert to anon, authenticated with check %s',
                       'emerriment_' || t || '_restrict_insert', t, admin_expr);

        execute format('drop policy if exists %I on public.%I', 'emerriment_' || t || '_restrict_update', t);
        execute format('create policy %I on public.%I as restrictive for update to anon, authenticated using %s with check %s',
                       'emerriment_' || t || '_restrict_update', t, admin_expr, admin_expr);

        execute format('drop policy if exists %I on public.%I', 'emerriment_' || t || '_restrict_delete', t);
        execute format('create policy %I on public.%I as restrictive for delete to anon, authenticated using %s',
                       'emerriment_' || t || '_restrict_delete', t, admin_expr);

        -- Admins manage content (insert/update/delete). FOR ALL also
        -- covers select for admins, which is harmless.
        execute format('drop policy if exists %I on public.%I', 'emerriment_' || t || '_admin_all', t);
        execute format('create policy %I on public.%I for all to authenticated using %s with check %s',
                       'emerriment_' || t || '_admin_all', t, admin_expr, admin_expr);

        raise notice 'EMerriment: admin-only writes applied to %.', t;
    end loop;

    -- Admin-only tables: no public access at all.
    foreach t in array array[
        'website_settings', 'ai_settings', 'ai_feedback', 'ai_events',
        'ai_questions', 'product_clicks'
    ]
    loop
        if to_regclass('public.' || t) is null then
            raise notice 'EMerriment: table % not found; skipped.', t;
            continue;
        end if;

        perform emerriment_private.enable_rls(format('public.%I', t)::regclass);

        execute format('drop policy if exists %I on public.%I', 'emerriment_' || t || '_restrict_all', t);
        execute format('create policy %I on public.%I as restrictive for all to anon, authenticated using %s with check %s',
                       'emerriment_' || t || '_restrict_all', t, admin_expr, admin_expr);

        execute format('drop policy if exists %I on public.%I', 'emerriment_' || t || '_admin_all', t);
        execute format('create policy %I on public.%I for all to authenticated using %s with check %s',
                       'emerriment_' || t || '_admin_all', t, admin_expr, admin_expr);

        raise notice 'EMerriment: admin-only access applied to %.', t;
    end loop;
end
$$;


-- ---------------------------------------------------------------------
-- emerriment_increment_article_views(article_id)
-- The only change visitors may make to an article: +1 view.
-- Created with the same type as encyclopedia_articles.id.
-- ---------------------------------------------------------------------
do $$
declare
    id_type text;
begin
    select format_type(a.atttypid, a.atttypmod)
      into id_type
      from pg_attribute a
     where a.attrelid = 'public.encyclopedia_articles'::regclass
       and a.attname = 'id'
       and not a.attisdropped;

    if id_type is null then
        raise notice 'EMerriment: encyclopedia_articles.id not found; emerriment_increment_article_views not created.';
        return;
    end if;

    if not exists (select 1 from information_schema.columns
                   where table_schema = 'public' and table_name = 'encyclopedia_articles'
                     and column_name = 'views') then
        raise notice 'EMerriment: encyclopedia_articles.views not found; emerriment_increment_article_views not created.';
        return;
    end if;

    execute format($f$
        create or replace function public.emerriment_increment_article_views(article_id %s)
        returns integer
        language sql
        volatile
        security definer
        set search_path = ''
        as $body$
            update public.encyclopedia_articles
               set views = coalesce(views, 0) + 1
             where id = $1
            returning views::integer;
        $body$
    $f$, id_type);

    execute format('revoke all on function public.emerriment_increment_article_views(%s) from public', id_type);
    execute format('grant execute on function public.emerriment_increment_article_views(%s) to anon, authenticated', id_type);

    raise notice 'EMerriment: emerriment_increment_article_views(%) created.', id_type;
end
$$;

-- Make the new function visible to the website API immediately.
notify pgrst, 'reload schema';

commit;
