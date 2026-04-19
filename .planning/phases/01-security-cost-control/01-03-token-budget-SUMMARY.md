---
phase: 01-security-cost-control
plan: 03
subsystem: api
tags: [anthropic, token-budget, countTokens, quota, sse, tdd, vitest]

requires:
  - phase: 01-00-fixtures
    provides: "makeMockAnthropic (countTokens + stream + create) + mockSupabaseAnonSession"
  - phase: 01-01-auth-gate
    provides: "requireUser → AuthContext {user, isCron, source}"
  - phase: 01-02-quota-ledger
    provides: "checkAndIncrement(userId, route, inputTokens, reqId?)"
  - phase: 01-06-sse-abort
    provides: "{signal: request.signal} abort wiring already in v2-chat"

provides:
  - "budgetCheck() helper that tail-trims messages[] via countTokens() before Anthropic dispatch"
  - "pickBudget(model) + BUDGETS {sonnet:80K, haiku:150K} policy constants"
  - "Route ordering (Blocker 6 of 01-02): budgetCheck runs BEFORE checkAndIncrement — quota RPC now receives accurate input-token count"
  - "413 PAYLOAD_TOO_LARGE with Voice-Bible body when system alone exceeds budget"
  - "X-Huma-Truncated: count=N,reason=budget response header on trim"
  - "sec-03-budget.sh smoke script (Warning 3)"
  - "Info 3 lock-in: X-Huma-Truncated header survives Plan 05a's withObservability wrap (asserted in budget test)"

affects:
  - 01-05b-observability-routes
  - 01-05c-observability-streaming
  - 01-07-enablement

tech-stack:
  added: []
  patterns:
    - "Budget-before-quota ordering in Anthropic-calling routes"
    - "Policy ceilings in lib (BUDGETS) wired via pickBudget(model)"
    - "Conditional response header: X-Huma-Truncated only when trimmedCount > 0"

key-files:
  created:
    - "app/src/lib/services/prompt-builder.budget.test.ts"
    - "app/src/app/api/v2-chat/route.budget.test.ts"
    - "app/src/app/api/sheet/route.budget.test.ts"
    - "app/scripts/smoke/sec-03-budget.sh"
  modified:
    - "app/src/lib/services/prompt-builder.ts"
    - "app/src/app/api/v2-chat/route.ts"
    - "app/src/app/api/sheet/route.ts"
    - "app/src/app/api/sheet/route.test.ts"

key-decisions:
  - "budgetCheck uses anthropic.messages.countTokens() (free, matches billing) — NOT @anthropic-ai/tokenizer (RESEARCH.md correction)"
  - "Route ordering owner: Plan 01-03 is the integration site for Blocker 6 — checkAndIncrement now receives accurate inputTokens from budgetCheck"
  - "Conservative default: unknown models pick the Sonnet (80K) cap — never let an unrecognized model blow past policy"
  - "50-iteration trim loop cap prevents pathological infinite trimming — any prompt needing >50 trims is architecturally broken and bails as tooLarge"
  - "Cron path bypasses budget AND quota on both routes — scheduled operator traffic must never 413 out of morning briefings"

patterns-established:
  - "budgetCheck invariant: system (humaContext) is NEVER modified — only messages[] trims tail-first"
  - "Response header policy: X-Huma-Truncated emitted ONLY when count > 0 — silent pass-through for under-budget prompts"
  - "TDD for integration wiring: RED test asserts ordering via timestamp-recording mocks before GREEN implementation"

requirements-completed:
  - SEC-03
  - SEC-02

duration: ~10 min
completed: 2026-04-19
---

# Phase 01 Plan 03: Token Budget (SEC-03) + Route Ordering (Blocker 6) Summary

**budgetCheck uses Anthropic's countTokens API to tail-trim message history before dispatch, eliminates the estChars/4 under-count heuristic by hoisting quota enforcement AFTER budget resolution, and emits X-Huma-Truncated so clients can see when their thread was trimmed.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-04-19T11:59:03Z
- **Completed:** 2026-04-19T12:08:41Z
- **Tasks:** 3
- **Files modified:** 8 total (4 created, 4 modified)

## Accomplishments

- `budgetCheck()` library function in `prompt-builder.ts` — iteratively calls `client.messages.countTokens()` and drops `messages[0]` oldest-first until the total fits under `pickBudget(model)`; returns `{system, messages, trimmedCount, inputTokens}` on success or `{tooLarge: true}` when system alone overflows.
- `pickBudget(model)` + `BUDGETS {sonnet: 80_000, haiku: 150_000}` exports — policy ceilings are lib-owned, routes never hardcode numbers.
- **Blocker 6 of 01-02 resolved:** `/api/v2-chat` and `/api/sheet` now run `budgetCheck` BEFORE `checkAndIncrement`, passing the accurate `inputTokens` from countTokens into the quota RPC. The 3x undercount risk of `estChars/4` is gone — quota math is now ledger-accurate.
- 413 `PAYLOAD_TOO_LARGE` with Voice-Bible body ("This thread's gotten long. Start a new one — I'll catch you up from your shape.") when the system prompt alone exceeds the ceiling. `checkAndIncrement` is NOT invoked on that path (the user should not be quota-charged for a rejected request).
- `X-Huma-Truncated: count=N,reason=budget` response header on both routes whenever trimming occurred; omitted when `trimmedCount === 0`.
- `app/scripts/smoke/sec-03-budget.sh` (Warning 3) — end-to-end curl verification: 100 × 1KB messages → 200 no header; 600 × 1KB messages → 200 with `X-Huma-Truncated` header present.
- **Info 3 covered:** Header-survival assertion in budget test verifies that a Response with `X-Huma-Truncated` passes unchanged through a stub mimicking Plan 05a's `withObservability` wrapper.

## Task Commits

Each task was committed atomically with explicit per-file `git add`:

1. **Task 1 RED: budgetCheck test file** — `857be7c` (test)
2. **Task 1 GREEN: budgetCheck + pickBudget + BUDGETS in prompt-builder** — `41ec05d` (feat)
3. **Task 2 RED: v2-chat budget wiring test** — `b54c606` (test)
4. **Task 2 GREEN: wire budgetCheck + checkAndIncrement(inputTokens) into v2-chat** — `f13a2df` (feat)
5. **Task 3 RED: sheet budget wiring test** — `1641932` (test)
6. **Task 3 GREEN: wire budget into sheet + sec-03 smoke + fix test mock** — `c23b405` (feat)
7. **Task 3 chore: mark sec-03-budget.sh executable** — `960f350` (chore)

## Files Created/Modified

**Created:**
- `app/src/lib/services/prompt-builder.budget.test.ts` — 8 assertions: under-budget pass-through, tail-first trim preserving system, tooLarge overflow, pickBudget for sonnet/haiku/unknown, BUDGETS stability, Info 3 header-survival-on-wrap.
- `app/src/app/api/v2-chat/route.budget.test.ts` — 4 assertions: inputTokens flows to quota RPC, ordering (budget before quota), 413 + Voice-Bible copy + quota NOT called, X-Huma-Truncated on trim.
- `app/src/app/api/sheet/route.budget.test.ts` — 5 assertions: inputTokens flows to quota RPC, ordering, 413 path, X-Huma-Truncated on trim, cron bypass of BOTH budget AND quota.
- `app/scripts/smoke/sec-03-budget.sh` — Warning 3 smoke quad entry; uses ANON_JWT or COOKIE auth; validates header state on small (25K) and large (150K) payloads.

**Modified:**
- `app/src/lib/services/prompt-builder.ts` — Appended `BUDGETS`, `pickBudget`, `BudgetResult`/`BudgetTooLarge` interfaces, and `budgetCheck()` at the bottom. Added Anthropic type imports at the top. Zero changes to existing exports.
- `app/src/app/api/v2-chat/route.ts` — Removed pre-parseBody quota call (wrong order); added import of `budgetCheck` + `pickBudget` + `apiError`; inserted budget + quota block between model-selection and `anthropic.messages.stream`; made `systemBlocks` + `dispatchMessages` local vars so both budget and stream share the same payload; added conditional `X-Huma-Truncated` to the final Response.
- `app/src/app/api/sheet/route.ts` — Same shape as v2-chat but for non-streaming `anthropic.messages.create`. Conditional header on the JSON response.
- `app/src/app/api/sheet/route.test.ts` — Added `countTokens: async () => ({input_tokens: 5_000})` to the module-level mock so the pre-existing compressed-encoding assertion survives budgetCheck's new invocation (Rule 3 auto-fix; see Deviations below).

## Decisions Made

- **countTokens over @anthropic-ai/tokenizer** — The official countTokens API is free, server-side, and matches billing. Tokenizer (tiktoken-style) would diverge from what Anthropic actually charges. RESEARCH.md correction #2 applied directly.
- **Conservative default budget** — Unknown models fall back to the Sonnet 80K cap (not Haiku 150K). Better to trim more than we need than to let an unrecognized future model blow past policy.
- **50-iteration trim loop cap** — Belt-and-suspenders against pathological inputs. Anything needing >50 trims is architecturally broken and should bail as `tooLarge` rather than spin forever.
- **Cron bypasses both budget AND quota** — Scheduled operator traffic (morning-sheet cron) has predictable prompt sizes and must never 413 out of a delivered briefing. Cost control for cron lives in the cron-schedule cadence, not the per-request ledger.
- **Pre-flag-flip shim unchanged** — When `PHASE_1_GATE_ENABLED=false`, `ctx.user` is `null` and `source: "system"`. Budget still runs (correctness); quota skipped (no stable id). Plan 07 will flip the gate and this shim goes away.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Extended sheet/route.test.ts mock to include countTokens**
- **Found during:** Task 3 GREEN (after wiring budget into sheet route)
- **Issue:** Pre-existing `app/src/app/api/sheet/route.test.ts` mocks Anthropic at module level with only `messages.create` defined. Once `budgetCheck` was wired into the sheet route, every call now invokes `messages.countTokens` before `create`, causing the test to throw and 500 out.
- **Fix:** Added `countTokens: async () => ({ input_tokens: 5_000 })` stub to the module-level mock. The 5K value is well under the Sonnet 80K ceiling so no trim happens and the existing compressed-encoding assertion stays focused on the prompt payload.
- **Files modified:** `app/src/app/api/sheet/route.test.ts` (one method added to an existing mock — surgical).
- **Verification:** `npm test -- --run src/app/api/sheet/` → 11/11 green (the pre-existing 1 + auth 5 + new budget 5).
- **Committed in:** `c23b405` (Task 3 commit).

---

**Total deviations:** 1 auto-fixed (Rule 3 — blocking issue directly caused by this task's changes)
**Impact on plan:** Necessary to keep the pre-existing compressed-encoding test green. No scope creep — the fix is a one-line addition to an existing mock.

## Issues Encountered

- **Initial trim-header test failure (v2-chat, Task 2 GREEN)** — First run of the "emits X-Huma-Truncated" test failed because the request body had only 2 user messages → `userMessageCount <= 2` → Haiku (150K) was selected, so 100K/90K values stayed UNDER budget and no trim happened. Fixed by sending 3 user messages in the test body to force Sonnet (80K). Test resolved; no production-code change needed.
- **Initial trim-header test failure (sheet, Task 3 GREEN)** — Test expected `count=2` but sheet inherently dispatches a single messages[] entry (the assembled sheet prompt). After one trim the array is empty; a second iteration sees msgs.length === 0 and returns tooLarge → 413. Corrected the test to expect `count=1,reason=budget` (one trim clears the single message, then the system fits). This is correct behavior, not a bug.

## User Setup Required

None — budgetCheck is pure application code. No external service configuration. `sec-03-budget.sh` requires `ANON_JWT` or `COOKIE` at smoke-test time (Plan 07 enablement captures this in its operator runbook).

## Next Phase Readiness

**Downstream plans can now assume:**
- `budgetCheck` + `pickBudget` + `BUDGETS` are stable exports of `@/lib/services/prompt-builder`.
- Every Anthropic-calling route that Plan 05b wraps with `withObservability` should also call `budgetCheck` — Plan 05b's coverage meta-test can grep for `budgetCheck(` alongside its observability assertion.
- Plan 05c streaming wrap will pass `obs.reqId` as the 4th arg to `checkAndIncrement`; the current call site already accepts `reqId?: string`, so that wire-through is a one-line addition per route.
- Plan 07's smoke quad should include `sec-03-budget.sh` alongside the existing sec-01/02/04/06 scripts (Warning 3 coverage locked in).

**No blockers introduced.**

---

## Self-Check: PASSED

- [x] `app/src/lib/services/prompt-builder.budget.test.ts` — FOUND
- [x] `app/src/app/api/v2-chat/route.budget.test.ts` — FOUND
- [x] `app/src/app/api/sheet/route.budget.test.ts` — FOUND
- [x] `app/scripts/smoke/sec-03-budget.sh` — FOUND
- [x] `app/src/lib/services/prompt-builder.ts` — MODIFIED (budgetCheck + pickBudget + BUDGETS exported)
- [x] `app/src/app/api/v2-chat/route.ts` — MODIFIED (route ordering + X-Huma-Truncated header)
- [x] `app/src/app/api/sheet/route.ts` — MODIFIED (route ordering + X-Huma-Truncated header)
- [x] `app/src/app/api/sheet/route.test.ts` — MODIFIED (countTokens mock stub)
- [x] Commit `857be7c` — FOUND (Task 1 RED)
- [x] Commit `41ec05d` — FOUND (Task 1 GREEN)
- [x] Commit `b54c606` — FOUND (Task 2 RED)
- [x] Commit `f13a2df` — FOUND (Task 2 GREEN)
- [x] Commit `1641932` — FOUND (Task 3 RED)
- [x] Commit `c23b405` — FOUND (Task 3 GREEN)
- [x] Commit `960f350` — FOUND (Task 3 chore: executable bit)
- [x] Full test suite green (687/687 across 40 files)
- [x] Plan-scoped verification green (26/26 across 5 files)

---
*Phase: 01-security-cost-control*
*Plan: 03*
*Completed: 2026-04-19*
