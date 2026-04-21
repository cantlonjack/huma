import Anthropic from "@anthropic-ai/sdk";
import { isRateLimited } from "@/lib/rate-limit";
import { matchTemplate, getSpecificityHints } from "@/lib/template-matcher";
import { rateLimited, serviceUnavailable, internalError, apiError } from "@/lib/api-error";
import { requireUser } from "@/lib/auth-guard";
import { checkAndIncrement } from "@/lib/quota";
import { withObservability } from "@/lib/observability";
import { sheetCompileSchema } from "@/lib/schemas";
import { parseBody } from "@/lib/schemas/parse";
import type { KnownContext } from "@/types/v2";
import type { HumaContext } from "@/types/context";
import { compressConversationHistory } from "@/lib/context-encoding";
import { budgetCheck, pickBudget } from "@/lib/services/prompt-builder";
import { allSeeds } from "@/data/rppl-seeds";
import {
  getSeason,
  formatKnownContext,
  formatCompressedContextForSheet,
  sheetVerificationSummary,
  normalizeSheetAspirations,
  scoreBehaviors,
  analyzeHistory,
  type RecentEntry,
} from "@/lib/services/sheet-service";

const SHEET_PROMPT = `You are compiling today's production sheet for {name}.
Today is {day_of_week}, {date}. Season: {season}. Day {day_count} with HUMA.
Time of day: {time_of_day}.
If evening: The opening should reflect on the day — what happened, what held, what shifted. Tone is reflective, not action-oriented. Don't list tomorrow's actions. Acknowledge what was done.
If morning: The opening frames the day ahead — state of things, what's at stake, what's possible.

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

This is a DAILY LETTER, not a task list. The operator should feel like a thoughtful strategist who knows their whole life wrote them a brief personal note.

OPENING (required):
1-2 sentences addressing the operator by name. Reference time of day, name the state of things. This is the letter greeting — warm, specific, grounded in their recent data.
GOOD: "Good morning, Sarah. Sleep's been rough this week — three nights past midnight. But your morning walks are holding strong."
BAD: "Hello! Here are your tasks for today." (generic, robotic)
BAD: "Good morning! I hope you're having a wonderful day." (cheerleading)

THROUGH-LINE (required):
After choosing today's entries, find the one thread that runs through them. Write ONE sentence (max 20 words) that names this connection in the operator's own language.
GOOD: "Today is about one choice: does the writing come first? Everything else follows from that."
BAD: "You have several important tasks today." (generic)

BECAUSE (required on each entry):
One sentence explaining WHY this action matters — traced to the operator's stated desire, aspiration, or a known connection between dimensions. This is not the how-to (that's detail). This is the why-this.
GOOD: "You chose this pattern: writing first, work second. Day 14 of your morning routine."
GOOD: "On days you walk, your evening mood is measurably better — and Sarah notices."
BAD: "This is important for your health." (generic, not traced to their life)

CONNECTION_NOTE (optional, on entries that connect to other entries):
A brief phrase naming how this entry connects to another entry or to a known pattern. Used as narrative transition between entries.
GOOD: "This one creates the window for the next —"
GOOD: "And the walk resets your evening, which feeds..."

PATTERN_NOTE (optional, when an action is part of a consciously chosen pattern):
Reference the pattern by name and how long they've been practicing it.
GOOD: "Part of your structured morning pattern — day 14."
GOOD: "Week 3 of your evening wind-down experiment."

Return ONLY this JSON, no other text:

{
  "opening": "Good morning, Sarah. Sleep's been rough this week — three nights past midnight. But your morning walks are holding strong.",
  "through_line": "Today is about one choice: does the writing come first? Everything else follows from that.",
  "entries": [
    {
      "behavior_key": "morning-pages",
      "aspiration_id": "the-aspiration-uuid",
      "headline": "Morning pages before email",
      "detail": "Desk by 6:30. Two pages minimum. Phone stays in the kitchen until 8.",
      "because": "You chose this pattern: writing first, work second. Day 14 — the mornings you write, your satisfaction scores are 3x higher.",
      "connection_note": "This creates the window for everything else —",
      "pattern_note": "Part of your creative sovereignty routine — day 14.",
      "time_of_day": "morning",
      "dimensions": ["growth", "purpose", "joy"]
    }
  ]
}

Every entry MUST have: behavior_key, aspiration_id, headline, detail, because, time_of_day, dimensions.
Optional per entry: connection_note, pattern_note.
MAXIMUM 5 entries. opening and through_line are REQUIRED. Return ONLY valid JSON.`;

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return serviceUnavailable();
  }

  // ─── Auth gate (SEC-01) ──────────────────────────────────────────────────
  // requireUser handles CRON_SECRET bearer short-circuit + Supabase session.
  // Returns 401 when PHASE_1_GATE_ENABLED=true and neither path authenticates.
  // Pre-flag-flip path returns ctx.user=null, source:"system".
  const auth = await requireUser(request);
  if (auth.error) {
    // Uniform observability: log the 401 short-circuit too.
    return withObservability(
      request,
      "/api/sheet",
      "user",
      () => null,
      async () => auth.error!,
    );
  }
  const { ctx } = auth;

  return withObservability(
    request,
    "/api/sheet",
    ctx.source,
    () => ctx.user?.id ?? null,
    async (obs) => {
  // ─── IP rate-limit (Warning 1: anon/unauth only; also skip cron) ─────────
  // Cron jobs bypass both auth and IP-limit (scheduled operator traffic).
  // Permanent users skip IP-limit so shared-IP operators are not penalized.
  if (!ctx.isCron && (!ctx.user || ctx.user.is_anonymous)) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    if (await isRateLimited(ip)) {
      return rateLimited();
    }
  }

  // ─── Per-user quota (SEC-02) — runs AFTER budgetCheck below ──────────────
  // Blocker 6 resolution (Plan 01-03): quota RPC now receives accurate
  // inputTokens from anthropic.messages.countTokens(). The call site moved
  // below parseBody + prompt assembly + budgetCheck; see the SEC-03 block
  // inside the try block near the anthropic.messages.create call.

  const parsed = await parseBody(request, sheetCompileSchema);
  if (parsed.error) return parsed.error;
  const req = parsed.data;
  const name = req.name;
  const aspirations = req.aspirations;
  const knownContext = req.knownContext as KnownContext;
  const humaContext = req.humaContext as HumaContext | undefined;
  const recentHistory = req.recentHistory as RecentEntry[];
  const conversationMessages = req.conversationMessages;
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
      const selected = topKeys && topKeys.has(b.key);
      const selectTag = selected ? " ★ PRIORITY" : (topKeys ? " (lower priority today)" : "");
      const dimStr = b.dimensions && b.dimensions.length > 0 ? ` [dimensions: ${b.dimensions.join(", ")}]` : "";
      return `  - ${b.text} (${freq})${b.detail ? `: ${b.detail}` : ""}${dimStr}${selectTag}${hintStr}`;
    }).join("\n");
    return `"${a.clarifiedText || a.rawText}":\n${behaviorList}`;
  }).join("\n\n");

  const specificitySection = Object.keys(allSpecificityHints).length > 0
    ? `SPECIFICITY HINTS (follow these instructions for each behavior to produce specific output):
${Object.entries(allSpecificityHints).map(([key, hint]) => `  ${key}: ${hint}`).join("\n")}`
    : "";

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
    : "No history yet — this is their first day. Use the through-line to name the most connected behavior or the strongest cross-dimensional link you see in their aspirations.";

  const historyAnalysis = analyzeHistory(recentHistory, dayOfWeek);

  // Build behaviorCounts from recentHistory for compressed encoding
  const behaviorCounts: Record<string, { completed: number; total: number }> = {};
  for (const entry of recentHistory) {
    // The key format for encoding is aspirationId:behaviorKey.
    // recentHistory only has behaviorKey, so fall back to matching via aspiration lookup.
    for (const asp of aspirations) {
      if (asp.behaviors?.some(b => b.key === entry.behaviorKey)) {
        const key = `${asp.id}:${entry.behaviorKey}`;
        if (!behaviorCounts[key]) behaviorCounts[key] = { completed: 0, total: 0 };
        behaviorCounts[key].total++;
        if (entry.checked) behaviorCounts[key].completed++;
      }
    }
  }

  // Use compressed encoding when HumaContext is provided; else legacy formatter.
  // Normalize the sheet's simpler aspiration shape to full Aspiration objects.
  const normalizedAspirations = humaContext && humaContext._version
    ? normalizeSheetAspirations(aspirations)
    : null;

  const contextStr = humaContext && humaContext._version && normalizedAspirations
    ? formatCompressedContextForSheet({
        humaContext,
        aspirations: normalizedAspirations,
        behaviorCounts,
        dayCount,
      })
    : formatKnownContext(knownContext);

  // Graph verification (Phase 3) — surface unconnected aspirations, dormant capitals.
  const verificationStr = humaContext && humaContext._version && normalizedAspirations
    ? sheetVerificationSummary({
        humaContext,
        aspirations: normalizedAspirations,
        behaviorCounts,
        dayCount,
        rpplSeeds: allSeeds,
      }).summary
    : "";

  // Compress conversation history: keep last 5 full, condense older to 1 line each.
  const conversationStr = humaContext && humaContext._version
    ? compressConversationHistory(conversationMessages.slice(-20), 5)
    : (conversationMessages.slice(-20).length > 0
        ? conversationMessages.slice(-20).map(m => `${m.role === "user" ? "Operator" : "HUMA"}: ${m.content}`).join("\n\n")
        : "No conversation yet.");

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
    .replace("{known_context}", verificationStr ? `${contextStr}\n\n${verificationStr}` : contextStr)
    .replace("{recent_history}", historyStr)
    .replace("{history_analysis}", historyAnalysis + (financialSection ? "\n\n" + financialSection : ""))
    .replace("{day_of_week}", dayOfWeek)
    .replace("{date}", date)
    .replace("{season}", season)
    .replace("{day_count}", String(dayCount))
    .replace("{time_of_day}", req.timeOfDay || "morning");

  try {
    const anthropic = new Anthropic();

    const SHEET_SYSTEM_STATIC = "You compile daily production sheets — specific actions, not generic behaviors. Return ONLY valid JSON. No markdown, no explanation. Voice: fence-post neighbor — direct, specific, warm without soft. Every headline names what to do today, not what the behavior is.";

    const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
    const systemBlocks = [
      {
        type: "text" as const,
        text: SHEET_SYSTEM_STATIC,
        cache_control: { type: "ephemeral" as const },
      },
    ];
    let dispatchMessages: Array<{ role: "user" | "assistant"; content: string }> = [
      { role: "user", content: prompt },
    ];

    // ─── SEC-03: token budget (runs BEFORE quota — Blocker 6) ────────────
    // Cron bypasses budget entirely — scheduled operator traffic uses a
    // known-good prompt size and must never 413 out of the morning briefing.
    let trimmedCount = 0;
    let inputTokens = 0;
    if (!ctx.isCron) {
      const budget = await budgetCheck({
        anthropic,
        model,
        system: systemBlocks,
        messages: dispatchMessages,
        limit: pickBudget(model),
      });
      if ("tooLarge" in budget) {
        return apiError(
          "This thread's gotten long. Start a new one — I'll catch you up from your shape.",
          "PAYLOAD_TOO_LARGE",
          413,
        );
      }
      dispatchMessages = budget.messages as typeof dispatchMessages;
      trimmedCount = budget.trimmedCount;
      inputTokens = budget.inputTokens;
    }

    // ─── SEC-02: per-user quota (Blocker 6: accurate inputTokens) ────────
    // Cron bypasses (scheduled traffic is not user-owned); pre-flag-flip
    // shim (ctx.user === null) also bypasses (no stable id to key against).
    if (!ctx.isCron && ctx.user) {
      const quota = await checkAndIncrement(ctx.user.id, "/api/sheet", inputTokens);
      if (!quota.allowed) {
        return rateLimited({
          tier: quota.tier,
          resetAt: quota.resetAt,
          suggest: quota.suggest,
        });
      }
    }

    const response = await anthropic.messages.create({
      model,
      max_tokens: 2048,
      system: systemBlocks,
      messages: dispatchMessages,
    });

    // ─── SEC-05: token attribution ───────────────────────────────────────
    // Capture Anthropic usage BEFORE returning so the withObservability
    // finally-block sees non-zero tokens (Warning 5 in practice).
    obs.setPromptTokens(response.usage.input_tokens);
    obs.setOutputTokens(response.usage.output_tokens);

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";

    let parsed: { entries: Array<Record<string, unknown>>; through_line?: string; opening?: string };
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { entries: [] };
    } catch {
      parsed = { entries: [] };
    }

    const entries = (parsed.entries || []).slice(0, 5);

    // SEC-03: surface trim events to the client via X-Huma-Truncated.
    // Header omitted when no trim happened (trimmedCount === 0).
    const payload = {
      entries,
      through_line: parsed.through_line || null,
      opening: parsed.opening || null,
      date,
    };
    const responseHeaders: Record<string, string> = { "Content-Type": "application/json" };
    if (trimmedCount > 0) {
      responseHeaders["X-Huma-Truncated"] = `count=${trimmedCount},reason=budget`;
    }
    return new Response(JSON.stringify(payload), { status: 200, headers: responseHeaders });
  } catch (err) {
    console.error("Sheet compilation error:", err);
    return internalError("Failed to compile sheet.");
  }
    },
  );
}
