"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { LotusState, LotusAction, LifeStage } from "@/types/lotus";

const HUMA_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ScreenProps {
  state: LotusState;
  dispatch: React.Dispatch<LotusAction>;
  onNext: () => void;
}

const STAGES: { stage: LifeStage; label: string; icon: React.ReactNode }[] = [
  {
    stage: "starting",
    label: "Just starting out",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        {/* Seedling — simple sprout */}
        <path d="M18 28 L18 18" stroke="#5C7A62" strokeWidth="1.4" strokeLinecap="round" />
        <path
          d="M18 18 C14 14, 12 10, 16 8 C18 7, 20 9, 18 12"
          stroke="#5C7A62"
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M18 20 C22 16, 24 12, 22 9 C21 7, 18 9, 18 12"
          stroke="#8BAF8E"
          strokeWidth="1.1"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    stage: "transition",
    label: "In transition",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        {/* Flowing arrows — change */}
        <path
          d="M8 18 C12 12, 24 12, 28 18"
          stroke="#5C7A62"
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M8 20 C12 26, 24 26, 28 20"
          stroke="#8BAF8E"
          strokeWidth="1.1"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M25 15 L28 18 L25 21" stroke="#5C7A62" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
  {
    stage: "building",
    label: "Building something",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        {/* Stacked blocks — construction */}
        <rect x="10" y="22" width="16" height="8" rx="2" stroke="#5C7A62" strokeWidth="1.3" fill="none" />
        <rect x="12" y="15" width="12" height="8" rx="2" stroke="#5C7A62" strokeWidth="1.3" fill="none" />
        <rect x="14" y="8" width="8" height="8" rx="2" stroke="#8BAF8E" strokeWidth="1.1" fill="none" />
      </svg>
    ),
  },
  {
    stage: "searching",
    label: "Searching",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        {/* Compass / search — organic circle with line */}
        <circle cx="16" cy="16" r="8" stroke="#5C7A62" strokeWidth="1.3" fill="none" />
        <path d="M22 22 L28 28" stroke="#8BAF8E" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="16" cy="16" r="2" stroke="#5C7A62" strokeWidth="1" fill="none" />
      </svg>
    ),
  },
];

export default function LifeStageScreen({ state, dispatch, onNext }: ScreenProps) {
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  const name = state.context.name || "";

  // Auto-focus first stage card
  useEffect(() => {
    const t = setTimeout(() => firstButtonRef.current?.focus(), 600);
    return () => clearTimeout(t);
  }, []);

  function handleSelect(stage: LifeStage) {
    dispatch({ type: "SET_STAGE", stage });
    // Auto-advance after brief pause for visual feedback
    setTimeout(onNext, 350);
  }

  return (
    <div className="flex flex-col items-center gap-10">
      <h2
        className="text-2xl md:text-3xl text-center text-[#1A1714]"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        Nice, {name}. Which feels closest to where you are?
      </h2>

      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {STAGES.map(({ stage, label, icon }, idx) => {
          const isSelected = state.context.stage === stage;
          return (
            <motion.button
              key={stage}
              ref={idx === 0 ? firstButtonRef : undefined}
              onClick={() => handleSelect(stage)}
              whileTap={{ scale: 0.97 }}
              animate={isSelected ? { scale: 1.02 } : { scale: 1 }}
              transition={{ duration: 0.2, ease: HUMA_EASE }}
              className={`
                flex flex-col items-center justify-center gap-2 p-4 rounded-xl
                border transition-colors duration-200 min-h-[100px]
                ${isSelected
                  ? "bg-[#EBF3EC] border-[#5C7A62]"
                  : "bg-white border-[#D4CBBA] hover:border-[#A89E90]"
                }
              `}
              aria-label={`${label}${isSelected ? " (selected)" : ""}`}
            >
              {icon}
              <span
                className="text-sm font-medium text-[#3D3830] text-center leading-tight"
                style={{ fontFamily: "var(--font-source-sans)" }}
              >
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
