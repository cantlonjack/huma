"use client";

import { useState } from "react";

export type PillVariant = "qol" | "production" | "resource";

const PILL_STYLES: Record<PillVariant, {
  fill: string;
  stroke: string;
  textColor: string;
}> = {
  qol: {
    fill: "var(--color-sage-50)",
    stroke: "var(--color-sage-200)",
    textColor: "var(--color-sage-800)",
  },
  production: {
    fill: "var(--color-amber-100)",
    stroke: "#F0DCC8",
    textColor: "var(--color-amber-600)",
  },
  resource: {
    fill: "var(--color-sky-100)",
    stroke: "#C8DEE8",
    textColor: "var(--color-sky-600)",
  },
};

interface SpatialPillProps {
  x: number;
  y: number;
  text: string;
  variant: PillVariant;
  delay?: number;
  animate?: boolean;
}

export default function SpatialPill({
  x,
  y,
  text,
  variant,
  delay = 0,
  animate = true,
}: SpatialPillProps) {
  const [hovered, setHovered] = useState(false);
  const style = PILL_STYLES[variant];

  // Truncate for display, full text on hover
  const maxLen = 28;
  const displayText = text.length > maxLen ? text.slice(0, maxLen - 1) + "\u2026" : text;

  // Measure approximate pill width based on text length
  const charWidth = 6.5;
  const padding = 28;
  const pillWidth = Math.min(displayText.length * charWidth + padding, 200);
  const pillHeight = 28;
  const rx = pillHeight / 2;

  return (
    <g
      className={animate ? "spatial-pill-enter" : ""}
      style={{
        animationDelay: `${delay}ms`,
        transformOrigin: `${x}px ${y}px`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Pill background */}
      <rect
        x={x - pillWidth / 2}
        y={y - pillHeight / 2}
        width={pillWidth}
        height={pillHeight}
        rx={rx}
        fill={style.fill}
        stroke={hovered ? style.textColor : style.stroke}
        strokeWidth={1}
        style={{
          transition: "stroke 0.3s cubic-bezier(0.22, 1, 0.36, 1), transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
          transform: hovered ? "translateY(-1px)" : "none",
        }}
      />

      {/* Pill text */}
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        className="font-sans"
        style={{
          fontSize: "0.7rem",
          fontWeight: 500,
          fill: style.textColor,
          pointerEvents: "none",
        }}
      >
        {displayText}
      </text>

      {/* Full text tooltip on hover */}
      {hovered && text.length > maxLen && (
        <g>
          <rect
            x={x - (text.length * 5.5 + 20) / 2}
            y={y - pillHeight / 2 - 32}
            width={text.length * 5.5 + 20}
            height={24}
            rx={6}
            fill="var(--color-earth-800)"
            opacity="0.92"
          />
          <text
            x={x}
            y={y - pillHeight / 2 - 20}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-sans"
            style={{
              fontSize: "0.65rem",
              fontWeight: 400,
              fill: "var(--color-sand-50)",
            }}
          >
            {text}
          </text>
        </g>
      )}
    </g>
  );
}
