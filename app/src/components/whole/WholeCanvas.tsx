"use client";

import { memo, useMemo, useState, useCallback } from "react";
import { ConnectionThreads } from "@/components/shared/ConnectionThreads";
import type { Aspiration, Pattern, DimensionKey, FutureAction, FuturePhase } from "@/types/v2";
import { DIMENSION_LABELS, DIMENSION_COLORS } from "@/types/v2";
import type { CapacityState, CapacityLevel } from "@/types/context";
import { displayName } from "@/lib/display-name";
import { mapAspirationStatus } from "@/lib/whole-utils";

/* ═══════════════════════════════════════════════════════════════════════════
   WholeCanvas — single spatial canvas for /whole.

   Replaces the 5 sibling panels (AspirationsList, Pathway, Patterns,
   Connections, Capacity) with one instrument: an anchor constellation,
   a lens selector, and a unified row list. One zoom model — tap an
   aspiration to reveal its pathway and patterns inline.
   ═══════════════════════════════════════════════════════════════════════════ */

type Lens = "aspirations" | "pathway" | "patterns" | "web";

interface WholeCanvasProps {
  aspirations: Aspiration[];
  patterns: Pattern[];
  unconnectedIds: Set<string>;
  capacityState?: CapacityState;
  weeklyHighlight?: {
    kind: "aspiration" | "dimension";
    id: string;
    label?: string;
  } | null;
  onAddAspiration: () => void;
  onShowProvenance: (pattern: Pattern) => void;
}

// ── Constants ──────────────────────────────────────────────────────────────

const LENSES: { key: Lens; label: string; hint: string }[] = [
  { key: "aspirations", label: "Aspirations", hint: "what you're making work" },
  { key: "pathway",     label: "Pathway",     hint: "the route forward" },
  { key: "patterns",    label: "Patterns",    hint: "what's taking root" },
  { key: "web",         label: "Web",         hint: "how it connects" },
];

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  working: "Working",
  finding: "Finding path",
  no_path: "Someday",
  adjusting: "Adjusting",
  paused: "Paused",
  completed: "Completed",
};

const CAPACITY_LABELS: Record<string, string> = {
  awareness: "Awareness",
  honesty: "Honesty",
  care: "Care",
  agency: "Agency",
  humility: "Humility",
};

const LEVEL_ORDER: CapacityLevel[] = ["undeveloped", "emerging", "developing", "strong"];

const LEVEL_LABELS: Record<CapacityLevel, string> = {
  undeveloped: "Undeveloped",
  emerging: "Emerging",
  developing: "Developing",
  strong: "Strong",
};

// ── Status dot ─────────────────────────────────────────────────────────────

function StatusDot({
  status,
  unconnected,
}: {
  status: string;
  unconnected?: boolean;
}) {
  if (unconnected) {
    return (
      <span
        className="block w-2 h-2 rounded-full border border-dashed border-amber-500 bg-transparent"
        aria-label="No daily practice yet"
      />
    );
  }
  if (status === "working" || status === "active") {
    return <span className="block w-2 h-2 rounded-full bg-sage-500" />;
  }
  if (status === "finding") {
    return <span className="block w-2 h-2 rounded-full border border-sage-400 bg-transparent" />;
  }
  return <span className="block w-2 h-2 rounded-full bg-sage-200" />;
}

// ── Capacity chip (collapsible) ────────────────────────────────────────────

function CapacityChip({ state }: { state: CapacityState }) {
  const [open, setOpen] = useState(false);
  const keys = ["awareness", "honesty", "care", "agency", "humility"] as const;

  const assessed =
    !!state._assessedAt ||
    keys.some((k) => state[k] && state[k] !== "undeveloped");
  if (!assessed) return null;

  // Dominant level: most common assessed level
  const counts: Record<CapacityLevel, number> = {
    undeveloped: 0, emerging: 0, developing: 0, strong: 0,
  };
  for (const k of keys) {
    const lvl = (state[k] as CapacityLevel) || "undeveloped";
    counts[lvl] += 1;
  }
  const dominant =
    (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as CapacityLevel) ||
    "developing";

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer inline-flex items-center gap-2 bg-sand-100 border border-sand-200 rounded-full px-3 py-1.5 hover:border-sage-200 transition-colors"
        aria-expanded={open}
      >
        <span className="font-sans text-[10px] tracking-[0.16em] uppercase text-sage-400 font-medium">
          Capacity
        </span>
        <span className="font-sans text-[11px] text-earth-600">
          {LEVEL_LABELS[dominant]}
        </span>
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          className={`transition-transform duration-300 text-sage-400 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M1 3l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div className="w-full max-w-[320px] rounded-2xl border border-sand-200 bg-sand-100/70 px-4 py-3">
          <p className="font-sans text-[10px] italic text-sage-300 m-0 mb-2.5 text-center">
            the soil your frameworks grow in
          </p>
          <div className="flex flex-col gap-1.5">
            {keys.map((key) => {
              const level = (state[key] as CapacityLevel) || "undeveloped";
              const idx = LEVEL_ORDER.indexOf(level);
              return (
                <div key={key} className="flex items-center justify-between gap-3">
                  <span className="font-sans text-[12px] text-earth-600">
                    {CAPACITY_LABELS[key]}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-[10px] text-sage-400">
                      {LEVEL_LABELS[level]}
                    </span>
                    <div className="flex gap-[2px]">
                      {LEVEL_ORDER.map((_, i) => (
                        <span
                          key={i}
                          className={`w-2.5 h-[3px] rounded-full ${i <= idx ? "bg-sage-500" : "bg-sand-250"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Anchor band: constellation + stats + capacity ─────────────────────────

function AnchorBand({
  aspirations,
  capacityState,
}: {
  aspirations: Aspiration[];
  capacityState?: CapacityState;
}) {
  const activeAspirations = aspirations.filter(
    (a) => a.status !== "archived" && a.status !== "dropped"
  );

  const activeDims = useMemo(() => {
    const set = new Set<DimensionKey>();
    for (const a of activeAspirations) {
      for (const d of a.dimensionsTouched || []) set.add(d);
    }
    return Array.from(set);
  }, [activeAspirations]);

  if (activeAspirations.length === 0) return null;

  return (
    <div className="flex flex-col items-center px-5 mt-4 gap-3">
      {/* Constellation — the shape of your life */}
      <ConnectionThreads
        activeDimensions={activeDims}
        size="compact"
        animate
      />

      {/* Stats line */}
      <div className="flex items-center gap-3 font-sans text-[11px] text-sage-400">
        <span>
          <span className="text-earth-600 font-medium">{activeAspirations.length}</span>{" "}
          {activeAspirations.length === 1 ? "aspiration" : "aspirations"}
        </span>
        <span className="text-sand-300">·</span>
        <span>
          <span className="text-earth-600 font-medium">{activeDims.length}</span> of 8 dimensions
        </span>
      </div>

      {/* Capacity chip */}
      {capacityState && <CapacityChip state={capacityState} />}
    </div>
  );
}

// ── Lens selector ─────────────────────────────────────────────────────────

function LensSelector({
  lens,
  onLensChange,
}: {
  lens: Lens;
  onLensChange: (l: Lens) => void;
}) {
  const current = LENSES.find((l) => l.key === lens);
  return (
    <div className="px-5 mt-6">
      <div className="flex items-center gap-1.5 flex-wrap">
        {LENSES.map((l) => {
          const active = l.key === lens;
          return (
            <button
              key={l.key}
              onClick={() => onLensChange(l.key)}
              className={`cursor-pointer font-sans text-[11px] tracking-[0.1em] uppercase px-3 py-1.5 rounded-full transition-all duration-200 ${
                active
                  ? "bg-sage-100 text-sage-700 font-medium"
                  : "bg-transparent text-sage-400 hover:text-sage-600 hover:bg-sand-100"
              }`}
              aria-pressed={active}
            >
              {l.label}
            </button>
          );
        })}
      </div>
      {current && (
        <p className="font-serif italic text-[12px] text-sage-400 mt-2 m-0">
          {current.hint}
        </p>
      )}
    </div>
  );
}

// ── Patterns for one aspiration ───────────────────────────────────────────

function AspirationPatterns({
  patterns,
  onShowProvenance,
}: {
  patterns: Pattern[];
  onShowProvenance: (p: Pattern) => void;
}) {
  if (patterns.length === 0) return null;
  const validated = patterns.filter((p) => p.status === "validated");
  const working = patterns.filter((p) => p.status === "working");

  return (
    <div className="flex flex-col gap-2">
      {validated.map((p) => (
        <div key={p.id} className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-serif text-[13px] text-earth-700 leading-snug m-0">
              {p.name}
            </p>
            {p.provenance?.rpplId && (
              <button
                onClick={() => onShowProvenance(p)}
                className="font-sans cursor-pointer text-[10px] italic text-sage-500 bg-transparent border-none p-0 mt-0.5 underline decoration-dotted underline-offset-2"
              >
                Where this comes from
              </button>
            )}
          </div>
          <span className="font-sans text-[9px] font-medium text-sage-500 bg-sage-100 rounded-full px-2 py-0.5 shrink-0 tracking-[0.1em] uppercase">
            Validated
          </span>
        </div>
      ))}
      {working.map((p) => {
        const progress = p.validationTarget > 0
          ? Math.round((p.validationCount / p.validationTarget) * 100)
          : 0;
        return (
          <div key={p.id}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-serif text-[13px] text-earth-700 leading-snug m-0 flex-1 min-w-0">
                {p.name}
              </p>
              <span className="font-sans text-[9px] text-sage-300 shrink-0 tabular-nums">
                {p.validationCount}/{p.validationTarget}
              </span>
            </div>
            {p.validationTarget > 0 && (
              <div className="mt-1 h-[3px] bg-sand-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sage-400 rounded-full transition-[width] duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Pathway for one aspiration (comingUp + longerArc) ──────────────────────

function AspirationPathway({
  comingUp,
  longerArc,
}: {
  comingUp?: FutureAction[];
  longerArc?: FuturePhase[];
}) {
  const hasAny = (comingUp?.length ?? 0) > 0 || (longerArc?.length ?? 0) > 0;
  if (!hasAny) {
    return (
      <p className="font-serif italic text-[12px] text-sage-400 m-0">
        No route mapped yet.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {comingUp && comingUp.length > 0 && (
        <div>
          <span className="font-sans text-[9px] tracking-[0.18em] uppercase text-sage-300 font-medium">
            Coming up
          </span>
          <div className="flex flex-col gap-1.5 mt-1">
            {comingUp.map((a, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400" />
                <div className="min-w-0">
                  <p className="font-serif text-[13px] text-earth-700 leading-snug m-0">
                    {a.name}
                  </p>
                  {a.timeframe && (
                    <span className="font-sans text-[10px] text-sage-400">
                      {a.timeframe}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {longerArc && longerArc.length > 0 && (
        <div className="mt-1">
          <span className="font-sans text-[9px] tracking-[0.18em] uppercase text-sage-300 font-medium">
            Longer arc
          </span>
          <div className="flex flex-col gap-1.5 mt-1">
            {longerArc.map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full border border-sage-300 bg-transparent" />
                <div className="min-w-0">
                  <p className="font-serif text-[13px] text-earth-700 leading-snug m-0">
                    {p.phase}
                  </p>
                  {p.timeframe && (
                    <span className="font-sans text-[10px] text-sage-400">
                      {p.timeframe}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Canvas row ────────────────────────────────────────────────────────────

interface CanvasRowProps {
  aspiration: Aspiration;
  patternsForThis: Pattern[];
  unconnected: boolean;
  lens: Lens;
  highlighted: boolean;
  expanded: boolean;
  onToggle: () => void;
  onShowProvenance: (p: Pattern) => void;
}

const CanvasRow = memo(function CanvasRow({
  aspiration,
  patternsForThis,
  unconnected,
  lens,
  highlighted,
  expanded,
  onToggle,
  onShowProvenance,
}: CanvasRowProps) {
  const status = mapAspirationStatus(aspiration);
  const name = displayName(
    aspiration.title || aspiration.clarifiedText || aspiration.rawText
  );
  const dims = (aspiration.dimensionsTouched || []) as DimensionKey[];
  const behaviorCount = aspiration.behaviors?.length || 0;
  const activeBehaviors =
    aspiration.behaviors?.filter((b) => b.enabled !== false).length || 0;
  const validatedCount = patternsForThis.filter((p) => p.status === "validated").length;
  const workingCount = patternsForThis.filter((p) => p.status === "working").length;

  // Lens tunes the constellation size on the left.
  const threadSize = lens === "web" ? "badge" : "inline";

  // Meta line tokens (lens-sensitive)
  const metaTokens: string[] = [STATUS_LABELS[status] || status];
  if (lens === "patterns") {
    if (validatedCount > 0) metaTokens.push(`${validatedCount} validated`);
    if (workingCount > 0) metaTokens.push(`${workingCount} working`);
    if (validatedCount === 0 && workingCount === 0) metaTokens.push("no patterns yet");
  } else if (lens === "web") {
    metaTokens.push(dims.map((d) => DIMENSION_LABELS[d]).join(" · "));
  } else if (lens === "pathway") {
    const count = (aspiration.comingUp?.length ?? 0) + (aspiration.longerArc?.length ?? 0);
    metaTokens.push(count > 0 ? `${count} step${count === 1 ? "" : "s"}` : "no route");
  } else {
    if (behaviorCount > 0) metaTokens.push(`${activeBehaviors}/${behaviorCount} behaviors`);
  }
  if (unconnected && lens !== "patterns") metaTokens.push("no daily practice");

  return (
    <div
      className={`transition-all duration-300 rounded-xl ${
        highlighted
          ? "bg-amber-50 border border-amber-300 px-3 py-2 -mx-1 shadow-[0_0_0_3px_rgba(232,147,90,0.12)]"
          : ""
      }`}
      data-testid={highlighted ? "weekly-highlight" : undefined}
    >
      <button
        onClick={onToggle}
        className="cursor-pointer flex items-start gap-3 py-2.5 w-full text-left bg-transparent border-none p-0"
        aria-expanded={expanded}
      >
        {/* Left: constellation (web lens) or status dot (others) */}
        <div className="shrink-0 mt-0.5">
          {lens === "web" && dims.length >= 2 ? (
            <ConnectionThreads
              activeDimensions={dims}
              size={threadSize}
              animate={!expanded}
            />
          ) : dims.length > 0 ? (
            <ConnectionThreads
              activeDimensions={dims}
              size="inline"
              animate={!expanded}
            />
          ) : (
            <div className="mt-1">
              <StatusDot status={status} unconnected={unconnected} />
            </div>
          )}
        </div>

        {/* Middle: name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-serif text-[15px] text-earth-700 leading-snug m-0 truncate">
              {name}
            </p>
            {highlighted && (
              <span className="font-sans text-[9px] tracking-[0.16em] uppercase text-amber-600 shrink-0">
                This week
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {metaTokens.map((t, i) => (
              <span
                key={i}
                className={`font-sans text-[11px] ${
                  i === 0 ? "text-sage-400" : "text-sage-300"
                } ${t === "no daily practice" ? "italic text-amber-600" : ""}`}
              >
                {i > 0 ? "· " : ""}
                {t}
              </span>
            ))}
          </div>
          {/* Dimension swatches for non-web lenses (subtle) */}
          {lens !== "web" && dims.length > 0 && (
            <div className="flex gap-1 mt-1">
              {dims.map((d) => (
                <span
                  key={d}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor:
                      DIMENSION_COLORS[d as keyof typeof DIMENSION_COLORS] ||
                      "#A8C4AA",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: chevron */}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          className={`shrink-0 mt-2 text-sage-300 transition-transform duration-300 ${
            expanded ? "rotate-180" : ""
          }`}
        >
          <path
            d="M2 4l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Expanded body: pathway + patterns for this aspiration */}
      {expanded && (
        <div className="ml-7 mr-1 pl-3 border-l border-sand-200 pb-3 pt-1 flex flex-col gap-4">
          <section>
            <h4 className="font-sans text-[9px] tracking-[0.22em] uppercase text-sage-400 font-medium m-0 mb-1.5">
              Pathway
            </h4>
            <AspirationPathway
              comingUp={aspiration.comingUp}
              longerArc={aspiration.longerArc}
            />
          </section>
          <section>
            <h4 className="font-sans text-[9px] tracking-[0.22em] uppercase text-sage-400 font-medium m-0 mb-1.5">
              Patterns
            </h4>
            {patternsForThis.length === 0 ? (
              <p className="font-serif italic text-[12px] text-sage-400 m-0">
                No patterns taking root yet.
              </p>
            ) : (
              <AspirationPatterns
                patterns={patternsForThis}
                onShowProvenance={onShowProvenance}
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
});

// ── Main canvas ────────────────────────────────────────────────────────────

export default function WholeCanvas({
  aspirations,
  patterns,
  unconnectedIds,
  capacityState,
  weeklyHighlight,
  onAddAspiration,
  onShowProvenance,
}: WholeCanvasProps) {
  const [lens, setLens] = useState<Lens>("aspirations");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  // Patterns grouped by aspirationId
  const patternsByAsp = useMemo(() => {
    const m = new Map<string, Pattern[]>();
    for (const p of patterns) {
      if (!p.aspirationId) continue;
      if (p.status !== "validated" && p.status !== "working") continue;
      const arr = m.get(p.aspirationId) || [];
      arr.push(p);
      m.set(p.aspirationId, arr);
    }
    return m;
  }, [patterns]);

  // Ordering per lens
  const visible = useMemo(() => {
    const base = aspirations.filter(
      (a) => a.status !== "archived" && a.status !== "dropped"
    );

    if (lens === "web") {
      // Most connected first; single-dim last.
      return [...base].sort((a, b) => {
        const ad = a.dimensionsTouched?.length || 0;
        const bd = b.dimensionsTouched?.length || 0;
        if (ad !== bd) return bd - ad;
        return 0;
      });
    }

    if (lens === "pathway") {
      // Active first, then route-bearing, then rest.
      const score = (a: Aspiration) => {
        const s = mapAspirationStatus(a);
        const hasPath = (a.comingUp?.length ?? 0) + (a.longerArc?.length ?? 0) > 0;
        if (s === "working" || s === "active") return 0;
        if (hasPath) return 1;
        if (s === "finding") return 2;
        return 3;
      };
      return [...base].sort((a, b) => score(a) - score(b));
    }

    if (lens === "patterns") {
      // Aspirations with validated patterns first, then working, then none.
      const score = (a: Aspiration) => {
        const ps = patternsByAsp.get(a.id) || [];
        if (ps.some((p) => p.status === "validated")) return 0;
        if (ps.some((p) => p.status === "working")) return 1;
        return 2;
      };
      return [...base].sort((a, b) => score(a) - score(b));
    }

    // Default "aspirations" lens: active first, then other, within their groups.
    const active = base.filter((a) => a.status === "active" || !a.status);
    const rest = base.filter((a) => a.status && a.status !== "active");
    return [...active, ...rest];
  }, [aspirations, lens, patternsByAsp]);

  // Pull highlighted aspiration to the front so the ritual sits up top.
  const ordered = useMemo(() => {
    if (weeklyHighlight?.kind !== "aspiration") return visible;
    const id = weeklyHighlight.id;
    return [
      ...visible.filter((a) => a.id === id),
      ...visible.filter((a) => a.id !== id),
    ];
  }, [visible, weeklyHighlight]);

  if (aspirations.length === 0) {
    // Empty state: prompt only; the anchor band hides itself.
    return (
      <div className="flex flex-col items-center text-center px-6 mt-8 gap-3">
        <p className="font-serif italic text-[14px] text-sage-400 max-w-[280px]">
          Nothing to map yet. Start with one thing you&apos;re trying to make work.
        </p>
        <button
          onClick={onAddAspiration}
          className="font-sans cursor-pointer inline-flex items-center gap-1.5 text-[13px] text-sage-500 bg-transparent border border-dashed border-sage-200 rounded-[20px] px-4 py-2 min-h-9"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 1.5v9M1.5 6h9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Add aspiration
        </button>
      </div>
    );
  }

  const highlightedId =
    weeklyHighlight?.kind === "aspiration" ? weeklyHighlight.id : null;
  const highlightedDim =
    weeklyHighlight?.kind === "dimension" ? weeklyHighlight.id : null;

  return (
    <div className="flex flex-col">
      <AnchorBand aspirations={aspirations} capacityState={capacityState} />

      <LensSelector lens={lens} onLensChange={setLens} />

      <div className="px-5 mt-3 divide-y divide-sand-200">
        {ordered.map((asp) => {
          const isExpanded = expandedId === asp.id;
          const isHighlighted =
            asp.id === highlightedId ||
            (highlightedDim
              ? (asp.dimensionsTouched || []).includes(
                  highlightedDim as DimensionKey
                )
              : false);
          return (
            <CanvasRow
              key={asp.id}
              aspiration={asp}
              patternsForThis={patternsByAsp.get(asp.id) || []}
              unconnected={unconnectedIds.has(asp.id)}
              lens={lens}
              highlighted={isHighlighted}
              expanded={isExpanded}
              onToggle={() => toggleExpanded(asp.id)}
              onShowProvenance={onShowProvenance}
            />
          );
        })}
      </div>

      <div className="text-center px-6 mt-5">
        <button
          onClick={onAddAspiration}
          className="font-sans cursor-pointer inline-flex items-center gap-1.5 text-[13px] text-sage-500 bg-transparent border border-dashed border-sage-200 rounded-[20px] px-4 py-2 min-h-9"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 1.5v9M1.5 6h9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Add aspiration
        </button>
      </div>
    </div>
  );
}
