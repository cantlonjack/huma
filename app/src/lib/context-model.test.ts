import { describe, it, expect } from "vitest";
import {
  mergeContext,
  contextCompleteness,
  contextForPrompt,
  completenessHint,
  dimensionsTouched,
  migrateFromKnownContext,
} from "./context-model";
import { createEmptyContext } from "@/types/context";
import type { HumaContext } from "@/types/context";
import type { KnownContext } from "@/types/v2";

// ─── Deep Merge ──────────────────────────────────────────────────────────────

describe("mergeContext — deep merge", () => {
  it("adds new dimension data without clobbering existing", () => {
    const existing = createEmptyContext();
    existing.body.sleep = "8 hours";
    existing.body.nutrition = "animal-based";

    const result = mergeContext(existing, { body: { capacity: "high energy" } });
    expect(result.body.sleep).toBe("8 hours");
    expect(result.body.nutrition).toBe("animal-based");
    expect(result.body.capacity).toBe("high energy");
  });

  it("deduplicates array items by name field (household members)", () => {
    const existing = createEmptyContext();
    existing.people.household = [
      { name: "Sarah", relationship: "wife" },
      { name: "Lena", relationship: "daughter" },
    ];

    const result = mergeContext(existing, {
      people: { household: [{ name: "Sarah", relationship: "wife", age: 34 }] },
    });

    expect(result.people.household).toHaveLength(2);
    const sarah = result.people.household!.find(p => p.name === "Sarah");
    expect(sarah?.age).toBe(34);
    expect(sarah?.relationship).toBe("wife");
  });

  it("scalar fields update, don't append", () => {
    const existing = createEmptyContext();
    existing.home.location = "Detroit";

    const result = mergeContext(existing, { home: { location: "Portland" } });
    expect(result.home.location).toBe("Portland");
  });

  it("string arrays are deduplicated", () => {
    const existing = createEmptyContext();
    existing.joy.sources = ["gardening", "reading"];

    const result = mergeContext(existing, { joy: { sources: ["reading", "cooking"] } });
    expect(result.joy.sources).toEqual(["gardening", "reading", "cooking"]);
  });

  it("merge with null fields doesn't crash", () => {
    const existing = createEmptyContext();
    existing.body.sleep = "7 hours";

    // Passing undefined values should be safe
    const result = mergeContext(existing, { body: { sleep: undefined } } as Partial<HumaContext>);
    expect(result.body.sleep).toBe("7 hours");
  });

  it("merge with empty extracted preserves everything", () => {
    const existing = createEmptyContext();
    existing.home.location = "Michigan";
    existing.body.sleep = "8 hours";

    const result = mergeContext(existing, {});
    expect(result.home.location).toBe("Michigan");
    expect(result.body.sleep).toBe("8 hours");
  });

  it("newer scalar wins over existing", () => {
    const existing = createEmptyContext();
    existing.money.income = "$60k";

    const result = mergeContext(existing, { money: { income: "$85k" } });
    expect(result.money.income).toBe("$85k");
  });

  it("preserves _version from existing context", () => {
    const existing = createEmptyContext();
    existing._version = 3;

    const result = mergeContext(existing, { body: { sleep: "6h" } });
    expect(result._version).toBe(3);
  });

  it("updates _lastUpdated on merge", () => {
    const existing = createEmptyContext();
    const oldTimestamp = existing._lastUpdated;

    // Small delay to ensure different timestamp
    const result = mergeContext(existing, { body: { sleep: "7h" } });
    expect(result._lastUpdated).toBeDefined();
    expect(typeof result._lastUpdated).toBe("string");
  });

  it("tracks sources for merged fields", () => {
    const existing = createEmptyContext();
    const result = mergeContext(
      existing,
      { body: { sleep: "6 hours" }, home: { location: "Portland" } },
      "conversation",
      "msg-abc",
    );

    expect(result._sources.length).toBeGreaterThanOrEqual(2);
    const sleepSource = result._sources.find(s => s.fieldPath === "body.sleep");
    expect(sleepSource?.value).toBe("6 hours");
    expect(sleepSource?.source).toBe("conversation");
    expect(sleepSource?.messageId).toBe("msg-abc");
  });

  it("caps sources at 200 entries", () => {
    const existing = createEmptyContext();
    existing._sources = Array.from({ length: 199 }, (_, i) => ({
      fieldPath: `field-${i}`,
      value: i,
      source: "conversation" as const,
      date: new Date().toISOString(),
    }));

    const result = mergeContext(existing, { body: { sleep: "7h", capacity: "good" } });
    expect(result._sources.length).toBeLessThanOrEqual(200);
  });

  it("strips meta fields (_sources, _lastUpdated, _version) from extracted before merge", () => {
    const existing = createEmptyContext();
    const result = mergeContext(existing, {
      body: { sleep: "7h" },
      _sources: [{ fieldPath: "x", value: "y", source: "explicit", date: "" }],
      _version: 99,
    } as Partial<HumaContext>);

    // _version should be from existing, not from extracted
    expect(result._version).toBe(existing._version);
  });
});

// ─── Completeness Scoring ────────────────────────────────────────────────────

describe("contextCompleteness", () => {
  it("returns 0% for empty context", () => {
    const ctx = createEmptyContext();
    const comp = contextCompleteness(ctx);
    expect(comp.overall).toBe(0);
    expect(comp.dimensions.every(d => d.percentage === 0)).toBe(true);
  });

  it("scores a single dimension correctly", () => {
    const ctx = createEmptyContext();
    ctx.body.sleep = "8 hours";
    ctx.body.nutrition = "good";
    // body has 4 fields: conditions, capacity, sleep, nutrition — 2/4 = 50%

    const comp = contextCompleteness(ctx);
    const body = comp.dimensions.find(d => d.dimension === "body");
    expect(body).toBeDefined();
    expect(body!.fieldCount).toBe(2);
    expect(body!.totalFields).toBe(4);
    expect(body!.percentage).toBe(50);
  });

  it("computes overall as average across dimensions", () => {
    const ctx = createEmptyContext();
    // Fill all 4 body fields
    ctx.body.conditions = ["healthy"];
    ctx.body.capacity = "high";
    ctx.body.sleep = "8h";
    ctx.body.nutrition = "balanced";
    // body = 100%, all others = 0%
    // Overall = (100 + 0*8) / 9 = ~11

    const comp = contextCompleteness(ctx);
    expect(comp.overall).toBe(Math.round(100 / 9));
  });

  it("identifies strong dimensions (>= 50%)", () => {
    const ctx = createEmptyContext();
    ctx.body.conditions = ["knee"];
    ctx.body.capacity = "limited";
    ctx.body.sleep = "6h";
    // 3/4 = 75%

    const comp = contextCompleteness(ctx);
    expect(comp.strongDimensions).toContain("Body");
  });

  it("identifies sparse dimensions (< 25%)", () => {
    const ctx = createEmptyContext();
    // All dimensions empty
    const comp = contextCompleteness(ctx);
    expect(comp.sparseDimensions.length).toBe(9); // all 9 are sparse
  });

  it("reports sparseSummary with missing fields", () => {
    const ctx = createEmptyContext();
    ctx.body.sleep = "7h";

    const comp = contextCompleteness(ctx);
    const body = comp.dimensions.find(d => d.dimension === "body");
    expect(body!.sparseSummary).toContain("conditions");
    expect(body!.sparseSummary).toContain("capacity");
    expect(body!.sparseSummary).toContain("nutrition");
  });

  it("returns no sparseSummary for fully complete dimension", () => {
    const ctx = createEmptyContext();
    ctx.joy.sources = ["gardening"];
    ctx.joy.drains = ["commute"];
    ctx.joy.rhythms = ["morning coffee"];

    const comp = contextCompleteness(ctx);
    const joy = comp.dimensions.find(d => d.dimension === "joy");
    expect(joy!.percentage).toBe(100);
    expect(joy!.sparseSummary).toBeUndefined();
  });
});

// ─── All 9 Dimensions ───────────────────────────────────────────────────────

describe("contextCompleteness — all 9 dimensions", () => {
  it("scores body dimension (4 fields)", () => {
    const ctx = createEmptyContext();
    ctx.body = { conditions: ["asthma"], capacity: "moderate", sleep: "7h", nutrition: "omnivore" };
    const comp = contextCompleteness(ctx);
    expect(comp.dimensions.find(d => d.dimension === "body")!.percentage).toBe(100);
  });

  it("scores people dimension (3 fields)", () => {
    const ctx = createEmptyContext();
    ctx.people = { household: [{ name: "A", relationship: "spouse" }], community: [], professional: [] };
    const comp = contextCompleteness(ctx);
    const people = comp.dimensions.find(d => d.dimension === "people")!;
    // household has value, community/professional are empty arrays
    expect(people.fieldCount).toBe(1);
    expect(people.totalFields).toBe(3);
  });

  it("scores money dimension (6 fields)", () => {
    const ctx = createEmptyContext();
    ctx.money = { income: "$50k", constraints: ["tight"], enterprises: [], debt: "$10k", savings: "$5k", financialGoal: "retire" };
    const comp = contextCompleteness(ctx);
    const money = comp.dimensions.find(d => d.dimension === "money")!;
    // enterprises is empty array — doesn't count
    expect(money.fieldCount).toBe(5);
    expect(money.totalFields).toBe(6);
  });

  it("scores home dimension (5 fields)", () => {
    const ctx = createEmptyContext();
    ctx.home = { location: "Detroit", type: "house", resources: [], infrastructure: [], land: "1 acre" };
    const comp = contextCompleteness(ctx);
    const home = comp.dimensions.find(d => d.dimension === "home")!;
    // location, type, land have value; resources and infrastructure are empty arrays
    expect(home.fieldCount).toBe(3);
  });

  it("scores growth dimension (4 fields)", () => {
    const ctx = createEmptyContext();
    ctx.growth = { skills: [{ name: "coding", level: "expert" }], gaps: ["design"], currentLearning: ["React"], interests: [] };
    const comp = contextCompleteness(ctx);
    const growth = comp.dimensions.find(d => d.dimension === "growth")!;
    expect(growth.fieldCount).toBe(3);
    expect(growth.totalFields).toBe(4);
  });

  it("scores joy dimension (3 fields)", () => {
    const ctx = createEmptyContext();
    ctx.joy = { sources: ["music"], drains: ["traffic"], rhythms: ["evening walk"] };
    const comp = contextCompleteness(ctx);
    expect(comp.dimensions.find(d => d.dimension === "joy")!.percentage).toBe(100);
  });

  it("scores purpose dimension (4 fields)", () => {
    const ctx = createEmptyContext();
    ctx.purpose = { whyStatement: "Help others", contribution: "teaching", vision: "school", values: ["kindness"] };
    const comp = contextCompleteness(ctx);
    expect(comp.dimensions.find(d => d.dimension === "purpose")!.percentage).toBe(100);
  });

  it("scores identity dimension (3 fields)", () => {
    const ctx = createEmptyContext();
    ctx.identity = { archetypes: ["Homesteader"], roles: ["father"], culture: "midwest" };
    const comp = contextCompleteness(ctx);
    expect(comp.dimensions.find(d => d.dimension === "identity")!.percentage).toBe(100);
  });

  it("scores time dimension (3 fields)", () => {
    const ctx = createEmptyContext();
    ctx.time = { stage: "mid-career", timeBlocks: [{ day: "weekdays", time: "5-6am" }], constraints: ["kids"] };
    const comp = contextCompleteness(ctx);
    expect(comp.dimensions.find(d => d.dimension === "time")!.percentage).toBe(100);
  });
});

// ─── completenessHint ────────────────────────────────────────────────────────

describe("completenessHint", () => {
  it("returns 'know nothing' for empty context", () => {
    const ctx = createEmptyContext();
    const hint = completenessHint(ctx);
    expect(hint).toContain("nothing");
  });

  it("mentions strong and sparse dimensions", () => {
    const ctx = createEmptyContext();
    ctx.body = { conditions: ["asthma"], capacity: "moderate", sleep: "7h", nutrition: "omnivore" };
    const hint = completenessHint(ctx);
    expect(hint).toContain("Body");
    expect(hint).toContain("very little");
  });
});

// ─── dimensionsTouched ───────────────────────────────────────────────────────

describe("dimensionsTouched", () => {
  it("returns labels for dimensions with values in extracted context", () => {
    const extracted: Partial<HumaContext> = {
      body: { sleep: "7h" },
      home: { location: "Portland" },
    };
    const touched = dimensionsTouched(extracted);
    expect(touched).toContain("Body");
    expect(touched).toContain("Home");
    expect(touched).not.toContain("Money");
  });

  it("returns empty for empty extracted", () => {
    expect(dimensionsTouched({})).toEqual([]);
  });

  it("ignores dimensions with only empty objects", () => {
    const extracted: Partial<HumaContext> = {
      body: {},
    };
    const touched = dimensionsTouched(extracted);
    expect(touched).not.toContain("Body");
  });
});

// ─── migrateFromKnownContext ─────────────────────────────────────────────────

describe("migrateFromKnownContext", () => {
  it("migrates people", () => {
    const old: KnownContext = { people: [{ name: "Sarah", role: "wife" }] };
    const ctx = migrateFromKnownContext(old);
    expect(ctx.people.household).toHaveLength(1);
    expect(ctx.people.household![0].name).toBe("Sarah");
    expect(ctx.people.household![0].relationship).toBe("wife");
  });

  it("migrates place to home.location", () => {
    const old: KnownContext = { place: { name: "Detroit", detail: "suburb" } };
    const ctx = migrateFromKnownContext(old);
    expect(ctx.home.location).toBe("Detroit");
    expect(ctx.home.type).toBe("suburb");
  });

  it("migrates financial context", () => {
    const old: KnownContext = { financial: { income: "$60k", constraints: ["tight budget"], rhythm: "bi-weekly" } };
    const ctx = migrateFromKnownContext(old);
    expect(ctx.money.income).toBe("$60k");
    expect(ctx.money.constraints).toContain("tight budget");
    expect(ctx.money.rhythm).toBe("bi-weekly");
  });

  it("migrates work to enterprise + identity role", () => {
    const old: KnownContext = { work: { title: "Software Engineer", detail: "remote" } };
    const ctx = migrateFromKnownContext(old);
    expect(ctx.money.enterprises).toHaveLength(1);
    expect(ctx.money.enterprises![0].name).toBe("Software Engineer");
    expect(ctx.identity.roles).toContain("Software Engineer");
  });

  it("sets whyStatement and archetypes when provided", () => {
    const old: KnownContext = {};
    const ctx = migrateFromKnownContext(old, "Build self-sufficiency", ["Homesteader"]);
    expect(ctx.purpose.whyStatement).toBe("Build self-sufficiency");
    expect(ctx.identity.archetypes).toEqual(["Homesteader"]);
  });

  it("handles empty KnownContext without crashing", () => {
    const ctx = migrateFromKnownContext({});
    expect(ctx.body).toBeDefined();
    expect(ctx.people).toBeDefined();
    expect(ctx._version).toBe(1);
  });
});
