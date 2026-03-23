"use client";

import { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { HUMA_EASE } from "@/lib/constants";

interface WholeVisualizationProps {
  params: number[]; // [entitySeed, stageSeed, capitalSum, capitalVariance]
  phase: 1 | 2 | 3;
  size?: number;
  className?: string;
}

/**
 * Generate a rose curve path: r = a + b * cos(k * theta)
 * Returns an SVG path data string centered at (cx, cy).
 */
function roseCurvePath(
  cx: number,
  cy: number,
  a: number,
  b: number,
  k: number,
  scale: number,
  phaseOffset: number = 0,
  steps: number = 360
): string {
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * Math.PI * 2 * Math.ceil(k);
    const r = (a + b * Math.cos(k * theta + phaseOffset)) * scale;
    const x = cx + r * Math.cos(theta);
    const y = cy + r * Math.sin(theta);
    points.push([x, y]);
  }
  if (points.length === 0) return "";
  let d = `M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i][0].toFixed(2)} ${points[i][1].toFixed(2)}`;
  }
  return d;
}

/**
 * Compute the approximate total length of a path for stroke-dashoffset animation.
 */
function approximatePathLength(path: string): number {
  // Rough estimate: count points * average segment length
  const points = path.split(/[ML]/).filter(Boolean);
  return points.length * 1.5;
}

interface CurveConfig {
  a: number;
  b: number;
  k: number;
  scale: number;
  phaseOffset: number;
  strokeWidth: number;
  opacity: number;
  color: string;
}

function computeCurves(params: number[], phase: 1 | 2 | 3): CurveConfig[] {
  const [entitySeed = 3, stageSeed = 1, capitalSum = 0, capitalVariance = 0] = params;

  // Base k from entity type (Person=3 gives 3-petal rose, Enterprise=5 gives 5-petal)
  const baseK = entitySeed;
  // Complexity from stage
  const complexity = 0.6 + stageSeed * 0.15;
  // Scale from capital sum (if available)
  const scaleBoost = capitalSum > 0 ? 0.6 + (capitalSum / 80) * 0.4 : 0.75;
  // Asymmetry from variance
  const asymmetry = capitalVariance > 0 ? capitalVariance / 10 : 0;

  const curves: CurveConfig[] = [];

  if (phase === 1) {
    // Phase 1: Simple wireframe — 3 overlapping rose curves
    curves.push({
      a: 0.3,
      b: 1,
      k: baseK,
      scale: 38 * scaleBoost,
      phaseOffset: 0,
      strokeWidth: 1.2,
      opacity: 0.7,
      color: "#5C7A62", // sage-500
    });
    curves.push({
      a: 0.2,
      b: 1,
      k: baseK + 1,
      scale: 32 * scaleBoost * complexity,
      phaseOffset: Math.PI / (baseK + 1),
      strokeWidth: 0.8,
      opacity: 0.45,
      color: "#8BAF8E", // sage-300
    });
    curves.push({
      a: 0.4,
      b: 0.8,
      k: baseK * 2,
      scale: 22 * scaleBoost,
      phaseOffset: Math.PI / 3,
      strokeWidth: 0.6,
      opacity: 0.3,
      color: "#5C7A62",
    });
  } else if (phase === 2) {
    // Phase 2: More complex — capitals reshape the curves
    curves.push({
      a: 0.3 + asymmetry * 0.1,
      b: 1,
      k: baseK,
      scale: 40 * scaleBoost,
      phaseOffset: asymmetry * 0.5,
      strokeWidth: 1.4,
      opacity: 0.8,
      color: "#5C7A62",
    });
    curves.push({
      a: 0.15,
      b: 1,
      k: baseK + 2,
      scale: 35 * scaleBoost * complexity,
      phaseOffset: Math.PI / (baseK + 2) + asymmetry * 0.3,
      strokeWidth: 1.0,
      opacity: 0.5,
      color: "#8BAF8E",
    });
    curves.push({
      a: 0.5,
      b: 0.7,
      k: baseK * 2 + 1,
      scale: 28 * scaleBoost,
      phaseOffset: Math.PI / 4,
      strokeWidth: 0.7,
      opacity: 0.35,
      color: "#3A5A40", // sage-700
    });
    curves.push({
      a: 0.2,
      b: 0.9,
      k: baseK + 3,
      scale: 18 * scaleBoost,
      phaseOffset: Math.PI / 5,
      strokeWidth: 0.5,
      opacity: 0.25,
      color: "#5C7A62",
    });
  } else {
    // Phase 3: Organic — same as phase 2 but rendered with glow/blur
    curves.push({
      a: 0.3 + asymmetry * 0.1,
      b: 1,
      k: baseK,
      scale: 42 * scaleBoost,
      phaseOffset: asymmetry * 0.5,
      strokeWidth: 2.5,
      opacity: 0.9,
      color: "#5C7A62",
    });
    curves.push({
      a: 0.15,
      b: 1,
      k: baseK + 2,
      scale: 36 * scaleBoost * complexity,
      phaseOffset: Math.PI / (baseK + 2) + asymmetry * 0.3,
      strokeWidth: 2.0,
      opacity: 0.6,
      color: "#8BAF8E",
    });
    curves.push({
      a: 0.5,
      b: 0.7,
      k: baseK * 2 + 1,
      scale: 30 * scaleBoost,
      phaseOffset: Math.PI / 4,
      strokeWidth: 1.5,
      opacity: 0.4,
      color: "#3A5A40",
    });
  }

  return curves;
}

export default function WholeVisualization({
  params,
  phase,
  size = 240,
  className = "",
}: WholeVisualizationProps) {
  const prefersReducedMotion = useReducedMotion();
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  const curves = useMemo(() => computeCurves(params, phase), [params, phase]);

  const paths = useMemo(() => {
    const cx = 100;
    const cy = 100;
    return curves.map((c) =>
      roseCurvePath(cx, cy, c.a, c.b, c.k, c.scale, c.phaseOffset)
    );
  }, [curves]);

  // Measure actual path lengths for stroke-dashoffset animation
  useEffect(() => {
    if (prefersReducedMotion) return;
    pathRefs.current.forEach((el) => {
      if (!el) return;
      const length = el.getTotalLength();
      el.style.strokeDasharray = `${length}`;
      el.style.strokeDashoffset = `${length}`;
      // Force reflow
      el.getBoundingClientRect();
      el.style.transition = `stroke-dashoffset 1.8s cubic-bezier(0.22, 1, 0.36, 1)`;
      el.style.strokeDashoffset = "0";
    });
  }, [paths, prefersReducedMotion]);

  const isPhase3 = phase === 3;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: HUMA_EASE }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
        style={isPhase3 ? { filter: "blur(1.5px)" } : undefined}
      >
        {/* Phase 3: gradient overlay */}
        {isPhase3 && (
          <defs>
            <radialGradient id="whole-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#5C7A62" stopOpacity="0.15" />
              <stop offset="60%" stopColor="#B5621E" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#FAF8F3" stopOpacity="0" />
            </radialGradient>
          </defs>
        )}
        {isPhase3 && (
          <circle cx="100" cy="100" r="90" fill="url(#whole-glow)" />
        )}

        {paths.map((d, i) => (
          <path
            key={`${phase}-${i}`}
            ref={(el) => { pathRefs.current[i] = el; }}
            d={d}
            stroke={curves[i].color}
            strokeWidth={curves[i].strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={curves[i].opacity}
            style={
              prefersReducedMotion
                ? undefined
                : {
                    strokeDasharray: "2000",
                    strokeDashoffset: "2000",
                  }
            }
          />
        ))}
      </svg>
    </motion.div>
  );
}
