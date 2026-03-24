import type { OperatorContext, LotusPhase } from "./lotus";

export type WorkspaceView =
  | { mode: "whole" }
  | { mode: "petal"; petal: LotusPhase }
  | { mode: "flow"; petal: LotusPhase };

export interface ContextEdit {
  field: string;
  previousValue: unknown;
  newValue: unknown;
  source: "workspace" | "petal" | "feedback";
  createdAt: string;
}

/** Which petals have guided flows available (grows as we build more) */
export const AVAILABLE_FLOWS: LotusPhase[] = ["context"];

/** Petal display metadata */
export interface PetalMeta {
  phase: LotusPhase;
  label: string;
  /** Approximate time for the guided flow */
  timeHint?: string;
  /** SVG icon path (16x16 viewBox) */
  icon?: string;
}

export const PETAL_META: PetalMeta[] = [
  { phase: "whole", label: "Whole" },
  { phase: "who", label: "Who" },
  { phase: "what", label: "What" },
  { phase: "context", label: "Context", timeHint: "10 min" },
  { phase: "purpose", label: "Purpose", timeHint: "10 min" },
  { phase: "vision", label: "Vision", timeHint: "15 min" },
  { phase: "behavior", label: "Behavior", timeHint: "10 min" },
  { phase: "nurture", label: "Nurture" },
  { phase: "validate", label: "Validate" },
  { phase: "design", label: "Design" },
  { phase: "install", label: "Install" },
  { phase: "evolve", label: "Evolve" },
];

/**
 * Determine which petal should glow as "next" based on operator progress.
 * Returns null if all available flows are complete.
 */
export function getNextPetal(context: OperatorContext): LotusPhase | null {
  const progress = context.lotusProgress || {};
  if (!progress.context) return "context";
  if (!progress.purpose) return "purpose";
  if (!progress.vision) return "vision";
  if (!progress.behavior) return "behavior";
  return null;
}

/**
 * Check if a petal has been completed (has data from Lotus Flow or a petal flow).
 */
export function isPetalComplete(
  phase: LotusPhase,
  context: OperatorContext
): boolean {
  // First 3 petals are complete if Lotus Flow was finished
  if (phase === "whole" || phase === "who" || phase === "what") {
    return !!(context.name && context.capitals);
  }
  return !!(context.lotusProgress && context.lotusProgress[phase]);
}
