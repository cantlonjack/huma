"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import TabShell from "@/components/TabShell";
import WholeShape, { type HolonNode, type HolonLink, type HolonLayer, type HolonStatus } from "@/components/whole/WholeShape";
import HolonExpandPanel from "@/components/whole/HolonExpandPanel";
import ProfileBanner from "@/components/whole/ProfileBanner";
import InsightCard from "@/components/whole/InsightCard";
import WhyEvolution, { type WhyEvolutionData } from "@/components/whole/WhyEvolution";
import ArchetypeSelector from "@/components/whole/ArchetypeSelector";
import ContextPortrait from "@/components/ContextPortrait";
import WholeSkeleton from "@/components/WholeSkeleton";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import { displayName } from "@/lib/display-name";
import type { Aspiration, Insight, Principle, KnownContext } from "@/types/v2";
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
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [context, setContext] = useState<KnownContext>({});
  const [rawContext, setRawContext] = useState<Record<string, unknown>>({});
  const [principles, setPrinciples] = useState<Principle[]>([]);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [whyStatement, setWhyStatement] = useState<string | null>(null);
  const [archetypes, setArchetypes] = useState<string[]>([]);
  const [operatorName, setOperatorName] = useState("");
  const [correlations, setCorrelations] = useState<AspirationCorrelation[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [computing, setComputing] = useState(false);
  const [selectedNode, setSelectedNode] = useState<HolonNode | null>(null);
  const [archetypeSelectorOpen, setArchetypeSelectorOpen] = useState(false);
  const [chatShellOpen, setChatShellOpen] = useState(false);
  const [whyEvolution, setWhyEvolution] = useState<WhyEvolutionData | null>(null);
  const [whyDate, setWhyDate] = useState<string | null>(null);
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
            const [dbAspirations, dbContext, dbInsight, dbWhy, dbPrinciples, dbCorrelations] = await Promise.all([
              getAllAspirations(supabase, user.id),
              getKnownContext(supabase, user.id),
              getUndeliveredInsight(supabase, user.id),
              getWhyStatement(supabase, user.id),
              getPrinciples(supabase, user.id),
              getAspirationCorrelations(supabase, user.id),
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
    setSelectedNode((prev) => (prev?.id === node.id ? null : node));
  }, []);

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

  const selectedFullNode = selectedNode ? nodes.find((n) => n.id === selectedNode.id) : null;

  return (
    <TabShell
      contextPrompt={chatShellOpen ? "Tell me what you're building and why it matters to you." : "What would you like to explore or change?"}
      forceOpen={chatShellOpen}
      onChatClose={() => setChatShellOpen(false)}
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
      <div className="min-h-dvh bg-sand-50 flex flex-col" style={{ paddingBottom: "80px" }}>
        {/* Header */}
        <div className="px-6 flex items-center justify-between" style={{ paddingTop: "20px" }}>
          <span
            className="font-sans font-medium text-sage-500"
            style={{ fontSize: "11px", letterSpacing: "0.4em", lineHeight: "1" }}
          >
            HUMA
          </span>
          <span
            className="font-sans font-medium"
            style={{ fontSize: "11px", color: "#A8C4AA", letterSpacing: "0.1em" }}
          >
            Day {dayNum}
          </span>
        </div>

        {/* Section label */}
        <div className="px-6" style={{ marginTop: "8px" }}>
          <span
            className="font-sans font-medium"
            style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#A8C4AA" }}
          >
            WHOLE
          </span>
        </div>

        {!loaded ? (
          <WholeSkeleton />
        ) : (
          <>
            {/* Profile banner */}
            <div style={{ marginTop: "16px" }}>
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
              <div style={{ marginTop: "14px" }}>
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
              className="flex items-center justify-center"
              style={{ marginTop: "16px", width: "100%" }}
            >
              <WholeShape
                nodes={nodes}
                links={holonLinks}
                width={shapeWidth}
                height={shapeHeight}
                onNodeTap={handleNodeTap}
                selectedNodeId={selectedNode?.id}
                isEmpty={isEmpty}
              />
            </div>

            {/* Empty state message */}
            {isEmpty && (
              <p
                className="font-serif text-center"
                style={{ fontSize: "16px", fontStyle: "italic", color: "#A8C4AA", margin: "12px 24px 0" }}
              >
                Your shape builds as you use HUMA.
              </p>
            )}

            {/* Expand panel */}
            {selectedFullNode && (
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
              />
            )}

            {/* Context portrait */}
            <div className="animate-entrance-3" style={{ marginTop: "16px" }}>
              <ContextPortrait context={context} onSave={handleContextSave} />
            </div>

            {/* Insight card */}
            {insight && (
              <div style={{ marginTop: "16px" }}>
                <InsightCard insight={insight} onDismiss={handleDismissInsight} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Archetype selector bottom sheet */}
      <ArchetypeSelector
        open={archetypeSelectorOpen}
        onClose={() => setArchetypeSelectorOpen(false)}
        onSave={handleArchetypeSave}
        initialSelected={archetypes}
      />
    </TabShell>
  );
}
