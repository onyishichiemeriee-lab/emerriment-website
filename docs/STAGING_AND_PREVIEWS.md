# EMerriment — staging and PR preview isolation

Goal: a deploy preview or branch deploy can never read or write production
data, send a real email, or start marketing automation. Production keeps
working exactly as before.

## 1. How it works

```
Netlify build (CONTEXT = production | deploy-preview | branch-deploy)
  └─ node scripts/write-runtime-config.js          (netlify.toml [build] command)
       ├─ js/runtime-config.js            browser: project URL + PUBLIC anon key, or fail-closed
       │     production      → production project (built-in public constants)
       │     preview/branch  → STAGING_PUBLIC_SUPABASE_URL / _ANON_KEY, else fail-closed
       └─ netlify/lib/deploy-context.json functions: build context + this deploy's URLs

Browser (63 pages)  /js/runtime-config.js → /js/supabase-config.js (guard) → client
  guard refuses: missing config · service-role/secret keys · production project on any
  host other than emerriment.com / www.emerriment.com / emerriment216.netlify.app ·
  a production build that is not the production project.  No fallback.

Functions (9)  netlify/lib/environment.js
  Supabase   production: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
             elsewhere : staging only (STAGING_SUPABASE_PROJECT_REF must match;
                         production URL/key refused — no fallback)
  Email      production only; elsewhere no Resend client, every send blocked
  Switches   EMAIL_CONFIRMATION_ENABLED / EMAIL_SEQUENCE_ENABLED /
             CUSTOMER_ONBOARDING_ENABLED count only in production
  Links      production: URL; elsewhere the deploy's own URL, never emerriment.com
  OpenAI     production only (openAiAllowed / getOpenAiKey); elsewhere mock, key never read
  AI logs    no message, profile, memories, history, replies or raw provider data in any context
  Context    from the build file; cannot be overridden at run time; unknown = not production
```

Deploy previews receive **no server secrets at all** (§3): only the public
staging URL and anon key for the browser build. Their functions therefore get
no Supabase client and answer "not configured"; `send-email` answers a deliberate
503 `email_not_configured` before touching any database (§4.9).

Scheduled functions (`email-sequence`, `customer-onboarding`) run only on
the published production deploy; even if one ran elsewhere it could not
send (switches off, email blocked).

## 2. Routes from a preview to production — before and after

| Route | Before | After |
|---|---|---|
| Browser Supabase clients (6 `supabase.js` copies, 55 pages) | hard-coded production URL + anon key | config from the build; guard refuses production outside the production hosts |
| Inline admin clients (8 pages, 6 scripts) | hard-coded production URL + anon key | same guard |
| 9 functions' service-role clients | whatever `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` the context had (production) | `createServiceClient()` — staging only outside production |
| Report / confirmation / lesson / onboarding email | production Resend key in previews | no Resend client outside production; `sendWithResend` blocks first |
| Marketing switches | honoured in any context | production only |
| Email links and confirmation pages | `URL` → emerriment.com in previews | the deploy's own URL |
| Link signatures derived from the service-role key | could derive production signatures from an inherited key | only from a key the guard accepts |
| OpenAI (`ai-chat`) | production key in previews | key production-only in Netlify **and** blocked in code outside production (mock, key never read, guard before the request) |
| Server secrets in previews | every production secret in "all contexts" | **none**: previews get only the public staging URL + anon key |

## 3. Netlify variables — verified matrix (applied 2026-11-19)

Netlify **Free plan**: values can differ per deploy context, but scopes
cannot be restricted (Pro/Enterprise only) — every value a context receives is
readable by that context's build **and** functions, and by any code in a PR
that is built as a preview. Therefore deploy previews receive **no server
secrets**: the staging `service_role` key is deliberately **not** in Netlify,
and production secrets exist in the **Production** context only. Secret flags
are used in addition to, never instead of, context isolation.

| Variable | Production | Deploy Previews | Branch deploys / local (`dev`) | Secret flag |
|---|---|---|---|---|
| `SUPABASE_URL` | production URL | — | — | no |
| `SUPABASE_SERVICE_ROLE_KEY` | production key | — | — | **yes** |
| `RESEND_API_KEY` | production key | — | — | **yes** |
| `EMAIL_LINK_SECRET` | production secret | — | — | **yes** |
| `EMERRIMENT_OPENAI_KEY` | production key | — | — | **yes** |
| `EMAIL_FROM` | production sender | — | — | no |
| `STAGING_PUBLIC_SUPABASE_URL` | — | `https://ayxakyyvomlzrsfznpeq.supabase.co` | — | no (written into browser code) |
| `STAGING_PUBLIC_SUPABASE_ANON_KEY` | — | staging **anon** JWT (role `anon`, ref staging) | — | no (written into browser code) |
| `EMERRIMENT_AI_MODE` | `mock` (all contexts) | `mock` | `mock` | no |

Not set anywhere, on purpose: a preview `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`,
`STAGING_SUPABASE_PROJECT_REF`, a preview `EMAIL_LINK_SECRET`, `EMAIL_REPLY_TO`,
`OPENAI_MODEL`, and the three switches `EMAIL_CONFIRMATION_ENABLED`,
`EMAIL_SEQUENCE_ENABLED`, `CUSTOMER_ONBOARDING_ENABLED` (set them in Production
only, at each activation step). Deleted 2026-11-19 as unused: `BREVO_API_KEY`
and `OPENAI_API_KEY` (a duplicate of the production OpenAI key; only the local
Supabase Studio config names it, from your own environment).

Verified with Netlify's per-context listing: production receives the six
production variables + `EMERRIMENT_AI_MODE`; deploy-preview receives only the two
`STAGING_PUBLIC_*` values + `EMERRIMENT_AI_MODE`; branch-deploy and `dev` receive
only `EMERRIMENT_AI_MODE`. The production values were written back unchanged
(SHA-256 fingerprints checked before writing; secret values are write-only
afterwards). Variable changes reach only **new** deploys; the published deploy
keeps the values it was built with.

**Preview functions that need the database or email are intentionally
unavailable** (`send-email`, `confirm-subscription`, `unsubscribe`,
`email-open`, `track-click`, `email-sequence`, `customer-onboarding`): without a
server key they get no Supabase client and answer "not configured" (500) or
"skipped"; `send-email` answers 503 `{"code":"email_not_configured"}` (§4.9) and
the quiz results say no report email was sent. All of these
are already blocked or meaningless in previews (no email is sent there, so there
are no links; switches and schedules are production-only). What previews do test
against staging: every page, the browser Supabase client with RLS (sign-up,
log-in, dashboard, CMS, quiz leads inserted with the anon key), and `ai-chat` in
mock mode. Server-side database behaviour is covered by the offline suites
(fake Supabase, PGlite) and, if ever needed, `netlify dev` against staging with
the staging key in your own shell only — never in Netlify.

To change a value later, use Site configuration → Environment variables →
the variable → per-context values; never add an "All" value for a production
secret, and keep "Deploy previews from forks: require approval" (`untrusted_flow: review`).

## 4. Staging project

### 4.1 The two projects

| | Production | Staging |
|---|---|---|
| Name | EMerriment | EMerriment staging |
| Project ref | `ioeulnjrozkbetaongbv` | `ayxakyyvomlzrsfznpeq` (eu-west-1, Postgres 17) |
| Serves | emerriment.com, the published Netlify production deploy | deploy previews and branch deploys only (after §4.6) |
| Data | real visitors, leads and customers | synthetic only (`@example.test`, "Staging …") |
| Local CLI link (`supabase/.temp`) | **yes — the link points here** | no |

Rules for every command:

* **Staging:** always `--remote=ayxakyyvomlzrsfznpeq`, preferably through
  `bash supabase/staging/run-on-staging.sh --remote=ayxakyyvomlzrsfznpeq …`,
  which refuses a bare `--remote`, the production ref and any other ref, and
  checks that the CLI reports `Target: project ayxakyyvomlzrsfznpeq (not the linked project)`.
* **Production:** only read-only commands from this procedure
  (`db query --read-only`, `migration list`, the schema export of step 00),
  each with `--remote=ioeulnjrozkbetaongbv` and its own approval.
* Never a bare `--remote` and never a command without `--remote`: both
  target the linked **production** project.
* Every remote CLI command creates or refreshes Supabase's temporary
  database login role `cli_login_postgres` on the project it targets
  (Supabase-managed; the CLI shows no deletion or expiry).

### 4.2 Current state (2026-11-19)

| Item | Staging |
|---|---|
| Schema (public, emerriment_private) | imported from production's schema-only export; matches production (§4.3 step 10) |
| API-role privileges | aligned with production (0 differences) |
| Signup trigger, `article-images` bucket + 4 policies, `ensure_rls` | created; policies use the staging administrator's UUID |
| Migration history | 8/8 recorded (repair only; no migration re-run) |
| Data | 3 articles, 3 products, 3 leads (synthetic), 3 accounts + profiles |
| 03b / supplementary suites | 382 pass, 0 fail, 1 skip / 39 pass, 0 fail |
| Auth settings (§4.8) | **applied and verified** 2026-11-19 — Site URL `http://localhost:8888`, the two redirect patterns, "Confirm email" off, built-in mailer |
| Netlify | old agent preview deploy deleted; **new deploy previews disabled** (`skip_prs = true`); variables **isolated** 2026-11-19 — public-only previews (§3) |

### 4.3 Rebuild procedure (in order)

Use this to rebuild staging from scratch (a new or emptied staging project).
Steps that touch a project need explicit approval each time. Scripts live in
`supabase/staging/` (index: `supabase/staging/README.md`); none contains a
key, password or customer record. Run from the repository root in Git Bash.

**Prerequisites**

* Node.js, Git Bash, `npx supabase@3.1.0` logged in (`supabase login`).
* **PostgreSQL 17 client tools without Docker.** CLI 3.1.0's `db dump`
  normally runs `pg_dump` in Docker. Without Docker, use the standalone EDB
  binaries (no server, no service, no administrator rights, no PATH change):
  1. Download `postgresql-17.12-2-windows-x64-binaries.zip` from
     `get.enterprisedb.com/postgresql/` and its `.sha256` sidecar; the
     SHA-256 must match (17.12-2: `520c8c6f19abb3b31fa83ec5e486e2f769eedd7593d94e60a7cda8a5bfb4df91`).
  2. Extract only `pgsql/bin/pg_dump.exe` and the DLLs it loads —
     `libpq.dll`, `libssl-3-x64.dll`, `libcrypto-3-x64.dll`, `libiconv-2.dll`,
     `libintl-9.dll`, `liblz4.dll`, `libzstd.dll` — plus the licence file, to
     `%LOCALAPPDATA%\Programs\pgsql17-client\bin`. Check each file's
     Authenticode signature is valid (EnterpriseDB Corporation).
  3. `pg_dump --version` from that folder → `pg_dump (PostgreSQL) 17.x`
     (must match staging's major version, 17).
* **Supabase Root 2021 CA** for `verify-full` TLS: Dashboard → Database
  settings → SSL → Download certificate, or
  `https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt`.
  SHA-256 fingerprint `80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA`
  (the same root is embedded in the Supabase CLI; the pooler's
  `*.pooler.supabase.com` certificate chains to it). Keep it outside the repository.

**00 — Export production's schema (approval: reads production metadata)**

```bash
PG_BIN=/c/Users/<you>/AppData/Local/Programs/pgsql17-client/bin \
SUPABASE_CA=/c/path/to/prod-ca-2021.crt \
bash supabase/staging/00_export_production_schema.sh "$TEMP/emerriment-staging-schema.sql"
node supabase/staging/verify/inspect-dump.js "$TEMP/emerriment-staging-schema.sql"
```

The script runs `db dump --remote=ioeulnjrozkbetaongbv --schema public,emerriment_private --dry-run`,
holds the generated wrapper (it contains a temporary credential) in memory only,
checks the target (production pooler user, no staging ref, schema-only, no SSL
override), applies exactly two Windows/Git Bash corrections — the schema pattern
quoted (`--schema='public|emerriment_private'`) and `--quote-all-identifiers`
spelled in full (the Windows `pg_dump` rejects the abbreviation) — keeps all 26
Supabase sed filters, and pipes it into bash with `PGSSLMODE=verify-full`.
Output stays outside the repository; note its SHA-256.
With Docker installed, `npx supabase@3.1.0 db dump --remote=ioeulnjrozkbetaongbv --schema public,emerriment_private -f <file>`
is equivalent. There is no `--linked` flag.

`inspect-dump.js` must show: 0 data statements (`INSERT`/`COPY`), only the
schemas `public` and `emerriment_private`, no `emerriment_backup`, nothing
defined in `auth`/`storage`/system schemas, no secrets, no email addresses.
The dump deliberately excludes `auth`, `storage`, `emerriment_backup` and all rows.

**01 — Preflight (read-only): staging is empty**

```bash
bash supabase/staging/run-on-staging.sh --remote=ayxakyyvomlzrsfznpeq --read-only supabase/staging/01_preflight_fresh_project_read_only.sql
```

Every row PASS (no tables, functions, policies, app schemas, history, auth users, buckets; Postgres 17).

**02 — Import the schema (approval)**

```bash
sha256sum "$TEMP/emerriment-staging-schema.sql"          # must equal the value from step 00
npx supabase@3.1.0 db query --remote=ayxakyyvomlzrsfznpeq --file "$TEMP/emerriment-staging-schema.sql" --output-format json --yes
```

The file has no transaction control of its own; the CLI sends it as one
request, which PostgreSQL runs as one transaction (verified 2026-11-19), so a
failure leaves nothing behind. Output: a single `set_config` row.

**03 — Align API-role privileges**

```bash
bash supabase/staging/run-on-staging.sh --remote=ayxakyyvomlzrsfznpeq supabase/staging/03_align_privileges.sql
```

Supabase's default privileges fire while the dump creates each table, so
`anon`/`authenticated` receive TRUNCATE, REFERENCES, TRIGGER and MAINTAIN that
production revoked; the dump can only add grants. The script removes exactly
those extras (166 role/privilege/table combinations) and writes the
`emerriment_private` schema ACL explicitly (USAGE is already denied to
anon/authenticated). It refuses unless staging matches the reviewed post-import
fingerprint and rolls back unless the result equals production's. Default
privileges are left as they are — identical to production's (future tables need
explicit revokes in both projects). If production's schema has changed, the
script refuses; regenerate the list with
`node supabase/staging/verify/compare-with-production.js --staging=ayxakyyvomlzrsfznpeq --emit-acl-revokes`,
review it, and update the script and its two fingerprints.

**04 — Signup trigger, storage bucket and policies, RLS event trigger**

```bash
bash supabase/staging/run-on-staging.sh --remote=ayxakyyvomlzrsfznpeq supabase/staging/04_structural_setup.sql
```

* `on_auth_user_created` — `AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user()`,
  as production (the function comes with the dump; it creates a non-admin profile).
* Bucket `article-images` — public, 5 MB (`5242880`), `image/jpeg, image/png, image/webp, image/gif, image/avif`,
  no AVIF auto-detection. **No files are copied.**
* The 4 `storage.objects` policies "Give access to a folder qt2lnz_0…3"
  (SELECT/INSERT/UPDATE/DELETE on `admin/assets/` of that bucket) — identical
  to production except the account UUID, which is the placeholder
  `00000000-0000-0000-0000-000000000000` (matches nobody) until step 08. No
  production account id is ever copied to staging.
* `ensure_rls` — `ON ddl_command_end WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')`
  → `public.rls_auto_enable()`. This is Supabase's "auto-enable RLS on new
  tables" feature (owner `postgres`, not an extension, not created by any
  EMerriment migration; it existed before the 2026-11-13 audit). It only ever
  runs `enable row level security` on new tables in `public`, so it cannot
  weaken RLS. The six `supabase_admin` platform event triggers already exist
  in every project.

Refuses unless staging is empty and lacks these objects; rolls back unless the
post-checks match production.

**05 — Record the migration history (no migration is run)**

The imported schema already contains all eight migrations. Verify, then record:

```bash
bash supabase/staging/run-on-staging.sh --remote=ayxakyyvomlzrsfznpeq --read-only supabase/staging/verify/migration-markers.sql   # all rows true
node supabase/staging/verify/compare-with-production.js --staging=ayxakyyvomlzrsfznpeq                                            # only expected differences
npx supabase@3.1.0 migration repair --status applied 20261110085900 20261110090000 20261110090100 20261110090200 20261110090300 20261110090400 20261113090000 20261117090000 --remote=ayxakyyvomlzrsfznpeq --yes
npx supabase@3.1.0 migration list --remote=ayxakyyvomlzrsfznpeq                                                                    # 8 local = 8 remote
```

`migration repair` only writes history rows. Never `db push` or re-run these
migrations on staging. Future migrations go to staging first:
`npx supabase@3.1.0 db push --remote=ayxakyyvomlzrsfznpeq --skip-vault --dry-run`, then without `--dry-run`.

**06 — Synthetic data**

```bash
{ echo "set emerriment.seed_target = 'staging';"; cat supabase/staging/seed_synthetic.sql; } > "$TEMP/emerriment-seed-run.sql"
bash supabase/staging/run-on-staging.sh --remote=ayxakyyvomlzrsfznpeq "$TEMP/emerriment-seed-run.sql"
```

Creates 3 articles (2 published, 1 draft), 3 products (2 approved), 3 leads
(`lead1–3@example.test`, no consent, no requests). Guards: the session marker
`emerriment.seed_target = 'staging'` is required; refuses if
`emerriment_backup` exists (production) or there are more than 20 leads;
requires migration 7. Re-running adds nothing (keyed by slug, name and email).

**07 — Three test accounts (Auth Admin API)**

```bash
node supabase/staging/07_create_test_accounts.js --remote=ayxakyyvomlzrsfznpeq preflight
node supabase/staging/07_create_test_accounts.js --remote=ayxakyyvomlzrsfznpeq create
```

Creates `staging-admin@example.test`, `staging-user-a@example.test` and
`staging-user-b@example.test` with `email_confirm: true` — confirmed at
creation, **no email is sent** (`confirmation_sent=false`) — and never inserts
into `auth.users` directly. The staging `service_role` key is fetched by the CLI
for the staging ref, kept in memory and checked (its `ref` claim must be
staging); it is never printed or saved. Passwords are random (32 characters)
and written only to
`%USERPROFILE%\.emerriment-staging\staging-test-accounts.json` — outside the
repository, inheritance removed, readable only by the current Windows user (the
script verifies the ACL has exactly that one entry). Never print, commit or
share the file. The tool refuses if staging already has users or the file
exists; it never resets passwords (do that in the staging dashboard if the
file is lost). The signup trigger creates the three profiles.

**08 — Promote the administrator; point the storage policies at it**

```bash
bash supabase/staging/run-on-staging.sh --remote=ayxakyyvomlzrsfznpeq supabase/staging/08_promote_admin_and_storage.sql
```

The documented bootstrap path: a trusted direct
`update public.profiles set is_admin = true` by the database owner for
`staging-admin@example.test` (API users cannot change `is_admin`: no column
privilege, and the profile guard refuses). Then the 4 storage policies get the
staging administrator's UUID. Refuses unless auth holds exactly the three
synthetic accounts with trigger-made, non-admin profiles and the 4 placeholder
policies; rolls back unless exactly one administrator exists and the only UUID
in the storage policies is the staging administrator's.

**09 — Security suites (staging; every test write is rolled back)**

```bash
npx supabase@3.1.0 db query --remote=ayxakyyvomlzrsfznpeq --file supabase/audit/03b_comprehensive_live_security_checks.sql --output-format json --yes
bash supabase/staging/run-on-staging.sh --remote=ayxakyyvomlzrsfznpeq supabase/staging/09_supplementary_security_checks.sql
```

Expected (2026-11-19):

* **03b:** 383 total, 382 PASS, 0 FAIL, 1 SKIP, 0 unexpected errors, OVERALL PASS —
  permissions 62 (+1 skip), identity 10, cross-user isolation 172, AI privacy 30,
  admin protection 18, leads 20, public content 24, CMS 16, rollback 28. The skip
  is `PRM-07` (needs `emerriment_backup`, which exists only in production).
* **Supplementary (09):** 39 PASS, 0 FAIL — signup/profile creation 4,
  synthetic-only data 6, purchases 10 (only administrators read; nobody but
  service_role writes), storage 14 (only the staging administrator lists or
  writes `admin/assets/`; bucket settings unchangeable by API roles), admin
  escalation 3, rollback 2. `STO-10` and `ADM-02` expect an outright denial
  (`42501`): Supabase's `storage.protect_delete` trigger rejects direct SQL
  deletes, and `authenticated` has no column privilege on `profiles.is_admin` —
  both identical in production. Do not relax these expectations.

**10 — Compare with production; confirm production isolation (read-only)**

```bash
node supabase/staging/verify/compare-with-production.js --staging=ayxakyyvomlzrsfznpeq
npx supabase@3.1.0 db query --remote=ioeulnjrozkbetaongbv --read-only --file supabase/staging/verify/production-isolation.sql --output-format json
npx supabase@3.1.0 migration list --remote=ioeulnjrozkbetaongbv
```

`compare-with-production.js` runs read-only metadata queries on both projects
(production always with `--read-only`; counts only, UUIDs masked) and exits 1 on
any unexpected difference. CLI output is parsed strictly: the known CLI update notice is
accepted, anything unexpected or malformed aborts with exit 2 (§4.9). Reviewed, expected differences: leads count;
`emerriment_backup` (production only); one CHECK constraint on `purchases`
printed with different brackets (same expression); the storage-policy account
UUID; no storage files on staging. Everything else — tables, columns,
constraints, indexes, 123 policies, 14 functions (compared without carriage
returns: production's bodies use CRLF), triggers, sequences, comments, table,
schema and default privileges, signup trigger, bucket, event triggers and
migration history — must be identical. `production-isolation.sql` must show 0
for every staging marker (`@example.test` leads, profiles and accounts, seed
articles/products), no new auth users, no consent records, 8 migration versions,
4 storage policies with one UUID and no placeholder.

### 4.4 `emerriment_private.rls_baseline` is empty on staging — intentionally

In production, `rls_baseline` records each table's RLS state from *before*
the security migrations: `emerriment_private.enable_rls()` (migration
`20261110090000`) wrote it the first time each migration switched RLS on. The
schema-only import brings the table but no rows, and that production record is
**not** copied to staging. Consequences:

* No policy, function used by the website, or security suite reads it at run
  time; 03b and the supplementary suite pass without it (03b only checks that
  API roles cannot read it).
* `supabase/rollback/emerriment_security_rollback.sql` restores RLS from this
  table, so on staging it could not reproduce production's pre-migration state
  (never run it on staging; it refuses without its explicit session flag).
  `supabase/audit/02_post_migration_verification.sql` section 4 shows no rows.
* If a future migration calls `enable_rls()` on staging, it records staging's
  current state (RLS already on) — harmless, but staging's baseline is then not
  production's.
* Copying production's rows (table names and true/false flags, no personal data)
  would need a separate decision.

### 4.5 What cannot be made fully reproducible

* Creating the staging project and its dashboard settings (§4.6) — manual.
* Steps 00, 02–08 each need an explicit approval; nothing runs them automatically.
* Step 03's fingerprints describe the 2026-11-19 production schema; after a
  production schema change regenerate the REVOKE list (step 03) and review it.
* The temporary CLI login role `cli_login_postgres` is created/refreshed by
  Supabase on each remote command; its cleanup is Supabase's.
* Test-account passwords exist only in the local credentials file on the
  machine that created them; if lost, reset them in the staging dashboard.
* The scripts are tested locally without network on a simulated staging
  database (`node tests/db/staging-scripts.pglite.test.js`, part of
  `npm run test:db`): guards, idempotency, steps 04/06/08 and all 39
  supplementary expectations. Step 03's alignment itself can only run on the
  real import (its refusal path is tested).

### 4.6 Before Netlify deploy previews may use staging

1. **Staging Auth settings** — exactly as in §4.8 (staging project only), verified
   with the read-only `config diff`.
2. **Netlify variables** — **done 2026-11-19**: the public-only matrix in §3
   (production secrets Production-only and secret-flagged; previews get only the
   two `STAGING_PUBLIC_*` values; no server secret in any non-production context).
3. `npm run test:email`, `npm run test:security` and `npm run test:db` pass.
4. The branch with the isolation code is pushed; only then re-enable deploy
   previews (Site configuration → Build & deploy → Continuous deployment →
   Deploy Previews; currently off, `skip_prs = true`, since 2026-11-19).
5. Prove isolation on one preview (section 4.7).

### 4.7 Prove isolation on a preview (after §4.6)

* `/.netlify/functions/email-features` → `{"consentConfirmation":false}`;
* no "not connected to a database" notice on pages; sign-in works with a
  staging account (password from the local credentials file);
* a quiz with an `@example.test` address creates a lead **in staging**;
  production `select count(*) from leads` is unchanged (`production-isolation.sql`);
* Resend dashboard shows no new email; the report page says the email
  could not be sent (expected in previews: no server key, no email);
* the AI assistant answers in mock mode; OpenAI usage shows no new request.

**Cleanup:** delete synthetic rows (`delete from public.leads where email like '%@example.test';`),
or delete the whole staging project. Rotate the staging service key if it was
ever shared (it is not stored in Netlify). Remove the two `STAGING_PUBLIC_*`
variables if staging is retired — previews then fail closed (no database).

### 4.8 Staging Auth configuration

Status: **applied and verified** (2026-11-19). Applied in the Supabase
dashboard of **EMerriment staging** (`ayxakyyvomlzrsfznpeq`) only, after checking
the project name; verified with the read-only `config diff`: exactly
`site_url`, `additional_redirect_urls` and `email.enable_confirmations` changed;
MFA (TOTP on), OTP length 8, email frequency 1 min, sign-ups allowed, manual
linking and anonymous sign-ins off, providers and SMTP (unset) unchanged;
production Auth unchanged; the three test accounts and the single administrator
intact. To re-apply on a rebuilt staging project, use the same dashboard pages.
Do **not** use `supabase config push`: it uploads the whole
`supabase/config.toml` and would also change unrelated staging settings (OTP
length, MFA, pooler, storage).

| Setting | Dashboard location (staging) | Value |
|---|---|---|
| Site URL | Authentication → URL Configuration → Site URL (Save changes) | `http://localhost:8888` |
| Redirect URLs | Authentication → URL Configuration → Redirect URLs → Add URL (both in one dialog) → Save URLs | `https://deploy-preview-*--emerriment216.netlify.app/**` and `http://localhost:8888/**` |
| Confirm email | Authentication → Sign In / Providers → User Signups → "Confirm email" (Save changes) | **off** |
| Custom SMTP | Authentication → Emails → SMTP Settings | **unset** (built-in mailer) |
| Everything else (MFA TOTP on, OTP length 8, email frequency 1 min, …) | — | unchanged |

Verify (read-only; must show exactly these values and nothing else changed). The
dashboard's redirect list may look empty until the page is reloaded; the CLI
reads the saved configuration:

```bash
npx supabase@3.1.0 config diff --remote=ayxakyyvomlzrsfznpeq     # site_url, additional_redirect_urls, email.enable_confirmations=false; no smtp
npx supabase@3.1.0 config diff --remote=ioeulnjrozkbetaongbv     # production: identical to before
```

**Why these values**

* **Site URL `http://localhost:8888`** (Netlify Dev): Supabase sends links that
  carry no `redirectTo` to the Site URL. The site's signup deliberately sends no
  `emailRedirectTo`, so any staging confirmation link would land there — a local,
  non-production address. Never use a production host here
  (`emerriment.com`, `www.emerriment.com`, `emerriment216.netlify.app`): on those
  hosts the browser guard switches to the production project.
* **Redirect URLs** use Supabase's glob syntax: `*` matches any characters
  except the separators `.` and `/`; `**` matches anything. So
  `deploy-preview-*--emerriment216.netlify.app/**` matches every Netlify deploy
  preview of this site (`deploy-preview-<PR number>--emerriment216.netlify.app`,
  any path, e.g. `/reset-password.html`) and nothing else: not the production
  hosts, not production deploy permalinks (`<deploy id>--emerriment216.netlify.app`),
  not other Netlify sites, not look-alike domains. Branch deploys are off
  (`allowed_branches = [main]`), so no `*--emerriment216` pattern is needed.
  The password-reset page is requested on the current origin
  (`js/auth.js`: `window.location.origin + "/reset-password.html"`), which these
  patterns cover for previews and `netlify dev`.
* **Confirm email off** — consequences:
  * a staging sign-up is confirmed at once and receives a session; the sign-up
    page then opens `dashboard.html` (no "check your inbox" step);
  * no confirmation email is ever sent by staging;
  * anyone who can open a deploy preview can create a staging account. Such
    accounts are ordinary users (the signup trigger always sets
    `is_admin = false`; API users cannot change it), and staging holds only
    synthetic data;
  * the three test accounts were created confirmed and are unaffected.
* **Custom SMTP unset** — the built-in mailer stays, with Supabase's documented
  limits: it only delivers to addresses of the Supabase organisation's team
  members (others fail with "Email address not authorized"), about 2 messages
  per hour, best effort with no delivery guarantee. Consequences: password-reset
  and email-change emails requested on staging reach team members only — the
  `@example.test` accounts cannot receive them (test the reset flow with a team
  member's own address, or locally). Staging must never reuse production's SMTP
  (production sends through Resend as `auth@mail.emerriment.com`): staging mail
  would then look like real EMerriment mail and use production's sending domain
  and credentials.
* **Production stays separate:** production Auth (Site URL
  `https://emerriment.com`, exact `/reset-password.html` redirect URLs, custom
  Resend SMTP, "Confirm email" on) is configured for real customers. Staging
  wildcards, a localhost Site URL or disabled confirmation must never be copied
  there, and no step in this document changes production Auth.

**Application behaviour checked (2026-11-19)**

* Sign-up (`js/auth.js`): no `emailRedirectTo`; with a returned session it reports
  success and `signup.html` opens `dashboard.html`; without one it shows the
  "check your inbox" text (that text names the production sender
  `auth@mail.emerriment.com`; it is not shown on staging once confirmation is off).
* Log-in: `signInWithPassword`; the "email not confirmed" branch cannot occur on
  staging once confirmation is off.
* Password reset: `redirectTo` = current origin + `/reset-password.html`, not
  influenced by user input; covered by the redirect patterns above.
* No auth flow builds an absolute `emerriment.com` URL: redirects after login and
  logout are relative (`dashboard.html`, `login.html`), so a preview stays on its
  own host.
* Unused file: `admin/auth.js` (loaded by no page) still names `/update-password.html`,
  which does not exist; it is not part of any flow.

### 4.9 First functional preview: defects found and fixed (WP4B → WP4C, 2026-11-20)

The first controlled preview of PR #2 (commit `8e1905e`, deploy preview 2,
staging) passed every isolation check but found these application defects.
They are fixed in the working tree (WP4C, local, not yet on a preview).

| Defect (WP4B) | Root cause | Fix (WP4C) | Regression tests |
|---|---|---|---|
| `login.html` logged the full login result (user record, access and refresh tokens) | `console.log("Login result:", result)` and `console.log(result.user)` | No auth result, session, user, email or raw error is logged on any auth page; `js/auth.js` logs Supabase errors only as `{kind, code, status}` (`EMAuth.safeError`). Also removed: the email address logged by `forgot-password.html`, the user record logged by `reset-password.html`, user ids logged on sign-up and login, raw errors in `Dashboard/dashboard-auth.js` | `tests/security/auth-log-privacy.dom.test.js` (synthetic tokens, email, id and password must never reach any console call; source scan) |
| Failed login showed no message | `.auth-message` is `display:none` until `.show`; the pages set text but never the class. Same on **sign-up** (including "check your email"), **forgot password** and **reset password** (including the expired-link and no-session notices) | One helper, `EMAuth.showMessage(el, text, kind)`: text only, `.show` + `info`/`error`/`success`, `role="alert"` for errors (else `status`), live region; success clears error styling; login button gets `aria-busy` while signing in; network failures read "We couldn't reach the sign-in service…" instead of "Failed to fetch" | same file (visibility, roles, loading state, success-after-failure, text-not-HTML, each page) |
| Encyclopedia lists empty | `loadArticles()` declared twice (the second, querying private `reading_history`, replaced the first), called the library namespace `supabase` instead of the client, and was never called | One loader in `js/encyclopediaCMS.js`: runs when the DOM and client are ready; one query `status = 'published'` (explicit, so drafts stay hidden even for a signed-in administrator), limit 200; featured / recommended / trending derived from it; distinct **loading / empty / no matches / error** states in a live region; cards built with `textContent` (no HTML from the database), https-only images, encoded slug links to the real reader `article/article.html`; search highlight without `RegExp`; "Continue reading" only with a session (own rows via RLS), guests get a sign-in hint | `tests/security/encyclopedia.dom.test.js` |
| AI page: permanent "Loading..." for guests | Only `skinType` was ever filled, from a non-existent column (`profile.skin_type`; the columns are `current_skin_type`, `current_concern`, `current_skin_score`; sensitivity lives in `quiz_results`) | The assistant stays free for guests: the profile card always reaches a final state — **guest** (dashes and a log-in / take-the-quiz hint, chat works), **signed-in** (own profile + latest quiz), **unavailable** (chat still works); 8 s timeout; history saving and personal context are optional and can no longer leave the input disabled | `tests/security/ai-guest.dom.test.js` |
| Preview `send-email` answered HTTP 500 | Missing server configuration was treated as a crash | Outside production `send-email` returns **503 `{"code":"email_not_configured"}`** right after request validation, before any database or provider work (no claim, no reservation, no Resend). Production is unchanged (200 when sent; a production misconfiguration is still 500). `quiz.html` now shows the real outcome under the results (sent / email not available here / failed); the homepage quiz has its own "not available" wording | `tests/email/email-unavailable.test.js`; `environment-isolation` [7] now expects 503 |
| `compare-with-production.js` live mode broke | Supabase CLI 3.1.0 prints an update notice after the JSON | Strict parser (`parseCliOutput` / `validateRows`): exactly one JSON object; only the `Target:` line and the two known update-notice lines are tolerated; anything else, truncated JSON, an `error` payload or rows missing required fields abort (exit 2) — a corrupt comparison can never print "matches" | `tests/db/cli-output-parser.test.js` with fixtures in `tests/fixtures/supabase-cli/` (part of `npm run test:db`) |

Also fixed while in these paths: `js/quiz.js` no longer logs the saved
`quiz_results` row (user id and answers) or raw PostgREST errors; the homepage
quiz (`js/script.js`) no longer logs the visitor's search text or raw save errors.

**CSP and the Netlify review drawer.** Previews log
`Framing 'https://app.netlify.com/' violates … default-src 'self'`: the optional
Netlify Drawer (review toolbar) is blocked because the CSP has no `frame-src`
and falls back to `default-src 'self'`. This is intentional and harmless — the
site never frames anything and works without the drawer — so the CSP is **not**
widened. Reviewers use the PR conversation instead of the drawer.

**What a preview of these fixes must show** (staging data, no new accounts):
1. `login.html`: a wrong password shows a visible red "Incorrect email or password."; the console shows only `{kind, code, status}` and `{success:false}`.
2. `encyclopedia.html`: the 2 published synthetic articles; the draft is absent; "Read Article" opens `article/article.html?slug=…`.
3. `ai/index.html` signed out: no "Loading..."; guest hint; a question gets a mock reply (`mode: mock`).
4. `POST /.netlify/functions/send-email` → `503 {"code":"email_not_configured"}`; `email-features` → `{"consentConfirmation":false}`.
5. No horizontal overflow at 320–1440 px on those pages.

### 4.10 Admin CMS authorization, redirects and logging (WP4E, 2026-11-20)

The second preview (commit `a1d1aa8`, WP4D) found two admin CMS defects. Fixed
locally in WP4E; **not yet validated on a Netlify preview** (needs a new push).

**Redirect loop — cause.** `admin/js/dashboardCMS.js` sent a signed-in
non-administrator to `"admin/../dashboardCMS.html"`. Relative to
`/admin/dashboardCMS.html` that resolves to the same page, which redirected
again: an endless reload loop (4 loads in 5 s on the preview). The other CMS
modules each had their own copy of the check, with different and partly wrong
destinations (`edit-productCMS` → the admin dashboard, i.e. into the loop;
`settingsCMS` / `user-detailsCMS` → the login page for a signed-in user), a
blocking `alert()` before redirecting, `productsCMS` loaded products without
looking at `is_admin`, and `new-articleCMS` / `new-productCMS` had no check.

**Fix — one shared guard, `admin/js/admin-guard.js`,** loaded before the page
script on all 11 CMS pages; every module now runs
`await EMAdminGuard.requireAdmin()` and loads nothing unless it returns access:

| Visitor | Result |
|---|---|
| not signed in | `location.replace("/admin/loginCMS.html")` |
| signed in, `is_admin` is not `true` | `location.replace("/dashboard.html")` (normal dashboard) |
| administrator | stays; the page then loads its data |
| no Supabase client, or the check itself fails | stays, shows a notice, loads nothing (fail closed, no redirect) |

Destinations are fixed root-relative paths, so the current host is kept (a
staging preview stays on the preview; nothing points at `emerriment.com`) and
nothing is taken from the URL. The guard resolves the destination first and
refuses a redirect to the page that is already open or to another origin, so a
loop cannot happen. The new-article / new-product forms stay disabled until the
guard grants access and re-check before saving. The guard is a user-experience
gate only: the security boundary is still RLS and table privileges, which were
not changed.

The CMS login page (`admin/loginCMS.html`) never worked: `admin/js/login.js`
listened for a `#loginBtn` that does not exist. It now handles
`#adminLoginForm`, shows text-only messages ("Incorrect email or password."),
logs errors only as `{kind}` and goes to `/admin/dashboardCMS.html`, where the
guard applies.

**Admin console privacy.** `usersCMS.js` logged the signed-in user's id and
email and the full admin profile; `user-detailsCMS.js` logged the viewed user's
id (four places, plus an uncaught error containing it) and the full user record;
several modules logged raw Supabase error objects. All 27 such calls now log a
plain message, or errors as `{kind, code, status}` (`EMAdminGuard.safeError`);
counts (e.g. "Loaded 3 users") and product ids remain.

**Tests.** `tests/security/admin-cms.dom.test.js` (17): guard on every page;
anonymous → CMS login; non-admin → `/dashboard.html` exactly once on every CMS
page with only the own-profile query made; administrator stays and data loads
only after the check; failed check fails closed; same-page / cross-host /
URL-supplied destinations refused; forms disabled for non-admins; CMS login;
synthetic user ids, emails, names, raw error text and tokens never reach the
console. Mutation checks: the old `dashboardCMS.js`, the old `usersCMS.js`, the
old destination inside the guard and a raw `console.error(error)` each make the
suite fail.

**Local validation against staging (read-only, headless Chrome, working tree
served on `localhost:8888` with the preview's public staging configuration):**
19/19 — anonymous → CMS login; user A on five CMS pages → `/dashboard.html`
once; CMS login wrong/right password; administrator sees counts and the three
users; no account email, token or password in the console; no writes; staging
counters unchanged.

**Testing note — clock skew.** The test machine's clock was about 13 hours
ahead. Browsers there treat fresh Supabase tokens as expired, refresh them
repeatedly, and occasionally lose the session (requests then go out as `anon`
and fail with `42501`). The guard correctly failed closed in that case. Correct
the test browser's clock (or the machine clock) before judging authenticated
browser tests; real visitors with correct clocks are not affected.

**Still open (separate packages; not changed in WP4E):**
1. Dashboard article links (`Dashboard/dashboard-history.js`, `-reading.js`, `-topics.js`, `-ui.js`) point at the non-existent root `article.html` (the reader is `article/article.html`).
2. The article reader (`article/article/js/article.js`) builds the page with `innerHTML` from database fields — stored-XSS risk if article content is ever unsafe.
3. The article reader increments the view counter on every page load (a write on every visit, including tests; it changed one synthetic staging article from 0 to 1 views in WP4C).
4. Raw Supabase errors are still logged by the `Dashboard/*.js` modules; admin CMS modules still `alert()` raw `error.message` text to the administrator on failed saves/deletes (shown, not logged); legacy, unreferenced admin scripts (`admin/dashboardD.js` logs a profile object) and the legacy non-CMS admin pages (`admin/dashboard.html`, `products.html`, …) were not reviewed in depth.
5. The CSP `script-src` contains `'unsafe-inline'` (needed by inline page scripts today).

## 5. Local development

`netlify dev` does not run the build, so the committed fail-closed
`js/runtime-config.js` applies (no database). To work against staging:

```bash
EMERRIMENT_CONTEXT=dev STAGING_PUBLIC_SUPABASE_URL=<staging url> STAGING_PUBLIC_SUPABASE_ANON_KEY=<staging anon key> node scripts/write-runtime-config.js
```

Production values are refused in `dev`. Restore the committed defaults before
committing: `git checkout js/runtime-config.js netlify/lib/deploy-context.json`
(the isolation tests fail if real values are committed).

## 6. PR and deployment safety checklist

Before opening a PR (deploy previews ON):
- [ ] staging project ready (§4.3 steps 00–10 done, both suites as expected) and its Auth settings done (§4.6 item 1)
- [ ] Netlify variables scoped (section 3); production secrets production-only
- [ ] `npm run test:email`, `npm run test:security` and `npm run test:db` pass (includes the isolation suite and the staging-script tests)

Or, without staging: turn Deploy Previews off before opening the PR — a
preview would build but fail closed (no database, no email).

Before merging to `main` (production deploy):
- [ ] the production build log shows `EMerriment runtime config: context=production, browser Supabase=production project`
- [ ] after deploy: homepage, quiz, login and dashboard work; no configuration notice
- [ ] `/.netlify/functions/email-features` → `{"consentConfirmation":false}`
- [ ] rollback ready: Netlify → re-publish the previous production deploy

## 7. Limits

- Production deploy permalinks (`<id>--emerriment216.netlify.app`) and any
  other host fail closed in the browser by design.
- `ai-chat` calls OpenAI in production only (code guard + Production-only key);
  previews answer in mock mode.
- Netlify Free plan: no scope restriction, so anything a preview receives is
  readable by PR code — hence previews receive only public values (§3).
- Supabase Auth emails on staging are real but limited to team members'
  addresses (built-in mailer, §4.8). (The three test accounts were created
  confirmed through the Admin API; no email was sent.)
- The browser guard prevents *this site's code* from using production in a
  preview. Anyone can still call the public production API with the public
  anon key — that is what RLS and the guards from migrations 1–7 protect.
