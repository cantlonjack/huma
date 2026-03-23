import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { saveLotusState, loadLotusState, clearLotusState } from "@/lib/lotus-persistence";
import type { LotusState } from "@/types/lotus";
import { INITIAL_STATE } from "@/components/lotus/lotus-reducer";

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
};

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  vi.stubGlobal("localStorage", localStorageMock);
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("lotus-persistence", () => {
  it("save and load round-trip", () => {
    const state: LotusState = {
      ...INITIAL_STATE,
      screen: 5,
      context: { ...INITIAL_STATE.context, name: "Jack" },
    };
    saveLotusState(state);
    const loaded = loadLotusState();
    expect(loaded?.screen).toBe(5);
    expect(loaded?.context.name).toBe("Jack");
  });

  it("load returns null when empty", () => {
    const loaded = loadLotusState();
    expect(loaded).toBeNull();
  });

  it("clear removes state", () => {
    saveLotusState({ ...INITIAL_STATE, screen: 3 });
    clearLotusState();
    expect(loadLotusState()).toBeNull();
  });

  it("handles corrupted localStorage gracefully", () => {
    store["huma_onboarding"] = "not valid json{{{";
    const loaded = loadLotusState();
    expect(loaded).toBeNull();
  });

  it("rejects state with screen out of range", () => {
    store["huma_onboarding"] = JSON.stringify({ ...INITIAL_STATE, screen: 0 });
    expect(loadLotusState()).toBeNull();

    store["huma_onboarding"] = JSON.stringify({ ...INITIAL_STATE, screen: 14 });
    expect(loadLotusState()).toBeNull();
  });

  it("rejects state with missing screen", () => {
    store["huma_onboarding"] = JSON.stringify({ context: {} });
    expect(loadLotusState()).toBeNull();
  });

  it("silently fails when localStorage is full", () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error("QuotaExceededError");
    });
    // Should not throw
    expect(() => saveLotusState(INITIAL_STATE)).not.toThrow();
  });

  it("preserves all context fields through round-trip", () => {
    const state: LotusState = {
      ...INITIAL_STATE,
      screen: 9,
      wholePhase: 2,
      context: {
        ...INITIAL_STATE.context,
        name: "Marcus",
        entityType: "person",
        stage: "building",
        governance: { solo: false, people: [{ name: "Ana", relationship: "partner" }] },
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
      },
    };
    saveLotusState(state);
    const loaded = loadLotusState();
    expect(loaded?.context.archetype).toBe("Earth Tender");
    expect(loaded?.context.capitals?.living).toBe(8);
    expect(loaded?.context.governance?.people).toHaveLength(1);
    expect(loaded?.wholePhase).toBe(2);
  });
});
