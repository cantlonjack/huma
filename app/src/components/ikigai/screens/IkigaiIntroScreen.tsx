"use client";

import { motion } from "framer-motion";
import IkigaiVenn from "../IkigaiVenn";
import { HUMA_EASE } from "@/lib/constants";

interface Props {
  onNext: () => void;
}

export default function IkigaiIntroScreen({ onNext }: Props) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[60vh] gap-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: HUMA_EASE }}
    >
      <IkigaiVenn love={[]} good={[]} need={[]} size={240} />

      <div className="text-center space-y-3">
        <h2
          className="text-earth-700"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "1.2rem",
            fontWeight: 500,
          }}
        >
          Three questions about you.
        </h2>
        <p
          className="text-earth-400"
          style={{
            fontFamily: "var(--font-source-sans)",
            fontSize: "0.9rem",
          }}
        >
          What you love. What you&rsquo;re good at. What the world needs.
        </p>
      </div>

      <button
        onClick={onNext}
        autoFocus
        className="px-8 py-3 rounded-full bg-sage-600 text-white font-medium hover:bg-sage-700 transition-colors duration-300"
        style={{
          fontFamily: "var(--font-source-sans)",
          fontSize: "0.9rem",
          minHeight: 48,
        }}
      >
        Let&rsquo;s go &rarr;
      </button>
    </motion.div>
  );
}
