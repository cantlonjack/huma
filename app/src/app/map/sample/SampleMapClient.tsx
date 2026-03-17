"use client";

import { useEffect, useState } from "react";
import MapDocument from "@/components/MapDocument";
import LivingCanvas from "@/components/canvas/LivingCanvas";
import { SAMPLE_MAP_MARKDOWN, SAMPLE_CANVAS_DATA } from "@/lib/sample-map";
import { trackEvent } from "@/lib/analytics";
import MapToolbar from "@/components/MapToolbar";

type ViewMode = "canvas" | "document";

const SAMPLE_SHAPE = [4, 3, 5, 4, 4, 3, 4, 3];

export default function SampleMapClient() {
  const [view, setView] = useState<ViewMode>("canvas");

  useEffect(() => {
    trackEvent("sample_map_viewed");
  }, []);

  return (
    <div className="min-h-screen">
      <MapToolbar
        canvasData={SAMPLE_CANVAS_DATA}
        view={view}
        onViewChange={setView}
      >
        <span className="text-xs text-earth-500 italic hidden sm:inline">Sample map</span>
        <a
          href="/"
          className="px-4 sm:px-5 py-2 text-sm bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-all font-medium whitespace-nowrap"
        >
          <span className="hidden sm:inline">Start Your Own Map</span>
          <span className="sm:hidden">Start Map</span>
        </a>
      </MapToolbar>

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
