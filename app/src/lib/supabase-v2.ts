import type { SupabaseClient } from "@supabase/supabase-js";
import type { Aspiration, AspirationFunnel, AspirationTrigger, ChatMessage, SheetEntry, Insight, Principle } from "@/types/v2";
import { getLocalDate, getLocalDateOffset } from "@/lib/date-utils";

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
    behaviors: (row.behaviors as Aspiration["behaviors"]) || [],
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
    behaviors: aspiration.behaviors,
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
    delivered: false,
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

export function computeStructuralInsight(aspirations: Aspiration[]): Insight | null {
  const allBehaviors = aspirations.flatMap(a =>
    a.behaviors.map(b => ({
      ...b,
      aspirationName: a.clarifiedText || a.rawText,
      aspirationId: a.id,
    }))
  );

  if (allBehaviors.length === 0) return null;

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

  // 4. Migrate ALL sheet entries (not just today — preserves historical check-off data)
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

  // 5. Migrate pending insight
  try {
    const insStr = localStorage.getItem("huma-v2-pending-insight");
    if (insStr) {
      const insight = JSON.parse(insStr) as Insight;
      await saveInsight(supabase, userId, insight);
      migratedKeys.push("huma-v2-pending-insight");
    }
  } catch { /* skip */ }

  // 6. Only clear keys that were successfully migrated to Supabase
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
    behaviors: (row.behaviors as Aspiration["behaviors"]) || [],
    dimensionsTouched: (row.dimensions_touched as Aspiration["dimensionsTouched"]) || [],
    status: row.status as Aspiration["status"],
    stage: (row.stage as Aspiration["stage"]) || "active",
    funnel: (row.funnel as AspirationFunnel) || undefined,
    triggerData: (row.trigger_data as AspirationTrigger) || undefined,
  }));
}
