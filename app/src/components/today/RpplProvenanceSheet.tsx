"use client";

import { useEffect } from "react";
import type { Pattern } from "@/types/v2";
import { allSeeds } from "@/data/rppl-seeds";
import type { RpplSeed, RpplType } from "@/data/rppl-seeds/types";

const TYPE_LABELS: Record<RpplType, string> = {
  axiom: "Axiom",
  principle: "Principle",
  capacity: "Capacity",
  framework: "Framework",
  practice: "Practice",
};

interface RpplProvenanceSheetProps {
  open: boolean;
  onClose: () => void;
  aspirationId?: string;
  behaviorKey?: string;
  patterns: Pattern[];
  behaviorText?: string;
}

function findSeedForEntry(
  aspirationId: string | undefined,
  behaviorKey: string | undefined,
  patterns: Pattern[],
): { pattern: Pattern | null; seed: RpplSeed | null } {
  if (!aspirationId) return { pattern: null, seed: null };
  const pattern = patterns.find(
    p => p.aspirationId === aspirationId
      && (!behaviorKey || p.steps.some(s => s.behaviorKey === behaviorKey))
  ) || null;
  if (!pattern) return { pattern: null, seed: null };
  const rpplId = pattern.provenance?.rpplId;
  if (!rpplId) return { pattern, seed: null };
  const seed = allSeeds.find(s => s.rpplId === rpplId) || null;
  return { pattern, seed };
}

export default function RpplProvenanceSheet({
  open,
  onClose,
  aspirationId,
  behaviorKey,
  patterns,
  behaviorText,
}: RpplProvenanceSheetProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const { pattern, seed } = findSeedForEntry(aspirationId, behaviorKey, patterns);
  const tradition = seed?.tradition || pattern?.provenance?.sourceTradition;
  const keyReference = pattern?.provenance?.keyReference;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rppl-provenance-title"
    >
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg bg-sand-50 border-t border-sand-300 rounded-t-3xl px-5 pt-5 pb-[calc(28px+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_32px_rgba(0,0,0,0.12)]"
        style={{ animation: "confirmation-slide-up 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards" }}
      >
        <div className="flex justify-center mb-3">
          <div className="w-10 h-1 rounded-full bg-sand-250" />
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <span className="font-sans text-[10px] font-semibold tracking-[0.22em] text-sage-400 uppercase">
            Where this comes from
          </span>
          <button
            onClick={onClose}
            className="font-sans cursor-pointer bg-transparent border-none text-sage-400 text-lg leading-none p-1"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {behaviorText && (
          <p id="rppl-provenance-title" className="font-serif text-[17px] text-ink-700 leading-snug m-0 mb-3">
            {behaviorText}
          </p>
        )}

        {seed ? (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="font-sans text-[10px] font-semibold tracking-[0.12em] uppercase px-2 py-[2px] rounded-full bg-sage-100 text-sage-700">
                {TYPE_LABELS[seed.type]}
              </span>
              <span className="font-serif text-[15px] text-earth-700 font-medium">
                {seed.name}
              </span>
            </div>
            <p className="font-serif text-[14px] text-ink-600 leading-relaxed m-0">
              {seed.description}
            </p>
            {seed.axiom && (
              <p className="font-serif italic text-[13px] text-sage-600 leading-relaxed m-0 border-l-2 border-sage-300 pl-3">
                {seed.axiom}
              </p>
            )}
            {(tradition || keyReference) && (
              <div className="pt-2 border-t border-sand-200 flex flex-col gap-1">
                {tradition && (
                  <span className="font-sans text-[11px] text-sage-400">
                    Tradition: <span className="text-earth-500">{tradition}</span>
                  </span>
                )}
                {keyReference && (
                  <span className="font-sans text-[11px] text-sage-400">
                    Reference: <span className="text-earth-500">{keyReference}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        ) : pattern ? (
          <div className="flex flex-col gap-2">
            <p className="font-serif text-[14px] text-ink-600 leading-relaxed m-0">
              From your pattern{" "}
              <span className="font-medium text-ink-700">{pattern.name}</span>
              {tradition ? ` \u2014 rooted in ${tradition}` : "."}
            </p>
            {keyReference && (
              <span className="font-sans text-[11px] text-sage-400">
                Reference: <span className="text-earth-500">{keyReference}</span>
              </span>
            )}
          </div>
        ) : (
          <p className="font-sans text-[13px] text-sage-400 italic m-0">
            This action comes from your own decomposition &mdash; not linked to a library pattern yet.
          </p>
        )}
      </div>
    </div>
  );
}
