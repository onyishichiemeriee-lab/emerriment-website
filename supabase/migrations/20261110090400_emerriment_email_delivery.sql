-- =====================================================================
-- EMerriment security migration 5/5 — email states and delivery records
-- ---------------------------------------------------------------------
-- STATUS: PREPARED, NOT APPLIED. Independent of migrations 1–4.
--
-- 1. Status values used by the hardened email functions:
--      leads.email_status : 'Pending' (existing), 'Sending' (new, while a
--                           report is being sent), 'Sent' (existing)
--      leads.status       : 'New Lead' (existing), 'Unsubscribed' (new)
--    * If a column is an ENUM, the missing values are added.
--    * If a column is plain text with no CHECK constraint, nothing is
--      needed.
--    * If a column has a CHECK constraint, it is NOT altered
--      automatically; a NOTICE lists it for manual review. Until it allows
--      'Sending', send-email refuses to send (fails closed) unless
--      EMAIL_CLAIM_COMPAT_MODE=sent-before-delivery is set.
--
-- 2. public.email_deliveries — one row per email (report, or lesson N)
--    per lead, reserved BEFORE sending. Its unique key makes a duplicate
--    send impossible even after a crash or an overlapping scheduled run.
--    The Netlify functions detect the table automatically; before this
--    migration they keep working without it.
--    Only the service role can access it (RLS on, no policies, no grants).
--
-- Additive only: no existing column, row or policy is changed.
--
-- Rollback: supabase/rollback/emerriment_security_rollback.sql
--   (dropping email_deliveries removes the delivery history only).
-- =====================================================================

-- Part 1 runs outside a transaction block so ALTER TYPE ... ADD VALUE is
-- allowed on all supported Postgres versions.
do $$
declare
    col record;
    wanted text[];
    v text;
    con record;
begin
    for col in
        select c.column_name, c.udt_name, t.typtype
          from information_schema.columns c
          join pg_type t on t.typname = c.udt_name
         where c.table_schema = 'public' and c.table_name = 'leads'
           and c.column_name in ('email_status', 'status')
    loop
        wanted := case col.column_name
                      when 'email_status' then array['Pending', 'Sending', 'Sent']
                      else array['New Lead', 'Unsubscribed']
                  end;

        if col.typtype = 'e' then
            foreach v in array wanted loop
                execute format('alter type public.%I add value if not exists %L', col.udt_name, v);
            end loop;
            raise notice 'EMerriment: enum % now includes %.', col.udt_name, wanted;
        end if;

        for con in
            select conname, pg_get_constraintdef(oid) as def
              from pg_constraint
             where conrelid = 'public.leads'::regclass
               and contype = 'c'
               and pg_get_constraintdef(oid) ilike '%' || col.column_name || '%'
        loop
            raise notice 'EMerriment: REVIEW CHECK constraint % on leads.%: % — it must allow %.',
                con.conname, col.column_name, con.def, wanted;
        end loop;
    end loop;
end
$$;


begin;

-- Part 2: delivery records. lead_id uses the same type as leads.id.
do $$
declare
    id_type text;
begin
    if to_regclass('public.email_deliveries') is not null then
        raise notice 'EMerriment: email_deliveries already exists; left unchanged.';
        return;
    end if;

    select format_type(a.atttypid, a.atttypmod)
      into id_type
      from pg_attribute a
     where a.attrelid = 'public.leads'::regclass
       and a.attname = 'id'
       and not a.attisdropped;

    if id_type is null then
        raise exception 'EMerriment: leads.id not found; cannot create email_deliveries.';
    end if;

    execute format($f$
        create table public.email_deliveries (
            id                  uuid primary key default gen_random_uuid(),
            lead_id             %s not null references public.leads (id) on delete cascade,
            kind                text not null check (kind in ('report', 'sequence')),
            sequence_day        integer not null default 0 check (sequence_day between 0 and 14),
            status              text not null default 'sending' check (status in ('sending', 'sent')),
            provider_message_id text,
            created_at          timestamptz not null default now(),
            sent_at             timestamptz,
            constraint email_deliveries_one_per_email unique (lead_id, kind, sequence_day)
        )
    $f$, id_type);

    raise notice 'EMerriment: email_deliveries created (lead_id %).', id_type;
end
$$;

alter table public.email_deliveries enable row level security;

-- Service role only (it bypasses RLS). No policies = no API access.
revoke all on table public.email_deliveries from anon, authenticated;

comment on table public.email_deliveries is
    'EMerriment: one row per email per lead, reserved before sending (at-most-once). Service role only.';

commit;
