"use client";

import { useState } from "react";
import type { SheetEntry } from "@/types/v2";
import { ConnectionThreads, dimensionKeysFromLabels } from "@/components/shared/ConnectionThreads";

export function CompiledEntryRow({
  entry,
  isChecked,
  isTrigger,
  onToggle,
}: {
  entry: SheetEntry;
  isChecked: boolean;
  isTrigger: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasDetail = entry.detail && typeof entry.detail === "string" && entry.detail.length > 0;

  return (
    <div
      className={`transition-[background] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${isTrigger ? "border-l-[3px] border-l-amber-600 bg-sand-100 rounded-r-lg p-5" : "border-l-[3px] border-l-transparent bg-transparent py-[18px] pr-5 pl-[23px]"}`}
    >
      {/* Tap row */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
        className="w-full text-left cursor-pointer"
      >
        {/* Headline */}
        <span
          className={`block font-serif leading-tight transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isTrigger ? "text-[19px] font-semibold" : "text-[17px] font-medium"} ${isChecked ? "text-ink-200 line-through decoration-ink-200 decoration-1" : (isTrigger ? "text-ink-900" : "text-ink-800")}`}
        >
          {entry.headline || entry.behaviorText}
        </span>

        {/* Detail preview */}
        {hasDetail && !isChecked && (
          <p
            className="font-sans text-sm leading-normal text-ink-500 mt-1 overflow-hidden transition-[max-height] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ maxHeight: expanded ? "200px" : "1.5em" }}
          >
            {entry.detail as string}
          </p>
        )}

        {/* Expand hint */}
        {hasDetail && !expanded && !isChecked && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); setExpanded(true); } }}
            className="block cursor-pointer pt-1"
          >
            <span className="font-sans text-xs text-ink-300">
              more &darr;
            </span>
          </span>
        )}

        {/* Dimension threads */}
        {entry.dimensions && entry.dimensions.length > 0 && !isChecked && (
          <div className="mt-1.5">
            <ConnectionThreads
              activeDimensions={dimensionKeysFromLabels(entry.dimensions)}
              size="micro"
            />
          </div>
        )}
      </div>
    </div>
  );
}
