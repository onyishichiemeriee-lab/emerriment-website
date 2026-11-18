-- =====================================================================
-- EMerriment — rollback for migration 7 ONLY
-- (20261117090000_emerriment_marketing_consent_and_purchases.sql)
-- ---------------------------------------------------------------------
-- WHEN: only if migration 7's database behaviour itself must be switched
-- off (for example a consent trigger rejecting valid quiz submissions).
-- A failed or reverted WEBSITE deploy does NOT need this: the previous
-- code works with migration 7 in place.
--
-- ORDER (required):
--   1. Roll the website back first (Netlify: re-publish the previous
--      deploy) and make sure EMAIL_SEQUENCE_ENABLED and
--      CUSTOMER_ONBOARDING_ENABLED are not set. The current code sends
--      consent fields on the quiz; once this script removes the column
--      privileges, those submissions would be refused.
--   2. Run this whole file once in the SQL Editor. It is one transaction:
--      it either completes or changes nothing.
--   3. Before the newer code is deployed again or any lesson is enabled,
--      re-apply migration 7 (it is safe to re-run) so both consent guards
--      are back.
--
-- WHAT IT DOES (migration-7 behaviour only):
--   * removes both consent triggers and their functions
--       emerriment_guard_lead_consent        (insert guard)
--       emerriment_guard_lead_consent_change (update guard);
--   * revokes the visitor INSERT privilege on the three consent columns,
--     so with the insert guard gone nobody can submit consent through the
--     API (the quiz itself keeps working without the consent fields).
--
-- WHAT IT KEEPS (deliberately):
--   * every row of leads, purchases and email_deliveries;
--   * the consent columns and their values (consent evidence);
--   * the consent evidence CHECK constraint (it only keeps records
--     consistent; the previous code never writes these columns);
--   * public.purchases with RLS on and no browser write access, and its
--     admin-read policy;
--   * the email_deliveries extensions (purchase_id, 'customer' kind,
--     target check, per-purchase unique key) — removing them would mean
--     deleting customer delivery history and could allow repeat emails;
--   * everything from migrations 1–6: policies, RLS, grants, triggers,
--     functions, the private schema. Nothing here grants any privilege.
--
-- LIMITATIONS:
--   * While the update guard is removed, an administrator session could
--     change consent values in the CMS (the restrictive RLS policies still
--     limit lead updates to administrators). Re-apply migration 7 promptly
--     and do not enable lessons in between.
--   * It does not undo emails already sent; nothing can.
--   * Self-checks at the end abort the transaction if any row count or
--     migration 1–6 protection differs from before.
-- =====================================================================

begin;

do $$
begin
    if to_regprocedure('public.emerriment_is_admin()') is null
       or to_regnamespace('emerriment_private') is null then
        raise exception 'EMerriment: migrations 1–6 are not in place; this script is only for undoing migration 7.';
    end if;
    if to_regclass('public.purchases') is null then
        raise exception 'EMerriment: migration 7 is not applied (no public.purchases); nothing to roll back.';
    end if;
end
$$;

-- Snapshot for the self-checks below (dropped automatically at commit).
create temporary table emerriment_m7_before on commit drop as
select
    (select count(*) from public.leads)                                                   as leads,
    (select count(*) from public.leads where marketing_consent)                           as consenting,
    (select count(*) from public.leads where marketing_consent_at is not null)            as with_evidence,
    (select count(*) from public.leads where marketing_consent_withdrawn_at is not null)  as withdrawn,
    (select count(*) from public.email_deliveries)                                        as deliveries,
    (select count(*) from public.purchases)                                               as purchases,
    (select count(*) from pg_policies where schemaname = 'public' and policyname like 'emerriment\_%') as policies,
    (select count(*) from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r' and relrowsecurity) as rls_tables;


-- 1. Consent guards (insert and update).
drop trigger if exists emerriment_guard_lead_consent_change on public.leads;
drop trigger if exists emerriment_guard_lead_consent on public.leads;
drop function if exists public.emerriment_guard_lead_consent_change();
drop function if exists public.emerriment_guard_lead_consent();

-- 2. Visitors can no longer submit consent fields.
revoke insert (marketing_consent, marketing_consent_source, marketing_consent_version)
    on public.leads from anon, authenticated;


-- 3. Self-checks: nothing else changed.
do $$
declare
    b record;
begin
    select * into b from emerriment_m7_before;

    if (select count(*) from public.leads) <> b.leads
       or (select count(*) from public.leads where marketing_consent) <> b.consenting
       or (select count(*) from public.leads where marketing_consent_at is not null) <> b.with_evidence
       or (select count(*) from public.leads where marketing_consent_withdrawn_at is not null) <> b.withdrawn
       or (select count(*) from public.email_deliveries) <> b.deliveries
       or (select count(*) from public.purchases) <> b.purchases then
        raise exception 'EMerriment: data changed during the migration 7 rollback; aborted.';
    end if;

    if (select count(*) from pg_policies where schemaname = 'public' and policyname like 'emerriment\_%') <> b.policies
       or (select count(*) from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r' and relrowsecurity) <> b.rls_tables then
        raise exception 'EMerriment: security policies or RLS changed during the migration 7 rollback; aborted.';
    end if;

    if has_table_privilege('anon', 'public.leads', 'select')
       or has_table_privilege('anon', 'public.email_deliveries', 'select')
       or has_table_privilege('authenticated', 'public.email_deliveries', 'select')
       or has_table_privilege('anon', 'public.purchases', 'select')
       or has_table_privilege('anon', 'public.purchases', 'insert')
       or has_table_privilege('authenticated', 'public.purchases', 'insert')
       or has_table_privilege('authenticated', 'public.purchases', 'update')
       or has_table_privilege('authenticated', 'public.purchases', 'delete') then
        raise exception 'EMerriment: unexpected API privileges after the migration 7 rollback; aborted.';
    end if;

    if not exists (select 1 from pg_trigger where tgrelid = 'public.leads'::regclass and tgname = 'emerriment_guard_lead_insert') then
        raise exception 'EMerriment: the quiz insert guard (migration 3) is missing; aborted.';
    end if;

    raise notice 'EMerriment: migration 7 consent guards removed; % leads, % purchases, % delivery records unchanged.',
        b.leads, b.purchases, b.deliveries;
end
$$;

notify pgrst, 'reload schema';

commit;
