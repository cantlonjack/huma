"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Pattern, Aspiration, DimensionKey, SparklineData, EmergingBehavior, MergeSuggestion, MonthlyReviewData } from "@/types/v2";
import { DIMENSION_COLORS, DIMENSION_LABELS } from "@/types/v2";
import { useAuth } from "@/components/shared/AuthProvider";
import { createClient } from "@/lib/supabase";
import { displayName } from "@/lib/display-name";
import { extractPatternsFromAspirations } from "@/lib/pattern-extraction";
import { getPatterns, getAspirations, getPatternSparklines, detectEmergingBehaviors, savePattern, detectMergeCandidates, mergePatterns, getMonthlyReviewData, updatePattern, deletePattern } from "@/lib/supabase-v2";

// ─── Exported Helpers ──────────────────────────────────────────────────────

export function statusLabel(status: Pattern["status"]): string {
  if (status === "validated") return "Validated";
  if (status === "working") return "Working";
  return "Finding";
}

export function statusColor(status: Pattern["status"]): { bg: string; text: string } {
  if (status === "validated") return { bg: "var(--color-sage-100)", text: "var(--color-sage-700)" };
  if (status === "working") return { bg: "var(--color-amber-100)", text: "var(--color-amber-600)" };
  return { bg: "var(--color-sand-100)", text: "var(--color-sage-400)" };
}

export function validationPercent(pattern: Pattern): number {
  if (pattern.validationTarget <= 0) return 0;
  return Math.min(100, Math.round((pattern.validationCount / pattern.validationTarget) * 100));
}

export function progressBarColor(status: Pattern["status"]): string {
  if (status === "validated") return "var(--color-sage-700)";
  if (status === "working") return "var(--color-amber-600)";
  return "var(--color-sage-300)";
}

export const ARCHETYPE_DOMAINS: Record<string, DimensionKey[]> = {
  "Earth Tender": ["body", "home"],
  "Creator": ["growth", "joy"],
  "Entrepreneur": ["money", "growth"],
  "Parent": ["people", "home"],
  "Educator": ["growth", "people"],
  "Spirit": ["purpose", "identity"],
};

/** Check if a pattern's aspiration dimensions overlap with an archetype's domain */
export function getArchetypeMatch(
  pattern: Pattern,
  aspirations: Aspiration[],
  primaryArchetype: string | undefined,
): string | null {
  if (!primaryArchetype) return null;
  const domains = ARCHETYPE_DOMAINS[primaryArchetype];
  if (!domains) return null;

  const asp = aspirations.find(a => a.id === pattern.aspirationId);
  if (!asp) return null;

  const aspDims = (asp.dimensionsTouched || []) as string[];
  const behaviorDims = (asp.behaviors || []).flatMap(b =>
    (b.dimensions || []).map(d => typeof d === "string" ? d : d.dimension)
  );
  const allDims = new Set([...aspDims, ...behaviorDims]);

  if (domains.some(d => allDims.has(d))) return primaryArchetype;
  return null;
}

/** Get ALL dimensions touched across all steps in a pattern, deduplicated */
export function getAllStepDimensions(pattern: Pattern, aspirations: Aspiration[]): DimensionKey[] {
  const asp = aspirations.find(a => a.id === pattern.aspirationId);
  if (!asp) return [];

  const seen = new Set<DimensionKey>();
  for (const step of pattern.steps) {
    const stepText = step.text.toLowerCase().trim();
    const behavior = asp.behaviors?.find(b => b.text.toLowerCase().trim() === stepText);
    if (behavior?.dimensions) {
      for (const d of behavior.dimensions) {
        const dim = typeof d === "string" ? d : d.dimension;
        if (dim) seen.add(dim as DimensionKey);
      }
    }
  }
  return Array.from(seen);
}

/** Get the display name of a pattern's source aspiration */
export function getAspirationName(pattern: Pattern, aspirations: Aspiration[]): string | null {
  const asp = aspirations.find(a => a.id === pattern.aspirationId);
  if (!asp) return null;
  return displayName(asp.title || asp.clarifiedText || asp.rawText);
}

/** Get coming_up and longer_arc data from the source aspiration */
export function getAspirationPhases(pattern: Pattern, aspirations: Aspiration[]): {
  comingUp: import("@/types/v2").FutureAction[];
  longerArc: import("@/types/v2").FuturePhase[];
} {
  const asp = aspirations.find(a => a.id === pattern.aspirationId);
  return {
    comingUp: asp?.comingUp ?? [],
    longerArc: asp?.longerArc ?? [],
  };
}

/** Get the dimensions that a trigger behavior touches, by looking up the aspiration */
export function getTriggerDimensions(pattern: Pattern, aspirations: Aspiration[]): DimensionKey[] {
  const asp = aspirations.find(a => a.id === pattern.aspirationId);
  if (!asp) return [];

  const triggerText = pattern.trigger.toLowerCase().trim();
  const behavior = asp.behaviors?.find(b => b.text.toLowerCase().trim() === triggerText);
  if (!behavior?.dimensions) return [];

  return behavior.dimensions
    .map(d => typeof d === "string" ? d : d.dimension)
    .filter(Boolean) as DimensionKey[];
}

/** Detect if trigger behavior is shared across multiple aspirations */
export function getSharedCaption(pattern: Pattern, aspirations: Aspiration[]): string | null {
  const triggerText = pattern.trigger.toLowerCase().trim();
  const shared = aspirations.filter(a =>
    a.id !== pattern.aspirationId &&
    a.behaviors?.some(b => b.text.toLowerCase().trim() === triggerText)
  );
  if (shared.length === 0) return null;
  if (shared.length === 1) {
    const name = displayName(shared[0].clarifiedText || shared[0].rawText);
    return `Shared with ${name}`;
  }
  return `Shared across ${shared.length + 1} patterns`;
}

/** Find the approximate date where a dropping pattern started declining */
export function findDropOffDate(points: SparklineData["points"]): string | null {
  if (points.length < 4) return null;
  const mid = Math.floor(points.length / 2);
  // Walk backward from midpoint to find last "good" day (ratio >= 0.5)
  for (let i = mid; i >= 0; i--) {
    if (points[i].ratio >= 0.5) {
      return points[i].date;
    }
  }
  // Fallback: use the point with highest ratio in first half
  let best = 0;
  for (let i = 1; i < mid; i++) {
    if (points[i].ratio > points[best].ratio) best = i;
  }
  return points[best].date;
}

/** Format a YYYY-MM-DD date as a readable string like "March 21" */
export function formatDropDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

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
  const [loading, setLoading] = useState(true);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [archetypes, setArchetypes] = useState<string[]>([]);
  const [whyStatement, setWhyStatement] = useState<string | null>(null);
  const [sparklines, setSparklines] = useState<Map<string, SparklineData>>(new Map());
  const [emergingBehaviors, setEmergingBehaviors] = useState<EmergingBehavior[]>([]);
  const [investigatePatternId, setInvestigatePatternId] = useState<string | null>(null);
  const [newAspirationOpen, setNewAspirationOpen] = useState(false);
  const [dismissedMerges, setDismissedMerges] = useState<Set<string>>(new Set());
  const [monthlyReview, setMonthlyReview] = useState<MonthlyReviewData | null>(null);

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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to Supabase if authenticated
    if (user) {
      try {
        const sb = createClient();
        if (sb) await savePattern(sb, user.id, newPattern);
      } catch { /* fall through to localStorage */ }
    }

    // Save to localStorage as fallback
    try {
      const saved = localStorage.getItem("huma-v2-patterns");
      const all = saved ? JSON.parse(saved) : [];
      all.push(newPattern);
      localStorage.setItem("huma-v2-patterns", JSON.stringify(all));
    } catch { /* non-critical */ }

    // Update local state
    setPatterns(prev => [...prev, newPattern]);
    setEmergingBehaviors(prev => prev.filter(b => b.behaviorKey !== behavior.behaviorKey));
  }, [user]);

  const handleDismissEmergence = useCallback((behaviorKey: string) => {
    // Persist dismissal so it doesn't reappear this session
    try {
      const saved = localStorage.getItem("huma-v2-dismissed-emergences");
      const dismissed: string[] = saved ? JSON.parse(saved) : [];
      if (!dismissed.includes(behaviorKey)) {
        dismissed.push(behaviorKey);
        localStorage.setItem("huma-v2-dismissed-emergences", JSON.stringify(dismissed));
      }
    } catch { /* non-critical */ }

    setEmergingBehaviors(prev => prev.filter(b => b.behaviorKey !== behaviorKey));
  }, []);

  const handleMerge = useCallback(async (primaryId: string, secondaryId: string) => {
    if (!user) return;
    try {
      const sb = createClient();
      if (!sb) return;
      const merged = await mergePatterns(sb, user.id, primaryId, secondaryId, patterns);
      // Update local state: replace primary, remove secondary
      setPatterns(prev =>
        prev.filter(p => p.id !== secondaryId).map(p => p.id === primaryId ? merged : p)
      );
    } catch {
      // Fallback: just dismiss the suggestion
      setDismissedMerges(prev => new Set(prev).add(`${primaryId}:${secondaryId}`));
    }
  }, [user, patterns]);

  const handleDismissMerge = useCallback((patternId: string, otherPatternId: string) => {
    // Dismiss both directions
    setDismissedMerges(prev => {
      const next = new Set(prev);
      next.add(`${patternId}:${otherPatternId}`);
      next.add(`${otherPatternId}:${patternId}`);
      return next;
    });
    // Persist dismissals
    try {
      const key = "huma-v2-dismissed-merges";
      const saved = localStorage.getItem(key);
      const list: string[] = saved ? JSON.parse(saved) : [];
      list.push(`${patternId}:${otherPatternId}`, `${otherPatternId}:${patternId}`);
      localStorage.setItem(key, JSON.stringify(list));
    } catch { /* non-critical */ }
  }, []);

  // ─── Pattern management: update, archive, remove ────────────────────────
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [archiveToast, setArchiveToast] = useState<{ id: string; name: string } | null>(null);
  const archivedPatternRef = useRef<Pattern | null>(null);

  const handlePatternUpdate = useCallback(async (
    patternId: string,
    updates: Partial<Pick<Pattern, "name" | "trigger" | "steps" | "timeWindow">>
  ) => {
    // Update local state immediately
    setPatterns(prev => prev.map(p => {
      if (p.id !== patternId) return p;
      return { ...p, ...updates, updatedAt: new Date().toISOString() };
    }));

    // Persist to Supabase
    if (user) {
      try {
        const sb = createClient();
        if (sb) await updatePattern(sb, patternId, user.id, updates);
      } catch { /* non-critical, local state already updated */ }
    }

    // Persist to localStorage for pre-auth
    try {
      const saved = localStorage.getItem("huma-v2-patterns");
      if (saved) {
        const all: Pattern[] = JSON.parse(saved);
        const updated = all.map(p => p.id === patternId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p);
        localStorage.setItem("huma-v2-patterns", JSON.stringify(updated));
      }
    } catch { /* non-critical */ }
  }, [user]);

  const handlePatternArchive = useCallback(async (patternId: string) => {
    const pat = patterns.find(p => p.id === patternId);
    if (!pat) return;

    // Store for undo
    archivedPatternRef.current = pat;

    // Remove from view
    setPatterns(prev => prev.filter(p => p.id !== patternId));
    setArchiveToast({ id: patternId, name: pat.name });

    // Delete from Supabase (re-saved on undo)
    if (user) {
      try {
        const sb = createClient();
        if (sb) await deletePattern(sb, patternId, user.id);
      } catch { /* non-critical */ }
    }

    // Remove from localStorage
    try {
      const saved = localStorage.getItem("huma-v2-patterns");
      if (saved) {
        const all: Pattern[] = JSON.parse(saved);
        localStorage.setItem("huma-v2-patterns", JSON.stringify(all.filter(p => p.id !== patternId)));
      }
    } catch { /* non-critical */ }

    // Clear cached sheet to force recompile
    try {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.removeItem(`huma-v2-sheet-${today}`);
    } catch { /* non-critical */ }

    // Auto-dismiss toast after 5 seconds
    setTimeout(() => {
      setArchiveToast(prev => prev?.id === patternId ? null : prev);
    }, 5000);
  }, [user, patterns]);

  const handleArchiveUndo = useCallback(async () => {
    if (!archiveToast || !archivedPatternRef.current) return;
    const restored = archivedPatternRef.current;
    archivedPatternRef.current = null;

    // Add back to local state
    setPatterns(prev => [...prev, restored]);

    // Re-save to Supabase
    if (user) {
      try {
        const sb = createClient();
        if (sb) await savePattern(sb, user.id, restored);
      } catch { /* non-critical */ }
    }

    // Re-add to localStorage
    try {
      const saved = localStorage.getItem("huma-v2-patterns");
      const all: Pattern[] = saved ? JSON.parse(saved) : [];
      all.push(restored);
      localStorage.setItem("huma-v2-patterns", JSON.stringify(all));
    } catch { /* non-critical */ }

    setArchiveToast(null);
  }, [user, archiveToast]);

  const handlePatternRemove = useCallback((patternId: string) => {
    setConfirmRemoveId(patternId);
  }, []);

  const confirmPatternRemove = useCallback(async () => {
    if (!confirmRemoveId) return;
    const patternId = confirmRemoveId;
    setConfirmRemoveId(null);

    // Remove from local state
    setPatterns(prev => prev.filter(p => p.id !== patternId));

    // Delete from Supabase
    if (user) {
      try {
        const sb = createClient();
        if (sb) await deletePattern(sb, patternId, user.id);
      } catch { /* non-critical */ }
    }

    // Remove from localStorage
    try {
      const saved = localStorage.getItem("huma-v2-patterns");
      if (saved) {
        const all: Pattern[] = JSON.parse(saved);
        localStorage.setItem("huma-v2-patterns", JSON.stringify(all.filter(p => p.id !== patternId)));
      }
    } catch { /* non-critical */ }

    // Clear cached sheet to force recompile
    try {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.removeItem(`huma-v2-sheet-${today}`);
    } catch { /* non-critical */ }
  }, [user, confirmRemoveId]);

  const confirmRemovePatternObj = confirmRemoveId ? patterns.find(p => p.id === confirmRemoveId) : null;

  // ─── Merge suggestions (computed from current patterns) ─────────────────
  const mergeSuggestions = (() => {
    if (patterns.length < 2) return new Map<string, MergeSuggestion>();
    const all = detectMergeCandidates(patterns);
    // Load persisted dismissals on first render
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

  // ─── Data Loading ───────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;

    async function loadData() {
      setLoading(true);
      let loadedPatterns: Pattern[] = [];
      let loadedAspirations: Aspiration[] = [];

      const supabase = user ? createClient() : null;

      // Load patterns from Supabase
      if (supabase && user) {
        try {
          loadedPatterns = await getPatterns(supabase, user.id);
        } catch { /* fallback to localStorage */ }
      }

      // Fallback: localStorage patterns
      if (loadedPatterns.length === 0) {
        try {
          const saved = localStorage.getItem("huma-v2-patterns");
          if (saved) loadedPatterns = JSON.parse(saved);
        } catch { /* fresh */ }
      }

      // If still no patterns, try extracting from aspirations
      if (loadedPatterns.length === 0) {
        if (supabase && user) {
          try {
            loadedAspirations = await getAspirations(supabase, user.id);
          } catch { /* fallback */ }
        }

        if (loadedAspirations.length === 0) {
          try {
            const saved = localStorage.getItem("huma-v2-aspirations");
            if (saved) loadedAspirations = JSON.parse(saved);
          } catch { /* fresh */ }
        }

        if (loadedAspirations.length > 0) {
          loadedPatterns = extractPatternsFromAspirations(loadedAspirations);
        }
      } else {
        // Still load aspirations for context
        if (supabase && user) {
          try {
            loadedAspirations = await getAspirations(supabase, user.id);
          } catch { /* non-critical */ }
        }
        if (loadedAspirations.length === 0) {
          try {
            const saved = localStorage.getItem("huma-v2-aspirations");
            if (saved) loadedAspirations = JSON.parse(saved);
          } catch { /* fresh */ }
        }
      }

      setPatterns(loadedPatterns);
      setAspirations(loadedAspirations);

      // Load archetypes + WHY for chat context and display
      let loadedArchetypes: string[] = [];
      let loadedWhy: string | null = null;
      if (supabase && user) {
        try {
          const { getKnownContext } = await import("@/lib/supabase-v2");
          const ctx = await getKnownContext(supabase, user.id);
          const savedArchs = ctx.archetypes as string[] | undefined;
          if (savedArchs?.length) loadedArchetypes = savedArchs;
          if (ctx.why_statement) loadedWhy = ctx.why_statement as string;
        } catch { /* non-critical */ }
      }
      if (loadedArchetypes.length === 0 || !loadedWhy) {
        try {
          const localCtx = localStorage.getItem("huma-v2-known-context");
          if (localCtx) {
            const parsed = JSON.parse(localCtx);
            if (parsed.archetypes?.length > 0 && loadedArchetypes.length === 0) loadedArchetypes = parsed.archetypes;
            if (parsed.why_statement && !loadedWhy) loadedWhy = parsed.why_statement;
          }
        } catch { /* fresh */ }
      }
      setArchetypes(loadedArchetypes);
      setWhyStatement(loadedWhy);

      // Load sparkline data for all patterns (requires auth + behavior_log)
      if (supabase && user && loadedPatterns.length > 0) {
        try {
          const sparklineData = await getPatternSparklines(supabase, user.id, loadedPatterns);
          const map = new Map<string, SparklineData>();
          for (const s of sparklineData) map.set(s.patternId, s);
          setSparklines(map);
        } catch { /* non-critical — sparklines are a progressive enhancement */ }
      }

      // Detect emerging behaviors (requires auth + behavior_log data)
      if (supabase && user) {
        try {
          const emerging = await detectEmergingBehaviors(
            supabase, user.id, loadedPatterns, loadedAspirations
          );
          // Filter out previously dismissed emergences
          let dismissed: string[] = [];
          try {
            const saved = localStorage.getItem("huma-v2-dismissed-emergences");
            if (saved) dismissed = JSON.parse(saved);
          } catch { /* fresh */ }
          const filtered = emerging.filter(b => !dismissed.includes(b.behaviorKey));
          setEmergingBehaviors(filtered);
        } catch { /* non-critical */ }
      }

      // Monthly review (requires auth + behavior_log history)
      if (supabase && user) {
        try {
          const review = await getMonthlyReviewData(supabase, user.id, loadedAspirations);
          setMonthlyReview(review);
        } catch { /* non-critical */ }
      }

      setLoading(false);
    }

    loadData();
  }, [user, authLoading]);

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

  // Build the initial HUMA message for dropping pattern investigation
  let investigateMessage: string | undefined;
  if (investigatePattern && investigateSparkline?.trend === "dropping") {
    const dropDate = findDropOffDate(investigateSparkline.points);
    const dateStr = dropDate ? ` after ${formatDropDate(dropDate)}` : "";
    investigateMessage = `Your ${displayName(investigatePattern.name)} dropped off${dateStr}. What changed?`;
  }

  // Enrich tabContext with selected pattern details when investigating
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
    // State
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

    // Derived
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

    // Setters
    setNewAspirationOpen,
    setConfirmRemoveId,

    // Handlers
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
