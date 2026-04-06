/**
 * Client-side helper to gather context and fetch proactive nudges from /api/nudge.
 * Called once when Today loads (after sheet compilation). Results are cached per day.
 */

import type { Aspiration, KnownContext, Nudge } from "@/types/v2";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getLocalDate } from "@/lib/date-utils";
import { getKnownContext, getRecentSheetHistory } from "@/lib/supabase-v2";

// ─── Season (mirrors sheet-compiler) ───────────────────────────────────────

function getSeason(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const month = d.getMonth();
  const day = d.getDate();

  type SeasonName = "spring" | "summer" | "autumn" | "winter";
  let season: SeasonName;
  let dayInSeason: number;
  let seasonLength: number;

  if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day <= 20)) {
    season = "spring"; dayInSeason = Math.floor((d.getTime() - new Date(d.getFullYear(), 2, 20).getTime()) / 86400000); seasonLength = 93;
  } else if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day <= 22)) {
    season = "summer"; dayInSeason = Math.floor((d.getTime() - new Date(d.getFullYear(), 5, 21).getTime()) / 86400000); seasonLength = 94;
  } else if ((month === 8 && day >= 23) || month === 9 || month === 10 || (month === 11 && day <= 20)) {
    season = "autumn"; dayInSeason = Math.floor((d.getTime() - new Date(d.getFullYear(), 8, 23).getTime()) / 86400000); seasonLength = 89;
  } else {
    season = "winter"; const start = month === 11 ? new Date(d.getFullYear(), 11, 21) : new Date(d.getFullYear() - 1, 11, 21);
    dayInSeason = Math.floor((d.getTime() - start.getTime()) / 86400000); seasonLength = 89;
  }

  const fraction = dayInSeason / seasonLength;
  const qualifier = fraction < 0.33 ? "early" : fraction < 0.66 ? "mid" : "late";
  return `${qualifier} ${season}`;
}

function getDayCount(): number {
  try {
    const start = localStorage.getItem("huma-v2-start-date");
    if (start) {
      const diff = Math.ceil((Date.now() - new Date(start).getTime()) / 86400000);
      return diff > 0 ? diff : 1;
    }
  } catch { /* fresh */ }
  return 1;
}

// ─── Fetch Nudges ─────────────────────────────────────────────────────────

export interface FetchNudgesOptions {
  aspirations: Aspiration[];
  supabase: SupabaseClient | null;
  userId: string | null;
  name?: string;
  checkedToday?: string[];
}

export async function fetchNudges(options: FetchNudgesOptions): Promise<Nudge[]> {
  const { aspirations, supabase, userId, name, checkedToday = [] } = options;
  const date = getLocalDate();
  const season = getSeason(date);
  const dayCount = getDayCount();

  // Gather known context
  let knownContext: KnownContext = {};
  if (supabase && userId) {
    try {
      knownContext = await getKnownContext(supabase, userId);
    } catch { /* fall through */ }
  }
  if (Object.keys(knownContext).length === 0) {
    try {
      const local = localStorage.getItem("huma-v2-known-context");
      if (local) knownContext = JSON.parse(local);
    } catch { /* empty */ }
  }

  // Gather recent history
  let recentHistory: Array<{ date: string; behaviorKey: string; checked: boolean }> = [];
  if (supabase && userId) {
    try {
      recentHistory = await getRecentSheetHistory(supabase, userId, 7);
    } catch { /* no history */ }
  }

  // Get dismissed nudge IDs from localStorage
  const dismissedNudgeIds = getDismissedNudgeIds(date);

  // Shape aspirations
  const activeAspirations = aspirations
    .filter(a => a.status === "active" && a.stage === "active")
    .map(a => ({
      id: a.id,
      rawText: a.rawText,
      clarifiedText: a.clarifiedText,
      behaviors: a.behaviors.map(b => ({
        key: b.key,
        text: b.text,
        frequency: b.frequency,
      })),
    }));

  const res = await fetch("/api/nudge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name || "there",
      date,
      knownContext,
      aspirations: activeAspirations,
      recentHistory,
      dayCount,
      season,
      checkedToday,
      dismissedNudgeIds,
    }),
  });

  if (!res.ok) return [];

  const data = await res.json();
  return (data.nudges || []) as Nudge[];
}

// ─── Dismissal persistence ────────────────────────────────────────────────
// Dismissed nudge IDs are stored per-day in localStorage.

const DISMISS_KEY_PREFIX = "huma-v2-nudge-dismissed-";

export function getDismissedNudgeIds(date: string): string[] {
  try {
    const raw = localStorage.getItem(`${DISMISS_KEY_PREFIX}${date}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function dismissNudge(date: string, nudgeId: string): void {
  const existing = getDismissedNudgeIds(date);
  if (!existing.includes(nudgeId)) {
    existing.push(nudgeId);
    localStorage.setItem(`${DISMISS_KEY_PREFIX}${date}`, JSON.stringify(existing));
  }
}
