"use client";

import { useReducer, useCallback, useEffect } from "react";
import WholeVisualization from "@/components/lotus/WholeVisualization";
import IkigaiIntroScreen from "./screens/IkigaiIntroScreen";
import LoveScreen from "./screens/LoveScreen";
import GoodScreen from "./screens/GoodScreen";
import NeedScreen from "./screens/NeedScreen";
import IkigaiReviewScreen from "./screens/IkigaiReviewScreen";
import IkigaiSynthesisScreen from "./screens/IkigaiSynthesisScreen";
import type { OperatorContext } from "@/types/lotus";

// ─── State ────────────────────────────────────────────────────────────────────

type IkigaiScreen = "intro" | "love" | "good" | "need" | "review" | "synthesis";

const SCREEN_ORDER: IkigaiScreen[] = [
  "intro",
  "love",
  "good",
  "need",
  "review",
  "synthesis",
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

function saveProgress(state: IkigaiState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // silently fail
  }
}

function loadProgress(): IkigaiState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as IkigaiState;
  } catch {
    return null;
  }
}

function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently fail
  }
}

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
      } else {
        return state;
      }
      break;
    }
    case "PREV_SCREEN": {
      const idx = SCREEN_ORDER.indexOf(state.screen);
      if (idx > 0) {
        next = { ...state, screen: SCREEN_ORDER[idx - 1] };
      } else {
        return state;
      }
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

  saveProgress(next);
  return next;
}

const INITIAL_STATE: IkigaiState = {
  screen: "intro",
  love: [],
  good: [],
  need: [],
  loveCards: [],
  goodCards: [],
  needCards: [],
  synthesis: null,
};

// ─── Component ────────────────────────────────────────────────────────────────

interface IkigaiFlowProps {
  context: OperatorContext;
  onComplete: (ikigai: OperatorContext["ikigai"]) => void;
  onClose: () => void;
}

export default function IkigaiFlow({
  context,
  onComplete,
  onClose,
}: IkigaiFlowProps) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE, (init) => {
    // Restore from localStorage if available
    const saved = loadProgress();
    return saved || init;
  });

  const screenIndex = SCREEN_ORDER.indexOf(state.screen);

  // Escape key → go back or close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (screenIndex > 0) {
          dispatch({ type: "PREV_SCREEN" });
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [screenIndex, onClose]);

  const handleComplete = useCallback(() => {
    const ikigai: OperatorContext["ikigai"] = {
      love: state.love,
      good: state.good,
      need: state.need,
      loveCards: state.loveCards,
      goodCards: state.goodCards,
      needCards: state.needCards,
      synthesis: state.synthesis || undefined,
    };
    clearProgress();
    onComplete(ikigai);
  }, [state, onComplete]);

  const handleReviewRemove = useCallback(
    (category: "love" | "good" | "need", index: number) => {
      const actionMap = {
        love: "REMOVE_LOVE_ENTRY" as const,
        good: "REMOVE_GOOD_ENTRY" as const,
        need: "REMOVE_NEED_ENTRY" as const,
      };
      dispatch({ type: actionMap[category], index });
    },
    []
  );

  const handleReviewEdit = useCallback((category: "love" | "good" | "need") => {
    dispatch({ type: "GO_TO_SCREEN", screen: category });
  }, []);

  // Compute WHOLE params from context capitals
  const wholeParams = Object.values(context.capitals || {}).map(
    (v) => (v as number) / 10
  );

  return (
    <div className="fixed inset-0 z-50 bg-sand-50 overflow-y-auto">
      {/* Chrome */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Back / close */}
        {screenIndex > 0 && state.screen !== "synthesis" ? (
          <button
            onClick={() => dispatch({ type: "PREV_SCREEN" })}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-sand-100 transition-colors"
            aria-label="Go back"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M11 4L6 9L11 14"
                stroke="#6B6358"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <button
            onClick={onClose}
            className="text-earth-400 text-sm hover:text-earth-600 transition-colors"
            style={{ fontFamily: "var(--font-source-sans)" }}
          >
            Close
          </button>
        )}

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {SCREEN_ORDER.map((s, i) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i <= screenIndex
                  ? "bg-sage-500"
                  : "bg-sand-300"
              }`}
            />
          ))}
        </div>

        {/* WHOLE (small, breathing) */}
        <div
          className="w-8 h-8"
          style={{
            animation: "whole-breathe 6s ease-in-out infinite",
          }}
        >
          <WholeVisualization params={wholeParams} phase={3} size={32} />
        </div>
      </div>

      {/* Screen content */}
      <div className="max-w-[680px] mx-auto px-6 py-8">
        {state.screen === "intro" && (
          <IkigaiIntroScreen
            onNext={() => dispatch({ type: "NEXT_SCREEN" })}
          />
        )}

        {state.screen === "love" && (
          <LoveScreen
            entries={state.love}
            selectedCards={state.loveCards}
            onAddEntry={(t) => dispatch({ type: "ADD_LOVE_ENTRY", text: t })}
            onRemoveEntry={(i) =>
              dispatch({ type: "REMOVE_LOVE_ENTRY", index: i })
            }
            onToggleCard={(id) =>
              dispatch({ type: "TOGGLE_LOVE_CARD", id })
            }
            onNext={() => dispatch({ type: "NEXT_SCREEN" })}
          />
        )}

        {state.screen === "good" && (
          <GoodScreen
            entries={state.good}
            selectedCards={state.goodCards}
            onAddEntry={(t) => dispatch({ type: "ADD_GOOD_ENTRY", text: t })}
            onRemoveEntry={(i) =>
              dispatch({ type: "REMOVE_GOOD_ENTRY", index: i })
            }
            onToggleCard={(id) =>
              dispatch({ type: "TOGGLE_GOOD_CARD", id })
            }
            onNext={() => dispatch({ type: "NEXT_SCREEN" })}
          />
        )}

        {state.screen === "need" && (
          <NeedScreen
            entries={state.need}
            selectedCards={state.needCards}
            onAddEntry={(t) => dispatch({ type: "ADD_NEED_ENTRY", text: t })}
            onRemoveEntry={(i) =>
              dispatch({ type: "REMOVE_NEED_ENTRY", index: i })
            }
            onToggleCard={(id) =>
              dispatch({ type: "TOGGLE_NEED_CARD", id })
            }
            onNext={() => dispatch({ type: "NEXT_SCREEN" })}
          />
        )}

        {state.screen === "review" && (
          <IkigaiReviewScreen
            love={state.love}
            good={state.good}
            need={state.need}
            loveCards={state.loveCards}
            goodCards={state.goodCards}
            needCards={state.needCards}
            onRemoveEntry={handleReviewRemove}
            onEditCategory={handleReviewEdit}
            onNext={() => dispatch({ type: "NEXT_SCREEN" })}
          />
        )}

        {state.screen === "synthesis" && (
          <IkigaiSynthesisScreen
            love={state.love}
            good={state.good}
            need={state.need}
            loveCards={state.loveCards}
            goodCards={state.goodCards}
            needCards={state.needCards}
            operatorName={context.name}
            wholeParams={wholeParams}
            existingSynthesis={state.synthesis || undefined}
            onSynthesisReady={(s) =>
              dispatch({ type: "SET_SYNTHESIS", synthesis: s })
            }
            onComplete={handleComplete}
          />
        )}
      </div>

      <style jsx global>{`
        @keyframes whole-breathe {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.03);
          }
        }
      `}</style>
    </div>
  );
}
