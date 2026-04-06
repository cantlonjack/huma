"use client";

import { memo } from "react";
import type { Nudge } from "@/types/v2";

const TYPE_LABELS: Record<string, string> = {
  temporal: "TIMING",
  pattern: "PATTERN",
  opportunity: "CONNECTION",
};

const TYPE_BORDER_COLORS: Record<string, string> = {
  temporal: "border-l-sage-500",
  pattern: "border-l-sky-600",
  opportunity: "border-l-amber-500",
};

export const NudgeCard = memo(function NudgeCard({
  nudge,
  onDismiss,
  onEngage,
}: {
  nudge: Nudge;
  onDismiss: (id: string) => void;
  onEngage: (nudge: Nudge) => void;
}) {
  const borderClass = TYPE_BORDER_COLORS[nudge.type] || "border-l-sage-400";
  const label = TYPE_LABELS[nudge.type] || "NUDGE";

  return (
    <div
      className={`animate-entrance-2 bg-sand-100 border-l-[3px] ${borderClass} rounded-r-xl px-4 py-3.5 mx-4 mb-2.5`}
    >
      <span className="block font-sans text-[10px] font-semibold tracking-[0.2em] text-sage-400 mb-1">
        {label}
      </span>
      <p className="font-serif text-ink-700 text-[15px] leading-relaxed">
        {nudge.text}
      </p>
      <div className="flex justify-between items-center mt-2">
        <button
          onClick={() => onEngage(nudge)}
          className="font-sans font-medium text-sage-500 cursor-pointer hover:text-sage-700 transition-colors text-[13px] bg-transparent border-none py-2 min-h-[44px]"
        >
          Tell me more &rarr;
        </button>
        <button
          onClick={() => onDismiss(nudge.id)}
          className="font-sans text-sage-300 cursor-pointer hover:text-sage-500 transition-colors text-base bg-transparent border-none p-2 min-h-[44px] min-w-[44px] flex items-center justify-center leading-none"
          aria-label="Dismiss nudge"
        >
          &times;
        </button>
      </div>
    </div>
  );
});
