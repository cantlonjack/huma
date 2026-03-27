"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { SheetEntry, Aspiration } from "@/types/v2";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import {
  getAspirations,
  getSheetEntries,
  saveSheetEntries,
  updateSheetEntryCheck,
  getRecentSheetHistory,
  getKnownContext,
} from "@/lib/supabase-v2";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/**
 * Collect recent check-off history from localStorage (last 7 days).
 */
function getLocalRecentHistory(): Array<{ date: string; behaviorKey: string; checked: boolean }> {
  const history: Array<{ date: string; behaviorKey: string; checked: boolean }> = [];
  const today = new Date();

  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const cacheKey = `huma-v2-sheet-${dateStr}`;

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const entries: SheetEntry[] = JSON.parse(cached);
        for (const entry of entries) {
          history.push({
            date: dateStr,
            behaviorKey: entry.behaviorKey,
            checked: entry.checked,
          });
        }
      }
    } catch { /* skip corrupt entries */ }
  }

  return history;
}

/**
 * Build a fallback sheet from raw behaviors when API fails.
 */
function buildFallbackSheet(aspirations: Aspiration[]): SheetEntry[] {
  const dayOfWeek = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const entries: SheetEntry[] = [];

  for (const aspiration of aspirations) {
    for (const behavior of aspiration.behaviors) {
      let includeToday = false;
      if (behavior.frequency === "daily") {
        includeToday = true;
      } else if (behavior.frequency === "weekly") {
        includeToday = true;
      } else if (behavior.frequency === "specific-days" && behavior.days) {
        includeToday = behavior.days.some(d => d.toLowerCase() === dayOfWeek);
      }

      if (includeToday) {
        entries.push({
          id: crypto.randomUUID(),
          aspirationId: aspiration.id,
          behaviorKey: behavior.key,
          behaviorText: behavior.text,
          detail: { text: behavior.detail || "" },
          timeOfDay: "morning",
          checked: false,
        });
      }
    }
  }

  return entries;
}

function SheetCard({
  entry,
  onToggle,
}: {
  entry: SheetEntry;
  onToggle: () => void;
}) {
  const detailText = typeof entry.detail === "string"
    ? entry.detail
    : (entry.detail as Record<string, unknown>)?.text as string || "";

  return (
    <div
      className={`bg-white rounded-xl border border-sand-200 overflow-hidden transition-all duration-300 ${
        entry.checked ? "opacity-70" : ""
      }`}
      style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
    >
      <div className="flex items-start gap-4 p-4">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className="mt-0.5 flex-shrink-0 cursor-pointer"
          aria-label={entry.checked ? "Mark as not done" : "Mark as done"}
        >
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              entry.checked
                ? "bg-sage-500 border-sage-500"
                : "border-earth-300 hover:border-sage-400"
            }`}
            style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
          >
            {entry.checked && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </button>

        {/* Content — headline + detail always visible */}
        <div className="flex-1 min-w-0">
          <p className="font-sans text-base text-earth-700 font-medium leading-relaxed">
            {entry.behaviorText}
          </p>
          {detailText && (
            <p className="font-sans text-sm text-earth-400 leading-relaxed mt-1.5">
              {detailText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function YesterdaySection({ userId }: { userId: string | null }) {
  const [entries, setEntries] = useState<SheetEntry[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function loadYesterday() {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split("T")[0];

      if (userId) {
        const supabase = createClient();
        if (supabase) {
          try {
            const dbEntries = await getSheetEntries(supabase, userId, dateStr);
            if (dbEntries.length > 0) {
              setEntries(dbEntries);
              return;
            }
          } catch { /* fall through to localStorage */ }
        }
      }

      // Fallback to localStorage
      try {
        const cached = localStorage.getItem(`huma-v2-sheet-${dateStr}`);
        if (cached) setEntries(JSON.parse(cached));
      } catch { /* no yesterday data */ }
    }

    loadYesterday();
  }, [userId]);

  if (entries.length === 0) return null;

  const checkedCount = entries.filter(e => e.checked).length;

  return (
    <div className="mt-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="font-sans text-sm text-earth-400 hover:text-earth-500 transition-colors duration-200 cursor-pointer"
      >
        Yesterday {checkedCount > 0 && `· ${checkedCount}/${entries.length}`} {expanded ? "↑" : "↓"}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 opacity-60">
          {entries.map(entry => {
            const detailText = typeof entry.detail === "string"
              ? entry.detail
              : (entry.detail as Record<string, unknown>)?.text as string || "";

            return (
              <div key={entry.id} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white border border-sand-200">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  entry.checked ? "bg-sage-500 border-sage-500" : "border-earth-300"
                }`}>
                  {entry.checked && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-sans text-sm text-earth-600">{entry.behaviorText}</p>
                  {detailText && (
                    <p className="font-sans text-xs text-earth-400 mt-0.5">{detailText}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TodayPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<SheetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [date] = useState(() => new Date().toISOString().split("T")[0]);
  const [isFallback, setIsFallback] = useState(false);
  const compilingRef = useRef(false);

  const compileSheet = useCallback(async () => {
    // Prevent concurrent compilations (race from useEffect re-fires)
    if (compilingRef.current) return;
    compilingRef.current = true;
    setLoading(true);

    const supabase = user ? createClient() : null;

    // 1. Check if Supabase already has today's entries
    if (supabase && user) {
      try {
        const dbEntries = await getSheetEntries(supabase, user.id, date);
        if (dbEntries.length > 0) {
          const order = { morning: 0, afternoon: 1, evening: 2 };
          dbEntries.sort((a, b) => order[a.timeOfDay] - order[b.timeOfDay]);
          setEntries(dbEntries);
          setLoading(false);
          return;
        }
      } catch { /* fall through to compile */ }
    }

    // 2. Check localStorage cache
    const cacheKey = `huma-v2-sheet-${date}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setEntries(JSON.parse(cached));
        setLoading(false);
        return;
      } catch { /* recompile */ }
    }

    // 3. Load aspirations, context, and conversation history
    let aspirations: Aspiration[] = [];
    let knownContext: Record<string, unknown> = {};
    let recentHistory: Array<{ date: string; behaviorKey: string; checked: boolean }> = [];
    let conversationMessages: Array<{ role: string; content: string }> = [];

    if (supabase && user) {
      try {
        const [dbAspirations, dbContext, dbHistory, dbMessages] = await Promise.all([
          getAspirations(supabase, user.id),
          getKnownContext(supabase, user.id),
          getRecentSheetHistory(supabase, user.id),
          import("@/lib/supabase-v2").then(m => m.getChatMessages(supabase!, user!.id)),
        ]);
        aspirations = dbAspirations;
        knownContext = dbContext;
        recentHistory = dbHistory;
        conversationMessages = dbMessages.map(m => ({ role: m.role, content: m.content }));
      } catch {
        // Fall back to localStorage
      }
    }

    if (aspirations.length === 0) {
      try {
        const savedAspirations = localStorage.getItem("huma-v2-aspirations");
        if (savedAspirations) aspirations = JSON.parse(savedAspirations);
        const savedContext = localStorage.getItem("huma-v2-known-context");
        if (savedContext) knownContext = JSON.parse(savedContext);
      } catch { /* fresh */ }
    }

    // Load conversation from localStorage if not loaded from Supabase
    if (conversationMessages.length === 0) {
      try {
        const startMsgs = localStorage.getItem("huma-v2-start-messages");
        const chatMsgs = localStorage.getItem("huma-v2-chat-messages");
        const raw = startMsgs || chatMsgs;
        if (raw) {
          const parsed = JSON.parse(raw) as Array<{ role: string; content: string }>;
          conversationMessages = parsed.map(m => ({ role: m.role, content: m.content }));
        }
      } catch { /* fresh */ }
    }

    if (recentHistory.length === 0) {
      recentHistory = getLocalRecentHistory();
    }

    if (aspirations.length === 0) {
      setLoading(false);
      return;
    }

    // 4. Compile via API
    try {
      const res = await fetch("/api/sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: knownContext.name || "",
          aspirations,
          knownContext,
          recentHistory,
          conversationMessages,
          date,
        }),
      });

      if (!res.ok) throw new Error(`Sheet API returned ${res.status}`);

      const data = await res.json();
      const compiled: SheetEntry[] = (data.entries || []).map(
        (e: Record<string, string>, i: number) => ({
          id: crypto.randomUUID(),
          aspirationId: e.aspiration_id || "",
          behaviorKey: e.behavior_key || `behavior-${i}`,
          behaviorText: e.text || "",
          detail: { text: e.detail || "" },
          timeOfDay: e.time_of_day || "morning",
          checked: false,
        })
      );

      if (compiled.length === 0) {
        const fallback = buildFallbackSheet(aspirations);
        setEntries(fallback);
        setIsFallback(true);
        localStorage.setItem(cacheKey, JSON.stringify(fallback));
      } else {
        const order = { morning: 0, afternoon: 1, evening: 2 };
        compiled.sort((a, b) => order[a.timeOfDay] - order[b.timeOfDay]);
        setEntries(compiled);
        localStorage.setItem(cacheKey, JSON.stringify(compiled));

        // Persist to Supabase if authed
        if (supabase && user) {
          try {
            await saveSheetEntries(supabase, user.id, compiled, date);
          } catch (err) {
            console.error("Failed to save sheet to Supabase:", err);
          }
        }
      }
    } catch (err) {
      console.error("Sheet compilation error:", err);
      const fallback = buildFallbackSheet(aspirations);
      setEntries(fallback);
      setIsFallback(true);
      localStorage.setItem(cacheKey, JSON.stringify(fallback));
    } finally {
      setLoading(false);
      compilingRef.current = false;
    }
  }, [date, user]);

  useEffect(() => {
    compileSheet();
  }, [compileSheet]);

  // Check for insight opportunity (5+ days of cross-aspiration data)
  useEffect(() => {
    async function checkInsight() {
      if (localStorage.getItem("huma-v2-pending-insight")) return;

      let history: Array<{ date: string; behaviorKey: string; checked: boolean }> = [];
      let aspirations: Aspiration[] = [];

      if (user) {
        const supabase = createClient();
        if (supabase) {
          try {
            history = await getRecentSheetHistory(supabase, user.id, 14);
            aspirations = await getAspirations(supabase, user.id);
          } catch { /* fall through */ }
        }
      }

      if (history.length === 0) {
        history = getLocalRecentHistory();
      }
      if (aspirations.length === 0) {
        try {
          const saved = localStorage.getItem("huma-v2-aspirations");
          if (saved) aspirations = JSON.parse(saved);
        } catch { return; }
      }

      if (history.length === 0) return;
      const uniqueDates = new Set(history.map(h => h.date));
      if (uniqueDates.size < 5) return;
      if (aspirations.length < 2) return;

      const behaviorMeta = aspirations.flatMap(a =>
        a.behaviors.map(b => ({
          key: b.key,
          text: b.text,
          aspirationId: a.id,
          aspirationText: a.clarifiedText || a.rawText,
          dimensions: (b.dimensions || []).map((d: { dimension: string }) => d.dimension),
        }))
      );

      const entries = history.map(h => ({
        date: h.date,
        behaviorKey: h.behaviorKey,
        aspirationId: aspirations.find(a => a.behaviors.some(b => b.key === h.behaviorKey))?.id || "",
        checked: h.checked,
      }));

      try {
        const res = await fetch("/api/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries, behaviorMeta }),
        });
        const data = await res.json();
        if (data.insight) {
          localStorage.setItem("huma-v2-pending-insight", JSON.stringify(data.insight));
        }
      } catch { /* non-critical */ }
    }

    checkInsight();
  }, [user]);

  // Persist check-off state (localStorage + Supabase)
  const toggleEntry = (id: string) => {
    setEntries(prev => {
      const updated = prev.map(e =>
        e.id === id
          ? { ...e, checked: !e.checked, checkedAt: !e.checked ? new Date().toISOString() : undefined }
          : e
      );
      localStorage.setItem(`huma-v2-sheet-${date}`, JSON.stringify(updated));

      // Persist to Supabase
      if (user) {
        const entry = updated.find(e => e.id === id);
        if (entry) {
          const supabase = createClient();
          if (supabase) {
            updateSheetEntryCheck(supabase, id, user.id, entry.checked).catch(err => {
              console.error("Failed to persist check:", err);
            });
          }
        }
      }

      return updated;
    });
  };

  const allDone = entries.length > 0 && entries.every(e => e.checked);

  return (
    <div className="min-h-dvh bg-sand-50 flex flex-col">
      {/* Header — just the day */}
      <div className="px-6 pt-8 pb-6 text-center">
        <p className="font-serif text-xl text-earth-600">{formatDate(date)}</p>
      </div>

      {/* Sheet */}
      <div className="flex-1 px-6 pb-32">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-earth-300 rounded-full animate-pulse" />
              <span className="w-2 h-2 bg-earth-300 rounded-full animate-pulse [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-earth-300 rounded-full animate-pulse [animation-delay:300ms]" />
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="font-serif text-xl text-earth-500 mb-4">No sheet yet.</p>
            <p className="font-sans text-sm text-earth-400 mb-6">
              Tell HUMA what you&apos;re working on and your first production sheet will appear here.
            </p>
            <Link
              href="/start"
              className="px-6 py-3 bg-sage-700 text-white rounded-xl font-sans text-sm font-medium hover:bg-sage-800 transition-colors duration-200"
            >
              Talk to HUMA
            </Link>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl mx-auto">
            {isFallback && (
              <div className="flex items-center gap-3 mb-3">
                <p className="font-sans text-xs text-earth-400">
                  Showing your behaviors for today.
                </p>
                <button
                  onClick={() => {
                    // Clear cache to force recompile
                    localStorage.removeItem(`huma-v2-sheet-${date}`);
                    compilingRef.current = false;
                    setIsFallback(false);
                    compileSheet();
                  }}
                  className="font-sans text-xs text-sage-600 hover:text-sage-700 underline cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {entries.map(entry => (
              <SheetCard
                key={entry.id}
                entry={entry}
                onToggle={() => toggleEntry(entry.id)}
              />
            ))}

            {allDone && (
              <p
                className="text-center font-serif text-lg text-sage-600 mt-8 animate-fade-in"
              >
                Done for today. See you tomorrow.
              </p>
            )}

            {/* Yesterday link */}
            <YesterdaySection userId={user?.id || null} />
          </div>
        )}
      </div>

      {/* Talk to HUMA link */}
      {entries.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 text-center">
          <Link
            href="/chat"
            className="font-sans text-sm text-earth-400 hover:text-sage-600 transition-colors duration-200"
          >
            Talk to HUMA
          </Link>
        </div>
      )}
    </div>
  );
}
