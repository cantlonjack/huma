/**
 * Operator context persistence layer.
 *
 * For MVP, context is stored in localStorage. The shapes table serves
 * as a fallback for the capital data. A Supabase operator_contexts table
 * will be added when we need cross-device sync.
 */

import type { OperatorContext, CapitalKey } from "@/types/lotus";
import { CAPITAL_ORDER, CAPITAL_TO_DIMENSION } from "@/types/lotus";
import { createClient } from "./supabase";
import type { DimensionKey } from "@/types/shape";

const CONTEXT_STORAGE_KEY = "huma-operator-context";

// ─── localStorage persistence ────────────────────────────────────────────────

export function saveOperatorContextLocal(context: OperatorContext): void {
  try {
    localStorage.setItem(
      CONTEXT_STORAGE_KEY,
      JSON.stringify({ ...context, updatedAt: new Date().toISOString() })
    );
  } catch {
    // silently fail
  }
}

export function loadOperatorContextLocal(): OperatorContext | null {
  try {
    const raw = localStorage.getItem(CONTEXT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OperatorContext;
  } catch {
    return null;
  }
}

export function clearOperatorContextLocal(): void {
  try {
    localStorage.removeItem(CONTEXT_STORAGE_KEY);
  } catch {
    // silently fail
  }
}

// ─── Composite loader ────────────────────────────────────────────────────────

/**
 * Load operator context from the best available source:
 * 1. localStorage (fastest, most complete)
 * 2. Shapes table with source='lotus' (fallback — reconstructs partial context)
 *
 * Returns null if no context exists (user needs to do Lotus Flow).
 */
export async function loadOperatorContext(): Promise<OperatorContext | null> {
  // Try localStorage first
  const local = loadOperatorContextLocal();
  if (local && local.name && local.capitals) return local;

  // Fall back to shapes table
  const supabase = createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("shapes")
    .select("*")
    .eq("user_id", user.id)
    .eq("source", "lotus")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  // Reconstruct partial context from shape dimensions
  const dims = data.dimensions as Record<DimensionKey, number>;
  const capitals = {} as Record<CapitalKey, number>;
  for (const key of CAPITAL_ORDER) {
    const dimKey = CAPITAL_TO_DIMENSION[key] as DimensionKey;
    // Reverse the 1-5 → 1-10 mapping (approximate)
    capitals[key] = dims[dimKey] ? dims[dimKey] * 2 : 5;
  }

  const partial: OperatorContext = {
    name: "",
    entityType: "person",
    stage: "building",
    governance: { solo: true, people: [] },
    capitals,
    archetype: "",
    archetypeDescription: "",
    strengths: [],
    growthAreas: [],
    createdAt: data.created_at,
    updatedAt: data.created_at,
    version: 1,
    lotusProgress: { whole: true, who: true, what: true } as Record<
      string,
      boolean
    > as OperatorContext["lotusProgress"],
  };

  return partial;
}

/**
 * Save a field edit to the operator context.
 */
export function saveContextEdit(
  context: OperatorContext,
  field: string,
  value: unknown
): OperatorContext {
  const updated = {
    ...context,
    [field]: value,
    updatedAt: new Date().toISOString(),
    version: (context.version || 1) + 1,
  };
  saveOperatorContextLocal(updated);
  return updated;
}
