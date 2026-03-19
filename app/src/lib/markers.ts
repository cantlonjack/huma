import { type Phase } from "@/engine/types";

const VALID_PHASES = new Set<string>([
  "ikigai",
  "holistic-context",
  "landscape",
  "enterprise-map",
  "nodal-interventions",
  "operational-design",
  "complete",
]);

/**
 * Strip [[PHASE:...]], [[CONTEXT:...]], and [[CANVAS_DATA:...]] markers from text for display.
 * Also strips incomplete/partial markers that arrive mid-stream.
 */
export function cleanForDisplay(text: string): string {
  return text
    .replace(/\[\[PHASE:[\w-]+\]\] */g, "")
    .replace(/\[\[CONTEXT:[\w-]+(?::[\w-]+)?\]\][^\[]*(?=\[\[|$)/g, "")
    .replace(/\[\[CANVAS_DATA:[\w-]+\]\][^\[]*(?=\[\[|$)/g, "")
    .replace(/\[\[(?:PHASE|CONTEXT|CANVAS_DATA)(?::[\w-]*)?\]?$/g, "")
    .replace(/\[\[[\w:-]*$/g, "")
    .trimEnd();
}

/**
 * Parse [[PHASE:xxx]], [[CONTEXT:xxx]], and [[CANVAS_DATA:xxx]] markers from AI response.
 * Returns clean display text, detected phase transition, captured context entries,
 * and parsed canvas data entries.
 */
export function parseMarkers(text: string): {
  clean: string;
  phase: Phase | null;
  isComplete: boolean;
  capturedContexts: { type: string; value: string }[];
  canvasDataEntries: { type: string; json: unknown }[];
} {
  let phase: Phase | null = null;
  let isComplete = false;
  const capturedContexts: { type: string; value: string }[] = [];
  const canvasDataEntries: { type: string; json: unknown }[] = [];

  const phaseMatch = text.match(/\[\[PHASE:([\w-]+)\]\]/);
  if (phaseMatch) {
    const phaseId = phaseMatch[1];
    if (VALID_PHASES.has(phaseId)) {
      if (phaseId === "complete") {
        isComplete = true;
      } else {
        phase = phaseId as Phase;
      }
    }
    // Non-canonical phase IDs (typos, case errors) are silently ignored
  }

  // Supports both [[CONTEXT:type]]value and [[CONTEXT:type:value]] formats
  const contextMatches = text.matchAll(
    /\[\[CONTEXT:([\w-]+(?::[\w-]+)?)\]\]\s*([\s\S]*?)(?=\[\[|$)/g
  );
  for (const match of contextMatches) {
    capturedContexts.push({ type: match[1], value: match[2].trim() });
  }

  const canvasMatches = text.matchAll(
    /\[\[CANVAS_DATA:([\w-]+)\]\]\s*([\s\S]*?)(?=\[\[|$)/g
  );
  for (const match of canvasMatches) {
    const rawJson = match[2].trim();
    try {
      const parsed = JSON.parse(rawJson);
      canvasDataEntries.push({ type: match[1], json: parsed });
    } catch {
      // Silently skip malformed JSON — canvas will use fallback/pending state
    }
  }

  const clean = text
    .replace(/\[\[PHASE:[\w-]+\]\] */g, "")
    .replace(/\[\[CONTEXT:[\w-]+(?::[\w-]+)?\]\][^\[]*(?=\[\[|$)/g, "")
    .replace(/\[\[CANVAS_DATA:[\w-]+\]\][^\[]*(?=\[\[|$)/g, "")
    .trimEnd();

  return { clean, phase, isComplete, capturedContexts, canvasDataEntries };
}
