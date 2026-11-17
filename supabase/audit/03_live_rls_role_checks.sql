-- =====================================================================
-- EMerriment — live RLS checks as the API roles (run AFTER the migrations)
-- ---------------------------------------------------------------------
-- The SQL Editor runs as "postgres", which bypasses RLS, so a plain
-- SELECT there proves nothing about what visitors can do. This script
-- switches to the same roles and JWT claims PostgREST uses —
--   anon · user A · user B (two existing NON-admin accounts) · admin
-- — and records what each can see and change.
--
-- Changes nothing: every attempted write runs in a sub-transaction that
-- is always rolled back, whether or not it was allowed. (One side effect:
-- the allowed test lead consumes one value of the leads id sequence.)
-- Output: one row per check with pass = true/false. Only counts and
-- check names are shown — no personal data.
-- If fewer than two non-admin users exist, the user-A/B checks are
-- reported as skipped.
-- =====================================================================

drop table if exists pg_temp.emerriment_rls_check;
create temp table emerriment_rls_check (
    n serial, who text, check_name text, expected text, actual text, pass boolean
);

do $$
declare
    admin_id uuid;
    a_id uuid;
    b_id uuid;
    t text;
    who text;
    uid uuid;
    got bigint;
    outcome text;
    published_count bigint;
    approved_count bigint;
    lead_count bigint;
    article_count bigint;
    results text[] := '{}';

    private_tables text[] := array['profiles', 'quiz_results', 'reading_history', 'saved_articles',
        'saved_products', 'favorite_articles', 'ai_conversations', 'ai_messages', 'ai_memory',
        'article_ratings', 'ai_events', 'ai_feedback', 'ai_questions', 'ai_settings',
        'website_settings', 'product_clicks', 'collections', 'collection_articles', 'leads',
        'email_deliveries'];
    owner_tables text[] := array['quiz_results', 'reading_history', 'saved_articles', 'saved_products',
        'favorite_articles', 'ai_conversations', 'ai_messages', 'ai_memory', 'article_ratings'];
    admin_tables text[] := array['ai_events', 'ai_feedback', 'ai_questions', 'ai_settings',
        'website_settings', 'product_clicks', 'collections', 'collection_articles', 'leads',
        'email_deliveries'];
begin
    -- Reference values, read as postgres.
    select id into admin_id from public.profiles where is_admin is true order by created_at limit 1;
    select id into a_id from public.profiles where coalesce(is_admin, false) = false order by created_at, id limit 1;
    select id into b_id from public.profiles where coalesce(is_admin, false) = false and id <> a_id order by created_at, id limit 1;
    select count(*) into published_count from public.encyclopedia_articles where status = 'published';
    select count(*) into approved_count from public.products where is_approved is true;
    select count(*) into lead_count from public.leads;
    select count(*) into article_count from public.encyclopedia_articles;

    -- ---------------- anon ----------------
    perform set_config('request.jwt.claims', '{"role":"anon"}', true);
    execute 'set local role anon';

    foreach t in array private_tables loop
        if to_regclass('public.' || t) is null then
            results := results || array['anon', 'read ' || t, '0', 'missing table'];
            continue;
        end if;
        begin
            execute format('select count(*) from public.%I', t) into got;
        exception when insufficient_privilege then got := 0;
        end;
        results := results || array['anon', 'read ' || t, '0', got::text];
    end loop;

    begin
        execute 'select count(*) from public.encyclopedia_articles' into got;
    exception when insufficient_privilege then got := -1;
    end;
    results := results || array['anon', 'read encyclopedia_articles (published only)', published_count::text, got::text];

    begin
        execute 'select count(*) from public.products' into got;
    exception when insufficient_privilege then got := -1;
    end;
    results := results || array['anon', 'read products (approved only)', approved_count::text, got::text];

    -- Allowed write: a quiz lead (rolled back).
    begin
        insert into public.leads (name, email, email_status, status)
        values ('RLS check', 'rls-check@example.invalid', 'Pending', 'New Lead');
        get diagnostics got = row_count;
        raise exception using errcode = 'P0099', message = got::text;
    exception
        when sqlstate 'P0099' then outcome := 'allowed';
        when others then outcome := 'refused ' || sqlstate;
    end;
    results := results || array['anon', 'insert quiz lead', 'allowed', outcome];

    -- Refused writes.
    begin
        update public.leads set notes = notes;
        get diagnostics got = row_count;
        raise exception using errcode = 'P0099', message = got::text;
    exception
        when sqlstate 'P0099' then outcome := case when sqlerrm = '0' then 'refused' else 'changed ' || sqlerrm end;
        when others then outcome := 'refused';
    end;
    results := results || array['anon', 'update leads', 'refused', outcome];

    begin
        execute 'truncate public.leads';
        raise exception using errcode = 'P0099', message = 'truncated';
    exception
        when sqlstate 'P0099' then outcome := 'TRUNCATED';
        when others then outcome := 'refused';
    end;
    results := results || array['anon', 'truncate leads', 'refused', outcome];

    execute 'reset role';

    -- ---------------- user A and user B ----------------
    foreach who in array array['user A', 'user B'] loop
        uid := case who when 'user A' then a_id else b_id end;

        if uid is null then
            results := results || array[who, 'skipped (needs two non-admin accounts)', '-', '-'];
            continue;
        end if;

        perform set_config('request.jwt.claims',
            json_build_object('role', 'authenticated', 'sub', uid)::text, true);
        execute 'set local role authenticated';

        execute 'select count(*) from public.profiles where id <> $1' into got using uid;
        results := results || array[who, 'read other users'' profiles', '0', got::text];

        foreach t in array owner_tables loop
            begin
                execute format('select count(*) from public.%I where user_id is distinct from $1', t) into got using uid;
            exception when insufficient_privilege then got := 0;
            end;
            results := results || array[who, 'read other users'' ' || t, '0', got::text];

            begin
                execute format('update public.%I set user_id = user_id where user_id is distinct from $1', t) using uid;
                get diagnostics got = row_count;
                raise exception using errcode = 'P0099', message = got::text;
            exception
                when sqlstate 'P0099' then outcome := case when sqlerrm = '0' then 'refused' else 'changed ' || sqlerrm end;
                when others then outcome := 'refused';
            end;
            results := results || array[who, 'change other users'' ' || t, 'refused', outcome];
        end loop;

        foreach t in array admin_tables loop
            if to_regclass('public.' || t) is null then
                results := results || array[who, 'read ' || t, '0', 'missing table'];
                continue;
            end if;
            begin
                execute format('select count(*) from public.%I', t) into got;
            exception when insufficient_privilege then got := 0;
            end;
            results := results || array[who, 'read ' || t, '0', got::text];
        end loop;

        -- Self-promotion, three ways.
        begin
            update public.profiles set is_admin = true where id = uid;
            get diagnostics got = row_count;
            raise exception using errcode = 'P0099', message = got::text;
        exception
            when sqlstate 'P0099' then outcome := case when sqlerrm = '0' then 'refused' else 'PROMOTED' end;
            when others then outcome := 'refused';
        end;
        results := results || array[who, 'set own is_admin', 'refused', outcome];

        begin
            perform public.emerriment_set_admin(uid, true);
            raise exception using errcode = 'P0099', message = 'promoted';
        exception
            when sqlstate 'P0099' then outcome := 'PROMOTED';
            when others then outcome := 'refused';
        end;
        results := results || array[who, 'emerriment_set_admin on self', 'refused', outcome];

        begin
            update public.profiles set id = admin_id where id = uid;
            get diagnostics got = row_count;
            raise exception using errcode = 'P0099', message = got::text;
        exception
            when sqlstate 'P0099' then outcome := case when sqlerrm = '0' then 'refused' else 'CHANGED' end;
            when others then outcome := 'refused';
        end;
        results := results || array[who, 'change own profile id', 'refused', outcome];

        execute 'reset role';
    end loop;

    -- ---------------- admin ----------------
    if admin_id is not null then
        perform set_config('request.jwt.claims',
            json_build_object('role', 'authenticated', 'sub', admin_id)::text, true);
        execute 'set local role authenticated';

        execute 'select count(*) from public.leads' into got;
        results := results || array['admin', 'read all leads', lead_count::text, got::text];

        execute 'select count(*) from public.encyclopedia_articles' into got;
        results := results || array['admin', 'read all articles incl. drafts', article_count::text, got::text];

        begin
            update public.encyclopedia_articles set updated_at = updated_at;
            get diagnostics got = row_count;
            raise exception using errcode = 'P0099', message = got::text;
        exception
            when sqlstate 'P0099' then outcome := case when sqlerrm::bigint = article_count then 'allowed' else 'partial ' || sqlerrm end;
            when others then outcome := 'refused ' || sqlstate;
        end;
        results := results || array['admin', 'update articles (CMS)', 'allowed', outcome];

        begin
            perform public.emerriment_set_admin(admin_id, false);
            raise exception using errcode = 'P0099', message = 'demoted';
        exception
            when sqlstate 'P0099' then outcome := 'DEMOTED';
            when others then outcome := 'refused';
        end;
        results := results || array['admin', 'demote the last administrator', 'refused', outcome];

        execute 'reset role';
    end if;

    perform set_config('request.jwt.claims', '', true);

    for i in 1 .. array_length(results, 1) / 4 loop
        insert into emerriment_rls_check (who, check_name, expected, actual, pass)
        values (results[i * 4 - 3], results[i * 4 - 2], results[i * 4 - 1], results[i * 4],
                results[i * 4 - 1] = results[i * 4] or results[i * 4 - 1] = '-');
    end loop;
end
$$;

select who, check_name, expected, actual, pass
  from emerriment_rls_check
 order by pass, n;
