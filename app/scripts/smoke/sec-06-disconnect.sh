#!/usr/bin/env bash
# SEC-06 (Plan 01-06) SSE-disconnect smoke test.
#
# Verifies the Anthropic stream is torn down when the client disconnects
# mid-response. This is a MANUAL-OBSERVATION smoke — the only ground truth
# is the Vercel log line for this req_id. The curl exit code on kill is not
# a reliable signal.
#
# Usage (local):
#   cd app && npm run dev &    # start dev server first
#   PHASE_1_GATE_ENABLED=true BASE_URL=http://localhost:3000 \
#     ANON_JWT=your-anon-jwt bash scripts/smoke/sec-06-disconnect.sh
#
# Usage (staging, after Plan 07 flips the flag):
#   BASE_URL=https://huma-two.vercel.app ANON_JWT=$ANON_JWT \
#     bash app/scripts/smoke/sec-06-disconnect.sh
#
# Cookie alternative: COOKIE="sb-access-token=...; sb-refresh-token=..."
#
# NOTE: the auth gate rejects unauthenticated requests — set ANON_JWT or
# COOKIE before running against a gate-enabled environment.

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
ANON_JWT="${ANON_JWT:-}"
COOKIE="${COOKIE:-}"

COOKIE_HDR=""
if [ -n "$ANON_JWT" ]; then
  COOKIE_HDR="-H \"Cookie: sb-access-token=$ANON_JWT\""
elif [ -n "$COOKIE" ]; then
  COOKIE_HDR="-H \"Cookie: $COOKIE\""
else
  echo "SKIP: ANON_JWT/COOKIE not set. Cannot exercise gated route."
  echo "  Set one of:"
  echo "    ANON_JWT=<supabase-access-token>   (preferred)"
  echo "    COOKIE=\"sb-access-token=...; sb-refresh-token=...\""
  exit 0
fi

OUT_FILE="${TMPDIR:-/tmp}/sec06_out"
rm -f "$OUT_FILE"

echo "SEC-06 disconnect smoke against: $BASE_URL"
echo "Starting streaming POST; will kill after ~100ms."
echo

# Kick off the streaming request in the background. curl -N disables the
# output buffer so bytes flush as they arrive — matches real SSE behaviour.
eval curl -N -sS -X POST "$BASE_URL/api/v2-chat" \
  -H "'Content-Type: application/json'" $COOKIE_HDR \
  -d '"'"'{"messages":[{"role":"user","content":"give me a long response about trees"}],"knownContext":{},"aspirations":[]}'"'"' \
  > "$OUT_FILE" 2>&1 &
CURL_PID=$!

# Let the stream start, then yank the client. 100ms is long enough for the
# route to begin iterating, short enough that the response will be nowhere
# near complete — the abort path MUST fire.
sleep 0.1
kill "$CURL_PID" 2>/dev/null || true
wait "$CURL_PID" 2>/dev/null || true

echo "==> curl captured output (first 500 bytes, may be partial or empty):"
head -c 500 "$OUT_FILE" 2>/dev/null || true
echo
echo

cat <<'MANUAL'
==> MANUAL VERIFICATION STEPS (the curl exit code is NOT the signal):

  1. Open Vercel Dashboard → Project → Logs.
  2. Filter by route = /api/v2-chat in the last 5 minutes.
  3. Find the log line matching this curl's timestamp (req_id is unique).
  4. Confirm ONE of the following — either is a PASS:
       (a) A log entry mentioning 'APIUserAbortError' or 'stream aborted'.
       (b) Status=200 with latency_ms < 500 AND output_tokens = 0 (or a
           very small partial count from the chunks that made it out).

  FAIL signals (means the abort did NOT reach Anthropic):
    - latency_ms near the model's typical full-response time.
    - output_tokens at or near max_tokens (2048).
    - No abort/cancel mention in the log and full 'finalMessage' resolved.

  If Plan 05c is merged, the structured log will also include
  reconciliation fields — output_tokens captures whatever was emitted
  before the abort landed.
MANUAL
