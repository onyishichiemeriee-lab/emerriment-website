# EMerriment — Supabase security migrations and production checklist

**Status (2026-11-19): all eight migrations are applied to production**
(`ioeulnjrozkbetaongbv`) and recorded in its migration history
(`npx supabase@3.1.0 migration list --remote=ioeulnjrozkbetaongbv`: 8 local =
8 remote). Migrations 1–6 were applied 2026-11-13/15 (`PRODUCTION_RUNBOOK.md`),
migration 7 on 2026-11-19 (see its row below). **Staging**
(`ayxakyyvomlzrsfznpeq`) was built from production's schema-only export, so it
already contains all eight; its history was recorded with `migration repair`
only (`docs/STAGING_AND_PREVIEWS.md` §4.3). Do not re-run them where they are
recorded as applied; new migrations go to staging first.

Before they were applied, the migrations were checked statically
(`npm run test:security`) and executed against a disposable local PostgreSQL
that imitates Supabase (`npm run test:db`, PGlite — see `tests/db/README.md`
for what that does and does not prove); those checks still run on every
change. Every production step needs the owner's approval.

If a migration fails in `psql` or another persistent connection, run
`ROLLBACK;` before retrying (the SQL Editor starts a fresh connection for each
run, so this is automatic there). A failed migration changes nothing.

| Path | What it is |
|---|---|
| `audit/01_read_only_security_audit.sql` | Read-only metadata audit. Run first and **save the output**. |
| `audit/02_post_migration_verification.sql` | Read-only checks to run after applying. |
| `audit/03_live_rls_role_checks.sql` | Runs as anon, two real non-admin users and the admin (PostgREST roles + JWT claims), rolls back every write, prints pass/fail per check. Run after applying. |
| `backups/20261113_create_backup.sql` | In-database backup (schema `emerriment_backup`). **Run on 2026-11-13; verified.** See `backups/README.md`. |
| `migrations/20261110085900_emerriment_leads_identity.sql` | Migration 0: `leads.id` was NULL for every lead with no primary key — numbers them, adds identity + primary key, fixes the quoted defaults (`'pending'` with quotes). Must run before 090400. |
| `migrations/20261110090000_emerriment_security_helpers.sql` | Private helper schema (RLS baseline for rollback, request role), `emerriment_is_admin()`, profile privilege guard (no self-promotion, last admin protected against demotion **and deletion**, race-safe). |
| `migrations/20261110090100_emerriment_leads_rls.sql` | `leads`: visitors insert only; admins read/update/delete; server-side, race-safe per-address rate limits; safe initial email state. |
| `migrations/20261110090200_emerriment_user_data_rls.sql` | `profiles` and per-user tables: own rows only (admins see all). Ratings **reads unchanged**. |
| `migrations/20261110090300_emerriment_content_admin_rls.sql` | Articles/products/collections: admin-only writes, reads unchanged; settings/AI analytics/product clicks admin-only; `emerriment_increment_article_views()`. |
| `migrations/20261110090400_emerriment_email_delivery.sql` | `Sending` / `Unsubscribed` values (enum) and the `email_deliveries` table (needs migration 0). |
| `migrations/20261113090000_emerriment_production_hardening.sql` | Migration 6: `emerriment_set_admin()` (only way to change admin access), column privileges on `profiles`/`leads`, least-privilege grants (no TRUNCATE, anon read-only on content), public read of approved products and their article links, rating summary function, view counter for published articles only, AI messages tied to the sender's own conversation, trigger functions not callable, RLS indexes, image-only storage bucket. |
| `migrations/20261117090000_emerriment_marketing_consent_and_purchases.sql` | Migration 7 (**applied to production 2026-11-19**, after the read-only preflight and the verified 2026-11-19 backup; validated 03b 384/384; history recorded; staging: history recorded on the imported schema): separate marketing consent on `leads` with double opt-in (pending request at database time, allow-listed source and wording version; active only after the person confirms from the email; single-use hashed token), `purchases` (verified purchases, service role only), customer onboarding records in `email_deliveries`. See `docs/PRODUCTION_ACTIVATION_CHECKLIST.md`. |
| `rollback/emerriment_security_rollback.sql` | Full rollback of **all seven** migrations: removes everything they created and restores the recorded RLS state. Requires `set emerriment.full_rollback = 'all-seven-migrations';` first. Never for migration 7 alone. |
| `rollback/emerriment_migration7_rollback.sql` | Rollback of **migration 7 only**: removes the two consent guards and the visitor consent-column privilege; keeps all data and every migration 1–6 protection. Run only after the website has been rolled back. |

## Design

* **Nothing existing is dropped.** Restrictive policies are added (Postgres
  ANDs them with whatever exists) plus permissive policies for the intended
  access. All created objects are named `emerriment_*` (plus
  `email_deliveries` and the `emerriment_private` schema).
* Restrictive policies target only `anon` and `authenticated`; the service role
  (Netlify functions), the auth signup trigger and the SQL editor are not
  affected.
* Where a content or ratings table had RLS **off** before, switching it on would
  hide it from the website, so its open read access is recreated exactly. Where
  RLS was already on, existing read policies are left alone.
* Migration 1 aborts if no administrator exists (CMS lock-out protection) or if
  `profiles` uses FORCE RLS. Migrations 2–4 abort if migration 1 is missing.
* Every migration is safe to re-run; the original RLS state is recorded only
  the first time.

## Production execution plan (requires your approval)

Preconditions
1. Take a database backup (Supabase Dashboard → Database → Backups), or confirm
   point-in-time recovery is enabled.
2. Run `audit/01_read_only_security_audit.sql` and save every result.
3. Check the audit against the "PENDING VERIFICATION" notes at the top of each
   migration — in particular:
   * `leads.submitted_at` is `timestamptz`; `leads.email`, `name`,
     `recommendation` are text;
   * the ownership columns (`user_id`, `ai_messages.conversation_id`) exist;
   * `profiles` is not FORCE RLS;
   * whether `email_status` / `status` have CHECK constraints (migration 5 only
     reports these — they must allow `Sending` / `Unsubscribed`).
   Send me the output if anything differs and I will adjust the migrations.

Order (filename order; each file in the SQL Editor, one at a time; read
every NOTICE; stop at the first error — see APPLY_2026-11-13.md)
0. `backups/20261113_create_backup.sql` — **done 2026-11-13** (22 tables, counts match)
1. `20261110085900_emerriment_leads_identity.sql`
2. `20261110090000_emerriment_security_helpers.sql`
3. `20261110090100_emerriment_leads_rls.sql`
4. `20261110090200_emerriment_user_data_rls.sql`
5. `20261110090300_emerriment_content_admin_rls.sql`
6. `20261110090400_emerriment_email_delivery.sql`
7. `20261113090000_emerriment_production_hardening.sql`
8. `audit/02_post_migration_verification.sql`, then
   `audit/03_live_rls_role_checks.sql` — every row must show `pass = true`.

(The earlier plan ran 090400 first. On the live schema that fails: its
foreign key needs a unique `leads.id`, which only exists after migration 0.)

Verify in the browser console on the live site

Signed **out**:

```js
await supabaseClient.from("leads").select("*").limit(1)          // → data: []
await supabaseClient.from("profiles").select("*").limit(1)       // → data: []
await supabaseClient.rpc("emerriment_increment_article_views", { article_id: "<an article id>" }) // → new view count
```

Signed in as an **ordinary test user**:

```js
const { data: { user } } = await supabaseClient.auth.getUser();
await supabaseClient.from("profiles").update({ is_admin: true }).eq("id", user.id)
// → error: permission denied (is_admin is not writable through the API)
await supabaseClient.rpc("emerriment_set_admin", { target_user: user.id, make_admin: true })
// → error "Only an administrator can change administrator access."
await supabaseClient.from("quiz_results").select("user_id")      // → only your own rows
```

As the **administrator**: CMS users, subscribers, articles, products, settings
and AI analytics load and save; toggle admin on a test account and back (the CMS now calls `emerriment_set_admin`).
Then take the homepage quiz (anonymous and signed in) and `quiz.html` once.

Rollback of all seven migrations: first
`set emerriment.full_rollback = 'all-seven-migrations';`, then run
`rollback/emerriment_security_rollback.sql` (restores the RLS state recorded
in `emerriment_private.rls_baseline`, then removes the EMerriment objects).
Enum values added by migration 5 remain (harmless). This also removes the
protections of migrations 1–6 — to undo migration 7 only, use
`rollback/emerriment_migration7_rollback.sql` instead (see
`PRODUCTION_RUNBOOK.md`, "Migration 7").

## Netlify environment variables

| Variable | Required | Notes |
|---|---|---|
| `RESEND_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | yes (already used) | |
| `EMAIL_FROM` | yes for real delivery | e.g. `EMerriment <hello@mail.emerriment.com>` once Resend shows the sending domain as Verified. Without it the Resend test sender is used and a warning is logged on every cold start. |
| `EMAIL_EXTRA_REDIRECT_HOSTS` | optional | comma-separated extra domains you own that email links may redirect to (`emerriment.com`, `www.emerriment.com` and the Netlify address are already built in). |
| `EMAIL_LINK_SECRET` | recommended | ≥ 32 characters (64 hex recommended). Can be added at any time: links sent earlier stay valid (the previous derived key is still accepted). |
| `EMAIL_LINK_SECRET_PREVIOUS` | only while rotating | the old secret, so its links keep working. |
| `EMAIL_LINK_ACCEPT_DERIVED` | optional | `false` ~60 days after setting `EMAIL_LINK_SECRET`, to stop accepting older links. |
| `EMAIL_CONFIRMATION_ENABLED` | to offer the 14-day lessons box and send consent confirmation emails | must be exactly `true`; without it the quiz pages hide the box and no confirmation email is sent. Independent of the two switches below. Requires migration 7. |
| `EMAIL_SEQUENCE_ENABLED` | to send lessons | must be exactly `true`; without it the scheduled run sends nothing. Lessons go only to confirmed subscribers. |
| `EMAIL_SEQUENCE_START_AFTER` | recommended with the above | ISO date/time. Leads that joined earlier are not emailed; later ones always continue. Set it to the moment `EMAIL_CONFIRMATION_ENABLED` was switched on, so people who confirmed before the lessons started are included. |
| `EMAIL_SEQUENCE_MAX_OVERDUE_DAYS` | optional | used only without `EMAIL_SEQUENCE_START_AFTER`; default 7; `0` = no limit. |
| `EMAIL_OPEN_ALLOW_LEGACY` | optional | `false` ~30 days after deploy to stop counting legacy `?email=` opens. |
| `EMAIL_CLAIM_COMPAT_MODE` | avoid | only if the database cannot accept `Sending` and you choose not to change it. |

Generate `EMAIL_LINK_SECRET` without displaying it (Windows; copies to the
clipboard), then paste it into Netlify → Site configuration → Environment
variables. On paid plans choose scope "Functions" and mark it secret; the
site is on the Free plan, where scopes and secret values are not available
(an attempt to create a scoped secret returned 403 Forbidden):

```bash
node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))" | clip
```

## 14-day sequence activation

The schedule is registered in `netlify.toml` (`[functions."email-sequence"]
schedule = "@daily"`). The previous `exports.config` was **not** recognised by
Netlify for this function format (checked with Netlify's bundler). The live
deploy's function metadata (2026-11-11) confirms it: `email-sequence` is
deployed as an ordinary HTTP function with no schedule — it has never run on a
schedule, and on the live (old) deploy **any request to its URL runs it**.
After deploying this branch it runs daily and sends nothing until
`EMAIL_SEQUENCE_ENABLED=true`.

Before enabling, decide about historical leads (audit query 17 shows how many
leads exist). Recommended: set `EMAIL_SEQUENCE_START_AFTER` to the activation
time so only new quiz takers receive lessons.

## Resend sender domain

0. `emerriment.com` is registered (Cloudflare Registrar, DNS at Cloudflare)
   and serves the website. Recommended sending domain: `mail.emerriment.com`.
1. Resend → Domains → Add domain: your domain (or a sending subdomain such
   as `mail.<domain>`, which keeps marketing mail reputation separate).
2. Resend shows the exact DNS records to create at your DNS host (Cloudflare → DNS, Proxy status "DNS only"):
   * **SPF** — a TXT record (on the bounce/return-path subdomain Resend names)
     authorising Resend's servers.
   * **DKIM** — a TXT record (`resend._domainkey…`) holding Resend's public key;
     receivers use it to verify messages were not altered.
   * **Return-path / bounce** — an MX record on the subdomain Resend specifies.
   * **DMARC** (recommended, set by you) — TXT at `_dmarc.emerriment.com`, e.g.
     start with `v=DMARC1; p=none; rua=mailto:<a mailbox you read>` and tighten
     to `quarantine` later.
   Copy the values exactly as Resend shows them; do not reuse values from
   elsewhere.
3. Click **Verify** in Resend; wait until the domain shows *Verified*.
4. Set `EMAIL_FROM` in Netlify, redeploy, and send one test report to yourself.
