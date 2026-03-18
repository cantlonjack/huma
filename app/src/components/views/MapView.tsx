"use client";

import { useState } from "react";
import type { CanvasData } from "@/engine/canvas-types";
import type { ConversationContext } from "@/engine/types";
import { computeAggregateCapitalScores } from "@/engine/enterprise-templates";
import { copyCurrentUrl } from "@/lib/clipboard";
import { trackEvent } from "@/lib/analytics";
import MapDocument from "@/components/MapDocument";
import LivingCanvas from "@/components/canvas/LivingCanvas";
import MapToolbar from "@/components/MapToolbar";
import ErrorBoundary from "@/components/ErrorBoundary";

const SAMPLE_SHAPE_SCORES = [4, 3, 5, 4, 4, 3, 4, 3];

interface MapViewProps {
  mapMarkdown: string;
  mapCanvasData: CanvasData | null;
  operatorName: string;
  contextSnapshot: Partial<ConversationContext>;
  onBack: () => void;
}

export default function MapView({
  mapMarkdown,
  mapCanvasData,
  operatorName,
  contextSnapshot,
  onBack,
}: MapViewProps) {
  const [mapView, setMapView] = useState<"canvas" | "document">("canvas");
  const [showToast, setShowToast] = useState(false);

  const handleShare = async () => {
    const ok = await copyCurrentUrl();
    if (ok) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      trackEvent("share_button_clicked");
    }
  };

  const shapeScores = contextSnapshot.enterprises?.selected?.length
    ? computeAggregateCapitalScores(contextSnapshot.enterprises.selected)
    : SAMPLE_SHAPE_SCORES;

  return (
    <div className="min-h-screen">
      <MapToolbar
        canvasData={mapCanvasData}
        view={mapView}
        onViewChange={setMapView}
        onPrint={() => window.print()}
      >
        <button
          onClick={handleShare}
          className="px-4 sm:px-5 py-2 text-sm border border-sand-300 rounded-full text-earth-700 hover:bg-sand-100 transition-colors whitespace-nowrap"
          title="Copy shareable link to clipboard"
        >
          Copy Link
        </button>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-earth-500 hover:text-earth-700 transition-colors whitespace-nowrap"
        >
          Back
        </button>
      </MapToolbar>
      {mapView === "canvas" && mapCanvasData ? (
        <ErrorBoundary
          context="canvas"
          fallback={
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <p className="font-serif text-2xl text-earth-800 mb-3">Canvas couldn&apos;t render</p>
              <p className="text-earth-600 mb-6">Your map document is still available.</p>
              <button
                onClick={() => setMapView("document")}
                className="px-6 py-3 bg-amber-600 text-white font-medium rounded-full hover:bg-amber-700 transition-all"
              >
                View Document
              </button>
            </div>
          }
        >
          <LivingCanvas data={mapCanvasData} />
        </ErrorBoundary>
      ) : (
        <ErrorBoundary context="document">
          <MapDocument
            markdown={mapMarkdown}
            shapeScores={shapeScores}
            operatorName={operatorName}
          />
        </ErrorBoundary>
      )}
      {showToast && (
        <div className="toast">Link copied to clipboard</div>
      )}
    </div>
  );
}
