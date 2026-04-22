import { describe, it, expect } from "vitest";
import { computeCapitalPulse } from "./capital-pulse";
import type { SheetEntry, Aspiration, DimensionKey, Behavior } from "@/types/v2";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeEntry(overrides: Partial<SheetEntry> = {}): SheetEntry {
  return {
    id: "e1",
    aspirationId: "a1",
    behaviorKey: "walk",
    behaviorText: "Morning walk",
    detail: "30 min",
    timeOfDay: "morning",
    dimensions: ["body"],
    checked: false,
    ...overrides,
  };
}

function makeBehavior(key: string, dims: DimensionKey[]): Behavior {
  return {
    key,
    text: key,
    frequency: "daily",
    dimensions: dims.map(d => ({ dimension: d, direction: "builds" as const, reasoning: "" })),
    enabled: true,
  };
}

function makeAspiration(id: string, behaviors: Behavior[]): Aspiration {
  return {
    id,
    rawText: `Aspiration ${id}`,
    clarifiedText: `Aspiration ${id}`,
    behaviors,
    dimensionsTouched: [],
    status: "active",
    stage: "active",
  };
}

// ─── Check-off → Capital Pulse ───────────────────────────────────────────────

describe("check-off flow: capital pulse", () => {
  it("check off a behavior → entry's dimensions appear in movedDimensions", () => {
    const entries = [
      makeEntry({ aspirationId: "a1", behaviorKey: "walk", dimensions: ["body", "joy"] }),
    ];
    const checked = new Set(["a1:walk"]);
    const aspirations = [makeAspiration("a1", [makeBehavior("walk", ["body", "joy"])])];

    const pulse = computeCapitalPulse(entries, checked, aspirations);
    expect(pulse.movedDimensions).toContain("body");
    expect(pulse.movedDimensions).toContain("joy");
  });

  it("unchecked behavior → dimensions NOT in movedDimensions", () => {
    const entries = [
      makeEntry({ aspirationId: "a1", behaviorKey: "walk", dimensions: ["body"] }),
    ];
    const checked = new Set<string>(); // nothing checked
    const aspirations = [makeAspiration("a1", [makeBehavior("walk", ["body"])])];

    const pulse = computeCapitalPulse(entries, checked, aspirations);
    expect(pulse.movedDimensions).toHaveLength(0);
  });

  it("multiple checked entries → union of all dimensions", () => {
    const entries = [
      makeEntry({ aspirationId: "a1", behaviorKey: "walk", dimensions: ["body"] }),
      makeEntry({ id: "e2", aspirationId: "a1", behaviorKey: "cook", dimensions: ["home", "money"] }),
      makeEntry({ id: "e3", aspirationId: "a2", behaviorKey: "read", dimensions: ["growth"] }),
    ];
    const checked = new Set(["a1:walk", "a1:cook", "a2:read"]);
    const aspirations = [
      makeAspiration("a1", [makeBehavior("walk", ["body"]), makeBehavior("cook", ["home", "money"])]),
      makeAspiration("a2", [makeBehavior("read", ["growth"])]),
    ];

    const pulse = computeCapitalPulse(entries, checked, aspirations);
    expect(pulse.movedDimensions).toContain("body");
    expect(pulse.movedDimensions).toContain("home");
    expect(pulse.movedDimensions).toContain("money");
    expect(pulse.movedDimensions).toContain("growth");
  });

  it("double check-off is idempotent (same key twice in set)", () => {
    const entries = [
      makeEntry({ aspirationId: "a1", behaviorKey: "walk", dimensions: ["body"] }),
    ];
    // Set naturally deduplicates
    const checked = new Set(["a1:walk", "a1:walk"]);
    const aspirations = [makeAspiration("a1", [makeBehavior("walk", ["body"])])];

    const pulse = computeCapitalPulse(entries, checked, aspirations);
    expect(pulse.movedDimensions).toEqual(["body"]);
  });

  it("uses dimensionOverrides when present on behavior", () => {
    const behavior = makeBehavior("walk", ["body"]);
    behavior.dimensionOverrides = [
      { dimension: "joy", direction: "builds", reasoning: "user corrected" },
    ];
    const entries = [
      makeEntry({ aspirationId: "a1", behaviorKey: "walk", dimensions: ["body"] }),
    ];
    const checked = new Set(["a1:walk"]);
    const aspirations = [makeAspiration("a1", [behavior])];

    const pulse = computeCapitalPulse(entries, checked, aspirations);
    // Should include both the entry dimensions AND the override
    expect(pulse.movedDimensions).toContain("body"); // from entry.dimensions
    expect(pulse.movedDimensions).toContain("joy");  // from dimensionOverrides
  });

  it("quiet dimension: flags dimension with 5+ days inactive", () => {
    const entries = [makeEntry({ dimensions: ["body"] })];
    const checked = new Set(["a1:walk"]);
    const aspirations = [makeAspiration("a1", [makeBehavior("walk", ["body"])])];
    const recentDays: Record<string, number> = {
      body: 0,
      people: 10,
      money: 3,
      home: 6,
      growth: 2,
      joy: 1,
      purpose: 15,
      identity: 4,
    };

    const pulse = computeCapitalPulse(entries, checked, aspirations, recentDays);
    expect(pulse.quietDimension).toBeDefined();
    // purpose has 15 days inactive — the most quiet (dimension-level signal,
    // renamed from "dormant" in REGEN-02 to free the name for operator-state Dormancy).
    expect(pulse.quietDimension!.key).toBe("purpose");
    expect(pulse.quietDimension!.days).toBe(15);
  });

  it("no quiet dimension when all have recent activity", () => {
    const entries = [makeEntry({ dimensions: ["body"] })];
    const checked = new Set(["a1:walk"]);
    const aspirations = [makeAspiration("a1", [makeBehavior("walk", ["body"])])];
    const recentDays: Record<string, number> = {
      body: 0, people: 2, money: 3, home: 1, growth: 2, joy: 1, purpose: 4, identity: 3,
    };

    const pulse = computeCapitalPulse(entries, checked, aspirations, recentDays);
    expect(pulse.quietDimension).toBeNull();
  });

  it("empty compiledEntries + empty checked → null-like pulse", () => {
    const pulse = computeCapitalPulse([], new Set(), []);
    expect(pulse.movedDimensions).toHaveLength(0);
    expect(pulse.quietDimension).toBeNull();
  });
});
