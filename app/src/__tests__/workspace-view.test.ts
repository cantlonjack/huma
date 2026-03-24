import { describe, it, expect } from "vitest";
import {
  getNextPetal,
  isPetalComplete,
  PETAL_META,
  AVAILABLE_FLOWS,
} from "@/types/workspace";
import type { OperatorContext, CapitalKey, LotusPhase } from "@/types/lotus";
import {
  getRecommendationTier,
} from "@/engine/prompts/workspace-recommendation-prompt";

// ─── Test fixtures ──────────────────────────────────────────────────────────

function makeContext(overrides?: Partial<OperatorContext>): OperatorContext {
  return {
    name: "Marcus",
    entityType: "person",
    stage: "building",
    governance: { solo: true, people: [] },
    capitals: {
      financial: 5,
      material: 7,
      living: 8,
      social: 6,
      experiential: 4,
      intellectual: 9,
      spiritual: 7,
      cultural: 3,
    },
    archetype: "Earth Tender",
    archetypeDescription: "Rooted in living systems",
    strengths: ["intellectual", "living"] as CapitalKey[],
    growthAreas: ["cultural", "experiential"] as CapitalKey[],
    createdAt: "2026-03-20T00:00:00Z",
    updatedAt: "2026-03-20T00:00:00Z",
    version: 1,
    lotusProgress: {
      whole: true,
      who: true,
      what: true,
    } as Record<LotusPhase, boolean>,
    ...overrides,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("workspace petal states", () => {
  describe("isPetalComplete", () => {
    it("whole/who/what are complete when name and capitals exist", () => {
      const ctx = makeContext();
      expect(isPetalComplete("whole", ctx)).toBe(true);
      expect(isPetalComplete("who", ctx)).toBe(true);
      expect(isPetalComplete("what", ctx)).toBe(true);
    });

    it("whole/who/what are incomplete without capitals", () => {
      const ctx = makeContext({ capitals: undefined as unknown as Record<CapitalKey, number> });
      expect(isPetalComplete("whole", ctx)).toBe(false);
    });

    it("context petal is complete when lotusProgress.context is true", () => {
      const ctx = makeContext({
        lotusProgress: { whole: true, who: true, what: true, context: true } as Record<LotusPhase, boolean>,
      });
      expect(isPetalComplete("context", ctx)).toBe(true);
    });

    it("context petal is incomplete by default", () => {
      const ctx = makeContext();
      expect(isPetalComplete("context", ctx)).toBe(false);
    });

    it("future petals are incomplete", () => {
      const ctx = makeContext();
      expect(isPetalComplete("purpose", ctx)).toBe(false);
      expect(isPetalComplete("vision", ctx)).toBe(false);
      expect(isPetalComplete("behavior", ctx)).toBe(false);
    });
  });

  describe("getNextPetal", () => {
    it("returns context as first next petal after Lotus Flow", () => {
      const ctx = makeContext();
      expect(getNextPetal(ctx)).toBe("context");
    });

    it("returns purpose after context is complete", () => {
      const ctx = makeContext({
        lotusProgress: { whole: true, who: true, what: true, context: true } as Record<LotusPhase, boolean>,
      });
      expect(getNextPetal(ctx)).toBe("purpose");
    });

    it("returns vision after purpose is complete", () => {
      const ctx = makeContext({
        lotusProgress: {
          whole: true, who: true, what: true,
          context: true, purpose: true,
        } as Record<LotusPhase, boolean>,
      });
      expect(getNextPetal(ctx)).toBe("vision");
    });

    it("returns behavior after vision is complete", () => {
      const ctx = makeContext({
        lotusProgress: {
          whole: true, who: true, what: true,
          context: true, purpose: true, vision: true,
        } as Record<LotusPhase, boolean>,
      });
      expect(getNextPetal(ctx)).toBe("behavior");
    });

    it("returns null when all available petals are complete", () => {
      const ctx = makeContext({
        lotusProgress: {
          whole: true, who: true, what: true,
          context: true, purpose: true, vision: true, behavior: true,
        } as Record<LotusPhase, boolean>,
      });
      expect(getNextPetal(ctx)).toBeNull();
    });
  });

  describe("PETAL_META", () => {
    it("has 12 petals matching all LotusPhase values", () => {
      expect(PETAL_META).toHaveLength(12);
    });

    it("each petal has phase and label", () => {
      for (const meta of PETAL_META) {
        expect(meta.phase).toBeTruthy();
        expect(meta.label).toBeTruthy();
      }
    });

    it("context petal has time hint", () => {
      const context = PETAL_META.find((m) => m.phase === "context");
      expect(context?.timeHint).toBe("10 min");
    });
  });

  describe("AVAILABLE_FLOWS", () => {
    it("includes context", () => {
      expect(AVAILABLE_FLOWS).toContain("context");
    });
  });

  describe("view mode transitions", () => {
    it("whole → petal for completed petals", () => {
      const ctx = makeContext();
      expect(isPetalComplete("whole", ctx)).toBe(true);
      // User clicking whole petal → should enter petal view (logic in home page)
    });

    it("whole → flow for next petal with flow", () => {
      const ctx = makeContext();
      const next = getNextPetal(ctx);
      expect(next).toBe("context");
      expect(AVAILABLE_FLOWS.includes(next!)).toBe(true);
      // User clicking context petal → should enter flow view
    });

    it("next petal without flow should not enter flow mode", () => {
      const ctx = makeContext({
        lotusProgress: { whole: true, who: true, what: true, context: true } as Record<LotusPhase, boolean>,
      });
      const next = getNextPetal(ctx);
      expect(next).toBe("purpose");
      expect(AVAILABLE_FLOWS.includes(next!)).toBe(false);
    });
  });
});

describe("workspace recommendation tiers", () => {
  it("returns tier 1 for Lotus-only context", () => {
    const ctx = makeContext();
    expect(getRecommendationTier(ctx)).toBe(1);
  });

  it("returns tier 2 when Ikigai synthesis exists", () => {
    const ctx = makeContext({
      ikigai: {
        love: ["growing things"],
        good: ["teaching"],
        need: ["education"],
        synthesis: "You bridge knowledge and nature.",
      },
    });
    expect(getRecommendationTier(ctx)).toBe(2);
  });

  it("returns tier 1 when Ikigai exists but no synthesis", () => {
    const ctx = makeContext({
      ikigai: {
        love: ["growing things"],
        good: ["teaching"],
        need: ["education"],
      },
    });
    expect(getRecommendationTier(ctx)).toBe(1);
  });
});
