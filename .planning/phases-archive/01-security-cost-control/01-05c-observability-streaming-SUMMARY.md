---
phase: 01-security-cost-control
plan: 05c
subsystem: observability
tags: [anthropic, streaming, sse, cron, supabase, cost-metrics, ulid, rls]

# Dependency graph
requires:
  - phase: 01-05a
    provides: withObservability wrapper + ulid + closure-scoped setters + retry queue
  - phase: 01-01
    provides: requireUser auth gate on /api/v2-chat
  - phase: 01-02
    provides: user_quota_ledger + checkAndIncrement(userId, route, inputTokens, reqId)
  - phase: 01-03
    provides: budgetCheck() running BEFORE checkAndIncrement + accurate inputTokens
  - phase: 01-06
    provides: SSE abort wiring ({signal} + ReadableStream.cancel + APIUserAbortError catch)
provides:
  - v2-chat streaming route wrapped in withObservability with closure-scoped finalMessage listener (Warning 5)
  - Reconciliation log entry pattern ({ reconciles: reqId }) for cost-rollup MAX-by-req_id grouping
  - Secondary user_quota_ledger.update keyed on req_id (Blocker 6 follow-through)
  - morning-sheet cron wrapped in withObservability(source:'cron') with parent_req_id per-operator logs (Blocker 4)
  - /api/cron/cost-rollup route aggregating cost_metrics_raw → cost_metrics with 48h retention
  - 017_cost_metrics.sql migration (cost_metrics_raw + cost_metrics + RLS)
  - vercel.json cron entry for cost-rollup (02:15 UTC daily)
affects: [01-07-enablement, future-phase-6-pricing, future-phase-2-usage-exposure]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Streaming SEC-05: closure-scoped stream.on('finalMessage', ...) listener emits reconciliation log AFTER Response returns; cost-rollup cron GROUPs BY req_id and picks MAX(tokens)"
    - "Cron observability: outer withObservability wrap + per-iteration inline console.log with parent_req_id correlation for multi-operator fan-out"
    - "Cost attribution: 48h raw retention + 24h rollup window; cost_usd computed via Sonnet baseline rates (Haiku-only routes over-estimate — safer direction)"

key-files:
  created:
    - app/src/app/api/v2-chat/route.log.test.ts
    - app/src/app/api/cron/morning-sheet/route.log.test.ts
    - app/src/app/api/cron/cost-rollup/route.ts
    - app/supabase/migrations/017_cost_metrics.sql
  modified:
    - app/src/app/api/v2-chat/route.ts
    - app/src/app/api/cron/morning-sheet/route.ts
    - app/vercel.json

key-decisions:
  - "Reconciliation log pattern over in-place update: streaming routes emit TWO log entries per request — outer wrap (tokens=0 at Response-return) + reconciliation ({reconciles: reqId}, real tokens) after stream.finalMessage resolves. Cost-rollup GROUPS BY req_id + MAX(tokens) to collapse the pair. Simpler than trying to defer the outer log."
  - "obs.setPromptTokens called BEFORE stream.on registration: prompt tokens are already known from Plan 03's budgetCheck, so the outer log payload carries accurate input counts even without the reconciliation entry. Only output_tokens depend on finalMessage."
  - "cost-rollup source:'system' not 'cron': morning-sheet is operator-facing scheduled work (tag 'cron'); cost-rollup is ops infra (tag 'system'). Keeps per-operator dashboards clean."
  - "Token attribution per-operator cron log DOCUMENTED GAP: /api/sheet and /api/insight don't expose response.usage in JSON bodies. Children routes log their own usage via Plan 05b's wraps; cron-level log carries prompt=output=0 + status. Phase 2 may lift usage into JSON for cron-level accuracy."
  - "secondary user_quota_ledger.update keyed on obs.reqId: Plan 02's ledger row was populated with input tokens at quota-check time; finalMessage listener updates token_count to input+output so the ledger reflects actual stream cost (Blocker 6 follow-through). Fire-and-forget + error-logged — ledger correctness is desirable, not blocking."
  - "Sonnet baseline USD rates in cost-rollup: Phase 6 adds per-call model detection; for Phase 1 the bulk of v2-chat traffic is Sonnet so Sonnet rates under-state Haiku savings slightly. Safer direction for a cost ceiling."

patterns-established:
  - "Closure-scoped reconciliation: when a route's accurate usage count lands AFTER the Response is returned (any streaming / async callback), emit a SECOND log entry tagged {reconciles: reqId} and resolve at rollup time via MAX-by-req_id."
  - "Parent-req-id correlation for fan-out crons: outer wrap emits the parent req_id; each iteration emits its own ulid() + parent_req_id referencing the parent. Analytics can trace operator count or aggregate latency across the parent run."
  - "Indirect-fetch cron observability: crons calling the Anthropic SDK indirectly (via fetch to internal routes) still need a wrap — Plan 05b's INDIRECT_ALLOWLIST meta-test forces this; Plan 05c wrapped morning-sheet."

requirements-completed:
  - SEC-05

# Metrics
duration: 11min
completed: 2026-04-19
---

# Phase 1 Plan 05c: Observability Streaming Summary

**Streaming SEC-05 coverage — v2-chat finalMessage reconciliation, morning-sheet cron wrap (Blocker 4), new cost-rollup cron + 017 migration, all with closure-scoped output-token capture (Warning 5).**

## Performance

- **Duration:** 11 min
- **Started:** 2026-04-19T12:15:00Z
- **Completed:** 2026-04-19T12:26:21Z
- **Tasks:** 3
- **Files modified:** 7 (4 created, 3 modified)

## Accomplishments

- **v2-chat streaming wrap:** Closure-scoped `stream.on('finalMessage', ...)` listener (Warning 5: NO globalThis) emits reconciliation log + updates `user_quota_ledger.token_count` keyed on `obs.reqId` (Blocker 6 follow-through).
- **morning-sheet cron wrap (Blocker 4):** Outer `withObservability(source:'cron')` + per-operator inline logs with `parent_req_id` correlation. Documented gap: cron-level tokens are 0 because children don't expose usage in JSON.
- **cost-rollup cron + 017 migration:** New `/api/cron/cost-rollup` route aggregates `cost_metrics_raw` → `cost_metrics` with MAX-by-req_id grouping (collapses v2-chat's outer + reconciliation pair). 48h retention window. Sonnet-baseline USD rates. `vercel.json` schedule: 02:15 UTC daily.
- **All 694 pre-existing tests still green; 695/695 including new Plan 05b meta-test verifying SEC-05 coverage across all Anthropic-calling routes.**

## Task Commits

Each task was committed atomically:

1. **Task 1 RED:** `40772cb` (test) - v2-chat log + reconciliation + secondary ledger update tests
2. **Task 1 GREEN:** `b6bf894` (feat) - wrap v2-chat streaming in withObservability + finalMessage listener
3. **Task 2 RED:** `1ba695a` (test) - morning-sheet cron fetch-mocked observability tests
4. **Task 2 GREEN:** `5c320db` (feat) - wrap morning-sheet cron in withObservability with per-operator parent_req_id logs
5. **Task 3 (swept into 05b's commit):** `35f2086` - cost-rollup route + 017_cost_metrics.sql migration + vercel.json schedule

**Attribution note:** Task 3 files (cost-rollup, 017, vercel.json) landed in commit `35f2086` whose message references 05b's coverage meta-test. This is the parallel-execution sweep-in pattern already recorded in STATE.md ("Parallel Wave 1 agents can sweep-in each other's untracked files during 'git add'"). The Task 3 content is complete and identical to what I authored — only the commit message attribution is mixed. All tests pass.

Reciprocally, commit `1ba695a` (my Task 2 RED) swept in two 05b files (`insight/route.ts` + `whole-compute/route.ts` partial wraps). 05b's final commits complete those wraps on top of the partial state landed via my commit.

## Files Created/Modified

**Created:**
- `app/src/app/api/v2-chat/route.log.test.ts` - 3 cases: reconciliation output_tokens>0, 401 wrapped, secondary ledger update fires
- `app/src/app/api/cron/morning-sheet/route.log.test.ts` - 3 cases: outer `source:'cron'` log, per-op `parent_req_id`, 401 still wrapped (Blocker 4: fetch-mocked)
- `app/src/app/api/cron/cost-rollup/route.ts` - CRON_SECRET-gated aggregator; MAX-by-req_id grouping; 48h retention; Sonnet USD baseline
- `app/supabase/migrations/017_cost_metrics.sql` - `cost_metrics_raw` + `cost_metrics` tables; RLS (service-role insert to raw; users-read-own on aggregates)

**Modified:**
- `app/src/app/api/v2-chat/route.ts` - Wrapped in `withObservability`; 401 short-circuit wrapped separately; `obs.setPromptTokens(inputTokens)` after budgetCheck; `stream.on('finalMessage', ...)` closure-scoped listener emits reconciliation log + fires `admin.update('user_quota_ledger').eq('req_id', obs.reqId)`; `checkAndIncrement(...)` now takes `obs.reqId` as 4th arg
- `app/src/app/api/cron/morning-sheet/route.ts` - Wrapped in `withObservability(source:'cron')`; per-operator inline `console.log(JSON.stringify({parent_req_id: obs.reqId, ...}))` after successful push; re-indented for-loop body (surgical cleanup after two new nesting levels added)
- `app/vercel.json` - Added `/api/cron/cost-rollup` cron entry at `15 2 * * *` (02:15 UTC daily)

## Decisions Made

See `key-decisions` in frontmatter above. Core narrative:

1. **Reconciliation log pattern.** `stream.finalMessage()` resolves AFTER the outer wrap's `finally` fires. Rather than trying to delay the outer log, we emit TWO entries (outer with tokens=0, reconciliation with real tokens + `{reconciles: reqId}` marker) and let the cost-rollup cron collapse via `MAX(tokens) GROUP BY req_id`. Simpler wiring, no cross-async state.

2. **Closure scope everywhere.** Warning 5 is a hard rule: NO globalThis. The `obs` object captured by the finalMessage listener is the same closure that populated the outer wrap's payload — setters mutate the same variables. Concurrent streaming requests remain isolated.

3. **Blocker 4 fetch-mock pattern.** morning-sheet doesn't import `@anthropic-ai/sdk` — it `fetch`-es `/api/sheet` + `/api/insight`. The `observability-coverage.test.ts` (Plan 05b) `INDIRECT_ALLOWLIST` forces the wrap. My route.log.test mocks `globalThis.fetch` (NOT the SDK) to exercise the cron's fan-out without real network.

4. **source:'system' for cost-rollup.** morning-sheet is operator-facing scheduled work → `source:'cron'`. cost-rollup is ops infrastructure → `source:'system'`. Keeps per-operator dashboards uncluttered.

5. **48h retention / 24h rollup.** Gives operators a full day's debugging buffer if the cron is delayed or fails. Aggregated `cost_metrics` is the permanent store; raw is transient.

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written for the core logic.

### Surfaced Issues (not auto-fixed, documented)

**1. Parallel-execution sweep-in (pattern already documented in STATE.md)**
- **Found during:** Task 2 commit (RED) + Task 3 commit
- **Issue:** `git add <specific-file>` commits unexpectedly included other files modified by the parallel 05b executor. In commit `1ba695a`, my Task 2 RED test commit swept in 05b's partial wraps of `insight/route.ts` and `whole-compute/route.ts`. Reciprocally, 05b's commit `35f2086` swept in my Task 3 files (cost-rollup, 017, vercel.json).
- **Why not auto-fixed:** Destructive git surgery (`git reset --hard`, `git filter-branch`) could lose work. Content is correct; only attribution is mixed.
- **Logged in:** deferred-items.md (this file — sweep-in annotation below); STATE.md decisions already record "Parallel Wave 1 agents can sweep-in each other's untracked files during 'git add' — individual-file staging is the policy; flag for post-milestone parallelization retrospective"

**2. Pre-existing BudgetResult TS narrowing errors in v2-chat/route.ts (logged to deferred-items.md)**
- **Found during:** Task 1 tsc check
- **Issue:** `TS2339: Property 'messages'/'trimmedCount'/'inputTokens' does not exist on type 'BudgetResult | BudgetTooLarge'` at 3 lines in v2-chat/route.ts. Verified pre-existing via `git stash` baseline.
- **Why not auto-fixed:** Out of scope for Plan 05c. Plan 03 owns the discriminated union shape. Runtime tests all green.
- **Logged in:** `.planning/phases/01-security-cost-control/deferred-items.md`

---

**Total deviations:** 0 auto-fixed. 2 surfaced-and-documented.
**Impact on plan:** None on substance. Commit attribution is mixed but all work is present. All tests green.

## Issues Encountered

- **Indent discipline after wrap.** Adding `withObservability` + the arrow-function handler layer in morning-sheet added two nesting levels. I re-indented the entire for-loop body (296 insertions / 263 deletions — the diff is mostly whitespace) for readability. Could have skipped the reindent (JS doesn't care about indentation semantically) but the unindented block was unreadable.
- **Parallel race on test module imports.** `observability-coverage.test.ts` count went from 1 (before 05b) to 0 (when I ran tests the first time post-Task 3, it was still in 05b's uncommitted state) to 1 (after 05b's 35f2086 commit which also included my Task 3 files). Final full-suite: 695/695 green.

## User Setup Required

**Manual step (Plan 07 owns the gate):** Apply `app/supabase/migrations/017_cost_metrics.sql` via Supabase dashboard SQL editor before flipping `PHASE_1_GATE_ENABLED=true` in production. Plan 07 enforces this.

**Verification query (post-apply):**
```sql
SELECT count(*) FROM cost_metrics_raw;  -- expect 0 initially
SELECT count(*) FROM cost_metrics;      -- expect 0 initially
-- After first traffic + first cost-rollup cron run:
-- cost_metrics_raw grows fast; cost_metrics aggregates per (day, user_id, route).
```

After deploy, verify Vercel recognizes the new cron schedule at `/api/cron/cost-rollup` (should appear in the Vercel project's Crons tab).

## Next Phase Readiness

- **SEC-05 complete for streaming + cron paths.** Plans 05a (lib) + 05b (8 non-streaming routes) + 05c (this: v2-chat + morning-sheet + cost-rollup) together cover every Anthropic-calling route + both crons.
- **Plan 07 (enablement) unblocked for the observability gate.** Remaining Plan 07 dependencies are PHASE_1_GATE_ENABLED flip + 016/017 migration application + smoke quad.
- **Phase 2 (outcome measurement) ready to plan.** SEC-05 cost trail + user_quota_ledger provide the usage data Phase 2's regenerative-math outcome honesty framework will consume.

## Self-Check: PASSED

All claimed files exist on disk:
- FOUND: `app/src/app/api/v2-chat/route.log.test.ts`
- FOUND: `app/src/app/api/v2-chat/route.ts`
- FOUND: `app/src/app/api/cron/morning-sheet/route.log.test.ts`
- FOUND: `app/src/app/api/cron/morning-sheet/route.ts`
- FOUND: `app/src/app/api/cron/cost-rollup/route.ts`
- FOUND: `app/supabase/migrations/017_cost_metrics.sql`
- FOUND: `app/vercel.json`

All claimed commits exist in git log:
- FOUND: `40772cb` (test: v2-chat RED)
- FOUND: `b6bf894` (feat: v2-chat GREEN)
- FOUND: `1ba695a` (test: morning-sheet RED — sweep-in included 05b partials, documented)
- FOUND: `5c320db` (feat: morning-sheet GREEN)
- FOUND: `35f2086` (test(01-05b): observability-coverage — sweep-in included my Task 3 files, documented)

Test suites:
- `v2-chat/route.log.test.ts`: 3/3 GREEN
- `cron/morning-sheet/route.log.test.ts`: 3/3 GREEN
- `__tests__/observability-coverage.test.ts`: 1/1 GREEN (confirms all Anthropic-calling routes wrapped, including morning-sheet via INDIRECT_ALLOWLIST)
- Full suite (44 files, 695 tests): 695/695 GREEN

---
*Phase: 01-security-cost-control*
*Completed: 2026-04-19*
