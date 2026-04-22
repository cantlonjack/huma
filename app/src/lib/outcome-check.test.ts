import { describe, it, expect } from "vitest";
import { isOutcomeDue, getNextDueOutcome } from "./outcome-check";

/**
 * REGEN-03 Plan 02-05: 90-day trigger tests.
 *
 * These replace the Wave 0 .skip stubs with real assertions over the pure
 * `isOutcomeDue` / `getNextDueOutcome` helpers. No DB, no time globals —
 * callers pass `today: Date` explicitly.
 */

// Use millisecond math instead of setDate() so the round-trip with
// daysBetween() is exact — setDate() crosses DST in local time zones which
// can shift the returned instant by ±1 hour and fail strict `>= 90` checks.
const MS_PER_DAY = 24 * 60 * 60 * 1000;
function iso(daysAgo: number, today: Date): string {
  return new Date(today.getTime() - daysAgo * MS_PER_DAY).toISOString();
}

describe("REGEN-03: outcome-check 90-day trigger", () => {
  const today = new Date("2026-04-22T12:00:00Z");

  it("aspiration with createdAt 90 days ago and no outcome record -> isDue:true", () => {
    const target = {
      kind: "aspiration" as const,
      id: "a1",
      createdAt: iso(90, today),
    };
    expect(isOutcomeDue(target, [], today)).toBe(true);
  });

  it("aspiration with createdAt 89 days ago -> isDue:false", () => {
    const target = {
      kind: "aspiration" as const,
      id: "a1",
      createdAt: iso(89, today),
    };
    expect(isOutcomeDue(target, [], today)).toBe(false);
  });

  it("aspiration with existing outcome record within last 90 days -> isDue:false", () => {
    const target = {
      kind: "aspiration" as const,
      id: "a1",
      createdAt: iso(120, today),
    };
    const outcomes = [
      {
        target_kind: "aspiration" as const,
        target_id: "a1",
        answered_at: iso(30, today),
        snooze_count: 0,
      },
    ];
    expect(isOutcomeDue(target, outcomes, today)).toBe(false);
  });

  it("aspiration updates do NOT reset the 90-day clock (still from createdAt)", () => {
    // Target created 100 days ago, even if it was 'updated' today, still due.
    const target = {
      kind: "aspiration" as const,
      id: "a1",
      createdAt: iso(100, today),
    };
    // The trigger reads createdAt, not updatedAt — no way to signal an update
    // in OutcomeTarget because the helper ignores that field by design.
    expect(isOutcomeDue(target, [], today)).toBe(true);
  });

  it("pattern with createdAt 90 days ago and no outcome record -> isDue:true", () => {
    const target = {
      kind: "pattern" as const,
      id: "p1",
      createdAt: iso(90, today),
    };
    expect(isOutcomeDue(target, [], today)).toBe(true);
  });

  it("pattern kind tracked separately from aspiration kind (same id but different kind is OK)", () => {
    const target = {
      kind: "pattern" as const,
      id: "x",
      createdAt: iso(100, today),
    };
    const outcomes = [
      {
        target_kind: "aspiration" as const,
        target_id: "x",
        answered_at: iso(10, today),
        snooze_count: 0,
      },
    ];
    // Aspiration 'x' has an outcome, pattern 'x' does not — pattern is due.
    expect(isOutcomeDue(target, outcomes, today)).toBe(true);
  });

  it("max one outcome-check card per day (returns oldest-due; others queued for next day)", () => {
    const aspirations = [
      {
        kind: "aspiration" as const,
        id: "a1",
        createdAt: iso(100, today),
      },
      {
        kind: "aspiration" as const,
        id: "a2",
        createdAt: iso(120, today), // older — returned first
      },
    ];
    const result = getNextDueOutcome(aspirations, [], [], today);
    expect(result?.id).toBe("a2");
  });

  it("getNextDueOutcome returns null when nothing is due", () => {
    const aspirations = [
      {
        kind: "aspiration" as const,
        id: "a1",
        createdAt: iso(30, today),
      },
    ];
    expect(getNextDueOutcome(aspirations, [], [], today)).toBeNull();
  });

  it("getNextDueOutcome mixes aspirations + patterns, returns earliest overall", () => {
    const aspirations = [
      {
        kind: "aspiration" as const,
        id: "a1",
        createdAt: iso(100, today),
      },
    ];
    const patterns = [
      {
        kind: "pattern" as const,
        id: "p1",
        createdAt: iso(150, today), // older than any aspiration
      },
    ];
    const result = getNextDueOutcome(aspirations, patterns, [], today);
    expect(result?.kind).toBe("pattern");
    expect(result?.id).toBe("p1");
  });

  it("getNextDueOutcome skips targets that already have an outcome", () => {
    const aspirations = [
      {
        kind: "aspiration" as const,
        id: "a1",
        createdAt: iso(120, today),
      },
      {
        kind: "aspiration" as const,
        id: "a2",
        createdAt: iso(100, today),
      },
    ];
    const outcomes = [
      {
        target_kind: "aspiration" as const,
        target_id: "a1",
        answered_at: iso(10, today),
        snooze_count: 0,
      },
    ];
    const result = getNextDueOutcome(aspirations, [], outcomes, today);
    expect(result?.id).toBe("a2");
  });
});
