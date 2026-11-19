# EMerriment — production activation checklist (journey and email lifecycle)

Last updated 2026-11-18. Every step marked **approval** is a production
change that the owner must approve explicitly. Nothing in this checklist has
been executed in production yet.

## 0. Current state

| Item | State |
|---|---|
| Code on branch `production/official-domain-finalization` | committed locally, **not pushed or deployed** |
| Migration `20261117090000_emerriment_marketing_consent_and_purchases.sql` | prepared, **not applied** (consent update guard and double opt-in added 2026-11-18) |
| Rollback for migration 7 only | `supabase/rollback/emerriment_migration7_rollback.sql` (see §6) |
| `EMAIL_CONFIRMATION_ENABLED` | not set (no confirmation emails; the quiz pages **hide** the 14-day lessons box) |
| `EMAIL_SEQUENCE_ENABLED` | not set (lessons off) |
| `CUSTOMER_ONBOARDING_ENABLED` | not set (onboarding off) |

The three switches are **independent**; each must be exactly `true`:

| Switch | Controls | Does not affect |
|---|---|---|
| `EMAIL_CONFIRMATION_ENABLED` | the opt-in box on both quiz forms (via `/.netlify/functions/email-features`) and the one confirmation email per request | lessons, onboarding |
| `EMAIL_SEQUENCE_ENABLED` | the 14-day lessons (scheduled run), and whether the confirm page promises a first lesson soon | confirmation emails, onboarding |
| `CUSTOMER_ONBOARDING_ENABLED` | onboarding emails for verified purchases | confirmation emails, lessons |

Confirming never sends a lesson by itself. With confirmations on and lessons
off, people can complete double opt-in; their consent waits for the lessons.
| `EMAIL_REPLY_TO` | not set (no reply inbox exists) |

## 1. Order of release

0. **Read-only preflight** (no approval needed, changes nothing): run
   `supabase/audit/04_migration7_preflight_read_only.sql` in the SQL Editor.
   Every `BLOCKER` row must be `PASS`; keep the result with the approval.
   Also `npx supabase@3.1.0 migration list --remote`: 7 remote versions,
   `20261117090000` local only.
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
4. Live checks (no email): smoke test 48/48 both addresses;
   `/.netlify/functions/email-features` returns `{"consentConfirmation":false}`;
   homepage and quiz.html show **no** 14-day lessons box and no "we'll send
   one short email asking you to confirm" note; invalid email shows the
   inline message.
5. **Approval — one real test submission** (an address you control) →
   report arrives; `marketing_consent = false`, no request recorded.

## 2. Activating confirmation emails (later, separate approval)

Prerequisite: migration 7 applied (step 1). Lessons may stay off.

1. Set `EMAIL_CONFIRMATION_ENABLED=true` **(approval)** and redeploy. Note
   the moment (needed for `EMAIL_SEQUENCE_START_AFTER` in §3).
2. `/.netlify/functions/email-features` returns `{"consentConfirmation":true}`;
   both quiz forms now show the unticked box and the confirmation note.
3. **Approval — test with your own address:**
   * box **unticked** → report only; no request.
   * box **ticked** → report and one confirmation email; a pending request
     (`marketing_consent = false`, `marketing_consent_requested_at`, source,
     version, token hash and expiry set).
   * Open the link: the page only shows a Confirm button and
     `marketing_consent` is still `false`. Press Confirm →
     `marketing_consent = true`, `marketing_consent_at` set, token columns
     empty. While lessons are off the page says they have not started yet.
     Pressing Confirm again shows "no longer valid".
   * **No lesson arrives** (lessons are off).
   * Unsubscribe from the report → `Unsubscribed`, consent withdrawn
     (server time), request evidence unchanged; a new ticked quiz for that
     address gets the report but no confirmation email.

Rollback: remove `EMAIL_CONFIRMATION_ENABLED` — the box disappears on the
next page view and no new confirmation emails are sent. Links already sent
still work (the person asked for them); their consent waits for the
lessons.

## 3. Activating the 14-day lessons (later, separate approval)

Prerequisite: §2 done — only confirmed subscribers ever receive lessons.

1. Set `EMAIL_SEQUENCE_START_AFTER` **(approval — env var)** to the moment
   confirmation emails were switched on (§2.1), **not** the lesson start:
   the cutoff compares the quiz time, so a later cutoff would exclude
   everyone who confirmed while lessons were off. Only confirmed consent is
   ever eligible, so no historical lead can be emailed either way.
2. Set `EMAIL_SEQUENCE_ENABLED=true` **(approval)** and redeploy.
3. Next 08:00 Lagos run: one lesson per confirmed subscriber (your test
   lead first); check Resend and the function log summary (`sent`,
   `skipped_no_consent`, …). Pending, unconfirmed and unsubscribed leads
   get nothing.
4. Watch for a week; unsubscribe link and suppression re-checked.

Rollback: remove `EMAIL_SEQUENCE_ENABLED` (next run sends nothing;
confirmation emails continue only if `EMAIL_CONFIRMATION_ENABLED` is still
set).

## 4. Activating customer onboarding (later, separate approval, independent of §2 and §3)

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

## 5. Test plan (automated, mocked — no real email)

| # | Scenario | Automated test(s) |
|---|---|---|
| A | Visitor completes the quiz | homepage-quiz "anonymous visitor…"; journey.dom "homepage quiz…" |
| B | Valid email → requested report | send-email suite; homepage-quiz; quiz-pages "one report email request" |
| C | Declines consent → no lessons | homepage-quiz "C: …"; quiz-pages "no opt-in…"; lifecycle "C: …"; journey.pglite "C: …" |
| D | Ticks the box → pending request; eligible for lessons only after confirming | homepage-quiz "D: …"; quiz-pages "ticked box…"; lifecycle "D: …"; journey.pglite "D: …", "explicit confirmation activates consent…"; consent-confirmation suite (one email per request, scanner-safe page, single use, expiry, unsubscribe) |
| D2 | Independent switches: confirmation on + lessons off; confirmation off; lessons need confirmed active consent; unsubscribe suppresses all marketing; onboarding independent | consent-confirmation "confirmation ON + lessons OFF…", "confirmation OFF…", "lessons ON: only confirmed…", "unsubscribe suppresses every marketing send…", "CUSTOMER_ONBOARDING_ENABLED stays independent…"; homepage-quiz "a ticked but DISABLED box…"; journey.dom "…the opt-in box ships hidden and disabled…", "confirmation emails OFF / server error / network failure → no box…" |
| E | Registers and confirms | auth-pages.dom (signup, expired link, resend confirmation) |
| F | Logs in, dashboard | auth-pages.dom "fresh login…", "dashboard after login…" |
| G | Unsubscribes → suppressed everywhere | lifecycle "G: …"; tracking suite (unsubscribe) |
| H | Retried run → no duplicate | lifecycle "H: …"; sequence "duplicate scheduled invocation…" |
| I | Verified customer onboarding | lifecycle "I: …" (7 tests); journey.pglite "customer onboarding delivery records…" |
| J | Checkout click ≠ customer | lifecycle "J: …"; journey.dom "J: …" |
| K | Purchase cannot be forged from a browser | journey.pglite "K: …"; journey.dom "K: …" |
| L | Transactional email still works (also after unsubscribe) | lifecycle "L: …"; send-email suite; auth-pages.dom (reset) |

Run: `npm run test:email`, `npm run test:security`, `npm run test:db`.

## 6. Rollback considerations

* Code: redeploy the previous `main` deploy in Netlify (instant). The
  previous code works with migration 7 in place, so **a failed or reverted
  deploy needs no database rollback**.
* Lessons/onboarding: remove the enable variable; next run sends nothing.
* Migration 7 (only if its database behaviour itself must be switched
  off): `supabase/rollback/emerriment_migration7_rollback.sql`.
  1. Roll the website back first and make sure `EMAIL_CONFIRMATION_ENABLED`,
     `EMAIL_SEQUENCE_ENABLED` and `CUSTOMER_ONBOARDING_ENABLED` are not set.
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
