# EMerriment — visitor-to-customer journey

Last updated 2026-11-17. "Verified" below means demonstrated by an automated
test (named in brackets) or a live production check; everything else is
labelled **planned** or **needs an integration**.

## 1. User states

| State | How someone enters it | Where it is recorded | Observed / inferred |
|---|---|---|---|
| Visitor | Opens any page | Google Analytics (homepage only) | observed (GA, homepage) |
| Quiz lead | Submits a quiz with a valid email | `leads` row (identity id, answers) | observed |
| Pending subscriber | Ticks the **optional** 14-day lessons box on a quiz | `leads.marketing_consent_requested_at` (server time), source, wording version; `marketing_consent = false` | observed (after migration 7) |
| Marketing subscriber | Presses Confirm on the page linked from the confirmation email (double opt-in) | `leads.marketing_consent = true`, `marketing_consent_at` (server time) | observed (after migration 7, with `EMAIL_SEQUENCE_ENABLED=true`) |
| Registered user | Signs up (Supabase Auth) | `auth.users`, `profiles` | observed |
| Confirmed user | Clicks the confirmation link | `auth.users.email_confirmed_at` | observed |
| Checkout visitor | Clicks a Selar product link | GA `checkout_click` (product slug only); `product_clicks` for clicks inside emails | **intent only — never a purchase** |
| Verified customer | A purchase is verified (signed Selar webhook — not built — or an admin recording an order checked in the Selar dashboard) | `purchases` row (service role only) | needs an integration for automation |
| Returning customer | A second verified purchase for the same address | two `purchases` rows | derived from `purchases` |
| Unsubscribed | Unsubscribe link (one click, confirmed) | `leads.status = Unsubscribed`, `marketing_consent = false`, `marketing_consent_withdrawn_at` on every lead with that address | observed |

A visitor is **never** marked as a customer because they clicked a checkout
link or visited a payment page [lifecycle: "J: clicking a product link…";
journey.dom: "J: a click on a Selar link is recorded as checkout INTENT"],
and a purchase cannot be created from a browser [journey.pglite: "K: …";
journey.dom: "K: no browser file writes or reads the purchases table"].

## 2. Journey map

```
Discovery            Engagement              Lead capture                Report               Account            Conversion            Post-purchase
homepage ──────────► quiz (homepage or ────► email + optional opt-in ──► report email ──────► signup/confirm ──► Selar product page ──► onboarding emails
encyclopedia ───┐    quiz.html)              (report = 1 email,          (requested,          login/dashboard    (checkout_click       (verified purchases
AI assistant ───┼──► encyclopedia articles   lessons only with opt-in)   transactional)                          = intent only)         only, disabled)
social links ───┘    AI assistant                    │
                                                     └──► 14-day lessons (opt-in only, disabled)
```

### Stage A — Discovery
| Page | Primary next step | Status |
|---|---|---|
| Homepage | Quiz section, encyclopedia, AI, products | exists |
| Encyclopedia / articles | Related articles, recommended products (approved only), ratings | exists |
| Products page | Selar links | exists; checkout clicks now tracked as intent |
| Social links | Land on homepage | exists (no campaign tagging yet — add `utm_*` to social links; GA reads them automatically) |

### Stage B — Engagement
Quiz, encyclopedia and AI assistant are free and need no account. No popups
were added. `quiz_start` / `quiz_complete` events measure quiz drop-off.

### Stage C — Lead capture (changed 2026-11-17)
* Valid email required; invalid or missing email → inline message, nothing
  saved or sent [homepage-quiz: "invalid or missing email"].
* Double clicks → one lead, one report [homepage-quiz: "double click"].
* The form says what happens: "one email, because you asked for it".
* **Separate, optional, unticked** consent box for the 14-day lessons
  (wording version `quiz-optin-2026-11-17`, see EMAIL_LIFECYCLE_PLAN.md).
  Ticking it only records a **request**; lessons start only after the person
  confirms from a separate email (double opt-in, 2026-11-18). The database
  sets the request and confirmation times and accepts only known sources and
  wording versions [journey.pglite: "D: checkbox → a PENDING request only…",
  "a request needs an allow-listed wording version and source", "explicit
  confirmation activates consent…"; consent-confirmation suite].
* quiz.html previously took an email without explanation and sent nothing;
  it now explains and sends the requested report [quiz-pages: "one report
  email request"].
* If the consent migration is not applied yet, the quiz still saves (without
  consent) — deploy order cannot break lead capture [homepage-quiz: "database
  without the consent columns yet"].

### Stage D — Personalised report
Report email (transactional, requested): profile, starting point, and new
**concern-specific educational guidance** (acne, hyperpigmentation / dark
spots, rosacea, eczema) plus a skin-type tip, a "when to see a professional"
line, an encyclopedia link and "this is not a medical diagnosis"
[lifecycle: "report email: concern-specific guidance…"]. Text comes from a
fixed reviewed table, never from the visitor's input.

Known limitation: the homepage quiz "score" is 60 (50 for oily skin), i.e.
not a measurement. It is presented as a starting point; replacing it with a
meaningful, clearly-explained score is a product decision (not changed).

### Stage E — Account and dashboard
Signup/confirmation/login/logout/reset verified live (2026-11-16/17) and by
DOM tests (auth-pages.dom). Expired links explain themselves; unconfirmed
users can resend the confirmation. Account creation is never required for
the quiz, report, encyclopedia or AI assistant.

### Stage F — Conversion
Selar links on the homepage quiz results, products page and articles. Clicks
are recorded as `checkout_click` (product slug, page) in GA where GA is
loaded. **Payment verification is not integrated** (see §4).

### Stage G — Post-purchase
Onboarding emails (days 0/3/10) for verified purchases, built and tested,
**disabled** (`CUSTOMER_ONBOARDING_ENABLED`). They point to Selar's own
receipt instead of repeating it.

## 3. Analytics events (js/analytics.js)

Allow-listed events only; parameters limited to `form`, `field`, `success`,
`granted`, `sent`, `product`, `placement`, `method`; strings ≤ 40 chars; any
value containing "@" is dropped; quiz answers, names and addresses are never
sent [journey.dom: "analytics: only allow-listed events…"].

| Event | Where | Observed / inferred |
|---|---|---|
| `quiz_start` | first interaction with a quiz form | observed |
| `quiz_validation_error` | invalid email | observed |
| `quiz_complete` | homepage quiz submitted (valid) | observed |
| `lead_submit` (success) | homepage quiz | observed |
| `marketing_consent` (granted) | homepage quiz | observed |
| `checkout_click` (product, placement) | any Selar link on pages loading analytics.js | observed (intent) |
| report sent / delivered | `email_deliveries`, Resend dashboard | observed server-side |
| registrations / confirmations | `auth.users` | observed server-side |
| verified purchases | `purchases` | needs provider integration |
| email opens | `leads.emails_opened` (signed pixel) | inferred (image blocking, Apple Mail privacy) |

GA is loaded only on the homepage today, so events from quiz.html, products
and signup are no-ops until GA is added there (a privacy/cookie decision for
EMerriment; no paid tool needed).

**Server-side funnel (read-only, SQL Editor):**
```sql
select
  (select count(*) from leads) as quiz_leads,
  (select count(*) from leads where marketing_consent) as subscribers,
  (select count(*) from leads where status = 'Unsubscribed') as unsubscribed,
  (select count(*) from email_deliveries where kind = 'report' and status = 'sent') as reports_sent,
  (select count(*) from auth.users) as accounts,
  (select count(*) from auth.users where email_confirmed_at is not null) as confirmed_accounts,
  (select count(*) from purchases where refunded_at is null) as verified_purchases;
```

## 4. Missing integrations (documented, not invented)

| Gap | Why it matters | What it needs |
|---|---|---|
| Selar purchase verification | Customer onboarding and "verified customer" status have no automatic source | Selar's documented webhook + signature/secret verification in a new function writing `purchases`; until then an admin can record orders checked in the Selar dashboard (`verified_by = 'admin: …'`) |
| Resend bounce/complaint webhook | Hard bounces and spam complaints should suppress future marketing | Resend webhook (signed, Svix) → mark address suppressed |
| Reply inbox | Replies to hello@mail.emerriment.com reach no one | A real inbox + `EMAIL_REPLY_TO` (code ready; day-10 feedback email waits for it) |
| Account welcome email | Template exists (`emails/welcome.js`) but no trigger | Supabase Auth hook or a confirmed-signup check in a scheduled function |
| GA on more pages | Funnel visibility beyond the homepage | Add the GA tag (and any cookie notice EMerriment wants) |
| Legacy quiz copies | `article/`, `encyclopediaCMS/`, `skinquiz/` duplicates still save leads without consent UI (consent defaults to false, so no lessons) | Remove or redirect the duplicate pages |
