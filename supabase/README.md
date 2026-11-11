# EMerriment — Supabase security migrations

**Status: prepared, NOT applied.** Nothing in this folder has been run against
the live database. Every change below needs your review and approval.

| Path | What it is |
|---|---|
| `audit/01_read_only_security_audit.sql` | Read-only metadata queries. Run first and **save the output** — it is also your record of the current policies for rollback. |
| `migrations/20261110090000_emerriment_security_helpers.sql` | `emerriment_is_admin()` + trigger that stops non-admins changing `profiles.is_admin` and protects the last admin. |
| `migrations/20261110090100_emerriment_leads_rls.sql` | `leads`: visitors may only insert; admins read/update/delete; server-side rate limits and safe initial email state. |
| `migrations/20261110090200_emerriment_user_data_rls.sql` | `profiles` and per-user tables: own rows only (admins see all); ratings stay publicly readable. |
| `migrations/20261110090300_emerriment_content_admin_rls.sql` | Articles/products/collections: admin-only writes (reads unchanged); settings/AI analytics/product clicks admin-only; `increment_article_views()`. |
| `migrations/20261110090400_emerriment_email_delivery.sql` | Allows `Sending` / `Unsubscribed` values; creates `email_deliveries` (at-most-once email records). |
| `rollback/emerriment_security_rollback.sql` | Removes everything the migrations created. |

## Design

* **Nothing existing is dropped.** The migrations add *restrictive* policies,
  which Postgres combines with AND on top of whatever policies already exist,
  plus permissive policies for the intended access. Rollback removes only
  objects named `emerriment_*` (plus `email_deliveries` and
  `increment_article_views`).
* Restrictive policies apply only to the API roles `anon` and `authenticated`.
  The service role (Netlify functions), the auth signup trigger and the SQL
  editor are not affected.
* Migration 1 aborts if no administrator exists, so the CMS cannot be locked
  out, and the last administrator can never be demoted.

## Order

1. Run `audit/01_read_only_security_audit.sql`; save all results.
2. Review the results against the "PENDING VERIFICATION" notes at the top of
   each migration (column names/types, enum vs check constraints, which
   policies already exist). Adjust before applying if anything differs.
3. Apply migration 5 (email) on its own first if you want — it is additive and
   independent. After it, check the NOTICE output for CHECK constraints that
   must allow `Sending` / `Unsubscribed`.
4. Apply migrations 1 → 4 in order, ideally on a **staging/branch database
   first**, then production. Read every NOTICE (skipped tables are listed).
5. Deploy the website code from `security/supabase-email-finalization`
   (it already works before and after the migrations).

## Verify after applying (in the browser console on the live site)

Signed **out**:

```js
await supabaseClient.from("leads").select("*").limit(1)          // → data: []   (no rows visible)
await supabaseClient.from("profiles").select("*").limit(1)       // → data: []
await supabaseClient.from("encyclopedia_articles").update({ title: "x" }).eq("id", "<any id>")  // → no row changed
```

Signed in as an **ordinary user**:

```js
const { data: { user } } = await supabaseClient.auth.getUser();
await supabaseClient.from("profiles").update({ is_admin: true }).eq("id", user.id)
// → error "Only an administrator can change administrator access."
await supabaseClient.from("quiz_results").select("user_id")      // → only your own rows
```

As the **administrator**: open the CMS (users, subscribers, articles, products,
settings, AI analytics) and confirm everything still loads and saves; toggle
admin on a test account and back.

Then take the homepage quiz once (anonymous) and once signed in, and the
`quiz.html` quiz once.

## Rollback

Run `rollback/emerriment_security_rollback.sql`. If a table had RLS **disabled**
before (audit query 1), disable it again manually as noted in that file.
