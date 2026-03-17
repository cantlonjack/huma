import type { CapitalScore } from "@/engine/canvas-types";

interface CapitalConstellationProps {
  profile: CapitalScore[];
}

const CAPITAL_ORDER = [
  "financial", "material", "living", "social",
  "intellectual", "experiential", "spiritual", "cultural",
] as const;

function scoreToRadius(score: number): number {
  // Map 1-5 to radius 8-24
  return 8 + (score - 1) * 4;
}

function scoreToOpacity(score: number): number {
  return 0.4 + (score - 1) * 0.15;
}

export default function CapitalConstellation({ profile }: CapitalConstellationProps) {
  const sorted = CAPITAL_ORDER.map(
    (form) => profile.find((p) => p.form === form) || { form, score: 1, note: "" }
  );

  const spacing = 420 / (sorted.length + 1);

  return (
    <div className="flex justify-center my-3">
      <svg viewBox="0 0 420 110" className="w-[320px] h-auto" role="img" aria-label="Capital profile constellation">
        {sorted.map((cap, i) => {
          const cx = spacing * (i + 1);
          const cy = 45;
          const r = scoreToRadius(cap.score);
          return (
            <g key={cap.form}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="var(--color-sage-600)"
                opacity={scoreToOpacity(cap.score)}
                className="transition-all duration-1000 hover:!opacity-100"
              />
              <text
                x={cx}
                y={85}
                textAnchor="middle"
                className="font-sans text-[7px] font-medium uppercase tracking-[0.04em]"
                fill="var(--color-earth-400)"
              >
                {cap.form.charAt(0).toUpperCase() + cap.form.slice(1)}
              </text>
              <text
                x={cx}
                y={96}
                textAnchor="middle"
                className="font-sans text-[6px]"
                fill="var(--color-earth-300)"
              >
                {cap.score}/5
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
