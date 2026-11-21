#!/usr/bin/env bash
# =====================================================================
# EMerriment — schema-only export of PRODUCTION for rebuilding STAGING
# ---------------------------------------------------------------------
# Reads production metadata only (no table rows). Needs explicit
# approval each time. See docs/STAGING_AND_PREVIEWS.md §4, step 3.
#
# Uses the dump wrapper that Supabase CLI 3.1.0 generates (--dry-run)
# but runs it with a local standalone pg_dump 17 instead of Docker.
#   * The wrapper carries a temporary credential: it is held in a shell
#     variable, checked, then piped straight into bash. It is never
#     written to disk; everything printed has the password removed.
#   * Exactly two Windows/Git Bash compatibility corrections are applied
#     (and verified): quote the schema pattern, spell
#     --quote-all-identifiers in full.
#   * TLS: PGSSLMODE=verify-full against the Supabase Root 2021 CA,
#     pinned by fingerprint. Without the CA file the script stops.
#   * The CLI creates/refreshes its temporary login role
#     cli_login_postgres on production (Supabase-managed).
#
# Usage (Git Bash), from the repository root:
#   PG_BIN=/c/Users/<you>/AppData/Local/Programs/pgsql17-client/bin \
#   SUPABASE_CA=/c/path/to/prod-ca-2021.crt \
#   bash supabase/staging/00_export_production_schema.sh "$TEMP/emerriment-staging-schema.sql"
# The output path must be outside the repository and must not exist.
# =====================================================================
set -euo pipefail

PROD=ioeulnjrozkbetaongbv
STAGING=ayxakyyvomlzrsfznpeq
EXPECT_CA_FP='80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA'
OUT="${1:-}"

die() { echo "ABORT: $*" >&2; exit 2; }
[ -n "$OUT" ] || die "give the output file path (outside the repository)"
[ -e "$OUT" ] && die "$OUT already exists"
REPO=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
REPO=$(cygpath -u "$REPO" 2>/dev/null || printf '%s' "$REPO")
case "$(cd "$(dirname "$OUT")" && pwd)/" in "$REPO"/*) die "output must be outside the repository" ;; esac
[ -n "${PG_BIN:-}" ] && [ -x "$PG_BIN/pg_dump" -o -x "$PG_BIN/pg_dump.exe" ] || die "set PG_BIN to the folder containing pg_dump 17"
[ -n "${SUPABASE_CA:-}" ] && [ -f "$SUPABASE_CA" ] || die "set SUPABASE_CA to the Supabase Root 2021 CA file (see the docs)"
[ "$(openssl x509 -in "$SUPABASE_CA" -noout -fingerprint -sha256 | cut -d= -f2)" = "$EXPECT_CA_FP" ] || die "CA fingerprint mismatch"

export PATH="$PG_BIN:$PATH"
export PGSSLMODE=verify-full
export PGSSLROOTCERT
PGSSLROOTCERT=$(cygpath -m "$SUPABASE_CA" 2>/dev/null || printf '%s' "$SUPABASE_CA")
[ "$(command -v pg_dump)" = "$PG_BIN/pg_dump" ] || die "wrong pg_dump on PATH: $(command -v pg_dump)"
pg_dump --version | grep -q '(PostgreSQL) 17\.' || die "pg_dump is not version 17: $(pg_dump --version)"
echo "pg_dump: $(command -v pg_dump) -> $(pg_dump --version)"
echo "TLS: PGSSLMODE=$PGSSLMODE, root CA fingerprint OK"

echo "--- CLI (stderr, credential-free lines only):"
script=$(npx --yes supabase@3.1.0 db dump --remote="$PROD" --schema public,emerriment_private --dry-run \
           2> >(grep -viE 'password|pgpass|postgres(ql)?://' >&2) \
         | sed -n '/^#!\/usr\/bin\/env bash/,$p')
sleep 1

pw=$(printf '%s\n' "$script" | sed -n 's/^export PGPASSWORD=//p')
[ -n "$pw" ] || die "wrapper has no PGPASSWORD export (unexpected shape)"
show() { local s="$1"; s="${s//"$pw"/<redacted>}"; printf '%s\n' "$s"; }
val() { printf '%s\n' "$script" | sed -n "s/^export $1=//p" | tr -d "\"'"; }

echo "--- target checks:"
echo "PGHOST=$(val PGHOST)  PGPORT=$(val PGPORT)  PGDATABASE=$(val PGDATABASE)"
show "PGUSER=$(val PGUSER)"
fail=0
[[ "$(val PGUSER)" == *".$PROD" ]]             || { echo "FAIL: PGUSER is not for production $PROD"; fail=1; }
[[ "$(val PGHOST)" == *.pooler.supabase.com ]] || { echo "FAIL: unexpected host"; fail=1; }
[[ "$script" != *"$STAGING"* ]]               || { echo "FAIL: staging ref appears in the wrapper"; fail=1; }
[[ "$script" != *PGSSL* ]]                    || { echo "FAIL: wrapper sets PGSSL* (would override verify-full)"; fail=1; }
[[ "$script" == *"--schema-only"* ]]          || { echo "FAIL: not schema-only"; fail=1; }
[[ "$script" != *"--data-only"* && "$script" != *"--inserts"* ]] || { echo "FAIL: data flags present"; fail=1; }
[ "$fail" = 0 ] || { unset pw script; die "target checks failed; pg_dump not run"; }

# --- the two approved compatibility corrections (exactly two lines change) ---
count() { local s="$1" p="$2" r; r="${s//"$p"/}"; echo $(( (${#s} - ${#r}) / ${#p} )); }
OLD1='--schema=public|emerriment_private';  NEW1="--schema='public|emerriment_private'"
OLD2='--quote-all-identifier \';            NEW2='--quote-all-identifiers \'
[ "$(count "$script" "$OLD1")" = 1 ] || die "schema flag not found exactly once (CLI output changed?)"
[ "$(count "$script" "$OLD2")" = 1 ] || die "quote flag not found exactly once (CLI output changed?)"
orig="$script"
script="${script/"$OLD1"/$NEW1}"
script="${script/"$OLD2"/$NEW2}"
changed=$(diff <(printf '%s\n' "$orig") <(printf '%s\n' "$script") | grep -c '^[<>]' || true)
[ "$(printf '%s\n' "$orig" | wc -l)" = "$(printf '%s\n' "$script" | wc -l)" ] && [ "$changed" = 4 ] || die "correction diff unexpected"
unset orig
echo "corrections applied: 2 lines; Supabase sed filters kept: $(printf '%s\n' "$script" | grep -c '^| sed ' || true)"
echo "--- pg_dump invocation:"
show "$(printf '%s\n' "$script" | sed -n '/^pg_dump \\$/,/^| sed/p' | head -7)"

echo "--- running -> $OUT"
set +e
printf '%s\n' "$script" | bash > "$OUT"
rc=("${PIPESTATUS[@]}")
set -e
unset pw script
echo "exit status: bash/pg_dump=${rc[1]}"
[ "${rc[1]}" = 0 ] || { rm -f "$OUT"; die "export failed (partial output removed)"; }
[ -s "$OUT" ] || { rm -f "$OUT"; die "export is empty"; }
ls -l "$OUT"
echo "sha256: $(sha256sum "$OUT" | cut -d' ' -f1)"
echo "EXPORT OK — next: node supabase/staging/verify/inspect-dump.js \"$OUT\""
