"use client";

import { memo } from "react";

interface Correlation {
  behaviorA: string;
  behaviorB: string;
  coRate: number;
  withoutRate: number;
}

interface CorrelationCardsProps {
  correlations: Correlation[];
  frequencies: Array<{
    behaviorKey: string;
    behaviorName: string;
    completed: number;
    totalDays: number;
  }>;
  dayCount: number;
}

/**
 * Day 7-14: Emerging correlations.
 * "When you run in the morning, you cook at home 90% of the time.
 *  When you skip running, cooking drops to 40%."
 */
const CorrelationCards = memo(function CorrelationCards({
  correlations,
  frequencies,
  dayCount,
}: CorrelationCardsProps) {
  const hasCorrelations = correlations.length > 0;
  const hasFrequencies = frequencies.length > 0;

  return (
    <div className="px-4">
      {/* Correlations — the first real insight */}
      {hasCorrelations && (
        <div className="mb-5">
          <div className="mb-3">
            <p className="font-sans text-[9px] font-semibold tracking-[0.18em] uppercase text-sage-400 mb-1">
              EMERGING CONNECTIONS
            </p>
            <p className="font-serif text-sage-700 text-xl leading-[1.3]">
              Your behaviors are talking to each other.
            </p>
          </div>

          {correlations.slice(0, 4).map((c, i) => (
            <div
              key={i}
              className="bg-white border border-sand-300 rounded-2xl px-4 py-4 mb-3"
            >
              <p className="font-serif text-sage-700 text-[15px] leading-[1.4] mb-2">
                When you {c.behaviorA.toLowerCase()}, you {c.behaviorB.toLowerCase()}{" "}
                <span className="font-semibold">{c.coRate}%</span> of the time.
              </p>
              <p className="font-sans text-sage-400 text-[13px] leading-[1.4]">
                When you skip it, that drops to {c.withoutRate}%.
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Frequency summary still visible */}
      {hasFrequencies && (
        <div className="bg-white border border-sand-300 rounded-2xl overflow-hidden mb-5">
          <div className="px-4 pt-4 pb-2">
            <p className="font-sans text-[9px] font-semibold tracking-[0.18em] uppercase text-sage-400 mb-1">
              {dayCount} DAYS
            </p>
            <p className="font-serif text-sage-700 text-lg leading-[1.3]">
              Behavior frequency
            </p>
          </div>
          <div className="px-4 pb-4">
            {frequencies.map((f) => {
              const pct = f.totalDays > 0
                ? Math.round((f.completed / f.totalDays) * 100)
                : 0;

              return (
                <div key={f.behaviorKey} className="py-2 border-b border-sand-200/80 last:border-b-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-sans text-sage-600 text-[13px] leading-[1.3] flex-1 min-w-0 pr-3">
                      {f.behaviorName}
                    </span>
                    <span className="font-sans text-sage-400 text-[12px] tabular-nums shrink-0">
                      {f.completed}/{f.totalDays}
                    </span>
                  </div>
                  <div className="h-1 rounded-sm bg-sand-200 overflow-hidden">
                    <div
                      className="h-full rounded-sm"
                      style={{
                        width: `${pct}%`,
                        background: pct >= 80
                          ? "var(--color-sage-700)"
                          : pct >= 40
                            ? "var(--color-sage-400)"
                            : "var(--color-sage-300)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* What's coming next */}
      {!hasCorrelations && (
        <div className="bg-sand-100 border border-sand-200 rounded-2xl px-4 py-4 mb-5">
          <p className="font-serif text-[14px] italic text-sage-500 leading-[1.4]">
            Not enough data for correlations yet. A few more days and HUMA will show you which behaviors pull each other along.
          </p>
        </div>
      )}

      <div className="bg-sand-100 border border-sand-200 rounded-2xl px-4 py-4">
        <p className="font-serif text-[14px] italic text-sage-500 leading-[1.4]">
          {14 - dayCount > 0
            ? `In ${14 - dayCount} more day${14 - dayCount !== 1 ? "s" : ""}, these connections become named patterns — sequences you can rely on.`
            : "These connections are becoming named patterns — sequences you can rely on."}
        </p>
      </div>
    </div>
  );
});

export default CorrelationCards;
