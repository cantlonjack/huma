import Anthropic from "@anthropic-ai/sdk";
import { paletteConcepts } from "@/data/palette-concepts";
import type { PaletteConcept } from "@/types/v2";
import { withObservability } from "@/lib/observability";
import { paletteSchema } from "@/lib/schemas";
import { parseBody } from "@/lib/schemas/parse";

// Adapt engine concepts to V2 type (same shape, different module)
const PALETTE_CONCEPTS: PaletteConcept[] = paletteConcepts as unknown as PaletteConcept[];

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }

  return withObservability(
    request,
    "/api/palette",
    "user",
    () => null,
    async (obs) => {
  const parsed = await parseBody(request, paletteSchema);
  if (parsed.error) return parsed.error;
  const { conversationSoFar, selectedConcepts } = parsed.data;

  if (conversationSoFar.length === 0) {
    return Response.json({ concepts: [] });
  }

  // Build the concept list excluding already-selected ones
  const availableConcepts = PALETTE_CONCEPTS.filter(
    (c) => !selectedConcepts.includes(c.id)
  );

  const conceptList = availableConcepts
    .map((c) => `${c.id}: "${c.text}" (${c.category}) [related: ${c.relatedConcepts.join(", ")}]`)
    .join("\n");

  try {
    const anthropic = new Anthropic();

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL_FAST || "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system: "You select relevant concepts from a list based on conversation context. Prioritize concepts that are related to concepts the user has already mentioned. Return ONLY a JSON array of concept IDs. No explanation.",
      messages: [
        {
          role: "user",
          content: `Given this conversation so far:\n${conversationSoFar.join("\n")}\n\nFrom this list of concepts:\n${conceptList}\n\nReturn the 8 most relevant concepts the person hasn't mentioned yet. Prefer concepts that are listed as 'related' to topics already discussed.\nReturn as JSON array of strings (just the IDs): ["id1","id2",...]`,
        },
      ],
    });

    // ─── SEC-05 token attribution ─────────────────────────────────────────
    obs.setPromptTokens(response.usage.input_tokens);
    obs.setOutputTokens(response.usage.output_tokens);

    const text = response.content[0].type === "text" ? response.content[0].text : "[]";

    // Parse the JSON array from the response
    let selectedIds: string[];
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      selectedIds = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      selectedIds = [];
    }

    const concepts = selectedIds
      .map((id: string) => PALETTE_CONCEPTS.find((c) => c.id === id))
      .filter(Boolean)
      .slice(0, 8);

    return Response.json({ concepts });
  } catch (err) {
    console.error("Palette API error:", err);
    // Fallback: return first 8 concepts by category relevance
    const fallback = availableConcepts.slice(0, 8);
    return Response.json({ concepts: fallback });
  }
    },
  );
}
