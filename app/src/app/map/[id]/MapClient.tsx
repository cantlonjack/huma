"use client";

import { useEffect, useState } from "react";
import MapDocument from "@/components/canvas/MapDocument";
import LivingCanvas from "@/components/canvas/LivingCanvas";
import type { CanvasData } from "@/engine/canvas-types";
import MapToolbar from "@/components/canvas/MapToolbar";
import ShareButton from "@/components/shared/ShareButton";

interface MapClientProps {
  id: string;
}

type ViewMode = "canvas" | "document";

export default function MapClient({ id }: MapClientProps) {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [canvasData, setCanvasData] = useState<CanvasData | null>(null);
  const [error, setError] = useState(false);
  const [view, setView] = useState<ViewMode>("canvas");

  useEffect(() => {
    let cancelled = false;

    async function loadMap() {
      // 1. Try localStorage first for instant load
      const localRaw = localStorage.getItem(`huma-map-${id}`);
      if (localRaw) {
        try {
          const data = JSON.parse(localRaw);
          if (data.markdown && !cancelled) {
            setMarkdown(data.markdown);
            if (data.canvasData) setCanvasData(data.canvasData);
            else setView("document"); // Legacy map — no canvas
            return;
          }
        } catch {
          // Old format: raw markdown string
          if (!cancelled) {
            setMarkdown(localRaw);
            setView("document");
            return;
          }
        }
      }

      // 2. Try API (Upstash Redis via Vercel KV)
      try {
        const res = await fetch(`/api/maps/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.markdown) {
            setMarkdown(data.markdown);
            if (data.canvasData) setCanvasData(data.canvasData);
            else setView("document");
            // Cache locally for next visit
            localStorage.setItem(`huma-map-${id}`, JSON.stringify(data));
            return;
          }
        }
      } catch {
        // Network error — fall through
      }

      // 3. Nothing found
      if (!cancelled) setError(true);
    }

    loadMap();
    return () => { cancelled = true; };
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-serif text-2xl text-earth-800 mb-3">
            Map not found
          </h1>
          <p className="text-earth-600 mb-6">
            This map may no longer be available. Maps are stored for 90 days.
          </p>
          <a
            href="/"
            className="px-6 py-3 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-all"
          >
            Create a new map
          </a>
        </div>
      </div>
    );
  }

  if (!markdown) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-sage-400 animate-pulse" />
          <span className="inline-block w-2 h-2 rounded-full bg-sage-400 animate-pulse [animation-delay:150ms]" />
          <span className="inline-block w-2 h-2 rounded-full bg-sage-400 animate-pulse [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <MapToolbar
        canvasData={canvasData}
        view={view}
        onViewChange={setView}
        onPrint={() => window.print()}
      >
        <ShareButton canvasData={canvasData} />
        <a
          href="/"
          className="px-4 sm:px-5 py-2 text-sm bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-all font-medium whitespace-nowrap"
        >
          <span className="hidden sm:inline">Start Your Own Map</span>
          <span className="sm:hidden">New Map</span>
        </a>
      </MapToolbar>

      {view === "canvas" && canvasData ? (
        <LivingCanvas data={canvasData} />
      ) : (
        <MapDocument markdown={markdown} />
      )}

    </div>
  );
}
