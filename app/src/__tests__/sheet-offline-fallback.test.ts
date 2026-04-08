import { describe, it, expect, beforeEach } from "vitest";
import { compileSheetOffline } from "@/lib/sheet-compiler";
import type { Aspiration, Behavior, SheetEntry } from "@/types/v2";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeBehavior(key: string, text: string, dims: string[], enabled = true): Behavior {
  return {
    key,
    text,
    frequency: "daily",
    dimensions: dims.map(d => ({ dimension: d as import("@/types/v2").DimensionKey, direction: "builds" as const, reasoning: "" })),
    enabled,
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

function makeEntry(key: string, text: string, checked: boolean, dims: string[] = []): SheetEntry {
  return {
    id: key,
    aspirationId: "asp-1",
    behaviorKey: key,
    behaviorText: text,
    detail: "",
    timeOfDay: "morning",
    dimensions: dims,
    checked,
  };
}

// ─── Mock localStorage ───────────────────────────────────────────────────────

const store: Record<string, string> = {};

beforeEach(() => {
  for (const key of Object.keys(store)) delete store[key];

  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
    },
    writable: true,
    configurable: true,
  });
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("compileSheetOffline", () => {
  const date = "2026-04-08";
  const yesterdayKey = "huma-v2-sheet-2026-04-07";

  it("returns unchecked items from yesterday", () => {
    const entries = [
      makeEntry("b1", "Meditate", false, ["body", "growth"]),
      makeEntry("b2", "Exercise", true, ["body"]),
      makeEntry("b3", "Journal", false, ["growth"]),
    ];
    store[yesterdayKey] = JSON.stringify(entries);

    const aspirations = [makeAspiration("asp-1", [
      makeBehavior("b1", "Meditate", ["body", "growth"]),
      makeBehavior("b2", "Exercise", ["body"]),
      makeBehavior("b3", "Journal", ["growth"]),
    ])];

    const result = compileSheetOffline(aspirations, [], date);

    // b2 was checked yesterday — should not appear
    const keys = result.entries.map(e => e.behaviorKey);
    expect(keys).toContain("b1");
    expect(keys).toContain("b3");
    expect(keys).not.toContain("b2");
  });

  it("includes behaviors not shown yesterday", () => {
    // Yesterday only had b1
    store[yesterdayKey] = JSON.stringify([makeEntry("b1", "Meditate", true, ["body"])]);

    const aspirations = [makeAspiration("asp-1", [
      makeBehavior("b1", "Meditate", ["body"]),
      makeBehavior("b2", "Exercise", ["body", "joy"]),
    ])];

    const result = compileSheetOffline(aspirations, [], date);
    const keys = result.entries.map(e => e.behaviorKey);
    // b1 was checked, so won't appear as unchecked-from-yesterday
    // b2 was not shown yesterday, so it appears as a new candidate
    expect(keys).toContain("b2");
  });

  it("sorts by dimensional breadth first, then unchecked streak", () => {
    store[yesterdayKey] = JSON.stringify([
      makeEntry("b1", "Meditate", false, ["body"]),       // 1 dim
      makeEntry("b2", "Walk", false, ["body", "joy"]),     // 2 dims
      makeEntry("b3", "Journal", false, ["growth", "identity", "purpose"]), // 3 dims
    ]);

    const aspirations = [makeAspiration("asp-1", [
      makeBehavior("b1", "Meditate", ["body"]),
      makeBehavior("b2", "Walk", ["body", "joy"]),
      makeBehavior("b3", "Journal", ["growth", "identity", "purpose"]),
    ])];

    const result = compileSheetOffline(aspirations, [], date);

    // Should be ordered: b3 (3 dims) > b2 (2 dims) > b1 (1 dim)
    expect(result.entries[0].behaviorKey).toBe("b3");
    expect(result.entries[1].behaviorKey).toBe("b2");
    expect(result.entries[2].behaviorKey).toBe("b1");
  });

  it("uses unchecked streak as tiebreaker", () => {
    store[yesterdayKey] = JSON.stringify([
      makeEntry("b1", "Meditate", false, ["body", "growth"]),
      makeEntry("b2", "Walk", false, ["body", "joy"]),
    ]);

    const aspirations = [makeAspiration("asp-1", [
      makeBehavior("b1", "Meditate", ["body", "growth"]),
      makeBehavior("b2", "Walk", ["body", "joy"]),
    ])];

    // b2 has a 3-day unchecked streak, b1 has 1-day
    const history = [
      { date: "2026-04-07", behaviorKey: "b1", checked: false },
      { date: "2026-04-06", behaviorKey: "b1", checked: true },
      { date: "2026-04-07", behaviorKey: "b2", checked: false },
      { date: "2026-04-06", behaviorKey: "b2", checked: false },
      { date: "2026-04-05", behaviorKey: "b2", checked: false },
    ];

    const result = compileSheetOffline(aspirations, history, date);

    // Same dimension count (2), but b2 has longer streak
    expect(result.entries[0].behaviorKey).toBe("b2");
    expect(result.entries[1].behaviorKey).toBe("b1");
  });

  it("caps at 5 entries", () => {
    const behaviors = Array.from({ length: 8 }, (_, i) =>
      makeBehavior(`b${i}`, `Behavior ${i}`, ["body"])
    );
    const entries = behaviors.map(b => makeEntry(b.key, b.text, false, ["body"]));
    store[yesterdayKey] = JSON.stringify(entries);

    const aspirations = [makeAspiration("asp-1", behaviors)];
    const result = compileSheetOffline(aspirations, [], date);

    expect(result.entries.length).toBe(5);
  });

  it("sets compiledOffline flag", () => {
    store[yesterdayKey] = JSON.stringify([makeEntry("b1", "Meditate", false)]);
    const aspirations = [makeAspiration("asp-1", [makeBehavior("b1", "Meditate", ["body"])])];

    const result = compileSheetOffline(aspirations, [], date);
    expect(result.compiledOffline).toBe(true);
    expect(result.throughLine).toBeNull();
    expect(result.date).toBe(date);
  });

  it("returns empty entries when no history available", () => {
    // No yesterday cache, no behaviors
    const result = compileSheetOffline([], [], date);
    expect(result.entries).toEqual([]);
    expect(result.compiledOffline).toBe(true);
  });

  it("excludes disabled behaviors", () => {
    store[yesterdayKey] = JSON.stringify([]);
    const aspirations = [makeAspiration("asp-1", [
      makeBehavior("b1", "Active", ["body"], true),
      makeBehavior("b2", "Disabled", ["body"], false),
    ])];

    const result = compileSheetOffline(aspirations, [], date);
    const keys = result.entries.map(e => e.behaviorKey);
    expect(keys).toContain("b1");
    expect(keys).not.toContain("b2");
  });
});
