#!/usr/bin/env bash
# SEC-01 (Plan 01-01) auth-gate smoke test.
#
# Verifies:
#   1. Unauthenticated POST /api/v2-chat → 401
#   2. Unauthenticated POST /api/sheet → 401
#   3. POST /api/sheet with Bearer $CRON_SECRET → NOT 401 (cron bypass works)
#
# Usage (local):
#   cd app && npm run dev &    # start dev server first
#   PHASE_1_GATE_ENABLED=true BASE_URL=http://localhost:3000 \
#     CRON_SECRET=your-secret bash scripts/smoke/sec-01-curl.sh
#
# Usage (staging, after Plan 07 flips the flag):
#   BASE_URL=https://huma-two.vercel.app CRON_SECRET=$CRON_SECRET \
#     bash app/scripts/smoke/sec-01-curl.sh
#
# NOTE: While PHASE_1_GATE_ENABLED=false the first two checks will return 200,
# not 401 — that's the pre-rollout shim (source:"system"), not a regression.

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
CRON_SECRET="${CRON_SECRET:-}"

echo "SEC-01 smoke against: $BASE_URL"
echo

echo "[1/3] Unauth POST /api/v2-chat → expect 401"
code=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v2-chat" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hi"}],"knownContext":{},"aspirations":[]}')
if [ "$code" = "401" ]; then
  echo "  PASS: 401"
else
  echo "  FAIL: expected 401, got $code"
  exit 1
fi

echo "[2/3] Unauth POST /api/sheet → expect 401"
code=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/sheet" \
  -H "Content-Type: application/json" \
  -d '{"name":"Smoke","aspirations":[],"knownContext":{},"recentHistory":[],"conversationMessages":[],"dayCount":1,"archetypes":[],"whyStatement":"","timeOfDay":"morning"}')
if [ "$code" = "401" ]; then
  echo "  PASS: 401"
else
  echo "  FAIL: expected 401, got $code"
  exit 1
fi

if [ -n "$CRON_SECRET" ]; then
  echo "[3/3] Cron bearer POST /api/sheet → expect NOT 401"
  code=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/sheet" \
    -H "Authorization: Bearer $CRON_SECRET" \
    -H "Content-Type: application/json" \
    -d '{"name":"Cron","aspirations":[],"knownContext":{},"recentHistory":[],"conversationMessages":[],"dayCount":1,"archetypes":[],"whyStatement":"","timeOfDay":"morning"}')
  if [ "$code" != "401" ]; then
    echo "  PASS: cron bearer bypassed auth (got $code, not 401)"
  else
    echo "  FAIL: cron bearer still 401 — CRON_SECRET mismatch?"
    exit 1
  fi
else
  echo "[3/3] CRON_SECRET not set in env — skipping cron-bypass smoke."
fi

echo
echo "SEC-01 smoke: PASS"
