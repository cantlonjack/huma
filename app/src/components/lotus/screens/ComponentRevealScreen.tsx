"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

const HUMA_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ScreenProps {
  onNext: () => void;
}

export default function ComponentRevealScreen({ onNext }: ScreenProps) {
  // Auto-advance after 2.5s
  useEffect(() => {
    const t = setTimeout(onNext, 2500);
    return () => clearTimeout(t);
  }, [onNext]);

  return (
    <button
      onClick={onNext}
      className="flex flex-col items-center justify-center gap-8 w-full min-h-[300px] cursor-pointer"
      aria-label="Continue to next screen"
    >
      {/* Component icon — organic hexagonal building block */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: HUMA_EASE }}
      >
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          {/* Hexagonal component — organic edges */}
          <path
            d="M32 8 L52 20 L52 44 L32 56 L12 44 L12 20 Z"
            stroke="#5C7A62"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Inner detail — subtle cross lines */}
          <path
            d="M32 20 L32 44 M22 26 L42 38 M42 26 L22 38"
            stroke="#8BAF8E"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      </motion.div>

      <div className="flex flex-col items-center gap-3">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: HUMA_EASE }}
          className="text-xl text-center text-[#1A1714]"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Your first building block.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4, ease: HUMA_EASE }}
          className="text-sm text-center text-[#6B6358]"
          style={{ fontFamily: "var(--font-source-sans)" }}
        >
          Everything in HUMA is a component. You can always change this.
        </motion.p>
      </div>
    </button>
  );
}
