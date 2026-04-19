#!/usr/bin/env bash
# SEC-02 (Plan 01-02) per-user quota smoke test.
#
# Verifies:
#   1. Five authenticated anon-tier POST /api/v2-chat calls succeed
#      (or at minimum do NOT return 429).
#   2. The 6th call returns 429 with code="RATE_LIMITED", tier="anonymous",
#      a valid resetAt ISO timestamp, and suggest="sign_in".
#
# Prerequisites:
#   • Migration 016_user_quotas.sql applied to the target Supabase project
#     (Plan 07 gates the flag flip on this).
#   • PHASE_1_GATE_ENABLED=true in the target env.
#   • ANON_JWT env var holding a valid anonymous-user access token from
#     the target Supabase project. Obtainable via:
#       curl -X POST "$SUPABASE_URL/auth/v1/signup" \
#            -H "apikey: $SUPABASE_ANON_KEY" \
#            -H "Content-Type: application/json" \
#            -d '{"data":{}}'
#     and reading the `access_token` field (anonymous-sign-in response).
#
# Usage (local):
#   PHASE_1_GATE_ENABLED=true BASE_URL=http://localhost:3000 \
#     ANON_JWT=eyJ... bash app/scripts/smoke/sec-02-quota.sh
#
# Usage (staging, after Plan 07 flips the flag):
#   BASE_URL=https://huma-two.vercel.app ANON_JWT=$ANON_JWT \
#     bash app/scripts/smoke/sec-02-quota.sh
#
# Exit codes:
#   0 — all assertions pass
#   1 — an assertion failed (first failure reported; remainder skipped)

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
ANON_JWT="${ANON_JWT:-}"

if [ -z "$ANON_JWT" ]; then
  echo "ERROR: ANON_JWT env var not set. See script header for how to obtain one."
  exit 1
fi

echo "SEC-02 quota smoke against: $BASE_URL"
echo "Anon tier request cap: 5 per rolling 24h window"
echo

BODY='{"messages":[{"role":"user","content":"hi"}],"knownContext":{},"aspirations":[]}'

# ─── Calls 1-5: each should NOT return 429 ──────────────────────────────
for i in 1 2 3 4 5; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" \
    -X POST "$BASE_URL/api/v2-chat" \
    -H "Authorization: Bearer $ANON_JWT" \
    -H "Content-Type: application/json" \
    -d "$BODY")
  if [ "$code" = "429" ]; then
    echo "  [$i/5] FAIL: got 429 before the 6th call — quota ledger is broken or ANON_JWT is over its cap."
    exit 1
  fi
  echo "  [$i/5] ok (status=$code)"
done

# ─── Call 6: MUST return 429 with structured RATE_LIMITED body ──────────
echo
echo "[6/6] expect 429 with code='RATE_LIMITED', tier='anonymous'"

tmp=$(mktemp)
code=$(curl -sS -o "$tmp" -w "%{http_code}" \
  -X POST "$BASE_URL/api/v2-chat" \
  -H "Authorization: Bearer $ANON_JWT" \
  -H "Content-Type: application/json" \
  -d "$BODY")

if [ "$code" != "429" ]; then
  echo "  FAIL: expected 429, got $code"
  cat "$tmp"; rm -f "$tmp"
  exit 1
fi

body=$(cat "$tmp")
rm -f "$tmp"

# Extract fields with a tolerant grep (avoids pulling jq as a smoke dep).
if ! echo "$body" | grep -q '"code"[[:space:]]*:[[:space:]]*"RATE_LIMITED"'; then
  echo "  FAIL: body missing code='RATE_LIMITED'"
  echo "  body: $body"
  exit 1
fi
if ! echo "$body" | grep -q '"tier"[[:space:]]*:[[:space:]]*"anonymous"'; then
  echo "  FAIL: body missing tier='anonymous'"
  echo "  body: $body"
  exit 1
fi
if ! echo "$body" | grep -q '"suggest"[[:space:]]*:[[:space:]]*"sign_in"'; then
  echo "  FAIL: body missing suggest='sign_in'"
  echo "  body: $body"
  exit 1
fi
if ! echo "$body" | grep -q '"resetAt"[[:space:]]*:[[:space:]]*"[0-9]\{4\}-'; then
  echo "  FAIL: body missing a valid ISO resetAt timestamp"
  echo "  body: $body"
  exit 1
fi

echo "  PASS: 429 with {code:'RATE_LIMITED', tier:'anonymous', suggest:'sign_in', resetAt:'...'}"
echo
echo "SEC-02 smoke: PASS"
