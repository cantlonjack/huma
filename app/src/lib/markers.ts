import { type Phase } from "@/engine/types";

/**
 * Strip [[PHASE:...]] and [[CONTEXT:...]] markers from text for display.
 * Also strips incomplete/partial markers that arrive mid-stream.
 */
export function cleanForDisplay(text: string): string {
  return text
    .replace(/\[\[PHASE:[\w-]+\]\]\s*/g, "")
    .replace(/\[\[CONTEXT:[\w-]+\]\][^\[]*(?=\[\[|$)/g, "")
    .replace(/\[\[(?:PHASE|CONTEXT)(?::[\w-]*)?\]?$/g, "")
    .replace(/\[\[[\w:-]*$/g, "")
    .trimEnd();
}

/**
 * Parse [[PHASE:xxx]] and [[CONTEXT:xxx]] markers from AI response.
 * Returns clean display text, detected phase transition, and captured context entries.
 */
export function parseMarkers(text: string): {
  clean: string;
  phase: Phase | null;
  isComplete: boolean;
  capturedContexts: { type: string; value: string }[];
} {
  let phase: Phase | null = null;
  let isComplete = false;
  const capturedContexts: { type: string; value: string }[] = [];

  const phaseMatch = text.match(/\[\[PHASE:([\w-]+)\]\]/);
  if (phaseMatch) {
    const phaseId = phaseMatch[1];
    if (phaseId === "complete") {
      isComplete = true;
    } else {
      phase = phaseId as Phase;
    }
  }

  const contextMatches = text.matchAll(
    /\[\[CONTEXT:([\w-]+)\]\]\s*([\s\S]*?)(?=\[\[|$)/g
  );
  for (const match of contextMatches) {
    capturedContexts.push({ type: match[1], value: match[2].trim() });
  }

  const clean = text
    .replace(/\[\[PHASE:[\w-]+\]\]\s*/g, "")
    .replace(/\[\[CONTEXT:[\w-]+\]\][^\[]*(?=\[\[|$)/g, "")
    .trimEnd();

  return { clean, phase, isComplete, capturedContexts };
}
