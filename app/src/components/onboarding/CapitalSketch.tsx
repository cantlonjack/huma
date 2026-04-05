"use client";

import { useState } from "react";
import { DIMENSION_LABELS, DIMENSION_COLORS } from "@/types/v2";
import type { DimensionKey } from "@/types/v2";

const DIMENSIONS: DimensionKey[] = [
  "body", "people", "money", "home", "growth", "joy", "purpose", "identity",
];

/**
 * Collapsible 8-dimension slider sketch for quick capital seeding.
 * Saves rough values to known_context.capitalSketch.
 */
export default function CapitalSketch({
  onChange,
}: {
  onChange: (sketch: Record<DimensionKey, number>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<DimensionKey, number>>(() => {
    const init: Record<string, number> = {};
    for (const d of DIMENSIONS) init[d] = 50;
    return init as Record<DimensionKey, number>;
  });

  const handleChange = (dim: DimensionKey, val: number) => {
    const next = { ...values, [dim]: val };
    setValues(next);
    onChange(next);
  };

  return (
    <div className="w-full mt-6">
      <button
        onClick={() => setOpen(!open)}
        className="font-sans text-earth-400 cursor-pointer flex items-center gap-1.5 mx-auto"
        style={{ fontSize: "13px" }}
      >
        <span
          className="inline-block transition-transform"
          style={{
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
            fontSize: "10px",
          }}
        >
          ▶
        </span>
        Sketch where things stand
      </button>

      {open && (
        <div className="mt-4 animate-fade-in">
          <p
            className="font-sans text-earth-300 text-center mb-5"
            style={{ fontSize: "12px" }}
          >
            Rough is fine. HUMA will refine this from your actual behavior.
          </p>
          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            {DIMENSIONS.map((dim) => (
              <div key={dim} className="flex items-center gap-3">
                <span
                  className="font-sans text-earth-500 w-16 text-right shrink-0"
                  style={{ fontSize: "12px" }}
                >
                  {DIMENSION_LABELS[dim]}
                </span>
                <div className="relative flex-1 h-5 flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={values[dim]}
                    onChange={(e) => handleChange(dim, Number(e.target.value))}
                    className="capital-sketch-slider w-full"
                    style={
                      {
                        "--slider-color": DIMENSION_COLORS[dim],
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
