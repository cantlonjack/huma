"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Aspiration, Insight, SheetEntry, Nudge, DimensionKey, ValidationAnswer } from "@/types/v2";
import { DIMENSION_LABELS } from "@/types/v2";
import { useAuth } from "@/components/shared/AuthProvider";
import { createClient } from "@/lib/supabase";
import { getLocalDate } from "@/lib/date-utils";
import { compileSheet, invalidateSheetCache, type CompiledSheet } from "@/lib/sheet-compiler";
import { usePush } from "@/lib/use-push";
import {
  computeStructuralInsight,
  markInsightDelivered,
  logBehaviorCheckoff,
  getBehaviorWeekCounts,
} from "@/lib/supabase-v2";
import { generateStructuralInsights, type StructuralInsight } from "@/lib/structural-insights";
import { generateHypothesizedCorrelations, type HypothesizedCorrelation } from "@/lib/hypothesized-correlations";
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
  fetchPatterns,
  fetchHumaContext,
} from "@/lib/queries";
import {
  getNextDueOutcome,
  type OutcomeTarget,
  type OutcomeRecord,
} from "@/lib/outcome-check";

// Re-export types and helpers from their canonical locations for backwards compatibility
export type { BehaviorStep, ComingUpItem } from "@/lib/today-utils";
export { formatHeaderDate, formatBriefingDate, getDayCount, getBehaviorChain, triggerCaption } from "@/lib/today-utils";
import { getDayCount, getReadyComingUp } from "@/lib/today-utils";
import type { ComingUpItem } from "@/lib/today-utils";
import { trackEvent } from "@/lib/analytics";

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
  opening: string | null;
  sheetCompiling: boolean;
  notifSettingsOpen: boolean;
  transitionSignal: TransitionSignal | null;
  pushState: string;
  nudges: Nudge[];
  capitalPulse: PulseData | null;
  structuralInsights: StructuralInsight[];
  hypotheses: HypothesizedCorrelation[];

  // Derived
  activeCount: number;
  adjustingCount: number;
  rerouteAspiration: Aspiration | null;
  comingUpItems: ComingUpItem[];

  // Briefing
  keystoneEntry: SheetEntry | null;
  stateSentence: string | null;
  watchingSignal: { text: string; dimensions: [DimensionKey, DimensionKey] } | null;
  checkedCount: number;
  isEvening: boolean;

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
  dismissStructuralInsight: (id: string) => void;
  dismissHypothesis: (id: string) => void;
  // Validation
  isValidationDay: boolean;
  validationAspirations: Aspiration[];
  handleValidationAnswer: (answer: ValidationAnswer) => void;

  // Outcome check (REGEN-03 Plan 02-05) — 90-day ground-truth prompt surface.
  // nextDueOutcome is the earliest-due aspiration/pattern (>=90 calendar days
  // from createdAt, with no existing outcome record); null when nothing is due.
  // isOutcomeDue === (nextDueOutcome !== null). One card per day, gated by
  // the /today page (Dormancy > Fallow > Outcome priority).
  isOutcomeDue: boolean;
  nextDueOutcome: OutcomeTarget | null;
  nextDueOutcomeLabel: string;
  submitOutcome: (answer: "yes" | "some" | "no" | "worse", why: string) => Promise<void>;
  snoozeOutcome: () => Promise<void>;

  // Dormancy (REGEN-02 Plan 02-02) — operator-state rest signal.
  // isDormant is derived from huma_context.dormant.active === true. When
  // true, /today replaces the sheet with DormantCard + a single re-entry
  // input; typing anything calls dormantReEntrySubmit which POSTs
  // { enable: false } to /api/operator/dormancy and invalidates contexts.
  // Priority ordering: Dormancy > Fallow > Outcome > normal sheet.
  isDormant: boolean;
  dormantReEntrySubmit: (text: string) => Promise<void>;
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
  const [opening, setOpening] = useState<string | null>(null);
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

  // REGEN-02 Plan 02-02: fetch huma_context so we can derive isDormant.
  // Uses the shared queryKeys.humaContext key so useWhole's toggle + this
  // hook's read invalidate each other cleanly.
  const { data: humaContext } = useQuery({
    queryKey: queryKeys.humaContext(userId),
    queryFn: () => fetchHumaContext(userId),
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

  // ─── Return Visit Tracking ──────────────────────────────────────────────
  const returnVisitTrackedRef = useRef(false);
  useEffect(() => {
    if (returnVisitTrackedRef.current || aspirations.length === 0) return;
    returnVisitTrackedRef.current = true;

    // Compute days since last sheet
    let daysSinceLast = 0;
    try {
      const today = new Date(date + "T12:00:00");
      // Check recent sheet cache keys to find last compiled date
      for (let i = 1; i <= 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = `huma-v2-compiled-sheet-${d.toISOString().split("T")[0]}`;
        if (localStorage.getItem(key)) {
          daysSinceLast = i;
          break;
        }
      }
    } catch { /* default 0 */ }

    trackEvent("return_visit", {
      day_count: dayCount,
      days_since_last: daysSinceLast,
    });
  }, [aspirations, date, dayCount]);

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
          setOpening(parsed.opening || null);
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
          setOpening(result.opening || null);

          trackEvent("sheet_compiled", {
            entry_count: result.entries.length,
            day_count: dayCount,
          });

          try {
            localStorage.setItem(cacheKey, JSON.stringify({
              entries: result.entries,
              throughLine: result.throughLine,
              opening: result.opening,
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

  // ─── Structural Insights + Hypotheses (Day 1 value) ─────────────────
  // Progression: Days 1-4 structural only, Days 5-7 + hypotheses, Days 8+ blend
  const [dismissedStructural, setDismissedStructural] = useState<Set<string>>(() => {
    try {
      const cached = localStorage.getItem("huma-v2-dismissed-structural");
      return cached ? new Set(JSON.parse(cached)) : new Set<string>();
    } catch { return new Set<string>(); }
  });

  const [dismissedHypotheses, setDismissedHypotheses] = useState<Set<string>>(() => {
    try {
      const cached = localStorage.getItem("huma-v2-dismissed-hypotheses");
      return cached ? new Set(JSON.parse(cached)) : new Set<string>();
    } catch { return new Set<string>(); }
  });

  const structuralInsights = useMemo(() => {
    if (aspirations.length === 0) return [];
    // Structural insights fade after Day 15 — validated insights take priority
    if (dayCount > 15 && insight) return [];

    const all = generateStructuralInsights(aspirations);
    return all.filter(i => !dismissedStructural.has(i.type));
  }, [aspirations, dayCount, insight, dismissedStructural]);

  const hypotheses = useMemo(() => {
    if (aspirations.length === 0) return [];
    // Hypotheses appear from Day 5+, fade after Day 15
    if (dayCount < 5 || dayCount > 15) return [];

    const ctx = ctxData ?? null;
    const all = generateHypothesizedCorrelations(aspirations, ctx);
    return all.filter(h => !dismissedHypotheses.has(h.id));
  }, [aspirations, dayCount, ctxData, dismissedHypotheses]);

  const dismissStructuralInsight = useCallback((id: string) => {
    setDismissedStructural(prev => {
      // Dismiss by type so the same type doesn't regenerate with a new UUID
      const insight = structuralInsights.find(i => i.id === id);
      const dismissKey = insight?.type || id;
      const next = new Set(prev);
      next.add(dismissKey);
      try {
        localStorage.setItem("huma-v2-dismissed-structural", JSON.stringify([...next]));
      } catch { /* non-critical */ }
      return next;
    });
  }, [structuralInsights]);

  const dismissHypothesis = useCallback((id: string) => {
    setDismissedHypotheses(prev => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem("huma-v2-dismissed-hypotheses", JSON.stringify([...next]));
      } catch { /* non-critical */ }
      return next;
    });
  }, []);

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

      // Invalidate sheet cache so next compilation reflects the check-off
      invalidateSheetCache();

      // Track behavior check event
      trackEvent("behavior_checked", {
        day_count: dayCount,
        checked,
        is_trigger: false,
      });

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

  // ─── Briefing Data ─────────────────────────────────────────────────────

  // Keystone: entry marked focus, or the one touching the most dimensions
  const keystoneEntry = useMemo<SheetEntry | null>(() => {
    if (compiledEntries.length === 0) return null;
    // First entry is typically the focus/trigger
    const first = compiledEntries[0];
    // Find the entry touching the most dimensions
    let best = first;
    let bestCount = first.dimensions?.length || 0;
    for (const entry of compiledEntries) {
      const count = entry.dimensions?.length || 0;
      if (count > bestCount) {
        best = entry;
        bestCount = count;
      }
    }
    return best;
  }, [compiledEntries]);

  // State sentence: which dimensions are moving, which are quiet (dimension-level signal)
  const stateSentence = useMemo<string | null>(() => {
    if (!capitalPulse && compiledEntries.length === 0) return null;

    // If we have pulse data (user has checked things off)
    if (capitalPulse) {
      const parts: string[] = [];
      const moved = capitalPulse.movedDimensions;
      if (moved.length >= 2) {
        const labels = moved.slice(0, 2).map(d => DIMENSION_LABELS[d]);
        parts.push(`${labels.join(" and ")} are moving together today.`);
      } else if (moved.length === 1) {
        parts.push(`${DIMENSION_LABELS[moved[0]]} moved today.`);
      }
      if (capitalPulse.quietDimension) {
        const dim = capitalPulse.quietDimension;
        parts.push(`${DIMENSION_LABELS[dim.key]} has been quiet for ${dim.days} days.`);
      }
      return parts.length > 0 ? parts.join(" ") : null;
    }

    // Pre-check state: derive from today's sheet dimensions
    const allDims = new Set<string>();
    for (const entry of compiledEntries) {
      if (entry.dimensions) {
        for (const d of entry.dimensions) allDims.add(d);
      }
    }
    if (allDims.size >= 2) {
      const arr = Array.from(allDims).slice(0, 3);
      const labels = arr.map(d => DIMENSION_LABELS[d as DimensionKey] || d);
      return `Today touches ${labels.join(", ")}.`;
    }
    return null;
  }, [capitalPulse, compiledEntries]);

  // Watching signal: from quiet dims + hypothesized correlations
  // ("quiet" = dimension-level signal, renamed from "dormant" in REGEN-02 to free
  //  the name for operator-state Dormancy on HumaContext.dormant.)
  const watchingSignal = useMemo<{ text: string; dimensions: [DimensionKey, DimensionKey] } | null>(() => {
    // Use hypothesized correlations if available
    if (hypotheses.length > 0) {
      const h = hypotheses[0];
      if (h.dimensions && h.dimensions.length >= 2) {
        return {
          text: h.hypothesis,
          dimensions: [h.dimensions[0], h.dimensions[1]],
        };
      }
    }
    // Or use quiet dimension data (dimension-level signal — NOT operator-state Dormancy)
    if (capitalPulse?.quietDimension && capitalPulse.quietDimensions.length >= 1) {
      const quiet = capitalPulse.quietDimension;
      // Find a moving dim to pair with
      const moving = capitalPulse.movedDimensions[0];
      if (moving) {
        return {
          text: `${DIMENSION_LABELS[quiet.key]} dropped this week. Worth watching.`,
          dimensions: [quiet.key, moving],
        };
      }
    }
    return null;
  }, [hypotheses, capitalPulse]);

  const checkedCount = checkedEntries.size;
  const isEvening = useMemo(() => new Date().getHours() >= 18, []);

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

  // ─── Outcome Check (REGEN-03 Plan 02-05) ────────────────────────────────
  // Surfaces a 90-day ground-truth prompt (Yes/Some/No/Worse + why) on /today
  // for each aspiration or pattern that has lived ≥ 90 calendar days from its
  // createdAt with no outcome record yet. The /today page renders at most one
  // OutcomeCheckCard per day, gated by `isOutcomeDue && !isDormant && !isFallow`
  // (Dormancy > Fallow > Outcome priority — other plans own those flags).
  //
  // Reading outcome_checks directly via the browser Supabase client (bypasses
  // /api/outcome's withObservability wrapper) is intentional: RLS on
  // outcome_checks gates access by user_id, and writes still flow through
  // /api/outcome + withObservability for audit-log completeness.

  const { data: patternsData } = useQuery({
    queryKey: queryKeys.patterns(userId),
    queryFn: () => fetchPatterns(userId),
    enabled,
  });
  const patterns = patternsData?.patterns ?? [];

  const { data: outcomeRecords = [] } = useQuery<OutcomeRecord[]>({
    queryKey: ["outcomes", userId],
    queryFn: async () => {
      if (!userId) return [];
      const supabase = createClient();
      if (!supabase) return [];
      const { data, error } = await supabase
        .from("outcome_checks")
        .select("target_kind, target_id, answered_at, snooze_count")
        .eq("user_id", userId)
        .order("answered_at", { ascending: false });
      if (error) return [];
      return (data || []) as OutcomeRecord[];
    },
    enabled: enabled && Boolean(userId),
  });

  const nextDueOutcome = useMemo<OutcomeTarget | null>(() => {
    if (aspirations.length === 0 && patterns.length === 0) return null;
    const today = new Date();
    // Skip aspirations whose createdAt wasn't hydrated (pre-REGEN-03 local
    // fallback rows). The 90-day trigger requires a real anchor; absent one
    // no outcome is due — fail-safe (no prompt) is correct for orphan rows.
    const aspirationTargets: OutcomeTarget[] = aspirations
      .filter((a): a is Aspiration & { createdAt: string } => typeof a.createdAt === "string")
      .map((a) => ({
        kind: "aspiration" as const,
        id: a.id,
        createdAt: a.createdAt,
      }));
    const patternTargets: OutcomeTarget[] = patterns.map((p) => ({
      kind: "pattern" as const,
      id: p.id,
      createdAt: p.createdAt,
    }));
    return getNextDueOutcome(aspirationTargets, patternTargets, outcomeRecords, today);
  }, [aspirations, patterns, outcomeRecords]);

  const isOutcomeDue = nextDueOutcome !== null;

  const nextDueOutcomeLabel = useMemo<string>(() => {
    if (!nextDueOutcome) return "";
    if (nextDueOutcome.kind === "aspiration") {
      const asp = aspirations.find((a) => a.id === nextDueOutcome.id);
      return asp?.clarifiedText || asp?.rawText || "Your aspiration";
    }
    const pat = patterns.find((p) => p.id === nextDueOutcome.id);
    return pat?.name || pat?.trigger || "Your pattern";
  }, [nextDueOutcome, aspirations, patterns]);

  const submitOutcome = useCallback(
    async (answer: "yes" | "some" | "no" | "worse", why: string) => {
      if (!nextDueOutcome) return;
      try {
        await fetch("/api/outcome", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            target_kind: nextDueOutcome.kind,
            target_id: nextDueOutcome.id,
            answer,
            why: why || undefined,
          }),
        });
      } finally {
        await queryClient.invalidateQueries({ queryKey: ["outcomes", userId] });
        // pattern evidence.strength may have shifted — nudge pattern cache
        await queryClient.invalidateQueries({ queryKey: queryKeys.patterns(userId) });
      }
    },
    [nextDueOutcome, queryClient, userId],
  );

  // ─── Dormancy (REGEN-02 Plan 02-02) ─────────────────────────────────────
  // Derive isDormant from huma_context.dormant.active. `?.active === true`
  // handles all three missing-field shapes (null humaContext, undefined
  // dormant, dormant.active === false).
  const isDormant =
    (humaContext as { dormant?: { active?: boolean } } | undefined | null)
      ?.dormant?.active === true;

  const dormantReEntrySubmit = useCallback(
    async (_text: string) => {
      // Toggle dormancy off — the text itself is informational for Phase 2
      // (not yet routed to /api/v2-chat; future plan can forward as first
      // message of the re-entry conversation).
      await fetch("/api/operator/dormancy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enable: false }),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.humaContext(userId),
      });
    },
    [queryClient, userId],
  );

  const snoozeOutcome = useCallback(async () => {
    if (!nextDueOutcome) return;
    try {
      await fetch("/api/outcome", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          target_kind: nextDueOutcome.kind,
          target_id: nextDueOutcome.id,
          // placeholder — server treats snooze:true as the control signal
          answer: "some",
          snooze: true,
        }),
      });
    } finally {
      await queryClient.invalidateQueries({ queryKey: ["outcomes", userId] });
    }
  }, [nextDueOutcome, queryClient, userId]);

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
    opening,
    sheetCompiling,
    notifSettingsOpen,
    transitionSignal,
    pushState,
    nudges,
    capitalPulse,
    structuralInsights,
    hypotheses,
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
    dismissStructuralInsight,
    dismissHypothesis,
    isValidationDay,
    validationAspirations,
    handleValidationAnswer,
    keystoneEntry,
    stateSentence,
    watchingSignal,
    checkedCount,
    isEvening,
    // REGEN-03 outcome-check surface
    isOutcomeDue,
    nextDueOutcome,
    nextDueOutcomeLabel,
    submitOutcome,
    snoozeOutcome,
    // REGEN-02 dormancy surface
    isDormant,
    dormantReEntrySubmit,
  };
}
