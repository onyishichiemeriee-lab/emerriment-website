# Migration tests on real PostgreSQL (PGlite)

```bash
npm run test:db
```

Applies the five migrations in `supabase/migrations/` to a **disposable,
in-memory** PostgreSQL database (PGlite 0.5.11 — PostgreSQL 18.6 compiled to
WebAssembly), then checks the actual row-level security behaviour.
No network connection is made, no Supabase project is contacted and no
credential is read. Every test creates and discards its own database.

`DB_TEST_FILTER="text" npm run test:db` runs only tests whose title contains
`text`.

PGlite is a **devDependency** (exact version, installed with
`--ignore-scripts`). It is not required by any Netlify function, so it is not
bundled into deployed functions.

## What is tested

* All five migrations in the documented order (5, 1, 2, 3, 4) against two
  plausible starting states:
  * **rls-off** — tables created without RLS;
  * **legacy-allow-all** — RLS on with "allow all" policies for anon and
    authenticated (the common dashboard default).
* Enum status columns (migration 5 adds `Sending` / `Unsubscribed`) and a CHECK
  constraint (left alone; `Sending` stays rejected, so send-email fails closed).
* Leads privacy, visitor inserts, normalisation of tampered values, content
  limits, per-address rate limit, admin and service-role access.
* Profiles: own-row access, self-promotion blocked, other users' profiles,
  upsert pattern used by `admin/auth.js`, last-administrator protection
  (demote and delete, via API, service role, SQL editor and auth cascade).
* Per-user data: `quiz_results`, `reading_history`, `ai_messages` (ownership
  through the conversation), `article_ratings` (public read kept).
* Content: public read, no public edits, admin edits, view counter function.
* Admin-only tables, `email_deliveries` uniqueness / access / cascade.
* Private helper schema not reachable by API roles; JWT role parsing.
* Failure recovery (migrations aborting cleanly), re-run safety (baseline
  keeps the original state), the audit/verification SQL, and rollback (exact
  restoration of RLS state, no data loss, re-apply after rollback).

Mutation checks (weakening a policy or the guard in a copy of the SQL) make the
relevant tests fail — including making the profile guard `SECURITY DEFINER`,
which would let any user promote themselves.

## What this does NOT prove

A pass means the SQL behaves as designed **on PostgreSQL with the assumed
schema**. It is not evidence that the live Supabase database is secure.

| Not reproduced | Consequence |
|---|---|
| Your real schema, constraints, defaults, triggers and existing policies | Reconstructed from the repository code. Run `supabase/audit/01_read_only_security_audit.sql` on the real project and compare. |
| PostgREST (HTTP, JWT signature verification, `Prefer` headers, schema cache) | Requests are simulated the way PostgREST does it internally: `SET LOCAL ROLE` plus `request.jwt.claims`. The `notify pgrst` reload is not observed. |
| Supabase Auth (GoTrue) and its signup trigger | `auth.users` is a stub; the signup path is simulated by inserting as the table owner. The real `supabase_auth_admin` privileges are not reproduced. |
| Exact `auth.uid()` / `auth.role()` | Re-implemented with Supabase's documented definitions. |
| Supabase role attributes | Roles are created with the essentials (service_role has BYPASSRLS). PGlite runs as a true superuser; on Supabase `postgres` is not a superuser, so SECURITY DEFINER functions run with Supabase's `postgres` privileges instead. |
| Supabase default privileges | Approximated: everything created in `public` is granted to anon/authenticated/service_role. |
| Concurrency | PGlite has one connection, so the advisory locks (per-address rate limit, last-admin protection) are not exercised by truly parallel transactions. |
| Extensions and event triggers | None are needed by the migrations; Supabase's own event triggers are absent. |
| PostgreSQL version | PGlite is PostgreSQL 18; Supabase projects typically run 15 or 17. The features used exist since 13. |

Before production, apply the migrations to a Supabase **staging/branch**
project and run `supabase/audit/02_post_migration_verification.sql` plus the
browser checks in `supabase/README.md`.
