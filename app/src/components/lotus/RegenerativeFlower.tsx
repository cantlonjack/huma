"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CAPITAL_ORDER, CAPITAL_COLORS } from "@/types/lotus";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { CapitalKey } from "@/types/lotus";

const HUMA_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface RegenerativeFlowerProps {
  capitals: Record<CapitalKey, number>;
  size?: number;
  className?: string;
  animate?: boolean;
}

/**
 * Generates an organic bezier petal path.
 * Each petal grows outward from center, with slight irregularity
 * to feel botanical rather than geometric.
 *
 * The petal is a closed bezier shape — two curves out and two curves back,
 * with control points offset to create organic width variation.
 */
function generatePetalPath(
  cx: number,
  cy: number,
  angle: number,
  length: number,
  index: number
): string {
  const rad = (angle * Math.PI) / 180;

  // Petal width proportional to length, with slight per-petal variation
  const baseWidth = length * 0.28 + (index % 3) * 1.2;

  // Perpendicular offset for width
  const perpX = Math.cos(rad + Math.PI / 2);
  const perpY = Math.sin(rad + Math.PI / 2);

  // Direction along petal axis
  const dirX = Math.cos(rad);
  const dirY = Math.sin(rad);

  // Tip of the petal
  const tipX = cx + dirX * length;
  const tipY = cy + dirY * length;

  // Control points — two on each side, creating the organic bulge
  // Slight asymmetry per petal for natural feel
  const asymmetry = 1 + (index % 2 === 0 ? 0.08 : -0.06);

  // Right side control points (outgoing curve)
  const r1X = cx + dirX * length * 0.3 + perpX * baseWidth * asymmetry;
  const r1Y = cy + dirY * length * 0.3 + perpY * baseWidth * asymmetry;
  const r2X = cx + dirX * length * 0.7 + perpX * baseWidth * 0.6;
  const r2Y = cy + dirY * length * 0.7 + perpY * baseWidth * 0.6;

  // Left side control points (return curve)
  const l1X = cx + dirX * length * 0.7 - perpX * baseWidth * 0.55;
  const l1Y = cy + dirY * length * 0.7 - perpY * baseWidth * 0.55;
  const l2X = cx + dirX * length * 0.3 - perpX * baseWidth * (asymmetry - 0.15);
  const l2Y = cy + dirY * length * 0.3 - perpY * baseWidth * (asymmetry - 0.15);

  return [
    `M ${cx} ${cy}`,
    `C ${r1X} ${r1Y}, ${r2X} ${r2Y}, ${tipX} ${tipY}`,
    `C ${l1X} ${l1Y}, ${l2X} ${l2Y}, ${cx} ${cy}`,
    "Z",
  ].join(" ");
}

export default function RegenerativeFlower({
  capitals,
  size = 280,
  className = "",
  animate = true,
}: RegenerativeFlowerProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;

  const viewBox = 200;
  const cx = viewBox / 2;
  const cy = viewBox / 2;
  const maxPetalLength = 70; // max radius from center
  const minPetalLength = maxPetalLength * 0.2; // value=1 gets 20%

  const petals = useMemo(() => {
    return CAPITAL_ORDER.map((key, i) => {
      const value = capitals[key] || 0;
      // Map 1-10 to 20%-100% of max length. 0 = hidden.
      const normalizedLength =
        value > 0
          ? minPetalLength + ((value - 1) / 9) * (maxPetalLength - minPetalLength)
          : 0;

      // Distribute 8 petals evenly, starting from top (–90°)
      const angle = -90 + i * 45;

      const path = generatePetalPath(cx, cy, angle, normalizedLength, i);
      const color = CAPITAL_COLORS[key];

      return { key, path, color, value, angle, index: i };
    });
  }, [capitals, cx, cy, maxPetalLength, minPetalLength]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewBox} ${viewBox}`}
      className={className}
      aria-label="Your regenerative wealth flower — each petal represents a form of capital"
      role="img"
    >
      {/* Subtle radial guide lines (barely visible) */}
      {CAPITAL_ORDER.map((_, i) => {
        const angle = ((-90 + i * 45) * Math.PI) / 180;
        return (
          <line
            key={`guide-${i}`}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(angle) * maxPetalLength * 0.85}
            y2={cy + Math.sin(angle) * maxPetalLength * 0.85}
            stroke="#EDE6D8"
            strokeWidth="0.5"
            strokeDasharray="2 3"
          />
        );
      })}

      {/* Petals */}
      {petals.map(({ key, path, color, value, index }) => {
        if (value === 0) return null;

        // Opacity: lower values are more translucent
        const opacity = 0.5 + (value / 10) * 0.5;

        return shouldAnimate ? (
          <motion.path
            key={key}
            d={path}
            fill={color}
            fillOpacity={opacity}
            stroke={color}
            strokeWidth="0.8"
            strokeOpacity={0.6}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 1.2,
              delay: index * 0.1,
              ease: HUMA_EASE,
            }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        ) : (
          <path
            key={key}
            d={path}
            fill={color}
            fillOpacity={opacity}
            stroke={color}
            strokeWidth="0.8"
            strokeOpacity={0.6}
          />
        );
      })}

      {/* Center circle — TIME anchor */}
      <motion.g
        initial={shouldAnimate ? { opacity: 0, scale: 0.5 } : undefined}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          delay: shouldAnimate ? 0.9 : 0,
          ease: HUMA_EASE,
        }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        {/* Soft glow behind center */}
        <circle cx={cx} cy={cy} r="12" fill="#FAF8F3" fillOpacity="0.9" />
        <circle
          cx={cx}
          cy={cy}
          r="10"
          fill="none"
          stroke="#C4BAA8"
          strokeWidth="0.8"
        />

        {/* Hourglass icon */}
        <g transform={`translate(${cx - 5}, ${cy - 6})`}>
          {/* Top half */}
          <path
            d="M1 0 L9 0 L5 5 Z"
            fill="none"
            stroke="#6B6358"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          {/* Bottom half */}
          <path
            d="M1 12 L9 12 L5 7 Z"
            fill="none"
            stroke="#6B6358"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          {/* Sand dots */}
          <circle cx="5" cy="4" r="0.6" fill="#C4BAA8" />
          <circle cx="5" cy="8" r="0.6" fill="#C4BAA8" />
        </g>
      </motion.g>

      {/* Pulse animation on center (TIME breathes) */}
      {!prefersReducedMotion && (
        <circle cx={cx} cy={cy} r="10" fill="none" stroke="#C4BAA8" strokeWidth="0.4">
          <animate
            attributeName="r"
            values="10;12;10"
            dur="4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-opacity"
            values="0.5;0.15;0.5"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </svg>
  );
}
