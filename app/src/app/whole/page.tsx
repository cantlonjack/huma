"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import TabShell from "@/components/TabShell";
import WholeShape, { type HolonNode, type HolonLink, type HolonLayer, type HolonStatus, type InsightAnnotation } from "@/components/whole/WholeShape";
import HolonExpandPanel from "@/components/whole/HolonExpandPanel";
import AspirationDetailPanel from "@/components/whole/AspirationDetailPanel";
import ProfileBanner from "@/components/whole/ProfileBanner";
import InsightCard from "@/components/whole/InsightCard";
import ShareworthyInsightCard, { isShareworthyInsight } from "@/components/whole/ShareworthyInsightCard";
import WhyEvolution, { type WhyEvolutionData } from "@/components/whole/WhyEvolution";
import ArchetypeSelector from "@/components/whole/ArchetypeSelector";
import ContextPortrait from "@/components/ContextPortrait";
import CanvasRegenerate from "@/components/whole/CanvasRegenerate";
import ConfirmationSheet from "@/components/whole/ConfirmationSheet";
import SettingsSheet from "@/components/whole/SettingsSheet";
import WholeSkeleton from "@/components/WholeSkeleton";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import { displayName } from "@/lib/display-name";
import type { Aspiration, Insight, Principle, KnownContext, Pattern, Behavior, FutureAction, FuturePhase } from "@/types/v2";
import type { CanvasData } from "@/engine/canvas-types";
import {
  getAllAspirations,
  getKnownContext,
  getUndeliveredInsight,
  markInsightDelivered,
  getWhyStatement,
  updateWhyStatement,
  updateKnownContext,
  getPrinciples,
  getAspirationCorrelations,
  getBehavioralSummary,
  getRecentInsights,
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

// ─── Data → Nodes ──────────────────────────────────────────────────────────

function mapAspirationStatus(asp: Aspiration): HolonStatus {
  const vs = asp.funnel?.validationStatus;
  if (vs === "working") return "working";
  if (vs === "finding") return "finding";
  if (vs === "no_path") return "no_path";
  if (vs === "adjusting") return "adjusting";
  if (asp.stage === "someday") return "no_path";
  return "active";
}

function aspirationLayer(asp: Aspiration): HolonLayer {
  const status = mapAspirationStatus(asp);
  if (status === "no_path" || asp.stage === "someday") return "vision";
  return "patterns";
}

function aspirationRadius(asp: Aspiration): number {
  const status = mapAspirationStatus(asp);
  if (status === "working") return 28;
  if (status === "active") return 24;
  if (status === "finding") return 20;
  return 18;
}

function buildNodes(
  aspirations: Aspiration[],
  context: KnownContext,
  principles: Principle[],
  operatorName: string,
): HolonNode[] {
  const nodes: HolonNode[] = [];

  // Identity nucleus
  nodes.push({
    id: "__identity__",
    label: operatorName || "You",
    layer: "identity",
    status: "active",
    r: 36,
    type: "identity",
  });

  // Aspirations → Patterns or Vision
  for (const asp of aspirations) {
    const status = mapAspirationStatus(asp);
    const dims = asp.dimensionsTouched || [];
    const behaviorDims = asp.behaviors?.flatMap((b) => b.dimensions?.map((d) => d.dimension) || []) || [];
    const allDims = [...new Set([...dims, ...behaviorDims])];

    nodes.push({
      id: asp.id,
      label: displayName(asp.clarifiedText || asp.rawText),
      layer: aspirationLayer(asp),
      status,
      r: aspirationRadius(asp),
      type: "aspiration",
      description: asp.rawText,
      dimensions: allDims,
    });
  }

  // Principles
  for (const p of principles) {
    if (!p.active) continue;
    nodes.push({
      id: `principle-${p.id}`,
      label: displayName(p.text),
      layer: "principles",
      status: "active",
      r: 20,
      type: "principle",
      description: p.text,
    });
  }

  // Foundation items from context
  if (context.place?.name) {
    nodes.push({
      id: "ctx-place",
      label: context.place.name,
      layer: "foundation",
      status: "working",
      r: 22,
      type: "context",
      description: context.place.detail || context.place.name,
    });
  }
  if (context.work?.title) {
    nodes.push({
      id: "ctx-work",
      label: context.work.title,
      layer: "foundation",
      status: "working",
      r: 20,
      type: "context",
      description: context.work.detail || context.work.title,
    });
  }
  if (context.stage?.label) {
    nodes.push({
      id: "ctx-stage",
      label: context.stage.label,
      layer: "foundation",
      status: "active",
      r: 18,
      type: "context",
      description: context.stage.detail || context.stage.label,
    });
  }
  if (context.health?.detail) {
    nodes.push({
      id: "ctx-health",
      label: "Health",
      layer: "foundation",
      status: "active",
      r: 16,
      type: "context",
      description: context.health.detail,
    });
  }

  return nodes;
}

// Compute dimension-overlap links as fallback when no behavioral data exists
function computeDimensionLinks(aspirations: Aspiration[]): HolonLink[] {
  const links: HolonLink[] = [];
  for (let i = 0; i < aspirations.length; i++) {
    for (let j = i + 1; j < aspirations.length; j++) {
      const aDims = new Set(aspirations[i].dimensionsTouched || []);
      const bDims = new Set(aspirations[j].dimensionsTouched || []);
      if (aDims.size === 0 || bDims.size === 0) continue;

      let overlap = 0;
      for (const d of aDims) if (bDims.has(d)) overlap++;
      if (overlap === 0) continue;

      const weight = overlap / Math.min(aDims.size, bDims.size);
      if (weight >= 0.4) {
        links.push({
          sourceId: aspirations[i].id,
          targetId: aspirations[j].id,
          weight: Math.round(weight * 100) / 100,
        });
      }
    }
  }
  return links;
}

// Serialize context for AI prompt
function serializeContext(
  ctx: Record<string, unknown>,
  aspirations: Aspiration[],
): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(ctx)) {
    if (v && typeof v === "object") parts.push(`${k}: ${JSON.stringify(v)}`);
    else if (v) parts.push(`${k}: ${v}`);
  }
  if (aspirations.length > 0) {
    parts.push("Aspirations: " + aspirations.map((a) => a.clarifiedText || a.rawText).join("; "));
  }
  return parts.join("\n") || "";
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function WholePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [context, setContext] = useState<KnownContext>({});
  const [rawContext, setRawContext] = useState<Record<string, unknown>>({});
  const [principles, setPrinciples] = useState<Principle[]>([]);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [whyStatement, setWhyStatement] = useState<string | null>(null);
  const [archetypes, setArchetypes] = useState<string[]>([]);
  const [operatorName, setOperatorName] = useState("");
  const [correlations, setCorrelations] = useState<AspirationCorrelation[]>([]);
  const [historicalInsights, setHistoricalInsights] = useState<InsightAnnotation[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [computing, setComputing] = useState(false);
  const [selectedNode, setSelectedNode] = useState<HolonNode | null>(null);
  const [archetypeSelectorOpen, setArchetypeSelectorOpen] = useState(false);
  const [chatShellOpen, setChatShellOpen] = useState(false);
  const [chatShellMode, setChatShellMode] = useState<"default" | "new-aspiration">("default");
  const [whyEvolution, setWhyEvolution] = useState<WhyEvolutionData | null>(null);
  const [whyDate, setWhyDate] = useState<string | null>(null);
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

  // Measure container width
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

  // Load data
  useEffect(() => {
    async function load() {
      let localAspirations: Aspiration[] = [];
      let localContext: KnownContext = {};
      let localRawContext: Record<string, unknown> = {};

      try {
        const asp = localStorage.getItem("huma-v2-aspirations");
        if (asp) localAspirations = JSON.parse(asp);
        const ctx = localStorage.getItem("huma-v2-known-context");
        if (ctx) {
          localRawContext = JSON.parse(ctx);
          localContext = localRawContext as KnownContext;
        }
      } catch { /* fresh */ }

      if (user) {
        const supabase = createClient();
        if (supabase) {
          try {
            const [dbAspirations, dbContext, dbInsight, dbWhy, dbPrinciples, dbCorrelations, dbHistoricalInsights] = await Promise.all([
              getAllAspirations(supabase, user.id),
              getKnownContext(supabase, user.id),
              getUndeliveredInsight(supabase, user.id),
              getWhyStatement(supabase, user.id),
              getPrinciples(supabase, user.id),
              getAspirationCorrelations(supabase, user.id),
              getRecentInsights(supabase, user.id, 3),
            ]);

            if (dbAspirations.length > 0) setAspirations(dbAspirations);
            else setAspirations(localAspirations);

            const typedCtx = dbContext as KnownContext;
            setRawContext(dbContext);
            if (Object.keys(dbContext).length > 0) setContext(typedCtx);
            else { setContext(localContext); setRawContext(localRawContext); }

            setInsight(dbInsight);
            setWhyStatement(dbWhy.whyStatement);
            setWhyDate(dbWhy.whyDate);
            setPrinciples(dbPrinciples);
            setCorrelations(dbCorrelations);

            // Map historical insights to annotations
            if (dbHistoricalInsights.length > 0) {
              setHistoricalInsights(
                dbHistoricalInsights.map((ins) => ({
                  id: ins.id,
                  text: ins.text,
                  dimensionsInvolved: ins.dimensionsInvolved as string[],
                })),
              );
            }

            const nameFromCtx = (dbContext as Record<string, unknown>).operator_name as string
              || (dbContext as Record<string, unknown>).name as string;
            if (nameFromCtx) setOperatorName(nameFromCtx);
            else if (user.email) setOperatorName(user.email.split("@")[0]);

            // Load saved archetypes
            const saved = (dbContext as Record<string, unknown>).archetypes as string[] | undefined;
            if (saved && Array.isArray(saved) && saved.length > 0) setArchetypes(saved);
          } catch {
            setAspirations(localAspirations);
            setContext(localContext);
            setRawContext(localRawContext);
          }
        }
      } else {
        setAspirations(localAspirations);
        setContext(localContext);
        setRawContext(localRawContext);

        // Load saved archetypes from localStorage
        const saved = localRawContext.archetypes as string[] | undefined;
        if (saved && Array.isArray(saved) && saved.length > 0) setArchetypes(saved);
      }

      setLoaded(true);
    }
    load();
  }, [user]);

  // Compute archetype + WHY suggestions when data is loaded
  useEffect(() => {
    if (!loaded || computeCalledRef.current) return;

    const contextStr = serializeContext(rawContext, aspirations);
    // Only compute if there's meaningful context and nothing is already set
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
          setArchetypes(data.archetypes.suggested);
        }
        if (data.why && needsWhy) {
          setWhyStatement(data.why);
        }
      })
      .catch(() => { /* silent fallback */ })
      .finally(() => setComputing(false));
  }, [loaded, rawContext, aspirations, archetypes.length, whyStatement]);

  // ─── WHY Evolution: check if 28+ days since WHY was set ────────────────
  const whyEvolveCalledRef = useRef(false);

  useEffect(() => {
    if (!loaded || !user || !whyStatement || !whyDate || whyEvolveCalledRef.current) return;

    // Check if 28+ days have passed since WHY was set
    const daysSinceWhy = Math.floor(
      (Date.now() - new Date(whyDate).getTime()) / 86400000,
    );
    if (daysSinceWhy < 28) return;

    whyEvolveCalledRef.current = true;

    // Check if already dismissed this cycle (localStorage flag reset monthly)
    const dismissKey = `huma-why-evolve-dismissed-${whyDate}`;
    if (localStorage.getItem(dismissKey)) return;

    const supabase = createClient();
    if (!supabase) return;

    (async () => {
      try {
        const summary = await getBehavioralSummary(supabase, user.id, aspirations);
        // Need at least 7 active days to have meaningful data
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

  // Build links: behavioral correlations if available, dimension overlap as fallback
  const holonLinks: HolonLink[] = useMemo(() => {
    if (correlations.length > 0) {
      return correlations.map((c) => ({
        sourceId: c.sourceId,
        targetId: c.targetId,
        weight: c.weight,
      }));
    }
    // Fallback: dimension overlap for pre-auth / new users
    return computeDimensionLinks(aspirations);
  }, [correlations, aspirations]);

  const shapeHeight = Math.round(shapeWidth * 0.75);

  const handleNodeTap = useCallback((node: HolonNode) => {
    setSelectedNode((prev) => {
      if (prev?.id === node.id) return null;
      // Load patterns for aspiration nodes
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
          // Pre-auth: load patterns from localStorage
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
    const supabase = createClient();
    if (supabase) {
      try { await markInsightDelivered(supabase, insight.id, user.id); } catch { /* */ }
    }
  }, [insight, user]);

  // Save archetypes
  const handleArchetypeSave = useCallback(async (selected: string[]) => {
    setArchetypes(selected);
    const updated = { ...rawContext, archetypes: selected };
    setRawContext(updated);
    localStorage.setItem("huma-v2-known-context", JSON.stringify(updated));
    if (user) {
      const supabase = createClient();
      if (supabase) {
        try { await updateKnownContext(supabase, user.id, updated); } catch { /* */ }
      }
    }
  }, [rawContext, user]);

  // Save WHY statement
  const handleWhySave = useCallback(async (value: string) => {
    setWhyStatement(value);
    if (user) {
      const supabase = createClient();
      if (supabase) {
        try { await updateWhyStatement(supabase, user.id, value); } catch { /* */ }
      }
    }
    // Also persist to localStorage
    const updated = { ...rawContext, why_statement: value };
    setRawContext(updated);
    localStorage.setItem("huma-v2-known-context", JSON.stringify(updated));
  }, [rawContext, user]);

  // Save full context (from ContextPortrait)
  const handleContextSave = useCallback(async (updated: KnownContext) => {
    const merged = { ...rawContext, ...updated };
    setRawContext(merged);
    setContext(merged as KnownContext);
    localStorage.setItem("huma-v2-known-context", JSON.stringify(merged));
    if (user) {
      const supabase = createClient();
      if (supabase) {
        try { await updateKnownContext(supabase, user.id, merged); } catch { /* */ }
      }
    }
  }, [rawContext, user]);

  // Save foundation value to context
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
    setRawContext(updated);
    setContext(updated as KnownContext);
    localStorage.setItem("huma-v2-known-context", JSON.stringify(updated));
    if (user) {
      const supabase = createClient();
      if (supabase) {
        try { await updateKnownContext(supabase, user.id, updated); } catch { /* */ }
      }
    }
  }, [rawContext, context, user]);

  // ── Aspiration detail panel handlers ──

  const clearCachedSheet = useCallback(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.removeItem(`huma-v2-sheet-${today}`);
    } catch { /* */ }
  }, []);

  const updateLocalAspiration = useCallback((id: string, patch: Partial<Aspiration>) => {
    setAspirations((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    // Also update localStorage
    try {
      const stored = localStorage.getItem("huma-v2-aspirations");
      if (stored) {
        const all = JSON.parse(stored) as Aspiration[];
        const updated = all.map((a) => (a.id === id ? { ...a, ...patch } : a));
        localStorage.setItem("huma-v2-aspirations", JSON.stringify(updated));
      }
    } catch { /* */ }
  }, []);

  const handleAspirationNameSave = useCallback(async (aspirationId: string, name: string) => {
    updateLocalAspiration(aspirationId, { clarifiedText: name });
    clearCachedSheet();
    if (user) {
      const supabase = createClient();
      if (supabase) {
        try { await updateAspirationName(supabase, user.id, aspirationId, name); } catch { /* */ }
      }
    }
  }, [user, updateLocalAspiration, clearCachedSheet]);

  const handleAspirationStatusChange = useCallback(async (aspirationId: string, status: Aspiration["status"]) => {
    updateLocalAspiration(aspirationId, { status });
    clearCachedSheet();
    if (user) {
      const supabase = createClient();
      if (supabase) {
        try { await updateAspirationStatus(supabase, user.id, aspirationId, status); } catch { /* */ }
      }
    }
  }, [user, updateLocalAspiration, clearCachedSheet]);

  const handleAspirationBehaviorsSave = useCallback(async (aspirationId: string, behaviors: Behavior[]) => {
    updateLocalAspiration(aspirationId, { behaviors });
    clearCachedSheet();
    if (user) {
      const supabase = createClient();
      if (supabase) {
        try { await updateAspirationBehaviors(supabase, user.id, aspirationId, behaviors); } catch { /* */ }
      }
    }
  }, [user, updateLocalAspiration, clearCachedSheet]);

  const handleAspirationFutureSave = useCallback(async (aspirationId: string, comingUp: FutureAction[], longerArc: FuturePhase[]) => {
    updateLocalAspiration(aspirationId, { comingUp, longerArc });
    if (user) {
      const supabase = createClient();
      if (supabase) {
        try { await updateAspirationFuture(supabase, user.id, aspirationId, comingUp, longerArc); } catch { /* */ }
      }
    }
  }, [user, updateLocalAspiration]);

  // WHY evolution: accept evolved WHY
  const handleWhyEvolutionAccept = useCallback(async (newWhy: string) => {
    setWhyStatement(newWhy);
    setWhyEvolution(null);
    if (user) {
      const supabase = createClient();
      if (supabase) {
        try { await updateWhyStatement(supabase, user.id, newWhy); } catch { /* */ }
      }
    }
    // Also persist to localStorage
    const updated = { ...rawContext, why_statement: newWhy };
    setRawContext(updated);
    localStorage.setItem("huma-v2-known-context", JSON.stringify(updated));
  }, [rawContext, user]);

  // WHY evolution: dismiss (keep original)
  const handleWhyEvolutionDismiss = useCallback(() => {
    setWhyEvolution(null);
    // Mark dismissed for this WHY cycle so it doesn't re-appear
    if (whyDate) {
      localStorage.setItem(`huma-why-evolve-dismissed-${whyDate}`, "1");
    }
  }, [whyDate]);

  // WHY tap when no context — open chat with pre-filled prompt
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
      // Store aspiration for undo before removing
      const asp = aspirations.find(a => a.id === id);
      if (asp) archivedAspirationRef.current = asp;

      if (supabase && user) {
        try { await archiveAspiration(supabase, user.id, id); } catch { /* */ }
      }
      archiveLocalAspiration(id);
      setAspirations((prev) => prev.filter((a) => a.id !== id));

      // Show undo toast
      setArchiveToast({ id, label: confirmAction.label });
      setTimeout(() => {
        setArchiveToast(prev => prev?.id === id ? null : prev);
      }, 5000);
    } else if (type === "delete") {
      if (supabase && user) {
        try { await deleteAspiration(supabase, user.id, id); } catch { /* */ }
      }
      removeLocalAspiration(id);
      setAspirations((prev) => prev.filter((a) => a.id !== id));
    } else if (type === "clear-context") {
      // id is the field path like "place", "work", "stage", "health"
      if (supabase && user) {
        try { await removeContextField(supabase, user.id, id); } catch { /* */ }
      }
      removeLocalContextField(id);
      const updated = { ...rawContext };
      delete (updated as Record<string, unknown>)[id];
      setRawContext(updated);
      setContext(updated as KnownContext);
      localStorage.setItem("huma-v2-known-context", JSON.stringify(updated));
    } else if (type === "delete-principle") {
      if (supabase) {
        try { await deletePrinciple(supabase, id); } catch { /* */ }
      }
      setPrinciples((prev) => prev.filter((p) => `principle-${p.id}` !== id && p.id !== id));
    }

    // Clear cached sheet so it recompiles
    try {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.removeItem(`huma-v2-sheet-${today}`);
    } catch { /* */ }

    setSelectedNode(null);
    setConfirmAction(null);
  }, [confirmAction, user, rawContext, aspirations]);

  const handleArchiveUndo = useCallback(async () => {
    if (!archiveToast || !archivedAspirationRef.current) return;
    const restored = archivedAspirationRef.current;
    archivedAspirationRef.current = null;

    // Add back to local state
    setAspirations(prev => [...prev, restored]);

    // Restore in Supabase
    if (user) {
      try {
        const sb = createClient();
        if (sb) await updateAspirationStatus(sb, user.id, restored.id, "active");
      } catch { /* non-critical */ }
    }

    // Restore in localStorage
    restoreLocalAspiration(restored.id);

    setArchiveToast(null);
  }, [user, archiveToast]);

  const handleSettingsAction = useCallback(async (action: "clear-chat" | "clear-context" | "start-fresh") => {
    const supabase = user ? createClient() : null;

    if (action === "clear-chat") {
      if (supabase && user) {
        try { await clearChatMessages(supabase, user.id); } catch { /* */ }
      }
      clearLocalChatMessages();
    } else if (action === "clear-context") {
      if (supabase && user) {
        try {
          const ctx = await import("@/lib/supabase-v2").then(m => m.getOrCreateContext(supabase, user.id));
          await supabase.from("contexts").update({
            known_context: {},
            why_statement: null,
            why_date: null,
            updated_at: new Date().toISOString(),
          }).eq("id", ctx.id);
        } catch { /* */ }
      }
      clearLocalStorageContext();
      setContext({});
      setRawContext({});
      setWhyStatement(null);
      setArchetypes([]);
    } else if (action === "start-fresh") {
      if (supabase && user) {
        try { await clearAllUserData(supabase, user.id); } catch { /* */ }
      }
      clearAllLocalStorage();
      setSettingsOpen(false);
      router.push("/start?fresh=1");
      return;
    }

    // Clear cached sheet so it recompiles
    try {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.removeItem(`huma-v2-sheet-${today}`);
      localStorage.removeItem(`huma-v2-compiled-sheet-${today}`);
    } catch { /* */ }

    setSettingsOpen(false);
  }, [user, router]);

  // Handle context field removal from ContextPortrait
  const handleContextFieldRemove = useCallback(async (fieldPath: string) => {
    const supabase = user ? createClient() : null;

    // Handle array element removal: "people[2]" or top-level "place"
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

    setRawContext(updated);
    setContext(updated as KnownContext);
    localStorage.setItem("huma-v2-known-context", JSON.stringify(updated));

    // Clear cached sheet so it recompiles
    try {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.removeItem(`huma-v2-sheet-${today}`);
    } catch { /* */ }
  }, [user, rawContext]);

  // Map context node IDs to field paths
  const contextFieldForNodeId = (nodeId: string): string | null => {
    if (nodeId === "ctx-place") return "place";
    if (nodeId === "ctx-work") return "work";
    if (nodeId === "ctx-stage") return "stage";
    if (nodeId === "ctx-health") return "health";
    return null;
  };

  const selectedFullNode = selectedNode ? nodes.find((n) => n.id === selectedNode.id) : null;

  return (
    <TabShell
      contextPrompt={chatShellMode === "new-aspiration" ? "What are you trying to make work?" : chatShellOpen ? "Tell me what you're building and why it matters to you." : manageMode ? "What would you like to change?" : "What would you like to explore or change?"}
      forceOpen={chatShellOpen}
      onChatClose={() => { setChatShellOpen(false); setChatShellMode("default"); }}
      chatMode={chatShellMode}
      sourceTab="whole"
      tabContext={{
        archetypes,
        whyStatement: whyStatement || undefined,
        aspirations: aspirations.map(a => ({
          id: a.id,
          name: a.clarifiedText || a.rawText,
          status: mapAspirationStatus(a),
        })),
        principles: principles.filter(p => p.active).map(p => p.text),
        dayCount: dayNum,
      }}
    >
      <div className="min-h-dvh bg-sand-50 flex flex-col pb-20">
        {/* Header */}
        <div className="px-6 flex items-center justify-between pt-5">
          <span
            className="font-sans font-medium text-sage-500 text-[11px] tracking-[0.4em] leading-none"
          >
            HUMA
          </span>
          <div className="flex items-center gap-3">
            <span
              className="font-sans font-medium text-[11px] text-sage-300 tracking-[0.1em]"
            >
              Day {dayNum}
            </span>
            <button
              onClick={handleManageToggle}
              className={`cursor-pointer w-7 h-7 flex items-center justify-center border-none rounded-lg transition-[background] duration-200 ${manageMode ? "bg-[#EDF3ED]" : "bg-transparent"}`}
              aria-label={manageMode ? "Exit manage mode" : "Manage"}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                  stroke={manageMode ? "#3A5A40" : "#A8C4AA"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.17 12.5a1.39 1.39 0 00.28 1.53l.05.05a1.69 1.69 0 01-1.19 2.88 1.69 1.69 0 01-1.19-.5l-.05-.04a1.39 1.39 0 00-1.53-.28 1.39 1.39 0 00-.84 1.27v.14a1.69 1.69 0 01-3.38 0v-.07a1.39 1.39 0 00-.91-1.27 1.39 1.39 0 00-1.53.28l-.05.05a1.69 1.69 0 11-2.39-2.39l.05-.05a1.39 1.39 0 00.28-1.53 1.39 1.39 0 00-1.27-.84h-.14a1.69 1.69 0 010-3.38h.07a1.39 1.39 0 001.27-.91 1.39 1.39 0 00-.28-1.53l-.05-.05a1.69 1.69 0 112.39-2.39l.05.05a1.39 1.39 0 001.53.28h.07a1.39 1.39 0 00.84-1.27v-.14a1.69 1.69 0 013.38 0v.07a1.39 1.39 0 00.84 1.27 1.39 1.39 0 001.53-.28l.05-.05a1.69 1.69 0 112.39 2.39l-.05.05a1.39 1.39 0 00-.28 1.53v.07a1.39 1.39 0 001.27.84h.14a1.69 1.69 0 010 3.38h-.07a1.39 1.39 0 00-1.27.84z"
                  stroke={manageMode ? "#3A5A40" : "#A8C4AA"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="cursor-pointer w-7 h-7 flex items-center justify-center bg-transparent border-none rounded-lg transition-[background] duration-200"
              aria-label="Settings"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5h12M3 9h12M3 13h12" stroke="#A8C4AA" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="6" cy="5" r="1.5" fill="#FAF8F3" stroke="#A8C4AA" strokeWidth="1.2" />
                <circle cx="12" cy="9" r="1.5" fill="#FAF8F3" stroke="#A8C4AA" strokeWidth="1.2" />
                <circle cx="8" cy="13" r="1.5" fill="#FAF8F3" stroke="#A8C4AA" strokeWidth="1.2" />
              </svg>
            </button>
          </div>
        </div>

        {/* Section label */}
        <div className="px-6 mt-2">
          <span
            className="font-sans font-medium text-[11px] tracking-[0.18em] uppercase text-sage-300"
          >
            WHOLE
          </span>
        </div>

        {!loaded ? (
          <WholeSkeleton />
        ) : (
          <>
            {/* Profile banner */}
            <div className="mt-4">
              <ProfileBanner
                name={operatorName}
                archetypes={archetypes.length > 0 ? archetypes : undefined}
                whyStatement={whyStatement || undefined}
                computing={computing}
                onArchetypeTap={() => setArchetypeSelectorOpen(true)}
                onWhySave={handleWhySave}
                onWhyTapNoContext={handleWhyTapNoContext}
                hasContext={hasContext}
              />
            </div>

            {/* WHY Evolution suggestion */}
            {whyEvolution && whyStatement && (
              <div className="mt-3.5">
                <WhyEvolution
                  originalWhy={whyStatement}
                  evolution={whyEvolution}
                  onAccept={handleWhyEvolutionAccept}
                  onDismiss={handleWhyEvolutionDismiss}
                />
              </div>
            )}

            {/* Shape */}
            <div
              ref={containerRef}
              className="flex items-center justify-center mt-4 w-full"
            >
              <WholeShape
                nodes={nodes}
                links={holonLinks}
                annotations={historicalInsights}
                width={shapeWidth}
                height={shapeHeight}
                onNodeTap={handleNodeTap}
                selectedNodeId={selectedNode?.id}
                isEmpty={isEmpty}
                manageMode={manageMode}
              />
            </div>

            {/* Empty state message */}
            {isEmpty && (
              <div className="text-center px-6 pt-3">
                <p
                  className="font-serif text-lg italic text-sage-300 mb-3"
                >
                  Your shape starts here.
                </p>
                <button
                  onClick={() => {
                    setChatShellMode("new-aspiration");
                    setChatShellOpen(true);
                  }}
                  className="font-sans cursor-pointer text-sm text-amber-600 bg-transparent border-none underline underline-offset-2 p-0"
                >
                  Add your first aspiration
                </button>
              </div>
            )}

            {/* Add aspiration — visible when not empty */}
            {!isEmpty && (
              <div className="text-center px-6 pt-4">
                <button
                  onClick={() => {
                    setChatShellMode("new-aspiration");
                    setChatShellOpen(true);
                  }}
                  className="font-sans cursor-pointer inline-flex items-center gap-1.5 text-[13px] text-sage-500 bg-transparent border border-dashed border-[#C8D5C9] rounded-[20px] px-4 py-2 min-h-9"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Add aspiration
                </button>
              </div>
            )}

            {/* Expand panel — aspiration detail panel for aspirations, HolonExpandPanel for others */}
            {selectedFullNode && selectedFullNode.type === "aspiration" && (() => {
              const asp = aspirations.find((a) => a.id === selectedFullNode.id);
              return asp ? (
                <AspirationDetailPanel
                  aspiration={asp}
                  patterns={selectedAspirationPatterns}
                  status={selectedFullNode.status}
                  onClose={() => setSelectedNode(null)}
                  onNameSave={(name) => handleAspirationNameSave(asp.id, name)}
                  onStatusChange={(status) => handleAspirationStatusChange(asp.id, status)}
                  onBehaviorsSave={(behaviors) => handleAspirationBehaviorsSave(asp.id, behaviors)}
                  onFutureSave={(comingUp, longerArc) => handleAspirationFutureSave(asp.id, comingUp, longerArc)}
                  manageMode={manageMode}
                  onArchive={
                    manageMode
                      ? () => setConfirmAction({ type: "archive", id: asp.id, label: selectedFullNode.label })
                      : undefined
                  }
                  onDelete={
                    manageMode
                      ? () => setConfirmAction({ type: "delete", id: asp.id, label: selectedFullNode.label })
                      : undefined
                  }
                />
              ) : null;
            })()}
            {selectedFullNode && selectedFullNode.type !== "aspiration" && (
              <HolonExpandPanel
                id={selectedFullNode.id}
                label={selectedFullNode.label}
                description={selectedFullNode.description}
                status={selectedFullNode.status}
                type={selectedFullNode.type}
                dimensions={selectedFullNode.dimensions}
                onClose={() => setSelectedNode(null)}
                archetype={archetypes.join(" · ") || undefined}
                whyStatement={whyStatement || undefined}
                onArchetypeSave={() => setArchetypeSelectorOpen(true)}
                onWhySave={handleWhySave}
                value={selectedFullNode.description}
                onValueSave={selectedFullNode.type === "context" ? (v) => handleFoundationSave(selectedFullNode.id, v) : undefined}
                manageMode={manageMode}
                onDelete={
                  manageMode && selectedFullNode.type === "principle"
                    ? () => setConfirmAction({
                        type: "delete-principle",
                        id: selectedFullNode.id,
                        label: selectedFullNode.label,
                      })
                    : undefined
                }
                onClearContext={
                  manageMode && selectedFullNode.type === "context"
                    ? () => {
                        const field = contextFieldForNodeId(selectedFullNode.id);
                        if (field) setConfirmAction({ type: "clear-context", id: field, label: selectedFullNode.label });
                      }
                    : undefined
                }
              />
            )}

            {/* Context portrait */}
            <div className="animate-entrance-3 mt-4">
              <ContextPortrait
                context={context}
                onSave={handleContextSave}
                manageMode={manageMode}
                onRemoveField={handleContextFieldRemove}
              />
            </div>

            {/* Canvas regeneration */}
            {user && aspirations.length > 0 && (
              <CanvasRegenerate
                onGenerated={setRegeneratedCanvas}
                existingCanvas={regeneratedCanvas}
              />
            )}

            {/* Insight card */}
            {insight && (
              <div className="mt-4">
                <InsightCard
                  insight={insight}
                  onDismiss={handleDismissInsight}
                  shareworthy={isShareworthyInsight(insight)}
                  onShare={() => setShareworthyOpen(true)}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Shareworthy insight full-screen card */}
      {shareworthyOpen && insight && (
        <ShareworthyInsightCard
          insight={insight}
          operatorName={operatorName}
          onDismiss={() => setShareworthyOpen(false)}
        />
      )}

      {/* Archetype selector bottom sheet */}
      <ArchetypeSelector
        open={archetypeSelectorOpen}
        onClose={() => setArchetypeSelectorOpen(false)}
        onSave={handleArchetypeSave}
        initialSelected={archetypes}
      />

      {/* Confirmation sheet for destructive actions */}
      <ConfirmationSheet
        open={!!confirmAction}
        title={
          confirmAction?.type === "archive"
            ? `Archive ${confirmAction.label}?`
            : confirmAction?.type === "clear-context"
              ? `Clear ${confirmAction.label}?`
              : `Remove ${confirmAction?.label ?? ""}?`
        }
        body={
          confirmAction?.type === "archive"
            ? "This hides the aspiration from your shape. You can restore it later."
            : confirmAction?.type === "clear-context"
              ? "This removes this context from what HUMA knows about you."
              : confirmAction?.type === "delete-principle"
                ? "This removes the principle from your shape."
                : "This removes the aspiration, its behaviors, and related patterns. You can't undo this."
        }
        confirmLabel={confirmAction?.type === "archive" ? "Archive" : "Remove"}
        cancelLabel="Keep it"
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />

      {/* Settings sheet for reset options */}
      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onAction={handleSettingsAction}
      />

      {/* Archive undo toast */}
      {archiveToast && (
        <div
          className="fixed bottom-[100px] left-1/2 -translate-x-1/2 bg-sand-100 text-earth-500 border-2 border-[#C8D5C9] rounded-2xl px-5 py-3 flex items-center gap-3 z-40 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
          style={{
            animation: "confirmation-slide-up 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
          }}
        >
          <span className="font-sans text-sm">
            {displayName(archiveToast.label)} archived
          </span>
          <button
            onClick={handleArchiveUndo}
            className="font-sans font-medium cursor-pointer bg-transparent border-none text-amber-600 text-sm p-0 underline underline-offset-2"
          >
            Undo
          </button>
        </div>
      )}
    </TabShell>
  );
}
