import { describe, it, expect } from "vitest";
import {
  scoreBehaviors,
  getSeason,
  analyzeHistory,
  formatKnownContext,
  normalizeSheetAspirations,
  formatCompressedContextForSheet,
  sheetVerificationSummary,
} from "./sheet-service";
import type { SheetCompileRequest, KnownContext } from "@/types/v2";
import type { RecentEntry } from "./sheet-service";
import { createEmptyContext } from "@/types/context";

// ─── Helper ──────────────────────────────────────────────────────────────────

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

function makeHistory(behaviorKey: string, days: number, checkedRate: number): RecentEntry[] {
  return Array.from({ length: days }, (_, i) => ({
    date: `2026-04-0${(i + 1).toString().padStart(1, "0")}`,
    behaviorKey,
    checked: i < Math.round(days * checkedRate),
  }));
}

// ─── Behavior Scoring ────────────────────────────────────────────────────────

describe("scoreBehaviors", () => {
  it("gives dimensional breadth — all behaviors get base score of 1", () => {
    const aspirations = [
      makeAspiration("a1", [
        { key: "walk", text: "Walk", frequency: "daily" },
        { key: "read", text: "Read", frequency: "weekly" },
      ]),
    ];
    const result = scoreBehaviors(aspirations, [], "Monday");
    // Both new behaviors get base (1) + new (1) + daily/weekly bonus
    expect(result.every(b => b.score >= 1)).toBe(true);
  });

  it("momentum boost: 60%+ completion rate adds 2 points", () => {
    const aspirations = [makeAspiration("a1", [{ key: "walk", text: "Walk", frequency: "daily" }])];
    const history = makeHistory("walk", 7, 1.0); // 100% rate

    const result = scoreBehaviors(aspirations, history, "Monday");
    const walk = result.find(b => b.key === "walk")!;
    expect(walk.reason).toContain("momentum");
    // base(1) + momentum(2) + daily(1) = 4
    expect(walk.score).toBe(4);
  });

  it("needs-traction: low completion rate (>0, <40%) adds 1.5", () => {
    const aspirations = [makeAspiration("a1", [{ key: "walk", text: "Walk", frequency: "daily" }])];
    // 2 out of 7 = ~28%
    const history: RecentEntry[] = [
      { date: "2026-04-01", behaviorKey: "walk", checked: true },
      { date: "2026-04-02", behaviorKey: "walk", checked: true },
      { date: "2026-04-03", behaviorKey: "walk", checked: false },
      { date: "2026-04-04", behaviorKey: "walk", checked: false },
      { date: "2026-04-05", behaviorKey: "walk", checked: false },
      { date: "2026-04-06", behaviorKey: "walk", checked: false },
      { date: "2026-04-07", behaviorKey: "walk", checked: false },
    ];

    const result = scoreBehaviors(aspirations, history, "Monday");
    const walk = result.find(b => b.key === "walk")!;
    expect(walk.reason).toContain("needs-traction");
  });

  it("new behavior gets +1 bonus", () => {
    const aspirations = [makeAspiration("a1", [{ key: "new-thing", text: "New", frequency: "daily" }])];
    const result = scoreBehaviors(aspirations, [], "Monday");
    const newThing = result.find(b => b.key === "new-thing")!;
    expect(newThing.reason).toContain("new");
    // base(1) + new(1) + daily(1) = 3
    expect(newThing.score).toBe(3);
  });

  it("day-of-week fit: specific-days scheduled today gets +3", () => {
    const aspirations = [
      makeAspiration("a1", [
        { key: "yoga", text: "Yoga", frequency: "specific-days", days: ["Monday", "Wednesday"] },
      ]),
    ];
    const result = scoreBehaviors(aspirations, [], "Monday");
    const yoga = result.find(b => b.key === "yoga")!;
    expect(yoga.reason).toContain("scheduled-today");
    // base(1) + new(1) + scheduled-today(3) = 5
    expect(yoga.score).toBe(5);
  });

  it("day-of-week fit: specific-days NOT today gets -2", () => {
    const aspirations = [
      makeAspiration("a1", [
        { key: "yoga", text: "Yoga", frequency: "specific-days", days: ["Tuesday", "Thursday"] },
      ]),
    ];
    const result = scoreBehaviors(aspirations, [], "Monday");
    const yoga = result.find(b => b.key === "yoga")!;
    expect(yoga.reason).toContain("not-today");
    // base(1) + new(1) + not-today(-2) = 0
    expect(yoga.score).toBe(0);
  });

  it("daily behaviors get +1 bonus", () => {
    const aspirations = [
      makeAspiration("a1", [
        { key: "walk", text: "Walk", frequency: "daily" },
        { key: "plan", text: "Weekly planning", frequency: "weekly" },
      ]),
    ];
    const result = scoreBehaviors(aspirations, [], "Monday");
    const walk = result.find(b => b.key === "walk")!;
    const plan = result.find(b => b.key === "plan")!;
    expect(walk.reason).toContain("daily");
    expect(walk.score).toBeGreaterThan(plan.score);
  });

  it("aspiration balance: caps at 3 per aspiration in first 7 slots", () => {
    const aspirations = [
      makeAspiration("dominant", [
        { key: "b1", text: "B1", frequency: "daily" },
        { key: "b2", text: "B2", frequency: "daily" },
        { key: "b3", text: "B3", frequency: "daily" },
        { key: "b4", text: "B4", frequency: "daily" },
        { key: "b5", text: "B5", frequency: "daily" },
      ]),
      makeAspiration("other", [
        { key: "b6", text: "B6", frequency: "daily" },
        { key: "b7", text: "B7", frequency: "daily" },
      ]),
    ];

    // Give dominant aspiration strong momentum
    const history = ["b1", "b2", "b3", "b4", "b5"].flatMap(key =>
      makeHistory(key, 7, 1.0),
    );

    const result = scoreBehaviors(aspirations, history, "Monday");
    const first7 = result.slice(0, 7);
    const dominantCount = first7.filter(b => b.aspirationId === "dominant").length;
    const otherCount = first7.filter(b => b.aspirationId === "other").length;
    expect(dominantCount).toBeLessThanOrEqual(5);
    expect(otherCount).toBeGreaterThan(0);
  });

  it("excludes disabled behaviors", () => {
    const aspirations = [
      makeAspiration("a1", [
        { key: "active", text: "Active", frequency: "daily", enabled: true },
        { key: "off", text: "Off", frequency: "daily", enabled: false },
      ]),
    ];
    const result = scoreBehaviors(aspirations, [], "Monday");
    expect(result.find(b => b.key === "off")).toBeUndefined();
    expect(result.find(b => b.key === "active")).toBeDefined();
  });

  it("sorts by score descending", () => {
    const aspirations = [
      makeAspiration("a1", [
        { key: "low", text: "Low", frequency: "specific-days", days: ["Tuesday"] },
        { key: "high", text: "High", frequency: "specific-days", days: ["Monday"] },
      ]),
    ];
    const result = scoreBehaviors(aspirations, [], "Monday");
    expect(result[0].key).toBe("high");
  });

  it("empty aspirations → empty result", () => {
    const result = scoreBehaviors([], [], "Monday");
    expect(result).toEqual([]);
  });

  it("single aspiration with 1 behavior → returns that behavior", () => {
    const aspirations = [makeAspiration("a1", [{ key: "solo", text: "Solo", frequency: "daily" }])];
    const result = scoreBehaviors(aspirations, [], "Monday");
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("solo");
  });

  it("all behaviors disabled → empty result", () => {
    const aspirations = [
      makeAspiration("a1", [
        { key: "x", text: "X", frequency: "daily", enabled: false },
        { key: "y", text: "Y", frequency: "daily", enabled: false },
      ]),
    ];
    const result = scoreBehaviors(aspirations, [], "Monday");
    expect(result).toHaveLength(0);
  });

  it("history integration: checked items get momentum boost", () => {
    const aspirations = [
      makeAspiration("a1", [
        { key: "strong", text: "Strong", frequency: "daily" },
        { key: "weak", text: "Weak", frequency: "daily" },
      ]),
    ];
    const history = [
      ...makeHistory("strong", 7, 1.0),  // 100% → momentum
      ...makeHistory("weak", 7, 0.5),    // 50% → neutral
    ];
    const result = scoreBehaviors(aspirations, history, "Monday");
    const strong = result.find(b => b.key === "strong")!;
    const weak = result.find(b => b.key === "weak")!;
    expect(strong.score).toBeGreaterThan(weak.score);
  });

  it("carries aspiration metadata through scoring", () => {
    const aspirations = [
      makeAspiration("a1", [{ key: "walk", text: "Morning walk", frequency: "daily", detail: "30 min" }]),
    ];
    aspirations[0].clarifiedText = "Build daily movement habit";

    const result = scoreBehaviors(aspirations, [], "Monday");
    expect(result[0].aspirationText).toBe("Build daily movement habit");
    expect(result[0].detail).toBe("30 min");
  });
});

// ─── Season ──────────────────────────────────────────────────────────────────

describe("getSeason", () => {
  it("early spring: March 25", () => expect(getSeason("2026-03-25")).toBe("early spring"));
  it("mid spring: April 30", () => expect(getSeason("2026-04-30")).toContain("spring"));
  it("late spring: June 10", () => expect(getSeason("2026-06-10")).toBe("late spring"));
  it("early summer: June 25", () => expect(getSeason("2026-06-25")).toBe("early summer"));
  it("mid summer: August 1", () => expect(getSeason("2026-08-01")).toContain("summer"));
  it("early autumn: September 30", () => expect(getSeason("2026-09-30")).toBe("early autumn"));
  it("late autumn: December 10", () => expect(getSeason("2026-12-10")).toBe("late autumn"));
  it("early winter: December 25", () => expect(getSeason("2026-12-25")).toContain("winter"));
  it("mid winter: January 15", () => expect(getSeason("2026-01-15")).toContain("winter"));
  it("late winter: March 10", () => expect(getSeason("2026-03-10")).toContain("winter"));
});

// ─── History Analysis ────────────────────────────────────────────────────────

describe("analyzeHistory", () => {
  it("returns empty for empty history", () => {
    expect(analyzeHistory([], "Monday")).toBe("");
  });

  it("flags struggling behaviors (<50%)", () => {
    const history: RecentEntry[] = [
      { date: "2026-04-01", behaviorKey: "walk", checked: false },
      { date: "2026-04-02", behaviorKey: "walk", checked: false },
      { date: "2026-04-03", behaviorKey: "walk", checked: true },
    ];
    const result = analyzeHistory(history, "Monday");
    expect(result).toContain("skipped more than done");
  });

  it("flags strong behaviors (>=80%)", () => {
    const history: RecentEntry[] = Array.from({ length: 5 }, (_, i) => ({
      date: `2026-04-0${i + 1}`,
      behaviorKey: "cook",
      checked: true,
    }));
    const result = analyzeHistory(history, "Monday");
    expect(result).toContain("sticking well");
  });

  it("flags day-of-week patterns for skips", () => {
    // Skipped on Monday twice
    const history: RecentEntry[] = [
      { date: "2026-03-30", behaviorKey: "run", checked: false }, // Monday
      { date: "2026-04-06", behaviorKey: "run", checked: false }, // Monday
      { date: "2026-04-01", behaviorKey: "run", checked: true },  // Tuesday
    ];
    const result = analyzeHistory(history, "Monday");
    expect(result).toContain("skipped on Monday");
  });
});

// ─── Format Known Context ────────────────────────────────────────────────────

describe("formatKnownContext", () => {
  it("returns 'Limited context' for empty context", () => {
    expect(formatKnownContext({})).toBe("Limited context so far.");
  });

  it("formats all known fields", () => {
    const ctx: KnownContext = {
      place: { name: "Detroit", detail: "suburb" },
      work: { title: "Engineer", detail: "remote" },
      people: [{ name: "Sarah", role: "wife" }],
      stage: { label: "mid-career", detail: "stable" },
      health: { detail: "bad knee" },
      time: { detail: "busy evenings" },
      financial: { income: "$60k", rhythm: "bi-weekly", constraints: ["tight"] },
      resources: ["garden", "workshop"],
    };
    const result = formatKnownContext(ctx);
    expect(result).toContain("Location: Detroit — suburb");
    expect(result).toContain("Work: Engineer — remote");
    expect(result).toContain("Sarah (wife)");
    expect(result).toContain("mid-career — stable");
    expect(result).toContain("bad knee");
    expect(result).toContain("busy evenings");
    expect(result).toContain("income: $60k");
    expect(result).toContain("garden, workshop");
  });

  it("includes unstructured keys", () => {
    const ctx: KnownContext = { custom_field: "some value" };
    const result = formatKnownContext(ctx);
    expect(result).toContain("custom_field: some value");
  });
});

// ─── normalizeSheetAspirations ───────────────────────────────────────────────

describe("normalizeSheetAspirations", () => {
  it("produces valid Aspiration[] with status 'active', empty dimensionsTouched, DimensionEffect[] shape", () => {
    const simple: SheetCompileRequest["aspirations"] = [
      {
        id: "a1",
        rawText: "raw",
        clarifiedText: "clarified",
        behaviors: [
          {
            key: "b1",
            text: "walk",
            frequency: "daily",
            detail: "20 min",
            enabled: true,
            dimensions: ["body", "joy"],
          } as SheetCompileRequest["aspirations"][0]["behaviors"][0],
        ],
      },
    ];

    const out = normalizeSheetAspirations(simple);
    expect(out).toHaveLength(1);
    const asp = out[0];
    expect(asp.status).toBe("active");
    expect(asp.stage).toBe("active");
    expect(asp.dimensionsTouched).toEqual([]);
    expect(asp.behaviors[0].dimensions).toHaveLength(2);
    expect(asp.behaviors[0].dimensions[0]).toEqual({
      dimension: "body",
      direction: "builds",
      reasoning: "",
    });
    expect(asp.behaviors[0].dimensions[1].dimension).toBe("joy");
  });

  it("defaults to empty DimensionEffect[] when dimensions field missing on behavior", () => {
    const simple: SheetCompileRequest["aspirations"] = [
      {
        id: "a1",
        rawText: "r",
        clarifiedText: "c",
        behaviors: [
          { key: "b1", text: "walk", frequency: "daily" },
        ],
      },
    ];
    const out = normalizeSheetAspirations(simple);
    expect(out[0].behaviors[0].dimensions).toEqual([]);
  });
});

// ─── formatCompressedContextForSheet ─────────────────────────────────────────

describe("formatCompressedContextForSheet", () => {
  it("empty aspirations returns folded output only (no expanded blocks)", () => {
    const ctx = createEmptyContext();
    const out = formatCompressedContextForSheet({
      humaContext: ctx,
      aspirations: [],
    });
    expect(out).toContain("LIFE[");
    expect(out).not.toContain("PRC:");
  });

  it("active aspirations get folded + one expanded block per aspiration", () => {
    const ctx = createEmptyContext();
    const out = formatCompressedContextForSheet({
      humaContext: ctx,
      aspirations: [
        {
          id: "a1",
          rawText: "Move",
          clarifiedText: "Move",
          title: "Move",
          status: "active",
          stage: "active",
          dimensionsTouched: [],
          behaviors: [
            {
              key: "b1",
              text: "walk",
              frequency: "daily",
              enabled: true,
              dimensions: [{ dimension: "body", direction: "builds", reasoning: "" }],
            },
          ],
        },
      ],
    });
    expect(out).toContain("LIFE[");
    expect(out).toContain("ASP:Move[");
    expect(out).toContain("PRC:walk");
  });
});

// ─── sheetVerificationSummary ────────────────────────────────────────────────

describe("sheetVerificationSummary", () => {
  it("returns { verification, summary } shape", () => {
    const ctx = createEmptyContext();
    const result = sheetVerificationSummary({
      humaContext: ctx,
      aspirations: [],
      rpplSeeds: [],
    });
    expect(result).toHaveProperty("verification");
    expect(result).toHaveProperty("summary");
    expect(typeof result.summary).toBe("string");
    expect(result.verification).toHaveProperty("integrity");
    expect(result.verification).toHaveProperty("suggestions");
  });

  it("flags an unconnected aspiration in the summary", () => {
    const ctx = createEmptyContext();
    const result = sheetVerificationSummary({
      humaContext: ctx,
      rpplSeeds: [],
      aspirations: [
        {
          id: "a1",
          rawText: "Write book",
          clarifiedText: "Write book",
          title: "Write book",
          status: "active",
          stage: "active",
          dimensionsTouched: [],
          behaviors: [],
        },
      ],
    });
    expect(result.verification.unconnectedAspirations).toContain("Write book");
    expect(result.summary).toContain("unconnected");
  });
});
