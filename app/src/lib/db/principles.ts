import type { SupabaseClient } from "@supabase/supabase-js";
import type { Principle } from "@/types/v2";

// ─── Principles ─────────────────────────────────────────────────────────────

export async function getPrinciples(
  supabase: SupabaseClient,
  userId: string
): Promise<Principle[]> {
  const { data } = await supabase
    .from("principles")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    text: row.text,
    active: row.active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function savePrinciple(
  supabase: SupabaseClient,
  userId: string,
  text: string,
  sortOrder?: number
): Promise<Principle> {
  const { data, error } = await supabase
    .from("principles")
    .insert({
      user_id: userId,
      text,
      sort_order: sortOrder ?? 0,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    text: data.text,
    active: data.active,
    sortOrder: data.sort_order,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updatePrinciple(
  supabase: SupabaseClient,
  principleId: string,
  updates: { text?: string; active?: boolean; sortOrder?: number }
) {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.text !== undefined) payload.text = updates.text;
  if (updates.active !== undefined) payload.active = updates.active;
  if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;

  const { error } = await supabase
    .from("principles")
    .update(payload)
    .eq("id", principleId);
  if (error) throw error;
}

export async function deletePrinciple(
  supabase: SupabaseClient,
  principleId: string
) {
  const { error } = await supabase
    .from("principles")
    .delete()
    .eq("id", principleId);
  if (error) throw error;
}
