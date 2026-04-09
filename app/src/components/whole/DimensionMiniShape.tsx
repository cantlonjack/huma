"use client";

import { useMemo } from "react";
import type { KnownContext, Aspiration, DimensionKey } from "@/types/v2";
import { DIMENSION_COLORS } from "@/types/v2";

interface DimensionMiniShapeProps {
  context: KnownContext;
  aspirations: Aspiration[];
  whyStatement: string | null;
  archetypes: string[];
  size?: number;
}

const DIMENSIONS: DimensionKey[] = [
  "body", "people", "money", "home", "growth", "joy", "purpose", "identity",
];

function computeDimensionScores(
  context: KnownContext,
  aspirations: Aspiration[],
  whyStatement: string | null,
  archetypes: string[],
): Record<DimensionKey, number> {
  const scores: Record<DimensionKey, number> = {
    body: 0, people: 0, money: 0, home: 0,
    growth: 0, joy: 0, purpose: 0, identity: 0,
  };

  // Context fields contribute score
  if (context.health?.detail) scores.body += 0.4;
  if (Array.isArray(context.people) && context.people.some((p) => p.name)) {
    const count = context.people.filter((p) => p.name).length;
    scores.people += Math.min(count * 0.2, 0.6);
  }
  if (context.financial?.situation || context.financial?.income) scores.money += 0.4;
  if (context.place?.name) scores.home += 0.3;
  if (context.resources?.filter(Boolean).length) scores.home += 0.2;
  if (whyStatement) scores.purpose += 0.4;
  if (context.work?.title) scores.identity += 0.3;
  if (context.stage?.label) scores.identity += 0.2;
  if (archetypes.length > 0) scores.identity += 0.2;

  // Aspirations contribute score per dimension they touch
  for (const asp of aspirations) {
    if (asp.status === "archived" || asp.status === "dropped") continue;
    for (const dim of (asp.dimensionsTouched || [])) {
      if (dim in scores) {
        scores[dim as DimensionKey] = Math.min(scores[dim as DimensionKey] + 0.15, 1);
      }
    }
    // Behaviors add more weight — prefer user dimension overrides
    for (const b of asp.behaviors || []) {
      const dims = b.dimensionOverrides || b.dimensions || [];
      for (const de of dims) {
        if (de.dimension in scores) {
          scores[de.dimension] = Math.min(scores[de.dimension] + 0.1, 1);
        }
      }
    }
  }

  // Cap all scores at 1
  for (const k of DIMENSIONS) {
    scores[k] = Math.min(scores[k], 1);
  }

  return scores;
}

export default function DimensionMiniShape({
  context,
  aspirations,
  whyStatement,
  archetypes,
  size = 64,
}: DimensionMiniShapeProps) {
  const scores = useMemo(
    () => computeDimensionScores(context, aspirations, whyStatement, archetypes),
    [context, aspirations, whyStatement, archetypes],
  );

  const center = size / 2;
  const maxR = (size / 2) - 4;
  const minR = maxR * 0.15; // minimum visible radius even for 0 score
  const angleStep = (2 * Math.PI) / DIMENSIONS.length;

  // Build the polygon path
  const points = DIMENSIONS.map((dim, i) => {
    const angle = angleStep * i - Math.PI / 2; // start from top
    const r = minR + scores[dim] * (maxR - minR);
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";

  // Axis lines
  const axes = DIMENSIONS.map((dim, i) => {
    const angle = angleStep * i - Math.PI / 2;
    return {
      x2: center + maxR * Math.cos(angle),
      y2: center + maxR * Math.sin(angle),
      color: DIMENSION_COLORS[dim],
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      {/* Axis lines */}
      {axes.map((axis, i) => (
        <line
          key={i}
          x1={center}
          y1={center}
          x2={axis.x2}
          y2={axis.y2}
          stroke={axis.color}
          strokeWidth="0.5"
          opacity="0.25"
        />
      ))}

      {/* Shape fill */}
      <path
        d={pathD}
        fill="var(--color-sage-200, #C8D5C9)"
        fillOpacity="0.35"
        stroke="var(--color-sage-400, #8BAF8E)"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Dimension dots on vertices */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="2"
          fill={DIMENSION_COLORS[DIMENSIONS[i]]}
          opacity={scores[DIMENSIONS[i]] > 0 ? 0.8 : 0.2}
        />
      ))}
    </svg>
  );
}
