import { describe, it, expect } from "vitest";
import { verifyLifeGraph, verificationSummary, type GraphVerification } from "./graph-verification";
import { createEmptyContext } from "@/types/context";
import type { CapacityState } from "@/types/context";
import type { Aspiration, Pattern, Behavior } from "@/types/v2";
import type { RpplSeed } from "@/data/rppl-seeds/types";

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeBehavior(
  key: string,
  text: string,
  dimension: Behavior["dimensions"][number]["dimension"] = "body",
  overrides: Partial<Behavior> = {},
): Behavior {
  return {
    key,
    text,
    frequency: "daily",
    enabled: true,
    dimensions: [{ dimension, direction: "builds", reasoning: "" }],
    ...overrides,
  };
}

function makeAspiration(
  id: string,
  title: string,
  behaviors: Behavior[],
  overrides: Partial<Aspiration> = {},
): Aspiration {
  return {
    id,
    rawText: title,
    clarifiedText: title,
    title,
    behaviors,
    dimensionsTouched: [],
    status: "active",
    stage: "active",
    ...overrides,
  };
}

function makePattern(
  id: string,
  aspirationId: string,
  overrides: Partial<Pattern> = {},
): Pattern {
  return {
    id,
    aspirationId,
    name: `Pattern ${id}`,
    trigger: "morning alarm",
    steps: [{ behaviorKey: "b1", text: "walk", order: 1, isTrigger: true }],
    validationCount: 10,
    validationTarget: 30,
    status: "working",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeFrameworkSeed(
  rpplId: string,
  opts: { requiresCapacity?: string } = {},
): RpplSeed {
  const seed: RpplSeed = {
    rpplId,
    type: "framework",
    name: `Framework for ${rpplId}`,
    domain: "meta",
    description: "test framework",
    provenance: { source: "research" },
    evidence: { confidence: "seed", contextTags: [] },
    contextTags: [],
  };
  if (opts.requiresCapacity) {
    seed.inputs = [
      {
        name: "Capacity input",
        portType: "capacity",
        key: opts.requiresCapacity,
        required: true,
      },
    ];
  }
  return seed;
}

function makeCapacityState(overrides: Partial<CapacityState> = {}): CapacityState {
  return {
    awareness: "developing",
    honesty: "developing",
    care: "developing",
    agency: "developing",
    humility: "developing",
    ...overrides,
  };
}

// ─── verifyLifeGraph ─────────────────────────────────────────────────────────

describe("verifyLifeGraph", () => {
  it("no aspirations → integrity 'gaps' (all 8 capitals dormant) or 'valid'", () => {
    const ctx = createEmptyContext();
    const result = verifyLifeGraph([], [], [], ctx);
    // No aspirations, no behaviors → all capitals dormant → should be "gaps"
    expect(["valid", "gaps"]).toContain(result.integrity);
    expect(result.unconnectedAspirations).toEqual([]);
  });

  it("active aspiration with zero behaviors → unconnected + high-impact suggestion", () => {
    const ctx = createEmptyContext();
    const orphan = makeAspiration("a1", "Write book", []);
    const result = verifyLifeGraph([orphan], [], [], ctx);

    expect(result.unconnectedAspirations).toContain("Write book");
    const highSuggestions = result.suggestions.filter(s => s.impact === "high");
    expect(highSuggestions.length).toBeGreaterThan(0);
    expect(highSuggestions.some(s => s.target === "Write book")).toBe(true);
  });

  it("blocking PortViolation when capacity requirement unmet (undeveloped awareness + framework requires awareness)", () => {
    const ctx = createEmptyContext();
    ctx.capacityState = makeCapacityState({ awareness: "undeveloped" });

    const asp = makeAspiration("a1", "Think well", [makeBehavior("b1", "morning pages", "growth")]);
    const pattern = makePattern("p1", "a1", {
      provenance: { source: "research", rpplId: "rppl:framework:trivium:v1" },
    });
    const seed = makeFrameworkSeed("rppl:framework:trivium:v1", { requiresCapacity: "awareness" });

    const result = verifyLifeGraph([asp], [pattern], [seed], ctx);

    const blocking = result.unsatisfiedInputs.filter(v => v.severity === "blocking");
    expect(blocking.length).toBeGreaterThan(0);
    expect(blocking[0].rpplId).toBe("rppl:framework:trivium:v1");
    expect(blocking[0].port.key).toBe("awareness");
  });

  it("two patterns sharing the same timeWindow → one PortConflict", () => {
    const ctx = createEmptyContext();
    const asp = makeAspiration("a1", "Morning", [
      makeBehavior("b1", "walk", "body"),
      makeBehavior("b2", "write", "growth"),
    ]);
    const p1 = makePattern("p1", "a1", {
      timeWindow: "5:30-6:00 AM",
      steps: [{ behaviorKey: "b1", text: "walk", order: 1, isTrigger: true }],
    });
    const p2 = makePattern("p2", "a1", {
      timeWindow: "5:30-6:00 AM",
      steps: [{ behaviorKey: "b2", text: "write", order: 1, isTrigger: true }],
    });

    const result = verifyLifeGraph([asp], [p1, p2], [], ctx);

    expect(result.conflicts.length).toBeGreaterThan(0);
    expect(result.conflicts[0].resource).toBe("time:5:30-6:00 AM");
    expect(result.integrity).toBe("conflicts");
  });

  it("pattern whose aspirationId references a 'dropped' aspiration → added to orphanPractices", () => {
    const ctx = createEmptyContext();
    const dropped = makeAspiration("dropped-1", "Old aspiration", [], {
      status: "dropped",
    });
    const orphanPattern = makePattern("p-orphan", "dropped-1", {
      name: "Orphaned routine",
    });

    const result = verifyLifeGraph([dropped], [orphanPattern], [], ctx);
    expect(result.orphanPractices).toContain("Orphaned routine");
  });

  it("pattern referencing unknown aspirationId is also orphan", () => {
    const ctx = createEmptyContext();
    const pattern = makePattern("p-orphan", "nonexistent", { name: "Ghost pattern" });
    const result = verifyLifeGraph([], [pattern], [], ctx);
    expect(result.orphanPractices).toContain("Ghost pattern");
  });
});

// ─── verificationSummary ─────────────────────────────────────────────────────

describe("verificationSummary", () => {
  it("returns canonical message when integrity valid and no suggestions", () => {
    const v: GraphVerification = {
      integrity: "valid",
      unconnectedAspirations: [],
      unsatisfiedInputs: [],
      conflicts: [],
      dormantCapitals: [],
      orphanPractices: [],
      suggestions: [],
    };
    expect(verificationSummary(v)).toBe("GRAPH: valid, no gaps or conflicts");
  });

  it("truncates to top 3 suggestions", () => {
    const v: GraphVerification = {
      integrity: "gaps",
      unconnectedAspirations: [],
      unsatisfiedInputs: [],
      conflicts: [],
      dormantCapitals: [],
      orphanPractices: [],
      suggestions: [
        { type: "close-gap", target: "t1", suggestion: "S1", impact: "high" },
        { type: "close-gap", target: "t2", suggestion: "S2", impact: "high" },
        { type: "close-gap", target: "t3", suggestion: "S3", impact: "high" },
        { type: "close-gap", target: "t4", suggestion: "S4", impact: "high" },
        { type: "close-gap", target: "t5", suggestion: "S5", impact: "high" },
      ],
    };
    const out = verificationSummary(v);
    expect(out).toContain("S1");
    expect(out).toContain("S2");
    expect(out).toContain("S3");
    expect(out).not.toContain("S4");
    expect(out).not.toContain("S5");
  });

  it("surfaces unconnected, blocked, dormant, conflict summaries", () => {
    const v: GraphVerification = {
      integrity: "gaps",
      unconnectedAspirations: ["Write book"],
      unsatisfiedInputs: [
        {
          rpplId: "rppl:framework:trivium:v1",
          rpplName: "Trivium",
          port: { name: "aw", portType: "capacity", key: "awareness", required: true },
          reason: "capacity 'awareness' is undeveloped",
          severity: "blocking",
        },
      ],
      conflicts: [
        { practiceA: "x", practiceB: "y", resource: "time:morning", description: "" },
      ],
      dormantCapitals: ["financial", "cultural"],
      orphanPractices: [],
      suggestions: [],
    };
    const out = verificationSummary(v);
    expect(out).toContain("GRAPH: gaps");
    expect(out).toContain("unconnected: Write book");
    expect(out).toContain("blocked: Trivium(awareness)");
    expect(out).toContain("dormant: financial, cultural");
    expect(out).toContain("conflicts: 1");
  });
});
