import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChatMessage } from "@/types/v2";

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

/** Delete all chat messages for a user (Supabase only). */
export async function clearChatMessages(
  supabase: SupabaseClient,
  userId: string,
) {
  await supabase.from("chat_messages").delete().eq("user_id", userId);
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
