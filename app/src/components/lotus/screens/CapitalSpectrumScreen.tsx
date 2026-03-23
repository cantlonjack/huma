"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import CapitalSlider from "../CapitalSlider";
import { CAPITAL_ORDER, CAPITAL_LABELS } from "@/types/lotus";
import type { LotusState, LotusAction, CapitalKey } from "@/types/lotus";
import { HUMA_EASE } from "@/lib/constants";

interface ScreenProps {
  state: LotusState;
  dispatch: React.Dispatch<LotusAction>;
  onNext: () => void;
}

export default function CapitalSpectrumScreen({ state, dispatch, onNext }: ScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const capitals = state.context.capitals!;
  const allSet = CAPITAL_ORDER.every((key) => capitals[key] > 0);

  // Auto-focus first slider segment
  useEffect(() => {
    const t = setTimeout(() => {
      const firstButton = containerRef.current?.querySelector("button");
      firstButton?.focus();
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const handleChange = useCallback(
    (key: CapitalKey, value: number) => {
      dispatch({ type: "SET_CAPITAL", key, value });
    },
    [dispatch]
  );

  return (
    <div className="flex flex-col items-center gap-6">
      <h2
        className="text-2xl md:text-3xl text-center text-[#1A1714]"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        Quick snapshot of your resources.
      </h2>

      <p
        className="text-sm text-[#6B6358] text-center"
        style={{ fontFamily: "var(--font-source-sans)" }}
      >
        This doesn&apos;t need to be exact.
      </p>

      {/* 8 capital sliders */}
      <motion.div
        ref={containerRef}
        className="w-full flex flex-col gap-3 mt-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: HUMA_EASE }}
      >
        {CAPITAL_ORDER.map((key, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: HUMA_EASE }}
          >
            <CapitalSlider
              capitalKey={key}
              label={CAPITAL_LABELS[key]}
              value={capitals[key]}
              onChange={handleChange}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Continue button — appears when all 8 are set */}
      <motion.button
        onClick={onNext}
        disabled={!allSet}
        initial={{ opacity: 0 }}
        animate={{ opacity: allSet ? 1 : 0.3 }}
        transition={{ duration: 0.3, ease: HUMA_EASE }}
        className="mt-4 px-9 py-4 rounded-full bg-[#B5621E] text-white font-medium shadow-[0_4px_20px_rgba(181,98,30,0.15)] hover:bg-[#C87A3A] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        style={{ fontFamily: "var(--font-source-sans)" }}
      >
        Continue
      </motion.button>
    </div>
  );
}
