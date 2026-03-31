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
    <div className="text-center" style={{ padding: "0 24px" }}>
      <h2
        className="font-serif font-medium"
        style={{ fontSize: "24px", color: "#3A5A40", lineHeight: "1.2" }}
      >
        {name || "You"}
      </h2>

      {/* Archetype */}
      <div style={{ marginTop: "4px", ...pulseStyle }}>
        <button
          onClick={onArchetypeTap}
          className="cursor-pointer"
          style={{ display: "inline", background: "none", border: "none", padding: 0 }}
        >
          <span
            className="font-sans font-medium"
            style={{
              fontSize: "12px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: archetypeDisplay ? "#6B8F71" : "#C8C0B0",
            }}
          >
            {archetypeDisplay || "Tap to set your archetype"}
          </span>
        </button>
        {archetypeDisplay && (
          <button
            onClick={onArchetypeTap}
            className="font-sans cursor-pointer"
            style={{
              display: "block",
              margin: "2px auto 0",
              background: "none",
              border: "none",
              padding: 0,
              fontSize: "12px",
              color: "#A8C4AA",
            }}
          >
            Is this right?
          </button>
        )}
      </div>

      {/* WHY */}
      <div style={{ marginTop: "6px", ...pulseStyle }}>
        {editingWhy ? (
          <div style={{ maxWidth: "320px", margin: "0 auto" }}>
            <input
              ref={whyInputRef}
              type="text"
              value={whyDraft}
              onChange={(e) => setWhyDraft(e.target.value)}
              onBlur={handleWhySave}
              onKeyDown={(e) => { if (e.key === "Enter") handleWhySave(); if (e.key === "Escape") setEditingWhy(false); }}
              className="font-serif w-full text-center"
              style={{
                fontSize: "15px",
                fontStyle: "italic",
                color: "#3A5A40",
                background: "white",
                border: "1px solid #6B8F71",
                borderRadius: "8px",
                padding: "8px 12px",
                outline: "none",
              }}
            />
          </div>
        ) : whyStatement ? (
          <>
            <p
              className="font-serif"
              style={{
                fontSize: "15px",
                fontStyle: "italic",
                color: "#6B8F71",
                lineHeight: "1.4",
                maxWidth: "320px",
                margin: "0 auto",
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
              className="font-sans cursor-pointer"
              style={{
                display: "block",
                margin: "2px auto 0",
                background: "none",
                border: "none",
                padding: 0,
                fontSize: "12px",
                color: "#A8C4AA",
              }}
            >
              Refine &rarr;
            </button>
          </>
        ) : (
          <button
            onClick={hasContext ? () => {} : onWhyTapNoContext}
            className="cursor-pointer"
            style={{
              display: "block",
              margin: "0 auto",
              background: "none",
              border: "none",
              padding: 0,
              maxWidth: "320px",
            }}
          >
            <span
              className="font-serif"
              style={{
                fontSize: "14px",
                fontStyle: "italic",
                color: "#C8C0B0",
                lineHeight: "1.4",
              }}
            >
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
