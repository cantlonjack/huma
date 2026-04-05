"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Pattern, Aspiration, DimensionKey, FutureAction, FuturePhase, SparklineData, EmergingBehavior, MergeSuggestion, MonthlyReviewData } from "@/types/v2";
import { DIMENSION_COLORS, DIMENSION_LABELS } from "@/types/v2";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import { displayName } from "@/lib/display-name";
import { extractPatternsFromAspirations } from "@/lib/pattern-extraction";
import { getPatterns, getAspirations, getPatternSparklines, detectEmergingBehaviors, savePattern, detectMergeCandidates, mergePatterns, getMonthlyReviewData, updatePattern, deletePattern } from "@/lib/supabase-v2";
import TabShell from "@/components/TabShell";
import GrowSkeleton from "@/components/GrowSkeleton";
import Sparkline from "@/components/Sparkline";
import EmergenceCard from "@/components/EmergenceCard";
import MonthlyReview from "@/components/MonthlyReview";
import ConfirmationSheet from "@/components/whole/ConfirmationSheet";

// ─── Helpers ────────────────────────────────────────────────────────────────

function statusLabel(status: Pattern["status"]): string {
  if (status === "validated") return "Validated";
  if (status === "working") return "Working";
  return "Finding";
}

function statusColor(status: Pattern["status"]): { bg: string; text: string } {
  if (status === "validated") return { bg: "var(--color-sage-100)", text: "var(--color-sage-700)" };
  if (status === "working") return { bg: "var(--color-amber-100)", text: "var(--color-amber-600)" };
  return { bg: "var(--color-sand-100)", text: "var(--color-sage-400)" };
}

function validationPercent(pattern: Pattern): number {
  if (pattern.validationTarget <= 0) return 0;
  return Math.min(100, Math.round((pattern.validationCount / pattern.validationTarget) * 100));
}

function progressBarColor(status: Pattern["status"]): string {
  if (status === "validated") return "var(--color-sage-700)";
  if (status === "working") return "var(--color-amber-600)";
  return "var(--color-sage-300)";
}

// ─── Pattern Card ───────────────────────────────────────────────────────────

const ARCHETYPE_DOMAINS: Record<string, DimensionKey[]> = {
  "Earth Tender": ["body", "home"],
  "Creator": ["growth", "joy"],
  "Entrepreneur": ["money", "growth"],
  "Parent": ["people", "home"],
  "Educator": ["growth", "people"],
  "Spirit": ["purpose", "identity"],
};

/** Check if a pattern's aspiration dimensions overlap with an archetype's domain */
function getArchetypeMatch(
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
function getAllStepDimensions(pattern: Pattern, aspirations: Aspiration[]): DimensionKey[] {
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
function getAspirationName(pattern: Pattern, aspirations: Aspiration[]): string | null {
  const asp = aspirations.find(a => a.id === pattern.aspirationId);
  if (!asp) return null;
  return displayName(asp.title || asp.clarifiedText || asp.rawText);
}

/** Get coming_up and longer_arc data from the source aspiration */
function getAspirationPhases(pattern: Pattern, aspirations: Aspiration[]): {
  comingUp: FutureAction[];
  longerArc: FuturePhase[];
} {
  const asp = aspirations.find(a => a.id === pattern.aspirationId);
  return {
    comingUp: asp?.comingUp ?? [],
    longerArc: asp?.longerArc ?? [],
  };
}

/** Get the dimensions that a trigger behavior touches, by looking up the aspiration */
function getTriggerDimensions(pattern: Pattern, aspirations: Aspiration[]): DimensionKey[] {
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
function getSharedCaption(pattern: Pattern, aspirations: Aspiration[]): string | null {
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
function findDropOffDate(points: SparklineData["points"]): string | null {
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
function formatDropDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function PatternCard({
  pattern,
  aspirations,
  expanded,
  onToggle,
  primaryArchetype,
  sparkline,
  onInvestigate,
  mergeSuggestion,
  onMerge,
  onDismissMerge,
  onUpdate,
  onArchive,
  onRemove,
}: {
  pattern: Pattern;
  aspirations: Aspiration[];
  expanded: boolean;
  onToggle: () => void;
  primaryArchetype?: string;
  sparkline?: SparklineData;
  /** Called when operator taps "something changed" on a dropping pattern */
  onInvestigate?: (patternId: string) => void;
  mergeSuggestion?: MergeSuggestion;
  onMerge?: (primaryId: string, secondaryId: string) => void;
  onDismissMerge?: (patternId: string, otherPatternId: string) => void;
  onUpdate?: (patternId: string, updates: Partial<Pick<Pattern, "name" | "trigger" | "steps" | "timeWindow">>) => void;
  onArchive?: (patternId: string) => void;
  onRemove?: (patternId: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(pattern.name);
  const [editTrigger, setEditTrigger] = useState(pattern.trigger);
  const [editSteps, setEditSteps] = useState(pattern.steps.filter(s => !s.isTrigger).map(s => ({ ...s })));
  const [editTimeWindow, setEditTimeWindow] = useState(pattern.timeWindow || "");
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const timer = setTimeout(() => document.addEventListener("mousedown", handler), 10);
    return () => { clearTimeout(timer); document.removeEventListener("mousedown", handler); };
  }, [menuOpen]);

  const startEditing = () => {
    setEditName(pattern.name);
    setEditTrigger(pattern.trigger);
    setEditSteps(pattern.steps.filter(s => !s.isTrigger).map(s => ({ ...s })));
    setEditTimeWindow(pattern.timeWindow || "");
    setEditing(true);
    setMenuOpen(false);
  };

  const cancelEditing = () => setEditing(false);

  const saveEditing = () => {
    const triggerStep = pattern.steps.find(s => s.isTrigger);
    const updatedSteps = [
      ...(triggerStep ? [{ ...triggerStep, text: editTrigger }] : []),
      ...editSteps.map((s, i) => ({ ...s, order: i + 1 })),
    ];
    onUpdate?.(pattern.id, {
      name: editName,
      trigger: editTrigger,
      steps: updatedSteps,
      timeWindow: editTimeWindow || undefined,
    });
    setEditing(false);
  };

  const addStep = () => {
    setEditSteps(prev => [...prev, {
      behaviorKey: `step-${Date.now()}`,
      text: "",
      order: prev.length + 1,
      isTrigger: false,
    }]);
  };

  const removeStep = (index: number) => {
    setEditSteps(prev => prev.filter((_, i) => i !== index));
  };

  const updateStepText = (index: number, text: string) => {
    setEditSteps(prev => prev.map((s, i) => i === index ? { ...s, text } : s));
  };

  const colors = statusColor(pattern.status);
  const percent = validationPercent(pattern);
  const triggerStep = pattern.steps.find(s => s.isTrigger);
  const pathwaySteps = pattern.steps.filter(s => !s.isTrigger);
  const allDims = getAllStepDimensions(pattern, aspirations);
  const aspirationName = getAspirationName(pattern, aspirations);
  const { comingUp, longerArc } = getAspirationPhases(pattern, aspirations);
  const hasExpandContent = comingUp.length > 0 || longerArc.length > 0;
  const archetypeLabel = getArchetypeMatch(pattern, aspirations, primaryArchetype);

  return (
    <div
      onClick={editing ? undefined : onToggle}
      className={`bg-white border border-sand-300 rounded-2xl mb-5 overflow-hidden ${editing ? "cursor-default" : hasExpandContent ? "cursor-pointer" : "cursor-default"}`}
    >
      {/* Header */}
      <div className="px-4 pt-3.5 pb-3 border-b border-sand-200/80 flex justify-between items-center gap-2">
        {editing ? (
          <input
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onClick={e => e.stopPropagation()}
            className="font-serif text-sage-700 text-lg leading-[1.3] min-w-0 flex-1 bg-sand-100 border border-sand-300 rounded-lg px-2 py-1 outline-none"
          />
        ) : (
          <span
            className="font-serif text-sage-700 text-lg leading-[1.3] overflow-hidden text-ellipsis whitespace-nowrap min-w-0 flex-1"
          >
            {displayName(pattern.name)}
          </span>
        )}
        <div className="flex items-center gap-2 shrink-0 relative">
          {archetypeLabel && !editing && (
            <span className="font-sans text-[9px] font-semibold tracking-[0.12em] uppercase text-sage-300">
              {archetypeLabel}
            </span>
          )}
          {!editing && (
            <span
              className="font-sans text-[11px] font-semibold tracking-[0.08em] px-2.5 py-[3px] rounded-[10px] uppercase"
              style={{
                background: colors.bg,
                color: colors.text,
              }}
            >
              {statusLabel(pattern.status)}
            </span>
          )}
          {/* Overflow menu */}
          {!editing && (
            <div ref={menuRef} className="relative">
              <button
                onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                className="cursor-pointer bg-transparent border-none px-1.5 py-1 text-base leading-none text-ink-400 tracking-[2px]"
                aria-label="Pattern options"
              >
                &middot;&middot;&middot;
              </button>
              {menuOpen && (
                <div className="absolute top-full right-0 mt-1 bg-sand-50 border border-sand-300 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] z-20 min-w-[140px] overflow-hidden"
                >
                  <button
                    onClick={e => { e.stopPropagation(); startEditing(); }}
                    className="font-sans cursor-pointer block w-full text-left py-2.5 px-4 text-sm text-ink-800 bg-transparent border-none border-b border-sand-200/80"
                  >
                    Edit
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); onArchive?.(pattern.id); }}
                    className="font-sans cursor-pointer block w-full text-left py-2.5 px-4 text-sm text-ink-800 bg-transparent border-none border-b border-sand-200/80"
                  >
                    Archive
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); onRemove?.(pattern.id); }}
                    className="font-sans cursor-pointer block w-full text-left py-2.5 px-4 text-sm text-rose bg-transparent border-none"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Trigger + Pathway — edit mode or display mode */}
      {editing ? (
        <div className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
          {/* Edit: Trigger */}
          <div className="mb-3.5">
            <span className="font-sans block text-[9px] font-semibold tracking-[0.18em] text-amber-600 mb-1">
              THE DECISION
            </span>
            <input
              value={editTrigger}
              onChange={e => setEditTrigger(e.target.value)}
              className="font-sans w-full text-[15px] font-medium text-sage-700 leading-[1.4] bg-sand-100 border border-sand-300 rounded-lg px-2 py-1.5 outline-none"
            />
          </div>

          {/* Edit: Golden Pathway steps */}
          <div>
            <span className="font-sans block text-[9px] font-semibold tracking-[0.18em] text-sage-400 mb-2">
              GOLDEN PATHWAY
            </span>
            <div className="flex flex-col gap-2">
              {editSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sage-300 shrink-0" />
                  <input
                    value={step.text}
                    onChange={e => updateStepText(i, e.target.value)}
                    className="font-sans text-sage-600 flex-1 text-sm leading-[1.4] bg-sand-100 border border-sand-300 rounded-lg px-2 py-1 outline-none"
                  />
                  <button
                    onClick={() => removeStep(i)}
                    className="cursor-pointer bg-transparent border-none text-base text-ink-400 px-1.5 py-0.5 leading-none"
                    aria-label="Remove step"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <button
                onClick={addStep}
                className="font-sans cursor-pointer flex items-center gap-2 bg-transparent border-none py-1 text-[13px] text-sage-400"
              >
                <span className="text-base leading-none">+</span> Add step
              </button>
            </div>
          </div>

          {/* Edit: Time window */}
          <div className="mt-3.5">
            <span className="font-sans block text-[9px] font-semibold tracking-[0.18em] text-sage-400 mb-1">
              TIME WINDOW
            </span>
            <input
              value={editTimeWindow}
              onChange={e => setEditTimeWindow(e.target.value)}
              placeholder="e.g. 5:15–5:45 AM"
              className="font-sans text-sage-400 w-full text-xs italic bg-sand-100 border border-sand-300 rounded-lg px-2 py-1 outline-none"
            />
          </div>

          {/* Save / Cancel */}
          <div className="flex gap-2.5 mt-4">
            <button
              onClick={cancelEditing}
              className="font-sans font-medium cursor-pointer flex-1 p-2.5 rounded-[10px] text-sm bg-sand-250 text-ink-500 border-none"
            >
              Cancel
            </button>
            <button
              onClick={saveEditing}
              className="font-sans font-medium cursor-pointer flex-1 p-2.5 rounded-[10px] text-sm bg-amber-600 text-sand-50 border-none"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3.5">
          {/* The Decision */}
          {triggerStep && (
            <div className={pathwaySteps.length > 0 ? "mb-3.5" : ""}>
              <span className="font-sans block text-[9px] font-semibold tracking-[0.18em] text-amber-600 mb-1">
                THE DECISION
              </span>
              <span className="font-sans text-[15px] font-medium text-sage-700 leading-[1.4]">
                {triggerStep.text}
              </span>

              {/* Dimension pills — nodal visibility */}
              {(() => {
                const dims = getTriggerDimensions(pattern, aspirations);
                const shared = getSharedCaption(pattern, aspirations);
                if (dims.length === 0 && !shared) return null;
                return (
                  <div className="mt-1.5 flex flex-col gap-1">
                    {dims.length > 0 && (
                      <div className="flex flex-wrap gap-2 items-center">
                        {dims.map(dim => (
                          <div key={dim} className="inline-flex items-center gap-1">
                            <div
                              className="w-[5px] h-[5px] rounded-full shrink-0"
                              style={{ background: DIMENSION_COLORS[dim] || "var(--color-sage-400)" }}
                            />
                            <span className="font-sans text-[10px] text-sage-400">
                              {DIMENSION_LABELS[dim] || dim}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {shared && (
                      <span className="font-sans text-[10px] italic text-sage-400">
                        {shared}
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Golden Pathway */}
          {pathwaySteps.length > 0 && (
            <div>
              <span className="font-sans block text-[9px] font-semibold tracking-[0.18em] text-sage-400 mb-2">
                GOLDEN PATHWAY
              </span>
              <div className="flex flex-col gap-1.5">
                {pathwaySteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-sage-300 mt-1.5 shrink-0" />
                    <span className="font-sans text-sage-600 text-sm leading-[1.4]">
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aggregate dimension row — all dimensions across all steps */}
          {allDims.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-2 items-center">
              <span className="font-sans text-[11px] text-sage-400">
                Touches
              </span>
              {allDims.map(dim => (
                <div key={dim} className="inline-flex items-center gap-1">
                  <div
                    className="w-[5px] h-[5px] rounded-full shrink-0"
                    style={{ background: DIMENSION_COLORS[dim] || "var(--color-sage-400)" }}
                  />
                  <span className="font-sans text-[11px] text-sage-400">
                    {DIMENSION_LABELS[dim] || dim}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Time window if present (shown in collapsed state too) */}
          {pattern.timeWindow && (
            <div className="font-sans text-sage-400 text-xs mt-3 italic">
              {pattern.timeWindow}
            </div>
          )}
        </div>
      )}

      {/* Expanded: Coming Up + Longer Arc */}
      <div
        style={{
          maxHeight: expanded ? "600px" : "0px",
          opacity: expanded ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 300ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {hasExpandContent && (
          <div className="px-4 pb-3.5 border-t border-sand-200/80">
            {/* Coming Up */}
            {comingUp.length > 0 && (
              <div className="pt-3.5">
                <span className="font-sans block text-[9px] font-semibold tracking-[0.18em] text-sage-400 mb-2">
                  COMING UP
                </span>
                <div className="flex flex-col gap-1">
                  {comingUp.map((item, i) => (
                    <div key={i}>
                      <span className="font-sans text-[13px] text-sage-500 leading-[1.4]">
                        {item.name}
                      </span>
                      {item.timeframe && (
                        <span className="font-sans text-xs text-sage-400 ml-1.5">
                          — {item.timeframe}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Longer Arc */}
            {longerArc.length > 0 && (
              <div className="pt-3.5">
                <span className="font-sans block text-[9px] font-semibold tracking-[0.18em] text-sage-400 mb-2">
                  THE LONGER ARC
                </span>
                <div className="flex flex-col gap-1">
                  {longerArc.map((phase, i) => (
                    <div key={i}>
                      <span className="font-sans text-[13px] text-sage-500 leading-[1.4]">
                        {phase.phase}
                      </span>
                      {phase.timeframe && (
                        <span className="font-sans text-xs text-sage-400 ml-1.5">
                          — {phase.timeframe}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation + Sparkline */}
      <div className="px-4 py-3 border-t border-sand-200/80">
        {/* Sparkline + progress bar row */}
        <div className="flex items-center gap-3">
          {/* Progress bar — fills available space */}
          <div className="flex-1 h-1.5 rounded-[3px] bg-sand-200/80 overflow-hidden">
            <div
              className="h-full rounded-[3px] transition-[width] duration-400"
              style={{
                width: `${percent}%`,
                background: progressBarColor(pattern.status),
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </div>
          {/* Sparkline — right side, only when data exists */}
          {sparkline && sparkline.points.length >= 2 && (
            <Sparkline
              points={sparkline.points}
              trend={sparkline.trend}
              width={80}
              height={24}
            />
          )}
        </div>
        {/* Stats row */}
        <div className="font-sans text-[11px] text-sage-400 mt-1.5 flex justify-between">
          <span>{pattern.validationCount} of {pattern.validationTarget} days</span>
          <div className="flex items-center gap-1.5">
            {sparkline && sparkline.trend === "rising" && (
              <span className="font-serif text-[11px] text-sage-700 italic">
                momentum
              </span>
            )}
            {sparkline && sparkline.trend === "dropping" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInvestigate?.(pattern.id);
                }}
                className="font-serif cursor-pointer text-[11px] text-amber-600 italic bg-transparent border-none py-0.5 underline decoration-dotted underline-offset-2"
              >
                something changed
              </button>
            )}
            <span>{percent}%</span>
          </div>
        </div>
      </div>

      {/* Aspiration provenance */}
      {aspirationName && (
        <div className="px-4 pt-2 pb-3 border-t border-sand-200/80">
          <span className="font-sans text-[11px] italic text-sage-400">
            From: {aspirationName}
          </span>
        </div>
      )}

      {/* Merge suggestion */}
      {mergeSuggestion && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="px-4 py-3 border-t border-sand-200/80 bg-[#FDFAF5]"
        >
          <p className="font-serif text-[13px] italic text-sage-600 leading-[1.4] mb-2">
            {mergeSuggestion.sharedBehaviors.length === 1
              ? `\u201c${mergeSuggestion.sharedBehaviors[0]}\u201d also lives in ${displayName(mergeSuggestion.otherPatternName)}.`
              : `${mergeSuggestion.sharedBehaviors.length} shared behaviors with ${displayName(mergeSuggestion.otherPatternName)}.`
            }
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => onMerge?.(pattern.id, mergeSuggestion.otherPatternId)}
              className="font-sans cursor-pointer text-xs font-semibold text-amber-600 bg-transparent border border-amber-600 rounded-lg py-[5px] px-3.5"
            >
              Merge
            </button>
            <button
              onClick={() => onDismissMerge?.(pattern.id, mergeSuggestion.otherPatternId)}
              className="font-sans cursor-pointer text-xs font-medium text-sage-400 bg-transparent border-none py-[5px] px-2"
            >
              Keep separate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyState({ onAddAspiration }: { onAddAspiration: () => void }) {
  return (
    <div className="py-12 px-6 text-center">
      {/* Simple seed icon */}
      <div className="w-14 h-14 rounded-full bg-sage-100 mx-auto mb-4 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 22V12M12 12C12 9 14 6 18 4C14 6 12 9 12 12ZM12 12C12 9 10 6 6 4C10 6 12 9 12 12Z"
            stroke="var(--color-sage-500)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="font-serif text-sage-700 text-xl leading-[1.3] mb-2">
        Patterns emerge from your aspirations.
      </p>
      <p className="font-sans text-sage-400 text-sm leading-normal max-w-[280px] mx-auto mb-4">
        As you check off behaviors on your production sheet, HUMA will surface the patterns that hold your days together.
      </p>
      <button
        onClick={onAddAspiration}
        className="font-sans cursor-pointer text-sm text-amber-600 bg-transparent border-none underline underline-offset-2 p-0"
      >
        Add an aspiration
      </button>
    </div>
  );
}

// ─── Grow Page ──────────────────────────────────────────────────────────────

export default function GrowPage() {
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

  const confirmRemovePattern = confirmRemoveId ? patterns.find(p => p.id === confirmRemoveId) : null;

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

  return (
    <TabShell
      contextPrompt={newAspirationOpen ? "What are you trying to make work?" : "What patterns are you noticing in your days?"}
      sourceTab="grow"
      tabContext={tabContext}
      forceOpen={!!investigatePatternId || newAspirationOpen}
      onChatClose={handleChatClose}
      initialMessage={investigateMessage}
      chatMode={newAspirationOpen ? "new-aspiration" : "default"}
    >
      <div className="min-h-dvh bg-sand-50 pt-6 pb-[100px]">
        {/* Page header */}
        <div className="px-4 pb-6">
          <p className="font-sans text-[11px] font-semibold tracking-[0.14em] uppercase text-sage-400 mb-1">
            GROW
          </p>
          <h1 className="font-serif text-sage-700 text-[26px] leading-[1.2] font-normal">
            Your patterns
          </h1>
          {!loading && patterns.length > 0 && (
            <p className="font-sans text-sage-400 text-[13px] mt-1">
              {patterns.length} pattern{patterns.length !== 1 ? "s" : ""} &middot;{" "}
              {validated.length} validated, {working.length} working, {finding.length} finding
            </p>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <GrowSkeleton />
        ) : patterns.length === 0 && emergingBehaviors.length === 0 ? (
          <EmptyState onAddAspiration={() => setNewAspirationOpen(true)} />
        ) : (
          <div className="px-4">
            {/* Emerging behaviors — "Something forming..." */}
            {emergingBehaviors.length > 0 && (
              <EmergenceCard
                behaviors={emergingBehaviors}
                onFormalize={handleFormalize}
                onDismiss={handleDismissEmergence}
              />
            )}

            {/* Validated patterns */}
            {validated.length > 0 && (
              <PatternSection
                title="Validated"
                subtitle="These patterns are working. They're part of your operating system."
                whySubtitle={whyStatement ? `These serve your WHY: \u201c${whyStatement}\u201d` : undefined}
                patterns={validated}
                aspirations={aspirations}
                expandedId={expandedId}
                onToggleExpand={handleToggleExpand}
                primaryArchetype={archetypes[0]}
                sparklines={sparklines}
                onInvestigate={handleInvestigate}
                mergeSuggestions={mergeSuggestions}
                onMerge={handleMerge}
                onDismissMerge={handleDismissMerge}
                onUpdate={handlePatternUpdate}
                onArchive={handlePatternArchive}
                onRemove={handlePatternRemove}
              />
            )}

            {/* Working patterns */}
            {working.length > 0 && (
              <PatternSection
                title="Working"
                subtitle="You're building these. Keep going."
                patterns={working}
                aspirations={aspirations}
                expandedId={expandedId}
                onToggleExpand={handleToggleExpand}
                primaryArchetype={archetypes[0]}
                sparklines={sparklines}
                onInvestigate={handleInvestigate}
                mergeSuggestions={mergeSuggestions}
                onMerge={handleMerge}
                onDismissMerge={handleDismissMerge}
                onUpdate={handlePatternUpdate}
                onArchive={handlePatternArchive}
                onRemove={handlePatternRemove}
              />
            )}

            {/* Finding patterns */}
            {finding.length > 0 && (
              <PatternSection
                title="Finding"
                subtitle="Still emerging. The shape will clarify with use."
                patterns={finding}
                aspirations={aspirations}
                expandedId={expandedId}
                primaryArchetype={archetypes[0]}
                onToggleExpand={handleToggleExpand}
                sparklines={sparklines}
                onInvestigate={handleInvestigate}
                mergeSuggestions={mergeSuggestions}
                onMerge={handleMerge}
                onDismissMerge={handleDismissMerge}
                onUpdate={handlePatternUpdate}
                onArchive={handlePatternArchive}
                onRemove={handlePatternRemove}
              />
            )}

            {/* Monthly review — previous month's behavior grid */}
            {monthlyReview && (
              <div className="mt-8">
                <MonthlyReview data={monthlyReview} />
              </div>
            )}

            {/* Add aspiration — subtle affordance at bottom of list */}
            <div className="text-center pt-6 pb-2">
              <button
                onClick={() => setNewAspirationOpen(true)}
                className="font-sans cursor-pointer inline-flex items-center gap-1.5 text-[13px] text-sage-400 bg-transparent border border-dashed border-sage-200 rounded-[20px] px-4 py-2 min-h-9"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Add aspiration
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation sheet for pattern removal */}
      <ConfirmationSheet
        open={!!confirmRemoveId}
        title={confirmRemovePattern ? `Remove ${displayName(confirmRemovePattern.name)}?` : "Remove pattern?"}
        body="This removes the pattern and its golden pathway. You can't undo this."
        confirmLabel="Remove"
        cancelLabel="Keep it"
        onConfirm={confirmPatternRemove}
        onCancel={() => setConfirmRemoveId(null)}
      />

      {/* Archive undo toast */}
      {archiveToast && (
        <div
          className="fixed bottom-[100px] left-1/2 -translate-x-1/2 bg-sand-100 text-ink-500 border-2 border-sage-200 rounded-2xl px-5 py-3 flex items-center gap-3 z-40 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
          style={{
            animation: "confirmation-slide-up 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
          }}
        >
          <span className="font-sans text-sm">
            {displayName(archiveToast.name)} archived
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

// ─── Dimension Folding ─────────────────────────────────────────────────────

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

// ─── Pattern Section ────────────────────────────────────────────────────────

function PatternSection({
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
