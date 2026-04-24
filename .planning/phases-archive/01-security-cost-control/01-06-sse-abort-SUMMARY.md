---
phase: 01-security-cost-control
plan: 06
subsystem: api
tags: [sse, streaming, anthropic, abort, cost-control, next16]

# Dependency graph
requires:
  - phase: 01-security-cost-control
    provides: Plan 00 makeMockStream fixture (throwOnAbort + chunkDelayMs); Plan 01 requireUser auth gate + anon-session path
provides:
  - anthropic.messages.stream called with { signal: request.signal } — SDK-level abort
  - ReadableStream.start abort-listener path (belt-and-suspenders for browser nav)
  - ReadableStream.cancel → stream.abort() (consumer-cancellation path)
  - APIUserAbortError suppressed — route exits cleanly, not via controller.error()
  - Manual-observation smoke script for Vercel log verification (Plan 07 gate input)
affects: [01-05c-observability-streaming, 01-07-enablement]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SDK-signal + AbortEventListener + ReadableStream.cancel triple-guard for streaming abort"
    - "APIUserAbortError suppression via name-check in catch block — never surfaces to controller.error"
    - "Manual-observation smoke pattern (curl-kill → inspect logs) for behaviors the route cannot self-verify"

key-files:
  created:
    - app/src/app/api/v2-chat/route.abort.test.ts
    - app/scripts/smoke/sec-06-disconnect.sh
  modified:
    - app/src/app/api/v2-chat/route.ts

key-decisions:
  - "Pass { signal: request.signal } as the second arg to anthropic.messages.stream — cleanest SDK-native abort path (verified in SDK 0.78 MessageStreamParams + RequestOptions types)"
  - "Add explicit AbortEventListener inside ReadableStream.start anyway — belt-and-suspenders for browser-nav teardown where the SDK signal wiring alone has been flaky historically"
  - "Assert opts.signal IS an AbortSignal (not identity to ctrl.signal) — the Next/undici Request constructor wraps the caller's AbortSignal, so identity is not preserved; propagation is asserted by the actual abort/cancel tests"
  - "Do NOT integrate Plan 05c observability hooks (withObservability, stream.on('finalMessage'), obs.setOutputTokens) — Plan 05c ships in Wave 2 and will layer those on top of this Wave 1 surgical edit"

patterns-established:
  - "Triple-guard abort for streaming routes: SDK { signal } + abort-event listener + ReadableStream.cancel"
  - "Silent APIUserAbortError handling via name-check — aborts are expected, not errors"
  - "Manual-smoke scripts for externally-observable behaviors use SKIP-friendly env-var gating (ANON_JWT/COOKIE) so CI runs don't fail"

requirements-completed: [SEC-06]

# Metrics
duration: 3h 32m
completed: 2026-04-19
---

# Phase 1 Plan 6: SSE Disconnect Abort Summary

**SEC-06 delivered: v2-chat streams now abort the Anthropic upstream on client disconnect via SDK signal option + ReadableStream lifecycle hooks, killing runaway token spend when users navigate away mid-response.**

## Performance

- **Duration:** 3h 32m (wall-clock; includes parallel-agent orchestration overhead — actual authoring time a small fraction)
- **Started:** 2026-04-19T07:49:14Z
- **Completed:** 2026-04-19T11:21:46Z
- **Tasks:** 3 (2 combined in one TDD cycle; 1 smoke script)
- **Files modified:** 3 (2 created, 1 modified)

## Accomplishments

- `anthropic.messages.stream` now receives `{ signal: request.signal }` — SDK tears down the underlying fetch on client disconnect
- `ReadableStream.start()` registers a `request.signal` `abort` listener that calls `stream.abort()` + `controller.close()` (belt-and-suspenders for browser-nav edge cases)
- `ReadableStream.cancel()` calls `stream.abort()` for consumer-cancellation path
- `APIUserAbortError` caught by name and suppressed — route exits via `controller.close()`, never via `controller.error()`, so downstream observability never sees a false-positive error
- Loop short-circuits via `if (request.signal.aborted) break;` at the top of each iteration for tight teardown
- Abort-event listener removed in `finally` to avoid leaks across long-lived requests
- 4-case unit test suite covers all four paths (signal arg, signal abort, cancel, swallow)
- Manual-observation smoke script (`sec-06-disconnect.sh`) ready for Plan 07's staging verification

## Task Commits

Each task committed atomically (TDD RED→GREEN collapsed for Tasks 1+2 — single abort feature):

1. **Task 2 (RED): add failing abort test** - `acc94f1` (test)
2. **Tasks 1 + 2 (GREEN): wire { signal } + abort handlers + test assertion fix** - `d3edf29` (feat)
3. **Task 3: add SEC-06 disconnect smoke script** - `309d3cf` (feat)

_Note: Tasks 1 and 2 are two sides of the same TDD cycle (test + impl for the abort feature); they share the GREEN commit._

## Files Created/Modified

- `app/src/app/api/v2-chat/route.ts` — (modified) surgical additions: `{ signal: request.signal }` option, abort event listener, `if (request.signal.aborted) break`, `APIUserAbortError` suppression, `ReadableStream.cancel()` handler
- `app/src/app/api/v2-chat/route.abort.test.ts` — (created) 4 unit tests for the four abort paths (signal-arg, signal-abort, cancel, swallow)
- `app/scripts/smoke/sec-06-disconnect.sh` — (created) manual-observation smoke; curl-N + kill-100ms → inspect Vercel logs

## Decisions Made

- **Passed `request.signal` via the SDK's second-arg options** — cleanest native path. Anthropic SDK 0.78 explicitly supports `{ signal }` on `messages.stream(...)` per `MessageStreamParams + RequestOptions` types.
- **Added an explicit abort event listener anyway** — belt-and-suspenders. The SDK signal path is the primary; the listener ensures tear-down even if the SDK's internal wiring doesn't flush immediately on browser-nav.
- **Suppressed `APIUserAbortError` by name-check, not instanceof** — the error may come from the real SDK or the test mock; name-matching works for both without a cross-module instanceof pitfall.
- **Did NOT integrate Plan 05c observability hooks** — Plan 05c ships in Wave 2 and will wrap this handler with `withObservability` + register `stream.on("finalMessage", ...)`. Keeping this plan's edits surgical avoids merge conflicts and respects wave boundaries (parallel_context guard).
- **Test assertion relaxed from identity to instanceof** — `new Request(url, { signal })` wraps the caller's AbortSignal rather than passing through identity. The propagation is asserted by the abort/cancel tests (both verify `abortFn` fires), so identity was redundant anyway.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Relaxed signal-identity assertion in test**
- **Found during:** Task 1 (GREEN phase — running the route.abort.test.ts against the new route.ts)
- **Issue:** `expect(opts?.signal).toBe(ctrl.signal)` failed because Node/undici's `Request` constructor wraps the caller's `AbortSignal` — the inner `request.signal` is not identity-equal to the caller's `ctrl.signal`, even though aborting `ctrl` propagates correctly.
- **Fix:** Changed assertion to `expect(opts?.signal).toBeInstanceOf(AbortSignal)`. The propagation behavior is asserted by the subsequent tests (signal-abort test confirms `abortFn` fires).
- **Files modified:** app/src/app/api/v2-chat/route.abort.test.ts (assertion line)
- **Verification:** `npx vitest run src/app/api/v2-chat/` — 8/8 pass (4 auth + 4 abort)
- **Committed in:** `d3edf29` (GREEN commit for Tasks 1+2)

**2. [Rule 3 - Blocking] Omitted Plan 05c's finalMessage listener**
- **Found during:** Task 1 (applying surgical edits to route.ts)
- **Issue:** The plan's action block shows `stream.on("finalMessage", (msg) => obs.setOutputTokens(...))` assuming Plan 05c had landed. Plan 05c runs in parallel Wave 2 — has not merged. Including the `obs.*` calls would reference an undefined wrapper and fail compilation.
- **Fix:** Kept the stream-creation edit surgical — `{ signal: request.signal }` option only. Plan 05c will layer `withObservability` and the `finalMessage` listener on top when it lands, as the parallel_context guard explicitly anticipates.
- **Files modified:** app/src/app/api/v2-chat/route.ts (surgical — only the abort-related edits)
- **Verification:** `npx vitest run src/app/api/v2-chat/` — both auth (SEC-01) and abort (SEC-06) suites pass, no compilation errors.
- **Committed in:** `d3edf29`

---

**Total deviations:** 2 auto-fixed (both Rule 3 - Blocking).
**Impact on plan:** Both fixes necessary for correctness. First was a Node/undici-specific runtime quirk; second was a wave-boundary respect. Plan 05c's observability hooks will land on a clean interface in Wave 2. No scope creep.

## Issues Encountered

None beyond the two deviations above (both resolved in-commit).

## Authentication Gates

None. All tests run fully mocked; the smoke script is manual-observation only and skips cleanly when `ANON_JWT`/`COOKIE` is not set.

## User Setup Required

None — no external service configuration required for this plan. Plan 07 (enablement) will run the smoke script against staging; that requires `ANON_JWT` + access to Vercel logs but is scoped to Plan 07's user-setup.

## Next Phase Readiness

**Ready for Plan 01-05c** (parallel Wave 2 plan): Plan 05c will wrap this handler with `withObservability` and register `stream.on("finalMessage", ...)`. The existing stream-creation surface (`anthropic.messages.stream(body, { signal })`) accepts that layering cleanly — 05c adds `.on()` registration after the stream is created. Aborted streams will emit a reconciliation log with partial or zero `output_tokens`, giving production visibility into abort behavior.

**Ready for Plan 01-07** (Wave 3 enablement): `scripts/smoke/sec-06-disconnect.sh` is in place. Plan 07's smoke quad will invoke it against staging after `PHASE_1_GATE_ENABLED=true` lands.

**Plan 00 fixture consumed AS-IS** (Warning 6 satisfied): `makeMockStream({ throwOnAbort: true, chunkDelayMs: 5 })` used directly; no fixture edits. The factory already provides everything needed.

**Remaining Phase 1 plans:** 02 (quota ledger), 03 (token budget), 04 (sanitizer), 05a (observability lib) — running in parallel Wave 1; 05b + 05c (observability routes + streaming) in Wave 2; 07 (enablement + smoke quad) in Wave 3.

## Self-Check: PASSED

Verified:
- `app/src/app/api/v2-chat/route.ts` — FOUND, `signal: request.signal` and `stream.abort()` present
- `app/src/app/api/v2-chat/route.abort.test.ts` — FOUND, 4 test cases, all passing
- `app/scripts/smoke/sec-06-disconnect.sh` — FOUND, executable, syntax-valid, skips cleanly without auth
- Commit `acc94f1` — FOUND (RED — failing test)
- Commit `d3edf29` — FOUND (GREEN — implementation + test assertion relaxation)
- Commit `309d3cf` — FOUND (Task 3 — smoke script)
- All 8 v2-chat tests pass (4 existing auth + 4 new abort)

---
*Phase: 01-security-cost-control*
*Completed: 2026-04-19*
