import type { Pattern, Aspiration, DimensionKey, SparklineData } from "@/types/v2";
import { displayName } from "@/lib/display-name";

export function statusLabel(status: Pattern["status"]): string {
  if (status === "validated") return "Validated";
  if (status === "working") return "Working";
  return "Finding";
}

export function statusColor(status: Pattern["status"]): { bg: string; text: string } {
  if (status === "validated") return { bg: "var(--color-sage-100)", text: "var(--color-sage-700)" };
  if (status === "working") return { bg: "var(--color-amber-100)", text: "var(--color-amber-600)" };
  return { bg: "var(--color-sand-100)", text: "var(--color-sage-400)" };
}

export function validationPercent(pattern: Pattern): number {
  if (pattern.validationTarget <= 0) return 0;
  return Math.min(100, Math.round((pattern.validationCount / pattern.validationTarget) * 100));
}

export function progressBarColor(status: Pattern["status"]): string {
  if (status === "validated") return "var(--color-sage-700)";
  if (status === "working") return "var(--color-amber-600)";
  return "var(--color-sage-300)";
}

export const ARCHETYPE_DOMAINS: Record<string, DimensionKey[]> = {
  "Earth Tender": ["body", "home"],
  "Creator": ["growth", "joy"],
  "Entrepreneur": ["money", "growth"],
  "Parent": ["people", "home"],
  "Educator": ["growth", "people"],
  "Spirit": ["purpose", "identity"],
};

/** Check if a pattern's aspiration dimensions overlap with an archetype's domain */
export function getArchetypeMatch(
  pattern: Pattern,
  aspirations: Aspiration[],
  primaryArchetype: string | undefined,
): string | null {
  if (!primaryArchetype) return null;
  const domains = ARCHETYPE_DOMAINS[primaryArchetype];
  if (!domains) return null;

  const asp = aspirations.find(a => a.id === pattern.aspirationId);
  if (!asp) return null;

  const aspDims = (asp.dimensionsTouched || []) as string[];
  const behaviorDims = (asp.behaviors || []).flatMap(b =>
    (b.dimensions || []).map(d => typeof d === "string" ? d : d.dimension)
  );
  const allDims = new Set([...aspDims, ...behaviorDims]);

  if (domains.some(d => allDims.has(d))) return primaryArchetype;
  return null;
}

/** Get ALL dimensions touched across all steps in a pattern, deduplicated */
export function getAllStepDimensions(pattern: Pattern, aspirations: Aspiration[]): DimensionKey[] {
  const asp = aspirations.find(a => a.id === pattern.aspirationId);
  if (!asp) return [];

  const seen = new Set<DimensionKey>();
  for (const step of pattern.steps) {
    const stepText = step.text.toLowerCase().trim();
    const behavior = asp.behaviors?.find(b => b.text.toLowerCase().trim() === stepText);
    if (behavior?.dimensions) {
      for (const d of behavior.dimensions) {
        const dim = typeof d === "string" ? d : d.dimension;
        if (dim) seen.add(dim as DimensionKey);
      }
    }
  }
  return Array.from(seen);
}

/** Get the display name of a pattern's source aspiration */
export function getAspirationName(pattern: Pattern, aspirations: Aspiration[]): string | null {
  const asp = aspirations.find(a => a.id === pattern.aspirationId);
  if (!asp) return null;
  return displayName(asp.title || asp.clarifiedText || asp.rawText);
}

/** Get coming_up and longer_arc data from the source aspiration */
export function getAspirationPhases(pattern: Pattern, aspirations: Aspiration[]): {
  comingUp: import("@/types/v2").FutureAction[];
  longerArc: import("@/types/v2").FuturePhase[];
} {
  const asp = aspirations.find(a => a.id === pattern.aspirationId);
  return {
    comingUp: asp?.comingUp ?? [],
    longerArc: asp?.longerArc ?? [],
  };
}

/** Get the dimensions that a trigger behavior touches, by looking up the aspiration */
export function getTriggerDimensions(pattern: Pattern, aspirations: Aspiration[]): DimensionKey[] {
  const asp = aspirations.find(a => a.id === pattern.aspirationId);
  if (!asp) return [];

  const triggerText = pattern.trigger.toLowerCase().trim();
  const behavior = asp.behaviors?.find(b => b.text.toLowerCase().trim() === triggerText);
  if (!behavior?.dimensions) return [];

  return behavior.dimensions
    .map(d => typeof d === "string" ? d : d.dimension)
    .filter(Boolean) as DimensionKey[];
}

/** Detect if trigger behavior is shared across multiple aspirations */
export function getSharedCaption(pattern: Pattern, aspirations: Aspiration[]): string | null {
  const triggerText = pattern.trigger.toLowerCase().trim();
  const shared = aspirations.filter(a =>
    a.id !== pattern.aspirationId &&
    a.behaviors?.some(b => b.text.toLowerCase().trim() === triggerText)
  );
  if (shared.length === 0) return null;
  if (shared.length === 1) {
    const name = displayName(shared[0].clarifiedText || shared[0].rawText);
    return `Shared with ${name}`;
  }
  return `Shared across ${shared.length + 1} patterns`;
}

/** Find the approximate date where a dropping pattern started declining */
export function findDropOffDate(points: SparklineData["points"]): string | null {
  if (points.length < 4) return null;
  const mid = Math.floor(points.length / 2);
  for (let i = mid; i >= 0; i--) {
    if (points[i].ratio >= 0.5) {
      return points[i].date;
    }
  }
  let best = 0;
  for (let i = 1; i < mid; i++) {
    if (points[i].ratio > points[best].ratio) best = i;
  }
  return points[best].date;
}

/** Format a YYYY-MM-DD date as a readable string like "March 21" */
export function formatDropDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}
