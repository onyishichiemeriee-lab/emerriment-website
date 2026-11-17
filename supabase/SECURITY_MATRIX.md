# EMerriment — database security matrix

Live state read on 2026-11-13 (metadata only) and the intended state after
migrations 0–6. "Owner" = the signed-in user whose id is in the row's
`user_id` (or `id` for `profiles`). "Admin" = `profiles.is_admin = true`,
checked by `emerriment_is_admin()`. The service role (Netlify functions)
bypasses RLS in both states and is never exposed to the browser (no browser
file references it; it exists only in Netlify environment variables).

| Table (rows) | Live before | Anonymous after | Signed-in user after | Admin after | Notes |
|---|---|---|---|---|---|
| `leads` (79) | **anyone reads all** (SELECT `true`); public insert; ids all NULL, no PK | insert quiz columns only (rate-limited, state normalised); no read/update/delete | same as anonymous | read, update, delete | Contains names + emails. Counters/notes not writable by visitors except quiz fields. |
| `profiles` (6) | own row; **own `is_admin` writable** | none | own row: read; write descriptive columns only | all rows: read, write descriptive columns; admin access only via `emerriment_set_admin()` | `id` and `is_admin` not writable through the API; trigger also blocks; last admin protected. Signup trigger always sets `is_admin = false`. |
| `quiz_results` (3) | own rows (update had no WITH CHECK) | none | own rows (all actions) | all | Ownership cannot be reassigned. |
| `reading_history` (1) | own insert/select only (progress update failed) | none | own rows (all actions) | all | Upsert on `(user_id, article_id)` now works. |
| `saved_articles` (1) | own insert/select only (unsave failed) | none | own rows (all actions) | all | |
| `saved_products` (0) | no policy → unusable | none | own rows | all | |
| `favorite_articles` (0) | own insert/select/delete | none | own rows | all | |
| `article_ratings` (0) | no policy → unusable | average + count only, via `emerriment_article_rating_summary()` (published articles) | own ratings (all actions) | all | Who rated what, and comments, stay private. |
| `ai_conversations` (219) | own rows (update had no WITH CHECK) | none | own rows | all | |
| `ai_messages` (260) | own by `user_id`; **could post into others' conversations** | none | own rows, only in own conversations | all | |
| `ai_memory` (12) | own rows | none | own rows | all | |
| `ai_events` (0) | **anyone reads** | none | none | all | Analytics; written only server-side. |
| `ai_feedback` (0) | no policy | none | none | all | No `user_id` column. |
| `ai_questions` (0) | no policy | none | none | all | |
| `ai_settings` (0) | no policy | none | none | all | |
| `website_settings` (0) | no policy | none | none | all | Not read by public pages. |
| `product_clicks` (0) | no policy | none | none | all | Written by `track-click` (service role). |
| `collections` (0) | no policy | none | none | all | CMS only. |
| `collection_articles` (0) | no policy | none | none | all | CMS only. |
| `encyclopedia_articles` (2) | published readable; admin insert; **no update/delete** (CMS edits failed) | published only; +1 view via `emerriment_increment_article_views()` (published only) | published only | all incl. drafts: create, edit, publish, delete | |
| `products` (1) | no policy → **website could not show products** | approved only | approved only | all | |
| `article_products` (0) | no policy | links between a published article and an approved product | same | all | |
| `email_deliveries` (new) | — | none | none | none | Service role only; one row per email, prevents duplicates. |

## Other access routes

| Route | Live before | After |
|---|---|---|
| Table privileges | `anon`/`authenticated` had ALL on every table, incl. TRUNCATE (bypasses RLS; not exposed by PostgREST) | no TRUNCATE/TRIGGER/REFERENCES; anon: read-only on public content, insert-only (quiz columns) on leads, nothing on private tables |
| Views / materialized views | none | none |
| Functions | `handle_new_user` (definer, safe: `is_admin = false`), `rls_auto_enable` (definer event trigger); both EXECUTE-able by anon | not executable through the API; new functions are SECURITY DEFINER with `search_path = ''` and explicit grants |
| Triggers | `auth.users → handle_new_user` | + `emerriment_guard_profile_privileges` (profiles), `emerriment_guard_lead_insert` (leads) |
| Storage | bucket `article-images` public, no size/type limit; writes limited to the admin's uid folder `admin/assets` | images only (jpeg/png/webp/gif/avif), 5 MB max; policies unchanged |
| Schemas | `emerriment_private`, `emerriment_backup` not granted to API roles | unchanged |
| Admin assignment | any user could set own `is_admin` | only `emerriment_set_admin()`, callable by admins, never removes the last admin |
