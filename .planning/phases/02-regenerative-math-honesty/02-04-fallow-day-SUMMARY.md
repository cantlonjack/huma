---
phase: 02-regenerative-math-honesty
plan: 04
subsystem: operator-state / api / ui

tags: [regen-05, fallow-day, huma-context, check-guard, wave-2]

# Dependency graph
requires:
  - phase: 02-regenerative-math-honesty
    plan: 00
    provides: "Wave 0 .skip stubs for sheet/fallow/route.test.ts, useToday.fallow.test.ts, sheet/check/route.fallow.test.ts"
  - phase: 02-regenerative-math-honesty
    plan: 02
    provides: "HumaContext.dormant extension pattern + /today Dormancy branch precedent (Fallow slots in between Dormancy and Outcome); operator-state-as-huma-context pattern applied verbatim"
  - phase: 01-security-cost-control
    provides: "parseBody + Zod + withObservability + requireUser conventions; captureConsoleLog + mockSupabase* fixtures"
provides:
  - "HumaContext.fallowDays?: string[] — ISO YYYY-MM-DD entries persisted in existing huma_contexts JSONB column (schema-less, no migration)"
  - "POST /api/sheet/fallow — mark/unmark endpoint with same-day-only unmark (409 FALLOW_FROZEN on post-midnight undo)"
  - "/api/sheet/check guard — 409 + code:'FALLOW_DAY' when today is fallow; sheet_entries/behavior_log never reached"
  - "lib/fallow.ts — pure helpers (isFallow, addFallowDay, removeFallowDay, isFrozenAfterMidnight) with zero external state"
  - "components/today/FallowCard.tsx — 'Fallow. Compost day.' spec-locked copy + same-day unmark affordance"
  - "/today header Fallow button — 'fallow today' (Voice Bible §02 compliant)"
  - "useToday.isFallow + fallowMarkToday + fallowUnmarkToday hook surface"
  - "REGEN-01 × REGEN-05 confidence-clock invariant test — asserts calendar-day formula ticks through fallow days (no special case)"
affects: [07-04]  # Phase 7 DEPTH-04 Hard Season will reuse the same HumaContext.extend pattern (dormant + fallowDays + hardSeason trio)

# Tech tracking
tech-stack:
  added: []  # no new deps — endpoint reuses Phase 1 schemas/parse/observability/auth-guard; card reuses existing Tailwind tokens + DormantCard layout parity
  patterns:
    - "Fallow state as huma_context JSONB extension (not a new table): additive optional array field fallowDays?: string[] preserves the schema-less operator-state pattern Plan 02-02 established for dormancy"
    - "Same-day-only unmark: past fallow marks are frozen after midnight. Immutable historical record of when the operator declared rest, similar in spirit to outcome_checks append-only in Plan 02-05"
    - "Guard-before-side-effect: /api/sheet/check's fallow check runs BEFORE sheet_entries.update — 409 short-circuits the DB write, preserving truth (no behavior_log pollution on fallow days)"
    - "Ad-hoc plan-local error codes: FALLOW_FROZEN and FALLOW_DAY live outside the Phase 1 apiError code union (returned via Response.json directly). Avoids expanding app-wide error contract for two plan-scope codes"
    - "Priority-chain rendering on /today: Dormancy > Fallow > Outcome > normal sheet — each state owns its own branch, each hook flag is derived independently, the chain is resolved by render-order in today/page.tsx"

key-files:
  created:
    - "app/src/lib/fallow.ts — isFallow + addFallowDay + removeFallowDay + isFrozenAfterMidnight pure helpers (82 lines)"
    - "app/src/app/api/sheet/fallow/route.ts — POST endpoint with parseBody + Zod + withObservability + requireUser; same-day-only unmark via isFrozenAfterMidnight; structured audit log (142 lines)"
    - "app/src/components/today/FallowCard.tsx — 'Fallow. Compost day.' spec-locked copy + same-day unmark affordance; mirrors DormantCard layout parity (42 lines)"
  modified:
    - "app/src/types/context.ts — HumaContext.fallowDays?: string[] optional field with REGEN-05 comment"
    - "app/src/lib/schemas/index.ts — sheetFallowSchema (z.object({ mark: boolean, date: YYYY-MM-DD regex }))"
    - "app/src/app/api/sheet/check/route.ts — isFallow guard prepended between auth and sheet_entries.update; 409 + FALLOW_DAY short-circuit"
    - "app/src/hooks/useToday.ts — isFallow derivation via checkFallow(humaContext, date); fallowMarkToday + fallowUnmarkToday handlers POST to /api/sheet/fallow + invalidate queryKeys.humaContext"
    - "app/src/app/today/page.tsx — FallowCard conditional render between Dormancy and empty-state branches (priority Dormancy > Fallow > Outcome > normal sheet); header 'fallow today' button hidden when dormant/fallow/empty"
    - "app/src/app/api/sheet/fallow/route.test.ts — 8 filled route assertions from Wave 0 stub (mark, idempotency, same-day unmark, post-midnight FALLOW_FROZEN, 401, mark/unmark audit logs, preserve-checkoffs invariant)"
    - "app/src/hooks/useToday.fallow.test.ts — 11 filled assertions (6 pure derivation + 4 FallowCard render + 1 REGEN-01 × REGEN-05 confidence-clock invariant test)"
    - "app/src/app/api/sheet/check/route.fallow.test.ts — 3 filled assertions (409 on fallow day with no sheet_entries update, normal 200 path, 401 short-circuit)"

key-decisions:
  - "Schema-less fallow state: fallowDays lives in the existing huma_contexts JSONB column (no migration), matching Plan 02-02's dormant field pattern. Operator-state stays unified in huma_context — one source of truth for all rest signals (dormant + fallowDays + future hardSeason)."
  - "Same-day-only unmark (post-midnight freeze): past fallow marks are immutable. If the operator declared Thursday fallow, that declaration stays on Thursday even after Friday dawns. Matches the immutable-audit-record principle Plan 02-05 applied to outcome_checks. The server returns 409 FALLOW_FROZEN; the client-side unmark link remains visible for today only (UI enforces via isFallow → FallowCard branch showing unmark affordance; server enforces via isFrozenAfterMidnight)."
  - "Guard-before-side-effect in /api/sheet/check: the fallow check runs between auth and sheet_entries.update. The 409 short-circuits the DB write, so a checkoff attempted on a fallow day never writes behavior_log or touches checked_at. Truth-respecting design: declared Fallow means the day doesn't count — the server refuses to record anything that would suggest otherwise. Extra ~15-40ms Supabase roundtrip per check-off is acceptable at current scale; RPC optimization flagged if it becomes hot."
  - "Mid-day fallow preserves existing checkoffs as historical truth: the fallow toggle route ONLY touches contexts.huma_context. Prior sheet_entries for today remain visible but are now read-only (checkoff route guard rejects new writes). Test asserts this invariant directly via tableCalls tracking — the route never calls .from('sheet_entries') or .from('behavior_log')."
  - "Priority-chain on /today (Dormancy > Fallow > Outcome > normal sheet): Dormancy wins over Fallow because dormancy is multi-day (operator is on rest); Fallow wins over Outcome because fallow is today's declared state (outcome check should wait until tomorrow). The chain is encoded by render-order in today/page.tsx — each branch is a simple conditional, no central arbiter. Extends cleanly to future rest states (Hard Season, Recovery) by adding new branches."
  - "Confidence clock ticks on fallow days (calendar-day formula from REGEN-01): capital-computation.ts uses min(1, daysSinceFirstBehavior/14) — calendar days, NOT active days. Fallow days still count toward the 14-day confidence build-up. This is philosophically load-bearing: rest is the work, so rest preserves (doesn't reset) the learning signal. No special-case logic added; an explicit invariant test in useToday.fallow.test.ts pins this against future refactors."
  - "Plan-local error codes (FALLOW_FROZEN, FALLOW_DAY) via ad-hoc Response.json: the Phase 1 apiError helper's code union is closed. Adding plan-scope codes to that union would expand the app-wide error contract beyond REGEN-05 scope. Both codes are tested against the raw response body — no loss of observability or test coverage."
  - "Fallow header button hidden during Dormancy / Fallow / empty state: showing 'fallow today' while already dormant or fallow would be confusing (operator is already at rest) and showing it on the empty state would be nonsensical (nothing to mark fallow from). Button is visible only in the active sheet state."

patterns-established:
  - "Huma-context-as-rest-state: Plan 02-02 established the pattern (dormant:{active,since}). Plan 02-04 extends it with fallowDays:string[]. Phase 7 DEPTH-04 Hard Season will slot a third variant. No new tables — the huma_contexts JSONB column is the canonical home for all operator-state rest signals."
  - "Pure-helper lib + route composer split: lib/fallow.ts has zero external state (no Supabase, no fetches); route.ts composes the helpers with auth + DB. Tests cover the math in isolation; integration tests cover the DB path. Same split Plan 02-05 established for outcome-check + outcome-strength."
  - "REGEN-01 × REGEN-05 invariant test: when two regen requirements interact (confidence clock + fallow days), an explicit test pins the intent so a future refactor can't silently regress. The calendar-day formula already handles the case; the test documents WHY it's correct and guards against a well-meaning special-case insertion."
  - "Voice Bible §02 spec-lock on rest-state copy: 'Fallow. Compost day.' ships verbatim from spec, grep-verified before merge. 'unmark for today' and 'fallow today' are inline affordances — lowercase, no urgency verbs, no 'quick reset' framing. Pattern matches Plan 02-02's DormantCard ('Nothing today. Rest is the work.')."

requirements-completed:
  - REGEN-05

# Metrics
duration: 9min
completed: 2026-04-24
---

# Phase 2 Plan 04: Fallow Day Summary

**REGEN-05 shipped: HumaContext.fallowDays additive field + POST /api/sheet/fallow endpoint with same-day-only unmark + /api/sheet/check guard rejecting checkoffs on fallow days + /today FallowCard branch + header 'fallow today' button + useToday hook surface; operators now have a one-tap "do-nothing sheet" that preserves existing work, refuses new writes, and keeps the confidence clock ticking through the rest.**

## Performance

- **Duration:** ~9 min wall-clock
- **Started:** 2026-04-24T10:22:52Z
- **Completed:** 2026-04-24T10:31:53Z
- **Tasks:** 2 of 2 (all complete, committed atomically)
- **Files created:** 3 (lib/fallow.ts, /api/sheet/fallow/route.ts, components/today/FallowCard.tsx)
- **Files modified:** 8 (context.ts, schemas/index.ts, check/route.ts, useToday.ts, today/page.tsx, 3 filled test files)

## Accomplishments

- **HumaContext.fallowDays additive field landed:** optional `string[]` (ISO YYYY-MM-DD entries) on the existing `huma_context` JSONB column — no migration required, persists via the existing contextSync flow. Matches Plan 02-02's dormant-field pattern for operator-state.
- **POST /api/sheet/fallow endpoint shipped:** symmetric `{ mark: boolean, date: YYYY-MM-DD }` body; idempotent mark/unmark; same-day-only unmark (post-midnight attempts return 409 FALLOW_FROZEN). Uses Phase 1 conventions: parseBody + Zod + withObservability + requireUser (anon-accepting). Emits supplementary audit log with `action:'mark_fallow'|'unmark_fallow'` + date so Vercel stdout captures each toggle.
- **/api/sheet/check fallow guard prepended:** between auth and `sheet_entries.update`, the route reads `huma_context.fallowDays` and returns 409 + `code:'FALLOW_DAY'` when today matches. The 409 short-circuits the DB write; no sheet_entries, no behavior_log, no checked_at. Three test cases lock the behavior (409 on fallow, 200 when not fallow, 401 short-circuit skips fallow check).
- **useToday.isFallow surface:** `isFallow: boolean` + `fallowMarkToday()` + `fallowUnmarkToday()` handlers. Derivation delegates to `lib/fallow.isFallow` for defensive missing-field handling (null humaContext, undefined fallowDays, non-array values). Both handlers invalidate `queryKeys.humaContext(userId)` on success so /today re-renders with the new flag.
- **FallowCard component:** renders `"Fallow. Compost day."` (spec-locked, Voice Bible §02 verbatim) + an `"unmark for today"` same-day affordance. Layout mirrors DormantCard (min-h-[50dvh], center-aligned, earth-650 serif) for visual rhythm between the two rest states.
- **/today priority-chain wired in:** `isDormant ? DormantCard : isFallow ? FallowCard : aspirations.length === 0 ? empty-state : sheet+OutcomeCheckCard`. Priority: Dormancy > Fallow > Outcome > normal sheet, encoded by render-order.
- **Header Fallow button landed:** `"fallow today"` in the top bar between "Day N" and the theme toggle. Hidden when dormant, fallow, or empty — showing it in those states would be semantically wrong.
- **REGEN-01 × REGEN-05 confidence-clock invariant pinned:** explicit test asserts `computeCapitalScores` returns `confidence: 1` at `daysSinceFirstBehavior=14` regardless of active-day count. The calendar-day formula (`min(1, daysSinceFirstBehavior/14)`) already handles the case; the test guards against a future refactor silently adding a fallow-day special case that would reset the shader.
- **Test surface filled from Wave 0 stubs:** 8 route-fallow + 3 check-route-fallow + 11 hook + 1 confidence-invariant = 23 new assertions, all green. Full Vitest suite (60 files, 819 tests) green with zero regressions.

## Task Commits

Per-task atomic commits:

1. **Task 1: HumaContext.fallowDays + lib/fallow + /api/sheet/fallow endpoint + fill route test** — `1e46bb1` (feat)
   - Type + pure helpers + Zod schema + POST endpoint + 8 route-test assertions
   - Committed after all tests green and before starting Task 2 (learned from Wave 2's ~4h socket-crash lesson)
2. **Task 2: sheet/check fallow guard + useToday branch + FallowCard + header button + fill remaining tests** — `a748718` (feat)
   - Check-route guard (3 assertions) + useToday hook surface (6 pure derivation + 4 card render + 1 confidence-clock invariant = 11 assertions) + FallowCard component + today/page.tsx priority-chain wiring + header button
   - Full Vitest suite (60 files, 819 tests) green before commit

## Files Created/Modified

**3 created + 8 modified:**

| Scope | Path | Change |
|-------|------|--------|
| Pure lib | `app/src/lib/fallow.ts` | CREATE — isFallow + addFallowDay + removeFallowDay + isFrozenAfterMidnight pure helpers with defensive missing-field handling |
| Route | `app/src/app/api/sheet/fallow/route.ts` | CREATE — POST endpoint with parseBody + Zod + withObservability + requireUser; same-day-only unmark via isFrozenAfterMidnight; ad-hoc FALLOW_FROZEN error code; structured audit log |
| Component | `app/src/components/today/FallowCard.tsx` | CREATE — 'Fallow. Compost day.' spec-locked copy + same-day unmark affordance; DormantCard layout parity |
| Type surface | `app/src/types/context.ts` | HumaContext.fallowDays?: string[] optional field with REGEN-05 comment |
| Schemas | `app/src/lib/schemas/index.ts` | sheetFallowSchema (z.object({ mark: boolean, date: YYYY-MM-DD regex })) |
| Route | `app/src/app/api/sheet/check/route.ts` | isFallow(humaContext, today) guard prepended between auth and sheet_entries.update; 409 + code:'FALLOW_DAY' short-circuit |
| Hook | `app/src/hooks/useToday.ts` | isFallow derivation + fallowMarkToday/fallowUnmarkToday handlers; queryKeys.humaContext invalidation |
| Page | `app/src/app/today/page.tsx` | FallowCard conditional render between Dormancy and empty-state (priority Dormancy > Fallow > Outcome > normal sheet); header 'fallow today' button hidden when dormant/fallow/empty |
| Test | `app/src/app/api/sheet/fallow/route.test.ts` | 8 filled assertions from Wave 0 stub (mark, idempotency, same-day unmark, post-midnight FALLOW_FROZEN, 401, mark/unmark audit logs, preserve-checkoffs invariant) |
| Test | `app/src/hooks/useToday.fallow.test.ts` | 11 filled assertions (6 pure derivation + 4 FallowCard render + 1 REGEN-01 × REGEN-05 confidence-clock invariant) |
| Test | `app/src/app/api/sheet/check/route.fallow.test.ts` | 3 filled assertions (409 + FALLOW_DAY + no sheet_entries update on fallow day, 200 when not fallow, 401 short-circuit) |

## Decisions Made

- **Schema-less state (no migration):** fallowDays lives in the existing huma_contexts JSONB column. No new table, no manual Supabase dashboard migration, no rollout coordination. Matches Plan 02-02's dormant field pattern. Operator-state stays unified in huma_context — one source of truth for all rest signals (dormant + fallowDays + future hardSeason).
- **Same-day-only unmark:** past fallow marks are immutable. Server returns 409 FALLOW_FROZEN via `isFrozenAfterMidnight(date, today)`. UI shows unmark affordance only on FallowCard (which only renders when today is fallow). Matches Plan 02-05's append-only outcome_checks principle — operator 'changing their mind' about a past rest day is not a supported operation.
- **Guard-before-side-effect in /api/sheet/check:** the fallow check runs BEFORE sheet_entries.update. The 409 short-circuits the DB write; no behavior_log, no checked_at. Truth-respecting design: declared Fallow means the day doesn't count, so the server refuses to record anything that would suggest otherwise. Extra context fetch (~15-40ms) per check-off is acceptable at current scale.
- **Mid-day fallow preserves existing checkoffs:** the fallow toggle route ONLY writes to contexts.huma_context. Prior sheet_entries for today remain visible but read-only (check route guard rejects new writes). Test asserts via tableCalls tracking — route never calls .from('sheet_entries') or .from('behavior_log').
- **Priority-chain Dormancy > Fallow > Outcome > normal sheet:** encoded by render-order in today/page.tsx. Dormancy is multi-day (operator is on rest); Fallow is today's declared state; Outcome is a prompt that can wait until tomorrow if the operator has already declared today compost. Each branch is a simple conditional — no central arbiter, extends cleanly to future rest states.
- **Confidence clock ticks on fallow days (calendar-day formula):** capital-computation.ts uses `min(1, daysSinceFirstBehavior/14)` where daysSinceFirstBehavior is calendar days. Fallow days still count toward the 14-day confidence build-up. Philosophically load-bearing: rest is the work, so rest preserves (doesn't reset) the learning signal. No special-case code added; an explicit invariant test pins this against refactor drift.
- **Plan-local error codes (FALLOW_FROZEN, FALLOW_DAY) via ad-hoc Response.json:** the Phase 1 apiError helper's code union is closed. Adding plan-scope codes to that union would expand the app-wide error contract beyond REGEN-05 scope. Both codes are tested against the raw response body — no loss of observability or test coverage. Minor deviation from Plan Step 1 which used `apiError` — documented below.
- **Header Fallow button hidden during Dormancy/Fallow/empty state:** `!t.loading && !t.isDormant && !t.isFallow && t.aspirations.length > 0`. Showing "fallow today" while already at rest would be confusing; showing it on the empty state (no aspirations yet) would be nonsensical.

## Patterns Established

- **Huma-context-as-rest-state (extended):** Plan 02-02 pioneered `dormant:{active,since}`. Plan 02-04 extends with `fallowDays:string[]`. Phase 7 DEPTH-04 Hard Season will add a third variant. huma_contexts JSONB column is now the canonical home for all operator-state rest signals — no new tables needed for the next N rest variants.
- **Pure-helper + route-composer split:** `lib/fallow.ts` has zero external state (no Supabase, no fetches); `route.ts` composes the helpers with auth + DB. Tests cover the math in isolation; integration tests cover the DB path. Same split Plan 02-05 established for outcome-check/outcome-strength.
- **Invariant-test for cross-requirement interactions:** when two regen requirements interact (REGEN-01 confidence + REGEN-05 fallow), an explicit test pins the intent. The calendar-day formula already handles the case; the test documents WHY it's correct and guards against a well-meaning special-case insertion.
- **Voice Bible §02 spec-lock on rest-state copy:** 'Fallow. Compost day.' ships verbatim. 'fallow today' + 'unmark for today' are lowercase inline affordances — no urgency verbs, no 'quick reset' framing. Pattern matches Plan 02-02's 'Nothing today. Rest is the work.' and 'when you're ready, say anything'.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Plan used `apiError()` helper for FALLOW_FROZEN; Phase 1 code union doesn't include plan-scope codes**
- **Found during:** Task 1 (after writing the route per plan Step 4 Code)
- **Issue:** `api-error.ts` defines a closed union `code: "RATE_LIMITED" | "BAD_REQUEST" | "UNAUTHORIZED" | "SERVICE_UNAVAILABLE" | "INTERNAL_ERROR" | "PAYLOAD_TOO_LARGE"`. The plan's Step 4 code used `apiError("Fallow marks are frozen...", { code: "FALLOW_FROZEN", status: 409 })` which doesn't type-check against the union.
- **Fix:** Added a small local helper `fallowErrorResponse(message, code, status)` that wraps `Response.json({ error, code }, { status })` with a typed signature `code: "FALLOW_FROZEN" | "FALLOW_DAY"`. Kept `apiError` for standard Phase 1 codes (BAD_REQUEST on missing context, INTERNAL_ERROR on save failure). Documented the decision in a code comment.
- **Why not expand the Phase 1 union:** adding plan-scope codes to the app-wide error contract would be scope creep. The test asserts `body.code === "FALLOW_FROZEN"` on raw JSON — doesn't care whether `apiError` or `Response.json` produced it.
- **Files modified:** `app/src/app/api/sheet/fallow/route.ts`
- **Verification:** `grep -n "FALLOW_FROZEN" app/src/app/api/sheet/fallow/route.ts` → 5 hits (helper signature + helper call + docstring). Test `body.code === "FALLOW_FROZEN"` passes.
- **Committed in:** `1e46bb1` (Task 1)

**2. [Rule 3 - Blocking] Initial route test had strict-TS null→T cast errors**
- **Found during:** `npx tsc --noEmit` after Task 1 tests passed at runtime
- **Issue:** 3 occurrences of `capturedUpdate as { huma_context: ... }` failed TS strict mode with "Conversion of type 'null' to type '{huma_context}' may be a mistake" because the variable's declared type was `Record<string, unknown> | null`.
- **Fix:** Updated to `capturedUpdate as unknown as { huma_context: ... }` — standard TS escape hatch, runtime behavior unchanged. Rolled the fix into the Task 2 commit since it was a trivial 3-line cast fix to a Task 1 file.
- **Files modified:** `app/src/app/api/sheet/fallow/route.test.ts`
- **Verification:** `npx tsc --noEmit | grep fallow` returns no errors; all 8 route tests still green.
- **Committed in:** `a748718` (Task 2, folded in)

---

**Total deviations:** 2 auto-fixed Rule 3 issues (both blocking TS/typing issues resolved inline). Zero plan-scope deviations — every plan `must_haves.truths` line is landed verbatim.

**Impact on plan:** None. Both fixes protect the plan's own acceptance criteria (routes must compile, tests must type-check). The ad-hoc error helper is a local adaptation to Phase 1's closed code union; the test cast fix is a routine strict-TS workaround. Neither expands scope or alters the delivered behavior.

## Issues Encountered

- **Phase 1 apiError code union is closed:** adding plan-scope codes requires either expanding that union (scope creep) or using an ad-hoc Response.json wrapper (what we did). Flagged for a future refactor retrospective: a plan-scoped error-code registry that each plan can extend without touching the central union might be worth building if more plans need this pattern.
- **No new flakiness:** the pre-existing Windows+Vitest parallel-import race (documented in deferred-items.md) did not trigger on this plan's commit windows. Full suite ran 60/60 files, 819/819 tests green in 25s. If the race manifests in a later suite run, it is orthogonal to REGEN-05.
- **Plan's Step 5 action code was slightly aspirational:** the plan's `sheet header` button placement targeted "`<TabShell>` + section headings" around line 236, but the actual layout uses a compact top bar with H U M A brand, Day N, and ThemeToggleIcon. The button was placed in that top bar with `font-sans text-sage-400 text-[11px]` to match the existing Day N counter. Non-blocking — placement is explicitly Claude's Discretion per the plan's CONTEXT.md.

## User Setup Required

None — no migration (schema-less fallow state), no environment variables, no feature flags. The fallow toggle is a self-contained operator-state mechanism persisted via the existing contextSync flow.

## Next Phase Readiness

- **Phase 2 closes with this plan:** REGEN-01 (confidence math), REGEN-02 (dormancy), REGEN-03 (outcome check), REGEN-04 (capital receipt), REGEN-05 (fallow day) — 5/5 requirements shipped. Plus Plan 02-00 fixtures. 6/6 plans complete.
- **Phase 7 DEPTH-04 (Hard Season) pre-templated:** the huma-context-as-rest-state pattern now has two reference implementations (dormant + fallowDays). Hard Season will slot in as a third variant (`hardSeason?:{active,since,kind}` or similar) with zero new infrastructure — same toggle-endpoint + cron-gate + /today branch + useToday hook pattern.
- **Phase 3 ONBOARD-05 hook:** if onboarding copy ever introduces "fallow" terminology explicitly, the grep sweep will find the canonical spec-locked string here in FallowCard.tsx + useToday.fallow.test.ts as the reference.
- **No downstream dependencies blocked:** /api/sheet/check guard is backwards-compatible (operators with no fallowDays array fall through to the normal path). Existing behavior_log and sheet_entries consumers are unaffected.
- **Voice Bible §02 audit passed:** "Fallow. Compost day." / "unmark for today" / "fallow today" / "Mark today fallow" (aria-label, not user-visible) / "Unmark fallow for today" (aria-label, not user-visible) — all grep-verified against §02 banned-phrase list (no "journey", "best self", "on track", "supercharge").

---
*Phase: 02-regenerative-math-honesty*
*Completed: 2026-04-24*

## Self-Check: PASSED

**File existence verification** (against plan artifacts list):

| Artifact | Status |
|----------|--------|
| `app/src/types/context.ts` (HumaContext.fallowDays) | FOUND |
| `app/src/lib/schemas/index.ts` (sheetFallowSchema) | FOUND |
| `app/src/lib/fallow.ts` | FOUND (82 lines, above 40 min_lines threshold) |
| `app/src/app/api/sheet/fallow/route.ts` | FOUND (142 lines, above 70 min_lines threshold) |
| `app/src/app/api/sheet/check/route.ts` (fallow guard) | FOUND |
| `app/src/hooks/useToday.ts` (isFallow + handlers) | FOUND |
| `app/src/app/today/page.tsx` (FallowCard branch + header button) | FOUND |
| `app/src/components/today/FallowCard.tsx` | FOUND (42 lines, above 30 min_lines threshold) |
| `app/src/app/api/sheet/fallow/route.test.ts` | FOUND (387 lines filled, above 80 min_lines threshold) |
| `app/src/hooks/useToday.fallow.test.ts` | FOUND (140 lines filled, above 40 min_lines threshold) |
| `app/src/app/api/sheet/check/route.fallow.test.ts` | FOUND (168 lines filled, above 30 min_lines threshold) |

**Commits verified in `git log --oneline`:**
- `1e46bb1` FOUND — Task 1 (HumaContext.fallowDays + lib/fallow + /api/sheet/fallow endpoint)
- `a748718` FOUND — Task 2 (sheet/check guard + useToday branch + FallowCard + header button)

**Test suites verified:**
- `cd app && npm test -- src/app/api/sheet/fallow/route.test.ts` → 8/8 passed
- `cd app && npm test -- src/app/api/sheet/check/route.fallow.test.ts` → 3/3 passed
- `cd app && npm test -- src/hooks/useToday.fallow.test.ts` → 11/11 passed (6 pure derivation + 4 FallowCard render + 1 REGEN-01 × REGEN-05 confidence-clock invariant)
- `cd app && npm test` → 60 files, 819 tests passed, zero regressions

**Grep verification commands the user can run:**

```bash
# Fallow type surface
grep -n "fallowDays" app/src/types/context.ts                       # expect 1

# Error codes at their enforcement sites
grep -n "FALLOW_DAY"  app/src/app/api/sheet/check/route.ts         # expect 1
grep -n "FALLOW_FROZEN" app/src/app/api/sheet/fallow/route.ts      # expect 5 (helper + docstring + emission)

# Spec-locked copy
grep -rn "Fallow. Compost day." app/src                            # expect 1 rendered (FallowCard) + a few comment references

# Pure-helper usage
grep -rn "isFallow" app/src                                        # expect >=4 files (lib/fallow, useToday, check route, page.tsx, OutcomeCheckCard doc, test)

# Voice Bible §02 sanity (should return zero hits in user-visible copy)
grep -rn "journey\|best self\|on track\|supercharge" app/src/components/today/FallowCard.tsx app/src/app/today/page.tsx
```
