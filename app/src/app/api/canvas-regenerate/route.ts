import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { computeCapitalScores, dimensionActivityFromCounts } from "@/lib/capital-computation";
import { withObservability } from "@/lib/observability";
import type { CanvasData } from "@/engine/canvas-types";

export const runtime = "nodejs";

const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514";

// ─── Auth helper ─────────────────────────────────────────────────────────

async function getAuthUser(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user } } = await supabase.auth.getUser();
  return user ? { user, supabase } : null;
}

// ─── Handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }

  return withObservability(
    request,
    "/api/canvas-regenerate",
    "user",
    () => null,
    async (obs) => {
  const auth = await getAuthUser(request);
  if (!auth) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { user, supabase } = auth;
  // Late-resolve user_id for the observability log (Bearer-resolved user).
  obs.setUserId(user.id);

  try {
    // Fetch all operator data in parallel
    const [
      contextRes,
      aspirationsRes,
      behaviorRes,
      insightsRes,
      patternsRes,
    ] = await Promise.all([
      supabase.from("contexts").select("known_context, why_statement").eq("user_id", user.id).single(),
      supabase.from("aspirations").select("*").eq("user_id", user.id).eq("status", "active"),
      supabase.from("behavior_log").select("behavior_key, behavior_name, date, completed").eq("user_id", user.id).eq("completed", true).gte("date", dateOffset(28)).lte("date", today()),
      supabase.from("insights").select("insight_text, dimensions_involved").eq("user_id", user.id).eq("delivered", true).order("delivered_at", { ascending: false }).limit(5),
      supabase.from("patterns").select("name, trigger, status, validation_count, validation_target").eq("user_id", user.id),
    ]);

    const knownContext = (contextRes.data?.known_context as Record<string, unknown>) || {};
    const whyStatement = contextRes.data?.why_statement || "";
    const aspirations = aspirationsRes.data || [];
    const behaviorRows = behaviorRes.data || [];
    const insights = insightsRes.data || [];
    const patterns = patternsRes.data || [];

    const operatorName = (knownContext.operator_name as string)
      || (knownContext.name as string)
      || user.email?.split("@")[0]
      || "Operator";

    const location = (knownContext.place as { name?: string })?.name || "";

    // Build dimension counts from behavior data
    const dimLookup = new Map<string, string[]>();
    for (const asp of aspirations) {
      const behaviors = (asp.behaviors as Array<{ key: string; dimensions?: Array<{ dimension: string }> }>) || [];
      for (const b of behaviors) {
        dimLookup.set(b.key, (b.dimensions || []).map((d) => d.dimension));
      }
    }

    const dimensionCounts: Record<string, number> = {};
    const activeDates = new Set<string>();
    for (const row of behaviorRows) {
      activeDates.add(row.date);
      const dims = dimLookup.get(row.behavior_key) || [];
      for (const d of dims) {
        dimensionCounts[d] = (dimensionCounts[d] || 0) + 1;
      }
    }

    // Compute capital scores from actual behavioral data
    const dimActivity = dimensionActivityFromCounts(dimensionCounts, activeDates.size, 28);
    const capitalProfile = computeCapitalScores(dimActivity, activeDates.size, 28);

    // Build the generation prompt
    const aspirationSummary = aspirations.map((a) => {
      const title = a.title || a.clarified_text || a.raw_text;
      const dims = (a.dimensions_touched as string[]) || [];
      const behaviors = ((a.behaviors as Array<{ text: string }>) || []).map((b) => b.text).join(", ");
      return `- ${title} [${dims.join(", ")}]: ${behaviors}`;
    }).join("\n");

    const patternSummary = patterns.map((p) => {
      const statusLabel = p.status === "validated" ? "validated" : p.status === "working" ? "building" : "finding";
      return `- ${p.name} (${statusLabel}, ${p.validation_count}/${p.validation_target}): trigger = "${p.trigger}"`;
    }).join("\n");

    const insightSummary = insights.map((i) => {
      const dims = (i.dimensions_involved as string[]) || [];
      return `- [${dims.join(", ")}] ${i.insight_text}`;
    }).join("\n");

    const contextSummary = Object.entries(knownContext)
      .filter(([k]) => !["archetypes", "notifications", "operator_name", "name"].includes(k))
      .map(([k, v]) => {
        if (typeof v === "object" && v !== null) return `${k}: ${JSON.stringify(v)}`;
        return `${k}: ${v}`;
      })
      .join("\n");

    const archetypes = (knownContext.archetypes as string[]) || [];

    const prompt = `You are HUMA. Generate a Living Canvas — a structured JSON snapshot of this operator's whole life system — from their ACTUAL behavioral data. This is not aspirational. This is what they are BUILDING, based on what they DO.

## Operator
Name: ${operatorName}
Location: ${location}
WHY: ${whyStatement || "Not yet defined"}
Archetypes: ${archetypes.join(", ") || "Not yet selected"}
Active days (last 28): ${activeDates.size}

## Context
${contextSummary || "Minimal context gathered so far."}

## Active Aspirations & Behaviors
${aspirationSummary || "None yet."}

## Patterns
${patternSummary || "No patterns extracted yet."}

## Recent Insights
${insightSummary || "No insights generated yet."}

## Behavioral Capital Profile (computed from data)
${capitalProfile.map((c) => `${c.form}: ${c.score}/5 — ${c.note}`).join("\n")}

---

Generate a Living Canvas JSON object. The capitalProfile is ALREADY COMPUTED from behavioral data — use the exact values provided above. For other fields, synthesize from what you know about this operator.

Output ONLY valid JSON. No markdown fences, no explanation.

{
  "essence": { "name": string, "land": string, "phrase": string },
  "qolNodes": string[],          // 3-5 Quality of Life statements derived from their aspirations
  "productionNodes": string[],   // 3-5 what they're actively producing/building
  "resourceNodes": string[],     // 3-5 resource foundations they're developing
  "capitalProfile": CapitalScore[],  // USE THE EXACT COMPUTED VALUES ABOVE
  "fieldLayers": [],             // Empty — not applicable for V2 behavioral canvas
  "enterprises": [],             // Empty — V2 uses aspirations, not enterprises
  "nodalInterventions": [],      // Empty
  "closing": string              // One sentence: what this canvas reveals about their system
}`;

    const client = new Anthropic();
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    // ─── SEC-05 token attribution ─────────────────────────────────────────
    obs.setPromptTokens(response.usage.input_tokens);
    obs.setOutputTokens(response.usage.output_tokens);

    const text = response.content[0]?.type === "text" ? response.content[0].text : "";

    let canvasData: CanvasData;
    try {
      canvasData = JSON.parse(text.trim());
    } catch {
      // Try extracting JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        canvasData = JSON.parse(jsonMatch[0]);
      } else {
        return Response.json({ error: "Failed to parse canvas data" }, { status: 500 });
      }
    }

    // Override capitalProfile with computed values (don't trust LLM to copy exactly)
    canvasData.capitalProfile = capitalProfile;

    // Store the regenerated canvas
    const canvasJson = JSON.stringify(canvasData);
    if (canvasJson.length <= 200_000) {
      await supabase.from("maps").upsert({
        user_id: user.id,
        name: operatorName,
        location: location,
        canvas_data: canvasData,
        document_markdown: "",
        is_public: false,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }

    return Response.json({
      canvasData,
      capitalProfile,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Canvas regeneration error:", err);
    return Response.json({ error: "Canvas generation failed" }, { status: 500 });
  }
    },
  );
}

// ─── Date helpers ────────────────────────────────────────────────────────

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateOffset(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
