"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SHAPE_CARDS,
  type DimensionKey,
  type ShapeData,
} from "@/types/shape";
import type { ShapeInsight } from "@/engine/shape-insight";
import ShapeRadar from "./ShapeRadar";
import BodyIllustration from "./illustrations/BodyIllustration";
import PeopleIllustration from "./illustrations/PeopleIllustration";
import MoneyIllustration from "./illustrations/MoneyIllustration";
import HomeIllustration from "./illustrations/HomeIllustration";
import GrowthIllustration from "./illustrations/GrowthIllustration";
import JoyIllustration from "./illustrations/JoyIllustration";
import PurposeIllustration from "./illustrations/PurposeIllustration";
import IdentityIllustration from "./illustrations/IdentityIllustration";

const ILLUSTRATIONS: Record<DimensionKey, React.ComponentType<{ size?: number }>> = {
  body: BodyIllustration,
  people: PeopleIllustration,
  money: MoneyIllustration,
  home: HomeIllustration,
  growth: GrowthIllustration,
  joy: JoyIllustration,
  purpose: PurposeIllustration,
  identity: IdentityIllustration,
};

const HUMA_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ShapeBuilderProps {
  onComplete?: (shape: ShapeData) => void;
  onClose?: () => void;
  onSave?: (scores: Partial<Record<DimensionKey, number>>, insight: ShapeInsight | null) => void;
}

type Direction = 1 | -1;

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export default function ShapeBuilder({ onComplete, onClose, onSave }: ShapeBuilderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Partial<Record<DimensionKey, number>>>({});
  const [revealed, setRevealed] = useState(false);
  const [direction, setDirection] = useState<Direction>(1);
  const [transitioning, setTransitioning] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [revealSize, setRevealSize] = useState(280);
  const [insight, setInsight] = useState<ShapeInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState(false);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insightFetched = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setRevealSize(window.innerWidth < 640 ? 280 : 350);
  }, []);

  // Fetch insight when shape is revealed
  useEffect(() => {
    if (!revealed || insightFetched.current) return;
    insightFetched.current = true;

    async function fetchInsight() {
      setInsightLoading(true);
      try {
        const res = await fetch("/api/shape-insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scores }),
        });
        if (!res.ok) throw new Error("API error");
        const data: ShapeInsight = await res.json();
        setInsight(data);
      } catch {
        setInsightError(true);
      } finally {
        setInsightLoading(false);
      }
    }

    fetchInsight();
  }, [revealed, scores]);

  const card = SHAPE_CARDS[currentIndex];
  const Illustration = card ? ILLUSTRATIONS[card.dimension] : null;
  const totalCards = SHAPE_CARDS.length;

  const handlePillTap = useCallback(
    (value: number) => {
      if (transitioning) return;
      const dim = SHAPE_CARDS[currentIndex].dimension;
      setScores((prev) => ({ ...prev, [dim]: value }));

      if (currentIndex < totalCards - 1) {
        setTransitioning(true);
        const delay = prefersReducedMotion ? 50 : 400;
        setTimeout(() => {
          setDirection(1);
          setCurrentIndex((i) => i + 1);
          setTransitioning(false);
        }, delay);
      } else {
        // Last card — trigger reveal
        setTransitioning(true);
        const delay = prefersReducedMotion ? 50 : 300;
        setTimeout(() => {
          setRevealed(true);
          setTransitioning(false);
        }, delay);
      }
    },
    [currentIndex, totalCards, transitioning, prefersReducedMotion]
  );

  const handleBack = useCallback(() => {
    if (currentIndex > 0 && !transitioning) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex, transitioning]);

  const showTooltip = useCallback((text: string) => {
    setTooltip(text);
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    tooltipTimer.current = setTimeout(() => setTooltip(null), 2000);
  }, []);

  // === REVEAL SCREEN ===
  if (revealed) {
    // Animation delay chain: shape 800ms → pause 500ms → headline → detail → oneThing → buttons
    const insightBaseDelay = 1.3; // after shape is fully revealed

    return (
      <div className="fixed inset-0 bg-sand-50 flex flex-col items-center overflow-y-auto px-6 py-8">
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
          {/* HUMA wordmark */}
          <motion.p
            className="font-serif text-sage-500 tracking-[0.4em] text-sm font-medium uppercase mb-6"
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            HUMA
          </motion.p>

          {/* Heading */}
          <motion.h1
            className="font-serif text-earth-700 text-xl md:text-2xl text-center mb-8"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8, ease: HUMA_EASE }}
          >
            Your life, right now.
          </motion.h1>

          {/* Shape — animate from small to center */}
          <motion.div
            initial={prefersReducedMotion ? undefined : { scale: 0.25, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.9,
              ease: HUMA_EASE,
            }}
          >
            <ShapeRadar
              shape={scores}
              size={revealSize}
              labels
              breathing={!prefersReducedMotion}
              highlighted={insight?.dimensions.highlighted}
              lever={insight?.dimensions.lever}
              className="mx-auto"
            />
          </motion.div>

          {/* Divider */}
          <div className="w-full h-px bg-sand-200 my-6" />

          {/* Insight area */}
          <AnimatePresence mode="wait">
            {insightLoading && !insight && !insightError && (
              <motion.div
                key="loading"
                className="text-center flex items-center gap-2"
                initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: insightBaseDelay, duration: 0.5 }}
              >
                <span className="text-earth-400 text-sm font-sans italic">
                  Reading your shape
                </span>
                {!prefersReducedMotion && (
                  <span className="inline-flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="inline-block w-1.5 h-1.5 rounded-full bg-sage-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </span>
                )}
                {prefersReducedMotion && <span className="text-earth-400 text-sm">...</span>}
              </motion.div>
            )}

            {insightError && !insight && (
              <motion.div
                key="error"
                className="text-center"
                initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-earth-500 text-sm font-sans">
                  I couldn&apos;t read your shape right now.
                  <br />
                  Save it and I&apos;ll try again next time.
                </p>
              </motion.div>
            )}

            {insight && (
              <motion.div key="insight" className="w-full space-y-0">
                {/* Headline */}
                <motion.p
                  className="font-serif text-earth-800 text-lg text-center leading-relaxed"
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: HUMA_EASE }}
                >
                  {insight.headline}
                </motion.p>

                {/* Detail */}
                <motion.p
                  className="font-sans text-earth-600 text-base text-center leading-relaxed mt-3 line-clamp-3"
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2, ease: HUMA_EASE }}
                >
                  {insight.detail}
                </motion.p>

                {/* Divider */}
                <motion.div
                  className="w-full h-px bg-sand-200 my-5"
                  initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                />

                {/* One-thing card */}
                <motion.div
                  className="bg-sage-50 rounded-lg border-l-4 border-sage-600 px-4 py-3"
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4, ease: HUMA_EASE }}
                >
                  <p className="font-sans text-sm text-earth-500 mb-1">Try this:</p>
                  <p className="font-sans text-base text-earth-700 leading-relaxed">
                    {insight.oneThing}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider before buttons */}
          <div className="w-full h-px bg-sand-200 my-6" />

          {/* Action buttons */}
          <motion.div
            className="flex gap-4 relative"
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: insight ? 0.8 : 1.5,
              duration: 0.5,
            }}
          >
            <button
              onClick={() => showTooltip("Coming soon")}
              className="px-6 py-3 rounded-full border border-earth-300 text-earth-500 font-sans text-sm hover:bg-sand-100 transition-colors"
            >
              Tell me more &rarr;
            </button>
            <button
              onClick={() => onSave?.(scores, insight)}
              className="px-6 py-3 rounded-full bg-sage-600 text-white font-sans text-sm font-medium hover:bg-sage-700 transition-colors"
            >
              Save my shape &rarr;
            </button>
          </motion.div>

          {/* Tooltip */}
          <AnimatePresence>
            {tooltip && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-earth-400 text-xs font-sans"
              >
                {tooltip}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // === CARD SCREEN ===
  return (
    <div className="fixed inset-0 bg-sand-50 flex flex-col">
      {/* Top bar: back, progress dots, close */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        {/* Back arrow */}
        <button
          onClick={handleBack}
          disabled={currentIndex === 0}
          className="w-10 h-10 flex items-center justify-center text-earth-400 hover:text-earth-600 transition-colors disabled:opacity-0"
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12 4L6 10L12 16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Progress dots */}
        <div className="flex gap-2 items-center" role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemin={1} aria-valuemax={8}>
          {SHAPE_CARDS.map((_, i) => {
            let dotClass = "rounded-full transition-all duration-300 ";
            if (i === currentIndex) {
              dotClass += "w-2 h-2 bg-sage-600";
            } else if (i < currentIndex || scores[SHAPE_CARDS[i].dimension] !== undefined) {
              dotClass += "w-1.5 h-1.5 bg-sage-400";
            } else {
              dotClass += "w-1.5 h-1.5 bg-sand-300";
            }
            return <div key={i} className={dotClass} />;
          })}
        </div>

        {/* Close X */}
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-earth-400 hover:text-earth-600 transition-colors"
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Shape preview — top right */}
      {Object.keys(scores).length > 0 && (
        <div className="absolute top-14 right-4 z-10">
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: HUMA_EASE }}
          >
            <ShapeRadar shape={scores} size={80} className="opacity-60" />
          </motion.div>
        </div>
      )}

      {/* Card content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={
              prefersReducedMotion
                ? undefined
                : { opacity: 0, x: direction === 1 ? 60 : -60 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={
              prefersReducedMotion
                ? undefined
                : { opacity: 0, x: direction === 1 ? -60 : 60 }
            }
            transition={{
              duration: prefersReducedMotion ? 0 : 0.5,
              ease: HUMA_EASE,
            }}
            className="flex flex-col items-center w-full max-w-md"
          >
            {/* Illustration — smaller on mobile to keep pills visible */}
            {Illustration && (
              <div className="mb-6 md:mb-8">
                <div className="block md:hidden">
                  <Illustration size={130} />
                </div>
                <div className="hidden md:block">
                  <Illustration size={180} />
                </div>
              </div>
            )}

            {/* Question */}
            <h2 className="font-serif text-earth-900 text-xl md:text-2xl text-center leading-relaxed mb-10">
              {card?.question}
            </h2>

            {/* Response pills */}
            <div className="flex flex-wrap justify-center gap-3">
              {card?.pills.map((pill, i) => {
                const value = i + 1;
                const isSelected = scores[card.dimension] === value;
                return (
                  <motion.button
                    key={pill}
                    onClick={() => handlePillTap(value)}
                    disabled={transitioning}
                    className={`
                      rounded-full px-5 py-2.5 text-sm font-sans
                      min-h-[44px] transition-colors duration-200
                      ${
                        isSelected
                          ? "bg-sage-100 text-sage-700 border-2 border-sage-400"
                          : "bg-sand-200 text-earth-500 border border-sand-300 hover:bg-sand-100"
                      }
                    `}
                    whileTap={prefersReducedMotion ? undefined : { scale: 1.06 }}
                  >
                    {pill}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom safe area spacer */}
      <div className="h-8" />
    </div>
  );
}
