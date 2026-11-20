# supabase/staging — staging rebuild and verification scripts

Full procedure, approvals and expected results: `docs/STAGING_AND_PREVIEWS.md` §4.
Nothing here contains a key, password, token or customer record.

| Step | File | Runs on | Writes? |
|---|---|---|---|
| 00 | `00_export_production_schema.sh` | production (metadata) | local file outside the repo |
| 01 | `01_preflight_fresh_project_read_only.sql` | staging | no (`--read-only`) |
| 02 | the dump from step 00 (`db query --file`) | staging | yes |
| 03 | `03_align_privileges.sql` | staging | yes (atomic, self-checking) |
| 04 | `04_structural_setup.sql` | staging | yes (atomic, self-checking) |
| 05 | `migration repair --status applied …` (command in the docs) | staging | history only |
| 06 | `seed_synthetic.sql` (with `set emerriment.seed_target = 'staging';`) | staging | yes (idempotent) |
| 07 | `07_create_test_accounts.js` | staging Auth Admin API | 3 accounts; passwords to a local file |
| 08 | `08_promote_admin_and_storage.sql` | staging | yes (atomic, self-checking) |
| 09a | `supabase/audit/03b_comprehensive_live_security_checks.sql` | staging | rolled back |
| 09b | `09_supplementary_security_checks.sql` | staging | rolled back |
| 10 | `verify/compare-with-production.js`, `verify/production-isolation.sql` | both | no (`--read-only`) |

* Every staging SQL step goes through `run-on-staging.sh --remote=<staging-ref>`,
  which refuses a bare `--remote`, the production ref and any unexpected ref.
* `verify/` holds read-only metadata queries (no row data except counts) and
  `inspect-dump.js` for the exported file.
* Local test of these scripts (no network): `node tests/db/staging-scripts.pglite.test.js`.
