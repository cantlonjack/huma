"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import WholeVisualization from "../WholeVisualization";
import type { LotusState } from "@/types/lotus";

const HUMA_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ScreenProps {
  state: LotusState;
  onNext: () => void;
}

export default function WholeTransitionScreen({ state, onNext }: ScreenProps) {
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
      className="flex flex-col items-center justify-center min-h-[400px] cursor-pointer"
      onClick={onNext}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onNext();
      }}
      aria-label="WHOLE phase transition — tap to continue"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: HUMA_EASE }}
      >
        <WholeVisualization
          params={state.wholeParams}
          phase={3}
          size={340}
        />
      </motion.div>
    </div>
  );
}
