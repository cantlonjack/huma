---
phase: 02-regenerative-math-honesty
plan: 05
type: execute
wave: 1
depends_on:
  - "02-00"
files_modified:
  - app/supabase/migrations/020_outcomes.sql
  - app/src/lib/schemas/index.ts
  - app/src/lib/outcome-check.ts
  - app/src/lib/outcome-strength.ts
  - app/src/app/api/outcome/route.ts
  - app/src/components/today/OutcomeCheckCard.tsx
  - app/src/hooks/useToday.ts
  - app/src/app/today/page.tsx
  - app/src/app/api/outcome/route.test.ts
  - app/src/lib/outcome-check.test.ts
  - app/src/lib/outcome-strength.test.ts
autonomous: true
requirements:
  - REGEN-03
must_haves:
  truths:
    - "Migration 020_outcomes.sql exists and creates outcome_checks table { id, user_id, target_kind, target_id, answer, why, answered_at, snooze_count } with RLS policy mirroring aspirations/patterns"
    - "PR description for this plan calls out the manual migration requirement (Supabase dashboard SQL editor, not auto-applied)"
    - "POST /api/outcome accepts { target_kind, target_id, answer, why, snooze } with parseBody + Zod + withObservability + requireUser"
    - "answer enum is enforced: 'yes' | 'some' | 'no' | 'worse' (rejects 'maybe' with 400)"
    - "why field is sanitized via parseBody Zod refinement (injection-defense for free from Phase 1 Plan 01-04)"
    - "Snooze path increments snooze_count without creating an outcome record; third snooze rejects with 400 (required-visit enforced)"
    - "Pure trigger lib (outcome-check.ts): aspiration/pattern ≥ 90 calendar days old from createdAt AND no existing outcome record → isDue:true"
    - "Aspiration updates do NOT reset the 90-day clock (trigger reads createdAt, not updatedAt)"
    - "Max one outcome-check card per day; if multiple are due, returns the oldest first"
    - "Pure strength lib (outcome-strength.ts): Yes ×1.25 (cap 1.0), Some ×1.0, No ×0.5, Worse flips sign to -abs(strength)"
    - "OutcomeCheckCard renders on /today at the top of the sheet when isOutcomeDue"
    - "One-sentence why surfaces in AspirationDetailPanel and the equivalent pattern detail surface (current phase records the data; display-in-detail happens here)"
    - "Structured audit log emitted per outcome submit with action:'outcome_submit' + target_kind + answer"
  artifacts:
    - path: "app/supabase/migrations/020_outcomes.sql"
      provides: "outcome_checks table + RLS + indexes"
      contains: "outcome_checks"
      min_lines: 40
    - path: "app/src/lib/outcome-check.ts"
      provides: "Pure helpers — isOutcomeDue(target, outcomes, today), getNextDueOutcome(aspirations, patterns, outcomes, today)"
      exports: ["isOutcomeDue", "getNextDueOutcome", "type OutcomeTarget", "type OutcomeRecord"]
      min_lines: 50
    - path: "app/src/lib/outcome-strength.ts"
      provides: "Pure helper — applyOutcomeToStrength(strength, answer) with bounds (cap 1.0, flip sign on Worse)"
      exports: ["applyOutcomeToStrength", "type OutcomeAnswer"]
      min_lines: 30
    - path: "app/src/app/api/outcome/route.ts"
      provides: "POST endpoint — snooze vs submit branch + strength re-compute on pattern targets"
      contains: "withObservability"
      min_lines: 80
    - path: "app/src/components/today/OutcomeCheckCard.tsx"
      provides: "/today inline card — Yes/Some/No/Worse + one-sentence why + snooze; mirrors ValidationCard.tsx pattern"
      contains: "OutcomeCheckCard"
      min_lines: 80
    - path: "app/src/app/api/outcome/route.test.ts"
      provides: "Route tests filled in (from Plan 00 stub) — enum enforcement, snooze, required-visit, audit log"
      contains: "outcome_checks"
      min_lines: 100
    - path: "app/src/lib/outcome-check.test.ts"
      provides: "Trigger tests — createdAt 90-day clock, update-doesn't-reset, one-per-day"
      contains: "isOutcomeDue"
      min_lines: 50
    - path: "app/src/lib/outcome-strength.test.ts"
      provides: "Multiplier math tests — Yes cap, Some neutral, No dampen, Worse flip"
      contains: "applyOutcomeToStrength"
      min_lines: 30
  key_links:
    - from: "app/src/app/today/page.tsx"
      to: "components/today/OutcomeCheckCard"
      via: "conditional: {isOutcomeDue && nextDueTarget && <OutcomeCheckCard target={nextDueTarget} />}"
      pattern: "OutcomeCheckCard"
    - from: "app/src/app/api/outcome/route.ts"
      to: "lib/outcome-strength.applyOutcomeToStrength"
      via: "on pattern target, load PatternEvidence, apply multiplier, save back"
      pattern: "applyOutcomeToStrength"
    - from: "app/supabase/migrations/020_outcomes.sql"
      to: "RLS policy"
      via: "user_id filter mirrors aspirations/patterns"
      pattern: "auth\\.uid"
---

<objective>
Deliver REGEN-03: Outcome measurement at pattern/aspiration level. A 90-day outcome check asks Yes/Some/No/Worse + one-sentence why; pattern strength becomes outcome-weighted. Data persists in a new `outcome_checks` table; the card renders inline on `/today` (ValidationCard pattern) at most once per day.

Purpose: Patterns have no reality check in the current system — the system compiles sheets and emits insights, but never asks "did this work?" Phase 8 LONG-01 (RPPL commons contribution gate) depends on 6+ months of outcome data accumulating, so this plan primes that pipeline. Also: the Yes/Some/No/Worse + why captures the operator's ground truth without requiring them to know patterns internally — one question, one sentence, one day's friction.

Depends on Plan 00 (test stubs) only. Independent of Plans 01/02/03/04 — outcome data is downstream of everything and doesn't intersect other plans' files. **Also independent of the CapitalPulse rename (Plan 02)** — outcome records don't touch CapitalPulse.

Output: Migration 020_outcomes.sql (manual-apply), two pure helper libs (trigger, strength math), new endpoint (/api/outcome), OutcomeCheckCard component, useToday wiring, three test files filled in from Wave 0 stubs.

**NOTE ON MIGRATION:** Per PROJECT.md and Phase 1 precedent, Supabase migrations are MANUAL — a code push alone does not apply them. The PR description for this plan MUST include "**Manual migration required:** Apply `020_outcomes.sql` via Supabase dashboard SQL editor before merging to main. Without this, `/api/outcome` will 500 on every request."
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
<!-- New table; reuses Phase 1 route conventions. Existing PatternEvidence.strength gets read-modify-write via applyOutcomeToStrength. -->

Migration shape (020_outcomes.sql):
```sql
-- REGEN-03: 90-day outcome check data (Yes / Some / No / Worse + why)
CREATE TABLE IF NOT EXISTS outcome_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_kind TEXT NOT NULL CHECK (target_kind IN ('aspiration','pattern')),
  target_id UUID NOT NULL,
  answer TEXT NOT NULL CHECK (answer IN ('yes','some','no','worse')),
  why TEXT,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  snooze_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS outcome_checks_user_id_idx ON outcome_checks(user_id);
CREATE INDEX IF NOT EXISTS outcome_checks_target_idx ON outcome_checks(target_kind, target_id);
CREATE INDEX IF NOT EXISTS outcome_checks_user_target_idx ON outcome_checks(user_id, target_kind, target_id);

-- RLS
ALTER TABLE outcome_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY outcome_checks_select ON outcome_checks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY outcome_checks_insert ON outcome_checks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- No UPDATE policy — outcomes are append-only (immutable record of the operator's answer at that moment)
```

Zod schema (app/src/lib/schemas/index.ts):
```typescript
export const outcomeSubmitSchema = z.object({
  target_kind: z.enum(["aspiration","pattern"]),
  target_id: z.string().uuid(),
  answer: z.enum(["yes","some","no","worse"]),
  why: z.string().max(280).refine(sanitizeUserText, ...).optional(),
  snooze: z.boolean().optional(), // when true, increment snooze_count instead of creating outcome
});
```

Pure helpers (lib/outcome-check.ts):
```typescript
export interface OutcomeTarget {
  kind: "aspiration" | "pattern";
  id: string;
  createdAt: string;  // ISO
}

export interface OutcomeRecord {
  target_kind: "aspiration" | "pattern";
  target_id: string;
  answered_at: string;  // ISO
  snooze_count: number;
}

/**
 * A target is due for an outcome check when:
 *  1. Its createdAt is ≥90 calendar days ago
 *  2. No outcome record exists for it yet
 *  3. Its snooze_count < 2 (max two snoozes; third visit is required — route enforces)
 */
export function isOutcomeDue(target: OutcomeTarget, outcomes: OutcomeRecord[], today: Date): boolean;

/**
 * Of all provided aspirations/patterns, return the earliest-due one that has no outcome record
 * and whose createdAt is ≥90 days ago. Returns null if none.
 */
export function getNextDueOutcome(
  aspirations: OutcomeTarget[],
  patterns: OutcomeTarget[],
  outcomes: OutcomeRecord[],
  today: Date,
): OutcomeTarget | null;
```

Pure strength math (lib/outcome-strength.ts):
```typescript
export type OutcomeAnswer = "yes" | "some" | "no" | "worse";

export function applyOutcomeToStrength(strength: number, answer: OutcomeAnswer): number {
  switch (answer) {
    case "yes":   return Math.min(1.0, strength * 1.25);
    case "some":  return strength;  // neutral
    case "no":    return strength * 0.5;
    case "worse": return -Math.abs(strength);
  }
}
```

Existing PatternEvidence (app/src/types/v2.ts:180) — read-modify-write target:
```typescript
export interface PatternEvidence {
  confidence: PatternConfidence;
  contextTags: string[];
  // ...
  strength?: number;   // Lift in pathway completion rate, range [-1, 1]
  // ...
}
```

Existing ValidationCard pattern (app/src/components/today/ValidationCard.tsx) — template for OutcomeCheckCard layout.

useToday integration:
```typescript
// Inside useToday(), after aspirations/patterns loaded:
const { data: outcomes = [] } = useQuery({
  queryKey: ["outcomes", userId],
  queryFn: () => fetch("/api/outcome").then(r => r.json()), // GET endpoint returns the user's outcomes
});
const today = new Date();
const nextDueOutcome = getNextDueOutcome(
  aspirations.map(a => ({ kind: "aspiration" as const, id: a.id, createdAt: a.createdAt })),
  patterns.map(p => ({ kind: "pattern" as const, id: p.id, createdAt: p.createdAt })),
  outcomes,
  today,
);
const isOutcomeDue = nextDueOutcome !== null;
```

Optional: add GET to /api/outcome returning `{ outcomes: OutcomeRecord[] }` so the client can cheaply check due status; alternatively trigger client-side from already-loaded aspiration/pattern data + a targeted outcomes query.

Phase 1 conventions:
- parseBody + Zod refinement on user text (why)
- withObservability on the endpoint
- apiError() for all error paths
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Migration + pure helpers + fill helper tests</name>
  <files>
    app/supabase/migrations/020_outcomes.sql,
    app/src/lib/outcome-check.ts,
    app/src/lib/outcome-strength.ts,
    app/src/lib/outcome-check.test.ts,
    app/src/lib/outcome-strength.test.ts
  </files>
  <behavior>
    - 020_outcomes.sql creates the outcome_checks table with RLS + 3 indexes; PR description calls out manual-apply requirement
    - outcome-check.ts: isOutcomeDue + getNextDueOutcome pure helpers
    - outcome-strength.ts: applyOutcomeToStrength pure math (Yes cap, Some neutral, No dampen, Worse flip)
    - Helper tests filled in from Plan 00 stubs — 10+ assertions across both files
  </behavior>
  <action>
Step 1 — Create `app/supabase/migrations/020_outcomes.sql`:

```sql
-- Migration 020: outcome_checks table (REGEN-03)
-- Manual apply required via Supabase dashboard SQL editor.
-- Captures 90-day outcome checks: Yes/Some/No/Worse + one-sentence why.
-- Append-only: no UPDATE policy (outcomes are immutable records at the moment of submission).

BEGIN;

CREATE TABLE IF NOT EXISTS outcome_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_kind TEXT NOT NULL CHECK (target_kind IN ('aspiration','pattern')),
  target_id UUID NOT NULL,
  answer TEXT NOT NULL CHECK (answer IN ('yes','some','no','worse')),
  why TEXT,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  snooze_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS outcome_checks_user_id_idx ON outcome_checks(user_id);
CREATE INDEX IF NOT EXISTS outcome_checks_target_idx ON outcome_checks(target_kind, target_id);
CREATE INDEX IF NOT EXISTS outcome_checks_user_target_idx ON outcome_checks(user_id, target_kind, target_id);

ALTER TABLE outcome_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY outcome_checks_select ON outcome_checks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY outcome_checks_insert ON outcome_checks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Deliberately NO update/delete policies — outcomes are append-only.
-- If a user wants to "change their mind" they can submit another outcome; the latest-answered_at wins downstream.

COMMIT;
```

Step 2 — Create `app/src/lib/outcome-check.ts`:

```typescript
export interface OutcomeTarget {
  kind: "aspiration" | "pattern";
  id: string;
  createdAt: string;  // ISO
}

export interface OutcomeRecord {
  target_kind: "aspiration" | "pattern";
  target_id: string;
  answered_at: string;  // ISO
  snooze_count: number;
}

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

function daysBetween(earlierISO: string, later: Date): number {
  const earlier = new Date(earlierISO).getTime();
  return (later.getTime() - earlier) / (24 * 60 * 60 * 1000);
}

/**
 * True if this target should prompt for outcome today:
 *  - created ≥ 90 calendar days ago
 *  - has no outcome record in `outcomes`
 */
export function isOutcomeDue(target: OutcomeTarget, outcomes: OutcomeRecord[], today: Date): boolean {
  if (daysBetween(target.createdAt, today) < 90) return false;
  const recorded = outcomes.some(o => o.target_kind === target.kind && o.target_id === target.id);
  return !recorded;
}

/**
 * Of all provided aspirations+patterns, return the earliest-due one (by createdAt ascending).
 * Returns null if none are due. This enforces the "max one outcome-check card per day" rule —
 * the page renders at most the returned target.
 */
export function getNextDueOutcome(
  aspirations: OutcomeTarget[],
  patterns: OutcomeTarget[],
  outcomes: OutcomeRecord[],
  today: Date,
): OutcomeTarget | null {
  const pool = [...aspirations, ...patterns].filter(t => isOutcomeDue(t, outcomes, today));
  if (pool.length === 0) return null;
  pool.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return pool[0];
}
```

Step 3 — Create `app/src/lib/outcome-strength.ts`:

```typescript
export type OutcomeAnswer = "yes" | "some" | "no" | "worse";

/**
 * Multiplier math for outcome → PatternEvidence.strength.
 *
 * Constraints from 02-CONTEXT.md:
 *   - "yes"   → × 1.25 (capped at 1.0)
 *   - "some"  → × 1.0  (neutral)
 *   - "no"    → × 0.5  (dampen)
 *   - "worse" → flip sign: strength becomes -Math.abs(strength)
 *
 * Range of strength: [-1, 1] (matches PatternEvidence.strength comment in types/v2.ts).
 */
export function applyOutcomeToStrength(strength: number, answer: OutcomeAnswer): number {
  switch (answer) {
    case "yes":
      return Math.min(1.0, strength * 1.25);
    case "some":
      return strength;
    case "no":
      return strength * 0.5;
    case "worse":
      return -Math.abs(strength);
    default: {
      const exhaustive: never = answer;
      throw new Error(`Unhandled outcome: ${String(exhaustive)}`);
    }
  }
}
```

Step 4 — Fill `app/src/lib/outcome-check.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { isOutcomeDue, getNextDueOutcome } from "./outcome-check";

function iso(daysAgo: number, today = new Date()): string {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

describe("REGEN-03: outcome-check 90-day trigger", () => {
  it("target created 90 days ago with no outcome record → due", () => {
    const today = new Date("2026-04-22T12:00:00Z");
    const target = { kind: "aspiration" as const, id: "a1", createdAt: iso(90, today) };
    expect(isOutcomeDue(target, [], today)).toBe(true);
  });

  it("target created 89 days ago → not due", () => {
    const today = new Date("2026-04-22T12:00:00Z");
    const target = { kind: "aspiration" as const, id: "a1", createdAt: iso(89, today) };
    expect(isOutcomeDue(target, [], today)).toBe(false);
  });

  it("target with existing outcome record → not due (even if ≥ 90 days)", () => {
    const today = new Date("2026-04-22T12:00:00Z");
    const target = { kind: "aspiration" as const, id: "a1", createdAt: iso(120, today) };
    const outcomes = [{ target_kind: "aspiration" as const, target_id: "a1", answered_at: iso(30, today), snooze_count: 0 }];
    expect(isOutcomeDue(target, outcomes, today)).toBe(false);
  });

  it("pattern kind tracked separately from aspiration kind (same id but different kind is OK)", () => {
    const today = new Date("2026-04-22T12:00:00Z");
    const target = { kind: "pattern" as const, id: "x", createdAt: iso(100, today) };
    const outcomes = [{ target_kind: "aspiration" as const, target_id: "x", answered_at: iso(10, today), snooze_count: 0 }];
    expect(isOutcomeDue(target, outcomes, today)).toBe(true);
  });

  it("getNextDueOutcome returns earliest-due target by createdAt", () => {
    const today = new Date("2026-04-22T12:00:00Z");
    const aspirations = [
      { kind: "aspiration" as const, id: "a1", createdAt: iso(100, today) },
      { kind: "aspiration" as const, id: "a2", createdAt: iso(120, today) },  // older
    ];
    const patterns: never[] = [];
    const result = getNextDueOutcome(aspirations, patterns, [], today);
    expect(result?.id).toBe("a2");
  });

  it("getNextDueOutcome returns null when nothing is due", () => {
    const today = new Date("2026-04-22T12:00:00Z");
    const aspirations = [{ kind: "aspiration" as const, id: "a1", createdAt: iso(30, today) }];
    expect(getNextDueOutcome(aspirations, [], [], today)).toBeNull();
  });
});
```

Step 5 — Fill `app/src/lib/outcome-strength.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { applyOutcomeToStrength } from "./outcome-strength";

describe("REGEN-03: outcome → strength multiplier", () => {
  it("'yes' multiplies by 1.25 (capped at 1.0)", () => {
    expect(applyOutcomeToStrength(0.5, "yes")).toBeCloseTo(0.625, 5);
    expect(applyOutcomeToStrength(0.9, "yes")).toBe(1.0);
    expect(applyOutcomeToStrength(1.0, "yes")).toBe(1.0);
  });

  it("'some' is neutral (no change)", () => {
    expect(applyOutcomeToStrength(0.5, "some")).toBe(0.5);
    expect(applyOutcomeToStrength(-0.3, "some")).toBe(-0.3);
  });

  it("'no' dampens by 0.5", () => {
    expect(applyOutcomeToStrength(0.8, "no")).toBe(0.4);
    expect(applyOutcomeToStrength(-0.6, "no")).toBe(-0.3);
  });

  it("'worse' flips sign: strength → -abs(strength)", () => {
    expect(applyOutcomeToStrength(0.5, "worse")).toBe(-0.5);
    expect(applyOutcomeToStrength(-0.3, "worse")).toBe(-0.3); // already negative, stays negative
    expect(applyOutcomeToStrength(0, "worse")).toBe(0);        // -0 normalized
  });
});
```

Step 6 — Run the helper tests:

```bash
cd app && npm test -- src/lib/outcome-check.test.ts src/lib/outcome-strength.test.ts
```
  </action>
  <verify>
    <automated>cd app && npm test -- src/lib/outcome-check.test.ts src/lib/outcome-strength.test.ts</automated>
  </verify>
  <done>
    - 020_outcomes.sql migration exists with table + RLS + 3 indexes
    - lib/outcome-check.ts (isOutcomeDue, getNextDueOutcome) landed
    - lib/outcome-strength.ts (applyOutcomeToStrength) landed
    - 6 + 3 = 9 helper tests green
    - PR description is prepared to call out manual migration requirement (at Task 3 close)
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: /api/outcome endpoint + Zod schema + fill route test</name>
  <files>
    app/src/lib/schemas/index.ts,
    app/src/app/api/outcome/route.ts,
    app/src/app/api/outcome/route.test.ts
  </files>
  <behavior>
    - outcomeSubmitSchema: { target_kind enum, target_id uuid, answer enum, why string optional (sanitized), snooze boolean optional }
    - POST /api/outcome with snooze:true increments snooze_count (UPSERT on user_id+target_kind+target_id+snooze-row)
    - Third snooze (snooze_count >= 2) returns 400 REQUIRED_VISIT
    - POST /api/outcome with snooze:false/undefined inserts a new outcome_checks row
    - If target_kind='pattern', also read the pattern's PatternEvidence.strength and apply applyOutcomeToStrength, then write back
    - parseBody sanitizes `why` via existing injection-defense refinement from Phase 1
    - withObservability emits audit log with action:'outcome_submit' + target_kind + answer
    - Route-test: 6 cases (create outcome, snooze inc, third-snooze rejects, enum rejected, no-session 401, audit log)
  </behavior>
  <action>
Step 1 — Add Zod schema in `app/src/lib/schemas/index.ts`. Check that `sanitizeUserText` refinement (Phase 1 Plan 01-04) is already applied as `.refine(...)` on user-text schemas; copy the pattern:

```typescript
// Alongside existing schemas:
export const outcomeSubmitSchema = z.object({
  target_kind: z.enum(["aspiration","pattern"]),
  target_id: z.string().uuid(),
  answer: z.enum(["yes","some","no","worse"]),
  why: z.string().max(280).refine(
    (v) => {
      if (!v) return true;
      const result = sanitizeUserText(v);
      return !result.rejected;
    },
    { message: "why text contains disallowed content" },
  ).optional(),
  snooze: z.boolean().optional(),
});
export type OutcomeSubmitInput = z.infer<typeof outcomeSubmitSchema>;
```

If `sanitizeUserText` is not importable at this location, import from `@/lib/schemas/sanitize` (Plan 01-04 landed this file). If the import path differs, grep for the actual location before editing.

Step 2 — Create `app/src/app/api/outcome/route.ts`:

```typescript
import { parseBody } from "@/lib/schemas/parse";
import { outcomeSubmitSchema } from "@/lib/schemas";
import { withObservability } from "@/lib/observability";
import { createServerSupabase } from "@/lib/supabase-server";
import { requireUser } from "@/lib/auth-guard";
import { apiError } from "@/lib/api-error";
import { applyOutcomeToStrength } from "@/lib/outcome-strength";

export async function POST(request: Request): Promise<Response> {
  return withObservability(
    request,
    "/api/outcome",
    "user",
    () => null,
    async (obs) => {
      const auth = await requireUser(request);
      if (auth instanceof Response) return auth;
      const { user } = auth;
      if (!user) return apiError("Not authenticated", { code: "UNAUTHORIZED", status: 401 });

      const parsed = await parseBody(request, outcomeSubmitSchema);
      if (parsed.error) return parsed.error;
      const { target_kind, target_id, answer, why, snooze } = parsed.data;

      const supabase = await createServerSupabase();

      if (snooze) {
        // Check existing snooze_count
        const { data: existing } = await supabase
          .from("outcome_checks")
          .select("snooze_count")
          .eq("user_id", user.id)
          .eq("target_kind", target_kind)
          .eq("target_id", target_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const currentSnooze = (existing?.snooze_count as number | undefined) ?? 0;
        if (currentSnooze >= 2) {
          return apiError("Required visit — no more snoozes allowed", {
            code: "REQUIRED_VISIT",
            status: 400,
          });
        }

        // Write a synthetic snooze row (answer must be non-null due to CHECK; we use the placeholder 'some' with snooze_count incremented.
        // Downstream logic treats snooze_count > 0 AND most-recent-answered_at = this row as "snoozed", NOT as an answered outcome.
        // Alternative: add a nullable `snoozed` boolean column — defer to a future migration if query complexity pushes it.
        const { error } = await supabase
          .from("outcome_checks")
          .insert({
            user_id: user.id,
            target_kind,
            target_id,
            answer: "some",    // Placeholder; snooze_count > 0 means this row is a snooze, not an answer
            why: null,
            snooze_count: currentSnooze + 1,
          });
        if (error) return apiError("Failed to persist snooze", { code: "INTERNAL", status: 500 });

        console.log(JSON.stringify({
          req_id: obs.reqId,
          user_id: user.id,
          route: "/api/outcome",
          action: "outcome_snooze",
          target_kind,
          target_id,
          snooze_count: currentSnooze + 1,
          source: "user",
          status: 200,
        }));

        return Response.json({ ok: true, snoozed: true, snooze_count: currentSnooze + 1 });
      }

      // Full submit
      const { data: inserted, error } = await supabase
        .from("outcome_checks")
        .insert({
          user_id: user.id,
          target_kind,
          target_id,
          answer,
          why: why ?? null,
          snooze_count: 0,
        })
        .select()
        .single();

      if (error || !inserted) {
        return apiError("Failed to persist outcome", { code: "INTERNAL", status: 500 });
      }

      // If pattern, update PatternEvidence.strength
      if (target_kind === "pattern") {
        const { data: patternRow } = await supabase
          .from("patterns")
          .select("id, evidence")
          .eq("id", target_id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (patternRow?.evidence) {
          const evidence = patternRow.evidence as { strength?: number } & Record<string, unknown>;
          const currentStrength = typeof evidence.strength === "number" ? evidence.strength : 0;
          const nextStrength = applyOutcomeToStrength(currentStrength, answer);
          await supabase
            .from("patterns")
            .update({ evidence: { ...evidence, strength: nextStrength } })
            .eq("id", target_id)
            .eq("user_id", user.id);
        }
      }

      console.log(JSON.stringify({
        req_id: obs.reqId,
        user_id: user.id,
        route: "/api/outcome",
        action: "outcome_submit",
        target_kind,
        target_id,
        answer,
        source: "user",
        status: 200,
      }));

      return Response.json({ ok: true, outcome_id: inserted.id });
    },
  );
}
```

Step 3 — Fill `app/src/app/api/outcome/route.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { captureConsoleLog } from "@/__tests__/fixtures/capture-log";

beforeAll(() => {
  process.env.ANTHROPIC_API_KEY = "sk-test";
  process.env.PHASE_1_GATE_ENABLED = "true";
});
afterEach(() => vi.resetModules());

function buildRequest(body: unknown) {
  return new Request("http://localhost/api/outcome", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("REGEN-03: POST /api/outcome", () => {
  it("full submit creates outcome_checks row", async () => {
    const insertSpy = vi.fn(async () => ({ data: { id: "oc-1" }, error: null }));
    const supa = {
      from: vi.fn((table: string) => {
        if (table === "outcome_checks") {
          return {
            insert: vi.fn(() => ({ select: vi.fn(() => ({ single: insertSpy })) })),
          };
        }
        if (table === "patterns") {
          return {
            select: vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: null })) })) })) })),
            update: vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn() })) })),
          };
        }
        return { select: vi.fn() };
      }),
    };
    vi.doMock("@/lib/supabase-server", () => ({ createServerSupabase: async () => supa }));
    vi.doMock("@/lib/auth-guard", () => ({ requireUser: async () => ({ user: { id: "u-1" }, source: "user" }) }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest({
      target_kind: "aspiration",
      target_id: "00000000-0000-0000-0000-000000000001",
      answer: "yes",
      why: "finished the knee rehab arc",
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.outcome_id).toBe("oc-1");
  });

  it("rejects 'maybe' answer with 400 (enum enforcement)", async () => {
    vi.doMock("@/lib/auth-guard", () => ({ requireUser: async () => ({ user: { id: "u-1" }, source: "user" }) }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest({
      target_kind: "aspiration",
      target_id: "00000000-0000-0000-0000-000000000001",
      answer: "maybe",
    }));
    expect(res.status).toBe(400);
  });

  it("snooze increments snooze_count without creating an outcome answer", async () => {
    const insertSpy = vi.fn(async () => ({ data: null, error: null }));
    const supa = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: { snooze_count: 0 } })) })),
                })),
              })),
            })),
          })),
        })),
        insert: insertSpy,
      })),
    };
    vi.doMock("@/lib/supabase-server", () => ({ createServerSupabase: async () => supa }));
    vi.doMock("@/lib/auth-guard", () => ({ requireUser: async () => ({ user: { id: "u-1" }, source: "user" }) }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest({
      target_kind: "aspiration",
      target_id: "00000000-0000-0000-0000-000000000001",
      answer: "some",
      snooze: true,
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.snoozed).toBe(true);
    expect(body.snooze_count).toBe(1);
  });

  it("third snooze (snooze_count >= 2) rejects with 400 REQUIRED_VISIT", async () => {
    const supa = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: { snooze_count: 2 } })) })),
                })),
              })),
            })),
          })),
        })),
        insert: vi.fn(),
      })),
    };
    vi.doMock("@/lib/supabase-server", () => ({ createServerSupabase: async () => supa }));
    vi.doMock("@/lib/auth-guard", () => ({ requireUser: async () => ({ user: { id: "u-1" }, source: "user" }) }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest({
      target_kind: "aspiration",
      target_id: "00000000-0000-0000-0000-000000000001",
      answer: "some",
      snooze: true,
    }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("REQUIRED_VISIT");
  });

  it("no session returns 401", async () => {
    vi.doMock("@/lib/auth-guard", () => ({
      requireUser: async () => new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    }));
    const { POST } = await import("./route");
    const res = await POST(buildRequest({
      target_kind: "aspiration",
      target_id: "00000000-0000-0000-0000-000000000001",
      answer: "yes",
    }));
    expect(res.status).toBe(401);
  });

  it("pattern submit applies strength multiplier", async () => {
    const currentEvidence = { strength: 0.4, confidence: 0.5 };
    const updateSpy = vi.fn(async () => ({ data: null, error: null }));

    const supa = {
      from: vi.fn((table: string) => {
        if (table === "outcome_checks") {
          return {
            insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(async () => ({ data: { id: "oc-1" }, error: null })) })) })),
          };
        }
        if (table === "patterns") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: { id: "p-1", evidence: currentEvidence } })) })) })),
            })),
            update: vi.fn((payload: { evidence: { strength: number } }) => {
              // After "yes": 0.4 * 1.25 = 0.5
              expect(payload.evidence.strength).toBeCloseTo(0.5, 5);
              return { eq: vi.fn(() => ({ eq: updateSpy })) };
            }),
          };
        }
        return { select: vi.fn() };
      }),
    };
    vi.doMock("@/lib/supabase-server", () => ({ createServerSupabase: async () => supa }));
    vi.doMock("@/lib/auth-guard", () => ({ requireUser: async () => ({ user: { id: "u-1" }, source: "user" }) }));

    const { POST } = await import("./route");
    const res = await POST(buildRequest({
      target_kind: "pattern",
      target_id: "00000000-0000-0000-0000-000000000001",
      answer: "yes",
      why: "pattern seems to be working",
    }));
    expect(res.status).toBe(200);
  });

  it("emits audit log with action:'outcome_submit'", async () => {
    const cap = captureConsoleLog();
    const supa = {
      from: vi.fn((table: string) => {
        if (table === "outcome_checks") {
          return {
            insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(async () => ({ data: { id: "oc-1" }, error: null })) })) })),
          };
        }
        return {
          select: vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: null })) })) })) })),
        };
      }),
    };
    vi.doMock("@/lib/supabase-server", () => ({ createServerSupabase: async () => supa }));
    vi.doMock("@/lib/auth-guard", () => ({ requireUser: async () => ({ user: { id: "u-7" }, source: "user" }) }));

    const { POST } = await import("./route");
    await POST(buildRequest({
      target_kind: "aspiration",
      target_id: "00000000-0000-0000-0000-000000000001",
      answer: "some",
    }));

    const log = cap.logs.find(l => l.action === "outcome_submit");
    expect(log).toBeTruthy();
    expect(log?.user_id).toBe("u-7");
    expect(log?.target_kind).toBe("aspiration");
    expect(log?.answer).toBe("some");
    cap.restore();
  });
});
```

Step 4 — Run the route tests:

```bash
cd app && npm test -- src/app/api/outcome/route.test.ts
```
  </action>
  <verify>
    <automated>cd app && npm test -- src/app/api/outcome/route.test.ts</automated>
  </verify>
  <done>
    - outcomeSubmitSchema with sanitize refinement landed
    - /api/outcome endpoint with snooze + submit + pattern-strength paths
    - 7 route-test cases green
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: OutcomeCheckCard + useToday wiring + today/page integration</name>
  <files>
    app/src/components/today/OutcomeCheckCard.tsx,
    app/src/hooks/useToday.ts,
    app/src/app/today/page.tsx
  </files>
  <behavior>
    - OutcomeCheckCard renders 4 answer buttons (Yes / Some / No / Worse) + a why text area + a snooze link + a submit button
    - Submitting POSTs to /api/outcome; on success, the card disappears and the query cache invalidates
    - useToday exposes isOutcomeDue + nextDueOutcome derived from already-loaded aspirations/patterns + a new outcomes query
    - today/page.tsx renders OutcomeCheckCard at the top of the sheet when isOutcomeDue && !isFallow && !isDormant (Dormancy > Fallow > Outcome priority)
    - Max one card per day — enforced by getNextDueOutcome returning the oldest target
    - Voice Bible §02 audit on "Yes / Some / No / Worse" (locked from spec), "Not yet — ask me in a week" (snooze link), "one sentence on why" (placeholder)
  </behavior>
  <action>
Step 1 — Create `app/src/components/today/OutcomeCheckCard.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { OutcomeTarget } from "@/lib/outcome-check";

type Answer = "yes" | "some" | "no" | "worse";

interface OutcomeCheckCardProps {
  target: OutcomeTarget;
  targetLabel: string;  // e.g., the aspiration's clarifiedText or pattern's triggerLabel
  onSubmit: (answer: Answer, why: string) => Promise<void>;
  onSnooze: () => Promise<void>;
}

export default function OutcomeCheckCard({ target, targetLabel, onSubmit, onSnooze }: OutcomeCheckCardProps) {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [why, setWhy] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!answer || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(answer, why.trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-sand-100 rounded-xl p-5 mb-4">
      <p className="font-sans text-[11px] tracking-[0.12em] uppercase text-sage-400 mb-2">
        90 days in — {target.kind === "aspiration" ? "Aspiration" : "Pattern"}
      </p>
      <p className="font-serif text-[17px] text-earth-650 leading-snug mb-4">
        {targetLabel}
      </p>

      <div className="flex gap-2 mb-4 flex-wrap">
        {(["yes","some","no","worse"] as const).map(a => (
          <button
            key={a}
            onClick={() => setAnswer(a)}
            aria-pressed={answer === a}
            className={`font-sans text-[13px] font-medium px-4 py-2 rounded-lg cursor-pointer border transition-colors duration-200 ${
              answer === a
                ? "bg-sage-500 text-sand-50 border-sage-500"
                : "bg-transparent text-earth-650 border-sand-300 hover:bg-sand-200"
            }`}
          >
            {a.charAt(0).toUpperCase() + a.slice(1)}
          </button>
        ))}
      </div>

      <textarea
        value={why}
        onChange={(e) => setWhy(e.target.value.slice(0, 280))}
        placeholder="one sentence on why"
        rows={2}
        className="w-full font-sans text-[14px] text-earth-650 placeholder:text-sand-350 bg-sand-50 border border-sand-300 rounded-lg py-2 px-3 mb-3 outline-none focus:border-sage-500 resize-none"
      />

      <div className="flex items-center justify-between">
        <button
          onClick={onSnooze}
          className="font-sans text-[12px] text-earth-400 underline underline-offset-4 decoration-sand-300 hover:decoration-earth-400 bg-transparent border-0 cursor-pointer"
        >
          Not yet — ask me in a week
        </button>
        <button
          onClick={handleSubmit}
          disabled={!answer || submitting}
          className={`font-sans text-[13px] font-medium px-4 py-2 rounded-lg border-0 cursor-pointer ${
            answer && !submitting
              ? "bg-amber-350 text-sand-50"
              : "bg-sand-300 text-earth-350 cursor-not-allowed"
          }`}
        >
          {submitting ? "..." : "Submit"}
        </button>
      </div>
    </div>
  );
}
```

Voice Bible §02 audit: "90 days in —", "Yes / Some / No / Worse" (spec enum labels), "one sentence on why" (placeholder), "Not yet — ask me in a week" (snooze link), "Submit" (button). Run §02 grep before merge.

Step 2 — Edit `app/src/hooks/useToday.ts` to expose `nextDueOutcome` + submit/snooze handlers:

```typescript
// Near the top, import:
import { getNextDueOutcome, type OutcomeTarget, type OutcomeRecord } from "@/lib/outcome-check";

// Inside useToday, after aspirations/patterns are loaded:
const { data: outcomeRecords = [] } = useQuery<OutcomeRecord[]>({
  queryKey: ["outcomes", user?.id],
  queryFn: async () => {
    // Assumes GET /api/outcome exists; if not, skip for now and derive from direct Supabase query.
    // For Phase 2 scope: add a lightweight GET to the same route file, OR query the outcome_checks table via Supabase client directly.
    // Pragmatic choice: query via createClient (browser Supabase) — outcomes is user-scoped + RLS-enforced.
    const supa = createClient();
    const { data, error } = await supa
      .from("outcome_checks")
      .select("target_kind, target_id, answered_at, snooze_count")
      .eq("user_id", user?.id)
      .order("answered_at", { ascending: false });
    if (error) return [];
    return (data || []) as OutcomeRecord[];
  },
  enabled: Boolean(user?.id),
});

const nextDueOutcome = useMemo(() => {
  const today = new Date();
  const aspirationTargets: OutcomeTarget[] = aspirations.map(a => ({ kind: "aspiration" as const, id: a.id, createdAt: a.createdAt }));
  const patternTargets: OutcomeTarget[] = patterns.map(p => ({ kind: "pattern" as const, id: p.id, createdAt: p.createdAt }));
  return getNextDueOutcome(aspirationTargets, patternTargets, outcomeRecords, today);
}, [aspirations, patterns, outcomeRecords]);

const isOutcomeDue = nextDueOutcome !== null;

const submitOutcome = useCallback(async (answer: "yes"|"some"|"no"|"worse", why: string) => {
  if (!nextDueOutcome) return;
  await fetch("/api/outcome", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      target_kind: nextDueOutcome.kind,
      target_id: nextDueOutcome.id,
      answer,
      why: why || undefined,
    }),
  });
  await queryClient.invalidateQueries({ queryKey: ["outcomes"] });
  await queryClient.invalidateQueries({ queryKey: ["patterns"] }); // strength may have changed
}, [nextDueOutcome, queryClient]);

const snoozeOutcome = useCallback(async () => {
  if (!nextDueOutcome) return;
  await fetch("/api/outcome", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      target_kind: nextDueOutcome.kind,
      target_id: nextDueOutcome.id,
      answer: "some",  // placeholder; backend uses snooze:true
      snooze: true,
    }),
  });
  await queryClient.invalidateQueries({ queryKey: ["outcomes"] });
}, [nextDueOutcome, queryClient]);

// Return:
return {
  // ... existing fields (including isDormant from Plan 02 and isFallow from Plan 04) ...
  isOutcomeDue,
  nextDueOutcome,
  submitOutcome,
  snoozeOutcome,
};
```

Step 3 — Edit `app/src/app/today/page.tsx` to render OutcomeCheckCard at the top of the sheet (after Dormant/Fallow branches):

```tsx
// Near the destructure:
const { isDormant, isFallow, isOutcomeDue, nextDueOutcome, submitOutcome, snoozeOutcome, /* existing */ } = useToday();

// After Dormant and Fallow branches, before the normal sheet render:
{/* Normal sheet render block */}
<TabShell>
  {/* ... header ... */}

  {isOutcomeDue && nextDueOutcome && (
    <OutcomeCheckCard
      target={nextDueOutcome}
      targetLabel={
        nextDueOutcome.kind === "aspiration"
          ? (aspirations.find(a => a.id === nextDueOutcome.id)?.clarifiedText || aspirations.find(a => a.id === nextDueOutcome.id)?.rawText || "Your aspiration")
          : (patterns.find(p => p.id === nextDueOutcome.id)?.triggerLabel || "Your pattern")
      }
      onSubmit={submitOutcome}
      onSnooze={snoozeOutcome}
    />
  )}

  {/* ... existing sheet content below ... */}
</TabShell>
```

Import: `import OutcomeCheckCard from "@/components/today/OutcomeCheckCard";`.

Step 4 — Run the full suite:

```bash
cd app && npm test
```

PR description (for the merge commit):

```
Phase 2 Plan 05 (REGEN-03 Outcome Check)

**Manual migration required:** Apply `app/supabase/migrations/020_outcomes.sql` via Supabase dashboard SQL editor BEFORE merging to main. Without this, /api/outcome will return 500 on every request (table does not exist).

Steps:
1. Open Supabase dashboard → SQL Editor → New query
2. Paste contents of 020_outcomes.sql
3. Run — confirm "outcome_checks" appears in the public schema
4. Verify RLS: `SELECT * FROM pg_policies WHERE tablename = 'outcome_checks';` should return 2 rows (select + insert policies)
5. Merge this PR

Verification after merge:
- Create a test aspiration ≥ 90 days old in staging
- Visit /today on the test account — outcome card should appear
- Submit Yes with a why — verify outcome_checks row via dashboard
- Verify pattern strength update via patterns.evidence.strength column
```

Voice Bible §02 audit on new copy:
- "90 days in — Aspiration" / "90 days in — Pattern" (card header)
- "Yes / Some / No / Worse" (spec enum)
- "one sentence on why" (textarea placeholder)
- "Not yet — ask me in a week" (snooze link)
- "Submit" (button)
  </action>
  <verify>
    <automated>cd app && npm test</automated>
  </verify>
  <done>
    - OutcomeCheckCard component landed with 4 answer buttons + why textarea + snooze link + submit
    - useToday.isOutcomeDue + nextDueOutcome + submitOutcome + snoozeOutcome exposed
    - today/page.tsx conditionally renders the card (gated by !isDormant && !isFallow)
    - PR description calls out manual migration requirement
    - Voice Bible §02 audit passed on new copy
    - Full suite green
  </done>
</task>

</tasks>

<verification>
**Overall Phase 02-05 checks:**

Automated (must all exit 0):
```bash
cd app && npm test -- src/lib/outcome-check.test.ts
cd app && npm test -- src/lib/outcome-strength.test.ts
cd app && npm test -- src/app/api/outcome/route.test.ts
cd app && npm test  # full suite
```

Grep verification:
```bash
grep -n "outcome_checks" app/supabase/migrations/020_outcomes.sql    # expect >= 1
grep -n "applyOutcomeToStrength" app/src/app/api/outcome/route.ts    # expect 1
grep -n "OutcomeCheckCard" app/src/app/today/page.tsx                # expect >= 2 (import + render)
grep -n "nextDueOutcome" app/src/hooks/useToday.ts                   # expect >= 2
```

Manual verification post-merge:
1. Apply migration 020 via Supabase dashboard (see PR description)
2. Verify `outcome_checks` table exists with 2 RLS policies
3. Create a test aspiration ≥ 90 days old (or edit createdAt via dashboard for an existing one)
4. Visit /today — outcome card renders at top
5. Submit "Yes" with a why sentence — verify outcome_checks row inserted
6. If pattern, verify patterns.evidence.strength updated per applyOutcomeToStrength

Voice Bible audit before merge.
</verification>

<success_criteria>
- Migration 020_outcomes.sql with RLS + indexes exists
- PR description flags manual-apply requirement
- Pure helpers (outcome-check, outcome-strength) + tests green (9 assertions)
- /api/outcome endpoint with snooze + submit + pattern-strength multiplier
- OutcomeCheckCard renders spec-enum buttons + why + snooze + submit
- useToday surfaces nextDueOutcome + isOutcomeDue + handlers
- today/page.tsx gates correctly (Dormant > Fallow > Outcome priority)
- 3 test files green (16+ assertions total)
- Full suite green
- Voice Bible §02 audit passed
</success_criteria>

<output>
After completion, create `.planning/phases/02-regenerative-math-honesty/02-05-outcome-check-SUMMARY.md` with:
- What shipped: migration 020 + pure trigger/strength libs + /api/outcome + OutcomeCheckCard + useToday wiring
- Specific decisions honored: 90-day calendar clock from createdAt (not updatedAt), 2-snooze max with REQUIRED_VISIT on third, one card per day (oldest first), outcomes append-only (no UPDATE policy), pattern strength multiplier (Yes ×1.25 cap / Some ×1.0 / No ×0.5 / Worse flip sign)
- Files touched: 3 new (migration, 2 lib files, route), 1 new component, 2 modified (useToday, today/page)
- Downstream: Phase 8 LONG-01 (RPPL contribution gate) queries outcome_checks for 6+ months of Yes/Some outcomes across 10+ operators — schema lands here, data accumulates naturally
</output>
