"use client";

import { useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface WeekRhythmProps {
  /** Completion counts per day of week (0=Sun..6=Sat) over trailing 28 days */
  dayCounts: Record<number, number>;
  /** Cycle disruption message, if any */
  disruption?: string | null;
  /** Called when disruption caption is tapped */
  onDisruptionTap?: () => void;
}

// ─── Constants ──────────────────────────────────────────────────────────────

// Display order: Mon(1) Tue(2) Wed(3) Thu(4) Fri(5) Sat(6) Sun(0)
const DAYS = [1, 2, 3, 4, 5, 6, 0] as const;
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]; // indexed by JS day (0=Sun)

function dotStyle(count: number): { fill: string; border: string } {
  if (count >= 3) return { fill: "#5C7A62", border: "none" };       // sage-500 solid
  if (count >= 1) return { fill: "#D5E3D7", border: "none" };       // sage-100 light fill
  return { fill: "transparent", border: "1.5px solid #DDD4C0" };    // hollow, sand-300
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function WeekRhythm({ dayCounts, disruption, onDisruptionTap }: WeekRhythmProps) {
  const [expanded, setExpanded] = useState(false);
  const today = new Date().getDay(); // 0=Sun..6=Sat

  return (
    <div className="px-3.5">
      {/* Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="cursor-pointer bg-transparent border-none px-0 pt-1.5 pb-0.5 flex items-center gap-1"
      >
        <span className="font-sans text-[10px] font-medium tracking-[0.12em] text-sage-400">
          RHYTHM
        </span>
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          fill="none"
          style={{
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 200ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <path d="M1.5 3L4 5.5L6.5 3" stroke="#8BAF8E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Rhythm row */}
      {expanded && (
        <div className="animate-fade-in flex justify-center gap-3 pt-1 pb-1.5">
          {DAYS.map(dow => {
            const count = dayCounts[dow] || 0;
            const { fill, border } = dotStyle(count);
            const isToday = dow === today;

            return (
              <div key={dow} className="flex flex-col items-center gap-[3px]">
                {/* Completion dot */}
                <div
                  className="w-3 h-3 rounded-full transition-all duration-200"
                  style={{ background: fill, border }}
                />
                {/* Day label */}
                <span className="font-sans text-[9px] text-sage-400 leading-none">
                  {DAY_LABELS[dow]}
                </span>
                {/* Today indicator */}
                {isToday && (
                  <div className="w-[3px] h-[3px] rounded-full bg-sage-400 -mt-px" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Disruption caption */}
      {expanded && disruption && (
        <button
          onClick={onDisruptionTap}
          className="cursor-pointer bg-transparent border-none px-0 pt-0.5 pb-1 block"
        >
          <span className="font-sans text-[11px] italic text-sage-400">
            {disruption}
          </span>
        </button>
      )}
    </div>
  );
}
