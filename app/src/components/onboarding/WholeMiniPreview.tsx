"use client";

import type { DimensionKey } from "@/types/v2";
import { DIMENSION_COLORS } from "@/types/v2";

/**
 * Simplified static SVG silhouette of the WholeShape for the /start page.
 * Shows a membrane outline with aspiration nodes fading in as they're created.
 */
export default function WholeMiniPreview({
  aspirationDimensions = [],
}: {
  aspirationDimensions?: DimensionKey[][];
}) {
  const size = 120;
  const cx = size / 2;
  const cy = size / 2;
  const membraneR = 48;

  // Place aspiration nodes in a circle inside the membrane
  const nodeR = 6;
  const orbitR = 28;

  return (
    <div
      className="animate-fade-in"
      style={{ width: size, height: size, opacity: 0.85 }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
      >
        {/* Membrane outline */}
        <circle
          cx={cx}
          cy={cy}
          r={membraneR}
          stroke="var(--color-sage-200)"
          strokeWidth={1.5}
          fill="none"
          opacity={aspirationDimensions.length > 0 ? 0.6 : 0.3}
          style={{
            transition: "opacity 600ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />

        {/* Identity nucleus */}
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill="var(--color-sage-300)"
          opacity={0.5}
        />

        {/* Aspiration nodes */}
        {aspirationDimensions.map((dims, i) => {
          const angle = (i / Math.max(aspirationDimensions.length, 1)) * Math.PI * 2 - Math.PI / 2;
          const nx = cx + Math.cos(angle) * orbitR;
          const ny = cy + Math.sin(angle) * orbitR;
          const color = dims[0] ? DIMENSION_COLORS[dims[0]] : "#8BAF8E";

          return (
            <circle
              key={i}
              cx={nx}
              cy={ny}
              r={nodeR}
              fill={color}
              opacity={0.6}
              style={{
                transition: "all 600ms cubic-bezier(0.22, 1, 0.36, 1)",
                animationDelay: `${i * 150}ms`,
              }}
              className="animate-fade-in"
            />
          );
        })}
      </svg>
    </div>
  );
}
