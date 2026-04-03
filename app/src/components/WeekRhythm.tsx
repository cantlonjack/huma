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
    <div style={{ padding: "0 14px" }}>
      {/* Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="cursor-pointer"
        style={{
          background: "none",
          border: "none",
          padding: "6px 0 2px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <span
          className="font-sans"
          style={{
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.12em",
            color: "var(--color-sage-400)",
          }}
        >
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
        <div
          className="animate-fade-in"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            padding: "4px 0 6px",
          }}
        >
          {DAYS.map(dow => {
            const count = dayCounts[dow] || 0;
            const { fill, border } = dotStyle(count);
            const isToday = dow === today;

            return (
              <div
                key={dow}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                {/* Completion dot */}
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: fill,
                    border,
                    transition: "all 200ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                />
                {/* Day label */}
                <span
                  className="font-sans"
                  style={{
                    fontSize: "9px",
                    color: "var(--color-sage-400)",
                    lineHeight: 1,
                  }}
                >
                  {DAY_LABELS[dow]}
                </span>
                {/* Today indicator */}
                {isToday && (
                  <div
                    style={{
                      width: "3px",
                      height: "3px",
                      borderRadius: "50%",
                      background: "var(--color-sage-400)",
                      marginTop: "-1px",
                    }}
                  />
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
          className="cursor-pointer"
          style={{
            background: "none",
            border: "none",
            padding: "2px 0 4px",
            display: "block",
          }}
        >
          <span
            className="font-sans"
            style={{
              fontSize: "11px",
              fontStyle: "italic",
              color: "var(--color-sage-400)",
            }}
          >
            {disruption}
          </span>
        </button>
      )}
    </div>
  );
}
