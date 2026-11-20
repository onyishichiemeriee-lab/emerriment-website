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
  Context    from the build file; cannot be overridden at run time; unknown = not production
```

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
| OpenAI (`ai-chat`) | production key in previews | **not isolated in code** — scope the key to production (below) |

## 3. Netlify variables — exact scopes (to set up later, with approval)

Production secrets must be **Production only**. Today all 9 variables are
"all contexts"; until that changes, previews are still protected by the code
(production credentials are refused, email blocked), but scope them anyway.

| Variable | Production | Deploy Previews | Branch deploys | Notes |
|---|---|---|---|---|
| `SUPABASE_URL` | production URL | **staging URL** | **staging URL** | same name, per-context values |
| `SUPABASE_SERVICE_ROLE_KEY` | production key | **staging service key** | **staging service key** | secret |
| `STAGING_SUPABASE_PROJECT_REF` | — (unset) | staging project ref | staging project ref | functions refuse anything else |
| `STAGING_PUBLIC_SUPABASE_URL` | — | staging URL | staging URL | read at build time (browser) |
| `STAGING_PUBLIC_SUPABASE_ANON_KEY` | — | staging **anon** key | staging **anon** key | public; never a service key |
| `RESEND_API_KEY` | production key | **unset** | **unset** | email is blocked anyway |
| `EMAIL_FROM`, `EMAIL_REPLY_TO` | production | unset | unset | |
| `EMAIL_LINK_SECRET` | production secret | **separate** random secret | **separate** random secret | |
| `EMERRIMENT_OPENAI_KEY` / `OPENAI_API_KEY` | production key | unset, or a separate low-limit key | same as previews | not isolated by code |
| `BREVO_API_KEY` | production (unused by code) | unset | unset | |
| `EMERRIMENT_AI_MODE`, `OPENAI_MODEL` | as now | as you like | as you like | not secrets |
| `EMAIL_CONFIRMATION_ENABLED`, `EMAIL_SEQUENCE_ENABLED`, `CUSTOMER_ONBOARDING_ENABLED` | unset until each activation step | **never** | **never** | ignored outside production anyway |

Keep "Deploy previews from forks: require approval" (`untrusted_flow: review`, current setting).

## 4. Staging project — manual setup

1. **Create** a new Supabase project (your action), e.g. "EMerriment staging",
   same region. Note its project ref, URL, anon key and service-role key.
2. **Auth settings (staging):** Site URL `https://emerriment216.netlify.app`;
   Redirect URLs `https://deploy-preview-*--emerriment216.netlify.app/**` and
   `https://*--emerriment216.netlify.app/**`. Either turn **off** "Confirm
   email" for staging, or use only addresses you control — staging Auth sends
   real emails through Supabase's mailer.
3. **Schema** — a new project has none of EMerriment's base tables, which
   existed in production before migration 1, so the migrations alone cannot
   build staging. Copy production's **structure only** (no rows; a read of
   production metadata — needs your approval), apply it to staging, then
   record the migration history there:
   ```bash
   npx supabase@3.1.0 db dump --linked -f staging-schema.sql
   npx supabase@3.1.0 db query --remote=<STAGING_REF> --file staging-schema.sql --yes
   npx supabase@3.1.0 migration repair --status applied 20261110085900 20261110090000 20261110090100 20261110090200 20261110090300 20261110090400 20261113090000 20261117090000 --remote=<STAGING_REF> --yes
   npx supabase@3.1.0 migration list --remote=<STAGING_REF>
   ```
   (`db dump` without `--data-only` writes schema only.) Keep
   `staging-schema.sql` out of the repository. The local link stays on
   production — **always pass `--remote=<STAGING_REF>` for staging, never a
   bare `--remote`.** Future migrations go to staging first:
   `npx supabase@3.1.0 db push --remote=<STAGING_REF> --skip-vault --dry-run`, then without `--dry-run`.
4. **Synthetic data:** staging SQL Editor →
   ```sql
   set emerriment.seed_target = 'staging';
   ```
   then paste `supabase/staging/seed_synthetic.sql` and Run. It refuses on
   production (backup schema present) or a non-fresh project.
5. **Accounts for testing:** sign up three staging accounts on a preview
   (or in the staging dashboard) — one administrator, two ordinary users
   (the 03b suite needs exactly this). Promote the administrator in the
   staging SQL Editor, the trusted direct path:
   `update public.profiles set is_admin = true where id = '<staging user uuid>';`
   Use addresses you control (or "Confirm email" off, step 2).
6. **Security verification on staging** (read-only in effect, staging ref only):
   ```bash
   npx supabase@3.1.0 db query --remote=<STAGING_REF> --file supabase/audit/03b_comprehensive_live_security_checks.sql --output-format json --yes
   ```
   Expect 384/384 PASS (counts depend on the staging tables).
7. **Netlify:** set the variables in section 3 (approval), keep production
   values production-only.
8. **Prove isolation on a preview** (one PR, after steps 1–7):
   * `/.netlify/functions/email-features` → `{"consentConfirmation":false}`;
   * no "not connected to a database" notice on pages; sign-in works with a
     staging account;
   * a quiz with an `@example.test` address creates a lead **in staging**;
     production `select count(*) from leads` is unchanged;
   * Resend dashboard shows no new email; the report page says the email
     could not be sent (expected in previews).

**Cleanup:** delete synthetic rows (`delete from public.leads where email like '%@example.test';`),
or delete the whole staging project. Rotate the staging service key if it was
ever shared. Remove the preview-scoped variables if staging is retired —
previews then fail closed (no database).

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
- [ ] staging project ready (section 4, steps 1–6)
- [ ] Netlify variables scoped (section 3); production secrets production-only
- [ ] `npm run test:email` and `npm run test:security` pass (includes the isolation suite)

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
- `ai-chat` calls OpenAI with whatever key the context has — isolate by
  scoping the key (section 3).
- Supabase Auth emails on staging are real; see step 2.
- The browser guard prevents *this site's code* from using production in a
  preview. Anyone can still call the public production API with the public
  anon key — that is what RLS and the guards from migrations 1–7 protect.
