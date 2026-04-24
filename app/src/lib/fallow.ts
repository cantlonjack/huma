/**
 * REGEN-05 (Plan 02-04): Fallow day pure helpers.
 *
 * Fallow is a one-day operator-declared "compost day" — the sheet replaces
 * with "Fallow. Compost day.", checkoffs are rejected (409 FALLOW_DAY), and
 * no behavior_log rows are written. Unmark is allowed only on the same
 * calendar day; post-midnight attempts return 409 FALLOW_FROZEN.
 *
 * State lives in `huma_context.fallowDays: string[]` (ISO YYYY-MM-DD entries),
 * a schema-less extension of the existing JSONB column. No new table.
 *
 * All helpers in this file are pure (no external state, no DB, no fetches).
 * The route (app/src/app/api/sheet/fallow/route.ts) composes them; tests
 * cover all branches without mocking Supabase.
 *
 * Philosophical constraint (from 02-CONTEXT.md): the 14-day confidence clock
 * in capital-computation.ts is calendar-day-based, so Fallow days still
 * advance confidence. This file does NOT touch confidence math — it's a
 * pure state-mutation surface on huma_context only.
 */

import type { HumaContext } from "@/types/context";

/**
 * True iff `date` (YYYY-MM-DD) is in huma_context.fallowDays.
 *
 * Defensive: handles null/undefined humaContext, missing fallowDays array,
 * and non-array values (JSONB schema drift). All these shapes return false
 * — fail-safe (no prompt) is correct for malformed rows.
 */
export function isFallow(
  hc: HumaContext | Record<string, unknown> | null | undefined,
  date: string,
): boolean {
  const fallowDays = (hc as { fallowDays?: unknown } | null | undefined)
    ?.fallowDays;
  if (!Array.isArray(fallowDays)) return false;
  return fallowDays.includes(date);
}

/**
 * Returns a NEW HumaContext with `date` added to fallowDays. Idempotent —
 * second call with the same date is a no-op (no duplicate entry).
 *
 * Does NOT mutate the input. Preserves all other fields, including
 * dormant, _sources, _version, and the 8 dimensions.
 */
export function addFallowDay<T extends HumaContext | Record<string, unknown>>(
  hc: T,
  date: string,
): T {
  const existing = (hc as { fallowDays?: string[] }).fallowDays ?? [];
  if (existing.includes(date)) return hc;
  return { ...hc, fallowDays: [...existing, date] } as T;
}

/**
 * Returns a NEW HumaContext with `date` removed from fallowDays. Idempotent —
 * removing a date that isn't in the array is a no-op.
 *
 * Does NOT mutate the input.
 */
export function removeFallowDay<
  T extends HumaContext | Record<string, unknown>,
>(hc: T, date: string): T {
  const existing = (hc as { fallowDays?: string[] }).fallowDays ?? [];
  if (!existing.includes(date)) return hc;
  return { ...hc, fallowDays: existing.filter((d) => d !== date) } as T;
}

/**
 * True iff `date` (the fallow mark being unmarked) is NOT the operator's
 * current local date. Past fallow marks are frozen — the operator's
 * historical rest declaration is immutable after midnight.
 *
 * `today` is passed in (from getLocalDate()) rather than computed here so
 * tests can deterministically exercise midnight-crossing without patching
 * global clocks. The route passes getLocalDate() at request time.
 */
export function isFrozenAfterMidnight(date: string, today: string): boolean {
  return date !== today;
}
