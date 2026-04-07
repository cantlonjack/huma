"use client";

import { memo } from "react";

interface CompletionStatsProps {
  checked: number;
  total: number;
  dayCount: number;
}

/**
 * Day 1-3: Simple completion stats + preview of what patterns look like.
 * "You checked off 3/5 behaviors today."
 * Plus a sample card showing what patterns look like when they form.
 */
const CompletionStats = memo(function CompletionStats({
  checked,
  total,
  dayCount,
}: CompletionStatsProps) {
  const hasActivity = total > 0;

  return (
    <div className="px-4">
      {/* Today's stats */}
      <div className="bg-white border border-sand-300 rounded-2xl px-4 py-5 mb-5">
        {hasActivity ? (
          <>
            <p className="font-serif text-sage-700 text-xl leading-[1.3]">
              {checked} of {total} behavior{total !== 1 ? "s" : ""} today.
            </p>
            {checked > 0 && (
              <p className="font-sans text-sage-400 text-[13px] mt-1.5 leading-[1.4]">
                {dayCount === 1
                  ? "First day. Every check builds the picture."
                  : `Day ${dayCount}. Keep going — the picture is forming.`}
              </p>
            )}
            {checked === 0 && (
              <p className="font-sans text-sage-400 text-[13px] mt-1.5 leading-[1.4]">
                Nothing checked yet. Your production sheet is on the Today tab.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="font-serif text-sage-700 text-xl leading-[1.3]">
              Day {dayCount}.
            </p>
            <p className="font-sans text-sage-400 text-[13px] mt-1.5 leading-[1.4]">
              Check off behaviors on the Today tab. HUMA watches what sticks.
            </p>
          </>
        )}
      </div>

      {/* Pattern preview — what this page will look like */}
      <div className="bg-sand-100 border border-sand-200 rounded-2xl px-4 py-5">
        <p className="font-sans text-[9px] font-semibold tracking-[0.18em] uppercase text-sage-300 mb-3">
          WHAT PATTERNS LOOK LIKE
        </p>

        {/* Sample pattern card — clearly labeled as example */}
        <div className="bg-white border border-sand-300 rounded-xl px-3.5 py-3 mb-3 opacity-60">
          <div className="flex justify-between items-center mb-2">
            <span className="font-serif text-sage-600 text-[15px] italic">
              Morning lever
            </span>
            <span className="font-sans text-[10px] font-semibold tracking-[0.08em] px-2 py-[2px] rounded-[8px] uppercase bg-sage-100 text-sage-700">
              Validated
            </span>
          </div>
          <div className="mb-2">
            <span className="font-sans text-[9px] font-semibold tracking-[0.18em] text-amber-600 block mb-0.5">
              THE DECISION
            </span>
            <span className="font-sans text-[13px] text-sage-600">
              Run before 7am
            </span>
          </div>
          <div className="mb-2">
            <span className="font-sans text-[9px] font-semibold tracking-[0.18em] text-sage-300 block mb-1">
              GOLDEN PATHWAY
            </span>
            <div className="flex flex-col gap-1">
              {["Shower", "Journal for 10 min"].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-sage-300 shrink-0" />
                  <span className="font-sans text-sage-500 text-[12px]">{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-1 rounded-sm bg-sand-200 overflow-hidden mt-2.5">
            <div className="h-full rounded-sm bg-sage-700 w-[82%]" />
          </div>
          <p className="font-sans text-[10px] text-sage-400 mt-1">
            18 of 22 days
          </p>
        </div>

        <p className="font-serif text-[14px] italic text-sage-500 leading-[1.4]">
          After a week, HUMA will show you which behaviors naturally go together.
        </p>
      </div>
    </div>
  );
});

export default CompletionStats;
