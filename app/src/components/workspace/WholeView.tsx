"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import WholeVisualization from "@/components/lotus/WholeVisualization";
import RegenerativeFlower from "@/components/lotus/RegenerativeFlower";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { HUMA_EASE } from "@/lib/constants";
import {
  PETAL_META,
  AVAILABLE_FLOWS,
  getNextPetal,
  isPetalComplete,
} from "@/types/workspace";
import type { OperatorContext, LotusPhase } from "@/types/lotus";

interface WholeViewProps {
  context: OperatorContext;
  onPetalClick: (petal: LotusPhase) => void;
  recommendation?: { text: string; pattern?: string } | null;
}

// ─── Petal spatial positions (organic, not a perfect circle) ──────────────────
// Coordinates in a 600×600 SVG viewBox. WHOLE at ~center.
// Completed petals cluster lower-left, "next" above, future spread outward.

const PETAL_POSITIONS: Record<LotusPhase, { x: number; y: number }> = {
  whole: { x: 200, y: 410 },
  who: { x: 155, y: 330 },
  what: { x: 130, y: 240 },
  context: { x: 170, y: 155 },
  purpose: { x: 255, y: 95 },
  vision: { x: 365, y: 100 },
  behavior: { x: 445, y: 165 },
  nurture: { x: 480, y: 260 },
  validate: { x: 450, y: 350 },
  design: { x: 395, y: 415 },
  install: { x: 455, y: 440 },
  evolve: { x: 505, y: 375 },
};

// ─── Petal circle radii by state ─────────────────────────────────────────────

const RADIUS_COMPLETE = 28;
const RADIUS_NEXT = 28;
const RADIUS_FUTURE = 20;

// ─── Miniature content previews for completed petals ─────────────────────────

function WholePetalPreview({ x, y }: { x: number; y: number }) {
  // Tiny rose curve hint
  return (
    <g opacity={0.5}>
      <circle cx={x} cy={y} r={8} fill="none" stroke="#5C7A62" strokeWidth={0.6} />
      <circle cx={x} cy={y} r={4} fill="none" stroke="#8BAF8E" strokeWidth={0.4} />
    </g>
  );
}

function WhoPetalPreview({ x, y }: { x: number; y: number }) {
  // Tiny person icon
  return (
    <g opacity={0.5}>
      <circle cx={x} cy={y - 3} r={3} fill="none" stroke="#5C7A62" strokeWidth={0.6} />
      <path
        d={`M${x - 5} ${y + 7} Q${x} ${y + 1} ${x + 5} ${y + 7}`}
        fill="none"
        stroke="#5C7A62"
        strokeWidth={0.6}
      />
    </g>
  );
}

function WhatPetalPreview({
  x,
  y,
  context,
}: {
  x: number;
  y: number;
  context: OperatorContext;
}) {
  // Tiny 8-petal flower hint
  const r = 10;
  return (
    <g opacity={0.45}>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (-90 + i * 45) * (Math.PI / 180);
        const val = context.capitals
          ? Object.values(context.capitals)[i] || 5
          : 5;
        const len = (val / 10) * r;
        return (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={x + Math.cos(angle) * len}
            y2={y + Math.sin(angle) * len}
            stroke="#5C7A62"
            strokeWidth={0.8}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function WholeView({
  context,
  onPetalClick,
  recommendation,
}: WholeViewProps) {
  const prefersReducedMotion = useReducedMotion();
  const nextPetal = useMemo(() => getNextPetal(context), [context]);

  // WholeVisualization params
  const wholeParams = useMemo(() => {
    const entitySeed =
      context.entityType === "person"
        ? 3
        : context.entityType === "group"
          ? 4
          : context.entityType === "place"
            ? 5
            : 6;
    const stageSeed =
      context.stage === "starting"
        ? 1
        : context.stage === "transition"
          ? 2
          : context.stage === "building"
            ? 3
            : 4;
    const capitalSum = context.capitals
      ? Object.values(context.capitals).reduce((a, b) => a + b, 0)
      : 0;
    const capitalArr = context.capitals
      ? Object.values(context.capitals)
      : [];
    const mean = capitalArr.length
      ? capitalSum / capitalArr.length
      : 0;
    const variance = capitalArr.length
      ? Math.sqrt(
          capitalArr.reduce((s, v) => s + (v - mean) ** 2, 0) /
            capitalArr.length
        )
      : 0;
    return [entitySeed, stageSeed, capitalSum, variance];
  }, [context]);

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Spatial SVG workspace */}
      <div className="w-full max-w-[600px] mx-auto aspect-square relative">
        <svg
          viewBox="0 0 600 600"
          className="w-full h-full"
          fill="none"
          role="group"
          aria-label="Your workspace — tap a petal to explore"
        >
          {/* ── Future petals (faint outlines) ── */}
          {PETAL_META.map(({ phase, label, timeHint }) => {
            const pos = PETAL_POSITIONS[phase];
            const complete = isPetalComplete(phase, context);
            const isNext = phase === nextPetal;
            const hasFlow = AVAILABLE_FLOWS.includes(phase);

            if (complete || isNext) return null;

            return (
              <g
                key={phase}
                role="button"
                tabIndex={0}
                aria-label={`${label} petal — coming soon`}
                onClick={() => hasFlow && onPetalClick(phase)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && hasFlow) onPetalClick(phase);
                }}
                style={{ cursor: hasFlow ? "pointer" : "default" }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={RADIUS_FUTURE}
                  fill="none"
                  stroke="#D4CBBA"
                  strokeWidth={0.8}
                  opacity={0.3}
                />
                <text
                  x={pos.x}
                  y={pos.y + RADIUS_FUTURE + 14}
                  textAnchor="middle"
                  fill="#C4BAA8"
                  fontSize="10"
                  fontFamily="var(--font-source-sans)"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* ── "Next" petal (glowing guide) ── */}
          {nextPetal && (() => {
            const pos = PETAL_POSITIONS[nextPetal];
            const meta = PETAL_META.find((m) => m.phase === nextPetal);
            return (
              <g
                key={`next-${nextPetal}`}
                role="button"
                tabIndex={0}
                aria-label={`${meta?.label || nextPetal} petal — ready, ${meta?.timeHint || "10 min"}`}
                onClick={() => onPetalClick(nextPetal)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onPetalClick(nextPetal);
                }}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={RADIUS_NEXT}
                  fill="none"
                  stroke="#5C7A62"
                  strokeWidth={1.5}
                  opacity={0.8}
                >
                  {!prefersReducedMotion && (
                    <animate
                      attributeName="opacity"
                      values="0.4;0.9;0.4"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  )}
                </circle>
                {/* Outer glow ring */}
                {!prefersReducedMotion && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={RADIUS_NEXT + 4}
                    fill="none"
                    stroke="#8BAF8E"
                    strokeWidth={0.5}
                  >
                    <animate
                      attributeName="r"
                      values={`${RADIUS_NEXT + 2};${RADIUS_NEXT + 8};${RADIUS_NEXT + 2}`}
                      dur="3s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.3;0.08;0.3"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                <text
                  x={pos.x}
                  y={pos.y + RADIUS_NEXT + 14}
                  textAnchor="middle"
                  fill="#5C7A62"
                  fontSize="11"
                  fontFamily="var(--font-source-sans)"
                  fontWeight={500}
                >
                  {meta?.label || nextPetal}
                </text>
                {meta?.timeHint && (
                  <text
                    x={pos.x}
                    y={pos.y + RADIUS_NEXT + 26}
                    textAnchor="middle"
                    fill="#A89E90"
                    fontSize="9"
                    fontFamily="var(--font-source-sans)"
                  >
                    {meta.timeHint}
                  </text>
                )}
              </g>
            );
          })()}

          {/* ── Completed petals (warm, filled) ── */}
          {PETAL_META.map(({ phase, label }) => {
            const pos = PETAL_POSITIONS[phase];
            if (!isPetalComplete(phase, context) || phase === nextPetal)
              return null;

            return (
              <g
                key={phase}
                role="button"
                tabIndex={0}
                aria-label={`${label} petal — completed, tap to view`}
                onClick={() => onPetalClick(phase)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onPetalClick(phase);
                }}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={RADIUS_COMPLETE}
                  fill="#EBF3EC"
                  stroke="#5C7A62"
                  strokeWidth={1.2}
                />
                {/* Miniature preview inside */}
                {phase === "whole" && (
                  <WholePetalPreview x={pos.x} y={pos.y} />
                )}
                {phase === "who" && (
                  <WhoPetalPreview x={pos.x} y={pos.y} />
                )}
                {phase === "what" && (
                  <WhatPetalPreview
                    x={pos.x}
                    y={pos.y}
                    context={context}
                  />
                )}
                <text
                  x={pos.x}
                  y={pos.y + RADIUS_COMPLETE + 14}
                  textAnchor="middle"
                  fill="#5C7A62"
                  fontSize="11"
                  fontFamily="var(--font-source-sans)"
                  fontWeight={500}
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* ── WHOLE visualization (absolutely positioned at center of SVG) ── */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            animation: prefersReducedMotion
              ? undefined
              : "workspace-breathe 6s ease-in-out infinite",
          }}
        >
          <WholeVisualization
            params={wholeParams}
            phase={3}
            size={200}
          />
        </div>
      </div>

      {/* ── Name + archetype below the spatial view ── */}
      <motion.div
        className="text-center mt-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: HUMA_EASE }}
      >
        {context.name && (
          <p
            className="text-earth-600 text-sm"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {context.name}
          </p>
        )}
        {context.archetype && (
          <p
            className="text-earth-400 text-xs mt-0.5"
            style={{ fontFamily: "var(--font-source-sans)" }}
          >
            {context.archetype}
          </p>
        )}
      </motion.div>

      {/* ── Compiled recommendation card ── */}
      {recommendation && (
        <motion.div
          className="w-full max-w-md mx-auto mt-6 bg-white rounded-xl border border-sand-200 overflow-hidden"
          style={{ borderLeft: "4px solid #5C7A62" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: HUMA_EASE }}
        >
          <div className="p-5">
            {recommendation.pattern && (
              <span
                className="text-sage-500 uppercase block mb-1"
                style={{
                  fontFamily: "var(--font-source-sans)",
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                }}
              >
                {recommendation.pattern}
              </span>
            )}
            <p
              className="text-earth-600 leading-relaxed"
              style={{
                fontFamily: "var(--font-source-sans)",
                fontSize: "0.85rem",
                fontWeight: 300,
              }}
            >
              {recommendation.text}
            </p>
          </div>
        </motion.div>
      )}

      {/* Breathing keyframe */}
      <style jsx global>{`
        @keyframes workspace-breathe {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.01);
          }
        }
      `}</style>
    </div>
  );
}
