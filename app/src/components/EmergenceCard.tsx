"use client";

import { useState } from "react";
import type { EmergingBehavior, DimensionKey } from "@/types/v2";
import { DIMENSION_COLORS, DIMENSION_LABELS } from "@/types/v2";

interface EmergenceCardProps {
  behaviors: EmergingBehavior[];
  onFormalize: (behavior: EmergingBehavior, name: string) => void;
  onDismiss: (behaviorKey: string) => void;
}

export default function EmergenceCard({
  behaviors,
  onFormalize,
  onDismiss,
}: EmergenceCardProps) {
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [formalizingKey, setFormalizingKey] = useState<string | null>(null);
  const [patternName, setPatternName] = useState("");

  if (behaviors.length === 0) return null;

  return (
    <div className="mb-8">
      {/* Section header — italic Cormorant Garamond on sand-100 */}
      <div className="bg-sand-100 rounded-[10px] px-4 py-3 mb-4">
        <p className="font-serif text-[17px] italic text-sage-500 leading-[1.3]">
          Something forming&hellip;
        </p>
      </div>

      {behaviors.map((b) => {
        const isRevealed = revealedKey === b.behaviorKey;
        const isFormalizing = formalizingKey === b.behaviorKey;

        return (
          <div
            key={b.behaviorKey}
            className="bg-sand-100 border border-sand-200 rounded-xl mb-2 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          >
            {/* Collapsed: mysterious teaser */}
            <button
              onClick={() => setRevealedKey(isRevealed ? null : b.behaviorKey)}
              className="cursor-pointer w-full flex items-center justify-between px-4 py-3.5 bg-transparent border-none text-left"
            >
              <div className="flex-1">
                <p className="font-serif text-[15px] italic text-sage-700 leading-[1.3]">
                  {isRevealed ? b.behaviorName : "A pattern is forming"}
                </p>
                {!isRevealed && (
                  <p className="font-sans text-xs text-sage-400 mt-0.5">
                    {b.completedDays} of {b.totalDays} days
                  </p>
                )}
              </div>
              {/* Chevron */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={`shrink-0 ml-2 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isRevealed ? "rotate-180" : "rotate-0"}`}
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="var(--color-sage-400)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Revealed: behavior details + formalize/dismiss */}
            {isRevealed && (
              <div className="px-4 pb-3.5 animate-[emergenceReveal_300ms_cubic-bezier(0.22,1,0.36,1)]">
                {/* Consistency bar */}
                <div className="mb-2.5">
                  <div className="h-1 rounded-sm bg-sand-200 overflow-hidden">
                    <div
                      className="h-full rounded-sm bg-sage-400 transition-[width] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{ width: `${Math.round((b.completedDays / b.totalDays) * 100)}%` }}
                    />
                  </div>
                  <p className="font-sans text-[11px] text-sage-400 mt-1">
                    {b.completedDays} of {b.totalDays} days — consistent enough to name
                  </p>
                </div>

                {/* Dimensions touched */}
                {b.dimensions.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {b.dimensions.map((dim: DimensionKey) => (
                      <span
                        key={dim}
                        className="font-sans text-[10px] font-semibold tracking-[0.06em] uppercase rounded-sm px-1.5 py-0.5"
                        style={{
                          color: DIMENSION_COLORS[dim],
                          background: `${DIMENSION_COLORS[dim]}18`,
                        }}
                      >
                        {DIMENSION_LABELS[dim]}
                      </span>
                    ))}
                  </div>
                )}

                {/* Formalize input */}
                {isFormalizing ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={patternName}
                      onChange={(e) => setPatternName(e.target.value)}
                      placeholder="Name this pattern"
                      autoFocus
                      className="font-serif flex-1 text-sm italic px-3 py-2 border border-sand-300 rounded-lg bg-white text-sage-700 outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && patternName.trim()) {
                          onFormalize(b, patternName.trim());
                          setFormalizingKey(null);
                          setRevealedKey(null);
                          setPatternName("");
                        }
                        if (e.key === "Escape") {
                          setFormalizingKey(null);
                          setPatternName("");
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (patternName.trim()) {
                          onFormalize(b, patternName.trim());
                          setFormalizingKey(null);
                          setRevealedKey(null);
                          setPatternName("");
                        }
                      }}
                      disabled={!patternName.trim()}
                      className={`font-sans cursor-pointer text-[13px] font-semibold border-none rounded-lg px-3.5 py-2 transition-all duration-200 ${patternName.trim() ? "text-white bg-sage-700" : "text-sage-300 bg-sand-200"}`}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setFormalizingKey(b.behaviorKey);
                        setPatternName("");
                      }}
                      className="font-sans cursor-pointer text-[13px] font-semibold text-sage-700 bg-white border border-sand-300 rounded-lg px-3.5 py-2"
                    >
                      Name it
                    </button>
                    <button
                      onClick={() => {
                        onDismiss(b.behaviorKey);
                        setRevealedKey(null);
                      }}
                      className="font-sans cursor-pointer text-[13px] text-sage-400 bg-transparent border-none px-2.5 py-2"
                    >
                      Not yet
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        @keyframes emergenceReveal {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
