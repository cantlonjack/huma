"use client";

import { useState } from "react";

export interface WhyEvolutionData {
  evolved: boolean;
  evolvedWhy?: string;
  observation?: string;
}

interface WhyEvolutionProps {
  originalWhy: string;
  evolution: WhyEvolutionData;
  onAccept: (newWhy: string) => void;
  onDismiss: () => void;
}

export default function WhyEvolution({
  originalWhy,
  evolution,
  onAccept,
  onDismiss,
}: WhyEvolutionProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !evolution.evolved || !evolution.evolvedWhy) return null;

  const handleAccept = () => {
    onAccept(evolution.evolvedWhy!);
  };

  const handleKeep = () => {
    setDismissed(true);
    onDismiss();
  };

  return (
    <div className="mx-4 relative overflow-hidden rounded-2xl bg-sand-50 border border-sand-250">
      {/* Thin sage accent line */}
      <div
        className="h-0.5"
        style={{
          background: "linear-gradient(90deg, #A8C4AA, #6B8F71)",
        }}
      />

      <div className="px-4 pt-4 pb-3.5">
        {/* Label */}
        <p className="font-sans font-medium text-[10px] tracking-[0.18em] uppercase text-sage-300 mb-2.5">
          YOUR WHY IS SHIFTING
        </p>

        {/* Observation */}
        {evolution.observation && (
          <p className="font-sans text-[13px] leading-normal text-earth-500 mb-3">
            {evolution.observation}
          </p>
        )}

        {/* Original */}
        <div className="mb-2.5">
          <p className="font-sans text-[11px] text-sage-300 mb-0.5">
            You started with
          </p>
          <p className="font-serif text-[15px] italic text-earth-400 leading-snug">
            {originalWhy}
          </p>
        </div>

        {/* Evolved */}
        <div className="mb-3.5">
          <p className="font-sans text-[11px] text-sage-450 mb-0.5">
            What you're actually building
          </p>
          <p className="font-serif text-base italic text-sage-700 leading-snug">
            {evolution.evolvedWhy}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <button
            onClick={handleAccept}
            className="font-sans font-medium cursor-pointer text-[13px] text-sand-50 bg-sage-700 border-none rounded-lg px-4 py-2 transition-opacity"
          >
            Use this
          </button>
          <button
            onClick={handleKeep}
            className="font-sans font-medium cursor-pointer text-[13px] text-sage-450 bg-transparent border border-sand-300 rounded-lg px-4 py-2 transition-opacity"
          >
            Keep mine
          </button>
        </div>
      </div>
    </div>
  );
}
