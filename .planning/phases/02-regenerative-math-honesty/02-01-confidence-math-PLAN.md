---
phase: 02-regenerative-math-honesty
plan: 01
type: execute
wave: 1
depends_on:
  - "02-00"
files_modified:
  - app/src/engine/canvas-types.ts
  - app/src/lib/capital-computation.ts
  - app/src/components/canvas/CapitalRadar.tsx
  - app/src/lib/capital-computation.test.ts
  - app/src/__tests__/capital-score-confidence.test.ts
  - app/src/components/canvas/CapitalRadar.confidence.test.tsx
autonomous: true
requirements:
  - REGEN-01
must_haves:
  truths:
    - "capital-computation.ts no longer multiplies avgRate by engagementFactor — rest does not reduce score"
    - "CapitalScore type exports a confidence: number field (range 0–1)"
    - "computeCapitalScores accepts daysSinceFirstBehavior (calendar days since first behavior_log entry) as a parameter; it does NOT use totalActiveDays for the shader"
    - "confidence = min(1, daysSinceFirstBehavior / 14) — linear ramp, calendar days (Fallow weeks still advance confidence)"
    - "zero-contribution capital returns { score: 1, confidence: 0, note: 'No activity yet' }"
    - "CapitalRadar shape fillOpacity = average confidence across all 8 capitals (low confidence = ghosty; 14+ days = full sage-400 fill)"
    - "Capitals with 0 contributions render a dashed axis ring + hollow vertex dot (score:1 baseline preserved)"
    - "Threshold buckets (0.15 / 0.35 / 0.55 / 0.75) are unchanged"
  artifacts:
    - path: "app/src/engine/canvas-types.ts"
      provides: "CapitalScore interface with confidence: number field"
      contains: "confidence"
      exports: ["CapitalScore", "CapitalForm"]
    - path: "app/src/lib/capital-computation.ts"
      provides: "computeCapitalScores with confidence shader replacing engagement multiplier"
      contains: "daysSinceFirstBehavior"
      exports: ["computeCapitalScores", "dimensionActivityFromCounts"]
    - path: "app/src/components/canvas/CapitalRadar.tsx"
      provides: "Radar with shape opacity = avg confidence + dashed axis at zero contributions"
      contains: "fillOpacity"
    - path: "app/src/lib/capital-computation.test.ts"
      provides: "REGEN-01 unit tests filled in — confidence formula, no-multiplier math, threshold preservation"
      contains: "confidence"
      min_lines: 80
    - path: "app/src/__tests__/capital-score-confidence.test.ts"
      provides: "Type + consumer compat tests (CanvasData.capitalProfile, existing readers)"
      contains: "confidence"
      min_lines: 40
    - path: "app/src/components/canvas/CapitalRadar.confidence.test.tsx"
      provides: "Radar opacity and dashed-axis component tests"
      contains: "fillOpacity"
      min_lines: 40
  key_links:
    - from: "app/src/lib/capital-computation.ts"
      to: "engagementFactor removal"
      via: "line 90 no longer multiplies — avgRate used directly in threshold mapping"
      pattern: "engagementFactor\\s*\\*|avgRate\\s*\\*\\s*engagement"
    - from: "app/src/lib/capital-computation.ts"
      to: "CapitalScore.confidence"
      via: "each score object returns { form, score, note, confidence }"
      pattern: "confidence\\s*:"
    - from: "app/src/components/canvas/CapitalRadar.tsx"
      to: "avg confidence across scores"
      via: "fillOpacity={computed from sorted.reduce((sum, s) => sum + s.confidence, 0) / sorted.length}"
      pattern: "fillOpacity"
    - from: "app/src/components/canvas/CapitalRadar.tsx"
      to: "zero-contribution dashed axis"
      via: "strokeDasharray on axis line when cap.confidence === 0 or cap.note === 'No activity yet'"
      pattern: "strokeDasharray"
---

<objective>
Deliver REGEN-01: remove the engagement penalty from `capital-computation.ts`, re-purpose the 0–1 shader as a `CapitalScore.confidence` field (calendar-day formula), and wire it into `CapitalRadar.tsx` as shape opacity + dashed-axis treatment for zero-contribution capitals.

Purpose: The code currently punishes rest — a user who takes a Fallow week sees their capital scores drop because `engagementFactor = 0.4 + (activeDays/28) * 0.6` multiplies the avg completion rate. This contradicts the regenerative thesis. Confidence replaces punishment: the math shows what we know (opacity); it doesn't distort what we see (score).

Output: Type extension (`CapitalScore.confidence`), math change in `capital-computation.ts:90` (delete multiplier, emit confidence), radar visual treatment (shape fillOpacity + dashed axis), three test files filled in against the Wave 0 stubs.

This plan touches `CapitalRadar.tsx`. Plan 03 (REGEN-04 receipt) also touches `CapitalRadar.tsx` to wire up tap-to-open. **Plan 03 depends on this plan (`depends_on: ["02-01"]`) to avoid merge conflicts.** The radar edits here are additive (new opacity/dashed rendering); Plan 03's edits will layer on top (tap handlers on the existing hit areas at lines 282–323).
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
@.planning/phases/02-regenerative-math-honesty/02-00-fixtures-PLAN.md

<interfaces>
<!-- Existing contracts being modified. Surgical edits only — never rewrite. -->

Current CapitalScore (app/src/engine/canvas-types.ts:11-15) — expanding:
```typescript
export interface CapitalScore {
  form: CapitalForm;
  score: number;                // 1-5 (unchanged)
  note: string;                 // (unchanged)
  confidence: number;           // NEW — 0-1, min(1, daysSinceFirstBehavior/14)
}
```

Current computeCapitalScores signature (app/src/lib/capital-computation.ts:44-48) — expanding:
```typescript
// BEFORE:
export function computeCapitalScores(
  dimensionActivity: DimensionActivity[],
  totalActiveDays: number,
  windowDays: number = 28,
): CapitalScore[];

// AFTER (add daysSinceFirstBehavior; keep old params for backwards compat):
export function computeCapitalScores(
  dimensionActivity: DimensionActivity[],
  totalActiveDays: number,
  windowDays: number = 28,
  daysSinceFirstBehavior: number = 0,   // NEW — calendar days; 0 = no confidence
): CapitalScore[];
```

Line 76 current (DELETE):
```typescript
const engagementFactor = Math.min(1, 0.4 + (totalActiveDays / windowDays) * 0.6);
```

Line 90 current (REPURPOSE):
```typescript
const adjusted = avgRate * engagementFactor;   // DELETE the multiplication
// ... score mapping uses `adjusted` — switch to `avgRate` directly.
```

New confidence calculation (add, independent of totalActiveDays):
```typescript
const confidence = Math.min(1, Math.max(0, daysSinceFirstBehavior / 14));
```

Existing CapitalRadar rendering surface (app/src/components/canvas/CapitalRadar.tsx):
- Line 257: `fill="var(--color-sage-400)"` — the radar shape
- Line 258: `fillOpacity={0.2}` — currently a fixed constant; change to computed avg confidence
- Lines 225–248: axis circles (base ring + faint ticks)
- Lines 282–323: per-axis hit zones + labels (Plan 03 will add tap handlers here later)

Existing tooltip (lines 325+) — already says "No activity yet" for zero-contribution axes. Add visual dashed treatment alongside.

Vitest helpers already available from Phase 1 Wave 0:
```typescript
import { mockSupabaseAuthedSession } from "@/__tests__/fixtures/mock-supabase";
// capital-computation is pure math — no mocks needed.
```

For React component tests (CapitalRadar.confidence.test.tsx):
```typescript
import { render } from "@testing-library/react";
// Note: @testing-library/react not currently installed — check app/package.json.
// If missing, use a shallow-render alternative or a snapshot-based SVG inspection via renderToStaticMarkup.
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Extend CapitalScore type + update capital-computation math + fill unit tests</name>
  <files>
    app/src/engine/canvas-types.ts,
    app/src/lib/capital-computation.ts,
    app/src/lib/capital-computation.test.ts,
    app/src/__tests__/capital-score-confidence.test.ts
  </files>
  <behavior>
    - CapitalScore interface gains a `confidence: number` field (0–1)
    - computeCapitalScores signature gains optional daysSinceFirstBehavior parameter (default 0)
    - Line-90 engagement multiplier is deleted; threshold mapping uses avgRate directly
    - Each returned CapitalScore object includes confidence = min(1, daysSinceFirstBehavior / 14)
    - Zero-contribution capitals return { score: 1, confidence: 0, note: 'No activity yet' }
    - Threshold boundaries (0.15 / 0.35 / 0.55 / 0.75) are unchanged
    - Existing consumers of CapitalScore.score/note continue to compile (backwards compatible)
  </behavior>
  <action>
Step 1 — Extend the type in `app/src/engine/canvas-types.ts` (surgical Edit, lines 11-15):

```typescript
// BEFORE
export interface CapitalScore {
  form: CapitalForm;
  score: number; // 1-5
  note: string;
}

// AFTER
export interface CapitalScore {
  form: CapitalForm;
  score: number;       // 1-5
  note: string;
  confidence: number;  // 0-1, min(1, daysSinceFirstBehavior / 14). Drives shape opacity on /whole radar.
}
```

Step 2 — Update `app/src/lib/capital-computation.ts` with surgical edits:

2a. Expand the signature (line 44) to add `daysSinceFirstBehavior`:

```typescript
// BEFORE
export function computeCapitalScores(
  dimensionActivity: DimensionActivity[],
  totalActiveDays: number,
  windowDays: number = 28,
): CapitalScore[] {

// AFTER
export function computeCapitalScores(
  dimensionActivity: DimensionActivity[],
  totalActiveDays: number,              // kept for backwards compat; no longer gates score
  windowDays: number = 28,
  daysSinceFirstBehavior: number = 0,   // NEW — calendar days since first behavior_log entry; 0 ⇒ confidence 0
): CapitalScore[] {
```

2b. DELETE line 76 entirely (`const engagementFactor = ...`). It is no longer used.

2c. ADD a single-line confidence calculation just before the `const scores = ALL_CAPITALS.map(...)` block (~line 78):

```typescript
// REGEN-01: confidence is a shader (0-1), not a score multiplier. Calendar days so
// Fallow weeks still teach the system the operator's shape.
const confidence = Math.min(1, Math.max(0, daysSinceFirstBehavior / 14));
```

2d. Zero-contribution branch (line 83-86) — add confidence:0:

```typescript
// BEFORE
if (contributions === 0) {
  // No behavioral data touches this capital — baseline 1
  return { form, score: 1, note: "No activity yet" };
}

// AFTER
if (contributions === 0) {
  // No behavioral data touches this capital — baseline 1, confidence 0
  return { form, score: 1, note: "No activity yet", confidence: 0 };
}
```

2e. DELETE line 90 (`const adjusted = avgRate * engagementFactor;`). Replace downstream `adjusted` references with `avgRate`:

```typescript
// BEFORE (lines 88-103)
const avgRate = raw / contributions;
const adjusted = avgRate * engagementFactor;

let score: number;
if (adjusted < 0.15) score = 1;
else if (adjusted < 0.35) score = 2;
else if (adjusted < 0.55) score = 3;
else if (adjusted < 0.75) score = 4;
else score = 5;

const note = generateCapitalNote(form, score, avgRate);
return { form, score, note };

// AFTER
const avgRate = raw / contributions;

let score: number;
if (avgRate < 0.15) score = 1;
else if (avgRate < 0.35) score = 2;
else if (avgRate < 0.55) score = 3;
else if (avgRate < 0.75) score = 4;
else score = 5;

const note = generateCapitalNote(form, score, avgRate);
return { form, score, note, confidence };
```

2f. Leave the `dimensionActivityFromCounts` helper (lines 132+) untouched — it does not need the confidence shader.

Step 3 — Fill `app/src/lib/capital-computation.test.ts` (replace it.skip entries):

```typescript
import { describe, it, expect } from "vitest";
import { computeCapitalScores, dimensionActivityFromCounts } from "./capital-computation";

describe("REGEN-01: capital-computation confidence math", () => {
  it("computes confidence = min(1, daysSinceFirstBehavior / 14)", () => {
    const activity = [{ dimension: "body" as const, completionRate: 0.5, totalCompletions: 14 }];
    const scores = computeCapitalScores(activity, 14, 28, 7);
    const living = scores.find(s => s.form === "living")!;
    expect(living.confidence).toBeCloseTo(0.5, 3);
  });

  it("does NOT multiply avgRate by engagement factor", () => {
    // With old math, totalActiveDays=1, windowDays=28 → engagementFactor ≈ 0.42
    // completionRate=0.6 → old adjusted ≈ 0.25 (bucket 2)
    // New: avgRate=0.6 directly → bucket 4 (0.55–0.75)
    const activity = [{ dimension: "body" as const, completionRate: 0.6, totalCompletions: 1 }];
    const scores = computeCapitalScores(activity, 1, 28, 14);
    const living = scores.find(s => s.form === "living")!;
    expect(living.score).toBe(4);
  });

  it("returns confidence: 0 for zero daysSinceFirstBehavior", () => {
    const activity = [{ dimension: "body" as const, completionRate: 0.5, totalCompletions: 1 }];
    const scores = computeCapitalScores(activity, 1, 28, 0);
    expect(scores.find(s => s.form === "living")!.confidence).toBe(0);
  });

  it("returns confidence: 1 for 14+ daysSinceFirstBehavior (clamped)", () => {
    const activity = [{ dimension: "body" as const, completionRate: 0.5, totalCompletions: 1 }];
    expect(computeCapitalScores(activity, 1, 28, 14).find(s => s.form === "living")!.confidence).toBe(1);
    expect(computeCapitalScores(activity, 1, 28, 42).find(s => s.form === "living")!.confidence).toBe(1);
  });

  it("zero-contribution capital returns { score: 1, confidence: 0, note: 'No activity yet' }", () => {
    const scores = computeCapitalScores([], 0, 28, 30);
    for (const s of scores) {
      expect(s.score).toBe(1);
      expect(s.confidence).toBe(0);
      expect(s.note).toBe("No activity yet");
    }
  });

  it("threshold boundaries (0.15/0.35/0.55/0.75) are unchanged", () => {
    const cases = [
      { rate: 0.14, expected: 1 },
      { rate: 0.16, expected: 2 },
      { rate: 0.34, expected: 2 },
      { rate: 0.36, expected: 3 },
      { rate: 0.54, expected: 3 },
      { rate: 0.56, expected: 4 },
      { rate: 0.74, expected: 4 },
      { rate: 0.76, expected: 5 },
    ];
    for (const { rate, expected } of cases) {
      const activity = [{ dimension: "body" as const, completionRate: rate, totalCompletions: 1 }];
      expect(computeCapitalScores(activity, 14, 28, 14).find(s => s.form === "living")!.score).toBe(expected);
    }
  });

  it("Fallow week does NOT decrement confidence (calendar-day formula)", () => {
    // daysSinceFirstBehavior is calendar days — Fallow days still count toward 14
    const activity = [{ dimension: "body" as const, completionRate: 0.5, totalCompletions: 7 }];
    const scores = computeCapitalScores(activity, 7, 28, 14);
    expect(scores.find(s => s.form === "living")!.confidence).toBe(1);
  });
});
```

Step 4 — Fill `app/src/__tests__/capital-score-confidence.test.ts` (type + consumer compat):

```typescript
import { describe, it, expect } from "vitest";
import type { CapitalScore, CapitalForm, CanvasData } from "@/engine/canvas-types";

describe("REGEN-01: CapitalScore.confidence type parity + consumer compat", () => {
  it("CapitalScore includes confidence: number", () => {
    const s: CapitalScore = { form: "living", score: 3, note: "ok", confidence: 0.5 };
    expect(typeof s.confidence).toBe("number");
    expect(s.confidence).toBeGreaterThanOrEqual(0);
    expect(s.confidence).toBeLessThanOrEqual(1);
  });

  it("existing consumers of score/note still compile", () => {
    const s: CapitalScore = { form: "social", score: 4, note: "developing", confidence: 0.8 };
    const { score, note } = s;
    expect(score).toBe(4);
    expect(note).toBe("developing");
  });

  it("CanvasData.capitalProfile accepts CapitalScore[] with confidence", () => {
    const forms: CapitalForm[] = ["financial","material","living","social","intellectual","experiential","spiritual","cultural"];
    const profile: CapitalScore[] = forms.map(form => ({ form, score: 1, note: "ok", confidence: 0 }));
    const canvas = { capitalProfile: profile } as Pick<CanvasData, "capitalProfile">;
    expect(canvas.capitalProfile).toHaveLength(8);
    expect(canvas.capitalProfile[0].confidence).toBe(0);
  });
});
```

Step 5 — Run the unit tests:

```bash
cd app && npm test -- src/lib/capital-computation.test.ts src/__tests__/capital-score-confidence.test.ts
```
Expected: all tests green. If any existing consumer breaks (e.g., a test factory building CapitalScore without `confidence`), fix by adding `confidence: 0` to the builder.

Step 6 — Sweep: search for any other builders that construct `CapitalScore` literals without `confidence` and add the field:

```bash
cd app && grep -rn "form:.*score:.*note:" src --include="*.ts" --include="*.tsx" | grep -v ".test."
```
Add `confidence: 0` to any raw literals found. If a helper factory sets a default, prefer updating the helper.
  </action>
  <verify>
    <automated>cd app && npm test -- src/lib/capital-computation.test.ts src/__tests__/capital-score-confidence.test.ts</automated>
  </verify>
  <done>
    - canvas-types.ts CapitalScore exports confidence: number
    - capital-computation.ts line 90 no longer multiplies by engagementFactor (verifiable via grep)
    - computeCapitalScores returns confidence field on every score
    - Zero-contribution returns { score:1, confidence:0, note:'No activity yet' }
    - Threshold buckets unchanged (7 boundary assertions green)
    - Fallow-week parity assertion green (confidence clamp at 14 days)
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Wire confidence into CapitalRadar — shape opacity + dashed axis for zero-contribution</name>
  <files>
    app/src/components/canvas/CapitalRadar.tsx,
    app/src/components/canvas/CapitalRadar.confidence.test.tsx
  </files>
  <behavior>
    - Radar shape fillOpacity = average confidence across all 8 capitals (replace fixed 0.2)
    - Capitals with note === "No activity yet" (or confidence === 0) render the axis with strokeDasharray + hollow vertex dot
    - Hover tooltip still displays — visual treatment only
    - prefers-reduced-motion suppresses any opacity transitions (read from window.matchMedia or existing useReducedMotion hook)
    - No regression to the existing 8-axis layout, label rendering, or hover tooltip
  </behavior>
  <action>
Step 1 — Read `app/src/components/canvas/CapitalRadar.tsx` lines 220-260 to locate the shape fill element (currently `fill="var(--color-sage-400)" fillOpacity={0.2}` at line 257-258).

Step 2 — Compute average confidence at the top of the render function (before the `return`):

```typescript
// Near the top of the component (after sorting, before JSX return)
// REGEN-01: shape opacity reflects average confidence across all 8 capitals
const avgConfidence = sorted.length > 0
  ? sorted.reduce((sum, cap) => sum + (cap.confidence ?? 0), 0) / sorted.length
  : 0;
// Floor to 0.08 so the shape is never invisible (visual anchor); ceil to 0.4 (current cap at 0.2 was too ghosty even for mature operators)
const shapeFillOpacity = Math.min(0.4, Math.max(0.08, avgConfidence * 0.4));
```

The `0.4` ceiling preserves parity with the existing 0.2 at partial confidence while allowing full 0.4 fill at 14+ days — never fully opaque (which would obscure the axis rings behind). The `0.08` floor keeps the shape visible for brand-new operators.

Step 3 — Replace the fixed fillOpacity at line 258 (surgical Edit):

```tsx
// BEFORE
<polygon
  points={polygonPoints}
  fill="var(--color-sage-400)"
  fillOpacity={0.2}
  stroke="var(--color-sage-500)"
  strokeWidth={1.5}
/>

// AFTER
<polygon
  points={polygonPoints}
  fill="var(--color-sage-400)"
  fillOpacity={shapeFillOpacity}
  stroke="var(--color-sage-500)"
  strokeWidth={1.5}
  style={{ transition: prefersReducedMotion ? "none" : "fill-opacity 400ms ease" }}
/>
```

Check whether `prefersReducedMotion` is already available in the component (via `useReducedMotion` or a prop). If not:

```typescript
import { useReducedMotion } from "@/hooks/useReducedMotion";
// ...inside component
const prefersReducedMotion = useReducedMotion();
```

If `useReducedMotion` does not exist either (per CLAUDE.md it does — see `app/src/hooks/useReducedMotion`), fall back to `window.matchMedia("(prefers-reduced-motion: reduce)").matches` guarded by a client-only check. Do not introduce a new dependency.

Step 4 — Add dashed-axis treatment for zero-contribution capitals. Locate the axis-line rendering block (lines 225–248, where each axis endpoint gets drawn). Replace with a conditional:

```tsx
// For each axis, before the existing <line> element:
const isZeroContribution = sorted[i].note === "No activity yet" || (sorted[i].confidence ?? 0) === 0;

<line
  x1={centerX}
  y1={centerY}
  x2={end.x}
  y2={end.y}
  stroke="var(--color-earth-300)"
  strokeWidth={1}
  strokeDasharray={isZeroContribution ? "4 4" : undefined}
  opacity={isDimmed ? 0.25 : isZeroContribution ? 0.35 : 0.4}
/>
```

Step 5 — Hollow vertex dot for zero-contribution capitals. Locate the vertex circle rendering (lines 270–279) and switch `fill` to transparent + stroke in the zero case:

```tsx
// BEFORE
<circle
  key={`vertex-${i}`}
  cx={v.x}
  cy={v.y}
  r={isHovered ? 5 : 4}
  fill={isHovered ? "var(--color-sage-700)" : "var(--color-sage-600)"}
  opacity={isDimmed ? 0.4 : 1}
  className="transition-all duration-200"
/>

// AFTER
<circle
  key={`vertex-${i}`}
  cx={v.x}
  cy={v.y}
  r={isHovered ? 5 : 4}
  fill={isZeroContribution ? "transparent" : (isHovered ? "var(--color-sage-700)" : "var(--color-sage-600)")}
  stroke={isZeroContribution ? "var(--color-sage-500)" : "none"}
  strokeWidth={isZeroContribution ? 1.2 : 0}
  opacity={isDimmed ? 0.4 : 1}
  className="transition-all duration-200"
/>
```

Note: `isZeroContribution` must be computed per-index. If the existing loop structure doesn't have an index handy, add `const cap = sorted[i];` near the top of the iteration and derive from `cap`.

Step 6 — Leave the tooltip untouched. The "No activity yet" text already surfaces through the existing tooltip for zero-contribution capitals.

Step 7 — Fill `app/src/components/canvas/CapitalRadar.confidence.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import CapitalRadar from "./CapitalRadar";
import type { CapitalScore } from "@/engine/canvas-types";

function makeProfile(overrides: Partial<Record<string, { score: number; confidence: number; note?: string }>> = {}): CapitalScore[] {
  const forms = ["financial","material","living","social","intellectual","experiential","spiritual","cultural"] as const;
  return forms.map(form => {
    const o = overrides[form];
    return {
      form,
      score: o?.score ?? 1,
      note: o?.note ?? (o?.confidence === 0 ? "No activity yet" : "ok"),
      confidence: o?.confidence ?? 0,
    };
  });
}

describe("REGEN-01: CapitalRadar opacity + dashed axis", () => {
  it("shape fillOpacity scales with average confidence across 8 capitals", () => {
    // All confidence 1.0 → shape fillOpacity clamps to 0.4 (the ceiling)
    const fullConfidence = makeProfile(Object.fromEntries(
      ["financial","material","living","social","intellectual","experiential","spiritual","cultural"]
        .map(f => [f, { score: 3, confidence: 1 }]),
    ));
    const html = renderToStaticMarkup(<CapitalRadar capitalProfile={fullConfidence} />);
    expect(html).toMatch(/fill-opacity="0\.4"/);
  });

  it("all-zero confidence → shape uses floor opacity (0.08)", () => {
    const empty = makeProfile(); // all confidence 0
    const html = renderToStaticMarkup(<CapitalRadar capitalProfile={empty} />);
    expect(html).toMatch(/fill-opacity="0\.08"/);
  });

  it("zero-contribution capital renders dashed axis stroke", () => {
    const mixed = makeProfile({ living: { score: 3, confidence: 0.5 } }); // others confidence 0
    const html = renderToStaticMarkup(<CapitalRadar capitalProfile={mixed} />);
    expect(html).toMatch(/stroke-dasharray="4 4"/);
  });

  it("capital with contributions renders solid axis (no strokeDasharray on its line)", () => {
    const allActive = makeProfile(Object.fromEntries(
      ["financial","material","living","social","intellectual","experiential","spiritual","cultural"]
        .map(f => [f, { score: 3, confidence: 0.5 }]),
    ));
    const html = renderToStaticMarkup(<CapitalRadar capitalProfile={allActive} />);
    // A rough proxy: count dashed strokes — should be 0 for axis lines
    const dashed = (html.match(/stroke-dasharray/g) || []).length;
    expect(dashed).toBe(0);
  });
});
```

If `react-dom/server` is unavailable or `renderToStaticMarkup` is not appropriate for this project, swap in a vitest-compatible approach (e.g., `@testing-library/react`'s `render` + `container.innerHTML`). Check `app/package.json` for the already-installed renderer.

Step 8 — Run the component tests:

```bash
cd app && npm test -- src/components/canvas/CapitalRadar.confidence.test.tsx
```

Step 9 — Run the full suite for safety:

```bash
cd app && npm test
```

Any existing `CapitalRadar` consumer tests that passed a `capitalProfile` without `confidence` must be updated — add `confidence: 0` to the literal or use `makeProfile()` helper.
  </action>
  <verify>
    <automated>cd app && npm test -- src/components/canvas/CapitalRadar.confidence.test.tsx</automated>
  </verify>
  <done>
    - CapitalRadar fillOpacity dynamic (0.08 floor, 0.4 ceiling, linear-scaled on avg confidence)
    - Dashed axis + hollow vertex dot rendered when cap.note === 'No activity yet' or cap.confidence === 0
    - useReducedMotion respected (no transition when prefers-reduced-motion)
    - 4 component tests green
    - Full suite green
  </done>
</task>

</tasks>

<verification>
**Overall Phase 02-01 checks:**

Automated (must all exit 0):
```bash
cd app && npm test -- src/lib/capital-computation.test.ts src/__tests__/capital-score-confidence.test.ts src/components/canvas/CapitalRadar.confidence.test.tsx
cd app && npm test
```

Grep verification:
```bash
# Line 90 multiplier is gone
grep -n "engagementFactor" app/src/lib/capital-computation.ts  # expect 0 results
grep -n "adjusted = avgRate" app/src/lib/capital-computation.ts # expect 0 results

# confidence is on the type
grep -n "confidence" app/src/engine/canvas-types.ts            # expect >= 1 hit
grep -n "confidence" app/src/lib/capital-computation.ts         # expect >= 1 hit

# Dashed axis treatment landed
grep -n "strokeDasharray" app/src/components/canvas/CapitalRadar.tsx  # expect >= 1 hit
```

Manual (before close):
- Open `/whole` in dev, confirm radar shape opacity visually tracks overall confidence
- Confirm zero-data account (new anon session) shows dashed axis + hollow dots
</verification>

<success_criteria>
- `capital-computation.ts:90` no longer multiplies avgRate by engagementFactor
- `CapitalScore.confidence` field exists on the type and is returned by `computeCapitalScores`
- Radar shape opacity scales with average confidence (0.08 floor, 0.4 ceiling)
- Zero-contribution axes render dashed + hollow
- 3 test files green (14+ assertions total)
- No existing CapitalScore consumers break
</success_criteria>

<output>
After completion, create `.planning/phases/02-regenerative-math-honesty/02-01-confidence-math-SUMMARY.md` with:
- What changed: type extension + math repurpose + radar visual wiring
- Specific decisions: calendar-day formula (Fallow week doesn't decrement), 0.08/0.4 opacity bounds, dashed-axis treatment for zero-contribution
- Files touched (2 created tests filled, 3 modified — canvas-types, capital-computation, CapitalRadar)
- Downstream: Plan 03 (REGEN-04 receipt) builds on this by (a) reading `confidence` for the receipt label and (b) adding tap handlers to the same CapitalRadar axis hit zones
</output>
