/**
 * DEPRECATED — March 2026
 *
 * The Shape Builder has been replaced by the Lotus Flow (components/lotus/)
 * as the entry experience at /begin.
 *
 * This component is RETAINED for use as the Daily Capital Pulse
 * (returning users adjusting their dimensional scores). Do not delete.
 *
 * The Lotus Flow captures richer context (entity type, governance,
 * 8-capital spectrum, archetype) while this component handles the
 * simpler daily check-in.
 */
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
import { HUMA_EASE } from "@/lib/constants";

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

// Tap target spectrum — visual weight increases from 1 to 5
const PILL_STYLES = [
  { px: 16, py: 8, fontSize: "0.8rem", opacity: 0.6, borderColor: "#DDD4C0" },
  { px: 18, py: 9, fontSize: "0.85rem", opacity: 0.7, borderColor: "#C4D9C6" },
  { px: 20, py: 10, fontSize: "0.9rem", opacity: 0.8, borderColor: "#A8C4AA" },
  { px: 22, py: 11, fontSize: "0.95rem", opacity: 0.9, borderColor: "#8BAF8E" },
  { px: 24, py: 12, fontSize: "1rem", opacity: 1.0, borderColor: "#5C7A62" },
];

interface ShapeBuilderProps {
  onComplete?: (shape: ShapeData) => void;
  onClose?: () => void;
  onSave?: (scores: Partial<Record<DimensionKey, number>>, insight: ShapeInsight | null) => void;
}

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
  const [direction, setDirection] = useState<1 | -1>(1);
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
  const completedCount = Object.keys(scores).length;

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

  // Preview opacity scales with completion
  const previewOpacity = completedCount === 0
    ? 0
    : completedCount <= 2
      ? 0.3
      : completedCount <= 5
        ? 0.3 + (completedCount - 2) * 0.1
        : 0.6 + (completedCount - 5) * 0.066;

  // === REVEAL SCREEN ===
  if (revealed) {
    return (
      <div className="fixed inset-0 flex flex-col items-center overflow-y-auto px-6 py-8" style={{ backgroundColor: "#FAF8F3" }}>
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
          {/* HUMA wordmark */}
          <motion.p
            className="font-serif tracking-[0.4em] font-medium uppercase mb-6"
            style={{ fontSize: "0.85rem", color: "#5C7A62" }}
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            HUMA
          </motion.p>

          {/* Heading */}
          <motion.h1
            className="font-serif text-center"
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              fontWeight: 400,
              color: "#1A1714",
              marginBottom: 48,
            }}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8, ease: HUMA_EASE }}
          >
            Your life, right now.
          </motion.h1>

          {/* Shape — animate from corner preview to center */}
          <motion.div
            initial={prefersReducedMotion ? undefined : { scale: 0.25, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 1.2,
              ease: HUMA_EASE,
            }}
            style={{ maxWidth: 400 }}
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
          <div
            className="mx-auto"
            style={{
              width: "100%",
              maxWidth: 480,
              height: 1,
              backgroundColor: "#C4D9C6",
              marginTop: 32,
              marginBottom: 32,
            }}
          />

          {/* Insight area */}
          <AnimatePresence mode="wait">
            {insightLoading && !insight && !insightError && (
              <motion.div
                key="loading"
                className="text-center flex items-center gap-2"
                initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1.3, duration: 0.5 }}
              >
                <span className="font-sans italic" style={{ fontSize: "0.875rem", color: "#8C8274" }}>
                  Reading your shape
                </span>
                {!prefersReducedMotion && (
                  <span className="inline-flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="inline-block w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: "#8BAF8E" }}
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
                {prefersReducedMotion && <span style={{ color: "#8C8274", fontSize: "0.875rem" }}>...</span>}
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
                <p className="font-sans" style={{ fontSize: "0.875rem", color: "#6B6358" }}>
                  I couldn&apos;t read your shape right now.
                  <br />
                  Save it and I&apos;ll try again next time.
                </p>
              </motion.div>
            )}

            {insight && (
              <motion.div key="insight" className="w-full" style={{ maxWidth: 560 }}>
                {/* Headline */}
                <motion.p
                  className="font-serif text-center leading-relaxed"
                  style={{ fontSize: "1.15rem", color: "#2C2620" }}
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: HUMA_EASE }}
                >
                  {insight.headline}
                </motion.p>

                {/* Detail — full text, no truncation */}
                <motion.p
                  className="font-serif text-center"
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 400,
                    lineHeight: 1.8,
                    color: "#3D3830",
                    marginTop: 12,
                  }}
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2, ease: HUMA_EASE }}
                >
                  {insight.detail}
                </motion.p>

                {/* Divider */}
                <motion.div
                  className="mx-auto"
                  style={{
                    width: "100%",
                    maxWidth: 480,
                    height: 1,
                    backgroundColor: "#C4D9C6",
                    marginTop: 32,
                    marginBottom: 32,
                  }}
                  initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                />

                {/* Try this card */}
                <motion.div
                  style={{
                    backgroundColor: "#F6F1E9",
                    borderLeft: "4px solid #5C7A62",
                    borderRadius: 12,
                    padding: "20px 24px",
                  }}
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4, ease: HUMA_EASE }}
                >
                  <p
                    className="font-sans uppercase"
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#8C8274",
                      letterSpacing: "0.15em",
                      marginBottom: 8,
                    }}
                  >
                    Try this:
                  </p>
                  <p
                    className="font-sans"
                    style={{
                      fontSize: "1rem",
                      fontWeight: 300,
                      lineHeight: 1.7,
                      color: "#554D42",
                    }}
                  >
                    {insight.oneThing}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <motion.div
            className="flex gap-4 relative"
            style={{ marginTop: 48 }}
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: insight ? 0.8 : 1.5,
              duration: 0.5,
            }}
          >
            <button
              onClick={() => showTooltip("Coming soon")}
              className="font-sans"
              style={{
                padding: "14px 32px",
                borderRadius: 9999,
                border: "1px solid #A8C4AA",
                backgroundColor: "transparent",
                color: "#3A5A40",
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 200ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#EBF3EC";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Tell me more &rarr;
            </button>
            <button
              onClick={() => onSave?.(scores, insight)}
              className="font-sans font-medium"
              style={{
                padding: "16px 36px",
                borderRadius: 9999,
                border: "none",
                backgroundColor: "#B5621E",
                color: "#FFFFFF",
                fontSize: "0.9rem",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(181,98,30,0.15)",
                transition: "all 200ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#C87A3A";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#B5621E";
              }}
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
                className="font-sans"
                style={{ marginTop: 12, color: "#8C8274", fontSize: "0.75rem" }}
              >
                {tooltip}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom spacer */}
          <div style={{ height: 48 }} />
        </div>
      </div>
    );
  }

  // === CARD SCREEN ===
  return (
    <div className="fixed inset-0 flex flex-col" style={{ backgroundColor: "#FAF8F3" }}>
      {/* Top bar: back, progress dots, close */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        {/* Back arrow */}
        <button
          onClick={handleBack}
          disabled={currentIndex === 0}
          className="w-10 h-10 flex items-center justify-center transition-colors disabled:opacity-0"
          style={{ color: "#8C8274" }}
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
            const isActive = i === currentIndex;
            const isDone = i < currentIndex || scores[SHAPE_CARDS[i].dimension] !== undefined;
            return (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: isActive ? 8 : 6,
                  height: isActive ? 8 : 6,
                  backgroundColor: isActive
                    ? "#4A6E50"
                    : isDone
                      ? "#8BAF8E"
                      : "#DDD4C0",
                }}
              />
            );
          })}
        </div>

        {/* Close X */}
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center transition-colors"
          style={{ color: "#8C8274" }}
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Progressive shape preview — top right */}
      {completedCount > 0 && (
        <div className="absolute z-10" style={{ top: 56, right: 16 }}>
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: previewOpacity, scale: 1 }}
            transition={{ duration: 0.3, ease: HUMA_EASE }}
          >
            <ShapeRadar
              shape={scores}
              size={80}
              breathing={completedCount === 8 && !prefersReducedMotion}
            />
          </motion.div>
        </div>
      )}

      {/* Card content area */}
      <div className="flex-1 flex flex-col items-center px-6 overflow-hidden" style={{ paddingTop: 64 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.5,
              ease: HUMA_EASE,
            }}
            className="flex flex-col items-center w-full max-w-md"
          >
            {/* Question — ABOVE illustration */}
            <h2
              className="font-serif text-center leading-relaxed"
              style={{
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: 400,
                color: "#1A1714",
                maxWidth: 480,
                marginBottom: 32,
              }}
            >
              {card?.question}
            </h2>

            {/* Illustration */}
            {Illustration && (
              <div style={{ marginBottom: 32 }}>
                <div className="block md:hidden">
                  <Illustration size={140} />
                </div>
                <div className="hidden md:block">
                  <Illustration size={200} />
                </div>
              </div>
            )}

            {/* Response pills — spectrum from small/dim to large/warm */}
            <div className="flex flex-wrap justify-center" style={{ gap: 12 }}>
              {card?.pills.map((pill, i) => {
                const value = i + 1;
                const isSelected = scores[card.dimension] === value;
                const style = PILL_STYLES[i];

                return (
                  <motion.button
                    key={pill}
                    onClick={() => handlePillTap(value)}
                    disabled={transitioning}
                    className="font-sans"
                    style={{
                      padding: `${style.py}px ${style.px}px`,
                      fontSize: style.fontSize,
                      fontWeight: 500,
                      borderRadius: 9999,
                      minHeight: 44,
                      border: isSelected
                        ? "2px solid #5C7A62"
                        : `1px solid ${style.borderColor}`,
                      backgroundColor: isSelected ? "#E0EDE1" : "transparent",
                      color: isSelected ? "#3A5A40" : "#554D42",
                      opacity: isSelected ? 1 : style.opacity,
                      cursor: "pointer",
                      transition: "all 200ms cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = "#EBF3EC";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 1.02 }}
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
