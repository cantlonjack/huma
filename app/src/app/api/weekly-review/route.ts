import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase-server";
import { isRateLimited } from "@/lib/rate-limit";
import {
  rateLimited,
  serviceUnavailable,
  internalError,
} from "@/lib/api-error";
import { withObservability } from "@/lib/observability";
import { parseBody } from "@/lib/schemas/parse";
import { userTextField } from "@/lib/schemas/sanitize";
import {
  computeWeeklyReview,
  formatReviewForPrompt,
  type BehaviorDay,
  type WeeklyReviewResult,
} from "@/lib/weekly-review";
import { DIMENSION_LABELS } from "@/types/v2";
import type { Aspiration } from "@/types/v2";

// ─── Request schema ─────────────────────────────────────────────────────────

const aspirationSchema = z.object({
  id: z.string(),
  // userTextField({ min: 0 }) accepts empty strings; .default("") covers undefined.
  // SEC-04: rejects [[/]] marker delimiters via Zod custom issue → 400 via parseBody.
  rawText: userTextField({ min: 0 }).default(""),
  clarifiedText: userTextField({ min: 0 }).default(""),
  title: z.string().optional(),
  status: z.string().default("active"),
  dimensionsTouched: z.array(z.string()).default([]),
  behaviors: z.array(z.object({
    key: z.string(),
    text: userTextField({ min: 0 }).default(""),
    dimensions: z.array(z.object({
      dimension: z.string(),
      direction: z.string().optional(),
      reasoning: z.string().optional(),
    })).default([]),
    dimensionOverrides: z.array(z.object({
      dimension: z.string(),
      direction: z.string().optional(),
      reasoning: z.string().optional(),
    })).optional(),
  })).default([]),
});

const behaviorDaySchema = z.object({
  date: z.string(),
  behaviorKey: z.string(),
  completed: z.boolean(),
});

const weeklyReviewSchema = z.object({
  operatorName: userTextField({ min: 0 }).optional().default("there"),
  aspirations: z.array(aspirationSchema).default([]),
  behaviorDays: z.array(behaviorDaySchema).default([]),
});

// ─── Claude prompt ──────────────────────────────────────────────────────────

const WEEKLY_REVIEW_SYSTEM = `You are HUMA, delivering a short weekly review.

Voice: fence-post neighbor. Direct. Specific. No therapy-speak, no cheerleading, no "great job."
Never say: "I hear you", "That's great", "journey", "boundaries", "mindset".

Return EXACTLY this JSON, nothing else:
{
  "wins": "1 sentence — what showed up this week. Reference the data.",
  "drifts": "1 sentence — what went quiet. Specific, no alarm. Null if nothing drifted.",
  "oneShift": "1 short sentence — a question, not a directive. Passes the dependency test: develop capacity, don't prescribe."
}

Rules:
- Each field is ONE sentence. No em-dashes, no flowery language.
- If nothing drifted, set drifts to null (literal JSON null, not "none").
- oneShift is always phrased as a question the operator asks themselves.
- Never mention "motivation" or "discipline." Point at the system, not the person.`;

// ─── Route ──────────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) return serviceUnavailable();

  return withObservability(
    request,
    "/api/weekly-review",
    "user",
    () => null,
    async (obs) => {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (await isRateLimited(ip)) return rateLimited();

  const parsed = await parseBody(request, weeklyReviewSchema);
  if (parsed.error) return parsed.error;
  const { operatorName, aspirations: rawAspirations, behaviorDays } = parsed.data;

  const aspirations = rawAspirations as unknown as Aspiration[];
  const data = computeWeeklyReview(behaviorDays as BehaviorDay[], aspirations);

  const prompt = `${operatorName}'s past week:\n\n${formatReviewForPrompt(data, aspirations)}`;

  try {
    const anthropic = new Anthropic();
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 280,
      system: WEEKLY_REVIEW_SYSTEM,
      messages: [{ role: "user", content: prompt }],
    });

    // ─── SEC-05 token attribution ─────────────────────────────────────────
    obs.setPromptTokens(msg.usage.input_tokens);
    obs.setOutputTokens(msg.usage.output_tokens);

    const raw = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    const cleaned = raw.replace(/```json\n?|```/g, "").trim();

    let parsedReview: { wins: string; drifts: string | null; oneShift: string };
    try {
      parsedReview = JSON.parse(cleaned);
    } catch {
      // Fallback: structured review from raw data without Claude prose.
      parsedReview = {
        wins: data.activeDimensions.length > 0
          ? `${data.activeDays} of 7 days active, with ${data.activeDimensions.map((d) => DIMENSION_LABELS[d]).join(" and ")} moving most consistently.`
          : `${data.activeDays} of 7 days active this week.`,
        drifts: data.dormantDimensions.length > 0
          ? `${data.dormantDimensions.map((d) => DIMENSION_LABELS[d]).join(" and ")} stayed quiet the whole week.`
          : null,
        oneShift: "What would bring the quiet parts back into the rhythm without adding to the list?",
      };
    }

    // Build the graph highlight from the same data.
    let graphHighlight: WeeklyReviewResult["graphHighlight"] = null;
    if (data.leadAspirationId) {
      const lead = aspirations.find((a) => a.id === data.leadAspirationId);
      if (lead) {
        graphHighlight = {
          kind: "aspiration",
          id: lead.id,
          label: lead.title || lead.clarifiedText || lead.rawText,
        };
      }
    } else if (data.activeDimensions.length > 0) {
      const dim = data.activeDimensions[0];
      graphHighlight = {
        kind: "dimension",
        id: dim,
        label: DIMENSION_LABELS[dim],
      };
    } else if (data.dormantDimensions.length > 0) {
      const dim = data.dormantDimensions[0];
      graphHighlight = {
        kind: "dimension",
        id: dim,
        label: DIMENSION_LABELS[dim],
      };
    }

    const result: WeeklyReviewResult = {
      weekKey: data.weekKey,
      weekStart: data.weekStart,
      wins: parsedReview.wins,
      drifts: parsedReview.drifts || "",
      oneShift: parsedReview.oneShift,
      graphHighlight,
      createdAt: new Date().toISOString(),
    };

    // Persist review — auth optional (anon users keep it in localStorage only).
    try {
      const supabase = await createServerSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Late-resolve user_id for the observability log when the user is known.
        obs.setUserId(user.id);
        await supabase.from("weekly_reviews_v2").upsert(
          {
            user_id: user.id,
            week_key: result.weekKey,
            week_start: result.weekStart,
            wins: result.wins,
            drifts: result.drifts || null,
            one_shift: result.oneShift,
            graph_highlight: result.graphHighlight,
            active_dimensions: data.activeDimensions,
            dormant_dimensions: data.dormantDimensions,
            active_days: data.activeDays,
          },
          { onConflict: "user_id,week_key" },
        );
      }
    } catch (err) {
      // Persistence is best-effort — the client still receives the review.
      console.error("weekly-review persist error:", err);
    }

    return Response.json({ review: result });
  } catch (err) {
    console.error("weekly-review error:", err);
    return internalError("Failed to generate weekly review.");
  }
    },
  );
}

// ─── Fetch latest review for the current user ──────────────────────────────

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ review: null });

    const { data } = await supabase
      .from("weekly_reviews_v2")
      .select("*")
      .eq("user_id", user.id)
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return Response.json({ review: null });

    const review: WeeklyReviewResult = {
      weekKey: data.week_key,
      weekStart: data.week_start,
      wins: data.wins,
      drifts: data.drifts || "",
      oneShift: data.one_shift,
      graphHighlight: data.graph_highlight,
      createdAt: data.created_at,
    };

    return Response.json({ review });
  } catch (err) {
    console.error("weekly-review GET error:", err);
    return Response.json({ review: null });
  }
}
