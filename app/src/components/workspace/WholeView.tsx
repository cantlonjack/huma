"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import WholeVisualization from "@/components/lotus/WholeVisualization";
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

// ─── Petal circle radii ──────────────────────────────────────────────────────

const RADIUS = 28;
// Invisible hit area for mobile tap targets (≥48px at 375px viewport)
const TAP_RADIUS = 38;
// Distance from center for petal orbit
const ORBIT_RADIUS = 160;
// Center of 600×600 viewBox
const CX = 300;
const CY = 300;

// ─── Compute dynamic positions ──────────────────────────────────────────────
// Distributes visible petals evenly around the WHOLE, full 360°.
// Start angle offset: -90° (top) so first petal sits above center.

function computePositions(count: number): Array<{ x: number; y: number }> {
  return Array.from({ length: count }, (_, i) => {
    const angle = (-90 + (360 / count) * i) * (Math.PI / 180);
    return {
      x: CX + Math.cos(angle) * ORBIT_RADIUS,
      y: CY + Math.sin(angle) * ORBIT_RADIUS,
    };
  });
}

// ─── Miniature content previews for completed petals ─────────────────────────

function WholePetalPreview({ x, y }: { x: number; y: number }) {
  return (
    <g opacity={0.5}>
      <circle cx={x} cy={y} r={8} fill="none" stroke="#5C7A62" strokeWidth={0.6} />
      <circle cx={x} cy={y} r={4} fill="none" stroke="#8BAF8E" strokeWidth={0.4} />
    </g>
  );
}

function WhoPetalPreview({ x, y }: { x: number; y: number }) {
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

function ContextPetalPreview({ x, y }: { x: number; y: number }) {
  return (
    <g opacity={0.45}>
      <circle cx={x - 3} cy={y - 2} r={4} fill="none" stroke="#C5D86D" strokeWidth={0.6} />
      <circle cx={x + 3} cy={y - 2} r={4} fill="none" stroke="#5C7A62" strokeWidth={0.6} />
      <circle cx={x} cy={y + 3} r={4} fill="none" stroke="#2E6B8A" strokeWidth={0.6} />
    </g>
  );
}

// ─── Preview renderer ────────────────────────────────────────────────────────

function PetalPreview({
  phase,
  x,
  y,
  context,
}: {
  phase: LotusPhase;
  x: number;
  y: number;
  context: OperatorContext;
}) {
  switch (phase) {
    case "whole":
      return <WholePetalPreview x={x} y={y} />;
    case "who":
      return <WhoPetalPreview x={x} y={y} />;
    case "what":
      return <WhatPetalPreview x={x} y={y} context={context} />;
    case "context":
      return <ContextPetalPreview x={x} y={y} />;
    default:
      return null;
  }
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function WholeView({
  context,
  onPetalClick,
  recommendation,
}: WholeViewProps) {
  const prefersReducedMotion = useReducedMotion();
  const nextPetal = useMemo(() => getNextPetal(context), [context]);
  const hasIkigai = !!(context.ikigai?.synthesis);

  // WHOLE phase: 3 after Lotus Flow, 4 after Ikigai
  const wholePhase: 1 | 2 | 3 | 4 = hasIkigai ? 4 : 3;

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

  // ── Build visible petals: earned + one invite ──────────────────────────────
  const visiblePetals = useMemo(() => {
    const earned: Array<{ phase: LotusPhase; label: string; state: "complete" }> = [];
    for (const { phase, label } of PETAL_META) {
      if (isPetalComplete(phase, context)) {
        earned.push({ phase, label, state: "complete" });
      }
    }

    const invite: Array<{
      phase: LotusPhase;
      label: string;
      state: "invite";
      timeHint: string;
      hasFlow: boolean;
    }> = [];
    if (nextPetal) {
      const meta = PETAL_META.find((m) => m.phase === nextPetal);
      invite.push({
        phase: nextPetal,
        label: meta?.label || nextPetal,
        state: "invite",
        timeHint: meta?.timeHint || "10 min",
        hasFlow: AVAILABLE_FLOWS.includes(nextPetal),
      });
    }

    return [...earned, ...invite];
  }, [context, nextPetal]);

  // Compute dynamic orbital positions for visible petals
  const positions = useMemo(
    () => computePositions(visiblePetals.length),
    [visiblePetals.length]
  );

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Spatial SVG workspace — scales to viewport, maintains aspect ratio */}
      <div className="w-full max-w-[600px] mx-auto aspect-square relative">
        <svg
          viewBox="0 0 600 600"
          className="w-full h-full"
          fill="none"
          role="group"
          aria-label="Your workspace — tap a petal to explore"
        >
          {/* ── Faint connector lines from center to each petal ── */}
          {visiblePetals.map((petal, i) => {
            const pos = positions[i];
            return (
              <line
                key={`line-${petal.phase}`}
                x1={CX}
                y1={CY}
                x2={pos.x}
                y2={pos.y}
                stroke="#D4CBBA"
                strokeWidth={0.5}
                opacity={0.3}
              />
            );
          })}

          {/* ── Render each visible petal ── */}
          {visiblePetals.map((petal, i) => {
            const pos = positions[i];

            if (petal.state === "complete") {
              return (
                <g
                  key={petal.phase}
                  role="button"
                  tabIndex={0}
                  aria-label={`${petal.label} petal — tap to view`}
                  onClick={() => onPetalClick(petal.phase)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onPetalClick(petal.phase);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                  className="petal-hit-area"
                >
                  {/* Invisible tap target (≥48px) */}
                  <circle cx={pos.x} cy={pos.y} r={TAP_RADIUS} fill="transparent" />
                  {/* Visible circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={RADIUS}
                    fill="#EBF3EC"
                    stroke="#5C7A62"
                    strokeWidth={1.2}
                    className="petal-circle"
                  />
                  {/* Miniature preview inside */}
                  <PetalPreview phase={petal.phase} x={pos.x} y={pos.y} context={context} />
                  {/* Label */}
                  <text
                    x={pos.x}
                    y={pos.y + RADIUS + 14}
                    textAnchor="middle"
                    fill="#5C7A62"
                    fontSize="11"
                    fontFamily="var(--font-source-sans)"
                    fontWeight={500}
                  >
                    {petal.label}
                  </text>
                  <title>{`View ${petal.label}`}</title>
                </g>
              );
            }

            // ── Invite petal (the one glowing "next") ──
            if (petal.state === "invite" && petal.hasFlow) {
              return (
                <g
                  key={petal.phase}
                  role="button"
                  tabIndex={0}
                  aria-label={`${petal.label} petal — ready, ${petal.timeHint}`}
                  onClick={() => onPetalClick(petal.phase)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onPetalClick(petal.phase);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                  className="petal-hit-area"
                >
                  {/* Invisible tap target */}
                  <circle cx={pos.x} cy={pos.y} r={TAP_RADIUS} fill="transparent" />
                  {/* Glowing dashed circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={RADIUS}
                    fill="none"
                    stroke="#5C7A62"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    opacity={0.8}
                    className="petal-circle"
                  >
                    {!prefersReducedMotion && (
                      <animate
                        attributeName="opacity"
                        values="0.5;0.8;0.5"
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
                      r={RADIUS + 4}
                      fill="none"
                      stroke="#8BAF8E"
                      strokeWidth={0.5}
                    >
                      <animate
                        attributeName="r"
                        values={`${RADIUS + 2};${RADIUS + 8};${RADIUS + 2}`}
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
                  {/* Label */}
                  <text
                    x={pos.x}
                    y={pos.y + RADIUS + 14}
                    textAnchor="middle"
                    fill="#5C7A62"
                    fontSize="11"
                    fontFamily="var(--font-source-sans)"
                    fontWeight={500}
                  >
                    {petal.label}
                  </text>
                  {/* Time estimate */}
                  <text
                    x={pos.x}
                    y={pos.y + RADIUS + 26}
                    textAnchor="middle"
                    fill="#A89E90"
                    fontSize="9"
                    fontFamily="var(--font-source-sans)"
                  >
                    {petal.timeHint}
                  </text>
                  <title>{`Map your ${petal.label} — ${petal.timeHint}`}</title>
                </g>
              );
            }

            // ── Invite petal with no flow yet (coming soon) ──
            if (petal.state === "invite" && !petal.hasFlow) {
              return (
                <g
                  key={petal.phase}
                  role="button"
                  tabIndex={0}
                  aria-label={`${petal.label} petal — coming soon`}
                  onClick={() => onPetalClick(petal.phase)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onPetalClick(petal.phase);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                  className="petal-hit-area"
                >
                  {/* Invisible tap target */}
                  <circle cx={pos.x} cy={pos.y} r={TAP_RADIUS} fill="transparent" />
                  {/* Dashed circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={RADIUS}
                    fill="none"
                    stroke="#5C7A62"
                    strokeWidth={1.2}
                    strokeDasharray="3 3"
                    opacity={0.5}
                    className="petal-circle"
                  >
                    {!prefersReducedMotion && (
                      <animate
                        attributeName="opacity"
                        values="0.4;0.7;0.4"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    )}
                  </circle>
                  {/* Label */}
                  <text
                    x={pos.x}
                    y={pos.y + RADIUS + 14}
                    textAnchor="middle"
                    fill="#8BAF8E"
                    fontSize="11"
                    fontFamily="var(--font-source-sans)"
                    fontWeight={500}
                  >
                    {petal.label}
                  </text>
                  {/* Time estimate */}
                  <text
                    x={pos.x}
                    y={pos.y + RADIUS + 26}
                    textAnchor="middle"
                    fill="#C4BAA8"
                    fontSize="9"
                    fontFamily="var(--font-source-sans)"
                  >
                    {petal.timeHint}
                  </text>
                  <title>{`${petal.label} — coming soon`}</title>
                </g>
              );
            }

            return null;
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
            phase={wholePhase}
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
          className={`w-full mx-auto mt-6 bg-white rounded-xl overflow-hidden ${
            hasIkigai
              ? "max-w-lg border-2 border-sage-200"
              : "max-w-md border border-sand-200"
          }`}
          style={{ borderLeft: hasIkigai ? "4px solid #3A5A40" : "4px solid #5C7A62" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: HUMA_EASE }}
        >
          <div className={hasIkigai ? "p-6" : "p-5"}>
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
                fontSize: hasIkigai ? "0.9rem" : "0.85rem",
                fontWeight: 300,
              }}
            >
              {recommendation.text}
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Empty state: all flows complete, no new ones ── */}
      {!nextPetal && !recommendation && (
        <motion.p
          className="text-center text-earth-400 text-sm mt-8 max-w-md mx-auto"
          style={{ fontFamily: "var(--font-source-sans)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          You&apos;ve gone deep. More petals coming soon. In the meantime, your
          context is always here — tap anything to refine.
        </motion.p>
      )}

      {/* Breathing keyframe + petal hover effects */}
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
        .petal-hit-area:hover .petal-circle,
        .petal-hit-area:focus .petal-circle {
          transform-origin: center;
          filter: brightness(1.05);
        }
        .petal-hit-area:focus {
          outline: none;
        }
        .petal-hit-area:focus .petal-circle {
          stroke-width: 2.2;
        }
        .petal-hit-area:focus-visible .petal-circle {
          stroke: #3A5A40;
          stroke-width: 2.5;
        }
      `}</style>
    </div>
  );
}
