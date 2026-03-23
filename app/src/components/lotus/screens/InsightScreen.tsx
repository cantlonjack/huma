"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import WholeVisualization from "../WholeVisualization";
import type { LotusState, LotusAction } from "@/types/lotus";
import { HUMA_EASE } from "@/lib/constants";

interface InsightData {
  insight: string;
  pattern: {
    name: string;
    description: string;
    whyYou: string;
    firstStep: string;
  } | null;
}

interface ScreenProps {
  state: LotusState;
  dispatch: React.Dispatch<LotusAction>;
  onNext: () => void;
}

export default function InsightScreen({ state, dispatch, onNext }: ScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const gotItRef = useRef<HTMLButtonElement>(null);
  const [data, setData] = useState<InsightData | null>(null);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState(false);

  const fetchInsight = useCallback(async () => {
    // If we already have an insight from a previous visit, use it
    if (state.context.firstInsight) {
      setData({
        insight: state.context.firstInsight,
        pattern: state.context.firstPattern
          ? {
              name: state.context.firstPattern.name,
              description: state.context.firstPattern.description,
              whyYou: state.context.firstPattern.whyYou,
              firstStep: state.context.firstPattern.firstStep,
            }
          : null,
      });
      return;
    }

    try {
      const res = await fetch("/api/lotus-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: state.context }),
      });

      if (!res.ok) {
        setError(true);
        return;
      }

      const result: InsightData = await res.json();
      setData(result);

      dispatch({
        type: "SET_INSIGHT",
        insight: result.insight,
        pattern: result.pattern
          ? {
              id: `lotus-${Date.now()}`,
              name: result.pattern.name,
              description: result.pattern.description,
              whyYou: result.pattern.whyYou,
              firstStep: result.pattern.firstStep,
            }
          : undefined,
      });
    } catch {
      setError(true);
    }
  }, [state.context, dispatch]);

  useEffect(() => {
    fetchInsight();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-focus "Got it" button when data loads
  useEffect(() => {
    if (data) {
      const t = setTimeout(() => gotItRef.current?.focus(), 600);
      return () => clearTimeout(t);
    }
  }, [data]);

  const handleShowOthers = () => {
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const stagger = prefersReducedMotion ? 0 : 1;

  // Loading state — centered WHOLE with enhanced breathing
  if (!data && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div
          style={{
            animation: prefersReducedMotion
              ? undefined
              : "whole-breathe-fast 3s ease-in-out infinite",
          }}
        >
          <WholeVisualization
            params={state.wholeParams}
            phase={3}
            size={280}
          />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.6, ease: HUMA_EASE }}
          className="flex gap-1"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#A89E90]"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>

        <style jsx global>{`
          @keyframes whole-breathe-fast {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.03); }
          }
        `}</style>
      </div>
    );
  }

  // Error state — don't block the flow
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-8 text-center">
        <p
          className="text-lg text-[#3D3830] max-w-[480px] leading-relaxed"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Something went wrong. Your context is saved &mdash; we&rsquo;ll have
          your insight ready next time.
        </p>
        <button
          onClick={onNext}
          className="px-8 py-3 rounded-full bg-[#5C7A62] text-white font-medium hover:bg-[#4A6850] transition-colors duration-300"
          style={{ fontFamily: "var(--font-source-sans)", fontSize: "0.9rem" }}
        >
          Continue &rarr;
        </button>
      </div>
    );
  }

  // Loaded state — insight + pattern card
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-8">
      {/* Insight text */}
      <motion.p
        className="text-center max-w-[560px] text-[#3D3830] leading-[1.8]"
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "1.05rem",
          fontWeight: 400,
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: HUMA_EASE }}
      >
        {data!.insight}
      </motion.p>

      {/* Pattern card */}
      {data!.pattern && (
        <motion.div
          className="w-full max-w-[560px] mx-4 sm:mx-0 bg-white rounded-xl border border-[#D4CBBA] overflow-hidden"
          style={{ borderLeft: "4px solid #5C7A62" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: HUMA_EASE,
            delay: 0.4 * stagger,
          }}
        >
          <div className="p-6">
            {/* Label */}
            <span
              className="text-[#5C7A62] uppercase"
              style={{
                fontFamily: "var(--font-source-sans)",
                fontSize: "0.62rem",
                fontWeight: 600,
                letterSpacing: "0.2em",
              }}
            >
              Your first move
            </span>

            {/* Pattern name */}
            <h3
              className="text-[#1A1714] mt-2"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "1.1rem",
                fontWeight: 500,
              }}
            >
              {data!.pattern!.name}
            </h3>

            {/* Description */}
            <p
              className="text-[#6B6358] mt-3"
              style={{
                fontFamily: "var(--font-source-sans)",
                fontSize: "0.9rem",
                fontWeight: 300,
                lineHeight: 1.6,
              }}
            >
              {data!.pattern!.description}
            </p>

            {/* Why you */}
            <p className="mt-3">
              <span
                className="text-[#6B6358]"
                style={{
                  fontFamily: "var(--font-source-sans)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                Why you:{" "}
              </span>
              <span
                className="text-[#6B6358]"
                style={{
                  fontFamily: "var(--font-source-sans)",
                  fontSize: "0.8rem",
                  fontWeight: 300,
                }}
              >
                {data!.pattern!.whyYou}
              </span>
            </p>

            {/* First step */}
            <p className="mt-2">
              <span
                className="text-[#6B6358]"
                style={{
                  fontFamily: "var(--font-source-sans)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                First step:{" "}
              </span>
              <span
                className="text-[#3D3830]"
                style={{
                  fontFamily: "var(--font-source-sans)",
                  fontSize: "0.8rem",
                  fontWeight: 400,
                }}
              >
                {data!.pattern!.firstStep}
              </span>
            </p>

            {/* Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                ref={gotItRef}
                onClick={onNext}
                className="px-8 py-3 rounded-full bg-[#5C7A62] text-white font-medium hover:bg-[#4A6850] transition-colors duration-300"
                style={{
                  fontFamily: "var(--font-source-sans)",
                  fontSize: "0.9rem",
                  minHeight: 48,
                }}
              >
                Got it
              </button>
              <button
                onClick={handleShowOthers}
                className="px-8 py-3 rounded-full border border-[#A89E90] text-[#6B6358] font-medium hover:bg-[#F6F1E9] transition-colors duration-300"
                style={{
                  fontFamily: "var(--font-source-sans)",
                  fontSize: "0.9rem",
                  minHeight: 48,
                }}
              >
                Show me others
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* No pattern — just insight + continue */}
      {!data!.pattern && (
        <motion.button
          onClick={onNext}
          className="px-8 py-3 rounded-full bg-[#5C7A62] text-white font-medium hover:bg-[#4A6850] transition-colors duration-300"
          style={{ fontFamily: "var(--font-source-sans)", fontSize: "0.9rem" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: HUMA_EASE,
            delay: 0.4 * stagger,
          }}
        >
          Keep going &rarr;
        </motion.button>
      )}

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
            More patterns coming soon
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
