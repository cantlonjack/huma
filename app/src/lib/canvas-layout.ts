// ═══════════════════════════════════════════════════════════════
// HUMA — Canvas Layout Utilities
// Pure functions for spatial canvas positioning and data normalization.
// ═══════════════════════════════════════════════════════════════

import type { QoLNode, CanvasData, CapitalScore } from "@/engine/canvas-types";

// ── QoL Node Normalization ──────────────────────────────────

export function normalizeQoLNode(node: string | QoLNode): QoLNode {
  if (typeof node === "string") return { statement: node };
  return node;
}

export function getQoLStatement(node: string | QoLNode): string {
  return typeof node === "string" ? node : node.statement;
}

// ── Spatial Layout ──────────────────────────────────────────

export interface Position {
  x: number;
  y: number;
}

export interface PillLayout {
  position: Position;
  text: string;
  index: number;
}

export interface SpatialLayout {
  center: Position;
  viewBox: { width: number; height: number };
  rings: {
    qol: PillLayout[];
    production: PillLayout[];
    resource: PillLayout[];
  };
  capitalPositions: Array<Position & { form: string; score: number; note: string }>;
}

type Breakpoint = "mobile" | "tablet" | "desktop";

function getBreakpoint(width: number): Breakpoint {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

/**
 * Distributes items evenly around a circle at a given radius.
 * startAngle and endAngle define the arc (in radians).
 * Default: full circle starting from top (-PI/2).
 */
function distributeOnArc(
  cx: number,
  cy: number,
  radius: number,
  count: number,
  startAngle = -Math.PI / 2,
  sweep = Math.PI * 2,
): Position[] {
  if (count === 0) return [];
  if (count === 1) {
    return [{ x: cx + radius * Math.cos(startAngle), y: cy + radius * Math.sin(startAngle) }];
  }
  // Distribute evenly across the sweep, without closing the gap back to start
  const step = sweep / count;
  return Array.from({ length: count }, (_, i) => {
    const angle = startAngle + i * step;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });
}

// Ratios are fractions of half the smaller viewBox dimension.
// This ensures content stays within viewBox bounds with room for pill widths.
const RING_RATIOS = {
  desktop: { r1: 0.30, r2: 0.56, r3: 0.82 },
  tablet: { r1: 0.30, r2: 0.56, r3: 0.82 },
  mobile: { r1: 0.38, r2: 0, r3: 0 }, // Mobile: only ring 1
};

const VIEWBOX = {
  desktop: { width: 900, height: 750 },
  tablet: { width: 800, height: 650 },
  mobile: { width: 400, height: 320 },
};

export function computeLayout(
  data: CanvasData,
  containerWidth: number,
  containerHeight: number,
): SpatialLayout {
  const bp = getBreakpoint(containerWidth);
  const vb = VIEWBOX[bp];
  const ratios = RING_RATIOS[bp];
  const cx = vb.width / 2;
  const cy = vb.height / 2;
  const halfMin = Math.min(vb.width, vb.height) / 2;

  const r1 = halfMin * ratios.r1;
  const r2 = halfMin * ratios.r2;
  const r3 = halfMin * ratios.r3;

  // QoL — always shown
  const qolPositions = distributeOnArc(cx, cy, r1, data.qolNodes.length);
  const qolPills: PillLayout[] = data.qolNodes.map((node, i) => ({
    position: qolPositions[i],
    text: getQoLStatement(node),
    index: i,
  }));

  // Production + Resource — ring 2 (hidden on mobile)
  let productionPills: PillLayout[] = [];
  let resourcePills: PillLayout[] = [];

  if (bp !== "mobile") {
    const totalR2 = data.productionNodes.length + data.resourceNodes.length;
    const allR2Positions = distributeOnArc(cx, cy, r2, totalR2);

    productionPills = data.productionNodes.map((text, i) => ({
      position: allR2Positions[i],
      text,
      index: i,
    }));

    resourcePills = data.resourceNodes.map((text, i) => ({
      position: allR2Positions[data.productionNodes.length + i],
      text,
      index: i,
    }));
  }

  // Capital profile — ring 3 (hidden on mobile, moves to detail zone)
  let capitalPositions: SpatialLayout["capitalPositions"] = [];

  if (bp !== "mobile" && data.capitalProfile.length > 0) {
    const capitalPos = distributeOnArc(cx, cy, r3, data.capitalProfile.length);
    capitalPositions = data.capitalProfile.map((cap, i) => ({
      ...capitalPos[i],
      form: cap.form,
      score: cap.score,
      note: cap.note,
    }));
  }

  return {
    center: { x: cx, y: cy },
    viewBox: vb,
    rings: {
      qol: qolPills,
      production: productionPills,
      resource: resourcePills,
    },
    capitalPositions,
  };
}
