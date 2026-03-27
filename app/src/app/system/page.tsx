"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Aspiration, DimensionKey } from "@/types/v2";
import { DIMENSION_LABELS } from "@/types/v2";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import ConversationSheet from "@/components/ConversationSheet";
import {
  getAspirations,
  getKnownContext,
  getBehaviorWeekCounts,
} from "@/lib/supabase-v2";
import { paletteConcepts } from "@/engine/palette-concepts";

const ALL_DIMENSIONS: DimensionKey[] = ["body", "people", "money", "home", "growth", "joy", "purpose", "identity"];

// ─── Aspiration Card ─────────────────────────────────────────────────────────

function AspirationCard({
  aspiration,
  weekCounts,
}: {
  aspiration: Aspiration;
  weekCounts: Record<string, { completed: number; total: number }>;
}) {
  const [expanded, setExpanded] = useState(true);

  const dims = aspiration.dimensionsTouched?.length
    ? aspiration.dimensionsTouched
    : [...new Set(aspiration.behaviors.flatMap(b =>
        (b.dimensions || []).map(d => typeof d === "string" ? d : d.dimension)
      ))];

  return (
    <div className="bg-white border border-sand-300 overflow-hidden" style={{ borderRadius: "16px" }}>
      {/* Card header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left cursor-pointer"
        style={{ padding: "16px", borderBottom: expanded ? "1px solid var(--color-sand-100)" : "none" }}
      >
        <div className="flex items-start justify-between">
          <p className="font-sans font-medium text-ink-900" style={{ fontSize: "16px", lineHeight: "1.3" }}>
            {aspiration.clarifiedText || aspiration.rawText}
          </p>
          <span style={{ color: "var(--color-ink-300)", fontSize: "12px", marginTop: "2px" }}>{expanded ? "▴" : "▾"}</span>
        </div>
        {/* Dimension pills */}
        <div className="flex flex-wrap gap-1.5 mt-2">
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
      </button>

      {/* Behaviors list */}
      {expanded && (
        <div>
          {aspiration.behaviors.map((behavior, i) => {
            const count = weekCounts[behavior.text];
            const hasActivity = count && count.completed > 0;

            return (
              <div
                key={behavior.key || i}
                className="flex items-center gap-2.5"
                style={{
                  padding: "10px 16px",
                  borderBottom: i < aspiration.behaviors.length - 1 ? "1px solid var(--color-sand-100)" : "none",
                }}
              >
                {/* Activity indicator */}
                <span
                  className="flex-shrink-0 rounded-full"
                  style={{
                    width: "8px",
                    height: "8px",
                    background: hasActivity ? "var(--color-sage-600)" : "var(--color-sage-200)",
                  }}
                />
                {/* Behavior name */}
                <span className="flex-1 font-sans font-medium text-ink-800" style={{ fontSize: "13px", lineHeight: "1.3" }}>
                  {behavior.text}
                </span>
                {/* Activity count */}
                <span className="font-sans text-ink-300" style={{ fontSize: "12px", lineHeight: "1.4" }}>
                  {count ? `${count.completed}/${count.total} days` : "not yet"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Connection Indicator ────────────────────────────────────────────────────

function ConnectionIndicator({
  sharedBehavior,
  dimensionCount,
}: {
  sharedBehavior: string;
  dimensionCount: number;
}) {
  return (
    <div className="flex flex-col items-center py-2 mx-6">
      <div className="w-px h-3" style={{ background: "var(--color-sage-200)" }} />
      <span
        className="px-3 py-1 rounded-full font-sans text-[11px] font-medium text-sage-400 border border-sage-200 bg-sand-50"
      >
        shared: {sharedBehavior}
      </span>
      <div className="w-px h-3" style={{ background: "var(--color-sage-200)" }} />

      {dimensionCount >= 4 && (
        <div
          className="mt-1 mx-6 rounded-lg p-2.5 animate-fade-in"
          style={{ background: "var(--color-sand-100)", borderRadius: "8px", padding: "10px 14px" }}
        >
          <p className="font-serif text-sm text-ink-700" style={{ lineHeight: "1.5" }}>
            {sharedBehavior} serves both aspirations. It touches {dimensionCount} dimensions — your most connected behavior.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── HUMA KNOWS Card ─────────────────────────────────────────────────────────

function HumaKnowsCard({
  context,
  compact = false,
}: {
  context: Record<string, unknown>;
  compact?: boolean;
}) {
  const entries = Object.entries(context).filter(([, v]) => v !== null && v !== undefined && v !== "");

  if (entries.length === 0) return null;

  const factString = entries
    .map(([k, v]) => {
      const label = k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      const val = Array.isArray(v) ? v.join(", ") : String(v);
      return `${label}: ${val}`;
    })
    .join(" · ");

  if (compact) {
    return (
      <div className="mx-6 mt-5 p-3 rounded-xl" style={{ background: "var(--color-sand-100)", borderRadius: "12px" }}>
        <p className="font-sans text-[13px] text-ink-500 leading-relaxed">
          {factString}
          <Link href="/system" className="ml-2 font-sans text-xs font-medium text-sage-500">
            see all &rarr;
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div style={{ margin: "20px 24px 0", background: "var(--color-sand-100)", borderRadius: "12px", padding: "14px 16px" }}>
      <p
        className="font-sans text-ink-300"
        style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.18em", lineHeight: "1" }}
      >
        HUMA KNOWS
      </p>
      <p className="font-sans text-ink-600" style={{ fontSize: "13px", lineHeight: "1.6", marginTop: "8px" }}>
        {factString}
      </p>
      <button className="font-sans font-medium text-sage-400 cursor-pointer hover:text-sage-600 transition-colors" style={{ fontSize: "12px", marginTop: "8px" }}>
        Edit context &rarr;
      </button>
    </div>
  );
}

// ─── System Page ─────────────────────────────────────────────────────────────

export default function SystemPage() {
  const { user } = useAuth();
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [knownContext, setKnownContext] = useState<Record<string, unknown>>({});
  const [weekCounts, setWeekCounts] = useState<Record<string, { completed: number; total: number }>>({});
  const [selectedDimension, setSelectedDimension] = useState<DimensionKey>("body");
  const [conversationSheetOpen, setConversationSheetOpen] = useState(false);
  const [conversationInitialMsg, setConversationInitialMsg] = useState<string | undefined>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      let asps: Aspiration[] = [];
      let ctx: Record<string, unknown> = {};

      if (user) {
        const supabase = createClient();
        if (supabase) {
          try {
            const [dbAsps, dbCtx, counts] = await Promise.all([
              getAspirations(supabase, user.id),
              getKnownContext(supabase, user.id),
              getBehaviorWeekCounts(supabase, user.id),
            ]);
            asps = dbAsps;
            ctx = dbCtx;
            setWeekCounts(counts);
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
      setLoaded(true);
    }
    load();
  }, [user]);

  // Find shared behaviors across aspirations
  const sharedBehaviors: Array<{ name: string; aspirations: string[]; dimensionCount: number }> = [];
  if (aspirations.length > 1) {
    const behaviorMap = new Map<string, { aspirations: Set<string>; dims: Set<string> }>();
    for (const asp of aspirations) {
      for (const b of asp.behaviors) {
        const key = b.text.toLowerCase().trim();
        if (!behaviorMap.has(key)) behaviorMap.set(key, { aspirations: new Set(), dims: new Set() });
        behaviorMap.get(key)!.aspirations.add(asp.clarifiedText || asp.rawText);
        for (const d of b.dimensions || []) {
          const dimKey = typeof d === "string" ? d : d.dimension;
          behaviorMap.get(key)!.dims.add(dimKey);
        }
      }
    }
    for (const [name, data] of behaviorMap) {
      if (data.aspirations.size > 1) {
        sharedBehaviors.push({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          aspirations: [...data.aspirations],
          dimensionCount: data.dims.size,
        });
      }
    }
  }

  // Filter palette by dimension
  const filteredPalette = paletteConcepts.filter(c =>
    c.primaryDimensions.includes(selectedDimension)
  );

  // Exclude concepts overlapping with existing aspirations
  const existingTexts = aspirations.map(a => (a.clarifiedText || a.rawText).toLowerCase());
  const displayPalette = filteredPalette.filter(c =>
    !existingTexts.some(t => t.includes(c.text.toLowerCase()) || c.text.toLowerCase().includes(t))
  );

  const openConversationWith = (text?: string) => {
    setConversationInitialMsg(text);
    setConversationSheetOpen(true);
  };

  return (
    <div className="min-h-dvh bg-sand-50" style={{ paddingBottom: "120px" }}>
      {/* Header */}
      <div className="px-6" style={{ paddingTop: "20px" }}>
        <span
          className="font-sans font-medium text-sage-500"
          style={{ fontSize: "11px", letterSpacing: "0.4em", lineHeight: "1" }}
        >
          HUMA
        </span>
        <p className="font-serif text-ink-900" style={{ fontSize: "22px", lineHeight: "1.2", marginTop: "12px" }}>
          Your system
        </p>
      </div>

      {/* Content */}
      {!loaded ? (
        <div className="flex items-center justify-center h-64">
          <span
            className="rounded-full animate-dot-pulse"
            style={{ width: "8px", height: "8px", background: "var(--color-sage-400)" }}
          />
        </div>
      ) : aspirations.length === 0 ? (
        <>
          {/* Empty state */}
          <div className="bg-white border border-sand-300 text-center" style={{ margin: "20px 24px 0", borderRadius: "16px", padding: "32px 24px" }}>
            <p className="font-serif text-ink-700" style={{ fontSize: "22px", lineHeight: "1.3" }}>
              Your system starts with what you want.
            </p>
            <p className="font-sans font-light text-ink-500 mx-auto" style={{ fontSize: "14px", lineHeight: "1.6", marginTop: "8px", maxWidth: "280px" }}>
              Tell HUMA what&apos;s on your mind and watch your life system take shape.
            </p>
            <Link
              href="/start"
              className="inline-block rounded-full font-sans font-medium text-white transition-colors"
              style={{ background: "var(--color-amber-600)", padding: "14px 36px", fontSize: "14px", marginTop: "24px" }}
            >
              Talk to HUMA
            </Link>
          </div>

          <PaletteSection
            selectedDimension={selectedDimension}
            onDimensionChange={setSelectedDimension}
            items={displayPalette}
            onItemTap={(text) => openConversationWith(text)}
          />
        </>
      ) : (
        <>
          {/* Aspiration cards with connection indicators */}
          <div style={{ marginTop: "20px" }}>
            {aspirations.map((asp, idx) => (
              <div key={asp.id} className={`animate-entrance-${Math.min(idx + 1, 5)}`}>
                {idx > 0 && (() => {
                  const shared = sharedBehaviors.find(s =>
                    s.aspirations.includes(asp.clarifiedText || asp.rawText)
                  );
                  if (shared) {
                    return (
                      <ConnectionIndicator
                        sharedBehavior={shared.name}
                        dimensionCount={shared.dimensionCount}
                      />
                    );
                  }
                  return <div style={{ height: "8px" }} />;
                })()}

                <div className="mx-6">
                  <AspirationCard aspiration={asp} weekCounts={weekCounts} />
                </div>
              </div>
            ))}
          </div>

          {/* HUMA KNOWS */}
          <HumaKnowsCard context={knownContext} />

          {/* Add aspiration button */}
          <div className="text-center" style={{ marginTop: "16px" }}>
            <button
              onClick={() => openConversationWith("I also want to ")}
              className="inline-flex items-center gap-1.5 rounded-full font-sans font-medium text-sage-700 cursor-pointer hover:bg-sage-50 transition-colors"
              style={{ padding: "10px 20px", fontSize: "14px", border: "1.5px solid var(--color-sage-300)" }}
            >
              + Add aspiration
            </button>
          </div>

          {/* Palette */}
          <PaletteSection
            selectedDimension={selectedDimension}
            onDimensionChange={setSelectedDimension}
            items={displayPalette}
            onItemTap={(text) => openConversationWith(text)}
          />
        </>
      )}

      {/* Conversation Sheet */}
      <ConversationSheet
        open={conversationSheetOpen}
        onClose={() => {
          setConversationSheetOpen(false);
          setConversationInitialMsg(undefined);
        }}
        initialMessage={conversationInitialMsg}
        knownContext={knownContext}
        aspirations={aspirations}
        onContextUpdate={(ctx) => {
          setKnownContext(ctx);
          localStorage.setItem("huma-v2-known-context", JSON.stringify(ctx));
        }}
        onAspirationAdded={(asp) => {
          setAspirations(prev => [...prev, asp]);
          localStorage.setItem("huma-v2-aspirations", JSON.stringify([...aspirations, asp]));
        }}
      />
    </div>
  );
}

// ─── Palette Section ─────────────────────────────────────────────────────────

function PaletteSection({
  selectedDimension,
  onDimensionChange,
  items,
  onItemTap,
}: {
  selectedDimension: DimensionKey;
  onDimensionChange: (d: DimensionKey) => void;
  items: Array<{ id: string; text: string }>;
  onItemTap: (text: string) => void;
}) {
  return (
    <div className="mx-6" style={{ marginTop: "24px" }}>
      <p
        className="font-sans text-ink-300"
        style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.18em", lineHeight: "1" }}
      >
        BROWSE BY DIMENSION
      </p>

      {/* Dimension filter pills */}
      <div className="flex flex-wrap" style={{ gap: "6px", marginTop: "12px", marginBottom: "14px" }}>
        {ALL_DIMENSIONS.map(dim => (
          <button
            key={dim}
            onClick={() => onDimensionChange(dim)}
            className="rounded-full font-sans font-medium cursor-pointer transition-colors"
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              background: selectedDimension === dim ? "var(--color-sage-700)" : "transparent",
              color: selectedDimension === dim ? "white" : "var(--color-ink-500)",
              border: selectedDimension === dim ? "1.5px solid var(--color-sage-700)" : "1px solid var(--color-sand-300)",
            }}
          >
            {DIMENSION_LABELS[dim]}
          </button>
        ))}
      </div>

      {/* Palette items */}
      <div className="flex flex-wrap" style={{ gap: "8px" }}>
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onItemTap(item.text)}
            className="rounded-full font-sans font-medium cursor-pointer transition-all active:scale-95"
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              background: "var(--color-sand-200)",
              border: "1px solid var(--color-sand-300)",
              color: "var(--color-ink-600)",
            }}
          >
            {item.text}
          </button>
        ))}
        {items.length === 0 && (
          <p className="font-sans text-ink-300" style={{ fontSize: "12px" }}>No suggestions for this dimension.</p>
        )}
      </div>
    </div>
  );
}

export { HumaKnowsCard };
