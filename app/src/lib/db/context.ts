import type { SupabaseClient } from "@supabase/supabase-js";

// ─── Context ─────────────────────────────────────────────────────────────────

export async function getOrCreateContext(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("contexts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (data) return data;

  const { data: newCtx, error } = await supabase
    .from("contexts")
    .insert({ user_id: userId, known_context: {}, raw_statements: [], aspirations: [] })
    .select()
    .single();

  if (error) throw error;
  return newCtx;
}

export async function updateKnownContext(
  supabase: SupabaseClient,
  userId: string,
  knownContext: Record<string, unknown>
) {
  const ctx = await getOrCreateContext(supabase, userId);
  await supabase
    .from("contexts")
    .update({ known_context: knownContext, updated_at: new Date().toISOString() })
    .eq("id", ctx.id);
}

export async function getKnownContext(
  supabase: SupabaseClient,
  userId: string
): Promise<Record<string, unknown>> {
  const ctx = await getOrCreateContext(supabase, userId);
  return (ctx.known_context as Record<string, unknown>) || {};
}

/**
 * Remove a key from known_context JSONB.
 * Supports top-level keys (e.g. "place", "work") and array element removal
 * via path like "people[2]" (removes index 2 from the people array).
 */
export async function removeContextField(
  supabase: SupabaseClient,
  userId: string,
  fieldPath: string,
) {
  const ctx = await getOrCreateContext(supabase, userId);
  const knownContext = { ...((ctx.known_context as Record<string, unknown>) || {}) };

  // Parse array syntax: "people[2]" → key="people", index=2
  const arrayMatch = fieldPath.match(/^(\w+)\[(\d+)\]$/);
  if (arrayMatch) {
    const [, key, indexStr] = arrayMatch;
    const arr = knownContext[key];
    if (Array.isArray(arr)) {
      const index = parseInt(indexStr, 10);
      if (index >= 0 && index < arr.length) {
        const newArr = [...arr];
        newArr.splice(index, 1);
        knownContext[key] = newArr;
      }
    }
  } else {
    // Simple top-level key removal
    delete knownContext[fieldPath];
  }

  await updateKnownContext(supabase, userId, knownContext);
}

/**
 * Nuclear reset: clear all user data across every table.
 * Resets known_context to {}, why_statement to null,
 * and deletes all rows from aspirations, patterns, sheet_entries,
 * behavior_log, insights, principles, and chat_messages.
 */
export async function clearAllUserData(
  supabase: SupabaseClient,
  userId: string,
) {
  // Reset context row (keep the row, clear its data)
  const ctx = await getOrCreateContext(supabase, userId);
  await supabase
    .from("contexts")
    .update({
      known_context: {},
      why_statement: null,
      why_date: null,
      raw_statements: [],
      aspirations: [],
      updated_at: new Date().toISOString(),
    })
    .eq("id", ctx.id);

  // Delete all rows from dependent tables (order matters for FKs)
  // patterns references aspirations — delete first
  await supabase.from("patterns").delete().eq("user_id", userId);
  // sheet_entries references aspirations — delete first
  await supabase.from("sheet_entries").delete().eq("user_id", userId);
  // behavior_log references aspirations — delete first
  await supabase.from("behavior_log").delete().eq("user_id", userId);
  // Now safe to delete aspirations
  await supabase.from("aspirations").delete().eq("user_id", userId);
  // Independent tables
  await supabase.from("insights").delete().eq("user_id", userId);
  await supabase.from("principles").delete().eq("user_id", userId);
  await supabase.from("chat_messages").delete().eq("user_id", userId);
}

// ─── WHY Statement ──────────────────────────────────────────────────────────

export async function getWhyStatement(
  supabase: SupabaseClient,
  userId: string
): Promise<{ whyStatement: string | null; whyDate: string | null }> {
  const ctx = await getOrCreateContext(supabase, userId);
  return {
    whyStatement: ctx.why_statement ?? null,
    whyDate: ctx.why_date ?? null,
  };
}

export async function updateWhyStatement(
  supabase: SupabaseClient,
  userId: string,
  whyStatement: string
) {
  const ctx = await getOrCreateContext(supabase, userId);
  const { error } = await supabase
    .from("contexts")
    .update({
      why_statement: whyStatement,
      why_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", ctx.id);
  if (error) throw error;
}
