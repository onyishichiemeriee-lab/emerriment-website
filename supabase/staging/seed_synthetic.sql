-- =====================================================================
-- EMerriment — SYNTHETIC seed data for the STAGING project only
-- ---------------------------------------------------------------------
-- Run in the STAGING project's SQL Editor (never production), after
-- migrations 1–7 were pushed to staging. Fake data only: example.test
-- addresses, placeholder articles and products. No real person.
--
-- Refuses to run (one transaction, nothing written) unless:
--   * the session first sets:  set emerriment.seed_target = 'staging';
--   * this is NOT production: the production backup schema
--     emerriment_backup must not exist, and there are at most 20 leads;
--   * migration 7 is applied (leads.marketing_consent exists).
-- Safe to re-run: rows are keyed by their synthetic slugs/emails.
-- =====================================================================

begin;

do $$
begin
    if coalesce(current_setting('emerriment.seed_target', true), '') <> 'staging' then
        raise exception 'EMerriment seed: run  set emerriment.seed_target = ''staging'';  first (staging project only).';
    end if;
    if to_regnamespace('emerriment_backup') is not null then
        raise exception 'EMerriment seed: emerriment_backup exists — this looks like PRODUCTION. Aborted.';
    end if;
    if (select count(*) from public.leads) > 20 then
        raise exception 'EMerriment seed: more than 20 leads — this does not look like a fresh staging project. Aborted.';
    end if;
    if not exists (select 1 from pg_attribute where attrelid = 'public.leads'::regclass and attname = 'marketing_consent' and not attisdropped) then
        raise exception 'EMerriment seed: migration 7 is not applied to this project yet.';
    end if;
end
$$;

-- Content: two published articles, one draft.
insert into public.encyclopedia_articles (title, slug, category, summary, content, status, published_at, reading_time)
select v.title, v.slug, v.category, v.summary, v.content, v.status, case when v.status = 'published' then now() end, 3
  from (values
    ('Staging: acne basics',      'staging-acne-basics',      'Acne',      'Synthetic article.', 'Synthetic staging content.', 'published'),
    ('Staging: hydration basics', 'staging-hydration-basics', 'Dryness',   'Synthetic article.', 'Synthetic staging content.', 'published'),
    ('Staging: unpublished draft','staging-draft',            'Sensitive', 'Synthetic draft.',   'Synthetic staging draft.',   'draft')
  ) as v(title, slug, category, summary, content, status)
 where not exists (select 1 from public.encyclopedia_articles a where a.slug = v.slug);

-- Products: two approved, one unapproved.
insert into public.products (name, description, category, selar_link, is_approved, quiz_recommended)
select v.name, 'Synthetic staging product.', v.category, 'https://example.test/product', v.approved, v.approved
  from (values
    ('Staging gentle cleanser', 'Cleanser',    true),
    ('Staging daily sunscreen', 'Sunscreen',   true),
    ('Staging unapproved item', 'Moisturiser', false)
  ) as v(name, category, approved)
 where not exists (select 1 from public.products p where p.name = v.name);

-- Leads: synthetic quiz submissions (no consent, no requests).
insert into public.leads (name, email, skin_type, concern, oil_level, sensitivity, score, recommendation, status, email_status)
select v.name, v.email, v.skin, v.concern, 'Medium', 'Low', 60, 'Synthetic recommendation.', 'New Lead', 'Pending'
  from (values
    ('Staging Lead One',   'lead1@example.test', 'Oily',        'Acne'),
    ('Staging Lead Two',   'lead2@example.test', 'Dry',         'Dryness'),
    ('Staging Lead Three', 'lead3@example.test', 'Combination', 'Hyperpigmentation')
  ) as v(name, email, skin, concern)
 where not exists (select 1 from public.leads l where l.email = v.email);

commit;

select (select count(*) from public.encyclopedia_articles where slug like 'staging-%') as staging_articles,
       (select count(*) from public.products where name like 'Staging %')            as staging_products,
       (select count(*) from public.leads where email like '%@example.test')          as synthetic_leads,
       (select count(*) from public.leads where marketing_consent)                    as opted_in;
