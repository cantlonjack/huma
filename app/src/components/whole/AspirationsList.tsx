"use client";

import { memo } from "react";
import type { Aspiration } from "@/types/v2";
import { DIMENSION_COLORS } from "@/types/v2";
import { displayName } from "@/lib/display-name";
import { mapAspirationStatus } from "@/lib/whole-utils";

interface AspirationsListProps {
  aspirations: Aspiration[];
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  working: "Working",
  finding: "Finding path",
  no_path: "Someday",
  adjusting: "Adjusting",
  paused: "Paused",
  completed: "Completed",
};

function AspirationRow({ aspiration }: { aspiration: Aspiration }) {
  const status = mapAspirationStatus(aspiration);
  const name = displayName(aspiration.title || aspiration.clarifiedText || aspiration.rawText);
  const behaviorCount = aspiration.behaviors?.length || 0;
  const activeBehaviors = aspiration.behaviors?.filter((b) => b.enabled !== false).length || 0;
  const dims = aspiration.dimensionsTouched || [];

  return (
    <div className="flex items-start gap-3 py-2.5">
      {/* Status indicator */}
      <div className="mt-1 shrink-0">
        {status === "working" || status === "active" ? (
          <span className="block w-2 h-2 rounded-full bg-sage-500" />
        ) : status === "finding" ? (
          <span className="block w-2 h-2 rounded-full border border-sage-400 bg-transparent" />
        ) : (
          <span className="block w-2 h-2 rounded-full bg-sage-200" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Name */}
        <p className="font-serif text-[15px] text-earth-700 leading-snug m-0 truncate">
          {name}
        </p>

        {/* Meta line */}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-sans text-[11px] text-sage-400">
            {STATUS_LABELS[status] || status}
          </span>
          {behaviorCount > 0 && (
            <span className="font-sans text-[11px] text-sage-300">
              {activeBehaviors}/{behaviorCount} behaviors
            </span>
          )}
        </div>

        {/* Dimension dots */}
        {dims.length > 0 && (
          <div className="flex gap-1 mt-1">
            {dims.map((d) => (
              <span
                key={d}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: DIMENSION_COLORS[d as keyof typeof DIMENSION_COLORS] || "#A8C4AA" }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const MemoizedRow = memo(AspirationRow);

export default function AspirationsList({ aspirations }: AspirationsListProps) {
  const visible = aspirations.filter(
    (a) => a.status !== "archived" && a.status !== "dropped"
  );

  if (visible.length === 0) return null;

  const active = visible.filter((a) => a.status === "active" || !a.status);
  const other = visible.filter((a) => a.status && a.status !== "active");

  return (
    <div className="px-5">
      <h2 className="font-sans font-medium text-[11px] tracking-[0.14em] uppercase text-sage-400 mb-2 m-0">
        Aspirations
      </h2>
      <div className="divide-y divide-sand-200">
        {active.map((a) => (
          <MemoizedRow key={a.id} aspiration={a} />
        ))}
        {other.map((a) => (
          <MemoizedRow key={a.id} aspiration={a} />
        ))}
      </div>
    </div>
  );
}
