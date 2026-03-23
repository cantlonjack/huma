"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShapeRadar, { polarXY, valueToRadius } from "@/components/shape/ShapeRadar";
import { DIMENSION_LABELS, type DimensionKey } from "@/types/shape";
import { saveShape, type SavedShape } from "@/lib/shapes";
import { HUMA_EASE } from "@/lib/constants";

const LEVELS = [1, 2, 3, 4, 5] as const;

interface DailyPulseProps {
  latestShape: SavedShape;
  onComplete: (savedPulse: SavedShape) => void;
}

/**
 * Convert SVG viewBox coordinates to screen pixels using getScreenCTM.
 * Handles scroll offset and mobile viewport correctly.
 */
function svgToScreen(
  svgEl: SVGSVGElement,
  svgX: number,
  svgY: number
): { x: number; y: number } {
  const ctm = svgEl.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  return {
    x: svgX * ctm.a + svgY * ctm.c + ctm.e,
    y: svgX * ctm.b + svgY * ctm.d + ctm.f,
  };
}

export default function DailyPulse({ latestShape, onComplete }: DailyPulseProps) {
  const [dimensions, setDimensions] = useState<Record<DimensionKey, number>>(
    () => ({ ...latestShape.dimensions })
  );
  const [activeDim, setActiveDim] = useState<DimensionKey | null>(null);
  const [selectorPos, setSelectorPos] = useState<{ x: number; y: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [acknowledgment, setAcknowledgment] = useState(false);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const handleVertexTap = useCallback(
    (dim: DimensionKey, svgX: number, svgY: number) => {
      // Find the SVG element inside our container
      const svgEl = svgContainerRef.current?.querySelector("svg");
      if (!svgEl) return;

      const screen = svgToScreen(svgEl as SVGSVGElement, svgX, svgY);
      // Position selector relative to the container
      const containerRect = svgContainerRef.current!.getBoundingClientRect();
      setSelectorPos({
        x: screen.x - containerRect.left,
        y: screen.y - containerRect.top,
      });
      setActiveDim(dim);
    },
    []
  );

  const handleLevelSelect = useCallback(
    (level: number) => {
      if (!activeDim) return;
      setDimensions((prev) => ({ ...prev, [activeDim]: level }));
      setActiveDim(null);
      setSelectorPos(null);
    },
    [activeDim]
  );

  // Close selector when clicking outside
  useEffect(() => {
    if (!activeDim) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("[data-selector]")) return;
      setActiveDim(null);
      setSelectorPos(null);
    }
    // Delay to avoid immediate close from the same click
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeDim]);

  const handleDone = async () => {
    setSaving(true);
    const saved = await saveShape(dimensions, "pulse");
    setSaving(false);

    if (saved) {
      setAcknowledgment(true);
      setTimeout(() => onComplete(saved), 1500);
    }
  };

  if (acknowledgment) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: HUMA_EASE }}
        className="flex flex-col items-center justify-center py-16"
      >
        <p className="font-serif text-earth-600 text-lg">
          Got it. See you tomorrow.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      {/* Date header */}
      <p className="font-sans text-earth-500 text-sm mb-6">{today}</p>

      {/* Interactive shape */}
      <div ref={svgContainerRef} className="relative w-full max-w-[360px]">
        <ShapeRadar
          shape={dimensions}
          labels
          breathing
          onVertexTap={handleVertexTap}
          className="w-full"
        />

        {/* Floating vertex selector */}
        <AnimatePresence>
          {activeDim && selectorPos && (
            <motion.div
              data-selector
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, ease: HUMA_EASE }}
              className="absolute z-10 flex items-center gap-2 bg-sand-50 rounded-full px-3 py-2 shadow-md border border-sand-200"
              style={{
                left: selectorPos.x,
                top: selectorPos.y,
                transform: "translate(-50%, -140%)",
              }}
            >
              <span className="font-sans text-xs text-earth-500 mr-1">
                {DIMENSION_LABELS[activeDim]}
              </span>
              {LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => handleLevelSelect(level)}
                  className={`w-7 h-7 rounded-full border-2 transition-colors flex items-center justify-center text-xs font-sans ${
                    dimensions[activeDim] === level
                      ? "bg-sage-600 border-sage-600 text-white"
                      : "bg-sand-50 border-earth-300 text-earth-500 hover:border-sage-400"
                  }`}
                  aria-label={`Set ${DIMENSION_LABELS[activeDim]} to ${level}`}
                >
                  {level}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instruction */}
      <p className="font-sans text-earth-400 text-sm mt-4 mb-6 text-center">
        Tap anything that shifted
      </p>

      {/* Done button */}
      <button
        onClick={handleDone}
        disabled={saving}
        className="font-sans text-sm text-earth-500 hover:text-earth-700 transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : "Done — nothing changed"}
      </button>
    </div>
  );
}
