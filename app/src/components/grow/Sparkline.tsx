"use client";

import type { SparklinePoint } from "@/types/v2";

/**
 * Thin SVG sparkline — 14-day pattern consistency.
 * Rising = momentum, flat = stability, dropping = something changed.
 * No labels, no axes. Just the line.
 */
export default function Sparkline({
  points,
  trend,
  width = 120,
  height = 28,
}: {
  points: SparklinePoint[];
  trend: "rising" | "stable" | "dropping";
  width?: number;
  height?: number;
}) {
  if (points.length < 2) return null;

  const pad = 2; // breathing room so stroke isn't clipped
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  // Map points to SVG coordinates
  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * innerW;
    // Invert Y — SVG 0 is top
    const y = pad + (1 - p.ratio) * innerH;
    return { x, y };
  });

  const polyline = coords.map(c => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");

  // Stroke color: amber-600 always (the trend meaning comes from the shape itself)
  const stroke = "#B5621E";

  // Subtle fill gradient beneath the line for visual weight
  const gradientId = `spark-fill-${trend}`;
  const fillPath =
    `M${coords[0].x.toFixed(1)},${coords[0].y.toFixed(1)} ` +
    coords.slice(1).map(c => `L${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ") +
    ` L${coords[coords.length - 1].x.toFixed(1)},${(height).toFixed(1)}` +
    ` L${coords[0].x.toFixed(1)},${(height).toFixed(1)} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      style={{ display: "block", flexShrink: 0 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.12" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gradientId})`} />
      <polyline
        points={polyline}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
