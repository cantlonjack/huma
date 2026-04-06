"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { HolonNode, HolonLink, InsightAnnotation } from "@/components/whole/WholeShape";
import type { WhyEvolutionData } from "@/components/whole/WhyEvolution";
import { useAuth } from "@/components/shared/AuthProvider";
import { createClient } from "@/lib/supabase";
import type { Aspiration, Insight, Principle, KnownContext, Pattern, Behavior, FutureAction, FuturePhase } from "@/types/v2";
import type { CanvasData } from "@/engine/canvas-types";
import { buildNodes, computeDimensionLinks, serializeContext } from "@/lib/whole-utils";
import { withSupabase, clearCachedSheet, updateLocalAspiration as updateLocalAspirationStorage } from "@/lib/persist";
import {
  markInsightDelivered,
  updateWhyStatement,
  updateKnownContext,
  getBehavioralSummary,
  archiveAspiration,
  deleteAspiration,
  updateAspirationStatus,
  removeContextField,
  deletePrinciple,
  removeLocalAspiration,
  archiveLocalAspiration,
  restoreLocalAspiration,
  removeLocalContextField,
  clearChatMessages,
  clearLocalChatMessages,
  clearLocalStorageContext,
  clearAllUserData,
  clearAllLocalStorage,
  updateAspirationName,
  updateAspirationBehaviors,
  updateAspirationFuture,
  getPatternsByAspiration,
  type AspirationCorrelation,
} from "@/lib/supabase-v2";
import {
  queryKeys,
  fetchAllAspirations,
  fetchKnownContext,
  fetchUndeliveredInsight,
  fetchWhyStatement,
  fetchPrinciples,
  fetchCorrelations,
  fetchRecentInsights,
  fetchPatterns,
} from "@/lib/queries";

// ─── Return type ────────────────────────────────────────────────────────────

export interface UseWholeReturn {
  // Auth & routing
  user: ReturnType<typeof useAuth>["user"];
  router: ReturnType<typeof useRouter>;

  // Core data
  aspirations: Aspiration[];
  context: KnownContext;
  rawContext: Record<string, unknown>;
  principles: Principle[];
  insight: Insight | null;
  whyStatement: string | null;
  archetypes: string[];
  operatorName: string;
  correlations: AspirationCorrelation[];
  historicalInsights: InsightAnnotation[];

  // All patterns (for context view)
  allPatterns: Pattern[];

  // UI state
  loaded: boolean;
  computing: boolean;
  viewMode: "brief" | "map";
  selectedNode: HolonNode | null;
  archetypeSelectorOpen: boolean;
  chatShellOpen: boolean;
  chatShellMode: "default" | "new-aspiration" | "dimension";
  chatShellDimension: string | null;
  whyEvolution: WhyEvolutionData | null;
  shareworthyOpen: boolean;
  regeneratedCanvas: CanvasData | null;
  manageMode: boolean;
  settingsOpen: boolean;
  confirmAction: {
    type: "archive" | "delete" | "clear-context" | "delete-principle";
    id: string;
    label: string;
  } | null;
  archiveToast: { id: string; label: string } | null;
  selectedAspirationPatterns: Pattern[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  shapeWidth: number;

  // Derived values
  dayNum: number;
  hasContext: boolean;
  nodes: HolonNode[];
  isEmpty: boolean;
  holonLinks: HolonLink[];
  shapeHeight: number;
  selectedFullNode: HolonNode | undefined | null;

  // Handlers
  handleNodeTap: (node: HolonNode) => void;
  handleDismissInsight: () => Promise<void>;
  handleArchetypeSave: (selected: string[]) => Promise<void>;
  handleWhySave: (value: string) => Promise<void>;
  handleContextSave: (updated: KnownContext) => Promise<void>;
  handleFoundationSave: (nodeId: string, value: string) => Promise<void>;
  handleAspirationNameSave: (aspirationId: string, name: string) => Promise<void>;
  handleAspirationStatusChange: (aspirationId: string, status: Aspiration["status"]) => Promise<void>;
  handleAspirationBehaviorsSave: (aspirationId: string, behaviors: Behavior[]) => Promise<void>;
  handleAspirationFutureSave: (aspirationId: string, comingUp: FutureAction[], longerArc: FuturePhase[]) => Promise<void>;
  handleWhyEvolutionAccept: (newWhy: string) => Promise<void>;
  handleWhyEvolutionDismiss: () => void;
  handleWhyTapNoContext: () => void;
  handleManageToggle: () => void;
  handleConfirmAction: () => Promise<void>;
  handleArchiveUndo: () => Promise<void>;
  handleSettingsAction: (action: "clear-chat" | "clear-context" | "start-fresh") => Promise<void>;
  handleContextFieldRemove: (fieldPath: string) => Promise<void>;
  handleTellMore: (dimension: string) => void;

  // Setters needed by JSX
  setViewMode: React.Dispatch<React.SetStateAction<"brief" | "map">>;
  setArchetypeSelectorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setChatShellOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setChatShellMode: React.Dispatch<React.SetStateAction<"default" | "new-aspiration" | "dimension">>;
  setSelectedNode: React.Dispatch<React.SetStateAction<HolonNode | null>>;
  setShareworthyOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setRegeneratedCanvas: React.Dispatch<React.SetStateAction<CanvasData | null>>;
  setSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setConfirmAction: React.Dispatch<React.SetStateAction<{
    type: "archive" | "delete" | "clear-context" | "delete-principle";
    id: string;
    label: string;
  } | null>>;

}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useWhole(): UseWholeReturn {
  const { user } = useAuth();
  const router = useRouter();
  const userId = user?.id ?? null;

  // Local overrides for optimistic updates
  const [localAspirations, setLocalAspirations] = useState<Aspiration[] | null>(null);
  const [localContext, setLocalContext] = useState<Record<string, unknown> | null>(null);
  const [localPrinciples, setLocalPrinciples] = useState<Principle[] | null>(null);
  const [localWhyStatement, setLocalWhyStatement] = useState<string | null | undefined>(undefined);
  const [localArchetypes, setLocalArchetypes] = useState<string[] | null>(null);

  const [insight, setInsight] = useState<Insight | null>(null);
  const [computing, setComputing] = useState(false);
  const [selectedNode, setSelectedNode] = useState<HolonNode | null>(null);
  const [archetypeSelectorOpen, setArchetypeSelectorOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"brief" | "map">("brief");
  const [chatShellOpen, setChatShellOpen] = useState(false);
  const [chatShellMode, setChatShellMode] = useState<"default" | "new-aspiration" | "dimension">("default");
  const [chatShellDimension, setChatShellDimension] = useState<string | null>(null);
  const [whyEvolution, setWhyEvolution] = useState<WhyEvolutionData | null>(null);
  const [shareworthyOpen, setShareworthyOpen] = useState(false);
  const [regeneratedCanvas, setRegeneratedCanvas] = useState<CanvasData | null>(null);
  const [manageMode, setManageMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "archive" | "delete" | "clear-context" | "delete-principle";
    id: string;
    label: string;
  } | null>(null);
  const [archiveToast, setArchiveToast] = useState<{ id: string; label: string } | null>(null);
  const [selectedAspirationPatterns, setSelectedAspirationPatterns] = useState<Pattern[]>([]);
  const archivedAspirationRef = useRef<Aspiration | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shapeWidth, setShapeWidth] = useState(340);
  const computeCalledRef = useRef(false);

  // ─── React Query: Data Loading ──────────────────────────────────────────

  const { data: serverAspirations = [], isLoading: aspLoading } = useQuery({
    queryKey: queryKeys.allAspirations(userId),
    queryFn: () => fetchAllAspirations(userId),
    enabled: true,
  });

  const { data: serverContext = {}, isLoading: ctxLoading } = useQuery({
    queryKey: queryKeys.knownContext(userId),
    queryFn: () => fetchKnownContext(userId),
    enabled: true,
  });

  const { data: serverInsight } = useQuery({
    queryKey: queryKeys.undeliveredInsight(userId),
    queryFn: () => fetchUndeliveredInsight(userId),
    enabled: !!userId,
  });

  const { data: whyData } = useQuery({
    queryKey: queryKeys.whyStatement(userId ?? "__anon"),
    queryFn: () => fetchWhyStatement(userId!),
    enabled: !!userId,
  });

  const { data: serverPrinciples = [] } = useQuery({
    queryKey: queryKeys.principles(userId ?? "__anon"),
    queryFn: () => fetchPrinciples(userId!),
    enabled: !!userId,
  });

  const { data: serverCorrelations = [] } = useQuery({
    queryKey: queryKeys.correlations(userId ?? "__anon"),
    queryFn: () => fetchCorrelations(userId!),
    enabled: !!userId,
  });

  const { data: patternsData } = useQuery({
    queryKey: queryKeys.patterns(userId),
    queryFn: () => fetchPatterns(userId),
    enabled: true,
  });
  const allPatterns = patternsData?.patterns ?? [];

  const { data: serverHistoricalInsights = [] } = useQuery({
    queryKey: queryKeys.recentInsights(userId ?? "__anon"),
    queryFn: () => fetchRecentInsights(userId!, 3),
    enabled: !!userId,
  });

  // ─── Resolved state (local overrides > server) ─────────────────────────

  const aspirations = localAspirations ?? serverAspirations;
  const rawContext = localContext ?? serverContext;
  const context = rawContext as KnownContext;
  const principles = localPrinciples ?? serverPrinciples;
  const correlations = serverCorrelations;

  const serverWhyStatement = whyData?.whyStatement ?? null;
  const whyDate = whyData?.whyDate ?? null;
  const whyStatement = localWhyStatement !== undefined ? localWhyStatement : serverWhyStatement;

  const serverArchetypes = (() => {
    const saved = rawContext.archetypes as string[] | undefined;
    return saved && Array.isArray(saved) && saved.length > 0 ? saved : [];
  })();
  const archetypes = localArchetypes ?? serverArchetypes;

  const operatorName = (() => {
    const nameFromCtx = (rawContext as Record<string, unknown>).operator_name as string
      || (rawContext as Record<string, unknown>).name as string;
    if (nameFromCtx) return nameFromCtx;
    if (user?.email) return user.email.split("@")[0];
    return "";
  })();

  const historicalInsights: InsightAnnotation[] = useMemo(() => {
    if (serverHistoricalInsights.length === 0) return [];
    return serverHistoricalInsights.map((ins: { id: string; text: string; dimensionsInvolved: unknown }) => ({
      id: ins.id,
      text: ins.text,
      dimensionsInvolved: ins.dimensionsInvolved as string[],
    }));
  }, [serverHistoricalInsights]);

  // Sync server insight to local state
  useEffect(() => {
    if (serverInsight !== undefined) {
      setInsight(serverInsight);
    }
  }, [serverInsight]);

  const loaded = !aspLoading && !ctxLoading;

  // ─── Measure container width ──────────────────────────────────────────
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const w = Math.min(containerRef.current.clientWidth * 0.9, 400);
        setShapeWidth(w);
      }
    };
    requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (loaded && containerRef.current) {
      const w = Math.min(containerRef.current.clientWidth * 0.9, 400);
      setShapeWidth(w);
    }
  }, [loaded]);

  // ─── Compute archetype + WHY suggestions when data is loaded ──────────
  useEffect(() => {
    if (!loaded || computeCalledRef.current) return;

    const contextStr = serializeContext(rawContext, aspirations);
    const needsArchetype = archetypes.length === 0;
    const needsWhy = !whyStatement;
    if (!contextStr || contextStr.length < 20 || (!needsArchetype && !needsWhy)) return;

    computeCalledRef.current = true;
    setComputing(true);

    let compute = "both";
    if (!needsArchetype) compute = "why";
    else if (!needsWhy) compute = "archetypes";

    fetch("/api/whole-compute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contextData: contextStr, compute }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.archetypes?.suggested && needsArchetype) {
          setLocalArchetypes(data.archetypes.suggested);
        }
        if (data.why && needsWhy) {
          setLocalWhyStatement(data.why);
        }
      })
      .catch(() => { /* silent fallback */ })
      .finally(() => setComputing(false));
  }, [loaded, rawContext, aspirations, archetypes.length, whyStatement]);

  // ─── WHY Evolution: check if 28+ days since WHY was set ────────────────
  const whyEvolveCalledRef = useRef(false);

  useEffect(() => {
    if (!loaded || !user || !whyStatement || !whyDate || whyEvolveCalledRef.current) return;

    const daysSinceWhy = Math.floor(
      (Date.now() - new Date(whyDate).getTime()) / 86400000,
    );
    if (daysSinceWhy < 28) return;

    whyEvolveCalledRef.current = true;

    const dismissKey = `huma-why-evolve-dismissed-${whyDate}`;
    if (localStorage.getItem(dismissKey)) return;

    const supabase = createClient();
    if (!supabase) return;

    (async () => {
      try {
        const summary = await getBehavioralSummary(supabase, user.id, aspirations);
        if (summary.totalDays < 7) return;

        const summaryText = [
          `Active days: ${summary.totalDays}/28`,
          `Top behaviors: ${summary.topBehaviors.map((b) => `${b.name} (${b.completedDays} days)`).join(", ")}`,
          `Dimension focus: ${Object.entries(summary.dimensionCounts).sort((a, b) => b[1] - a[1]).map(([d, c]) => `${d}: ${c}`).join(", ")}`,
        ].join("\n");

        const contextStr = serializeContext(rawContext, aspirations);

        const res = await fetch("/api/whole-compute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contextData: contextStr,
            compute: "why-evolve",
            originalWhy: whyStatement,
            behavioralSummary: summaryText,
          }),
        });
        const data = await res.json();
        if (data.whyEvolution?.evolved) {
          setWhyEvolution(data.whyEvolution);
        }
      } catch {
        /* silent */
      }
    })();
  }, [loaded, user, whyStatement, whyDate, aspirations, rawContext]);

  // Day number
  const dayNum = (() => {
    try {
      const start = localStorage.getItem("huma-v2-start-date");
      if (start) {
        const diff = Math.ceil((Date.now() - new Date(start).getTime()) / 86400000);
        return diff > 0 ? diff : 1;
      }
    } catch { /* */ }
    return 1;
  })();

  const hasContext = Object.keys(rawContext).length > 0 || aspirations.length > 0;

  // Build nodes
  const nodes = buildNodes(aspirations, context, principles, operatorName);
  const isEmpty = aspirations.length === 0 && Object.keys(context).length === 0 && principles.length === 0;

  // Build links
  const holonLinks: HolonLink[] = useMemo(() => {
    if (correlations.length > 0) {
      return correlations.map((c) => ({
        sourceId: c.sourceId,
        targetId: c.targetId,
        weight: c.weight,
      }));
    }
    return computeDimensionLinks(aspirations);
  }, [correlations, aspirations]);

  const shapeHeight = Math.round(shapeWidth * 0.75);

  const handleNodeTap = useCallback((node: HolonNode) => {
    setSelectedNode((prev) => {
      if (prev?.id === node.id) return null;
      if (node.type === "aspiration") {
        setSelectedAspirationPatterns([]);
        if (user) {
          const supabase = createClient();
          if (supabase) {
            getPatternsByAspiration(supabase, user.id, node.id)
              .then(setSelectedAspirationPatterns)
              .catch(() => {});
          }
        } else {
          try {
            const stored = localStorage.getItem("huma-v2-patterns");
            if (stored) {
              const all = JSON.parse(stored) as Pattern[];
              setSelectedAspirationPatterns(all.filter((p) => p.aspirationId === node.id));
            }
          } catch { /* */ }
        }
      }
      return node;
    });
  }, [user]);

  const handleDismissInsight = useCallback(async () => {
    if (!insight || !user) return;
    setInsight(null);
    await withSupabase(user, (sb) => markInsightDelivered(sb, insight.id, user!.id));
  }, [insight, user]);

  const handleArchetypeSave = useCallback(async (selected: string[]) => {
    setLocalArchetypes(selected);
    const updated = { ...rawContext, archetypes: selected };
    setLocalContext(updated);
    localStorage.setItem("huma-v2-known-context", JSON.stringify(updated));
    await withSupabase(user, (sb, uid) => updateKnownContext(sb, uid, updated));
  }, [rawContext, user]);

  const handleWhySave = useCallback(async (value: string) => {
    setLocalWhyStatement(value);
    const updated = { ...rawContext, why_statement: value };
    setLocalContext(updated);
    localStorage.setItem("huma-v2-known-context", JSON.stringify(updated));
    await withSupabase(user, (sb, uid) => updateWhyStatement(sb, uid, value));
  }, [rawContext, user]);

  const handleContextSave = useCallback(async (updatedCtx: KnownContext) => {
    const merged = { ...rawContext, ...updatedCtx };
    setLocalContext(merged);
    localStorage.setItem("huma-v2-known-context", JSON.stringify(merged));
    await withSupabase(user, (sb, uid) => updateKnownContext(sb, uid, merged));
  }, [rawContext, user]);

  const handleFoundationSave = useCallback(async (nodeId: string, value: string) => {
    const updated = { ...rawContext };
    if (nodeId === "ctx-place") {
      updated.place = { ...(context.place || { name: "", detail: "" }), detail: value };
    } else if (nodeId === "ctx-work") {
      updated.work = { ...(context.work || { title: "", detail: "" }), detail: value };
    } else if (nodeId === "ctx-stage") {
      updated.stage = { ...(context.stage || { label: "", detail: "" }), detail: value };
    } else if (nodeId === "ctx-health") {
      updated.health = { detail: value };
    }
    setLocalContext(updated);
    localStorage.setItem("huma-v2-known-context", JSON.stringify(updated));
    await withSupabase(user, (sb, uid) => updateKnownContext(sb, uid, updated));
  }, [rawContext, context, user]);

  // ── Aspiration detail panel handlers ──

  const updateLocalAspiration = useCallback((id: string, patch: Partial<Aspiration>) => {
    setLocalAspirations(prev => {
      const base = prev ?? aspirations;
      return base.map((a) => (a.id === id ? { ...a, ...patch } : a));
    });
    updateLocalAspirationStorage(id, patch);
  }, [aspirations]);

  const handleAspirationNameSave = useCallback(async (aspirationId: string, name: string) => {
    updateLocalAspiration(aspirationId, { clarifiedText: name });
    clearCachedSheet();
    await withSupabase(user, (sb, uid) => updateAspirationName(sb, uid, aspirationId, name));
  }, [user, updateLocalAspiration]);

  const handleAspirationStatusChange = useCallback(async (aspirationId: string, status: Aspiration["status"]) => {
    updateLocalAspiration(aspirationId, { status });
    clearCachedSheet();
    await withSupabase(user, (sb, uid) => updateAspirationStatus(sb, uid, aspirationId, status));
  }, [user, updateLocalAspiration]);

  const handleAspirationBehaviorsSave = useCallback(async (aspirationId: string, behaviors: Behavior[]) => {
    updateLocalAspiration(aspirationId, { behaviors });
    clearCachedSheet();
    await withSupabase(user, (sb, uid) => updateAspirationBehaviors(sb, uid, aspirationId, behaviors));
  }, [user, updateLocalAspiration]);

  const handleAspirationFutureSave = useCallback(async (aspirationId: string, comingUp: FutureAction[], longerArc: FuturePhase[]) => {
    updateLocalAspiration(aspirationId, { comingUp, longerArc });
    await withSupabase(user, (sb, uid) => updateAspirationFuture(sb, uid, aspirationId, comingUp, longerArc));
  }, [user, updateLocalAspiration]);

  const handleWhyEvolutionAccept = useCallback(async (newWhy: string) => {
    setLocalWhyStatement(newWhy);
    setWhyEvolution(null);
    const updated = { ...rawContext, why_statement: newWhy };
    setLocalContext(updated);
    localStorage.setItem("huma-v2-known-context", JSON.stringify(updated));
    await withSupabase(user, (sb, uid) => updateWhyStatement(sb, uid, newWhy));
  }, [rawContext, user]);

  const handleWhyEvolutionDismiss = useCallback(() => {
    setWhyEvolution(null);
    if (whyDate) {
      localStorage.setItem(`huma-why-evolve-dismissed-${whyDate}`, "1");
    }
  }, [whyDate]);

  const handleWhyTapNoContext = useCallback(() => {
    setChatShellOpen(true);
  }, []);

  // ─── Manage mode handlers ────────────────────────────────────────────────

  const handleManageToggle = useCallback(() => {
    setManageMode((prev) => {
      if (prev) {
        setSelectedNode(null);
        setConfirmAction(null);
        setArchiveToast(null);
      }
      return !prev;
    });
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (!confirmAction) return;
    const { type, id } = confirmAction;
    const supabase = user ? createClient() : null;

    if (type === "archive") {
      const asp = aspirations.find(a => a.id === id);
      if (asp) archivedAspirationRef.current = asp;

      if (supabase && user) {
        try { await archiveAspiration(supabase, user.id, id); } catch { /* */ }
      }
      archiveLocalAspiration(id);
      setLocalAspirations(prev => (prev ?? aspirations).filter((a) => a.id !== id));

      setArchiveToast({ id, label: confirmAction.label });
      setTimeout(() => {
        setArchiveToast(prev => prev?.id === id ? null : prev);
      }, 5000);
    } else if (type === "delete") {
      if (supabase && user) {
        try { await deleteAspiration(supabase, user.id, id); } catch { /* */ }
      }
      removeLocalAspiration(id);
      setLocalAspirations(prev => (prev ?? aspirations).filter((a) => a.id !== id));
    } else if (type === "clear-context") {
      if (supabase && user) {
        try { await removeContextField(supabase, user.id, id); } catch { /* */ }
      }
      removeLocalContextField(id);
      const updated = { ...rawContext };
      delete (updated as Record<string, unknown>)[id];
      setLocalContext(updated);
      localStorage.setItem("huma-v2-known-context", JSON.stringify(updated));
    } else if (type === "delete-principle") {
      if (supabase) {
        try { await deletePrinciple(supabase, id); } catch { /* */ }
      }
      setLocalPrinciples(prev => (prev ?? principles).filter((p) => `principle-${p.id}` !== id && p.id !== id));
    }

    clearCachedSheet();

    setSelectedNode(null);
    setConfirmAction(null);
  }, [confirmAction, user, rawContext, aspirations, principles]);

  const handleArchiveUndo = useCallback(async () => {
    if (!archiveToast || !archivedAspirationRef.current) return;
    const restored = archivedAspirationRef.current;
    archivedAspirationRef.current = null;

    setLocalAspirations(prev => [...(prev ?? aspirations), restored]);
    await withSupabase(user, (sb, uid) => updateAspirationStatus(sb, uid, restored.id, "active"));
    restoreLocalAspiration(restored.id);

    setArchiveToast(null);
  }, [user, archiveToast, aspirations]);

  const handleSettingsAction = useCallback(async (action: "clear-chat" | "clear-context" | "start-fresh") => {
    if (action === "clear-chat") {
      await withSupabase(user, (sb, uid) => clearChatMessages(sb, uid));
      clearLocalChatMessages();
    } else if (action === "clear-context") {
      await withSupabase(user, async (sb, uid) => {
        const ctx = await import("@/lib/supabase-v2").then(m => m.getOrCreateContext(sb, uid));
        await sb.from("contexts").update({
          known_context: {},
          why_statement: null,
          why_date: null,
          updated_at: new Date().toISOString(),
        }).eq("id", ctx.id);
      });
      clearLocalStorageContext();
      setLocalContext({});
      setLocalWhyStatement(null);
      setLocalArchetypes([]);
    } else if (action === "start-fresh") {
      await withSupabase(user, (sb, uid) => clearAllUserData(sb, uid));
      clearAllLocalStorage();
      setSettingsOpen(false);
      router.push("/start?fresh=1");
      return;
    }

    clearCachedSheet();
    try {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.removeItem(`huma-v2-sheet-${today}`);
      localStorage.removeItem(`huma-v2-compiled-sheet-${today}`);
    } catch { /* */ }

    setSettingsOpen(false);
  }, [user, router]);

  const handleContextFieldRemove = useCallback(async (fieldPath: string) => {
    const supabase = user ? createClient() : null;

    const arrayMatch = fieldPath.match(/^(\w+)\[(\d+)\]$/);

    if (supabase && user) {
      try { await removeContextField(supabase, user.id, fieldPath); } catch { /* */ }
    }
    removeLocalContextField(fieldPath);

    const updated = { ...rawContext };
    if (arrayMatch) {
      const [, key, indexStr] = arrayMatch;
      const arr = (updated as Record<string, unknown>)[key];
      if (Array.isArray(arr)) {
        const newArr = [...arr];
        newArr.splice(parseInt(indexStr, 10), 1);
        (updated as Record<string, unknown>)[key] = newArr;
      }
    } else {
      delete (updated as Record<string, unknown>)[fieldPath];
    }

    setLocalContext(updated);
    localStorage.setItem("huma-v2-known-context", JSON.stringify(updated));

    clearCachedSheet();
  }, [user, rawContext]);

  const handleTellMore = useCallback((dimension: string) => {
    setChatShellDimension(dimension);
    setChatShellMode("dimension");
    setChatShellOpen(true);
  }, []);

  const selectedFullNode = selectedNode ? nodes.find((n) => n.id === selectedNode.id) : null;

  return {
    user,
    router,
    aspirations,
    context,
    rawContext,
    principles,
    insight,
    whyStatement,
    archetypes,
    operatorName,
    correlations,
    historicalInsights,
    allPatterns,
    loaded,
    computing,
    viewMode,
    selectedNode,
    archetypeSelectorOpen,
    chatShellOpen,
    chatShellMode,
    chatShellDimension,
    whyEvolution,
    shareworthyOpen,
    regeneratedCanvas,
    manageMode,
    settingsOpen,
    confirmAction,
    archiveToast,
    selectedAspirationPatterns,
    containerRef,
    shapeWidth,
    dayNum,
    hasContext,
    nodes,
    isEmpty,
    holonLinks,
    shapeHeight,
    selectedFullNode,
    handleNodeTap,
    handleDismissInsight,
    handleArchetypeSave,
    handleWhySave,
    handleContextSave,
    handleFoundationSave,
    handleAspirationNameSave,
    handleAspirationStatusChange,
    handleAspirationBehaviorsSave,
    handleAspirationFutureSave,
    handleWhyEvolutionAccept,
    handleWhyEvolutionDismiss,
    handleWhyTapNoContext,
    handleManageToggle,
    handleConfirmAction,
    handleArchiveUndo,
    handleSettingsAction,
    handleContextFieldRemove,
    handleTellMore,
    setViewMode,
    setArchetypeSelectorOpen,
    setChatShellOpen,
    setChatShellMode,
    setSelectedNode,
    setShareworthyOpen,
    setRegeneratedCanvas,
    setSettingsOpen,
    setConfirmAction,
  };
}
