"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { SheetEntry, Aspiration } from "@/types/v2";

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
function getRecentHistory(): Array<{ date: string; behaviorKey: string; checked: boolean }> {
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
      // Filter by frequency/day
      let includeToday = false;
      if (behavior.frequency === "daily") {
        includeToday = true;
      } else if (behavior.frequency === "weekly") {
        includeToday = true; // Show weekly items every day, let operator decide
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
  expanded,
  onExpand,
}: {
  entry: SheetEntry;
  onToggle: () => void;
  expanded: boolean;
  onExpand: () => void;
}) {
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

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-sans text-base text-earth-700 font-medium leading-relaxed">
            {entry.behaviorText}
          </p>
        </div>

        {/* Expand arrow */}
        {entry.detail && Object.keys(entry.detail).length > 0 && (
          <button
            onClick={onExpand}
            className="flex-shrink-0 mt-0.5 p-1 text-earth-300 hover:text-earth-500 transition-colors duration-200 cursor-pointer"
            aria-label="Show detail"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>

      {/* Expanded detail */}
      {expanded && entry.detail && (
        <div className="px-4 pb-4 pl-14">
          <p className="font-sans text-sm text-earth-400 leading-relaxed">
            {typeof entry.detail === "string" ? entry.detail : (entry.detail as Record<string, unknown>).text as string || JSON.stringify(entry.detail)}
          </p>
        </div>
      )}
    </div>
  );
}

export default function TodayPage() {
  const [entries, setEntries] = useState<SheetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [date] = useState(() => new Date().toISOString().split("T")[0]);
  const [isFallback, setIsFallback] = useState(false);

  const compileSheet = useCallback(async () => {
    setLoading(true);

    // Load aspirations from localStorage (pre-auth) or Supabase (post-auth)
    let aspirations: Aspiration[] = [];
    let knownContext: Record<string, unknown> = {};

    try {
      const savedAspirations = localStorage.getItem("huma-v2-aspirations");
      if (savedAspirations) aspirations = JSON.parse(savedAspirations);
      const savedContext = localStorage.getItem("huma-v2-known-context");
      if (savedContext) knownContext = JSON.parse(savedContext);
    } catch { /* fresh */ }

    if (aspirations.length === 0) {
      setLoading(false);
      return;
    }

    // Check if we already have today's sheet cached
    const cacheKey = `huma-v2-sheet-${date}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setEntries(JSON.parse(cached));
        setLoading(false);
        return;
      } catch { /* recompile */ }
    }

    // Collect recent history for the feedback loop
    const recentHistory = getRecentHistory();

    try {
      const res = await fetch("/api/sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: knownContext.name || "",
          aspirations,
          knownContext,
          recentHistory,
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
        // API returned empty — use fallback
        const fallback = buildFallbackSheet(aspirations);
        setEntries(fallback);
        setIsFallback(true);
        localStorage.setItem(cacheKey, JSON.stringify(fallback));
      } else {
        // Sort by time of day
        const order = { morning: 0, afternoon: 1, evening: 2 };
        compiled.sort((a, b) => order[a.timeOfDay] - order[b.timeOfDay]);
        setEntries(compiled);
        localStorage.setItem(cacheKey, JSON.stringify(compiled));
      }
    } catch (err) {
      console.error("Sheet compilation error:", err);
      // Fallback: show raw behaviors without AI-compiled specificity
      const fallback = buildFallbackSheet(aspirations);
      setEntries(fallback);
      setIsFallback(true);
      localStorage.setItem(cacheKey, JSON.stringify(fallback));
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    compileSheet();
  }, [compileSheet]);

  // Check for insight opportunity (5+ days of cross-aspiration data)
  useEffect(() => {
    async function checkInsight() {
      // Don't overwrite existing insight
      if (localStorage.getItem("huma-v2-pending-insight")) return;

      const history = getRecentHistory();
      if (history.length === 0) return;

      // Count unique dates
      const uniqueDates = new Set(history.map(h => h.date));
      if (uniqueDates.size < 5) return;

      // Load aspirations for behavior metadata
      let aspirations: Aspiration[] = [];
      try {
        const saved = localStorage.getItem("huma-v2-aspirations");
        if (saved) aspirations = JSON.parse(saved);
      } catch { return; }

      if (aspirations.length < 2) return; // Need cross-aspiration data

      // Build behavior meta and entries for the insight API
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
  }, []);

  // Persist check-off state
  const toggleEntry = (id: string) => {
    setEntries(prev => {
      const updated = prev.map(e =>
        e.id === id
          ? { ...e, checked: !e.checked, checkedAt: !e.checked ? new Date().toISOString() : undefined }
          : e
      );
      localStorage.setItem(`huma-v2-sheet-${date}`, JSON.stringify(updated));
      return updated;
    });
  };

  const allDone = entries.length > 0 && entries.every(e => e.checked);

  return (
    <div className="min-h-dvh bg-sand-50 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <p className="font-sans text-sm text-earth-400">{formatDate(date)}</p>
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
              <p className="font-sans text-xs text-earth-400 mb-2">
                Showing your behaviors for today. Talk to HUMA for more specific guidance.
              </p>
            )}

            {entries.map(entry => (
              <SheetCard
                key={entry.id}
                entry={entry}
                onToggle={() => toggleEntry(entry.id)}
                expanded={expandedId === entry.id}
                onExpand={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              />
            ))}

            {allDone && (
              <p
                className="text-center font-serif text-lg text-sage-600 mt-8 animate-fade-in"
              >
                Done for today. See you tomorrow.
              </p>
            )}
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
