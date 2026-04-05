"use client";

import { useState } from "react";
import type { Pattern, Aspiration, DimensionKey, SparklineData, MergeSuggestion } from "@/types/v2";
import { DIMENSION_COLORS, DIMENSION_LABELS } from "@/types/v2";
import PatternCard from "./PatternCard";
import { getAllStepDimensions } from "@/hooks/useGrow";

// ─── Dimension Folding Helpers ─────────────────────────────────────────────

/** Max visible cards before folding kicks in */
const MAX_VISIBLE_CARDS = 7;

/** Get primary dimension for a pattern (first dimension touched, or "other") */
function getPrimaryDimension(pattern: Pattern, aspirations: Aspiration[]): DimensionKey | "other" {
  const dims = getAllStepDimensions(pattern, aspirations);
  return dims[0] || "other";
}

/** Group overflow patterns by their primary dimension */
function groupByDimension(
  patterns: Pattern[],
  aspirations: Aspiration[],
): Map<string, { label: string; color: string; patterns: Pattern[] }> {
  const groups = new Map<string, { label: string; color: string; patterns: Pattern[] }>();
  for (const p of patterns) {
    const dim = getPrimaryDimension(p, aspirations);
    const key = dim === "other" ? "other" : dim;
    if (!groups.has(key)) {
      groups.set(key, {
        label: dim === "other" ? "Other" : DIMENSION_LABELS[dim],
        color: dim === "other" ? "var(--color-ink-400)" : DIMENSION_COLORS[dim],
        patterns: [],
      });
    }
    groups.get(key)!.patterns.push(p);
  }
  return groups;
}

// ─── DimensionFold ─────────────────────────────────────────────────────────

function DimensionFold({
  label,
  color,
  patterns,
  aspirations,
  expandedId,
  onToggleExpand,
  primaryArchetype,
  sparklines,
  onInvestigate,
  mergeSuggestions,
  onMerge,
  onDismissMerge,
  onUpdate,
  onArchive,
  onRemove,
}: {
  label: string;
  color: string;
  patterns: Pattern[];
  aspirations: Aspiration[];
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  primaryArchetype?: string;
  sparklines?: Map<string, SparklineData>;
  onInvestigate?: (patternId: string) => void;
  mergeSuggestions?: Map<string, MergeSuggestion>;
  onMerge?: (primaryId: string, secondaryId: string) => void;
  onDismissMerge?: (patternId: string, otherPatternId: string) => void;
  onUpdate?: (patternId: string, updates: Partial<Pick<Pattern, "name" | "trigger" | "steps" | "timeWindow">>) => void;
  onArchive?: (patternId: string) => void;
  onRemove?: (patternId: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="font-sans cursor-pointer flex items-center gap-2 w-full bg-transparent border-none py-2.5 text-left"
      >
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: color }}
        />
        <span className="text-[13px] font-semibold text-ink-600 flex-1">
          {label}
        </span>
        <span className="text-xs text-sage-400">
          {patterns.length} pattern{patterns.length !== 1 ? "s" : ""}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
            flexShrink: 0,
          }}
        >
          <path
            d="M3.5 5.25L7 8.75L10.5 5.25"
            stroke="var(--color-sage-400)"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        style={{
          maxHeight: open ? `${patterns.length * 400}px` : "0px",
          opacity: open ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 400ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {patterns.map(p => (
          <PatternCard
            key={p.id}
            pattern={p}
            aspirations={aspirations}
            expanded={expandedId === p.id}
            onToggle={() => onToggleExpand(p.id)}
            primaryArchetype={primaryArchetype}
            sparkline={sparklines?.get(p.id)}
            onInvestigate={onInvestigate}
            mergeSuggestion={mergeSuggestions?.get(p.id)}
            onMerge={onMerge}
            onDismissMerge={onDismissMerge}
            onUpdate={onUpdate}
            onArchive={onArchive}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}

// ─── PatternSection ────────────────────────────────────────────────────────

export default function PatternSection({
  title,
  subtitle,
  whySubtitle,
  patterns,
  aspirations,
  expandedId,
  onToggleExpand,
  primaryArchetype,
  sparklines,
  onInvestigate,
  mergeSuggestions,
  onMerge,
  onDismissMerge,
  onUpdate,
  onArchive,
  onRemove,
}: {
  title: string;
  subtitle: string;
  whySubtitle?: string;
  patterns: Pattern[];
  aspirations: Aspiration[];
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  primaryArchetype?: string;
  sparklines?: Map<string, SparklineData>;
  onInvestigate?: (patternId: string) => void;
  mergeSuggestions?: Map<string, MergeSuggestion>;
  onMerge?: (primaryId: string, secondaryId: string) => void;
  onDismissMerge?: (patternId: string, otherPatternId: string) => void;
  onUpdate?: (patternId: string, updates: Partial<Pick<Pattern, "name" | "trigger" | "steps" | "timeWindow">>) => void;
  onArchive?: (patternId: string) => void;
  onRemove?: (patternId: string) => void;
}) {
  const needsFolding = patterns.length > MAX_VISIBLE_CARDS;
  const visible = needsFolding ? patterns.slice(0, 5) : patterns;
  const folded = needsFolding ? patterns.slice(5) : [];
  const foldedGroups = needsFolding ? groupByDimension(folded, aspirations) : new Map();

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="font-serif text-sage-700 text-lg font-normal">
          {title}
        </h2>
        {whySubtitle ? (
          <p className="font-serif text-[13px] leading-[1.4] italic text-sage-500">
            {whySubtitle}
          </p>
        ) : (
          <p className="font-sans text-sage-400 text-[13px] leading-[1.4]">
            {subtitle}
          </p>
        )}
      </div>
      {visible.map(p => (
        <PatternCard
          key={p.id}
          pattern={p}
          aspirations={aspirations}
          expanded={expandedId === p.id}
          onToggle={() => onToggleExpand(p.id)}
          primaryArchetype={primaryArchetype}
          sparkline={sparklines?.get(p.id)}
          onInvestigate={onInvestigate}
          mergeSuggestion={mergeSuggestions?.get(p.id)}
          onMerge={onMerge}
          onDismissMerge={onDismissMerge}
          onUpdate={onUpdate}
          onArchive={onArchive}
          onRemove={onRemove}
        />
      ))}

      {/* Dimension folds for overflow */}
      {foldedGroups.size > 0 && (
        <div className="mt-2 pt-4 border-t border-sand-200">
          <p className="font-serif text-[13px] italic text-sage-400 mb-2">
            {folded.length} more by dimension
          </p>
          {Array.from(foldedGroups.entries()).map(([key, group]) => (
            <DimensionFold
              key={key}
              label={group.label}
              color={group.color}
              patterns={group.patterns}
              aspirations={aspirations}
              expandedId={expandedId}
              onToggleExpand={onToggleExpand}
              primaryArchetype={primaryArchetype}
              sparklines={sparklines}
              onInvestigate={onInvestigate}
              mergeSuggestions={mergeSuggestions}
              onMerge={onMerge}
              onDismissMerge={onDismissMerge}
              onUpdate={onUpdate}
              onArchive={onArchive}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
