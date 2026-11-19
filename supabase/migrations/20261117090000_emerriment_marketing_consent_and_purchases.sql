-- =====================================================================
-- EMerriment migration 7 — marketing consent (double opt-in), verified
-- purchases, customer onboarding and confirmation delivery records
-- ---------------------------------------------------------------------
-- STATUS: PREPARED, NOT APPLIED.
-- Requires 20261110085900 … 20261113090000 (checked below).
--
-- 1. Marketing consent on public.leads — DOUBLE OPT-IN, separate from the
--    requested quiz report. Ticking the quiz box only records a REQUEST;
--    consent becomes active only when the person confirms from the email
--    sent to that address.
--      marketing_consent                   ACTIVE (confirmed) consent;
--                                          default false
--      marketing_consent_requested_at      box ticked (database time)
--      marketing_consent_source            where (allow-list)
--      marketing_consent_version           which wording was shown
--                                          (allow-list; wording kept in
--                                          EMAIL_LIFECYCLE_PLAN.md)
--      marketing_consent_at                confirmed (database time)
--      marketing_consent_token_hash        SHA-256 (hex) of the single-use
--                                          confirmation token; the token
--                                          itself is never stored
--      marketing_consent_token_expires_at  token expiry (at most 8 days)
--      marketing_consent_withdrawn_at      unsubscribed (database time)
--
--    Who may do what (caller = emerriment_private.request_role(), the JWT
--    role PostgREST sets; '' = a direct database connection such as the
--    SQL Editor, which carries no JWT):
--      * INSERT through the API (visitor, signed-in user, administrator,
--        service role): a quiz submission. Visitors may only send the
--        source and wording version (column privileges); with them the
--        lead records a pending REQUEST (database time). Consent is
--        always false on insert; confirmation, token and withdrawal
--        fields are cleared. An administrator has no more power than a
--        visitor.
--      * ACTIVATION by UPDATE (false → true): only the service role —
--        the confirm-subscription function, after the person clicks
--        "Confirm" — and only while the row holds a pending request,
--        an unexpired token, no withdrawal and is not Unsubscribed. The
--        database sets the confirmation time and destroys the token
--        (single use). Browser/API clients cannot activate consent;
--        signed-in users and administrators cannot activate or forge it
--        through the API (inserts are forced to a request, updates are
--        refused). The SQL Editor cannot activate an existing lead by
--        UPDATE either.
--      * DIRECT DATABASE CONNECTION (SQL Editor; request role ''): a
--        trusted, privileged operator path that bypasses the API consent
--        restrictions. Both guards let it through on INSERT (only the
--        CHECK constraint applies, so it can insert a lead with complete,
--        consistent consent evidence), it may withdraw consent and manage
--        tokens, and as the table owner it could disable the triggers.
--        It is not reachable from the website; it is protected by
--        database credentials and Supabase dashboard access.
--      * TOKEN: issued or cleared only by the service role (or a direct
--        connection), and only for a pending request.
--      * WITHDRAWAL: by the server (unsubscribe) or a direct connection,
--        or automatically when any caller marks the lead "Unsubscribed";
--        database time; outstanding tokens are destroyed. Repeat
--        withdrawals change nothing.
--      * The request evidence (time, source, version) and the
--        confirmation time are never rewritten, by anyone.
--      * At most one ACTIVE consent per address (unique index), so a
--        repeated quiz or confirmation never creates a second subscriber.
--      * A CHECK constraint keeps all of this consistent whoever writes.
--
-- 2. public.purchases — VERIFIED purchases only (written by the service
--    role: a future signed Selar webhook, or an administrator recording a
--    purchase checked in the Selar dashboard). Clicking a checkout link
--    never creates a row. No browser access except admin read (CMS).
--
-- 3. public.email_deliveries can also record customer onboarding emails
--    (kind 'customer', keyed by purchase) and consent confirmation emails
--    (kind 'confirm', keyed by lead) with the same at-most-once unique
--    keys as the report and the lesson sequence.
--
-- Non-destructive: no row is deleted or changed; existing leads keep
-- marketing_consent = false with no request (nobody is enrolled
-- retroactively, and nobody is sent a confirmation email).
-- Safe to re-run.
-- Rollback: supabase/rollback/emerriment_migration7_rollback.sql
--   (migration 7 ONLY; keeps all data and migrations 1–6).
-- Never use emerriment_security_rollback.sql to undo this migration: it
-- removes the protections of migrations 1–6 as well.
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
alter table public.leads add column if not exists marketing_consent_requested_at timestamptz;
alter table public.leads add column if not exists marketing_consent_source text;
alter table public.leads add column if not exists marketing_consent_version text;
alter table public.leads add column if not exists marketing_consent_at timestamptz;
alter table public.leads add column if not exists marketing_consent_token_hash text;
alter table public.leads add column if not exists marketing_consent_token_expires_at timestamptz;
alter table public.leads add column if not exists marketing_consent_withdrawn_at timestamptz;

comment on column public.leads.marketing_consent is
    'EMerriment: ACTIVE opt-in to educational emails, confirmed by the person from their email (double opt-in). Separate from the requested quiz report.';
comment on column public.leads.marketing_consent_token_hash is
    'EMerriment: SHA-256 (hex) of the single-use confirmation token. The token itself is never stored.';

create index if not exists emerriment_leads_marketing_consent_idx
    on public.leads (next_email_due) where marketing_consent;

-- One active subscriber per address: a repeated quiz or a second
-- confirmation can never create a duplicate subscriber.
create unique index if not exists emerriment_leads_active_consent_address_idx
    on public.leads (lower(btrim(email))) where marketing_consent;

-- Token look-up (and no two leads can hold the same token).
create unique index if not exists emerriment_leads_consent_token_idx
    on public.leads (marketing_consent_token_hash) where marketing_consent_token_hash is not null;

-- Consistency whoever writes the row. Every existing lead has
-- marketing_consent = false and all consent fields empty, so this validates.
alter table public.leads drop constraint if exists leads_marketing_consent_evidence_check;
alter table public.leads
    add constraint leads_marketing_consent_evidence_check check (
        -- a request always has its time, source and wording version
        (marketing_consent_requested_at is null) = (marketing_consent_source is null)
        and (marketing_consent_source is null) = (marketing_consent_version is null)
        -- active consent = a request confirmed at a recorded time
        and (not marketing_consent
             or (marketing_consent_requested_at is not null and marketing_consent_at is not null
                 and marketing_consent_withdrawn_at is null))
        and (marketing_consent_at is null or marketing_consent_requested_at is not null)
        -- a token belongs to a pending request and always expires
        and ((marketing_consent_token_hash is null) = (marketing_consent_token_expires_at is null))
        and (marketing_consent_token_hash is null
             or (marketing_consent_token_hash ~ '^[0-9a-f]{64}$'
                 and marketing_consent_requested_at is not null
                 and not marketing_consent
                 and marketing_consent_withdrawn_at is null))
        -- a withdrawal only exists where something was requested
        and (marketing_consent_withdrawn_at is null or marketing_consent_requested_at is not null)
    );

-- 1a. Insert guard: every API insert is a quiz submission. SECURITY
-- DEFINER only to read the request role from the private helper schema;
-- it reads no table.
create or replace function public.emerriment_guard_lead_consent()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    caller text := emerriment_private.request_role();
begin

    -- Direct database connection (SQL Editor, restore from backup): no
    -- JWT. Trusted; the CHECK constraint still enforces consistency.
    if caller = '' then
        return new;
    end if;

    -- Never active, confirmed, tokenised or withdrawn on insert.
    new.marketing_consent := false;
    new.marketing_consent_at := null;
    new.marketing_consent_token_hash := null;
    new.marketing_consent_token_expires_at := null;
    new.marketing_consent_withdrawn_at := null;

    if new.marketing_consent_source is not null or new.marketing_consent_version is not null then

        if new.marketing_consent_version is null
           or new.marketing_consent_version not in ('quiz-optin-2026-11-17') then
            raise exception 'Unknown consent wording version.' using errcode = 'P0001';
        end if;

        if new.marketing_consent_source is null
           or new.marketing_consent_source not in ('homepage_quiz', 'quiz_page') then
            raise exception 'Unknown consent source.' using errcode = 'P0001';
        end if;

        -- A pending request, at server time (never a client clock).
        new.marketing_consent_requested_at := now();

    else

        new.marketing_consent_requested_at := null;

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

-- 1b. Update guard: activation only by confirmation, withdrawal only by
-- the server (or "Unsubscribed"), evidence never rewritten.
create or replace function public.emerriment_guard_lead_consent_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    caller text := emerriment_private.request_role();
    trusted boolean := caller in ('service_role', '');
    was_unsubscribed boolean := coalesce(old.status::text, '') = 'Unsubscribed';
    unsubscribing boolean := coalesce(new.status::text, '') = 'Unsubscribed' and not was_unsubscribed;
    token_changed boolean :=
        new.marketing_consent_token_hash is distinct from old.marketing_consent_token_hash
        or new.marketing_consent_token_expires_at is distinct from old.marketing_consent_token_expires_at;
    withdrawing boolean;
begin

    -- Nothing about consent changed (for example a CMS edit of notes,
    -- or a status other than Unsubscribed): nothing to check.
    if not unsubscribing
       and not token_changed
       and new.marketing_consent is not distinct from old.marketing_consent
       and new.marketing_consent_requested_at is not distinct from old.marketing_consent_requested_at
       and new.marketing_consent_source is not distinct from old.marketing_consent_source
       and new.marketing_consent_version is not distinct from old.marketing_consent_version
       and new.marketing_consent_at is not distinct from old.marketing_consent_at
       and new.marketing_consent_withdrawn_at is not distinct from old.marketing_consent_withdrawn_at then
        return new;
    end if;

    -- The evidence of a request is never rewritten, by anyone.
    if new.marketing_consent_requested_at is distinct from old.marketing_consent_requested_at
       or new.marketing_consent_source is distinct from old.marketing_consent_source
       or new.marketing_consent_version is distinct from old.marketing_consent_version then
        raise exception 'Marketing consent records cannot be changed.' using errcode = 'P0001';
    end if;

    -- Activation: only the confirmation step (service role), only for a
    -- pending request holding a live token.
    if new.marketing_consent and not old.marketing_consent then

        if caller <> 'service_role' then
            raise exception 'Marketing consent is only activated when the person confirms from their email.'
                using errcode = 'P0001';
        end if;

        if old.marketing_consent_requested_at is null
           or old.marketing_consent_withdrawn_at is not null
           or was_unsubscribed
           or unsubscribing
           or old.marketing_consent_token_hash is null
           or old.marketing_consent_token_expires_at is null
           or old.marketing_consent_token_expires_at <= now()
           or token_changed then
            raise exception 'This consent confirmation is not valid.' using errcode = 'P0001';
        end if;

        -- Server time; the token is destroyed (single use).
        new.marketing_consent_at := now();
        new.marketing_consent_token_hash := null;
        new.marketing_consent_token_expires_at := null;
        return new;

    end if;

    -- The confirmation time is only ever set by the activation above.
    if new.marketing_consent_at is distinct from old.marketing_consent_at then
        raise exception 'Marketing consent records cannot be changed.' using errcode = 'P0001';
    end if;

    withdrawing := (old.marketing_consent and not new.marketing_consent)
        or new.marketing_consent_withdrawn_at is distinct from old.marketing_consent_withdrawn_at;

    if (withdrawing or token_changed) and not trusted then
        raise exception 'Only the server can change marketing consent; mark the lead Unsubscribed instead.'
            using errcode = '42501';
    end if;

    -- Withdrawal (unsubscribe function, SQL Editor, or "Unsubscribed" set
    -- by anyone): active or pending consent ends at server time and any
    -- outstanding confirmation token is destroyed.
    if withdrawing or unsubscribing then

        if old.marketing_consent
           or (old.marketing_consent_requested_at is not null and old.marketing_consent_withdrawn_at is null) then
            new.marketing_consent := false;
            new.marketing_consent_withdrawn_at := coalesce(old.marketing_consent_withdrawn_at, now());
        else
            -- Nothing to withdraw (or already withdrawn): unchanged.
            new.marketing_consent := old.marketing_consent;
            new.marketing_consent_withdrawn_at := old.marketing_consent_withdrawn_at;
        end if;

        new.marketing_consent_token_hash := null;
        new.marketing_consent_token_expires_at := null;
        return new;

    end if;

    -- Issuing a confirmation token (clearing one is always allowed).
    if new.marketing_consent_token_hash is not null then

        if old.marketing_consent_requested_at is null
           or old.marketing_consent
           or old.marketing_consent_withdrawn_at is not null
           or was_unsubscribed then
            raise exception 'There is no pending consent request to confirm.' using errcode = 'P0001';
        end if;

        if new.marketing_consent_token_expires_at is null
           or new.marketing_consent_token_expires_at <= now()
           or new.marketing_consent_token_expires_at > now() + interval '8 days' then
            raise exception 'A confirmation token must expire within 8 days.' using errcode = 'P0001';
        end if;

    end if;

    return new;

end;
$$;

revoke all on function public.emerriment_guard_lead_consent_change() from public, anon, authenticated;

drop trigger if exists emerriment_guard_lead_consent_change on public.leads;
create trigger emerriment_guard_lead_consent_change
    before update of status, marketing_consent, marketing_consent_requested_at,
                     marketing_consent_source, marketing_consent_version, marketing_consent_at,
                     marketing_consent_token_hash, marketing_consent_token_expires_at,
                     marketing_consent_withdrawn_at
    on public.leads
    for each row
    execute function public.emerriment_guard_lead_consent_change();

-- Visitors may submit only the request (source and wording version).
-- Consent itself, the times and the token are never writable by them.
revoke insert (marketing_consent, marketing_consent_requested_at, marketing_consent_at,
               marketing_consent_token_hash, marketing_consent_token_expires_at,
               marketing_consent_withdrawn_at)
    on public.leads from anon, authenticated;
grant insert (marketing_consent_source, marketing_consent_version)
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
    add constraint email_deliveries_kind_check check (kind in ('report', 'sequence', 'customer', 'confirm'));

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
