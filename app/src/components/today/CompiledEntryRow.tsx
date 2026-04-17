"use client";

import { useState } from "react";
import type { SheetEntry } from "@/types/v2";
import { ConnectionThreads, dimensionKeysFromLabels } from "@/components/shared/ConnectionThreads";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function CompiledEntryRow({
  entry,
  isChecked,
  isKeystone,
  keystoneAccentColor,
  onToggle,
  onShowProvenance,
}: {
  entry: SheetEntry;
  isChecked: boolean;
  isKeystone: boolean;
  /** Overrides the default amber keystone accent — used to color-link the
      through-line to the row it references. */
  keystoneAccentColor?: string | null;
  onToggle: () => void;
  onShowProvenance?: (entry: SheetEntry) => void;
}) {
  const [justChecked, setJustChecked] = useState(false);
  const reducedMotion = useReducedMotion();
  const hasDetail = entry.detail && typeof entry.detail === "string" && entry.detail.length > 0;
  const dims = entry.dimensions ? dimensionKeysFromLabels(entry.dimensions) : [];

  const handleToggle = () => {
    if (!isChecked) {
      setJustChecked(true);
      if (!reducedMotion) {
        setTimeout(() => setJustChecked(false), 500);
      } else {
        setJustChecked(false);
      }
    }
    onToggle();
  };

  return (
    <div
      className={`relative transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isChecked ? "opacity-60" : "opacity-100"}`}
    >
      {/* Keystone left accent — threads the color from the through-line
          into the row the through-line points at. */}
      {isKeystone && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full"
          style={{
            backgroundColor: keystoneAccentColor ?? "rgba(245, 158, 11, 0.6)",
          }}
        />
      )}

      <div className={`flex items-start gap-3 ${isKeystone ? "pl-4" : "pl-0"}`}>
        {/* Custom circle checkbox */}
        <button
          onClick={handleToggle}
          className="flex-shrink-0 mt-[5px] cursor-pointer bg-transparent border-none p-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={isChecked ? "Uncheck" : "Check"}
          role="checkbox"
          aria-checked={isChecked}
        >
          <div
            className={`size-5 rounded-full border-[1.5px] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] flex items-center justify-center ${
              isChecked
                ? "bg-sage-700 border-sage-700"
                : "bg-transparent border-sage-300 hover:border-sage-500"
            } ${justChecked && !reducedMotion ? "animate-dim-glow" : ""}`}
          >
            {isChecked && (
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                <path d="M1 4.5L4 7.5L10 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-[10px]">
          {/* Keystone label */}
          {isKeystone && !isChecked && (
            <span className="block font-sans text-[9px] font-semibold tracking-[0.22em] text-amber-600 mb-1 uppercase">
              Your keystone
            </span>
          )}

          {/* Headline — Cormorant, serif */}
          <span
            className={`block font-serif leading-snug transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isKeystone ? "text-[19px] font-semibold" : "text-[17px] font-medium"
            } ${
              isChecked
                ? "text-ink-300 line-through decoration-ink-300 decoration-1"
                : "text-ink-900"
            }`}
          >
            {entry.headline || entry.behaviorText}
          </span>

          {/* Because — WHY this matters, visible by default */}
          {entry.because && (
            <p
              className={`font-serif italic text-[13.5px] leading-relaxed mt-1.5 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isChecked ? "text-ink-300" : "text-earth-500"
              }`}
            >
              {entry.because}
            </p>
          )}

          {/* Pattern note — conscious pattern reference */}
          {entry.patternNote && (
            <p
              className={`font-sans text-[12px] leading-relaxed mt-1 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isChecked ? "text-ink-300" : "text-sage-500"
              }`}
            >
              ↻ {entry.patternNote}
            </p>
          )}

          {/* Detail — the how-to, shown on tap */}
          {hasDetail && (
            <p
              className={`font-sans text-sm leading-relaxed mt-1 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isChecked ? "text-ink-300" : "text-ink-500"
              }`}
            >
              {entry.detail as string}
            </p>
          )}
        </div>

        {/* Badge ConnectionThreads — float right */}
        {dims.length > 0 && (
          <div className={`flex-shrink-0 mt-[10px] transition-opacity duration-300 ${isChecked ? "opacity-40" : "opacity-100"}`}>
            <ConnectionThreads
              activeDimensions={dims}
              size="badge"
              animate={!reducedMotion && !isChecked}
            />
          </div>
        )}

        {/* RPPL provenance affordance */}
        {onShowProvenance && (
          <button
            onClick={(e) => { e.stopPropagation(); onShowProvenance(entry); }}
            className="flex-shrink-0 mt-[10px] cursor-pointer bg-transparent border border-sand-300 rounded-full size-5 p-0 flex items-center justify-center text-sage-400 hover:text-sage-600 hover:border-sage-300 transition-colors duration-150"
            aria-label="Where does this come from?"
            title="Where does this come from?"
          >
            <span className="font-sans text-[10px] font-semibold leading-none">?</span>
          </button>
        )}
      </div>
    </div>
  );
}
