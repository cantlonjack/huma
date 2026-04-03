import Anthropic from "@anthropic-ai/sdk";
import { isRateLimited } from "@/lib/rate-limit";
import { matchTemplate, getSpecificityHints } from "@/lib/template-matcher";
import { rateLimited, badRequest, serviceUnavailable, internalError } from "@/lib/api-error";
import type { KnownContext, SheetCompileRequest } from "@/types/v2";

// ─── Season derivation ────────────────────────────────────────────────────
// Returns a human-readable season string from a YYYY-MM-DD date.
// Uses solstice/equinox-approximate boundaries and qualifies with "early/mid/late".

function getSeason(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const month = d.getMonth(); // 0-indexed
  const day = d.getDate();

  // Approximate season boundaries (Northern Hemisphere)
  // Spring: Mar 20 – Jun 20, Summer: Jun 21 – Sep 22, Autumn: Sep 23 – Dec 20, Winter: Dec 21 – Mar 19
  type SeasonName = "spring" | "summer" | "autumn" | "winter";
  let season: SeasonName;
  let dayInSeason: number;
  let seasonLength: number;

  if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day <= 20)) {
    season = "spring";
    const start = new Date(d.getFullYear(), 2, 20);
    dayInSeason = Math.floor((d.getTime() - start.getTime()) / 86400000);
    seasonLength = 93;
  } else if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day <= 22)) {
    season = "summer";
    const start = new Date(d.getFullYear(), 5, 21);
    dayInSeason = Math.floor((d.getTime() - start.getTime()) / 86400000);
    seasonLength = 94;
  } else if ((month === 8 && day >= 23) || month === 9 || month === 10 || (month === 11 && day <= 20)) {
    season = "autumn";
    const start = new Date(d.getFullYear(), 8, 23);
    dayInSeason = Math.floor((d.getTime() - start.getTime()) / 86400000);
    seasonLength = 89;
  } else {
    season = "winter";
    // Winter spans year boundary — approximate
    const start = month === 11 ? new Date(d.getFullYear(), 11, 21) : new Date(d.getFullYear() - 1, 11, 21);
    dayInSeason = Math.floor((d.getTime() - start.getTime()) / 86400000);
    seasonLength = 89;
  }

  const fraction = dayInSeason / seasonLength;
  const qualifier = fraction < 0.33 ? "early" : fraction < 0.66 ? "mid" : "late";
  return `${qualifier} ${season}`;
}

// ─── Structured known_context formatting ──────────────────────────────────
// Formats KnownContext into readable prose instead of raw JSON.

function formatKnownContext(ctx: KnownContext): string {
  const lines: string[] = [];

  if (ctx.place?.name) {
    lines.push(`Location: ${ctx.place.name}${ctx.place.detail ? ` — ${ctx.place.detail}` : ""}`);
  }
  if (ctx.work?.title) {
    lines.push(`Work: ${ctx.work.title}${ctx.work.detail ? ` — ${ctx.work.detail}` : ""}`);
  }
  if (ctx.people && ctx.people.length > 0) {
    const peopleStr = ctx.people.map(p => `${p.name} (${p.role})`).join(", ");
    lines.push(`People: ${peopleStr}`);
  }
  if (ctx.stage?.label) {
    lines.push(`Life stage: ${ctx.stage.label}${ctx.stage.detail ? ` — ${ctx.stage.detail}` : ""}`);
  }
  if (ctx.health?.detail) {
    lines.push(`Health: ${ctx.health.detail}`);
  }
  if (ctx.time?.detail) {
    lines.push(`Time constraints: ${ctx.time.detail}`);
  }
  if (ctx.resources && ctx.resources.length > 0) {
    lines.push(`Resources: ${ctx.resources.join(", ")}`);
  }

  // Include any unstructured keys we don't have a formatter for
  const knownKeys = new Set(["people", "place", "work", "time", "stage", "health", "resources", "archetypes", "why_statement"]);
  for (const [key, value] of Object.entries(ctx)) {
    if (!knownKeys.has(key) && value != null) {
      lines.push(`${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`);
    }
  }

  return lines.length > 0 ? lines.join("\n") : "Limited context so far.";
}

const SHEET_PROMPT = `You are compiling today's production sheet for {name}.

Active aspirations and behaviors:
{aspirations_with_behaviors}

{specificity_section}

CONVERSATION TRANSCRIPT (this is what the operator actually said — use their exact details):
{conversation_transcript}

Known context:
{known_context}

Recent behavior history (last 7 days):
{recent_history}

{history_analysis}

Today is {day_of_week}, {date}. Season: {season}.

IMPORTANT: Only behaviors from ACTIVE aspirations are included below.
Do NOT generate entries for aspirations the operator is still planning or dreaming about.
These are things the operator IS doing, not things they WANT to do someday.

CRITICAL RULES:
- Generate MAXIMUM 5 entries. Not 6. Not 7. Five or fewer.
- Each entry must have a UNIQUE behavior_key. If two aspirations share a behavior (like "cook dinner at home"), generate ONE entry for it, not two.
- Prioritize behaviors that touch the most life dimensions — these are the highest-leverage actions.
- Every entry must be specific to TODAY — not generic advice.

CRITICAL: The conversation transcript contains specifics the operator told you — household size, budget constraints, dietary approach, available ingredients, schedule. USE THEM. Every entry should feel like it was written for THIS person, not a generic template. If they said "two of us" — portions are for two. If they said "save money" — suggest budget-conscious options. If they mentioned specific ingredients — use those ingredients.

Be specific. Use the known context and conversation details. Reference leftovers, inventory, schedules.
The operator should not have to think — just execute.

Voice: fence-post neighbor. Direct. Spare. No therapy-speak. No cheerleading.

Return a JSON object with an "entries" array. Each entry MUST have these fields:

{
  "entries": [
    {
      "behavior_key": "cook-dinner",
      "aspiration_id": "the-aspiration-uuid",
      "headline": "Scrambled eggs + veg tonight",
      "detail": "No prep needed. Use whatever is in the crisper. Two eggs each, under $4 total.",
      "time_of_day": "evening",
      "dimensions": ["body", "money"]
    }
  ]
}

HEADLINE RULES — these are absolute:
- The "headline" is 4-8 words. MAX 8 words. It is what someone reads in 1 second over coffee.
- GOOD headlines: "Scrambled eggs + whatever veg" / "20-min walk, sunny by 9" / "No purchases today" / "Chicken stir-fry — $3.80"
- BAD headlines: "5:30 AM milking routine — sheep, equipment sanitization, milk handling" (too long, too many details)
- BAD headlines: "Cook a nutritious dinner using available ingredients" (vague instruction, not specific)
- BAD headlines: "Morning milking routine — sheep, equipment sanitization, milk handling" (that's a detail paragraph, not a headline)
- If you can't say it in 8 words, you're writing a detail, not a headline.

The "detail" field is 1-3 sentences of specific instructions shown only when the operator taps the card. Put the HOW here, not in the headline.

Every entry MUST have "time_of_day": one of "morning", "midday", "evening".
Every entry MUST have "dimensions": array of which dimensions this touches (from: body, people, money, home, growth, joy, purpose, identity).
MAXIMUM 5 entries. Each must be unique.

Return ONLY valid JSON, no other text.`;

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
    return serviceUnavailable();
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  if (await isRateLimited(ip)) {
    return rateLimited();
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return badRequest("Invalid JSON.");
  }

  const req = body as Partial<SheetCompileRequest>;
  const name = req.name || "there";
  const aspirations = req.aspirations || [];
  const knownContext = (req.knownContext || {}) as KnownContext;
  const recentHistory = (req.recentHistory || []) as RecentEntry[];
  const conversationMessages = req.conversationMessages || [];
  // Date should always come from the client (local timezone). UTC fallback only as last resort.
  const date = req.date || new Date().toISOString().split("T")[0];
  const dayCount = req.dayCount || 1;
  const archetypes = req.archetypes || [];
  const whyStatement = req.whyStatement || "";

  if (aspirations.length === 0) {
    return Response.json({ entries: [], date });
  }

  const dayOfWeek = req.dayOfWeek || new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" });
  const season = req.season || getSeason(date);

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
    const activeBehaviors = a.behaviors.filter(b => b.enabled !== false);
    const behaviorList = activeBehaviors.map(b => {
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

  const contextStr = formatKnownContext(knownContext);

  // Build conversation transcript (last 20 messages max to stay within token budget)
  const recentConvo = conversationMessages.slice(-20);
  const conversationStr = recentConvo.length > 0
    ? recentConvo.map(m => `${m.role === "user" ? "Operator" : "HUMA"}: ${m.content}`).join("\n\n")
    : "No conversation yet.";

  const prompt = SHEET_PROMPT
    .replace("{name}", name)
    .replace("{aspirations_with_behaviors}", aspirationsStr)
    .replace("{specificity_section}", specificitySection)
    .replace("{conversation_transcript}", conversationStr)
    .replace("{known_context}", contextStr)
    .replace("{recent_history}", historyStr)
    .replace("{history_analysis}", historyAnalysis)
    .replace("{day_of_week}", dayOfWeek)
    .replace("{date}", date)
    .replace("{season}", season);

  try {
    const anthropic = new Anthropic();

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: "You compile daily production sheets. Return ONLY valid JSON. No markdown, no explanation. Voice: fence-post neighbor — direct, specific, warm without soft.",
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";

    let parsed: { entries: Array<Record<string, unknown>> };
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { entries: [] };
    } catch {
      parsed = { entries: [] };
    }

    return Response.json({ entries: parsed.entries || [], date });
  } catch (err) {
    console.error("Sheet compilation error:", err);
    return internalError("Failed to compile sheet.");
  }
}
