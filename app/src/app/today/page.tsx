"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { SheetEntry, Aspiration, Insight } from "@/types/v2";
import { DIMENSION_LABELS, type DimensionKey } from "@/types/v2";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import ConversationSheet from "@/components/ConversationSheet";
import { displayName } from "@/lib/display-name";
import { getLocalDate } from "@/lib/date-utils";
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
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
  // Only active-stage aspirations generate daily sheet items
  const activeOnly = aspirations.filter(a => (a.stage || "active") === "active");
  for (const aspiration of activeOnly) {
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

// ─── Orphan Filter (remove entries from dropped/non-active aspirations) ──────

function filterOrphanedEntries(entries: SheetEntry[], aspirations: Aspiration[]): SheetEntry[] {
  if (aspirations.length === 0) return entries; // no aspiration data loaded yet — don't filter
  const activeIds = new Set(
    aspirations
      .filter(a => a.status !== "dropped" && (a.stage || "active") === "active")
      .map(a => a.id)
  );
  return entries.filter(e => !e.aspirationId || activeIds.has(e.aspirationId));
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

// ─── Dimension Tag Styles ────────────────────────────────────────────────────

function getDimensionStyle(dim: string): { color: string; background: string } {
  const styles: Record<string, { color: string; background: string }> = {
    body: { color: "#5C7A62", background: "#F0F5F1" },
    people: { color: "#4A7A8A", background: "#F0F6F8" },
    money: { color: "#B5621E", background: "#FDF5EE" },
    home: { color: "#8B7355", background: "#F5F0EB" },
    growth: { color: "#4A6E50", background: "#F0F5F1" },
    joy: { color: "#C4841D", background: "#FDF8EE" },
    purpose: { color: "#6B5B8A", background: "#F5F0F8" },
    identity: { color: "#6B5F4E", background: "#F5F0EB" },
  };
  return styles[dim] || { color: "#8B8178", background: "#F5F2ED" };
}

// ─── Headline Helper (legacy fallback) ──────────────────────────────────────

function getHeadline(entry: SheetEntry): string {
  if (entry.headline) return entry.headline;
  const text = entry.behaviorText || "";
  if (text.length <= 60) return text;
  const lastSpace = text.slice(0, 60).lastIndexOf(" ");
  return (lastSpace > 20 ? text.slice(0, lastSpace) : text.slice(0, 60)) + "...";
}

function getDetailText(entry: SheetEntry): string {
  if (typeof entry.detail === "string") return entry.detail;
  return (entry.detail as Record<string, unknown>)?.text as string || "";
}

function getEntryDimensions(entry: SheetEntry): string[] {
  if (entry.dimensions && entry.dimensions.length > 0) return entry.dimensions;
  const d = entry.detail as Record<string, unknown>;
  if (d?.dimensions && Array.isArray(d.dimensions)) return d.dimensions as string[];
  return [];
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
  const headline = getHeadline(entry);
  const detailText = getDetailText(entry);
  const dims = getEntryDimensions(entry);
  const streakText = entry.streakText || (
    entry.checked && weekCount
      ? `Done \u00b7 ${weekCount.completed > 0 ? `${weekCount.completed} of ${Math.max(weekCount.total, weekCount.completed)} days this week` : "Day 1"}`
      : ""
  );

  return (
    <div
      style={{
        padding: "14px 16px",
        background: entry.checked ? "#FAFAF8" : "white",
        border: "1px solid #DDD4C0",
        borderRadius: 12,
        opacity: entry.checked ? 0.55 : 1,
        transition: "opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Checkbox */}
        <button
          data-checkbox
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className={entry._checking ? "animate-check-bounce" : ""}
          aria-label={entry.checked ? "Mark as not done" : "Mark as done"}
          style={{
            width: 22, height: 22, minWidth: 22,
            borderRadius: 4,
            border: entry.checked ? "none" : "2px solid #B0A898",
            background: entry.checked ? "#5C7A62" : "transparent",
            cursor: "pointer",
            marginTop: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 200ms ease",
          }}
        >
          {entry.checked && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div
          style={{ flex: 1, cursor: "pointer" }}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("[data-checkbox]")) return;
            setExpanded(!expanded);
          }}
        >
          {/* Headline — the glanceable line */}
          <div
            className="font-sans"
            style={{
              fontSize: "0.95rem",
              fontWeight: 500,
              color: "#3D3529",
              lineHeight: 1.35,
              textDecoration: entry.checked ? "line-through" : "none",
            }}
          >
            {headline}
          </div>

          {/* Detail preview (one line, truncated) — only if NOT expanded and not checked */}
          {!expanded && !entry.checked && detailText && (
            <div
              className="font-sans"
              style={{
                fontSize: "0.82rem",
                fontWeight: 300,
                color: "#8B8178",
                marginTop: 4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {detailText}
            </div>
          )}

          {/* Expanded detail */}
          {expanded && detailText && (
            <div
              className="font-sans"
              style={{
                fontSize: "0.85rem",
                fontWeight: 400,
                color: "#6B6358",
                marginTop: 8,
                lineHeight: 1.55,
              }}
            >
              {detailText}
            </div>
          )}

          {/* Streak counter (shown when checked) */}
          {entry.checked && streakText && (
            <div
              className="font-sans animate-fade-in"
              style={{
                fontSize: "0.78rem",
                fontWeight: 400,
                color: "#5C7A62",
                marginTop: 6,
              }}
            >
              {streakText}
            </div>
          )}

          {/* Dimension tags */}
          {dims.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              {dims.map(dim => {
                const style = getDimensionStyle(dim);
                return (
                  <span
                    key={dim}
                    className="font-sans"
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      letterSpacing: "0.03em",
                      padding: "2px 8px",
                      borderRadius: 4,
                      color: style.color,
                      background: style.background,
                    }}
                  >
                    {dim.charAt(0).toUpperCase() + dim.slice(1)}
                  </span>
                );
              })}
            </div>
          )}
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
  const [date] = useState(() => getLocalDate());
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
          const order: Record<string, number> = { morning: 0, midday: 1, evening: 2 };
          dbEntries.sort((a, b) => (order[a.timeOfDay] ?? 1) - (order[b.timeOfDay] ?? 1));
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
        const cachedEntries: SheetEntry[] = JSON.parse(cached);
        // Legacy format detection: if no entries have headline, force recompile
        const hasNewFormat = cachedEntries.some(e => e.headline);
        if (!hasNewFormat && cachedEntries.length > 0) {
          localStorage.removeItem(cacheKey);
          // Fall through to recompilation
        } else {
          setEntries(capEntries(deduplicateEntries(cachedEntries)));
          setLoading(false);
          compilingRef.current = false;
          return;
        }
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

    // 4. Compile via API — only active-stage aspirations generate daily sheet items
    const activeAspirations = localAspirations.filter(a => (a.stage || "active") === "active");

    if (activeAspirations.length === 0) {
      setLoading(false);
      compilingRef.current = false;
      return;
    }

    try {
      const res = await fetch("/api/sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: localContext.name || "",
          aspirations: activeAspirations,
          knownContext: localContext,
          recentHistory,
          conversationMessages,
          date,
        }),
      });

      if (!res.ok) throw new Error(`Sheet API returned ${res.status}`);

      const data = await res.json();
      const compiled: SheetEntry[] = (data.entries || []).map(
        (e: Record<string, unknown>, i: number) => ({
          id: crypto.randomUUID(),
          aspirationId: (e.aspiration_id as string) || "",
          behaviorKey: (e.behavior_key as string) || `behavior-${i}`,
          behaviorText: (e.headline as string) || (e.text as string) || "",
          headline: (e.headline as string) || (e.text as string) || "",
          detail: (e.detail as string) || "",
          timeOfDay: (e.time_of_day as string) || "morning",
          dimensions: Array.isArray(e.dimensions) ? e.dimensions as string[] : [],
          checked: false,
        })
      );

      if (compiled.length === 0) {
        const fallback = capEntries(deduplicateEntries(buildFallbackSheet(localAspirations)));
        setEntries(fallback);
        setIsFallback(true);
        localStorage.setItem(cacheKey, JSON.stringify(fallback));
      } else {
        const order: Record<string, number> = { morning: 0, midday: 1, evening: 2 };
        compiled.sort((a, b) => (order[a.timeOfDay] ?? 1) - (order[b.timeOfDay] ?? 1));
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

  // Re-filter entries when aspirations change (e.g., deletion or stage change on /system)
  useEffect(() => {
    if (aspirations.length > 0 && entries.length > 0) {
      const filtered = filterOrphanedEntries(entries, aspirations);
      if (filtered.length !== entries.length) {
        setEntries(filtered);
        localStorage.setItem(`huma-v2-sheet-${date}`, JSON.stringify(filtered));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspirations]);

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

      {/* Aspiration Ribbon — active + planning only (not someday) */}
      {aspirations.filter(a => (a.stage || "active") !== "someday").length > 0 ? (
        <div className="hide-scrollbar overflow-x-auto" style={{ marginTop: "16px", WebkitOverflowScrolling: "touch" }}>
          <div className="flex gap-2 animate-entrance-1" style={{ paddingLeft: "24px", paddingRight: "24px" }}>
            {aspirations.filter(a => (a.stage || "active") !== "someday").map(asp => (
              <button
                key={asp.id}
                onClick={() => setQuickLookAspiration(asp)}
                className={`flex-shrink-0 rounded-full border font-sans font-medium cursor-pointer hover:bg-sage-50 transition-colors ${
                  (asp.stage || "active") === "planning"
                    ? "bg-sand-100 border-sand-300 text-ink-500 italic"
                    : "bg-sage-100 border-sage-200 text-sage-700"
                }`}
                style={{ padding: "6px 14px", fontSize: "13px", lineHeight: "1" }}
              >
                {displayName(asp.clarifiedText || asp.rawText)}
                {(asp.stage || "active") === "planning" && (
                  <span className="font-normal not-italic" style={{ fontSize: "10px", marginLeft: "4px", opacity: 0.6 }}>planning</span>
                )}
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
      <div className="flex-1" style={{ marginTop: structuralInsight ? "12px" : "16px" }}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <span
              className="rounded-full animate-dot-pulse"
              style={{ width: "8px", height: "8px", background: "var(--color-sage-400)" }}
            />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
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
          <div className="max-w-2xl mx-auto">
            {isFallback && (
              <div className="flex items-center gap-3 mb-2 px-6">
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

            {/* Time-of-day sections */}
            {(() => {
              const sections = [
                { key: "morning", label: "MORNING" },
                { key: "midday", label: "MIDDAY" },
                { key: "evening", label: "EVENING" },
              ];
              const usedSections = sections.filter(s => entries.some(e => e.timeOfDay === s.key));
              const hasMultipleSections = usedSections.length > 1;
              let animIdx = 0;

              return sections.map(section => {
                const sectionEntries = entries.filter(e => e.timeOfDay === section.key);
                if (sectionEntries.length === 0) return null;
                return (
                  <div key={section.key}>
                    {hasMultipleSections && (
                      <div
                        className="font-sans"
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: "0.18em",
                          color: "#A8A196",
                          padding: "16px 24px 8px",
                        }}
                      >
                        {section.label}
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 24px" }}>
                      {sectionEntries.map(entry => {
                        const idx = animIdx++;
                        return (
                          <div key={entry.id} className={idx <= 2 ? `animate-entrance-${idx + 3}` : ""}>
                            <SheetCard
                              entry={entry}
                              onToggle={() => toggleEntry(entry.id)}
                              weekCount={entry.checked ? (weekCounts[entry.behaviorText] || weekCounts[entry.headline || ""] || { completed: 1, total: 1 }) : undefined}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}

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
