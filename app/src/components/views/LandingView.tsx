"use client";

import { useState } from "react";
import { type Phase, PHASES } from "@/engine/types";
import { type SavedConversation } from "@/lib/persistence";
import ShapeChart from "@/components/ShapeChart";

const SAMPLE_SHAPE_SCORES = [4, 3, 5, 4, 4, 3, 4, 3];

function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function phaseLabel(phase: Phase): string {
  const info = PHASES.find((p) => p.id === phase);
  const idx = PHASES.findIndex((p) => p.id === phase);
  return info ? `${idx + 1}/6 \u2014 ${info.label}` : "";
}

interface LandingViewProps {
  savedConvo: SavedConversation | null;
  onStart: () => void;
  onResume: (saved: SavedConversation) => void;
  onClearSaved: () => void;
}

export default function LandingView({ savedConvo, onStart, onResume, onClearSaved }: LandingViewProps) {
  const [confirmFresh, setConfirmFresh] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sage-50/40 via-transparent to-amber-400/5 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center px-6 pt-16 md:pt-24 pb-16">
        <p className="text-sm uppercase tracking-[0.4em] text-sage-600 mb-12 md:mb-16 font-medium">
          HUMA
        </p>

        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-earth-900 text-center leading-[1.15] mb-10 max-w-2xl">
          See your land and your life as a connected whole
        </h1>

        <div className="my-6 md:my-10">
          <ShapeChart
            scores={SAMPLE_SHAPE_SCORES}
            className="w-60 h-60 md:w-72 md:h-72 lg:w-80 lg:h-80"
            animated
            breathing
          />
        </div>

        <p className="text-base md:text-lg text-earth-600 text-center max-w-lg leading-relaxed mb-10">
          A living systems design tool that reads your purpose, your
          landscape, and your enterprises &mdash; then maps where they
          meet, with real numbers.
        </p>

        <button
          onClick={onStart}
          className="group px-10 py-4 bg-amber-600 text-white text-lg font-medium rounded-full hover:bg-amber-700 transition-all hover:shadow-lg hover:shadow-amber-600/20"
        >
          Start Your Map
          <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
        </button>

        <a
          href="/map/sample"
          className="mt-5 text-sm text-sage-600 hover:text-sage-700 transition-colors"
        >
          See an example map &rarr;
        </a>

        {savedConvo && (
          <div className="mt-10 text-center">
            <p className="font-serif text-sm italic text-earth-500 mb-3">
              Welcome back, {savedConvo.operatorName}.
            </p>
            <button
              onClick={() => onResume(savedConvo)}
              className="px-6 py-3 text-sage-700 border border-sage-300 rounded-full hover:bg-sage-50 transition-colors text-sm"
            >
              Continue your map
              <span className="block text-xs text-earth-500 mt-0.5">
                {phaseLabel(savedConvo.phase)} &middot; {formatTimeAgo(savedConvo.savedAt)}
              </span>
            </button>
            {confirmFresh ? (
              <span className="ml-3 text-sm">
                <span className="text-earth-600">Delete saved conversation?</span>
                {" "}
                <button
                  onClick={() => { onClearSaved(); setConfirmFresh(false); }}
                  className="text-amber-500 hover:text-amber-600 font-medium transition-colors"
                >
                  Yes, start fresh
                </button>
                {" "}
                <button
                  onClick={() => setConfirmFresh(false)}
                  className="text-earth-500 hover:text-earth-700 transition-colors"
                >
                  Cancel
                </button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmFresh(true)}
                className="ml-3 text-sm text-earth-500 hover:text-earth-700 transition-colors underline underline-offset-2"
              >
                Start fresh
              </button>
            )}
          </div>
        )}

        <div className="w-16 h-px bg-sand-300 mt-20 mb-16" />

        <h2 className="font-serif text-xl md:text-2xl text-earth-800 text-center mb-8">
          Six traditions of regenerative thought
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl w-full">
          {[
            { name: "Holistic Management", author: "Savory & Palmer" },
            { name: "Regrarians Platform", author: "Doherty" },
            { name: "Enterprise Economics", author: "Perkins" },
            { name: "8 Forms of Capital", author: "Roland & Landua" },
            { name: "Regenerative Principles", author: "Sanford" },
            { name: "Knowledge as Code", author: "Adri\u00e0" },
          ].map((t) => (
            <div key={t.name} className="px-4 py-3 rounded-lg bg-sand-100/60 text-center">
              <span className="font-medium text-sm text-earth-800 block">{t.name}</span>
              <span className="text-xs text-earth-500">{t.author}</span>
            </div>
          ))}
        </div>

        <p className="mt-14 text-sm text-earth-500 text-center">
          About 45 minutes &middot; Receive a printable Regenerative Enterprise Map
        </p>
        <p className="mt-3 text-xs text-earth-400 text-center max-w-sm">
          Your conversation stays between you and HUMA. Maps are stored
          securely and shared only when you choose.
        </p>
      </div>
    </div>
  );
}
