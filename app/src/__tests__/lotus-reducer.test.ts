import { describe, it, expect } from "vitest";
import { lotusReducer, INITIAL_STATE } from "@/components/lotus/lotus-reducer";

describe("lotusReducer", () => {
  it("SET_NAME updates name", () => {
    const state = lotusReducer(INITIAL_STATE, { type: "SET_NAME", name: "Jack" });
    expect(state.context.name).toBe("Jack");
  });

  it("SET_ENTITY_TYPE updates entity type", () => {
    const state = lotusReducer(INITIAL_STATE, {
      type: "SET_ENTITY_TYPE",
      entityType: "person",
    });
    expect(state.context.entityType).toBe("person");
  });

  it("SET_ENTITY_TYPE computes wholeParams", () => {
    const state = lotusReducer(INITIAL_STATE, {
      type: "SET_ENTITY_TYPE",
      entityType: "person",
    });
    expect(state.wholeParams).toHaveLength(4);
    expect(state.wholeParams[0]).toBe(3); // person entitySeed
  });

  it("SET_STAGE updates stage", () => {
    const state = lotusReducer(INITIAL_STATE, {
      type: "SET_STAGE",
      stage: "building",
    });
    expect(state.context.stage).toBe("building");
  });

  it("SET_STAGE marks whole phase complete", () => {
    const state = lotusReducer(INITIAL_STATE, {
      type: "SET_STAGE",
      stage: "building",
    });
    expect(state.context.lotusProgress!.whole).toBe(true);
  });

  it("SET_GOVERNANCE solo", () => {
    const state = lotusReducer(INITIAL_STATE, {
      type: "SET_GOVERNANCE",
      governance: { solo: true, people: [] },
    });
    expect(state.context.governance!.solo).toBe(true);
    expect(state.context.governance!.people).toHaveLength(0);
  });

  it("SET_GOVERNANCE with people", () => {
    const state = lotusReducer(INITIAL_STATE, {
      type: "SET_GOVERNANCE",
      governance: {
        solo: false,
        people: [{ name: "Sarah", relationship: "partner" }],
      },
    });
    expect(state.context.governance!.solo).toBe(false);
    expect(state.context.governance!.people).toHaveLength(1);
  });

  it("SET_GOVERNANCE marks who phase complete", () => {
    const state = lotusReducer(INITIAL_STATE, {
      type: "SET_GOVERNANCE",
      governance: { solo: true, people: [] },
    });
    expect(state.context.lotusProgress!.who).toBe(true);
  });

  it("SET_CAPITAL updates individual capital", () => {
    const state = lotusReducer(INITIAL_STATE, {
      type: "SET_CAPITAL",
      key: "financial",
      value: 7,
    });
    expect(state.context.capitals!.financial).toBe(7);
  });

  it("SET_CAPITAL preserves other capitals", () => {
    let state = lotusReducer(INITIAL_STATE, {
      type: "SET_CAPITAL",
      key: "financial",
      value: 7,
    });
    state = lotusReducer(state, {
      type: "SET_CAPITAL",
      key: "living",
      value: 9,
    });
    expect(state.context.capitals!.financial).toBe(7);
    expect(state.context.capitals!.living).toBe(9);
  });

  it("SET_SYNTHESIS stores archetype data", () => {
    const state = lotusReducer(INITIAL_STATE, {
      type: "SET_SYNTHESIS",
      archetype: "Earth Tender",
      archetypeDescription: "Connected to land and meaning",
      strengths: ["living", "social", "spiritual"],
      growthAreas: ["financial", "experiential"],
    });
    expect(state.context.archetype).toBe("Earth Tender");
    expect(state.context.strengths).toHaveLength(3);
    expect(state.context.growthAreas).toHaveLength(2);
  });

  it("SET_SYNTHESIS marks what phase complete but keeps wholePhase at 1", () => {
    const state = lotusReducer(INITIAL_STATE, {
      type: "SET_SYNTHESIS",
      archetype: "Builder",
      archetypeDescription: "Enterprise-minded",
      strengths: ["financial", "material", "intellectual"],
      growthAreas: ["spiritual", "cultural"],
    });
    expect(state.context.lotusProgress!.what).toBe(true);
    // wholePhase stays at 1 — phase 2 triggers when screen 10 renders
    expect(state.wholePhase).toBe(1);
  });

  it("SET_INSIGHT stores insight and pattern", () => {
    const state = lotusReducer(INITIAL_STATE, {
      type: "SET_INSIGHT",
      insight: "Your living capital is strong.",
      pattern: {
        id: "p1",
        name: "Value-Added Processing",
        description: "Turn raw into refined",
        whyYou: "Fits your profile",
        firstStep: "Research tonight",
      },
    });
    expect(state.context.firstInsight).toBe("Your living capital is strong.");
    expect(state.context.firstPattern?.name).toBe("Value-Added Processing");
    expect(state.loading).toBe(false);
  });

  it("SET_LOCATION updates location", () => {
    const state = lotusReducer(INITIAL_STATE, {
      type: "SET_LOCATION",
      location: "Michigan",
    });
    expect(state.context.location).toBe("Michigan");
  });

  it("NEXT_SCREEN advances", () => {
    const state = lotusReducer(INITIAL_STATE, { type: "NEXT_SCREEN" });
    expect(state.screen).toBe(2);
    expect(state.direction).toBe(1);
  });

  it("NEXT_SCREEN does not go above 13", () => {
    let state = { ...INITIAL_STATE, screen: 13 as const };
    state = lotusReducer(state, { type: "NEXT_SCREEN" });
    expect(state.screen).toBe(13);
  });

  it("PREV_SCREEN goes back", () => {
    let state = lotusReducer(INITIAL_STATE, { type: "NEXT_SCREEN" });
    state = lotusReducer(state, { type: "NEXT_SCREEN" });
    state = lotusReducer(state, { type: "PREV_SCREEN" });
    expect(state.screen).toBe(2);
    expect(state.direction).toBe(-1);
  });

  it("PREV_SCREEN does not go below 1", () => {
    const state = lotusReducer(INITIAL_STATE, { type: "PREV_SCREEN" });
    expect(state.screen).toBe(1);
  });

  it("GO_TO_SCREEN jumps to specific screen", () => {
    const state = lotusReducer(INITIAL_STATE, {
      type: "GO_TO_SCREEN",
      screen: 7,
    });
    expect(state.screen).toBe(7);
  });

  it("GO_TO_SCREEN preserves existing data (Adjust flow)", () => {
    let state = lotusReducer(INITIAL_STATE, { type: "SET_NAME", name: "Jack" });
    state = lotusReducer(state, {
      type: "SET_CAPITAL",
      key: "financial",
      value: 3,
    });
    state = lotusReducer(state, { type: "GO_TO_SCREEN", screen: 7 });
    expect(state.context.name).toBe("Jack");
    expect(state.context.capitals!.financial).toBe(3);
    expect(state.screen).toBe(7);
  });

  it("GO_TO_SCREEN sets direction based on navigation", () => {
    let state = lotusReducer({ ...INITIAL_STATE, screen: 5 as const }, {
      type: "GO_TO_SCREEN",
      screen: 7,
    });
    expect(state.direction).toBe(1); // forward

    state = lotusReducer({ ...INITIAL_STATE, screen: 9 as const }, {
      type: "GO_TO_SCREEN",
      screen: 7,
    });
    expect(state.direction).toBe(-1); // backward
  });

  it("NEXT_SCREEN advances wholePhase to 2 at screen 10", () => {
    const state = lotusReducer({ ...INITIAL_STATE, screen: 9 as const }, {
      type: "NEXT_SCREEN",
    });
    expect(state.screen).toBe(10);
    expect(state.wholePhase).toBe(2);
  });

  it("NEXT_SCREEN advances wholePhase to 3 at screen 11+", () => {
    const state = lotusReducer({ ...INITIAL_STATE, screen: 10 as const }, {
      type: "NEXT_SCREEN",
    });
    expect(state.screen).toBe(11);
    expect(state.wholePhase).toBe(3);
  });

  it("SET_LOADING updates loading state", () => {
    const state = lotusReducer(INITIAL_STATE, {
      type: "SET_LOADING",
      loading: true,
    });
    expect(state.loading).toBe(true);
  });

  it("SET_ERROR updates error and clears loading", () => {
    let state = lotusReducer(INITIAL_STATE, {
      type: "SET_LOADING",
      loading: true,
    });
    state = lotusReducer(state, {
      type: "SET_ERROR",
      error: "Something went wrong",
    });
    expect(state.error).toBe("Something went wrong");
    expect(state.loading).toBe(false);
  });

  it("RESTORE_STATE replaces entire state", () => {
    const saved: typeof INITIAL_STATE = {
      ...INITIAL_STATE,
      screen: 5,
      context: { ...INITIAL_STATE.context, name: "Restored" },
    };
    const state = lotusReducer(INITIAL_STATE, {
      type: "RESTORE_STATE",
      state: saved,
    });
    expect(state.screen).toBe(5);
    expect(state.context.name).toBe("Restored");
  });

  it("updatedAt changes on mutations", () => {
    const before = INITIAL_STATE.context.updatedAt;
    const state = lotusReducer(INITIAL_STATE, { type: "SET_NAME", name: "X" });
    expect(state.context.updatedAt).not.toBe(before);
  });
});
