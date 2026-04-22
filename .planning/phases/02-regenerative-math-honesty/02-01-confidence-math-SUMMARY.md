---
phase: 02-regenerative-math-honesty
plan: 01
subsystem: capital-math / radar-rendering

tags: [regen-01, capital-math, radar, confidence-shader, tdd, wave-1]

# Dependency graph
requires:
  - phase: 02-regenerative-math-honesty
    plan: 00
    provides: "Wave 0 .skip stubs for capital-computation.test.ts, capital-score-confidence.test.ts, CapitalRadar.confidence.test.tsx"
  - phase: 01-security-cost-control
    provides: "Vitest + Next/React toolchain baseline"
provides:
  - "CapitalScore.confidence field (0–1 calendar-day shader)"
  - "computeCapitalScores(daysSinceFirstBehavior) overload — engagement multiplier removed"
  - "CapitalRadar shape opacity + dashed-axis rendering for zero-contribution capitals"
  - "Widened vitest.config.ts include glob to .{ts,tsx} (unblocks all .tsx component tests in Phase 2+)"
affects: [02-02, 02-03, 02-04, 02-05, 07-*]  # Plans 02-03 (receipt) and 02-04 (tap-to-open) read the confidence field + render on the same radar surface

# Tech tracking
tech-stack:
  added: []  # no new deps — renderToStaticMarkup ships with react-dom (already in deps)
  patterns:
    - "SSR-based React component testing via renderToStaticMarkup — no jsdom dep, no @testing-library/react dep"
    - "Confidence-as-shader: math emits a 0–1 field; visual layer decides how to render it (opacity, dashed, hollow). Keeps the math pure + deterministic; renderer owns the perceptual translation."
    - "Calendar-day formula: daysSinceFirstBehavior counts wall-clock days, NOT active days. Rest doesn't decrement the shader."

key-files:
  created:
    - "(none — test scaffolds were pre-created by Plan 02-00; this plan filled them)"
  modified:
    - "app/src/engine/canvas-types.ts"
    - "app/src/lib/capital-computation.ts"
    - "app/src/lib/capital-computation.test.ts"
    - "app/src/__tests__/capital-score-confidence.test.ts"
    - "app/src/components/canvas/CapitalRadar.tsx"
    - "app/src/components/canvas/CapitalRadar.confidence.test.tsx"
    - "app/vitest.config.ts — include glob .{ts,tsx}"
    - "app/src/data/sample-maps/sample-map.ts — confidence: 1 on 8 literals"
    - "app/src/data/sample-maps/sample-map-maya.ts — confidence: 1 on 8 literals"
    - "app/src/lib/context-encoding.test.ts — confidence: 1 on helper factory"
    - "app/src/components/shared/ShareCard.tsx — confidence: 0 on fallback"
    - ".planning/phases/02-regenerative-math-honesty/deferred-items.md (created)"

key-decisions:
  - "Opacity bounds: 0.08 floor / 0.4 ceiling. Floor preserves visible anchor shape for brand-new operators (even at avgConfidence=0); ceiling preserves guide-ring visibility when confidence=1."
  - "Calendar-day formula: daysSinceFirstBehavior uses wall-clock delta, NOT active-day count. Fallow weeks still advance confidence — rest does not un-teach the system the operator's shape."
  - "Totally-optional 4th parameter: computeCapitalScores(activity, activeDays, windowDays, daysSinceFirstBehavior = 0). All existing 3-arg callers compile without change; confidence: 0 is the safe default (renders dashed/hollow)."
  - "Dashed-axis trigger: note === 'No activity yet' || confidence === 0. Both conditions work because the zero-contribution branch in computeCapitalScores emits both simultaneously."
  - "Vitest renderToStaticMarkup over @testing-library/react: SSR output is plain regex-able HTML, no jsdom dep, useEffect doesn't fire so we avoid the window.matchMedia problem. React 19 ships react-dom, so renderToStaticMarkup is already available."
  - "Widened vitest include glob in this plan (not deferred): Task 2's CapitalRadar.confidence.test.tsx needs .tsx matching; Wave 0 SUMMARY.md flagged this as a Wave 1 follow-up. Rule 3 (Blocking) fix applied."
  - "Existing CapitalScore literals (sample-map, ShareCard fallback, context-encoding.test factory) updated to include confidence — single-pass sweep; no remaining construction sites reject the new field."

requirements-completed:
  - REGEN-01

# Metrics
duration: "~2h 36min (wall-clock, includes test-suite diagnostic time)"
completed: 2026-04-22
---

# Phase 2 Plan 01: Confidence Math Summary

**Removed the engagementFactor penalty from capital-computation.ts and replaced it with a CapitalScore.confidence shader (0–1, calendar days), wired into CapitalRadar as shape opacity + dashed-axis treatment for zero-contribution capitals.**

## Performance

- **Duration:** ~2h 36min wall-clock (~30 min of which was diagnosing and triaging pre-existing Vitest flakiness on Windows from Phase 1 scope)
- **Started:** 2026-04-22T07:25:28Z
- **Completed:** 2026-04-22T10:02:22Z
- **Tasks:** 2 of 2
- **Files created:** 1 (deferred-items.md — ops log, not code)
- **Files modified:** 11 (6 test/production + 1 infra config + 3 existing-literal sweeps + 1 fallback-object fix)

## Accomplishments

- **Math change landed cleanly:** line-90 `adjusted = avgRate * engagementFactor` is gone; threshold mapping (0.15/0.35/0.55/0.75 buckets) consumes avgRate directly. Fallow weeks no longer punish score.
- **Confidence emitted everywhere the math flows:** every code path returning a CapitalScore now includes `confidence: number`, including the zero-contribution branch (which returns `{ score: 1, confidence: 0, note: 'No activity yet' }`).
- **Radar visual wiring complete:** shape opacity now tracks the operator's accumulated confidence (0.08 floor → 0.4 ceiling, linearly scaled on `avgConfidence * 0.4`); zero-contribution axes render dashed with hollow vertex dots, so the operator sees at a glance which axes are inferred versus informed-by-behavior.
- **Backwards compatibility preserved:** `computeCapitalScores(activity, activeDays, windowDays)` still works (new 4th param defaults to 0); `canvas-regenerate/route.ts` and any other existing 3-arg callers require no change. Every existing CapitalScore literal (sample maps, test factories, component fallbacks) updated in a single sweep.
- **Infrastructure unblocked for the rest of Phase 2:** `app/vitest.config.ts` include glob widened from `src/**/*.test.ts` to `src/**/*.test.{ts,tsx}`. This was flagged by Wave 0's SUMMARY.md as a required Wave 1 follow-up; landed here so Plans 02-03 and 02-04 (which also author .tsx component tests) don't each re-plumb the same fix.
- **Analysis-paralysis guard never triggered:** executor moved from plan-parse to Task 1 RED in under 10 minutes, consistent with a ~15 minute code-change envelope; bulk of wall-clock was full-suite runs + one investigation of a flaky pre-existing Phase 1 race.

## Task Commits

Each task committed atomically with per-task scope:

1. **Task 1: Extend CapitalScore type + update capital-computation math + fill unit tests** — `71c4c86` (feat)
   - Touches: canvas-types.ts, capital-computation.ts, capital-computation.test.ts, capital-score-confidence.test.ts, sample-map.ts, sample-map-maya.ts, context-encoding.test.ts, ShareCard.tsx, vitest.config.ts, deferred-items.md
   - 12 assertions green (8 math + 4 type/consumer parity)
2. **Task 2: Wire confidence into CapitalRadar — shape opacity + dashed axis** — `72bd9f1` (feat)
   - Touches: CapitalRadar.tsx, CapitalRadar.confidence.test.tsx
   - 4 assertions green (fillOpacity ceiling, fillOpacity floor, dashed on zero-contrib, solid on all-active)

## Files Created/Modified

**0 created (code) + 1 created (ops log) + 11 modified:**

| Scope | Path | Change |
|-------|------|--------|
| Core type | `app/src/engine/canvas-types.ts` | `CapitalScore.confidence: number` added (line 15) |
| Core math | `app/src/lib/capital-computation.ts` | 4th param `daysSinceFirstBehavior` added; `engagementFactor` multiplier deleted; confidence emitted on every return; zero-contribution branch emits `{ score:1, note:"No activity yet", confidence:0 }` |
| Unit tests | `app/src/lib/capital-computation.test.ts` | 6 it.skip stubs → 8 real tests (added a Fallow-week parity test + a backwards-compat test beyond the original 6) |
| Type tests | `app/src/__tests__/capital-score-confidence.test.ts` | 3 it.skip stubs → 4 real tests (added the zero-data invariant test) |
| Component | `app/src/components/canvas/CapitalRadar.tsx` | Import useReducedMotion; compute `shapeFillOpacity`; replace fixed `fillOpacity={0.2}`; dashed axes + hollow vertices when zero-contribution; fallback object updated to new invariant |
| Component tests | `app/src/components/canvas/CapitalRadar.confidence.test.tsx` | 4 it.skip stubs → 4 real tests (SSR via renderToStaticMarkup) |
| Infra | `app/vitest.config.ts` | `include: ["src/**/*.test.{ts,tsx}"]` |
| Existing literals (sweep) | `app/src/data/sample-maps/sample-map.ts` | 8 CapitalScore literals — added `confidence: 1` |
| Existing literals (sweep) | `app/src/data/sample-maps/sample-map-maya.ts` | 8 CapitalScore literals — added `confidence: 1` |
| Existing literals (sweep) | `app/src/lib/context-encoding.test.ts` | `makeCapitalScores()` helper — 8 literals gained `confidence: 1` |
| Existing fallback (sweep) | `app/src/components/shared/ShareCard.tsx` | Default `.find(...)` fallback gained `confidence: 0` |
| Ops log | `.planning/phases/02-regenerative-math-honesty/deferred-items.md` | Created; documents pre-existing Windows+Vitest parallel-import races out of 02-01 scope |

## Decisions Made

- **Calendar-day formula vs active-day formula:** Plan specified `daysSinceFirstBehavior / 14` using calendar days. Verified this by test: an operator with 7 active days across 14 calendar days (i.e., took a Fallow week) still gets `confidence: 1`. The philosophical intent — rest does not reset the system's knowledge of the operator's shape — is encoded in the test itself (`capital-computation.test.ts` "Fallow week does NOT decrement confidence").
- **0.08 floor / 0.4 ceiling for shape opacity:** Plan suggested these bounds; kept as-is. Floor preserves a visible anchor shape so a brand-new account doesn't look completely empty; ceiling preserves the visibility of the guide rings behind the shape even at `confidence: 1`. The old fixed `fillOpacity={0.2}` sits at `avgConfidence=0.5` on the new scale (`0.5 * 0.4 = 0.2`) — visual parity for ~7-day operators.
- **Dashed-axis trigger is belt-and-suspenders:** `note === "No activity yet" || (cap.confidence ?? 0) === 0`. Either condition suffices in practice (zero-contribution branch emits both), but defending against future callers that hand-build CapitalScore literals without going through `computeCapitalScores`.
- **Test rendering via `renderToStaticMarkup`:** Picked this over `@testing-library/react` + jsdom because neither is installed and the assertion we need is "SVG output matches a regex" — which SSR output supports natively. `useEffect` doesn't fire in SSR, so `window.matchMedia` never gets called; the `animated={false}` prop short-circuits the animation state machine. No new dependencies added.
- **Deferred the pre-existing Phase 1 Vitest flakiness:** Three flaky tests (capital-pulse, /api/sheet/auth, /api/sheet/budget) surfaced during my full-suite runs but rotate non-deterministically and pass 100% in isolation — classic Windows+Vitest parallel-dynamic-import race. Logged in `deferred-items.md` with recommended Phase 1.1 fix (`pool: "forks"` + `singleFork: true`). Out of scope for REGEN-01.
- **Swept existing CapitalScore literals rather than making `confidence` optional:** Plan's `must_haves.truths` is explicit — `confidence: number` (not `number | undefined`). Making it optional would let future callers silently drop it, defeating the purpose. One-time sweep of 4 call sites was cheap.
- **Broadened vitest.config.ts include glob in this plan:** Wave 0's SUMMARY.md flagged this as "Wave 1 must do it"; since Plan 02-01 is the first Wave 1 plan touching `.tsx` tests, the fix landed here (as Rule 3 — blocking) rather than being handed off to whichever plan hit it first.
- **Did NOT touch parallel-executor territory:** 02-02 (dormancy) and 02-05 (outcome-check) were active at the same time; 5 files from their scope (useToday.ts, capital-pulse.ts, capital-pulse.test.ts, types/context.ts, types/v2.ts, ConnectionThreads.tsx) showed up in `git status` but were explicitly excluded from my commits. Boundary preserved per orchestrator guidance.

## Patterns Established

- **Confidence-as-shader:** Math layer emits a 0–1 field; presentation layer (the radar) decides how to express it perceptually (opacity, dash pattern, hollow vs filled). This pattern will extend to Plan 02-03 (receipt label derives from same field) and Plan 02-04 (tap-to-open uses same underlying cap data).
- **SSR-friendly component tests:** `renderToStaticMarkup` + `React.createElement(Component, {...})` + regex assertions is enough for components whose rendered output is static-on-first-render when animated is disabled. No jsdom, no testing-library dependency added.
- **Single-sweep literal update:** When adding a required field to a public type, grep + update all literals + test-factory helpers in one commit rather than batching. Keeps diff cognitively cheap; avoids partial-migration hazards.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] Wave 0 flagged vitest.config.ts include glob widening**
- **Found during:** Task 2 RED run (component test file silently excluded due to `.tsx` not matching `src/**/*.test.ts`)
- **Issue:** CapitalRadar.confidence.test.tsx required the Vitest include glob to match `.tsx`; the Wave 0 SUMMARY.md explicitly flagged "Plans 02-01 and 02-04 must broaden the include glob to `src/**/*.test.{ts,tsx}` before their component tests can execute."
- **Fix:** Changed `include: ["src/**/*.test.ts"]` → `include: ["src/**/*.test.{ts,tsx}"]` in `app/vitest.config.ts`
- **Files modified:** `app/vitest.config.ts`
- **Verification:** Component test then executed and passed 4/4
- **Committed in:** `71c4c86` (bundled with Task 1 since Task 2 depends on it)

**2. [Rule 3 — Blocking] Exported DimensionActivity type from capital-computation.ts**
- **Found during:** Task 1 RED run (test file imported `type DimensionActivity` but the interface was unexported)
- **Issue:** Test file needed the type for explicit typing of fixtures. Re-declaring inline would violate DRY; leaving un-typed would lose type safety.
- **Fix:** Changed `interface DimensionActivity` → `export interface DimensionActivity` (surgical Edit at line 30)
- **Files modified:** `app/src/lib/capital-computation.ts`
- **Verification:** Test imports resolved; no change to runtime behavior (pure type export)
- **Committed in:** `71c4c86`

**3. [Rule 1 — Bug] Pre-existing CapitalScore literals without confidence would fail TS compilation**
- **Found during:** Task 1 post-GREEN run of full suite
- **Issue:** Type change to `CapitalScore.confidence: number` made 4 pre-existing literal construction sites ill-typed (sample-map.ts x8, sample-map-maya.ts x8, context-encoding.test.ts helper, ShareCard.tsx fallback)
- **Fix:** Single-pass sweep — added `confidence: 1` to sample-map literals (user-facing sample data, already-mature operator vibes), `confidence: 0` to the ShareCard fallback (unknown-form defensive default)
- **Files modified:** `sample-map.ts`, `sample-map-maya.ts`, `context-encoding.test.ts`, `ShareCard.tsx`
- **Verification:** Full suite passes 753/753 (0 regressions); no TS errors
- **Committed in:** `71c4c86`

### Out-of-Scope Discoveries (NOT auto-fixed)

**4. [Rule out-of-scope — Phase 1 infrastructure flakiness] Pre-existing Vitest parallel-import race on Windows**
- **Found during:** Task 1 full-suite run (3 tests failing); re-run showed different 2 tests failing; all pass in isolation
- **Issue:** `capital-pulse.test.ts`, `route.auth.test.ts`, `route.budget.test.ts`, `v2-chat/route.test.ts` intermittently fail during parallel full-suite runs on Windows. Root cause: Vitest's default parallel workers racing on first-time dynamic imports of Next/Anthropic/Supabase. Each affected file uses `const { POST } = await import("./route")` after `vi.mock(...)` calls; the import timing can exceed the 15s test timeout under parallelism.
- **Why NOT auto-fixed:** Out of REGEN-01 scope. Zero of these files are in my `files_modified` list. The REGEN-02 rename comment (`capital-pulse.test.ts:135` — "renamed from 'dormant' in REGEN-02") predates my work. My REGEN-01 tests (pure math + SSR component) never hit this race.
- **Documented in:** `.planning/phases/02-regenerative-math-honesty/deferred-items.md` with recommended Phase 1.1 fix (`pool: "forks"` + `singleFork: true`)
- **Impact:** None to REGEN-01 deliverable. Raised so next full-suite gate (probably `/gsd:verify-work` at Phase 2 close) doesn't misattribute.

---

**Total deviations:** 3 auto-fixed (all Rule 3 blocking or Rule 1 bug) + 1 out-of-scope flagged.

**Impact on plan:** All three auto-fixes were required to meet the plan's own acceptance criteria. Zero scope creep — the vitest.config.ts fix was a Wave-0-flagged Wave-1 task, the DimensionActivity export is a type-visibility nit, and the existing-literal sweep was necessary because the plan chose `confidence: number` (required) over `number | undefined`.

## Issues Encountered

- **Windows+Vitest parallel-import flakiness:** Documented above; non-blocking; logged in deferred-items.md.
- **Parallel-executor cross-staging:** `git status` showed 5 files staged by a concurrent 02-02/02-05 executor in my index (ConnectionThreads, capital-pulse.test.ts, capital-pulse.ts, types/context.ts, types/v2.ts). Unstaged via `git reset HEAD <files>`; left in worktree for their owners. Flag for post-milestone parallelization retrospective: parallel executors sharing a worktree can accidentally cross-stage. Not harmful in this case (I caught it before commit) but warrants a per-executor branch strategy at higher parallelism.

## User Setup Required

None — no external service configuration, no migrations, no feature flags. The change is self-contained in the app bundle.

## Next Phase Readiness

- **Plan 02-03 (REGEN-04 capital receipt) unblocked:** `CapitalScore.confidence` is a readable 0–1 field. The receipt sheet will display the confidence label ("still learning" / "well-known" / etc.) derived from the same field, using the same calendar-day formula.
- **Plan 02-04 (REGEN-04 tap-to-open) unblocked:** CapitalRadar's axis hit zones (lines 282–323) are unchanged. Plan 02-04 will layer `onClick` handlers on top of the existing `onMouseEnter`/`onMouseMove` wiring; no conflict with this plan's additive opacity/dashed edits.
- **Plan 02-05 (REGEN-03 outcome-check) independent:** No shared surface with 02-01. Outcome-check lives on a new route + modal card.
- **Wave 1 test-surface locked:** 3 REGEN-01 test files filled with 16 assertions total; shape-parity smoke (`phase-2-scaffolds.test.ts`) still green; full suite shows 51 files / 753 tests (up from 45 / 713 at Wave 0 close = +6 files / +40 real tests / −15 skipped — all additive).
- **Vitest.tsx include fix is load-bearing downstream:** Plans 02-04, 02-05, and any future plan writing `.test.tsx` files now executes normally. No further action needed.

---
*Phase: 02-regenerative-math-honesty*
*Completed: 2026-04-22*

## Self-Check: PASSED

All 13 claimed artifacts verified on disk:

| Artifact | Status |
|----------|--------|
| `app/src/engine/canvas-types.ts` | FOUND |
| `app/src/lib/capital-computation.ts` | FOUND |
| `app/src/lib/capital-computation.test.ts` | FOUND |
| `app/src/__tests__/capital-score-confidence.test.ts` | FOUND |
| `app/src/components/canvas/CapitalRadar.tsx` | FOUND |
| `app/src/components/canvas/CapitalRadar.confidence.test.tsx` | FOUND |
| `app/vitest.config.ts` | FOUND |
| `app/src/data/sample-maps/sample-map.ts` | FOUND |
| `app/src/data/sample-maps/sample-map-maya.ts` | FOUND |
| `app/src/lib/context-encoding.test.ts` | FOUND |
| `app/src/components/shared/ShareCard.tsx` | FOUND |
| `.planning/phases/02-regenerative-math-honesty/deferred-items.md` | FOUND |
| `.planning/phases/02-regenerative-math-honesty/02-01-confidence-math-SUMMARY.md` | FOUND (this file) |

Commits verified in `git log --oneline --all`:
- `71c4c86` FOUND — Task 1 (feat: remove engagement penalty + add confidence shader)
- `72bd9f1` FOUND — Task 2 (feat: wire confidence shader into CapitalRadar)

Test assertions verified green in single run:
- `cd app && npm test -- src/lib/capital-computation.test.ts src/__tests__/capital-score-confidence.test.ts src/components/canvas/CapitalRadar.confidence.test.tsx` → 3 files / 16 tests passed.

Grep-level acceptance verified:
- `grep -n "engagementFactor\s*\*\|adjusted\s*=\s*avgRate" app/src/lib/capital-computation.ts` → 0 hits (multiplier gone)
- `grep -n "confidence" app/src/engine/canvas-types.ts` → 1 hit on interface
- `grep -cn "confidence" app/src/lib/capital-computation.ts` → 8 hits
- `grep -n "strokeDasharray" app/src/components/canvas/CapitalRadar.tsx` → 1 hit

Full Vitest suite verified (2026-04-22T09:54 run): 51 files passed / 9 skipped, 753 tests passed / 47 skipped, 0 failures.
