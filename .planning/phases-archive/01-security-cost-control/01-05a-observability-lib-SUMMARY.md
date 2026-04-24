---
phase: 01-security-cost-control
plan: 05a
subsystem: infra
tags: [observability, ulid, logging, supabase, cost-metrics, vitest]

# Dependency graph
requires:
  - phase: 01-security-cost-control
    provides: "Plan 00 fixtures — captureConsoleLog helper for asserting JSON log emission"
  - phase: 01-security-cost-control
    provides: "Plan 01 LogSource type (exported from auth-guard.ts); re-exported here to form the canonical observability surface"
provides:
  - "ulid.ts — ulid() wrapper, monotonicUlid factory, isULID type-guard"
  - "observability.ts — withObservability wrapper, LogPayload / ObsCtx / LogSource types"
  - "In-memory retry queue (cap 100) for best-effort cost_metrics_raw inserts; drains on next request; overflow drops oldest"
  - "Closure-based token capture — setPromptTokens/setOutputTokens/setUserId mutate per-request state with no globalThis cross-talk"
  - "Test-only __resetObsQueueForTests() for queue isolation between specs"
affects:
  - "01-05b-observability-routes — wraps 8 non-streaming routes (/api/sheet, /api/sheet/check, /api/insight, /api/palette, /api/nudge, /api/reflection, /api/whole-compute, /api/canvas-regenerate)"
  - "01-05c-observability-streaming — wraps /api/v2-chat (streaming) + /api/cron/morning-sheet + cost-rollup view"
  - "Any future route needing per-request correlation ids, cost mirroring, or unified JSON log emission"

# Tech tracking
tech-stack:
  added:
    - "ulid@^3.0.2 — Crockford base32 id generation with monotonic factory"
  patterns:
    - "Closure-scoped request telemetry — setters mutate captured locals, not module-level or globalThis state (Warning 5)"
    - "Finally-block log emission — guarantees 1:1 log per request even on thrown Response or Error paths"
    - "Dual exit path for errors — thrown Response returned with its status; thrown non-Response logged with status=500 and re-thrown"
    - "Fire-and-forget best-effort mirror writes — LogPayload console.log is authoritative; DB row is a bonus queryable trail"

key-files:
  created:
    - "app/src/lib/ulid.ts (25 lines) — ulid() + monotonicUlid + isULID"
    - "app/src/lib/ulid.test.ts (35 lines) — 3 shape/validator cases"
    - "app/src/lib/observability.ts (213 lines) — withObservability + LogPayload + retry queue"
    - "app/src/lib/observability.test.ts (167 lines) — 6 cases covering Warnings 2/4/5 + error paths"
  modified:
    - "app/package.json — added ulid dependency (via parallel 01-02 sweep-in)"
    - "app/package-lock.json — ulid lockfile entry"

key-decisions:
  - "LogSource type is single-sourced from auth-guard.ts (Plan 01) and re-declared identically in observability.ts. Both files resolve to the same structural shape so importers can pull from either surface; observability exports the canonical payload types."
  - "cost_metrics_raw inserts are fire-and-forget (void IIFE) — log emission to stdout is authoritative, DB write is an asynchronous mirror. This prevents a failing insert from blocking the response."
  - "Queue drain happens BEFORE the new write on each request's exit path — this guarantees fairness (older retries don't starve) and bounds worst-case per-request overhead at QUEUE_CAP+1 attempts."
  - "Skip cost_metrics_raw mirror on status>=500 and on zero-token short-circuits (unless status=200) — keeps table write volume bounded to meaningful request exits."

patterns-established:
  - "Wrapper closure pattern for route telemetry — future routes receive an ObsCtx with typed setters instead of mutating external state"
  - "Best-effort retry queue with cap + oldest-dropped-with-console.error — reusable for any transient write path"
  - "Test isolation via exported __resetXForTests() helpers when module-level state is unavoidable"

requirements-completed: [SEC-05]

# Metrics
duration: 5min
completed: 2026-04-19
---

# Phase 1 Plan 05a: Observability Library Summary

**ULID generator + withObservability wrapper with closure-based token capture, 7-field JSON log emission, and a 100-entry retry queue for best-effort cost_metrics_raw mirror writes.**

## Performance

- **Duration:** ~5 min (3 commits spanning 2 minutes of wall-clock work)
- **Started:** 2026-04-19T07:19:00Z (approx, first commit 17f6ac3 "2 minutes ago")
- **Completed:** 2026-04-19T07:22:30Z (last commit 6c94171)
- **Tasks:** 2 (both TDD: RED → GREEN, no refactor needed)
- **Files created:** 4 new (`ulid.ts`, `ulid.test.ts`, `observability.ts`, `observability.test.ts`)
- **Files modified:** 2 (`app/package.json`, `app/package-lock.json`)

## Accomplishments

- **ulid library ready** — `ulid()`, `monotonicUlid()`, `isULID()` available for request correlation, cost_metrics_raw row ids, and debug traces
- **Observability foundation live** — downstream Plans 05b (non-streaming routes) and 05c (streaming + cron + cost-rollup) can now import `withObservability` and wrap routes with a single line
- **Warning 5 resolved** — token capture uses closure variables (`promptTokens`, `outputTokens`, `userId`), not `globalThis`. Concurrent requests cannot see each other's telemetry.
- **Warning 4 resolved** — in-memory retry queue (cap 100) for failed `cost_metrics_raw` inserts. Queue drains best-effort on the NEXT request's exit path. Overflow drops the oldest entry and emits `console.error` with a "queue overflow" tag.
- **Warning 2 reinforced** — `source='system'` is preserved when `userIdResolver` returns null + the pre-flag-flip shim path is taken. Per-user dashboards stay clean during the gradual auth-gate rollout.
- **9 unit assertions green** (3 ulid + 6 observability) — exceeds plan's success criteria.

## Task Commits

1. **Task 1 RED: ulid test** — `d3886a1` (swept in by parallel 01-02 agent's atomic commit — ulid.test.ts + package.json/package-lock.json landed in its "test(01-02): add failing tests for quota ledger helpers" commit)
2. **Task 1 GREEN: ulid.ts implementation** — `17f6ac3` (feat)
3. **Task 2 RED: observability test** — `3c20a50` (test)
4. **Task 2 GREEN: observability.ts implementation** — `6c94171` (feat)

**Plan metadata:** (will be the final docs commit after this SUMMARY lands)

_Note: Task 1's RED commit merged with a parallel plan's commit because the parallel agent ran `git add` before this agent could separately stage. No behavior lost — both files landed with the intended contents._

## Files Created/Modified

- `app/src/lib/ulid.ts` (25 lines) — `ulid()` and `monotonicUlid()` re-export npm `ulid`; `isULID()` type-guard validates 26-char Crockford base32 shape (rejects lowercase, I/L/O/U, non-strings)
- `app/src/lib/ulid.test.ts` (35 lines) — shape, validator matrix, monotonic ordering
- `app/src/lib/observability.ts` (213 lines) — `withObservability` wrapper, `LogPayload` (7 fields + source), `ObsCtx` handler context with typed setters, in-memory retry queue with cap enforcement, `writeOnce` / `drainQueue` internals, `__resetObsQueueForTests` helper
- `app/src/lib/observability.test.ts` (167 lines) — 6 cases: 7-field emission with closure tokens (Warning 5), source=system tagging (Warning 2), status=500 on throw Error, Response-throw honors status, setUserId late-resolution, retry queue drain on next request (Warning 4)
- `app/package.json` — `ulid@^3.0.2` added to `dependencies`
- `app/package-lock.json` — ulid lockfile entry

## Decisions Made

- **Closure-based state over globalThis.** Plan called out Warning 5 explicitly — each request now has private captured locals mutated by `ctx.setPromptTokens/setOutputTokens/setUserId`. Verified by the first test case asserting `output_tokens === 50` after handler-side call.
- **Authoritative log is stdout; DB is a mirror.** The finally-block always emits one JSON line via `console.log`. The DB insert runs fire-and-forget inside a `void IIFE` so a Supabase outage cannot delay or fail a user response.
- **Queue drain before write on exit.** Guarantees that a successful request after a Supabase outage will replay pending payloads before enqueueing its own; fairness + worst-case bound of `QUEUE_CAP+1` attempts per request.
- **Write filter: skip 5xx and zero-token short-circuits.** Prevents flooding `cost_metrics_raw` with Phase-1 auth-denial rows. Retains status=200 even with zero tokens so cron/health paths still register.
- **LogSource type co-located in both auth-guard.ts and observability.ts.** Structurally identical — TypeScript treats them as compatible at the usage site. This keeps the plan's `exports` contract truthful ("exports LogSource") without inventing a circular dependency between the auth and observability modules.

## Deviations from Plan

**None on behavior** — plan executed as written. One process nuance worth recording:

**Process note (not a deviation): parallel commit sweep-in.** The parallel 01-02 quota-ledger agent committed its RED test at `d3886a1` with `git add` scope that captured this plan's untracked `app/src/lib/ulid.test.ts` and `app/package.json` modifications. The test file and dependency landed with the correct contents — only the attribution header differs. This did not affect correctness, verification, or the plan's success criteria.

**Mitigation for future parallel waves:** individual-file staging (`git add <specific-path>`) is already the documented policy; the parallel agent should have used narrower paths. Flag for post-milestone parallelization retrospective.

## Issues Encountered

None. All 9 assertions passed on first GREEN run for each task. No auto-fix iterations required.

## User Setup Required

None. `cost_metrics_raw` table will be created in Plan 05c alongside the cost-rollup view; until then, the retry queue simply accumulates failed inserts in memory (capped at 100 entries) and the authoritative stdout logs remain intact.

## Next Phase Readiness

- **Plan 05b unblocked** — can now `import { withObservability } from "@/lib/observability"` and wrap 8 non-streaming routes.
- **Plan 05c unblocked** — streaming wrapper pattern (v2-chat) will use the same `ObsCtx` surface; `ctx.setOutputTokens` called from the SSE `message_stop` handler captures final token count inside the closure (Warning 5 pattern holds for streams).
- **No blockers** for Wave 2 plans (05b, 05c).
- **cost_metrics_raw schema** is not yet created — Plan 05c owns the migration. Until then, `writeOnce` will fail against a missing table and payloads will accumulate in the retry queue. This is expected and bounded.

## Self-Check: PASSED

- Files: ulid.ts, ulid.test.ts, observability.ts, observability.test.ts, SUMMARY.md — all present on disk
- Commits: 17f6ac3 (ulid feat), 3c20a50 (obs test RED), 6c94171 (obs feat GREEN) — all present in git log
- Tests: 9/9 green (3 ulid + 6 observability)
- Success criteria: all 6 items from plan frontmatter met

---
*Phase: 01-security-cost-control*
*Completed: 2026-04-19*
