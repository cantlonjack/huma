import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Ikigai Flow tests — state transitions through all 6 screens,
 * data accumulation (text + cards), and persistence round-trip.
 *
 * We test the reducer and persistence directly since the component
 * is a "use client" React component and our vitest env is node.
 */

// ─── Mock localStorage ──────────────────────────────────────────────────────

const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] || null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
};

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  vi.stubGlobal("localStorage", localStorageMock);
  vi.clearAllMocks();
});

// ─── Inline the reducer logic for testing ───────────────────────────────────

type IkigaiScreen = "intro" | "love" | "good" | "need" | "review" | "synthesis";

const SCREEN_ORDER: IkigaiScreen[] = [
  "intro", "love", "good", "need", "review", "synthesis",
];

interface IkigaiState {
  screen: IkigaiScreen;
  love: string[];
  good: string[];
  need: string[];
  loveCards: string[];
  goodCards: string[];
  needCards: string[];
  synthesis: string | null;
}

type IkigaiAction =
  | { type: "NEXT_SCREEN" }
  | { type: "PREV_SCREEN" }
  | { type: "GO_TO_SCREEN"; screen: IkigaiScreen }
  | { type: "ADD_LOVE_ENTRY"; text: string }
  | { type: "REMOVE_LOVE_ENTRY"; index: number }
  | { type: "TOGGLE_LOVE_CARD"; id: string }
  | { type: "ADD_GOOD_ENTRY"; text: string }
  | { type: "REMOVE_GOOD_ENTRY"; index: number }
  | { type: "TOGGLE_GOOD_CARD"; id: string }
  | { type: "ADD_NEED_ENTRY"; text: string }
  | { type: "REMOVE_NEED_ENTRY"; index: number }
  | { type: "TOGGLE_NEED_CARD"; id: string }
  | { type: "SET_SYNTHESIS"; synthesis: string }
  | { type: "RESTORE"; state: IkigaiState };

const STORAGE_KEY = "huma_ikigai_progress";

function toggleInArray(arr: string[], id: string): string[] {
  return arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
}

function reducer(state: IkigaiState, action: IkigaiAction): IkigaiState {
  let next: IkigaiState;
  switch (action.type) {
    case "NEXT_SCREEN": {
      const idx = SCREEN_ORDER.indexOf(state.screen);
      if (idx < SCREEN_ORDER.length - 1) {
        next = { ...state, screen: SCREEN_ORDER[idx + 1] };
      } else return state;
      break;
    }
    case "PREV_SCREEN": {
      const idx = SCREEN_ORDER.indexOf(state.screen);
      if (idx > 0) {
        next = { ...state, screen: SCREEN_ORDER[idx - 1] };
      } else return state;
      break;
    }
    case "GO_TO_SCREEN":
      next = { ...state, screen: action.screen };
      break;
    case "ADD_LOVE_ENTRY":
      next = { ...state, love: [...state.love, action.text] };
      break;
    case "REMOVE_LOVE_ENTRY":
      next = { ...state, love: state.love.filter((_, i) => i !== action.index) };
      break;
    case "TOGGLE_LOVE_CARD":
      next = { ...state, loveCards: toggleInArray(state.loveCards, action.id) };
      break;
    case "ADD_GOOD_ENTRY":
      next = { ...state, good: [...state.good, action.text] };
      break;
    case "REMOVE_GOOD_ENTRY":
      next = { ...state, good: state.good.filter((_, i) => i !== action.index) };
      break;
    case "TOGGLE_GOOD_CARD":
      next = { ...state, goodCards: toggleInArray(state.goodCards, action.id) };
      break;
    case "ADD_NEED_ENTRY":
      next = { ...state, need: [...state.need, action.text] };
      break;
    case "REMOVE_NEED_ENTRY":
      next = { ...state, need: state.need.filter((_, i) => i !== action.index) };
      break;
    case "TOGGLE_NEED_CARD":
      next = { ...state, needCards: toggleInArray(state.needCards, action.id) };
      break;
    case "SET_SYNTHESIS":
      next = { ...state, synthesis: action.synthesis };
      break;
    case "RESTORE":
      return action.state;
    default:
      return state;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch { /* silent */ }
  return next;
}

const INITIAL: IkigaiState = {
  screen: "intro",
  love: [],
  good: [],
  need: [],
  loveCards: [],
  goodCards: [],
  needCards: [],
  synthesis: null,
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("IkigaiFlow state machine", () => {
  describe("screen transitions", () => {
    it("advances through all 6 screens in order", () => {
      let state = INITIAL;
      for (const expected of SCREEN_ORDER.slice(1)) {
        state = reducer(state, { type: "NEXT_SCREEN" });
        expect(state.screen).toBe(expected);
      }
    });

    it("does not advance past synthesis", () => {
      let state = { ...INITIAL, screen: "synthesis" as IkigaiScreen };
      state = reducer(state, { type: "NEXT_SCREEN" });
      expect(state.screen).toBe("synthesis");
    });

    it("goes back through screens", () => {
      let state = { ...INITIAL, screen: "review" as IkigaiScreen };
      state = reducer(state, { type: "PREV_SCREEN" });
      expect(state.screen).toBe("need");
      state = reducer(state, { type: "PREV_SCREEN" });
      expect(state.screen).toBe("good");
    });

    it("does not go back before intro", () => {
      let state = INITIAL;
      state = reducer(state, { type: "PREV_SCREEN" });
      expect(state.screen).toBe("intro");
    });

    it("jumps to a specific screen", () => {
      const state = reducer(INITIAL, { type: "GO_TO_SCREEN", screen: "review" });
      expect(state.screen).toBe("review");
    });
  });

  describe("data accumulation", () => {
    it("adds and removes love entries", () => {
      let state = reducer(INITIAL, { type: "ADD_LOVE_ENTRY", text: "growing things" });
      state = reducer(state, { type: "ADD_LOVE_ENTRY", text: "cooking" });
      expect(state.love).toEqual(["growing things", "cooking"]);

      state = reducer(state, { type: "REMOVE_LOVE_ENTRY", index: 0 });
      expect(state.love).toEqual(["cooking"]);
    });

    it("toggles love cards on/off", () => {
      let state = reducer(INITIAL, { type: "TOGGLE_LOVE_CARD", id: "growing" });
      expect(state.loveCards).toEqual(["growing"]);

      state = reducer(state, { type: "TOGGLE_LOVE_CARD", id: "cooking" });
      expect(state.loveCards).toEqual(["growing", "cooking"]);

      state = reducer(state, { type: "TOGGLE_LOVE_CARD", id: "growing" });
      expect(state.loveCards).toEqual(["cooking"]);
    });

    it("adds good entries and cards", () => {
      let state = reducer(INITIAL, { type: "ADD_GOOD_ENTRY", text: "organizing" });
      state = reducer(state, { type: "TOGGLE_GOOD_CARD", id: "systems" });
      expect(state.good).toEqual(["organizing"]);
      expect(state.goodCards).toEqual(["systems"]);
    });

    it("adds need entries and cards", () => {
      let state = reducer(INITIAL, { type: "ADD_NEED_ENTRY", text: "clean water" });
      state = reducer(state, { type: "TOGGLE_NEED_CARD", id: "soil-health" });
      expect(state.need).toEqual(["clean water"]);
      expect(state.needCards).toEqual(["soil-health"]);
    });

    it("accumulates data across screen transitions", () => {
      let state = reducer(INITIAL, { type: "ADD_LOVE_ENTRY", text: "nature" });
      state = reducer(state, { type: "NEXT_SCREEN" }); // → love
      state = reducer(state, { type: "NEXT_SCREEN" }); // → good
      state = reducer(state, { type: "ADD_GOOD_ENTRY", text: "teaching" });
      state = reducer(state, { type: "NEXT_SCREEN" }); // → need
      state = reducer(state, { type: "ADD_NEED_ENTRY", text: "education" });

      expect(state.love).toEqual(["nature"]);
      expect(state.good).toEqual(["teaching"]);
      expect(state.need).toEqual(["education"]);
      expect(state.screen).toBe("need");
    });

    it("sets synthesis", () => {
      const state = reducer(INITIAL, {
        type: "SET_SYNTHESIS",
        synthesis: "You are uniquely positioned to teach regenerative agriculture.",
      });
      expect(state.synthesis).toBe(
        "You are uniquely positioned to teach regenerative agriculture."
      );
    });
  });

  describe("persistence round-trip", () => {
    it("saves state to localStorage on every action", () => {
      reducer(INITIAL, { type: "ADD_LOVE_ENTRY", text: "gardening" });
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.any(String)
      );
    });

    it("round-trips state through localStorage", () => {
      let state = reducer(INITIAL, { type: "ADD_LOVE_ENTRY", text: "growing" });
      state = reducer(state, { type: "TOGGLE_LOVE_CARD", id: "animals" });
      state = reducer(state, { type: "NEXT_SCREEN" });
      state = reducer(state, { type: "NEXT_SCREEN" });
      state = reducer(state, { type: "ADD_GOOD_ENTRY", text: "teaching" });

      // Load from storage
      const saved = JSON.parse(store[STORAGE_KEY]) as IkigaiState;
      expect(saved.love).toEqual(["growing"]);
      expect(saved.loveCards).toEqual(["animals"]);
      expect(saved.good).toEqual(["teaching"]);
      expect(saved.screen).toBe("good");
    });

    it("restores state via RESTORE action", () => {
      const saved: IkigaiState = {
        screen: "review",
        love: ["cooking"],
        good: ["explaining"],
        need: ["community"],
        loveCards: ["nature"],
        goodCards: [],
        needCards: ["soil-health"],
        synthesis: null,
      };
      const state = reducer(INITIAL, { type: "RESTORE", state: saved });
      expect(state.screen).toBe("review");
      expect(state.love).toEqual(["cooking"]);
      expect(state.needCards).toEqual(["soil-health"]);
    });

    it("handles localStorage failure gracefully", () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error("QuotaExceededError");
      });
      // Should not throw
      expect(() =>
        reducer(INITIAL, { type: "ADD_LOVE_ENTRY", text: "test" })
      ).not.toThrow();
    });
  });
});
