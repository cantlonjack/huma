import type { SupabaseClient } from "@supabase/supabase-js";
import type { SheetEntry } from "@/types/v2";
import { getLocalDateOffset } from "@/lib/date-utils";

// ─── Sheet Entries ───────────────────────────────────────────────────────────

export async function getSheetEntries(
  supabase: SupabaseClient,
  userId: string,
  date: string
): Promise<SheetEntry[]> {
  const { data } = await supabase
    .from("sheet_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .order("created_at", { ascending: true });

  if (!data) return [];

  return data.map((row) => {
    const detail = (row.detail as Record<string, unknown>) || {};
    return {
      id: row.id,
      aspirationId: row.aspiration_id || "",
      behaviorKey: row.behavior_key,
      behaviorText: row.behavior_text,
      headline: row.behavior_text,
      detail: detail,
      timeOfDay: (row.time_of_day || "morning") as SheetEntry["timeOfDay"],
      dimensions: Array.isArray(detail.dimensions) ? detail.dimensions as string[] : [],
      checked: row.checked,
      checkedAt: row.checked_at || undefined,
    };
  });
}

export async function saveSheetEntries(
  supabase: SupabaseClient,
  userId: string,
  entries: SheetEntry[],
  date: string
) {
  if (entries.length === 0) return;

  // Validate aspiration_ids exist in DB to avoid FK constraint violations
  const aspirationIds = [...new Set(entries.map(e => e.aspirationId).filter(Boolean))];
  const validAspirationIds = new Set<string>();
  if (aspirationIds.length > 0) {
    const { data: validRows } = await supabase
      .from("aspirations")
      .select("id")
      .in("id", aspirationIds);
    if (validRows) {
      for (const row of validRows) validAspirationIds.add(row.id);
    }
  }

  const rows = entries.map((e) => {
    const detailObj = typeof e.detail === "string"
      ? { text: e.detail, dimensions: e.dimensions || [] }
      : { ...(e.detail as Record<string, unknown>), dimensions: e.dimensions || (e.detail as Record<string, unknown>)?.dimensions || [] };
    return {
      id: e.id,
      user_id: userId,
      aspiration_id: validAspirationIds.has(e.aspirationId) ? e.aspirationId : null,
      date,
      behavior_key: e.behaviorKey,
      behavior_text: e.headline || e.behaviorText,
      detail: detailObj,
      time_of_day: e.timeOfDay,
      checked: e.checked,
      checked_at: e.checkedAt || null,
    };
  });

  // Insert new entries FIRST — if this fails, old entries are still intact
  const { error } = await supabase.from("sheet_entries").insert(rows);
  if (error) throw error;

  // Delete old entries that aren't in the new set (safe: new entries already saved)
  const newIds = new Set(entries.map(e => e.id));
  const { data: existing } = await supabase
    .from("sheet_entries")
    .select("id")
    .eq("user_id", userId)
    .eq("date", date);

  if (existing) {
    const staleIds = existing
      .map(r => r.id as string)
      .filter(id => !newIds.has(id));
    if (staleIds.length > 0) {
      await supabase
        .from("sheet_entries")
        .delete()
        .in("id", staleIds);
    }
  }
}

export async function updateSheetEntryCheck(
  supabase: SupabaseClient,
  entryId: string,
  userId: string,
  checked: boolean
) {
  const { error } = await supabase
    .from("sheet_entries")
    .update({
      checked,
      checked_at: checked ? new Date().toISOString() : null,
    })
    .eq("id", entryId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function getRecentSheetHistory(
  supabase: SupabaseClient,
  userId: string,
  days: number = 7
): Promise<Array<{ date: string; behaviorKey: string; checked: boolean }>> {
  const startStr = getLocalDateOffset(days);

  const { data } = await supabase
    .from("sheet_entries")
    .select("date, behavior_key, checked")
    .eq("user_id", userId)
    .gte("date", startStr)
    .order("date", { ascending: true });

  if (!data) return [];

  return data.map((row) => ({
    date: row.date,
    behaviorKey: row.behavior_key,
    checked: row.checked,
  }));
}
