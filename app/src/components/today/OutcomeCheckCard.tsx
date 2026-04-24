"use client";

/**
 * REGEN-03 (Plan 02-05): Outcome check card — 90-day ground-truth prompt.
 *
 * Mirrors ValidationCard.tsx layout (container, section header, question copy)
 * but asks a four-answer spec-enum question: Yes / Some / No / Worse + a
 * one-sentence why + a snooze link. Rendered inline on /today at the top of
 * the sheet at most once per day (gated by useToday.nextDueOutcome !== null
 * AND !isDormant AND !isFallow).
 *
 * Voice Bible §02 audit (copy locked from spec):
 *   "90 days in —" (header prefix)
 *   "Yes / Some / No / Worse" (spec enum labels)
 *   "one sentence on why" (placeholder)
 *   "Not yet — ask me in a week" (snooze link)
 *   "Submit" (primary CTA)
 *
 * None of these strings appear on the Voice Bible banned-phrase list
 * ("journey", "best self", "on track", "supercharge", "crush it", etc.).
 */

import { useState, memo } from "react";
import type { OutcomeTarget } from "@/lib/outcome-check";

type Answer = "yes" | "some" | "no" | "worse";

interface OutcomeCheckCardProps {
  target: OutcomeTarget;
  targetLabel: string;
  onSubmit: (answer: Answer, why: string) => Promise<void>;
  onSnooze: () => Promise<void>;
}

const ANSWERS: Answer[] = ["yes", "some", "no", "worse"];

export const OutcomeCheckCard = memo(function OutcomeCheckCard({
  target,
  targetLabel,
  onSubmit,
  onSnooze,
}: OutcomeCheckCardProps) {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [why, setWhy] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!answer || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(answer, why.trim());
    } finally {
      setSubmitting(false);
    }
  };

  const headerLabel =
    target.kind === "aspiration" ? "90 days in — Aspiration" : "90 days in — Pattern";

  return (
    <div className="mx-4 mb-3 p-4 bg-sand-100 border border-sand-300 rounded-xl animate-entrance-1">
      <span className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-sage-400 block mb-2">
        {headerLabel}
      </span>

      <p className="font-serif text-[15px] leading-snug text-ink-700 mb-3">
        {targetLabel}
      </p>

      <div className="flex gap-2 mb-3 flex-wrap">
        {ANSWERS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAnswer(a)}
            aria-pressed={answer === a}
            className={`font-sans cursor-pointer text-[13px] font-medium px-4 py-2 rounded-lg border ${
              answer === a
                ? "bg-sage-50 border-sage-450 text-sage-600"
                : "bg-white border-sand-300 text-sage-400"
            }`}
          >
            {a.charAt(0).toUpperCase() + a.slice(1)}
          </button>
        ))}
      </div>

      <textarea
        value={why}
        onChange={(e) => setWhy(e.target.value.slice(0, 280))}
        placeholder="one sentence on why"
        rows={2}
        className="w-full font-sans text-[14px] text-ink-700 placeholder:text-sage-300 bg-white border border-sand-300 rounded-lg py-2 px-3 mb-3 outline-none focus:border-sage-450 resize-none"
      />

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onSnooze}
          className="font-sans text-[12px] text-earth-400 underline underline-offset-4 decoration-sand-300 hover:decoration-earth-400 bg-transparent border-0 cursor-pointer p-0"
        >
          Not yet — ask me in a week
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!answer || submitting}
          className="font-sans cursor-pointer text-[13px] font-medium text-white bg-amber-600 border-none rounded-lg px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? "..." : "Submit"}
        </button>
      </div>
    </div>
  );
});

export default OutcomeCheckCard;
