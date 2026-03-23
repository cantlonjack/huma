"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import WholeVisualization from "../WholeVisualization";
import type { LotusState } from "@/types/lotus";
import { HUMA_EASE } from "@/lib/constants";

interface ScreenProps {
  state: LotusState;
  onNext: () => void;
}

export default function WholeEvolvesScreen({ state, onNext }: ScreenProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance after 3s
  useEffect(() => {
    timerRef.current = setTimeout(onNext, 3000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onNext]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[400px] gap-8 cursor-pointer"
      onClick={onNext}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onNext();
      }}
      aria-label="Your WHOLE is changing — tap to continue"
    >
      <motion.p
        className="text-lg text-[#3D3830] text-center"
        style={{ fontFamily: "var(--font-cormorant)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: HUMA_EASE }}
      >
        Your WHOLE is changing.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: HUMA_EASE }}
      >
        <WholeVisualization
          params={state.wholeParams}
          phase={2}
          size={300}
        />
      </motion.div>
    </div>
  );
}
