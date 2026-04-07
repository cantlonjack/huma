/**
 * Capital Pulse — computes which dimensions were moved today
 * and which haven't been touched in 5+ days.
 */

import type { DimensionKey, SheetEntry, Aspiration } from "@/types/v2";
import { getEffectiveDimensions } from "@/types/v2";

export interface PulseData {
  movedDimensions: DimensionKey[];
  dormantDimension: { key: DimensionKey; days: number } | null;
}

/**
 * Compute today's capital pulse from checked entries and recent history.
 *
 * @param compiledEntries - Today's sheet entries
 * @param checkedKeys - Set of checked entry keys (aspirationId:behaviorKey)
 * @param aspirations - All aspirations (to look up dimension data)
 * @param recentDimensionDays - Map of dimension -> days since last activity (from behavior_log)
 */
export function computeCapitalPulse(
  compiledEntries: SheetEntry[],
  checkedKeys: Set<string>,
  aspirations: Aspiration[],
  recentDimensionDays?: Record<string, number>,
): PulseData {
  // Find dimensions touched by checked entries
  const movedSet = new Set<DimensionKey>();

  for (const entry of compiledEntries) {
    const key = `${entry.aspirationId}:${entry.behaviorKey}`;
    if (!checkedKeys.has(key)) continue;

    // Use dimensions from the compiled entry (set by Claude during sheet compilation)
    if (entry.dimensions) {
      for (const dim of entry.dimensions) {
        movedSet.add(dim as DimensionKey);
      }
    }
  }

  // Also check aspiration-level dimension data for matched behaviors
  // Uses dimensionOverrides when the user has corrected the AI mapping
  for (const asp of aspirations) {
    for (const behavior of asp.behaviors) {
      const key = `${asp.id}:${behavior.key}`;
      if (!checkedKeys.has(key)) continue;

      const effective = getEffectiveDimensions(behavior);
      for (const effect of effective) {
        movedSet.add(effect.dimension);
      }
    }
  }

  const movedDimensions = Array.from(movedSet);

  // Find most dormant dimension (5+ days without activity)
  let dormantDimension: PulseData["dormantDimension"] = null;
  if (recentDimensionDays) {
    const allDimensions: DimensionKey[] = [
      "body", "people", "money", "home", "growth", "joy", "purpose", "identity",
    ];

    let maxDays = 0;
    for (const dim of allDimensions) {
      if (movedSet.has(dim)) continue; // Skip if moved today
      const days = recentDimensionDays[dim] ?? 999;
      if (days >= 5 && days > maxDays) {
        maxDays = days;
        dormantDimension = { key: dim, days };
      }
    }
  }

  return { movedDimensions, dormantDimension };
}
