import Anthropic from "@anthropic-ai/sdk";
import { isRateLimited } from "@/lib/rate-limit";
import { matchTemplate, getSpecificityHints } from "@/lib/template-matcher";

const SHEET_PROMPT = `You are compiling today's production sheet for {name}.

Active aspirations and behaviors:
{aspirations_with_behaviors}

{specificity_section}

Known context:
{known_context}

Recent behavior history (last 7 days):
{recent_history}

{history_analysis}

Today is {day_of_week}, {date}.

For each behavior that applies to today, produce a SPECIFIC, actionable entry.
Not "cook dinner" — instead "Beef stew: use the bone broth from Sunday, chuck from the freezer. One pot. Recipe: [basic instructions]."
Not "morning movement" — instead "20-minute walk. Sunrise is 7:14am, 34°F. Layer up."

Be specific. Use the known context. Reference leftovers, inventory, schedules.
The operator should not have to think — just execute.

Voice: fence-post neighbor. Direct. Spare. No therapy-speak. No cheerleading.

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

interface RecentEntry {
  date: string;
  behaviorKey: string;
  checked: boolean;
}

function analyzeHistory(recentHistory: RecentEntry[], dayOfWeek: string): string {
  if (recentHistory.length === 0) return "";

  // Group by behavior key
  const byBehavior = new Map<string, { done: number; skipped: number; dates: string[] }>();
  for (const entry of recentHistory) {
    if (!byBehavior.has(entry.behaviorKey)) {
      byBehavior.set(entry.behaviorKey, { done: 0, skipped: 0, dates: [] });
    }
    const stats = byBehavior.get(entry.behaviorKey)!;
    if (entry.checked) stats.done++;
    else stats.skipped++;
    stats.dates.push(entry.date);
  }

  // Build analysis
  const insights: string[] = [];
  for (const [key, stats] of byBehavior) {
    const total = stats.done + stats.skipped;
    const rate = stats.done / total;

    if (rate < 0.5) {
      insights.push(`"${key}" has been skipped more than done (${stats.done}/${total}). Consider a simpler version or different timing.`);
    } else if (rate >= 0.8) {
      insights.push(`"${key}" is sticking well (${stats.done}/${total}). Keep it going.`);
    }

    // Check day-of-week patterns
    const daySkips = recentHistory.filter(
      e => e.behaviorKey === key && !e.checked &&
      new Date(e.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() === dayOfWeek.toLowerCase()
    );
    if (daySkips.length >= 2) {
      insights.push(`"${key}" tends to get skipped on ${dayOfWeek}s. Suggest a lighter version or swap to a different behavior.`);
    }
  }

  if (insights.length === 0) return "";

  return `HISTORY ANALYSIS (use this to customize today's sheet):
${insights.join("\n")}`;
}

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
  const recentHistory = (body.recentHistory || []) as RecentEntry[];
  const date = (body.date || new Date().toISOString().split("T")[0]) as string;

  if (aspirations.length === 0) {
    return Response.json({ entries: [], date });
  }

  const dayOfWeek = new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" });

  // Build specificity hints from matched templates
  const allSpecificityHints: Record<string, string> = {};
  for (const a of aspirations) {
    const template = matchTemplate(a.clarifiedText || a.rawText);
    if (template) {
      const hints = getSpecificityHints(template);
      Object.assign(allSpecificityHints, hints);
    }
  }

  const aspirationsStr = aspirations.map(a => {
    const behaviorList = a.behaviors.map(b => {
      let freq = b.frequency;
      if (b.frequency === "specific-days" && b.days) {
        freq = `on ${b.days.join(", ")}`;
      }
      const hint = allSpecificityHints[b.key];
      const hintStr = hint ? `\n    SPECIFICITY INSTRUCTIONS: ${hint}` : "";
      return `  - ${b.text} (${freq})${b.detail ? `: ${b.detail}` : ""}${hintStr}`;
    }).join("\n");
    return `"${a.clarifiedText || a.rawText}":\n${behaviorList}`;
  }).join("\n\n");

  // Build specificity section
  const specificitySection = Object.keys(allSpecificityHints).length > 0
    ? `SPECIFICITY HINTS (follow these instructions for each behavior to produce specific output):
${Object.entries(allSpecificityHints).map(([key, hint]) => `  ${key}: ${hint}`).join("\n")}`
    : "";

  const historyStr = recentHistory.length > 0
    ? recentHistory.map(h => `${h.date}: ${h.behaviorKey} — ${h.checked ? "done" : "skipped"}`).join("\n")
    : "No history yet — this is their first day.";

  const historyAnalysis = analyzeHistory(recentHistory, dayOfWeek);

  const contextStr = Object.keys(knownContext).length > 0
    ? JSON.stringify(knownContext, null, 2)
    : "Limited context so far.";

  const prompt = SHEET_PROMPT
    .replace("{name}", name)
    .replace("{aspirations_with_behaviors}", aspirationsStr)
    .replace("{specificity_section}", specificitySection)
    .replace("{known_context}", contextStr)
    .replace("{recent_history}", historyStr)
    .replace("{history_analysis}", historyAnalysis)
    .replace("{day_of_week}", dayOfWeek)
    .replace("{date}", date);

  try {
    const anthropic = new Anthropic();

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: "You compile daily production sheets. Return ONLY valid JSON. No markdown, no explanation. Voice: fence-post neighbor — direct, specific, warm without soft.",
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
