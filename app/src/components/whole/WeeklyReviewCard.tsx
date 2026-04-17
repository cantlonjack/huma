"use client";

import { useState } from "react";
import type { WeeklyReviewResult } from "@/lib/weekly-review";

export type WeeklyReviewCardState =
  | { kind: "prompt" }
  | { kind: "loading" }
  | { kind: "ready"; review: WeeklyReviewResult }
  | { kind: "error"; message: string };

interface Props {
  state: WeeklyReviewCardState;
  onStart: () => void;
  onDismiss: () => void;
  onClear: () => void;
}

export default function WeeklyReviewCard({
  state,
  onStart,
  onDismiss,
  onClear,
}: Props) {
  if (state.kind === "prompt") {
    return (
      <Shell eyebrow="This week's picture">
        <p className="font-serif text-[15px] italic text-sage-600 leading-snug m-0 mb-3">
          End of another week. Let&rsquo;s see its shape before the next one starts.
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={onStart}
            className="font-sans font-medium cursor-pointer text-[13px] text-sand-50 bg-amber-600 border-none rounded-lg px-4 py-2 min-h-9 transition-opacity"
          >
            Start weekly review
          </button>
          <button
            onClick={onDismiss}
            className="font-sans font-medium cursor-pointer text-[13px] text-sage-450 bg-sand-200 border-none rounded-lg px-4 py-2 min-h-9"
          >
            Not this week
          </button>
        </div>
      </Shell>
    );
  }

  if (state.kind === "loading") {
    return (
      <Shell eyebrow="This week's picture">
        <LoadingRow label="Reading the week" />
      </Shell>
    );
  }

  if (state.kind === "error") {
    return (
      <Shell eyebrow="This week's picture">
        <p className="font-sans text-[13px] text-earth-500 m-0 mb-3">
          {state.message}
        </p>
        <button
          onClick={onStart}
          className="font-sans font-medium cursor-pointer text-[13px] text-sage-600 bg-sand-200 border-none rounded-lg px-4 py-2 min-h-9"
        >
          Try again
        </button>
      </Shell>
    );
  }

  const { review } = state;
  return <ReadyCard review={review} onClear={onClear} />;
}

// ─── Ready card ─────────────────────────────────────────────────────────────

function ReadyCard({
  review,
  onClear,
}: {
  review: WeeklyReviewResult;
  onClear: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Shell eyebrow={`This week's picture · ${formatWeekLabel(review.weekStart)}`}>
      <div className="flex flex-col gap-3">
        <Section label="Wins">
          <p className="font-serif text-[15px] text-earth-500 leading-snug m-0">
            {review.wins}
          </p>
        </Section>

        {review.drifts && (
          <Section label="Drifts">
            <p className="font-serif text-[15px] text-earth-500 leading-snug m-0">
              {review.drifts}
            </p>
          </Section>
        )}

        <Section label="For next week">
          <p className="font-serif text-[15px] italic text-sage-700 leading-snug m-0">
            {review.oneShift}
          </p>
        </Section>

        {expanded && review.graphHighlight && (
          <div className="mt-1 rounded-lg bg-sand-100 border border-sand-200 px-3 py-2">
            <p className="font-sans text-[10px] tracking-[0.18em] uppercase text-sage-300 m-0 mb-1">
              Watch this week
            </p>
            <p className="font-sans text-[13px] text-earth-500 m-0">
              {review.graphHighlight.label}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2.5 mt-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="font-sans font-medium cursor-pointer text-[12px] text-sage-450 bg-transparent border-none p-0 underline underline-offset-2"
        >
          {expanded ? "Collapse" : "Show detail"}
        </button>
        <span className="font-sans text-[12px] text-sand-300">·</span>
        <button
          onClick={onClear}
          className="font-sans font-medium cursor-pointer text-[12px] text-sage-450 bg-transparent border-none p-0 underline underline-offset-2"
        >
          Clear highlight
        </button>
      </div>
    </Shell>
  );
}

// ─── Shared pieces ──────────────────────────────────────────────────────────

function Shell({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-4 rounded-2xl bg-sand-50 border border-sand-250 overflow-hidden">
      <div
        className="h-0.5"
        style={{ background: "linear-gradient(90deg, #E8935A, #B5621E)" }}
      />
      <div className="px-4 pt-4 pb-3.5">
        <p className="font-sans font-medium text-[10px] tracking-[0.18em] uppercase text-sage-300 m-0 mb-2.5">
          {eyebrow}
        </p>
        {children}
      </div>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-sans text-[11px] tracking-[0.12em] uppercase text-sage-300 m-0 mb-1">
        {label}
      </p>
      {children}
    </div>
  );
}

function LoadingRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5 py-2">
      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
      <p className="font-sans text-[13px] text-sage-450 m-0">{label}…</p>
    </div>
  );
}

function formatWeekLabel(weekStart: string): string {
  try {
    const d = new Date(weekStart + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return weekStart;
  }
}
