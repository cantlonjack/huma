import type { Behavior, FutureAction, FuturePhase, ReorganizationPlan } from "@/types/v2";

export interface DecompositionData {
  aspiration_title: string;
  summary: string;
  this_week: Array<{
    key: string;
    name: string;
    text: string;
    detail: string;
    is_trigger: boolean;
    dimensions: string[];
    frequency: "daily" | "weekly" | "specific-days";
    days?: string[];
  }>;
  coming_up: FutureAction[];
  longer_arc: FuturePhase[];
  validation?: {
    question: string;
    target: string;
    frequency: "weekly" | "biweekly" | "monthly";
    failure_response: string;
  };
}

export interface ParsedDecision {
  description: string;
  reasoning: string;
  frameworks_surfaced: string[];
}

export interface ParsedMarkers {
  cleanText: string;
  parsedOptions: string[] | null;
  parsedBehaviors: Behavior[] | null;
  parsedActions: string[] | null;
  parsedContext: Record<string, unknown> | null;
  parsedAspirationName: string | null;
  parsedDecomposition: DecompositionData | null;
  parsedReorganization: ReorganizationPlan | null;
  parsedReplaceAspiration: string | null;
  parsedDecision: ParsedDecision | null;
}

const MARKER_TYPES = ["OPTIONS", "BEHAVIORS", "ACTIONS", "CONTEXT", "ASPIRATION_NAME", "DECOMPOSITION", "REORGANIZATION", "DECISION"] as const;

/**
 * Extract a single marker from text by finding [[TYPE: then scanning forward
 * to find the matching ]] that closes the marker (not a ] inside JSON).
 *
 * Strategy: find [[TYPE:, then try JSON.parse on progressively longer
 * substrings until we get valid JSON, then expect ]] immediately after.
 */
function extractMarker(text: string, type: string): { json: unknown; fullMatch: string } | null {
  const prefix = `[[${type}:`;
  const idx = text.indexOf(prefix);
  if (idx === -1) return null;

  const jsonStart = idx + prefix.length;
  // Find the closing ]] by looking for ]] after valid JSON
  // The marker is [[TYPE:<json>]] so we need to find where <json> ends and ]] follows
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = jsonStart; i < text.length; i++) {
    const ch = text[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (ch === '\\' && inString) {
      escape = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === '[' || ch === '{') {
      depth++;
    } else if (ch === ']' || ch === '}') {
      depth--;
      if (depth === 0) {
        // We've found the end of the JSON value
        const jsonStr = text.substring(jsonStart, i + 1);
        // Check that ]] follows
        if (text.substring(i + 1, i + 3) === ']]') {
          try {
            const json = JSON.parse(jsonStr);
            const fullMatch = text.substring(idx, i + 3);
            return { json, fullMatch };
          } catch {
            return null;
          }
        }
      }
    }
  }

  return null;
}

/**
 * Parse V2 conversation markers from AI response text.
 * Extracts [[OPTIONS:[...]]], [[BEHAVIORS:[...]]], [[ACTIONS:[...]]], [[CONTEXT:{...}]]
 * and returns clean display text with markers stripped.
 *
 * Uses bracket-aware parsing to handle JSON arrays inside markers
 * (e.g. [[OPTIONS:["a","b"]]] where ]]] would confuse naive regex).
 *
 * Safe against partial/malformed markers during streaming — unparseable
 * markers are silently ignored and their text is stripped from display.
 */
export function parseMarkersV2(text: string): ParsedMarkers {
  let parsedOptions: string[] | null = null;
  let parsedBehaviors: Behavior[] | null = null;
  let parsedActions: string[] | null = null;
  let parsedContext: Record<string, unknown> | null = null;
  let parsedAspirationName: string | null = null;
  let parsedDecomposition: DecompositionData | null = null;
  let parsedReorganization: ReorganizationPlan | null = null;
  let parsedReplaceAspiration: string | null = null;
  let parsedDecision: ParsedDecision | null = null;

  let cleanText = text;

  // Extract ASPIRATION_NAME separately — it uses a simple string value, not JSON
  const nameMatch = cleanText.match(/\[\[ASPIRATION_NAME:"([^"]+)"\]\]/);
  if (nameMatch) {
    parsedAspirationName = nameMatch[1];
    cleanText = cleanText.replace(nameMatch[0], "");
  }

  // Extract REPLACE_ASPIRATION — simple string value like ASPIRATION_NAME
  const replaceMatch = cleanText.match(/\[\[REPLACE_ASPIRATION:"([^"]+)"\]\]/);
  if (replaceMatch) {
    parsedReplaceAspiration = replaceMatch[1];
    cleanText = cleanText.replace(replaceMatch[0], "");
  }

  for (const type of MARKER_TYPES) {
    if (type === "ASPIRATION_NAME") continue; // Already handled above
    const result = extractMarker(text, type);
    if (result) {
      switch (type) {
        case "OPTIONS":
          parsedOptions = result.json as string[];
          break;
        case "BEHAVIORS":
          parsedBehaviors = result.json as Behavior[];
          break;
        case "ACTIONS":
          parsedActions = result.json as string[];
          break;
        case "CONTEXT":
          parsedContext = result.json as Record<string, unknown>;
          break;
        case "DECOMPOSITION":
          parsedDecomposition = result.json as DecompositionData;
          break;
        case "REORGANIZATION":
          parsedReorganization = result.json as ReorganizationPlan;
          break;
        case "DECISION":
          parsedDecision = result.json as ParsedDecision;
          break;
      }
      cleanText = cleanText.replace(result.fullMatch, "");
    }
  }

  // If we got a DECOMPOSITION marker, extract this_week behaviors for backwards compat
  if (parsedDecomposition && !parsedBehaviors) {
    parsedBehaviors = parsedDecomposition.this_week.map(item => ({
      key: item.key || item.name.toLowerCase().replace(/\s+/g, "-"),
      text: item.text || item.name,
      detail: item.detail,
      frequency: item.frequency || "weekly" as const,
      days: item.days,
      dimensions: (item.dimensions || []).map(d => ({
        dimension: d as Behavior["dimensions"][0]["dimension"],
        direction: "builds" as const,
        reasoning: "",
      })),
      enabled: true,
      is_trigger: item.is_trigger,
    })) as (Behavior & { is_trigger?: boolean })[];
  }

  // Strip incomplete markers at end of stream
  cleanText = cleanText
    .replace(/\[\[(?:OPTIONS|BEHAVIORS|ACTIONS|CONTEXT|ASPIRATION_NAME|DECOMPOSITION|REORGANIZATION|REPLACE_ASPIRATION|DECISION):?[\s\S]*$/g, "")
    .trim();

  return { cleanText, parsedOptions, parsedBehaviors, parsedActions, parsedContext, parsedAspirationName, parsedDecomposition, parsedReorganization, parsedReplaceAspiration, parsedDecision };
}
