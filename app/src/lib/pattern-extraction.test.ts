import { describe, it, expect } from "vitest";
import type { Pattern, PatternStep } from "@/types/v2";
import {
  computePatternEvidence,
  deriveConfidence,
  type BehaviorLogRow,
  EVIDENCE_MIN_OBSERVED_DAYS,
  EVIDENCE_TIER_EMERGING,
  EVIDENCE_TIER_VALIDATED,
} from "@/lib/pattern-extraction";

function makePattern(): Pattern {
  const steps: PatternStep[] = [
    { behaviorKey: "trigger", text: "Morning run", order: 0, isTrigger: true },
    { behaviorKey: "shower", text: "Shower", order: 1, isTrigger: false },
    { behaviorKey: "journal", text: "Journal 10m", order: 2, isTrigger: false },
  ];
  return {
    id: "pat-1",
    aspirationId: "asp-1",
    name: "Morning ritual",
    trigger: "Morning run",
    steps,
    validationCount: 0,
    validationTarget: 30,
    status: "finding",
    createdAt: "2026-04-01T00:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
  };
}

function seedPerfectCorrelation(): BehaviorLogRow[] {
  const rows: BehaviorLogRow[] = [];
  for (let i = 0; i < 14; i++) {
    const date = `2026-04-${String(i + 1).padStart(2, "0")}`;
    if (i % 2 === 0) {
      rows.push({ behavior_key: "trigger", date, completed: true });
      rows.push({ behavior_key: "shower", date, completed: true });
      rows.push({ behavior_key: "journal", date, completed: true });
    } else {
      rows.push({ behavior_key: "trigger", date, completed: false });
      rows.push({ behavior_key: "shower", date, completed: false });
      rows.push({ behavior_key: "journal", date, completed: false });
    }
  }
  return rows;
}

function seedNoSignal(): BehaviorLogRow[] {
  // Trigger and pathway completion are independent — same rate either way.
  const rows: BehaviorLogRow[] = [];
  for (let i = 0; i < 20; i++) {
    const date = `2026-04-${String(i + 1).padStart(2, "0")}`;
    rows.push({ behavior_key: "trigger", date, completed: i % 2 === 0 });
    rows.push({ behavior_key: "shower", date, completed: i % 3 === 0 });
    rows.push({ behavior_key: "journal", date, completed: (i + 1) % 3 === 0 });
  }
  return rows;
}

function seedSparseData(): BehaviorLogRow[] {
  // Only 5 days of any activity — below minimum sample threshold.
  const rows: BehaviorLogRow[] = [];
  for (let i = 0; i < 5; i++) {
    const date = `2026-04-${String(i + 1).padStart(2, "0")}`;
    rows.push({ behavior_key: "trigger", date, completed: true });
    rows.push({ behavior_key: "shower", date, completed: true });
  }
  return rows;
}

describe("computePatternEvidence", () => {
  it("surfaces strong lift for perfectly correlated trigger and pathway", () => {
    const pattern = makePattern();
    const rows = seedPerfectCorrelation();
    const ev = computePatternEvidence(pattern, rows, { windowDays: 14 });

    expect(ev.strength).toBeGreaterThanOrEqual(EVIDENCE_TIER_VALIDATED);
    expect(ev.sampleSize).toBe(14);
    expect(ev.triggerDays).toBe(7);
    expect(ev.noTriggerDays).toBe(7);
    expect(ev.confidence === "emerging" || ev.confidence === "validated" || ev.confidence === "proven")
      .toBe(true);
  });

  it("falls to seed confidence for no-signal data", () => {
    const pattern = makePattern();
    const rows = seedNoSignal();
    const ev = computePatternEvidence(pattern, rows, { windowDays: 28 });

    expect(Math.abs(ev.strength)).toBeLessThan(EVIDENCE_TIER_EMERGING);
    expect(ev.confidence).toBe("seed");
  });

  it("surfaces seed + insufficient sample for sparse data", () => {
    const pattern = makePattern();
    const rows = seedSparseData();
    const ev = computePatternEvidence(pattern, rows, { windowDays: 28 });

    expect(ev.sampleSize).toBeLessThan(EVIDENCE_MIN_OBSERVED_DAYS);
    expect(ev.confidence).toBe("seed");
  });

  it("handles empty rows without crashing", () => {
    const pattern = makePattern();
    const ev = computePatternEvidence(pattern, [], { windowDays: 28 });

    expect(ev.sampleSize).toBe(0);
    expect(ev.strength).toBe(0);
    expect(ev.confidence).toBe("seed");
  });

  it("returns seed when no trigger step exists", () => {
    const pattern = makePattern();
    const noTrigger = {
      ...pattern,
      steps: pattern.steps.map(s => ({ ...s, isTrigger: false })),
    };
    const ev = computePatternEvidence(noTrigger, seedPerfectCorrelation(), { windowDays: 14 });
    expect(ev.confidence).toBe("seed");
    expect(ev.sampleSize).toBe(0);
  });

  it("propagates provided contextTags onto evidence", () => {
    const pattern = makePattern();
    const ev = computePatternEvidence(pattern, seedPerfectCorrelation(), {
      windowDays: 14,
      contextTags: ["morning", "body"],
    });
    expect(ev.contextTags).toEqual(["morning", "body"]);
  });
});

describe("deriveConfidence", () => {
  it("returns seed below sample thresholds", () => {
    expect(deriveConfidence(0.5, 10, 5, 5)).toBe("seed");
    expect(deriveConfidence(0.5, 30, 2, 10)).toBe("seed");
    expect(deriveConfidence(0.5, 30, 10, 2)).toBe("seed");
  });

  it("returns emerging when lift crosses threshold with min sample", () => {
    expect(deriveConfidence(0.15, 16, 4, 4)).toBe("emerging");
  });

  it("returns validated at stronger lift + larger sample", () => {
    expect(deriveConfidence(0.30, 24, 10, 10)).toBe("validated");
  });

  it("returns proven only at strongest thresholds", () => {
    expect(deriveConfidence(0.50, 50, 20, 20)).toBe("proven");
  });
});
