"use client";

import { memo, useMemo, useState, useEffect } from "react";
import type { DimensionKey } from "@/types/v2";
import { DIMENSION_COLORS, DIMENSION_LABELS } from "@/types/v2";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/* ═══════════════════════════════════════════════════════════════════════════
   ConnectionThreads — HUMA's signature visual for dimension connections.

   Three scales:
     micro    — inline dots with connecting arcs (behavior rows)
     compact  — 8-dot circle with connection threads (capital pulse)
     full     — labeled circle with threads (whole page, landing)
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Public types ────────────────────────────────────────────────────────

export interface DimensionConnection {
  from: DimensionKey;
  to: DimensionKey;
  strength: number; // 0–1
}

export interface ConnectionThreadsProps {
  activeDimensions: DimensionKey[];
  connections?: DimensionConnection[];
  dormantDimensions?: DimensionKey[];
  size: "micro" | "compact" | "full";
  animate?: boolean;
  className?: string;
}

// ── Constants ───────────────────────────────────────────────────────────

const ALL_DIMS: DimensionKey[] = [
  "body", "people", "money", "home", "growth", "joy", "purpose", "identity",
];

// Clockwise from top — conceptual flow:
// physical → social → material → spatial → developmental → experiential → existential → selfhood
const DEG: Record<DimensionKey, number> = {
  body: -90, people: -45, money: 0, home: 45,
  growth: 90, joy: 135, purpose: 180, identity: -135,
};

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const LABEL_TO_KEY: Record<string, DimensionKey> = Object.fromEntries(
  Object.entries(DIMENSION_LABELS).map(([k, v]) => [v.toLowerCase(), k as DimensionKey]),
);

// ── Exported helpers ────────────────────────────────────────────────────

/** Convert display names ("Body", "Money") to DimensionKey[]. */
export function dimensionKeysFromLabels(labels: string[]): DimensionKey[] {
  return labels
    .map(l => LABEL_TO_KEY[l.toLowerCase()])
    .filter((k): k is DimensionKey => !!k);
}

/** Sort dimensions into canonical ring order. */
export function sortDimensions(dims: DimensionKey[]): DimensionKey[] {
  const idx = new Map(ALL_DIMS.map((d, i) => [d, i]));
  return [...dims].sort((a, b) => (idx.get(a) ?? 0) - (idx.get(b) ?? 0));
}

// ── Geometry ────────────────────────────────────────────────────────────

function xy(dim: DimensionKey, r: number, c: number) {
  const a = (DEG[dim] * Math.PI) / 180;
  return { x: c + r * Math.cos(a), y: c + r * Math.sin(a) };
}

/** Quadratic bezier between two dimension positions, pulled 35% toward center. */
function threadD(from: DimensionKey, to: DimensionKey, r: number, c: number) {
  const a = xy(from, r, c);
  const b = xy(to, r, c);
  const pull = 0.35;
  const qx = c + ((a.x + b.x) / 2 - c) * (1 - pull);
  const qy = c + ((a.y + b.y) / 2 - c) * (1 - pull);
  return `M${f(a.x)},${f(a.y)} Q${f(qx)},${f(qy)} ${f(b.x)},${f(b.y)}`;
}

function f(n: number) { return n.toFixed(1); }

/** Label position: radially outside the dot. */
function labelXY(dim: DimensionKey, dotR: number, r: number, c: number) {
  const p = xy(dim, r, c);
  const offset = dotR + 9;
  const a = (DEG[dim] * Math.PI) / 180;
  const cosA = Math.cos(a);
  const x = p.x + offset * cosA;
  const y = p.y + offset * Math.sin(a);
  const anchor: "start" | "middle" | "end" =
    Math.abs(cosA) < 0.3 ? "middle" : cosA > 0 ? "start" : "end";
  return { x, y, anchor };
}

/** Generate all pairwise connections from active dimensions. */
function autoConnect(dims: DimensionKey[]): DimensionConnection[] {
  const out: DimensionConnection[] = [];
  for (let i = 0; i < dims.length; i++)
    for (let j = i + 1; j < dims.length; j++)
      out.push({ from: dims[i], to: dims[j], strength: 0.6 });
  return out;
}

// ── Main component ──────────────────────────────────────────────────────

export const ConnectionThreads = memo(function ConnectionThreads(props: ConnectionThreadsProps) {
  const reduced = useReducedMotion();
  const shouldAnimate = props.animate !== false && !reduced;

  const conns = useMemo(
    () => props.connections ?? autoConnect(props.activeDimensions),
    [props.connections, props.activeDimensions],
  );

  if (props.size === "micro") {
    return (
      <Micro
        dims={sortDimensions(props.activeDimensions)}
        conns={conns}
        anim={shouldAnimate}
        className={props.className}
      />
    );
  }

  return <Ring {...props} conns={conns} anim={shouldAnimate} />;
});

// ── Micro: inline dots with connecting arcs ─────────────────────────────
// Creates a miniature "cat's cradle" — arcs nest at different heights
// based on the distance between dots, so 3 connected dimensions produce
// a layered web even at 20px tall.

function Micro({
  dims,
  conns,
  anim,
  className,
}: {
  dims: DimensionKey[];
  conns: DimensionConnection[];
  anim: boolean;
  className?: string;
}) {
  const [drawn, setDrawn] = useState(!anim);
  useEffect(() => {
    if (!anim) return;
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, [anim]);

  if (!dims.length) return null;

  const R = 2.5;
  const GAP = 12;
  const PX = 4;
  const n = dims.length;
  const maxSpan = Math.max(0, (n - 1) * GAP);
  const maxArcH = n > 1 ? 5 + maxSpan * 0.3 : 0;
  const BOTTOM = Math.ceil(2 + maxArcH);
  const W = PX * 2 + maxSpan;
  const H = Math.ceil(BOTTOM + R + 3);

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label={dims.map(d => DIMENSION_LABELS[d]).join(", ")}
    >
      {/* Arcs between each connected pair */}
      {conns.map(({ from, to, strength }, i) => {
        const fi = dims.indexOf(from);
        const ti = dims.indexOf(to);
        if (fi < 0 || ti < 0) return null;
        const x1 = PX + fi * GAP;
        const x2 = PX + ti * GAP;
        const span = Math.abs(x2 - x1);
        const arcH = 5 + span * 0.3;
        const mx = (x1 + x2) / 2;
        const my = BOTTOM - arcH;
        return (
          <path
            key={`${from}-${to}`}
            d={`M${x1},${BOTTOM} Q${mx},${f(my)} ${x2},${BOTTOM}`}
            fill="none"
            stroke="#8BAF8E"
            strokeWidth={0.75}
            strokeLinecap="round"
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: drawn ? 0 : 1,
              transition: anim ? `stroke-dashoffset 500ms ${EASE} ${i * 60}ms` : undefined,
              opacity: 0.2 + strength * 0.3,
            }}
          />
        );
      })}
      {/* Dimension dots */}
      {dims.map((dim, i) => (
        <circle
          key={dim}
          cx={PX + i * GAP}
          cy={BOTTOM}
          r={R}
          fill={DIMENSION_COLORS[dim]}
          style={{
            opacity: drawn ? 1 : 0,
            transition: anim ? `opacity 300ms ${EASE} ${i * 40}ms` : undefined,
          }}
        />
      ))}
    </svg>
  );
}

// ── Ring: compact + full ────────────────────────────────────────────────
// 8 dots arranged in a circle. Curved threads connect active pairs,
// pulled 35% toward center — creating a woven web whose density
// IS the measure of integration.

function Ring({
  activeDimensions,
  conns,
  dormantDimensions = [],
  size,
  anim,
  className,
}: ConnectionThreadsProps & { conns: DimensionConnection[]; anim: boolean }) {
  const [drawn, setDrawn] = useState(!anim);
  useEffect(() => {
    if (!anim) return;
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, [anim]);

  const compact = size === "compact";
  const R = compact ? 32 : 100;
  const dotR = compact ? 3 : 5;
  const SZ = compact ? 84 : 320;
  const C = SZ / 2;

  const activeSet = useMemo(() => new Set(activeDimensions), [activeDimensions]);
  const dormantSet = useMemo(() => new Set(dormantDimensions), [dormantDimensions]);

  return (
    <svg
      width={compact ? SZ : undefined}
      height={compact ? SZ : undefined}
      viewBox={`0 0 ${SZ} ${SZ}`}
      className={className}
      role="img"
      aria-label={`${activeDimensions.length} of 8 dimensions active: ${activeDimensions.map(d => DIMENSION_LABELS[d]).join(", ")}`}
      {...(!compact && { style: { width: "100%", maxWidth: "280px", height: "auto" } })}
    >
      {/* Connection threads */}
      {conns.map(({ from, to, strength }, i) => (
        <path
          key={`${from}-${to}`}
          d={threadD(from, to, R, C)}
          fill="none"
          stroke="#8BAF8E"
          strokeWidth={compact ? 0.5 + strength * 0.8 : 0.75 + strength * 1.25}
          strokeLinecap="round"
          pathLength={1}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: drawn ? 0 : 1,
            transition: anim ? `stroke-dashoffset 600ms ${EASE} ${i * 80}ms` : undefined,
            opacity: 0.15 + strength * 0.3,
          }}
        />
      ))}

      {/* Dimension dots + labels */}
      {ALL_DIMS.map((dim, i) => {
        const { x, y } = xy(dim, R, C);
        const active = activeSet.has(dim);
        const dormant = dormantSet.has(dim);

        const dotFill = dormant ? "#A04040" : active ? DIMENSION_COLORS[dim] : "#C4D9C6";
        const dotOpacity = active ? 1 : dormant ? 0.5 : 0.2;

        return (
          <g key={dim}>
            {/* Dormant halo */}
            {dormant && (
              <circle
                cx={x}
                cy={y}
                r={dotR + 3}
                fill="none"
                stroke="#A04040"
                strokeWidth={0.5}
                opacity={drawn ? 0.3 : 0}
                style={{
                  transition: anim ? `opacity 400ms ${EASE} ${i * 40}ms` : undefined,
                }}
              />
            )}

            {/* Dot */}
            <circle
              cx={x}
              cy={y}
              r={dotR}
              fill={dotFill}
              style={{
                opacity: drawn ? dotOpacity : 0,
                transition: anim
                  ? `opacity 400ms ${EASE} ${i * 40}ms, fill 400ms ${EASE}`
                  : `fill 400ms ${EASE}`,
              }}
            />

            {/* Label (full size only) */}
            {size === "full" && (() => {
              const lbl = labelXY(dim, dotR, R, C);
              return (
                <text
                  x={lbl.x}
                  y={lbl.y}
                  textAnchor={lbl.anchor}
                  dominantBaseline="central"
                  style={{
                    fontFamily: "'Source Sans 3', 'Helvetica Neue', sans-serif",
                    fontSize: "11px",
                    fontWeight: 500,
                    fill: active ? "#554D42" : dormant ? "#A04040" : "#A89E90",
                    opacity: drawn ? 1 : 0,
                    transition: anim
                      ? `opacity 400ms ${EASE} ${200 + i * 30}ms, fill 300ms ${EASE}`
                      : `fill 300ms ${EASE}`,
                  }}
                >
                  {DIMENSION_LABELS[dim]}
                </text>
              );
            })()}
          </g>
        );
      })}
    </svg>
  );
}
