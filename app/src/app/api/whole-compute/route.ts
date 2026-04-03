import Anthropic from "@anthropic-ai/sdk";
import { badRequest, internalError } from "@/lib/api-error";

const client = new Anthropic();

const ARCHETYPE_SYSTEM = `You are HUMA, a perceptual grammar for human flourishing. Based on the operator's context below, suggest which archetypes best describe them. Choose from:

Outer tier: Earth Tender, Creator, Entrepreneur, Official, Economic Shaper, Spirit, Media, Educator, Parent

Inner tier (orientation): Initiator, Manifestor, Destabilizer

An operator typically holds 1-2 outer archetypes and 1 inner orientation.
Respond with JSON only: { "suggested": ["Earth Tender", "Manifestor"], "reasoning": "one sentence" }`;

const WHY_SYSTEM = `You are HUMA. Based on the operator's context below, draft a one-sentence WHY statement that captures what drives them — not what they do, but why it matters to them.

Write in first person. Maximum 15 words. Direct, specific, no therapy-speak.
Good example: "I build systems that let land feed people for generations."
Bad example: "I am passionate about creating a better world through sustainable practices."

Respond with JSON only: { "why": "your draft here" }`;

const WHY_EVOLVE_SYSTEM = `You are HUMA. An operator set their WHY statement weeks ago. Since then, their actual behavior tells a story. Your job: compare what they said mattered with what they've actually been doing, and draft an evolved WHY that reflects the real shape of their life.

Rules:
- Write in first person. Maximum 15 words.
- Direct, specific, no therapy-speak.
- The evolved WHY should honor the original intent but incorporate what behavioral data reveals.
- If the original WHY still fits perfectly, say so — don't change for the sake of change.
- Frame the suggestion warmly: this is recognition, not correction.

Respond with JSON only:
{
  "evolved": true/false,
  "evolvedWhy": "the new draft (only if evolved=true)",
  "observation": "One sentence (max 20 words) noting what the behavioral data reveals — e.g. 'Your strongest patterns all center on evening rituals with your family.'"
}`;

export async function POST(request: Request) {
  try {
    const { contextData, compute, originalWhy, behavioralSummary } = await request.json();

    if (!contextData || typeof contextData !== "string") {
      return badRequest("No context data provided.");
    }

    // ─── WHY Evolution ────────────────────────────────────────────────
    if (compute === "why-evolve") {
      if (!originalWhy || !behavioralSummary) {
        return badRequest("why-evolve requires originalWhy and behavioralSummary.");
      }

      const prompt = `Original WHY: "${originalWhy}"

Behavioral data (last 28 days):
${behavioralSummary}

Operator context:
${contextData}`;

      const res = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        system: WHY_EVOLVE_SYSTEM,
        messages: [{ role: "user", content: prompt }],
      });

      const text = res.content[0].type === "text" ? res.content[0].text : "";
      try {
        const parsed = JSON.parse(text.replace(/```json\n?|```/g, "").trim());
        return Response.json({ whyEvolution: parsed });
      } catch {
        return Response.json({ whyEvolution: null });
      }
    }

    const results: { archetypes?: { suggested: string[]; reasoning: string }; why?: string } = {};

    if (compute === "both" || compute === "archetypes") {
      const archetypePromise = client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        system: ARCHETYPE_SYSTEM,
        messages: [{ role: "user", content: contextData }],
      });

      if (compute === "both") {
        const whyPromise = client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 100,
          system: WHY_SYSTEM,
          messages: [{ role: "user", content: contextData }],
        });

        const [archetypeRes, whyRes] = await Promise.all([archetypePromise, whyPromise]);

        const archetypeText = archetypeRes.content[0].type === "text" ? archetypeRes.content[0].text : "";
        const whyText = whyRes.content[0].type === "text" ? whyRes.content[0].text : "";

        try {
          const archetypeParsed = JSON.parse(archetypeText.replace(/```json\n?|```/g, "").trim());
          results.archetypes = archetypeParsed;
        } catch { /* parse fail */ }

        try {
          const whyParsed = JSON.parse(whyText.replace(/```json\n?|```/g, "").trim());
          results.why = whyParsed.why;
        } catch { /* parse fail */ }
      } else {
        const archetypeRes = await archetypePromise;
        const archetypeText = archetypeRes.content[0].type === "text" ? archetypeRes.content[0].text : "";
        try {
          results.archetypes = JSON.parse(archetypeText.replace(/```json\n?|```/g, "").trim());
        } catch { /* parse fail */ }
      }
    } else if (compute === "why") {
      const whyRes = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 100,
        system: WHY_SYSTEM,
        messages: [{ role: "user", content: contextData }],
      });
      const whyText = whyRes.content[0].type === "text" ? whyRes.content[0].text : "";
      try {
        const parsed = JSON.parse(whyText.replace(/```json\n?|```/g, "").trim());
        results.why = parsed.why;
      } catch { /* parse fail */ }
    }

    return Response.json(results);
  } catch (error) {
    console.error("whole-compute error:", error);
    return internalError("Computation failed.");
  }
}
