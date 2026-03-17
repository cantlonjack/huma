"use client";

import { PHASES, type Phase } from "@/engine/types";

interface PhaseIndicatorProps {
  currentPhase: Phase;
}

export default function PhaseIndicator({ currentPhase }: PhaseIndicatorProps) {
  const currentIndex = PHASES.findIndex((p) => p.id === currentPhase);
  const current = PHASES[currentIndex];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        {PHASES.map((phase, i) => (
          <div
            key={phase.id}
            className={`h-2 rounded-full transition-all duration-300 ${
              i < currentIndex
                ? "w-2 bg-sage-400"
                : i === currentIndex
                  ? "w-4 bg-amber-400"
                  : "w-2 bg-sand-300"
            }`}
            aria-label={`${phase.label}: ${
              i < currentIndex ? "completed" : i === currentIndex ? "current" : "upcoming"
            }`}
          />
        ))}
      </div>
      {current && (
        <>
          {/* Mobile: compact index */}
          <span className="text-sm text-earth-600 sm:hidden">
            {currentIndex + 1}/6
          </span>
          {/* Desktop: full label + subtitle */}
          <span className="text-sm text-earth-600 hidden sm:inline">
            {current.label}
            <span className="text-earth-500">
              {" "}
              &middot; {current.subtitle}
            </span>
          </span>
        </>
      )}
    </div>
  );
}
