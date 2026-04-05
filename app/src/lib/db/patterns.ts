import type { SupabaseClient } from "@supabase/supabase-js";
import type { Pattern, PatternStep, MergeSuggestion } from "@/types/v2";

// ─── Patterns ──────────────────────────────────────────────────────────────

function mapPatternRow(row: Record<string, unknown>): Pattern {
  return {
    id: row.id as string,
    aspirationId: (row.aspiration_id as string) || "",
    name: row.name as string,
    trigger: row.trigger as string,
    steps: (row.steps as PatternStep[]) || [],
    timeWindow: (row.time_window as string) || undefined,
    validationMetric: (row.validation_metric as string) || undefined,
    validationCount: (row.validation_count as number) || 0,
    validationTarget: (row.validation_target as number) || 30,
    status: (row.status as Pattern["status"]) || "finding",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getPatterns(
  supabase: SupabaseClient,
  userId: string
): Promise<Pattern[]> {
  const { data } = await supabase
    .from("patterns")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (!data) return [];
  return data.map(mapPatternRow);
}

export async function getPatternsByAspiration(
  supabase: SupabaseClient,
  userId: string,
  aspirationId: string
): Promise<Pattern[]> {
  const { data } = await supabase
    .from("patterns")
    .select("*")
    .eq("user_id", userId)
    .eq("aspiration_id", aspirationId)
    .order("created_at", { ascending: true });

  if (!data) return [];
  return data.map(mapPatternRow);
}

export async function savePattern(
  supabase: SupabaseClient,
  userId: string,
  pattern: Pattern
) {
  const { error } = await supabase.from("patterns").insert({
    id: pattern.id,
    user_id: userId,
    aspiration_id: pattern.aspirationId || null,
    name: pattern.name,
    trigger: pattern.trigger,
    steps: pattern.steps,
    time_window: pattern.timeWindow || null,
    validation_metric: pattern.validationMetric || null,
    validation_count: pattern.validationCount,
    validation_target: pattern.validationTarget,
    status: pattern.status,
  });

  if (error) throw error;
}

export async function updatePattern(
  supabase: SupabaseClient,
  patternId: string,
  userId: string,
  updates: Partial<Pick<Pattern, "name" | "trigger" | "steps" | "timeWindow" | "validationMetric" | "validationCount" | "validationTarget" | "status">>
) {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.trigger !== undefined) payload.trigger = updates.trigger;
  if (updates.steps !== undefined) payload.steps = updates.steps;
  if (updates.timeWindow !== undefined) payload.time_window = updates.timeWindow;
  if (updates.validationMetric !== undefined) payload.validation_metric = updates.validationMetric;
  if (updates.validationCount !== undefined) payload.validation_count = updates.validationCount;
  if (updates.validationTarget !== undefined) payload.validation_target = updates.validationTarget;
  if (updates.status !== undefined) payload.status = updates.status;

  const { error } = await supabase
    .from("patterns")
    .update(payload)
    .eq("id", patternId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deletePattern(
  supabase: SupabaseClient,
  patternId: string,
  userId: string
) {
  const { error } = await supabase
    .from("patterns")
    .delete()
    .eq("id", patternId)
    .eq("user_id", userId);
  if (error) throw error;
}

// ─── Cross-Aspiration Merge ─────────────────────────────────────────────────

/**
 * Detect pairs of patterns from different aspirations that share behaviors.
 * Compares all step texts (case-insensitive). Returns at most one suggestion
 * per pattern (the strongest overlap).
 */
export function detectMergeCandidates(patterns: Pattern[]): MergeSuggestion[] {
  const suggestions: MergeSuggestion[] = [];
  const claimed = new Set<string>(); // one suggestion per pattern

  for (let i = 0; i < patterns.length; i++) {
    if (claimed.has(patterns[i].id)) continue;
    const a = patterns[i];
    const aTexts = a.steps.map(s => s.text.toLowerCase().trim());

    let bestMatch: { idx: number; shared: string[] } | null = null;

    for (let j = i + 1; j < patterns.length; j++) {
      if (claimed.has(patterns[j].id)) continue;
      const b = patterns[j];
      // Only merge across different aspirations
      if (a.aspirationId === b.aspirationId) continue;

      const bTexts = b.steps.map(s => s.text.toLowerCase().trim());
      const shared = aTexts.filter(t => bTexts.includes(t));
      if (shared.length === 0) continue;

      if (!bestMatch || shared.length > bestMatch.shared.length) {
        bestMatch = { idx: j, shared };
      }
    }

    if (bestMatch) {
      const b = patterns[bestMatch.idx];
      // Map back to original-cased text
      const sharedOriginal = a.steps
        .filter(s => bestMatch!.shared.includes(s.text.toLowerCase().trim()))
        .map(s => s.text);

      suggestions.push({
        patternId: a.id,
        otherPatternId: b.id,
        otherPatternName: b.name,
        sharedBehaviors: sharedOriginal,
      });
      suggestions.push({
        patternId: b.id,
        otherPatternId: a.id,
        otherPatternName: a.name,
        sharedBehaviors: sharedOriginal,
      });
      claimed.add(a.id);
      claimed.add(b.id);
    }
  }

  return suggestions;
}

/**
 * Merge two patterns: keep the primary (higher validation), absorb steps
 * from the secondary, deduplicate, delete the secondary.
 * Returns the updated primary pattern.
 */
export async function mergePatterns(
  supabase: SupabaseClient,
  userId: string,
  primaryId: string,
  secondaryId: string,
  patterns: Pattern[],
): Promise<Pattern> {
  const primary = patterns.find(p => p.id === primaryId);
  const secondary = patterns.find(p => p.id === secondaryId);
  if (!primary || !secondary) throw new Error("Pattern not found");

  // Deduplicate: add secondary steps not already in primary
  const existingTexts = new Set(primary.steps.map(s => s.text.toLowerCase().trim()));
  const newSteps = secondary.steps.filter(
    s => !s.isTrigger && !existingTexts.has(s.text.toLowerCase().trim())
  );

  const mergedSteps = [
    ...primary.steps,
    ...newSteps.map((s, i) => ({
      ...s,
      order: primary.steps.length + i,
      isTrigger: false,
    })),
  ];

  // Update primary with merged steps
  await updatePattern(supabase, primaryId, userId, { steps: mergedSteps });

  // Delete secondary
  await deletePattern(supabase, secondaryId, userId);

  return {
    ...primary,
    steps: mergedSteps,
    updatedAt: new Date().toISOString(),
  };
}
