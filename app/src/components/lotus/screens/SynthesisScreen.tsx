"use client";

import { useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { computeArchetype } from "@/engine/archetype";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { CAPITAL_LABELS, CAPITAL_COLORS } from "@/types/lotus";
import type { LotusState, LotusAction, CapitalKey, LotusScreen } from "@/types/lotus";
import { HUMA_EASE } from "@/lib/constants";

const STAGE_ICONS: Record<string, string> = {
  starting: "\u{1F331}",
  transition: "\u{1F343}",
  building: "\u{1F333}",
  searching: "\u{1F50D}",
};

const STAGE_LABELS: Record<string, string> = {
  starting: "Starting",
  transition: "In transition",
  building: "Building",
  searching: "Searching",
};

interface ScreenProps {
  state: LotusState;
  dispatch: React.Dispatch<LotusAction>;
  onNext: () => void;
}

export default function SynthesisScreen({ state, dispatch, onNext }: ScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const name = state.context.name || "friend";
  const stage = state.context.stage || "starting";
  const capitals = state.context.capitals!;

  const result = useMemo(
    () => computeArchetype(capitals, stage),
    [capitals, stage]
  );

  // Auto-focus "That's right" button
  useEffect(() => {
    const t = setTimeout(() => confirmRef.current?.focus(), 600);
    return () => clearTimeout(t);
  }, []);

  function handleConfirm() {
    dispatch({
      type: "SET_SYNTHESIS",
      archetype: result.archetype,
      archetypeDescription: result.description,
      strengths: result.strengths,
      growthAreas: result.growthAreas,
    });
    onNext();
  }

  function handleAdjust() {
    dispatch({ type: "GO_TO_SCREEN", screen: 7 as LotusScreen });
  }

  const stagger = prefersReducedMotion ? 0 : 1;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-8 text-center">
      {/* Screen reader: announce archetype */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        Your archetype is {result.archetype}
      </div>

      {/* Header */}
      <motion.p
        className="text-lg md:text-xl text-[#3D3830]"
        style={{ fontFamily: "var(--font-cormorant)" }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: HUMA_EASE, delay: 0.1 * stagger }}
      >
        Here&rsquo;s what I see, {name}.
      </motion.p>

      {/* Archetype */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: HUMA_EASE, delay: 0.3 * stagger }}
      >
        <h2
          className="text-2xl md:text-3xl text-[#3A5A40] font-medium"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          {result.archetype}
        </h2>
        <p
          className="text-sm text-[#6B6358] mt-1 max-w-[360px]"
          style={{ fontFamily: "var(--font-source-sans)" }}
        >
          {result.description}
        </p>
      </motion.div>

      {/* Stage */}
      <motion.div
        className="flex items-center gap-2 text-[#6B6358]"
        style={{ fontFamily: "var(--font-source-sans)", fontSize: "0.9rem" }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: HUMA_EASE, delay: 0.4 * stagger }}
      >
        <span>{STAGE_ICONS[stage] || ""}</span>
        <span>{STAGE_LABELS[stage] || stage}</span>
      </motion.div>

      {/* Strengths */}
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: HUMA_EASE, delay: 0.5 * stagger }}
      >
        <span
          className="text-xs uppercase tracking-[0.15em] text-[#A89E90]"
          style={{ fontFamily: "var(--font-source-sans)" }}
        >
          Strongest
        </span>
        <div className="flex flex-wrap justify-center gap-2">
          {result.strengths.map((key) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F1E9] text-[#3D3830]"
              style={{ fontFamily: "var(--font-source-sans)", fontSize: "0.85rem", fontWeight: 500 }}
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: CAPITAL_COLORS[key] }}
              />
              {CAPITAL_LABELS[key]}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Growth areas */}
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: HUMA_EASE, delay: 0.6 * stagger }}
      >
        <span
          className="text-xs uppercase tracking-[0.15em] text-[#A89E90]"
          style={{ fontFamily: "var(--font-source-sans)" }}
        >
          Wanting more
        </span>
        <div className="flex flex-wrap justify-center gap-2">
          {result.growthAreas.map((key) => (
            <span
              key={key}
              className="inline-flex items-center px-3 py-1 rounded-full bg-[#F6F1E9] text-[#6B6358]"
              style={{ fontFamily: "var(--font-source-sans)", fontSize: "0.85rem", fontWeight: 500 }}
            >
              {CAPITAL_LABELS[key]}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Buttons */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 w-full sm:w-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: HUMA_EASE, delay: 0.7 * stagger }}
      >
        <button
          ref={confirmRef}
          onClick={handleConfirm}
          className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#5C7A62] text-white font-medium hover:bg-[#4A6850] transition-colors duration-300"
          style={{ fontFamily: "var(--font-source-sans)", fontSize: "0.9rem", minHeight: 48 }}
        >
          That&rsquo;s right
        </button>
        <button
          onClick={handleAdjust}
          className="w-full sm:w-auto px-8 py-3 rounded-full border border-[#6B6358] text-[#4A4236] font-medium hover:bg-[#F6F1E9] transition-colors duration-300"
          style={{ fontFamily: "var(--font-source-sans)", fontSize: "0.9rem", minHeight: 48 }}
        >
          Adjust
        </button>
      </motion.div>
    </div>
  );
}
