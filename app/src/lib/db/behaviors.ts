import type { SupabaseClient } from "@supabase/supabase-js";
import type { Aspiration, Pattern, SparklineData, SparklinePoint, EmergingBehavior, DimensionKey } from "@/types/v2";
import { getLocalDate, getLocalDateOffset } from "@/lib/date-utils";

// ─── Behavior Log (check-off tracking) ──────────────────────────────────────

export async function logBehaviorCheckoff(
  supabase: SupabaseClient,
  userId: string,
  behaviorKey: string,
  behaviorName: string,
  aspirationId: string | null,
  date: string,
  completed: boolean
) {
  // Upsert: one entry per user+behavior_key+date (stable slug, not display text)
  const { data: existing } = await supabase
    .from("behavior_log")
    .select("id")
    .eq("user_id", userId)
    .eq("behavior_key", behaviorKey)
    .eq("date", date)
    .limit(1)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("behavior_log")
      .update({
        behavior_name: behaviorName,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("behavior_log").insert({
      user_id: userId,
      behavior_id: null,
      behavior_key: behaviorKey,
      behavior_name: behaviorName,
      date,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    });
  }
}

export async function getBehaviorWeekCount(
  supabase: SupabaseClient,
  userId: string,
  behaviorKey: string
): Promise<{ completed: number; total: number }> {
  const startStr = getLocalDateOffset(7);

  const { data } = await supabase
    .from("behavior_log")
    .select("completed")
    .eq("user_id", userId)
    .eq("behavior_key", behaviorKey)
    .gte("date", startStr);

  if (!data) return { completed: 0, total: 0 };
  return {
    completed: data.filter(r => r.completed).length,
    total: data.length,
  };
}

export async function getBehaviorWeekCounts(
  supabase: SupabaseClient,
  userId: string
): Promise<Record<string, { completed: number; total: number }>> {
  const startStr = getLocalDateOffset(7);

  const { data } = await supabase
    .from("behavior_log")
    .select("behavior_key, behavior_name, completed")
    .eq("user_id", userId)
    .gte("date", startStr);

  if (!data) return {};

  const counts: Record<string, { completed: number; total: number }> = {};
  for (const row of data) {
    // Key by behavior_key (stable slug); fall back to behavior_name for legacy rows
    const key = row.behavior_key || row.behavior_name;
    if (!counts[key]) {
      counts[key] = { completed: 0, total: 0 };
    }
    counts[key].total++;
    if (row.completed) counts[key].completed++;
  }
  return counts;
}

// ─── Sparkline Computation ──────────────────────────────────────────────────

/**
 * Compute 14-day sparkline data for a set of patterns.
 *
 * For each pattern, queries behavior_log for all behavior_keys in its steps.
 * Each day's ratio = (completed steps) / (total steps in pattern).
 * Days with no log entries get ratio 0.
 *
 * Trend is derived by comparing the second-half average to the first-half average:
 *   rising:   second half > first half + 0.1
 *   dropping: second half < first half - 0.1
 *   stable:   otherwise
 *
 * Single DB query for all patterns — efficient regardless of pattern count.
 */
export async function getPatternSparklines(
  supabase: SupabaseClient,
  userId: string,
  patterns: Pattern[]
): Promise<SparklineData[]> {
  if (patterns.length === 0) return [];

  const startStr = getLocalDateOffset(13); // 14 days including today
  const todayStr = getLocalDate();

  // Collect all unique behavior_keys across all patterns
  const allKeys = new Set<string>();
  for (const p of patterns) {
    for (const step of p.steps) {
      allKeys.add(step.behaviorKey);
    }
  }

  if (allKeys.size === 0) return [];

  // Single query: all completions for all relevant behavior_keys in the 14-day window
  const { data: rows } = await supabase
    .from("behavior_log")
    .select("behavior_key, date, completed")
    .eq("user_id", userId)
    .gte("date", startStr)
    .lte("date", todayStr)
    .in("behavior_key", Array.from(allKeys));

  // Index: behavior_key -> date -> completed
  const completionMap = new Map<string, Map<string, boolean>>();
  if (rows) {
    for (const row of rows) {
      const key = row.behavior_key as string;
      if (!completionMap.has(key)) completionMap.set(key, new Map());
      completionMap.get(key)!.set(row.date as string, row.completed as boolean);
    }
  }

  // Build the 14-day date array (oldest first)
  const dates: string[] = [];
  for (let i = 13; i >= 0; i--) {
    dates.push(getLocalDateOffset(i));
  }

  // Compute sparkline for each pattern
  const results: SparklineData[] = [];
  for (const pattern of patterns) {
    const stepKeys = pattern.steps.map(s => s.behaviorKey);
    const stepCount = stepKeys.length;
    if (stepCount === 0) continue;

    const points: SparklinePoint[] = [];
    for (const date of dates) {
      let completed = 0;
      for (const key of stepKeys) {
        const dayMap = completionMap.get(key);
        if (dayMap?.get(date)) completed++;
      }
      points.push({ date, ratio: completed / stepCount });
    }

    // Trend: compare first 7 days average vs last 7 days average
    const firstHalf = points.slice(0, 7).reduce((s, p) => s + p.ratio, 0) / 7;
    const secondHalf = points.slice(7).reduce((s, p) => s + p.ratio, 0) / 7;
    const diff = secondHalf - firstHalf;
    const trend: SparklineData["trend"] =
      diff > 0.1 ? "rising" : diff < -0.1 ? "dropping" : "stable";

    results.push({ patternId: pattern.id, points, trend });
  }

  return results;
}

// ─── Emerging Behavior Detection ────────────────────────────────────────────

/**
 * Detect behaviors that have been consistently completed (12+ of last 14 days)
 * but are NOT already part of an existing pattern. These are unnamed patterns
 * forming organically — surfaced as "something forming..." on the Grow tab.
 *
 * Algorithm:
 * 1. Query all behavior_log completions in the 14-day window
 * 2. Group by behavior_key, count completed days
 * 3. Filter to 12+ completed days
 * 4. Exclude any behavior_key already present in an existing pattern's steps
 * 5. Enrich with dimension data from aspirations if available
 */
export async function detectEmergingBehaviors(
  supabase: SupabaseClient,
  userId: string,
  existingPatterns: Pattern[],
  aspirations: Aspiration[]
): Promise<EmergingBehavior[]> {
  const startStr = getLocalDateOffset(13); // 14 days including today
  const todayStr = getLocalDate();

  const { data: rows } = await supabase
    .from("behavior_log")
    .select("behavior_key, behavior_name, date, completed")
    .eq("user_id", userId)
    .eq("completed", true)
    .gte("date", startStr)
    .lte("date", todayStr);

  if (!rows || rows.length === 0) return [];

  // Group by behavior_key: count distinct completed dates
  const keyMap = new Map<string, { name: string; dates: Set<string> }>();
  for (const row of rows) {
    const key = (row.behavior_key || row.behavior_name) as string;
    const name = (row.behavior_name || row.behavior_key) as string;
    if (!keyMap.has(key)) keyMap.set(key, { name, dates: new Set() });
    keyMap.get(key)!.dates.add(row.date as string);
  }

  // Collect all behavior_keys already in existing patterns
  const patternKeys = new Set<string>();
  for (const p of existingPatterns) {
    for (const step of p.steps) {
      patternKeys.add(step.behaviorKey);
    }
  }

  // Filter: 12+ completed days AND not in any existing pattern
  const emerging: EmergingBehavior[] = [];
  for (const [key, { name, dates }] of keyMap) {
    if (dates.size < 12) continue;
    if (patternKeys.has(key)) continue;

    // Try to find dimension data from aspirations
    let dimensions: DimensionKey[] = [];
    let aspirationId: string | undefined;
    for (const asp of aspirations) {
      const behavior = asp.behaviors?.find(b => b.key === key);
      if (behavior) {
        aspirationId = asp.id;
        dimensions = (behavior.dimensions || [])
          .map(d => typeof d === "string" ? d : d.dimension)
          .filter(Boolean) as DimensionKey[];
        break;
      }
    }

    emerging.push({
      behaviorKey: key,
      behaviorName: name,
      completedDays: dates.size,
      totalDays: 14,
      dimensions,
      aspirationId,
    });
  }

  return emerging;
}

// ─── Day-of-Week Rhythm Counts ──────────────────────────────────────────────

/** Trailing 28-day completion counts grouped by day of week (0=Sun..6=Sat). */
export async function getBehaviorDayOfWeekCounts(
  supabase: SupabaseClient,
  userId: string,
  aspirationId?: string
): Promise<Record<number, number>> {
  const startStr = getLocalDateOffset(28);

  let query = supabase
    .from("sheet_entries")
    .select("date")
    .eq("user_id", userId)
    .eq("checked", true)
    .gte("date", startStr);

  if (aspirationId) {
    query = query.eq("aspiration_id", aspirationId);
  }

  const { data } = await query;
  if (!data) return {};

  const counts: Record<number, number> = {};
  for (const row of data) {
    const dow = new Date(row.date + "T12:00:00").getDay(); // 0=Sun..6=Sat
    counts[dow] = (counts[dow] || 0) + 1;
  }
  return counts;
}

/** Recent streak detection: completions in last N days for an aspiration. */
export async function getRecentCompletionDays(
  supabase: SupabaseClient,
  userId: string,
  aspirationId: string,
  days: number
): Promise<number> {
  const startStr = getLocalDateOffset(days);

  const { data } = await supabase
    .from("sheet_entries")
    .select("date")
    .eq("user_id", userId)
    .eq("aspiration_id", aspirationId)
    .eq("checked", true)
    .gte("date", startStr);

  if (!data) return 0;
  // Count unique dates
  return new Set(data.map(r => r.date)).size;
}

// ─── WHY Evolution: Behavioral Summary ──────────────────────────────────────

export interface BehavioralSummary {
  totalDays: number;                // Days with any log entry
  topBehaviors: { key: string; name: string; completedDays: number }[];
  dimensionCounts: Record<string, number>;  // Dimension → total completions
}

export async function getBehavioralSummary(
  supabase: SupabaseClient,
  userId: string,
  aspirations: { id: string; behaviors: { key: string; text: string; dimensions?: { dimension: string }[] }[] }[],
): Promise<BehavioralSummary> {
  const startStr = getLocalDateOffset(27); // 28 days including today
  const todayStr = getLocalDate();

  const { data: rows } = await supabase
    .from("behavior_log")
    .select("behavior_key, behavior_name, date, completed")
    .eq("user_id", userId)
    .eq("completed", true)
    .gte("date", startStr)
    .lte("date", todayStr);

  if (!rows || rows.length === 0) {
    return { totalDays: 0, topBehaviors: [], dimensionCounts: {} };
  }

  // Count distinct active days
  const activeDates = new Set(rows.map((r) => r.date));

  // Group by behavior_key
  const keyMap = new Map<string, { name: string; dates: Set<string> }>();
  for (const row of rows) {
    const key = row.behavior_key || row.behavior_name;
    if (!keyMap.has(key)) keyMap.set(key, { name: row.behavior_name, dates: new Set() });
    keyMap.get(key)!.dates.add(row.date);
  }

  // Sort by completed days descending, take top 10
  const topBehaviors = Array.from(keyMap.entries())
    .map(([key, val]) => ({ key, name: val.name, completedDays: val.dates.size }))
    .sort((a, b) => b.completedDays - a.completedDays)
    .slice(0, 10);

  // Build dimension → completion count from aspiration behavior metadata
  const dimLookup = new Map<string, string[]>();
  for (const asp of aspirations) {
    for (const b of asp.behaviors) {
      dimLookup.set(b.key, b.dimensions?.map((d) => d.dimension) || []);
    }
  }

  const dimensionCounts: Record<string, number> = {};
  for (const row of rows) {
    const key = row.behavior_key || row.behavior_name;
    const dims = dimLookup.get(key) || [];
    for (const d of dims) {
      dimensionCounts[d] = (dimensionCounts[d] || 0) + 1;
    }
  }

  return { totalDays: activeDates.size, topBehaviors, dimensionCounts };
}
