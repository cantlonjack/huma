"use client";

import { memo } from "react";
import { DIMENSION_LABELS, type DimensionKey } from "@/types/v2";

export const CapitalPulse = memo(function CapitalPulse({
  movedDimensions,
  dormantDimension,
  dormantDays,
}: {
  movedDimensions: DimensionKey[];
  dormantDimension?: { key: DimensionKey; days: number } | null;
  dormantDays?: number;
}) {
  if (movedDimensions.length === 0) return null;

  const movedLabels = movedDimensions.map(d => DIMENSION_LABELS[d]);

  // Format: "Today moved Body and Money."
  let movedStr: string;
  if (movedLabels.length === 1) {
    movedStr = `Today moved ${movedLabels[0]}.`;
  } else if (movedLabels.length === 2) {
    movedStr = `Today moved ${movedLabels[0]} and ${movedLabels[1]}.`;
  } else {
    const last = movedLabels.pop();
    movedStr = `Today moved ${movedLabels.join(", ")}, and ${last}.`;
  }

  // Optional dormant callout
  let dormantStr = "";
  if (dormantDimension) {
    const label = DIMENSION_LABELS[dormantDimension.key];
    dormantStr = ` ${label} hasn\u2019t been touched in ${dormantDimension.days} days.`;
  }

  return (
    <div className="px-5 py-3 mx-4 mt-2 mb-1 bg-sand-100 rounded-lg">
      <p className="font-sans text-[13px] text-sage-500 leading-normal">
        <span>{movedStr}</span>
        {dormantStr && (
          <span className="text-ink-400">{dormantStr}</span>
        )}
      </p>
    </div>
  );
});
