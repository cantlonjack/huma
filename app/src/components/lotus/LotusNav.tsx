"use client";

import { motion } from "framer-motion";
import {
  LOTUS_PHASES,
  LOTUS_PHASE_LABELS,
  screenToPhase,
  type LotusPhase,
  type LotusScreen,
} from "@/types/lotus";
import { HUMA_EASE } from "@/lib/constants";

/** Only these phases are active for MVP */
const ACTIVE_PHASES: LotusPhase[] = ["whole", "who", "what"];

/** Screen ranges per phase (for progress calculation) */
const PHASE_SCREEN_RANGES: Record<string, [number, number]> = {
  whole: [1, 5],
  who: [6, 6],
  what: [7, 13],
};

/** SVG path data for each petal icon (organic, small, 16x16 viewBox) */
const PETAL_ICONS: Record<LotusPhase, string> = {
  whole:
    "M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zm0 1.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z",
  who:
    "M8 1.5l2.5 3L14 5l-2.5 3L12 11.5 8 9.5 4 11.5l.5-3.5L2 5l3.5-.5z",
  what:
    "M4 3a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9h1a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z",
  context:
    "M8 2C4.5 2 2 5.5 2 8c0 3 2.5 6 6 6s6-3 6-6c0-2.5-2.5-6-6-6zm0 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-2 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z",
  purpose:
    "M8 2a1 1 0 0 0-1 1v4H3a1 1 0 0 0 0 2h4v4a1 1 0 0 0 2 0V9h4a1 1 0 0 0 0-2H9V3a1 1 0 0 0-1-1z",
  vision:
    "M8 3C5 3 2.5 5.5 2 8c.5 2.5 3 5 6 5s5.5-2.5 6-5c-.5-2.5-3-5-6-5zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z",
  behavior:
    "M7 2L3 6l4 4-4 4h2l4-4-4-4 4-4zm4 0l-4 4 4 4-4 4h2l4-4-4-4 4-4z",
  nurture:
    "M8 3c-1 0-2 .5-2.5 1.5C5 5.5 4.5 7 5 8.5c.5 2 2 3.5 3 4.5 1-1 2.5-2.5 3-4.5.5-1.5 0-3-.5-4C10 3.5 9 3 8 3z",
  validate:
    "M3 8l3 3 7-7",
  design:
    "M11 2L5 8l-.5 3.5L8 11l6-6zm-1.5 1.5l2 2L6 11l-2-2z",
  install:
    "M8 2v7m0 0L5 6m3 3l3-3M3 12h10",
  evolve:
    "M8 2a6 6 0 0 0-4.5 10l1-1A4.5 4.5 0 1 1 12.5 8h-2l3 3 3-3h-2A6 6 0 0 0 8 2z",
};

interface LotusNavProps {
  currentScreen: LotusScreen;
  lotusProgress?: Record<LotusPhase, boolean>;
  variant?: "desktop" | "mobile";
}

function getPhaseProgress(
  phase: LotusPhase,
  currentScreen: LotusScreen,
  lotusProgress?: Record<LotusPhase, boolean>
): number {
  if (lotusProgress?.[phase]) return 1;
  const range = PHASE_SCREEN_RANGES[phase];
  if (!range) return 0;
  const currentPhase = screenToPhase(currentScreen);
  if (currentPhase !== phase) {
    // If we're past this phase, it's complete
    const phaseIndex = LOTUS_PHASES.indexOf(phase);
    const currentIndex = LOTUS_PHASES.indexOf(currentPhase);
    return currentIndex > phaseIndex ? 1 : 0;
  }
  // Calculate progress within the phase
  const [start, end] = range;
  const total = end - start + 1;
  const progress = currentScreen - start;
  return Math.min(1, progress / total);
}

export default function LotusNav({ currentScreen, lotusProgress, variant }: LotusNavProps) {
  const currentPhase = screenToPhase(currentScreen);
  const showDesktop = !variant || variant === "desktop";
  const showMobile = !variant || variant === "mobile";

  return (
    <>
      {/* Desktop: vertical sidebar */}
      {showDesktop && (
      <nav
        className="flex flex-col gap-1 w-48 py-6 px-3 shrink-0"
        aria-label="Lotus flow progress"
      >
        {LOTUS_PHASES.map((phase) => {
          const isActive = ACTIVE_PHASES.includes(phase);
          const isCurrent = currentPhase === phase;
          const progress = getPhaseProgress(phase, currentScreen, lotusProgress);
          const isComplete = progress >= 1;

          return (
            <div
              key={phase}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-left
                transition-colors duration-200
                ${isCurrent ? "bg-[#EBF3EC]" : ""}
                ${!isActive ? "opacity-40" : ""}
              `}
            >
              {/* Petal icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="shrink-0"
              >
                <path
                  d={PETAL_ICONS[phase]}
                  stroke={
                    isCurrent
                      ? "#3A5A40"
                      : isComplete
                        ? "#5C7A62"
                        : "#A89E90"
                  }
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill={isComplete ? "#EBF3EC" : "none"}
                />
              </svg>

              {/* Label */}
              <span
                className={`
                  text-xs font-medium uppercase tracking-[0.1em]
                  ${isCurrent ? "text-[#3A5A40]" : isComplete ? "text-[#5C7A62]" : "text-[#A89E90]"}
                `}
                style={{ fontFamily: "var(--font-source-sans)" }}
              >
                {LOTUS_PHASE_LABELS[phase]}
              </span>

              {/* Progress bar */}
              {isActive && (
                <div className="ml-auto w-8 h-1 rounded-full bg-[#EDE6D8] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[#5C7A62]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.4, ease: HUMA_EASE }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </nav>
      )}

      {/* Mobile: horizontal scrollable icons */}
      {showMobile && (
      <nav
        className="flex gap-2 px-4 py-3 overflow-x-auto shrink-0 border-b border-[#EDE6D8]"
        aria-label="Lotus flow progress"
      >
        {LOTUS_PHASES.map((phase) => {
          const isActive = ACTIVE_PHASES.includes(phase);
          const isCurrent = currentPhase === phase;
          const progress = getPhaseProgress(phase, currentScreen, lotusProgress);
          const isComplete = progress >= 1;

          return (
            <div
              key={phase}
              className={`
                flex flex-col items-center gap-1 px-2 py-1 shrink-0
                ${!isActive ? "opacity-30" : ""}
              `}
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${isCurrent ? "bg-[#EBF3EC]" : ""}
                `}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d={PETAL_ICONS[phase]}
                    stroke={
                      isCurrent
                        ? "#3A5A40"
                        : isComplete
                          ? "#5C7A62"
                          : "#A89E90"
                    }
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill={isComplete ? "#EBF3EC" : "none"}
                  />
                </svg>
              </div>
              {/* Tiny progress dot */}
              {isActive && (
                <div
                  className={`w-1 h-1 rounded-full ${
                    isComplete
                      ? "bg-[#5C7A62]"
                      : isCurrent
                        ? "bg-[#8BAF8E]"
                        : "bg-[#DDD4C0]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </nav>
      )}
    </>
  );
}
