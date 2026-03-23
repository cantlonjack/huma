"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { HUMA_EASE } from "@/lib/constants";

interface ScreenProps {
  onNext: () => void;
}

export default function CanvasIntroScreen({ onNext }: ScreenProps) {
  // Auto-advance after 3s
  useEffect(() => {
    const t = setTimeout(onNext, 3000);
    return () => clearTimeout(t);
  }, [onNext]);

  return (
    <button
      onClick={onNext}
      className="flex flex-col items-center justify-center gap-8 w-full min-h-[300px] cursor-pointer"
      aria-label="Continue to next screen"
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: HUMA_EASE }}
        className="text-xl text-center text-[#1A1714] max-w-md"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        As you progress through the HUMA Framework, your context will evolve and be represented here.
      </motion.p>

      {/* Canvas preview — empty area with component + line to WHOLE corner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: HUMA_EASE }}
        className="relative w-full max-w-sm h-48"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 320 180"
          fill="none"
          aria-hidden="true"
        >
          {/* Canvas area — dashed border */}
          <rect
            x="4"
            y="4"
            width="312"
            height="172"
            rx="12"
            stroke="#D4CBBA"
            strokeWidth="1.2"
            strokeDasharray="6 4"
            fill="#FAF4ED"
          />

          {/* Component box — small, lower left area */}
          <rect
            x="40"
            y="110"
            width="32"
            height="32"
            rx="6"
            stroke="#5C7A62"
            strokeWidth="1.2"
            fill="white"
          />
          {/* Component inner mark */}
          <path
            d="M50 122 L56 126 L62 120"
            stroke="#8BAF8E"
            strokeWidth="0.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Connecting line — component to WHOLE corner */}
          <motion.path
            d="M72 126 C140 126, 240 80, 272 40"
            stroke="#D4CBBA"
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray="4 3"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 1.2, delay: 0.5, ease: HUMA_EASE }}
          />

          {/* WHOLE placeholder — small circle in upper right */}
          <motion.circle
            cx="280"
            cy="32"
            r="14"
            stroke="#5C7A62"
            strokeWidth="1"
            fill="none"
            opacity="0.4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ duration: 0.5, delay: 1.0, ease: HUMA_EASE }}
          />
        </svg>
      </motion.div>
    </button>
  );
}
