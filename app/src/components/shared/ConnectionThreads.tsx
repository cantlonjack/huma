"use client";

import { memo, useMemo, useState, useEffect } from "react";
import type { DimensionKey } from "@/types/v2";
import { DIMENSION_COLORS, DIMENSION_LABELS } from "@/types/v2";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/* ═══════════════════════════════════════════════════════════════════════════
   ConnectionThreads — HUMA's signature visual primitive.

   The shape of your life: a filled constellation where active dimensions
   form a colored polygon, connected by threads whose colors blend from
   their endpoints. Active nodes breathe with soft halos.

   Seven scales:
     inline   — 20×20 favicon-like shape (next to text labels, aspiration names)
     micro    — 32×32 mini-ring (behavior rows)
     badge    — 48×48 card header (pattern cards, insight cards)
     compact  — 140×140 ring with shape fill + breathing (capital pulse, onboarding)
     pulse    — 140×140 living organism (today header, dims breathe per activity)
     signature — 200×200 dark-bg shareworthy card (social share, "Spotify Wrapped")
     full     — 280px labeled ring with full detail (whole page, landing hero)
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Public types ────────────────────────────────────────────────────────

export interface DimensionConnection {
  from: DimensionKey;
  to: DimensionKey;
  strength: number; // 0–1
}

export type ConnectionThreadsSize =
  | "inline" | "micro" | "badge" | "compact" | "pulse" | "signature" | "full";

export interface PulseState {
  dimension: DimensionKey;
  /** true = checked off (breathes slower/settled), false = unchecked (breathes faster) */
  settled: boolean;
}

export interface ConnectionThreadsProps {
  activeDimensions: DimensionKey[];
  connections?: DimensionConnection[];
  dormantDimensions?: DimensionKey[];
  size: ConnectionThreadsSize;
  animate?: boolean;
  /** For "pulse" variant: per-dimension activity states */
  pulseStates?: PulseState[];
  /** For "signature" variant: dark background mode */
  darkMode?: boolean;
  className?: string;
}

// ── Constants ───────────────────────────────────────────────────────────

const ALL_DIMS: DimensionKey[] = [
  "body", "people", "money", "home", "growth", "joy", "purpose", "identity",
];

// Clockwise from top
const DEG: Record<DimensionKey, number> = {
  body: -90, people: -45, money: 0, home: 45,
  growth: 90, joy: 135, purpose: 180, identity: -135,
};

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const LABEL_TO_KEY: Record<string, DimensionKey> = Object.fromEntries(
  Object.entries(DIMENSION_LABELS).map(([k, v]) => [v.toLowerCase(), k as DimensionKey]),
);

// ── Size configs ────────────────────────────────────────────────────────

interface SizeConfig {
  r: number;       // ring radius
  dotR: number;    // active dot radius
  inactiveR: number; // inactive dot radius
  haloR: number;   // breathing halo extra radius (0 = no halo)
  sz: number;      // viewBox size
  strokeW: [number, number]; // [min, max] thread width
  shapeOpacity: number;
}

const SIZES: Record<ConnectionThreadsSize, SizeConfig> = {
  inline:    { r: 7,   dotR: 1.5,  inactiveR: 0.7, haloR: 0,  sz: 20,  strokeW: [0.4, 0.7],   shapeOpacity: 0.12 },
  micro:     { r: 10,  dotR: 2.5,  inactiveR: 1,   haloR: 0,  sz: 32,  strokeW: [0.6, 1],     shapeOpacity: 0.08 },
  badge:     { r: 16,  dotR: 3,    inactiveR: 1.2, haloR: 0,  sz: 48,  strokeW: [0.8, 1.5],   shapeOpacity: 0.10 },
  compact:   { r: 52,  dotR: 4.5,  inactiveR: 2,   haloR: 10, sz: 140, strokeW: [1.5, 2.5],   shapeOpacity: 0.08 },
  pulse:     { r: 52,  dotR: 4.5,  inactiveR: 2,   haloR: 10, sz: 140, strokeW: [1.5, 2.5],   shapeOpacity: 0.08 },
  signature: { r: 72,  dotR: 5,    inactiveR: 2,   haloR: 14, sz: 200, strokeW: [1.5, 3],     shapeOpacity: 0.06 },
  full:      { r: 100, dotR: 5.5,  inactiveR: 2.5, haloR: 12, sz: 320, strokeW: [1.5, 2.5],   shapeOpacity: 0.08 },
};

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

// ── Color blending ──────────────────────────────────────────────────────

function hexToRGB(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
}

/** Blend two hex colors at their midpoint. */
function blendColors(a: string, b: string): string {
  const [r1, g1, b1] = hexToRGB(a);
  const [r2, g2, b2] = hexToRGB(b);
  return rgbToHex((r1 + r2) / 2, (g1 + g2) / 2, (b1 + b2) / 2);
}

/** Average multiple hex colors for shape fill. */
function averageColors(hexes: string[]): string {
  if (!hexes.length) return "#8BAF8E";
  const sum = hexes.reduce(
    (acc, h) => {
      const [r, g, b] = hexToRGB(h);
      return [acc[0] + r, acc[1] + g, acc[2] + b];
    },
    [0, 0, 0],
  );
  return rgbToHex(sum[0] / hexes.length, sum[1] / hexes.length, sum[2] / hexes.length);
}

// ── Geometry ────────────────────────────────────────────────────────────

function xy(dim: DimensionKey, r: number, c: number) {
  const a = (DEG[dim] * Math.PI) / 180;
  return { x: c + r * Math.cos(a), y: c + r * Math.sin(a) };
}

function f(n: number) { return n.toFixed(1); }

/** Deterministic wobble for organic thread variation. */
function wobble(from: DimensionKey, to: DimensionKey): number {
  // Simple hash from dimension indices to get consistent per-pair variation
  const fi = ALL_DIMS.indexOf(from);
  const ti = ALL_DIMS.indexOf(to);
  const seed = (fi * 8 + ti) * 2654435761; // Knuth multiplicative hash
  return ((seed % 100) / 100) * 0.2 - 0.1; // -0.1 to +0.1 range
}

/** Curved thread with organic variation — each thread has slight unique curvature. */
function threadD(from: DimensionKey, to: DimensionKey, r: number, c: number) {
  const a = xy(from, r, c);
  const b = xy(to, r, c);
  const pull = 0.35 + wobble(from, to);
  const qx = c + ((a.x + b.x) / 2 - c) * (1 - pull);
  const qy = c + ((a.y + b.y) / 2 - c) * (1 - pull);
  // Add perpendicular offset for organic feel
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const perp = wobble(to, from) * len * 0.15;
  const px = qx + (-dy / len) * perp;
  const py = qy + (dx / len) * perp;
  return `M${f(a.x)},${f(a.y)} Q${f(px)},${f(py)} ${f(b.x)},${f(b.y)}`;
}

/** Build the filled polygon shape connecting active dimensions (sorted by ring order). */
function shapePath(active: DimensionKey[], r: number, c: number): string {
  const sorted = sortDimensions(active);
  if (sorted.length < 2) return "";
  if (sorted.length === 2) {
    // Two points: draw a thin lens/vesica shape
    const a = xy(sorted[0], r, c);
    const b = xy(sorted[1], r, c);
    const bulge = 0.12; // subtle lens
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const offset = len * bulge;
    return `M${f(a.x)},${f(a.y)} Q${f(mx + nx * offset)},${f(my + ny * offset)} ${f(b.x)},${f(b.y)} Q${f(mx - nx * offset)},${f(my - ny * offset)} ${f(a.x)},${f(a.y)} Z`;
  }
  // 3+ points: curved polygon through dimension positions
  const pts = sorted.map(d => xy(d, r, c));
  const n = pts.length;
  let d = `M${f(pts[0].x)},${f(pts[0].y)}`;
  for (let i = 0; i < n; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % n];
    // Control point: pull slightly toward center for organic curves
    const cx_ = c + ((curr.x + next.x) / 2 - c) * 0.85;
    const cy_ = c + ((curr.y + next.y) / 2 - c) * 0.85;
    d += ` Q${f(cx_)},${f(cy_)} ${f(next.x)},${f(next.y)}`;
  }
  return d + " Z";
}

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

// ── Global CSS (injected once) ──────────────────────────────────────────

let cssInjected = false;
function injectCSS() {
  if (cssInjected || typeof document === "undefined") return;
  cssInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes ct-breathe {
      0%, 100% { opacity: 0.35; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.3); }
    }
    @keyframes ct-breathe-settled {
      0%, 100% { opacity: 0.25; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.15); }
    }
    @keyframes ct-breathe-calling {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.4); }
    }
    @keyframes ct-shape-in {
      from { opacity: 0; transform: scale(0.85); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes ct-badge-dot-in {
      from { opacity: 0; transform: scale(0); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes ct-badge-thread-in {
      from { stroke-dashoffset: 1; }
      to { stroke-dashoffset: 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      .ct-halo { animation: none !important; opacity: 0.35 !important; }
      .ct-shape { animation: none !important; }
    }
  `;
  document.head.appendChild(style);
}

// ── Main component ──────────────────────────────────────────────────────

export const ConnectionThreads = memo(function ConnectionThreads(props: ConnectionThreadsProps) {
  const reduced = useReducedMotion();
  const shouldAnimate = props.animate !== false && !reduced;

  useEffect(() => { injectCSS(); }, []);

  const conns = useMemo(
    () => props.connections ?? autoConnect(props.activeDimensions),
    [props.connections, props.activeDimensions],
  );

  return <Ring {...props} conns={conns} anim={shouldAnimate} />;
});

// ── Unified Ring (all seven sizes) ──────────────────────────────────────

function Ring({
  activeDimensions,
  conns,
  dormantDimensions = [],
  size,
  anim,
  pulseStates,
  darkMode,
  className,
}: ConnectionThreadsProps & { conns: DimensionConnection[]; anim: boolean }) {
  const [drawn, setDrawn] = useState(!anim);
  useEffect(() => {
    if (!anim) return;
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, [anim]);

  const cfg = SIZES[size];
  const { r, dotR, inactiveR, haloR, sz } = cfg;
  const C = sz / 2;
  const isMinimal = size === "inline" || size === "micro";
  const isBadge = size === "badge";
  const isSignature = size === "signature";
  const isPulse = size === "pulse";
  const showLabels = size === "full";
  const showHalos = haloR > 0;
  const useDarkBg = isSignature || darkMode;

  const activeSet = useMemo(() => new Set(activeDimensions), [activeDimensions]);
  const dormantSet = useMemo(() => new Set(dormantDimensions), [dormantDimensions]);

  // Pulse state lookup
  const pulseMap = useMemo(() => {
    if (!pulseStates) return null;
    const m = new Map<DimensionKey, boolean>();
    for (const ps of pulseStates) m.set(ps.dimension, ps.settled);
    return m;
  }, [pulseStates]);

  // Shape fill color: average of active dimension colors
  const shapeColor = useMemo(
    () => averageColors(activeDimensions.map(d => DIMENSION_COLORS[d])),
    [activeDimensions],
  );

  // Badge: find strongest connection for single-thread display
  const strongestConn = useMemo(() => {
    if (!isBadge || conns.length === 0) return null;
    return conns.reduce((best, c) => c.strength > best.strength ? c : best, conns[0]);
  }, [isBadge, conns]);

  // Thread draw-in timing
  const drawMs = isMinimal ? 600 : 1000;
  const stagger = isMinimal ? 40 : 80;

  if (!activeDimensions.length && !dormantDimensions?.length) return null;

  // Badge renders only the strongest connection thread
  const visibleConns = isBadge && strongestConn ? [strongestConn] : conns;

  // SVG sizing
  const svgProps: Record<string, unknown> = {
    viewBox: `0 0 ${sz} ${sz}`,
    className,
    role: "img",
    "aria-label": `${activeDimensions.length} of 8 dimensions active: ${activeDimensions.map(d => DIMENSION_LABELS[d]).join(", ")}`,
  };

  if (size === "inline") {
    svgProps.width = 20;
    svgProps.height = 20;
  } else if (size === "micro" || size === "badge") {
    svgProps.width = sz;
    svgProps.height = sz;
  } else if (size === "compact" || size === "pulse") {
    svgProps.width = sz;
    svgProps.height = sz;
  } else if (size === "signature") {
    svgProps.style = { width: "100%", maxWidth: "200px", height: "auto" };
  } else {
    // full
    svgProps.style = { width: "100%", maxWidth: "280px", height: "auto" };
  }

  return (
    <svg {...svgProps}>
      {/* ── Glow filter for signature variant ── */}
      {isSignature && (
        <defs>
          <filter id="ct-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}

      {/* ── Dark background for signature ── */}
      {useDarkBg && (
        <rect width={sz} height={sz} fill="#1A1714" rx={isSignature ? 8 : 0} />
      )}

      {/* ── Filled shape: "the shape of your life" ── */}
      {activeDimensions.length >= 2 && (
        <path
          className="ct-shape"
          d={shapePath(activeDimensions, r, C)}
          fill={shapeColor}
          fillOpacity={drawn ? cfg.shapeOpacity : 0}
          stroke={shapeColor}
          strokeWidth={isMinimal ? 0.3 : 0.5}
          strokeOpacity={drawn ? cfg.shapeOpacity * 2 : 0}
          style={{
            transformOrigin: `${C}px ${C}px`,
            animation: anim && drawn ? `ct-shape-in 800ms ${EASE} both` : undefined,
            transition: anim ? `fill-opacity 600ms ${EASE}, stroke-opacity 600ms ${EASE}` : undefined,
          }}
        />
      )}

      {/* ── Connection threads ── */}
      {visibleConns.map(({ from, to, strength }, i) => {
        const threadColor = blendColors(DIMENSION_COLORS[from], DIMENSION_COLORS[to]);
        const sw = cfg.strokeW[0] + strength * (cfg.strokeW[1] - cfg.strokeW[0]);
        // Enhanced weight system: strength drives opacity and blur
        const threadOpacity = 0.15 + strength * 0.45;
        const useGlow = isSignature && strength > 0.5;

        return (
          <g key={`${from}-${to}`}>
            {/* Glow layer for high-weight signature threads */}
            {useGlow && (
              <path
                d={threadD(from, to, r, C)}
                fill="none"
                stroke={threadColor}
                strokeWidth={sw + 2}
                strokeLinecap="round"
                opacity={threadOpacity * 0.4}
                filter="url(#ct-glow)"
              />
            )}
            <path
              d={threadD(from, to, r, C)}
              fill="none"
              stroke={threadColor}
              strokeWidth={sw}
              strokeLinecap="round"
              pathLength={1}
              style={{
                strokeDasharray: 1,
                strokeDashoffset: drawn ? 0 : 1,
                transition: anim ? `stroke-dashoffset ${drawMs}ms ${EASE} ${i * stagger}ms, stroke-width 600ms ${EASE}` : undefined,
                opacity: drawn ? threadOpacity : 0,
              }}
            />
          </g>
        );
      })}

      {/* ── Dimension dots, halos, labels ── */}
      {ALL_DIMS.map((dim, i) => {
        const { x, y } = xy(dim, r, C);
        const active = activeSet.has(dim);
        const dormant = dormantSet.has(dim);

        // Signature: inactive dims are ghost outlines
        const dotFill = dormant
          ? "#A04040"
          : active
            ? DIMENSION_COLORS[dim]
            : useDarkBg ? "transparent" : "#C4D9C6";
        const dotOpacity = active ? 1 : dormant ? 0.5 : useDarkBg ? 0.15 : 0.2;
        const currentR = active ? dotR : inactiveR;

        // Pulse variant: determine breathing animation per-dimension
        let haloAnimation: string | undefined;
        if (showHalos && active && anim) {
          if (isPulse && pulseMap) {
            const settled = pulseMap.get(dim);
            if (settled === true) {
              // Settled: slow, gentle breathing
              haloAnimation = `ct-breathe-settled 8s ${EASE} ${i * 400}ms infinite`;
            } else {
              // Calling attention: faster, more pronounced
              haloAnimation = `ct-breathe-calling 3.5s ${EASE} ${i * 300}ms infinite`;
            }
          } else {
            haloAnimation = `ct-breathe 6s ${EASE} ${i * 400}ms infinite`;
          }
        }

        return (
          <g key={dim}>
            {/* Breathing halo */}
            {active && showHalos && (
              <circle
                className="ct-halo"
                cx={x}
                cy={y}
                r={dotR + haloR}
                fill={DIMENSION_COLORS[dim]}
                fillOpacity={0}
                style={{
                  transformOrigin: `${x}px ${y}px`,
                  animation: haloAnimation,
                  opacity: drawn ? 0.35 : 0,
                }}
              />
            )}

            {/* Dormant marker */}
            {dormant && !isMinimal && !isBadge && (
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

            {/* Ghost outline for inactive dots in signature mode */}
            {!active && !dormant && useDarkBg && (
              <circle
                cx={x}
                cy={y}
                r={inactiveR}
                fill="none"
                stroke="#C4D9C6"
                strokeWidth={0.5}
                opacity={drawn ? 0.15 : 0}
              />
            )}

            {/* Dot */}
            <circle
              cx={x}
              cy={y}
              r={currentR}
              fill={dotFill}
              style={{
                opacity: drawn ? dotOpacity : 0,
                transformOrigin: `${x}px ${y}px`,
                transition: anim
                  ? `opacity 400ms ${EASE} ${i * 40}ms, fill 400ms ${EASE}`
                  : `fill 400ms ${EASE}`,
                // Badge: dots scale in
                ...(isBadge && anim ? {
                  animation: `ct-badge-dot-in 400ms ${EASE} ${i * 30}ms both`,
                } : {}),
              }}
            />

            {/* Label (full size only) */}
            {showLabels && (() => {
              const lbl = labelXY(dim, dotR, r, C);
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

            {/* Signature: dimension labels below dots */}
            {isSignature && active && (
              <text
                x={x}
                y={y + dotR + 12}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontFamily: "'Source Sans 3', 'Helvetica Neue', sans-serif",
                  fontSize: "8px",
                  fontWeight: 500,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fill: "#A89E90",
                  opacity: drawn ? 0.8 : 0,
                  transition: anim ? `opacity 400ms ${EASE} ${200 + i * 30}ms` : undefined,
                }}
              >
                {DIMENSION_LABELS[dim]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
