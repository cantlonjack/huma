import { describe, it, expect } from "vitest";
import {
  getRpplAction,
  getRpplHealth,
  getRpplOutputs,
  getTodayActions,
  getRpplStatus,
} from "./rppl-interface";
import type { Aspiration, Pattern, Behavior } from "@/types/v2";

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
  behaviorKey: string,
  overrides: Partial<Pattern> = {},
): Pattern {
  return {
    id,
    aspirationId,
    name: `Pattern ${id}`,
    trigger: "trigger",
    steps: [{ behaviorKey, text: "t", order: 1, isTrigger: true }],
    validationCount: 10,
    validationTarget: 30,
    status: "working",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// Known date → day mapping:
// 2026-04-17 is a Friday.
const FRIDAY = "2026-04-17";
const MONDAY = "2026-04-13";

// ─── getRpplAction ───────────────────────────────────────────────────────────

describe("getRpplAction", () => {
  it("returns null for inactive aspiration", () => {
    const asp = makeAspiration("a1", "Move", [makeBehavior("b1", "walk")], {
      status: "paused",
    });
    const out = getRpplAction("a1", "b1", [asp], FRIDAY);
    expect(out).toBeNull();
  });

  it("returns null for unknown aspiration ID", () => {
    expect(getRpplAction("nope", "b1", [], FRIDAY)).toBeNull();
  });

  it("returns null for disabled behavior", () => {
    const asp = makeAspiration("a1", "Move", [
      makeBehavior("b1", "walk", "body", { enabled: false }),
    ]);
    expect(getRpplAction("a1", "b1", [asp], FRIDAY)).toBeNull();
  });

  it("returns null when behavior has specific-days frequency and today is NOT in the days list", () => {
    const asp = makeAspiration("a1", "Move", [
      makeBehavior("b1", "walk", "body", {
        frequency: "specific-days",
        days: ["monday", "wednesday"],
      }),
    ]);
    // Friday — not in list
    const out = getRpplAction("a1", "b1", [asp], FRIDAY);
    expect(out).toBeNull();
  });

  it("returns action when specific-days frequency and today IS in the days list", () => {
    const asp = makeAspiration("a1", "Move", [
      makeBehavior("b1", "walk", "body", {
        frequency: "specific-days",
        days: ["monday", "friday"],
      }),
    ]);
    const out = getRpplAction("a1", "b1", [asp], FRIDAY);
    expect(out).not.toBeNull();
    expect(out!.behaviorKey).toBe("b1");
  });

  it("returns a populated RpplAction for a daily active behavior", () => {
    const asp = makeAspiration("a1", "Move", [
      makeBehavior("b1", "walk", "body", { detail: "20 min" }),
    ]);
    const out = getRpplAction("a1", "b1", [asp], FRIDAY);
    expect(out).toMatchObject({
      behaviorKey: "b1",
      text: "walk",
      detail: "20 min",
      frequency: "daily",
      aspirationId: "a1",
      aspirationTitle: "Move",
      dimensions: ["body"],
      isTrigger: false,
    });
  });
});

// ─── getTodayActions ─────────────────────────────────────────────────────────

describe("getTodayActions", () => {
  it("returns one action per active behavior across all active aspirations", () => {
    const asps: Aspiration[] = [
      makeAspiration("a1", "A", [
        makeBehavior("b1", "one", "body"),
        makeBehavior("b2", "two", "growth"),
      ]),
      makeAspiration("a2", "B", [makeBehavior("b3", "three", "money")]),
    ];
    const out = getTodayActions(asps, FRIDAY);
    expect(out).toHaveLength(3);
  });

  it("skips inactive aspirations", () => {
    const asps: Aspiration[] = [
      makeAspiration("a1", "Active", [makeBehavior("b1", "x")]),
      makeAspiration("a2", "Paused", [makeBehavior("b2", "y")], { status: "paused" }),
    ];
    expect(getTodayActions(asps, MONDAY)).toHaveLength(1);
  });
});

// ─── getRpplHealth ───────────────────────────────────────────────────────────

describe("getRpplHealth", () => {
  it("status 'validated' when pattern.status is 'validated'", () => {
    const pattern = makePattern("p1", "a1", "b1", { status: "validated" });
    const h = getRpplHealth("a1", "b1", [pattern], { "a1:b1": { completed: 5, total: 7 } });
    expect(h.status).toBe("validated");
  });

  it("status 'dormant' with no completions AND no pattern", () => {
    const h = getRpplHealth("a1", "b1", [], undefined);
    expect(h.status).toBe("dormant");
  });

  it("trend 'rising' when rate >= 70 and pattern.status is 'working'", () => {
    const pattern = makePattern("p1", "a1", "b1", { status: "working" });
    const h = getRpplHealth("a1", "b1", [pattern], {
      "a1:b1": { completed: 6, total: 7 }, // 86%
    });
    expect(h.completionRate).toBeGreaterThanOrEqual(70);
    expect(h.trend).toBe("rising");
  });

  it("trend 'dropping' when rate <= 30 and there are prior completions", () => {
    const pattern = makePattern("p1", "a1", "b1", { status: "working" });
    const h = getRpplHealth("a1", "b1", [pattern], {
      "a1:b1": { completed: 2, total: 7 }, // ~29%
    });
    expect(h.completionRate).toBeLessThanOrEqual(30);
    expect(h.trend).toBe("dropping");
  });

  it("validationCount/target are surfaced from the pattern", () => {
    const pattern = makePattern("p1", "a1", "b1", {
      validationCount: 17,
      validationTarget: 30,
    });
    const h = getRpplHealth("a1", "b1", [pattern]);
    expect(h.validationCount).toBe(17);
    expect(h.validationTarget).toBe(30);
  });
});

// ─── getRpplOutputs ──────────────────────────────────────────────────────────

describe("getRpplOutputs", () => {
  it("maps body dimension → living capital with strength based on completion rate", () => {
    const asp = makeAspiration("a1", "Move", [makeBehavior("b1", "walk", "body")]);
    const out = getRpplOutputs("a1", "b1", [asp], {
      "a1:b1": { completed: 6, total: 7 },
    });
    expect(out.dimensionsAffected).toContain("body");
    expect(out.capitalEffects[0]).toMatchObject({
      capital: "living",
      direction: "builds",
      strength: "strong",
    });
  });

  it("defaults windowDays to 28", () => {
    const asp = makeAspiration("a1", "Move", [makeBehavior("b1", "walk")]);
    const out = getRpplOutputs("a1", "b1", [asp]);
    expect(out.windowDays).toBe(28);
  });
});

// ─── getRpplStatus ───────────────────────────────────────────────────────────

describe("getRpplStatus", () => {
  it("bundles action+health+outputs for an active behavior", () => {
    const asp = makeAspiration("a1", "Move", [makeBehavior("b1", "walk")]);
    const pattern = makePattern("p1", "a1", "b1", { status: "working" });
    const status = getRpplStatus(
      "a1",
      "b1",
      [asp],
      [pattern],
      FRIDAY,
      { "a1:b1": { completed: 6, total: 7 } },
    );
    expect(status.action).not.toBeNull();
    expect(status.health.status).toBe("working");
    expect(status.outputs.dimensionsAffected).toContain("body");
  });
});
