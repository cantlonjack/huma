import type { SupabaseClient } from "@supabase/supabase-js";
import type { Aspiration, Insight } from "@/types/v2";

// ─── Insights ────────────────────────────────────────────────────────────────

export async function saveInsight(
  supabase: SupabaseClient,
  userId: string,
  insight: Insight
) {
  const { error } = await supabase.from("insights").insert({
    id: insight.id,
    user_id: userId,
    insight_text: insight.text,
    dimensions_involved: insight.dimensionsInvolved,
    behaviors_involved: insight.behaviorsInvolved,
    data_basis: insight.dataBasis,
    delivered: insight.delivered ?? false,
    ...(insight.deliveredAt ? { delivered_at: insight.deliveredAt } : {}),
  });

  if (error) throw error;
}

export async function getUndeliveredInsight(
  supabase: SupabaseClient,
  userId: string
): Promise<Insight | null> {
  const { data } = await supabase
    .from("insights")
    .select("*")
    .eq("user_id", userId)
    .eq("delivered", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) return null;

  return {
    id: data.id,
    text: data.insight_text,
    dimensionsInvolved: data.dimensions_involved as Insight["dimensionsInvolved"],
    behaviorsInvolved: data.behaviors_involved as Insight["behaviorsInvolved"],
    dataBasis: data.data_basis as Insight["dataBasis"],
    delivered: data.delivered,
    deliveredAt: data.delivered_at || undefined,
  };
}

export async function markInsightDelivered(
  supabase: SupabaseClient,
  insightId: string,
  userId: string
) {
  await supabase
    .from("insights")
    .update({ delivered: true, delivered_at: new Date().toISOString() })
    .eq("id", insightId)
    .eq("user_id", userId);
}

/** Fetch the N most recent delivered insights for annotation on the Whole page. */
export async function getRecentInsights(
  supabase: SupabaseClient,
  userId: string,
  limit = 3,
): Promise<Insight[]> {
  const { data } = await supabase
    .from("insights")
    .select("*")
    .eq("user_id", userId)
    .eq("delivered", true)
    .order("delivered_at", { ascending: false })
    .limit(limit);

  if (!data || data.length === 0) return [];

  return data.map((row) => ({
    id: row.id,
    text: row.insight_text,
    dimensionsInvolved: row.dimensions_involved as Insight["dimensionsInvolved"],
    behaviorsInvolved: row.behaviors_involved as Insight["behaviorsInvolved"],
    dataBasis: row.data_basis as Insight["dataBasis"],
    delivered: row.delivered,
    deliveredAt: row.delivered_at || undefined,
  }));
}

// ─── Structural Insight (Day 1) ─────────────────────────────────────────────

const DIMENSION_LABEL_MAP: Record<string, string> = {
  living: "Body", body: "Body",
  social: "People", people: "People",
  financial: "Money", money: "Money",
  material: "Home", home: "Home",
  intellectual: "Growth", growth: "Growth",
  experiential: "Joy", joy: "Joy",
  spiritual: "Purpose", purpose: "Purpose",
  cultural: "Identity", identity: "Identity",
};

export function computeStructuralInsight(aspirations: Aspiration[], whyStatement?: string | null): Insight | null {
  const allBehaviors = aspirations.flatMap(a =>
    a.behaviors.map(b => ({
      ...b,
      aspirationName: a.clarifiedText || a.rawText,
      aspirationId: a.id,
    }))
  );

  if (allBehaviors.length === 0) return null;

  // ─── WHY alignment check ──────────────────────────────────────────────
  if (whyStatement && whyStatement.trim().length > 0) {
    const whyWords = whyStatement.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const dimensionKeywords: Record<string, string[]> = {
      body: ["body", "health", "physical", "move", "movement", "energy", "sleep", "strength"],
      people: ["people", "family", "friend", "community", "relationship", "connect", "love", "together"],
      money: ["money", "income", "financial", "earn", "wealth", "business", "work", "career"],
      home: ["home", "space", "land", "garden", "place", "environment", "house", "property"],
      growth: ["growth", "learn", "skill", "knowledge", "develop", "create", "build", "improve"],
      joy: ["joy", "play", "creative", "beauty", "music", "enjoy", "pleasure", "adventure"],
      purpose: ["purpose", "meaning", "serve", "contribute", "impact", "mission", "calling"],
      identity: ["identity", "culture", "heritage", "tradition", "values", "belief", "spirit", "soul"],
    };

    // Find which dimensions the WHY statement implies
    const whyDimensions = new Set<string>();
    for (const [dim, keywords] of Object.entries(dimensionKeywords)) {
      if (whyWords.some(w => keywords.some(k => w.includes(k) || k.includes(w)))) {
        whyDimensions.add(dim);
      }
    }

    // Check if aspiration text or dimensions overlap with WHY
    const aspirationsWithWhyOverlap = aspirations.filter(a => {
      const aspText = (a.clarifiedText || a.rawText).toLowerCase();
      const aspDims = (a.dimensionsTouched || []) as string[];
      const hasTextOverlap = whyWords.some(w => aspText.includes(w));
      const hasDimOverlap = whyDimensions.size > 0 && aspDims.some(d => whyDimensions.has(d));
      return hasTextOverlap || hasDimOverlap;
    });

    const gapAspirations = aspirations.filter(a => !aspirationsWithWhyOverlap.includes(a));

    if (gapAspirations.length > 0 && aspirationsWithWhyOverlap.length > 0) {
      // WHY gap — highest priority
      const gapName = gapAspirations[0].clarifiedText || gapAspirations[0].rawText;
      return {
        id: crypto.randomUUID(),
        text: `${gapName} doesn\u2019t obviously connect to your WHY: \u201c${whyStatement}\u201d That might be fine \u2014 or it might be worth a conversation.`,
        dimensionsInvolved: [],
        behaviorsInvolved: [],
        dataBasis: { correlation: 1, dataPoints: 0, pattern: "structural-why-gap" },
        delivered: false,
      };
    }

    if (aspirationsWithWhyOverlap.length === aspirations.length && aspirations.length > 1) {
      // Full WHY alignment — second priority
      return {
        id: crypto.randomUUID(),
        text: `Everything you\u2019re building serves your WHY: \u201c${whyStatement}\u201d That\u2019s not common \u2014 most people\u2019s daily actions drift from what they say matters.`,
        dimensionsInvolved: [],
        behaviorsInvolved: [],
        dataBasis: { correlation: 1, dataPoints: 0, pattern: "structural-why-aligned" },
        delivered: false,
      };
    }
  }

  // ─── Connected behavior insight (lowest priority) ─────────────────────
  // Find behavior touching most dimensions
  let maxDims = 0;
  let mostConnected: (typeof allBehaviors)[0] | null = null;

  for (const b of allBehaviors) {
    const dimCount = (b.dimensions || []).length;
    if (dimCount > maxDims) {
      maxDims = dimCount;
      mostConnected = b;
    }
  }

  // Find shared behaviors across aspirations
  const behaviorsByText = new Map<string, Set<string>>();
  for (const b of allBehaviors) {
    const key = b.text.toLowerCase().trim();
    if (!behaviorsByText.has(key)) behaviorsByText.set(key, new Set());
    behaviorsByText.get(key)!.add(b.aspirationName);
  }
  const shared = [...behaviorsByText.entries()].filter(([, asps]) => asps.size > 1);

  if (!mostConnected) return null;

  const dims = (mostConnected.dimensions || [])
    .map(d => {
      const key = typeof d === "string" ? d : d.dimension;
      return DIMENSION_LABEL_MAP[key] || key;
    })
    .filter(Boolean);

  let text: string;
  if (shared.length > 0) {
    const [, sharedAsps] = shared[0];
    const aspNames = [...sharedAsps].join(" and ");
    text = `${mostConnected.text} serves both ${aspNames}. It touches ${dims.join(", ")} \u2014 ${maxDims} of your 8 dimensions. That\u2019s the most connected behavior in your system.`;
  } else {
    text = `${mostConnected.text} touches ${dims.join(", ")} \u2014 ${maxDims} of your 8 dimensions from one behavior. That\u2019s your most connected move.`;
  }

  return {
    id: crypto.randomUUID(),
    text,
    dimensionsInvolved: (mostConnected.dimensions || []).map(d =>
      typeof d === "string" ? d : d.dimension
    ) as Insight["dimensionsInvolved"],
    behaviorsInvolved: [mostConnected.key || mostConnected.text],
    dataBasis: {
      correlation: 1,
      dataPoints: 0,
      pattern: "structural",
    },
    delivered: false,
  };
}
