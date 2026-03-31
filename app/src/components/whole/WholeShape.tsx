"use client";

import { useMemo, useCallback } from "react";
import {
  forceSimulation,
  forceX,
  forceY,
  forceCollide,
  type SimulationNodeDatum,
} from "d3-force";

// ─── Types ──────────────────────────────────────────────────────────────────

export type HolonLayer = "patterns" | "vision" | "identity" | "principles" | "foundation";

export type HolonStatus = "working" | "active" | "finding" | "no_path" | "adjusting";

export interface HolonNode {
  id: string;
  label: string;
  layer: HolonLayer;
  status: HolonStatus;
  r: number;
  description?: string;
  type: "aspiration" | "context" | "identity" | "principle";
  dimensions?: string[];
}

interface SimNode extends SimulationNodeDatum {
  id: string;
  label: string;
  layer: HolonLayer;
  status: HolonStatus;
  r: number;
  type: HolonNode["type"];
}

// ─── Constants ──────────────────────────────────────────────────────────────

const LAYER_Y_PCT: Record<HolonLayer, number> = {
  patterns: 0.18,
  vision: 0.35,
  identity: 0.50,
  principles: 0.65,
  foundation: 0.82,
};

const LAYER_LABELS: Record<HolonLayer, string> = {
  patterns: "PATTERNS",
  vision: "VISION",
  identity: "IDENTITY",
  principles: "PRINCIPLES",
  foundation: "FOUNDATION",
};

// Original membrane path viewBox
const MEMBRANE_VB_WIDTH = 260;
const MEMBRANE_VB_HEIGHT = 190;
const MEMBRANE_PATH = "M130 8 C178 6, 240 36, 248 86 C256 136, 232 166, 198 176 C164 186, 96 186, 62 176 C28 166, 6 134, 10 86 C14 38, 72 10, 130 8Z";

// ─── Component ──────────────────────────────────────────────────────────────

interface WholeShapeProps {
  nodes: HolonNode[];
  width: number;
  height: number;
  onNodeTap: (node: HolonNode) => void;
  selectedNodeId?: string | null;
  isEmpty: boolean;
}

export default function WholeShape({
  nodes,
  width,
  height,
  onNodeTap,
  selectedNodeId,
  isEmpty,
}: WholeShapeProps) {
  // Ellipse parameters for containment (in viewBox coords)
  const cx = MEMBRANE_VB_WIDTH / 2;
  const cy = MEMBRANE_VB_HEIGHT / 2;
  const rx = MEMBRANE_VB_WIDTH / 2 - 16;
  const ry = MEMBRANE_VB_HEIGHT / 2 - 16;

  // Run d3-force simulation in viewBox coordinate space
  const positioned = useMemo(() => {
    if (nodes.length === 0) return [];

    const simNodes: SimNode[] = nodes.map((n) => ({
      ...n,
      x: n.type === "identity" ? cx : cx + (Math.random() - 0.5) * 30,
      y: n.type === "identity" ? cy : MEMBRANE_VB_HEIGHT * LAYER_Y_PCT[n.layer] + (Math.random() - 0.5) * 10,
      // Fix identity node at center
      fx: n.type === "identity" ? cx : undefined,
      fy: n.type === "identity" ? cy : undefined,
    }));

    const sim = forceSimulation(simNodes)
      .force("x", forceX(cx).strength(0.1))
      .force(
        "y",
        forceY<SimNode>((d) => MEMBRANE_VB_HEIGHT * LAYER_Y_PCT[d.layer]).strength(0.8)
      )
      .force(
        "collide",
        forceCollide<SimNode>((d) => d.r + 4).strength(0.9)
      )
      .force("contain", () => {
        // Clamp every node inside the membrane ellipse
        for (const node of simNodes) {
          if (node.fx !== undefined) continue; // skip fixed nodes
          const dx = node.x! - cx;
          const dy = node.y! - cy;
          const erx = rx - node.r - 4;
          const ery = ry - node.r - 4;
          if (erx <= 0 || ery <= 0) continue;
          const dist = Math.sqrt((dx / erx) ** 2 + (dy / ery) ** 2);
          if (dist > 1) {
            node.x = cx + dx / dist;
            node.y = cy + dy / dist;
          }
        }
      })
      .stop();

    for (let i = 0; i < 300; i++) sim.tick();

    // Freeze all nodes in place — no further movement
    sim.stop();
    for (const node of simNodes) {
      node.fx = node.x;
      node.fy = node.y;
    }

    return simNodes;
  }, [nodes, cx, cy, rx, ry]);

  const truncateLabel = useCallback((text: string, r: number) => {
    const maxChars = Math.floor(r / 3.5);
    if (maxChars < 4) return text.slice(0, 2);
    if (text.length <= maxChars) return text;
    return text.slice(0, maxChars - 1) + "…";
  }, []);

  // Which layers have nodes?
  const populatedLayers = new Set(nodes.map((n) => n.layer));

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${MEMBRANE_VB_WIDTH} ${MEMBRANE_VB_HEIGHT}`}
      style={{ display: "block", margin: "0 auto" }}
    >
      {/* Membrane */}
      <path
        d={MEMBRANE_PATH}
        fill="rgba(250, 248, 243, 0.6)"
        stroke={isEmpty ? "#C8C0B0" : "#DDD4C0"}
        strokeWidth={1.5}
        strokeDasharray={isEmpty ? "6 4" : "4 3"}
      />

      {/* Layer labels (visible when layer is empty or in empty state) */}
      {Object.entries(LAYER_LABELS).map(([layer, label]) => {
        const show = isEmpty || !populatedLayers.has(layer as HolonLayer);
        if (!show) return null;
        return (
          <text
            key={layer}
            x={cx}
            y={MEMBRANE_VB_HEIGHT * LAYER_Y_PCT[layer as HolonLayer]}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={isEmpty ? "#C8C0B0" : "#A8C4AA"}
            fontFamily="'Source Sans 3', sans-serif"
            fontSize="8"
            letterSpacing="0.15em"
            style={{ transition: "opacity 400ms" }}
          >
            {label}
          </text>
        );
      })}

      {/* Identity nucleus (shown in empty state) */}
      {isEmpty && (
        <circle
          cx={cx}
          cy={cy}
          r={36}
          fill="none"
          stroke="#C8C0B0"
          strokeWidth={1.5}
          strokeDasharray="6 4"
        />
      )}

      {/* Holon nodes */}
      {positioned.map((node) => {
        const isIdentity = node.type === "identity";
        const isSelected = selectedNodeId === node.id;
        const displayR = isIdentity ? 36 : node.r;

        // Style based on status
        let fill = "rgba(90, 122, 98, 0.4)"; // active default
        let stroke = "#5C7A62";
        let strokeWidth = 1.5;
        let strokeDash = "";

        if (isIdentity) {
          fill = "none";
          stroke = "#B5621E";
          strokeWidth = 2;
        } else if (node.status === "working") {
          fill = "#5C7A62";
          stroke = "#3A5A40";
        } else if (node.status === "finding") {
          fill = "none";
          stroke = "#6B8F71";
          strokeDash = "6 3";
        } else if (node.status === "no_path") {
          fill = "rgba(168, 196, 170, 0.15)";
          stroke = "#A8C4AA";
          strokeDash = "2 3";
        } else if (node.status === "adjusting") {
          fill = "rgba(181, 98, 30, 0.15)";
          stroke = "#B5621E";
          strokeDash = "4 3";
        }

        if (isSelected) {
          stroke = "#B5621E";
          strokeWidth = 2;
          strokeDash = "";
        }

        return (
          <g
            key={node.id}
            onClick={() =>
              onNodeTap({
                id: node.id,
                label: node.label,
                layer: node.layer,
                status: node.status,
                r: node.r,
                type: node.type,
              })
            }
            style={{ cursor: "pointer" }}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={displayR}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDash}
            />
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isIdentity ? "#B5621E" : node.status === "working" ? "#FAF8F3" : "#3D3B36"}
              fontFamily={isIdentity ? "'Cormorant Garamond', serif" : "'Source Sans 3', sans-serif"}
              fontSize={isIdentity ? "10" : "8"}
              fontWeight={isIdentity ? "500" : "400"}
            >
              {truncateLabel(node.label, displayR)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
