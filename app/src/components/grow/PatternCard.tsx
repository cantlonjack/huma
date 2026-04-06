"use client";

import { useState, useEffect, useRef, memo } from "react";
import type { Pattern, Aspiration, SparklineData, MergeSuggestion } from "@/types/v2";
import { DIMENSION_COLORS, DIMENSION_LABELS } from "@/types/v2";
import { displayName } from "@/lib/display-name";
import Sparkline from "@/components/grow/Sparkline";
import {
  statusLabel,
  statusColor,
  validationPercent,
  progressBarColor,
  getArchetypeMatch,
  getAllStepDimensions,
  getAspirationName,
  getAspirationPhases,
  getTriggerDimensions,
  getSharedCaption,
} from "@/hooks/useGrow";

const PatternCard = memo(function PatternCard({
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
            aria-label="Pattern name"
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
              aria-label="Trigger decision"
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
                    aria-label={`Step ${i + 1}`}
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
              aria-label="Time window"
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
});

export default PatternCard;
