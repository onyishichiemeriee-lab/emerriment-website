#!/usr/bin/env bash
# =====================================================================
# EMerriment — run one SQL file on the STAGING project (and only there)
# ---------------------------------------------------------------------
# The local Supabase link points at PRODUCTION, so a bare --remote or a
# command without --remote would hit production. This wrapper:
#   * requires the staging ref explicitly:   --remote=<staging-ref>
#   * refuses the production ref and anything that is not the expected
#     staging ref (override the expectation with STAGING_REF=<ref> only
#     if staging is ever rebuilt as a new project);
#   * checks that the CLI itself reports the staging target;
#   * hides credential-like lines from the output.
# The SQL files carry their own in-database guards as well.
#
# Usage (Git Bash, repository root):
#   bash supabase/staging/run-on-staging.sh --remote=ayxakyyvomlzrsfznpeq [--read-only] <file.sql>
# =====================================================================
set -euo pipefail

PROD=ioeulnjrozkbetaongbv
EXPECTED="${STAGING_REF:-ayxakyyvomlzrsfznpeq}"
ref="" ro="" file=""
for a in "$@"; do
    case "$a" in
        --remote=*) ref="${a#--remote=}" ;;
        --remote)   echo "ABORT: a bare --remote targets the linked PRODUCTION project; use --remote=<staging-ref>" >&2; exit 2 ;;
        --read-only) ro="--read-only" ;;
        -*) echo "ABORT: unknown option $a" >&2; exit 2 ;;
        *) file="$a" ;;
    esac
done
[ -n "$ref" ] || { echo "ABORT: --remote=<staging-ref> is required" >&2; exit 2; }
[ "$ref" != "$PROD" ] || { echo "ABORT: $PROD is PRODUCTION; this wrapper only runs on staging" >&2; exit 2; }
[ "$ref" = "$EXPECTED" ] || { echo "ABORT: $ref is not the expected staging ref ($EXPECTED)" >&2; exit 2; }
[ -n "$file" ] && [ -f "$file" ] || { echo "ABORT: SQL file not found: ${file:-<none>}" >&2; exit 2; }

echo "file: $file  sha256: $(sha256sum "$file" | cut -c1-16)…  target: $ref ${ro:+(read-only)}"
yes="--yes"; [ -z "$ro" ] || yes=""
set +e
out=$(npx --yes supabase@3.1.0 db query --remote="$ref" $ro --file "$file" --output-format json $yes 2>&1)
rc=$?
set -e
printf '%s\n' "$out" | grep -viE 'password|pgpass|postgres(ql)?://|eyJ[A-Za-z0-9_-]{10,}|sb_secret_'
first=$(printf '%s\n' "$out" | grep -m1 '^Target:' || true)
[[ "$first" == "Target: project $ref (not the linked project)"* ]] || { echo "WARNING: CLI did not report the staging target (got: ${first:-none})" >&2; [ $rc -ne 0 ] || rc=3; }
exit $rc
