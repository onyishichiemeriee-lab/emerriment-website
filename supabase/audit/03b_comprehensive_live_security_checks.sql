-- =====================================================================
-- EMerriment — comprehensive live security checks (03b)
-- ---------------------------------------------------------------------
-- Run AFTER all seven migrations, in the Supabase SQL Editor, as ONE run
-- (paste the whole file, press Run). Read-only in effect: see "Safety".
--
-- Actors (real identities, nothing created in auth):
--   anon      role anon,           claims {"role":"anon"}
--   user A    role authenticated,  claims {"role":"authenticated","sub":<A>}
--   user B    role authenticated,  claims {"role":"authenticated","sub":<B>}
--   admin     role authenticated,  claims {"role":"authenticated","sub":<admin>}
--   service   role service_role,   claims {"role":"service_role"}
-- A and B are the first two NON-admin profiles (ordered by created_at, id);
-- admin is the first is_admin profile. This is how PostgREST runs every
-- API request (SET ROLE + request.jwt.claims), so auth.uid() and the
-- policies see exactly what a real request would. ID-* tests confirm it.
-- The service rows test the service_role DATABASE ROLE only — they do not
-- prove that the Netlify functions or their credentials work.
--
-- Safety
--   * Everything the tests do happens inside one PL/pgSQL block that always
--     ends with a deliberate error (SQLSTATE EMRB9) and catches it, so
--     PostgreSQL discards every fixture and every test write. In addition,
--     each test runs in its own sub-transaction that is always rolled back.
--   * The script then re-reads every table (row count + md5 of all rows),
--     the administrator set, auth.users and storage bucket settings and
--     compares them with the values read before the tests (RB-* rows).
--   * Fixtures are new rows with fresh ids (articles, products, links,
--     ratings, AI rows, one lead) — existing content is never a target of
--     a write test.
--   * Never touched: auth accounts, storage objects/buckets, email sending.
--   * Non-transactional side effects (cannot be rolled back, harmless):
--     the leads id sequence advances by up to ~5 values (gaps in lead ids);
--     table statistics counters; the session-scoped temp table
--     emr_sec_results, which disappears when the editor session ends.
--   * Output contains test names, roles, counts and SQLSTATEs only — no
--     ids, names or email addresses.
--
-- Result classification
--   PASS  only for the exact expected outcome: a visible-row count, a value,
--         "affected 0 rows" for an UPDATE/DELETE that RLS filters (never for
--         INSERT, TRUNCATE or function calls — a TRUNCATE that succeeds also
--         reports 0 rows, so those require SQLSTATE 42501), SQLSTATE 42501
--         (permission denied / RLS violation), or an intentional guard's
--         exact SQLSTATE + message. Any other error (missing table, column
--         or function, constraint error, syntax error, ...) is a FAIL that
--         shows its SQLSTATE and is counted as an unexpected error.
--   SKIP  only for optional checks (service_role switch not permitted in
--         this SQL session; backup schema absent).
-- =====================================================================

begin;

drop table if exists pg_temp.emr_sec_results;
create temp table emr_sec_results (
    seq int, test_id text, category text, actor text, target text, operation text,
    expected text, actual text, sqlstate text, result text
);
alter table pg_temp.emr_sec_results enable row level security;

do $main$
declare
    admin_id uuid; a_id uuid; b_id uuid;
    x uuid; y uuid; xn text; yn text; dir int;
    tests text[] := '{}';
    res text[] := '{}';
    i int; k bigint;
    v_id text; v_cat text; v_actor text; v_target text; v_op text; v_kind text; v_exp text; v_sql text;
    v_role text; v_claims text; v_uid uuid;
    st text; msg text; got text; stage text; actual text; verdict text;
    tbl text; tpl text; own_exp text; own_ins text;
    fp_before text[] := '{}'; fp_after text[] := '{}';
    admins_before text; admins_after text; users_before text; users_after text;
    buckets_before text; buckets_after text; seq_before text; seq_after text;
    lead_total bigint; conv_total bigint;
    all_tables text[];
    owner_tables text[] := array['quiz_results', 'reading_history', 'saved_articles', 'saved_products',
        'favorite_articles', 'article_ratings', 'ai_conversations', 'ai_messages', 'ai_memory', 'collections'];
    -- fixtures (fresh ids; rolled back)
    f_pub uuid := gen_random_uuid(); f_draft uuid := gen_random_uuid();
    f_prod_ok uuid := gen_random_uuid(); f_prod_no uuid := gen_random_uuid();
    f_link_ok uuid := gen_random_uuid(); f_link_no1 uuid := gen_random_uuid(); f_link_no2 uuid := gen_random_uuid();
    f_event uuid := gen_random_uuid(); f_feedback uuid := gen_random_uuid();
    f_question uuid := gen_random_uuid(); f_setting uuid := gen_random_uuid();
    f_lead bigint;
    fa jsonb := '{}'; fb jsonb := '{}';
    rx jsonb; ry jsonb;
begin
    select array_agg(c.relname::text order by c.relname) into all_tables
      from pg_class c where c.relnamespace = 'public'::regnamespace and c.relkind = 'r';

    select id into admin_id from public.profiles where is_admin is true order by created_at, id limit 1;
    select id into a_id from public.profiles where coalesce(is_admin, false) = false order by created_at, id limit 1;
    select id into b_id from public.profiles where coalesce(is_admin, false) = false and id <> a_id order by created_at, id limit 1;

    res := res || array['SETUP-01', 'setup', 'db owner', 'profiles', 'find user A and user B (non-admin)', 'found', case when a_id is not null and b_id is not null then 'found' else 'missing' end, '', case when a_id is not null and b_id is not null then 'PASS' else 'FAIL' end];
    res := res || array['SETUP-02', 'setup', 'db owner', 'profiles', 'find the administrator', 'found', case when admin_id is not null then 'found' else 'missing' end, '', case when admin_id is not null then 'PASS' else 'FAIL' end];

    -- ---------- fingerprints BEFORE ----------
    foreach tbl in array all_tables loop
        execute format('select count(*)::text || '':'' || coalesce(md5(string_agg(t::text, ''|'' order by t::text)), ''-'') from public.%I t', tbl) into got;
        fp_before := fp_before || got;
    end loop;
    select string_agg(id::text, ',' order by id) into admins_before from public.profiles where is_admin is true;
    select count(*)::text || ':' || coalesce(md5(string_agg(id::text, ',' order by id)), '-') into users_before from auth.users;
    select md5(coalesce(string_agg(b::text, '|' order by b.id), '')) into buckets_before from storage.buckets b;
    select coalesce(max(id), 0)::text into seq_before from public.leads;

    if a_id is not null and b_id is not null and admin_id is not null then
    begin  -- ===== everything below is always rolled back (EMRB9) =====

        -- ---------- fixtures (as db owner) ----------
        insert into public.encyclopedia_articles (id, title, slug, status, content, views)
        values (f_pub, 'RLS check published', 'emr-rls-check-' || f_pub, 'published', 'fixture', 0),
               (f_draft, 'RLS check draft', 'emr-rls-check-' || f_draft, 'draft', 'fixture', 0);
        insert into public.products (id, name, is_approved) values (f_prod_ok, 'RLS check approved', true), (f_prod_no, 'RLS check unapproved', false);
        insert into public.article_products (id, article_id, product_id) values
            (f_link_ok, f_pub, f_prod_ok), (f_link_no1, f_pub, f_prod_no), (f_link_no2, f_draft, f_prod_ok);

        for dir in 1 .. 2 loop
            x := case dir when 1 then a_id else b_id end;
            rx := jsonb_build_object(
                'quiz_results', gen_random_uuid(), 'reading_history', gen_random_uuid(), 'saved_articles', gen_random_uuid(),
                'saved_products', gen_random_uuid(), 'favorite_articles', gen_random_uuid(), 'article_ratings', gen_random_uuid(),
                'ai_conversations', gen_random_uuid(), 'ai_messages', gen_random_uuid(), 'ai_memory', gen_random_uuid(),
                'collections', gen_random_uuid());
            insert into public.quiz_results (id, user_id, score) values ((rx->>'quiz_results')::uuid, x, 1);
            insert into public.reading_history (id, user_id, article_id) values ((rx->>'reading_history')::uuid, x, f_pub);
            insert into public.saved_articles (id, user_id, article_id) values ((rx->>'saved_articles')::uuid, x, f_pub);
            insert into public.saved_products (id, user_id, product_id) values ((rx->>'saved_products')::uuid, x, f_prod_ok);
            insert into public.favorite_articles (id, user_id, article_id) values ((rx->>'favorite_articles')::uuid, x, f_pub);
            insert into public.article_ratings (id, user_id, article_id, rating, feedback)
                values ((rx->>'article_ratings')::uuid, x, f_pub, case dir when 1 then 4 else 2 end, 'fixture');
            insert into public.ai_conversations (id, user_id, title) values ((rx->>'ai_conversations')::uuid, x, 'RLS check');
            insert into public.ai_messages (id, conversation_id, user_id, role, content)
                values ((rx->>'ai_messages')::uuid, (rx->>'ai_conversations')::uuid, x, 'user', 'fixture');
            insert into public.ai_memory (id, user_id, memory_key, memory_value)
                values ((rx->>'ai_memory')::uuid, x, 'emr_rls_check_fixture', 'fixture');
            insert into public.collections (id, user_id, name) values ((rx->>'collections')::uuid, x, 'RLS check');
            if dir = 1 then fa := rx; else fb := rx; end if;
        end loop;

        insert into public.ai_events (id) values (f_event);
        insert into public.ai_feedback (id, conversation_id, rating) values (f_feedback, (fa->>'ai_conversations')::uuid, 5);
        insert into public.ai_questions (id, question) values (f_question, 'RLS check');
        insert into public.ai_settings (id, setting_key, setting_value) values (f_setting, 'emr_rls_check_' || f_setting, 'x');
        insert into public.leads (name, email, email_status, status) values ('RLS fixture', 'rls-fixture@example.invalid', 'Pending', 'New Lead')
            returning id into f_lead;

        select count(*) into lead_total from public.leads;
        select count(*) into conv_total from public.ai_conversations;

        -- ---------- test definitions: id, category, actor, target, operation, kind, expected, sql ----------

        -- Identity
        tests := tests
          || array['ID-01', 'identity', 'anon', 'auth.uid()', 'resolves to no user', 'eq', 'true', 'select (auth.uid() is null)::text']
          || array['ID-02', 'identity', 'anon', 'current_user', 'database role is anon', 'eq', 'anon', 'select current_user::text']
          || array['ID-03', 'identity', 'user A', 'auth.uid()', 'resolves to user A', 'eq', 'true', format('select (auth.uid() = %L::uuid)::text', a_id)]
          || array['ID-04', 'identity', 'user A', 'current_user', 'database role is authenticated', 'eq', 'authenticated', 'select current_user::text']
          || array['ID-05', 'identity', 'user B', 'auth.uid()', 'resolves to user B', 'eq', 'true', format('select (auth.uid() = %L::uuid)::text', b_id)]
          || array['ID-06', 'identity', 'admin', 'auth.uid()', 'resolves to the administrator', 'eq', 'true', format('select (auth.uid() = %L::uuid)::text', admin_id)]
          || array['ID-07', 'identity', 'admin', 'emerriment_is_admin()', 'admin check', 'eq', 'true', 'select public.emerriment_is_admin()::text']
          || array['ID-08', 'identity', 'user A', 'emerriment_is_admin()', 'admin check', 'eq', 'false', 'select public.emerriment_is_admin()::text']
          || array['ID-09', 'identity', 'anon', 'emerriment_is_admin()', 'admin check', 'eq', 'false', 'select public.emerriment_is_admin()::text']
          || array['ID-10', 'identity', 'service', 'current_user', 'database role is service_role', 'eq', 'service_role', 'select current_user::text'];

        -- Cross-user isolation (both directions)
        for dir in 1 .. 2 loop
            x := case dir when 1 then a_id else b_id end;  y := case dir when 1 then b_id else a_id end;
            xn := case dir when 1 then 'user A' else 'user B' end;  yn := case dir when 1 then 'user B' else 'user A' end;
            rx := case dir when 1 then fa else fb end;  ry := case dir when 1 then fb else fa end;

            foreach tbl in array owner_tables loop
                own_exp := case tbl when 'collections' then '0' else '1' end;
                tpl := case tbl
                    when 'quiz_results'      then 'insert into public.quiz_results (user_id, score) values (%1$L, 1)'
                    when 'reading_history'   then 'insert into public.reading_history (user_id, article_id) values (%1$L, %3$L)'
                    when 'saved_articles'    then 'insert into public.saved_articles (user_id, article_id) values (%1$L, %3$L)'
                    when 'saved_products'    then 'insert into public.saved_products (user_id, product_id) values (%1$L, %4$L)'
                    when 'favorite_articles' then 'insert into public.favorite_articles (user_id, article_id) values (%1$L, %3$L)'
                    when 'article_ratings'   then 'insert into public.article_ratings (user_id, article_id, rating) values (%1$L, %3$L, 5)'
                    when 'ai_conversations'  then 'insert into public.ai_conversations (user_id, title) values (%1$L, ''RLS check'')'
                    when 'ai_messages'       then 'insert into public.ai_messages (conversation_id, user_id, role, content) values (%2$L, %1$L, ''user'', ''RLS check'')'
                    when 'ai_memory'         then 'insert into public.ai_memory (user_id, memory_key, memory_value) values (%1$L, ''emr_rls_check_new'', ''x'')'
                    when 'collections'       then 'insert into public.collections (user_id, name) values (%1$L, ''RLS check'')'
                end;

                tests := tests
                  || array[format('ISO-%s-%s-1', tbl, dir), 'cross-user', xn, 'own ' || tbl || ' fixture', 'SELECT own row (positive control)',
                           'count', own_exp, format('select 1 from public.%I where id = %L', tbl, rx->>tbl)]
                  || array[format('ISO-%s-%s-2', tbl, dir), 'cross-user', xn, yn || ' ' || tbl || ' fixture', 'SELECT',
                           'none', '0 rows or 42501', format('select 1 from public.%I where id = %L', tbl, ry->>tbl)]
                  || array[format('ISO-%s-%s-3', tbl, dir), 'cross-user', xn, 'all other users'' ' || tbl || ' (existing data)', 'SELECT',
                           'none', '0 rows or 42501', format('select 1 from public.%I where user_id is distinct from %L', tbl, x)]
                  || array[format('ISO-%s-%s-4', tbl, dir), 'cross-user', xn, yn || ' ' || tbl || ' fixture', 'UPDATE',
                           'denied', '0 rows or 42501', format('update public.%I set user_id = user_id where id = %L', tbl, ry->>tbl)]
                  || array[format('ISO-%s-%s-5', tbl, dir), 'cross-user', xn, yn || ' ' || tbl || ' fixture', 'DELETE',
                           'denied', '0 rows or 42501', format('delete from public.%I where id = %L', tbl, ry->>tbl)]
                  || array[format('ISO-%s-%s-6', tbl, dir), 'cross-user', xn, tbl, 'INSERT with forged user_id = ' || yn,
                           'refused', '42501', format(tpl, y, ry->>'ai_conversations', f_draft, f_prod_ok)]
                  || array[format('ISO-%s-%s-7', tbl, dir), 'cross-user', xn, 'own ' || tbl || ' fixture', 'UPDATE ownership to ' || yn,
                           'denied', '0 rows or 42501', format('update public.%I set user_id = %L where id = %L', tbl, y, rx->>tbl)]
                  || array[format('ISO-%s-%s-8', tbl, dir), 'cross-user', xn, tbl, 'INSERT own row (positive control)',
                           case tbl when 'collections' then 'refused' else 'allowed' end,
                           case tbl when 'collections' then '42501 (admin-only table)' else '1 row' end,
                           format(tpl, x, rx->>'ai_conversations', f_draft, f_prod_ok)];
            end loop;

            tests := tests
              || array[format('ISO-profiles-%s-1', dir), 'cross-user', xn, yn || ' profile', 'SELECT', 'none', '0 rows or 42501',
                       format('select 1 from public.profiles where id = %L', y)]
              || array[format('ISO-profiles-%s-2', dir), 'cross-user', xn, yn || ' profile', 'UPDATE full_name', 'denied', '0 rows or 42501',
                       format('update public.profiles set full_name = full_name where id = %L', y)]
              || array[format('ISO-profiles-%s-3', dir), 'cross-user', xn, yn || ' profile', 'DELETE', 'denied', '0 rows or 42501',
                       format('delete from public.profiles where id = %L', y)]
              || array[format('ISO-profiles-%s-4', dir), 'cross-user', xn, 'profiles', 'INSERT profile with id = ' || yn, 'refused', '42501',
                       format('insert into public.profiles (id, full_name) values (%L, ''x'')', y)]
              || array[format('ISO-profiles-%s-5', dir), 'cross-user', xn, 'own profile', 'UPDATE full_name (positive control)', 'allowed', '1 row',
                       format('update public.profiles set full_name = full_name where id = %L', x)]
              || array[format('ISO-profiles-%s-6', dir), 'cross-user', xn, 'all other profiles (existing data)', 'SELECT', 'none', '0 rows or 42501',
                       format('select 1 from public.profiles where id <> %L', x)]
              || array[format('AI-inject-%s', dir), 'ai', xn, yn || ' conversation', 'INSERT message (own user_id) into it', 'refused', '42501',
                       format('insert into public.ai_messages (conversation_id, user_id, role, content) values (%L, %L, ''user'', ''injected'')', ry->>'ai_conversations', x)]
              || array[format('AI-move-%s', dir), 'ai', xn, 'own message', 'UPDATE conversation_id to ' || yn || ' conversation', 'refused', '42501',
                       format('update public.ai_messages set conversation_id = %L where id = %L', ry->>'ai_conversations', rx->>'ai_messages')]
              || array[format('AI-memory-%s', dir), 'ai', xn, yn || ' ai_memory fixture', 'UPDATE memory_value', 'denied', '0 rows or 42501',
                       format('update public.ai_memory set memory_value = ''tampered'' where id = %L', ry->>'ai_memory')]
              || array[format('AI-msgedit-%s', dir), 'ai', xn, yn || ' ai_messages fixture', 'UPDATE content', 'denied', '0 rows or 42501',
                       format('update public.ai_messages set content = ''tampered'' where id = %L', ry->>'ai_messages')];

            -- Administrator privilege protection (ordinary user)
            tests := tests
              || array[format('ADM-%s-1', dir), 'admin protection', xn, 'own profile', 'UPDATE is_admin = true', 'refused', '42501',
                       format('update public.profiles set is_admin = true where id = %L', x)]
              || array[format('ADM-%s-2', dir), 'admin protection', xn, 'self', 'emerriment_set_admin(self, true)', 'guard', '42501|Only an administrator',
                       format('select public.emerriment_set_admin(%L, true)', x)]
              || array[format('ADM-%s-3', dir), 'admin protection', xn, yn, 'emerriment_set_admin(other user, true)', 'guard', '42501|Only an administrator',
                       format('select public.emerriment_set_admin(%L, true)', y)]
              || array[format('ADM-%s-4', dir), 'admin protection', xn, 'own profile', 'UPDATE id', 'refused', '42501',
                       format('update public.profiles set id = gen_random_uuid() where id = %L', x)]
              || array[format('ADM-%s-5', dir), 'admin protection', xn, 'administrator', 'emerriment_set_admin(admin, false)', 'guard', '42501|Only an administrator',
                       format('select public.emerriment_set_admin(%L, false)', admin_id)]
              || array[format('ADM-%s-6', dir), 'admin protection', xn, 'administrator profile', 'UPDATE is_admin = false', 'denied', '0 rows or 42501',
                       format('update public.profiles set is_admin = false where id = %L', admin_id)]
              || array[format('ADM-%s-7', dir), 'admin protection', xn, 'own profile', 'UPDATE created_at (not a user column)', 'refused', '42501',
                       format('update public.profiles set created_at = now() where id = %L', x)];
        end loop;

        -- Administrator privilege protection (administrator)
        tests := tests
          || array['ADM-A-1', 'admin protection', 'admin', 'user A', 'emerriment_set_admin(user A, true) — authorised path', 'promote', 'true/2',
                   format('select public.emerriment_set_admin(%L, true)', a_id)]
          || array['ADM-A-2', 'admin protection', 'admin', 'self (last administrator)', 'emerriment_set_admin(self, false)', 'guard', '42501|last administrator',
                   format('select public.emerriment_set_admin(%L, false)', admin_id)]
          || array['ADM-A-3', 'admin protection', 'admin', 'user A profile', 'UPDATE is_admin directly (bypassing the function)', 'refused', '42501',
                   format('update public.profiles set is_admin = true where id = %L', a_id)]
          || array['ADM-A-4', 'admin protection', 'admin', 'all profiles', 'SELECT (CMS users page)', 'count', (select count(*)::text from public.profiles),
                   'select 1 from public.profiles'];

        -- Leads
        tests := tests
          || array['LEAD-01', 'leads', 'anon', 'leads', 'SELECT', 'none', '0 rows or 42501', 'select 1 from public.leads']
          || array['LEAD-02', 'leads', 'user A', 'leads', 'SELECT', 'none', '0 rows or 42501', 'select 1 from public.leads']
          || array['LEAD-03', 'leads', 'anon', 'fixture lead', 'UPDATE', 'denied', '0 rows or 42501', format('update public.leads set notes = notes where id = %s', f_lead)]
          || array['LEAD-04', 'leads', 'anon', 'fixture lead', 'DELETE', 'denied', '0 rows or 42501', format('delete from public.leads where id = %s', f_lead)]
          || array['LEAD-05', 'leads', 'anon', 'leads', 'TRUNCATE', 'refused', '42501', 'truncate public.leads']
          || array['LEAD-06', 'leads', 'user A', 'fixture lead', 'UPDATE', 'denied', '0 rows or 42501', format('update public.leads set notes = notes where id = %s', f_lead)]
          || array['LEAD-07', 'leads', 'user A', 'fixture lead', 'DELETE', 'denied', '0 rows or 42501', format('delete from public.leads where id = %s', f_lead)]
          || array['LEAD-08', 'leads', 'anon', 'leads', 'INSERT quiz lead (homepage payload)', 'allowed', '1 row',
                   'insert into public.leads (name, email, skin_type, concern, oil_level, sensitivity, score, recommendation, submitted_at, quiz_version, source, status, email_status, last_email_sent, email_sequence_day, last_sequence_email_sent, next_email_due, tags, notes) values (''RLS check'', ''rls-check@example.invalid'', ''Oily'', ''Acne'', ''High'', ''Low'', 50, ''check'', now(), ''2.0'', ''Skin Quiz'', ''New Lead'', ''Pending'', null, 1, now(), now() + interval ''1 day'', ''["quiz"]'', null)']
          || array['LEAD-09', 'leads', 'anon', 'leads.emails_opened', 'INSERT with a forged counter', 'refused', '42501',
                   'insert into public.leads (email, emails_opened) values (''rls-check2@example.invalid'', 99)']
          || array['LEAD-10', 'leads', 'anon', 'leads.id', 'INSERT with a chosen id', 'refused', '42501',
                   'insert into public.leads (id, email) values (999999999, ''rls-check3@example.invalid'')']
          || array['LEAD-11', 'leads', 'anon', 'leads', 'INSERT ... RETURNING (read-back)', 'refused', '42501',
                   'insert into public.leads (email) values (''rls-check4@example.invalid'') returning id']
          || array['LEAD-12', 'leads', 'anon', 'leads state columns', 'INSERT with forged email state (normalised by guard)', 'lead_tamper', 'Pending|New Lead|null|1|true',
                   'insert into public.leads (email, email_status, status, last_email_sent, email_sequence_day, submitted_at) values (''rls-tamper@example.invalid'', ''Sent'', ''Unsubscribed'', now(), 9, ''2000-01-01'')']
          || array['LEAD-13', 'leads', 'admin', 'leads', 'SELECT all', 'count', lead_total::text, 'select 1 from public.leads']
          || array['LEAD-14', 'leads', 'admin', 'fixture lead', 'UPDATE (CMS subscribers)', 'allowed', '1 row', format('update public.leads set notes = notes where id = %s', f_lead)]
          || array['LEAD-15', 'leads', 'service', 'leads', 'SELECT all (database role test)', 'count', lead_total::text, 'select 1 from public.leads']
          || array['LEAD-16', 'leads', 'service', 'fixture lead', 'claim: UPDATE email_status Pending -> Sending', 'allowed', '1 row',
                   format('update public.leads set email_status = ''Sending'' where id = %s and email_status = ''Pending'' and last_email_sent is null', f_lead)]
          || array['LEAD-17', 'leads', 'service', 'email_deliveries', 'INSERT delivery record', 'allowed', '1 row',
                   format('insert into public.email_deliveries (lead_id, kind) values (%s, ''report'')', f_lead)]
          || array['LEAD-18', 'leads', 'anon', 'email_deliveries', 'SELECT', 'none', '0 rows or 42501', 'select 1 from public.email_deliveries']
          || array['LEAD-19', 'leads', 'user A', 'email_deliveries', 'SELECT', 'none', '0 rows or 42501', 'select 1 from public.email_deliveries']
          || array['LEAD-20', 'leads', 'admin', 'email_deliveries', 'SELECT (service role only)', 'none', '0 rows or 42501', 'select 1 from public.email_deliveries'];

        -- AI tables
        tests := tests
          || array['AI-01', 'ai', 'anon', 'ai_conversations', 'SELECT', 'none', '0 rows or 42501', 'select 1 from public.ai_conversations']
          || array['AI-02', 'ai', 'anon', 'ai_messages', 'SELECT', 'none', '0 rows or 42501', 'select 1 from public.ai_messages']
          || array['AI-03', 'ai', 'anon', 'ai_memory', 'SELECT', 'none', '0 rows or 42501', 'select 1 from public.ai_memory']
          || array['AI-04', 'ai', 'anon', 'ai_conversations', 'INSERT', 'refused', '42501', format('insert into public.ai_conversations (user_id, title) values (%L, ''x'')', a_id)]
          || array['AI-05', 'ai', 'service', 'ai_conversations', 'SELECT all (database role test)', 'count', conv_total::text, 'select 1 from public.ai_conversations']
          || array['AI-06', 'ai', 'service', 'ai_events', 'INSERT (database role test)', 'allowed', '1 row', 'insert into public.ai_events default values'];
        foreach tbl in array array['ai_events', 'ai_feedback', 'ai_questions', 'ai_settings'] loop
            v_sql := format('select 1 from public.%I where id = %L', tbl,
                            case tbl when 'ai_events' then f_event when 'ai_feedback' then f_feedback when 'ai_questions' then f_question else f_setting end);
            tests := tests
              || array['AI-' || tbl || '-anon', 'ai', 'anon', tbl || ' fixture', 'SELECT', 'none', '0 rows or 42501', v_sql]
              || array['AI-' || tbl || '-userA', 'ai', 'user A', tbl || ' fixture', 'SELECT', 'none', '0 rows or 42501', v_sql]
              || array['AI-' || tbl || '-userA-del', 'ai', 'user A', tbl, 'DELETE all', 'denied', '0 rows or 42501', format('delete from public.%I', tbl)]
              || array['AI-' || tbl || '-admin', 'ai', 'admin', tbl || ' fixture', 'SELECT (CMS analytics)', 'count', '1', v_sql];
        end loop;

        -- Public content (anonymous and signed-in)
        foreach xn in array array['anon', 'user A'] loop
            tests := tests
              || array['PUB-' || xn || '-1', 'public content', xn, 'published fixture article', 'SELECT', 'count', '1', format('select 1 from public.encyclopedia_articles where id = %L', f_pub)]
              || array['PUB-' || xn || '-2', 'public content', xn, 'draft fixture article', 'SELECT', 'none', '0 rows or 42501', format('select 1 from public.encyclopedia_articles where id = %L', f_draft)]
              || array['PUB-' || xn || '-3', 'public content', xn, 'all draft articles (existing data)', 'SELECT', 'none', '0 rows or 42501', 'select 1 from public.encyclopedia_articles where status is distinct from ''published''']
              || array['PUB-' || xn || '-4', 'public content', xn, 'approved fixture product', 'SELECT', 'count', '1', format('select 1 from public.products where id = %L', f_prod_ok)]
              || array['PUB-' || xn || '-5', 'public content', xn, 'unapproved fixture product', 'SELECT', 'none', '0 rows or 42501', format('select 1 from public.products where id = %L', f_prod_no)]
              || array['PUB-' || xn || '-6', 'public content', xn, 'all unapproved products (existing data)', 'SELECT', 'none', '0 rows or 42501', 'select 1 from public.products where is_approved is not true']
              || array['PUB-' || xn || '-7', 'public content', xn, 'fixture article-product links', 'SELECT (only published + approved)', 'count', '1',
                       format('select 1 from public.article_products where id in (%L, %L, %L)', f_link_ok, f_link_no1, f_link_no2)]
              || array['PUB-' || xn || '-8', 'public content', xn, 'rating summary (published fixture)', 'emerriment_article_rating_summary', 'eq', '3.00/2',
                       format('select format(''%%s/%%s'', average, total) from public.emerriment_article_rating_summary(%L)', f_pub)]
              || array['PUB-' || xn || '-9', 'public content', xn, 'rating summary (draft fixture)', 'emerriment_article_rating_summary', 'eq', '<null>/0',
                       format('select format(''%%s/%%s'', coalesce(average::text, ''<null>''), total) from public.emerriment_article_rating_summary(%L)', f_draft)]
              || array['PUB-' || xn || '-10', 'public content', xn, 'view counter (published fixture)', 'emerriment_increment_article_views', 'eq', '1',
                       format('select public.emerriment_increment_article_views(%L)::text', f_pub)]
              || array['PUB-' || xn || '-11', 'public content', xn, 'view counter (draft fixture)', 'emerriment_increment_article_views', 'eq', '<null>',
                       format('select public.emerriment_increment_article_views(%L)::text', f_draft)];
        end loop;
        tests := tests
          || array['PUB-ratings-anon', 'public content', 'anon', 'individual ratings on fixture article', 'SELECT', 'none', '0 rows or 42501', format('select 1 from public.article_ratings where article_id = %L', f_pub)]
          || array['PUB-ratings-userA', 'public content', 'user A', 'individual ratings on fixture article', 'SELECT (own only)', 'count', '1', format('select 1 from public.article_ratings where article_id = %L', f_pub)];

        -- Administrator CMS
        tests := tests
          || array['CMS-01', 'cms', 'admin', 'new article', 'INSERT', 'allowed', '1 row', 'insert into public.encyclopedia_articles (title, slug, status) values (''RLS check new'', ''emr-rls-check-new-'' || gen_random_uuid(), ''draft'')']
          || array['CMS-02', 'cms', 'admin', 'published fixture', 'UPDATE content', 'allowed', '1 row', format('update public.encyclopedia_articles set content = ''edited'' where id = %L', f_pub)]
          || array['CMS-03', 'cms', 'admin', 'draft fixture', 'publish', 'allowed', '1 row', format('update public.encyclopedia_articles set status = ''published'', published_at = now() where id = %L', f_draft)]
          || array['CMS-04', 'cms', 'admin', 'published fixture', 'unpublish', 'allowed', '1 row', format('update public.encyclopedia_articles set status = ''draft'' where id = %L', f_pub)]
          || array['CMS-05', 'cms', 'admin', 'draft fixture', 'DELETE', 'allowed', '1 row', format('delete from public.encyclopedia_articles where id = %L', f_draft)]
          || array['CMS-06', 'cms', 'admin', 'draft fixture', 'SELECT (drafts visible to admin)', 'count', '1', format('select 1 from public.encyclopedia_articles where id = %L', f_draft)]
          || array['CMS-07', 'cms', 'admin', 'article_products', 'INSERT link', 'allowed', '1 row', format('insert into public.article_products (article_id, product_id) values (%L, %L)', f_draft, f_prod_no)]
          || array['CMS-08', 'cms', 'admin', 'article_products fixture', 'DELETE link', 'allowed', '1 row', format('delete from public.article_products where id = %L', f_link_ok)]
          || array['CMS-09', 'cms', 'admin', 'unapproved fixture product', 'UPDATE approve', 'allowed', '1 row', format('update public.products set is_approved = true where id = %L', f_prod_no)]
          || array['CMS-10', 'cms', 'user A', 'new article', 'INSERT', 'refused', '42501', 'insert into public.encyclopedia_articles (title, slug, status) values (''x'', ''emr-rls-check-x-'' || gen_random_uuid(), ''published'')']
          || array['CMS-11', 'cms', 'user A', 'published fixture', 'UPDATE content', 'denied', '0 rows or 42501', format('update public.encyclopedia_articles set content = ''hacked'' where id = %L', f_pub)]
          || array['CMS-12', 'cms', 'user A', 'published fixture', 'DELETE', 'denied', '0 rows or 42501', format('delete from public.encyclopedia_articles where id = %L', f_pub)]
          || array['CMS-13', 'cms', 'user A', 'article_products', 'INSERT link', 'refused', '42501', format('insert into public.article_products (article_id, product_id) values (%L, %L)', f_pub, f_prod_no)]
          || array['CMS-14', 'cms', 'user A', 'approved fixture product', 'UPDATE', 'denied', '0 rows or 42501', format('update public.products set price = 0 where id = %L', f_prod_ok)]
          || array['CMS-15', 'cms', 'anon', 'new article', 'INSERT', 'refused', '42501', 'insert into public.encyclopedia_articles (title, slug, status) values (''x'', ''emr-rls-check-y-'' || gen_random_uuid(), ''published'')']
          || array['CMS-16', 'cms', 'anon', 'published fixture', 'UPDATE', 'denied', '0 rows or 42501', format('update public.encyclopedia_articles set content = ''hacked'' where id = %L', f_pub)];

        -- API role permissions
        foreach tbl in array all_tables loop
            tests := tests
              || array['PRM-truncate-' || tbl || '-anon', 'permissions', 'anon', tbl, 'TRUNCATE', 'refused', '42501', format('truncate public.%I', tbl)]
              || array['PRM-truncate-' || tbl || '-userA', 'permissions', 'user A', tbl, 'TRUNCATE', 'refused', '42501', format('truncate public.%I', tbl)];
        end loop;
        tests := tests
          || array['PRM-01', 'permissions', 'anon', 'profiles', 'INSERT', 'refused', '42501', format('insert into public.profiles (id) values (%L)', a_id)]
          || array['PRM-02', 'permissions', 'anon', 'emerriment_private.request_role()', 'EXECUTE (private schema)', 'refused', '42501', 'select emerriment_private.request_role()']
          || array['PRM-03', 'permissions', 'user A', 'emerriment_private.request_role()', 'EXECUTE (private schema)', 'refused', '42501', 'select emerriment_private.request_role()']
          || array['PRM-04', 'permissions', 'anon', 'emerriment_private.rls_baseline', 'SELECT (private schema)', 'refused', '42501', 'select 1 from emerriment_private.rls_baseline']
          || array['PRM-05', 'permissions', 'user A', 'emerriment_private.rls_baseline', 'SELECT (private schema)', 'refused', '42501', 'select 1 from emerriment_private.rls_baseline']
          || array['PRM-06', 'permissions', 'anon', 'emerriment_set_admin', 'EXECUTE', 'refused', '42501', format('select public.emerriment_set_admin(%L, true)', a_id)];
        foreach tbl in array array['handle_new_user', 'rls_auto_enable', 'emerriment_guard_profile_privileges', 'emerriment_guard_lead_insert'] loop
            tests := tests
              || array['PRM-fn-' || tbl || '-anon', 'permissions', 'anon', tbl || '()', 'EXECUTE', 'refused', '42501', format('select public.%I()', tbl)]
              || array['PRM-fn-' || tbl || '-userA', 'permissions', 'user A', tbl || '()', 'EXECUTE', 'refused', '42501', format('select public.%I()', tbl)];
        end loop;
        if to_regclass('emerriment_backup.manifest_20261113') is not null then
            tests := tests
              || array['PRM-07', 'permissions', 'anon', 'emerriment_backup', 'SELECT (backup schema)', 'refused', '42501', 'select 1 from emerriment_backup.manifest_20261113']
              || array['PRM-08', 'permissions', 'user A', 'emerriment_backup', 'SELECT (backup schema)', 'refused', '42501', 'select 1 from emerriment_backup.manifest_20261113'];
        else
            res := res || array['PRM-07', 'permissions', 'anon', 'emerriment_backup', 'SELECT (backup schema)', 'denied', 'backup schema not present', '', 'SKIP'];
        end if;

        -- ---------- run every test in its own rolled-back sub-transaction ----------
        for i in 0 .. (array_length(tests, 1) / 8) - 1 loop
            v_id := tests[i * 8 + 1]; v_cat := tests[i * 8 + 2]; v_actor := tests[i * 8 + 3]; v_target := tests[i * 8 + 4];
            v_op := tests[i * 8 + 5]; v_kind := tests[i * 8 + 6]; v_exp := tests[i * 8 + 7]; v_sql := tests[i * 8 + 8];

            v_role := case v_actor when 'anon' then 'anon' when 'service' then 'service_role' else 'authenticated' end;
            v_uid := case v_actor when 'user A' then a_id when 'user B' then b_id when 'admin' then admin_id else null end;
            v_claims := case when v_uid is null then json_build_object('role', v_role)::text
                             else json_build_object('role', v_role, 'sub', v_uid)::text end;

            st := '00000'; msg := ''; got := null; stage := 'switch';
            begin
                perform set_config('request.jwt.claims', v_claims, true);
                execute 'set local role ' || v_role;
                stage := 'run';
                if v_kind in ('count', 'none') then
                    execute 'select count(*)::text from (' || v_sql || ') q' into got;
                elsif v_kind = 'eq' then
                    execute v_sql into got;
                    got := coalesce(got, '<null>');
                elsif v_kind = 'lead_tamper' then
                    execute v_sql;
                    execute 'reset role';
                    select format('%s|%s|%s|%s|%s', email_status, status, coalesce(last_email_sent::text, 'null'),
                                  email_sequence_day, (abs(extract(epoch from (now() - submitted_at))) < 600)::text)
                      into got from public.leads where email = 'rls-tamper@example.invalid';
                elsif v_kind = 'promote' then
                    execute v_sql;
                    execute 'reset role';
                    select format('%s/%s', (select is_admin::text from public.profiles where id = a_id),
                                  (select count(*) from public.profiles where is_admin is true)) into got;
                else
                    execute v_sql;
                    get diagnostics k = row_count;
                    got := k::text;
                end if;
                raise exception using errcode = 'EMRB0', message = coalesce(got, '<null>');
            exception
                when sqlstate 'EMRB0' then
                    got := sqlerrm; st := '00000';
                when others then
                    get stacked diagnostics st = returned_sqlstate, msg = message_text;
            end;

            if stage = 'switch' then
                if v_actor = 'service' and st = '42501' then
                    verdict := 'SKIP'; actual := 'this SQL session may not switch to service_role';
                else
                    verdict := 'FAIL'; actual := 'could not switch role: ' || left(msg, 120);
                end if;
            else
                actual := case when st = '00000' then
                                   case when v_kind in ('count', 'none') then got || ' rows visible'
                                        when v_kind in ('allowed', 'denied', 'refused') then 'affected ' || got || ' rows'
                                        else got end
                               else 'error: ' || left(msg, 120) end;
                verdict := case
                    when v_kind = 'count'   then case when st = '00000' and got = v_exp then 'PASS' else 'FAIL' end
                    when v_kind = 'none'    then case when (st = '00000' and got = '0') or st = '42501' then 'PASS' else 'FAIL' end
                    when v_kind = 'denied'  then case when (st = '00000' and got = '0') or st = '42501' then 'PASS' else 'FAIL' end
                    when v_kind = 'refused' then case when st = '42501' then 'PASS' else 'FAIL' end
                    when v_kind = 'allowed' then case when st = '00000' and got::bigint >= 1 then 'PASS' else 'FAIL' end
                    when v_kind = 'guard'   then case when st = split_part(v_exp, '|', 1)
                                                       and position(split_part(v_exp, '|', 2) in msg) > 0 then 'PASS' else 'FAIL' end
                    else case when st = '00000' and got = v_exp then 'PASS' else 'FAIL' end
                end;
            end if;

            res := res || array[v_id, v_cat, v_actor, v_target, v_op, v_exp, actual, st, verdict];
        end loop;

        raise exception using errcode = 'EMRB9', message = 'roll back all fixtures and test writes';
    exception
        when sqlstate 'EMRB9' then null;
        when others then
            get stacked diagnostics st = returned_sqlstate, msg = message_text;
            res := res || array['SETUP-03', 'setup', 'db owner', 'fixtures', 'create test fixtures', 'created', 'error: ' || left(msg, 150), st, 'FAIL'];
    end;
    end if;

    -- ---------- rollback verification (as db owner, after the rollback) ----------
    foreach tbl in array all_tables loop
        execute format('select count(*)::text || '':'' || coalesce(md5(string_agg(t::text, ''|'' order by t::text)), ''-'') from public.%I t', tbl) into got;
        fp_after := fp_after || got;
    end loop;
    for i in 1 .. array_length(all_tables, 1) loop
        res := res || array['RB-' || all_tables[i], 'rollback', 'db owner', all_tables[i], 'rows and content identical to before the tests',
                            'unchanged', case when fp_before[i] = fp_after[i] then 'unchanged (' || split_part(fp_after[i], ':', 1) || ' rows)' else 'CHANGED' end,
                            '', case when fp_before[i] = fp_after[i] then 'PASS' else 'FAIL' end];
    end loop;
    select string_agg(id::text, ',' order by id) into admins_after from public.profiles where is_admin is true;
    select count(*)::text || ':' || coalesce(md5(string_agg(id::text, ',' order by id)), '-') into users_after from auth.users;
    select md5(coalesce(string_agg(b::text, '|' order by b.id), '')) into buckets_after from storage.buckets b;
    select coalesce(max(id), 0)::text into seq_after from public.leads;

    res := res
      || array['RB-admins', 'rollback', 'db owner', 'administrator set', 'identical to before', 'unchanged',
               case when admins_before is not distinct from admins_after then 'unchanged' else 'CHANGED' end, '',
               case when admins_before is not distinct from admins_after then 'PASS' else 'FAIL' end]
      || array['RB-admin-count', 'rollback', 'db owner', 'administrators', 'exactly one administrator', '1',
               (select count(*)::text from public.profiles where is_admin is true), '',
               case when (select count(*) from public.profiles where is_admin is true) = 1 then 'PASS' else 'FAIL' end]
      || array['RB-auth-users', 'rollback', 'db owner', 'auth.users', 'no account created or deleted', 'unchanged',
               case when users_before = users_after then 'unchanged' else 'CHANGED' end, '',
               case when users_before = users_after then 'PASS' else 'FAIL' end]
      || array['RB-buckets', 'rollback', 'db owner', 'storage.buckets', 'settings identical', 'unchanged',
               case when buckets_before = buckets_after then 'unchanged' else 'CHANGED' end, '',
               case when buckets_before = buckets_after then 'PASS' else 'FAIL' end]
      || array['INFO-sequence', 'rollback', 'db owner', 'leads id sequence', 'advances (non-transactional, expected)', 'advanced',
               'highest stored lead id unchanged: ' || (seq_before = seq_after)::text, '', 'INFO'];

    perform set_config('request.jwt.claims', '', true);

    for i in 1 .. array_length(res, 1) / 9 loop
        insert into emr_sec_results (seq, test_id, category, actor, target, operation, expected, actual, sqlstate, result)
        values (i, res[i * 9 - 8], res[i * 9 - 7], res[i * 9 - 6], res[i * 9 - 5], res[i * 9 - 4],
                res[i * 9 - 3], res[i * 9 - 2], nullif(res[i * 9 - 1], ''), res[i * 9]);
    end loop;
end
$main$;

commit;

-- Summary first, then failures and skips, then passes.
with r as (select * from emr_sec_results),
s as (
    select count(*) filter (where result in ('PASS', 'FAIL', 'SKIP')) as total,
           count(*) filter (where result = 'PASS') as passed,
           count(*) filter (where result = 'FAIL') as failed,
           count(*) filter (where result = 'SKIP') as skipped,
           count(*) filter (where result = 'FAIL' and sqlstate is not null and sqlstate not in ('00000', '42501')) as unexpected
      from r
)
select test_id, category, actor, target, operation, expected, actual, sqlstate, result
  from (
    select 0 as grp, 1 as seq, 'SUMMARY' as test_id, 'summary' as category, '' as actor, '' as target, 'Total tests' as operation, '' as expected, total::text as actual, '' as sqlstate, '' as result from s
    union all select 0, 2, 'SUMMARY', 'summary', '', '', 'Passed', '', passed::text, '', '' from s
    union all select 0, 3, 'SUMMARY', 'summary', '', '', 'Failed', '', failed::text, '', '' from s
    union all select 0, 4, 'SUMMARY', 'summary', '', '', 'Skipped (optional)', '', skipped::text, '', '' from s
    union all select 0, 5, 'SUMMARY', 'summary', '', '', 'Unexpected errors', '', unexpected::text, '', '' from s
    union all select 0, 6, 'SUMMARY', 'summary', '', '', 'OVERALL', '', case when failed = 0 and total > 0 then 'PASS' else 'FAIL' end, '',
                     case when failed = 0 and total > 0 then 'PASS' else 'FAIL' end from s
    union all
    select case result when 'FAIL' then 1 when 'SKIP' then 2 when 'INFO' then 4 else 3 end, seq,
           test_id, category, actor, target, operation, expected, actual, sqlstate, result
      from r
  ) x
 order by grp, seq;
