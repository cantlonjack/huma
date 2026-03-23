"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import RegenerativeFlower from "../RegenerativeFlower";
import type { LotusState } from "@/types/lotus";

const HUMA_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ScreenProps {
  state: LotusState;
  onNext: () => void;
}

export default function FlowerScreen({ state, onNext }: ScreenProps) {
  const capitals = state.context.capitals!;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance after 4s (gives time for unfurl animation)
  useEffect(() => {
    timerRef.current = setTimeout(onNext, 4000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onNext]);

  return (
    <div
      className="flex flex-col items-center justify-center gap-6 min-h-[400px] cursor-pointer"
      onClick={onNext}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onNext();
      }}
      aria-label="Your Regenerative Wealth — tap to continue"
    >
      <motion.h2
        className="text-2xl md:text-3xl text-center text-[#1A1714]"
        style={{ fontFamily: "var(--font-cormorant)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: HUMA_EASE }}
      >
        Your Regenerative Wealth
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: HUMA_EASE }}
        style={{ width: "min(280px, 80vw)", aspectRatio: "1" }}
      >
        <RegenerativeFlower capitals={capitals} size={280} className="max-w-full" animate />
      </motion.div>
    </div>
  );
}
