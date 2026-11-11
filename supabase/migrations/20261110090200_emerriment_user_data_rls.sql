-- =====================================================================
-- EMerriment security migration 3/5 — profiles and per-user data
-- ---------------------------------------------------------------------
-- STATUS: PREPARED, NOT APPLIED. Requires migration 1 (is_admin).
--
-- Goal
--   A signed-in user can only see and change their OWN rows; an
--   administrator can see (and manage) everyone's, as the CMS does today.
--   Anonymous visitors cannot read personal data.
--
-- Tables (ownership column found in the repository code):
--   profiles            id = auth.uid()
--   quiz_results        user_id
--   reading_history     user_id
--   saved_articles      user_id
--   saved_products      user_id
--   favorite_articles   user_id
--   ai_conversations    user_id
--   ai_memory           user_id
--   ai_messages         user_id, or via ai_conversations.conversation_id
--   article_ratings     user_id — ratings stay PUBLICLY READABLE because
--                       article pages show the average rating; only
--                       writing is limited to the owner.
--
-- Approach: restrictive policies (AND-combined with any existing
-- policies, nothing dropped) + permissive policies for intended access.
-- A table or column that does not exist is skipped with a NOTICE rather
-- than failing — check the NOTICE output.
--
-- PENDING VERIFICATION against the audit output: the ownership columns
-- above, and that no page needs to read another user's rows.
--
-- Rollback: supabase/rollback/emerriment_security_rollback.sql
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists emerriment_profiles_restrict_select on public.profiles;
create policy emerriment_profiles_restrict_select
    on public.profiles as restrictive for select
    to anon, authenticated
    using (id = (select auth.uid()) or (select public.emerriment_is_admin()));

drop policy if exists emerriment_profiles_restrict_insert on public.profiles;
create policy emerriment_profiles_restrict_insert
    on public.profiles as restrictive for insert
    to anon, authenticated
    with check (id = (select auth.uid()) or (select public.emerriment_is_admin()));

drop policy if exists emerriment_profiles_restrict_update on public.profiles;
create policy emerriment_profiles_restrict_update
    on public.profiles as restrictive for update
    to anon, authenticated
    using (id = (select auth.uid()) or (select public.emerriment_is_admin()))
    with check (id = (select auth.uid()) or (select public.emerriment_is_admin()));

drop policy if exists emerriment_profiles_restrict_delete on public.profiles;
create policy emerriment_profiles_restrict_delete
    on public.profiles as restrictive for delete
    to anon, authenticated
    using ((select public.emerriment_is_admin()));

drop policy if exists emerriment_profiles_own_select on public.profiles;
create policy emerriment_profiles_own_select
    on public.profiles for select
    to authenticated
    using (id = (select auth.uid()) or (select public.emerriment_is_admin()));

-- admin/auth.js creates the profile row with upsert({ id, full_name }).
drop policy if exists emerriment_profiles_own_insert on public.profiles;
create policy emerriment_profiles_own_insert
    on public.profiles for insert
    to authenticated
    with check (id = (select auth.uid()));

-- is_admin changes are additionally blocked by the trigger from migration 1.
drop policy if exists emerriment_profiles_own_update on public.profiles;
create policy emerriment_profiles_own_update
    on public.profiles for update
    to authenticated
    using (id = (select auth.uid()) or (select public.emerriment_is_admin()))
    with check (id = (select auth.uid()) or (select public.emerriment_is_admin()));


-- ---------------------------------------------------------------------
-- Per-user tables keyed by user_id
-- ---------------------------------------------------------------------
do $$
declare
    t text;
    owner_expr text := '(user_id = (select auth.uid()) or (select public.emerriment_is_admin()))';
    public_read text[] := array['article_ratings'];
begin
    foreach t in array array[
        'quiz_results', 'reading_history', 'saved_articles', 'saved_products',
        'favorite_articles', 'ai_conversations', 'ai_memory', 'article_ratings'
    ]
    loop
        if to_regclass('public.' || t) is null then
            raise notice 'EMerriment: table % not found; skipped.', t;
            continue;
        end if;

        if not exists (select 1 from information_schema.columns
                       where table_schema = 'public' and table_name = t and column_name = 'user_id') then
            raise notice 'EMerriment: %.user_id not found; skipped — needs a manual policy.', t;
            continue;
        end if;

        execute format('alter table public.%I enable row level security', t);

        -- Restrictive boundary
        if not (t = any (public_read)) then
            execute format('drop policy if exists %I on public.%I', 'emerriment_' || t || '_restrict_select', t);
            execute format('create policy %I on public.%I as restrictive for select to anon, authenticated using %s',
                           'emerriment_' || t || '_restrict_select', t, owner_expr);
        end if;

        execute format('drop policy if exists %I on public.%I', 'emerriment_' || t || '_restrict_insert', t);
        execute format('create policy %I on public.%I as restrictive for insert to anon, authenticated with check %s',
                       'emerriment_' || t || '_restrict_insert', t, owner_expr);

        execute format('drop policy if exists %I on public.%I', 'emerriment_' || t || '_restrict_update', t);
        execute format('create policy %I on public.%I as restrictive for update to anon, authenticated using %s with check %s',
                       'emerriment_' || t || '_restrict_update', t, owner_expr, owner_expr);

        execute format('drop policy if exists %I on public.%I', 'emerriment_' || t || '_restrict_delete', t);
        execute format('create policy %I on public.%I as restrictive for delete to anon, authenticated using %s',
                       'emerriment_' || t || '_restrict_delete', t, owner_expr);

        -- Permissive intended access (signed-in owner, or admin)
        execute format('drop policy if exists %I on public.%I', 'emerriment_' || t || '_owner_all', t);
        execute format('create policy %I on public.%I for all to authenticated using %s with check %s',
                       'emerriment_' || t || '_owner_all', t, owner_expr, owner_expr);

        if t = any (public_read) then
            execute format('drop policy if exists %I on public.%I', 'emerriment_' || t || '_public_select', t);
            execute format('create policy %I on public.%I for select to anon, authenticated using (true)',
                           'emerriment_' || t || '_public_select', t);
        end if;

        raise notice 'EMerriment: owner policies applied to %.', t;
    end loop;
end
$$;


-- ---------------------------------------------------------------------
-- ai_messages: own rows by user_id if present, otherwise through the
-- owning conversation.
-- ---------------------------------------------------------------------
do $$
declare
    expr text;
begin
    if to_regclass('public.ai_messages') is null then
        raise notice 'EMerriment: table ai_messages not found; skipped.';
        return;
    end if;

    if exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'ai_messages' and column_name = 'user_id') then
        expr := '(user_id = (select auth.uid()) or (select public.emerriment_is_admin()))';
    elsif exists (select 1 from information_schema.columns
                  where table_schema = 'public' and table_name = 'ai_messages' and column_name = 'conversation_id')
          and to_regclass('public.ai_conversations') is not null then
        expr := '(exists (select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())) or (select public.emerriment_is_admin()))';
    else
        raise notice 'EMerriment: ai_messages has no user_id or conversation_id; skipped — needs a manual policy.';
        return;
    end if;

    alter table public.ai_messages enable row level security;

    drop policy if exists emerriment_ai_messages_restrict_select on public.ai_messages;
    execute format('create policy emerriment_ai_messages_restrict_select on public.ai_messages as restrictive for select to anon, authenticated using %s', expr);
    drop policy if exists emerriment_ai_messages_restrict_insert on public.ai_messages;
    execute format('create policy emerriment_ai_messages_restrict_insert on public.ai_messages as restrictive for insert to anon, authenticated with check %s', expr);
    drop policy if exists emerriment_ai_messages_restrict_update on public.ai_messages;
    execute format('create policy emerriment_ai_messages_restrict_update on public.ai_messages as restrictive for update to anon, authenticated using %s with check %s', expr, expr);
    drop policy if exists emerriment_ai_messages_restrict_delete on public.ai_messages;
    execute format('create policy emerriment_ai_messages_restrict_delete on public.ai_messages as restrictive for delete to anon, authenticated using %s', expr);
    drop policy if exists emerriment_ai_messages_owner_all on public.ai_messages;
    execute format('create policy emerriment_ai_messages_owner_all on public.ai_messages for all to authenticated using %s with check %s', expr, expr);

    raise notice 'EMerriment: owner policies applied to ai_messages.';
end
$$;

commit;
