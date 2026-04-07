import { describe, it, expect } from "vitest";
import { scoreBehaviors, getSeason, analyzeHistory } from "@/lib/services/sheet-service";
import type { SheetCompileRequest } from "@/types/v2";

function makeAspiration(
  id: string,
  behaviors: Array<{
    key: string;
    text: string;
    frequency: string;
    days?: string[];
    enabled?: boolean;
    detail?: string;
  }>,
): SheetCompileRequest["aspirations"][0] {
  return {
    id,
    rawText: `Aspiration ${id}`,
    clarifiedText: `Aspiration ${id}`,
    behaviors: behaviors.map(b => ({
      key: b.key,
      text: b.text,
      frequency: b.frequency,
      days: b.days,
      enabled: b.enabled ?? true,
      detail: b.detail,
      dimensions: [],
    })),
  };
}

describe("scoreBehaviors", () => {
  it("gives high score to behavior with strong momentum (7/7 done)", () => {
    const aspirations = [
      makeAspiration("a1", [
        { key: "walk", text: "Morning walk", frequency: "daily" },
        { key: "cook", text: "Cook dinner", frequency: "daily" },
      ]),
    ];
    const history = Array.from({ length: 7 }, (_, i) => ({
      date: `2026-04-0${i + 1}`,
      behaviorKey: "walk",
      checked: true,
    }));

    const result = scoreBehaviors(aspirations, history, "Monday");
    const walk = result.find(b => b.key === "walk");
    const cook = result.find(b => b.key === "cook");

    expect(walk).toBeDefined();
    expect(cook).toBeDefined();
    // walk has momentum (7/7 = 100% > 60%), cook is new
    expect(walk!.score).toBeGreaterThan(cook!.score);
    expect(walk!.reason).toContain("momentum");
  });

  it("includes behavior scheduled for today via specific-days", () => {
    const aspirations = [
      makeAspiration("a1", [
        { key: "yoga", text: "Yoga", frequency: "specific-days", days: ["Monday", "Wednesday"] },
        { key: "run", text: "Run", frequency: "specific-days", days: ["Tuesday", "Thursday"] },
      ]),
    ];

    const result = scoreBehaviors(aspirations, [], "Monday");
    const yoga = result.find(b => b.key === "yoga");
    const run = result.find(b => b.key === "run");

    expect(yoga!.score).toBeGreaterThan(run!.score);
    expect(yoga!.reason).toContain("scheduled-today");
    expect(run!.reason).toContain("not-today");
  });

  it("excludes disabled behaviors", () => {
    const aspirations = [
      makeAspiration("a1", [
        { key: "active", text: "Active", frequency: "daily", enabled: true },
        { key: "disabled", text: "Disabled", frequency: "daily", enabled: false },
      ]),
    ];

    const result = scoreBehaviors(aspirations, [], "Monday");
    expect(result.find(b => b.key === "disabled")).toBeUndefined();
    expect(result.find(b => b.key === "active")).toBeDefined();
  });

  it("balances aspirations — defers excess behaviors from one aspiration", () => {
    // Need enough behaviors that the balance guard kicks in (selected.length < 7)
    const aspirations = [
      makeAspiration("a1", [
        { key: "b1", text: "B1", frequency: "daily" },
        { key: "b2", text: "B2", frequency: "daily" },
        { key: "b3", text: "B3", frequency: "daily" },
        { key: "b4", text: "B4", frequency: "daily" },
        { key: "b5", text: "B5", frequency: "daily" },
      ]),
      makeAspiration("a2", [
        { key: "b6", text: "B6", frequency: "daily" },
        { key: "b7", text: "B7", frequency: "daily" },
        { key: "b8", text: "B8", frequency: "daily" },
      ]),
    ];

    // Give all a1 behaviors strong momentum so they'd dominate without balancing
    const history = ["b1", "b2", "b3", "b4", "b5"].flatMap(key =>
      Array.from({ length: 7 }, (_, i) => ({
        date: `2026-04-0${i + 1}`,
        behaviorKey: key,
        checked: true,
      }))
    );

    const result = scoreBehaviors(aspirations, history, "Monday");

    // The first 7 selected should include some from a2 due to balance enforcement
    const first7 = result.slice(0, 7);
    const a2InFirst7 = first7.filter(b => b.aspirationId === "a2").length;
    expect(a2InFirst7).toBeGreaterThan(0);
  });

  it("returns behaviors sorted by score descending", () => {
    const aspirations = [
      makeAspiration("a1", [
        { key: "walk", text: "Walk", frequency: "daily" },
        { key: "yoga", text: "Yoga", frequency: "specific-days", days: ["Monday"] },
      ]),
    ];

    const result = scoreBehaviors(aspirations, [], "Monday");
    // Yoga should score higher (scheduled-today bonus)
    expect(result[0].key).toBe("yoga");
  });
});

describe("getSeason", () => {
  it("returns early spring for March 25", () => {
    expect(getSeason("2026-03-25")).toBe("early spring");
  });

  it("returns early summer for July 20", () => {
    // July 20 is ~29 days into summer (starts June 21), 29/94 ≈ 31% → "early"
    expect(getSeason("2026-07-20")).toBe("early summer");
  });

  it("returns late autumn for December 10", () => {
    expect(getSeason("2026-12-10")).toBe("late autumn");
  });

  it("returns winter for January 15", () => {
    const result = getSeason("2026-01-15");
    expect(result).toContain("winter");
  });

  it("returns winter for December 25", () => {
    const result = getSeason("2026-12-25");
    expect(result).toContain("winter");
  });
});

describe("analyzeHistory", () => {
  it("returns empty string for empty history", () => {
    expect(analyzeHistory([], "Monday")).toBe("");
  });

  it("flags struggling behaviors (below 50%)", () => {
    const history = [
      { date: "2026-04-01", behaviorKey: "walk", checked: false },
      { date: "2026-04-02", behaviorKey: "walk", checked: false },
      { date: "2026-04-03", behaviorKey: "walk", checked: true },
    ];

    const result = analyzeHistory(history, "Monday");
    expect(result).toContain("skipped more than done");
    expect(result).toContain("1/3");
  });

  it("flags strong behaviors (above 80%)", () => {
    const history = [
      { date: "2026-04-01", behaviorKey: "cook", checked: true },
      { date: "2026-04-02", behaviorKey: "cook", checked: true },
      { date: "2026-04-03", behaviorKey: "cook", checked: true },
      { date: "2026-04-04", behaviorKey: "cook", checked: true },
      { date: "2026-04-05", behaviorKey: "cook", checked: true },
    ];

    const result = analyzeHistory(history, "Monday");
    expect(result).toContain("sticking well");
    expect(result).toContain("5/5");
  });
});
