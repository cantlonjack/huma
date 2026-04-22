/**
 * REGEN-03 (Plan 02-05): Pure helpers for the 90-day outcome-check trigger.
 *
 * The /today page asks at most ONE outcome-check card per day. An aspiration
 * or pattern becomes "due" when:
 *  1. Its `createdAt` is ≥90 calendar days ago (clock starts at creation and
 *     is NOT reset by updates — aspiration edits don't renew the window).
 *  2. No outcome record exists for the (kind, id) pair.
 *
 * Enforcement of "max one per day" happens at the caller — `getNextDueOutcome`
 * returns the single earliest-due target so the page renders at most one card.
 * If a second target is due tomorrow, it will be returned tomorrow.
 *
 * These helpers are pure: no DB, no time globals, caller passes `today: Date`.
 * That makes them trivially testable and lets callers freeze time for fixtures.
 */

export interface OutcomeTarget {
  kind: "aspiration" | "pattern";
  id: string;
  createdAt: string; // ISO 8601 — treated as UTC/local-independent for day math
}

export interface OutcomeRecord {
  target_kind: "aspiration" | "pattern";
  target_id: string;
  answered_at: string; // ISO 8601
  snooze_count: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetween(earlierISO: string, later: Date): number {
  const earlier = new Date(earlierISO).getTime();
  return (later.getTime() - earlier) / MS_PER_DAY;
}

/**
 * True if this target should prompt for outcome today:
 *  - `createdAt` ≥ 90 calendar days ago (from `today` parameter)
 *  - No row in `outcomes` matches (target.kind, target.id)
 *
 * Snooze rows also count as "has outcome record" for the is-due check — the
 * route enforces the 2-snooze ceiling separately via REQUIRED_VISIT. This
 * keeps the trigger predicate simple: any row at all → already engaged → not
 * due again until the operator either snoozes (next day it surfaces again
 * because the route increments snooze_count) or answers.
 *
 * NOTE on snooze: the route inserts a new row per snooze with a placeholder
 * answer and snooze_count > 0. For the is-due check we treat ANY row as
 * "recorded," which is correct because the route surfaces the card again
 * the next day by filtering on snooze_count < 2 at the query level.
 * `isOutcomeDue` here is the conservative predicate that says "this has been
 * engaged" — `getNextDueOutcome` is the UI-facing helper that respects one-
 * card-per-day.
 */
export function isOutcomeDue(
  target: OutcomeTarget,
  outcomes: OutcomeRecord[],
  today: Date,
): boolean {
  if (daysBetween(target.createdAt, today) < 90) return false;
  const recorded = outcomes.some(
    (o) => o.target_kind === target.kind && o.target_id === target.id,
  );
  return !recorded;
}

/**
 * Of all provided aspirations + patterns, return the earliest-due one by
 * `createdAt` ascending (older targets first). Returns `null` if none are
 * due. The "max one outcome-check card per day" rule is enforced here — the
 * page renders at most the returned target.
 */
export function getNextDueOutcome(
  aspirations: OutcomeTarget[],
  patterns: OutcomeTarget[],
  outcomes: OutcomeRecord[],
  today: Date,
): OutcomeTarget | null {
  const pool = [...aspirations, ...patterns].filter((t) =>
    isOutcomeDue(t, outcomes, today),
  );
  if (pool.length === 0) return null;
  pool.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  return pool[0];
}
