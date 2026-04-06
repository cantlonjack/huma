/**
 * React Query key factory + fetcher functions.
 *
 * Encapsulates the Supabase-first, localStorage-fallback pattern
 * so hooks just call useQuery(queryKeys.aspirations(userId), ...).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Aspiration, Insight, Pattern, Principle, KnownContext } from "@/types/v2";
import type { SparklineData, EmergingBehavior, MonthlyReviewData } from "@/types/v2";
import type { AspirationCorrelation } from "@/lib/supabase-v2";
import { createClient } from "@/lib/supabase";
import {
  getAspirations,
  getAllAspirations,
  getKnownContext,
  getUndeliveredInsight,
  getWhyStatement,
  getPrinciples,
  getAspirationCorrelations,
  getRecentInsights,
  getPatterns,
  getPatternSparklines,
  detectEmergingBehaviors,
  getMonthlyReviewData,
  getBehaviorWeekCounts,
  getBehaviorDayOfWeekCounts,
  getRecentCompletionDays,
} from "@/lib/supabase-v2";
import { getLocalDate, getLocalDateOffset } from "@/lib/date-utils";
import { extractPatternsFromAspirations } from "@/lib/pattern-extraction";

// ─── Query Keys ────────────────────────────────────────────────────────────

export const queryKeys = {
  // Shared across tabs
  aspirations: (userId: string | null) => ["aspirations", userId] as const,
  allAspirations: (userId: string | null) => ["allAspirations", userId] as const,
  knownContext: (userId: string | null) => ["knownContext", userId] as const,
  undeliveredInsight: (userId: string | null) => ["undeliveredInsight", userId] as const,

  // Today-specific
  checkedEntries: (userId: string, date: string) => ["checkedEntries", userId, date] as const,
  weekCounts: (userId: string) => ["weekCounts", userId] as const,
  thirtyDayCounts: (userId: string, aspirationIds: string[]) => ["thirtyDayCounts", userId, aspirationIds] as const,
  rhythmData: (userId: string) => ["rhythmData", userId] as const,

  // Grow-specific
  patterns: (userId: string | null) => ["patterns", userId] as const,
  sparklines: (userId: string) => ["sparklines", userId] as const,
  emergingBehaviors: (userId: string) => ["emergingBehaviors", userId] as const,
  monthlyReview: (userId: string) => ["monthlyReview", userId] as const,

  // Whole-specific
  whyStatement: (userId: string) => ["whyStatement", userId] as const,
  principles: (userId: string) => ["principles", userId] as const,
  correlations: (userId: string) => ["correlations", userId] as const,
  recentInsights: (userId: string) => ["recentInsights", userId] as const,
} as const;

// ─── Helper ────────────────────────────────────────────────────────────────

function getSupabase(userId: string | null): SupabaseClient | null {
  if (!userId) return null;
  return createClient();
}

// ─── Fetchers ──────────────────────────────────────────────────────────────

/** Active aspirations (working/active/adjusting), sorted by trigger time. */
export async function fetchAspirations(userId: string | null): Promise<Aspiration[]> {
  let asps: Aspiration[] = [];
  const sb = getSupabase(userId);

  if (sb && userId) {
    try {
      asps = await getAspirations(sb, userId);
    } catch { /* fallback */ }
  }

  if (asps.length === 0) {
    try {
      const saved = localStorage.getItem("huma-v2-aspirations");
      if (saved) asps = JSON.parse(saved);
    } catch { /* fresh */ }
  }

  // Filter to working/active/adjusting
  asps = asps.filter(a => {
    const status = a.funnel?.validationStatus || "working";
    return status === "working" || status === "active" || status === "adjusting";
  });

  // Sort by trigger_time ASC nulls last, then name ASC
  asps.sort((a, b) => {
    const aTime = a.triggerData?.window || "";
    const bTime = b.triggerData?.window || "";
    if (aTime && !bTime) return -1;
    if (!aTime && bTime) return 1;
    if (aTime && bTime && aTime !== bTime) return aTime.localeCompare(bTime);
    const aName = a.clarifiedText || a.rawText;
    const bName = b.clarifiedText || b.rawText;
    return aName.localeCompare(bName);
  });

  return asps;
}

/** All aspirations (including archived), for Whole tab. */
export async function fetchAllAspirations(userId: string | null): Promise<Aspiration[]> {
  const sb = getSupabase(userId);

  if (sb && userId) {
    try {
      const result = await getAllAspirations(sb, userId);
      if (result.length > 0) return result;
    } catch { /* fallback */ }
  }

  try {
    const saved = localStorage.getItem("huma-v2-aspirations");
    if (saved) return JSON.parse(saved);
  } catch { /* fresh */ }

  return [];
}

/** Known context (operator profile, archetypes, etc.). */
export async function fetchKnownContext(userId: string | null): Promise<Record<string, unknown>> {
  const sb = getSupabase(userId);

  if (sb && userId) {
    try {
      const ctx = await getKnownContext(sb, userId);
      if (Object.keys(ctx).length > 0) return ctx;
    } catch { /* fallback */ }
  }

  try {
    const saved = localStorage.getItem("huma-v2-known-context");
    if (saved) return JSON.parse(saved);
  } catch { /* fresh */ }

  return {};
}

/** Undelivered insight. */
export async function fetchUndeliveredInsight(userId: string | null): Promise<Insight | null> {
  const sb = getSupabase(userId);

  if (sb && userId) {
    try {
      const existing = await getUndeliveredInsight(sb, userId);
      if (existing) return existing;
    } catch { /* fallback */ }
  }

  try {
    const saved = localStorage.getItem("huma-v2-pending-insight");
    if (saved) return JSON.parse(saved);
  } catch { /* fresh */ }

  return null;
}

/** Today's checked entries from sheet_entries + localStorage. */
export async function fetchCheckedEntries(
  userId: string,
  date: string,
): Promise<{ checked: Set<string>; standaloneEntries: Array<{ behavior_text: string; dimensions?: string[] }> }> {
  const checked = new Set<string>();
  let standaloneEntries: Array<{ behavior_text: string; dimensions?: string[] }> = [];

  const sb = getSupabase(userId);

  if (sb) {
    try {
      const { data: todayEntries } = await sb
        .from("sheet_entries")
        .select("aspiration_id, behavior_text, checked")
        .eq("user_id", userId)
        .eq("date", date)
        .eq("checked", true);

      if (todayEntries) {
        for (const entry of todayEntries) {
          if (entry.aspiration_id && entry.behavior_text) {
            checked.add(`${entry.aspiration_id}:${entry.behavior_text}`);
          }
        }
      }
    } catch { /* non-critical */ }

    try {
      const { data: standalone } = await sb
        .from("sheet_entries")
        .select("behavior_text, detail, checked")
        .eq("user_id", userId)
        .eq("date", date)
        .is("aspiration_id", null);

      if (standalone && standalone.length > 0) {
        standaloneEntries = standalone.map(s => ({
          behavior_text: s.behavior_text,
          dimensions: (s.detail as Record<string, unknown>)?.dimensions as string[] || [],
        }));
        for (const s of standalone) {
          if (s.checked) {
            checked.add(`:${s.behavior_text}`);
          }
        }
      }
    } catch { /* non-critical */ }
  }

  // Also check localStorage
  try {
    const cached = localStorage.getItem(`huma-v2-sheet-${date}`);
    if (cached) {
      const entries = JSON.parse(cached);
      for (const e of entries) {
        if (e.checked && e.behaviorText) {
          const key = `${e.aspirationId || ""}:${e.behaviorText}`;
          checked.add(key);
        }
      }
    }
  } catch { /* skip */ }

  return { checked, standaloneEntries };
}

/** Week behavior counts. */
export async function fetchWeekCounts(userId: string): Promise<Record<string, { completed: number; total: number }>> {
  const sb = getSupabase(userId);
  if (!sb) return {};
  try {
    return await getBehaviorWeekCounts(sb, userId);
  } catch {
    return {};
  }
}

/** 30-day counts per aspiration. */
export async function fetchThirtyDayCounts(
  userId: string,
  aspirations: Aspiration[],
): Promise<Record<string, number>> {
  const sb = getSupabase(userId);
  if (!sb || aspirations.length === 0) return {};

  try {
    const thirtyDaysAgo = getLocalDateOffset(30);
    const { data: logData } = await sb
      .from("behavior_log")
      .select("behavior_key, completed")
      .eq("user_id", userId)
      .gte("date", thirtyDaysAgo)
      .eq("completed", true);

    if (!logData) return {};

    const counts: Record<string, number> = {};
    for (const row of logData) {
      for (const asp of aspirations) {
        for (const b of asp.behaviors) {
          if (b.key === row.behavior_key || b.text === row.behavior_key) {
            counts[asp.id] = (counts[asp.id] || 0) + 1;
          }
        }
      }
    }
    return counts;
  } catch {
    return {};
  }
}

/** Day-of-week rhythm + disruption detection. */
export async function fetchRhythmData(
  userId: string,
  aspirations: Aspiration[],
  dayCount: number,
): Promise<{ rhythm: Record<string, Record<number, number>>; disruptions: Record<string, string | null> }> {
  if (aspirations.length === 0 || dayCount < 7) {
    return { rhythm: {}, disruptions: {} };
  }

  const sb = getSupabase(userId);
  if (!sb) return { rhythm: {}, disruptions: {} };

  try {
    const rhythmResults: Record<string, Record<number, number>> = {};
    const disruptionResults: Record<string, string | null> = {};

    await Promise.all(aspirations.map(async (asp) => {
      const [dowCounts, last7, last3] = await Promise.all([
        getBehaviorDayOfWeekCounts(sb, userId, asp.id),
        getRecentCompletionDays(sb, userId, asp.id, 7),
        getRecentCompletionDays(sb, userId, asp.id, 3),
      ]);
      rhythmResults[asp.id] = dowCounts;
      disruptionResults[asp.id] = (last7 >= 4 && last3 === 0)
        ? "3 days since last \u2014 what changed?"
        : null;
    }));

    return { rhythm: rhythmResults, disruptions: disruptionResults };
  } catch {
    return { rhythm: {}, disruptions: {} };
  }
}

/** Patterns with localStorage fallback + auto-extraction from aspirations. */
export async function fetchPatterns(
  userId: string | null,
): Promise<{ patterns: Pattern[]; aspirations: Aspiration[] }> {
  let loadedPatterns: Pattern[] = [];
  let loadedAspirations: Aspiration[] = [];
  const sb = getSupabase(userId);

  // Load patterns
  if (sb && userId) {
    try {
      loadedPatterns = await getPatterns(sb, userId);
    } catch { /* fallback */ }
  }
  if (loadedPatterns.length === 0) {
    try {
      const saved = localStorage.getItem("huma-v2-patterns");
      if (saved) loadedPatterns = JSON.parse(saved);
    } catch { /* fresh */ }
  }

  // Load aspirations (needed for context + pattern extraction)
  if (sb && userId) {
    try {
      loadedAspirations = await getAspirations(sb, userId);
    } catch { /* fallback */ }
  }
  if (loadedAspirations.length === 0) {
    try {
      const saved = localStorage.getItem("huma-v2-aspirations");
      if (saved) loadedAspirations = JSON.parse(saved);
    } catch { /* fresh */ }
  }

  // Extract patterns from aspirations if none exist
  if (loadedPatterns.length === 0 && loadedAspirations.length > 0) {
    loadedPatterns = extractPatternsFromAspirations(loadedAspirations);
  }

  return { patterns: loadedPatterns, aspirations: loadedAspirations };
}

/** Pattern sparklines. */
export async function fetchSparklines(
  userId: string,
  patterns: Pattern[],
): Promise<Map<string, SparklineData>> {
  if (patterns.length === 0) return new Map();
  const sb = getSupabase(userId);
  if (!sb) return new Map();

  try {
    const data = await getPatternSparklines(sb, userId, patterns);
    const map = new Map<string, SparklineData>();
    for (const s of data) map.set(s.patternId, s);
    return map;
  } catch {
    return new Map();
  }
}

/** Emerging behaviors. */
export async function fetchEmergingBehaviors(
  userId: string,
  patterns: Pattern[],
  aspirations: Aspiration[],
): Promise<EmergingBehavior[]> {
  const sb = getSupabase(userId);
  if (!sb) return [];

  try {
    const emerging = await detectEmergingBehaviors(sb, userId, patterns, aspirations);
    let dismissed: string[] = [];
    try {
      const saved = localStorage.getItem("huma-v2-dismissed-emergences");
      if (saved) dismissed = JSON.parse(saved);
    } catch { /* fresh */ }
    return emerging.filter(b => !dismissed.includes(b.behaviorKey));
  } catch {
    return [];
  }
}

/** Monthly review data. */
export async function fetchMonthlyReview(
  userId: string,
  aspirations: Aspiration[],
): Promise<MonthlyReviewData | null> {
  const sb = getSupabase(userId);
  if (!sb) return null;
  try {
    return await getMonthlyReviewData(sb, userId, aspirations);
  } catch {
    return null;
  }
}

/** WHY statement + date. */
export async function fetchWhyStatement(userId: string): Promise<{ whyStatement: string | null; whyDate: string | null }> {
  const sb = getSupabase(userId);
  if (!sb) return { whyStatement: null, whyDate: null };
  try {
    return await getWhyStatement(sb, userId);
  } catch {
    return { whyStatement: null, whyDate: null };
  }
}

/** Principles. */
export async function fetchPrinciples(userId: string): Promise<Principle[]> {
  const sb = getSupabase(userId);
  if (!sb) return [];
  try {
    return await getPrinciples(sb, userId);
  } catch {
    return [];
  }
}

/** Aspiration correlations. */
export async function fetchCorrelations(userId: string): Promise<AspirationCorrelation[]> {
  const sb = getSupabase(userId);
  if (!sb) return [];
  try {
    return await getAspirationCorrelations(sb, userId);
  } catch {
    return [];
  }
}

/** Recent insights for annotations. */
export async function fetchRecentInsights(userId: string, count: number = 3) {
  const sb = getSupabase(userId);
  if (!sb) return [];
  try {
    return await getRecentInsights(sb, userId, count);
  } catch {
    return [];
  }
}
