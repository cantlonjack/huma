"use client";

import { useState, useRef, useEffect } from "react";

interface ProfileBannerProps {
  name: string;
  archetypes?: string[];
  whyStatement?: string;
  computing?: boolean;
  onArchetypeTap: () => void;
  onWhySave: (value: string) => void;
  onWhyTapNoContext: () => void;
  hasContext: boolean;
}

export default function ProfileBanner({
  name,
  archetypes,
  whyStatement,
  computing,
  onArchetypeTap,
  onWhySave,
  onWhyTapNoContext,
  hasContext,
}: ProfileBannerProps) {
  const [editingWhy, setEditingWhy] = useState(false);
  const [whyDraft, setWhyDraft] = useState(whyStatement || "");
  const whyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingWhy && whyInputRef.current) whyInputRef.current.focus();
  }, [editingWhy]);

  useEffect(() => {
    setWhyDraft(whyStatement || "");
  }, [whyStatement]);

  const handleWhySave = () => {
    setEditingWhy(false);
    if (whyDraft.trim() && whyDraft.trim() !== (whyStatement || "")) {
      onWhySave(whyDraft.trim());
    }
  };

  const archetypeDisplay = archetypes && archetypes.length > 0
    ? archetypes.join(" · ")
    : undefined;

  const pulseStyle = computing ? { opacity: 0.5, animation: "banner-pulse 1.5s ease-in-out infinite" } : {};

  return (
    <div className="text-center px-6">
      <h2 className="font-serif font-medium text-2xl text-sage-700 leading-tight">
        {name || "You"}
      </h2>

      {/* Archetype */}
      <div className="mt-1" style={pulseStyle}>
        <button
          onClick={onArchetypeTap}
          className="cursor-pointer inline bg-transparent border-none p-0"
        >
          <span
            className={`font-sans font-medium text-xs tracking-[0.15em] uppercase ${
              archetypeDisplay ? "text-sage-450" : "text-sand-350"
            }`}
          >
            {archetypeDisplay || "Tap to set your archetype"}
          </span>
        </button>
        {archetypeDisplay && (
          <button
            onClick={onArchetypeTap}
            className="font-sans cursor-pointer block mx-auto mt-0.5 bg-transparent border-none p-0 text-xs text-sage-300"
          >
            Is this right?
          </button>
        )}
      </div>

      {/* WHY */}
      <div className="mt-1.5" style={pulseStyle}>
        {editingWhy ? (
          <div className="max-w-[320px] mx-auto">
            <input
              ref={whyInputRef}
              type="text"
              value={whyDraft}
              onChange={(e) => setWhyDraft(e.target.value)}
              onBlur={handleWhySave}
              onKeyDown={(e) => { if (e.key === "Enter") handleWhySave(); if (e.key === "Escape") setEditingWhy(false); }}
              aria-label="WHY statement"
              className="font-serif w-full text-center text-[15px] italic text-sage-700 bg-white border border-sage-450 rounded-lg py-2 px-3 outline-none"
            />
          </div>
        ) : whyStatement ? (
          <>
            <p
              className="font-serif text-[15px] italic text-sage-450 leading-snug max-w-[320px] mx-auto"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {whyStatement}
            </p>
            <button
              onClick={() => { setWhyDraft(whyStatement); setEditingWhy(true); }}
              className="font-sans cursor-pointer block mx-auto mt-0.5 bg-transparent border-none p-0 text-xs text-sage-300"
            >
              Refine &rarr;
            </button>
          </>
        ) : (
          <button
            onClick={hasContext ? () => {} : onWhyTapNoContext}
            className="cursor-pointer block mx-auto bg-transparent border-none p-0 max-w-[320px]"
          >
            <span className="font-serif text-sm italic text-sand-350 leading-snug">
              {computing ? "Computing…" : "Tap to add your WHY"}
            </span>
          </button>
        )}
      </div>

      <style>{`
        @keyframes banner-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
