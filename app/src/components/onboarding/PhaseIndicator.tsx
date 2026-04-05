"use client";

import { PHASES, type Phase } from "@/engine/types";

interface PhaseIndicatorProps {
  currentPhase: Phase;
}

export default function PhaseIndicator({ currentPhase }: PhaseIndicatorProps) {
  const currentIndex = PHASES.findIndex((p) => p.id === currentPhase);
  const current = PHASES[currentIndex];

  return (
    <div className="flex flex-col items-center pt-4 pb-3 border-b border-sand-200">
      <div className="flex items-center gap-3">
        {PHASES.map((phase, i) => {
          const isComplete = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div
              key={phase.id}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isComplete
                  ? "bg-sage-500"
                  : isCurrent
                    ? "bg-sage-400 animate-[phase-pulse_2s_ease-in-out_infinite]"
                    : "border border-sage-300"
              }`}
              aria-label={`${phase.label}: ${
                isComplete ? "completed" : isCurrent ? "current" : "upcoming"
              }`}
            />
          );
        })}
      </div>
      {current && (
        <span className="mt-2 text-sage-400 uppercase font-sans text-[0.6rem] tracking-[0.18em]">
          {current.label}
        </span>
      )}
    </div>
  );
}
