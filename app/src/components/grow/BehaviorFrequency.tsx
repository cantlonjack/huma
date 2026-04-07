"use client";

import { memo } from "react";

interface BehaviorFrequencyProps {
  frequencies: Array<{
    behaviorKey: string;
    behaviorName: string;
    completed: number;
    totalDays: number;
  }>;
  dayCount: number;
}

/**
 * Day 4-7: Behavior frequency display.
 * "Cooking at home: 5/5 days. Running: 2/5 days."
 * Simple, honest, no judgment.
 */
const BehaviorFrequency = memo(function BehaviorFrequency({
  frequencies,
  dayCount,
}: BehaviorFrequencyProps) {
  if (frequencies.length === 0) return null;

  return (
    <div className="px-4">
      <div className="bg-white border border-sand-300 rounded-2xl overflow-hidden mb-5">
        <div className="px-4 pt-4 pb-2">
          <p className="font-serif text-sage-700 text-xl leading-[1.3]">
            {dayCount} days in
          </p>
          <p className="font-sans text-sage-400 text-[13px] mt-1 leading-[1.4]">
            Here&rsquo;s what&rsquo;s showing up.
          </p>
        </div>

        <div className="px-4 pb-4">
          {frequencies.map((f) => {
            const pct = f.totalDays > 0
              ? Math.round((f.completed / f.totalDays) * 100)
              : 0;

            return (
              <div key={f.behaviorKey} className="py-2.5 border-b border-sand-200/80 last:border-b-0">
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="font-sans text-sage-700 text-[14px] leading-[1.3] flex-1 min-w-0 pr-3">
                    {f.behaviorName}
                  </span>
                  <span className="font-sans text-sage-400 text-[13px] tabular-nums shrink-0">
                    {f.completed}/{f.totalDays}
                  </span>
                </div>
                <div className="h-1 rounded-sm bg-sand-200 overflow-hidden">
                  <div
                    className="h-full rounded-sm transition-[width] duration-400"
                    style={{
                      width: `${pct}%`,
                      background: pct >= 80
                        ? "var(--color-sage-700)"
                        : pct >= 40
                          ? "var(--color-sage-400)"
                          : "var(--color-sage-300)",
                      transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Teaser for what's coming */}
      <div className="bg-sand-100 border border-sand-200 rounded-2xl px-4 py-4">
        <p className="font-serif text-[14px] italic text-sage-500 leading-[1.4]">
          In a few more days, HUMA will show you which of these behaviors pull each other along — and which ones you can skip without noticing.
        </p>
      </div>
    </div>
  );
});

export default BehaviorFrequency;
