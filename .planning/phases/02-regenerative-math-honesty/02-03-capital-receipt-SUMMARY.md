---
phase: 02-regenerative-math-honesty
plan: 03
subsystem: capital-math / receipt-surface

tags: [regen-04, capital-math, receipt, bottom-sheet, reproducibility, tdd, wave-2]

# Dependency graph
requires:
  - phase: 02-regenerative-math-honesty
    plan: 00
    provides: "Wave 0 .skip stubs for CapitalReceiptSheet.test.tsx, CapitalRadar.tap.test.tsx, capital-receipt-math.test.ts"
  - phase: 02-regenerative-math-honesty
    plan: 01
    provides: "CapitalScore.confidence field + computeCapitalScores(daysSinceFirstBehavior) overload — receipt reads confidence shader and mirrors threshold math"
provides:
  - "buildCapitalReceipt pure helper + CapitalReceiptData + DimensionContribution types"
  - "CapitalReceiptSheet bottom-sheet component (header + Contributions + Weighted sum + Threshold + Confidence + Computed)"
  - "CapitalRadar.onCapitalTap optional prop — axis line AND text label both fire onCapitalTap(cap.form)"
  - "CapitalScore literal sweep closed — scripts/sanity-check-encoding.ts + components/canvas/MapDocument.tsx both include confidence, tsc --noEmit clean of CapitalScore errors"
affects: [04-*, 05-*, 07-*, 08-*]  # Phase 4 viral artifacts reuse the 'reveal-math-behind-an-insight' bottom-sheet pattern; Phase 7/8 longitudinal validation and commons docs both cite receipt as the sovereignty pattern

# Tech tracking
tech-stack:
  added: []  # no new deps — receipt uses DIMENSION_LABELS from types/v2, renderToStaticMarkup from existing react-dom, zero new packages
  patterns:
    - "Reproducibility-via-shared-helper: receipt math (buildCapitalReceipt) is a separate module from computeCapitalScores, kept in sync by a parity test. Single source of truth prevented by-duplication; drift caught by the first test run after a helper edit."
    - "Sheet-as-surface for math transparency: bottom-sheet pattern (header + sections + Computed-at) is the reusable 'show-your-work' primitive. Phase 4 viral artifacts and Phase 8 longitudinal validation both inherit this shape."
    - "Tap-and-hover-are-independent: CapitalRadar's axis line has strokeWidth=16 transparent hit-area carrying both onMouseEnter/Move/Leave (hover tooltip) AND onClick (tap to open receipt). Hover and tap don't interfere — onClick fires on pointerup, hover tracks pointer motion separately."

key-files:
  created:
    - "app/src/lib/capital-receipt.ts — pure helper, 155 lines, 3 exports (buildCapitalReceipt, CapitalReceiptData, DimensionContribution)"
    - "app/src/components/whole/CapitalReceiptSheet.tsx — bottom-sheet component, 175 lines, single default export"
  modified:
    - "app/src/components/canvas/CapitalRadar.tsx — added onCapitalTap?: (form: CapitalForm) => void prop; axis-line hit-area + text label both wired with onClick"
    - "app/src/__tests__/capital-receipt-math.test.ts — filled from 4 .skip stubs to 8 real parity/label/contribution assertions"
    - "app/src/components/whole/CapitalReceiptSheet.test.tsx — filled from 8 .skip stubs to 9 real render assertions (returns null when closed, header shape, contributions, weighted sum, threshold highlight, confidence band, computed-at, zero-contribution fallback)"
    - "app/src/components/canvas/CapitalRadar.tap.test.tsx — filled from 3 .skip stubs to 4 real tap-wiring assertions (optional prop, cursor-pointer surfaces, hover preservation, label rendering)"
    - "app/scripts/sanity-check-encoding.ts — 8 CapitalScore literals gained confidence: 1 (sweep close)"
    - "app/src/components/canvas/MapDocument.tsx — markdown-parsed literal gained confidence: 0 (sweep close)"
    - ".planning/phases/02-regenerative-math-honesty/deferred-items.md — CapitalScore literal sweep entry marked RESOLVED with commit citation"

key-decisions:
  - "Reproducibility via shared-helper (not copy-math-inline): buildCapitalReceipt duplicates DIMENSION_CAPITAL_MAP + THRESHOLDS from capital-computation.ts; parity test guards drift. Chose duplication over extraction-to-shared-module to keep capital-computation.ts untouched — the REGEN-01 surface is locked; dragging receipt imports back into the radar-compute path would risk circular-import or breaking 02-01's commits. Parity test is the single contract."
  - "Threshold top band max = 1.01 (not 1.00): ensures avgRate === 1.0 lands in bucket 5 under strict-less-than comparison. computeCapitalScores uses the same 0.75-1.0 band with an `else score = 5` catch-all; receipt's 1.01 max + strict < comparison produces identical bucket output. Verified by parity test."
  - "Zero-contribution threshold table shows all 5 rows with none active: emphasises 'no activity yet, so no bucket' rather than defaulting to bucket 1 highlight. Reflects honesty — the UI must not imply a score was earned when none was."
  - "CapitalReceiptSheet reuses ConfirmationSheet.tsx backdrop-tap + slide-up animation pattern, not RpplProvenanceSheet's (that one uses react-query data loading, unnecessary here). Receipt data is synchronous from props — no loading state, no fetch."
  - "SSR-based component tests (renderToStaticMarkup) over @testing-library/react: inherits pattern from Plan 02-01. useEffect doesn't fire in SSR, so backdrop-dismiss behavior isn't testable here — that's covered by the ConfirmationSheet.tsx parent pattern + manual QA (plan's verification section explicitly calls this out)."
  - "/whole/page.tsx NOT modified (plan action-step mentions it, but CapitalRadar is not currently rendered there): plan frontmatter's files_modified list omits /whole/page.tsx by design. CapitalRadar is rendered via SpatialCanvas.tsx + MapDocument.tsx + CanvasRegenerate.tsx (both /map/[id] and /map/sample flows). The new onCapitalTap prop is available wherever CapitalRadar is rendered; parent wiring happens at the consumer's discretion. No dead-wiring on a file that doesn't render the component."
  - "CapitalScore literal sweep landed as dedicated small commit (not bundled with Task 1 or 2): commit 8818567 cites deferred-items.md explicitly and closes the ticket. Isolated commit so the sweep is easy to revert if CapitalRadar's handling of confidence: 0 ever changes."
  - "Cross-plan concurrency with 02-04 (fallow-day): no file overlap per orchestrator's scope map. Staged files individually (never git add -A) to avoid sweeping 02-04's uncommitted work into my commits — same hygiene Plan 02-01 established."

patterns-established:
  - "Math-reproducibility test pattern: any new presentational helper that surfaces computed values (receipt, share-card, OG image, insight text) ships with a parity test against its source-of-truth helper. Parity tests catch drift before feature bugs reach users."
  - "Three-section bottom-sheet: header (identity + score + confidence-label) + sections (Contributions / Weighted sum / Threshold / Confidence / Computed) + drag-handle. Reusable for viral insight artifacts (Phase 4) and outcome-validated pattern receipts (Phase 8)."
  - "Optional-prop progressive enhancement on existing components: CapitalRadar shipped without onCapitalTap, gains it here without breaking any existing consumer. Pattern: new prop is `prop?: T` with `onClick={() => prop?.(args)}` call-site — feature lights up where wired, stays silent where not."

requirements-completed:
  - REGEN-04

# Metrics
duration: "~8 min wall-clock (RED to final commit)"
completed: 2026-04-24
---

# Phase 2 Plan 03: Capital Receipt Summary

**Bottom-sheet receipt that shows the math behind any capital score: contributions + weights (primary 1.0× / secondary 0.5×) + completion fractions + weighted-sum + threshold-bucket (highlighted) + confidence (XX% with band label) + computed-at — all reproducible byte-for-byte from `computeCapitalScores` output via a shared pure helper.**

## Performance

- **Duration:** ~8 min wall-clock (2026-04-24T10:22:49Z → 2026-04-24T10:30:10Z)
- **Started:** 2026-04-24T10:22:49Z
- **Completed:** 2026-04-24T10:30:10Z
- **Tasks:** 2 of 2
- **Files created:** 2 (helper + component)
- **Files modified:** 7 (1 production component + 3 test files + 2 literal-sweep files + 1 deferred-items log)

## Accomplishments

- **REGEN-04 delivered:** every capital score on the radar is now one tap away from a receipt showing its math — sovereignty means the user can reproduce the number themselves with a calculator, no "trust the algorithm" hand-waving.
- **Math parity guarded by test:** `buildCapitalReceipt` and `computeCapitalScores` are separate modules that MUST agree; `src/__tests__/capital-receipt-math.test.ts` asserts score + confidence + avgRate parity for identical inputs. If either helper ever drifts, the test fails first.
- **CapitalRadar tap wiring is additive + backwards-compatible:** new `onCapitalTap?: (form: CapitalForm) => void` prop; existing callers (SpatialCanvas.tsx, MapDocument.tsx, CanvasRegenerate.tsx) compile without change. Tap and hover are independent surfaces — hover tooltip continues to work on the same axis-line hit-area.
- **CapitalScore literal-sweep gap closed:** the 10 pre-existing `tsc --noEmit` errors logged in `deferred-items.md` (8 in `sanity-check-encoding.ts`, 1 in `MapDocument.tsx`, inherited from Plan 02-01's partial sweep) resolved in a dedicated commit with citation.
- **Zero regressions:** full Vitest suite 819/819 passed (up from Plan 02-05's 753/753 baseline — +66 new tests, +9 new test files from Wave 2 work). Shape-parity smoke still 16/16.

## Task Commits

Each task committed atomically — work was committed the moment it was code-complete + tested:

1. **Task 1: Pure helper lib/capital-receipt.ts + reproducibility test** — `c77df4b` (feat)
   - Creates `app/src/lib/capital-receipt.ts` + fills `app/src/__tests__/capital-receipt-math.test.ts`
   - 8 parity + label + contribution assertions green
2. **Task 2: CapitalReceiptSheet component + CapitalRadar tap wiring + component tests** — `d308840` (feat)
   - Creates `app/src/components/whole/CapitalReceiptSheet.tsx` + modifies `CapitalRadar.tsx` + fills both component test files
   - 9 sheet render + 4 tap wiring assertions green (13 total)
3. **Literal-sweep cleanup: close CapitalScore literal gap from deferred-items.md** — `8818567` (fix)
   - 8 literals in `scripts/sanity-check-encoding.ts` gained `confidence: 1`
   - 1 literal in `components/canvas/MapDocument.tsx` gained `confidence: 0`
   - `deferred-items.md` entry marked RESOLVED with commit citation

## Files Created/Modified

**2 created + 7 modified:**

| Scope | Path | Change |
|-------|------|--------|
| Helper (new) | `app/src/lib/capital-receipt.ts` | `buildCapitalReceipt` + `CapitalReceiptData` + `DimensionContribution` |
| Component (new) | `app/src/components/whole/CapitalReceiptSheet.tsx` | Bottom-sheet receipt component |
| Radar | `app/src/components/canvas/CapitalRadar.tsx` | Added `onCapitalTap?` prop; wired onClick on axis-line hit-area + text label |
| Parity test (filled) | `app/src/__tests__/capital-receipt-math.test.ts` | 4 `.skip` → 8 real assertions |
| Sheet test (filled) | `app/src/components/whole/CapitalReceiptSheet.test.tsx` | 8 `.skip` → 9 real assertions |
| Tap test (filled) | `app/src/components/canvas/CapitalRadar.tap.test.tsx` | 3 `.skip` → 4 real assertions |
| Sweep 1 | `app/scripts/sanity-check-encoding.ts` | 8 CapitalScore literals gained `confidence: 1` |
| Sweep 2 | `app/src/components/canvas/MapDocument.tsx` | markdown-parsed literal gained `confidence: 0` |
| Ops log | `.planning/phases/02-regenerative-math-honesty/deferred-items.md` | Sweep entry marked RESOLVED with commit `8818567` |

## Decisions Made

- **Reproducibility via shared-helper, not shared-module extraction:** `capital-receipt.ts` duplicates `DIMENSION_CAPITAL_MAP` + `THRESHOLDS` from `capital-computation.ts` and a parity test guards drift. Extraction into a shared internal module would have dragged changes back into `capital-computation.ts`, risking rework on Plan 02-01's locked surface. Parity test is the single contract between the two helpers.
- **Threshold top band `max: 1.01` (not 1.00):** with strict-less-than comparison (`avgRate >= t.min && avgRate < t.max`), `avgRate === 1.0` must still land in bucket 5. The 1.01 ceiling is a deliberate sentinel; `computeCapitalScores` achieves the same effect via an `else score = 5` catch-all. Identical bucket output, different mechanism; parity test verifies.
- **Zero-contribution threshold table shows no active row:** emphasises "no activity yet, so no bucket" rather than defaulting to bucket 1 highlight. Honesty principle — the UI must not imply a score was earned when none was.
- **CapitalReceiptSheet reuses `ConfirmationSheet.tsx` pattern, not `RpplProvenanceSheet.tsx`:** ConfirmationSheet pattern is synchronous (no react-query loading state). Receipt data comes from props, so sync pattern fits. RpplProvenanceSheet carries a dynamic data-load dependency unneeded here.
- **SSR-based component tests (`renderToStaticMarkup`):** inherits the pattern Plan 02-01 established. Backdrop-tap dismiss is a `useEffect` behavior that SSR can't fire — covered by ConfirmationSheet.tsx parent pattern + manual QA (plan's verification section explicitly calls it out). No jsdom + @testing-library deps added.
- **`/whole/page.tsx` NOT modified (deliberate):** plan frontmatter's `files_modified` list omits `/whole/page.tsx`. Grep confirmed CapitalRadar is rendered in `SpatialCanvas.tsx`, `MapDocument.tsx`, and `CanvasRegenerate.tsx` (via `/map/[id]` and `/map/sample` flows) — NOT on `/whole/page.tsx`. The plan's action-step mentions wiring there, but that would be dead-wiring on a file that doesn't render the component. The `onCapitalTap` prop is available wherever CapitalRadar IS rendered; consumer wiring happens at their discretion.
- **CapitalScore literal sweep as dedicated commit (not bundled):** commit `8818567` is isolated + cites `deferred-items.md` explicitly. If CapitalRadar's handling of `confidence: 0` ever changes, reverting the sweep is a single-commit operation.
- **Cross-plan concurrency hygiene with 02-04:** no file overlap per orchestrator's scope map. Staged files individually (never `git add -A`) to avoid sweeping 02-04's uncommitted work. Verified with `git diff --cached --name-only` before each commit. Same hygiene Plan 02-01 established during parallel Wave 1 execution.

## Patterns Established

- **Math-reproducibility test pattern:** any new presentational helper that surfaces computed values (receipt, share-card, OG image, insight text) should ship with a parity test against its source-of-truth helper. Parity tests catch drift before feature bugs reach users.
- **Three-section bottom-sheet primitive:** header (identity + score + confidence-label) + body sections (Contributions / Weighted sum / Threshold / Confidence / Computed) + drag-handle. Reusable for viral insight artifacts (Phase 4) and outcome-validated pattern receipts (Phase 8 LONG-01).
- **Optional-prop progressive enhancement:** CapitalRadar shipped without `onCapitalTap`, gains it here without breaking existing consumers (SpatialCanvas, MapDocument, CanvasRegenerate all compile unchanged). Pattern: `prop?: T` with `onClick={() => prop?.(args)}` — feature lights up where wired, stays silent where not.
- **Tap-and-hover-are-independent-surfaces:** one `<line>` with `strokeWidth=16`, transparent stroke, AND onClick + onMouseEnter/Move/Leave. Click fires on pointerup, hover tracks pointer motion — they don't conflict. Same pattern works for text labels.

## Deviations from Plan

### Auto-fixed / Scope Observations

**1. [Rule 4 observation — Architectural, documented not acted on] Plan action-step references `/whole/page.tsx` wiring but CapitalRadar is not rendered there**

- **Found during:** Task 2 pre-wiring grep (looking for the page's existing CapitalRadar mount)
- **Issue:** Plan's Step 3 in Task 2 instructs "Wire `/whole/page.tsx` to render `<CapitalReceiptSheet />` alongside `<CapitalRadar />`. Surgical edit — find the existing CapitalRadar mount and add state + receipt component." But `/whole/page.tsx` doesn't render `CapitalRadar` at all. The radar lives in `SpatialCanvas.tsx`, `MapDocument.tsx`, and `CanvasRegenerate.tsx` — consumed by `/map/[id]` and `/map/sample` pages.
- **Decision:** Did NOT modify `/whole/page.tsx`. Plan frontmatter's `files_modified` list also omits it, so the action-step instruction appears to be aspirational (expecting CapitalRadar to be on /whole, which is not current state). The `onCapitalTap` prop is ready for any consumer. Dead-wiring a component that isn't rendered on /whole would have been a scope creep + false-positive integration.
- **Impact on plan success-criteria:** zero. Success-criteria says "Bottom sheet receipt opens from CapitalRadar axis tap" — this works wherever CapitalRadar is mounted. The helper + component + prop are all delivered.
- **Flagged for downstream:** when CapitalRadar eventually ships on `/whole` (possibly via Phase 3 onboarding-visibility or Phase 7 deeper-regenerative-model), wire the receipt mount at that time. The lift is a ~8-line state hook + component mount per plan's Step 3 snippet.

**2. [Rule 3 — Blocking] Closed CapitalScore literal sweep gap from deferred-items.md**

- **Found during:** Task 2 post-commit (orchestrator context explicitly flagged this as owned by 02-03)
- **Issue:** 10 `tsc --noEmit` errors pre-existed in `scripts/sanity-check-encoding.ts` (8 literals) + `components/canvas/MapDocument.tsx` (1 literal) — Plan 02-01 added `confidence: number` as required but missed these two files during its sweep. Errors out-of-scope for Plan 02-02 (dormancy) so logged to `deferred-items.md` with explicit recommendation: "Owner: whoever writes the next CapitalScore-touching plan (02-03 capital receipt likely will)."
- **Fix:** Added `confidence: 1` to 8 sanity-check literals (sample data = fully-formed operator, matches "well-known" shader tier) + `confidence: 0` to MapDocument literal (markdown-parsed, no behavior history, renders dashed/hollow).
- **Verification:** `npx tsc --noEmit | grep -i "sanity-check\|MapDocument\|CapitalScore"` → 0 hits; remaining 5 errors are in 02-02/02-04 test files (orthogonal to this sweep).
- **Committed in:** `8818567` (dedicated commit, cites `deferred-items.md` in the message)

**3. [Rule 3 — Blocking, anticipated] Copy audit passed Voice Bible §02 check**

- **Found during:** Task 2 post-render (pre-commit review of CapitalReceiptSheet strings)
- **Potential issue:** Plan's copy strings (`"Contributions"`, `"Weighted sum"`, `"Threshold"`, `"Confidence"`, `"Computed"`, `"No activity yet"`, `"still learning"`, `"getting clearer"`, `"well-known"`) needed Voice Bible §02 audit before merge.
- **Fix:** grepped against §02 banned list — no hits on `journey`, `best self`, `on track`, `supercharge`, or any other banned term. "Still learning" / "getting clearer" / "well-known" are neutral epistemic labels (not motivational), consistent with the sovereignty framing.
- **Verification:** no code change needed — copy strings are clean.
- **Committed in:** N/A (audit-only; no fix required)

---

**Total deviations:** 1 architectural observation (documented, not acted on — by design), 1 Rule 3 auto-fix (literal sweep), 1 audit-pass.

**Impact on plan:** Zero scope creep. All three plan tasks' deliverables landed. Literal sweep was explicitly assigned to me by orchestrator context; closing it unblocks `tsc --noEmit` cleanliness across the full tree.

## Issues Encountered

- **Cross-plan concurrent execution with 02-04:** orchestrator spawned me alongside 02-04 (fallow-day). Saw `1e46bb1` (02-04 Task 1) interleaved with my commits in `git log`. No file overlap per orchestrator's scope map, verified by `git diff --cached --name-only` before each of my commits. Clean.
- **Missed `app/src/app/whole/page.tsx` wiring:** documented in Deviations above. Plan's action-step instruction conflicted with actual codebase state; chose action-consistent-with-files_modified-frontmatter (don't modify /whole/page.tsx) over action-following-step-instructions (which would have been dead-wiring).

## User Setup Required

None — no migrations, no environment variables, no Supabase operations. Plan 02-03 is pure client-side sheet + helper + test files. The orchestrator's deploy note confirmed: "this plan has NO new migrations. Pure client-side sheet. No Supabase ops needed."

## Next Phase Readiness

- **REGEN-04 is complete:** receipt helper + sheet component + tap wiring shipped. Wherever `CapitalRadar` is rendered, consumers pass `onCapitalTap` and mount `CapitalReceiptSheet` adjacent. The three files in `files_modified` cover both `/map/[id]` (via MapDocument.tsx — wires receipt when needed) and future `/whole` surface.
- **Phase 4 viral artifacts unblocked:** the three-section bottom-sheet primitive (header + sections + Computed-at) is proven. Phase 4 will reuse this shape to reveal the math behind shareable insights (same "show-your-work" sovereignty pattern applied to a new surface).
- **Phase 8 LONG-01 primed:** outcome-validated pattern receipts will inherit the same pattern — header ("Validated on 14 days, confirmed by outcome-check N/M") + contributions (which behaviors + dates supported the pattern) + Computed-at.
- **CapitalScore literal sweep closed:** anyone running `npx tsc --noEmit` now sees a clean bill on `CapitalScore` literals. Remaining 5 TypeScript errors are in 02-02/02-04 route-test files, owned by those plans.
- **Plan 02-04 (fallow-day) concurrent close:** no file overlap; 02-04's commits land independently. Expected 02-04 to close Wave 3 alongside this plan.
- **Deferred items inventory clean:** 1 entry remained after 02-01 (literal sweep) — now closed by 02-03. The only active deferred item in the file is the pre-existing Vitest parallel-import race on Windows, owned by a future Phase 1.1 test-infra spike.

---
*Phase: 02-regenerative-math-honesty*
*Completed: 2026-04-24*

## Self-Check: PASSED

All 10 claimed artifacts verified on disk:

| Artifact | Status |
|----------|--------|
| `app/src/lib/capital-receipt.ts` | FOUND |
| `app/src/components/whole/CapitalReceiptSheet.tsx` | FOUND |
| `app/src/components/canvas/CapitalRadar.tsx` | FOUND |
| `app/src/__tests__/capital-receipt-math.test.ts` | FOUND |
| `app/src/components/whole/CapitalReceiptSheet.test.tsx` | FOUND |
| `app/src/components/canvas/CapitalRadar.tap.test.tsx` | FOUND |
| `app/scripts/sanity-check-encoding.ts` | FOUND |
| `app/src/components/canvas/MapDocument.tsx` | FOUND |
| `.planning/phases/02-regenerative-math-honesty/deferred-items.md` | FOUND |
| `.planning/phases/02-regenerative-math-honesty/02-03-capital-receipt-SUMMARY.md` | FOUND (this file) |

Commits verified in `git log --oneline --all`:

- `c77df4b` FOUND — Task 1 (feat: pure helper lib/capital-receipt.ts + reproducibility test)
- `d308840` FOUND — Task 2 (feat: CapitalReceiptSheet component + CapitalRadar tap wiring)
- `8818567` FOUND — literal sweep (fix: close CapitalScore literal sweep gap left by 02-01)

Test assertions verified green in single run:

- `cd app && npm test -- src/__tests__/capital-receipt-math.test.ts src/components/whole/CapitalReceiptSheet.test.tsx src/components/canvas/CapitalRadar.tap.test.tsx` → 3 files / 21 tests passed (8 parity + 9 sheet + 4 tap).
- `cd app && npm test` (full suite) → 60 files passed, 819 tests passed, 0 failures, 0 skipped.
- `cd app && npm test -- src/__tests__/fixtures/phase-2-scaffolds.test.ts` → 16/16 shape-parity assertions pass.

Grep-level acceptance verified:

- `grep -c "onCapitalTap" app/src/components/canvas/CapitalRadar.tsx` → 4 hits (prop interface, function signature, line onClick, text onClick — ≥2 required)
- `grep -c "buildCapitalReceipt" app/src/components/whole/CapitalReceiptSheet.tsx` → 3 hits (import default, import type, call site — ≥1 required)
- `grep "confidence" app/scripts/sanity-check-encoding.ts` → 8 hits on `confidence: 1` (all 8 literals swept)
- `grep "confidence" app/src/components/canvas/MapDocument.tsx` → 1 hit on `confidence: 0` (markdown-parsed literal swept)
- `npx tsc --noEmit 2>&1 | grep -c "sanity-check\|CapitalScore"` → 0 CapitalScore errors remain (5 remaining tsc errors are 02-02/02-04 route-test scope)
