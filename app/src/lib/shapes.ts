/**
 * Shape persistence — save and fetch shapes from Supabase.
 * Each shape is a point-in-time snapshot. Never overwrite — always insert.
 */

import { createClient } from "./supabase";
import type { DimensionKey } from "@/types/shape";
import type { ShapeInsight } from "@/engine/shape-insight";

export interface SavedShape {
  id: string;
  user_id: string;
  dimensions: Record<DimensionKey, number>;
  source: "builder" | "pulse" | "conversation";
  insight: ShapeInsight | null;
  created_at: string;
}

/**
 * Save a shape snapshot for the current user.
 */
export async function saveShape(
  scores: Partial<Record<DimensionKey, number>>,
  source: "builder" | "pulse" | "conversation",
  insight?: ShapeInsight | null
): Promise<SavedShape | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("shapes")
    .insert({
      user_id: user.id,
      dimensions: scores,
      source,
      insight: insight ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to save shape:", error.message);
    return null;
  }

  return data as SavedShape;
}

/**
 * Fetch the most recent shape for the current user.
 */
export async function fetchLatestShape(): Promise<SavedShape | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("shapes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No rows
    console.error("Failed to fetch shape:", error.message);
    return null;
  }

  return data as SavedShape;
}

/**
 * Fetch today's pulse shape (if the operator already pulsed today).
 */
export async function fetchTodaysPulse(): Promise<SavedShape | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Start of today in local timezone
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("shapes")
    .select("*")
    .eq("user_id", user.id)
    .eq("source", "pulse")
    .gte("created_at", today.toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch today's pulse:", error.message);
    return null;
  }

  return data as SavedShape | null;
}

/**
 * Fetch the shape before the most recent one (for delta comparison).
 */
export async function fetchPreviousShape(): Promise<SavedShape | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("shapes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(1, 1); // skip the latest, get the one before

  if (error) {
    console.error("Failed to fetch previous shape:", error.message);
    return null;
  }

  return (data && data.length > 0) ? data[0] as SavedShape : null;
}

/**
 * Fetch all shapes for the current user (for timeline).
 */
export async function fetchAllShapes(): Promise<SavedShape[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("shapes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch shapes:", error.message);
    return [];
  }

  return (data ?? []) as SavedShape[];
}
