# EMerriment — production runbook

Last updated 2026-11-13. Each step that changes a live system needs your
go-ahead. Secrets are never written here.

## 0. Verified current state (2026-11-12)

| Area | Evidence | Status |
|---|---|---|
| Live code | Netlify deploy `6af40078`, Git `main` @ `47e76b0` | Email security hardening is live (relay closed, sequence scheduled but disabled, signed tracking/unsubscribe, internal files blocked). |
| Domain | Cloudflare Registrar; apex flattened CNAME → `apex-loadbalancer.netlify.com`, `www` CNAME → `emerriment216.netlify.app`, both DNS-only | `https://emerriment.com` 200; `www` 301 → apex (path and query kept); `http` → `https`; Let's Encrypt certificate issued for both names (valid to 2027-02-10); `emerriment216.netlify.app` still 200. |
| Headers (live) | Response headers of `https://emerriment.com/` | One valid CSP (7 directives), X-Frame-Options DENY, nosniff, HSTS (`includeSubDomains; preload`), Referrer-Policy, Permissions-Policy. Weaknesses: `script-src 'unsafe-inline' 'unsafe-eval'`; `connect-src http://127.0.0.1:3030`; no `object-src`/`base-uri`/`form-action`. The `_headers` CSP is not served (netlify.toml's is). **Fixed on this branch** (not yet deployed): no `unsafe-eval`, no local address, no unused `api.resend.com`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`. `'unsafe-inline'` remains (inline handlers and JSON-LD on many pages). |
| Browser (signed out) | Built-in browser, console | No errors on `/`, login, reset-password, quiz, encyclopedia, AI page. The homepage shows a leftover debug `alert("JS is connected ✅")` (**removed on this branch**). **The AI assistant called `http://127.0.0.1:3030` from every visitor's browser** (`AI_MODE = "local"`), so it could not work in production — fixed: local bridge only on localhost, otherwise the Netlify function. |
| Netlify env (names only) | API metadata | Present: `RESEND_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `EMERRIMENT_OPENAI_KEY`, `OPENAI_API_KEY` (secret), `BREVO_API_KEY`, `EMERRIMENT_AI_MODE`. Missing: `EMAIL_FROM`, `EMAIL_LINK_SECRET`, `EMAIL_SEQUENCE_*`. Only `OPENAI_API_KEY` is marked secret. Creating `EMAIL_LINK_SECRET` through the API was refused (403 with per-context values/functions scope; 422 with one value for all contexts) — set it in the dashboard (§3). |
| Supabase Auth (2026-11-13) | Dashboard, read after reload | **Changed:** Site URL `https://emerriment216.netlify.app` → `https://emerriment.com`; Redirect URLs now `http://localhost:8888/reset-password.html`, `https://emerriment216.netlify.app/reset-password.html`, `https://emerriment.com/reset-password.html` (added). Templates "Confirm sign up" and "Reset password" use `{{ .ConfirmationURL }}` (compatible, unchanged). **SMTP: built-in sender — blocker for real users** (§1). |
| Supabase DB (2026-11-13) | `pg_policies` + metadata query, read-only | RLS enabled (not forced) on all 22 public tables; 1 admin. **Critical:** `leads` has SELECT for `public` `USING (true)` — anyone with the public anon key can read every lead. `profiles` UPDATE `auth.uid() = id` with no column guard — a user can set their own `is_admin`. `ai_events` SELECT `public` `true`. **`leads.id` is NULL for all 79 leads (no default, no primary key)** — the report email can never be claimed. `ai_messages` lets a user post into another user's conversation. `encyclopedia_articles` has no UPDATE/DELETE policy (CMS edits fail). Tables with no policy (unreadable via API): products, collections, collection_articles, article_products, article_ratings, saved_products, website_settings, ai_settings, ai_feedback, ai_questions, product_clicks — so the website cannot show products. API roles hold ALL privileges (incl. TRUNCATE) on every table. Storage bucket `article-images` has no size/type limit. 57 leads hold `'pending'` with literal quotes (quoted defaults). Full matrix: `SECURITY_MATRIX.md`. **Backup taken and verified (schema `emerriment_backup`). All seven migrations applied and verified 2026-11-15 (03b: 381/381)** (§4). |
| Resend (2026-11-13) | Dashboard, signed in | **No domains added.** Public DNS has no Resend records for `emerriment.com`. |
| SEO | Live HTML | Canonical, `og:url`, JSON-LD, sitemap and robots.txt use `https://emerriment.com`. `og:image`/`twitter:image` → `images/preview.jpg` is relative **and 404**; SearchAction pointed at `/?search=`; only the homepage had a canonical. **Fixed on this branch:** 1200×630 `images/preview.jpg`, absolute URLs; SearchAction → `/encyclopedia.html?search=`; canonical on 9 public pages; `noindex` header on account/dashboard/CMS pages; sitemap lists the public pages. |

## 1. Supabase Auth (manual — dashboard)

How the code builds redirects (verified in `js/auth.js`, tests in
`tests/security/auth-regression.test.js`):

| Flow | Code | Lands on |
|---|---|---|
| Sign up (`signup.html`) | `signUp` **without** `emailRedirectTo` | the **Site URL** (`/`), where `js/supabase.js` (`detectSessionInUrl: true`) completes the sign-in |
| Password reset (`forgot-password.html`) | `resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password.html" })` | `/reset-password.html` on the domain the user is on |
| New password (`reset-password.html`) | `getSession()` must exist, then `updateUser({ password })` (≥ 8 chars) | then `login.html` |
| After login / signup | fixed `dashboard.html` (no redirect taken from the URL) | — |

Not wired to any working flow: `admin/auth.js` (loaded by no page; its reset
target `/update-password.html` does not exist), and `admin/js/auth.js` /
`encyclopediaCMS/js/auth.js` (styles only) — the admin and encyclopediaCMS
signup/forgot pages are UI shells.

Supabase → Authentication → URL Configuration (read the current values first
and keep any you still need):

* **Site URL:** `https://emerriment.com`
* **Redirect URLs** (exact, no wildcards):
  * `https://emerriment.com/reset-password.html`
  * `https://emerriment216.netlify.app/reset-password.html` (people still on the old address)
  * `http://localhost:8888/reset-password.html` (only if you use `netlify dev`)
  `www` is not needed: it redirects to the apex before any page code runs.

Supabase → Authentication → Emails (templates) — check, do not assume:
open "Confirm signup" and "Reset password" and look at the link. If it uses
`{{ .ConfirmationURL }}`, it already carries the redirect (Supabase's docs show
it as `…/auth/v1/verify?token=…&redirect_to=…`) — no change needed. If it was
customised to build a link from `{{ .SiteURL }}`, the reset email ignores
`redirectTo`; Supabase's docs say to use `{{ .RedirectTo }}` in that case (or
switch back to `{{ .ConfirmationURL }}`).

**SMTP — required before real users can sign up or reset passwords.**
Supabase's built-in sender only delivers to members of your Supabase team, at
about 2 messages per hour, and "is not meant for production use" (Supabase
docs). After Resend has verified the domain (§2), set Supabase → Authentication
→ Emails → SMTP Settings:

| Field | Value |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | a Resend API key (create a dedicated "Supabase SMTP" key, sending access only) |
| Sender email | the agreed sender, e.g. `no-reply@emerriment.com` |
| Sender name | `EMerriment` |

Then raise Authentication → Rate Limits → email if needed (custom SMTP starts at
30/hour).

## 2. Resend sending domain (manual — dashboard)

1. Resend → Domains → **Add domain** → `emerriment.com` (or `mail.emerriment.com`
   to keep sending reputation separate from the website domain).
2. Resend shows the exact records (typically an MX and an SPF TXT on a
   `send` subdomain, and a DKIM TXT `resend._domainkey`). Copy them **exactly**
   into Cloudflare → DNS, Proxy status **DNS only**. Do not touch the apex and
   `www` CNAMEs; do not add a root MX unless you set up incoming mail; never
   create a second SPF record on the same name.
3. DMARC (recommended): TXT `_dmarc` → `v=DMARC1; p=none; rua=mailto:<a mailbox you read>`;
   tighten later after reviewing reports.
4. Resend → **Verify**; wait for *Verified*.
5. Sender: the functions expect `EMAIL_FROM` as `Name <address>`, e.g.
   `EMerriment <hello@emerriment.com>`. Incoming mail is **not** configured for
   `emerriment.com` (no MX); if replies should reach someone, set up a mailbox or
   Cloudflare Email Routing first, or use a `no-reply@` address.

## 3. Netlify environment variables (manual — dashboard)

Site configuration → Environment variables → Add a variable:

| Variable | Value | When |
|---|---|---|
| `EMAIL_LINK_SECRET` | `node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))" \| clip`, paste; tick "Contains secret values" if offered | now |
| `EMAIL_FROM` | `EMerriment <hello@emerriment.com>` (agreed address) | after Resend shows Verified |
| `EMAIL_CONFIRMATION_ENABLED` | `true` | after migration 7; shows the opt-in box and sends confirmation emails (independent of the lessons) |
| `EMAIL_SEQUENCE_START_AFTER` | the time `EMAIL_CONFIRMATION_ENABLED` was switched on | when activating the sequence |
| `EMAIL_SEQUENCE_ENABLED` | `true` | last, after all prerequisites |

Also tick "Contains secret values" for `RESEND_API_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `EMERRIMENT_OPENAI_KEY` and `BREVO_API_KEY` if the
dashboard allows it (it does for `OPENAI_API_KEY`). Variables apply on the next
deploy.

## 4. Live database security (Supabase SQL Editor)

1. Backup — **done 2026-11-13**: `backups/20261113_create_backup.sql` (the
   Free plan has no Supabase backups). 22 tables copied, all row counts
   match, 31 policies and 462 grants saved. Restore: `backups/README.md`.
2. Audit — **done 2026-11-13** (read-only): schema, 27 policies, grants,
   functions, triggers, event triggers, storage. Result: `SECURITY_MATRIX.md`.
3. Apply — **done** (SQL Editor; all seven, verified 2026-11-15: audit 02 and
   03b 381/381). Remote CLI migration history did not exist (no
   `supabase_migrations` schema); sync with
   `npx supabase@3.1.0 migration repair --status applied <7 versions>`
   after `supabase link` (history only). Steps that were used:
   `APPLY_2026-11-13.md`:
   `085900` (lead ids) → `090000` → `090100` → `090200` → `090300` →
   `090400` → `20261113090000` (hardening). All seven were tested together
   on a copy of the live schema (`tests/db/production.pglite.test.js`).
4. Verify: `audit/02_post_migration_verification.sql` and
   `audit/03_live_rls_role_checks.sql` (runs as anon / two real users /
   admin, rolls everything back, every row must pass).
   Rollback of migrations 1–6 (all seven): `rollback/emerriment_security_rollback.sql` —
   full rollback of all seven migrations; refuses to run unless the session first sets `emerriment.full_rollback = 'all-seven-migrations'`. **Never use it to undo migration 7 alone** (it removes every EMerriment security policy and makes `leads` readable by anyone).

Order with the deploy: either order is safe. Until the branch is deployed,
the CMS "toggle admin" button and the article rating average need the new
code; until the migrations are applied, the new code falls back where it can.

### Migration 7 (prepared 2026-11-17; applied to production 2026-11-19)

Applied record:
1. Read-only preflight `audit/04_migration7_preflight_read_only.sql` — every
   BLOCKER PASS (it describes the state *before* migration 7; run now, its
   "not yet applied" and history rows fail by design).
2. Backup `backups/20261119_create_backup_before_migration7.sql` created by
   the owner and independently verified (`backups/20261119_verify_backup.sql`:
   23 table copies match, every BLOCKER PASS).
3. Migration applied by the owner in the SQL Editor (the file as of commit
   `b196a25`; since then only its status comment changed).
4. Validated: `03b_comprehensive_live_security_checks.sql` 384/384 PASS;
   backup verification still all BLOCKER PASS.
5. History: `npx supabase@3.1.0 migration repair --status applied 20261117090000 --remote`
   (CLI reported `Repaired migration history: [20261117090000] => applied`);
   `migration list`: 8/8.

Staging received the same objects through the schema import and has its
history recorded by `migration repair` only (`docs/STAGING_AND_PREVIEWS.md`).

`20261117090000_emerriment_marketing_consent_and_purchases.sql`: separate
marketing consent, verified purchases, customer onboarding delivery
and consent-confirmation delivery records, and two consent guards on
`leads` implementing double opt-in (insert: only a pending request, quiz
rules for every API caller; update: activation only by the server with a
live single-use token, evidence never rewritten, withdrawal by the server
or on `Unsubscribed`). Release order, approvals and test plan:
`docs/PRODUCTION_ACTIVATION_CHECKLIST.md`; journey and lifecycle design:
`docs/VISITOR_TO_CUSTOMER_JOURNEY.md`, `docs/EMAIL_LIFECYCLE_PLAN.md`.

Rollback of migration 7 **only**: `rollback/emerriment_migration7_rollback.sql`.
* Not needed when only a website deploy fails — the previous code works
  with migration 7 applied; re-publish the previous Netlify deploy.
* Order: website rolled back and lessons/onboarding switches unset → run
  the file (one transaction) → re-apply migration 7 before the newer code
  returns.
* Removes only the two consent triggers/functions and the visitor INSERT
  privilege on the consent columns. Keeps all rows (leads, consent
  evidence, purchases, delivery history), the consent CHECK constraint,
  `purchases` and its RLS, the `email_deliveries` extensions and every
  migration 1–6 object. It aborts itself if any row count, policy, RLS
  flag or API privilege changes.
* Tested: `tests/db/journey.pglite.test.js` (data fingerprint identical,
  migration 1–6 security state identical, 03b passes afterwards,
  re-apply works).

## 5. Deploy the domain-alignment branch

`production/official-domain-finalization` changes only email call-to-action
links, the site-URL fallback and the click-tracking allow-list (adds
`emerriment.com` / `www.emerriment.com`, keeps the Netlify address for links
already sent). After merging and deploying, Netlify's `URL` becomes
`https://emerriment.com` for functions, so new tracking/unsubscribe links use
the official domain, and:

```bash
node tests/smoke/production-smoke.js https://emerriment.com
node tests/smoke/production-smoke.js https://emerriment216.netlify.app
```

should both pass completely.

## 6. Controlled production tests (need your own test account / inbox)

Run after §1–§3, with an address you control (not a real subscriber):

1. Sign up on `https://emerriment.com/signup.html` → confirmation email arrives
   (from the custom SMTP sender) → link opens `https://emerriment.com/` signed in
   → refresh: still signed in → `dashboard.html` loads.
2. Log out → log in → dashboard.
3. Forgot password → email arrives → link opens
   `https://emerriment.com/reset-password.html` → set a new password → log in
   with it.
4. Homepage quiz with the same address → report email arrives (needs
   `EMAIL_FROM` + verified domain) → open it (open counted), click the
   unsubscribe link → confirmation page → confirm → no further lessons.
5. Sequence: only after §4 and your subscriber decision — see
   `supabase/README.md` "14-day sequence activation".
