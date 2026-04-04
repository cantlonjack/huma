"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { toPng } from "html-to-image";
import type { Insight, DimensionKey } from "@/types/v2";
import { DIMENSION_COLORS, DIMENSION_LABELS } from "@/types/v2";

// ─── Types ──────────────────────────────────────────────────────

interface ShareworthyInsightCardProps {
  insight: Insight;
  operatorName: string;
  onDismiss: () => void;
}

// ─── Constants ──────────────────────────────────────────────────

const COLORS = {
  bg: "#1A1714",
  sageFill: "rgba(138, 175, 142, 0.08)",
  sageMuted: "#5C7A62",
  sageLabel: "#8BAF8E",
  sandLight: "#EDE6D8",
  sandDark: "#A89E90",
  inkLight: "#C4BAA8",
  divider: "rgba(168, 196, 170, 0.12)",
};

// Card dimensions (for image export)
const CARD_W = 1080;
const CARD_H = 1080;

// ─── Helpers ────────────────────────────────────────────────────

/** Determine if an insight qualifies as shareworthy:
 *  - 3+ dimensions involved
 *  - correlation >= 0.8
 *  - 7+ data points
 */
export function isShareworthyInsight(insight: Insight): boolean {
  return (
    insight.dimensionsInvolved.length >= 3 &&
    insight.dataBasis.correlation >= 0.8 &&
    insight.dataBasis.dataPoints >= 7
  );
}

// ─── Dimension Circle ───────────────────────────────────────────

function DimensionCircle({
  dimension,
  size,
  delay,
}: {
  dimension: DimensionKey;
  size: number;
  delay: number;
}) {
  const color = DIMENSION_COLORS[dimension] || COLORS.sageLabel;
  const label = DIMENSION_LABELS[dimension] || dimension;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        opacity: 0,
        animation: `insight-circle-in 600ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms forwards`,
      }}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          backgroundColor: color,
          opacity: 0.85,
        }}
      />
      <span
        style={{
          fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
          fontSize: "13px",
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: COLORS.sandDark,
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Connection Line (between dimension circles) ────────────────

function ConnectionLine({ width }: { width: number }) {
  return (
    <div
      style={{
        width: `${width}px`,
        height: "1px",
        backgroundColor: COLORS.divider,
        alignSelf: "center",
        marginTop: `-${24 + 6}px`, // pull up to center between circles
        marginBottom: "30px",
      }}
    />
  );
}

// ─── Export Layout (static, for image generation) ───────────────

function ExportLayout({
  insight,
  operatorName,
}: {
  insight: Insight;
  operatorName: string;
}) {
  const dims = insight.dimensionsInvolved as DimensionKey[];
  const circleSize = dims.length <= 3 ? 56 : 44;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "96px 80px",
        position: "relative",
      }}
    >
      {/* Subtle radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(138,175,142,0.05) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* Label */}
      <div
        style={{
          fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: COLORS.sageMuted,
          marginBottom: "48px",
        }}
      >
        HUMA SEES
      </div>

      {/* Dimension circles */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "40px",
          marginBottom: "56px",
        }}
      >
        {dims.map((dim) => (
          <div
            key={dim}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: `${circleSize}px`,
                height: `${circleSize}px`,
                borderRadius: "50%",
                backgroundColor: DIMENSION_COLORS[dim] || COLORS.sageLabel,
                opacity: 0.85,
              }}
            />
            <span
              style={{
                fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: COLORS.sandDark,
              }}
            >
              {DIMENSION_LABELS[dim] || dim}
            </span>
          </div>
        ))}
      </div>

      {/* Thin divider */}
      <div
        style={{
          width: "48px",
          height: "1px",
          backgroundColor: COLORS.divider,
          marginBottom: "48px",
        }}
      />

      {/* Insight text */}
      <div
        style={{
          fontFamily: "'Cormorant Garamond', 'Cormorant', serif",
          fontSize: "30px",
          fontWeight: 400,
          fontStyle: "italic",
          lineHeight: 1.6,
          color: COLORS.sandLight,
          textAlign: "center",
          maxWidth: "760px",
        }}
      >
        {insight.text}
      </div>

      {/* Operator name */}
      <div
        style={{
          fontFamily: "'Cormorant Garamond', 'Cormorant', serif",
          fontSize: "18px",
          fontWeight: 500,
          color: COLORS.inkLight,
          marginTop: "48px",
          letterSpacing: "0.02em",
        }}
      >
        {operatorName}
      </div>

      {/* Footer: HUMA wordmark */}
      <div
        style={{
          position: "absolute",
          bottom: "32px",
          left: "80px",
          right: "80px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
            fontSize: "11px",
            fontWeight: 600,
            color: COLORS.sageMuted,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          HUMA
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', 'Cormorant', serif",
            fontSize: "12px",
            fontStyle: "italic",
            color: COLORS.sageMuted,
          }}
        >
          A connection, revealed
        </div>
      </div>
    </div>
  );
}

// ─── ShareworthyInsightCard ─────────────────────────────────────

export default function ShareworthyInsightCard({
  insight,
  operatorName,
  onDismiss,
}: ShareworthyInsightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [displayScale, setDisplayScale] = useState(0.35);

  const dims = insight.dimensionsInvolved as DimensionKey[];
  const circleSize = dims.length <= 3 ? 56 : 44;

  // Display scale
  useEffect(() => {
    function calc() {
      const maxW = window.innerWidth - 48;
      const maxH = window.innerHeight - 200;
      setDisplayScale(Math.min(maxW / CARD_W, maxH / CARD_H, 0.55));
    }
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onDismiss();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onDismiss]);

  const downloadCard = useCallback(async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        width: CARD_W,
        height: CARD_H,
        pixelRatio: 2,
        backgroundColor: COLORS.bg,
        style: { transform: "scale(1)", transformOrigin: "top left" },
      });
      const link = document.createElement("a");
      link.download = "huma-insight.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate insight card image:", err);
    } finally {
      setDownloading(false);
    }
  }, [downloading]);

  // Build shareable URL — /insight/[id] has proper OG metadata, then redirects to /whole
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/insight/${encodeURIComponent(insight.id)}`
    : "";

  const shareCard = useCallback(async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        width: CARD_W,
        height: CARD_H,
        pixelRatio: 2,
        backgroundColor: COLORS.bg,
        style: { transform: "scale(1)", transformOrigin: "top left" },
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "huma-insight.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "A connection HUMA revealed",
          text: insight.text,
          url: shareUrl,
          files: [file],
        });
      } else {
        // Fallback to download
        const link = document.createElement("a");
        link.download = "huma-insight.png";
        link.href = dataUrl;
        link.click();
      }
    } catch {
      // User cancelled share
    } finally {
      setDownloading(false);
    }
  }, [downloading, insight.text, shareUrl]);

  const displayW = CARD_W * displayScale;
  const displayH = CARD_H * displayScale;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: "rgba(0,0,0,0.82)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <div
        className="min-h-full flex flex-col items-center justify-center gap-6 py-8 px-4"
        style={{
          animation:
            "share-card-in 400ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onDismiss();
        }}
      >
        {/* ─── Visible card (interactive, animated) ─── */}
        <div
          style={{
            backgroundColor: COLORS.bg,
            borderRadius: "12px",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            padding: "56px 40px 48px",
            maxWidth: "540px",
            width: "100%",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle radial glow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 50% 35%, rgba(138,175,142,0.06) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />

          {/* Label */}
          <p
            style={{
              fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: COLORS.sageMuted,
              textAlign: "center",
              marginBottom: "32px",
              position: "relative",
            }}
          >
            HUMA SEES
          </p>

          {/* Dimension circles row */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: "32px",
              marginBottom: "36px",
              position: "relative",
            }}
          >
            {dims.map((dim, i) => (
              <DimensionCircle
                key={dim}
                dimension={dim}
                size={circleSize}
                delay={200 + i * 100}
              />
            ))}
          </div>

          {/* Connection lines between circles */}
          {dims.length > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "28px",
                position: "relative",
              }}
            >
              <ConnectionLine width={Math.min((dims.length - 1) * 72, 280)} />
            </div>
          )}

          {/* Thin divider */}
          <div
            style={{
              width: "36px",
              height: "1px",
              backgroundColor: COLORS.divider,
              margin: "0 auto 28px",
            }}
          />

          {/* Insight text */}
          <p
            style={{
              fontFamily: "'Cormorant Garamond', 'Cormorant', serif",
              fontSize: "22px",
              fontWeight: 400,
              fontStyle: "italic",
              lineHeight: 1.65,
              color: COLORS.sandLight,
              textAlign: "center",
              maxWidth: "440px",
              margin: "0 auto",
              position: "relative",
            }}
          >
            {insight.text}
          </p>

          {/* Operator name */}
          <p
            style={{
              fontFamily: "'Cormorant Garamond', 'Cormorant', serif",
              fontSize: "15px",
              fontWeight: 500,
              color: COLORS.inkLight,
              textAlign: "center",
              marginTop: "32px",
              letterSpacing: "0.02em",
              position: "relative",
            }}
          >
            {operatorName}
          </p>

          {/* HUMA footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "40px",
              position: "relative",
            }}
          >
            <span
              style={{
                fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
                fontSize: "10px",
                fontWeight: 600,
                color: COLORS.sageMuted,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
              }}
            >
              HUMA
            </span>
          </div>
        </div>

        {/* ─── Action buttons ─── */}
        <div className="flex gap-3">
          <button
            onClick={shareCard}
            disabled={downloading}
            className="px-6 py-2.5 text-sm rounded-full transition-all font-sans font-medium disabled:opacity-50"
            style={{ backgroundColor: "#3A5A40", color: "#fff" }}
          >
            {downloading ? "Generating..." : "Share"}
          </button>
          <button
            onClick={downloadCard}
            disabled={downloading}
            className="px-6 py-2.5 text-sm rounded-full border transition-all font-sans font-medium disabled:opacity-50"
            style={{ borderColor: "#5C7A62", color: "#8BAF8E" }}
          >
            Save Image
          </button>
          <button
            onClick={onDismiss}
            className="px-6 py-2.5 text-sm rounded-full border transition-all font-sans"
            style={{ borderColor: "#554D42", color: "#8C8274" }}
          >
            Close
          </button>
        </div>

        {/* ─── Hidden export card (static, no animations, full res) ─── */}
        <div
          style={{
            position: "absolute",
            left: "-9999px",
            top: 0,
            width: `${CARD_W}px`,
            height: `${CARD_H}px`,
            overflow: "hidden",
          }}
        >
          <div
            ref={cardRef}
            style={{
              width: `${CARD_W}px`,
              height: `${CARD_H}px`,
            }}
          >
            <ExportLayout insight={insight} operatorName={operatorName} />
          </div>
        </div>
      </div>
    </div>
  );
}
