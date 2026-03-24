/**
 * POST /api/ikigai-synthesis
 *
 * Synthesizes the operator's Ikigai intersection from their
 * love/good/need answers. Returns a 3-sentence synthesis.
 */

import Anthropic from "@anthropic-ai/sdk";
import { isRateLimited } from "@/lib/rate-limit";

const SYSTEM_PROMPT = `You are HUMA. An operator mapped what they love, what they're good at, and what the world needs from them.

Synthesize the INTERSECTION. What is this person uniquely positioned to do? Name the tension (where love and skill don't yet meet need) and the opportunity (where they do).

Rules:
- Use their name once.
- Maximum 3 sentences.
- Be specific to THEIR entries.
- DO NOT list back what they said. Synthesize.
- DO NOT say "based on what you shared."
- Warm, direct, spare.

Respond in JSON: { "synthesis": "..." }`;

interface SynthesisRequest {
  name: string;
  love: string[];
  good: string[];
  need: string[];
  loveCards?: string[];
  goodCards?: string[];
  needCards?: string[];
}

const FALLBACK_SYNTHESIS =
  "There's something here — where what you love meets what you're good at meets what the world is asking for. We'll see it more clearly as we go deeper.";

export async function POST(request: Request) {
  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  if (await isRateLimited(ip)) {
    return Response.json(
      { synthesis: FALLBACK_SYNTHESIS },
      { status: 429 }
    );
  }

  let body: SynthesisRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !body.name ||
    !Array.isArray(body.love) ||
    !Array.isArray(body.good) ||
    !Array.isArray(body.need)
  ) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Merge text entries + card labels for the prompt
  const loves = [...body.love, ...(body.loveCards || [])];
  const goods = [...body.good, ...(body.goodCards || [])];
  const needs = [...body.need, ...(body.needCards || [])];

  if (loves.length === 0 && goods.length === 0 && needs.length === 0) {
    return Response.json({ synthesis: FALLBACK_SYNTHESIS });
  }

  const userMessage = `Operator: ${body.name}

What they love: ${loves.join(", ")}
What they're good at: ${goods.join(", ")}
What the world needs: ${needs.join(", ")}`;

  // Call Claude
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ synthesis: FALLBACK_SYNTHESIS });
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*"synthesis"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.synthesis && typeof parsed.synthesis === "string") {
        return Response.json({ synthesis: parsed.synthesis });
      }
    }

    // If JSON parsing fails, use the text directly
    if (text.trim()) {
      return Response.json({ synthesis: text.trim() });
    }

    return Response.json({ synthesis: FALLBACK_SYNTHESIS });
  } catch {
    return Response.json({ synthesis: FALLBACK_SYNTHESIS });
  }
}
