"use client";

import { useState, useEffect, useRef, useCallback, useMemo, useId } from "react";
import type { HumaContext } from "@/types/context";
import type { DimensionKey } from "@/types/v2";
import { ConnectionThreads } from "@/components/shared/ConnectionThreads";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { profileSections, profileCompleteness } from "@/lib/life-profile-utils";
import { contextCompleteness } from "@/lib/context-model";
import LifeProfileSection from "@/components/whole/LifeProfileSection";

// ── Gap prompt suggestions — natural questions for missing context ──

const GAP_PROMPTS: Record<string, string> = {
  identity: "Tell me a bit about yourself — what do you do, what matters to you?",
  place: "Where are you based? What's your living situation like?",
  people: "Who's in your life — household, people you rely on?",
  body: "How's your energy and sleep? Any health things I should know about?",
  money: "What does your financial picture look like right now?",
  growth: "What are you learning or curious about lately?",
  ahead: "What are you working toward — any goals or milestones ahead?",
};

const GAP_LABELS: Record<string, string> = {
  identity: "who you are",
  place: "where you live",
  people: "your people",
  body: "sleep & energy",
  money: "your resources",
  growth: "joy & growth",
  ahead: "what's ahead",
};

// ── Segmented dimension progress bar ──

const DIMENSION_SEGMENTS: { key: DimensionKey; label: string; color: string }[] = [
  { key: "body", label: "Body", color: "#5C7A62" },
  { key: "people", label: "People", color: "#8BAF8E" },
  { key: "money", label: "Money", color: "#B5621E" },
  { key: "home", label: "Home", color: "#6B6358" },
  { key: "growth", label: "Growth", color: "#2E6B8A" },
  { key: "joy", label: "Joy", color: "#E8935A" },
  { key: "purpose", label: "Purpose", color: "#3A5A40" },
  { key: "identity", label: "Identity", color: "#A04040" },
];

// ── Dimension legend — what HUMA listens for ──
// Human-voice one-liners for each of the 9 listening dimensions. The ring shows
// eight; Time lives in the model and colors the weekly shape, so we include it
// here for legibility. Copy stays fence-post-neighbor, not schema.

interface LegendDim {
  key: string; // DimensionKey | "time"
  label: string;
  blurb: string;
  color: string;
}

const LEGEND_DIMENSIONS: LegendDim[] = [
  { key: "body",     label: "Body",     blurb: "Energy, sleep, how you\u2019re holding up.",        color: "#5C7A62" },
  { key: "people",   label: "People",   blurb: "Household, the ones you rely on.",                  color: "#8BAF8E" },
  { key: "money",    label: "Money",    blurb: "What\u2019s coming in, what\u2019s tight.",         color: "#B5621E" },
  { key: "home",     label: "Home",     blurb: "Where you live and what\u2019s there.",             color: "#6B6358" },
  { key: "growth",   label: "Growth",   blurb: "What you\u2019re picking up, where you stretch.",   color: "#2E6B8A" },
  { key: "joy",      label: "Joy",      blurb: "What feeds you, what drains you.",                  color: "#E8935A" },
  { key: "purpose",  label: "Purpose",  blurb: "What you\u2019re doing all this for.",              color: "#3A5A40" },
  { key: "identity", label: "Identity", blurb: "How you see yourself, the roles you carry.",        color: "#A04040" },
  { key: "time",     label: "Time",     blurb: "The shape of your week.",                           color: "#A89E90" },
];

interface ContextAssemblyPanelProps {
  humaContext: HumaContext;
  knownDimensionKeys: DimensionKey[];
  /** Called when user taps a gap prompt — injects the question into conversation */
  onGapPromptTap?: (question: string) => void;
  /** Called when user taps "tell more" on a filled section */
  onTellMore?: (sectionId: string) => void;
}

export default function ContextAssemblyPanel({
  humaContext,
  knownDimensionKeys,
  onGapPromptTap,
  onTellMore,
}: ContextAssemblyPanelProps) {
  const reducedMotion = useReducedMotion();

  const sections = useMemo(
    () => profileSections(humaContext, []),
    [humaContext],
  );
  const completeness = useMemo(
    () => profileCompleteness(humaContext),
    [humaContext],
  );

  // Per-dimension signal map drives the legend's live "picked up / still quiet"
  // state. Uses contextCompleteness so time (not in ring) is also reflected.
  const signalMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const d of contextCompleteness(humaContext).dimensions) {
      map.set(d.dimension, d.percentage > 0);
    }
    return map;
  }, [humaContext]);

  const [legendOpen, setLegendOpen] = useState(false);
  const legendId = useId();

  const filledSections = sections.filter((s) => !s.isSparse);
  const sparseSections = sections.filter((s) => s.isSparse);

  // Rotating gap prompt — show one at a time, rotate every 30s
  const [gapIndex, setGapIndex] = useState(0);
  const gapTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (sparseSections.length <= 1) return;
    gapTimerRef.current = setInterval(() => {
      setGapIndex((prev) => (prev + 1) % sparseSections.length);
    }, 30000);
    return () => {
      if (gapTimerRef.current) clearInterval(gapTimerRef.current);
    };
  }, [sparseSections.length]);

  // Reset index if it's out of bounds
  const activeGapIndex = sparseSections.length > 0 ? gapIndex % sparseSections.length : 0;
  const activeGap = sparseSections[activeGapIndex];

  const handleGapTap = useCallback(() => {
    if (!activeGap || !onGapPromptTap) return;
    const question = GAP_PROMPTS[activeGap.id] || `Tell me about ${activeGap.label.toLowerCase()}`;
    onGapPromptTap(question);
    // Advance to next gap
    setGapIndex((prev) => (prev + 1) % Math.max(1, sparseSections.length));
  }, [activeGap, onGapPromptTap, sparseSections.length]);

  // Track which sections just appeared (for highlight animation)
  const [flashSection, setFlashSection] = useState<string | null>(null);
  const prevSectionIds = useRef(new Set(filledSections.map((s) => s.id)));

  useEffect(() => {
    const currentIds = new Set(filledSections.map((s) => s.id));
    for (const id of currentIds) {
      if (!prevSectionIds.current.has(id)) {
        if (!reducedMotion) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- animation trigger for newly-added sections; resets via timer
          setFlashSection(id);
          const timer = setTimeout(() => setFlashSection(null), 600);
          prevSectionIds.current = currentIds;
          return () => clearTimeout(timer);
        }
      }
    }
    prevSectionIds.current = currentIds;
  }, [filledSections, reducedMotion]);

  const dimensionCount = knownDimensionKeys.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="px-1">
        <p className="font-sans font-medium text-[11px] tracking-[0.12em] uppercase text-sage-500 mb-3">
          Your life — what HUMA knows
        </p>

        {/* ConnectionThreads + dimension count */}
        <div className="flex items-center gap-3 mb-3">
          {knownDimensionKeys.length > 0 ? (
            <ConnectionThreads
              activeDimensions={knownDimensionKeys}
              size="compact"
              animate={!reducedMotion}
            />
          ) : (
            <div className="w-[140px] h-[140px] flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-sand-300" />
            </div>
          )}
        </div>

        {/* Segmented progress bar */}
        <div className="flex gap-[2px] mb-1">
          {DIMENSION_SEGMENTS.map((seg) => {
            const isActive = knownDimensionKeys.includes(seg.key);
            return (
              <div
                key={seg.key}
                className="flex-1 h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{
                  backgroundColor: isActive ? seg.color : "var(--color-sand-200, #e8e0d4)",
                }}
                title={seg.label}
              />
            );
          })}
        </div>

        <p className="font-sans text-[11px] text-earth-400">
          {dimensionCount} of {DIMENSION_SEGMENTS.length} dimensions seen
        </p>

        {/* Legend disclosure — what HUMA is listening for, in human voice */}
        <button
          type="button"
          onClick={() => setLegendOpen((v) => !v)}
          className="mt-2 inline-flex items-center gap-1 font-sans text-[11px] text-sage-500 hover:text-sage-700 bg-transparent border-none p-0 cursor-pointer transition-colors duration-150"
          aria-expanded={legendOpen}
          aria-controls={legendId}
        >
          <span>What HUMA listens for</span>
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform duration-200 ${legendOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {legendOpen && (
          <div
            id={legendId}
            className={reducedMotion ? "mt-3" : "mt-3 animate-[fade-in_200ms_ease-out]"}
          >
            <ul role="list" className="flex flex-col gap-2 list-none p-0 m-0">
              {LEGEND_DIMENSIONS.map((dim) => {
                const hasSignal = signalMap.get(dim.key) ?? false;
                return (
                  <li key={dim.key} className="flex items-start gap-2.5 m-0">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-[6px]"
                      style={{
                        backgroundColor: hasSignal ? dim.color : "transparent",
                        border: hasSignal ? "none" : `1px solid ${dim.color}55`,
                      }}
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-sans text-[12px] font-medium text-earth-700">
                          {dim.label}
                        </span>
                        <span
                          className={`font-sans text-[10px] italic ${hasSignal ? "text-sage-500" : "text-earth-400"}`}
                        >
                          {hasSignal ? "picked up" : "still quiet"}
                        </span>
                      </div>
                      <p className="font-sans text-[12px] text-earth-500 leading-snug m-0">
                        {dim.blurb}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Filled sections */}
      {filledSections.length > 0 && (
        <div className="flex flex-col gap-4">
          {filledSections.map((section) => (
            <div
              key={section.id}
              className={`transition-colors duration-400 rounded-lg px-1 -mx-1 ${
                flashSection === section.id && !reducedMotion
                  ? "bg-sage-50"
                  : "bg-transparent"
              }`}
            >
              <LifeProfileSection
                section={section}
                mode="filling"
                onTellMore={onTellMore}
              />
            </div>
          ))}
        </div>
      )}

      {/* Gap prompt — single tappable suggestion */}
      {activeGap && onGapPromptTap && (
        <div className="mt-1">
          <button
            onClick={handleGapTap}
            className="w-full flex items-center gap-3 py-3 px-4 bg-sand-50 border border-dashed border-sand-300 rounded-xl text-left transition-colors duration-150 hover:bg-sage-50 hover:border-sage-300 cursor-pointer"
            style={{ minHeight: "44px" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sage-300 flex-shrink-0" />
            <span className="font-sans text-[13px] text-sage-500">
              HUMA doesn&rsquo;t know about {GAP_LABELS[activeGap.id] || activeGap.label.toLowerCase()} yet
            </span>
          </button>
        </div>
      )}

      {/* Still unknown list */}
      {sparseSections.length > 0 && (
        <div className="px-1 mt-1">
          <p className="font-sans text-[10px] tracking-[0.08em] uppercase text-earth-400 mb-1">
            Still unknown
          </p>
          <p className="font-sans text-[12px] text-earth-400 leading-relaxed">
            {sparseSections
              .map((s) => GAP_LABELS[s.id] || s.label.toLowerCase())
              .join(" \u00B7 ")}
          </p>
        </div>
      )}
    </div>
  );
}
