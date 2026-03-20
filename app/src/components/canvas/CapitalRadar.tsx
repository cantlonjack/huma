"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { CapitalScore, CapitalForm } from "@/engine/canvas-types";

interface CapitalRadarProps {
  profile: CapitalScore[];
  /** Width/height of the SVG viewport */
  size?: number;
  /** Animate the shape growing from center on first render */
  animated?: boolean;
  /** Delay before animation starts (ms) */
  animationDelay?: number;
  /** For embedding inside another SVG (renders <g> instead of <svg>) */
  asGroup?: boolean;
  /** Center position when rendered as group */
  cx?: number;
  cy?: number;
  /** Scale factor when rendered as group */
  scale?: number;
}

const CAPITAL_ORDER: CapitalForm[] = [
  "financial", "material", "living", "social",
  "intellectual", "experiential", "spiritual", "cultural",
];

const CAPITAL_LABELS: Record<CapitalForm, string> = {
  financial: "Financial",
  material: "Material",
  living: "Living",
  social: "Social",
  intellectual: "Intellectual",
  experiential: "Experiential",
  spiritual: "Spiritual",
  cultural: "Cultural",
};

// HUMA easing curve
const HUMA_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * Get (x, y) for a score on a given axis.
 * Axes are distributed evenly around a circle, starting from top (-PI/2).
 */
function axisPoint(
  axisIndex: number,
  totalAxes: number,
  score: number,
  maxScore: number,
  radius: number,
  cx: number,
  cy: number,
): { x: number; y: number } {
  const angle = (Math.PI * 2 * axisIndex) / totalAxes - Math.PI / 2;
  const r = (score / maxScore) * radius;
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

/**
 * Build a smooth closed path through vertices using quadratic bezier curves.
 * This gives the organic, living-system feel specified in the design.
 */
function organicPath(points: { x: number; y: number }[]): string {
  if (points.length < 3) return "";

  const n = points.length;
  // Compute midpoints between consecutive vertices
  const mids = points.map((p, i) => {
    const next = points[(i + 1) % n];
    return { x: (p.x + next.x) / 2, y: (p.y + next.y) / 2 };
  });

  // Start at first midpoint, then quadratic bezier through each vertex to the next midpoint
  let d = `M ${mids[0].x},${mids[0].y}`;
  for (let i = 0; i < n; i++) {
    const vertex = points[(i + 1) % n];
    const nextMid = mids[(i + 1) % n];
    d += ` Q ${vertex.x},${vertex.y} ${nextMid.x},${nextMid.y}`;
  }
  d += " Z";
  return d;
}

/**
 * Build axis endpoint position (at the edge of the chart).
 */
function axisEnd(
  axisIndex: number,
  totalAxes: number,
  radius: number,
  cx: number,
  cy: number,
): { x: number; y: number } {
  const angle = (Math.PI * 2 * axisIndex) / totalAxes - Math.PI / 2;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

/**
 * Label position — slightly beyond the axis endpoint.
 */
function labelPosition(
  axisIndex: number,
  totalAxes: number,
  radius: number,
  cx: number,
  cy: number,
  offset: number = 14,
): { x: number; y: number; anchor: "start" | "middle" | "end" } {
  const angle = (Math.PI * 2 * axisIndex) / totalAxes - Math.PI / 2;
  const r = radius + offset;
  const x = cx + r * Math.cos(angle);
  const y = cy + r * Math.sin(angle);

  // Text anchor based on position
  const cos = Math.cos(angle);
  let anchor: "start" | "middle" | "end" = "middle";
  if (cos > 0.3) anchor = "start";
  if (cos < -0.3) anchor = "end";

  return { x, y, anchor };
}

export default function CapitalRadar({
  profile,
  size = 300,
  animated = true,
  animationDelay = 0,
  asGroup = false,
  cx: groupCx,
  cy: groupCy,
  scale: groupScale,
}: CapitalRadarProps) {
  const [progress, setProgress] = useState(animated ? 0 : 1);
  const [hoveredAxis, setHoveredAxis] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const animFrameRef = useRef<number>(0);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion.current || !animated) {
      setProgress(1);
      return;
    }

    const totalDuration = 800 + CAPITAL_ORDER.length * 50; // ~1200ms total
    let startTime: number | null = null;

    const delayTimer = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const t = Math.min(elapsed / totalDuration, 1);
        // Apply HUMA easing approximation
        const eased = 1 - Math.pow(1 - t, 3);
        setProgress(eased);
        if (t < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        }
      };
      animFrameRef.current = requestAnimationFrame(animate);
    }, animationDelay);

    return () => {
      clearTimeout(delayTimer);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [animated, animationDelay]);

  // Normalize profile to CAPITAL_ORDER
  const sorted = CAPITAL_ORDER.map(
    (form) => profile.find((p) => p.form === form) || { form, score: 1, note: "" }
  );

  const numAxes = sorted.length;
  const maxScore = 5;
  const centerX = size / 2;
  const centerY = size / 2;
  const chartRadius = size * 0.35; // Leave room for labels

  // Score vertices with animation progress
  const vertices = sorted.map((cap, i) => {
    // Stagger each axis slightly
    const axisProgress = animated
      ? Math.min(Math.max((progress * (800 + numAxes * 50) - i * 50) / 800, 0), 1)
      : 1;
    return axisPoint(i, numAxes, cap.score * axisProgress, maxScore, chartRadius, centerX, centerY);
  });

  const shapePath = organicPath(vertices);

  // Guide rings at score 1, 2, 3, 4, 5
  const guideRings = [1, 2, 3, 4, 5].map((s) => {
    const r = (s / maxScore) * chartRadius;
    return r;
  });

  const handleAxisHover = useCallback((index: number | null, event?: React.MouseEvent) => {
    setHoveredAxis(index);
    if (index !== null && event) {
      const svgRect = (event.currentTarget as SVGElement).closest("svg")?.getBoundingClientRect();
      if (svgRect) {
        setTooltipPos({
          x: event.clientX - svgRect.left,
          y: event.clientY - svgRect.top,
        });
      }
    }
  }, []);

  const radarContent = (
    <>
      {/* Guide rings */}
      {guideRings.map((r, i) => (
        <circle
          key={`guide-${i}`}
          cx={centerX}
          cy={centerY}
          r={r}
          fill="none"
          stroke="var(--color-sand-300)"
          strokeWidth="0.5"
          opacity="0.4"
        />
      ))}

      {/* Axis lines */}
      {sorted.map((_, i) => {
        const end = axisEnd(i, numAxes, chartRadius, centerX, centerY);
        const isHovered = hoveredAxis === i;
        const isDimmed = hoveredAxis !== null && hoveredAxis !== i;
        return (
          <line
            key={`axis-${i}`}
            x1={centerX}
            y1={centerY}
            x2={end.x}
            y2={end.y}
            stroke={isHovered ? "var(--color-sage-700)" : "var(--color-sand-300)"}
            strokeWidth={isHovered ? "1" : "0.5"}
            opacity={isDimmed ? 0.25 : 0.4}
            style={{ transition: "all 200ms ease" }}
          />
        );
      })}

      {/* Filled shape */}
      <path
        d={shapePath}
        fill="var(--color-sage-400)"
        fillOpacity={0.2}
        stroke="var(--color-sage-600)"
        strokeWidth="1.5"
        strokeOpacity={0.6}
        style={{ transition: "d 200ms ease" }}
      />

      {/* Vertex dots */}
      {vertices.map((v, i) => {
        const isHovered = hoveredAxis === i;
        const isDimmed = hoveredAxis !== null && hoveredAxis !== i;
        return (
          <circle
            key={`vertex-${i}`}
            cx={v.x}
            cy={v.y}
            r={isHovered ? 5 : 4}
            fill={isHovered ? "var(--color-sage-700)" : "var(--color-sage-600)"}
            opacity={isDimmed ? 0.4 : 1}
            style={{ transition: "all 200ms ease" }}
          />
        );
      })}

      {/* Interactive hover zones + labels */}
      {sorted.map((cap, i) => {
        const end = axisEnd(i, numAxes, chartRadius, centerX, centerY);
        const label = labelPosition(i, numAxes, chartRadius, centerX, centerY);
        const isHovered = hoveredAxis === i;
        const isDimmed = hoveredAxis !== null && hoveredAxis !== i;
        return (
          <g key={`label-${i}`}>
            {/* Invisible wider hit area for hover */}
            <line
              x1={centerX}
              y1={centerY}
              x2={end.x}
              y2={end.y}
              stroke="transparent"
              strokeWidth="16"
              style={{ cursor: "pointer" }}
              onMouseEnter={(e) => handleAxisHover(i, e)}
              onMouseMove={(e) => handleAxisHover(i, e)}
              onMouseLeave={() => handleAxisHover(null)}
            />
            <text
              x={label.x}
              y={label.y}
              textAnchor={label.anchor}
              dominantBaseline="central"
              className="font-sans"
              style={{
                fontSize: size > 200 ? "0.65rem" : "0.5rem",
                fontWeight: isHovered ? 600 : 500,
                fill: isHovered ? "var(--color-sage-700)" : "var(--color-earth-600)",
                opacity: isDimmed ? 0.4 : 1,
                transition: "all 200ms ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => handleAxisHover(i, e)}
              onMouseMove={(e) => handleAxisHover(i, e)}
              onMouseLeave={() => handleAxisHover(null)}
            >
              {CAPITAL_LABELS[cap.form]}
            </text>
          </g>
        );
      })}

      {/* Tooltip */}
      {hoveredAxis !== null && tooltipPos && (
        <g>
          {(() => {
            const cap = sorted[hoveredAxis];
            const text = `${CAPITAL_LABELS[cap.form]}: ${cap.score}/5 — ${cap.note}`;
            const charWidth = size > 200 ? 5.5 : 4;
            const maxChars = 40;
            const displayText = text.length > maxChars ? text.slice(0, maxChars) + "..." : text;
            const textWidth = displayText.length * charWidth + 16;
            const fontSize = size > 200 ? "0.6rem" : "0.45rem";

            // Position tooltip above cursor, clamped to SVG bounds
            let tx = tooltipPos.x - textWidth / 2;
            let ty = tooltipPos.y - 28;
            if (tx < 4) tx = 4;
            if (tx + textWidth > size - 4) tx = size - textWidth - 4;
            if (ty < 4) ty = tooltipPos.y + 16;

            return (
              <>
                <rect
                  x={tx}
                  y={ty}
                  width={textWidth}
                  height={22}
                  rx={4}
                  fill="var(--color-earth-900)"
                  fillOpacity={0.9}
                />
                <text
                  x={tx + 8}
                  y={ty + 14}
                  className="font-sans"
                  style={{
                    fontSize,
                    fill: "var(--color-sand-50)",
                    pointerEvents: "none",
                  }}
                >
                  {displayText}
                </text>
              </>
            );
          })()}
        </g>
      )}
    </>
  );

  if (asGroup) {
    return (
      <g
        transform={`translate(${groupCx ?? 0}, ${groupCy ?? 0}) scale(${groupScale ?? 1})`}
        style={{ transformOrigin: `${groupCx ?? 0}px ${groupCy ?? 0}px` }}
      >
        <g transform={`translate(${-(size / 2)}, ${-(size / 2)})`}>
          {radarContent}
        </g>
      </g>
    );
  }

  return (
    <div className="relative inline-block">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="w-full h-auto max-w-[300px]"
        role="img"
        aria-label={`Capital profile radar chart showing 8 forms of capital: ${sorted.map(c => `${CAPITAL_LABELS[c.form]} ${c.score}/5`).join(", ")}`}
      >
        {radarContent}
      </svg>
    </div>
  );
}
