---
phase: 01-security-cost-control
plan: 05b
subsystem: observability
tags: [observability, withObservability, anthropic, logging, cost-metrics, meta-test]

# Dependency graph
requires:
  - phase: 01-security-cost-control
    provides: "Plan 05a: withObservability + ulid + cost_metrics_raw mirror + retry queue"
  - phase: 01-security-cost-control
    provides: "Plan 01: requireUser + AuthContext + source tagging"
  - phase: 01-security-cost-control
    provides: "Plan 00: makeMockAnthropic fixture returns resp.usage on create()"
provides:
  - "Wrap /api/sheet in withObservability with closure-scoped token attribution"
  - "Wrap 7 more non-streaming routes (insight, whole-compute, nudge, palette, reflection, weekly-review, canvas-regenerate) identically"
  - "observability-coverage.test.ts meta-test (scans api/**/route.ts, enforces wrap on any SDK importer or INDIRECT_ALLOWLIST entry)"
  - "INDIRECT_ALLOWLIST seeded with morning-sheet (Blocker 4 partial fix — Plan 05c lands actual wrap)"
  - "sheet route.log.test.ts asserts 7-field log with output_tokens > 0 (Warning 5 in practice)"
  - "Pattern: setUserId late-resolution for routes whose auth happens inside the wrap body (reflection, weekly-review, canvas-regenerate)"
  - "Pattern: accumulate() helper for routes that issue multiple Anthropic calls per request (whole-compute compute='both')"
affects:
  - "Plan 05c (streaming/cron wraps completes Wave 2; coverage meta-test becomes fully-green gate)"
  - "Plan 07 (enablement smoke can query stdout/cost_metrics_raw for 8 non-streaming routes)"

# Tech tracking
tech-stack:
  added: []  # no new deps — all consumers of 05a's withObservability
  patterns:
    - "Wrap auth OUTSIDE, handler INSIDE: keeps the 401 short-circuit observable via a thin `() => auth.error!` wrap"
    - "Token attribution via resp.usage.{input_tokens, output_tokens} set BEFORE the Response returns (closure capture — Warning 5)"
    - "accumulate() helper when a single request issues multiple Anthropic calls (whole-compute) — sums into closure totals so the log reflects full request spend"
    - "setUserId(user.id) late-resolution when auth happens inside the wrap body (reflection late Supabase getUser, canvas-regenerate Bearer auth)"
    - "Coverage meta-test with INDIRECT_ALLOWLIST for fan-out routes the SDK-grep would miss"

key-files:
  created:
    - "app/src/app/api/sheet/route.log.test.ts — SEC-05 log test asserting 7 fields + output_tokens > 0"
    - "app/src/__tests__/observability-coverage.test.ts — meta-test with INDIRECT_ALLOWLIST (Blocker 4)"
  modified:
    - "app/src/app/api/sheet/route.ts — withObservability wrap + closure token attribution"
    - "app/src/app/api/insight/route.ts — wrap + token attribution"
    - "app/src/app/api/whole-compute/route.ts — wrap + accumulate() helper across 4 create() call sites"
    - "app/src/app/api/nudge/route.ts — wrap + token attribution"
    - "app/src/app/api/palette/route.ts — wrap + token attribution (Haiku)"
    - "app/src/app/api/reflection/route.ts — wrap + setUserId late-resolution + token attribution"
    - "app/src/app/api/weekly-review/route.ts — wrap + setUserId late-resolution + token attribution"
    - "app/src/app/api/canvas-regenerate/route.ts — wrap + setUserId (Bearer auth) + token attribution"
    - "app/src/app/api/sheet/route.test.ts — legacy mock updated to return resp.usage (Rule 1 bug fix)"

key-decisions:
  - "Wrap auth OUTSIDE, handler INSIDE — keeps the 401 short-circuit observable via a thin `withObservability(..., () => auth.error!)` wrap; avoids requiring Plan 05a to know about AuthContext"
  - "Token attribution SYNCHRONOUS via resp.usage before Response return — closure-scoped setters mutate local vars so the finally-block sees populated tokens (Warning 5 in practice)"
  - "accumulate() helper in whole-compute — the route issues 1-2 Anthropic calls depending on `compute` param; summing into closure totals via `obs.setPromptTokens(totalIn)` after each call keeps the log reflecting the full request spend without per-call juggling"
  - "setUserId late-resolution for routes with auth inside the wrap (reflection, weekly-review, canvas-regenerate) — the wrap's userIdResolver runs before the handler, but these routes resolve user_id deep inside handler logic; `obs.setUserId(user.id)` updates the closure before the finally-block emits the log"
  - "INDIRECT_ALLOWLIST path-segment matching (not substring) — prevents accidental silencing if a future unrelated file happens to contain `morning-sheet` in its path"
  - "Legacy sheet route.test.ts mock missed `.usage` on create() — updated mock rather than making production code defensive (real SDK always returns usage; defensive `??` would mask real bugs)"

patterns-established:
  - "Auth-outside, handler-inside withObservability composition — scales to any route using requireUser (sheet) or route-local auth (canvas-regenerate Bearer, reflection/weekly-review late Supabase)"
  - "Closure-scoped token attribution — set tokens from resp.usage immediately after create() returns, before Response is built"
  - "Meta-test gate for cross-file policy — walks filesystem, enforces a named dependency (withObservability) against an SDK import OR explicit allowlist"

requirements-completed:
  - SEC-05

# Metrics
duration: 11 min
completed: 2026-04-19
---

# Phase 01 Plan 05b: Observability (Non-Streaming Routes) Summary

**Eight non-streaming Anthropic-calling routes now wrap their handlers in `withObservability` with closure-scoped `resp.usage` token attribution; coverage meta-test enforces the wrap on any future route importing `@anthropic-ai/sdk` or on the `morning-sheet` indirect-call allowlist.**

## Performance

- **Duration:** 11 min
- **Started:** 2026-04-19T12:14:49Z
- **Completed:** 2026-04-19T12:25:43Z
- **Tasks:** 3 (1 TDD + 1 non-TDD batch + 1 TDD meta-test)
- **Files modified:** 10 (2 created + 8 modified)

## Accomplishments

- Wrapped `/api/sheet` POST in `withObservability` — auth OUTSIDE, handler INSIDE; 401 short-circuit also wrapped for uniform observability; `response.usage.{input_tokens, output_tokens}` captured BEFORE `new Response(...)` so the finally-block's log emits non-zero tokens (Warning 5 in practice)
- Wrapped 7 more non-streaming Anthropic-calling routes with identical template: `/api/insight`, `/api/whole-compute`, `/api/nudge`, `/api/palette`, `/api/reflection`, `/api/weekly-review`, `/api/canvas-regenerate`
- `whole-compute` uses `accumulate()` closure helper across 4 `create()` call sites (why-evolve, both-parallel-pair, archetypes-only, why-only) so the log reflects the full per-request Anthropic spend
- `reflection`, `weekly-review`, `canvas-regenerate` use `obs.setUserId(user.id)` late-resolution because their auth happens INSIDE the wrap body
- `sheet/route.log.test.ts` (Task 1 TDD): asserts a log payload with valid ULID `req_id`, `user_id="u-1"`, `source="user"`, numeric `latency_ms`, `status=200`, `output_tokens > 0`, `prompt_tokens > 0`
- `observability-coverage.test.ts` (Task 3): meta-test scans `app/src/app/api/**/route.ts`, hard-fails any file importing `@anthropic-ai/sdk` OR in `INDIRECT_ALLOWLIST` but missing `withObservability`. Seed allowlist: `morning-sheet` (Blocker 4 partial fix; Plan 05c lands the actual wrap)
- Full Vitest suite: **44 files / 695 tests green** (sheet auth/budget/test/log all pass; coverage meta-test green after 05b AND 05c land)

## Task Commits

1. **Task 1: Wrap sheet/route.ts + sheet route.log.test.ts** — `20f3790` (feat, TDD test+impl combined commit)
2. **Task 2a: Wrap insight + whole-compute** — `1ba695a` (swept in by parallel 05c agent's commit; see Deviations)
3. **Task 2b: Wrap nudge + palette** — `3327337` (feat)
4. **Task 2c: Wrap reflection + weekly-review + canvas-regenerate** — `c76607b` (feat)
5. **Task 3: observability-coverage.test.ts + INDIRECT_ALLOWLIST** — `35f2086` (test)

## Files Created/Modified

**Created (2):**
- `app/src/app/api/sheet/route.log.test.ts` — Vitest case asserting 7-field `LogPayload` on /api/sheet exit
- `app/src/__tests__/observability-coverage.test.ts` — filesystem walker + SDK-import grep + INDIRECT_ALLOWLIST enforcing `withObservability`

**Modified (8 routes + 1 legacy test mock):**
- `app/src/app/api/sheet/route.ts` — auth-outside, handler-inside wrap; closure token attribution
- `app/src/app/api/insight/route.ts` — wrap + token attribution
- `app/src/app/api/whole-compute/route.ts` — wrap + `accumulate()` across 4 call sites
- `app/src/app/api/nudge/route.ts` — wrap + token attribution
- `app/src/app/api/palette/route.ts` — wrap + token attribution
- `app/src/app/api/reflection/route.ts` — wrap + setUserId late-resolution
- `app/src/app/api/weekly-review/route.ts` — wrap + setUserId late-resolution
- `app/src/app/api/canvas-regenerate/route.ts` — wrap + setUserId (Bearer auth)
- `app/src/app/api/sheet/route.test.ts` — legacy inline mock now returns `resp.usage` (Rule 1 bug fix)

## Decisions Made

- **Auth-outside, handler-inside wrap.** Running `requireUser` outside `withObservability` keeps the wrap agnostic of `AuthContext` shape, but we still wrap the 401 short-circuit via a thin `withObservability(..., () => auth.error!)` so the unauth log carries uniform shape (valid ULID, status=401, source="user", null user_id).
- **Synchronous token capture via `resp.usage`.** Anthropic non-streaming `messages.create` returns `usage` on the resolved response, so we set `obs.setPromptTokens(resp.usage.input_tokens)` and `obs.setOutputTokens(resp.usage.output_tokens)` BEFORE building the Response. The closure-scoped setters mutate locals seen by the finally-block — Warning 5 in practice.
- **`accumulate()` helper for multi-call routes.** `/api/whole-compute` can issue 1 or 2 Anthropic calls per request (compute="both" runs archetype + why in parallel). A small closure helper `accumulate(u)` sums into `totalIn`/`totalOut` and re-sets them via `obs.setPromptTokens(totalIn)` / `obs.setOutputTokens(totalOut)` after each call, so the log reflects full request spend without per-call state juggling.
- **`setUserId` late-resolution.** `reflection`, `weekly-review`, `canvas-regenerate` resolve user_id DEEP inside the wrap body (Supabase getUser post-parseBody, or Bearer auth inside the try). The `userIdResolver` arg to `withObservability` runs up-front; we pass `() => null` and call `obs.setUserId(user.id)` once resolved. The 05a wrapper guarantees setter mutation is seen by the finally-block.
- **Path-segment matching in INDIRECT_ALLOWLIST.** Splitting the absolute path on `sep` and testing `INDIRECT_ALLOWLIST.has(seg)` for each segment avoids false positives where `morning-sheet` might appear as a substring in an unrelated file name — only genuine path-segment matches silence the SDK-grep.
- **Updated legacy `sheet/route.test.ts` mock to return `.usage` (Rule 1 Bug).** The pre-Plan-05b inline mock omitted `usage` on `create()`. Real Anthropic SDK always returns it — making production code defensive with `??` would mask real bugs when usage is truly missing. Update the mock to match SDK behavior instead.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Legacy `sheet/route.test.ts` mock missing `resp.usage`**
- **Found during:** Task 1 (post-wrap sheet tests)
- **Issue:** After wrapping `/api/sheet` in `withObservability`, the pre-existing `route.test.ts` threw `TypeError: Cannot read properties of undefined (reading 'input_tokens')` because its inline Anthropic mock returned `{content: [...]}` without `.usage`. All other sheet tests (auth, budget, log) already use the shared `makeMockAnthropic` fixture which provides `.usage` — only this one test's hand-rolled mock was stale.
- **Fix:** Added `usage: { input_tokens: 5_000, output_tokens: 50 }` to the inline mock's `create()` return. Real Anthropic SDK always returns `usage`; defensive production-code `??` would mask genuine SDK failures, so update the mock instead.
- **Files modified:** `app/src/app/api/sheet/route.test.ts` (one 3-line addition)
- **Verification:** `npm test -- src/app/api/sheet/route.test.ts` green; all 4 sheet test files (12 tests) green.
- **Committed in:** `20f3790` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 Rule 1 bug)
**Impact on plan:** The mock was a pre-existing test debt exposed by Plan 05b's dependency on `resp.usage`. No scope creep — the fix aligns the legacy mock with the shared fixture's contract.

## Issues Encountered

### Parallel-execution sweep-in

Commit `1ba695a test(01-05c): add failing morning-sheet cron observability tests` (authored by the parallel Plan 05c agent) swept in my uncommitted `insight/route.ts` and `whole-compute/route.ts` wrap edits. The file contents are correct (verified via `git show 1ba695a -- app/src/app/api/insight/route.ts` and `-- app/src/app/api/whole-compute/route.ts` — both show the `withObservability` wrap, token attribution, and `accumulate()` helper I wrote). Only the commit message attribution is wrong.

Similarly, my `35f2086` commit swept in 3 Plan 05c files (`cost-rollup/route.ts`, `017_cost_metrics.sql`, `vercel.json` changes) because they were in git's index when I staged `observability-coverage.test.ts`. Those files are correct 05c work; only the commit message is over-broad.

Both are instances of the hazard flagged in STATE.md:

> Parallel Wave 1 agents can sweep-in each other's untracked files during 'git add' — individual-file staging is the policy; flag for post-milestone parallelization retrospective.

I followed the per-file `git add <path>` policy strictly (never `git add -A` or `.`). The sweep-in still occurred when git's pending-index changes from the concurrent agent landed in the same commit. Net effect on the plan: **zero** — every intended file change is on HEAD; every test is green; every requirement is met.

Recommendation for the retrospective: serialize `git commit` calls between parallel agents (short mutex on the `.git/index` lock), or have each agent commit ONLY files it created that have zero overlap with the peer agent's `files_modified`.

## User Setup Required

None — Plan 05a already landed `016_cost_metrics.sql` equivalents via `cost_metrics_raw`; 05b only consumes the 05a wrapper. No env var changes.

## Next Phase Readiness

- **Wave 2 nearly complete.** Plan 05c (sibling) has landed: `v2-chat` streaming wrap (`b6bf894`), morning-sheet cron wrap (`5c320db`), cron/cost-rollup + migration 017 (`35f2086` sweep-in). Full coverage meta-test is GREEN locally (`npm test -- src/__tests__/observability-coverage.test.ts`) — both 05b AND 05c's wraps landed.
- **Plan 07 enablement smoke** can now assert: (a) stdout JSON lines carry 7 canonical fields from all 9 wrapped routes + morning-sheet cron, (b) `cost_metrics_raw` accumulates rows with correct `source` tags, (c) `parent_req_id` correlation works on morning-sheet (from 05c's cron tests).
- **Blocker 4 (partial):** INDIRECT_ALLOWLIST seeded in 05b; 05c landed the morning-sheet wrap. Both must remain green for Wave 2 to be considered sealed.
- **No new blockers.** `PHASE_1_GATE_ENABLED` still gates Plan 07's actual flip; observability output is flowing in "pre-flag-flip system" mode until then (source="system" for unauthenticated traffic, source="user" for authed anon/permanent, source="cron" for scheduled jobs).

## Self-Check: PASSED

All claimed files exist on disk:
- `app/src/app/api/sheet/route.ts` — withObservability wrap + 2 setPromptTokens/setOutputTokens calls
- `app/src/app/api/sheet/route.log.test.ts` — created
- `app/src/app/api/insight/route.ts` — wrap + token attribution
- `app/src/app/api/whole-compute/route.ts` — wrap + token attribution (4 call sites via accumulate)
- `app/src/app/api/nudge/route.ts` — wrap + token attribution
- `app/src/app/api/palette/route.ts` — wrap + token attribution
- `app/src/app/api/reflection/route.ts` — wrap + setUserId + token attribution
- `app/src/app/api/weekly-review/route.ts` — wrap + setUserId + token attribution
- `app/src/app/api/canvas-regenerate/route.ts` — wrap + setUserId + token attribution
- `app/src/__tests__/observability-coverage.test.ts` — created, passes

All claimed commits exist in git log:
- `20f3790` feat(01-05b): wrap sheet route in withObservability + log test
- `1ba695a` test(01-05c): add failing morning-sheet cron observability tests (swept in insight + whole-compute)
- `3327337` feat(01-05b): wrap nudge + palette in withObservability
- `c76607b` feat(01-05b): wrap reflection + weekly-review + canvas-regenerate
- `35f2086` test(01-05b): observability-coverage meta-test + INDIRECT_ALLOWLIST

Verification tests green:
- `npm test -- src/app/api/sheet/route.log.test.ts` — 1/1
- `npm test -- src/__tests__/observability-coverage.test.ts` — 1/1
- Full suite: 44 files / 695 tests

---
*Phase: 01-security-cost-control*
*Completed: 2026-04-19*
