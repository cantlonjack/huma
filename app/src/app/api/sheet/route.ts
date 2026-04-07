import Anthropic from "@anthropic-ai/sdk";
import { isRateLimited } from "@/lib/rate-limit";
import { matchTemplate, getSpecificityHints } from "@/lib/template-matcher";
import { rateLimited, serviceUnavailable, internalError } from "@/lib/api-error";
import { sheetCompileSchema } from "@/lib/schemas";
import { parseBody } from "@/lib/schemas/parse";
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
  if (ctx.financial) {
    const f = ctx.financial as { situation?: string; income?: string; constraints?: string[]; rhythm?: string };
    const parts: string[] = [];
    if (f.situation) parts.push(f.situation);
    if (f.income) parts.push(`income: ${f.income}`);
    if (f.rhythm) parts.push(`pay rhythm: ${f.rhythm}`);
    if (f.constraints && f.constraints.length > 0) parts.push(`constraints: ${f.constraints.join("; ")}`);
    if (parts.length > 0) lines.push(`Financial: ${parts.join(". ")}`);
  }
  if (ctx.resources && ctx.resources.length > 0) {
    lines.push(`Resources: ${ctx.resources.join(", ")}`);
  }

  // Include any unstructured keys we don't have a formatter for
  const knownKeys = new Set(["people", "place", "work", "time", "stage", "health", "financial", "resources", "archetypes", "why_statement"]);
  for (const [key, value] of Object.entries(ctx)) {
    if (!knownKeys.has(key) && value != null) {
      lines.push(`${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`);
    }
  }

  return lines.length > 0 ? lines.join("\n") : "Limited context so far.";
}

const SHEET_PROMPT = `You are compiling today's production sheet for {name}.
Today is {day_of_week}, {date}. Season: {season}. Day {day_count} with HUMA.

{identity_section}

── WHO THIS PERSON IS ──────────────────────────────────────────────
{known_context}

── WHAT THEY ACTUALLY SAID (use their words, their details) ────────
{conversation_transcript}

── ACTIVE ASPIRATIONS & BEHAVIORS ──────────────────────────────────
{aspirations_with_behaviors}

{specificity_section}

{selection_section}

── RECENT HISTORY (last 7 days) ────────────────────────────────────
{recent_history}

{history_analysis}

═══════════════════════════════════════════════════════════════════
YOUR JOB: Write TODAY'S actions, not behaviors.

A behavior is "Cook dinner." An action is "Stew night — chuck in freezer + Sunday broth."
A behavior is "Go for a walk." An action is "20-min loop before the rain hits at 2."
A behavior is "Track spending." An action is "Log yesterday's $47 groceries."
A behavior is "Meal plan." An action is "Plan 4 dinners around the pork shoulder in the freezer."

The operator should read the headline and KNOW WHAT TO DO without tapping for details. The headline is the action. The detail is the how-to.

EVERY ENTRY must use specifics from the context above:
- Names of people they live with → portion sizes, who's involved
- Budget or financial situation → cost-conscious suggestions, no luxury assumptions
- Foods they mentioned, dietary approach → those exact foods, not generic "healthy meal"
- Their schedule, work hours → timing that fits their actual day
- Season and location → what's available, what the weather's like
- What they checked off (or skipped) recently → build on momentum or simplify what's not sticking

If context is thin, use the season, day of week, and aspiration details to be as specific as you can. NEVER fall back to generic behavior names as headlines.

═══════════════════════════════════════════════════════════════════
RULES:

1. MAXIMUM 5 entries. Five or fewer.
2. Each entry has a UNIQUE behavior_key. One entry per behavior, even if shared across aspirations.
3. Prioritize behaviors touching the most dimensions — highest leverage first.
4. Only active aspirations. Nothing they're planning or dreaming about.

HEADLINE (4-8 words, MAX 8):
- This is what they read in 1 second over coffee. It names the specific action for today.
- GOOD: "Stew night — chuck in freezer" / "20-min walk, sunny by 9" / "No purchases today" / "$3.80 chicken stir-fry for two"
- BAD: "Cook a nutritious dinner" (that's a behavior, not an action)
- BAD: "Go for a healthy walk outside" (vague, no specifics)
- BAD: "5:30 AM milking routine — sheep, equipment sanitization" (too long, that's a paragraph)

DETAIL (1-3 sentences, shown on tap):
- The HOW. Specific steps, quantities, timing, cost.
- "Pull chuck from freezer now. Brown + slow cook by 4pm. Use Sunday's broth as the base. Enough for two nights — leftovers Thursday."

VOICE: fence-post neighbor. Direct. Spare. No therapy-speak. No cheerleading. No "consider" or "try to" — just tell them what to do today.

THROUGH-LINE (required):
After choosing today's entries, look at the dimensions they touch. Find the connection — the one thread that runs through multiple items. Write ONE sentence (max 20 words) that names this connection in the operator's own language.

GOOD through-lines:
- "Three of these feed the same thing: your evening rhythm is where Body, Money, and Joy converge."
- "Today's through-line is the kitchen — it's where your health, budget, and family time overlap."
- "Morning quiet is doing triple duty: Body, Growth, and Purpose all start there."

BAD through-lines:
- "You have several important tasks today." (generic, says nothing)
- "These behaviors will help you optimize your life." (therapy-speak, banned vocabulary)

Return ONLY this JSON, no other text:

{
  "through_line": "Three of these feed the same thing: your evening rhythm is where Body, Money, and Joy converge.",
  "entries": [
    {
      "behavior_key": "cook-dinner",
      "aspiration_id": "the-aspiration-uuid",
      "headline": "Stew night — chuck from freezer",
      "detail": "Pull chuck now, brown at 4. Use Sunday's broth. Enough for two nights.",
      "time_of_day": "evening",
      "dimensions": ["body", "money", "home"]
    }
  ]
}

Every entry MUST have: behavior_key, aspiration_id, headline, detail, time_of_day (morning/midday/evening), dimensions (from: body, people, money, home, growth, joy, purpose, identity).
MAXIMUM 5 entries. through_line is REQUIRED. Return ONLY valid JSON.`;

interface RecentEntry {
  date: string;
  behaviorKey: string;
  checked: boolean;
}

// ─── Behavior leverage scoring ───────────────────────────────────────────────
// When total behaviors exceed 5, score each by leverage so the prompt focuses
// on the highest-impact subset. Scoring factors:
//   1. Dimensional breadth — more dimensions touched = higher leverage
//   2. Check-off momentum — recently completed behaviors carry weight
//   3. Day-of-week fit — behaviors scheduled for today (specific-days) get priority
//   4. Aspiration balance — prevent one aspiration from consuming the whole sheet

interface ScoredBehavior {
  aspirationId: string;
  aspirationText: string;
  key: string;
  text: string;
  frequency: string;
  days?: string[];
  detail?: string;
  score: number;
  reason: string;
}

function scoreBehaviors(
  aspirations: SheetCompileRequest["aspirations"],
  recentHistory: RecentEntry[],
  dayOfWeek: string,
): ScoredBehavior[] {
  // Build check-off stats per behavior
  const stats = new Map<string, { done: number; total: number }>();
  for (const entry of recentHistory) {
    if (!stats.has(entry.behaviorKey)) {
      stats.set(entry.behaviorKey, { done: 0, total: 0 });
    }
    const s = stats.get(entry.behaviorKey)!;
    s.total++;
    if (entry.checked) s.done++;
  }

  const scored: ScoredBehavior[] = [];

  for (const a of aspirations) {
    const activeBehaviors = a.behaviors.filter(b => b.enabled !== false);
    for (const b of activeBehaviors) {
      let score = 0;
      const reasons: string[] = [];

      // 1. Dimensional breadth (inferred from behavior text is not available here,
      //    but behaviors with detail tend to be richer — simple proxy)
      // We'll use a base score of 1 for all behaviors

      score += 1;

      // 2. Check-off momentum
      const s = stats.get(b.key);
      if (s && s.total > 0) {
        const rate = s.done / s.total;
        if (rate >= 0.6) {
          score += 2; // building momentum — keep going
          reasons.push("momentum");
        } else if (rate > 0 && rate < 0.4) {
          score += 1.5; // struggling — simpler version might help
          reasons.push("needs-traction");
        }
        // rate 0.4-0.6 is neutral
      } else {
        // No history — new behavior, slight priority to get it started
        score += 1;
        reasons.push("new");
      }

      // 3. Day-of-week fit
      if (b.frequency === "daily") {
        score += 1;
        reasons.push("daily");
      } else if (b.frequency === "specific-days" && b.days) {
        const today = dayOfWeek.toLowerCase().slice(0, 3);
        const matches = b.days.some(d => d.toLowerCase().startsWith(today));
        if (matches) {
          score += 3; // strong signal — scheduled for today
          reasons.push("scheduled-today");
        } else {
          score -= 2; // not today's day
          reasons.push("not-today");
        }
      }
      // weekly/flexible behaviors get no bonus or penalty

      scored.push({
        aspirationId: a.id,
        aspirationText: a.clarifiedText || a.rawText,
        key: b.key,
        text: b.text,
        frequency: b.frequency,
        days: b.days,
        detail: b.detail,
        score,
        reason: reasons.join(", ") || "baseline",
      });
    }
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Aspiration balance: ensure no single aspiration takes more than 3 of the top 5
  const selected: ScoredBehavior[] = [];
  const aspirationCount = new Map<string, number>();

  for (const item of scored) {
    const count = aspirationCount.get(item.aspirationId) || 0;
    if (count >= 3 && selected.length < 7) {
      // Defer — push to end of candidates so other aspirations get slots
      continue;
    }
    selected.push(item);
    aspirationCount.set(item.aspirationId, count + 1);
  }

  // Add back any deferred items at the end
  for (const item of scored) {
    if (!selected.includes(item)) {
      selected.push(item);
    }
  }

  return selected;
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

  // Cron jobs send the secret to bypass rate limiting
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isCron) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    if (await isRateLimited(ip)) {
      return rateLimited();
    }
  }

  const parsed = await parseBody(request, sheetCompileSchema);
  if (parsed.error) return parsed.error;
  const req = parsed.data;
  const name = req.name;
  const aspirations = req.aspirations;
  const knownContext = req.knownContext as KnownContext;
  const recentHistory = req.recentHistory as RecentEntry[];
  const conversationMessages = req.conversationMessages;
  // Date should always come from the client (local timezone). UTC fallback only as last resort.
  const date = req.date || new Date().toISOString().split("T")[0];
  const dayCount = req.dayCount;
  const archetypes = req.archetypes;
  const whyStatement = req.whyStatement;

  if (aspirations.length === 0) {
    return Response.json({ entries: [], date });
  }

  const dayOfWeek = req.dayOfWeek || new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" });
  const season = req.season || getSeason(date);

  // ─── Count total behaviors and apply selection if > 5 ─────────────────────
  const totalBehaviors = aspirations.reduce(
    (sum, a) => sum + a.behaviors.filter(b => b.enabled !== false).length, 0
  );
  const needsSelection = totalBehaviors > 5;

  // Score behaviors for selection when there are too many
  const scored = needsSelection
    ? scoreBehaviors(aspirations, recentHistory, dayOfWeek)
    : null;

  // Build specificity hints from matched templates
  const allSpecificityHints: Record<string, string> = {};
  for (const a of aspirations) {
    const template = matchTemplate(a.clarifiedText || a.rawText);
    if (template) {
      const hints = getSpecificityHints(template);
      Object.assign(allSpecificityHints, hints);
    }
  }

  // When selection is active, mark top-7 candidates (gives Claude some flexibility
  // to choose 5 from a curated shortlist rather than the full unranked pool)
  const topKeys = scored ? new Set(scored.slice(0, 7).map(s => s.key)) : null;

  const aspirationsStr = aspirations.map(a => {
    const activeBehaviors = a.behaviors.filter(b => b.enabled !== false);
    const behaviorList = activeBehaviors.map(b => {
      let freq = b.frequency;
      if (b.frequency === "specific-days" && b.days) {
        freq = `on ${b.days.join(", ")}`;
      }
      const hint = allSpecificityHints[b.key];
      const hintStr = hint ? `\n    SPECIFICITY INSTRUCTIONS: ${hint}` : "";
      // Mark pre-selected behaviors
      const selected = topKeys && topKeys.has(b.key);
      const selectTag = selected ? " ★ PRIORITY" : (topKeys ? " (lower priority today)" : "");
      // Include dimension data if available (may include user corrections)
      const dimStr = b.dimensions && b.dimensions.length > 0 ? ` [dimensions: ${b.dimensions.join(", ")}]` : "";
      return `  - ${b.text} (${freq})${b.detail ? `: ${b.detail}` : ""}${dimStr}${selectTag}${hintStr}`;
    }).join("\n");
    return `"${a.clarifiedText || a.rawText}":\n${behaviorList}`;
  }).join("\n\n");

  // Build specificity section
  const specificitySection = Object.keys(allSpecificityHints).length > 0
    ? `SPECIFICITY HINTS (follow these instructions for each behavior to produce specific output):
${Object.entries(allSpecificityHints).map(([key, hint]) => `  ${key}: ${hint}`).join("\n")}`
    : "";

  // Build selection guidance when there are more behaviors than slots
  const selectionSection = needsSelection && scored
    ? `── SELECTION GUIDANCE (${totalBehaviors} behaviors, only 5 slots) ──────────────
This operator has more behaviors than fit in one day. Behaviors marked ★ PRIORITY
have been pre-scored for today based on:
- Check-off momentum (what's sticking vs. what needs a simpler version)
- Day-of-week scheduling (behaviors scheduled for ${dayOfWeek})
- Dimensional balance (spread across life dimensions, not clustered)

Choose from ★ PRIORITY behaviors first. Only include a "lower priority today" behavior
if it clearly serves today better than a priority one. MAXIMUM 5 entries — this is a
hard cap, not a suggestion.`
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

  // Build identity section from archetypes + WHY statement
  const identityParts: string[] = [];
  if (archetypes.length > 0) {
    identityParts.push(`Archetypes: ${archetypes.join(" + ")}`);
  }
  if (whyStatement) {
    identityParts.push(`WHY: "${whyStatement}"`);
  }
  const identitySection = identityParts.length > 0
    ? identityParts.join("\n")
    : "";

  // Build financial awareness section when financial context exists
  const fin = knownContext.financial as { situation?: string; income?: string; constraints?: string[]; rhythm?: string } | undefined;
  const financialSection = fin && (fin.situation || fin.constraints?.length || fin.rhythm)
    ? `── FINANCIAL AWARENESS ──────────────────────────────────────────
This operator shared financial context. Use it:
${fin.situation ? `- Situation: ${fin.situation}` : ""}
${fin.rhythm ? `- Pay rhythm: ${fin.rhythm} — time money-related actions to land AFTER pay, not before.` : ""}
${fin.constraints?.length ? `- Hard constraints: ${fin.constraints.join("; ")}` : ""}
Meal plans should respect budget. Purchases should reference actual amounts.
"No spend day" and "$X budget" are valid sheet headlines when money is a dimension.`
    : "";

  const prompt = SHEET_PROMPT
    .replace("{name}", name)
    .replace("{identity_section}", identitySection)
    .replace("{aspirations_with_behaviors}", aspirationsStr)
    .replace("{specificity_section}", specificitySection)
    .replace("{selection_section}", selectionSection)
    .replace("{conversation_transcript}", conversationStr)
    .replace("{known_context}", contextStr)
    .replace("{recent_history}", historyStr)
    .replace("{history_analysis}", historyAnalysis + (financialSection ? "\n\n" + financialSection : ""))
    .replace("{day_of_week}", dayOfWeek)
    .replace("{date}", date)
    .replace("{season}", season)
    .replace("{day_count}", String(dayCount));

  try {
    const anthropic = new Anthropic();

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: "You compile daily production sheets — specific actions, not generic behaviors. Return ONLY valid JSON. No markdown, no explanation. Voice: fence-post neighbor — direct, specific, warm without soft. Every headline names what to do today, not what the behavior is.",
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";

    let parsed: { entries: Array<Record<string, unknown>>; through_line?: string };
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { entries: [] };
    } catch {
      parsed = { entries: [] };
    }

    // Hard cap: never return more than 5 entries, regardless of what Claude produced
    const entries = (parsed.entries || []).slice(0, 5);

    return Response.json({
      entries,
      through_line: parsed.through_line || null,
      date,
    });
  } catch (err) {
    console.error("Sheet compilation error:", err);
    return internalError("Failed to compile sheet.");
  }
}
