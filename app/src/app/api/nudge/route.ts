import Anthropic from "@anthropic-ai/sdk";
import { isRateLimited } from "@/lib/rate-limit";
import { rateLimited, serviceUnavailable, internalError } from "@/lib/api-error";
import { nudgeSchema } from "@/lib/schemas";
import { parseBody } from "@/lib/schemas/parse";
import { contextForPrompt } from "@/lib/context-model";
import { createEmptyContext } from "@/types/context";
import type { HumaContext } from "@/types/context";
import { NUDGE_PROMPT, summarizeHistory } from "@/lib/services/nudge-service";

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return serviceUnavailable();
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  if (await isRateLimited(ip)) {
    return rateLimited();
  }

  const parsed = await parseBody(request, nudgeSchema);
  if (parsed.error) return parsed.error;
  const req = parsed.data;

  // Need at least some context to generate useful nudges
  if (req.aspirations.length === 0) {
    return Response.json({ nudges: [] });
  }

  const date = req.date;
  const dayOfWeek = new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" });

  // Build context string from HumaContext if available, else from knownContext
  let contextStr = "Limited context so far.";
  if (req.humaContext) {
    try {
      const base = createEmptyContext();
      const merged = { ...base, ...req.humaContext } as HumaContext;
      contextStr = contextForPrompt(merged);
    } catch {
      contextStr = "Limited context so far.";
    }
  } else if (req.knownContext && Object.keys(req.knownContext).length > 0) {
    contextStr = Object.entries(req.knownContext)
      .filter(([, v]) => v != null)
      .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
      .join("\n") || "Limited context so far.";
  }

  const aspirationsStr = req.aspirations.map(a => {
    const behaviors = a.behaviors.map(b => `  - ${b.text} (${b.frequency})`).join("\n");
    return `"${a.clarifiedText || a.rawText}":\n${behaviors}`;
  }).join("\n\n");

  const historyStr = req.recentHistory.length > 0
    ? summarizeHistory(req.recentHistory)
    : "No history yet — this is their first day.";

  const checkedStr = req.checkedToday.length > 0
    ? req.checkedToday.join(", ")
    : "Nothing checked off yet today.";

  const prompt = NUDGE_PROMPT
    .replace("{name}", req.name)
    .replace("{date}", date)
    .replace("{day_of_week}", dayOfWeek)
    .replace("{season}", req.season || "unknown")
    .replace("{day_count}", String(req.dayCount))
    .replace("{context}", contextStr)
    .replace("{aspirations}", aspirationsStr)
    .replace("{history}", historyStr)
    .replace("{checked_today}", checkedStr);

  try {
    const anthropic = new Anthropic();

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: "You generate proactive nudges for a life intelligence system. Return ONLY valid JSON. Be conservative — zero nudges is always an option. Voice: fence-post neighbor, never therapist.",
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";

    let result: { nudges: Array<{ id: string; type: string; text: string; source?: string }> };
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { nudges: [] };
    } catch {
      result = { nudges: [] };
    }

    // Hard cap: max 2 nudges, filter out any previously dismissed
    const nudges = (result.nudges || [])
      .slice(0, 2)
      .filter(n => !req.dismissedNudgeIds.includes(n.id));

    return Response.json({ nudges });
  } catch (err) {
    console.error("Nudge generation error:", err);
    return internalError("Failed to generate nudges.");
  }
}
