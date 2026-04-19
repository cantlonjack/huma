import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase-server";
import { getKnownContext, updateKnownContext } from "@/lib/supabase-v2";
import { isRateLimited } from "@/lib/rate-limit";
import { rateLimited, internalError } from "@/lib/api-error";
import { withObservability } from "@/lib/observability";
import { parseBody } from "@/lib/schemas/parse";
import { userTextField } from "@/lib/schemas/sanitize";

// ─── Request schema ─────────────────────────────────────────────────────────
// SEC-04: user-written fields (text, todaysSheet) go through the sanitizer so
// `[[`/`]]` marker delimiters reject with 400 before the Anthropic call runs.
const reflectionSchema = z.object({
  type: z.string().min(1),
  text: userTextField({ min: 0, max: 5_000 }).default(""),
  todaysSheet: userTextField({ min: 0, max: 50_000 }).default(""),
});

const REFLECTION_PROMPT = `You are HUMA's evening reflection processor. The operator just reflected on their day.

Your job is TWO things:
1. Return a brief response (1-2 sentences max) in HUMA voice — the fence-post neighbor, not a therapist. No flattery, no cheerleading, no "that's great!" Just acknowledge what they said and, if there's signal, name it.
2. Extract any new context that should be remembered. Only extract if there's real signal — a change in schedule, mood pattern, life event, resource shift, or relationship change. Don't extract generic sentiments.

VOICE RULES:
- Never say: "I hear you", "That's great", "Thank you for sharing", "You've got this"
- Never use: optimize, productivity, wellness, boundaries, mindset, journey
- One or two sentences. No more. The space after is part of the message.

Respond with EXACTLY this JSON format:
{
  "response": "Your 1-2 sentence reply in HUMA voice",
  "context_updates": { } or null
}

context_updates should be null if nothing worth remembering. If there IS signal, use the known_context schema keys:
- "health": {"detail": "..."} — if they mention body/energy/sleep changes
- "work": {"title": "...", "detail": "..."} — if work situation changed
- "time": {"detail": "..."} — if schedule or capacity shifted
- "stage": {"label": "...", "detail": "..."} — if life stage shifted
- Or any custom key for novel context

EXISTING CONTEXT (for reference — don't repeat what's already known):
{existing_context}

TODAY'S SHEET (what they were working with):
{todays_sheet}

REFLECTION TYPE: {reflection_type}
REFLECTION TEXT: {reflection_text}`;

export async function POST(request: Request): Promise<Response> {
  return withObservability(
    request,
    "/api/reflection",
    "user",
    () => null,
    async (obs) => {
  // Rate limit
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (await isRateLimited(ip)) return rateLimited();

  // SEC-04: parseBody surfaces `[[`/`]]` marker rejection as 400 with
  // "reserved marker delimiters" in the error body (via sanitizeUserText).
  const parsed = await parseBody(request, reflectionSchema);
  if (parsed.error) return parsed.error;
  const { type: reflectionType, text: reflectionText, todaysSheet } = parsed.data;

  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Late-resolve user_id for the observability log now that we have one.
    obs.setUserId(user.id);

    // Get existing context
    const existingContext = await getKnownContext(supabase, user.id);

    // Build prompt
    const prompt = REFLECTION_PROMPT.replace("{existing_context}", JSON.stringify(existingContext, null, 2))
      .replace("{todays_sheet}", todaysSheet || "No sheet data available")
      .replace("{reflection_type}", reflectionType)
      .replace("{reflection_text}", reflectionText || "(no additional text)");

    // Call Claude
    const anthropic = new Anthropic();
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 250,
      system: "You are HUMA's evening reflection processor. Return ONLY valid JSON, no markdown fences.",
      messages: [{ role: "user", content: prompt }],
    });

    // ─── SEC-05 token attribution ─────────────────────────────────────────
    obs.setPromptTokens(msg.usage.input_tokens);
    obs.setOutputTokens(msg.usage.output_tokens);

    const raw = (msg.content[0] as { type: string; text: string }).text.trim();

    let parsed: { response: string; context_updates: Record<string, unknown> | null };
    try {
      parsed = JSON.parse(raw);
    } catch {
      // If Claude didn't return valid JSON, use raw as response
      parsed = { response: raw.slice(0, 200), context_updates: null };
    }

    // Merge context updates if any
    if (parsed.context_updates && Object.keys(parsed.context_updates).length > 0) {
      const merged = { ...existingContext, ...parsed.context_updates };
      await updateKnownContext(supabase, user.id, merged);
    }

    // Save reflection as chat message for history
    await supabase.from("chat_messages").insert({
      user_id: user.id,
      role: "user",
      content: `[Evening reflection — ${reflectionType}] ${reflectionText || ""}`.trim(),
      context_extracted: parsed.context_updates || {},
    });

    await supabase.from("chat_messages").insert({
      user_id: user.id,
      role: "assistant",
      content: parsed.response,
      context_extracted: {},
    });

    return Response.json({
      response: parsed.response,
      contextUpdated: parsed.context_updates !== null,
    });
  } catch (err) {
    console.error("Reflection API error:", err);
    return internalError("Failed to process reflection");
  }
    },
  );
}
