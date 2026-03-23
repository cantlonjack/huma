"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { LotusState, LotusAction, OperatorContext } from "@/types/lotus";
import { HUMA_EASE } from "@/lib/constants";

interface ScreenProps {
  state: LotusState;
  dispatch: React.Dispatch<LotusAction>;
  onSave: (context: OperatorContext) => void;
  onClose: () => void;
}

export default function SaveScreen({
  state,
  dispatch,
  onSave,
  onClose,
}: ScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const locationRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const name = state.context.name || "friend";

  // Auto-focus location input
  useEffect(() => {
    const t = setTimeout(() => locationRef.current?.focus(), 600);
    return () => clearTimeout(t);
  }, []);
  const location = state.context.location || "";

  const stagger = prefersReducedMotion ? 0 : 1;

  function handleLocationChange(e: React.ChangeEvent<HTMLInputElement>) {
    dispatch({ type: "SET_LOCATION", location: e.target.value });
  }

  function handleSave() {
    // Don't clear localStorage here — page.tsx clears it after successful auth.
    // Data must survive if the user closes the auth modal.
    onSave(state.context as OperatorContext);
  }

  function handleContinueContext() {
    setToast("Context deepening coming soon");
    setTimeout(() => setToast(null), 2500);
  }

  function handleLeave() {
    // Data stays in localStorage (persisted via auto-save)
    setToast(`See you soon, ${name}.`);
    setTimeout(() => {
      onClose();
    }, 1500);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-0">
      {/* Section 1: Location + Save */}
      <motion.div
        className="w-full max-w-[480px] flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: HUMA_EASE }}
      >
        {/* Location question */}
        <label
          className="text-center text-[#3D3830]"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "1.1rem",
          }}
          htmlFor="location-input"
        >
          One more thing &mdash; where are you, roughly?
        </label>

        {/* Location input */}
        <div className="w-full max-w-[320px]">
          <input
            ref={locationRef}
            id="location-input"
            type="text"
            value={location}
            onChange={handleLocationChange}
            placeholder="City, state, or region"
            className="w-full bg-transparent border-b border-[#D4CBBA] pb-2 text-center text-[#1A1714] placeholder-[#A89E90] outline-none focus:border-[#5C7A62] transition-colors duration-300"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "1.05rem",
            }}
          />
          <p
            className="text-center mt-2 text-[#A89E90]"
            style={{
              fontFamily: "var(--font-source-sans)",
              fontSize: "0.75rem",
            }}
          >
            Helps find local patterns. Optional.
          </p>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="px-10 py-3.5 rounded-full bg-[#B5621E] text-white font-medium shadow-[0_4px_20px_rgba(181,98,30,0.15)] hover:bg-[#C87A3A] hover:-translate-y-0.5 transition-all duration-300"
          style={{
            fontFamily: "var(--font-source-sans)",
            fontSize: "0.9rem",
            fontWeight: 500,
          }}
        >
          Save my progress &rarr;
        </button>
      </motion.div>

      {/* Divider */}
      <motion.div
        className="w-10 border-t border-[#D4CBBA] my-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: HUMA_EASE,
          delay: 0.3 * stagger,
        }}
      />

      {/* Section 2: Next steps */}
      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: HUMA_EASE,
          delay: 0.4 * stagger,
        }}
      >
        <p
          className="text-center text-[#6B6358]"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "1rem",
          }}
        >
          Your WHOLE is just getting started.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleContinueContext}
            className="px-6 py-3 rounded-full bg-[#5C7A62] text-white font-medium hover:bg-[#4A6850] transition-colors duration-300"
            style={{
              fontFamily: "var(--font-source-sans)",
              fontSize: "0.9rem",
            }}
          >
            Continue to Context &rarr;
          </button>
          <button
            onClick={handleLeave}
            className="px-6 py-3 rounded-full border border-[#A89E90] text-[#6B6358] font-medium hover:bg-[#F6F1E9] transition-colors duration-300"
            style={{
              fontFamily: "var(--font-source-sans)",
              fontSize: "0.9rem",
            }}
          >
            I&rsquo;ll be back
          </button>
        </div>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: HUMA_EASE }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-[#3D3830] text-white text-sm shadow-lg"
            style={{ fontFamily: "var(--font-source-sans)" }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
