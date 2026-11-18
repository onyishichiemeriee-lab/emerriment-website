-- =====================================================================
-- EMerriment migration 7 — marketing consent, verified purchases,
-- customer onboarding delivery records
-- ---------------------------------------------------------------------
-- STATUS: PREPARED, NOT APPLIED.
-- Requires 20261110085900 … 20261113090000 (checked below).
--
-- 1. Marketing consent on public.leads (separate from the requested
--    quiz report):
--      marketing_consent          boolean, default false
--      marketing_consent_at       set by the database (never the browser)
--      marketing_consent_source   where it was given (allow-list)
--      marketing_consent_version  which consent wording was shown
--                                 (allow-list; wording kept in
--                                 EMAIL_LIFECYCLE_PLAN.md)
--      marketing_consent_withdrawn_at  set by the unsubscribe function
--    Visitors can only submit the choice, source and version; the
--    timestamps cannot be written through the API.
--
-- 2. public.purchases — VERIFIED purchases only (written by the service
--    role: a future signed Selar webhook, or an administrator recording a
--    purchase checked in the Selar dashboard). Clicking a checkout link
--    never creates a row. No browser access except admin read (CMS).
--
-- 3. public.email_deliveries can also record customer onboarding emails
--    (kind 'customer', keyed by purchase) with the same at-most-once
--    unique key as the report and the lesson sequence.
--
-- Non-destructive: no row is deleted or changed; existing leads keep
-- marketing_consent = false (nobody is enrolled retroactively).
-- Safe to re-run.
-- Rollback: supabase/rollback/emerriment_security_rollback.sql (part 7).
-- =====================================================================

begin;

do $$
begin
    if to_regprocedure('public.emerriment_is_admin()') is null
       or to_regclass('public.email_deliveries') is null
       or to_regprocedure('public.emerriment_set_admin(uuid, boolean)') is null then
        raise exception 'EMerriment: apply migrations 20261110085900 … 20261113090000 first.';
    end if;
end
$$;


-- ---------------------------------------------------------------------
-- 1. Consent columns
-- ---------------------------------------------------------------------
alter table public.leads add column if not exists marketing_consent boolean not null default false;
alter table public.leads add column if not exists marketing_consent_at timestamptz;
alter table public.leads add column if not exists marketing_consent_source text;
alter table public.leads add column if not exists marketing_consent_version text;
alter table public.leads add column if not exists marketing_consent_withdrawn_at timestamptz;

comment on column public.leads.marketing_consent is
    'EMerriment: explicit opt-in to educational emails (separate from the requested quiz report).';

create index if not exists emerriment_leads_marketing_consent_idx
    on public.leads (next_email_due) where marketing_consent;

-- Consent guard for browser (API) inserts. SECURITY DEFINER only to read
-- the request role from the private helper schema; it reads no table.
create or replace function public.emerriment_guard_lead_consent()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    caller text := emerriment_private.request_role();
begin

    if caller in ('anon', 'authenticated') and not public.emerriment_is_admin() then

        if coalesce(new.marketing_consent, false) then

            if new.marketing_consent_version is null
               or new.marketing_consent_version not in ('quiz-optin-2026-11-17') then
                raise exception 'Unknown consent wording version.' using errcode = 'P0001';
            end if;

            if new.marketing_consent_source is null
               or new.marketing_consent_source not in ('homepage_quiz', 'quiz_page') then
                raise exception 'Unknown consent source.' using errcode = 'P0001';
            end if;

            -- Server time, never the browser clock.
            new.marketing_consent_at := now();

        else

            new.marketing_consent := false;
            new.marketing_consent_at := null;
            new.marketing_consent_source := null;
            new.marketing_consent_version := null;

        end if;

        new.marketing_consent_withdrawn_at := null;

    elsif coalesce(new.marketing_consent, false) and new.marketing_consent_at is null then

        -- Trusted callers (service role, admins) recording a consent.
        new.marketing_consent_at := now();

    end if;

    return new;

end;
$$;

revoke all on function public.emerriment_guard_lead_consent() from public, anon, authenticated;

drop trigger if exists emerriment_guard_lead_consent on public.leads;
create trigger emerriment_guard_lead_consent
    before insert on public.leads
    for each row
    execute function public.emerriment_guard_lead_consent();

-- Visitors may submit the choice, source and version (never timestamps).
grant insert (marketing_consent, marketing_consent_source, marketing_consent_version)
    on public.leads to anon, authenticated;


-- ---------------------------------------------------------------------
-- 2. Verified purchases
-- ---------------------------------------------------------------------
create table if not exists public.purchases (
    id                  uuid primary key default gen_random_uuid(),
    email               text not null check (char_length(email) between 3 and 254 and position('@' in email) > 1),
    lead_id             bigint references public.leads (id) on delete set null,
    user_id             uuid references auth.users (id) on delete set null,
    product_code        text not null check (char_length(product_code) between 1 and 100),
    provider            text not null check (provider in ('selar', 'manual')),
    provider_order_ref  text not null check (char_length(provider_order_ref) between 1 and 200),
    amount              numeric(12, 2),
    currency            text check (currency is null or currency ~ '^[A-Z]{3}$'),
    verified_at         timestamptz not null default now(),
    verified_by         text not null check (char_length(verified_by) between 3 and 200),
    refunded_at         timestamptz,
    created_at          timestamptz not null default now(),
    constraint purchases_one_per_order unique (provider, provider_order_ref)
);

comment on table public.purchases is
    'EMerriment: VERIFIED purchases only (signed provider webhook or admin-checked order). Never created from a checkout click.';

alter table public.purchases enable row level security;

revoke all on table public.purchases from anon, authenticated;
grant select on table public.purchases to authenticated;

drop policy if exists emerriment_purchases_admin_read on public.purchases;
create policy emerriment_purchases_admin_read
    on public.purchases for select
    to authenticated
    using ((select public.emerriment_is_admin()));

create index if not exists emerriment_purchases_email_idx on public.purchases (lower(email));


-- ---------------------------------------------------------------------
-- 3. Customer onboarding delivery records
-- ---------------------------------------------------------------------
alter table public.email_deliveries
    add column if not exists purchase_id uuid references public.purchases (id) on delete cascade;

alter table public.email_deliveries alter column lead_id drop not null;

alter table public.email_deliveries drop constraint if exists email_deliveries_kind_check;
alter table public.email_deliveries
    add constraint email_deliveries_kind_check check (kind in ('report', 'sequence', 'customer'));

alter table public.email_deliveries drop constraint if exists email_deliveries_target_check;
alter table public.email_deliveries
    add constraint email_deliveries_target_check check (
        (kind = 'customer' and purchase_id is not null)
        or (kind <> 'customer' and lead_id is not null)
    );

create unique index if not exists email_deliveries_one_per_customer_email
    on public.email_deliveries (purchase_id, kind, sequence_day)
    where purchase_id is not null;

-- Still service-role only.
revoke all on table public.email_deliveries from anon, authenticated;

notify pgrst, 'reload schema';

commit;
