"use client";

import type { Aspiration } from "@/types/v2";
import { displayName } from "@/lib/display-name";

interface GapCardProps {
  aspiration: Aspiration;
  onPlan: (aspirationId: string) => void;
  onDismiss?: (aspirationId: string) => void;
}

export default function GapCard({ aspiration, onPlan, onDismiss }: GapCardProps) {
  const name = displayName(aspiration.title || aspiration.clarifiedText || aspiration.rawText);

  return (
    <div className="mb-3 rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 px-4 py-3.5">
      <div className="flex items-start gap-3">
        <div className="mt-1 shrink-0 w-2 h-2 rounded-full border border-amber-500 bg-transparent" />
        <div className="flex-1 min-w-0">
          <p className="font-serif text-[15px] text-earth-700 leading-snug m-0">
            You&rsquo;ve said you want to{" "}
            <span className="font-medium text-ink-800">{name}</span>
            {" "}&mdash; but there&rsquo;s no daily practice tied to it yet.
          </p>
          <div className="flex items-center gap-3 mt-2.5">
            <button
              onClick={() => onPlan(aspiration.id)}
              className="font-sans font-medium cursor-pointer text-[13px] text-amber-700 bg-transparent border border-amber-400 rounded-full px-3.5 py-1.5"
            >
              Plan this
            </button>
            {onDismiss && (
              <button
                onClick={() => onDismiss(aspiration.id)}
                className="font-sans cursor-pointer text-[12px] text-sage-400 bg-transparent border-none p-0"
              >
                Not now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface GapSectionProps {
  unconnectedAspirations: Aspiration[];
  dormantCapitalCount: number;
  onPlan: (aspirationId: string) => void;
}

export function GapSection({
  unconnectedAspirations,
  dormantCapitalCount,
  onPlan,
}: GapSectionProps) {
  if (unconnectedAspirations.length === 0 && dormantCapitalCount <= 2) return null;

  return (
    <div className="px-4 mb-6">
      <div className="mb-3">
        <h2 className="font-serif text-sage-700 text-lg font-normal m-0">
          Gaps in your pathway
        </h2>
        <p className="font-sans text-sage-400 text-[13px] leading-[1.4]">
          {unconnectedAspirations.length > 0
            ? `${unconnectedAspirations.length} aspiration${unconnectedAspirations.length === 1 ? "" : "s"} without daily practice.`
            : `${dormantCapitalCount} areas of your life aren't showing up in your daily practices yet.`}
        </p>
      </div>
      {unconnectedAspirations.map(asp => (
        <GapCard
          key={asp.id}
          aspiration={asp}
          onPlan={onPlan}
        />
      ))}
    </div>
  );
}
