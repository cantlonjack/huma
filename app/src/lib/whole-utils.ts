import type { HolonNode, HolonLink, HolonLayer, HolonStatus } from "@/components/whole/WholeShape";
import type { Aspiration, KnownContext, Principle } from "@/types/v2";
import type { HumaContext } from "@/types/context";
import { contextForPrompt } from "@/lib/context-model";
import { displayName } from "@/lib/display-name";

export function mapAspirationStatus(asp: Aspiration): HolonStatus {
  const vs = asp.funnel?.validationStatus;
  if (vs === "working") return "working";
  if (vs === "finding") return "finding";
  if (vs === "no_path") return "no_path";
  if (vs === "adjusting") return "adjusting";
  if (asp.stage === "someday") return "no_path";
  return "active";
}

export function aspirationLayer(asp: Aspiration): HolonLayer {
  const status = mapAspirationStatus(asp);
  if (status === "no_path" || asp.stage === "someday") return "vision";
  return "patterns";
}

export function aspirationRadius(asp: Aspiration): number {
  const status = mapAspirationStatus(asp);
  if (status === "working") return 28;
  if (status === "active") return 24;
  if (status === "finding") return 20;
  return 18;
}

export function buildNodes(
  aspirations: Aspiration[],
  context: KnownContext,
  principles: Principle[],
  operatorName: string,
): HolonNode[] {
  const nodes: HolonNode[] = [];

  // Identity nucleus
  nodes.push({
    id: "__identity__",
    label: operatorName || "You",
    layer: "identity",
    status: "active",
    r: 36,
    type: "identity",
  });

  // Aspirations → Patterns or Vision
  for (const asp of aspirations) {
    const status = mapAspirationStatus(asp);
    const dims = asp.dimensionsTouched || [];
    const behaviorDims = asp.behaviors?.flatMap((b) => b.dimensions?.map((d) => d.dimension) || []) || [];
    const allDims = [...new Set([...dims, ...behaviorDims])];

    nodes.push({
      id: asp.id,
      label: displayName(asp.clarifiedText || asp.rawText),
      layer: aspirationLayer(asp),
      status,
      r: aspirationRadius(asp),
      type: "aspiration",
      description: asp.rawText,
      dimensions: allDims,
    });
  }

  // Principles
  for (const p of principles) {
    if (!p.active) continue;
    nodes.push({
      id: `principle-${p.id}`,
      label: displayName(p.text),
      layer: "principles",
      status: "active",
      r: 20,
      type: "principle",
      description: p.text,
    });
  }

  // Foundation items from context
  if (context.place?.name) {
    nodes.push({
      id: "ctx-place",
      label: context.place.name,
      layer: "foundation",
      status: "working",
      r: 22,
      type: "context",
      description: context.place.detail || context.place.name,
    });
  }
  if (context.work?.title) {
    nodes.push({
      id: "ctx-work",
      label: context.work.title,
      layer: "foundation",
      status: "working",
      r: 20,
      type: "context",
      description: context.work.detail || context.work.title,
    });
  }
  if (context.stage?.label) {
    nodes.push({
      id: "ctx-stage",
      label: context.stage.label,
      layer: "foundation",
      status: "active",
      r: 18,
      type: "context",
      description: context.stage.detail || context.stage.label,
    });
  }
  if (context.health?.detail) {
    nodes.push({
      id: "ctx-health",
      label: "Health",
      layer: "foundation",
      status: "active",
      r: 16,
      type: "context",
      description: context.health.detail,
    });
  }

  return nodes;
}

// Compute dimension-overlap links as fallback when no behavioral data exists
export function computeDimensionLinks(aspirations: Aspiration[]): HolonLink[] {
  const links: HolonLink[] = [];
  for (let i = 0; i < aspirations.length; i++) {
    for (let j = i + 1; j < aspirations.length; j++) {
      const aDims = new Set(aspirations[i].dimensionsTouched || []);
      const bDims = new Set(aspirations[j].dimensionsTouched || []);
      if (aDims.size === 0 || bDims.size === 0) continue;

      let overlap = 0;
      for (const d of aDims) if (bDims.has(d)) overlap++;
      if (overlap === 0) continue;

      const weight = overlap / Math.min(aDims.size, bDims.size);
      if (weight >= 0.4) {
        links.push({
          sourceId: aspirations[i].id,
          targetId: aspirations[j].id,
          weight: Math.round(weight * 100) / 100,
        });
      }
    }
  }
  return links;
}

// Serialize context for AI prompt (legacy flat version)
export function serializeContext(
  ctx: Record<string, unknown>,
  aspirations: Aspiration[],
): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(ctx)) {
    if (v && typeof v === "object") parts.push(`${k}: ${JSON.stringify(v)}`);
    else if (v) parts.push(`${k}: ${v}`);
  }
  if (aspirations.length > 0) {
    parts.push("Aspirations: " + aspirations.map((a) => a.clarifiedText || a.rawText).join("; "));
  }
  return parts.join("\n") || "";
}

// Serialize HumaContext for AI prompt (rich version using contextForPrompt)
export function serializeHumaContext(
  humaContext: HumaContext,
  aspirations: Aspiration[],
): string {
  const prose = contextForPrompt(humaContext);
  if (aspirations.length > 0) {
    const aspList = aspirations.map((a) => a.clarifiedText || a.rawText).join("; ");
    return `${prose}\n\nAspirations: ${aspList}`;
  }
  return prose;
}

// Map context node IDs to field paths
export function contextFieldForNodeId(nodeId: string): string | null {
  if (nodeId === "ctx-place") return "place";
  if (nodeId === "ctx-work") return "work";
  if (nodeId === "ctx-stage") return "stage";
  if (nodeId === "ctx-health") return "health";
  return null;
}
