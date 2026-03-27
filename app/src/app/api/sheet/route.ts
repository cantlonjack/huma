import Anthropic from "@anthropic-ai/sdk";
import { isRateLimited } from "@/lib/rate-limit";

const SHEET_PROMPT = `You are compiling today's production sheet for {name}.

Active aspirations and behaviors:
{aspirations_with_behaviors}

Known context:
{known_context}

Recent behavior history (last 7 days):
{recent_history}

Today is {day_of_week}, {date}.

For each behavior that applies to today, produce a SPECIFIC, actionable entry.
Not "cook dinner" — instead "Beef stew: use the bone broth from Sunday, chuck from the freezer. One pot. Recipe: [basic instructions]."
Not "morning movement" — instead "20-minute walk. Sunrise is 7:14am, 34°F. Layer up."

Be specific. Use the known context. Reference leftovers, inventory, schedules.
The operator should not have to think — just execute.

Return ONLY valid JSON, no other text:
{
  "entries": [
    {
      "behavior_key": "string",
      "aspiration_id": "string",
      "text": "string (the specific action for today)",
      "detail": "string (expanded instructions/reasoning)",
      "time_of_day": "morning" | "afternoon" | "evening"
    }
  ]
}`;

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  if (await isRateLimited(ip)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = (body.name || "there") as string;
  const aspirations = (body.aspirations || []) as Array<{
    id: string;
    rawText: string;
    clarifiedText: string;
    behaviors: Array<{
      key: string;
      text: string;
      frequency: string;
      days?: string[];
      detail?: string;
    }>;
  }>;
  const knownContext = (body.knownContext || {}) as Record<string, unknown>;
  const recentHistory = (body.recentHistory || []) as Array<{
    date: string;
    behaviorKey: string;
    checked: boolean;
  }>;
  const date = (body.date || new Date().toISOString().split("T")[0]) as string;

  if (aspirations.length === 0) {
    return Response.json({ entries: [], date });
  }

  const dayOfWeek = new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" });

  const aspirationsStr = aspirations.map(a => {
    const behaviorList = a.behaviors.map(b => {
      let freq = b.frequency;
      if (b.frequency === "specific-days" && b.days) {
        freq = `on ${b.days.join(", ")}`;
      }
      return `  - ${b.text} (${freq})${b.detail ? `: ${b.detail}` : ""}`;
    }).join("\n");
    return `"${a.clarifiedText || a.rawText}":\n${behaviorList}`;
  }).join("\n\n");

  const historyStr = recentHistory.length > 0
    ? recentHistory.map(h => `${h.date}: ${h.behaviorKey} — ${h.checked ? "done" : "skipped"}`).join("\n")
    : "No history yet — this is their first day.";

  const contextStr = Object.keys(knownContext).length > 0
    ? JSON.stringify(knownContext, null, 2)
    : "Limited context so far.";

  const prompt = SHEET_PROMPT
    .replace("{name}", name)
    .replace("{aspirations_with_behaviors}", aspirationsStr)
    .replace("{known_context}", contextStr)
    .replace("{recent_history}", historyStr)
    .replace("{day_of_week}", dayOfWeek)
    .replace("{date}", date);

  try {
    const anthropic = new Anthropic();

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: "You compile daily production sheets. Return ONLY valid JSON. No markdown, no explanation.",
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";

    let parsed: { entries: Array<Record<string, string>> };
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { entries: [] };
    } catch {
      parsed = { entries: [] };
    }

    return Response.json({ entries: parsed.entries || [], date });
  } catch (err) {
    console.error("Sheet compilation error:", err);
    return Response.json({ error: "Failed to compile sheet" }, { status: 500 });
  }
}
