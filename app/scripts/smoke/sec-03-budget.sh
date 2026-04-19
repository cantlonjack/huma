#!/usr/bin/env bash
# SEC-03 (Plan 01-03) token budget + tail-first truncation smoke test.
#
# Verifies:
#   1. A small prompt (100 × ~1KB user messages, ~25K tokens accurate) returns
#      200 with NO X-Huma-Truncated header — under the 80K Sonnet ceiling.
#   2. A large prompt (600 × ~1KB user messages, ~150K tokens accurate) returns
#      200 WITH X-Huma-Truncated: count=N,reason=budget — the tail-first
#      trim successfully brought the thread under budget and the header
#      surfaces the trim count to the client.
#
# Covers Warning 3 from Phase 01's RESEARCH.md: smoke-validate the budget
# enforcement end-to-end, not just via Vitest mocks.
#
# Prerequisites:
#   • PHASE_1_GATE_ENABLED=true in target env (else the auth gate returns a
#     system-source shim and budget still runs but quota is bypassed).
#   • Valid authenticated session: either ANON_JWT (anonymous access token)
#     OR COOKIE (browser-style sb-access-token cookie string).
#
# Usage (local):
#   PHASE_1_GATE_ENABLED=true BASE_URL=http://localhost:3000 \
#     ANON_JWT=eyJ... bash app/scripts/smoke/sec-03-budget.sh
#
# Usage (staging, after Plan 07 flips the flag):
#   BASE_URL=https://huma-two.vercel.app ANON_JWT=$ANON_JWT \
#     bash app/scripts/smoke/sec-03-budget.sh
#
# Exit codes:
#   0 — both curls hit the expected status + header state
#   1 — an assertion failed (first failure reported; remainder skipped)

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
ANON_JWT="${ANON_JWT:-}"
COOKIE="${COOKIE:-}"

AUTH_HEADER=()
if [ -n "$ANON_JWT" ]; then
  AUTH_HEADER=(-H "Authorization: Bearer $ANON_JWT")
elif [ -n "$COOKIE" ]; then
  AUTH_HEADER=(-H "Cookie: $COOKIE")
else
  echo "ERROR: neither ANON_JWT nor COOKIE env var is set."
  echo "  Either pass ANON_JWT=<access_token> (anonymous-signin response token)"
  echo "  or COOKIE='sb-access-token=...; sb-refresh-token=...' (browser session)."
  exit 1
fi

echo "SEC-03 budget smoke against: $BASE_URL"
echo "Sonnet soft cap: 80K input tokens (tail-first trim when exceeded)"
echo

# ── Helper: build N user-message entries, each ~1KB of text (~250 tokens) ──
# Each message has ~250 chars of lorem; 100 of them ≈ 25K tokens (well under
# the 80K Sonnet cap), 600 of them ≈ 150K tokens (will trigger trim).
build_payload() {
  local n="$1"
  local content
  # 40 × "lorem ipsum dolor sit amet " ≈ 1080 chars ≈ 270 tokens
  content=$(printf 'lorem ipsum dolor sit amet %.0s' $(seq 1 40))
  local messages="["
  local i
  for i in $(seq 1 "$n"); do
    if [ "$i" -gt 1 ]; then messages+=","; fi
    messages+="{\"role\":\"user\",\"content\":\"${content}\"}"
  done
  messages+="]"
  echo "{\"messages\":${messages},\"knownContext\":{},\"aspirations\":[]}"
}

# ── Curl 1: 100 messages → expect 200 + NO truncation header ──────────────
echo "[1/2] 100 messages × ~1KB (~25K tokens) → expect 200, NO X-Huma-Truncated"
hdrs=$(curl -sS -D - -o /dev/null -X POST "$BASE_URL/api/v2-chat" \
  -H "Content-Type: application/json" "${AUTH_HEADER[@]}" \
  -d "$(build_payload 100)")
status=$(echo "$hdrs" | head -n1 | awk '{print $2}')
truncated=$(echo "$hdrs" | grep -i "^x-huma-truncated:" || true)
if [ "$status" != "200" ]; then
  echo "  FAIL: expected 200, got $status"
  echo "  headers: $hdrs"
  exit 1
fi
if [ -n "$truncated" ]; then
  echo "  FAIL: unexpected X-Huma-Truncated header on ~25K-token payload: $truncated"
  exit 1
fi
echo "  PASS: status=200, no truncation header"

# ── Curl 2: 600 messages → expect 200 + X-Huma-Truncated header ───────────
echo
echo "[2/2] 600 messages × ~1KB (~150K tokens) → expect 200 WITH X-Huma-Truncated"
hdrs=$(curl -sS -D - -o /dev/null -X POST "$BASE_URL/api/v2-chat" \
  -H "Content-Type: application/json" "${AUTH_HEADER[@]}" \
  -d "$(build_payload 600)")
status=$(echo "$hdrs" | head -n1 | awk '{print $2}')
truncated=$(echo "$hdrs" | grep -i "^x-huma-truncated:" || true)
if [ "$status" != "200" ]; then
  echo "  FAIL: expected 200, got $status"
  echo "  headers: $hdrs"
  exit 1
fi
if [ -z "$truncated" ]; then
  echo "  FAIL: missing X-Huma-Truncated header on ~150K-token payload"
  echo "  headers: $hdrs"
  exit 1
fi
# Normalize whitespace for the content match.
trunc_value=$(echo "$truncated" | sed 's/^[xX]-[hH]uma-[tT]runcated:[[:space:]]*//' | tr -d '\r\n')
if ! echo "$trunc_value" | grep -qE 'count=[0-9]+,reason=budget'; then
  echo "  FAIL: X-Huma-Truncated value does not match 'count=N,reason=budget': $trunc_value"
  exit 1
fi
echo "  PASS: status=200, X-Huma-Truncated present → $trunc_value"
echo

echo "SEC-03 smoke: PASS"
