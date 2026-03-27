import type { SupabaseClient } from "@supabase/supabase-js";
import type { Aspiration, ChatMessage, SheetEntry, Insight } from "@/types/v2";

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

  return data.map((row) => ({
    id: row.id,
    aspirationId: row.aspiration_id || "",
    behaviorKey: row.behavior_key,
    behaviorText: row.behavior_text,
    detail: (row.detail as Record<string, unknown>) || {},
    timeOfDay: row.time_of_day as SheetEntry["timeOfDay"],
    checked: row.checked,
    checkedAt: row.checked_at || undefined,
  }));
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

  const rows = entries.map((e) => ({
    id: e.id,
    user_id: userId,
    aspiration_id: validAspirationIds.has(e.aspirationId) ? e.aspirationId : null,
    date,
    behavior_key: e.behaviorKey,
    behavior_text: e.behaviorText,
    detail: e.detail,
    time_of_day: e.timeOfDay,
    checked: e.checked,
    checked_at: e.checkedAt || null,
  }));

  const { error } = await supabase.from("sheet_entries").upsert(rows, { onConflict: "id" });
  if (error) throw error;
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
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().split("T")[0];

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

// ─── Migration: localStorage → Supabase ──────────────────────────────────────

export async function migrateLocalStorageToSupabase(
  supabase: SupabaseClient,
  userId: string
) {
  // 1. Migrate known context
  try {
    const ctxStr = localStorage.getItem("huma-v2-known-context");
    if (ctxStr) {
      const knownContext = JSON.parse(ctxStr);
      await updateKnownContext(supabase, userId, knownContext);
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
    }
  } catch { /* skip */ }

  // 3. Migrate aspirations
  try {
    const aspStr = localStorage.getItem("huma-v2-aspirations");
    if (aspStr) {
      const aspirations = JSON.parse(aspStr) as Aspiration[];
      for (const asp of aspirations) {
        try {
          await saveAspiration(supabase, userId, asp);
        } catch { /* may already exist */ }
      }
    }
  } catch { /* skip */ }

  // 4. Migrate today's sheet entries
  try {
    const today = new Date().toISOString().split("T")[0];
    const sheetStr = localStorage.getItem(`huma-v2-sheet-${today}`);
    if (sheetStr) {
      const entries = JSON.parse(sheetStr) as SheetEntry[];
      if (entries.length > 0) {
        await saveSheetEntries(supabase, userId, entries, today);
      }
    }
  } catch { /* skip */ }

  // 5. Migrate pending insight
  try {
    const insStr = localStorage.getItem("huma-v2-pending-insight");
    if (insStr) {
      const insight = JSON.parse(insStr) as Insight;
      await saveInsight(supabase, userId, insight);
    }
  } catch { /* skip */ }

  // 6. Clear localStorage V2 keys (Supabase is now source of truth)
  const v2Keys = [
    "huma-v2-start-messages",
    "huma-v2-chat-messages",
    "huma-v2-known-context",
    "huma-v2-aspirations",
    "huma-v2-behaviors",
    "huma-v2-pending-insight",
  ];
  for (const key of v2Keys) {
    localStorage.removeItem(key);
  }
  // Also clear any cached sheets
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("huma-v2-sheet-")) {
      localStorage.removeItem(key);
    }
  }
}
