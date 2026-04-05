"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Aspiration, Behavior, FutureAction, Insight, SheetEntry } from "@/types/v2";
import { DIMENSION_COLORS } from "@/types/v2";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import { displayName } from "@/lib/display-name";
import { getLocalDate, getLocalDateOffset } from "@/lib/date-utils";
import { compileSheet, type CompiledSheet } from "@/lib/sheet-compiler";
import TabShell from "@/components/TabShell";
import TodaySkeleton from "@/components/TodaySkeleton";
import WeekRhythm from "@/components/WeekRhythm";
import NotificationSettings from "@/components/NotificationSettings";
import { usePush } from "@/lib/use-push";
import {
  getAspirations,
  getKnownContext,
  getUndeliveredInsight,
  computeStructuralInsight,
  markInsightDelivered,
  logBehaviorCheckoff,
  getBehaviorWeekCounts,
  getBehaviorDayOfWeekCounts,
  getRecentCompletionDays,
} from "@/lib/supabase-v2";
import { detectTransition } from "@/lib/transition-detection";
import type { TransitionSignal } from "@/types/v2";

// ─── Types ──────────────────────────────────────────────────────────────────

interface BehaviorStep {
  text: string;
  is_trigger: boolean;
  dimension: string;
  dimensions: string[];
}

interface CheckedEntry {
  aspiration_id: string;
  behavior_text: string;
}

// ─── Dimension dot colors — uses shared DIMENSION_COLORS from types/v2 ─────

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatHeaderDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = d.getDate();
  return `${weekday} ${month} ${day}`;
}

function getDayCount(): number {
  try {
    const start = localStorage.getItem("huma-v2-start-date");
    if (start) {
      const diff = Math.ceil((Date.now() - new Date(start).getTime()) / 86400000);
      return diff > 0 ? diff : 1;
    }
  } catch { /* fresh */ }
  return 1;
}

/** Extract behavior steps from aspiration data */
function getBehaviorChain(aspiration: Aspiration): BehaviorStep[] {
  if (!aspiration.behaviors || aspiration.behaviors.length === 0) return [];

  const triggerBehavior = aspiration.triggerData?.behavior?.toLowerCase().trim();

  return aspiration.behaviors.map((b, i) => {
    // Check is_trigger from decomposition data (stored as extra property)
    const behaviorAny = b as Behavior & { is_trigger?: boolean };
    const isTrigger = behaviorAny.is_trigger === true
      || (triggerBehavior ? b.text.toLowerCase().trim() === triggerBehavior : i === 0);

    const dim = b.dimensions?.[0];
    const dimension = dim
      ? (typeof dim === "string" ? dim : dim.dimension)
      : "";

    // Extract all dimension keys for this behavior
    const allDims: string[] = b.dimensions
      ? b.dimensions.map(d => typeof d === "string" ? d : d.dimension).filter(Boolean)
      : [];

    return { text: b.text, is_trigger: isTrigger, dimension, dimensions: allDims };
  });
}

/** Get 30-day completion count for an aspiration */
function get30DayCount(
  entries: Array<{ aspiration_id: string; date: string; completed: boolean }>,
  aspirationId: string
): number {
  return entries.filter(
    e => e.aspiration_id === aspirationId && e.completed
  ).length;
}

// ─── Aspiration Quick-Look Sheet ────────────────────────────────────────────

function AspirationQuickLook({
  aspiration,
  weekCompletions,
  onClose,
}: {
  aspiration: Aspiration;
  weekCompletions: number;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-[55] bg-black/15 animate-overlay-in" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-[56] bg-sand-50 rounded-t-2xl border-t border-sand-300 animate-slide-up h-[40dvh]"
      >
        <div
          className="flex justify-center items-center cursor-pointer pt-2 pb-1 min-h-[44px]"
          onClick={onClose}
        >
          <div className="bg-sand-300 w-9 h-1 rounded-sm" />
        </div>
        <div className="px-6 pb-6 overflow-y-auto max-h-[calc(40dvh-40px)]">
          <h3 className="font-serif text-sage-700 text-xl leading-tight break-words">
            {displayName(aspiration.clarifiedText || aspiration.rawText)}
          </h3>
          {aspiration.clarifiedText && aspiration.clarifiedText !== aspiration.rawText && (
            <p className="font-sans text-ink-500 mt-1 text-sm leading-snug">
              {aspiration.rawText}
            </p>
          )}
          <p className="font-sans text-sage-600 text-sm mt-2">
            {aspiration.behaviors.length} behaviors active
          </p>
          <p className="font-sans text-sage-400 text-sm mt-1">
            {weekCompletions}/7 days this week
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Pattern Route Card ─────────────────────────────────────────────────────

/** Build a one-line trigger caption: dimensions served + shared behavior signal */
function triggerCaption(
  triggerStep: BehaviorStep | undefined,
  allAspirations: Aspiration[],
  currentAspirationId: string,
): string | null {
  if (!triggerStep) return null;

  const parts: string[] = [];
  const LABELS: Record<string, string> = {
    body: "body", people: "people", money: "money", home: "home",
    growth: "growth", joy: "joy", purpose: "purpose", identity: "identity",
  };

  // Dimension count
  const dims = triggerStep.dimensions;
  if (dims.length > 1) {
    const names = dims.map(d => LABELS[d] || d);
    parts.push(`Serves ${names.join(", ")}`);
  }

  // Shared behavior detection: does this trigger text appear in other aspirations?
  const triggerText = triggerStep.text.toLowerCase().trim();
  const sharedWith = allAspirations.filter(a =>
    a.id !== currentAspirationId &&
    a.behaviors?.some(b => b.text.toLowerCase().trim() === triggerText)
  );
  if (sharedWith.length > 0) {
    const name = displayName(sharedWith[0].clarifiedText || sharedWith[0].rawText);
    if (sharedWith.length === 1) {
      parts.push(`Shared with ${name}`);
    } else {
      parts.push(`Shared across ${sharedWith.length + 1} patterns`);
    }
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

function PatternRouteCard({
  aspiration,
  steps,
  checkedSteps,
  weekCounts,
  thirtyDayCount,
  allAspirations,
  dayOfWeekCounts,
  disruption,
  dayCount,
  onToggleStep,
  onOpenChat,
}: {
  aspiration: Aspiration;
  steps: BehaviorStep[];
  checkedSteps: Set<string>;
  weekCounts: Record<string, { completed: number; total: number }>;
  thirtyDayCount: number;
  allAspirations: Aspiration[];
  dayOfWeekCounts: Record<number, number>;
  disruption: string | null;
  dayCount: number;
  onToggleStep: (aspirationId: string, stepText: string, checked: boolean) => void;
  onOpenChat: (context: string) => void;
}) {
  const [showCompletion, setShowCompletion] = useState(false);
  const [microCounters, setMicroCounters] = useState<Set<string>>(new Set());
  const [glowingStep, setGlowingStep] = useState<string | null>(null);

  const allChecked = steps.length > 0 && steps.every(s => checkedSteps.has(s.text));
  const validationStatus = aspiration.funnel?.validationStatus || "working";

  // Show completion state when all steps checked
  useEffect(() => {
    if (allChecked && steps.length > 0) {
      const timer = setTimeout(() => setShowCompletion(true), 300);
      return () => clearTimeout(timer);
    }
    setShowCompletion(false);
  }, [allChecked, steps.length]);

  const handleToggle = (stepText: string) => {
    const wasChecked = checkedSteps.has(stepText);

    if (!wasChecked) {
      // Glow dimension dots
      setGlowingStep(stepText);
      setTimeout(() => setGlowingStep(null), 600);

      // Show micro-counter after 150ms
      setTimeout(() => {
        setMicroCounters(prev => new Set(prev).add(stepText));
      }, 150);
    } else {
      setMicroCounters(prev => {
        const next = new Set(prev);
        next.delete(stepText);
        return next;
      });
    }

    onToggleStep(aspiration.id, stepText, !wasChecked);
  };

  // No behavior chain fallback
  if (steps.length === 0) {
    return (
      <div className="bg-white border border-sand-300 rounded-2xl mx-4 mb-3 overflow-hidden">
        <div className="px-4 pt-3.5 pb-2.5 border-b border-sand-200">
          <span className="font-serif text-sage-700 text-lg block truncate">
            {displayName(aspiration.clarifiedText || aspiration.rawText)}
          </span>
        </div>
        <div className="px-4 pt-3.5 pb-4">
          <div className="px-4 py-2.5">
            <span className="font-sans text-sage-600 text-sm">
              {displayName(aspiration.clarifiedText || aspiration.rawText)}
            </span>
          </div>
          <button
            onClick={() =>
              onOpenChat(`Let's map out ${displayName(aspiration.clarifiedText || aspiration.rawText)}. What does doing this actually look like day to day?`)
            }
            className="cursor-pointer px-4 pt-1 pb-2.5"
          >
            <span className="font-serif italic text-sage-400 text-[13px]">
              Still mapping your route.
            </span>
          </button>
        </div>
      </div>
    );
  }

  const triggerIdx = steps.findIndex(s => s.is_trigger);
  const estimatedMinutes = (aspiration as unknown as Record<string, unknown>).estimated_minutes as number | undefined;

  return (
    <div className="bg-white border border-sand-300 rounded-2xl mx-4 mb-3 overflow-hidden">
      {/* Card header */}
      <div className="px-4 pt-3.5 pb-2.5 border-b border-sand-200 flex justify-between items-baseline">
        <span className="font-serif text-sage-700 text-lg truncate min-w-0 flex-1">
          {displayName(aspiration.clarifiedText || aspiration.rawText)}
        </span>
        {estimatedMinutes && (
          <span className="font-sans text-sage-400 flex-shrink-0 text-xs ml-2">
            ~{estimatedMinutes} min
          </span>
        )}
      </div>

      {/* Steps or completion */}
      {showCompletion ? (
        <button
          onClick={() => setShowCompletion(false)}
          className="w-full cursor-pointer py-5 px-4 bg-gradient-to-br from-sage-50 to-sand-100 text-center"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mx-auto mb-2">
            <path d="M5 13l4 4L19 7" stroke="var(--color-sage-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-serif italic text-sage-600 text-base">
            Done for today.
          </span>
        </button>
      ) : (
        <div>
          {steps.map((step, i) => {
            const isChecked = checkedSteps.has(step.text);
            const isTrigger = step.is_trigger;
            const wc = weekCounts[step.text];
            const showMicro = microCounters.has(step.text) && isChecked;

            return (
              <button
                key={`${aspiration.id}-${i}`}
                onClick={() => handleToggle(step.text)}
                className={`w-full text-left cursor-pointer flex items-start gap-2 px-4 transition-[background] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isTrigger ? "py-3" : "py-2.5"} ${isTrigger && !isChecked ? "bg-gradient-to-br from-amber-100/40 to-amber-100" : "bg-transparent"}`}
                style={{
                  borderBottom: i < steps.length - 1 ? "1px solid var(--color-sand-200)" : "none",
                }}
              >
                {/* Text content */}
                <div className="flex-1 min-w-0">
                  {/* Trigger badge */}
                  {isTrigger && (
                    <span
                      className={`block font-sans text-[9px] font-semibold tracking-[0.18em] mb-0.5 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isChecked ? "text-ink-200" : "text-amber-600"}`}
                    >
                      THE DECISION
                    </span>
                  )}

                  {/* Step text */}
                  <span
                    className={`block font-sans leading-snug transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isTrigger ? "text-[15px] font-medium" : "text-sm"} ${isChecked ? "text-ink-200 line-through decoration-ink-200 decoration-1" : (isTrigger ? "text-sage-700" : "text-sage-600")}`}
                  >
                    {step.text}
                  </span>

                  {/* Trigger caption — nodal visibility */}
                  {isTrigger && (() => {
                    const caption = triggerCaption(step, allAspirations, aspiration.id);
                    return caption ? (
                      <span
                        className={`block font-sans text-[11px] italic mt-0.5 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isChecked ? "text-ink-200" : "text-sage-400"}`}
                      >
                        {caption}
                      </span>
                    ) : null;
                  })()}

                  {/* Micro-counter */}
                  {showMicro && wc && (
                    <span className="block font-sans text-[11px] italic text-sage-400 mt-0.5 animate-fade-in">
                      {step.text} &middot; {wc.completed} of 7 days this week
                    </span>
                  )}
                </div>

                {/* Dimension dots */}
                {step.dimensions.length > 0 && (
                  <div className={`flex gap-[3px] items-center flex-shrink-0 ${isTrigger ? "mt-2.5" : "mt-0.5"}`}>
                    {step.dimensions.map(dim => (
                      <div
                        key={dim}
                        title={dim}
                        className={`size-1.5 rounded-full transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${glowingStep === step.text ? "animate-dim-glow" : ""}`}
                        style={{
                          background: DIMENSION_COLORS[dim as keyof typeof DIMENSION_COLORS] || "var(--color-sage-400)",
                          opacity: isChecked && glowingStep !== step.text ? 0.35 : 1,
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Weekly rhythm (only after 7+ days of data) */}
      {!showCompletion && dayCount >= 7 && Object.keys(dayOfWeekCounts).length > 0 && (
        <WeekRhythm
          dayCounts={dayOfWeekCounts}
          disruption={disruption}
          onDisruptionTap={disruption ? () => {
            const name = displayName(aspiration.clarifiedText || aspiration.rawText);
            onOpenChat(`Looking at ${name} — ${disruption}`);
          } : undefined}
        />
      )}

      {/* Footer: dimensions + timing/validation */}
      {!showCompletion && (() => {
        // Collect unique dimensions across all steps
        const allDims = Array.from(new Set(steps.flatMap(s => s.dimensions)));
        const LABELS: Record<string, string> = {
          body: "Body", people: "People", money: "Money", home: "Home",
          growth: "Growth", joy: "Joy", purpose: "Purpose", identity: "Identity",
        };
        return (
          <>
            {/* Dimension summary */}
            {allDims.length > 0 && (
              <div className="px-3.5 pt-1.5 border-t border-sand-200 flex items-center gap-1.5">
                <div className="flex gap-[3px] flex-shrink-0">
                  {allDims.map(dim => (
                    <div
                      key={dim}
                      className="size-[5px] rounded-full"
                      style={{ background: DIMENSION_COLORS[dim as keyof typeof DIMENSION_COLORS] || "var(--color-sage-400)" }}
                    />
                  ))}
                </div>
                <span className="font-sans text-sage-400 text-[11px]">
                  Touches {allDims.map(d => LABELS[d] || d).join(", ")}
                </span>
              </div>
            )}

            {/* Window + validation strip */}
            <div
              className={`px-3.5 flex justify-between items-center ${allDims.length > 0 ? "pt-1.5 pb-2.5" : "py-2.5 border-t border-sand-200"}`}
            >
              {/* Left: timing */}
              <span className="font-sans text-sage-400 text-xs">
                {aspiration.triggerData?.window
                  ? `${aspiration.triggerData.window}${aspiration.triggerData.failureNote ? ` · ${aspiration.triggerData.failureNote}` : ""}`
                  : ""}
              </span>

              {/* Right: validation */}
              <span
                className={`font-sans text-xs ${validationStatus === "adjusting" ? "text-amber-600" : (validationStatus === "active" ? "text-sage-400" : "text-sage-500")}`}
              >
                {thirtyDayCount}/30 &middot; {validationStatus}
              </span>
            </div>
          </>
        );
      })()}
    </div>
  );
}

// ─── Reroute Card ───────────────────────────────────────────────────────────

function RerouteCard({
  aspiration,
  weekCompletions,
  onOpenChat,
}: {
  aspiration: Aspiration;
  weekCompletions: number;
  onOpenChat: (context: string) => void;
}) {
  const name = displayName(aspiration.clarifiedText || aspiration.rawText);
  const status = aspiration.funnel?.validationStatus;
  const reason = status === "adjusting"
    ? ((aspiration as unknown as Record<string, unknown>).stall_reason as string) || "Marked for adjustment"
    : `Completed ${weekCompletions} of 7 days this week`;

  return (
    <div className="border-l-[3px] border-l-amber-600 bg-amber-100 rounded-r-xl px-4 py-3.5 mx-4 mb-3">
      <div className="flex justify-between items-baseline">
        <span className="font-sans text-[11px] font-semibold tracking-[0.15em] text-amber-600">
          REROUTE NEEDED
        </span>
        <span className="font-sans text-sage-600 text-[13px] truncate max-w-[60%]">{name}</span>
      </div>
      <p className="font-sans italic text-sage-500 text-[13px] mt-1.5">
        {reason}
      </p>
      <button
        onClick={() => onOpenChat(`Let's look at ${name}. It's been stalling — what's getting in the way?`)}
        className="font-sans cursor-pointer text-[13px] text-amber-600 mt-1 bg-transparent border-none py-2 min-h-[44px]"
      >
        Adjust route &rarr;
      </button>
    </div>
  );
}

// ─── Insight Card ───────────────────────────────────────────────────────────

function InsightCard({
  insight,
  onTellMore,
  onDismiss,
}: {
  insight: Insight;
  onTellMore: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="animate-entrance-2 bg-sand-100 border-l-[3px] border-l-sage-600 rounded-r-xl px-4 py-3.5 mx-4 mb-3">
      <p className="font-serif text-ink-700 text-[15px] leading-relaxed">
        {insight.text}
      </p>
      <div className="flex justify-between items-center mt-2.5">
        <button
          onClick={onTellMore}
          className="font-sans font-medium text-sage-500 cursor-pointer hover:text-sage-700 transition-colors text-[13px] bg-transparent border-none py-2 min-h-[44px]"
        >
          Tell me more &rarr;
        </button>
        <button
          onClick={onDismiss}
          className="font-sans text-sage-300 cursor-pointer hover:text-sage-500 transition-colors text-base bg-transparent border-none p-2 min-h-[44px] min-w-[44px] flex items-center justify-center leading-none"
          aria-label="Dismiss insight"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

// ─── Coming Up Readiness ─────────────────────────────────────────────────────

interface ComingUpItem {
  aspirationName: string;
  action: FutureAction;
}

/**
 * Determines which aspirations have solid THIS WEEK behaviors (70%+ completion
 * rate over the last 7 days) and returns their COMING UP items for surfacing.
 */
function getReadyComingUp(
  aspirations: Aspiration[],
  weekCounts: Record<string, { completed: number; total: number }>,
  dayCount: number,
): ComingUpItem[] {
  // Only surface after 7+ days — need enough data to judge consistency
  if (dayCount < 7) return [];

  const items: ComingUpItem[] = [];

  for (const asp of aspirations) {
    if (!asp.comingUp || asp.comingUp.length === 0) continue;

    // Compute aspiration-level completion rate from its behavior keys
    let totalCompleted = 0;
    let totalLogged = 0;
    for (const b of asp.behaviors) {
      const counts = weekCounts[b.text] || weekCounts[b.key];
      if (counts) {
        totalCompleted += counts.completed;
        totalLogged += counts.total;
      }
    }

    // 70% threshold — behaviors are solid
    if (totalLogged > 0 && totalCompleted / totalLogged >= 0.7) {
      // Surface the first comingUp item only — one at a time
      items.push({
        aspirationName: asp.title || asp.clarifiedText || asp.rawText,
        action: asp.comingUp[0],
      });
    }
  }

  return items;
}

function ComingUpSection({ items }: { items: ComingUpItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="px-4 mt-3 mb-4">
      <span className="block font-sans text-[11px] font-semibold tracking-[0.22em] text-ink-300 mb-2.5">
        COMING UP
      </span>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="border-l-2 border-l-sage-300 bg-sand-100 rounded-r-lg px-4 py-3"
          >
            <span className="font-sans text-[11px] text-sage-400 tracking-wide">
              {item.aspirationName} &middot; {item.action.timeframe}
            </span>
            <p className="font-serif text-base leading-snug text-ink-700 mt-1">
              {item.action.name}
            </p>
            {item.action.detail && (
              <p className="font-sans text-[13px] leading-normal text-ink-500 mt-0.5">
                {item.action.detail}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Standalone Behavior Row ────────────────────────────────────────────────

function StandaloneBehaviorRow({
  entry,
  isChecked,
  onToggle,
}: {
  entry: { behavior_text: string; dimensions?: string[] };
  isChecked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full cursor-pointer bg-white border border-sand-300 rounded-[10px] px-4 py-2.5 mx-4 mb-1.5 flex items-center gap-3 max-w-[calc(100%-32px)] transition-[background] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
    >
      {/* Text */}
      <span
        className={`font-sans flex-1 text-left text-sm transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isChecked ? "text-ink-200 line-through decoration-ink-200 decoration-1" : "text-sage-600"}`}
      >
        {entry.behavior_text}
      </span>

      {/* Dimension dots */}
      {entry.dimensions && entry.dimensions.length > 0 && (
        <div className="flex gap-1 flex-shrink-0">
          {entry.dimensions.map(dim => (
            <div
              key={dim}
              className="size-1.5 rounded-full transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                background: DIMENSION_COLORS[dim as keyof typeof DIMENSION_COLORS] || "var(--color-sage-400)",
                opacity: isChecked ? 0.35 : 1,
              }}
            />
          ))}
        </div>
      )}
    </button>
  );
}

// ─── Compiled Sheet Entry Row ──────────────────────────────────────────────

function CompiledEntryRow({
  entry,
  isChecked,
  isTrigger,
  onToggle,
}: {
  entry: SheetEntry;
  isChecked: boolean;
  isTrigger: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasDetail = entry.detail && typeof entry.detail === "string" && entry.detail.length > 0;

  return (
    <div
      className={`transition-[background] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${isTrigger ? "border-l-[3px] border-l-amber-600 bg-sand-100 rounded-r-lg p-5" : "border-l-[3px] border-l-transparent bg-transparent py-[18px] pr-5 pl-[23px]"}`}
    >
      {/* Tap row */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
        className="w-full text-left cursor-pointer"
      >
        {/* Headline — Cormorant Garamond */}
        <span
          className={`block font-serif leading-tight transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isTrigger ? "text-[19px] font-semibold" : "text-[17px] font-medium"} ${isChecked ? "text-ink-200 line-through decoration-ink-200 decoration-1" : (isTrigger ? "text-ink-900" : "text-ink-800")}`}
        >
          {entry.headline || entry.behaviorText}
        </span>

        {/* Detail preview — Source Sans 3, visible without tap */}
        {hasDetail && !isChecked && (
          <p
            className="font-sans text-sm leading-normal text-ink-500 mt-1 overflow-hidden transition-[max-height] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ maxHeight: expanded ? "200px" : "1.5em" }}
          >
            {entry.detail as string}
          </p>
        )}

        {/* Expand hint */}
        {hasDetail && !expanded && !isChecked && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); setExpanded(true); } }}
            className="block cursor-pointer pt-1"
          >
            <span className="font-sans text-xs text-ink-300">
              more &darr;
            </span>
          </span>
        )}

        {/* Dimension dots — inline below text */}
        {entry.dimensions && entry.dimensions.length > 0 && (
          <div className="flex gap-[5px] mt-2">
            {entry.dimensions.map(dim => (
              <div
                key={dim}
                className="size-1.5 rounded-full transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  background: DIMENSION_COLORS[dim as keyof typeof DIMENSION_COLORS] || "var(--color-sage-400)",
                  opacity: isChecked ? 0.35 : 1,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Transition Card ────────────────────────────────────────────────────────

function TransitionCard({
  signal,
  onOpen,
  onDismiss,
}: {
  signal: TransitionSignal;
  onOpen: () => void;
  onDismiss: () => void;
}) {
  const count = signal.decliningAspirations.length;
  const names = signal.decliningAspirations.map(a => a.name);

  return (
    <div className="mx-4 mb-5 px-5 py-4 bg-sand-100 rounded-xl border-l-[3px] border-l-ink-300">
      <p className="font-serif text-ink-700 text-[17px] leading-tight">
        Something shifted
      </p>
      <p className="font-sans text-ink-400 text-[13px] leading-normal mt-1.5">
        {count === 2
          ? `${names[0]} and ${names[1]} both dropped in the same stretch.`
          : `${count} parts of your system dropped at once — ${names.slice(0, 2).join(", ")}${count > 2 ? `, and ${count - 2} more` : ""}.`}
        {" "}That&apos;s not discipline. That&apos;s context.
      </p>
      <div className="flex gap-3 mt-3">
        <button
          onClick={onOpen}
          className="font-sans cursor-pointer text-[13px] font-semibold text-amber-600 bg-transparent border-none p-0"
        >
          Let&apos;s look at it
        </button>
        <button
          onClick={onDismiss}
          className="font-sans cursor-pointer text-[13px] text-ink-300 bg-transparent border-none p-0"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

// ─── Today Page ─────────────────────────────────────────────────────────────

export default function TodayPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [date] = useState(() => getLocalDate());
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [checkedEntries, setCheckedEntries] = useState<Set<string>>(new Set()); // "aspId:behaviorText"
  const [weekCounts, setWeekCounts] = useState<Record<string, { completed: number; total: number }>>({});
  const [thirtyDayCounts, setThirtyDayCounts] = useState<Record<string, number>>({});
  const [quickLookAspiration, setQuickLookAspiration] = useState<Aspiration | null>(null);
  const [chatContext, setChatContext] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMode, setChatMode] = useState<"default" | "new-aspiration">("default");
  const [standaloneEntries, setStandaloneEntries] = useState<Array<{ behavior_text: string; dimensions?: string[] }>>([]);
  const [rhythmData, setRhythmData] = useState<Record<string, Record<number, number>>>({});
  const [disruptions, setDisruptions] = useState<Record<string, string | null>>({});
  const [archetypes, setArchetypes] = useState<string[]>([]);
  const [whyStatementForChat, setWhyStatementForChat] = useState<string | null>(null);
  const [compiledEntries, setCompiledEntries] = useState<SheetEntry[]>([]);
  const [throughLine, setThroughLine] = useState<string | null>(null);
  const [sheetCompiling, setSheetCompiling] = useState(false);
  const [notifSettingsOpen, setNotifSettingsOpen] = useState(false);
  const [transitionSignal, setTransitionSignal] = useState<TransitionSignal | null>(null);
  const insightMarkedRef = useRef(false);
  const sheetCompiledRef = useRef(false);
  const { state: pushState } = usePush(user?.id ?? null);

  const dayCount = getDayCount();

  // ─── Data Loading ───────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return; // Wait for auth to resolve before loading data
    async function loadData() {
      setLoading(true);
      let asps: Aspiration[] = [];
      let insightData: Insight | null = null;
      const checked = new Set<string>();

      const supabase = user ? createClient() : null;

      // Load aspirations
      if (supabase && user) {
        try {
          asps = await getAspirations(supabase, user.id);
        } catch { /* fallback */ }
      }

      if (asps.length === 0) {
        try {
          const saved = localStorage.getItem("huma-v2-aspirations");
          if (saved) asps = JSON.parse(saved);
        } catch { /* fresh */ }
      }

      // Filter to working/active/adjusting
      asps = asps.filter(a => {
        const status = a.funnel?.validationStatus || "working";
        return status === "working" || status === "active" || status === "adjusting";
      });

      // Sort by trigger_time ASC nulls last, then name ASC
      asps.sort((a, b) => {
        const aTime = a.triggerData?.window || "";
        const bTime = b.triggerData?.window || "";
        if (aTime && !bTime) return -1;
        if (!aTime && bTime) return 1;
        if (aTime && bTime && aTime !== bTime) return aTime.localeCompare(bTime);
        const aName = a.clarifiedText || a.rawText;
        const bName = b.clarifiedText || b.rawText;
        return aName.localeCompare(bName);
      });

      setAspirations(asps);

      // Load archetypes + WHY for chat context
      if (supabase && user) {
        try {
          const ctx = await getKnownContext(supabase, user.id);
          const savedArchs = ctx.archetypes as string[] | undefined;
          if (savedArchs && Array.isArray(savedArchs) && savedArchs.length > 0) setArchetypes(savedArchs);
          if (ctx.why_statement) setWhyStatementForChat(ctx.why_statement as string);
        } catch { /* non-critical */ }
      }
      if (archetypes.length === 0 || !whyStatementForChat) {
        try {
          const localCtx = localStorage.getItem("huma-v2-known-context");
          if (localCtx) {
            const parsed = JSON.parse(localCtx);
            if (parsed.archetypes?.length > 0 && archetypes.length === 0) setArchetypes(parsed.archetypes);
            if (parsed.why_statement && !whyStatementForChat) setWhyStatementForChat(parsed.why_statement);
          }
        } catch { /* fresh */ }
      }

      // Load today's checked entries from sheet_entries
      if (supabase && user) {
        try {
          const { data: todayEntries } = await supabase
            .from("sheet_entries")
            .select("aspiration_id, behavior_text, checked")
            .eq("user_id", user.id)
            .eq("date", date)
            .eq("checked", true);

          if (todayEntries) {
            for (const entry of todayEntries) {
              if (entry.aspiration_id && entry.behavior_text) {
                checked.add(`${entry.aspiration_id}:${entry.behavior_text}`);
              }
            }
          }
        } catch { /* non-critical */ }

        // Load standalone behaviors (aspiration_id IS NULL)
        try {
          const { data: standalone } = await supabase
            .from("sheet_entries")
            .select("behavior_text, detail, checked")
            .eq("user_id", user.id)
            .eq("date", date)
            .is("aspiration_id", null);

          if (standalone && standalone.length > 0) {
            setStandaloneEntries(standalone.map(s => ({
              behavior_text: s.behavior_text,
              dimensions: (s.detail as Record<string, unknown>)?.dimensions as string[] || [],
            })));
            for (const s of standalone) {
              if (s.checked) {
                checked.add(`:${s.behavior_text}`);
              }
            }
          }
        } catch { /* non-critical */ }
      }

      // Also check localStorage for today's checks
      try {
        const cached = localStorage.getItem(`huma-v2-sheet-${date}`);
        if (cached) {
          const entries = JSON.parse(cached);
          for (const e of entries) {
            if (e.checked && e.behaviorText) {
              const key = `${e.aspirationId || ""}:${e.behaviorText}`;
              checked.add(key);
            }
          }
        }
      } catch { /* skip */ }

      setCheckedEntries(checked);

      // Load week counts
      if (supabase && user) {
        try {
          const counts = await getBehaviorWeekCounts(supabase, user.id);
          setWeekCounts(counts);
        } catch { /* non-critical */ }
      }

      // Load 30-day counts per aspiration
      if (supabase && user) {
        try {
          const thirtyDaysAgo = getLocalDateOffset(30);
          const { data: logData } = await supabase
            .from("behavior_log")
            .select("behavior_key, completed")
            .eq("user_id", user.id)
            .gte("date", thirtyDaysAgo)
            .eq("completed", true);

          if (logData) {
            const counts: Record<string, number> = {};
            for (const row of logData) {
              // Map behavior_key back to aspiration — approximate via aspiration behaviors
              for (const asp of asps) {
                for (const b of asp.behaviors) {
                  if (b.key === row.behavior_key || b.text === row.behavior_key) {
                    counts[asp.id] = (counts[asp.id] || 0) + 1;
                  }
                }
              }
            }
            setThirtyDayCounts(counts);
          }
        } catch { /* non-critical */ }
      }

      // Load day-of-week rhythm + disruption detection
      if (supabase && user && asps.length > 0 && dayCount >= 7) {
        try {
          const rhythmResults: Record<string, Record<number, number>> = {};
          const disruptionResults: Record<string, string | null> = {};

          await Promise.all(asps.map(async (asp) => {
            const [dowCounts, last7, last3] = await Promise.all([
              getBehaviorDayOfWeekCounts(supabase, user.id, asp.id),
              getRecentCompletionDays(supabase, user.id, asp.id, 7),
              getRecentCompletionDays(supabase, user.id, asp.id, 3),
            ]);
            rhythmResults[asp.id] = dowCounts;

            // Disruption: 4+ of last 7 days but 0 in last 3
            if (last7 >= 4 && last3 === 0) {
              disruptionResults[asp.id] = "3 days since last \u2014 what changed?";
            } else {
              disruptionResults[asp.id] = null;
            }
          }));

          setRhythmData(rhythmResults);
          setDisruptions(disruptionResults);
        } catch { /* non-critical */ }
      }

      // Load unread insight
      if (asps.length > 0) {
        if (supabase && user) {
          try {
            const existing = await getUndeliveredInsight(supabase, user.id);
            if (existing) {
              insightData = existing;
            }
          } catch { /* fall through */ }
        }

        if (!insightData) {
          try {
            const localInsight = localStorage.getItem("huma-v2-pending-insight");
            if (localInsight) {
              insightData = JSON.parse(localInsight);
            }
          } catch { /* compute fresh */ }
        }

        if (!insightData) {
          // Load WHY statement for structural insight prioritization
          let whyStatement: string | null = null;
          if (supabase && user) {
            try {
              const ctx = await getKnownContext(supabase, user.id);
              whyStatement = (ctx.why_statement as string) || null;
            } catch { /* non-critical */ }
          }
          if (!whyStatement) {
            try {
              const localCtx = localStorage.getItem("huma-v2-known-context");
              if (localCtx) {
                const parsed = JSON.parse(localCtx);
                whyStatement = parsed.why_statement || null;
              }
            } catch { /* fresh */ }
          }
          insightData = computeStructuralInsight(asps, whyStatement);
          if (insightData) {
            localStorage.setItem("huma-v2-pending-insight", JSON.stringify(insightData));
          }
        }
      }

      setInsight(insightData);

      // Mark insight as shown
      if (insightData && supabase && user && !insightMarkedRef.current) {
        insightMarkedRef.current = true;
        try {
          await supabase
            .from("insights")
            .update({ shown_at: new Date().toISOString() })
            .eq("id", insightData.id)
            .eq("user_id", user.id);
        } catch { /* non-critical */ }
      }

      setLoading(false);
    }
    loadData();
  }, [user, authLoading, date]);

  // ─── Sheet Compilation ─────────────────────────────────────────────────
  useEffect(() => {
    if (aspirations.length === 0 || sheetCompiledRef.current) return;

    const cacheKey = `huma-v2-compiled-sheet-${date}`;

    // Check localStorage cache first
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as CompiledSheet;
        if (parsed.entries?.length > 0) {
          setCompiledEntries(parsed.entries.slice(0, 5).map(e => ({
            id: e.id || `${e.behaviorKey}-${date}`,
            aspirationId: e.aspirationId || "",
            behaviorKey: e.behaviorKey,
            behaviorText: e.behaviorText || e.headline || "",
            headline: e.headline,
            detail: e.detail || "",
            timeOfDay: e.timeOfDay || "morning",
            dimensions: e.dimensions,
            checked: false,
          })));
          setThroughLine(parsed.throughLine || null);
          sheetCompiledRef.current = true;
          return;
        }
      }
    } catch { /* no cache, compile fresh */ }

    // Compile sheet in background
    sheetCompiledRef.current = true;
    setSheetCompiling(true);

    const supabase = user ? createClient() : null;

    // Get operator name from context
    let operatorName = "there";
    try {
      const localCtx = localStorage.getItem("huma-v2-known-context");
      if (localCtx) {
        const parsed = JSON.parse(localCtx);
        operatorName = parsed.operator_name || parsed.name || "there";
      }
    } catch { /* default */ }

    compileSheet({
      aspirations,
      supabase,
      userId: user?.id || null,
      name: operatorName,
      archetypes: archetypes.length > 0 ? archetypes : undefined,
      whyStatement: whyStatementForChat || undefined,
    })
      .then((result) => {
        if (result.entries.length > 0) {
          setCompiledEntries(result.entries.slice(0, 5));
          setThroughLine(result.throughLine || null);

          // Cache for today
          try {
            localStorage.setItem(cacheKey, JSON.stringify({
              entries: result.entries,
              throughLine: result.throughLine,
              date: result.date,
            }));
          } catch { /* storage full */ }
        }
      })
      .catch(() => { /* compilation failed, PatternRouteCards remain */ })
      .finally(() => setSheetCompiling(false));
  }, [aspirations, date, user, archetypes, whyStatementForChat]);

  // ─── Transition Detection ───────────────────────────────────────────────
  useEffect(() => {
    if (!user || dayCount < 28 || aspirations.length < 2) return;

    // Check if already dismissed recently
    const dismissKey = "huma-v2-transition-dismissed";
    const dismissed = localStorage.getItem(dismissKey);

    const supabase = createClient();
    if (!supabase) return;

    detectTransition(supabase, user.id, aspirations, dayCount, dismissed)
      .then(signal => { if (signal) setTransitionSignal(signal); })
      .catch(() => { /* non-critical */ });
  }, [user, aspirations, dayCount]);

  const dismissTransition = useCallback(() => {
    setTransitionSignal(null);
    localStorage.setItem("huma-v2-transition-dismissed", new Date().toISOString());
  }, []);

  const openTransitionChat = useCallback(() => {
    setChatContext("Something shifted — let's look at what changed.");
    setChatOpen(true);
  }, []);

  // ─── Check-off handler ──────────────────────────────────────────────────
  const handleToggleStep = useCallback(
    (aspirationId: string, stepText: string, checked: boolean) => {
      const key = `${aspirationId}:${stepText}`;

      setCheckedEntries(prev => {
        const next = new Set(prev);
        if (checked) next.add(key);
        else next.delete(key);
        return next;
      });

      // Write to sheet_entries + behavior_log
      if (user) {
        const supabase = createClient();
        if (supabase) {
          if (checked) {
            // Insert sheet_entry
            supabase
              .from("sheet_entries")
              .insert({
                user_id: user.id,
                aspiration_id: aspirationId || null,
                behavior_text: stepText,
                behavior_key: stepText,
                completed: true,
                completed_at: new Date().toISOString(),
                date,
                checked: true,
                checked_at: new Date().toISOString(),
                detail: {},
                time_of_day: "morning",
              })
              .then(() => {});
          } else {
            // Delete matching row
            supabase
              .from("sheet_entries")
              .delete()
              .eq("user_id", user.id)
              .eq("aspiration_id", aspirationId)
              .eq("behavior_text", stepText)
              .eq("date", date)
              .then(() => {});
          }

          // Log behavior
          logBehaviorCheckoff(supabase, user.id, stepText, stepText, aspirationId || null, date, checked)
            .then(() => getBehaviorWeekCounts(supabase, user.id))
            .then(counts => setWeekCounts(counts))
            .catch(() => {});
        }
      }
    },
    [user, date]
  );

  // ─── Standalone toggle ──────────────────────────────────────────────────
  const handleToggleStandalone = useCallback(
    (behaviorText: string) => {
      const key = `:${behaviorText}`;
      const wasChecked = checkedEntries.has(key);

      setCheckedEntries(prev => {
        const next = new Set(prev);
        if (wasChecked) next.delete(key);
        else next.add(key);
        return next;
      });

      if (user) {
        const supabase = createClient();
        if (supabase) {
          if (!wasChecked) {
            supabase.from("sheet_entries").update({ checked: true, checked_at: new Date().toISOString() })
              .eq("user_id", user.id).eq("behavior_text", behaviorText).eq("date", date).is("aspiration_id", null)
              .then(() => {});
          } else {
            supabase.from("sheet_entries").update({ checked: false, checked_at: null })
              .eq("user_id", user.id).eq("behavior_text", behaviorText).eq("date", date).is("aspiration_id", null)
              .then(() => {});
          }
        }
      }
    },
    [user, date, checkedEntries]
  );

  // ─── Chat open handler ─────────────────────────────────────────────────
  const openChatWithContext = useCallback((context: string | null) => {
    setChatContext(context);
    setChatOpen(true);
  }, []);

  // ─── Insight dismiss ───────────────────────────────────────────────────
  const dismissInsight = useCallback(() => {
    if (!insight) return;
    setInsight(null);
    localStorage.removeItem("huma-v2-pending-insight");

    if (user) {
      const supabase = createClient();
      if (supabase) {
        markInsightDelivered(supabase, insight.id, user.id).catch(() => {});
      }
    }
  }, [insight, user]);

  // ─── Reroute detection ─────────────────────────────────────────────────
  const rerouteAspiration = (() => {
    if (dayCount < 14) return null; // 14-day threshold

    const candidates = aspirations.filter(a => {
      const status = a.funnel?.validationStatus;
      if (status === "adjusting") return true;

      // Stalling: active > 14 days AND < 3 completions in last 7
      const aspWeekCompletions = aspirations
        .flatMap(asp => asp.id === a.id ? asp.behaviors.map(b => weekCounts[b.text]?.completed || 0) : [])
        .reduce((sum, c) => sum + c, 0);

      return aspWeekCompletions < 3;
    });

    // Show most recently active (last in sorted list)
    return candidates.length > 0 ? candidates[candidates.length - 1] : null;
  })();

  // ─── Status line ──────────────────────────────────────────────────────
  const adjustingCount = aspirations.filter(a => a.funnel?.validationStatus === "adjusting").length;
  const activeCount = aspirations.length;

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <TabShell
      contextPrompt={chatContext || "Tell HUMA something..."}
      forceOpen={chatOpen}
      onChatClose={() => { setChatOpen(false); setChatContext(null); setChatMode("default"); }}
      chatMode={chatMode}
      hideBubble={aspirations.length > 0}
      sourceTab="today"
      tabContext={{
        aspirations: aspirations.map(a => ({
          id: a.id,
          name: a.clarifiedText || a.rawText,
          behaviors: a.behaviors?.map(b => b.text) || [],
          status: a.funnel?.validationStatus || "working",
        })),
        weekCounts,
        dayCount,
        stalledAspirations: aspirations
          .filter(a => a.funnel?.validationStatus === "adjusting")
          .map(a => a.clarifiedText || a.rawText),
        ...(archetypes.length > 0 && { archetypes }),
        ...(whyStatementForChat && { whyStatement: whyStatementForChat }),
        ...(transitionSignal && chatOpen && { transition: transitionSignal }),
      }}
    >
      <div className="min-h-dvh bg-sand-50 flex flex-col pb-[140px]">
        {/* Header bar — 44px */}
        <div className="h-[44px] border-b border-sand-300 flex justify-between items-center px-4">
          <span className="font-sans font-medium text-sage-500 text-[11px] tracking-[0.4em] leading-none">
            H U M A
          </span>
          <span className="font-sans text-sage-400 text-[11px]">
            {formatHeaderDate(date)} &middot; Day {dayCount}
          </span>
        </div>

        {/* Section label: TODAY */}
        <div className="px-4 pt-4 pb-2">
          <span className="font-sans text-[11px] font-semibold tracking-[0.22em] text-ink-300">
            TODAY
          </span>
        </div>

        {/* Loading state */}
        {loading ? (
          <TodaySkeleton />
        ) : aspirations.length === 0 ? (
          /* ─── Empty State ─── */
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
            {/* SVG illustration */}
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="38" stroke="var(--color-sage-200)" strokeWidth="1.5" strokeDasharray="6 4" />
              <circle cx="40" cy="40" r="4" fill="var(--color-sage-300)" />
            </svg>

            <p className="font-serif italic text-sage-600 text-xl text-center max-w-60">
              Nothing scheduled yet.
            </p>

            <p className="font-sans text-sage-400 text-sm text-center max-w-[260px] leading-normal">
              Start a conversation and HUMA will build your first day.
            </p>

            <button
              onClick={() => router.push("/start?fresh=1")}
              className="font-sans cursor-pointer w-full max-w-[280px] bg-amber-600 text-white text-[15px] font-semibold rounded-lg py-3.5 border-none"
            >
              What&apos;s going on?
            </button>
          </div>
        ) : (
          <>
            {/* Status Line */}
            {activeCount > 0 && (
              <div className="animate-entrance-1 px-4 pb-2">
                {adjustingCount > 0 ? (
                  <span className="font-sans text-[13px] text-amber-600">
                    &#9679; {adjustingCount} need{adjustingCount === 1 ? "s" : ""} attention
                  </span>
                ) : (
                  <span className="font-sans text-sage-500 text-[13px]">
                    <span className="text-sage-400">&#9679;</span> On route &middot; {activeCount} pattern{activeCount !== 1 ? "s" : ""} active
                  </span>
                )}
              </div>
            )}

            {/* Aspiration Ribbon */}
            <div className="hide-scrollbar overflow-x-auto mb-3" style={{ WebkitOverflowScrolling: "touch" }}>
              <div className="flex gap-2 animate-entrance-1 px-4">
                {aspirations.map(asp => (
                  <button
                    key={asp.id}
                    onClick={() => setQuickLookAspiration(asp)}
                    className="flex-shrink-0 cursor-pointer bg-sand-100 border border-sand-300 rounded-full px-3.5 py-2.5 text-[13px] font-sans text-sage-600 whitespace-nowrap min-h-[44px] flex items-center"
                  >
                    {displayName(asp.clarifiedText || asp.rawText)}
                  </button>
                ))}
                {/* Add aspiration */}
                <button
                  onClick={() => {
                    setChatMode("new-aspiration");
                    setChatContext("What are you trying to make work?");
                    setChatOpen(true);
                  }}
                  className="flex-shrink-0 cursor-pointer bg-transparent border border-dashed border-sage-200 rounded-full px-3.5 py-2.5 text-[13px] font-sans text-sage-400 whitespace-nowrap min-h-[44px] flex items-center gap-1"
                  aria-label="Add aspiration"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Add
                </button>
              </div>
            </div>

            {/* Insight Card (conditional — above pattern cards) */}
            {insight && (
              <InsightCard
                insight={insight}
                onTellMore={() => openChatWithContext(insight.text)}
                onDismiss={dismissInsight}
              />
            )}

            {/* Through-line header */}
            {throughLine && compiledEntries.length > 0 && (
              <div className="animate-entrance-2 px-5 pb-5">
                <p className="font-serif italic text-base leading-relaxed text-ink-600 max-w-[480px] tracking-[0.01em]">
                  {throughLine}
                </p>
              </div>
            )}

            {/* Transition Signal — life stage shift detected */}
            {transitionSignal && (
              <TransitionCard
                signal={transitionSignal}
                onOpen={openTransitionChat}
                onDismiss={dismissTransition}
              />
            )}

            {/* Compiled Sheet Entries */}
            {compiledEntries.length > 0 ? (
              <div className="mx-4 mb-4">
                <div className="flex flex-col gap-1.5">
                  {compiledEntries.map((entry, i) => {
                    const isChecked = checkedEntries.has(`${entry.aspirationId}:${entry.behaviorKey}`);
                    return (
                      <CompiledEntryRow
                        key={entry.behaviorKey}
                        entry={entry}
                        isChecked={isChecked}
                        isTrigger={i === 0}
                        onToggle={() =>
                          handleToggleStep(
                            entry.aspirationId,
                            entry.behaviorKey,
                            !isChecked
                          )
                        }
                      />
                    );
                  })}
                </div>
              </div>
            ) : sheetCompiling ? (
              /* Compiling indicator — subtle, not a spinner */
              <div className="px-4 pb-3">
                <p className="font-serif italic text-sage-400 animate-entrance-2 text-sm">
                  Building your day...
                </p>
              </div>
            ) : null}

            {/* Pattern Route Cards (fallback when no compiled sheet, or always below) */}
            {compiledEntries.length === 0 && !sheetCompiling && aspirations
              .filter(a => {
                const status = a.funnel?.validationStatus || "working";
                return status === "working" || status === "active";
              })
              .map((asp, i) => {
                const steps = getBehaviorChain(asp);
                const aspChecked = new Set<string>();
                for (const entry of checkedEntries) {
                  if (entry.startsWith(`${asp.id}:`)) {
                    aspChecked.add(entry.replace(`${asp.id}:`, ""));
                  }
                }

                return (
                  <div key={asp.id} className={i <= 2 ? `animate-entrance-${i + 2}` : ""}>
                    <PatternRouteCard
                      aspiration={asp}
                      steps={steps}
                      checkedSteps={aspChecked}
                      weekCounts={weekCounts}
                      thirtyDayCount={thirtyDayCounts[asp.id] || 0}
                      allAspirations={aspirations}
                      dayOfWeekCounts={rhythmData[asp.id] || {}}
                      disruption={disruptions[asp.id] || null}
                      dayCount={dayCount}
                      onToggleStep={handleToggleStep}
                      onOpenChat={openChatWithContext}
                    />
                  </div>
                );
              })}

            {/* Coming Up — surfaces when THIS WEEK behaviors are solid */}
            <ComingUpSection items={getReadyComingUp(aspirations, weekCounts, dayCount)} />

            {/* Reroute Card (conditional) */}
            {rerouteAspiration && (
              <RerouteCard
                aspiration={rerouteAspiration}
                weekCompletions={
                  rerouteAspiration.behaviors
                    .map(b => weekCounts[b.text]?.completed || 0)
                    .reduce((sum, c) => sum + c, 0)
                }
                onOpenChat={openChatWithContext}
              />
            )}

            {/* Standalone Behaviors (conditional) */}
            {standaloneEntries.length > 0 && (
              <>
                <div className="px-4 pt-4 pb-2">
                  <span className="font-sans text-[11px] font-semibold tracking-[0.22em] text-ink-300">
                    TODAY&apos;S BEHAVIORS
                  </span>
                </div>
                {standaloneEntries.map(entry => (
                  <StandaloneBehaviorRow
                    key={entry.behavior_text}
                    entry={entry}
                    isChecked={checkedEntries.has(`:${entry.behavior_text}`)}
                    onToggle={() => handleToggleStandalone(entry.behavior_text)}
                  />
                ))}
              </>
            )}

            {/* Notification settings link — only for subscribed operators */}
            {pushState === "subscribed" && (
              <div className="px-4 pt-6 text-center">
                <button
                  onClick={() => setNotifSettingsOpen(true)}
                  className="font-sans cursor-pointer text-xs text-earth-400 bg-transparent border-none p-0 underline decoration-sand-300 underline-offset-[3px]"
                >
                  Notification settings
                </button>
              </div>
            )}
          </>
        )}

        {/* Bottom Prompt Bar — persistent, above nav */}
        {!loading && aspirations.length > 0 && (
          <div
            className="fixed left-0 right-0 z-40 bg-sand-50 border-t border-sand-300 px-4 py-2.5 flex items-center gap-2.5"
            style={{ bottom: "calc(56px + env(safe-area-inset-bottom, 0px))" }}
          >
            <button
              onClick={() => openChatWithContext(null)}
              className="flex-1 text-left cursor-pointer bg-white border border-sand-300 rounded-full px-3.5 py-2 text-sm font-sans text-sage-300"
            >
              Tell HUMA something...
            </button>
            <button
              onClick={() => openChatWithContext(null)}
              className="cursor-pointer flex-shrink-0 bg-amber-600 rounded-full size-8 border-none flex items-center justify-center"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <NotificationSettings
        open={notifSettingsOpen}
        onClose={() => setNotifSettingsOpen(false)}
      />

      {/* Aspiration Quick-Look */}
      {quickLookAspiration && (
        <AspirationQuickLook
          aspiration={quickLookAspiration}
          weekCompletions={
            quickLookAspiration.behaviors
              .map(b => weekCounts[b.text]?.completed || 0)
              .reduce((sum, c) => sum + c, 0)
          }
          onClose={() => setQuickLookAspiration(null)}
        />
      )}
    </TabShell>
  );
}
