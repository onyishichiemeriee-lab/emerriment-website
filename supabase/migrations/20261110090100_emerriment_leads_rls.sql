-- =====================================================================
-- EMerriment security migration 2/5 — public.leads
-- ---------------------------------------------------------------------
-- STATUS: PREPARED, NOT APPLIED. Requires migration 1 (is_admin).
--
-- Goal
--   Anonymous quiz visitors may only INSERT a lead. They can no longer
--   read, change or delete any lead (leads hold names and email
--   addresses). Administrators keep full access from the CMS. Netlify
--   functions use the service role, which bypasses RLS.
--
-- Approach (non-destructive)
--   Existing policies are NOT dropped. RESTRICTIVE policies are added;
--   Postgres combines restrictive policies with AND, so whatever the
--   existing permissive policies allow, the result can never exceed
--   what these allow. Permissive policies are added so the intended
--   access still works.
--
-- Code already prepared for this (this branch):
--   * No quiz page reads the lead back (.select()) or updates it.
--   * The report email status is written by the send-email function.
--   * admin/subscribers.js, admin/dashboard.js and admin/email-sequence.js
--     run as a signed-in administrator and keep working.
--
-- Abuse limits (server-side, cannot be bypassed from the browser):
--   * Max 3 leads per address per 10 minutes and 10 per 24 hours. Inserts
--     for the same address are serialised with an advisory lock, so
--     simultaneous submissions cannot slip past the count.
--   * Max 120 new leads per minute in total (approximate under heavy
--     concurrency; it is a flood brake, not an exact quota).
--   * Initial email state is forced to "not yet emailed".
--
-- PENDING VERIFICATION against the audit output:
--   * leads.submitted_at is a timestamp (timestamptz) column.
--   * Columns email_status, last_email_sent, email_sequence_day, status
--     and next_email_due exist (the homepage quiz writes all of them).
--   * leads.email, name and recommendation are text columns.
--
-- Safe to re-run. Requires migration 1 (checked below).
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

select emerriment_private.enable_rls('public.leads');


-- ---------------------------------------------------------------------
-- Insert guard: normalise browser-supplied state and rate-limit.
-- SECURITY DEFINER so it can count leads (visitors cannot read them).
-- The caller is identified from the request's JWT role
-- (emerriment_private.request_role()), because current_user inside a
-- definer function is the owner.
-- ---------------------------------------------------------------------
create or replace function public.emerriment_guard_lead_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    caller text := emerriment_private.request_role();
    address text := lower(btrim(coalesce(new.email, '')));
begin

    -- Only browser (API) inserts are normalised and limited. The service
    -- role and administrators are trusted.
    if caller not in ('anon', 'authenticated') or public.emerriment_is_admin() then
        return new;
    end if;

    -- Server time, not the browser clock.
    new.submitted_at := now();

    -- A new lead has never been emailed.
    if new.email_status is not null then
        new.email_status := 'Pending';
    end if;
    new.last_email_sent := null;

    if new.email_sequence_day is not null then
        new.email_sequence_day := 1;
    end if;

    -- The first lesson is never due sooner than ~24 hours after the quiz.
    if new.next_email_due is not null and new.next_email_due < now() + interval '23 hours' then
        new.next_email_due := now() + interval '24 hours';
    end if;

    if new.status is not null and new.status::text <> 'New Lead' then
        new.status := 'New Lead';
    end if;

    -- Rate limits. Serialise inserts for this address so concurrent
    -- submissions see each other's rows (READ COMMITTED takes a fresh
    -- snapshot for each statement after the lock is granted).
    perform pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended('emerriment_lead:' || address, 0)
    );

    if (select count(*) from public.leads l
        where lower(btrim(l.email)) = address
          and l.submitted_at > now() - interval '10 minutes') >= 3
       or
       (select count(*) from public.leads l
        where lower(btrim(l.email)) = address
          and l.submitted_at > now() - interval '24 hours') >= 10
    then
        raise exception 'Too many quiz submissions for this email address. Please try again later.'
            using errcode = 'P0001';
    end if;

    if (select count(*) from public.leads l
        where l.submitted_at > now() - interval '1 minute') >= 120
    then
        raise exception 'The quiz is busy. Please try again in a minute.'
            using errcode = 'P0001';
    end if;

    return new;

end;
$$;

revoke all on function public.emerriment_guard_lead_insert() from public;

drop trigger if exists emerriment_guard_lead_insert on public.leads;

create trigger emerriment_guard_lead_insert
    before insert on public.leads
    for each row
    execute function public.emerriment_guard_lead_insert();

-- Supports the rate-limit and address look-ups.
create index if not exists emerriment_leads_address_idx
    on public.leads (lower(btrim(email)), submitted_at);

create index if not exists emerriment_leads_submitted_at_idx
    on public.leads (submitted_at);


-- ---------------------------------------------------------------------
-- Restrictive policies (the security boundary)
-- Scoped to the API roles only, so the service role, the SQL editor and
-- internal roles are unaffected.
-- ---------------------------------------------------------------------
drop policy if exists emerriment_leads_restrict_select on public.leads;
create policy emerriment_leads_restrict_select
    on public.leads as restrictive for select
    to anon, authenticated
    using ((select public.emerriment_is_admin()));

drop policy if exists emerriment_leads_restrict_update on public.leads;
create policy emerriment_leads_restrict_update
    on public.leads as restrictive for update
    to anon, authenticated
    using ((select public.emerriment_is_admin()))
    with check ((select public.emerriment_is_admin()));

drop policy if exists emerriment_leads_restrict_delete on public.leads;
create policy emerriment_leads_restrict_delete
    on public.leads as restrictive for delete
    to anon, authenticated
    using ((select public.emerriment_is_admin()));

-- Inserts must look like a real quiz submission.
drop policy if exists emerriment_leads_restrict_insert on public.leads;
create policy emerriment_leads_restrict_insert
    on public.leads as restrictive for insert
    to anon, authenticated
    with check (
        email is not null
        and char_length(email) between 3 and 254
        and position('@' in email) > 1
        and char_length(coalesce(name, '')) <= 100
        and char_length(coalesce(recommendation, '')) <= 1000
    );


-- ---------------------------------------------------------------------
-- Permissive policies (the intended access)
-- ---------------------------------------------------------------------
drop policy if exists emerriment_leads_quiz_insert on public.leads;
create policy emerriment_leads_quiz_insert
    on public.leads for insert
    to anon, authenticated
    with check (true);

drop policy if exists emerriment_leads_admin_select on public.leads;
create policy emerriment_leads_admin_select
    on public.leads for select
    to authenticated
    using ((select public.emerriment_is_admin()));

drop policy if exists emerriment_leads_admin_update on public.leads;
create policy emerriment_leads_admin_update
    on public.leads for update
    to authenticated
    using ((select public.emerriment_is_admin()))
    with check ((select public.emerriment_is_admin()));

drop policy if exists emerriment_leads_admin_delete on public.leads;
create policy emerriment_leads_admin_delete
    on public.leads for delete
    to authenticated
    using ((select public.emerriment_is_admin()));

commit;
