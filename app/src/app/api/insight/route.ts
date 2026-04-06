import Anthropic from "@anthropic-ai/sdk";
import { serviceUnavailable, internalError } from "@/lib/api-error";
import { insightSchema, type InsightRequest } from "@/lib/schemas";
import { parseBody } from "@/lib/schemas/parse";

interface BehaviorEntry {
  date: string;
  behaviorKey: string;
  aspirationId: string;
  checked: boolean;
}

interface BehaviorMeta {
  key: string;
  text: string;
  aspirationId: string;
  aspirationText: string;
  dimensions: string[];
}

interface CorrelationResult {
  behaviorA: BehaviorMeta;
  behaviorB: BehaviorMeta;
  bothDonePercent: number;
  aDoneWithoutB: number;
  dataPoints: number;
}

function computeCorrelations(
  entries: BehaviorEntry[],
  behaviorMeta: BehaviorMeta[]
): CorrelationResult[] {
  // Group entries by date
  const byDate = new Map<string, Map<string, boolean>>();
  for (const entry of entries) {
    if (!byDate.has(entry.date)) byDate.set(entry.date, new Map());
    byDate.get(entry.date)!.set(entry.behaviorKey, entry.checked);
  }

  if (byDate.size < 5) return [];

  const results: CorrelationResult[] = [];
  const metaMap = new Map(behaviorMeta.map(m => [m.key, m]));

  // Get unique behavior keys
  const allKeys = [...new Set(entries.map(e => e.behaviorKey))];

  // Compute pairwise correlations for behaviors from DIFFERENT aspirations
  for (let i = 0; i < allKeys.length; i++) {
    for (let j = i + 1; j < allKeys.length; j++) {
      const keyA = allKeys[i];
      const keyB = allKeys[j];
      const metaA = metaMap.get(keyA);
      const metaB = metaMap.get(keyB);

      if (!metaA || !metaB) continue;
      // Only cross-aspiration correlations are interesting
      if (metaA.aspirationId === metaB.aspirationId) continue;

      let bothDone = 0;
      let aDoneOnly = 0;
      let daysWithBoth = 0;

      for (const [, dayBehaviors] of byDate) {
        const aExists = dayBehaviors.has(keyA);
        const bExists = dayBehaviors.has(keyB);
        if (!aExists || !bExists) continue;

        daysWithBoth++;
        const aDone = dayBehaviors.get(keyA)!;
        const bDone = dayBehaviors.get(keyB)!;

        if (aDone && bDone) bothDone++;
        if (aDone && !bDone) aDoneOnly++;
      }

      if (daysWithBoth < 5) continue;

      const aDoneTotal = bothDone + aDoneOnly;
      if (aDoneTotal === 0) continue;

      const bothDonePercent = bothDone / aDoneTotal;
      const bDoneWhenANot = daysWithBoth - aDoneTotal > 0
        ? (daysWithBoth - aDoneTotal - aDoneOnly) / (daysWithBoth - aDoneTotal)
        : 0;

      // Only strong correlations (>0.7)
      if (bothDonePercent > 0.7 && bothDonePercent - bDoneWhenANot > 0.3) {
        results.push({
          behaviorA: metaA,
          behaviorB: metaB,
          bothDonePercent: Math.round(bothDonePercent * 100),
          aDoneWithoutB: Math.round(bDoneWhenANot * 100),
          dataPoints: daysWithBoth,
        });
      }
    }
  }

  // Sort by correlation strength
  results.sort((a, b) => b.bothDonePercent - a.bothDonePercent);
  return results;
}

const INSIGHT_PROMPT = `You are generating an insight for {name}.

Here is a behavioral correlation I found:
- Behavior A: {behavior_a} (from aspiration: "{aspiration_a}", touches: {dimensions_a})
- Behavior B: {behavior_b} (from aspiration: "{aspiration_b}", touches: {dimensions_b})
- Correlation: On days {name} did A, they did B {percent}% of the time ({n} days).
  On days they didn't do A, they did B {other_percent}% of the time.

Generate a 3-sentence insight:
1. The specific observation (what the data shows)
2. The connection (why these are linked — infer from context, not just dimensions)
3. The implication (what this means for their life, without prescribing)

Voice: fence-post neighbor. Direct. Specific. No therapy-speak. No "I notice that..." Just state what you see.
Return ONLY the 3-sentence insight text. Nothing else.`;

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return serviceUnavailable();
  }

  const parsed = await parseBody(request, insightSchema);
  if (parsed.error) return parsed.error;
  const { name, entries, behaviorMeta } = parsed.data;

  if (entries.length === 0 || behaviorMeta.length === 0) {
    return Response.json({ insight: null });
  }

  const correlations = computeCorrelations(entries, behaviorMeta);

  if (correlations.length === 0) {
    return Response.json({ insight: null });
  }

  // Take the strongest correlation
  const strongest = correlations[0];

  const prompt = INSIGHT_PROMPT
    .replace(/\{name\}/g, name)
    .replace("{behavior_a}", strongest.behaviorA.text)
    .replace("{aspiration_a}", strongest.behaviorA.aspirationText)
    .replace("{dimensions_a}", strongest.behaviorA.dimensions.join(", "))
    .replace("{behavior_b}", strongest.behaviorB.text)
    .replace("{aspiration_b}", strongest.behaviorB.aspirationText)
    .replace("{dimensions_b}", strongest.behaviorB.dimensions.join(", "))
    .replace("{percent}", String(strongest.bothDonePercent))
    .replace("{n}", String(strongest.dataPoints))
    .replace("{other_percent}", String(strongest.aDoneWithoutB));

  try {
    const anthropic = new Anthropic();

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: "You generate behavioral insights. Return ONLY the insight text — 3 sentences, no formatting, no preamble.",
      messages: [{ role: "user", content: prompt }],
    });

    const insightText = response.content[0].type === "text" ? response.content[0].text.trim() : "";

    return Response.json({
      insight: {
        text: insightText,
        dimensionsInvolved: [
          ...new Set([
            ...strongest.behaviorA.dimensions,
            ...strongest.behaviorB.dimensions,
          ]),
        ],
        behaviorsInvolved: [strongest.behaviorA.key, strongest.behaviorB.key],
        dataBasis: {
          correlation: strongest.bothDonePercent / 100,
          dataPoints: strongest.dataPoints,
          pattern: `On days with ${strongest.behaviorA.text}, ${strongest.behaviorB.text} happened ${strongest.bothDonePercent}% of the time`,
        },
      },
    });
  } catch (err) {
    console.error("Insight generation error:", err);
    return internalError("Failed to generate insight.");
  }
}
