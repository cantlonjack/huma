"use client";

import { type ShapeData, DIMENSION_ORDER, DIMENSION_LABELS, type DimensionKey } from "@/types/shape";

interface ShapeRadarProps {
  shape: Partial<ShapeData["dimensions"]>;
  size?: number;
  compareShape?: ShapeData["dimensions"];
  breathing?: boolean;
  warmth?: Partial<Record<DimensionKey, number>>;
  labels?: boolean;
  interactive?: boolean;
  highlighted?: DimensionKey[];
  lever?: DimensionKey;
  className?: string;
}

const R = 90; // Max radius in viewBox units
const CENTER = 100;

function polarXY(index: number, radius: number, total: number = 8): [number, number] {
  const angle = ((index * 360) / total - 90) * (Math.PI / 180);
  return [
    CENTER + radius * Math.cos(angle),
    CENTER + radius * Math.sin(angle),
  ];
}

function valueToRadius(value: number | undefined): number {
  if (value === undefined || value === 0) return R * 0.15; // minimum visible
  return R * (0.2 + (value / 5) * 0.8); // 20%-100% of radius
}

/**
 * Build an organic shape path using quadratic bezier curves.
 * Control points are offset slightly inward to give the shape
 * a living, non-angular feel.
 */
function buildShapePath(
  dimensions: Partial<ShapeData["dimensions"]>,
  dimOrder: readonly DimensionKey[]
): string {
  const points = dimOrder.map((key, i) => {
    const r = valueToRadius(dimensions[key]);
    return polarXY(i, r);
  });

  const n = points.length;
  let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;

  for (let i = 0; i < n; i++) {
    const curr = points[i];
    const next = points[(i + 1) % n];
    // Control point: midpoint pulled slightly toward center
    const mx = (curr[0] + next[0]) / 2;
    const my = (curr[1] + next[1]) / 2;
    const cx = mx + (CENTER - mx) * 0.15;
    const cy = my + (CENTER - my) * 0.15;
    d += ` Q${cx.toFixed(1)},${cy.toFixed(1)} ${next[0].toFixed(1)},${next[1].toFixed(1)}`;
  }

  return d;
}

export default function ShapeRadar({
  shape,
  size,
  compareShape,
  breathing = false,
  labels = false,
  highlighted = [],
  lever,
  className = "",
}: ShapeRadarProps) {
  const shapePath = buildShapePath(shape, DIMENSION_ORDER);
  const comparePath = compareShape
    ? buildShapePath(compareShape, DIMENSION_ORDER)
    : null;

  return (
    <svg
      viewBox="0 0 200 200"
      {...(size ? { width: size, height: size } : {})}
      className={className}
      style={breathing ? {
        animation: "shapeBreath 4s ease-in-out infinite",
      } : undefined}
      role="img"
      aria-label={`Life shape: ${DIMENSION_ORDER.filter(k => shape[k] !== undefined)
        .map(k => `${DIMENSION_LABELS[k]} ${shape[k]}/5`).join(", ")}`}
    >
      {/* Axis lines — very subtle */}
      {DIMENSION_ORDER.map((_, i) => {
        const [x, y] = polarXY(i, R);
        return (
          <line
            key={i}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            stroke="var(--color-sand-300, #DDD4C0)"
            strokeWidth="0.5"
            opacity="0.5"
          />
        );
      })}

      {/* Compare shape (background) */}
      {comparePath && (
        <path
          d={comparePath}
          fill="var(--color-sage-300, #A8C4AA)"
          fillOpacity="0.15"
          stroke="var(--color-sage-400, #8BAF8E)"
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeDasharray="4 3"
        />
      )}

      {/* Main shape */}
      <path
        d={shapePath}
        fill="var(--color-sage-400, #8BAF8E)"
        fillOpacity="0.2"
        stroke="var(--color-sage-500, #5C7A62)"
        strokeWidth="1.5"
        strokeOpacity="0.6"
        strokeLinejoin="round"
      />

      {/* Vertex dots */}
      {DIMENSION_ORDER.map((key, i) => {
        if (shape[key] === undefined) return null;
        const r = valueToRadius(shape[key]);
        const [x, y] = polarXY(i, r);
        return (
          <circle
            key={key}
            cx={x}
            cy={y}
            r="2.5"
            fill="var(--color-sage-600, #4A6E50)"
            opacity="0.7"
          />
        );
      })}

      {/* Dimension labels */}
      {labels && DIMENSION_ORDER.map((key, i) => {
        const [x, y] = polarXY(i, R + 14);
        let anchor: "middle" | "start" | "end" = "middle";
        if (x > CENTER + 10) anchor = "start";
        else if (x < CENTER - 10) anchor = "end";

        const isHighlighted = highlighted.includes(key);
        const isLever = key === lever;

        return (
          <text
            key={key}
            x={x}
            y={y + (y < CENTER - 30 ? -2 : y > CENTER + 30 ? 8 : 4)}
            textAnchor={anchor}
            fill={isHighlighted || isLever
              ? "var(--color-sage-700, #3A5A40)"
              : "var(--color-earth-600, #554D42)"}
            fontSize="8"
            fontFamily="var(--font-sans)"
            fontWeight={isHighlighted || isLever ? "700" : "500"}
          >
            {DIMENSION_LABELS[key]}
            {isLever && (
              <animate
                attributeName="opacity"
                values="1;0.5;1"
                dur="3s"
                repeatCount="indefinite"
              />
            )}
          </text>
        );
      })}

      <style>{`
        @keyframes shapeBreath {
          0%, 100% { transform: scale(1); transform-origin: center; }
          50% { transform: scale(1.01); transform-origin: center; }
        }
      `}</style>
    </svg>
  );
}
