"use client";

/**
 * REGEN-05 (Plan 02-04): FallowCard — renders when today's local date is in
 * huma_context.fallowDays.
 *
 * Replaces the normal /today sheet with the spec-line copy + a same-day
 * unmark affordance. Spec copy: "Fallow. Compost day." (locked; Voice Bible
 * §02 audit applies — no "journey", "best self", "on track", "supercharge").
 *
 * The unmark link is only visible on the same calendar day; post-midnight
 * the server returns 409 FALLOW_FROZEN and the operator can no longer
 * rewrite history. The link itself remains clickable client-side because
 * the page state only refreshes on query invalidation — the failed POST
 * triggers no visible error (intentional: the fallow mark is an immutable
 * historical record after midnight, not a toggleable switch).
 *
 * Mirrors DormantCard's layout parity for visual rhythm between the two
 * rest states.
 */

interface FallowCardProps {
  onUnmark: () => Promise<void>;
}

export default function FallowCard({ onUnmark }: FallowCardProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50dvh] px-6 py-12 text-center">
      <p className="font-serif text-[22px] leading-snug text-earth-650">
        Fallow. Compost day.
      </p>

      <button
        onClick={onUnmark}
        className="mt-10 font-sans text-[13px] text-earth-400 underline underline-offset-4 decoration-sand-300 hover:decoration-earth-400 bg-transparent border-0 cursor-pointer"
        aria-label="Unmark fallow for today"
      >
        unmark for today
      </button>
    </div>
  );
}
