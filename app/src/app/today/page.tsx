"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { SheetEntry, Aspiration, Insight } from "@/types/v2";
import { DIMENSION_LABELS, type DimensionKey } from "@/types/v2";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import ConversationSheet from "@/components/ConversationSheet";
import { displayName } from "@/lib/display-name";
import {
  getAspirations,
  getSheetEntries,
  saveSheetEntries,
  updateSheetEntryCheck,
  getRecentSheetHistory,
  getKnownContext,
  logBehaviorCheckoff,
  getBehaviorWeekCounts,
  computeStructuralInsight,
  getUndeliveredInsight,
} from "@/lib/supabase-v2";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function getLocalRecentHistory(): Array<{ date: string; behaviorKey: string; checked: boolean }> {
  const history: Array<{ date: string; behaviorKey: string; checked: boolean }> = [];
  const today = new Date();
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    try {
      const cached = localStorage.getItem(`huma-v2-sheet-${dateStr}`);
      if (cached) {
        const entries: SheetEntry[] = JSON.parse(cached);
        for (const entry of entries) {
          history.push({ date: dateStr, behaviorKey: entry.behaviorKey, checked: entry.checked });
        }
      }
    } catch { /* skip */ }
  }
  return history;
}

function buildFallbackSheet(aspirations: Aspiration[]): SheetEntry[] {
  const dayOfWeek = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const entries: SheetEntry[] = [];
  for (const aspiration of aspirations) {
    for (const behavior of aspiration.behaviors) {
      let includeToday = false;
      if (behavior.frequency === "daily") includeToday = true;
      else if (behavior.frequency === "weekly") includeToday = true;
      else if (behavior.frequency === "specific-days" && behavior.days) {
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

// ─── Sheet Deduplication + Cap ───────────────────────────────────────────────

function deduplicateEntries(entries: SheetEntry[]): SheetEntry[] {
  const seen = new Map<string, SheetEntry>();
  for (const entry of entries) {
    const key = entry.behaviorKey
      .toLowerCase()
      .replace(/tonight|today|this morning|this evening/g, "")
      .trim();
    if (!seen.has(key)) {
      seen.set(key, entry);
    }
  }
  return Array.from(seen.values());
}

function capEntries(entries: SheetEntry[], max: number = 5): SheetEntry[] {
  if (entries.length <= max) return entries;
  return entries.slice(0, max);
}

// ─── Aspiration Quick-Look Sheet ─────────────────────────────────────────────

function AspirationQuickLook({
  aspiration,
  onClose,
}: {
  aspiration: Aspiration;
  onClose: () => void;
}) {
  const dims = aspiration.dimensionsTouched?.length
    ? aspiration.dimensionsTouched
    : [...new Set(aspiration.behaviors.flatMap(b =>
        (b.dimensions || []).map(d => typeof d === "string" ? d : d.dimension)
      ))];

  const contextParts: string[] = [];
  // Try to extract context from behavior details
  if (aspiration.clarifiedText && aspiration.clarifiedText !== aspiration.rawText) {
    contextParts.push(aspiration.clarifiedText);
  }

  const activeBehaviors = aspiration.behaviors.filter(b =>
    b.frequency === "daily" || b.frequency === "weekly" || b.frequency === "specific-days"
  );

  return (
    <>
      <div className="fixed inset-0 z-[55] bg-black/15 animate-overlay-in" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-[56] bg-sand-50 rounded-t-2xl border-t border-sand-300 animate-slide-up"
        style={{ height: "40dvh" }}
      >
        <div className="flex justify-center" style={{ paddingTop: "12px", paddingBottom: "8px" }}>
          <div
            className="bg-sand-300 cursor-pointer"
            style={{ width: "36px", height: "4px", borderRadius: "2px" }}
            onClick={onClose}
          />
        </div>
        <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: "calc(40dvh - 40px)" }}>
          <div className="flex items-start justify-between">
            <h3 className="font-sans font-medium text-ink-900" style={{ fontSize: "18px", lineHeight: "1.3" }}>
              {displayName(aspiration.clarifiedText || aspiration.rawText)}
            </h3>
            <button className="font-sans text-sage-400 cursor-pointer" style={{ fontSize: "12px" }}>edit</button>
          </div>
          {contextParts.length > 0 && (
            <p className="font-sans text-ink-500 mt-1" style={{ fontSize: "14px", lineHeight: "1.4" }}>{contextParts.join(" · ")}</p>
          )}
          <p className="font-sans text-ink-500" style={{ fontSize: "14px", lineHeight: "1.4", marginTop: "8px" }}>
            {aspiration.behaviors.length} behaviors &middot; {activeBehaviors.length} active
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {dims.map((dim) => (
              <span
                key={dim}
                className="inline-flex rounded-full font-sans font-medium bg-sage-50 text-sage-600"
                style={{ padding: "2px 8px", fontSize: "10px", letterSpacing: "0.1em", lineHeight: "1" }}
              >
                {DIMENSION_LABELS[dim as DimensionKey] || dim}
              </span>
            ))}
          </div>
          <Link
            href="/system"
            className="inline-block font-sans font-medium text-sage-500 hover:text-sage-700 transition-colors"
            style={{ fontSize: "14px", marginTop: "16px" }}
          >
            See in System &rarr;
          </Link>
        </div>
      </div>
    </>
  );
}

// ─── Sheet Card ──────────────────────────────────────────────────────────────

function SheetCard({
  entry,
  onToggle,
  weekCount,
}: {
  entry: SheetEntry & { _checking?: boolean };
  onToggle: () => void;
  weekCount?: { completed: number; total: number };
}) {
  const [expanded, setExpanded] = useState(false);
  const detailText = typeof entry.detail === "string"
    ? entry.detail
    : (entry.detail as Record<string, unknown>)?.text as string || "";

  const dims = (() => {
    const d = entry.detail as Record<string, unknown>;
    if (d?.dimensions && Array.isArray(d.dimensions)) {
      return d.dimensions as string[];
    }
    return [];
  })();

  return (
    <div
      className="bg-white border border-sand-300 overflow-hidden transition-all"
      style={{
        borderRadius: "16px",
        opacity: entry.checked ? 0.5 : 1,
        transition: "opacity 400ms var(--huma-ease), transform 400ms var(--huma-ease)",
      }}
    >
      <div style={{ padding: "16px" }}>
        <div className="flex gap-3.5">
          {/* Checkbox */}
          <button
            data-checkbox
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className="mt-0.5 flex-shrink-0 cursor-pointer"
            aria-label={entry.checked ? "Mark as not done" : "Mark as done"}
            style={{ minWidth: "22px", minHeight: "22px" }}
          >
            <div
              className={`flex items-center justify-center transition-all duration-200 ${
                entry._checking ? "animate-check-bounce" : ""
              }`}
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "4px",
                border: entry.checked ? "none" : "1.5px solid var(--color-sand-300)",
                background: entry.checked ? "var(--color-sage-600)" : "transparent",
                transitionTimingFunction: "var(--huma-ease)",
              }}
            >
              {entry.checked && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2.5 6 5 8.5 9.5 3.5" />
                </svg>
              )}
            </div>
          </button>

          {/* Content */}
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("[data-checkbox]")) return;
              setExpanded(!expanded);
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <p
                className="font-sans font-medium"
                style={{
                  fontSize: "15px",
                  lineHeight: "1.3",
                  color: "var(--color-ink-900)",
                  textDecoration: entry.checked ? "line-through" : "none",
                }}
              >
                {entry.behaviorText}
              </p>
              {detailText && (
                <span className="flex-shrink-0" style={{ color: "var(--color-ink-300)", fontSize: "12px", marginTop: "2px" }}>
                  {expanded ? "▴" : "▾"}
                </span>
              )}
            </div>

            {/* Counter line (after check) */}
            {entry.checked && weekCount && (
              <p
                className="font-sans font-medium mt-1 animate-fade-in"
                style={{ fontSize: "12px", lineHeight: "1.4", color: "var(--color-sage-500)" }}
              >
                Done &middot; {weekCount.completed > 0 ? `${weekCount.completed} of ${Math.max(weekCount.total, weekCount.completed)} days this week` : "Day 1"}
              </p>
            )}

            {/* Detail text with max-height transition */}
            {detailText && !entry.checked && (
              <div
                className="overflow-hidden"
                style={{
                  maxHeight: expanded ? "200px" : "24px",
                  transition: "max-height 300ms var(--huma-ease)",
                }}
              >
                <p
                  className="font-sans font-light mt-1"
                  style={{
                    fontSize: "13px",
                    lineHeight: expanded ? "1.6" : "1.5",
                    color: "var(--color-ink-500)",
                    overflowWrap: "break-word",
                    ...(expanded ? {} : { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }),
                  }}
                >
                  {detailText}
                </p>
              </div>
            )}

            {/* Dimension tags */}
            {dims.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {dims.map((dim) => (
                  <span
                    key={dim}
                    className="inline-flex rounded-full font-sans font-medium bg-sage-50 text-sage-600"
                    style={{ padding: "2px 8px", fontSize: "10px", letterSpacing: "0.1em", lineHeight: "1" }}
                  >
                    {DIMENSION_LABELS[dim as DimensionKey] || dim}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Today Page ──────────────────────────────────────────────────────────────

export default function TodayPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<(SheetEntry & { _checking?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [date] = useState(() => new Date().toISOString().split("T")[0]);
  const [isFallback, setIsFallback] = useState(false);
  const compilingRef = useRef(false);
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [knownContext, setKnownContext] = useState<Record<string, unknown>>({});
  const [structuralInsight, setStructuralInsight] = useState<Insight | null>(null);
  const [weekCounts, setWeekCounts] = useState<Record<string, { completed: number; total: number }>>({});
  const [quickLookAspiration, setQuickLookAspiration] = useState<Aspiration | null>(null);
  const [conversationSheetOpen, setConversationSheetOpen] = useState(false);

  // Load aspirations and context
  useEffect(() => {
    async function loadMeta() {
      let asps: Aspiration[] = [];
      let ctx: Record<string, unknown> = {};

      if (user) {
        const supabase = createClient();
        if (supabase) {
          try {
            const [dbAsps, dbCtx] = await Promise.all([
              getAspirations(supabase, user.id),
              getKnownContext(supabase, user.id),
            ]);
            asps = dbAsps;
            ctx = dbCtx;
          } catch { /* fall through */ }
        }
      }

      if (asps.length === 0) {
        try {
          const saved = localStorage.getItem("huma-v2-aspirations");
          if (saved) asps = JSON.parse(saved);
          const savedCtx = localStorage.getItem("huma-v2-known-context");
          if (savedCtx) ctx = JSON.parse(savedCtx);
        } catch { /* fresh */ }
      }

      setAspirations(asps);
      setKnownContext(ctx);

      // Compute structural insight if aspirations exist
      if (asps.length > 0) {
        // Check for existing insight first
        if (user) {
          const supabase = createClient();
          if (supabase) {
            try {
              const existing = await getUndeliveredInsight(supabase, user.id);
              if (existing) {
                setStructuralInsight(existing);
                return;
              }
            } catch { /* fall through */ }
          }
        }

        // Check localStorage
        const localInsight = localStorage.getItem("huma-v2-pending-insight");
        if (localInsight) {
          try {
            setStructuralInsight(JSON.parse(localInsight));
            return;
          } catch { /* compute fresh */ }
        }

        // Compute structural insight
        const insight = computeStructuralInsight(asps);
        if (insight) {
          setStructuralInsight(insight);
          localStorage.setItem("huma-v2-pending-insight", JSON.stringify(insight));
        }
      }
    }
    loadMeta();
  }, [user]);

  // Load week counts for check-off counters
  useEffect(() => {
    async function loadCounts() {
      if (user) {
        const supabase = createClient();
        if (supabase) {
          try {
            const counts = await getBehaviorWeekCounts(supabase, user.id);
            setWeekCounts(counts);
          } catch { /* non-critical */ }
        }
      }
    }
    loadCounts();
  }, [user]);

  const compileSheet = useCallback(async () => {
    if (compilingRef.current) return;
    compilingRef.current = true;
    setLoading(true);

    const supabase = user ? createClient() : null;

    // 1. Check Supabase
    if (supabase && user) {
      try {
        const dbEntries = await getSheetEntries(supabase, user.id, date);
        if (dbEntries.length > 0) {
          const order = { morning: 0, afternoon: 1, evening: 2 };
          dbEntries.sort((a, b) => order[a.timeOfDay] - order[b.timeOfDay]);
          setEntries(capEntries(deduplicateEntries(dbEntries)));
          setLoading(false);
          compilingRef.current = false;
          return;
        }
      } catch { /* fall through */ }
    }

    // 2. Check localStorage cache
    const cacheKey = `huma-v2-sheet-${date}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setEntries(capEntries(deduplicateEntries(JSON.parse(cached))));
        setLoading(false);
        compilingRef.current = false;
        return;
      } catch { /* recompile */ }
    }

    // 3. Load data for compilation
    let localAspirations: Aspiration[] = aspirations;
    let localContext = knownContext;
    let recentHistory: Array<{ date: string; behaviorKey: string; checked: boolean }> = [];
    let conversationMessages: Array<{ role: string; content: string }> = [];

    if (supabase && user) {
      try {
        const [dbHistory, dbMessages] = await Promise.all([
          getRecentSheetHistory(supabase, user.id),
          import("@/lib/supabase-v2").then(m => m.getChatMessages(supabase!, user!.id)),
        ]);
        recentHistory = dbHistory;
        conversationMessages = dbMessages.map(m => ({ role: m.role, content: m.content }));

        if (localAspirations.length === 0) {
          const dbAsps = await getAspirations(supabase, user.id);
          localAspirations = dbAsps;
        }
        if (Object.keys(localContext).length === 0) {
          const dbCtx = await getKnownContext(supabase, user.id);
          localContext = dbCtx;
        }
      } catch { /* use what we have */ }
    }

    if (localAspirations.length === 0) {
      try {
        const saved = localStorage.getItem("huma-v2-aspirations");
        if (saved) localAspirations = JSON.parse(saved);
        const savedCtx = localStorage.getItem("huma-v2-known-context");
        if (savedCtx) localContext = JSON.parse(savedCtx);
      } catch { /* fresh */ }
    }

    if (conversationMessages.length === 0) {
      try {
        const startMsgs = localStorage.getItem("huma-v2-start-messages");
        const chatMsgs = localStorage.getItem("huma-v2-chat-messages");
        const raw = startMsgs || chatMsgs;
        if (raw) {
          conversationMessages = JSON.parse(raw).map((m: { role: string; content: string }) => ({
            role: m.role, content: m.content,
          }));
        }
      } catch { /* fresh */ }
    }

    if (recentHistory.length === 0) {
      recentHistory = getLocalRecentHistory();
    }

    if (localAspirations.length === 0) {
      setLoading(false);
      compilingRef.current = false;
      return;
    }

    // 4. Compile via API
    try {
      const res = await fetch("/api/sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: localContext.name || "",
          aspirations: localAspirations,
          knownContext: localContext,
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
        const fallback = capEntries(deduplicateEntries(buildFallbackSheet(localAspirations)));
        setEntries(fallback);
        setIsFallback(true);
        localStorage.setItem(cacheKey, JSON.stringify(fallback));
      } else {
        const order = { morning: 0, afternoon: 1, evening: 2 };
        compiled.sort((a, b) => order[a.timeOfDay] - order[b.timeOfDay]);
        const final = capEntries(deduplicateEntries(compiled));
        setEntries(final);
        localStorage.setItem(cacheKey, JSON.stringify(final));

        if (supabase && user) {
          try { await saveSheetEntries(supabase, user.id, final, date); } catch { /* ok */ }
        }
      }
    } catch {
      const fallback = capEntries(deduplicateEntries(buildFallbackSheet(localAspirations)));
      setEntries(fallback);
      setIsFallback(true);
      localStorage.setItem(cacheKey, JSON.stringify(fallback));
    } finally {
      setLoading(false);
      compilingRef.current = false;
    }
  }, [date, user, aspirations, knownContext]);

  useEffect(() => {
    compileSheet();
  }, [compileSheet]);

  // Toggle check-off with feedback animation
  const toggleEntry = useCallback((id: string) => {
    setEntries(prev => {
      const idx = prev.findIndex(e => e.id === id);
      if (idx === -1) return prev;
      const entry = prev[idx];
      const newChecked = !entry.checked;

      const updated = [...prev];
      updated[idx] = { ...entry, checked: newChecked, checkedAt: newChecked ? new Date().toISOString() : undefined, _checking: true };

      // Save to localStorage immediately
      localStorage.setItem(`huma-v2-sheet-${date}`, JSON.stringify(updated.map(e => ({ ...e, _checking: undefined }))));

      // Save to Supabase + behavior_log
      if (user) {
        const supabase = createClient();
        if (supabase) {
          updateSheetEntryCheck(supabase, id, user.id, newChecked).catch(() => {});
          logBehaviorCheckoff(
            supabase, user.id,
            entry.behaviorKey, entry.behaviorText,
            entry.aspirationId || null, date, newChecked
          ).then(() => {
            // Refresh week counts
            getBehaviorWeekCounts(supabase, user.id).then(counts => setWeekCounts(counts)).catch(() => {});
          }).catch(() => {});
        }
      }

      return updated;
    });

    // Remove _checking flag after animation
    setTimeout(() => {
      setEntries(prev => prev.map(e => e.id === id ? { ...e, _checking: false } : e));
    }, 200);

    // Reorder: move checked items to bottom after delay
    setTimeout(() => {
      setEntries(prev => {
        const unchecked = prev.filter(e => !e.checked);
        const checked = prev.filter(e => e.checked);
        return [...unchecked, ...checked];
      });
    }, 1200);
  }, [date, user]);

  const entryCount = entries.filter(e => !e.checked).length;
  const dayNum = (() => {
    try {
      const start = localStorage.getItem("huma-v2-start-date");
      if (start) {
        const diff = Math.ceil((Date.now() - new Date(start).getTime()) / 86400000);
        return diff > 0 ? diff : 1;
      }
    } catch { /* fresh */ }
    return 1;
  })();

  return (
    <div className="min-h-dvh bg-sand-50 flex flex-col" style={{ paddingBottom: "160px" }}>
      {/* Header */}
      <div className="px-6" style={{ paddingTop: "20px" }}>
        <div className="flex items-center justify-between">
          <span
            className="font-sans font-medium text-sage-500"
            style={{ fontSize: "11px", letterSpacing: "0.4em", lineHeight: "1" }}
          >
            HUMA
          </span>
          <span className="font-sans text-ink-300" style={{ fontSize: "12px", lineHeight: "1.4" }}>
            {entryCount > 0 ? `${entryCount} thing${entryCount > 1 ? "s" : ""}` : ""}{dayNum > 1 ? ` · Day ${dayNum}` : ""}
          </span>
        </div>
        <p className="font-serif text-ink-900" style={{ fontSize: "22px", lineHeight: "1.2", marginTop: "12px" }}>
          {formatDate(date)}
        </p>
      </div>

      {/* Aspiration Ribbon */}
      {aspirations.length > 0 ? (
        <div className="hide-scrollbar overflow-x-auto" style={{ marginTop: "16px", WebkitOverflowScrolling: "touch" }}>
          <div className="flex gap-2 animate-entrance-1" style={{ paddingLeft: "24px", paddingRight: "24px" }}>
            {aspirations.map(asp => (
              <button
                key={asp.id}
                onClick={() => setQuickLookAspiration(asp)}
                className="flex-shrink-0 rounded-full bg-sage-100 border border-sage-200 font-sans font-medium text-sage-700 cursor-pointer hover:bg-sage-50 transition-colors"
                style={{ padding: "6px 14px", fontSize: "13px", lineHeight: "1" }}
              >
                {displayName(asp.clarifiedText || asp.rawText)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ paddingLeft: "24px", paddingRight: "24px", marginTop: "16px" }}>
          <Link
            href="/start"
            className="inline-flex rounded-full bg-sage-100 border border-sage-200 font-sans font-medium text-sage-700 hover:bg-sage-50 transition-colors"
            style={{ padding: "6px 14px", fontSize: "13px", lineHeight: "1" }}
          >
            Tell HUMA what&apos;s going on &rarr;
          </Link>
        </div>
      )}

      {/* Structural Insight Card */}
      {structuralInsight && (
        <div className="animate-entrance-2" style={{ margin: "16px 24px 0" }}>
          <div
            style={{
              background: "var(--color-sand-100)",
              borderLeft: "3px solid var(--color-sage-600)",
              borderRadius: "12px",
              padding: "14px 16px",
            }}
          >
            <p className="font-serif text-ink-700" style={{ fontSize: "15px", lineHeight: "1.6" }}>
              {structuralInsight.text}
            </p>
            <button
              onClick={() => setConversationSheetOpen(true)}
              className="font-sans font-medium text-sage-500 cursor-pointer hover:text-sage-700 transition-colors"
              style={{ fontSize: "12px", lineHeight: "1", marginTop: "8px" }}
            >
              Tell me more &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Sheet */}
      <div className="flex-1 px-6" style={{ marginTop: structuralInsight ? "12px" : "16px" }}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <span
              className="rounded-full animate-dot-pulse"
              style={{ width: "8px", height: "8px", background: "var(--color-sage-400)" }}
            />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="font-serif text-ink-700" style={{ fontSize: "22px", lineHeight: "1.3" }}>
              Nothing here yet.
            </p>
            <p className="font-sans font-light text-ink-500" style={{ fontSize: "14px", lineHeight: "1.6", marginTop: "8px" }}>
              Tell HUMA what&apos;s going on and your first day will appear.
            </p>
            <Link
              href="/start"
              className="rounded-full font-sans font-medium text-white transition-colors"
              style={{ background: "var(--color-amber-600)", padding: "14px 36px", fontSize: "14px", marginTop: "24px" }}
            >
              Talk to HUMA
            </Link>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {isFallback && (
              <div className="flex items-center gap-3 mb-2">
                <p className="font-sans text-xs text-earth-400">Showing your behaviors for today.</p>
                <button
                  onClick={() => {
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

            {entries.map((entry, idx) => (
              <div key={entry.id} className={idx <= 2 ? `animate-entrance-${idx + 3}` : ""}>
                <SheetCard
                  entry={entry}
                  onToggle={() => toggleEntry(entry.id)}
                  weekCount={entry.checked ? (weekCounts[entry.behaviorText] || { completed: 1, total: 1 }) : undefined}
                />
              </div>
            ))}

            {entries.length > 0 && entries.every(e => e.checked) && (
              <p className="text-center font-serif text-lg text-sage-600 mt-8 animate-fade-in">
                Done for today. See you tomorrow.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Prompt Bar (above nav) */}
      {entries.length > 0 && (
        <div className="fixed left-4 right-4 z-40" style={{ bottom: "calc(60px + env(safe-area-inset-bottom, 0px) + 8px)" }}>
          <button
            onClick={() => setConversationSheetOpen(true)}
            className="w-full flex items-center justify-between bg-white border border-sand-300 cursor-pointer hover:border-sage-300 transition-colors"
            style={{ borderRadius: "16px", padding: "12px 16px" }}
          >
            <span className="font-sans text-ink-300" style={{ fontSize: "14px", lineHeight: "1.4" }}>Tell HUMA something...</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8BAF8E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Conversation Sheet */}
      <ConversationSheet
        open={conversationSheetOpen}
        onClose={() => setConversationSheetOpen(false)}
        knownContext={knownContext}
        aspirations={aspirations}
        onContextUpdate={(ctx) => {
          setKnownContext(ctx);
          localStorage.setItem("huma-v2-known-context", JSON.stringify(ctx));
        }}
        onAspirationAdded={(asp) => {
          setAspirations(prev => [...prev, asp]);
          const updated = [...aspirations, asp];
          localStorage.setItem("huma-v2-aspirations", JSON.stringify(updated));
        }}
        onSheetInvalidated={() => {
          compilingRef.current = false;
          compileSheet();
        }}
      />

      {/* Aspiration Quick-Look */}
      {quickLookAspiration && (
        <AspirationQuickLook
          aspiration={quickLookAspiration}
          onClose={() => setQuickLookAspiration(null)}
        />
      )}
    </div>
  );
}
