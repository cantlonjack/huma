"use client";

// ─── SheetPreview ────────────────────────────────────────────────────────────
// A non-committal glimpse of what tomorrow's production sheet will look like,
// shown inline during /start onboarding once enough context has been gathered.
//
// Read-only — no check-offs, no capital pulse, no keystone logic. The goal is
// time-to-value: let the user see the output format before they commit via
// DecompositionPreview / "Start tomorrow."
//
// Visual cues mirror /today CompiledEntryRow (serif headline, dimension badge)
// but the card is clearly labeled "a sample of tomorrow" and framed in sand-50
// so it reads as preview, not product.

import { memo } from "react";
import type { DimensionKey } from "@/types/v2";
import { DIMENSION_LABELS } from "@/types/v2";
import { ConnectionThreads } from "@/components/shared/ConnectionThreads";

export interface SheetPreviewEntry {
  key: string;
  text: string;
  detail?: string;
  dimensions: DimensionKey[];
}

interface SheetPreviewProps {
  entries: SheetPreviewEntry[];
  onRefresh?: () => void;
  canRefresh?: boolean;
  source?: "decomposition" | "template";
}

export const SheetPreview = memo(function SheetPreview({
  entries,
  onRefresh,
  canRefresh = true,
  source = "template",
}: SheetPreviewProps) {
  if (entries.length === 0) return null;

  // Union of all dimensions across entries — for the header spread badge.
  const allDims = Array.from(
    new Set(entries.flatMap((e) => e.dimensions))
  ) as DimensionKey[];

  const subtext =
    source === "decomposition"
      ? "Not final. We'll tune it together."
      : "Drawn from what you've shared so far.";

  return (
    <div className="my-5 mx-2 rounded-2xl border border-sand-300 bg-sand-50/80 px-5 py-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="font-sans text-[10px] font-semibold tracking-[0.22em] text-sage-500 uppercase">
            A sample of tomorrow
          </p>
          <p className="font-serif italic text-[13px] text-earth-500 mt-0.5">
            {subtext}
          </p>
        </div>
        {allDims.length > 0 && (
          <div className="flex-shrink-0 mt-0.5">
            <ConnectionThreads
              activeDimensions={allDims}
              size="compact"
              animate={false}
            />
          </div>
        )}
      </div>

      {/* Entries */}
      <ul className="flex flex-col gap-3 list-none p-0 m-0">
        {entries.map((entry) => {
          const dimLabels = entry.dimensions
            .map((d) => DIMENSION_LABELS[d])
            .filter(Boolean);

          return (
            <li key={entry.key} className="flex items-start gap-3">
              {/* Static circle — clearly non-interactive */}
              <span
                className="flex-shrink-0 mt-[6px] size-4 rounded-full border-[1.5px] border-sage-300 bg-transparent"
                aria-hidden="true"
              />

              <div className="flex-1 min-w-0">
                <span className="block font-serif text-[16px] font-medium leading-snug text-ink-800">
                  {entry.text}
                </span>

                {entry.detail && (
                  <p className="font-sans text-[13px] leading-relaxed mt-1 text-ink-500">
                    {entry.detail}
                  </p>
                )}

                {dimLabels.length > 0 && !entry.detail && (
                  <p className="font-sans text-[11px] text-earth-400 mt-1 tracking-wide">
                    Builds {dimLabels.join(" · ")}
                  </p>
                )}
              </div>

              {entry.dimensions.length > 0 && (
                <div className="flex-shrink-0 mt-[6px]">
                  <ConnectionThreads
                    activeDimensions={entry.dimensions}
                    size="badge"
                    animate={false}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-sand-200 pt-3">
        <span className="font-sans text-[11px] text-earth-400 italic">
          Preview — keep talking to shape it
        </span>
        {canRefresh && onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="font-sans text-[12px] text-sage-500 hover:text-sage-700 active:text-sage-800 transition-colors duration-150 bg-transparent border-none p-0 cursor-pointer inline-flex items-center gap-1"
            aria-label="Show a different sample"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Different sample
          </button>
        )}
      </div>
    </div>
  );
});

export default SheetPreview;
