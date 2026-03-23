"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import type { CapitalKey } from "@/types/lotus";

const HUMA_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Segment color gradient:
 * 1-3: rose → deep orange (#A04040 → #B5621E)
 * 4-6: orange → yellow-amber (#C87A3A → #E8B75A)
 * 7-9: yellow-green → green (#8BAF8E → #5C7A62)
 * 10: rich green (#3A5A40)
 */
const SEGMENT_COLORS = [
  "#A04040", // 1 — rose-600
  "#B04A30", // 2 — rose→amber
  "#B5621E", // 3 — amber-600
  "#C87A3A", // 4 — amber warm
  "#D4943A", // 5 — amber mid
  "#E8B75A", // 6 — amber-300 golden
  "#8BAF8E", // 7 — sage-300
  "#6E9A72", // 8 — sage-400
  "#5C7A62", // 9 — sage-500
  "#3A5A40", // 10 — sage-700
];

interface CapitalSliderProps {
  capitalKey: CapitalKey;
  label: string;
  value: number; // 0-10, 0 = unset
  onChange: (key: CapitalKey, value: number) => void;
}

export default function CapitalSlider({
  capitalKey,
  label,
  value,
  onChange,
}: CapitalSliderProps) {
  const handleSegmentClick = useCallback(
    (segment: number) => {
      onChange(capitalKey, segment);
    },
    [capitalKey, onChange]
  );

  return (
    <div className="flex items-center gap-3 w-full">
      {/* Label */}
      <span
        className="shrink-0 w-[90px] text-xs font-medium uppercase tracking-[0.1em] text-[#6B6358] text-right"
        style={{ fontFamily: "var(--font-source-sans)" }}
      >
        {label}
      </span>

      {/* Spectrum bar */}
      <div
        className="flex-1 flex h-12 md:h-7 rounded-lg overflow-hidden bg-[#EDE6D8]"
        role="group"
        aria-label={`${label} capital level`}
      >
        {Array.from({ length: 10 }, (_, i) => {
          const segment = i + 1;
          const isFilled = value >= segment;

          return (
            <button
              key={segment}
              type="button"
              onPointerDown={() => handleSegmentClick(segment)}
              aria-label={`${label} capital level ${segment} of 10`}
              aria-pressed={value === segment}
              className="flex-1 min-w-0 border-none outline-none focus-visible:ring-2 focus-visible:ring-[#5C7A62] focus-visible:ring-inset transition-colors duration-200 cursor-pointer"
              style={{
                backgroundColor: isFilled ? SEGMENT_COLORS[i] : "transparent",
              }}
            >
              {/* Subtle segment divider */}
              <motion.div
                className="w-full h-full"
                initial={false}
                animate={{
                  backgroundColor: isFilled ? SEGMENT_COLORS[i] : "transparent",
                }}
                transition={{ duration: 0.2, ease: HUMA_EASE }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
