import { describe, it, expect } from "vitest";
import {
  encodeFolded,
  encodeAspiration,
  encodePractice,
  encodeLifeGraph,
  compressConversationHistory,
  type EncodingInput,
  type ConversationMessage,
} from "./context-encoding";
import { createEmptyContext } from "@/types/context";
import type { HumaContext, CapacityState } from "@/types/context";
import type { Aspiration, Behavior } from "@/types/v2";
import type { CapitalScore } from "@/engine/canvas-types";

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeBehavior(
  key: string,
  text: string,
  dimension: Behavior["dimensions"][number]["dimension"],
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

function makeCapacityState(overrides: Partial<CapacityState> = {}): CapacityState {
  return {
    awareness: "emerging",
    honesty: "emerging",
    care: "developing",
    agency: "emerging",
    humility: "developing",
    ...overrides,
  };
}

function makeRichContext(): HumaContext {
  const ctx = createEmptyContext();
  ctx.body.sleep = "7h";
  ctx.body.conditions = ["knee pain"];
  ctx.people.household = [
    { name: "Sarah", relationship: "wife" },
    { name: "Lena", relationship: "daughter" },
  ];
  ctx.money.income = "~$85k household";
  ctx.money.debt = "$22k student loans";
  ctx.home.location = "rural Michigan";
  ctx.home.land = "2 acres";
  ctx.growth.currentLearning = ["Rust", "cheesemaking"];
  ctx.joy.sources = ["gardening", "reading"];
  ctx.purpose.whyStatement = "Build a self-sufficient homestead";
  ctx.identity.archetypes = ["Homesteader"];
  ctx.capacityState = makeCapacityState();
  return ctx;
}

function makeCapitalScores(): CapitalScore[] {
  return [
    { form: "financial", score: 2.5, note: "", confidence: 1 },
    { form: "material", score: 3.0, note: "", confidence: 1 },
    { form: "living", score: 3.5, note: "", confidence: 1 },
    { form: "social", score: 4.0, note: "", confidence: 1 },
    { form: "intellectual", score: 3.0, note: "", confidence: 1 },
    { form: "experiential", score: 2.5, note: "", confidence: 1 },
    { form: "spiritual", score: 3.5, note: "", confidence: 1 },
    { form: "cultural", score: 2.0, note: "", confidence: 1 },
  ];
}

// ─── encodeFolded ────────────────────────────────────────────────────────────

describe("encodeFolded", () => {
  it("produces minimal output with empty context — no throws", () => {
    const ctx = createEmptyContext();
    const input: EncodingInput = {
      context: ctx,
      aspirations: [],
      patterns: [],
    };
    const out = encodeFolded(input);
    expect(out).toBeTypeOf("string");
    expect(out).toContain("LIFE[");
    // Empty joy → joy-dormant flag
    expect(out).toContain("FLAGS");
    expect(out).toContain("joy-dormant");
  });

  it("realistic context produces header, WHY, capacity, dimensions, aspirations, flags", () => {
    const ctx = makeRichContext();
    const aspirations = [
      makeAspiration("a1", "Homestead", [makeBehavior("b1", "morning walk", "body")]),
      makeAspiration("a2", "Write daily", [makeBehavior("b2", "pages", "growth")]),
      makeAspiration("a3", "Pay off debt", [makeBehavior("b3", "log spend", "money")]),
    ];
    const input: EncodingInput = {
      context: ctx,
      aspirations,
      patterns: [],
      capitalScores: makeCapitalScores(),
      dayCount: 42,
      behaviorCounts: {
        "a1:b1": { completed: 5, total: 7 },
        "a2:b2": { completed: 2, total: 7 },
        "a3:b3": { completed: 7, total: 7 },
      },
    };

    const out = encodeFolded(input);

    // Header (LIFE[dN aN pN])
    expect(out).toMatch(/LIFE\[d42 a3 p0\]/);
    // WHY line
    expect(out).toContain(`WHY:"Build a self-sufficient homestead"`);
    // Capacity line
    expect(out).toContain("CAP[aw:2 ho:2 ca:3 ag:2 hu:3]");
    // Dimension lines (two lines of 4 dims)
    expect(out).toContain("body[");
    expect(out).toContain("people[");
    expect(out).toContain("money[");
    expect(out).toContain("home[");
    expect(out).toContain("growth[");
    expect(out).toContain("joy[");
    expect(out).toContain("purpose[");
    expect(out).toContain("identity[");
    // Aspiration lines (one per active)
    expect(out).toContain("ASP:");
    // Three aspiration lines
    const aspLines = out.split("\n").filter(l => l.trim().startsWith("ASP:"));
    expect(aspLines).toHaveLength(3);
    // Completion rate embedded: a3:b3 is 7/7 = 100%
    expect(out).toMatch(/ASP:Payoffdebt\[100%/);
    // Flags include debt-active (since money.debt is set)
    expect(out).toContain("FLAGS");
    expect(out).toContain("debt-active");
  });

  it("no capacityState → no CAP line", () => {
    const ctx = createEmptyContext();
    ctx.joy.sources = ["x"]; // avoid joy-dormant
    const input: EncodingInput = {
      context: ctx,
      aspirations: [],
      patterns: [],
    };
    const out = encodeFolded(input);
    expect(out).not.toContain("CAP[");
  });
});

// ─── encodeAspiration ────────────────────────────────────────────────────────

describe("encodeAspiration", () => {
  it("produces aspiration block with behaviors for valid ID", () => {
    const ctx = makeRichContext();
    const asp = makeAspiration("a1", "Homestead", [
      makeBehavior("b1", "morning walk", "body"),
      makeBehavior("b2", "evening journal", "growth"),
    ]);
    const input: EncodingInput = {
      context: ctx,
      aspirations: [asp],
      patterns: [],
      behaviorCounts: {
        "a1:b1": { completed: 6, total: 7 },
        "a1:b2": { completed: 2, total: 7 },
      },
    };
    const out = encodeAspiration(input, "a1");
    expect(out).toContain("ASP:Homestead[");
    expect(out).toContain("PRC:morning walk");
    expect(out).toContain("PRC:evening journal");
    // dim info surfaces
    expect(out).toMatch(/dims\[body\]/);
    expect(out).toMatch(/dims\[growth\]/);
  });

  it("detects dimension gaps when aspiration declares dimensionsTouched but no behaviors cover them", () => {
    const ctx = makeRichContext();
    const asp = makeAspiration(
      "a1",
      "Homestead",
      [makeBehavior("b1", "walk", "body")],
      { dimensionsTouched: ["body", "money"] },
    );
    const input: EncodingInput = {
      context: ctx,
      aspirations: [asp],
      patterns: [],
    };
    const out = encodeAspiration(input, "a1");
    expect(out).toContain("GAP: no active behavior for money");
  });

  it("returns ASP:not-found[...] for invalid ID rather than throwing", () => {
    const ctx = createEmptyContext();
    const input: EncodingInput = {
      context: ctx,
      aspirations: [],
      patterns: [],
    };
    expect(() => encodeAspiration(input, "missing-id")).not.toThrow();
    const out = encodeAspiration(input, "missing-id");
    expect(out).toBe("ASP:not-found[missing-id]");
  });
});

// ─── encodePractice ──────────────────────────────────────────────────────────

describe("encodePractice", () => {
  it("still produces output even when no pattern matches the behavior", () => {
    const ctx = createEmptyContext();
    const asp = makeAspiration("a1", "Move daily", [
      makeBehavior("b1", "walk", "body", { detail: "20 min outdoors" }),
    ]);
    const input: EncodingInput = {
      context: ctx,
      aspirations: [asp],
      patterns: [], // no patterns at all
      behaviorCounts: { "a1:b1": { completed: 3, total: 7 } },
    };

    expect(() => encodePractice(input, "a1", "b1")).not.toThrow();
    const out = encodePractice(input, "a1", "b1");
    expect(out).toContain("PRC:walk");
    expect(out).toContain("DETAIL: 20 min outdoors");
    expect(out).toContain("FREQ: daily");
    expect(out).toContain("EVIDENCE:");
  });

  it("returns not-found for invalid aspiration", () => {
    const ctx = createEmptyContext();
    const input: EncodingInput = { context: ctx, aspirations: [], patterns: [] };
    expect(encodePractice(input, "nope", "x")).toContain("not-found");
  });

  it("returns not-found for invalid behavior key within a valid aspiration", () => {
    const ctx = createEmptyContext();
    const asp = makeAspiration("a1", "Move", [makeBehavior("b1", "walk", "body")]);
    const input: EncodingInput = {
      context: ctx,
      aspirations: [asp],
      patterns: [],
    };
    expect(encodePractice(input, "a1", "bogus")).toContain("not-found[bogus]");
  });
});

// ─── encodeLifeGraph (router) ────────────────────────────────────────────────

describe("encodeLifeGraph", () => {
  it("aspiration level without focusId falls back to folded only", () => {
    const ctx = createEmptyContext();
    const input: EncodingInput = {
      context: ctx,
      aspirations: [],
      patterns: [],
    };
    const full = encodeLifeGraph(input, "aspiration");
    const folded = encodeFolded(input);
    expect(full).toBe(folded);
  });

  it("aspiration level with focusId concatenates folded + aspiration block", () => {
    const ctx = createEmptyContext();
    const asp = makeAspiration("a1", "Move", [makeBehavior("b1", "walk", "body")]);
    const input: EncodingInput = {
      context: ctx,
      aspirations: [asp],
      patterns: [],
    };
    const out = encodeLifeGraph(input, "aspiration", "a1");
    expect(out).toContain("LIFE[");
    expect(out).toContain("ASP:Move[");
  });
});

// ─── compressConversationHistory ─────────────────────────────────────────────

describe("compressConversationHistory", () => {
  function makeMessages(count: number): ConversationMessage[] {
    return Array.from({ length: count }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: `message ${i} content text here`,
    }));
  }

  it("returns default string for empty messages", () => {
    expect(compressConversationHistory([])).toBe("No conversation yet.");
  });

  it("12 messages with keepRecent=5 → condenses 7, keeps 5 full", () => {
    const messages = makeMessages(12);
    const out = compressConversationHistory(messages, 5);

    expect(out).toContain("[Earlier 7 exchanges condensed]");
    expect(out).toContain("[Recent exchanges]");

    // Condensed lines use "U:" / "H:" prefix
    const condensedCount = (out.match(/^U:|^H:/gm) || []).length;
    expect(condensedCount).toBe(7);

    // Recent lines use "Operator:" / "HUMA:" prefix — exactly 5 of them
    const operatorCount = (out.match(/Operator:|HUMA:/g) || []).length;
    expect(operatorCount).toBe(5);
  });

  it("5 or fewer messages with keepRecent=5 → no condensed header, all full", () => {
    const messages = makeMessages(4);
    const out = compressConversationHistory(messages, 5);
    expect(out).not.toContain("[Earlier");
    expect(out).toContain("[Recent exchanges]");
  });

  it("truncates long messages in the condensed section", () => {
    const long = "x".repeat(200);
    const messages: ConversationMessage[] = [
      { role: "user", content: long },
      ...makeMessages(5),
    ];
    const out = compressConversationHistory(messages, 5, 60);
    // The condensed line should have the ellipsis and at most 60 chars of text
    const condensedLine = out.split("\n").find(l => l.startsWith("U:") && l.includes("x"));
    expect(condensedLine).toBeDefined();
    expect(condensedLine!.length).toBeLessThanOrEqual(2 /* "U:" */ + 60 + 2 /* ellipsis */);
    expect(condensedLine).toContain("\u2026");
  });
});
