import type { SupabaseClient } from "@supabase/supabase-js";
import type { Aspiration, AspirationFunnel, AspirationTrigger, ChatMessage, SheetEntry, Insight, Principle, Pattern, PatternStep, SparklineData, SparklinePoint, EmergingBehavior, DimensionKey, MergeSuggestion } from "@/types/v2";
import { getLocalDate, getLocalDateOffset } from "@/lib/date-utils";
import { extractPatternsFromAspirations } from "@/lib/pattern-extraction";

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

// ─── Chat Messages ───────────────────────────────────────────────────────────

export async function getChatMessages(
  supabase: SupabaseClient,
  userId: string
): Promise<ChatMessage[]> {
  const { data } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    role: row.role as ChatMessage["role"],
    content: row.content,
    contextExtracted: (row.context_extracted as Record<string, unknown>) || {},
    createdAt: row.created_at,
  }));
}

export async function saveChatMessage(
  supabase: SupabaseClient,
  userId: string,
  message: ChatMessage
) {
  const { error } = await supabase.from("chat_messages").insert({
    id: message.id,
    user_id: userId,
    role: message.role,
    content: message.content,
    context_extracted: message.contextExtracted || {},
  });

  if (error) throw error;
}

export async function saveChatMessages(
  supabase: SupabaseClient,
  userId: string,
  messages: ChatMessage[]
) {
  if (messages.length === 0) return;

  const rows = messages.map((m) => ({
    id: m.id,
    user_id: userId,
    role: m.role,
    content: m.content,
    context_extracted: m.contextExtracted || {},
  }));

  const { error } = await supabase.from("chat_messages").upsert(rows, { onConflict: "id" });
  if (error) throw error;
}

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

// ─── Insights ────────────────────────────────────────────────────────────────

export async function saveInsight(
  supabase: SupabaseClient,
  userId: string,
  insight: Insight
) {
  const { error } = await supabase.from("insights").insert({
    id: insight.id,
    user_id: userId,
    insight_text: insight.text,
    dimensions_involved: insight.dimensionsInvolved,
    behaviors_involved: insight.behaviorsInvolved,
    data_basis: insight.dataBasis,
    delivered: insight.delivered ?? false,
    ...(insight.deliveredAt ? { delivered_at: insight.deliveredAt } : {}),
  });

  if (error) throw error;
}

export async function getUndeliveredInsight(
  supabase: SupabaseClient,
  userId: string
): Promise<Insight | null> {
  const { data } = await supabase
    .from("insights")
    .select("*")
    .eq("user_id", userId)
    .eq("delivered", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) return null;

  return {
    id: data.id,
    text: data.insight_text,
    dimensionsInvolved: data.dimensions_involved as Insight["dimensionsInvolved"],
    behaviorsInvolved: data.behaviors_involved as Insight["behaviorsInvolved"],
    dataBasis: data.data_basis as Insight["dataBasis"],
    delivered: data.delivered,
    deliveredAt: data.delivered_at || undefined,
  };
}

export async function markInsightDelivered(
  supabase: SupabaseClient,
  insightId: string,
  userId: string
) {
  await supabase
    .from("insights")
    .update({ delivered: true, delivered_at: new Date().toISOString() })
    .eq("id", insightId)
    .eq("user_id", userId);
}

/** Fetch the N most recent delivered insights for annotation on the Whole page. */
export async function getRecentInsights(
  supabase: SupabaseClient,
  userId: string,
  limit = 3,
): Promise<Insight[]> {
  const { data } = await supabase
    .from("insights")
    .select("*")
    .eq("user_id", userId)
    .eq("delivered", true)
    .order("delivered_at", { ascending: false })
    .limit(limit);

  if (!data || data.length === 0) return [];

  return data.map((row) => ({
    id: row.id,
    text: row.insight_text,
    dimensionsInvolved: row.dimensions_involved as Insight["dimensionsInvolved"],
    behaviorsInvolved: row.behaviors_involved as Insight["behaviorsInvolved"],
    dataBasis: row.data_basis as Insight["dataBasis"],
    delivered: row.delivered,
    deliveredAt: row.delivered_at || undefined,
  }));
}

// ─── Behavior Log (check-off tracking) ──────────────────────────────────────

export async function logBehaviorCheckoff(
  supabase: SupabaseClient,
  userId: string,
  behaviorKey: string,
  behaviorName: string,
  aspirationId: string | null,
  date: string,
  completed: boolean
) {
  // Upsert: one entry per user+behavior_key+date (stable slug, not display text)
  const { data: existing } = await supabase
    .from("behavior_log")
    .select("id")
    .eq("user_id", userId)
    .eq("behavior_key", behaviorKey)
    .eq("date", date)
    .limit(1)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("behavior_log")
      .update({
        behavior_name: behaviorName,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("behavior_log").insert({
      user_id: userId,
      behavior_id: null,
      behavior_key: behaviorKey,
      behavior_name: behaviorName,
      date,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    });
  }
}

export async function getBehaviorWeekCount(
  supabase: SupabaseClient,
  userId: string,
  behaviorKey: string
): Promise<{ completed: number; total: number }> {
  const startStr = getLocalDateOffset(7);

  const { data } = await supabase
    .from("behavior_log")
    .select("completed")
    .eq("user_id", userId)
    .eq("behavior_key", behaviorKey)
    .gte("date", startStr);

  if (!data) return { completed: 0, total: 0 };
  return {
    completed: data.filter(r => r.completed).length,
    total: data.length,
  };
}

export async function getBehaviorWeekCounts(
  supabase: SupabaseClient,
  userId: string
): Promise<Record<string, { completed: number; total: number }>> {
  const startStr = getLocalDateOffset(7);

  const { data } = await supabase
    .from("behavior_log")
    .select("behavior_key, behavior_name, completed")
    .eq("user_id", userId)
    .gte("date", startStr);

  if (!data) return {};

  const counts: Record<string, { completed: number; total: number }> = {};
  for (const row of data) {
    // Key by behavior_key (stable slug); fall back to behavior_name for legacy rows
    const key = row.behavior_key || row.behavior_name;
    if (!counts[key]) {
      counts[key] = { completed: 0, total: 0 };
    }
    counts[key].total++;
    if (row.completed) counts[key].completed++;
  }
  return counts;
}

// ─── Sparkline Computation ──────────────────────────────────────────────────

/**
 * Compute 14-day sparkline data for a set of patterns.
 *
 * For each pattern, queries behavior_log for all behavior_keys in its steps.
 * Each day's ratio = (completed steps) / (total steps in pattern).
 * Days with no log entries get ratio 0.
 *
 * Trend is derived by comparing the second-half average to the first-half average:
 *   rising:   second half > first half + 0.1
 *   dropping: second half < first half - 0.1
 *   stable:   otherwise
 *
 * Single DB query for all patterns — efficient regardless of pattern count.
 */
export async function getPatternSparklines(
  supabase: SupabaseClient,
  userId: string,
  patterns: Pattern[]
): Promise<SparklineData[]> {
  if (patterns.length === 0) return [];

  const startStr = getLocalDateOffset(13); // 14 days including today
  const todayStr = getLocalDate();

  // Collect all unique behavior_keys across all patterns
  const allKeys = new Set<string>();
  for (const p of patterns) {
    for (const step of p.steps) {
      allKeys.add(step.behaviorKey);
    }
  }

  if (allKeys.size === 0) return [];

  // Single query: all completions for all relevant behavior_keys in the 14-day window
  const { data: rows } = await supabase
    .from("behavior_log")
    .select("behavior_key, date, completed")
    .eq("user_id", userId)
    .gte("date", startStr)
    .lte("date", todayStr)
    .in("behavior_key", Array.from(allKeys));

  // Index: behavior_key -> date -> completed
  const completionMap = new Map<string, Map<string, boolean>>();
  if (rows) {
    for (const row of rows) {
      const key = row.behavior_key as string;
      if (!completionMap.has(key)) completionMap.set(key, new Map());
      completionMap.get(key)!.set(row.date as string, row.completed as boolean);
    }
  }

  // Build the 14-day date array (oldest first)
  const dates: string[] = [];
  for (let i = 13; i >= 0; i--) {
    dates.push(getLocalDateOffset(i));
  }

  // Compute sparkline for each pattern
  const results: SparklineData[] = [];
  for (const pattern of patterns) {
    const stepKeys = pattern.steps.map(s => s.behaviorKey);
    const stepCount = stepKeys.length;
    if (stepCount === 0) continue;

    const points: SparklinePoint[] = [];
    for (const date of dates) {
      let completed = 0;
      for (const key of stepKeys) {
        const dayMap = completionMap.get(key);
        if (dayMap?.get(date)) completed++;
      }
      points.push({ date, ratio: completed / stepCount });
    }

    // Trend: compare first 7 days average vs last 7 days average
    const firstHalf = points.slice(0, 7).reduce((s, p) => s + p.ratio, 0) / 7;
    const secondHalf = points.slice(7).reduce((s, p) => s + p.ratio, 0) / 7;
    const diff = secondHalf - firstHalf;
    const trend: SparklineData["trend"] =
      diff > 0.1 ? "rising" : diff < -0.1 ? "dropping" : "stable";

    results.push({ patternId: pattern.id, points, trend });
  }

  return results;
}

// ─── Emerging Behavior Detection ────────────────────────────────────────────

/**
 * Detect behaviors that have been consistently completed (12+ of last 14 days)
 * but are NOT already part of an existing pattern. These are unnamed patterns
 * forming organically — surfaced as "something forming..." on the Grow tab.
 *
 * Algorithm:
 * 1. Query all behavior_log completions in the 14-day window
 * 2. Group by behavior_key, count completed days
 * 3. Filter to 12+ completed days
 * 4. Exclude any behavior_key already present in an existing pattern's steps
 * 5. Enrich with dimension data from aspirations if available
 */
export async function detectEmergingBehaviors(
  supabase: SupabaseClient,
  userId: string,
  existingPatterns: Pattern[],
  aspirations: Aspiration[]
): Promise<EmergingBehavior[]> {
  const startStr = getLocalDateOffset(13); // 14 days including today
  const todayStr = getLocalDate();

  const { data: rows } = await supabase
    .from("behavior_log")
    .select("behavior_key, behavior_name, date, completed")
    .eq("user_id", userId)
    .eq("completed", true)
    .gte("date", startStr)
    .lte("date", todayStr);

  if (!rows || rows.length === 0) return [];

  // Group by behavior_key: count distinct completed dates
  const keyMap = new Map<string, { name: string; dates: Set<string> }>();
  for (const row of rows) {
    const key = (row.behavior_key || row.behavior_name) as string;
    const name = (row.behavior_name || row.behavior_key) as string;
    if (!keyMap.has(key)) keyMap.set(key, { name, dates: new Set() });
    keyMap.get(key)!.dates.add(row.date as string);
  }

  // Collect all behavior_keys already in existing patterns
  const patternKeys = new Set<string>();
  for (const p of existingPatterns) {
    for (const step of p.steps) {
      patternKeys.add(step.behaviorKey);
    }
  }

  // Filter: 12+ completed days AND not in any existing pattern
  const emerging: EmergingBehavior[] = [];
  for (const [key, { name, dates }] of keyMap) {
    if (dates.size < 12) continue;
    if (patternKeys.has(key)) continue;

    // Try to find dimension data from aspirations
    let dimensions: DimensionKey[] = [];
    let aspirationId: string | undefined;
    for (const asp of aspirations) {
      const behavior = asp.behaviors?.find(b => b.key === key);
      if (behavior) {
        aspirationId = asp.id;
        dimensions = (behavior.dimensions || [])
          .map(d => typeof d === "string" ? d : d.dimension)
          .filter(Boolean) as DimensionKey[];
        break;
      }
    }

    emerging.push({
      behaviorKey: key,
      behaviorName: name,
      completedDays: dates.size,
      totalDays: 14,
      dimensions,
      aspirationId,
    });
  }

  return emerging;
}

// ─── Day-of-Week Rhythm Counts ──────────────────────────────────────────────

/** Trailing 28-day completion counts grouped by day of week (0=Sun..6=Sat). */
export async function getBehaviorDayOfWeekCounts(
  supabase: SupabaseClient,
  userId: string,
  aspirationId?: string
): Promise<Record<number, number>> {
  const startStr = getLocalDateOffset(28);

  let query = supabase
    .from("sheet_entries")
    .select("date")
    .eq("user_id", userId)
    .eq("checked", true)
    .gte("date", startStr);

  if (aspirationId) {
    query = query.eq("aspiration_id", aspirationId);
  }

  const { data } = await query;
  if (!data) return {};

  const counts: Record<number, number> = {};
  for (const row of data) {
    const dow = new Date(row.date + "T12:00:00").getDay(); // 0=Sun..6=Sat
    counts[dow] = (counts[dow] || 0) + 1;
  }
  return counts;
}

/** Recent streak detection: completions in last N days for an aspiration. */
export async function getRecentCompletionDays(
  supabase: SupabaseClient,
  userId: string,
  aspirationId: string,
  days: number
): Promise<number> {
  const startStr = getLocalDateOffset(days);

  const { data } = await supabase
    .from("sheet_entries")
    .select("date")
    .eq("user_id", userId)
    .eq("aspiration_id", aspirationId)
    .eq("checked", true)
    .gte("date", startStr);

  if (!data) return 0;
  // Count unique dates
  return new Set(data.map(r => r.date)).size;
}

// ─── Structural Insight (Day 1) ─────────────────────────────────────────────

const DIMENSION_LABEL_MAP: Record<string, string> = {
  living: "Body", body: "Body",
  social: "People", people: "People",
  financial: "Money", money: "Money",
  material: "Home", home: "Home",
  intellectual: "Growth", growth: "Growth",
  experiential: "Joy", joy: "Joy",
  spiritual: "Purpose", purpose: "Purpose",
  cultural: "Identity", identity: "Identity",
};

export function computeStructuralInsight(aspirations: Aspiration[], whyStatement?: string | null): Insight | null {
  const allBehaviors = aspirations.flatMap(a =>
    a.behaviors.map(b => ({
      ...b,
      aspirationName: a.clarifiedText || a.rawText,
      aspirationId: a.id,
    }))
  );

  if (allBehaviors.length === 0) return null;

  // ─── WHY alignment check ──────────────────────────────────────────────
  if (whyStatement && whyStatement.trim().length > 0) {
    const whyWords = whyStatement.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const dimensionKeywords: Record<string, string[]> = {
      body: ["body", "health", "physical", "move", "movement", "energy", "sleep", "strength"],
      people: ["people", "family", "friend", "community", "relationship", "connect", "love", "together"],
      money: ["money", "income", "financial", "earn", "wealth", "business", "work", "career"],
      home: ["home", "space", "land", "garden", "place", "environment", "house", "property"],
      growth: ["growth", "learn", "skill", "knowledge", "develop", "create", "build", "improve"],
      joy: ["joy", "play", "creative", "beauty", "music", "enjoy", "pleasure", "adventure"],
      purpose: ["purpose", "meaning", "serve", "contribute", "impact", "mission", "calling"],
      identity: ["identity", "culture", "heritage", "tradition", "values", "belief", "spirit", "soul"],
    };

    // Find which dimensions the WHY statement implies
    const whyDimensions = new Set<string>();
    for (const [dim, keywords] of Object.entries(dimensionKeywords)) {
      if (whyWords.some(w => keywords.some(k => w.includes(k) || k.includes(w)))) {
        whyDimensions.add(dim);
      }
    }

    // Check if aspiration text or dimensions overlap with WHY
    const aspirationsWithWhyOverlap = aspirations.filter(a => {
      const aspText = (a.clarifiedText || a.rawText).toLowerCase();
      const aspDims = (a.dimensionsTouched || []) as string[];
      const hasTextOverlap = whyWords.some(w => aspText.includes(w));
      const hasDimOverlap = whyDimensions.size > 0 && aspDims.some(d => whyDimensions.has(d));
      return hasTextOverlap || hasDimOverlap;
    });

    const gapAspirations = aspirations.filter(a => !aspirationsWithWhyOverlap.includes(a));

    if (gapAspirations.length > 0 && aspirationsWithWhyOverlap.length > 0) {
      // WHY gap — highest priority
      const gapName = gapAspirations[0].clarifiedText || gapAspirations[0].rawText;
      return {
        id: crypto.randomUUID(),
        text: `${gapName} doesn\u2019t obviously connect to your WHY: \u201c${whyStatement}\u201d That might be fine \u2014 or it might be worth a conversation.`,
        dimensionsInvolved: [],
        behaviorsInvolved: [],
        dataBasis: { correlation: 1, dataPoints: 0, pattern: "structural-why-gap" },
        delivered: false,
      };
    }

    if (aspirationsWithWhyOverlap.length === aspirations.length && aspirations.length > 1) {
      // Full WHY alignment — second priority
      return {
        id: crypto.randomUUID(),
        text: `Everything you\u2019re building serves your WHY: \u201c${whyStatement}\u201d That\u2019s not common \u2014 most people\u2019s daily actions drift from what they say matters.`,
        dimensionsInvolved: [],
        behaviorsInvolved: [],
        dataBasis: { correlation: 1, dataPoints: 0, pattern: "structural-why-aligned" },
        delivered: false,
      };
    }
  }

  // ─── Connected behavior insight (lowest priority) ─────────────────────
  // Find behavior touching most dimensions
  let maxDims = 0;
  let mostConnected: (typeof allBehaviors)[0] | null = null;

  for (const b of allBehaviors) {
    const dimCount = (b.dimensions || []).length;
    if (dimCount > maxDims) {
      maxDims = dimCount;
      mostConnected = b;
    }
  }

  // Find shared behaviors across aspirations
  const behaviorsByText = new Map<string, Set<string>>();
  for (const b of allBehaviors) {
    const key = b.text.toLowerCase().trim();
    if (!behaviorsByText.has(key)) behaviorsByText.set(key, new Set());
    behaviorsByText.get(key)!.add(b.aspirationName);
  }
  const shared = [...behaviorsByText.entries()].filter(([, asps]) => asps.size > 1);

  if (!mostConnected) return null;

  const dims = (mostConnected.dimensions || [])
    .map(d => {
      const key = typeof d === "string" ? d : d.dimension;
      return DIMENSION_LABEL_MAP[key] || key;
    })
    .filter(Boolean);

  let text: string;
  if (shared.length > 0) {
    const [, sharedAsps] = shared[0];
    const aspNames = [...sharedAsps].join(" and ");
    text = `${mostConnected.text} serves both ${aspNames}. It touches ${dims.join(", ")} \u2014 ${maxDims} of your 8 dimensions. That\u2019s the most connected behavior in your system.`;
  } else {
    text = `${mostConnected.text} touches ${dims.join(", ")} \u2014 ${maxDims} of your 8 dimensions from one behavior. That\u2019s your most connected move.`;
  }

  return {
    id: crypto.randomUUID(),
    text,
    dimensionsInvolved: (mostConnected.dimensions || []).map(d =>
      typeof d === "string" ? d : d.dimension
    ) as Insight["dimensionsInvolved"],
    behaviorsInvolved: [mostConnected.key || mostConnected.text],
    dataBasis: {
      correlation: 1,
      dataPoints: 0,
      pattern: "structural",
    },
    delivered: false,
  };
}

// ─── Migration: localStorage → Supabase ──────────────────────────────────────

export async function migrateLocalStorageToSupabase(
  supabase: SupabaseClient,
  userId: string
) {
  // Track which keys were successfully migrated so we only clear those
  const migratedKeys: string[] = [];

  // 1. Migrate known context
  try {
    const ctxStr = localStorage.getItem("huma-v2-known-context");
    if (ctxStr) {
      const knownContext = JSON.parse(ctxStr);
      await updateKnownContext(supabase, userId, knownContext);
      migratedKeys.push("huma-v2-known-context");
    }
  } catch { /* skip */ }

  // 2. Migrate chat messages (from /start and /chat)
  try {
    const startMsgs = localStorage.getItem("huma-v2-start-messages");
    const chatMsgs = localStorage.getItem("huma-v2-chat-messages");
    const messages: ChatMessage[] = [];

    if (startMsgs) {
      const parsed = JSON.parse(startMsgs) as ChatMessage[];
      messages.push(...parsed);
    }
    if (chatMsgs) {
      const parsed = JSON.parse(chatMsgs) as ChatMessage[];
      // Avoid duplicates (chat may include start messages)
      for (const msg of parsed) {
        if (!messages.some((m) => m.id === msg.id)) {
          messages.push(msg);
        }
      }
    }

    if (messages.length > 0) {
      await saveChatMessages(supabase, userId, messages);
      migratedKeys.push("huma-v2-start-messages", "huma-v2-chat-messages");
    }
  } catch { /* skip — localStorage preserved as fallback */ }

  // 3. Migrate aspirations — only clear localStorage after verified save
  try {
    const aspStr = localStorage.getItem("huma-v2-aspirations");
    if (aspStr) {
      const aspirations = JSON.parse(aspStr) as Aspiration[];
      let anySaved = false;
      for (const asp of aspirations) {
        try {
          await saveAspiration(supabase, userId, asp);
          anySaved = true;
        } catch { /* may already exist — verify below */ }
      }
      // Verify data actually exists in Supabase before clearing localStorage
      if (anySaved) {
        migratedKeys.push("huma-v2-aspirations");
      } else {
        // All inserts failed (duplicates?) — verify at least one exists in Supabase
        const { data: existing } = await supabase
          .from("aspirations")
          .select("id")
          .eq("user_id", userId)
          .eq("status", "active")
          .limit(1);
        if (existing && existing.length > 0) {
          migratedKeys.push("huma-v2-aspirations");
        }
        // If nothing in Supabase either, do NOT clear localStorage
      }
    }
  } catch { /* skip — localStorage preserved as fallback */ }

  // 4. Migrate patterns (from localStorage or extract from aspirations)
  try {
    const patStr = localStorage.getItem("huma-v2-patterns");
    let patterns: Pattern[] = [];

    if (patStr) {
      patterns = JSON.parse(patStr) as Pattern[];
    } else {
      // No pre-extracted patterns — try extracting from aspirations
      const aspStr = localStorage.getItem("huma-v2-aspirations");
      if (aspStr) {
        const aspirations = JSON.parse(aspStr) as Aspiration[];
        patterns = extractPatternsFromAspirations(aspirations);
      }
    }

    if (patterns.length > 0) {
      for (const pattern of patterns) {
        try {
          await savePattern(supabase, userId, pattern);
        } catch { /* may already exist */ }
      }
      migratedKeys.push("huma-v2-patterns");
    }
  } catch { /* skip */ }

  // 5. Migrate ALL sheet entries
  try {
    const sheetKeys = Object.keys(localStorage).filter(k => k.startsWith("huma-v2-sheet-"));
    for (const key of sheetKeys) {
      try {
        const date = key.replace("huma-v2-sheet-", "");
        const entries = JSON.parse(localStorage.getItem(key) || "[]") as SheetEntry[];
        if (entries.length > 0) {
          await saveSheetEntries(supabase, userId, entries, date);
        }
      } catch { /* skip individual date on error, continue with rest */ }
    }
  } catch { /* skip */ }

  // 6. Migrate pending insight
  try {
    const insStr = localStorage.getItem("huma-v2-pending-insight");
    if (insStr) {
      const insight = JSON.parse(insStr) as Insight;
      await saveInsight(supabase, userId, insight);
      migratedKeys.push("huma-v2-pending-insight");
    }
  } catch { /* skip */ }

  // 7. Only clear keys that were successfully migrated to Supabase
  migratedKeys.push("huma-v2-behaviors"); // always safe to clear (derived data)
  for (const key of migratedKeys) {
    localStorage.removeItem(key);
  }
  // Clear cached sheets (non-critical, regeneratable)
  const sheetKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("huma-v2-sheet-")) {
      sheetKeys.push(key);
    }
  }
  for (const key of sheetKeys) {
    localStorage.removeItem(key);
  }
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

// ─── All Aspirations (any status) ───────────────────────────────────────────

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
  }));
}

// ─── Aspiration Behavioral Correlation ──────────────────────────────────────
// Computes co-completion strength between aspiration pairs over the last 30 days.
// Returns pairs with a weight from 0–1 indicating how often both aspirations
// had behaviors checked on the same day.

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

// ─── WHY Evolution: Behavioral Summary ──────────────────────────────────────
// Builds a text summary of what the operator has actually been doing over
// the last 28 days — used by the WHY evolution prompt to contrast the
// original WHY with observed behavior.

export interface BehavioralSummary {
  totalDays: number;                // Days with any log entry
  topBehaviors: { key: string; name: string; completedDays: number }[];
  dimensionCounts: Record<string, number>;  // Dimension → total completions
}

export async function getBehavioralSummary(
  supabase: SupabaseClient,
  userId: string,
  aspirations: { id: string; behaviors: { key: string; text: string; dimensions?: { dimension: string }[] }[] }[],
): Promise<BehavioralSummary> {
  const startStr = getLocalDateOffset(27); // 28 days including today
  const todayStr = getLocalDate();

  const { data: rows } = await supabase
    .from("behavior_log")
    .select("behavior_key, behavior_name, date, completed")
    .eq("user_id", userId)
    .eq("completed", true)
    .gte("date", startStr)
    .lte("date", todayStr);

  if (!rows || rows.length === 0) {
    return { totalDays: 0, topBehaviors: [], dimensionCounts: {} };
  }

  // Count distinct active days
  const activeDates = new Set(rows.map((r) => r.date));

  // Group by behavior_key
  const keyMap = new Map<string, { name: string; dates: Set<string> }>();
  for (const row of rows) {
    const key = row.behavior_key || row.behavior_name;
    if (!keyMap.has(key)) keyMap.set(key, { name: row.behavior_name, dates: new Set() });
    keyMap.get(key)!.dates.add(row.date);
  }

  // Sort by completed days descending, take top 10
  const topBehaviors = Array.from(keyMap.entries())
    .map(([key, val]) => ({ key, name: val.name, completedDays: val.dates.size }))
    .sort((a, b) => b.completedDays - a.completedDays)
    .slice(0, 10);

  // Build dimension → completion count from aspiration behavior metadata
  const dimLookup = new Map<string, string[]>();
  for (const asp of aspirations) {
    for (const b of asp.behaviors) {
      dimLookup.set(b.key, b.dimensions?.map((d) => d.dimension) || []);
    }
  }

  const dimensionCounts: Record<string, number> = {};
  for (const row of rows) {
    const key = row.behavior_key || row.behavior_name;
    const dims = dimLookup.get(key) || [];
    for (const d of dims) {
      dimensionCounts[d] = (dimensionCounts[d] || 0) + 1;
    }
  }

  return { totalDays: activeDates.size, topBehaviors, dimensionCounts };
}
