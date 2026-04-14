"use client";

import { useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Pattern, Aspiration, DimensionKey, SparklineData, EmergingBehavior, MergeSuggestion, MonthlyReviewData } from "@/types/v2";
import { DIMENSION_COLORS, DIMENSION_LABELS } from "@/types/v2";
import { useAuth } from "@/components/shared/AuthProvider";
import { createClient } from "@/lib/supabase";
import { displayName } from "@/lib/display-name";
import { findDropOffDate, formatDropDate, getAspirationName } from "@/lib/grow-utils";
import { detectMergeCandidates, mergePatterns } from "@/lib/supabase-v2";
import {
  storeSavePattern,
  storeUpdatePattern,
  storeDeletePattern,
  clearTodaySheetCache,
} from "@/lib/db/store";
import {
  queryKeys,
  fetchPatterns,
  fetchKnownContext,
  fetchSparklines,
  fetchEmergingBehaviors,
  fetchMonthlyReview,
  fetchCompletionStats,
  fetchBehaviorFrequencies,
  fetchBehaviorCorrelations,
} from "@/lib/queries";

// Re-export helpers from their canonical location for backwards compatibility
export {
  statusLabel, statusColor, validationPercent, progressBarColor,
  ARCHETYPE_DOMAINS, getArchetypeMatch, getAllStepDimensions,
  getAspirationName, getAspirationPhases, getTriggerDimensions,
  getSharedCaption, findDropOffDate, formatDropDate,
} from "@/lib/grow-utils";

// ─── Stage Type ────────────────────────────────────────────────────────────

export type GrowStage = "early" | "frequency" | "correlation" | "patterns";

// ─── Hook Return Type ──────────────────────────────────────────────────────

export interface UseGrowReturn {
  // State
  loading: boolean;
  patterns: Pattern[];
  aspirations: Aspiration[];
  expandedId: string | null;
  archetypes: string[];
  whyStatement: string | null;
  sparklines: Map<string, SparklineData>;
  emergingBehaviors: EmergingBehavior[];
  investigatePatternId: string | null;
  newAspirationOpen: boolean;
  monthlyReview: MonthlyReviewData | null;
  archiveToast: { id: string; name: string } | null;
  confirmRemoveId: string | null;

  // Progressive disclosure
  stage: GrowStage;
  completionStats: { checked: number; total: number };
  behaviorFrequencies: Array<{ behaviorKey: string; behaviorName: string; completed: number; totalDays: number }>;
  behaviorCorrelations: Array<{ behaviorA: string; behaviorB: string; coRate: number; withoutRate: number }>;

  // Derived
  dayCount: number;
  tabContext: Record<string, unknown>;
  investigatePattern: Pattern | null;
  investigateSparkline: SparklineData | null;
  investigateMessage: string | undefined;
  validated: Pattern[];
  working: Pattern[];
  finding: Pattern[];
  mergeSuggestions: Map<string, MergeSuggestion>;
  confirmRemovePattern: Pattern | undefined | null;

  // Setters
  setNewAspirationOpen: (open: boolean) => void;
  setConfirmRemoveId: (id: string | null) => void;

  // Handlers
  handleToggleExpand: (id: string) => void;
  handleInvestigate: (patternId: string) => void;
  handleChatClose: () => void;
  handleFormalize: (behavior: EmergingBehavior, name: string) => void;
  handleDismissEmergence: (behaviorKey: string) => void;
  handleMerge: (primaryId: string, secondaryId: string) => void;
  handleDismissMerge: (patternId: string, otherPatternId: string) => void;
  handlePatternUpdate: (patternId: string, updates: Partial<Pick<Pattern, "name" | "trigger" | "steps" | "timeWindow">>) => void;
  handlePatternArchive: (patternId: string) => void;
  handleArchiveUndo: () => void;
  handlePatternRemove: (patternId: string) => void;
  confirmPatternRemove: () => void;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useGrow(): UseGrowReturn {
  const { user, loading: authLoading } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [investigatePatternId, setInvestigatePatternId] = useState<string | null>(null);
  const [newAspirationOpen, setNewAspirationOpen] = useState(false);
  const [dismissedMerges, setDismissedMerges] = useState<Set<string>>(new Set());
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [archiveToast, setArchiveToast] = useState<{ id: string; name: string } | null>(null);
  const archivedPatternRef = useRef<Pattern | null>(null);

  // Local overrides for optimistic updates to patterns/emerging
  const [localPatterns, setLocalPatterns] = useState<Pattern[] | null>(null);
  const [localEmerging, setLocalEmerging] = useState<EmergingBehavior[] | null>(null);

  const userId = user?.id ?? null;
  const enabled = !authLoading;

  // ─── React Query: Data Loading ──────────────────────────────────────────

  const { data: patternData, isLoading: patternLoading } = useQuery({
    queryKey: queryKeys.patterns(userId),
    queryFn: () => fetchPatterns(userId),
    enabled,
  });

  const serverPatterns = patternData?.patterns ?? [];
  const patterns = localPatterns ?? serverPatterns;
  const aspirations = patternData?.aspirations ?? [];

  const { data: ctxData } = useQuery({
    queryKey: queryKeys.knownContext(userId),
    queryFn: () => fetchKnownContext(userId),
    enabled,
  });

  const archetypes = (() => {
    const saved = ctxData?.archetypes as string[] | undefined;
    return saved && Array.isArray(saved) && saved.length > 0 ? saved : [];
  })();
  const whyStatement = (ctxData?.why_statement as string) || null;

  const { data: sparklines = new Map<string, SparklineData>() } = useQuery({
    queryKey: queryKeys.sparklines(userId ?? "__anon"),
    queryFn: () => fetchSparklines(userId!, patterns),
    enabled: enabled && !!userId && patterns.length > 0,
  });

  const { data: serverEmerging = [] } = useQuery({
    queryKey: queryKeys.emergingBehaviors(userId ?? "__anon"),
    queryFn: () => fetchEmergingBehaviors(userId!, patterns, aspirations),
    enabled: enabled && !!userId,
  });

  const emergingBehaviors = localEmerging ?? serverEmerging;

  const { data: monthlyReview = null } = useQuery({
    queryKey: queryKeys.monthlyReview(userId ?? "__anon"),
    queryFn: () => fetchMonthlyReview(userId!, aspirations),
    enabled: enabled && !!userId,
  });

  const loading = patternLoading;

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  const handleInvestigate = useCallback((patternId: string) => {
    setInvestigatePatternId(patternId);
  }, []);

  const handleChatClose = useCallback(() => {
    setInvestigatePatternId(null);
    setNewAspirationOpen(false);
  }, []);

  const handleFormalize = useCallback(async (behavior: EmergingBehavior, name: string) => {
    const newPattern: Pattern = {
      id: crypto.randomUUID(),
      aspirationId: behavior.aspirationId || "",
      name,
      trigger: behavior.behaviorName,
      steps: [{
        behaviorKey: behavior.behaviorKey,
        text: behavior.behaviorName,
        order: 0,
        isTrigger: true,
      }],
      validationCount: 0,
      validationTarget: 30,
      status: "finding",
      provenance: { source: "formalized" },
      evidence: { confidence: "seed", contextTags: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storeSavePattern(user?.id ?? null, newPattern).catch(() => {});
    setLocalPatterns(prev => [...(prev ?? patterns), newPattern]);
    setLocalEmerging(prev => (prev ?? emergingBehaviors).filter(b => b.behaviorKey !== behavior.behaviorKey));
  }, [user, patterns, emergingBehaviors]);

  const handleDismissEmergence = useCallback((behaviorKey: string) => {
    try {
      const saved = localStorage.getItem("huma-v2-dismissed-emergences");
      const dismissed: string[] = saved ? JSON.parse(saved) : [];
      if (!dismissed.includes(behaviorKey)) {
        dismissed.push(behaviorKey);
        localStorage.setItem("huma-v2-dismissed-emergences", JSON.stringify(dismissed));
      }
    } catch { /* non-critical */ }

    setLocalEmerging(prev => (prev ?? emergingBehaviors).filter(b => b.behaviorKey !== behaviorKey));
  }, [emergingBehaviors]);

  const handleMerge = useCallback(async (primaryId: string, secondaryId: string) => {
    if (!user) return;
    try {
      const sb = createClient();
      if (!sb) return;
      const merged = await mergePatterns(sb, user.id, primaryId, secondaryId, patterns);
      setLocalPatterns(prev =>
        (prev ?? patterns).filter(p => p.id !== secondaryId).map(p => p.id === primaryId ? merged : p)
      );
    } catch {
      setDismissedMerges(prev => new Set(prev).add(`${primaryId}:${secondaryId}`));
    }
  }, [user, patterns]);

  const handleDismissMerge = useCallback((patternId: string, otherPatternId: string) => {
    setDismissedMerges(prev => {
      const next = new Set(prev);
      next.add(`${patternId}:${otherPatternId}`);
      next.add(`${otherPatternId}:${patternId}`);
      return next;
    });
    try {
      const key = "huma-v2-dismissed-merges";
      const saved = localStorage.getItem(key);
      const list: string[] = saved ? JSON.parse(saved) : [];
      list.push(`${patternId}:${otherPatternId}`, `${otherPatternId}:${patternId}`);
      localStorage.setItem(key, JSON.stringify(list));
    } catch { /* non-critical */ }
  }, []);

  const handlePatternUpdate = useCallback(async (
    patternId: string,
    updates: Partial<Pick<Pattern, "name" | "trigger" | "steps" | "timeWindow" | "provenance" | "composition" | "evidence">>
  ) => {
    setLocalPatterns(prev => (prev ?? patterns).map(p => {
      if (p.id !== patternId) return p;
      return { ...p, ...updates, updatedAt: new Date().toISOString() };
    }));

    storeUpdatePattern(user?.id ?? null, patternId, updates).catch(() => {});
  }, [user, patterns]);

  const handlePatternArchive = useCallback(async (patternId: string) => {
    const pat = patterns.find(p => p.id === patternId);
    if (!pat) return;

    archivedPatternRef.current = pat;
    setLocalPatterns(prev => (prev ?? patterns).filter(p => p.id !== patternId));
    setArchiveToast({ id: patternId, name: pat.name });

    storeDeletePattern(user?.id ?? null, patternId).catch(() => {});
    clearTodaySheetCache();

    setTimeout(() => {
      setArchiveToast(prev => prev?.id === patternId ? null : prev);
    }, 5000);
  }, [user, patterns]);

  const handleArchiveUndo = useCallback(async () => {
    if (!archiveToast || !archivedPatternRef.current) return;
    const restored = archivedPatternRef.current;
    archivedPatternRef.current = null;

    setLocalPatterns(prev => [...(prev ?? patterns), restored]);
    storeSavePattern(user?.id ?? null, restored).catch(() => {});
    setArchiveToast(null);
  }, [user, archiveToast, patterns]);

  const handlePatternRemove = useCallback((patternId: string) => {
    setConfirmRemoveId(patternId);
  }, []);

  const confirmPatternRemove = useCallback(async () => {
    if (!confirmRemoveId) return;
    const patternId = confirmRemoveId;
    setConfirmRemoveId(null);

    setLocalPatterns(prev => (prev ?? patterns).filter(p => p.id !== patternId));
    storeDeletePattern(user?.id ?? null, patternId).catch(() => {});
    clearTodaySheetCache();
  }, [user, confirmRemoveId, patterns]);

  const confirmRemovePatternObj = confirmRemoveId ? patterns.find(p => p.id === confirmRemoveId) : null;

  // ─── Merge suggestions (computed from current patterns) ─────────────────
  const mergeSuggestions = (() => {
    if (patterns.length < 2) return new Map<string, MergeSuggestion>();
    const all = detectMergeCandidates(patterns);
    let persisted: string[] = [];
    try {
      const saved = localStorage.getItem("huma-v2-dismissed-merges");
      if (saved) persisted = JSON.parse(saved);
    } catch { /* fresh */ }
    const dismissed = new Set([...dismissedMerges, ...persisted]);
    const map = new Map<string, MergeSuggestion>();
    for (const s of all) {
      if (!dismissed.has(`${s.patternId}:${s.otherPatternId}`)) {
        map.set(s.patternId, s);
      }
    }
    return map;
  })();

  // ─── Day count ─────────────────────────────────────────────────────────
  const dayCount = (() => {
    try {
      const start = localStorage.getItem("huma-v2-start-date");
      if (start) {
        const diff = Math.ceil((Date.now() - new Date(start).getTime()) / 86400000);
        return diff > 0 ? diff : 1;
      }
    } catch { /* fresh */ }
    return 1;
  })();

  const stage: GrowStage =
    dayCount >= 14 ? "patterns" :
    dayCount >= 7  ? "correlation" :
    dayCount >= 4  ? "frequency" :
    "early";

  const { data: completionStats = { checked: 0, total: 0 } } = useQuery({
    queryKey: queryKeys.completionStats(userId ?? "__anon"),
    queryFn: () => fetchCompletionStats(userId!),
    enabled: enabled && !!userId && stage === "early",
  });

  const freqDays = Math.min(dayCount, 7);
  const { data: behaviorFrequencies = [] } = useQuery({
    queryKey: queryKeys.behaviorFrequencies(userId ?? "__anon", freqDays),
    queryFn: () => fetchBehaviorFrequencies(userId!, freqDays),
    enabled: enabled && !!userId && (stage === "frequency" || stage === "correlation"),
  });

  const { data: behaviorCorrelations = [] } = useQuery({
    queryKey: queryKeys.behaviorCorrelations(userId ?? "__anon"),
    queryFn: () => fetchBehaviorCorrelations(userId!, Math.min(dayCount, 14)),
    enabled: enabled && !!userId && stage === "correlation",
  });

  // ─── Chat context for Grow tab ──────────────────────────────────────────
  const tabContext: Record<string, unknown> = {};
  if (patterns.length > 0) {
    tabContext.patterns = patterns.map(p => ({
      name: p.name,
      trigger: p.trigger,
      status: p.status,
      validationCount: p.validationCount,
      validationTarget: p.validationTarget,
      stepCount: p.steps.length,
    }));
  }
  if (aspirations.length > 0) {
    tabContext.aspirationCount = aspirations.length;
  }
  tabContext.dayCount = dayCount;
  if (archetypes.length > 0) tabContext.archetypes = archetypes;
  if (whyStatement) tabContext.whyStatement = whyStatement;
  if (emergingBehaviors.length > 0) {
    tabContext.emergingBehaviors = emergingBehaviors.map(b => ({
      name: b.behaviorName,
      completedDays: b.completedDays,
    }));
  }
  if (sparklines.size > 0) {
    const trends: Record<string, string> = {};
    sparklines.forEach((s) => { if (s.trend !== "stable") trends[s.patternId] = s.trend; });
    if (Object.keys(trends).length > 0) tabContext.patternTrends = trends;
  }

  // ─── "What changed?" investigation ─────────────────────────────────────
  const investigatePattern = investigatePatternId
    ? patterns.find(p => p.id === investigatePatternId) ?? null
    : null;
  const investigateSparkline = investigatePatternId
    ? sparklines.get(investigatePatternId) ?? null
    : null;

  let investigateMessage: string | undefined;
  if (investigatePattern && investigateSparkline?.trend === "dropping") {
    const dropDate = findDropOffDate(investigateSparkline.points);
    const dateStr = dropDate ? ` after ${formatDropDate(dropDate)}` : "";
    investigateMessage = `Your ${displayName(investigatePattern.name)} dropped off${dateStr}. What changed?`;
  }

  if (investigatePattern && investigateSparkline) {
    tabContext.selectedPattern = {
      id: investigatePattern.id,
      name: investigatePattern.name,
      trigger: investigatePattern.trigger,
      steps: investigatePattern.steps.map(s => s.text),
      status: investigatePattern.status,
      validationCount: investigatePattern.validationCount,
      validationTarget: investigatePattern.validationTarget,
      trend: investigateSparkline.trend,
      sparklinePoints: investigateSparkline.points,
      aspirationName: getAspirationName(investigatePattern, aspirations),
    };
  }

  // ─── Group patterns by status ──────────────────────────────────────────
  const validated = patterns.filter(p => p.status === "validated");
  const working = patterns.filter(p => p.status === "working");
  const finding = patterns.filter(p => p.status === "finding");

  return {
    loading,
    patterns,
    aspirations,
    expandedId,
    archetypes,
    whyStatement,
    sparklines,
    emergingBehaviors,
    investigatePatternId,
    newAspirationOpen,
    monthlyReview,
    archiveToast,
    confirmRemoveId,
    stage,
    completionStats,
    behaviorFrequencies,
    behaviorCorrelations,
    dayCount,
    tabContext,
    investigatePattern,
    investigateSparkline,
    investigateMessage,
    validated,
    working,
    finding,
    mergeSuggestions,
    confirmRemovePattern: confirmRemovePatternObj,
    setNewAspirationOpen,
    setConfirmRemoveId,
    handleToggleExpand,
    handleInvestigate,
    handleChatClose,
    handleFormalize,
    handleDismissEmergence,
    handleMerge,
    handleDismissMerge,
    handlePatternUpdate,
    handlePatternArchive,
    handleArchiveUndo,
    handlePatternRemove,
    confirmPatternRemove,
  };
}
