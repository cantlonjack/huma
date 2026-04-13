"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { HumaContext } from "@/types/context";
import type { DimensionKey } from "@/types/v2";
import { ConnectionThreads } from "@/components/shared/ConnectionThreads";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { profileSections, profileCompleteness } from "@/lib/life-profile-utils";
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
