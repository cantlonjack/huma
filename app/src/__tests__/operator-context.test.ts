import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  saveOperatorContextLocal,
  loadOperatorContextLocal,
  clearOperatorContextLocal,
  saveContextEdit,
} from "@/lib/operator-context";
import type { OperatorContext, CapitalKey, LotusPhase } from "@/types/lotus";

// ─── Mock localStorage ──────────────────────────────────────────────────────

const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] || null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
};

// ─── Mock supabase ──────────────────────────────────────────────────────────

vi.mock("@/lib/supabase", () => ({
  createClient: () => null,
}));

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  vi.stubGlobal("localStorage", localStorageMock);
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

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

describe("operator-context persistence", () => {
  describe("localStorage save/load", () => {
    it("round-trips through save and load", () => {
      const ctx = makeContext();
      saveOperatorContextLocal(ctx);
      const loaded = loadOperatorContextLocal();
      expect(loaded).not.toBeNull();
      expect(loaded!.name).toBe("Marcus");
      expect(loaded!.archetype).toBe("Earth Tender");
      expect(loaded!.capitals.intellectual).toBe(9);
    });

    it("updates timestamp on save", () => {
      const ctx = makeContext({ updatedAt: "2026-01-01T00:00:00Z" });
      saveOperatorContextLocal(ctx);
      const loaded = loadOperatorContextLocal();
      expect(loaded!.updatedAt).not.toBe("2026-01-01T00:00:00Z");
    });

    it("returns null when storage is empty", () => {
      expect(loadOperatorContextLocal()).toBeNull();
    });

    it("returns null on corrupted data", () => {
      store["huma-operator-context"] = "{{bad json";
      expect(loadOperatorContextLocal()).toBeNull();
    });

    it("clears storage", () => {
      saveOperatorContextLocal(makeContext());
      clearOperatorContextLocal();
      expect(loadOperatorContextLocal()).toBeNull();
    });

    it("handles localStorage errors gracefully on save", () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error("QuotaExceededError");
      });
      expect(() => saveOperatorContextLocal(makeContext())).not.toThrow();
    });

    it("handles localStorage errors gracefully on load", () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error("SecurityError");
      });
      expect(loadOperatorContextLocal()).toBeNull();
    });
  });

  describe("saveContextEdit", () => {
    it("updates a simple field", () => {
      const ctx = makeContext();
      const updated = saveContextEdit(ctx, "name", "Ana");
      expect(updated.name).toBe("Ana");
    });

    it("increments version", () => {
      const ctx = makeContext({ version: 3 });
      const updated = saveContextEdit(ctx, "name", "Ana");
      expect(updated.version).toBe(4);
    });

    it("persists the edit to localStorage", () => {
      const ctx = makeContext();
      saveContextEdit(ctx, "stage", "transition");
      const loaded = loadOperatorContextLocal();
      expect(loaded!.stage).toBe("transition");
    });

    it("updates nested objects (capitals)", () => {
      const ctx = makeContext();
      const newCapitals = { ...ctx.capitals, financial: 8 };
      const updated = saveContextEdit(ctx, "capitals", newCapitals);
      expect(updated.capitals.financial).toBe(8);
      expect(updated.capitals.living).toBe(8); // unchanged
    });

    it("updates ikigai data", () => {
      const ctx = makeContext();
      const ikigai = {
        love: ["growing things"],
        good: ["teaching"],
        need: ["education"],
        synthesis: "You bridge knowledge and nature.",
      };
      const updated = saveContextEdit(ctx, "ikigai", ikigai);
      expect(updated.ikigai?.love).toEqual(["growing things"]);
      expect(updated.ikigai?.synthesis).toBe("You bridge knowledge and nature.");
    });

    it("updates lotusProgress", () => {
      const ctx = makeContext();
      const progress = { ...ctx.lotusProgress, context: true };
      const updated = saveContextEdit(ctx, "lotusProgress", progress);
      expect(updated.lotusProgress.context).toBe(true);
      expect(updated.lotusProgress.whole).toBe(true);
    });
  });

  describe("fallback when operator_contexts table empty", () => {
    it("loadOperatorContextLocal returns null when no data stored", () => {
      // Supabase is mocked to return null, localStorage is empty
      expect(loadOperatorContextLocal()).toBeNull();
    });
  });
});
