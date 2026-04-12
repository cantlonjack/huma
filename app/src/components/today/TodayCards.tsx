"use client";

import { memo, useState } from "react";
import type { Aspiration, Insight, DimensionKey } from "@/types/v2";
import { DIMENSION_COLORS, DIMENSION_LABELS } from "@/types/v2";
import { displayName } from "@/lib/display-name";
import type { TransitionSignal } from "@/types/v2";
import type { ComingUpItem } from "@/hooks/useToday";
import type { StructuralInsight } from "@/lib/structural-insights";
import type { HypothesizedCorrelation } from "@/lib/hypothesized-correlations";
import { ConnectionThreads } from "@/components/shared/ConnectionThreads";

// ─── Aspiration Quick-Look Sheet ────────────────────────────────────────────

export function AspirationQuickLook({
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
        role="dialog"
        aria-modal="true"
        aria-label={displayName(aspiration.clarifiedText || aspiration.rawText)}
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

// ─── Reroute Card ───────────────────────────────────────────────────────────

export const RerouteCard = memo(function RerouteCard({
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
});

// ─── Insight Card ───────────────────────────────────────────────────────────

export function InsightCard({
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

// ─── Coming Up Section ──────────────────────────────────────────────────────

export function ComingUpSection({ items }: { items: ComingUpItem[] }) {
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

export const StandaloneBehaviorRow = memo(function StandaloneBehaviorRow({
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
      <span
        className={`font-sans flex-1 text-left text-sm transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isChecked ? "text-ink-200 line-through decoration-ink-200 decoration-1" : "text-sage-600"}`}
      >
        {entry.behavior_text}
      </span>

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
});

// ─── Transition Card ────────────────────────────────────────────────────────

export function TransitionCard({
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

// ─── Structural Insight Card ───────────────────────────────────────────────

export function StructuralInsightCard({
  insight,
  onTellMore,
  onDismiss,
}: {
  insight: StructuralInsight;
  onTellMore: () => void;
  onDismiss: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="animate-entrance-2 bg-sand-50 border-l-[3px] border-l-sky-600 rounded-r-xl px-4 py-3.5 mx-4 mb-3">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <ConnectionThreads
            activeDimensions={insight.dimensions}
            size="micro"
            animate={false}
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-sans text-[10px] font-semibold tracking-[0.18em] text-sky-600 uppercase">
            From your structure
          </span>
          <p className="font-serif text-ink-700 text-[15px] leading-relaxed mt-1">
            {insight.body}
          </p>
        </div>
      </div>

      {/* Expandable evidence */}
      {insight.behaviors.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="font-sans cursor-pointer text-[12px] text-ink-300 mt-2 ml-[44px] bg-transparent border-none p-0 hover:text-ink-500 transition-colors"
        >
          {expanded ? "Hide evidence" : `${insight.behaviors.length} behavior${insight.behaviors.length === 1 ? "" : "s"} involved`}
        </button>
      )}

      {expanded && insight.behaviors.length > 0 && (
        <div className="ml-[44px] mt-1.5 flex flex-col gap-1">
          {insight.behaviors.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="size-1 rounded-full bg-sky-600 flex-shrink-0" />
              <span className="font-sans text-[12px] text-ink-400">{b}</span>
            </div>
          ))}
          {insight.dimensions.length > 0 && (
            <div className="flex gap-1.5 mt-1">
              {insight.dimensions.map(dim => (
                <span
                  key={dim}
                  className="font-sans text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    background: `${DIMENSION_COLORS[dim]}15`,
                    color: DIMENSION_COLORS[dim],
                  }}
                >
                  {DIMENSION_LABELS[dim]}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center mt-2.5">
        <button
          onClick={onTellMore}
          className="font-sans font-medium text-sky-600 cursor-pointer hover:text-sky-800 transition-colors text-[13px] bg-transparent border-none py-2 min-h-[44px]"
        >
          Tell me more &rarr;
        </button>
        <button
          onClick={onDismiss}
          className="font-sans text-ink-200 cursor-pointer hover:text-ink-400 transition-colors text-base bg-transparent border-none p-2 min-h-[44px] min-w-[44px] flex items-center justify-center leading-none"
          aria-label="Dismiss insight"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

// ─── Hypothesis Card ───────────────────────────────────────────────────────

export function HypothesisCard({
  hypothesis,
  onDismiss,
}: {
  hypothesis: HypothesizedCorrelation;
  onDismiss: () => void;
}) {
  return (
    <div className="animate-entrance-2 bg-sand-50 border-l-[3px] border-l-ink-300 border-dashed rounded-r-xl px-4 py-3.5 mx-4 mb-3">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <ConnectionThreads
            activeDimensions={hypothesis.dimensions}
            size="micro"
            animate={false}
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-sans text-[10px] font-semibold tracking-[0.18em] text-ink-400 uppercase">
            HUMA suspects
          </span>
          <p className="font-serif text-ink-600 text-[14px] leading-relaxed mt-1">
            {hypothesis.hypothesis}
          </p>
          <p className="font-sans text-[11px] text-ink-300 mt-1.5 italic">
            Needs: {hypothesis.dataNeeded}
          </p>
        </div>
      </div>
      <div className="flex justify-end mt-2">
        <button
          onClick={onDismiss}
          className="font-sans text-ink-200 cursor-pointer hover:text-ink-400 transition-colors text-base bg-transparent border-none p-2 min-h-[44px] min-w-[44px] flex items-center justify-center leading-none"
          aria-label="Dismiss hypothesis"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
