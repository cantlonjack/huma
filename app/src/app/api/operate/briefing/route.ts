import Anthropic from "@anthropic-ai/sdk";
import { MORNING_BRIEFING_PROMPT } from "@/engine/operational-prompts";
import { createServerSupabase } from "@/lib/supabase-server";
import { isRateLimited } from "@/lib/rate-limit";
import { buildReviewContext } from "@/lib/review-utils";
import type { CanvasData } from "@/engine/canvas-types";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SEASON_NAMES: Record<number, string> = {
  0: "winter", 1: "winter", 2: "spring", 3: "spring", 4: "spring",
  5: "summer", 6: "summer", 7: "summer", 8: "fall", 9: "fall",
  10: "fall", 11: "winter",
};

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (await isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: "Too many requests." }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: { mapId: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body.mapId) {
    return new Response(JSON.stringify({ error: "mapId required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: map } = await supabase
    .from("maps")
    .select("canvas_data, name, location")
    .eq("id", body.mapId)
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

  const now = new Date();
  const dayName = DAY_NAMES[now.getDay()];
  const season = SEASON_NAMES[now.getMonth()];
  const dateStr = now.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  // Get last weekly review for context
  let lastReviewNote = "";
  try {
    const { data: lastReview } = await supabase
      .from("weekly_reviews")
      .select("ai_insight, week_start")
      .eq("map_id", body.mapId)
      .eq("user_id", user.id)
      .order("week_start", { ascending: false })
      .limit(1)
      .single();

    if (lastReview?.ai_insight) {
      lastReviewNote = `\n\nLast weekly review (${lastReview.week_start}):\n${lastReview.ai_insight.slice(0, 500)}`;
    }
  } catch {
    // No previous reviews — that's fine
  }

  const systemPrompt = MORNING_BRIEFING_PROMPT +
    `\n\n---\n\nToday: ${dayName}, ${dateStr}\nSeason: ${season}\n\nOperator context:\n${operatorContext}${lastReviewNote}`;

  const anthropic = new Anthropic();
  const stream = anthropic.messages.stream({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    max_tokens: 512,
    system: systemPrompt,
    messages: [
      { role: "user", content: `Good morning. What's my day look like?` },
    ],
  });

  const readableStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            "delta" in event &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readableStream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
