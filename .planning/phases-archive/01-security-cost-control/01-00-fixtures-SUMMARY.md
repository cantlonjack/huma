---
phase: 01-security-cost-control
plan: 00
subsystem: testing
tags: [vitest, test-fixtures, supabase-mock, anthropic-mock, console-spy]

# Dependency graph
requires:
  - phase: none
    provides: "Wave 0 plan — no upstream dependencies"
provides:
  - "mock-supabase.ts: three session-shape factories + chainable from() stub + installSupabaseMock helper"
  - "mock-anthropic.ts: MessageStream mock with abort/throwOnAbort + countTokens stub + Anthropic class factory"
  - "capture-log.ts: console.log spy that parses JSON payloads for structured-log assertions"
  - "fixtures.test.ts: shape-validating smoke test (10 assertions)"
affects: [01-01-auth-gate, 01-02-quota-ledger, 01-03-token-budget, 01-04-sanitizer, 01-05c-observability-streaming, 01-06-sse-abort]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Phase 1 fixture directory: app/src/__tests__/fixtures/*.ts"
    - "Wave 0 chokepoint pattern: extract shared test infra before Wave 1 consumers race to extend it"
    - "Mock-stream iterator with throwOnAbort option for SSE disconnect simulation"
    - "captureConsoleLog() + restore() pairing (always call restore() in afterEach)"

key-files:
  created:
    - "app/src/__tests__/fixtures/mock-supabase.ts"
    - "app/src/__tests__/fixtures/mock-anthropic.ts"
    - "app/src/__tests__/fixtures/capture-log.ts"
    - "app/src/__tests__/fixtures/fixtures.test.ts"
  modified: []

key-decisions:
  - "Landed Wave 0 fixture plan ahead of Wave 1 to prevent Plans 02/03/06 from racing to extend mock-anthropic.ts simultaneously"
  - "makeMockStream uses a single canonical factory that supports both silent abort() and APIUserAbortError throw (throwOnAbort option) so Plan 06 can reuse Plan 02/03 infra"
  - "captureConsoleLog silently ignores non-JSON console.log calls — lets it coexist with Next.js dev noise during test runs"
  - "mockSupabaseAuthedSession only surfaces a subscription row when tier:operate — tier:free returns null so quota-ledger tests can distinguish free vs operate paths via the same factory"

patterns-established:
  - "Fixture directory layout: app/src/__tests__/fixtures/ houses mocks, tests sit in app/src/__tests__/*.test.ts"
  - "vi.mock('@anthropic-ai/sdk', () => ({ default: MockAnthropic })) is the canonical way to substitute the SDK in route tests"
  - "Structured-log assertions: wrap test body with captureConsoleLog() and inspect logs[] array"

requirements-completed: []  # This is a fixture-only plan. SEC-01/02/05/06 are *enabled* (their tests can now run) but not *implemented* here — those complete when the consumer plans (01-01, 01-02, 01-05a-c, 01-06) ship. Marking them complete now would falsely claim the security gates are in place.
requirements-enabled: [SEC-01, SEC-02, SEC-05, SEC-06]  # Testing infrastructure now exists for these requirements

# Metrics
duration: 4min
completed: 2026-04-19
---

# Phase 1 Plan 00: Fixtures Summary

**Three Vitest fixture modules (Supabase session mocks, Anthropic MessageStream mock with abort, console.log JSON spy) + shape-validating smoke test — unblocks parallel execution of Wave 1 plans 01/02/03/04/06 as pure consumers.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-19T07:14:26Z
- **Completed:** 2026-04-19T07:17:59Z
- **Tasks:** 1 (TDD: RED → GREEN, no REFACTOR needed)
- **Files created:** 4

## Accomplishments

- Three reusable fixture modules exporting documented surfaces:
  - `mock-supabase.ts` — `mockSupabaseNoSession`, `mockSupabaseAnonSession`, `mockSupabaseAuthedSession`, `installSupabaseMock`
  - `mock-anthropic.ts` — `makeMockStream`, `mockAnthropicCountTokens`, `makeMockAnthropic`, `APIUserAbortError`
  - `capture-log.ts` — `captureConsoleLog`, `CapturedLog` type
- Smoke test (`fixtures.test.ts`) with 10 assertions locks in the fixture contract — any future drift will break this test before breaking a consumer plan
- Full Vitest suite remains green (576/576) — zero production code touched

## Why this is a Wave 0 plan

Prior to splitting this out, Plans 02 (quota-ledger), 03 (token-budget), and 06 (SSE abort) were each expected to extend `mock-anthropic.ts` independently. With parallel Wave 1 execution, those plans would have raced to modify the same file, producing merge conflicts and inconsistent mock shapes. By landing fixtures first:

1. Wave 1 plans become **pure consumers** — they `import` but never modify the fixtures.
2. The fixture contract is **locked by the smoke test** — drift breaks fixtures.test.ts, not downstream tests.
3. Plan 05a (observability-lib) can safely extend `capture-log.ts` with additional helpers; it MUST NOT replace the existing `captureConsoleLog` export.

## Task Commits

Each phase of the TDD cycle was committed atomically:

1. **RED — failing smoke test** — `81682af` (`test`)
2. **GREEN — implement three fixtures** — `34eb953` (`feat`)
3. **REFACTOR** — skipped; implementation is minimal and mirrors plan spec verbatim

**Plan metadata:** (to be added by final commit)

## Files Created/Modified

- `app/src/__tests__/fixtures/mock-supabase.ts` — 79 lines. Three session factories + chainable `.from()` stub that supports `.select().eq().gte().lt().order().limit().single()/.maybeSingle()` plus `insert/upsert/update/delete`. `installSupabaseMock` returns a `{ createServerSupabase }` shape suitable for `vi.doMock("@/lib/supabase-server", ...)` callbacks.
- `app/src/__tests__/fixtures/mock-anthropic.ts` — 92 lines. `makeMockStream` builds a MessageStream-shaped object with `Symbol.asyncIterator`, `abort()`, `finalMessage()`, and `on(event, listener)`. When `throwOnAbort: true`, both the iterator and `finalMessage()` throw `APIUserAbortError` post-abort. `makeMockAnthropic` wraps it into a class for `vi.mock("@anthropic-ai/sdk")`.
- `app/src/__tests__/fixtures/capture-log.ts` — 32 lines. `captureConsoleLog()` returns `{ logs, restore, spy }`. The spy tolerates non-string console.log calls and non-JSON strings — both are silently skipped, so real Next.js dev logs don't pollute the captured array.
- `app/src/__tests__/fixtures/fixtures.test.ts` — 83 lines. 10 assertions: three for Supabase session mocks, five for mock-stream / countTokens / Anthropic class shape, one for captureConsoleLog JSON parsing, one for APIUserAbortError name.

## Decisions Made

- **Wave 0 chokepoint is worth one extra plan** — earlier plans (02/03/06) were already importing a hypothetical mock-anthropic surface; pre-extracting it prevents merge contention and produces a single canonical stream factory everyone can reason about.
- **`makeMockStream` returns `{ stream, abortFn, aborted, APIUserAbortError }`** — exposing `abortFn` and the `aborted` getter lets consumers assert abort semantics without relying on Vitest's mock inspection quirks.
- **`captureConsoleLog` uses `mockImplementation` not `mockReturnValue`** — we need to *intercept* every call, inspect its args, and push JSON payloads. Returning a value from console.log is meaningless.
- **Email field defaults to `${userId}@example.com`** for authed sessions — deterministic, recognizable, and doesn't require each test to stub it out.

## Deviations from Plan

None — plan executed exactly as written. The three fixture files and the smoke test are byte-for-byte what the plan specified (modulo `prettier`-style formatting Git applied to CRLF line endings, which does not affect content).

## Issues Encountered

None. The only wrinkle was Git's expected CRLF warning on Windows (`LF will be replaced by CRLF`) — benign, does not affect test execution since Vitest reads files via Node's fs which normalizes both.

## User Setup Required

None — no external service configuration required. This plan only creates test infrastructure.

## Next Phase Readiness

- **Ready for Plan 01 (auth-gate):** Can `import { mockSupabaseNoSession, mockSupabaseAnonSession, installSupabaseMock } from "@/__tests__/fixtures/mock-supabase"` immediately.
- **Ready for Plans 02/03/04/06:** Can combine `mockSupabase*` with `makeMockAnthropic` for end-to-end route tests.
- **Ready for Plan 05a (observability-lib):** Can extend (not replace) `capture-log.ts` if additional log-shape assertions are needed.
- **No blockers.** Fixtures test run is <3s; full suite <50s — acceptable dev-loop latency.

---

## Self-Check: PASSED

Verified against disk:
- `app/src/__tests__/fixtures/mock-supabase.ts` FOUND (79 lines, ≥50 required)
- `app/src/__tests__/fixtures/mock-anthropic.ts` FOUND (92 lines, ≥70 required)
- `app/src/__tests__/fixtures/capture-log.ts` FOUND (32 lines, ≥30 required)
- `app/src/__tests__/fixtures/fixtures.test.ts` FOUND (83 lines, ≥30 required)

Verified against git log:
- `81682af` (test — RED) FOUND in git log
- `34eb953` (feat — GREEN) FOUND in git log

Verified exports:
- `mockSupabaseNoSession`, `mockSupabaseAnonSession`, `mockSupabaseAuthedSession`, `installSupabaseMock` exported from mock-supabase.ts
- `makeMockStream`, `mockAnthropicCountTokens`, `makeMockAnthropic`, `APIUserAbortError`, `MockStreamOptions` exported from mock-anthropic.ts
- `captureConsoleLog`, `CapturedLog` exported from capture-log.ts
- `makeMockStream({throwOnAbort: true})` iterator emits APIUserAbortError (assertion 5 in fixtures.test.ts confirms)

All must_haves truths satisfied. All 4 artifacts meet min_lines. Key-link `fixtures/mock-(supabase|anthropic)|fixtures/capture-log` pattern matches files created.

---

*Phase: 01-security-cost-control*
*Completed: 2026-04-19*
