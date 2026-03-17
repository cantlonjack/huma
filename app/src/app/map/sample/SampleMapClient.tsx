"use client";

import { useEffect, useState } from "react";
import MapDocument from "@/components/MapDocument";
import LivingCanvas from "@/components/canvas/LivingCanvas";
import { SAMPLE_MAP_MARKDOWN, SAMPLE_CANVAS_DATA } from "@/lib/sample-map";
import { trackEvent } from "@/lib/analytics";

type ViewMode = "canvas" | "document";

const SAMPLE_SHAPE = [4, 3, 5, 4, 4, 3, 4, 3];

export default function SampleMapClient() {
  const [view, setView] = useState<ViewMode>("canvas");

  useEffect(() => {
    trackEvent("sample_map_viewed");
  }, []);

  return (
    <div className="min-h-screen">
      <div className="no-print sticky top-0 z-10 bg-sand-50/[0.92] backdrop-blur-[16px] border-b border-sand-300 px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
        <a
          href="/"
          className="font-serif text-[15px] font-medium tracking-[0.25em] uppercase text-sage-700 hover:text-sage-800 transition-colors shrink-0"
        >
          HUMA
        </a>
        <div className="flex gap-2 sm:gap-3 items-center">
          {/* View toggle */}
          <div className="flex bg-sand-100 rounded-full p-0.5 border border-sand-200">
            <button
              onClick={() => setView("canvas")}
              className={`px-3 sm:px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                view === "canvas"
                  ? "bg-white text-sage-700 shadow-sm"
                  : "text-earth-500 hover:text-earth-700"
              }`}
            >
              Canvas
            </button>
            <button
              onClick={() => setView("document")}
              className={`px-3 sm:px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                view === "document"
                  ? "bg-white text-sage-700 shadow-sm"
                  : "text-earth-500 hover:text-earth-700"
              }`}
            >
              Document
            </button>
          </div>
          <span className="text-xs text-earth-500 italic hidden sm:inline">Sample map</span>
          <a
            href="/"
            className="px-4 sm:px-5 py-2 text-sm bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-all font-medium whitespace-nowrap"
          >
            <span className="hidden sm:inline">Start Your Own Map</span>
            <span className="sm:hidden">Start Map</span>
          </a>
        </div>
      </div>

      {view === "canvas" ? (
        <LivingCanvas data={SAMPLE_CANVAS_DATA} />
      ) : (
        <MapDocument
          markdown={SAMPLE_MAP_MARKDOWN}
          shapeScores={SAMPLE_SHAPE}
          operatorName="Sarah Chen"
        />
      )}
    </div>
  );
}
