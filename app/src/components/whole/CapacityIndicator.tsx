"use client";

import type { CapacityState, CapacityLevel } from "@/types/context";

const CAPACITY_LABELS: Record<keyof Omit<CapacityState, "_assessedAt" | "_assessedFrom">, string> = {
  awareness: "Awareness",
  honesty: "Honesty",
  care: "Care",
  agency: "Agency",
  humility: "Humility",
};

const LEVEL_ORDER: CapacityLevel[] = ["undeveloped", "emerging", "developing", "strong"];

const LEVEL_LABELS: Record<CapacityLevel, string> = {
  undeveloped: "Undeveloped",
  emerging: "Emerging",
  developing: "Developing",
  strong: "Strong",
};

function LevelBar({ level }: { level: CapacityLevel }) {
  const idx = LEVEL_ORDER.indexOf(level);
  return (
    <div className="flex gap-[3px]" aria-label={`Level: ${LEVEL_LABELS[level]}`}>
      {LEVEL_ORDER.map((_, i) => (
        <span
          key={i}
          className={`w-3 h-1 rounded-full ${i <= idx ? "bg-sage-500" : "bg-sand-250"}`}
        />
      ))}
    </div>
  );
}

interface CapacityIndicatorProps {
  capacityState?: CapacityState;
}

export default function CapacityIndicator({ capacityState }: CapacityIndicatorProps) {
  if (!capacityState) return null;

  const keys: (keyof typeof CAPACITY_LABELS)[] = [
    "awareness", "honesty", "care", "agency", "humility",
  ];

  // If every capacity is still undeveloped and nothing has been assessed, hide.
  const anyAssessed = !!capacityState._assessedAt
    || keys.some(k => capacityState[k] && capacityState[k] !== "undeveloped");
  if (!anyAssessed) return null;

  return (
    <div className="mx-5 rounded-2xl border border-sand-200 bg-sand-100/70 px-4 py-3.5">
      <div className="flex items-baseline justify-between mb-2.5">
        <span className="font-sans font-medium text-[11px] tracking-[0.14em] uppercase text-sage-400">
          Your capacity
        </span>
        <span className="font-sans text-[10px] italic text-sage-300">
          the soil your frameworks grow in
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {keys.map(key => {
          const level = (capacityState[key] as CapacityLevel) || "undeveloped";
          return (
            <div key={key} className="flex items-center justify-between gap-3 py-0.5">
              <span className="font-sans text-[13px] text-earth-600">
                {CAPACITY_LABELS[key]}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-sans text-[11px] text-sage-400">
                  {LEVEL_LABELS[level]}
                </span>
                <LevelBar level={level} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
