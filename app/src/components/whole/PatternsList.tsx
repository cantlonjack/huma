"use client";

import { memo } from "react";
import type { Pattern } from "@/types/v2";

interface PatternsListProps {
  patterns: Pattern[];
}

function PatternRow({ pattern }: { pattern: Pattern }) {
  const progress = pattern.validationTarget > 0
    ? Math.round((pattern.validationCount / pattern.validationTarget) * 100)
    : 0;

  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="font-serif text-[15px] text-earth-700 leading-snug m-0 truncate flex-1 min-w-0">
          {pattern.name}
        </p>
        {pattern.status === "validated" && (
          <span className="font-sans text-[10px] font-medium text-sage-500 bg-[#EDF3ED] rounded-full px-2 py-0.5 shrink-0">
            Validated
          </span>
        )}
      </div>

      {pattern.trigger && (
        <p className="font-sans text-[12px] text-sage-400 mt-0.5 m-0">
          Trigger: {pattern.trigger}
        </p>
      )}

      {/* Validation progress bar */}
      {pattern.status === "working" && pattern.validationTarget > 0 && (
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex-1 h-1 bg-sand-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage-400 rounded-full transition-[width] duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <span className="font-sans text-[10px] text-sage-300 shrink-0">
            {pattern.validationCount}/{pattern.validationTarget}
          </span>
        </div>
      )}
    </div>
  );
}

const MemoizedPatternRow = memo(PatternRow);

export default function PatternsList({ patterns }: PatternsListProps) {
  // Only show validated and working patterns
  const validated = patterns.filter((p) => p.status === "validated");
  const working = patterns.filter((p) => p.status === "working");

  if (validated.length === 0 && working.length === 0) return null;

  return (
    <div className="px-5">
      <h2 className="font-sans font-medium text-[11px] tracking-[0.14em] uppercase text-sage-400 mb-2 m-0">
        {validated.length > 0 ? "Your Operating System" : "Patterns"}
      </h2>

      {validated.length > 0 && (
        <div className="divide-y divide-sand-200">
          {validated.map((p) => (
            <MemoizedPatternRow key={p.id} pattern={p} />
          ))}
        </div>
      )}

      {working.length > 0 && (
        <>
          {validated.length > 0 && (
            <p className="font-sans text-[10px] tracking-[0.1em] uppercase text-sage-300 mt-3 mb-1">
              In Progress
            </p>
          )}
          <div className="divide-y divide-sand-200">
            {working.map((p) => (
              <MemoizedPatternRow key={p.id} pattern={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
