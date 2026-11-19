# EMerriment database backups

Two kinds of backup, which protect against different things:

| | In-project backup (`emerriment_backup` schema) | Independent disaster-recovery copy |
|---|---|---|
| Where | inside the same Supabase database | files outside Supabase (your encrypted storage) |
| Protects against | a migration or a mistaken change damaging rows or rules | losing or corrupting the whole project, account or region |
| Does NOT protect against | project deletion, provider outage, a `drop schema emerriment_backup` | — (only as current as when it was made) |
| How | the SQL scripts in this folder, run in the SQL Editor | Pro plan daily backups, or an export you download yourself (below) |
| Holds personal data | yes; only the schema owner can read it (no API access) | yes — keep the files encrypted and private |

Migration 7 is additive (it adds columns, a table and rules; it deletes
nothing), so the in-project backup is the relevant safety net for it. An
independent copy is still recommended before any production change.

## Backup 20261119 (before migration 7) — PREPARED, NOT RUN

The suffix `20261119` is the planned backup date and only a label; the
real time is in `manifest_20261119.backed_up_at`.

Files:
* `20261119_create_backup_before_migration7.sql` — creates the backup in
  one transaction (REPEATABLE READ snapshot, fixed output settings).
  Refuses to run, writing nothing, if: backup 20261119 already exists;
  migration 7 is already applied; the public schema does not hold exactly
  23 tables; or **row level security could hide rows from the executing
  role** (it must be a superuser, have BYPASSRLS, or own every RLS table
  that does not force RLS — in the SQL Editor that is `postgres`, the
  owner). Aborts if any copy differs from its live table. Never touches
  the 2026-11-13 objects.
* `20261119_verify_backup.sql` — read-only verification (five `SET`
  lines for the output format, then one `SELECT`).

### What is captured, and what can actually be restored

| Captured (all suffixed `_20261119`) | Restorable? |
|---|---|
| `<table>` copies (23) + `manifest` (row count, MD5 fingerprint per table) | **Yes — data.** Rows go back with the restore procedures below. |
| `columns` (types, defaults, NOT NULL, identity, generated) | Reference. Tables are not recreated from it. |
| `constraints` (`pg_get_constraintdef`), `indexes` (`CREATE INDEX …`), `triggers` (`CREATE TRIGGER …`), `functions` (full `CREATE OR REPLACE FUNCTION …`, owner, ACL) | **Executable text** — can be re-run by hand, one object at a time, after checking it still fits the current schema. Not restored automatically. |
| `views`, `types` (enum labels, domain definitions) | Reference (views: executable `SELECT` body). |
| `sequences` (type, start, min, max, increment, cycle, cache, last value, is_called, owning column, owner) | Reference; the restore procedures set the leads sequence themselves. |
| `rls` (enabled/forced), `policies` (`pg_policies` rows) | Reference. Policies are stored as their parts, not as `CREATE POLICY` statements. |
| `objects_acl` (owner + raw ACL of schemas, tables, views, sequences, functions), `column_acl` (raw `attacl`), `default_acl` (`pg_default_acl`) | Reference — complete, raw form. |
| `table_grants`, `column_grants`, `function_grants`, `schema_grants` (the same ACLs expanded per grantee, built-in defaults included) | Reference — readable form for rebuilding `GRANT`s by hand. |
| `bucket_settings`, `event_triggers`, `migration_history` | Reference. |
| `settings` (output settings of the fingerprints), `baseline` (executing role, superuser, BYPASSRLS, counts) | Used by the verify script. |

Access rules and schema are restored by the rollback scripts
(`supabase/rollback/emerriment_migration7_rollback.sql` for migration 7),
not from this backup. A recorded definition is evidence of the previous
state, not a guarantee that re-running it is safe today.

### Running it (after approval)

1. SQL Editor → New query → paste `20261119_create_backup_before_migration7.sql` → Run.
   Expected: 23 rows, every `copy_matches = true`. `live_rows_now` is
   informational: if someone takes the quiz during or after the run, leads
   shows a higher number. That is expected — the copy is the snapshot.
2. New query → paste `20261119_verify_backup.sql` → Run. Every `BLOCKER`
   row must be `PASS`. Record the baseline row (the preflight showed 23
   tables and 80 leads; the baseline shows the actual snapshot).
3. Only then apply migration 7. Run step 2 again afterwards: all BLOCKER
   rows stay PASS; "live tables still equal the backup" turns WARN and
   "migration 7 applied since the backup" shows yes. That is expected.

### Restoring rows

Use the narrowest fix first:
* migration 7's **rules** misbehave → `emerriment_migration7_rollback.sql`
  (keeps every row);
* rows were **lost** → **Restore A** (default): puts back only rows that
  are missing; never deletes, never overwrites;
* rows are **corrupted** and must be replaced → **Restore B**: destructive,
  only with an explicit confirmation.

What the backup cannot give back: anything written after it — new leads,
unsubscribes, delivery records, and, after migration 7, **consent requests
and confirmations, which exist only in the live data**. Restore A never
touches those. Restore B keeps a copy of them and re-applies unsubscribes
and newer delivery records, but does not re-create confirmed consent:
activating consent by update is reserved for the confirmation page, and
the restore deliberately does not use the SQL Editor's privileged insert
path to manufacture consent.

Both procedures first copy the current rows of every listed table to
`emerriment_backup.<table>_prerestore_<UTC time>` (no API access, RLS on),
so the restore itself can be undone. List tables parents first
(`leads` before `email_deliveries`). Run in the SQL Editor; each is one
transaction — any error rolls everything back and the tables stay as they
were.

**Before restoring — preview (read-only).** Backup rows that are not in
the live table and would be put back. Check the lead ids against any
deletion request received after the backup: a restore would re-create
those people's data.

<!-- restore-preview-20261119:start -->
```sql
select 'leads' as table_name, b.id::text as id
  from emerriment_backup.leads_20261119 b
 where not exists (select 1 from public.leads p where p.id = b.id)
union all
select 'email_deliveries', b.id::text
  from emerriment_backup.email_deliveries_20261119 b
 where not exists (select 1 from public.email_deliveries p
                    where p.id = b.id
                       or (p.lead_id, p.kind, p.sequence_day) = (b.lead_id, b.kind, b.sequence_day))
 order by 1, 2;
```
<!-- restore-preview-20261119:end -->

**Restore A — missing rows only (default, non-destructive).**

<!-- restore-20261119:start -->
```sql
begin;
do $$
declare
    tables text[] := array['leads', 'email_deliveries'];  -- parents first; edit as needed
    stamp  text   := to_char(clock_timestamp() at time zone 'UTC', 'YYYYMMDD"_"HH24MISS');
    t text; cols text; n bigint; safety text;
begin
    -- 1. safety copy of the current rows
    foreach t in array tables loop
        safety := t || '_prerestore_' || stamp;
        execute format('create table emerriment_backup.%I as table public.%I', safety, t);
        execute format('revoke all on emerriment_backup.%I from public, anon, authenticated, service_role', safety);
        execute format('alter table emerriment_backup.%I enable row level security', safety);
    end loop;
    -- 2. insert backup rows that are missing; any row that already exists
    --    (same primary key or unique key) is left exactly as it is
    foreach t in array tables loop
        if not exists (select 1 from pg_index where indrelid = ('public.' || quote_ident(t))::regclass
                          and (indisprimary or indisunique)) then
            raise exception 'EMerriment: public.% has no primary or unique key; restore it by hand.', t;
        end if;
        select string_agg(quote_ident(column_name), ', ' order by ordinal_position) into cols
          from information_schema.columns
         where table_schema = 'emerriment_backup' and table_name = t || '_20261119';
        if cols is null then
            raise exception 'EMerriment: backup table %_20261119 not found', t;
        end if;
        execute format('insert into public.%I (%s) overriding system value select %s from emerriment_backup.%I on conflict do nothing',
                       t, cols, cols, t || '_20261119');
        get diagnostics n = row_count;
        raise notice 'EMerriment: % — % missing rows restored (safety copy %_prerestore_%)', t, n, t, stamp;
    end loop;
    -- 3. leads sequence: only when leads were restored, never backwards
    if 'leads' = any (tables) then
        perform setval(pg_get_serial_sequence('public.leads', 'id'),
                       greatest((select coalesce(max(id), 0) from public.leads),
                                (select coalesce(last_value, 0) from pg_sequences
                                  where schemaname = 'public'
                                    and sequencename = split_part(pg_get_serial_sequence('public.leads', 'id'), '.', 2)),
                                1));
    end if;
end
$$;
commit;
```
<!-- restore-20261119:end -->

**Restore B — full replacement (destructive; explicit confirmation).**
Replaces the listed tables with the backup. It refuses to run unless the
same session first sets the exact confirmation string, naming the tables
in the same order. It keeps safety copies, re-applies every unsubscribe
from the current data (by address), puts back newer delivery records
whose lead still exists, restores purchase-to-lead links, and never moves
the leads sequence backwards. Leads created after the backup, and consent
recorded after it, remain only in the safety copy.

<!-- restore-full-20261119:start -->
```sql
set emerriment.restore_replace = 'CONFIRM REPLACE leads,email_deliveries FROM 20261119';
begin;
do $$
declare
    tables text[] := array['leads', 'email_deliveries'];  -- parents first; must match the confirmation
    stamp  text   := to_char(clock_timestamp() at time zone 'UTC', 'YYYYMMDD"_"HH24MISS');
    t text; cols text; i int; n bigint; safety text;
begin
    if coalesce(current_setting('emerriment.restore_replace', true), '')
       <> 'CONFIRM REPLACE ' || array_to_string(tables, ',') || ' FROM 20261119' then
        raise exception 'EMerriment: full replacement not confirmed. Set emerriment.restore_replace = ''CONFIRM REPLACE % FROM 20261119'' first.',
            array_to_string(tables, ',');
    end if;
    -- deleting leads cascades to their delivery records: both must be handled together
    if 'leads' = any (tables) and not 'email_deliveries' = any (tables) then
        raise exception 'EMerriment: replacing leads also deletes their delivery records; list email_deliveries too.';
    end if;

    -- 1. safety copies (and purchase links, which deleting leads would clear)
    foreach t in array tables loop
        safety := t || '_prerestore_' || stamp;
        execute format('create table emerriment_backup.%I as table public.%I', safety, t);
        execute format('revoke all on emerriment_backup.%I from public, anon, authenticated, service_role', safety);
        execute format('alter table emerriment_backup.%I enable row level security', safety);
    end loop;
    if 'leads' = any (tables) and to_regclass('public.purchases') is not null then
        safety := 'purchase_links_prerestore_' || stamp;
        execute format('create table emerriment_backup.%I as select id, lead_id from public.purchases where lead_id is not null', safety);
        execute format('revoke all on emerriment_backup.%I from public, anon, authenticated, service_role', safety);
        execute format('alter table emerriment_backup.%I enable row level security', safety);
    end if;

    -- 2. replace: delete children first, insert parents first
    for i in reverse array_length(tables, 1) .. 1 loop
        execute format('delete from public.%I', tables[i]);
    end loop;
    foreach t in array tables loop
        select string_agg(quote_ident(column_name), ', ' order by ordinal_position) into cols
          from information_schema.columns
         where table_schema = 'emerriment_backup' and table_name = t || '_20261119';
        if cols is null then
            raise exception 'EMerriment: backup table %_20261119 not found', t;
        end if;
        execute format('insert into public.%I (%s) overriding system value select %s from emerriment_backup.%I',
                       t, cols, cols, t || '_20261119');
    end loop;

    -- 3. keep what happened after the backup where it is safe to do so
    if 'leads' = any (tables) then
        -- unsubscribes (by address) always win
        execute format($f$update public.leads l set status = 'Unsubscribed'
                           where coalesce(l.status::text, '') <> 'Unsubscribed'
                             and lower(btrim(l.email)) in (select lower(btrim(email)) from emerriment_backup.%I
                                                            where status::text = 'Unsubscribed')$f$,
                       'leads_prerestore_' || stamp);
        get diagnostics n = row_count;
        raise notice 'EMerriment: % unsubscribes re-applied', n;
        if to_regclass('public.purchases') is not null then
            execute format($f$update public.purchases p set lead_id = s.lead_id
                                from emerriment_backup.%I s
                               where p.id = s.id and p.lead_id is null
                                 and exists (select 1 from public.leads l where l.id = s.lead_id)$f$,
                           'purchase_links_prerestore_' || stamp);
        end if;
    end if;
    if 'email_deliveries' = any (tables) then
        -- newer delivery records stay, so no email is sent twice
        select string_agg(quote_ident(column_name), ', ' order by ordinal_position) into cols
          from information_schema.columns
         where table_schema = 'emerriment_backup' and table_name = 'email_deliveries_prerestore_' || stamp;
        execute format($f$insert into public.email_deliveries (%s)
                          select %s from emerriment_backup.%I d
                           where d.lead_id is null or exists (select 1 from public.leads l where l.id = d.lead_id)
                          on conflict do nothing$f$,
                       cols, cols, 'email_deliveries_prerestore_' || stamp);
    end if;

    -- 4. leads sequence: only when leads were restored, never backwards
    if 'leads' = any (tables) then
        perform setval(pg_get_serial_sequence('public.leads', 'id'),
                       greatest((select coalesce(max(id), 0) from public.leads),
                                (select coalesce(last_value, 0) from pg_sequences
                                  where schemaname = 'public'
                                    and sequencename = split_part(pg_get_serial_sequence('public.leads', 'id'), '.', 2)),
                                1));
    end if;
end
$$;
commit;
reset emerriment.restore_replace;
```
<!-- restore-full-20261119:end -->

**After either restore — check (read-only).** For each table: backup rows
whose primary key is still missing (expected 0). A delivery record skipped
because a newer record holds the same lead/kind/day shows here too; that
is correct (the newer record wins).

<!-- restore-check-20261119:start -->
```sql
select t as table_name,
       (xpath('/row/c/text()', query_to_xml(format(
           'select count(*) as c from emerriment_backup.%I b where not exists (select 1 from public.%I p where (%s) = (%s))',
           t || '_20261119', t, k.pk_p, k.pk_b), false, true, '')))[1]::text::bigint as backup_rows_still_missing
  from unnest(array['leads', 'email_deliveries']) t
 cross join lateral (
       select string_agg('p.' || quote_ident(a.attname), ', ' order by a.attnum) as pk_p,
              string_agg('b.' || quote_ident(a.attname), ', ' order by a.attnum) as pk_b
         from pg_index i
         join pg_attribute a on a.attrelid = i.indrelid and a.attnum = any (i.indkey)
        where i.indrelid = ('public.' || quote_ident(t))::regclass and i.indisprimary) k
 order by 1;
```
<!-- restore-check-20261119:end -->

Manual steps a restore can need:
* stop writes you do not want mixed in (for example pause the scheduled
  email functions) while restoring;
* review the preview for deletion requests;
* `profiles`: disable `emerriment_guard_profile_privileges` inside the
  same transaction and keep at least one administrator;
* undoing a restore: the `_prerestore_` copies hold the previous rows;
  delete them (they contain personal data) once the restore is confirmed.

### What this backup provides

| | |
|---|---|
| A. Data recovery | **Yes** — rows of the 23 public tables as of the snapshot (Restore A/B). |
| B. Schema recovery | **Partial** — definitions recorded; the migration rollback scripts are the recovery path. |
| C. Security metadata recovery | **Reference** — complete raw ACLs, owners, policies and default privileges; rebuilt by hand or by the rollback scripts. |
| D. Full project disaster recovery | **No** — same database; no auth accounts, no storage files. |

### Limitations

* Same database: lost if the project is deleted, suspended or corrupted.
* Copies are plain tables: constraints, defaults, indexes, triggers and
  identity are recorded, not attached.
* Not included: `auth` data (only the count), storage **files** (only
  bucket settings and the object count), Supabase internal schemas.
  Migration 7 changes none of these.
* Fingerprints are only comparable under the recorded output settings; the
  verify script sets and checks them.
* Access protection: the 20261119 and pre-restore tables have no access
  for PUBLIC or any API role **and** RLS enabled. The older 20261113
  tables have no grants but no RLS; they are protected because nobody but
  the owner can use the `emerriment_backup` schema.
* It contains personal data. Remove it once migration 7 has run cleanly
  for a while (`drop table emerriment_backup.<name>_20261119 …`).

### Independent disaster-recovery copy (your action, needs your approval)

Not created by any script here, because it downloads production data,
including personal data, to a computer. Options:

1. **Pro plan**: daily backups and point-in-time recovery in the
   dashboard — no files to manage.
2. **Supabase CLI dump** from your own machine (uses the linked project;
   asks for the database password), stored encrypted:
   ```bash
   npx supabase@3.1.0 db dump --linked -f emerriment_schema_20261119.sql
   npx supabase@3.1.0 db dump --linked --data-only -f emerriment_data_20261119.sql
   ```
   Restoring these goes into a fresh project (or an emergency rebuild),
   schema first, then data.
3. **Table Editor → Export → CSV** per table (data only, no structure).

Keep such files out of this repository and out of synced folders that are
not encrypted.

## Backup of 2026-11-13 (before the security migrations)

The Supabase Free plan has no project backups (Database → Backups says
"Free Plan does not include project backups"). Before any migration was
applied, `20261113_create_backup.sql` was run in the SQL Editor. It created
the private schema `emerriment_backup`, which is not exposed through the
website API and grants nothing to `anon` or `authenticated`:

| Object | Contents |
|---|---|
| `<table>_20261113` (22 tables) | full copy of every `public` table, rows exactly as they were |
| `manifest_20261113` | row count of each table at backup time |
| `policies_20261113` | every policy on `public` and `storage` (`pg_policies`) |
| `table_grants_20261113` | table privileges of `anon`, `authenticated`, `service_role` |
| `function_grants_20261113` | EXECUTE rights on every `public` function |
| `bucket_settings_20261113` | storage bucket settings |

The script's last query compares each copy with the live table; every row
must show `matches = true`.

### Restoring

* **Access rules only** (policies, functions, grants): run
  `supabase/rollback/emerriment_security_rollback.sql`. It removes every
  `emerriment_*` object and restores Supabase's default grants; the 27
  pre-existing policies were never dropped, so the old rules apply again.
  The lead ids added by migration 0 are kept (see below).
* **A table's rows** (for example `leads`), in the SQL Editor:

  ```sql
  begin;
  -- leads only: migration 0 made id NOT NULL; the backup has id = NULL.
  alter table public.leads alter column id drop identity if exists;
  alter table public.leads drop constraint if exists leads_pkey cascade;  -- also drops email_deliveries' FK
  alter table public.leads alter column id drop not null;
  delete from public.leads;
  insert into public.leads select * from emerriment_backup.leads_20261113;
  commit;
  ```

  Other tables: `delete from public.<t>; insert into public.<t> select * from emerriment_backup.<t>_20261113;`
  (inside one transaction; disable triggers on that table first if it has
  any, e.g. `alter table public.profiles disable trigger emerriment_guard_profile_privileges;`).

### Removing the backup later

Once the migrations have been verified in production for a while:
`drop schema emerriment_backup cascade;` It holds personal data (a copy of
leads and profiles), so do not keep it indefinitely.

### Off-site copy (recommended, manual)

The in-database copy does not protect against losing the whole project.
For an off-site copy, either upgrade to Pro (daily backups) or export the
tables from Table Editor → each table → Export → CSV and keep the files in
a private, encrypted location. This needs your own action; nothing in this
repository downloads production data.
