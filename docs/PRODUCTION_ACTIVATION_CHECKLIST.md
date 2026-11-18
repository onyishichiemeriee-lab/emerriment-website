# EMerriment — production activation checklist (journey and email lifecycle)

Last updated 2026-11-18. Every step marked **approval** is a production
change that the owner must approve explicitly. Nothing in this checklist has
been executed in production yet.

## 0. Current state

| Item | State |
|---|---|
| Code on branch `production/official-domain-finalization` | committed locally, **not pushed or deployed** |
| Migration `20261117090000_emerriment_marketing_consent_and_purchases.sql` | prepared, **not applied** (consent update guard added 2026-11-18) |
| Rollback for migration 7 only | `supabase/rollback/emerriment_migration7_rollback.sql` (see §5) |
| `EMAIL_SEQUENCE_ENABLED` | not set (lessons off) |
| `CUSTOMER_ONBOARDING_ENABLED` | not set (onboarding off) |
| `EMAIL_REPLY_TO` | not set (no reply inbox exists) |

## 1. Order of release

1. **Approval — apply migration 7** (SQL Editor, as before; backup first:
   re-run `supabase/backups/20261113_create_backup.sql` with a new date suffix
   or confirm the existing backup is sufficient). Then
   `npx supabase@3.1.0 migration repair --status applied 20261117090000 --remote`
   **(approval)**, or apply it with `db push` once — not both.
2. Verify: `03b_comprehensive_live_security_checks.sql` (expect all PASS) and:
   ```sql
   select count(*) filter (where marketing_consent) as opted_in, count(*) as leads from leads;  -- expect opted_in = 0
   select to_regclass('public.purchases') is not null as purchases_table;               -- expect true
   ```
3. **Approval — deploy** the branch (merge to `main`). The code works with or
   without the migration, but consent is only recorded after step 1.
4. Live checks (no email): smoke test 48/48 both addresses; homepage and
   quiz.html show the unticked consent box; invalid email shows the inline
   message.
5. **Approval — one real test submission per form** (an address you control):
   * homepage, box **unticked** → report arrives; `marketing_consent = false`.
   * quiz.html, box **ticked** → report arrives; `marketing_consent = true`,
     `marketing_consent_at` set, source `quiz_page`, version
     `quiz-optin-2026-11-17`.
   * Click unsubscribe in the second report → both leads `Unsubscribed`,
     `marketing_consent = false`; `marketing_consent_withdrawn_at` set (server
     time) on the lead that had consented; its consent time, source and
     version unchanged.

## 2. Activating the 14-day lessons (later, separate approval)

1. Decide the start: set `EMAIL_SEQUENCE_START_AFTER` to the activation
   moment (ISO time) **(approval — env var)**.
2. Create one opted-in test lead with your own address **by taking the
   quiz with the box ticked** (consent cannot be switched on afterwards by
   SQL, the CMS or the server — the database refuses it); set
   `EMAIL_SEQUENCE_ENABLED=true` **(approval)** and redeploy.
3. Next 08:00 Lagos run: one lesson to the test lead only; check Resend and
   the function log summary (`sent`, `skipped_no_consent`, …).
4. Watch for a week; unsubscribe link and suppression re-checked.

Rollback: remove `EMAIL_SEQUENCE_ENABLED` (next run sends nothing).

## 3. Activating customer onboarding (later, separate approval)

Prerequisite: a verified purchase source.
* Manual (available now after migration 7): an administrator records an
  order checked in the Selar dashboard:
  ```sql
  insert into public.purchases (email, product_code, provider, provider_order_ref, amount, currency, verified_by)
  values ('<buyer email>', '21-days-to-glow', 'selar', '<Selar order id>', <amount>, 'NGN', 'admin: checked in Selar dashboard');
  ```
* Automatic: a Selar webhook with signature verification — **not built**
  (needs Selar's documented webhook format and secret).

Then: `EMAIL_REPLY_TO` (real inbox) if the day-10 feedback email is wanted;
`CUSTOMER_ONBOARDING_ENABLED=true` **(approval)**; first run with a test
purchase on your own address. Rollback: remove the variable.

## 4. Test plan (automated, mocked — no real email)

| # | Scenario | Automated test(s) |
|---|---|---|
| A | Visitor completes the quiz | homepage-quiz "anonymous visitor…"; journey.dom "homepage quiz…" |
| B | Valid email → requested report | send-email suite; homepage-quiz; quiz-pages "one report email request" |
| C | Declines consent → no lessons | homepage-quiz "C: …"; quiz-pages "no opt-in…"; lifecycle "C: …"; journey.pglite "C: …" |
| D | Opts in → eligible for lessons | homepage-quiz "D: …"; quiz-pages "explicit opt-in…"; lifecycle "D: …"; journey.pglite "D: …" |
| E | Registers and confirms | auth-pages.dom (signup, expired link, resend confirmation) |
| F | Logs in, dashboard | auth-pages.dom "fresh login…", "dashboard after login…" |
| G | Unsubscribes → suppressed everywhere | lifecycle "G: …"; tracking suite (unsubscribe) |
| H | Retried run → no duplicate | lifecycle "H: …"; sequence "duplicate scheduled invocation…" |
| I | Verified customer onboarding | lifecycle "I: …" (7 tests); journey.pglite "customer onboarding delivery records…" |
| J | Checkout click ≠ customer | lifecycle "J: …"; journey.dom "J: …" |
| K | Purchase cannot be forged from a browser | journey.pglite "K: …"; journey.dom "K: …" |
| L | Transactional email still works (also after unsubscribe) | lifecycle "L: …"; send-email suite; auth-pages.dom (reset) |

Run: `npm run test:email`, `npm run test:security`, `npm run test:db`.

## 5. Rollback considerations

* Code: redeploy the previous `main` deploy in Netlify (instant). The
  previous code works with migration 7 in place, so **a failed or reverted
  deploy needs no database rollback**.
* Lessons/onboarding: remove the enable variable; next run sends nothing.
* Migration 7 (only if its database behaviour itself must be switched
  off): `supabase/rollback/emerriment_migration7_rollback.sql`.
  1. Roll the website back first and make sure `EMAIL_SEQUENCE_ENABLED`
     and `CUSTOMER_ONBOARDING_ENABLED` are not set.
  2. Run the file once in the SQL Editor (one transaction, self-checking:
     it aborts if any row count, policy, RLS flag or API privilege
     changes).
  3. It removes only the two consent guards and the visitor privilege to
     submit consent. It keeps every lead, all consent evidence, every
     purchase, all delivery history and everything from migrations 1–6.
  4. Re-apply migration 7 (safe to re-run) before the newer code is
     deployed again or any lesson is enabled.
* **Never** use `supabase/rollback/emerriment_security_rollback.sql` for
  migration 7. It is the full rollback of all seven migrations: it drops
  every EMerriment security policy and grants the API roles full table
  access again — the legacy `leads` read-all policy would make every lead
  public — and it drops `email_deliveries` and `purchases`. It now refuses
  to run unless the session first sets
  `emerriment.full_rollback = 'all-seven-migrations'`.
* Already-sent emails cannot be recalled — that is why every activation
  starts with a single test address.
