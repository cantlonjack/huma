import type { Behavior } from "@/types/v2";

export interface ParsedMarkers {
  cleanText: string;
  parsedOptions: string[] | null;
  parsedBehaviors: Behavior[] | null;
  parsedActions: string[] | null;
  parsedContext: Record<string, unknown> | null;
}

const MARKER_TYPES = ["OPTIONS", "BEHAVIORS", "ACTIONS", "CONTEXT"] as const;

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

  let cleanText = text;

  for (const type of MARKER_TYPES) {
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
      }
      cleanText = cleanText.replace(result.fullMatch, "");
    }
  }

  // Strip incomplete markers at end of stream (e.g. "[[OPTIONS:" without closing "]]")
  cleanText = cleanText
    .replace(/\[\[(?:OPTIONS|BEHAVIORS|ACTIONS|CONTEXT):?[\s\S]*$/g, "")
    .trim();

  return { cleanText, parsedOptions, parsedBehaviors, parsedActions, parsedContext };
}
