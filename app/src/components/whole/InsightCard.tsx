"use client";

import type { Insight } from "@/types/v2";

interface InsightCardProps {
  insight: Insight;
  onDismiss: () => void;
}

export default function InsightCard({ insight, onDismiss }: InsightCardProps) {
  return (
    <div
      className="mx-4 relative overflow-hidden"
      style={{
        borderRadius: "16px",
        background: "white",
        border: "1px solid #E8E2D6",
      }}
    >
      {/* Gradient top border */}
      <div
        style={{
          height: "3px",
          background: "linear-gradient(90deg, #6B8F71, #B5621E)",
        }}
      />

      <div style={{ padding: "16px 16px 14px" }}>
        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="absolute cursor-pointer"
          style={{
            top: "12px",
            right: "12px",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            fontSize: "14px",
            color: "#A8C4AA",
          }}
          aria-label="Dismiss insight"
        >
          &times;
        </button>

        {/* Label */}
        <p
          className="font-sans font-medium"
          style={{
            fontSize: "10px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#A8C4AA",
            marginBottom: "8px",
          }}
        >
          HUMA SEES
        </p>

        {/* Insight text */}
        <p
          className="font-serif"
          style={{
            fontSize: "16px",
            fontStyle: "italic",
            lineHeight: "1.6",
            color: "#3D3B36",
            paddingRight: "20px",
          }}
        >
          {insight.text}
        </p>

        {/* Link */}
        <p
          className="font-sans font-medium"
          style={{
            fontSize: "13px",
            color: "#6B8F71",
            marginTop: "12px",
          }}
        >
          See full pattern &rarr;
        </p>
      </div>
    </div>
  );
}
