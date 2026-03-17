import Anthropic from "@anthropic-ai/sdk";
import { WEEKLY_REVIEW_PROMPT } from "@/engine/operational-prompts";
import { createServerSupabase } from "@/lib/supabase-server";
import { isRateLimited } from "@/lib/rate-limit";
import { buildReviewContext, formatQolResponses, getWeekStart } from "@/lib/review-utils";
import type { CanvasData } from "@/engine/canvas-types";

export async function POST(request: Request) {
  // Rate limit
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (await isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Auth check
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: { mapId: string; qolResponses: Array<{ qolStatement: string; question: string; target: string; answer: string }> };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { mapId, qolResponses } = body;
  if (!mapId || !qolResponses?.length) {
    return new Response(JSON.stringify({ error: "mapId and qolResponses required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Load map data for context
  const { data: map } = await supabase
    .from("maps")
    .select("canvas_data, name, location")
    .eq("id", mapId)
    .eq("user_id", user.id)
    .single();

  if (!map) {
    return new Response(JSON.stringify({ error: "Map not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const canvasData = map.canvas_data as CanvasData | null;
  const operatorContext = buildReviewContext(canvasData, map.name || "");
  const userMessage = formatQolResponses(qolResponses);

  // Call Claude with weekly review prompt
  const anthropic = new Anthropic();
  const stream = anthropic.messages.stream({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: WEEKLY_REVIEW_PROMPT + "\n\n---\n\nOperator context:\n" + operatorContext,
    messages: [
      { role: "user", content: userMessage },
    ],
  });

  // Stream response
  const readableStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let fullText = "";

      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            "delta" in event &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
            fullText += event.delta.text;
          }
        }
        controller.close();

        // Save review to database (fire-and-forget after stream completes)
        const weekStart = getWeekStart();
        await supabase.from("weekly_reviews").insert({
          user_id: user.id,
          map_id: mapId,
          week_start: weekStart,
          qol_checks: qolResponses,
          ai_insight: fullText,
        });
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readableStream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
