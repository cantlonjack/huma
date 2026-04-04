import type { SupabaseClient } from "@supabase/supabase-js";
import type { Aspiration, TransitionSignal, DimensionKey } from "@/types/v2";
import { getLocalDateOffset } from "@/lib/date-utils";

// ─── Life Stage Transition Detection ────────────────────────────────────────
//
// Detects when an operator's life context has shifted significantly by
// comparing two 14-day windows of behavioral data. When 2+ aspirations
// show simultaneous decline (>20pp drop), something structural changed.
//
// This is NOT about individual pattern drops (that's the "something changed?"
// flow on Grow). This is about systemic decline — multiple parts of life
// sliding at once, which signals a life stage transition.

const WINDOW_DAYS = 14;
const MIN_DROP_PERCENTAGE = 20;         // 20 percentage points
const MIN_ASPIRATIONS_DECLINING = 2;    // At least 2 must be declining together
const COOLDOWN_DAYS = 14;               // Don't re-fire within 14 days of dismissal

interface AspirationCompletionWindow {
  aspirationId: string;
  aspirationName: string;
  behaviorKeys: string[];
  recentRate: number;     // 0–100, last 14 days
  previousRate: number;   // 0–100, 14 days before that
}

/**
 * Query behavior_log for a date range and compute per-aspiration completion rates.
 * Uses behavior_key matching against aspiration.behaviors to group.
 */
async function getAspirationRates(
  supabase: SupabaseClient,
  userId: string,
  aspirations: Aspiration[],
  startDate: string,
  endDate: string,
): Promise<Map<string, number>> {
  // Collect all behavior keys across aspirations
  const allKeys = aspirations.flatMap(a =>
    a.behaviors.map(b => b.key)
  );

  if (allKeys.length === 0) return new Map();

  const { data } = await supabase
    .from("behavior_log")
    .select("behavior_key, completed, date")
    .eq("user_id", userId)
    .in("behavior_key", allKeys)
    .gte("date", startDate)
    .lte("date", endDate);

  if (!data || data.length === 0) return new Map();

  // Build per-behavior completion counts
  const behaviorCounts: Record<string, { completed: number; total: number }> = {};
  for (const row of data) {
    const key = row.behavior_key;
    if (!behaviorCounts[key]) behaviorCounts[key] = { completed: 0, total: 0 };
    behaviorCounts[key].total++;
    if (row.completed) behaviorCounts[key].completed++;
  }

  // Aggregate per aspiration
  const rates = new Map<string, number>();
  for (const asp of aspirations) {
    const keys = asp.behaviors.map(b => b.key);
    let totalCompleted = 0;
    let totalEntries = 0;

    for (const k of keys) {
      const c = behaviorCounts[k];
      if (c) {
        totalCompleted += c.completed;
        totalEntries += c.total;
      }
    }

    // Rate as percentage; if no entries, treat as 0
    const rate = totalEntries > 0 ? Math.round((totalCompleted / totalEntries) * 100) : 0;
    rates.set(asp.id, rate);
  }

  return rates;
}

/**
 * Detect life stage transition from behavioral data.
 *
 * Compares two consecutive 14-day windows:
 *   - "recent" = last 14 days
 *   - "previous" = 14–28 days ago
 *
 * If 2+ active aspirations dropped 20+ percentage points simultaneously,
 * a transition signal fires.
 *
 * Requires 28+ days of data (returns null otherwise).
 */
export async function detectTransition(
  supabase: SupabaseClient,
  userId: string,
  aspirations: Aspiration[],
  dayCount: number,
  dismissedAt?: string | null,
): Promise<TransitionSignal | null> {
  // Need 28+ days of data to compare two windows
  if (dayCount < 28) return null;

  // Only consider active aspirations with behaviors
  const active = aspirations.filter(
    a => a.status === "active" && a.behaviors.length > 0
  );
  if (active.length < 2) return null;

  // Cooldown check
  if (dismissedAt) {
    const dismissDate = new Date(dismissedAt);
    const daysSince = Math.floor(
      (Date.now() - dismissDate.getTime()) / 86400000
    );
    if (daysSince < COOLDOWN_DAYS) return null;
  }

  // Compute date ranges
  const recentEnd = getLocalDateOffset(0);    // today
  const recentStart = getLocalDateOffset(WINDOW_DAYS);
  const previousEnd = getLocalDateOffset(WINDOW_DAYS);
  const previousStart = getLocalDateOffset(WINDOW_DAYS * 2);

  // Get rates for both windows
  const [recentRates, previousRates] = await Promise.all([
    getAspirationRates(supabase, userId, active, recentStart, recentEnd),
    getAspirationRates(supabase, userId, active, previousStart, previousEnd),
  ]);

  // Compute declines
  const declining: TransitionSignal["decliningAspirations"] = [];
  const stable: TransitionSignal["stableAspirations"] = [];

  for (const asp of active) {
    const recent = recentRates.get(asp.id) ?? 0;
    const previous = previousRates.get(asp.id) ?? 0;
    const drop = previous - recent;

    if (drop >= MIN_DROP_PERCENTAGE && previous >= 30) {
      // Only flag if they were actually doing it before (>30%)
      declining.push({
        id: asp.id,
        name: asp.title || asp.clarifiedText || asp.rawText,
        completionRate: recent,
        previousRate: previous,
        drop,
      });
    } else {
      stable.push({
        id: asp.id,
        name: asp.title || asp.clarifiedText || asp.rawText,
        completionRate: recent,
      });
    }
  }

  // Need multiple aspirations declining simultaneously
  if (declining.length < MIN_ASPIRATIONS_DECLINING) return null;

  return {
    detected: true,
    severity: declining.length >= 3 ? "significant" : "gentle",
    decliningAspirations: declining,
    stableAspirations: stable,
  };
}
