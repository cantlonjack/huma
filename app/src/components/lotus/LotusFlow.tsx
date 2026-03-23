"use client";

import { useReducer, useEffect, useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { lotusReducer, INITIAL_STATE } from "./lotus-reducer";
import { saveLotusState, loadLotusState } from "@/lib/lotus-persistence";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import LotusNav from "./LotusNav";
import WholeVisualization from "./WholeVisualization";
import NameEntityScreen from "./screens/NameEntityScreen";
import LifeStageScreen from "./screens/LifeStageScreen";
import ComponentRevealScreen from "./screens/ComponentRevealScreen";
import CanvasIntroScreen from "./screens/CanvasIntroScreen";
import WholeBornScreen from "./screens/WholeBornScreen";
import GovernanceScreen from "./screens/GovernanceScreen";
import CapitalSpectrumScreen from "./screens/CapitalSpectrumScreen";
import FlowerScreen from "./screens/FlowerScreen";
import SynthesisScreen from "./screens/SynthesisScreen";
import WholeEvolvesScreen from "./screens/WholeEvolvesScreen";
import WholeTransitionScreen from "./screens/WholeTransitionScreen";
import InsightScreen from "./screens/InsightScreen";
import SaveScreen from "./screens/SaveScreen";
import { screenToPhase } from "@/types/lotus";
import type { OperatorContext, LotusScreen, LotusAction, LotusState } from "@/types/lotus";
import { HUMA_EASE } from "@/lib/constants";

interface LotusFlowProps {
  onComplete: (context: OperatorContext) => void;
  onClose: () => void;
}

/** Screen transition variants */
const screenVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

const reducedMotionVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function LotusFlow({ onComplete, onClose }: LotusFlowProps) {
  const [state, dispatch] = useReducer(lotusReducer, INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Load persisted state on mount, then mark hydrated
  useEffect(() => {
    const saved = loadLotusState();
    if (saved) {
      dispatch({ type: "RESTORE_STATE", state: saved });
    }
    // Delay hydrated flag to next tick so the restored state renders first
    requestAnimationFrame(() => setHydrated(true));
  }, []);

  // Persist state on every change (skip until hydrated)
  useEffect(() => {
    if (!hydrated) return;
    if (state.context.name || state.screen > 1) {
      saveLotusState(state);
    }
  }, [state, hydrated]);

  const next = useCallback(() => dispatch({ type: "NEXT_SCREEN" }), []);
  const prev = useCallback(() => dispatch({ type: "PREV_SCREEN" }), []);
  const goTo = useCallback(
    (screen: LotusScreen) => dispatch({ type: "GO_TO_SCREEN", screen }),
    []
  );

  // Escape key → go back
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && state.screen > 1) {
        prev();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.screen, prev]);

  // Screen reader announcements
  const [announcement, setAnnouncement] = useState("");
  const prevScreenRef = useRef(state.screen);
  useEffect(() => {
    if (state.screen !== prevScreenRef.current) {
      setAnnouncement(`Step ${state.screen} of 13`);
      prevScreenRef.current = state.screen;
    }
  }, [state.screen]);

  const variants = prefersReducedMotion ? reducedMotionVariants : screenVariants;
  const transitionDuration = prefersReducedMotion ? 0.15 : 0.5;

  // Persistent WHOLE overlay — appears from screen 6 onward (after WHOLE 1.0 born at screen 5)
  const showWholeOverlay = state.screen >= 6 && state.wholeParams.length > 0;

  return (
    <div className="fixed inset-0 bg-[#FAF8F3] flex flex-col md:flex-row">
      {/* Mobile: HUMA wordmark top bar */}
      <header className="flex items-center justify-between px-6 py-4 md:hidden">
        <span
          className="text-xs font-medium uppercase tracking-[0.4em] text-[#5C7A62]"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          HUMA
        </span>
        <button
          onClick={onClose}
          className="text-[#A89E90] hover:text-[#3D3830] transition-colors p-2"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      {/* Mobile: horizontal petal nav */}
      <div className="md:hidden">
        <LotusNav
          currentScreen={state.screen}
          lotusProgress={state.context.lotusProgress}
          variant="mobile"
        />
      </div>

      {/* Desktop: sidebar column with wordmark + petal nav */}
      <aside className="hidden md:flex flex-col shrink-0 border-r border-[#EDE6D8]">
        <div className="flex items-center justify-between px-6 py-5">
          <span
            className="text-sm font-medium uppercase tracking-[0.4em] text-[#5C7A62]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            HUMA
          </span>
          <button
            onClick={onClose}
            className="text-[#A89E90] hover:text-[#3D3830] transition-colors p-1"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <LotusNav
          currentScreen={state.screen}
          lotusProgress={state.context.lotusProgress}
          variant="desktop"
        />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-y-auto relative">
        {/* Screen reader announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </div>

        {/* Persistent WHOLE overlay — upper right, renders at LotusFlow level to survive screen transitions */}
        <AnimatePresence>
          {showWholeOverlay && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, ease: HUMA_EASE }}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-10"
              style={{
                animation: prefersReducedMotion
                  ? undefined
                  : "whole-breathe 6s ease-in-out infinite",
              }}
              aria-hidden="true"
            >
              <WholeVisualization
                params={state.wholeParams}
                phase={state.wholePhase}
                size={48}
                className="md:hidden"
              />
              <WholeVisualization
                params={state.wholeParams}
                phase={state.wholePhase}
                size={64}
                className="hidden md:block"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-[680px]">
          {hydrated ? (
            <AnimatePresence mode="wait" custom={state.direction}>
              <motion.div
                key={state.screen}
                custom={state.direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: transitionDuration, ease: HUMA_EASE }}
                className="w-full"
              >
                {renderScreen(state, dispatch, next, prev, goTo, onComplete, onClose)}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="w-full">
              {renderScreen(state, dispatch, next, prev, goTo, onComplete, onClose)}
            </div>
          )}
        </div>

        {/* Back button (screens 2+, but not on auto-advancing screens 3-5) */}
        {state.screen > 1 && state.screen !== 3 && state.screen !== 4 && state.screen !== 5 && state.screen !== 8 && state.screen !== 10 && state.screen !== 11 && (
          <button
            onClick={prev}
            className="absolute bottom-6 left-6 text-[#A89E90] hover:text-[#3D3830] transition-colors text-sm"
            style={{ fontFamily: "var(--font-source-sans)" }}
          >
            Back
          </button>
        )}
      </div>

      {/* Breathing animation keyframes */}
      <style jsx global>{`
        @keyframes whole-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.01); }
        }
      `}</style>
    </div>
  );
}

/**
 * Render the appropriate screen component.
 * Render the appropriate screen component.
 * All 13 screens now have real components.
 */
function renderScreen(
  state: LotusState,
  dispatch: React.Dispatch<LotusAction>,
  next: () => void,
  prev: () => void,
  goTo: (s: LotusScreen) => void,
  onComplete: (ctx: OperatorContext) => void,
  onClose: () => void
): React.ReactNode {
  switch (state.screen) {
    case 1:
      return <NameEntityScreen state={state} dispatch={dispatch} onNext={next} />;
    case 2:
      return <LifeStageScreen state={state} dispatch={dispatch} onNext={next} />;
    case 3:
      return <ComponentRevealScreen onNext={next} />;
    case 4:
      return <CanvasIntroScreen onNext={next} />;
    case 5:
      return <WholeBornScreen state={state} onNext={next} />;
    case 6:
      return <GovernanceScreen state={state} dispatch={dispatch} onNext={next} />;
    case 7:
      return <CapitalSpectrumScreen state={state} dispatch={dispatch} onNext={next} />;
    case 8:
      return <FlowerScreen state={state} onNext={next} />;
    case 9:
      return <SynthesisScreen state={state} dispatch={dispatch} onNext={next} />;
    case 10:
      return <WholeEvolvesScreen state={state} onNext={next} />;
    case 11:
      return <WholeTransitionScreen state={state} onNext={next} />;
    case 12:
      return <InsightScreen state={state} dispatch={dispatch} onNext={next} />;
    case 13:
      return (
        <SaveScreen
          state={state}
          dispatch={dispatch}
          onSave={onComplete}
          onClose={onClose}
        />
      );
    default:
      return null;
  }
}

