"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Aspiration, Insight, SheetEntry } from "@/types/v2";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import { getLocalDate, getLocalDateOffset } from "@/lib/date-utils";
import { compileSheet, type CompiledSheet } from "@/lib/sheet-compiler";
import { usePush } from "@/lib/use-push";
import {
  getAspirations,
  getKnownContext,
  getUndeliveredInsight,
  computeStructuralInsight,
  markInsightDelivered,
  logBehaviorCheckoff,
  getBehaviorWeekCounts,
  getBehaviorDayOfWeekCounts,
  getRecentCompletionDays,
} from "@/lib/supabase-v2";
import { detectTransition } from "@/lib/transition-detection";
import { displayName } from "@/lib/display-name";
import type { TransitionSignal } from "@/types/v2";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BehaviorStep {
  text: string;
  is_trigger: boolean;
  dimension: string;
  dimensions: string[];
}

export interface ComingUpItem {
  aspirationName: string;
  action: import("@/types/v2").FutureAction;
}

export interface UseTodayReturn {
  // State
  loading: boolean;
  date: string;
  dayCount: number;
  aspirations: Aspiration[];
  insight: Insight | null;
  checkedEntries: Set<string>;
  weekCounts: Record<string, { completed: number; total: number }>;
  thirtyDayCounts: Record<string, number>;
  quickLookAspiration: Aspiration | null;
  chatOpen: boolean;
  chatContext: string | null;
  chatMode: "default" | "new-aspiration";
  standaloneEntries: Array<{ behavior_text: string; dimensions?: string[] }>;
  rhythmData: Record<string, Record<number, number>>;
  disruptions: Record<string, string | null>;
  archetypes: string[];
  whyStatementForChat: string | null;
  compiledEntries: SheetEntry[];
  throughLine: string | null;
  sheetCompiling: boolean;
  notifSettingsOpen: boolean;
  transitionSignal: TransitionSignal | null;
  pushState: string;

  // Derived
  activeCount: number;
  adjustingCount: number;
  rerouteAspiration: Aspiration | null;
  comingUpItems: ComingUpItem[];

  // Actions
  setQuickLookAspiration: (a: Aspiration | null) => void;
  setNotifSettingsOpen: (v: boolean) => void;
  setChatOpen: (v: boolean) => void;
  setChatMode: (m: "default" | "new-aspiration") => void;
  setChatContext: (c: string | null) => void;
  handleToggleStep: (aspirationId: string, stepText: string, checked: boolean) => void;
  handleToggleStandalone: (behaviorText: string) => void;
  openChatWithContext: (context: string | null) => void;
  openNewAspirationChat: () => void;
  dismissInsight: () => void;
  dismissTransition: () => void;
  openTransitionChat: () => void;
  closeChatSheet: () => void;
  navigateToStart: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function formatHeaderDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = d.getDate();
  return `${weekday} ${month} ${day}`;
}

export function getDayCount(): number {
  try {
    const start = localStorage.getItem("huma-v2-start-date");
    if (start) {
      const diff = Math.ceil((Date.now() - new Date(start).getTime()) / 86400000);
      return diff > 0 ? diff : 1;
    }
  } catch { /* fresh */ }
  return 1;
}

/** Extract behavior steps from aspiration data */
export function getBehaviorChain(aspiration: Aspiration): BehaviorStep[] {
  if (!aspiration.behaviors || aspiration.behaviors.length === 0) return [];

  const triggerBehavior = aspiration.triggerData?.behavior?.toLowerCase().trim();

  return aspiration.behaviors.map((b, i) => {
    const behaviorAny = b as import("@/types/v2").Behavior & { is_trigger?: boolean };
    const isTrigger = behaviorAny.is_trigger === true
      || (triggerBehavior ? b.text.toLowerCase().trim() === triggerBehavior : i === 0);

    const dim = b.dimensions?.[0];
    const dimension = dim
      ? (typeof dim === "string" ? dim : dim.dimension)
      : "";

    const allDims: string[] = b.dimensions
      ? b.dimensions.map(d => typeof d === "string" ? d : d.dimension).filter(Boolean)
      : [];

    return { text: b.text, is_trigger: isTrigger, dimension, dimensions: allDims };
  });
}

/** Build a one-line trigger caption: dimensions served + shared behavior signal */
export function triggerCaption(
  triggerStep: BehaviorStep | undefined,
  allAspirations: Aspiration[],
  currentAspirationId: string,
): string | null {
  if (!triggerStep) return null;

  const parts: string[] = [];
  const LABELS: Record<string, string> = {
    body: "body", people: "people", money: "money", home: "home",
    growth: "growth", joy: "joy", purpose: "purpose", identity: "identity",
  };

  const dims = triggerStep.dimensions;
  if (dims.length > 1) {
    const names = dims.map(d => LABELS[d] || d);
    parts.push(`Serves ${names.join(", ")}`);
  }

  const triggerText = triggerStep.text.toLowerCase().trim();
  const sharedWith = allAspirations.filter(a =>
    a.id !== currentAspirationId &&
    a.behaviors?.some(b => b.text.toLowerCase().trim() === triggerText)
  );
  if (sharedWith.length > 0) {
    const name = displayName(sharedWith[0].clarifiedText || sharedWith[0].rawText);
    if (sharedWith.length === 1) {
      parts.push(`Shared with ${name}`);
    } else {
      parts.push(`Shared across ${sharedWith.length + 1} patterns`);
    }
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

/**
 * Determines which aspirations have solid THIS WEEK behaviors (70%+ completion
 * rate over the last 7 days) and returns their COMING UP items for surfacing.
 */
function getReadyComingUp(
  aspirations: Aspiration[],
  weekCounts: Record<string, { completed: number; total: number }>,
  dayCount: number,
): ComingUpItem[] {
  if (dayCount < 7) return [];

  const items: ComingUpItem[] = [];

  for (const asp of aspirations) {
    if (!asp.comingUp || asp.comingUp.length === 0) continue;

    let totalCompleted = 0;
    let totalLogged = 0;
    for (const b of asp.behaviors) {
      const counts = weekCounts[b.text] || weekCounts[b.key];
      if (counts) {
        totalCompleted += counts.completed;
        totalLogged += counts.total;
      }
    }

    if (totalLogged > 0 && totalCompleted / totalLogged >= 0.7) {
      items.push({
        aspirationName: asp.title || asp.clarifiedText || asp.rawText,
        action: asp.comingUp[0],
      });
    }
  }

  return items;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useToday(): UseTodayReturn {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [date] = useState(() => getLocalDate());
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [checkedEntries, setCheckedEntries] = useState<Set<string>>(new Set());
  const [weekCounts, setWeekCounts] = useState<Record<string, { completed: number; total: number }>>({});
  const [thirtyDayCounts, setThirtyDayCounts] = useState<Record<string, number>>({});
  const [quickLookAspiration, setQuickLookAspiration] = useState<Aspiration | null>(null);
  const [chatContext, setChatContext] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMode, setChatMode] = useState<"default" | "new-aspiration">("default");
  const [standaloneEntries, setStandaloneEntries] = useState<Array<{ behavior_text: string; dimensions?: string[] }>>([]);
  const [rhythmData, setRhythmData] = useState<Record<string, Record<number, number>>>({});
  const [disruptions, setDisruptions] = useState<Record<string, string | null>>({});
  const [archetypes, setArchetypes] = useState<string[]>([]);
  const [whyStatementForChat, setWhyStatementForChat] = useState<string | null>(null);
  const [compiledEntries, setCompiledEntries] = useState<SheetEntry[]>([]);
  const [throughLine, setThroughLine] = useState<string | null>(null);
  const [sheetCompiling, setSheetCompiling] = useState(false);
  const [notifSettingsOpen, setNotifSettingsOpen] = useState(false);
  const [transitionSignal, setTransitionSignal] = useState<TransitionSignal | null>(null);
  const insightMarkedRef = useRef(false);
  const sheetCompiledRef = useRef(false);
  const { state: pushState } = usePush(user?.id ?? null);

  const dayCount = getDayCount();

  // ─── Data Loading ───────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    async function loadData() {
      setLoading(true);
      let asps: Aspiration[] = [];
      let insightData: Insight | null = null;
      const checked = new Set<string>();

      const supabase = user ? createClient() : null;

      // Load aspirations
      if (supabase && user) {
        try {
          asps = await getAspirations(supabase, user.id);
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

      setAspirations(asps);

      // Load archetypes + WHY for chat context
      if (supabase && user) {
        try {
          const ctx = await getKnownContext(supabase, user.id);
          const savedArchs = ctx.archetypes as string[] | undefined;
          if (savedArchs && Array.isArray(savedArchs) && savedArchs.length > 0) setArchetypes(savedArchs);
          if (ctx.why_statement) setWhyStatementForChat(ctx.why_statement as string);
        } catch { /* non-critical */ }
      }
      if (archetypes.length === 0 || !whyStatementForChat) {
        try {
          const localCtx = localStorage.getItem("huma-v2-known-context");
          if (localCtx) {
            const parsed = JSON.parse(localCtx);
            if (parsed.archetypes?.length > 0 && archetypes.length === 0) setArchetypes(parsed.archetypes);
            if (parsed.why_statement && !whyStatementForChat) setWhyStatementForChat(parsed.why_statement);
          }
        } catch { /* fresh */ }
      }

      // Load today's checked entries from sheet_entries
      if (supabase && user) {
        try {
          const { data: todayEntries } = await supabase
            .from("sheet_entries")
            .select("aspiration_id, behavior_text, checked")
            .eq("user_id", user.id)
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

        // Load standalone behaviors (aspiration_id IS NULL)
        try {
          const { data: standalone } = await supabase
            .from("sheet_entries")
            .select("behavior_text, detail, checked")
            .eq("user_id", user.id)
            .eq("date", date)
            .is("aspiration_id", null);

          if (standalone && standalone.length > 0) {
            setStandaloneEntries(standalone.map(s => ({
              behavior_text: s.behavior_text,
              dimensions: (s.detail as Record<string, unknown>)?.dimensions as string[] || [],
            })));
            for (const s of standalone) {
              if (s.checked) {
                checked.add(`:${s.behavior_text}`);
              }
            }
          }
        } catch { /* non-critical */ }
      }

      // Also check localStorage for today's checks
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

      setCheckedEntries(checked);

      // Load week counts
      if (supabase && user) {
        try {
          const counts = await getBehaviorWeekCounts(supabase, user.id);
          setWeekCounts(counts);
        } catch { /* non-critical */ }
      }

      // Load 30-day counts per aspiration
      if (supabase && user) {
        try {
          const thirtyDaysAgo = getLocalDateOffset(30);
          const { data: logData } = await supabase
            .from("behavior_log")
            .select("behavior_key, completed")
            .eq("user_id", user.id)
            .gte("date", thirtyDaysAgo)
            .eq("completed", true);

          if (logData) {
            const counts: Record<string, number> = {};
            for (const row of logData) {
              for (const asp of asps) {
                for (const b of asp.behaviors) {
                  if (b.key === row.behavior_key || b.text === row.behavior_key) {
                    counts[asp.id] = (counts[asp.id] || 0) + 1;
                  }
                }
              }
            }
            setThirtyDayCounts(counts);
          }
        } catch { /* non-critical */ }
      }

      // Load day-of-week rhythm + disruption detection
      if (supabase && user && asps.length > 0 && dayCount >= 7) {
        try {
          const rhythmResults: Record<string, Record<number, number>> = {};
          const disruptionResults: Record<string, string | null> = {};

          await Promise.all(asps.map(async (asp) => {
            const [dowCounts, last7, last3] = await Promise.all([
              getBehaviorDayOfWeekCounts(supabase, user.id, asp.id),
              getRecentCompletionDays(supabase, user.id, asp.id, 7),
              getRecentCompletionDays(supabase, user.id, asp.id, 3),
            ]);
            rhythmResults[asp.id] = dowCounts;

            if (last7 >= 4 && last3 === 0) {
              disruptionResults[asp.id] = "3 days since last \u2014 what changed?";
            } else {
              disruptionResults[asp.id] = null;
            }
          }));

          setRhythmData(rhythmResults);
          setDisruptions(disruptionResults);
        } catch { /* non-critical */ }
      }

      // Load unread insight
      if (asps.length > 0) {
        if (supabase && user) {
          try {
            const existing = await getUndeliveredInsight(supabase, user.id);
            if (existing) {
              insightData = existing;
            }
          } catch { /* fall through */ }
        }

        if (!insightData) {
          try {
            const localInsight = localStorage.getItem("huma-v2-pending-insight");
            if (localInsight) {
              insightData = JSON.parse(localInsight);
            }
          } catch { /* compute fresh */ }
        }

        if (!insightData) {
          let whyStatement: string | null = null;
          if (supabase && user) {
            try {
              const ctx = await getKnownContext(supabase, user.id);
              whyStatement = (ctx.why_statement as string) || null;
            } catch { /* non-critical */ }
          }
          if (!whyStatement) {
            try {
              const localCtx = localStorage.getItem("huma-v2-known-context");
              if (localCtx) {
                const parsed = JSON.parse(localCtx);
                whyStatement = parsed.why_statement || null;
              }
            } catch { /* fresh */ }
          }
          insightData = computeStructuralInsight(asps, whyStatement);
          if (insightData) {
            localStorage.setItem("huma-v2-pending-insight", JSON.stringify(insightData));
          }
        }
      }

      setInsight(insightData);

      // Mark insight as shown
      if (insightData && supabase && user && !insightMarkedRef.current) {
        insightMarkedRef.current = true;
        try {
          await supabase
            .from("insights")
            .update({ shown_at: new Date().toISOString() })
            .eq("id", insightData.id)
            .eq("user_id", user.id);
        } catch { /* non-critical */ }
      }

      setLoading(false);
    }
    loadData();
  }, [user, authLoading, date]);

  // ─── Sheet Compilation ─────────────────────────────────────────────────
  useEffect(() => {
    if (aspirations.length === 0 || sheetCompiledRef.current) return;

    const cacheKey = `huma-v2-compiled-sheet-${date}`;

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as CompiledSheet;
        if (parsed.entries?.length > 0) {
          setCompiledEntries(parsed.entries.slice(0, 5).map(e => ({
            id: e.id || `${e.behaviorKey}-${date}`,
            aspirationId: e.aspirationId || "",
            behaviorKey: e.behaviorKey,
            behaviorText: e.behaviorText || e.headline || "",
            headline: e.headline,
            detail: e.detail || "",
            timeOfDay: e.timeOfDay || "morning",
            dimensions: e.dimensions,
            checked: false,
          })));
          setThroughLine(parsed.throughLine || null);
          sheetCompiledRef.current = true;
          return;
        }
      }
    } catch { /* no cache, compile fresh */ }

    sheetCompiledRef.current = true;
    setSheetCompiling(true);

    const supabase = user ? createClient() : null;

    let operatorName = "there";
    try {
      const localCtx = localStorage.getItem("huma-v2-known-context");
      if (localCtx) {
        const parsed = JSON.parse(localCtx);
        operatorName = parsed.operator_name || parsed.name || "there";
      }
    } catch { /* default */ }

    compileSheet({
      aspirations,
      supabase,
      userId: user?.id || null,
      name: operatorName,
      archetypes: archetypes.length > 0 ? archetypes : undefined,
      whyStatement: whyStatementForChat || undefined,
    })
      .then((result) => {
        if (result.entries.length > 0) {
          setCompiledEntries(result.entries.slice(0, 5));
          setThroughLine(result.throughLine || null);

          try {
            localStorage.setItem(cacheKey, JSON.stringify({
              entries: result.entries,
              throughLine: result.throughLine,
              date: result.date,
            }));
          } catch { /* storage full */ }
        }
      })
      .catch(() => { /* compilation failed, PatternRouteCards remain */ })
      .finally(() => setSheetCompiling(false));
  }, [aspirations, date, user, archetypes, whyStatementForChat]);

  // ─── Transition Detection ───────────────────────────────────────────────
  useEffect(() => {
    if (!user || dayCount < 28 || aspirations.length < 2) return;

    const dismissKey = "huma-v2-transition-dismissed";
    const dismissed = localStorage.getItem(dismissKey);

    const supabase = createClient();
    if (!supabase) return;

    detectTransition(supabase, user.id, aspirations, dayCount, dismissed)
      .then(signal => { if (signal) setTransitionSignal(signal); })
      .catch(() => { /* non-critical */ });
  }, [user, aspirations, dayCount]);

  const dismissTransition = useCallback(() => {
    setTransitionSignal(null);
    localStorage.setItem("huma-v2-transition-dismissed", new Date().toISOString());
  }, []);

  const openTransitionChat = useCallback(() => {
    setChatContext("Something shifted — let's look at what changed.");
    setChatOpen(true);
  }, []);

  // ─── Check-off handler ──────────────────────────────────────────────────
  const handleToggleStep = useCallback(
    (aspirationId: string, stepText: string, checked: boolean) => {
      const key = `${aspirationId}:${stepText}`;

      setCheckedEntries(prev => {
        const next = new Set(prev);
        if (checked) next.add(key);
        else next.delete(key);
        return next;
      });

      if (user) {
        const supabase = createClient();
        if (supabase) {
          if (checked) {
            supabase
              .from("sheet_entries")
              .insert({
                user_id: user.id,
                aspiration_id: aspirationId || null,
                behavior_text: stepText,
                behavior_key: stepText,
                completed: true,
                completed_at: new Date().toISOString(),
                date,
                checked: true,
                checked_at: new Date().toISOString(),
                detail: {},
                time_of_day: "morning",
              })
              .then(() => {});
          } else {
            supabase
              .from("sheet_entries")
              .delete()
              .eq("user_id", user.id)
              .eq("aspiration_id", aspirationId)
              .eq("behavior_text", stepText)
              .eq("date", date)
              .then(() => {});
          }

          logBehaviorCheckoff(supabase, user.id, stepText, stepText, aspirationId || null, date, checked)
            .then(() => getBehaviorWeekCounts(supabase, user.id))
            .then(counts => setWeekCounts(counts))
            .catch(() => {});
        }
      }
    },
    [user, date]
  );

  // ─── Standalone toggle ──────────────────────────────────────────────────
  const handleToggleStandalone = useCallback(
    (behaviorText: string) => {
      const key = `:${behaviorText}`;
      const wasChecked = checkedEntries.has(key);

      setCheckedEntries(prev => {
        const next = new Set(prev);
        if (wasChecked) next.delete(key);
        else next.add(key);
        return next;
      });

      if (user) {
        const supabase = createClient();
        if (supabase) {
          if (!wasChecked) {
            supabase.from("sheet_entries").update({ checked: true, checked_at: new Date().toISOString() })
              .eq("user_id", user.id).eq("behavior_text", behaviorText).eq("date", date).is("aspiration_id", null)
              .then(() => {});
          } else {
            supabase.from("sheet_entries").update({ checked: false, checked_at: null })
              .eq("user_id", user.id).eq("behavior_text", behaviorText).eq("date", date).is("aspiration_id", null)
              .then(() => {});
          }
        }
      }
    },
    [user, date, checkedEntries]
  );

  // ─── Chat open handler ─────────────────────────────────────────────────
  const openChatWithContext = useCallback((context: string | null) => {
    setChatContext(context);
    setChatOpen(true);
  }, []);

  const openNewAspirationChat = useCallback(() => {
    setChatMode("new-aspiration");
    setChatContext("What are you trying to make work?");
    setChatOpen(true);
  }, []);

  const closeChatSheet = useCallback(() => {
    setChatOpen(false);
    setChatContext(null);
    setChatMode("default");
  }, []);

  // ─── Insight dismiss ───────────────────────────────────────────────────
  const dismissInsight = useCallback(() => {
    if (!insight) return;
    setInsight(null);
    localStorage.removeItem("huma-v2-pending-insight");

    if (user) {
      const supabase = createClient();
      if (supabase) {
        markInsightDelivered(supabase, insight.id, user.id).catch(() => {});
      }
    }
  }, [insight, user]);

  const navigateToStart = useCallback(() => {
    router.push("/start?fresh=1");
  }, [router]);

  // ─── Reroute detection ─────────────────────────────────────────────────
  const rerouteAspiration = (() => {
    if (dayCount < 14) return null;

    const candidates = aspirations.filter(a => {
      const status = a.funnel?.validationStatus;
      if (status === "adjusting") return true;

      const aspWeekCompletions = aspirations
        .flatMap(asp => asp.id === a.id ? asp.behaviors.map(b => weekCounts[b.text]?.completed || 0) : [])
        .reduce((sum, c) => sum + c, 0);

      return aspWeekCompletions < 3;
    });

    return candidates.length > 0 ? candidates[candidates.length - 1] : null;
  })();

  const adjustingCount = aspirations.filter(a => a.funnel?.validationStatus === "adjusting").length;
  const activeCount = aspirations.length;
  const comingUpItems = getReadyComingUp(aspirations, weekCounts, dayCount);

  return {
    loading,
    date,
    dayCount,
    aspirations,
    insight,
    checkedEntries,
    weekCounts,
    thirtyDayCounts,
    quickLookAspiration,
    chatOpen,
    chatContext,
    chatMode,
    standaloneEntries,
    rhythmData,
    disruptions,
    archetypes,
    whyStatementForChat,
    compiledEntries,
    throughLine,
    sheetCompiling,
    notifSettingsOpen,
    transitionSignal,
    pushState,
    activeCount,
    adjustingCount,
    rerouteAspiration,
    comingUpItems,
    setQuickLookAspiration,
    setNotifSettingsOpen,
    setChatOpen,
    setChatMode,
    setChatContext,
    handleToggleStep,
    handleToggleStandalone,
    openChatWithContext,
    openNewAspirationChat,
    dismissInsight,
    dismissTransition,
    openTransitionChat,
    closeChatSheet,
    navigateToStart,
  };
}
