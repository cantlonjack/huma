"use client";

import { useEffect, useState } from "react";
import MapDocument from "@/components/MapDocument";
import LivingCanvas from "@/components/canvas/LivingCanvas";
import type { CanvasData } from "@/engine/canvas-types";
import { copyCurrentUrl } from "@/lib/clipboard";

interface MapClientProps {
  id: string;
}

type ViewMode = "canvas" | "document";

export default function MapClient({ id }: MapClientProps) {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [canvasData, setCanvasData] = useState<CanvasData | null>(null);
  const [error, setError] = useState(false);
  const [showToast, setShowToast] = useState(false);
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

  const handleShare = async () => {
    const ok = await copyCurrentUrl();
    if (ok) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

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
            className="px-6 py-3 bg-amber-400 text-earth-900 rounded-full hover:bg-amber-500 transition-all"
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
      {/* Top bar */}
      <div className="no-print sticky top-0 z-10 bg-sand-50/[0.92] backdrop-blur-[16px] border-b border-sand-300 px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
        <a href="/" className="font-serif text-[15px] font-medium tracking-[0.25em] uppercase text-sage-700 hover:text-sage-800 transition-colors shrink-0">
          HUMA
        </a>
        <div className="flex gap-2 sm:gap-3 items-center flex-wrap justify-end">
          {/* View toggle — only show if canvasData exists */}
          {canvasData && (
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
          )}
          <button
            onClick={handleShare}
            className="px-4 sm:px-5 py-2 text-sm border border-sand-300 rounded-full text-earth-500 hover:border-sage-400 hover:text-sage-700 transition-all whitespace-nowrap"
          >
            Share
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 sm:px-5 py-2 text-sm bg-amber-400 text-earth-900 rounded-full hover:bg-amber-500 transition-all font-medium whitespace-nowrap hidden sm:block"
          >
            Save as PDF
          </button>
          <a
            href="/"
            className="px-4 sm:px-5 py-2 text-sm bg-amber-600 text-earth-900 rounded-full hover:bg-amber-500 transition-all font-medium whitespace-nowrap"
          >
            <span className="hidden sm:inline">Start Your Own Map</span>
            <span className="sm:hidden">New Map</span>
          </a>
        </div>
      </div>

      {/* Content */}
      {view === "canvas" && canvasData ? (
        <LivingCanvas data={canvasData} />
      ) : (
        <MapDocument markdown={markdown} />
      )}

      {showToast && (
        <div className="toast">
          Link copied to clipboard
        </div>
      )}
    </div>
  );
}
