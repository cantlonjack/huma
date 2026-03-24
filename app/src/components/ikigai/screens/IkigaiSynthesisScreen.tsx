"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import WholeVisualization from "@/components/lotus/WholeVisualization";
import { HUMA_EASE } from "@/lib/constants";

interface Props {
  love: string[];
  good: string[];
  need: string[];
  loveCards: string[];
  goodCards: string[];
  needCards: string[];
  operatorName: string;
  wholeParams: number[];
  existingSynthesis?: string;
  onSynthesisReady: (synthesis: string) => void;
  onComplete: () => void;
}

export default function IkigaiSynthesisScreen({
  love,
  good,
  need,
  loveCards,
  goodCards,
  needCards,
  operatorName,
  wholeParams,
  existingSynthesis,
  onSynthesisReady,
  onComplete,
}: Props) {
  const prefersReducedMotion = useReducedMotion();
  const [synthesis, setSynthesis] = useState<string | null>(
    existingSynthesis || null
  );
  const [error, setError] = useState(false);
  const doneRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (existingSynthesis) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/ikigai-synthesis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: operatorName,
            love,
            good,
            need,
            loveCards,
            goodCards,
            needCards,
          }),
        });

        if (!res.ok) {
          setError(true);
          return;
        }

        const result = await res.json();
        if (!cancelled) {
          setSynthesis(result.synthesis);
          onSynthesisReady(result.synthesis);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-focus done button
  useEffect(() => {
    if (synthesis) {
      const t = setTimeout(() => doneRef.current?.focus(), 600);
      return () => clearTimeout(t);
    }
  }, [synthesis]);

  // Loading state
  if (!synthesis && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div
          style={{
            animation: prefersReducedMotion
              ? undefined
              : "whole-breathe-fast 3s ease-in-out infinite",
          }}
        >
          <WholeVisualization params={wholeParams} phase={3} size={280} />
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
              className="w-1.5 h-1.5 rounded-full bg-earth-400"
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
            0%,
            100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.03);
            }
          }
        `}</style>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-8 text-center">
        <p
          className="text-lg text-earth-600 max-w-[480px] leading-relaxed"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Something went wrong. Your answers are saved &mdash; we&rsquo;ll
          synthesize them next time.
        </p>
        <button
          onClick={onComplete}
          className="px-8 py-3 rounded-full bg-sage-600 text-white font-medium hover:bg-sage-700 transition-colors duration-300"
          style={{ fontFamily: "var(--font-source-sans)", fontSize: "0.9rem" }}
        >
          Back to your workspace &rarr;
        </button>
      </div>
    );
  }

  // Synthesis loaded
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[400px] gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: HUMA_EASE }}
    >
      <motion.p
        className="text-center max-w-[560px] text-earth-700 leading-[1.8]"
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "1.05rem",
          fontWeight: 400,
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: HUMA_EASE }}
      >
        {synthesis}
      </motion.p>

      <motion.p
        className="text-earth-400 text-sm"
        style={{ fontFamily: "var(--font-source-sans)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4, ease: HUMA_EASE }}
      >
        Your WHOLE is evolving.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.6, ease: HUMA_EASE }}
        style={{
          animation: prefersReducedMotion
            ? undefined
            : "whole-breathe 6s ease-in-out infinite",
        }}
      >
        <WholeVisualization params={wholeParams} phase={3} size={200} />
      </motion.div>

      <motion.button
        ref={doneRef}
        onClick={onComplete}
        className="px-8 py-3 rounded-full bg-sage-600 text-white font-medium hover:bg-sage-700 transition-colors duration-300"
        style={{
          fontFamily: "var(--font-source-sans)",
          fontSize: "0.9rem",
          minHeight: 48,
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8, ease: HUMA_EASE }}
      >
        Back to your workspace &rarr;
      </motion.button>

      <style jsx global>{`
        @keyframes whole-breathe {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.03);
          }
        }
      `}</style>
    </motion.div>
  );
}
