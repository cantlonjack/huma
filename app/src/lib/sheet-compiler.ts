/**
 * Client-side helper to assemble enriched context and call /api/sheet.
 * Gathers known_context, day-of-week, season, recent check-off history,
 * conversation messages, archetypes, and WHY — then POSTs to the sheet API.
 */

import type { Aspiration, KnownContext, SheetCompileRequest, SheetEntry } from "@/types/v2";
import { getEffectiveDimensions } from "@/types/v2";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getLocalDate } from "@/lib/date-utils";
import {
  getKnownContext,
  getRecentSheetHistory,
  getChatMessages,
} from "@/lib/supabase-v2";

// ─── Season (client-side, mirrors server implementation) ──────────────────

function getSeason(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const month = d.getMonth();
  const day = d.getDate();

  type SeasonName = "spring" | "summer" | "autumn" | "winter";
  let season: SeasonName;
  let dayInSeason: number;
  let seasonLength: number;

  if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day <= 20)) {
    season = "spring";
    const start = new Date(d.getFullYear(), 2, 20);
    dayInSeason = Math.floor((d.getTime() - start.getTime()) / 86400000);
    seasonLength = 93;
  } else if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day <= 22)) {
    season = "summer";
    const start = new Date(d.getFullYear(), 5, 21);
    dayInSeason = Math.floor((d.getTime() - start.getTime()) / 86400000);
    seasonLength = 94;
  } else if ((month === 8 && day >= 23) || month === 9 || month === 10 || (month === 11 && day <= 20)) {
    season = "autumn";
    const start = new Date(d.getFullYear(), 8, 23);
    dayInSeason = Math.floor((d.getTime() - start.getTime()) / 86400000);
    seasonLength = 89;
  } else {
    season = "winter";
    const start = month === 11 ? new Date(d.getFullYear(), 11, 21) : new Date(d.getFullYear() - 1, 11, 21);
    dayInSeason = Math.floor((d.getTime() - start.getTime()) / 86400000);
    seasonLength = 89;
  }

  const fraction = dayInSeason / seasonLength;
  const qualifier = fraction < 0.33 ? "early" : fraction < 0.66 ? "mid" : "late";
  return `${qualifier} ${season}`;
}

// ─── Day count ────────────────────────────────────────────────────────────

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

// ─── Main compiler ────────────────────────────────────────────────────────

export interface CompileSheetOptions {
  aspirations: Aspiration[];
  supabase: SupabaseClient | null;
  userId: string | null;
  name?: string;
  archetypes?: string[];
  whyStatement?: string;
}

export interface CompiledSheet {
  entries: SheetEntry[];
  throughLine: string | null;
  date: string;
  compiledOffline?: boolean;
}

export async function compileSheet(
  options: CompileSheetOptions
): Promise<CompiledSheet> {
  const { aspirations, supabase, userId, name, archetypes, whyStatement } = options;
  const date = getLocalDate();
  const dayOfWeek = new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" });
  const season = getSeason(date);
  const dayCount = getDayCount();

  // ─── Gather known context ───────────────────────────────────────────────
  let knownContext: KnownContext = {};
  if (supabase && userId) {
    try {
      knownContext = await getKnownContext(supabase, userId);
    } catch { /* fall through to localStorage */ }
  }
  if (Object.keys(knownContext).length === 0) {
    try {
      const local = localStorage.getItem("huma-v2-known-context");
      if (local) knownContext = JSON.parse(local);
    } catch { /* empty context */ }
  }

  // ─── Gather recent check-off history (7 days) ──────────────────────────
  let recentHistory: Array<{ date: string; behaviorKey: string; checked: boolean }> = [];
  if (supabase && userId) {
    try {
      recentHistory = await getRecentSheetHistory(supabase, userId, 7);
    } catch { /* no history */ }
  }

  // ─── Gather recent conversation messages (last 20) ─────────────────────
  let conversationMessages: Array<{ role: string; content: string }> = [];
  if (supabase && userId) {
    try {
      const msgs = await getChatMessages(supabase, userId);
      conversationMessages = msgs.slice(-20).map(m => ({
        role: m.role,
        content: m.content,
      }));
    } catch { /* no messages */ }
  }
  if (conversationMessages.length === 0) {
    try {
      const local = localStorage.getItem("huma-v2-start-messages");
      if (local) {
        const parsed = JSON.parse(local) as Array<{ role: string; content: string }>;
        conversationMessages = parsed.slice(-20).map(m => ({
          role: m.role,
          content: m.content,
        }));
      }
    } catch { /* no messages */ }
  }

  // ─── Shape aspirations for the API ─────────────────────────────────────
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
        days: b.days,
        detail: b.detail,
        enabled: b.enabled,
        // Use dimension overrides when the user has corrected them
        dimensions: getEffectiveDimensions(b).map(d => d.dimension),
      })),
    }));

  // ─── Build request ─────────────────────────────────────────────────────
  const body: SheetCompileRequest = {
    name: name || "there",
    date,
    aspirations: activeAspirations,
    knownContext,
    recentHistory,
    conversationMessages,
    dayOfWeek,
    season,
    dayCount,
    archetypes,
    whyStatement,
  };

  try {
    const res = await fetch("/api/sheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`Sheet compilation failed: ${res.status}`);

    const data = await res.json();
    // Hard cap: maximum 5 entries (server enforces too, but belt-and-suspenders)
    const rawEntries = ((data.entries || []) as Array<Record<string, unknown>>).slice(0, 5);
    const entries: SheetEntry[] = rawEntries.map((e) => ({
      id: (e.behavior_key as string) || `entry-${date}`,
      aspirationId: (e.aspiration_id as string) || "",
      behaviorKey: (e.behavior_key as string) || "",
      behaviorText: (e.headline as string) || "",
      headline: (e.headline as string) || undefined,
      detail: (e.detail as string) || "",
      timeOfDay: ((e.time_of_day as string) || "morning") as "morning" | "midday" | "evening",
      dimensions: (e.dimensions as string[]) || [],
      checked: false,
    }));
    return {
      entries,
      throughLine: data.through_line || null,
      date: data.date || date,
    };
  } catch {
    // ─── Offline fallback: compile from recent history ──────────────────
    return compileSheetOffline(aspirations, recentHistory, date);
  }
}

// ─── Offline sheet compilation ───────────────────────────────────────────────
// When the API is unavailable, build a sheet from yesterday's entries + aspiration
// behaviors. Sort by dimensional breadth, then unchecked streak. Cap at 5.

export function compileSheetOffline(
  aspirations: Aspiration[],
  recentHistory: Array<{ date: string; behaviorKey: string; checked: boolean }>,
  date: string,
): CompiledSheet {
  // Collect yesterday's sheet entries from localStorage
  const yesterday = new Date(date + "T12:00:00");
  yesterday.setDate(yesterday.getDate() - 1);
  const yDateStr = yesterday.toISOString().slice(0, 10);
  let prevEntries: SheetEntry[] = [];
  try {
    const raw = localStorage.getItem(`huma-v2-sheet-${yDateStr}`);
    if (raw) prevEntries = JSON.parse(raw);
  } catch { /* no cache */ }

  // Build a behavior lookup from active aspirations
  const behaviorMap = new Map<string, { text: string; aspirationId: string; dimensions: string[] }>();
  for (const a of aspirations.filter(a => a.status === "active" && a.stage === "active")) {
    for (const b of a.behaviors.filter(b => b.enabled !== false)) {
      behaviorMap.set(b.key, {
        text: b.text,
        aspirationId: a.id,
        dimensions: getEffectiveDimensions(b).map(d => d.dimension),
      });
    }
  }

  // Build unchecked-streak map from recent history
  const streakMap = new Map<string, number>();
  const sortedDates = [...new Set(recentHistory.map(h => h.date))].sort().reverse();
  for (const bKey of behaviorMap.keys()) {
    let streak = 0;
    for (const d of sortedDates) {
      const entry = recentHistory.find(h => h.date === d && h.behaviorKey === bKey);
      if (entry && !entry.checked) streak++;
      else break;
    }
    streakMap.set(bKey, streak);
  }

  // Candidate pool: unchecked entries from yesterday + behaviors not shown yesterday
  const yesterdayKeys = new Set(prevEntries.map(e => e.behaviorKey));
  const candidates: Array<{ key: string; text: string; aspirationId: string; dimensions: string[]; streak: number }> = [];

  // Unchecked items from yesterday
  for (const e of prevEntries.filter(e => !e.checked)) {
    candidates.push({
      key: e.behaviorKey,
      text: e.behaviorText,
      aspirationId: e.aspirationId,
      dimensions: e.dimensions || [],
      streak: streakMap.get(e.behaviorKey) ?? 0,
    });
  }

  // Behaviors not shown yesterday
  for (const [key, info] of behaviorMap) {
    if (!yesterdayKeys.has(key)) {
      candidates.push({
        key,
        text: info.text,
        aspirationId: info.aspirationId,
        dimensions: info.dimensions,
        streak: streakMap.get(key) ?? 0,
      });
    }
  }

  // Sort: most dimensions first, then highest unchecked streak
  candidates.sort((a, b) => b.dimensions.length - a.dimensions.length || b.streak - a.streak);

  const entries: SheetEntry[] = candidates.slice(0, 5).map(c => ({
    id: c.key,
    aspirationId: c.aspirationId,
    behaviorKey: c.key,
    behaviorText: c.text,
    detail: "",
    timeOfDay: "morning" as const,
    dimensions: c.dimensions,
    checked: false,
  }));

  return { entries, throughLine: null, date, compiledOffline: true };
}
