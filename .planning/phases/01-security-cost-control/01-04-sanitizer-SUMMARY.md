---
phase: 01-security-cost-control
plan: 04
subsystem: security
tags: [zod, prompt-injection, sanitization, unicode, sec-04, schemas]

# Dependency graph
requires:
  - phase: 01-security-cost-control
    provides: parseBody()+badRequest() from parse.ts/api-error.ts (unchanged); schemas/index.ts as central Zod barrel
provides:
  - sanitizeUserText(raw) library with 4 transforms (NFC, zero-width strip, injection-prefix strip, marker rejection)
  - userTextField(opts) reusable Zod z.string().transform() that surfaces marker rejection as custom issue → 400 via parseBody
  - All enumerated user-text fields across 3 files now route through userTextField (messageSchema.content, v2Chat/sheetCompile/nudge/palette/insight/wholeCompute in index.ts; weekly-review + reflection route-local schemas)
  - audit.test.ts (29 tests) — enumeration assertion; Blocker 1 hard-fails on missing/unsanitized field
  - coverage.test.ts (17 tests) — schema-level .safeParse + route-level HTTP 400 checks; Blocker 1 hard-fails on missing schema by name
  - sec-04-injection.sh smoke — 3 curls (`[[`/`]]` → 400 + body "reserved marker"; prefix → NOT 400)
  - reflection/route.ts now uses parseBody() (previously raw request.json())
affects: [01-05b, 01-05c, 01-07, 02, 03, 04, 05, 06, 07, 08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "user-text Zod fields use userTextField({min?, max?}) instead of z.string().min().max() — consistent sanitization at the request boundary"
    - "New user-text fields in future phases MUST be added to audit.test.ts EXPECTED_FIELDS AND use userTextField — enumerate-then-assert replaces silent skip"
    - "Route-local inline schemas refined in place (no lift to index.ts) when restructuring would be invasive; coverage.test.ts asserts via mocked POST handlers instead of direct schema import"

key-files:
  created:
    - app/src/lib/schemas/audit.test.ts
    - app/src/lib/schemas/coverage.test.ts
    - app/scripts/smoke/sec-04-injection.sh
  modified:
    - app/src/lib/schemas/index.ts (~20 z.string() callsites → userTextField)
    - app/src/app/api/weekly-review/route.ts (aspirationSchema.rawText/clarifiedText/behaviors.text + weeklyReviewSchema.operatorName refined)
    - app/src/app/api/reflection/route.ts (added reflectionSchema, switched from raw request.json to parseBody)

key-decisions:
  - "Plan 01-04: sanitize.ts + sanitize.test.ts landed pre-resumption inside parallel commit d3886a1 during 01-02's test commit (sweep-in via `git add -A`); files match plan spec and 13 tests were already green — all subsequent 01-04 work landed under clean per-file git add"
  - "Plan 01-04: injection-phrase stripping is SILENT (loops to peel stacked prefixes); only `[[`/`]]` trigger hard 400 — matches CONTEXT.md design"
  - "Plan 01-04: route-local schemas (weekly-review.aspirationSchema, reflection.reflectionSchema) refined in place, NOT lifted to index.ts — lifting would restructure unrelated inline schemas and exceed surgical-edit scope; coverage.test.ts hits the route via mocked POST and asserts HTTP 400 + 'reserved marker' body"
  - "Plan 01-04: `.default('')` preserved via chain `userTextField({ min: 0 }).default('')` — `.transform()` output is still chainable with `.default()` in Zod 4.3+, so no Zod version bump needed"
  - "Plan 01-04: audit.test.ts uses regex matching on `<fieldKey>: ...userTextField(` with ≤120-char lookahead — accommodates `z.array(userTextField())`, `userTextField({...}).default(...)`, and bare `userTextField()` call styles without false positives from distant userTextField references"

patterns-established:
  - "Enumerate-then-assert audit pattern: explicit EXPECTED_FIELDS list + per-field regex assertion with named failure message (`Blocker 1: no silent skips — fix schema OR update audit`)"
  - "Schema-by-name lookup with hard-fail: `getSchema()` throws `'Schema not found... locate actual location and update coverage.test.ts'` — removes the original silent `if (!schema) return`"
  - "HTTP shape assertion against `{error, code: 'BAD_REQUEST'}` + `/reserved marker/i` — matches parse.ts shipped behavior (NO fictional `rejected` HTTP field); Blocker 3 resolution"

requirements-completed:
  - SEC-04

# Metrics
duration: ~6 min
completed: 2026-04-19
---

# Phase 1 Plan 04: Sanitizer Summary

**SEC-04 prompt-injection defense at the Zod boundary: sanitizeUserText + userTextField applied to 20+ user-text fields across 3 files, with audit + coverage meta-tests that hard-fail on missing sanitization.**

## Performance

- **Duration:** ~6 min (resumption-only; previous pre-disconnect session produced sanitize.ts + sanitize.test.ts as part of parallel commit d3886a1)
- **Started (resume):** 2026-04-19T11:46:00Z
- **Completed:** 2026-04-19T11:52:43Z
- **Tasks:** 4
- **Files changed this session:** 4 created (audit.test.ts, coverage.test.ts, sec-04-injection.sh) + 3 modified (index.ts, weekly-review/route.ts, reflection/route.ts)
- **Files pre-landed in d3886a1:** 2 (sanitize.ts, sanitize.test.ts)

## Accomplishments

- **Single-library sanitizer.** `sanitizeUserText(raw)` implements four deterministic transforms (NFC normalize, zero-width strip, iterative injection-prefix strip, marker rejection). Marker rejection returns `{value, rejected: 'markers'}`; prefix stripping is silent (loop bound 10 — defensive against stacked prefixes).
- **Reusable Zod helper.** `userTextField({min, max})` wraps `z.string().min().max().transform()` + `ctx.addIssue` on marker rejection. Every call site sees the sanitized value; `parseBody()` converts the custom issue into a 400 before the handler runs.
- **20+ refinement callsites.** Every enumerated user-text field in `schemas/index.ts` (messageSchema.content, v2Chat/sheetCompile/nudge/palette/insight/wholeCompute aspirations/behaviors/contextData/etc.) + weekly-review's inline `aspirationSchema` and new `reflectionSchema` route through `userTextField`.
- **Reflection route hardened.** Previously used `await request.json() as Record<string, unknown>` — now wraps `reflectionSchema` (type + text + todaysSheet) and invokes `parseBody`. Consequence: 400 for `[[`/`]]` fires before the Anthropic call, saving tokens on bad input.
- **Blocker 1 resolved.** `audit.test.ts` (29 tests) enumerates every user-text field by (schemaName, fieldKey, note) tuples and asserts each file imports `userTextField` AND each field has a `<key>: ...userTextField(` callsite within a bounded lookahead. Failure message names the exact missing field. `coverage.test.ts` `getSchema()` helper throws with explicit guidance on missing schema names — the original silent `if (!schema) return;` is gone.
- **Blocker 3 resolved.** All HTTP assertions check against `{error, code: 'BAD_REQUEST'}` with `body.error` matching `/reserved marker/i` — matches `parse.ts + badRequest()` actual shape. NO fictional `rejected` field on the HTTP response. Unit test on `sanitizeUserText` still asserts internal `rejected: 'markers'` return shape.
- **All 670 tests pass** across 37 files (full Vitest suite post-Plan 04 equals pre-Plan 04 count + new 46 SEC-04 tests).

## Task Commits

Each task was committed atomically via explicit per-file `git add` (never `-A` or `.` — prevents the parallel-commit sweep-in that contaminated d3886a1):

1. **Task 1: sanitize.ts library + sanitize.test.ts (TDD)** — `d3886a1` (landed pre-resumption inside 01-02's parallel test commit; sanitize.ts matches plan spec verbatim; 13 unit tests pass). *Not re-committed under 01-04 — reference only.*
2. **Task 2: Audit + apply userTextField in index.ts + weekly-review + reflection** — `e96e4da` (feat)
3. **Task 3: Coverage meta-test with hard-fail on missing schema** — `827fc90` (test)
4. **Task 4: SEC-04 injection smoke script** — `374b679` (feat)

**Plan metadata commit:** recorded after STATE/ROADMAP/REQUIREMENTS update below.

## Files Created/Modified

**Created (this session):**
- `app/src/lib/schemas/audit.test.ts` — 29 tests, enumerate-then-assert; Blocker 1 hard-fail on missing field
- `app/src/lib/schemas/coverage.test.ts` — 17 tests (13 schema-level + 4 route-level HTTP 400); Blocker 1 + 3 resolutions
- `app/scripts/smoke/sec-04-injection.sh` — 3 curls against /api/v2-chat; documents PHASE_1_GATE_ENABLED/CRON_SECRET interaction

**Pre-landed (d3886a1, cross-contamination from 01-02 TDD RED commit):**
- `app/src/lib/schemas/sanitize.ts` — 4-transform library + userTextField Zod helper
- `app/src/lib/schemas/sanitize.test.ts` — 13 unit tests covering markers, prefix strip, zero-width, NFC, idempotent, empty, min/max

**Modified:**
- `app/src/lib/schemas/index.ts` — +2 / -0 lines at import; ~18 user-text callsites switched from `z.string()...` to `userTextField(...)`; retained non-user fields (ids, enums, dates, role) untouched
- `app/src/app/api/weekly-review/route.ts` — +1 import; 4 fields refined (`rawText`, `clarifiedText`, `behaviors[].text`, `operatorName`) via `userTextField({min:0}).default("")` to preserve default-when-undefined
- `app/src/app/api/reflection/route.ts` — +3 imports (z, parseBody, userTextField); added `reflectionSchema` (type/text/todaysSheet); replaced raw `request.json()` + manual `badRequest("type is required")` with `parseBody(request, reflectionSchema)`; removed now-unused `badRequest` import

## Decisions Made

1. **Do NOT re-commit sanitize.ts / sanitize.test.ts under 01-04.** They already exist in git as part of `d3886a1` (authored pre-disconnect during 01-02 TDD RED commit's `git add -A` sweep). Re-adding via `git mv` or duplicate-touch would inflate diff without value. Reference in this SUMMARY suffices. All NEW 01-04 work uses explicit `git add <path>` per-file to prevent recurrence.

2. **Route-local schemas refined in place, not lifted.** Weekly-review's `aspirationSchema` is nested inside a 40-line route-local validation chain containing 5+ other inline object schemas; reflection had no schema at all. Lifting both to `index.ts` would spider into restructuring unrelated fields (dimensionsTouched, dimensionOverrides, behaviorDaySchema) and exceed surgical-edit scope. Coverage.test.ts validates via mocked POST handlers + HTTP 400 assertion instead of direct import — Blocker 1 case e pattern.

3. **`userTextField({min:0}).default("")` for default-string fields.** Zod's `.default()` runs AFTER `.transform()` when the input is `undefined`, so chaining works. Empty string `""` passes `.min(0)` and through the sanitizer unchanged. Verified by coverage.test.ts "weekly-review/route.ts rejects [[ in aspirationSchema.rawText" test exercising the default path.

4. **Audit regex uses bounded lookahead.** `\\b${fieldKey}\\s*:[^,\\n}]{0,120}\\buserTextField\\s*\\(` — stops at `,`, `\n`, or `}` AND caps at 120 chars. This tolerates wrapped styles (`rawText:\n    userTextField({...})`) without letting an unrelated distant `userTextField` reference accidentally satisfy the match. Test-suite health is itself tested (the `totalFields >= 20` sanity assertion).

5. **Smoke-script auth strategy documented, not enforced.** SEC-04 runs inside `parseBody()` which is called after SEC-01 auth + SEC-02 quota gates. When those fire first (e.g., anon + `PHASE_1_GATE_ENABLED=true`), the smoke's 400 assertion is unreachable — that's SEC-01 working, not an SEC-04 regression. Header comment explains CRON_SECRET bypass and env interaction so operators don't misread a 401 as an SEC-04 failure.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Audit test file-path resolution fixed**
- **Found during:** Task 2 (first run of audit.test.ts)
- **Issue:** Plan's template used `app/src/lib/schemas/index.ts` as the path but Vitest `process.cwd()` is `C:/HUMAHUMA/app/`, so `resolve(cwd, "app/src/...")` produced `C:/HUMAHUMA/app/app/src/...` which doesn't exist. Error: `ENOENT`.
- **Fix:** Switched paths to `src/lib/schemas/index.ts` / `src/app/api/{weekly-review,reflection}/route.ts` (relative to Vitest cwd). Added comment noting the repo-root path for human reference.
- **Files modified:** `app/src/lib/schemas/audit.test.ts` (3 path entries)
- **Verification:** 29/29 audit tests now pass; full suite 670/670 green.
- **Committed in:** `e96e4da` (Task 2 commit — same commit as the initial file creation)

**2. [Rule 3 - Blocking] Removed unused `badRequest` import in reflection/route.ts**
- **Found during:** Task 2 (refactor)
- **Issue:** After replacing raw `request.json()` + manual `badRequest("type is required")` with `parseBody(request, reflectionSchema)`, the direct `badRequest` call site went away; the import would linger as a TS `noUnusedLocals` / lint warning.
- **Fix:** Removed `badRequest` from the `@/lib/api-error` import statement (kept `rateLimited` + `internalError`).
- **Files modified:** `app/src/app/api/reflection/route.ts`
- **Verification:** TypeScript compiles cleanly on this file (the ONE pre-existing `fixtures.test.ts` error is unrelated — see deferred-items.md, pre-dates Plan 01-04).
- **Committed in:** `e96e4da`

---

**Total deviations:** 2 auto-fixed (both Rule 3 - blocking; both inside Task 2). No architectural changes (Rule 4) required.
**Impact on plan:** Both fixes necessary to land plan as specified. No scope creep.

## Issues Encountered

- **Vitest cwd mismatch.** Plan-template paths assumed repo-root cwd; Vitest runs from `app/`. Corrected on first test run (see Deviation 1 above).
- **Pre-existing `fixtures.test.ts` tsc error** (unrelated to Plan 04, logged in `deferred-items.md` from Plan 01-01). Does NOT affect Vitest runtime — 670/670 pass. Fix deferred per SCOPE BOUNDARY rule: Plan 04 did not introduce it and it is NOT in a file Plan 04 touched.

## User Setup Required

None — no external-service configuration. Smoke script optionally consumes `CRON_SECRET` if provided (for bypass after PHASE_1_GATE_ENABLED flip in Plan 07); without it, the smoke still works against `PHASE_1_GATE_ENABLED=false` or anon-allowed endpoints.

## Blocker Resolutions

### Blocker 1 — Silent skip removed, inline schemas handled

**Resolved via dual-test pattern:**
1. `audit.test.ts` enumerates every user-text field across 3 files as explicit `(schemaName, fieldKey)` tuples. Each field has its own `it()` case — failure messages name the exact missing callsite ("expected user-text field 'aspirationSchema.rawText' to use userTextField(...)"). 29 assertions total. Adding a new user-text field without refinement in a future phase causes a hard failure with actionable guidance.
2. `coverage.test.ts` `getSchema()` helper throws `'Schema not found ... Do NOT add a silent skip'` on missing named export — the original plan's `if (!schema) return;` fallback is deleted.

**Inline-schema case (case e):** Weekly-review's `aspirationSchema` and reflection's new `reflectionSchema` are route-local (not in index.ts). Coverage.test.ts covers them via mocked POST handlers (`vi.doMock` Anthropic + Supabase + rate-limit) that assert HTTP 400 + `/reserved marker/i` — four route-level tests total.

### Blocker 3 — HTTP shape matches shipped behavior

`must_haves.truths` in PLAN frontmatter correctly asserted `code:'BAD_REQUEST'` + `message containing 'reserved marker'`. All tests check `body.code === 'BAD_REQUEST'` and `body.error` matches `/reserved marker/i`. NO test asserts a `rejected` field on the HTTP response — the `rejected` field only exists on `sanitizeUserText`'s internal return value (asserted in `sanitize.test.ts` unit tests). No `parse.ts` changes needed.

## Downstream Notes

- **Phases 2–8 adding new user-text fields MUST:**
  1. Use `userTextField({min?, max?})` instead of `z.string().min().max()` for any user-written input.
  2. Add the new `(schemaName, fieldKey)` tuple to `EXPECTED_FIELDS` in `app/src/lib/schemas/audit.test.ts`.
  3. If the schema is route-local (not in index.ts), add a route-level HTTP 400 assertion to `coverage.test.ts` in the manner of the existing weekly-review / reflection blocks.
- **Plan 01-05c (streaming)** will wrap `/api/v2-chat` output with `withObservability` — sanitizer runs at INPUT boundary so assistant output tokens are unaffected. No coupling.
- **Plan 01-07 (enablement)** flips `PHASE_1_GATE_ENABLED=true` — sec-04-injection.sh still works when `CRON_SECRET` is set.

## Known Limitation

- **Does not defend against base64-encoded injection.** An attacker could encode `[[MARKER]]` as `W1tNQVJLRVJdXQ==` and get it past the sanitizer; LLM might decode+obey. Out of scope per RESEARCH.md — base64 defense would require LLM-side output filtering, not input sanitization.
- **Injection-prefix list is English-only.** "Ignore previous instructions" / "Disregard previous" / "System:" only. Non-English analogs pass through. Acceptable for MVP — HUMA's operator demographic skews English.

## Next Phase Readiness

- **Plan 01-05b (observability-routes)** and **01-05c (observability-streaming)** unblocked — both operate AFTER parseBody, so they see the sanitized values.
- **Plan 01-07 (enablement)** unblocked — sec-04-injection.sh is the phase's integration smoke; it will run against staging post-flag-flip.

## Self-Check: PASSED

- `app/src/lib/schemas/audit.test.ts`: FOUND (29 tests passing)
- `app/src/lib/schemas/coverage.test.ts`: FOUND (17 tests passing)
- `app/scripts/smoke/sec-04-injection.sh`: FOUND (executable, bash -n clean)
- `app/src/lib/schemas/sanitize.ts`: FOUND (pre-landed d3886a1, matches plan spec)
- `app/src/lib/schemas/sanitize.test.ts`: FOUND (13 tests passing, pre-landed d3886a1)
- `app/src/lib/schemas/index.ts`: MODIFIED (imports userTextField; ~18 callsites)
- `app/src/app/api/weekly-review/route.ts`: MODIFIED (imports userTextField; 4 callsites)
- `app/src/app/api/reflection/route.ts`: MODIFIED (added reflectionSchema + parseBody)
- Commit `e96e4da`: FOUND (feat 01-04: wire userTextField into schemas + routes + audit test)
- Commit `827fc90`: FOUND (test 01-04: coverage meta-test hard-fails on missing schema)
- Commit `374b679`: FOUND (feat 01-04: add SEC-04 injection smoke script)
- Commit `d3886a1`: FOUND (parallel-landing reference for sanitize.ts/test)
- Full Vitest suite: 670/670 passing (37 files)

---
*Phase: 01-security-cost-control*
*Plan: 04-sanitizer*
*Completed: 2026-04-19*
