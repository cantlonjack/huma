import Anthropic from "@anthropic-ai/sdk";

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

export async function POST(request: Request) {
  try {
    const { contextData, compute } = await request.json();

    if (!contextData || typeof contextData !== "string") {
      return Response.json({ error: "No context data provided" }, { status: 400 });
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
    return Response.json({ error: "Computation failed" }, { status: 500 });
  }
}
