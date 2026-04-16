"use client";

import type { RpplHealth, RpplOutputs } from "@/lib/rppl-interface";

const CAPITAL_LABELS: Record<string, string> = {
  living: "Living",
  social: "Social",
  financial: "Financial",
  material: "Material",
  intellectual: "Intellectual",
  experiential: "Experiential",
  spiritual: "Spiritual",
  cultural: "Cultural",
};

const STRENGTH_CLASSES: Record<"weak" | "moderate" | "strong", string> = {
  strong: "bg-sage-200 text-sage-700 border-sage-300",
  moderate: "bg-sage-100 text-sage-600 border-sage-200",
  weak: "bg-sand-200 text-sage-500 border-sand-300",
};

const DIRECTION_SYMBOL: Record<"builds" | "costs" | "protects", string> = {
  builds: "+",
  costs: "\u2212",
  protects: "\u25CB",
};

interface PatternHealthProps {
  health?: RpplHealth;
  outputs?: RpplOutputs;
}

export default function PatternHealth({ health, outputs }: PatternHealthProps) {
  const hasOutputs = outputs && outputs.capitalEffects.length > 0;
  if (!health && !hasOutputs) return null;

  // Deduplicate capital effects (same capital can appear multiple times)
  const effects = outputs?.capitalEffects || [];
  const seen = new Set<string>();
  const deduped = effects.filter(e => {
    const key = `${e.capital}:${e.direction}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <div className="px-4 py-2.5 border-t border-sand-200/80 flex flex-wrap items-center gap-2">
      {health && (
        <span
          className="font-sans text-[10px] font-semibold tracking-[0.12em] uppercase text-sage-500"
          title={`${health.completionRate}% completion`}
        >
          {health.status}
          {health.trend === "rising" && <span className="ml-1 text-sage-600">&uarr;</span>}
          {health.trend === "dropping" && <span className="ml-1 text-amber-600">&darr;</span>}
        </span>
      )}
      {deduped.length > 0 && (
        <>
          {health && <span className="text-sand-300">&middot;</span>}
          <span className="font-sans text-[10px] text-sage-400">Feeds</span>
          <div className="flex flex-wrap gap-1.5">
            {deduped.map((e, i) => (
              <span
                key={`${e.capital}-${e.direction}-${i}`}
                className={`inline-flex items-center gap-1 text-[10px] font-sans font-medium px-2 py-[2px] rounded-full border ${STRENGTH_CLASSES[e.strength]}`}
                title={`${e.direction} ${e.capital} (${e.strength})`}
              >
                <span className="text-[11px] leading-none">
                  {DIRECTION_SYMBOL[e.direction]}
                </span>
                {CAPITAL_LABELS[e.capital] || e.capital}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
