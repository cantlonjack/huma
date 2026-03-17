"use client";

import { useEffect, useState } from "react";

const DEFAULT_LABELS = [
  "Financial",
  "Material",
  "Living",
  "Social",
  "Intellectual",
  "Experiential",
  "Spiritual",
  "Cultural",
];

interface ShapeChartProps {
  scores: number[];
  labels?: string[];
  size?: number;
  className?: string;
  animated?: boolean;
  breathing?: boolean;
}

function polar(angleDeg: number, radius: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [radius * Math.cos(rad), radius * Math.sin(rad)];
}

function toPoints(values: number[], maxR: number, maxScore = 5): string {
  const n = values.length;
  return values
    .map((v, i) => {
      const [x, y] = polar((i * 360) / n, (v / maxScore) * maxR);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function ShapeChart({
  scores,
  labels = DEFAULT_LABELS,
  size,
  className = "",
  animated = true,
  breathing = false,
}: ShapeChartProps) {
  const [revealed, setRevealed] = useState(!animated);
  const n = scores.length;
  const R = 130;
  const labelR = 164;

  useEffect(() => {
    if (animated) {
      const t = setTimeout(() => setRevealed(true), 150);
      return () => clearTimeout(t);
    }
  }, [animated]);

  return (
    <svg
      viewBox="-200 -200 400 400"
      {...(size ? { width: size, height: size } : {})}
      className={`${className} ${breathing ? "shape-breathe" : ""}`}
      role="img"
      aria-label={`Shape chart: ${labels.map((l, i) => `${l} ${scores[i]}/5`).join(", ")}`}
    >
      <defs>
        <radialGradient id="shape-fill-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-sage-400)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--color-sage-600)" stopOpacity="0.12" />
        </radialGradient>
      </defs>

      {/* Grid rings */}
      {[1, 2, 3, 4, 5].map((level) => (
        <polygon
          key={level}
          points={toPoints(Array(n).fill(level), R)}
          fill="none"
          stroke="var(--color-sand-200)"
          strokeWidth={level === 5 ? 1.2 : 0.5}
          opacity={0.7}
        />
      ))}

      {/* Axis lines */}
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = polar((i * 360) / n, R);
        return (
          <line
            key={i}
            x1={0} y1={0} x2={x} y2={y}
            stroke="var(--color-sand-300)"
            strokeWidth="0.75"
          />
        );
      })}

      {/* Data shape */}
      <polygon
        points={toPoints(scores, R)}
        fill="url(#shape-fill-grad)"
        stroke="var(--color-sage-500)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        style={{
          transformOrigin: "0px 0px",
          transform: revealed ? "scale(1)" : "scale(0)",
          opacity: revealed ? 1 : 0,
          transition:
            "transform 1s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease",
        }}
      />

      {/* Data dots */}
      {scores.map((score, i) => {
        const [x, y] = polar((i * 360) / n, (score / 5) * R);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="4"
            fill="var(--color-sage-600)"
            stroke="var(--color-sand-50)"
            strokeWidth="2"
            style={{
              opacity: revealed ? 1 : 0,
              transition: `opacity 0.4s ease ${0.5 + i * 0.06}s`,
            }}
          />
        );
      })}

      {/* Labels */}
      {labels.map((label, i) => {
        const angle = (i * 360) / n;
        const [x, y] = polar(angle, labelR);

        let anchor: "middle" | "start" | "end" = "middle";
        if (x > 15) anchor = "start";
        else if (x < -15) anchor = "end";

        const dy = y < -80 ? -4 : y > 80 ? 14 : 5;

        return (
          <text
            key={i}
            x={x}
            y={y + dy}
            textAnchor={anchor}
            fill="var(--color-earth-600)"
            fontSize="11"
            fontFamily="var(--font-sans)"
            fontWeight="500"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
