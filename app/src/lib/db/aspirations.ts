import type { SupabaseClient } from "@supabase/supabase-js";
import type { Aspiration, AspirationFunnel, AspirationTrigger } from "@/types/v2";
import { getLocalDateOffset } from "@/lib/date-utils";
import { getOrCreateContext } from "./context";

// ─── Aspirations ─────────────────────────────────────────────────────────────

export async function getAspirations(
  supabase: SupabaseClient,
  userId: string
): Promise<Aspiration[]> {
  const { data } = await supabase
    .from("aspirations")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    rawText: row.raw_text,
    clarifiedText: row.clarified_text || "",
    title: row.title || undefined,
    summary: row.summary || undefined,
    behaviors: (row.behaviors as Aspiration["behaviors"]) || [],
    comingUp: (row.coming_up as Aspiration["comingUp"]) || undefined,
    longerArc: (row.longer_arc as Aspiration["longerArc"]) || undefined,
    dimensionsTouched: (row.dimensions_touched as Aspiration["dimensionsTouched"]) || [],
    status: row.status as Aspiration["status"],
    stage: (row.stage as Aspiration["stage"]) || "active",
    funnel: (row.funnel as AspirationFunnel) || undefined,
    triggerData: (row.trigger_data as AspirationTrigger) || undefined,
    // REGEN-03: surface created_at so /today can compute the 90-day
    // outcome-check clock against the real creation timestamp.
    createdAt: (row.created_at as string | undefined) || undefined,
  }));
}

export async function getAllAspirations(
  supabase: SupabaseClient,
  userId: string
): Promise<Aspiration[]> {
  const { data } = await supabase
    .from("aspirations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    rawText: row.raw_text,
    clarifiedText: row.clarified_text || "",
    title: row.title || undefined,
    summary: row.summary || undefined,
    behaviors: (row.behaviors as Aspiration["behaviors"]) || [],
    comingUp: (row.coming_up as Aspiration["comingUp"]) || undefined,
    longerArc: (row.longer_arc as Aspiration["longerArc"]) || undefined,
    dimensionsTouched: (row.dimensions_touched as Aspiration["dimensionsTouched"]) || [],
    status: row.status as Aspiration["status"],
    stage: (row.stage as Aspiration["stage"]) || "active",
    funnel: (row.funnel as AspirationFunnel) || undefined,
    triggerData: (row.trigger_data as AspirationTrigger) || undefined,
    // REGEN-03: surface created_at for the 90-day outcome-check clock.
    createdAt: (row.created_at as string | undefined) || undefined,
  }));
}

export async function saveAspiration(
  supabase: SupabaseClient,
  userId: string,
  aspiration: Aspiration
) {
  const ctx = await getOrCreateContext(supabase, userId);

  const { error } = await supabase.from("aspirations").insert({
    id: aspiration.id,
    user_id: userId,
    context_id: ctx.id,
    raw_text: aspiration.rawText,
    clarified_text: aspiration.clarifiedText,
    title: aspiration.title || null,
    summary: aspiration.summary || null,
    behaviors: aspiration.behaviors,
    coming_up: aspiration.comingUp || [],
    longer_arc: aspiration.longerArc || [],
    dimensions_touched: aspiration.dimensionsTouched,
    status: aspiration.status,
    stage: aspiration.stage || "active",
    funnel: aspiration.funnel || {},
    trigger_data: aspiration.triggerData || {},
  });

  if (error) throw error;
}

/** Update an aspiration's status (e.g. active → paused for reorganization releases). */
export async function updateAspirationStatus(
  supabase: SupabaseClient,
  userId: string,
  aspirationId: string,
  status: Aspiration["status"],
) {
  await supabase
    .from("aspirations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", aspirationId)
    .eq("user_id", userId);
}

/** Archive an aspiration (soft delete — recoverable). */
export async function archiveAspiration(
  supabase: SupabaseClient,
  userId: string,
  aspirationId: string,
) {
  await supabase
    .from("aspirations")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", aspirationId)
    .eq("user_id", userId);
}

/**
 * Hard-delete an aspiration and cascade to related data.
 * DB FKs: sheet_entries cascade-deletes, behavior_log and patterns null the FK.
 * We explicitly delete patterns and behavior_log rows for full cleanup.
 */
export async function deleteAspiration(
  supabase: SupabaseClient,
  userId: string,
  aspirationId: string,
) {
  // 1. Delete related patterns (DB would only null aspiration_id)
  await supabase
    .from("patterns")
    .delete()
    .eq("user_id", userId)
    .eq("aspiration_id", aspirationId);

  // 2. Delete related behavior_log rows (DB would only null behavior_id)
  await supabase
    .from("behavior_log")
    .delete()
    .eq("user_id", userId)
    .eq("behavior_id", aspirationId);

  // 3. Delete the aspiration itself (sheet_entries cascade automatically via FK)
  const { error } = await supabase
    .from("aspirations")
    .delete()
    .eq("id", aspirationId)
    .eq("user_id", userId);

  if (error) throw error;
}

/** Replace an aspiration's behaviors (for reorganization revisions). */
export async function updateAspirationBehaviors(
  supabase: SupabaseClient,
  userId: string,
  aspirationId: string,
  behaviors: Aspiration["behaviors"],
) {
  await supabase
    .from("aspirations")
    .update({ behaviors, updated_at: new Date().toISOString() })
    .eq("id", aspirationId)
    .eq("user_id", userId);
}

/** Update an aspiration's name (clarified_text). */
export async function updateAspirationName(
  supabase: SupabaseClient,
  userId: string,
  aspirationId: string,
  name: string,
) {
  await supabase
    .from("aspirations")
    .update({ clarified_text: name, updated_at: new Date().toISOString() })
    .eq("id", aspirationId)
    .eq("user_id", userId);
}

/** Update aspiration future phases (coming_up and longer_arc). */
export async function updateAspirationFuture(
  supabase: SupabaseClient,
  userId: string,
  aspirationId: string,
  comingUp: Aspiration["comingUp"],
  longerArc: Aspiration["longerArc"],
) {
  await supabase
    .from("aspirations")
    .update({
      coming_up: comingUp || [],
      longer_arc: longerArc || [],
      updated_at: new Date().toISOString(),
    })
    .eq("id", aspirationId)
    .eq("user_id", userId);
}

// ─── Aspiration Behavioral Correlation ──────────────────────────────────────

export interface AspirationCorrelation {
  sourceId: string;
  targetId: string;
  weight: number;       // 0–1: co-completion ratio
  coCompletionDays: number;
}

export async function getAspirationCorrelations(
  supabase: SupabaseClient,
  userId: string,
): Promise<AspirationCorrelation[]> {
  const startStr = getLocalDateOffset(29); // 30 days including today

  const { data } = await supabase
    .from("sheet_entries")
    .select("aspiration_id, date, checked")
    .eq("user_id", userId)
    .eq("checked", true)
    .gte("date", startStr)
    .not("aspiration_id", "is", null);

  if (!data || data.length === 0) return [];

  // Group: which dates did each aspiration have at least one check-off?
  const aspirationDays = new Map<string, Set<string>>();
  for (const row of data) {
    const aspId = row.aspiration_id as string;
    if (!aspirationDays.has(aspId)) aspirationDays.set(aspId, new Set());
    aspirationDays.get(aspId)!.add(row.date as string);
  }

  const aspirationIds = Array.from(aspirationDays.keys());
  if (aspirationIds.length < 2) return [];

  const correlations: AspirationCorrelation[] = [];

  for (let i = 0; i < aspirationIds.length; i++) {
    for (let j = i + 1; j < aspirationIds.length; j++) {
      const aDays = aspirationDays.get(aspirationIds[i])!;
      const bDays = aspirationDays.get(aspirationIds[j])!;

      // Co-completion: days where both had a check-off
      let coCount = 0;
      for (const day of aDays) {
        if (bDays.has(day)) coCount++;
      }

      if (coCount === 0) continue;

      // Normalize by the smaller set (Jaccard-like but biased toward overlap)
      const minDays = Math.min(aDays.size, bDays.size);
      const weight = minDays > 0 ? coCount / minDays : 0;

      // Only include meaningful correlations (at least 3 co-completion days, weight > 0.3)
      if (coCount >= 3 && weight > 0.3) {
        correlations.push({
          sourceId: aspirationIds[i],
          targetId: aspirationIds[j],
          weight: Math.round(weight * 100) / 100,
          coCompletionDays: coCount,
        });
      }
    }
  }

  return correlations;
}
