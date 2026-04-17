"use client";

import Link from "next/link";
import type { CanvasData } from "@/engine/canvas-types";

type ViewMode = "canvas" | "document";

interface MapToolbarProps {
  canvasData: CanvasData | null;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  onPrint?: () => void;
  children?: React.ReactNode;
}

export default function MapToolbar({
  canvasData,
  view,
  onViewChange,
  onPrint,
  children,
}: MapToolbarProps) {
  return (
    <div className="no-print sticky top-0 z-10 bg-sand-50/[0.92] backdrop-blur-[16px] border-b border-sand-300 px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
      <Link
        href="/"
        className="font-serif text-[15px] font-medium tracking-[0.25em] uppercase text-sage-700 hover:text-sage-800 transition-colors shrink-0"
      >
        HUMA
      </Link>
      <div className="flex gap-1.5 sm:gap-3 items-center justify-end overflow-x-auto">
        {canvasData && (
          <div className="flex bg-sand-100 rounded-full p-0.5 border border-sand-200">
            <button
              onClick={() => onViewChange("canvas")}
              className={`px-3 sm:px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                view === "canvas"
                  ? "bg-white text-sage-700 shadow-sm"
                  : "text-earth-500 hover:text-earth-700"
              }`}
            >
              Canvas
            </button>
            <button
              onClick={() => onViewChange("document")}
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
        {onPrint && (
          <button
            onClick={onPrint}
            className="px-4 sm:px-5 py-2 text-sm bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-all font-medium whitespace-nowrap"
          >
            <span className="hidden sm:inline">Save as PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
