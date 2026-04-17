"use client";

import { useMemo, useCallback } from "react";
import {
  forceSimulation,
  forceX,
  forceY,
  forceCollide,
  forceLink,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import { DIMENSION_COLORS } from "@/types/v2";

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

export interface HolonLink {
  sourceId: string;
  targetId: string;
  weight: number; // 0–1: behavioral correlation strength
}

export interface InsightAnnotation {
  id: string;
  text: string;              // First sentence of insight
  dimensionsInvolved: string[];
  nodeId?: string;           // Assigned during rendering — the holon node it anchors to
}

interface SimNode extends SimulationNodeDatum {
  id: string;
  label: string;
  layer: HolonLayer;
  status: HolonStatus;
  r: number;
  type: HolonNode["type"];
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  weight: number;
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
  links?: HolonLink[];
  annotations?: InsightAnnotation[];
  width: number;
  height: number;
  onNodeTap: (node: HolonNode) => void;
  selectedNodeId?: string | null;
  isEmpty: boolean;
  manageMode?: boolean;
}

// Truncate to first sentence, max ~60 chars
function truncateInsight(text: string): string {
  const firstSentence = text.split(/[.!?]/)[0];
  const trimmed = firstSentence.trim();
  if (trimmed.length <= 60) return trimmed;
  return trimmed.slice(0, 57) + "…";
}

export default function WholeShape({
  nodes,
  links = [],
  annotations = [],
  width,
  height,
  onNodeTap,
  selectedNodeId,
  isEmpty,
  manageMode = false,
}: WholeShapeProps) {
  // Ellipse parameters for containment (in viewBox coords)
  const cx = MEMBRANE_VB_WIDTH / 2;
  const cy = MEMBRANE_VB_HEIGHT / 2;
  const rx = MEMBRANE_VB_WIDTH / 2 - 16;
  const ry = MEMBRANE_VB_HEIGHT / 2 - 16;

  // Run d3-force simulation in viewBox coordinate space
  const { positionedNodes, positionedLinks } = useMemo(() => {
    if (nodes.length === 0) return { positionedNodes: [] as SimNode[], positionedLinks: [] as SimLink[] };

    // Deterministic jitter keyed off each node's id so the simulation seed is
    // stable across renders (Math.random during render is impure — see
    // react-hooks/purity).
    const jitter = (seed: string, amp: number) => {
      let h = 0;
      for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
      // Map hash to [-0.5, 0.5], scale by amp
      return (((h >>> 0) % 1000) / 1000 - 0.5) * amp;
    };
    const simNodes: SimNode[] = nodes.map((n) => ({
      ...n,
      x: n.type === "identity" ? cx : cx + jitter(n.id + ":x", 30),
      y: n.type === "identity" ? cy : MEMBRANE_VB_HEIGHT * LAYER_Y_PCT[n.layer] + jitter(n.id + ":y", 10),
      // Fix identity node at center
      fx: n.type === "identity" ? cx : undefined,
      fy: n.type === "identity" ? cy : undefined,
    }));

    // Build link objects from HolonLink data, referencing SimNode indices
    const nodeIndex = new Map(simNodes.map((n, i) => [n.id, i]));
    const simLinks: SimLink[] = links
      .filter((l) => nodeIndex.has(l.sourceId) && nodeIndex.has(l.targetId))
      .map((l) => ({
        source: nodeIndex.get(l.sourceId)!,
        target: nodeIndex.get(l.targetId)!,
        weight: l.weight,
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
      );

    // Behavioral correlation: linked nodes drift closer
    if (simLinks.length > 0) {
      sim.force(
        "link",
        forceLink<SimNode, SimLink>(simLinks)
          .id((_, i) => i)
          .distance((l) => 30 - l.weight * 15)   // stronger correlation → closer (30 → 15)
          .strength((l) => l.weight * 0.3)        // gentle pull, not reactive
      );
    }

    sim.force("contain", () => {
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

    return { positionedNodes: simNodes, positionedLinks: simLinks };
  }, [nodes, links, cx, cy, rx, ry]);

  const truncateLabel = useCallback((text: string, r: number) => {
    const maxChars = Math.floor(r / 3.5);
    if (maxChars < 4) return text.slice(0, 2);
    if (text.length <= maxChars) return text;
    return text.slice(0, maxChars - 1) + "…";
  }, []);

  // Which layers have nodes?
  const populatedLayers = new Set(nodes.map((n) => n.layer));

  // Match insight annotations to nearest holon node by dimension overlap
  const placedAnnotations = useMemo(() => {
    if (annotations.length === 0 || positionedNodes.length === 0) return [];

    const usedNodeIds = new Set<string>();
    return annotations.map((ann, idx) => {
      // Find best matching aspiration node (by dimension overlap)
      let bestNode: SimNode | null = null;
      let bestScore = 0;

      for (const pn of positionedNodes) {
        if (pn.type !== "aspiration" || usedNodeIds.has(pn.id)) continue;
        const nodeData = nodes.find((n) => n.id === pn.id);
        if (!nodeData?.dimensions) continue;

        const overlap = ann.dimensionsInvolved.filter((d) =>
          nodeData.dimensions!.includes(d),
        ).length;
        if (overlap > bestScore) {
          bestScore = overlap;
          bestNode = pn;
        }
      }

      // Fallback: use any aspiration node not yet taken
      if (!bestNode) {
        bestNode = positionedNodes.find(
          (pn) => pn.type === "aspiration" && !usedNodeIds.has(pn.id),
        ) || null;
      }

      if (!bestNode) return null;
      usedNodeIds.add(bestNode.id);

      // Position: offset below and slightly to the side of the node
      const offsetX = idx % 2 === 0 ? bestNode.r + 6 : -(bestNode.r + 6);
      const offsetY = bestNode.r + 8;

      return {
        ...ann,
        x: (bestNode.x ?? cx) + offsetX,
        y: (bestNode.y ?? cy) + offsetY,
        anchor: idx % 2 === 0 ? "start" as const : "end" as const,
      };
    }).filter(Boolean) as Array<InsightAnnotation & { x: number; y: number; anchor: "start" | "end" }>;
  }, [annotations, positionedNodes, nodes, cx, cy]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${MEMBRANE_VB_WIDTH} ${MEMBRANE_VB_HEIGHT}`}
      className="block mx-auto"
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
            className="transition-opacity duration-400"
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

      {/* Behavioral correlation links */}
      {positionedLinks.map((link, i) => {
        const src = link.source as SimNode;
        const tgt = link.target as SimNode;
        if (src.x == null || tgt.x == null) return null;
        // Thickness: 0.5 at weight 0.3, up to 2.0 at weight 1.0
        const thickness = 0.5 + link.weight * 1.5;
        // Opacity: subtle, 0.15–0.4
        const opacity = 0.15 + link.weight * 0.25;
        return (
          <line
            key={`link-${i}`}
            x1={src.x}
            y1={src.y}
            x2={tgt.x}
            y2={tgt.y}
            stroke="#A8C4AA"
            strokeWidth={thickness}
            strokeOpacity={opacity}
            strokeLinecap="round"
          />
        );
      })}

      {/* Holon nodes */}
      {positionedNodes.map((node) => {
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
            onClick={() => {
              const nodeData = nodes.find(n => n.id === node.id);
              onNodeTap({
                id: node.id,
                label: node.label,
                layer: node.layer,
                status: node.status,
                r: node.r,
                type: node.type,
                dimensions: nodeData?.dimensions,
              });
            }}
            className="cursor-pointer"
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

            {/* Dimension dots — shown on aspiration nodes */}
            {node.type === "aspiration" && (() => {
              const nodeData = nodes.find(n => n.id === node.id);
              const dims = nodeData?.dimensions || [];
              if (dims.length === 0) return null;
              // Arrange dots in a small arc below the node
              const dotR = 2;
              const arcR = displayR + 5;
              const spreadAngle = Math.min(dims.length * 18, 90); // degrees
              const startAngle = 90 - spreadAngle / 2; // centered below
              return dims.map((dim, di) => {
                const angle = dims.length === 1
                  ? 90 // center below
                  : startAngle + (spreadAngle / (dims.length - 1)) * di;
                const rad = (angle * Math.PI) / 180;
                const dx = Math.cos(rad) * arcR;
                const dy = Math.sin(rad) * arcR;
                return (
                  <circle
                    key={dim}
                    cx={(node.x ?? 0) + dx}
                    cy={(node.y ?? 0) + dy}
                    r={dotR}
                    fill={DIMENSION_COLORS[dim as keyof typeof DIMENSION_COLORS] || "#8BAF8E"}
                    className="pointer-events-none"
                  />
                );
              });
            })()}

            {/* Manage mode × badge — shown on aspiration, context, principle nodes */}
            {manageMode && !isIdentity && (
              <g>
                <circle
                  cx={(node.x ?? 0) + displayR * 0.65}
                  cy={(node.y ?? 0) - displayR * 0.65}
                  r={6}
                  fill="#FAF8F3"
                  stroke="#B5621E"
                  strokeWidth={1}
                />
                <text
                  x={(node.x ?? 0) + displayR * 0.65}
                  y={(node.y ?? 0) - displayR * 0.65}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#B5621E"
                  fontFamily="'Source Sans 3', sans-serif"
                  fontSize="8"
                  fontWeight="600"
                  className="pointer-events-none"
                >
                  &times;
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Insight thread annotations — museum placard aesthetic */}
      {placedAnnotations.map((ann) => (
        <text
          key={ann.id}
          x={ann.x}
          y={ann.y}
          textAnchor={ann.anchor}
          dominantBaseline="hanging"
          fontFamily="'Cormorant Garamond', serif"
          fontStyle="italic"
          fontSize="6"
          fill="#6B6358"
          opacity={0.75}
          className="pointer-events-none"
        >
          {truncateInsight(ann.text)}
        </text>
      ))}
    </svg>
  );
}
