/**
 * Shared persistence helpers for the optimistic local + Supabase pattern.
 * Reduces boilerplate across useWhole, useToday, useGrow hooks.
 */

import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

/**
 * Persist data to both localStorage and Supabase (if authenticated).
 * localStorage always writes first (optimistic). Supabase failures are silent.
 */
export async function persistContext(
  user: User | null,
  rawContext: Record<string, unknown>,
  supabaseFn?: (supabase: NonNullable<ReturnType<typeof createClient>>, userId: string) => Promise<void>,
): Promise<void> {
  localStorage.setItem("huma-v2-known-context", JSON.stringify(rawContext));
  if (user && supabaseFn) {
    const supabase = createClient();
    if (supabase) {
      try { await supabaseFn(supabase, user.id); } catch { /* silent */ }
    }
  }
}

/**
 * Run a Supabase operation if authenticated. Silent on failure.
 * Returns the Supabase client for chaining if needed.
 */
export async function withSupabase(
  user: User | null,
  fn: (supabase: NonNullable<ReturnType<typeof createClient>>, userId: string) => Promise<void>,
): Promise<void> {
  if (!user) return;
  const supabase = createClient();
  if (!supabase) return;
  try { await fn(supabase, user.id); } catch { /* silent */ }
}

/**
 * Clear the cached sheet for today. Used after any data mutation
 * that would change the production sheet.
 * @deprecated Use clearTodaySheetCache from lib/db/store instead.
 */
export { clearTodaySheetCache as clearCachedSheet } from "@/lib/db/store";

/**
 * Update a single aspiration in localStorage by ID.
 */
export function updateLocalAspiration(id: string, patch: Record<string, unknown>): void {
  try {
    const stored = localStorage.getItem("huma-v2-aspirations");
    if (stored) {
      const all = JSON.parse(stored);
      const updated = all.map((a: Record<string, unknown>) => (a.id === id ? { ...a, ...patch } : a));
      localStorage.setItem("huma-v2-aspirations", JSON.stringify(updated));
    }
  } catch { /* */ }
}
