# EMerriment — Supabase security migrations and production checklist

**Status: prepared, NOT applied** to any Supabase project. The migrations are
checked statically (`npm run test:security`) and executed against a
disposable local PostgreSQL that imitates Supabase (`npm run test:db`, PGlite —
see `tests/db/README.md` for what that does and does not prove). They have not
run on your real schema. Every step below needs your approval.

If a migration fails in `psql` or another persistent connection, run
`ROLLBACK;` before retrying (the SQL Editor starts a fresh connection for each
run, so this is automatic there). A failed migration changes nothing.

| Path | What it is |
|---|---|
| `audit/01_read_only_security_audit.sql` | Read-only metadata audit. Run first and **save the output**. |
| `audit/02_post_migration_verification.sql` | Read-only checks to run after applying. |
| `migrations/20261110090000_emerriment_security_helpers.sql` | Private helper schema (RLS baseline for rollback, request role), `emerriment_is_admin()`, profile privilege guard (no self-promotion, last admin protected against demotion **and deletion**, race-safe). |
| `migrations/20261110090100_emerriment_leads_rls.sql` | `leads`: visitors insert only; admins read/update/delete; server-side, race-safe per-address rate limits; safe initial email state. |
| `migrations/20261110090200_emerriment_user_data_rls.sql` | `profiles` and per-user tables: own rows only (admins see all). Ratings **reads unchanged**. |
| `migrations/20261110090300_emerriment_content_admin_rls.sql` | Articles/products/collections: admin-only writes, reads unchanged; settings/AI analytics/product clicks admin-only; `emerriment_increment_article_views()`. |
| `migrations/20261110090400_emerriment_email_delivery.sql` | `Sending` / `Unsubscribed` values (enum) and the `email_deliveries` table. |
| `rollback/emerriment_security_rollback.sql` | Removes everything the migrations created and restores the recorded RLS state. |

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

Order (each file in the SQL Editor, one at a time; read every NOTICE)
1. `20261110090400_emerriment_email_delivery.sql` (independent, additive)
2. `20261110090000_emerriment_security_helpers.sql`
3. `20261110090100_emerriment_leads_rls.sql`
4. `20261110090200_emerriment_user_data_rls.sql`
5. `20261110090300_emerriment_content_admin_rls.sql`
6. `audit/02_post_migration_verification.sql` — compare with the expectations
   written in that file.

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
// → error "Only an administrator can change administrator access."
await supabaseClient.from("quiz_results").select("user_id")      // → only your own rows
```

As the **administrator**: CMS users, subscribers, articles, products, settings
and AI analytics load and save; toggle admin on a test account and back.
Then take the homepage quiz (anonymous and signed in) and `quiz.html` once.

Rollback: run `rollback/emerriment_security_rollback.sql` (restores the RLS
state recorded in `emerriment_private.rls_baseline`, then removes the
EMerriment objects). Enum values added by migration 5 remain (harmless).

## Netlify environment variables

| Variable | Required | Notes |
|---|---|---|
| `RESEND_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | yes (already used) | |
| `EMAIL_FROM` | yes for real delivery | e.g. `EMerriment <hello@emerriment.com>` after the domain is verified. Without it the Resend test sender is used and a warning is logged on every cold start. |
| `EMAIL_LINK_SECRET` | recommended | ≥ 32 characters (64 hex recommended). Can be added at any time: links sent earlier stay valid (the previous derived key is still accepted). |
| `EMAIL_LINK_SECRET_PREVIOUS` | only while rotating | the old secret, so its links keep working. |
| `EMAIL_LINK_ACCEPT_DERIVED` | optional | `false` ~60 days after setting `EMAIL_LINK_SECRET`, to stop accepting older links. |
| `EMAIL_SEQUENCE_ENABLED` | to send lessons | must be exactly `true`; without it the scheduled run sends nothing. |
| `EMAIL_SEQUENCE_START_AFTER` | recommended with the above | ISO date/time, e.g. the moment you enable the sequence. Leads that joined earlier are not emailed; later ones always continue. |
| `EMAIL_SEQUENCE_MAX_OVERDUE_DAYS` | optional | used only without `EMAIL_SEQUENCE_START_AFTER`; default 7; `0` = no limit. |
| `EMAIL_OPEN_ALLOW_LEGACY` | optional | `false` ~30 days after deploy to stop counting legacy `?email=` opens. |
| `EMAIL_CLAIM_COMPAT_MODE` | avoid | only if the database cannot accept `Sending` and you choose not to change it. |

Generate `EMAIL_LINK_SECRET` without displaying it (Windows; copies to the
clipboard), then paste it into Netlify → Site configuration → Environment
variables (scope: Functions; mark as secret):

```bash
node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))" | clip
```

## 14-day sequence activation

The schedule is registered in `netlify.toml` (`[functions."email-sequence"]
schedule = "@daily"`). The previous `exports.config` was **not** recognised by
Netlify for this function format (checked with Netlify's bundler), so the
sequence has most likely never run automatically. After deploying, the daily
run sends nothing until `EMAIL_SEQUENCE_ENABLED=true`.

Before enabling, decide about historical leads (audit query 17 shows how many
leads exist). Recommended: set `EMAIL_SEQUENCE_START_AFTER` to the activation
time so only new quiz takers receive lessons.

## Resend sender domain

1. Resend → Domains → Add domain: `emerriment.com` (or a sending subdomain such
   as `mail.emerriment.com`, which keeps marketing mail reputation separate).
2. Resend shows the exact DNS records to create at your DNS host (Namecheap):
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
