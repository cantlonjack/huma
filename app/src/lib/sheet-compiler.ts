/**
 * Client-side helper to assemble enriched context and call /api/sheet.
 * Gathers known_context, day-of-week, season, recent check-off history,
 * conversation messages, archetypes, and WHY — then POSTs to the sheet API.
 */

import type { Aspiration, KnownContext, SheetCompileRequest, SheetEntry } from "@/types/v2";
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

export async function compileSheet(
  options: CompileSheetOptions
): Promise<{ entries: SheetEntry[]; date: string }> {
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

  const res = await fetch("/api/sheet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Sheet compilation failed: ${res.status}`);
  }

  return res.json();
}
