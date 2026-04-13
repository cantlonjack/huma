"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { toPng } from "html-to-image";
import type { Insight, DimensionKey } from "@/types/v2";
import { DIMENSION_COLORS } from "@/types/v2";
import { ConnectionThreads } from "@/components/shared/ConnectionThreads";

// ─── Types ──────────────────────────────────────────────────────

interface ShareworthyInsightCardProps {
  insight: Insight;
  operatorName: string;
  onDismiss: () => void;
}

// ─── Constants ──────────────────────────────────────────────────

const COLORS = {
  bg: "#1A1714",
  bgLight: "rgba(138, 175, 142, 0.04)",
  sand200: "#F5F0E8",
  earth400: "#8C8274",
  earth500: "#6B6358",
  earth600: "#554D42",
  earth700: "#3D3830",
  divider: "rgba(168, 196, 170, 0.12)",
};

const CARD_W = 1080;
const CARD_H = 1080;

// ─── Helpers ────────────────────────────────────────────────────

/** Determine if an insight qualifies as shareworthy.
 *  Standard: 3+ dimensions, correlation >= 0.8, 7+ data points.
 *  Structural: 4+ dimensions, correlation >= 0.7 (day-1 shareable).
 */
export function isShareworthyInsight(insight: Insight): boolean {
  const dims = insight.dimensionsInvolved.length;
  const corr = insight.dataBasis.correlation;
  const pts = insight.dataBasis.dataPoints;

  // Standard behavioral insight threshold
  if (dims >= 3 && corr >= 0.8 && pts >= 7) return true;

  // Structural insight threshold — shareable from day 1
  if (dims >= 4 && corr >= 0.7) return true;

  return false;
}

/** Build evidence label from data basis. */
function evidenceLabel(insight: Insight): string {
  const pts = insight.dataBasis.dataPoints;
  const dims = insight.dimensionsInvolved.length;

  // Structural insight: no temporal data needed
  if (dims >= 4 && insight.dataBasis.correlation >= 0.7 && pts < 7) {
    return "FROM STRUCTURE";
  }

  if (pts >= 21) return "CONFIRMED OVER 3 WEEKS";
  if (pts >= 14) return "CONFIRMED OVER 2 WEEKS";
  return `${pts} DAYS OF DATA`;
}

/** Truncate text to ~4 lines worth (roughly 160 chars). */
function truncateText(text: string, maxLen = 160): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).replace(/\s+\S*$/, "") + "...";
}

// ─── Dimension Dot Divider ──────────────────────────────────────

function DotDivider({ dims, inline }: { dims: DimensionKey[]; inline?: boolean }) {
  const style = inline
    ? { display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }
    : { display: "flex", alignItems: "center", justifyContent: "center", gap: "14px" };
  const dotSize = inline ? 5 : 6;

  return (
    <div style={style}>
      {dims.map((dim) => (
        <div
          key={dim}
          style={{
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            borderRadius: "50%",
            backgroundColor: DIMENSION_COLORS[dim],
            opacity: 0.8,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

// ─── Export Layout (static, for image generation — inline styles) ──

function ExportLayout({
  insight,
  operatorName,
}: {
  insight: Insight;
  operatorName: string;
}) {
  const dims = insight.dimensionsInvolved as DimensionKey[];
  const evidence = evidenceLabel(insight);

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
        padding: "80px 80px",
        position: "relative",
      }}
    >
      {/* Subtle radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 38%, rgba(138,175,142,0.06) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Signature constellation — the centerpiece */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "48px",
        }}
      >
        <ConnectionThreads
          activeDimensions={dims}
          size="signature"
          darkMode
          animate={false}
        />
      </div>

      {/* Dot divider — active dimension colors */}
      <div style={{ marginBottom: "48px" }}>
        <DotDivider dims={dims} />
      </div>

      {/* Insight text */}
      <div
        style={{
          fontFamily: "'Cormorant Garamond', 'Cormorant', serif",
          fontSize: "28px",
          fontWeight: 400,
          fontStyle: "italic",
          lineHeight: 1.65,
          color: COLORS.sand200,
          textAlign: "center",
          maxWidth: "760px",
        }}
      >
        {truncateText(insight.text)}
      </div>

      {/* Evidence line */}
      <div
        style={{
          fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: COLORS.earth400,
          marginTop: "40px",
          textAlign: "center",
        }}
      >
        — {evidence} —
      </div>

      {/* Footer: HUMA · @operatorname */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
            fontSize: "10px",
            fontWeight: 600,
            color: COLORS.earth500,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          HUMA
        </span>
        {operatorName && (
          <>
            <span style={{ color: COLORS.earth600, fontSize: "10px" }}>·</span>
            <span
              style={{
                fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
                fontSize: "10px",
                fontWeight: 500,
                color: COLORS.earth500,
                letterSpacing: "0.05em",
              }}
            >
              @{operatorName.toLowerCase().replace(/\s+/g, "")}
            </span>
          </>
        )}
      </div>

      {/* Border via inset box-shadow (since border doesn't affect layout) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "16px",
          border: `1px solid ${COLORS.earth700}`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// ─── Share Bottom Sheet ─────────────────────────────────────────

function ShareBottomSheet({
  onCopyImage,
  onSaveImage,
  onNativeShare,
  onClose,
  hasNativeShare,
  busy,
}: {
  onCopyImage: () => void;
  onSaveImage: () => void;
  onNativeShare: () => void;
  onClose: () => void;
  hasNativeShare: boolean;
  busy: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md bg-earth-900 rounded-t-2xl border border-earth-700 border-b-0 pb-safe"
        style={{ animation: "share-sheet-up 300ms cubic-bezier(0.22, 1, 0.36, 1)" }}
      >
        <div className="w-10 h-1 bg-earth-600 rounded-full mx-auto mt-3 mb-4" />

        <div className="px-6 pb-6 flex flex-col gap-2">
          {/* Copy image */}
          <button
            onClick={onCopyImage}
            disabled={busy}
            className="w-full py-3 rounded-xl text-sm font-sans font-medium text-sand-200 bg-earth-800 hover:bg-earth-700 transition-colors disabled:opacity-50"
          >
            Copy image
          </button>

          {/* Save to photos */}
          <button
            onClick={onSaveImage}
            disabled={busy}
            className="w-full py-3 rounded-xl text-sm font-sans font-medium text-sand-200 bg-earth-800 hover:bg-earth-700 transition-colors disabled:opacity-50"
          >
            Save to photos
          </button>

          {/* Native share (if available) */}
          {hasNativeShare && (
            <button
              onClick={onNativeShare}
              disabled={busy}
              className="w-full py-3 rounded-xl text-sm font-sans font-medium text-sage-400 bg-sage-700/20 hover:bg-sage-700/30 transition-colors disabled:opacity-50"
            >
              Share...
            </button>
          )}

          {/* Cancel */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-sans text-earth-400 mt-1"
          >
            Cancel
          </button>
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
  const [busy, setBusy] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);

  const dims = insight.dimensionsInvolved as DimensionKey[];
  const evidence = evidenceLabel(insight);

  // Check for Web Share API support
  useEffect(() => {
    setHasNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (showSheet) setShowSheet(false);
        else onDismiss();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onDismiss, showSheet]);

  // Shareable URL
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/insight/${encodeURIComponent(insight.id)}`
    : "";

  /** Generate the PNG blob from the hidden export card. */
  const generatePng = useCallback(async (): Promise<{ dataUrl: string; blob: Blob } | null> => {
    if (!cardRef.current) return null;
    try {
      // Brief delay for SVG/font settling
      await new Promise((r) => setTimeout(r, 500));

      const dataUrl = await toPng(cardRef.current, {
        width: CARD_W,
        height: CARD_H,
        pixelRatio: 2, // 2160×2160 retina
        backgroundColor: COLORS.bg,
        style: { transform: "scale(1)", transformOrigin: "top left" },
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      return { dataUrl, blob };
    } catch (err) {
      console.error("Failed to generate insight card image:", err);
      return null;
    }
  }, []);

  /** Copy image to clipboard. */
  const handleCopyImage = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await generatePng();
      if (!result) return;

      // ClipboardItem with PNG
      if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
        const item = new ClipboardItem({ "image/png": result.blob });
        await navigator.clipboard.write([item]);
      }
      setShowSheet(false);
    } catch (err) {
      console.error("Copy to clipboard failed:", err);
    } finally {
      setBusy(false);
    }
  }, [busy, generatePng]);

  /** Download image. */
  const handleSaveImage = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await generatePng();
      if (!result) return;
      const link = document.createElement("a");
      link.download = "huma-insight.png";
      link.href = result.dataUrl;
      link.click();
      setShowSheet(false);
    } catch (err) {
      console.error("Save image failed:", err);
    } finally {
      setBusy(false);
    }
  }, [busy, generatePng]);

  /** Native share with image + text. */
  const handleNativeShare = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await generatePng();
      if (!result) return;
      const file = new File([result.blob], "huma-insight.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "A connection HUMA revealed",
          text: `HUMA showed me something about my life I didn't see. ${shareUrl}`,
          files: [file],
        });
      }
      setShowSheet(false);
    } catch {
      // User cancelled share — that's fine
    } finally {
      setBusy(false);
    }
  }, [busy, generatePng, shareUrl]);

  // Track share event
  const handleShareOpen = useCallback(() => {
    setShowSheet(true);
    // Track insight_shared event
    try {
      const w = window as Window & { gtag?: (...args: unknown[]) => void };
      w.gtag?.("event", "insight_shared", {
        insight_type: insight.dataBasis.pattern,
        dimension_count: dims.length,
      });
    } catch { /* analytics optional */ }
  }, [insight.dataBasis.pattern, dims.length]);

  return (
    <>
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80"
        onClick={(e) => { if (e.target === e.currentTarget) onDismiss(); }}
      >
        <div
          className="min-h-full flex flex-col items-center justify-center gap-6 py-8 px-4 animate-share-card-in"
          onClick={(e) => { if (e.target === e.currentTarget) onDismiss(); }}
        >
          {/* ─── Visible card (interactive, animated) ─── */}
          <div
            className="rounded-2xl max-w-[420px] w-full relative overflow-hidden"
            style={{
              backgroundColor: COLORS.bg,
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
              border: `1px solid ${COLORS.earth700}`,
              padding: "48px 32px 40px",
            }}
          >
            {/* Subtle radial glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 32%, rgba(138,175,142,0.06) 0%, transparent 55%)",
              }}
            />

            {/* Signature constellation — the centerpiece, the shape IS the insight */}
            <div className="flex justify-center mb-8 relative">
              <ConnectionThreads
                activeDimensions={dims}
                size="signature"
                darkMode
              />
            </div>

            {/* Dot divider — active dimension colors in a line */}
            <div className="flex justify-center mb-7 relative">
              <DotDivider dims={dims} inline />
            </div>

            {/* Insight text */}
            <p
              className="font-serif italic leading-[1.65] text-center mx-auto relative"
              style={{
                fontSize: "20px",
                color: COLORS.sand200,
                maxWidth: "340px",
              }}
            >
              {truncateText(insight.text)}
            </p>

            {/* Evidence line */}
            <p
              className="font-sans font-semibold text-center mt-6 relative"
              style={{
                fontSize: "10px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: COLORS.earth400,
              }}
            >
              — {evidence} —
            </p>

            {/* Footer: HUMA · @operator */}
            <div className="flex justify-center items-center gap-2 mt-8 relative">
              <span
                className="font-sans font-semibold"
                style={{
                  fontSize: "10px",
                  color: COLORS.earth500,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                HUMA
              </span>
              {operatorName && (
                <>
                  <span style={{ color: COLORS.earth600, fontSize: "10px" }}>·</span>
                  <span
                    className="font-sans"
                    style={{
                      fontSize: "10px",
                      fontWeight: 500,
                      color: COLORS.earth500,
                      letterSpacing: "0.05em",
                    }}
                  >
                    @{operatorName.toLowerCase().replace(/\s+/g, "")}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* ─── Action buttons ─── */}
          <div className="flex gap-3">
            <button
              onClick={handleShareOpen}
              disabled={busy}
              className="px-6 py-2.5 text-sm rounded-full transition-all font-sans font-medium disabled:opacity-50 bg-sage-700 text-white"
            >
              Share
            </button>
            <button
              onClick={handleSaveImage}
              disabled={busy}
              className="px-6 py-2.5 text-sm rounded-full border border-sage-500 transition-all font-sans font-medium disabled:opacity-50 text-sage-400"
            >
              {busy ? "Generating..." : "Save Image"}
            </button>
            <button
              onClick={onDismiss}
              className="px-6 py-2.5 text-sm rounded-full border border-earth-600 transition-all font-sans text-earth-400"
            >
              Close
            </button>
          </div>

          {/* ─── Hidden export card (static, full res, no animations) ─── */}
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
              style={{ width: `${CARD_W}px`, height: `${CARD_H}px` }}
            >
              <ExportLayout insight={insight} operatorName={operatorName} />
            </div>
          </div>
        </div>
      </div>

      {/* Share bottom sheet */}
      {showSheet && (
        <ShareBottomSheet
          onCopyImage={handleCopyImage}
          onSaveImage={handleSaveImage}
          onNativeShare={handleNativeShare}
          onClose={() => setShowSheet(false)}
          hasNativeShare={hasNativeShare}
          busy={busy}
        />
      )}
    </>
  );
}
