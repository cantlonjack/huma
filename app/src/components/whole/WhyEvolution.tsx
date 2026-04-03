"use client";

import { useState } from "react";

export interface WhyEvolutionData {
  evolved: boolean;
  evolvedWhy?: string;
  observation?: string;
}

interface WhyEvolutionProps {
  originalWhy: string;
  evolution: WhyEvolutionData;
  onAccept: (newWhy: string) => void;
  onDismiss: () => void;
}

export default function WhyEvolution({
  originalWhy,
  evolution,
  onAccept,
  onDismiss,
}: WhyEvolutionProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !evolution.evolved || !evolution.evolvedWhy) return null;

  const handleAccept = () => {
    onAccept(evolution.evolvedWhy!);
  };

  const handleKeep = () => {
    setDismissed(true);
    onDismiss();
  };

  return (
    <div
      className="mx-4 relative overflow-hidden"
      style={{
        borderRadius: "16px",
        background: "#FDFCF8",
        border: "1px solid #E8E2D6",
      }}
    >
      {/* Thin sage accent line */}
      <div
        style={{
          height: "2px",
          background: "linear-gradient(90deg, #A8C4AA, #6B8F71)",
        }}
      />

      <div style={{ padding: "16px 16px 14px" }}>
        {/* Label */}
        <p
          className="font-sans font-medium"
          style={{
            fontSize: "10px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#A8C4AA",
            marginBottom: "10px",
          }}
        >
          YOUR WHY IS SHIFTING
        </p>

        {/* Observation */}
        {evolution.observation && (
          <p
            className="font-sans"
            style={{
              fontSize: "13px",
              lineHeight: "1.5",
              color: "#6B6358",
              marginBottom: "12px",
            }}
          >
            {evolution.observation}
          </p>
        )}

        {/* Original */}
        <div style={{ marginBottom: "10px" }}>
          <p
            className="font-sans"
            style={{
              fontSize: "11px",
              color: "#A8C4AA",
              marginBottom: "2px",
            }}
          >
            You started with
          </p>
          <p
            className="font-serif"
            style={{
              fontSize: "15px",
              fontStyle: "italic",
              color: "#8B8578",
              lineHeight: "1.4",
            }}
          >
            {originalWhy}
          </p>
        </div>

        {/* Evolved */}
        <div style={{ marginBottom: "14px" }}>
          <p
            className="font-sans"
            style={{
              fontSize: "11px",
              color: "#6B8F71",
              marginBottom: "2px",
            }}
          >
            What you're actually building
          </p>
          <p
            className="font-serif"
            style={{
              fontSize: "16px",
              fontStyle: "italic",
              color: "#3A5A40",
              lineHeight: "1.4",
            }}
          >
            {evolution.evolvedWhy}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleAccept}
            className="font-sans font-medium cursor-pointer"
            style={{
              fontSize: "13px",
              color: "#FAF8F3",
              background: "#3A5A40",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              transition: "opacity 0.2s ease",
            }}
          >
            Use this
          </button>
          <button
            onClick={handleKeep}
            className="font-sans font-medium cursor-pointer"
            style={{
              fontSize: "13px",
              color: "#6B8F71",
              background: "none",
              border: "1px solid #D4CFC4",
              borderRadius: "8px",
              padding: "8px 16px",
              transition: "opacity 0.2s ease",
            }}
          >
            Keep mine
          </button>
        </div>
      </div>
    </div>
  );
}
