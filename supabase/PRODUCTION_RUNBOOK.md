# EMerriment — production runbook

Last updated 2026-11-12. Each step that changes a live system needs your
go-ahead. Secrets are never written here.

## 0. Verified current state (2026-11-12)

| Area | Evidence | Status |
|---|---|---|
| Live code | Netlify deploy `6af40078`, Git `main` @ `47e76b0` | Email security hardening is live (relay closed, sequence scheduled but disabled, signed tracking/unsubscribe, internal files blocked). |
| Domain | Cloudflare Registrar; apex flattened CNAME → `apex-loadbalancer.netlify.com`, `www` CNAME → `emerriment216.netlify.app`, both DNS-only | `https://emerriment.com` 200; `www` 301 → apex (path and query kept); `http` → `https`; Let's Encrypt certificate issued for both names (valid to 2027-02-10); `emerriment216.netlify.app` still 200. |
| Headers (live) | Response headers of `https://emerriment.com/` | One valid CSP (7 directives), X-Frame-Options DENY, nosniff, HSTS (`includeSubDomains; preload`), Referrer-Policy, Permissions-Policy. Weaknesses: `script-src 'unsafe-inline' 'unsafe-eval'`; `connect-src http://127.0.0.1:3030`; no `object-src`/`base-uri`/`form-action`. The `_headers` CSP is not served (netlify.toml's is). |
| Browser (signed out) | Built-in browser, console | No errors on `/`, login, reset-password, quiz, encyclopedia, AI page. The homepage shows a leftover debug `alert("JS is connected ✅")`. |
| Netlify env (names only) | API metadata | Present: `RESEND_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `EMERRIMENT_OPENAI_KEY`, `OPENAI_API_KEY` (secret), `BREVO_API_KEY`, `EMERRIMENT_AI_MODE`. Missing: `EMAIL_FROM`, `EMAIL_LINK_SECRET`, `EMAIL_SEQUENCE_*`. Only `OPENAI_API_KEY` is marked secret. Creating `EMAIL_LINK_SECRET` through the API was refused (403 with per-context values/functions scope; 422 with one value for all contexts) — set it in the dashboard (§3). |
| Supabase | Dashboard requires sign-in; no CLI/token | Auth URL settings, email templates, SMTP and the database **not inspected**. |
| Resend | Dashboard requires sign-in; no CLI/token | Domains **not inspected**. Public DNS has no Resend records for `emerriment.com`. |
| SEO | Live HTML | Canonical, `og:url`, JSON-LD, sitemap and robots.txt use `https://emerriment.com`. `og:image`/`twitter:image` → `images/preview.jpg` is relative **and 404**. |

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
| `EMAIL_SEQUENCE_START_AFTER` | ISO activation time | when activating the sequence |
| `EMAIL_SEQUENCE_ENABLED` | `true` | last, after all prerequisites |

Also tick "Contains secret values" for `RESEND_API_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `EMERRIMENT_OPENAI_KEY` and `BREVO_API_KEY` if the
dashboard allows it (it does for `OPENAI_API_KEY`). Variables apply on the next
deploy.

## 4. Live database security (manual — Supabase SQL Editor)

1. Backup: Dashboard → Database → Backups (or export each table as CSV).
2. Run `supabase/audit/01_read_only_security_audit.sql` (SQL Editor → New
   query → paste → Run). It reads metadata and counts only. Export each result
   and send it for review: RLS status (query 1), columns (3), constraints (4),
   enums (5), policies (7), grants (8), triggers (10), functions (11), views (13),
   admin count (15).
3. Apply migrations (after review) in this order: `…090400`, `…090000`,
   `…090100`, `…090200`, `…090300` — staging first if possible.
4. Run `supabase/audit/02_post_migration_verification.sql` and the browser
   checks in `supabase/README.md`. Rollback:
   `supabase/rollback/emerriment_security_rollback.sql`.

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
