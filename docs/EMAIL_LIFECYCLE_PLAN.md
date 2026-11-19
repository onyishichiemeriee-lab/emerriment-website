# EMerriment — email lifecycle plan

Last updated 2026-11-18. Sender `EMerriment <hello@mail.emerriment.com>`
(SPF, DKIM, DMARC pass). Timezone for scheduling: **Africa/Lagos** (UTC+1,
no daylight saving). Scheduled functions run at **07:00 UTC = 08:00 Lagos**.

## Schedule (Netlify Scheduled Functions use UTC)

| Function | Cron (`netlify.toml`) | UTC | Africa/Lagos | Enabled by |
|---|---|---|---|---|
| `email-sequence` | `0 7 * * *` | daily 07:00 UTC | daily 08:00 Africa/Lagos | `EMAIL_SEQUENCE_ENABLED=true` (not set) |
| `customer-onboarding` | `0 7 * * *` | daily 07:00 UTC | daily 08:00 Africa/Lagos | `CUSTOMER_ONBOARDING_ENABLED=true` (not set) |

Consent confirmation emails are not scheduled: `send-email` sends them with
the quiz report, only while `EMAIL_CONFIRMATION_ENABLED=true` (not set). The
three switches are independent of one another.

Lagos is UTC+1 all year (no daylight saving), so the local time never
shifts. All times are **stored** as UTC instants (`timestamptz`, ISO
strings): `next_email_due`, `submitted_at`, `marketing_consent_at`,
`verified_at`, `email_deliveries.sent_at`. Due checks compare those
instants with the current UTC time; Lagos time is only how runs are
described. No email shows a clock time. Netlify may start a scheduled run a
little after the minute, which the 20-hour lesson gap absorbs. Verified by
journey.dom "schedules: … 08:00 Africa/Lagos" and "timing values are stored
as UTC instants".

## 1. Message types and consent rules

| Type | Examples | Consent needed | Unsubscribe |
|---|---|---|---|
| Account / security (Supabase Auth) | confirm signup, reset password | none — requested by the user | not affected by marketing unsubscribe |
| Requested transactional | quiz report | none — requested on the form | link present; still sent after a marketing unsubscribe because it was explicitly requested [lifecycle: "L: …"] |
| Customer service | onboarding after a **verified** purchase | none (relates to the purchase); unsubscribed addresses are skipped | link when the purchase is linked to a lead |
| Consent confirmation | "Please confirm: EMerriment skin education emails" (one per request) | none — the person ticked the box asking for it; sent only while `EMAIL_CONFIRMATION_ENABLED=true` (the box is hidden otherwise) | not needed (single email, no promotion); ignoring it subscribes nobody |
| Marketing / education | 14-day lessons, future newsletters, re-engagement | **confirmed opt-in** (double opt-in: `leads.marketing_consent = true` only after the person presses Confirm) | one click; withdraws consent on every lead with the address |

### Consent wording (version `quiz-optin-2026-11-17`)
> "Yes, also send me EMerriment's free 14-day skin education emails (one short
> lesson a day for two weeks). Optional — unsubscribe anytime with one click."

Shown unticked on the homepage quiz (`source = homepage_quiz`) and quiz.html
(`source = quiz_page`). Changing the wording requires a new version string in
the database allow-list (migration) and in both forms.

Below the box both forms say: "If you tick the box, we'll send one short
email asking you to confirm. No lessons are sent until you do."

### Double opt-in (changed 2026-11-18)
1. **Request** — ticking the box records `marketing_consent_requested_at`
   (database time), `marketing_consent_source` and
   `marketing_consent_version`. `marketing_consent` stays `false`.
2. **Confirmation email** — `send-email` sends it after the report attempt,
   whatever the report's outcome (`netlify/lib/consent-confirmation.js`,
   template `emails/consent-confirmation.js`). A single-use random token
   (32 bytes); only its SHA-256 hash and a 7-day expiry are stored. At most
   one per request (`email_deliveries (lead, confirm, 0)`, Resend key
   `consent-confirm-lead-<id>`); none if the address is already subscribed,
   unsubscribed, or was sent one in the last 24 h. Off unless
   `EMAIL_CONFIRMATION_ENABLED=true` (independent of the lessons); fails
   closed without migration 7.
3. **Confirm** — the link opens `/.netlify/functions/confirm-subscription`,
   a page with a Confirm button. Opening the link (for example a mail
   scanner) changes nothing; only the button's POST activates consent. The
   database sets `marketing_consent_at` and destroys the token. Confirming
   sends nothing itself: lessons follow only while
   `EMAIL_SEQUENCE_ENABLED=true` (the page says so when they have not
   started yet).

The opt-in box ships hidden and disabled on both forms; `js/consent-optin.js`
shows it only when `/.netlify/functions/email-features` answers
`{"consentConfirmation": true}` (any other answer, error or network failure
keeps it hidden). The quiz scripts count only a ticked, enabled box, so while
confirmations are off nothing promises a confirmation email and no request is
recorded.

Stored per lead: `marketing_consent` (active), `marketing_consent_requested_at`,
`marketing_consent_source`, `marketing_consent_version`, `marketing_consent_at`
(confirmed), `marketing_consent_token_hash`, `marketing_consent_token_expires_at`,
`marketing_consent_withdrawn_at`. Existing leads have no request and
`marketing_consent = false` — nobody is enrolled retroactively and nobody is
sent a confirmation.

Who can change it (enforced by the database, migration 7):
* A request is recorded only when a quiz submission inserts a lead with the
  box ticked: allow-listed source and wording, server time. Consent is
  always `false` on insert, for every caller including administrators.
* Activation only by the service role (the confirmation page), only with a
  live token, no withdrawal and not `Unsubscribed`. Administrators, signed-in
  users and the SQL Editor cannot activate consent.
* At most one active subscriber per address (unique index).
* The request evidence and the confirmation time are never rewritten.
* Withdrawal by the server (unsubscribe function) or the SQL Editor, or
  automatically when anyone marks the lead `Unsubscribed`; server time;
  outstanding tokens destroyed; repeat unsubscribes keep the first time.

## 2. Sequences

### 2.1 Requested quiz report (live)
| | |
|---|---|
| Trigger | Quiz submitted (homepage or quiz.html) → `send-email` function |
| Eligibility | Newest lead for the address, `Pending`, created in the last hour, valid id; per-address limit |
| Timing | Immediately |
| Subject | 🌿 Your EMerriment Skin Report Is Ready |
| Preview | Your skin profile, a simple starting point and what to learn next. |
| Body | Profile, starting point, concern-specific education, when to see a professional, not-a-diagnosis note |
| CTA | Read about your concern in the encyclopedia; View My Skin Journey (dashboard) |
| Duplicate protection | Atomic claim (`Pending → Sending`), `email_deliveries (lead, report, 0)`, Resend idempotency key `report-lead-<id>` |

### 2.2 14-day education sequence (built, **disabled**)
| | |
|---|---|
| Trigger | Daily schedule (07:00 UTC) |
| Eligibility | confirmed `marketing_consent = true` and no withdrawal (checked in the query and again in the claim right before sending), not unsubscribed, not a verified customer, joined after `EMAIL_SEQUENCE_START_AFTER`, lesson due |
| Timing | Lesson 1 ≥ 24 h after the quiz; then one per daily run (20 h gap, fixed 2026-11-17 — the old 24 h gap meant every other day) |
| CTA | Each lesson links to EMerriment content |
| Unsubscribe | Link + `List-Unsubscribe` header in every lesson |
| Duplicate protection | Claim on day + due time + consent; `email_deliveries (lead, sequence, day)`; Resend idempotency `sequence-lead-<id>-day-<n>` |

| Day | Subject |
|---|---|
| 1 | 🌿 Day 1: What your skin type really tells you *(softened 2026-11-17)* |
| 2 | 🌿 Understanding Your Skin Type: The Foundation of Better Skincare |
| 3 | 🌿 5 common skincare mistakes (and simple fixes) *(softened; was fear-based)* |
| 4 | 🧪 The 5 Skincare Ingredients Your Skin Will Thank You For |
| 5 | 🤔 Why Your Skincare Routine Isn't Working (And How to Fix It) |
| 6 | 🌿 The Truth About Acne: It's More Than Just Pimples |
| 7 | ✨ Dark Spots & Hyperpigmentation: Why They Take So Long to Fade |
| 8 | ☀️ Morning vs 🌙 Night Skincare: Why They Should Never Be the Same |
| 9 | 💰 Expensive Doesn't Mean Better: The Truth About Skincare Products |
| 10 | 😴 Your Skin Is Watching Your Lifestyle (Even When You Aren't) |
| 11 | ⏳ Why Your Skincare Isn't Working Yet (The Patience Most People Don't Have) |
| 12 | 🧴 Do You Really Need a 10-Step Skincare Routine? |
| 13 | ☀️ Why daily sunscreen matters so much *(was an unsupported "#1 … dermatologists agree" claim)* |
| 14 | 🎉 Congratulations! Your EMerriment Journey Is Just Beginning |

Profile-specific follow-ups: days 6 (acne) and 7 (dark spots) already cover
the two most common concerns; the report carries concern-specific guidance.
Reordering lessons by concern is a later content decision.

### 2.3 Verified customer onboarding (built, **disabled**)
| Day after verification | Subject | Preview | CTA |
|---|---|---|---|
| 0 | 🌿 Welcome — let's get you started | Where to find your purchase, and a simple first step for this week. | Explore the encyclopedia |
| 3 | Three habits that make your routine work | Consistency, patch testing and sunscreen — the basics that matter most. | Open your dashboard |
| 10 | How is it going? (one quick question) | Tell us what's working and what isn't — it helps us improve. | Reply (needs `EMAIL_REPLY_TO`) |

Trigger: daily schedule over `purchases` (verified, not refunded, ≤ 30 days
old). At most one email per purchase per run; `email_deliveries (purchase,
customer, day)` reserved before sending; Resend idempotency
`customer-<purchase>-day-<n>`; fails closed without delivery records; skips
unsubscribed addresses; day 10 waits for a reply inbox. Customers stop
receiving nurture lessons. Selar sends the receipt — not repeated.

### 2.4 Planned (not built)
| Sequence | Trigger | Notes |
|---|---|---|
| Account welcome | Email confirmed | `emails/welcome.js` exists; needs an Auth hook or scheduled check |
| Inactive re-engagement | Subscriber with no click in 60 days | Opens are unreliable; one email max, then stop; marketing consent required |
| Newsletter | Manual | `emails/newsletter.js` exists; only to `marketing_consent = true`, not unsubscribed |

## 3. Suppression and failure handling

* Unsubscribe → `status = Unsubscribed` + consent withdrawn on **every** lead
  with the address; enforced by the sequence query, the claim and the
  onboarding run [lifecycle: "G: …"].
* Failed Resend call → claim and delivery reservation released, retried on
  the next run; never advanced or recorded as sent [sequence and lifecycle
  tests].
* Abandoned report claims (`Sending` > 35 min) recovered daily.
* Not yet automatic: hard bounces / complaints (needs the Resend webhook).
* Retention: `emerriment_backup` copies personal data — drop it after the
  migrations have been verified in production for a while.
