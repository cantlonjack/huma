"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MapDocument from "@/components/canvas/MapDocument";
import LivingCanvas from "@/components/canvas/LivingCanvas";
import { SAMPLE_MAP_MARKDOWN, SAMPLE_CANVAS_DATA } from "@/data/sample-maps/sample-map";
import { MAYA_MAP_MARKDOWN, MAYA_CANVAS_DATA } from "@/data/sample-maps/sample-map-maya";
import { trackEvent } from "@/lib/analytics";
import MapToolbar from "@/components/canvas/MapToolbar";
import ShareButton from "@/components/shared/ShareButton";

type ViewMode = "canvas" | "document";
type SampleProfile = "sarah" | "maya";

const PROFILES = {
  sarah: {
    label: "Sarah Chen",
    subtitle: "Land Operator",
    location: "Southern Oregon · 12 acres",
    markdown: SAMPLE_MAP_MARKDOWN,
    canvas: SAMPLE_CANVAS_DATA,
    shape: [4, 3, 5, 4, 4, 3, 4, 3] as number[],
  },
  maya: {
    label: "Maya Okafor",
    subtitle: "Life Designer",
    location: "Chicago · Freelance UX",
    markdown: MAYA_MAP_MARKDOWN,
    canvas: MAYA_CANVAS_DATA,
    shape: [3, 3, 2, 4, 5, 4, 3, 3] as number[],
  },
};

export default function SampleMapClient() {
  const [view, setView] = useState<ViewMode>("canvas");
  const [profile, setProfile] = useState<SampleProfile>("sarah");

  const current = PROFILES[profile];

  useEffect(() => {
    trackEvent("sample_map_viewed", { profile });
  }, [profile]);

  return (
    <div className="min-h-screen">
      <MapToolbar
        canvasData={current.canvas}
        view={view}
        onViewChange={setView}
      >
        {/* Profile selector */}
        <div className="flex items-center gap-1 rounded-full bg-sand-100 p-0.5">
          {(Object.entries(PROFILES) as [SampleProfile, typeof current][]).map(([key, p]) => (
            <button
              key={key}
              onClick={() => setProfile(key)}
              className={`px-3 py-1.5 text-xs rounded-full transition-all font-sans whitespace-nowrap ${
                profile === key
                  ? "bg-white text-earth-900 shadow-sm font-medium"
                  : "text-earth-500 hover:text-earth-700"
              }`}
            >
              <span className="hidden sm:inline">{p.label}</span>
              <span className="sm:hidden">{p.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        <span className="text-xs text-earth-500 italic hidden md:inline">
          {current.subtitle}
        </span>

        <ShareButton canvasData={current.canvas} />
        <Link
          href="/"
          className="px-4 sm:px-5 py-2 text-sm bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-all font-medium whitespace-nowrap"
        >
          <span className="hidden sm:inline">Start Your Own Map</span>
          <span className="sm:hidden">Start Map</span>
        </Link>
      </MapToolbar>

      {view === "canvas" ? (
        <LivingCanvas key={profile} data={current.canvas} />
      ) : (
        <MapDocument
          key={profile}
          markdown={current.markdown}
          shapeScores={current.shape}
          operatorName={current.canvas.essence.name}
        />
      )}
    </div>
  );
}
