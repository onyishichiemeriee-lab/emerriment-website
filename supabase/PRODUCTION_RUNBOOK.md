# EMerriment — production runbook (email security release)

Branch: `security/supabase-email-finalization`. Nothing in this runbook has
been executed against production. Each step needs your go-ahead.

## 0. What was checked against the live systems (2026-11-11, read-only)

| System | Evidence | Result |
|---|---|---|
| Netlify | CLI signed in, linked to **emerriment216** (Free plan); deploys from Git `main`; live deploy = commit `60dba2d` (2026-09-28) | None of the security work is live yet. |
| Netlify functions (live) | Deploy metadata: 5 functions, 10 s limit, no schedule | `email-sequence` is **not scheduled** — it is a plain public URL. **Any request to it runs the sequence** and emails every due lead. `send-email` (live) is still the old open relay. |
| Netlify env vars | Names and validation only (no values read out) | Present: `RESEND_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (+ AI/Brevo keys). Missing: `EMAIL_FROM`, `EMAIL_LINK_SECRET`, sequence switches. None of the keys is marked secret; all are exposed to builds/post-processing too (Free plan cannot restrict scopes or mark secrets — creating a scoped secret returned **403 Forbidden**). |
| Live site (read-only GET smoke test) | `tests/smoke/production-smoke.js` | 31 / 44 pass. Public pages and security headers OK. Exposed: `package.json`, `package-lock.json`, `deno.lock`, `test-emails.js`, `netlify/functions/send-email.js`, `emails/*.js`. Old tracking/unsubscribe behaviour. |
| Domain `emerriment.com` | Public DNS (Google, Cloudflare): non-existent; `.com` registry RDAP: **404** | **Not a registered domain.** Resend cannot verify it; `hello@emerriment.com` cannot be a sender. Sitemap, robots.txt and canonical tags point to it. |
| Supabase | No CLI, connector or database URL available | **Not audited.** |
| Resend | No CLI or connector available | **Not checked.** |
| Function bundles (local) | Netlify bundler, deploy configuration | All 6 bundle; `email-sequence` `@daily`; shared files included; PGlite not bundled. |

## 1. Deploy the code first (closes the live holes)

The new code works with the current database (before the migrations) and
sends no lessons until you switch the sequence on. Deploying first closes, at
once: the open email relay, the publicly triggerable sequence, the open
redirect and the internal-file exposure.

1. Review the branch (`git log main..security/supabase-email-finalization`).
2. Merge into `main` and push (Netlify deploys `main` automatically).
3. Smoke test (read-only, safe):
   ```bash
   node tests/smoke/production-smoke.js https://emerriment216.netlify.app
   ```
   Expect **all checks to pass**.
4. Netlify → Logs → Functions → `email-sequence`: after the next daily run the
   log shows `EMAIL SEQUENCE: disabled … no lessons sent.` The Functions list
   should show it as **Scheduled**.

## 2. Netlify environment variables (manual — Free plan)

Netlify → Site configuration → Environment variables → **Add a variable**.

| Variable | Value | When |
|---|---|---|
| `EMAIL_LINK_SECRET` | generate locally (below) — never paste it anywhere else | now |
| `EMAIL_FROM` | `EMerriment <hello@YOUR-VERIFIED-DOMAIN>` | after step 4 |
| `EMAIL_EXTRA_REDIRECT_HOSTS` | e.g. `emerriment.com,www.emerriment.com` | only once you own that domain |
| `EMAIL_SEQUENCE_START_AFTER` | activation time, ISO, e.g. `2026-11-20T09:00:00Z` | step 5 |
| `EMAIL_SEQUENCE_ENABLED` | `true` | last (step 5) |

Generate `EMAIL_LINK_SECRET` without displaying it (copies to the clipboard):

```bash
node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))" | clip
```

Paste it as the value (use "Different value for each deploy context" if
offered and generate a second one for deploy previews; otherwise production
only). Links already sent stay valid. A redeploy is needed for functions to
pick up new variables (Deploys → Trigger deploy).

Free-plan limitation: values cannot be marked secret or limited to functions,
so anyone with access to the Netlify team can read them. Keep team membership
minimal. If any key may have been exposed (they are visible in the dashboard
and the old `ai-chat` logged the first 8 characters of the OpenAI key), rotate
it at the provider and update Netlify.

## 3. Supabase (manual)

1. Dashboard → Database → Backups: confirm a restorable backup exists (the
   Free plan may not provide one — then export the data first, e.g. Table
   editor → export CSV for each table, or `pg_dump` with the database
   connection string).
2. SQL Editor → run `supabase/audit/01_read_only_security_audit.sql`. Export
   every result tab and send them to me (metadata and counts only).
3. Staging (strongly recommended): create a second free project, copy the
   schema (`supabase db dump --schema-only` with the Supabase CLI, then run it
   in the new project), apply the migrations there, run
   `supabase/audit/02_post_migration_verification.sql` and the browser checks
   in `supabase/README.md`.
4. Production: apply in order 5, 1, 2, 3, 4 (`supabase/README.md`), then the
   verification script and browser checks. Rollback:
   `supabase/rollback/emerriment_security_rollback.sql`.

## 4. Resend sending domain (manual)

`emerriment.com` is not registered. Choose one:

* **Register `emerriment.com`** (Namecheap), or
* use **another domain you already own**.

Then: Resend → Domains → Add domain (a subdomain such as `mail.<domain>` is
recommended) → create exactly the DNS records Resend shows (SPF TXT and MX on
the bounce subdomain, DKIM TXT `resend._domainkey…`; add DMARC TXT at
`_dmarc.<domain>`, e.g. `v=DMARC1; p=none; rua=mailto:<a mailbox you read>`)
→ Verify. Only when Resend shows **Verified**: set `EMAIL_FROM`, redeploy, and
send one test report to your own address (take the quiz with it).

Until then every email uses `onboarding@resend.dev`, which Resend only delivers
to the Resend account owner; the functions log a warning each cold start.

## 5. Activate the 14-day sequence (needs your decision)

Subscriber policy (decide before enabling):
* `EMAIL_SEQUENCE_START_AFTER` = the activation moment → only people who take
  the quiz **after** activation receive lessons. Historical leads (who never
  received any lesson, because the sequence never ran) are left untouched.
* To include historical leads deliberately, leave it unset: leads whose lesson
  is more than 7 days overdue are still held back (`EMAIL_SEQUENCE_MAX_OVERDUE_DAYS`),
  and the run log says so.

Safe test (no real subscriber is emailed):
1. Prerequisites: steps 1–4 done (or at least step 1 + 2 with your own address
   as the Resend account owner).
2. Set `EMAIL_SEQUENCE_START_AFTER` to *now*, `EMAIL_SEQUENCE_ENABLED=true`,
   redeploy. Only leads created after this moment are eligible.
3. Take the quiz with your own test address. Its first lesson is due 24 h
   later; the daily run (00:00 UTC) sends Day 1 once it is due.
4. Optional, to test sooner: in the SQL Editor, for **your test lead only**:
   ```sql
   update public.leads set next_email_due = now() - interval '1 minute'
   where email = 'your-test-address@example.com';
   ```
   and wait for the next daily run.
5. Check: one Day 1 email received; the lead is now day 2; with migration 5,
   `email_deliveries` has one `sent` row; the unsubscribe link shows the
   confirmation page and, after confirming, the lead's status is
   `Unsubscribed` and no further lessons arrive.

## 6. Still to decide / outside this release

* Sitemap, robots.txt and canonical tags reference `emerriment.com`.
* Supabase Auth → URL Configuration (Site URL / redirect URLs) should match the
  domain actually in use.
* `AI_MODE = "local"` is hard-coded in `ai/js/ai-api.js` (the AI assistant
  calls `127.0.0.1` in production); the two security-header sets differ.
