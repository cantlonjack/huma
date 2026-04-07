"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Aspiration, Insight, SheetEntry, Nudge, DimensionKey, ValidationAnswer } from "@/types/v2";
import { useAuth } from "@/components/shared/AuthProvider";
import { createClient } from "@/lib/supabase";
import { getLocalDate } from "@/lib/date-utils";
import { compileSheet, type CompiledSheet } from "@/lib/sheet-compiler";
import { usePush } from "@/lib/use-push";
import {
  computeStructuralInsight,
  markInsightDelivered,
  logBehaviorCheckoff,
  getBehaviorWeekCounts,
} from "@/lib/supabase-v2";
import { detectTransition } from "@/lib/transition-detection";
import type { TransitionSignal } from "@/types/v2";
import { fetchNudges, dismissNudge as persistDismissNudge } from "@/lib/nudge-fetcher";
import { computeCapitalPulse, type PulseData } from "@/lib/capital-pulse";
import {
  queryKeys,
  fetchAspirations,
  fetchKnownContext,
  fetchUndeliveredInsight,
  fetchCheckedEntries,
  fetchWeekCounts,
  fetchThirtyDayCounts,
  fetchRhythmData,
} from "@/lib/queries";

// Re-export types and helpers from their canonical locations for backwards compatibility
export type { BehaviorStep, ComingUpItem } from "@/lib/today-utils";
export { formatHeaderDate, getDayCount, getBehaviorChain, triggerCaption } from "@/lib/today-utils";
import { getDayCount, getReadyComingUp } from "@/lib/today-utils";
import type { ComingUpItem } from "@/lib/today-utils";

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
  nudges: Nudge[];
  capitalPulse: PulseData | null;

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
  dismissNudge: (id: string) => void;
  engageNudge: (nudge: Nudge) => void;
  // Validation
  isValidationDay: boolean;
  validationAspirations: Aspiration[];
  handleValidationAnswer: (answer: ValidationAnswer) => void;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useToday(): UseTodayReturn {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const [date] = useState(() => getLocalDate());
  const [quickLookAspiration, setQuickLookAspiration] = useState<Aspiration | null>(null);
  const [chatContext, setChatContext] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMode, setChatMode] = useState<"default" | "new-aspiration">("default");
  const [compiledEntries, setCompiledEntries] = useState<SheetEntry[]>([]);
  const [throughLine, setThroughLine] = useState<string | null>(null);
  const [sheetCompiling, setSheetCompiling] = useState(false);
  const [notifSettingsOpen, setNotifSettingsOpen] = useState(false);
  const [transitionSignal, setTransitionSignal] = useState<TransitionSignal | null>(null);
  const [insight, setInsight] = useState<Insight | null>(null);
  const insightMarkedRef = useRef(false);
  const sheetCompiledRef = useRef(false);
  const { state: pushState } = usePush(user?.id ?? null);

  const dayCount = getDayCount();
  const userId = user?.id ?? null;
  const enabled = !authLoading;

  // ─── React Query: Data Loading ──────────────────────────────────────────

  const { data: aspirations = [], isLoading: aspLoading } = useQuery({
    queryKey: queryKeys.aspirations(userId),
    queryFn: () => fetchAspirations(userId),
    enabled,
  });

  const { data: ctxData, isLoading: ctxLoading } = useQuery({
    queryKey: queryKeys.knownContext(userId),
    queryFn: () => fetchKnownContext(userId),
    enabled,
  });

  const archetypes = (() => {
    const saved = ctxData?.archetypes as string[] | undefined;
    return saved && Array.isArray(saved) && saved.length > 0 ? saved : [];
  })();

  const whyStatementForChat = (ctxData?.why_statement as string) || null;

  const { data: checkedData } = useQuery({
    queryKey: queryKeys.checkedEntries(userId ?? "__anon", date),
    queryFn: () => fetchCheckedEntries(userId!, date),
    enabled: enabled && !!userId,
  });

  const [localChecked, setLocalChecked] = useState<Set<string> | null>(null);
  const checkedEntries = localChecked ?? checkedData?.checked ?? new Set<string>();
  const standaloneEntries = checkedData?.standaloneEntries ?? [];

  // Reset local overrides when server data arrives
  useEffect(() => {
    if (checkedData) setLocalChecked(null);
  }, [checkedData]);

  const { data: weekCounts = {} } = useQuery({
    queryKey: queryKeys.weekCounts(userId ?? "__anon"),
    queryFn: () => fetchWeekCounts(userId!),
    enabled: enabled && !!userId,
  });

  const { data: thirtyDayCounts = {} } = useQuery({
    queryKey: queryKeys.thirtyDayCounts(userId ?? "__anon", aspirations.map(a => a.id)),
    queryFn: () => fetchThirtyDayCounts(userId!, aspirations),
    enabled: enabled && !!userId && aspirations.length > 0,
  });

  const { data: rhythmResult } = useQuery({
    queryKey: queryKeys.rhythmData(userId ?? "__anon"),
    queryFn: () => fetchRhythmData(userId!, aspirations, dayCount),
    enabled: enabled && !!userId && aspirations.length > 0 && dayCount >= 7,
  });

  const rhythmData = rhythmResult?.rhythm ?? {};
  const disruptions = rhythmResult?.disruptions ?? {};

  // ─── Insight Loading (has side effects — keep as effect) ────────────────

  const { data: serverInsight } = useQuery({
    queryKey: queryKeys.undeliveredInsight(userId),
    queryFn: () => fetchUndeliveredInsight(userId),
    enabled: enabled && aspirations.length > 0,
  });

  useEffect(() => {
    if (aspirations.length === 0) return;

    let insightData = serverInsight ?? null;

    if (!insightData) {
      insightData = computeStructuralInsight(aspirations, whyStatementForChat);
      if (insightData) {
        localStorage.setItem("huma-v2-pending-insight", JSON.stringify(insightData));
      }
    }

    setInsight(insightData);

    // Mark insight as shown
    if (insightData && user && !insightMarkedRef.current) {
      insightMarkedRef.current = true;
      const supabase = createClient();
      if (supabase) {
        supabase
          .from("insights")
          .update({ shown_at: new Date().toISOString() })
          .eq("id", insightData.id)
          .eq("user_id", user.id)
          .then(() => {});
      }
    }
  }, [serverInsight, aspirations, whyStatementForChat, user]);

  // Loading = any primary query still loading
  const loading = aspLoading || ctxLoading;

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

  // ─── Nudge Fetching ──────────────────────────────────────────────────────
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const nudgeFetchedRef = useRef(false);

  useEffect(() => {
    if (aspirations.length === 0 || nudgeFetchedRef.current) return;
    // Wait for sheet to finish compiling before fetching nudges
    if (sheetCompiling) return;

    // Check cache first
    const cacheKey = `huma-v2-nudges-${date}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as Nudge[];
        if (parsed.length >= 0) {
          setNudges(parsed);
          nudgeFetchedRef.current = true;
          return;
        }
      }
    } catch { /* no cache */ }

    nudgeFetchedRef.current = true;

    let operatorName = "there";
    try {
      const localCtx = localStorage.getItem("huma-v2-known-context");
      if (localCtx) {
        const parsed = JSON.parse(localCtx);
        operatorName = parsed.operator_name || parsed.name || "there";
      }
    } catch { /* default */ }

    const supabase = user ? createClient() : null;
    const checkedToday = Array.from(checkedEntries)
      .map(k => k.split(":")[1])
      .filter(Boolean);

    fetchNudges({
      aspirations,
      supabase,
      userId: user?.id || null,
      name: operatorName,
      checkedToday,
    })
      .then((result) => {
        setNudges(result);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(result));
        } catch { /* storage full */ }
      })
      .catch(() => { /* nudges are non-critical */ });
  }, [aspirations, date, user, sheetCompiling, checkedEntries]);

  const dismissNudge = useCallback((id: string) => {
    setNudges(prev => prev.filter(n => n.id !== id));
    persistDismissNudge(date, id);
    // Update cache
    try {
      const cacheKey = `huma-v2-nudges-${date}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as Nudge[];
        localStorage.setItem(cacheKey, JSON.stringify(parsed.filter(n => n.id !== id)));
      }
    } catch { /* non-critical */ }
  }, [date]);

  const engageNudge = useCallback((nudge: Nudge) => {
    setChatContext(nudge.text);
    setChatOpen(true);
  }, []);

  // ─── Capital Pulse ──────────────────────────────────────────────────────
  const capitalPulse = useMemo<PulseData | null>(() => {
    if (compiledEntries.length === 0 || checkedEntries.size === 0) return null;
    return computeCapitalPulse(compiledEntries, checkedEntries, aspirations);
  }, [compiledEntries, checkedEntries, aspirations]);

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

      // Optimistic update
      setLocalChecked(prev => {
        const base = prev ?? checkedData?.checked ?? new Set<string>();
        const next = new Set(base);
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
            .then(() => {
              // Invalidate week counts to refetch fresh data
              queryClient.invalidateQueries({ queryKey: queryKeys.weekCounts(user.id) });
            })
            .catch(() => {});
        }
      }
    },
    [user, date, checkedData, queryClient]
  );

  // ─── Standalone toggle ──────────────────────────────────────────────────
  const handleToggleStandalone = useCallback(
    (behaviorText: string) => {
      const key = `:${behaviorText}`;
      const currentChecked = localChecked ?? checkedData?.checked ?? new Set<string>();
      const wasChecked = currentChecked.has(key);

      setLocalChecked(() => {
        const next = new Set(currentChecked);
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
    [user, date, localChecked, checkedData]
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

  // ─── Weekly Validation ─────────────────────────────────────────────────
  const isValidationDay = useMemo(() => {
    const today = new Date(date + "T12:00:00");
    return today.getDay() === 0; // Sunday
  }, [date]);

  const [answeredValidationIds, setAnsweredValidationIds] = useState<Set<string>>(() => {
    try {
      const key = `huma-v2-validation-${date}`;
      const cached = localStorage.getItem(key);
      return cached ? new Set(JSON.parse(cached)) : new Set<string>();
    } catch { return new Set<string>(); }
  });

  const validationAspirations = useMemo(() => {
    if (!isValidationDay) return [];
    return aspirations.filter(a =>
      a.status === "active" &&
      a.validationQuestion &&
      a.validationTarget &&
      !answeredValidationIds.has(a.id)
    );
  }, [isValidationDay, aspirations, answeredValidationIds]);

  const handleValidationAnswer = useCallback((answer: ValidationAnswer) => {
    setAnsweredValidationIds(prev => {
      const next = new Set(prev);
      next.add(answer.aspirationId);
      try {
        localStorage.setItem(`huma-v2-validation-${date}`, JSON.stringify([...next]));
      } catch { /* storage full */ }
      return next;
    });

    // Store the answer in validation log
    try {
      const logKey = `huma-v2-validation-log`;
      const existing = JSON.parse(localStorage.getItem(logKey) || "[]");
      existing.push(answer);
      // Keep last 100 entries
      if (existing.length > 100) existing.splice(0, existing.length - 100);
      localStorage.setItem(logKey, JSON.stringify(existing));
    } catch { /* non-critical */ }

    // Persist to Supabase if authed
    if (user) {
      const supabase = createClient();
      if (supabase) {
        supabase.from("behavior_log").insert({
          user_id: user.id,
          behavior_key: `validation:${answer.aspirationId}`,
          date,
          completed: !answer.belowTarget,
          metadata: answer,
        }).then(() => {});
      }
    }
  }, [date, user]);

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
    nudges,
    capitalPulse,
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
    dismissNudge,
    engageNudge,
    isValidationDay,
    validationAspirations,
    handleValidationAnswer,
  };
}
