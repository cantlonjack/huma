---
phase: 02-regenerative-math-honesty
plan: 00
type: execute
wave: 0
depends_on: []
files_modified:
  - app/src/__tests__/fixtures/phase-2-scaffolds.test.ts
  - app/src/lib/capital-computation.test.ts
  - app/src/__tests__/capital-score-confidence.test.ts
  - app/src/components/canvas/CapitalRadar.confidence.test.tsx
  - app/src/app/api/operator/dormancy/route.test.ts
  - app/src/app/api/cron/morning-sheet/route.dormant.test.ts
  - app/src/hooks/useToday.dormant.test.ts
  - app/scripts/smoke/regen-02-dormancy.sh
  - app/src/app/api/outcome/route.test.ts
  - app/src/lib/outcome-check.test.ts
  - app/src/lib/outcome-strength.test.ts
  - app/src/components/whole/CapitalReceiptSheet.test.tsx
  - app/src/components/canvas/CapitalRadar.tap.test.tsx
  - app/src/__tests__/capital-receipt-math.test.ts
  - app/src/app/api/sheet/fallow/route.test.ts
  - app/src/hooks/useToday.fallow.test.ts
  - app/src/app/api/sheet/check/route.fallow.test.ts
autonomous: true
requirements:
  - REGEN-01
  - REGEN-02
  - REGEN-03
  - REGEN-04
  - REGEN-05
must_haves:
  truths:
    - "Every test file referenced in 02-VALIDATION.md Per-Task Verification Map exists on disk as an importable Vitest module with at least one placeholder .skip test"
    - "scripts/smoke/regen-02-dormancy.sh exists and is executable with a placeholder curl step that exits 0"
    - "phase-2-scaffolds.test.ts asserts every Phase 2 test file exists (shape-parity smoke) so Wave 1 plans cannot merge if a test stub was accidentally deleted"
    - "Wave 1 plans (01, 02, 04, 05) consume these stubs by replacing .skip with real assertions — no new files created in Wave 1 for tests already listed above"
    - "No production code modified — only test scaffolds and a smoke script shell"
  artifacts:
    - path: "app/src/__tests__/fixtures/phase-2-scaffolds.test.ts"
      provides: "Shape-parity smoke: asserts each Phase 2 test file exists + exports at least one describe block"
      contains: "describe"
      min_lines: 40
    - path: "app/src/lib/capital-computation.test.ts"
      provides: "REGEN-01 unit test stub — confidence formula, no-multiplier math, zero-data treatment, threshold boundaries"
      contains: "describe"
      min_lines: 30
    - path: "app/src/__tests__/capital-score-confidence.test.ts"
      provides: "REGEN-01 type + consumer compatibility stub"
      contains: "describe"
      min_lines: 20
    - path: "app/src/components/canvas/CapitalRadar.confidence.test.tsx"
      provides: "REGEN-01 component test stub — shape opacity from avg confidence, dashed axis at zero contributions"
      contains: "describe"
      min_lines: 20
    - path: "app/src/app/api/operator/dormancy/route.test.ts"
      provides: "REGEN-02 route test stub — toggle on/off, auth required, audit log, mid-day preserve, anon support"
      contains: "describe"
      min_lines: 30
    - path: "app/src/app/api/cron/morning-sheet/route.dormant.test.ts"
      provides: "REGEN-02 cron skip test stub — dormant user skipped, structured log with skip_reason:'dormant', no sheet compile, no push"
      contains: "describe"
      min_lines: 25
    - path: "app/src/hooks/useToday.dormant.test.ts"
      provides: "REGEN-02 hook test stub — Dormant screen renders when huma_context.dormant.active === true, single input toggles off"
      contains: "describe"
      min_lines: 20
    - path: "app/scripts/smoke/regen-02-dormancy.sh"
      provides: "REGEN-02 integration smoke shell — toggle on → cron skip → toggle off → cron delivers"
      contains: "curl"
      min_lines: 15
    - path: "app/src/app/api/outcome/route.test.ts"
      provides: "REGEN-03 route test stub — POST creates outcome_check, enum enforcement, sanitizes why"
      contains: "describe"
      min_lines: 25
    - path: "app/src/lib/outcome-check.test.ts"
      provides: "REGEN-03 trigger test stub — 90-day from createdAt, not from updates; two-snooze max"
      contains: "describe"
      min_lines: 20
    - path: "app/src/lib/outcome-strength.test.ts"
      provides: "REGEN-03 strength multiplier test stub — Yes ×1.25 cap 1.0, Some ×1.0, No ×0.5, Worse flips sign"
      contains: "describe"
      min_lines: 20
    - path: "app/src/components/whole/CapitalReceiptSheet.test.tsx"
      provides: "REGEN-04 component test stub — renders full math (contributions, weights, rates, threshold bucket highlighted, confidence label)"
      contains: "describe"
      min_lines: 20
    - path: "app/src/components/canvas/CapitalRadar.tap.test.tsx"
      provides: "REGEN-04 radar tap test stub — axis tap opens bottom sheet with correct capital"
      contains: "describe"
      min_lines: 15
    - path: "app/src/__tests__/capital-receipt-math.test.ts"
      provides: "REGEN-04 reproducibility invariant stub — receipt numbers equal computeCapitalScores output"
      contains: "describe"
      min_lines: 20
    - path: "app/src/app/api/sheet/fallow/route.test.ts"
      provides: "REGEN-05 route test stub — mark/unmark, same-day undo, post-midnight frozen"
      contains: "describe"
      min_lines: 25
    - path: "app/src/hooks/useToday.fallow.test.ts"
      provides: "REGEN-05 hook test stub — checkoff disabled, Fallow card replaces sheet, prior checkoffs preserved"
      contains: "describe"
      min_lines: 20
    - path: "app/src/app/api/sheet/check/route.fallow.test.ts"
      provides: "REGEN-05 check-route guard stub — rejects checkoff when day is fallow, no behavior_log write"
      contains: "describe"
      min_lines: 15
  key_links:
    - from: "Wave 1 Phase 2 plans (01, 02, 04, 05)"
      to: "app/src/**/*.test.ts*"
      via: "existing stub files — executors replace .skip with real assertions; no new files created"
      pattern: "\\.skip\\(|it\\.skip\\("
    - from: "app/src/__tests__/fixtures/phase-2-scaffolds.test.ts"
      to: "every Phase 2 test file listed in 02-VALIDATION.md"
      via: "fs.existsSync() assertions"
      pattern: "existsSync"
---

<objective>
Wave 0 fixture plan for Phase 2. Pre-create every test file referenced in `02-VALIDATION.md`'s Per-Task Verification Map as an importable Vitest module with a placeholder `.skip` test, plus an executable smoke-script shell. Wave 1 plans (01, 02, 04, 05) then replace `.skip` with real assertions — they do NOT create new test files. This mirrors Phase 1's Plan 00 pattern: lock the test surface before consumers race to create it.

Purpose: Prevents merge contention where Plan 02 (dormancy) and Plan 04 (fallow) both extend `useToday` and need separate test files, or where Plan 01 and Plan 03 both need CapitalRadar test variants. Wave 0 writes the stubs; Wave 1 fills them. Also locks the contract — if a stub is missing, the shape-parity smoke fails at Wave 0 and planning is wrong.

Output: 16 new test-file stubs + 1 smoke-script shell + 1 shape-parity smoke. All Phase 2 Vitest commands listed in `02-VALIDATION.md` resolve after this plan lands (they report "0 tests" or "skipped", not "file not found"). **No production code modified.**
</objective>

<execution_context>
@C:/Users/djcan/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/djcan/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-regenerative-math-honesty/02-CONTEXT.md
@.planning/phases/02-regenerative-math-honesty/02-VALIDATION.md
@.planning/phases/01-security-cost-control/01-00-fixtures-PLAN.md

<interfaces>
<!-- Reusing Phase 1 Wave 0 fixtures. No new fixture helpers — just test stubs. -->

From Phase 1 Wave 0 (already shipped):
```typescript
// app/src/__tests__/fixtures/mock-supabase.ts
export function mockSupabaseNoSession();
export function mockSupabaseAnonSession(userId: string);
export function mockSupabaseAuthedSession(userId: string, opts?);
export function installSupabaseMock(impl);

// app/src/__tests__/fixtures/mock-anthropic.ts
export function makeMockStream(opts?);
export function mockAnthropicCountTokens(value);
export function makeMockAnthropic(opts?);

// app/src/__tests__/fixtures/capture-log.ts
export function captureConsoleLog(): { logs, restore, spy };
```

Vitest skip pattern:
```typescript
import { describe, it } from "vitest";
describe("REGEN-XX: feature", () => {
  it.skip("TODO: wave 1 implementation", () => {
    // Plan NN will fill this in
  });
});
```

Shape-parity smoke uses Node's fs:
```typescript
import { existsSync } from "node:fs";
import { resolve } from "node:path";
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Test stubs for REGEN-01, REGEN-02, REGEN-03, REGEN-04, REGEN-05 + smoke shell + shape-parity smoke</name>
  <files>
    app/src/__tests__/fixtures/phase-2-scaffolds.test.ts,
    app/src/lib/capital-computation.test.ts,
    app/src/__tests__/capital-score-confidence.test.ts,
    app/src/components/canvas/CapitalRadar.confidence.test.tsx,
    app/src/app/api/operator/dormancy/route.test.ts,
    app/src/app/api/cron/morning-sheet/route.dormant.test.ts,
    app/src/hooks/useToday.dormant.test.ts,
    app/scripts/smoke/regen-02-dormancy.sh,
    app/src/app/api/outcome/route.test.ts,
    app/src/lib/outcome-check.test.ts,
    app/src/lib/outcome-strength.test.ts,
    app/src/components/whole/CapitalReceiptSheet.test.tsx,
    app/src/components/canvas/CapitalRadar.tap.test.tsx,
    app/src/__tests__/capital-receipt-math.test.ts,
    app/src/app/api/sheet/fallow/route.test.ts,
    app/src/hooks/useToday.fallow.test.ts,
    app/src/app/api/sheet/check/route.fallow.test.ts
  </files>
  <action>
Step 1 — Create each REGEN-01 test stub with `it.skip` placeholders. Every stub follows this shape; adjust the `describe` string to match the requirement and intent.

```typescript
// app/src/lib/capital-computation.test.ts
import { describe, it } from "vitest";

describe("REGEN-01: capital-computation confidence math", () => {
  it.skip("computes confidence = min(1, daysSinceFirstBehavior / 14)", () => {
    // Plan 02-01 fills this
  });

  it.skip("does NOT multiply avgRate by engagement factor (confidence is a shader, not a penalty)", () => {
    // Plan 02-01 fills this — assert avgRate === adjusted math removed from line 90
  });

  it.skip("returns confidence: 0 for zero daysSinceFirstBehavior", () => {});
  it.skip("returns confidence: 1 for 14+ daysSinceFirstBehavior (clamped)", () => {});
  it.skip("zero-contribution capital returns { score: 1, confidence: 0, note: 'No activity yet' }", () => {});
  it.skip("threshold mapping is unchanged (0.15/0.35/0.55/0.75 boundaries)", () => {});
});
```

```typescript
// app/src/__tests__/capital-score-confidence.test.ts
import { describe, it } from "vitest";

describe("REGEN-01: CapitalScore.confidence type parity + consumer compat", () => {
  it.skip("CapitalScore type includes confidence: number (range 0–1)", () => {});
  it.skip("existing consumers of CapitalScore.score/note still compile", () => {});
  it.skip("CanvasData.capitalProfile round-trips confidence field", () => {});
});
```

```typescript
// app/src/components/canvas/CapitalRadar.confidence.test.tsx
import { describe, it } from "vitest";

describe("REGEN-01: CapitalRadar opacity + dashed axis", () => {
  it.skip("shape fillOpacity = average confidence across all 8 capitals", () => {});
  it.skip("capital with 0 contributions renders dashed axis ring + hollow vertex dot", () => {});
  it.skip("capital with ≥1 contribution renders solid axis ring + filled vertex dot", () => {});
  it.skip("prefers-reduced-motion suppresses opacity transition", () => {});
});
```

Step 2 — REGEN-02 stubs (dormancy):

```typescript
// app/src/app/api/operator/dormancy/route.test.ts
import { describe, it } from "vitest";

describe("REGEN-02: POST /api/operator/dormancy toggle", () => {
  it.skip("enabling persists huma_context.dormant = { active: true, since: ISO }", () => {});
  it.skip("disabling sets active:false but leaves 'since' intact (analytics)", () => {});
  it.skip("requires auth — anon session allowed (anon users are first-class); no session → 401", () => {});
  it.skip("emits structured log via withObservability with action:'enable'|'disable'", () => {});

  describe("mid-day toggle preserves prior checkoffs", () => {
    it.skip("toggle-on at 4pm does NOT delete existing sheet_entries for today", () => {});
    it.skip("toggle-on at 4pm does NOT delete existing behavior_log rows for today", () => {});
  });

  it.skip("works for anonymous sessions (is_anonymous:true)", () => {});
});
```

```typescript
// app/src/app/api/cron/morning-sheet/route.dormant.test.ts
import { describe, it } from "vitest";

describe("REGEN-02: morning-sheet cron skips dormant users", () => {
  it.skip("user with huma_context.dormant.active:true is skipped before sheet compile", () => {});
  it.skip("skip emits structured log with source:'cron' + skip_reason:'dormant'", () => {});
  it.skip("skip increments totalSkipped counter (separately from other skip reasons)", () => {});
  it.skip("no push.send() call for dormant user", () => {});
  it.skip("no Anthropic call (sheet compile) for dormant user — quota/budget preserved", () => {});
  it.skip("non-dormant users in same cron run are still processed normally", () => {});
});
```

```typescript
// app/src/hooks/useToday.dormant.test.ts
import { describe, it } from "vitest";

describe("REGEN-02: useToday dormant branch", () => {
  it.skip("huma_context.dormant.active:true returns isDormant:true from the hook", () => {});
  it.skip("Dormant /today renders exactly 'Nothing today. Rest is the work.'", () => {});
  it.skip("single input field submits → toggles dormancy off → next compile runs", () => {});
  it.skip("sheet content is NOT rendered while dormant (no compiledEntries)", () => {});
});
```

```bash
#!/usr/bin/env bash
# app/scripts/smoke/regen-02-dormancy.sh
set -euo pipefail

# REGEN-02 integration smoke — to be filled by Plan 02-02.
# Shape:
#   1. curl POST /api/operator/dormancy with {enable:true}
#   2. trigger /api/cron/morning-sheet with $CRON_SECRET
#   3. grep vercel logs for skip_reason:'dormant' (manual verification)
#   4. curl POST /api/operator/dormancy with {enable:false}
#   5. next cron should deliver a sheet

echo "TODO (Plan 02-02): implement regen-02-dormancy end-to-end smoke"
exit 0
```

Mark executable in the commit — Git should pick up the shebang; if the test runner checks mode on Windows the file is already parsed as shell.

Step 3 — REGEN-03 stubs (outcome check):

```typescript
// app/src/app/api/outcome/route.test.ts
import { describe, it } from "vitest";

describe("REGEN-03: POST /api/outcome", () => {
  it.skip("creates outcome_checks row with { target_kind, target_id, answer, why, answered_at, snooze_count:0 }", () => {});
  it.skip("requires auth — returns 401 on no session", () => {});
  it.skip("enforces answer enum: yes|some|no|worse (rejects 'maybe' with 400)", () => {});
  it.skip("sanitizes why field via parseBody Zod schema (rejects [[ and strips injection patterns)", () => {});
  it.skip("emits structured log with action:'outcome_submit'", () => {});

  describe("snooze path", () => {
    it.skip("snooze increments snooze_count, no outcome row created", () => {});
    it.skip("third snooze request rejects with 400 — required-visit enforced", () => {});
  });
});
```

```typescript
// app/src/lib/outcome-check.test.ts
import { describe, it } from "vitest";

describe("REGEN-03: outcome-check 90-day trigger", () => {
  it.skip("aspiration with createdAt 90 days ago and no outcome record → isDue:true", () => {});
  it.skip("aspiration with createdAt 89 days ago → isDue:false", () => {});
  it.skip("aspiration with existing outcome record within last 90 days → isDue:false", () => {});
  it.skip("aspiration updates do NOT reset the 90-day clock (still from createdAt)", () => {});
  it.skip("pattern with createdAt 90 days ago and no outcome record → isDue:true", () => {});
  it.skip("max one outcome-check card per day (returns first due; others queued for next day)", () => {});
});
```

```typescript
// app/src/lib/outcome-strength.test.ts
import { describe, it } from "vitest";

describe("REGEN-03: outcome → PatternEvidence.strength multiplier", () => {
  it.skip("answer:'yes' multiplies strength by 1.25 and caps at 1.0", () => {});
  it.skip("answer:'some' is neutral (×1.0)", () => {});
  it.skip("answer:'no' dampens strength by 0.5", () => {});
  it.skip("answer:'worse' flips sign: strength becomes -abs(strength)", () => {});
  it.skip("applying on strength already at 1.0 + 'yes' stays at 1.0 (cap)", () => {});
  it.skip("applying on negative strength + 'worse' stays negative (double-flip floor)", () => {});
});
```

Step 4 — REGEN-04 stubs (capital receipt):

```typescript
// app/src/components/whole/CapitalReceiptSheet.test.tsx
import { describe, it } from "vitest";

describe("REGEN-04: CapitalReceiptSheet renders reproducible math", () => {
  it.skip("header shows '[Label] — [Score]/5 — [Confidence label]'", () => {});
  it.skip("renders each contributing dimension with primary/secondary weight (1.0× / 0.5×)", () => {});
  it.skip("renders per-dimension completion rate as 'N/28 days = 0.xxx' fraction", () => {});
  it.skip("renders weighted contribution sum + average (avgRate)", () => {});
  it.skip("renders threshold table with user's bucket highlighted", () => {});
  it.skip("renders confidence as 'XX% (label)' with label map <33%/33-80%/80%+", () => {});
  it.skip("renders computed-at ISO timestamp", () => {});
  it.skip("dismisses on backdrop tap and swipe-down (ConfirmationSheet pattern)", () => {});
});
```

```typescript
// app/src/components/canvas/CapitalRadar.tap.test.tsx
import { describe, it } from "vitest";

describe("REGEN-04: CapitalRadar axis tap opens receipt", () => {
  it.skip("clicking the axis line opens CapitalReceiptSheet with that capital selected", () => {});
  it.skip("clicking the axis label opens CapitalReceiptSheet with that capital selected", () => {});
  it.skip("hover tooltip remains functional (tap and hover are independent surfaces)", () => {});
});
```

```typescript
// app/src/__tests__/capital-receipt-math.test.ts
import { describe, it } from "vitest";

describe("REGEN-04: receipt math parity (reproducibility invariant)", () => {
  it.skip("receipt contribution values equal internal capitalRaw map per form", () => {});
  it.skip("receipt avgRate equals raw/contributions from computeCapitalScores", () => {});
  it.skip("receipt threshold bucket matches computeCapitalScores score output", () => {});
  it.skip("receipt confidence equals min(1, daysSinceFirstBehavior/14) from same input", () => {});
});
```

Step 5 — REGEN-05 stubs (fallow):

```typescript
// app/src/app/api/sheet/fallow/route.test.ts
import { describe, it } from "vitest";

describe("REGEN-05: POST /api/sheet/fallow", () => {
  it.skip("marking adds today's YYYY-MM-DD to huma_context.fallowDays[]", () => {});
  it.skip("marking is idempotent — second mark for same day is a no-op", () => {});
  it.skip("unmarking removes the date from fallowDays[] — allowed on same calendar day", () => {});
  it.skip("unmarking after midnight returns 409 frozen", () => {});
  it.skip("requires auth — 401 on no session", () => {});
  it.skip("emits structured log with action:'mark_fallow'|'unmark_fallow' + date", () => {});
  it.skip("preserves existing sheet_entries and behavior_log for mid-day fallow (today-only)", () => {});
});
```

```typescript
// app/src/hooks/useToday.fallow.test.ts
import { describe, it } from "vitest";

describe("REGEN-05: useToday fallow branch", () => {
  it.skip("today's date in huma_context.fallowDays → isFallow:true", () => {});
  it.skip("Fallow /today renders exactly 'Fallow. Compost day.'", () => {});
  it.skip("checkoff buttons are disabled on fallow day", () => {});
  it.skip("prior checkoffs for today remain visible but greyed (truth-respecting)", () => {});
  it.skip("same-day unmark restores normal sheet view", () => {});
});
```

```typescript
// app/src/app/api/sheet/check/route.fallow.test.ts
import { describe, it } from "vitest";

describe("REGEN-05: sheet/check rejects new checkoffs on fallow days", () => {
  it.skip("POST /api/sheet/check returns 409 when today is in huma_context.fallowDays", () => {});
  it.skip("no behavior_log row is written when day is fallow", () => {});
  it.skip("error body includes code:'FALLOW_DAY' for client handling", () => {});
});
```

Step 6 — Shape-parity smoke (critical — ensures Wave 1 can't delete a stub):

```typescript
// app/src/__tests__/fixtures/phase-2-scaffolds.test.ts
import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const PHASE_2_TEST_FILES = [
  "src/lib/capital-computation.test.ts",
  "src/__tests__/capital-score-confidence.test.ts",
  "src/components/canvas/CapitalRadar.confidence.test.tsx",
  "src/app/api/operator/dormancy/route.test.ts",
  "src/app/api/cron/morning-sheet/route.dormant.test.ts",
  "src/hooks/useToday.dormant.test.ts",
  "src/app/api/outcome/route.test.ts",
  "src/lib/outcome-check.test.ts",
  "src/lib/outcome-strength.test.ts",
  "src/components/whole/CapitalReceiptSheet.test.tsx",
  "src/components/canvas/CapitalRadar.tap.test.tsx",
  "src/__tests__/capital-receipt-math.test.ts",
  "src/app/api/sheet/fallow/route.test.ts",
  "src/hooks/useToday.fallow.test.ts",
  "src/app/api/sheet/check/route.fallow.test.ts",
];

const PHASE_2_SMOKE_SCRIPTS = [
  "scripts/smoke/regen-02-dormancy.sh",
];

describe("Phase 2 Wave 0 scaffolds — every test file referenced in 02-VALIDATION.md exists", () => {
  for (const rel of PHASE_2_TEST_FILES) {
    it(`exists: ${rel}`, () => {
      const abs = resolve(process.cwd(), rel);
      expect(existsSync(abs)).toBe(true);
    });
  }
  for (const rel of PHASE_2_SMOKE_SCRIPTS) {
    it(`exists: ${rel}`, () => {
      const abs = resolve(process.cwd(), rel);
      expect(existsSync(abs)).toBe(true);
    });
  }
});
```

Step 7 — Run the shape-parity smoke:

```bash
cd app && npm test -- src/__tests__/fixtures/phase-2-scaffolds.test.ts
```
Expected: all file-exists assertions green (~16 test files + 1 smoke script).

Step 8 — Run the full suite to ensure no regressions (skips don't fail):

```bash
cd app && npm test
```
Expected: all Phase 1 tests green; Phase 2 stubs register as "skipped" (non-fatal).

NOTE on surgical edits — none. This plan only **creates** new files. It never modifies `capital-computation.ts`, `CapitalRadar.tsx`, `SettingsSheet.tsx`, or any production source. All production code changes happen in Wave 1 plans.
  </action>
  <verify>
    <automated>cd app && npm test -- src/__tests__/fixtures/phase-2-scaffolds.test.ts</automated>
  </verify>
  <done>
    - All 16 Phase 2 test stub files exist as importable Vitest modules
    - scripts/smoke/regen-02-dormancy.sh exists as an executable shell
    - phase-2-scaffolds.test.ts (16 file-exists assertions) green
    - Full suite still green (skipped tests are non-fatal)
    - Wave 1 plans will replace it.skip with real assertions — no new test files will be created in Wave 1
  </done>
</task>

</tasks>

<verification>
**Overall Phase 02-00 checks:**

Automated (must exit 0):
```bash
cd app && npm test -- src/__tests__/fixtures/phase-2-scaffolds.test.ts
```

Non-regression:
```bash
cd app && npm test
```

This plan modifies no production code, so non-regression is essentially guaranteed; the explicit smoke is just due diligence.
</verification>

<success_criteria>
- 16 new Phase 2 test files exist with at least one `it.skip` placeholder
- 1 smoke-script shell exists at `app/scripts/smoke/regen-02-dormancy.sh`
- Shape-parity smoke (17 file-exists assertions) green
- No production code touched — pure test scaffolding
- Wave 1 plans (02-01 through 02-05) can grep for their assigned test files and find them already present
</success_criteria>

<output>
After completion, create `.planning/phases/02-regenerative-math-honesty/02-00-fixtures-SUMMARY.md` with:
- What was built (16 test stubs + 1 smoke shell + 1 shape-parity smoke)
- Why this exists as a Wave 0 plan: prevents Wave 1 plans from racing to create test files and locks the test surface before implementation
- Files created (17 new, 0 modified)
- Downstream: every Wave 1 Phase 2 plan replaces it.skip entries in these files
</output>
