"use client";

import type { PillLayout } from "@/lib/canvas-layout";
import SpatialPill, { type PillVariant } from "./SpatialPill";

interface SpatialRingProps {
  pills: PillLayout[];
  variant: PillVariant;
  baseDelay?: number;
  stagger?: number;
  animate?: boolean;
}

export default function SpatialRing({
  pills,
  variant,
  baseDelay = 0,
  stagger = 50,
  animate = true,
}: SpatialRingProps) {
  if (pills.length === 0) return null;

  return (
    <g>
      {pills.map((pill) => (
        <SpatialPill
          key={`${variant}-${pill.index}`}
          x={pill.position.x}
          y={pill.position.y}
          text={pill.text}
          variant={variant}
          delay={baseDelay + pill.index * stagger}
          animate={animate}
        />
      ))}
    </g>
  );
}
