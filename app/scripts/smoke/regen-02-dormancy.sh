#!/usr/bin/env bash
# REGEN-02 integration smoke — Plan 02-02.
#
# End-to-end flow:
#   1. curl POST /api/operator/dormancy with {enable:true}    -> 200, active:true
#   2. trigger /api/cron/morning-sheet with $CRON_SECRET       -> 200; Vercel logs show
#                                                                skip_reason:'dormant'
#   3. curl POST /api/operator/dormancy with {enable:false}   -> 200, active:false
#   4. next cron trigger should process the user normally     -> 200; no skip log
#
# Expected env:
#   BASE_URL         — staging deployment, e.g. https://huma-two.vercel.app
#                     defaults to http://localhost:3000 for local dev
#   OPERATOR_JWT     — Bearer token for the dormancy-toggle call (Supabase access_token)
#   CRON_SECRET      — matches Vercel cron bearer
#
# Exit 0 = smoke passes. Non-zero = failure; log output above for diagnosis.

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
OPERATOR_JWT="${OPERATOR_JWT:-}"
CRON_SECRET="${CRON_SECRET:-}"

if [[ -z "$OPERATOR_JWT" ]]; then
  echo "ERROR: OPERATOR_JWT env var required (Supabase access_token for the test operator)" >&2
  exit 1
fi

if [[ -z "$CRON_SECRET" ]]; then
  echo "ERROR: CRON_SECRET env var required" >&2
  exit 1
fi

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

echo "=== REGEN-02 smoke: $BASE_URL ==="

# 1. Enable Dormancy
echo "[1/4] POST /api/operator/dormancy { enable:true }"
curl -fsS -X POST "$BASE_URL/api/operator/dormancy" \
  -H "Authorization: Bearer $OPERATOR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"enable":true}' \
  | tee "$TMPDIR/dormancy-enable.json"
echo

if ! grep -q '"active":true' "$TMPDIR/dormancy-enable.json"; then
  echo "FAIL: enable response missing \"active\":true" >&2
  exit 1
fi

# 2. Trigger cron — dormant user should be skipped
echo "[2/4] GET /api/cron/morning-sheet (expect user skipped)"
curl -fsS "$BASE_URL/api/cron/morning-sheet" \
  -H "Authorization: Bearer $CRON_SECRET" \
  | tee "$TMPDIR/cron-dormant.json"
echo
echo "  >> manual verification: Vercel logs should show"
echo "     { ..., skip_reason:'dormant', source:'cron' } for the test user"

# 3. Disable Dormancy
echo "[3/4] POST /api/operator/dormancy { enable:false }"
curl -fsS -X POST "$BASE_URL/api/operator/dormancy" \
  -H "Authorization: Bearer $OPERATOR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"enable":false}' \
  | tee "$TMPDIR/dormancy-disable.json"
echo

if ! grep -q '"active":false' "$TMPDIR/dormancy-disable.json"; then
  echo "FAIL: disable response missing \"active\":false" >&2
  exit 1
fi

# 4. Trigger cron again — user should process normally
echo "[4/4] GET /api/cron/morning-sheet (expect user processed)"
curl -fsS "$BASE_URL/api/cron/morning-sheet" \
  -H "Authorization: Bearer $CRON_SECRET" \
  | tee "$TMPDIR/cron-active.json"
echo
echo "  >> manual verification: Vercel logs should show NO skip_reason entry"
echo "     for the test user on this run"

echo
echo "=== REGEN-02 smoke: PASSED ==="
echo "Responses captured in $TMPDIR — inspect if the Vercel log greps fail"
