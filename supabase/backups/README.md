# EMerriment database backups

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
