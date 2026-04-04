"use client";

import type { Insight } from "@/types/v2";

interface InsightCardProps {
  insight: Insight;
  onDismiss: () => void;
  shareworthy?: boolean;
  onShare?: () => void;
}

export default function InsightCard({ insight, onDismiss, shareworthy, onShare }: InsightCardProps) {
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

        {/* Actions row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "12px",
          }}
        >
          <p
            className="font-sans font-medium"
            style={{
              fontSize: "13px",
              color: "#6B8F71",
              margin: 0,
            }}
          >
            See full pattern &rarr;
          </p>

          {shareworthy && onShare && (
            <button
              onClick={onShare}
              className="font-sans font-medium cursor-pointer"
              style={{
                fontSize: "12px",
                color: "#B5621E",
                background: "none",
                border: "none",
                padding: "0 0 0 8px",
                letterSpacing: "0.04em",
              }}
            >
              Share this
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
