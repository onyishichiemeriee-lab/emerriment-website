-- =====================================================================
-- EMerriment migration 6 — production hardening (after 1–5)
-- ---------------------------------------------------------------------
-- STATUS: APPLIED to production (Supabase SQL Editor); verified 2026-11-15 by audit 02 and 03b (381/381).
-- Based on the live read-only audit of 2026-11-13 (22 tables, 27
-- policies, grants, functions, triggers, storage). Builds on
-- 20261110085900 and 20261110090000…090400, which must be applied first.
--
-- 1. Administrator access can only change through
--    public.emerriment_set_admin() (admin-only, keeps the last admin).
--    Column privileges: API users can no longer write profiles.id or
--    profiles.is_admin at all (belt and braces with the trigger of
--    migration 1).
-- 2. Least-privilege table grants. Supabase grants ALL on every public
--    table to anon and authenticated by default; RLS is the only fence.
--    Here: no TRUNCATE/TRIGGER/REFERENCES for API roles; anonymous
--    visitors keep only what the public website needs (read published
--    content and approved products, insert a quiz lead with the quiz
--    columns only).
-- 3. Public reads that were silently broken (RLS on, no policy):
--      products (approved only) and article_products (published article
--      + approved product). Article ratings stay private; the article
--      page gets the average through emerriment_article_rating_summary().
-- 4. emerriment_increment_article_views() only counts published articles.
-- 5. Trigger / event-trigger functions are not executable through the API.
-- 6. Indexes for the columns the RLS policies filter on.
-- 7. Storage bucket article-images: images only, 5 MB max.
--
-- Non-destructive: no row is deleted or changed. Safe to re-run.
-- Rollback: supabase/rollback/emerriment_security_rollback.sql (part 6).
-- =====================================================================

begin;

do $$
begin
    if to_regprocedure('public.emerriment_is_admin()') is null
       or to_regclass('public.email_deliveries') is null
       or not exists (select 1 from pg_constraint where conrelid = 'public.leads'::regclass and contype = 'p') then
        raise exception 'EMerriment: apply 20261110085900 and 20261110090000…090400 first.';
    end if;
    if not exists (select 1 from public.profiles where is_admin is true) then
        raise exception 'EMerriment: no administrator profile exists; aborting.';
    end if;
end
$$;


-- ---------------------------------------------------------------------
-- 1. Administrator assignment
-- ---------------------------------------------------------------------
create or replace function public.emerriment_set_admin(target_user uuid, make_admin boolean)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
    if not public.emerriment_is_admin() then
        raise exception 'Only an administrator can change administrator access.'
            using errcode = '42501';
    end if;

    if target_user is null or make_admin is null then
        raise exception 'target_user and make_admin are required.' using errcode = '22004';
    end if;

    -- The profiles trigger (migration 1) still refuses to remove the
    -- last administrator.
    update public.profiles
       set is_admin = make_admin
     where id = target_user;

    if not found then
        raise exception 'Profile not found.' using errcode = 'P0002';
    end if;

    return make_admin;
end;
$$;

revoke all on function public.emerriment_set_admin(uuid, boolean) from public, anon, authenticated;
grant execute on function public.emerriment_set_admin(uuid, boolean) to authenticated;


-- ---------------------------------------------------------------------
-- 2. Least-privilege grants
-- ---------------------------------------------------------------------
do $$
declare
    t text;
begin
    -- Never needed through the API; TRUNCATE ignores RLS.
    for t in select c.relname from pg_class c
              where c.relnamespace = 'public'::regnamespace and c.relkind in ('r', 'p')
    loop
        execute format('revoke truncate, trigger, references on public.%I from anon, authenticated', t);
    end loop;

    -- Private / admin-only tables: no anonymous access at all.
    foreach t in array array[
        'profiles', 'quiz_results', 'reading_history', 'saved_articles', 'saved_products',
        'favorite_articles', 'article_ratings', 'ai_conversations', 'ai_messages', 'ai_memory',
        'ai_events', 'ai_feedback', 'ai_questions', 'ai_settings', 'website_settings',
        'product_clicks', 'collections', 'collection_articles', 'email_deliveries'
    ]
    loop
        if to_regclass('public.' || t) is not null then
            execute format('revoke all on public.%I from anon', t);
        end if;
    end loop;

    -- Public content: anonymous visitors may only read.
    foreach t in array array['encyclopedia_articles', 'products', 'article_products']
    loop
        if to_regclass('public.' || t) is not null then
            execute format('revoke insert, update, delete on public.%I from anon', t);
        end if;
    end loop;
end
$$;

-- profiles: API users may write their own descriptive fields only.
revoke insert, update on public.profiles from anon, authenticated;
grant insert (id, full_name, avatar_url, email, current_skin_score, current_skin_type,
              current_concern, last_quiz_date, current_recommendation)
    on public.profiles to authenticated;
grant update (full_name, avatar_url, email, current_skin_score, current_skin_type,
              current_concern, last_quiz_date, current_recommendation)
    on public.profiles to authenticated;

-- leads: visitors insert a quiz submission; they cannot read, change or
-- delete leads (admins read/manage through RLS as authenticated users).
revoke select, insert, update, delete on public.leads from anon;
revoke insert on public.leads from authenticated;
grant insert (name, email, skin_type, concern, oil_level, sensitivity, score, recommendation,
              submitted_at, quiz_version, source, status, email_status, last_email_sent,
              email_sequence_day, last_sequence_email_sent, next_email_due, tags, notes)
    on public.leads to anon, authenticated;


-- ---------------------------------------------------------------------
-- 3. Public reads the website needs
-- ---------------------------------------------------------------------
drop policy if exists emerriment_products_public_read on public.products;
create policy emerriment_products_public_read
    on public.products for select
    to anon, authenticated
    using (is_approved is true);

drop policy if exists emerriment_article_products_public_read on public.article_products;
create policy emerriment_article_products_public_read
    on public.article_products for select
    to anon, authenticated
    using (
        exists (select 1 from public.encyclopedia_articles a
                 where a.id = article_products.article_id and a.status = 'published')
        and exists (select 1 from public.products p
                     where p.id = article_products.product_id and p.is_approved is true)
    );

-- Average rating for a published article (no reader identities).
create or replace function public.emerriment_article_rating_summary(target_article uuid)
returns table (average numeric, total integer)
language sql
stable
security definer
set search_path = ''
as $$
    select round(avg(r.rating)::numeric, 2), count(*)::integer
      from public.article_ratings r
      join public.encyclopedia_articles a on a.id = r.article_id
     where r.article_id = target_article
       and a.status = 'published'
       and r.rating between 1 and 5;
$$;

revoke all on function public.emerriment_article_rating_summary(uuid) from public, anon, authenticated;
grant execute on function public.emerriment_article_rating_summary(uuid) to anon, authenticated;


-- ---------------------------------------------------------------------
-- 3b. AI messages belong to a conversation the sender owns.
--     Migration 3 checks ai_messages.user_id only, so without this a
--     user could add a message (with their own user_id) to someone
--     else's conversation, and it would appear in that person's chat.
-- ---------------------------------------------------------------------
drop policy if exists emerriment_ai_messages_restrict_conversation_insert on public.ai_messages;
create policy emerriment_ai_messages_restrict_conversation_insert
    on public.ai_messages as restrictive for insert
    to anon, authenticated
    with check (
        conversation_id is null
        or exists (select 1 from public.ai_conversations c
                    where c.id = ai_messages.conversation_id
                      and c.user_id = (select auth.uid()))
        or (select public.emerriment_is_admin())
    );

drop policy if exists emerriment_ai_messages_restrict_conversation_update on public.ai_messages;
create policy emerriment_ai_messages_restrict_conversation_update
    on public.ai_messages as restrictive for update
    to anon, authenticated
    using (true)
    with check (
        conversation_id is null
        or exists (select 1 from public.ai_conversations c
                    where c.id = ai_messages.conversation_id
                      and c.user_id = (select auth.uid()))
        or (select public.emerriment_is_admin())
    );


-- ---------------------------------------------------------------------
-- 4. View counter: published articles only
-- ---------------------------------------------------------------------
create or replace function public.emerriment_increment_article_views(article_id uuid)
returns integer
language sql
volatile
security definer
set search_path = ''
as $$
    update public.encyclopedia_articles
       set views = coalesce(views, 0) + 1
     where id = $1
       and status = 'published'
    returning views::integer;
$$;

revoke all on function public.emerriment_increment_article_views(uuid) from public, anon, authenticated;
grant execute on function public.emerriment_increment_article_views(uuid) to anon, authenticated;


-- ---------------------------------------------------------------------
-- 5. Functions that must not be callable through the API
--    (Supabase's default privileges grant EXECUTE to anon/authenticated.)
-- ---------------------------------------------------------------------
do $$
declare
    f text;
begin
    foreach f in array array[
        'public.handle_new_user()',
        'public.rls_auto_enable()',
        'public.emerriment_guard_profile_privileges()',
        'public.emerriment_guard_lead_insert()'
    ]
    loop
        if to_regprocedure(f) is not null then
            execute format('revoke all on function %s from public, anon, authenticated', f);
        end if;
    end loop;
end
$$;


-- ---------------------------------------------------------------------
-- 6. Indexes for RLS filters and ownership look-ups
-- ---------------------------------------------------------------------
create index if not exists emerriment_profiles_admin_idx        on public.profiles (id) where is_admin;
create index if not exists emerriment_ai_conversations_user_idx  on public.ai_conversations (user_id);
create index if not exists emerriment_ai_messages_user_idx       on public.ai_messages (user_id);
create index if not exists emerriment_ai_messages_conv_idx       on public.ai_messages (conversation_id);
create index if not exists emerriment_ai_feedback_conv_idx       on public.ai_feedback (conversation_id);
create index if not exists emerriment_quiz_results_user_idx     on public.quiz_results (user_id);
create index if not exists emerriment_favorite_articles_user_idx on public.favorite_articles (user_id);
create index if not exists emerriment_saved_products_user_idx    on public.saved_products (user_id);
create index if not exists emerriment_collections_user_idx       on public.collections (user_id);
create index if not exists emerriment_article_products_art_idx   on public.article_products (article_id);
create index if not exists emerriment_article_ratings_art_idx    on public.article_ratings (article_id);
create index if not exists emerriment_articles_status_idx        on public.encyclopedia_articles (status);


-- ---------------------------------------------------------------------
-- 7. Storage: article images only, at most 5 MB each
-- ---------------------------------------------------------------------
do $$
begin
    if to_regclass('storage.buckets') is not null then
        begin
            update storage.buckets
               set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
                   file_size_limit = 5242880
             where id = 'article-images';
        exception when undefined_column or insufficient_privilege then
            raise notice 'EMerriment: storage bucket limits not applied (%); set them in Storage settings.', sqlerrm;
        end;
    end if;
end
$$;

notify pgrst, 'reload schema';

commit;
