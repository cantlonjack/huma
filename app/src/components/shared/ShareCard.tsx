"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { toPng } from "html-to-image";
import type { CanvasData, CapitalScore, CapitalForm } from "@/engine/canvas-types";

// ─── Types ──────────────────────────────────────────────────────

type CardFormat = "square" | "og";

interface ShareCardProps {
  data: CanvasData;
  format?: CardFormat;
  onClose: () => void;
}

// ─── Constants ──────────────────────────────────────────────────

const CAPITAL_ORDER: CapitalForm[] = [
  "financial", "material", "living", "social",
  "intellectual", "experiential", "spiritual", "cultural",
];

const CAPITAL_LABELS: Record<CapitalForm, string> = {
  financial: "Financial",
  material: "Material",
  living: "Living",
  social: "Social",
  intellectual: "Intellectual",
  experiential: "Experiential",
  spiritual: "Spiritual",
  cultural: "Cultural",
};

const COLORS = {
  bg: "#1A1714",
  sageFill: "rgba(138, 175, 142, 0.30)",
  sageStroke: "#A8C4AA",
  sageMuted: "#5C7A62",
  sageLabel: "#8BAF8E",
  sandLight: "#EDE6D8",
  sandMid: "#DDD4C0",
  sandDark: "#A89E90",
  axisLine: "rgba(168, 196, 170, 0.15)",
  gridLine: "rgba(168, 196, 170, 0.08)",
};

// ─── Radar Chart (pure SVG) ─────────────────────────────────────

function RadarChart({ profile, size }: { profile: CapitalScore[]; size: number }) {
  // Use a viewBox larger than the radar so labels never clip
  const vbSize = 600;
  const cx = vbSize / 2;
  const cy = vbSize / 2;
  const maxR = vbSize * 0.34;   // shape fits inside this
  const labelR = vbSize * 0.44;  // labels outside the shape

  const sorted = CAPITAL_ORDER.map(
    (form) => profile.find((p) => p.form === form) || { form, score: 1, note: "" }
  );

  function polarToXY(index: number, radius: number): [number, number] {
    const angle = (Math.PI * 2 * index) / 8 - Math.PI / 2;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  }

  const shapePoints = sorted.map((cap, i) => {
    const r = (cap.score / 5) * maxR;
    return polarToXY(i, r);
  });
  const shapePath =
    shapePoints.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ") + " Z";

  const rings = [1, 2, 3, 4, 5];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${vbSize} ${vbSize}`}
      style={{ display: "block" }}
    >
      {/* Grid rings */}
      {rings.map((level) => {
        const r = (level / 5) * maxR;
        const pts = Array.from({ length: 8 }, (_, i) => polarToXY(i, r));
        const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ") + " Z";
        return <path key={level} d={d} fill="none" stroke={COLORS.gridLine} strokeWidth={1} />;
      })}

      {/* Axis lines */}
      {sorted.map((_, i) => {
        const [x, y] = polarToXY(i, maxR);
        return (
          <line key={`axis-${i}`} x1={cx} y1={cy} x2={x} y2={y} stroke={COLORS.axisLine} strokeWidth={1} />
        );
      })}

      {/* Filled shape */}
      <path d={shapePath} fill={COLORS.sageFill} stroke={COLORS.sageStroke} strokeWidth={2} />

      {/* Score dots */}
      {shapePoints.map(([x, y], i) => (
        <circle key={`dot-${i}`} cx={x} cy={y} r={4} fill={COLORS.sageStroke} />
      ))}

      {/* Axis labels */}
      {sorted.map((cap, i) => {
        const [x, y] = polarToXY(i, labelR);
        return (
          <text
            key={`label-${i}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={COLORS.sageLabel}
            style={{
              fontSize: 16,
              fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {CAPITAL_LABELS[cap.form]}
          </text>
        );
      })}
    </svg>
  );
}

// ─── ShareCard Component ────────────────────────────────────────

export default function ShareCard({ data, format = "square", onClose }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [activeFormat, setActiveFormat] = useState<CardFormat>(format);
  const [downloading, setDownloading] = useState(false);
  const [displayScale, setDisplayScale] = useState(0.35);

  const isSquare = activeFormat === "square";
  const width = isSquare ? 1080 : 1200;
  const height = isSquare ? 1080 : 630;
  const radarSize = isSquare ? 520 : 380;

  // Calculate display scale on mount and resize
  useEffect(() => {
    function calc() {
      const maxW = window.innerWidth - 64;
      const maxH = window.innerHeight - 200;
      const scaleW = maxW / width;
      const scaleH = maxH / height;
      setDisplayScale(Math.min(scaleW, scaleH, 0.6));
    }
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [width, height]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const enterprises = data.enterprises.slice(0, 4);
  const essencePhrase = data.essence.phrase;

  const downloadCard = useCallback(async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        width,
        height,
        pixelRatio: 2,
        backgroundColor: COLORS.bg,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });
      const link = document.createElement("a");
      link.download = `huma-life-shape-${activeFormat}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate card image:", err);
    } finally {
      setDownloading(false);
    }
  }, [downloading, width, height, activeFormat]);

  const shareCard = useCallback(async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        width,
        height,
        pixelRatio: 2,
        backgroundColor: COLORS.bg,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "huma-life-shape.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `${data.essence.name}'s Life Shape`,
          text: "My life, mapped.",
          files: [file],
        });
      } else {
        const link = document.createElement("a");
        link.download = `huma-life-shape-${activeFormat}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch {
      // User cancelled share or error
    } finally {
      setDownloading(false);
    }
  }, [downloading, width, height, activeFormat, data.essence.name]);

  const displayW = width * displayScale;
  const displayH = height * displayScale;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="min-h-full flex flex-col items-center justify-center gap-5 py-8 px-4"
        style={{ animation: "share-card-in 400ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Format toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFormat("square")}
            className="px-4 py-1.5 text-xs rounded-full border transition-all font-sans"
            style={{
              backgroundColor: isSquare ? "#3A5A40" : "transparent",
              color: isSquare ? "#fff" : "#DDD4C0",
              borderColor: isSquare ? "#4A6E50" : "#554D42",
            }}
          >
            1080 × 1080
          </button>
          <button
            onClick={() => setActiveFormat("og")}
            className="px-4 py-1.5 text-xs rounded-full border transition-all font-sans"
            style={{
              backgroundColor: !isSquare ? "#3A5A40" : "transparent",
              color: !isSquare ? "#fff" : "#DDD4C0",
              borderColor: !isSquare ? "#4A6E50" : "#554D42",
            }}
          >
            1200 × 630
          </button>
        </div>

        {/* Card container — scaled for display, exported at full res */}
        <div
          style={{
            width: `${displayW}px`,
            height: `${displayH}px`,
            overflow: "hidden",
            borderRadius: "8px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          <div
            ref={cardRef}
            style={{
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor: COLORS.bg,
              transform: `scale(${displayScale})`,
              transformOrigin: "top left",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Subtle radial glow */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse at 50% 40%, rgba(138,175,142,0.06) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            {isSquare ? (
              <SquareLayout data={data} radarSize={radarSize} enterprises={enterprises} essencePhrase={essencePhrase} />
            ) : (
              <OGLayout data={data} radarSize={radarSize} enterprises={enterprises} essencePhrase={essencePhrase} />
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={downloadCard}
            disabled={downloading}
            className="px-6 py-2.5 text-sm rounded-full transition-all font-sans font-medium disabled:opacity-50"
            style={{ backgroundColor: "#3A5A40", color: "#fff" }}
          >
            {downloading ? "Generating..." : "Download PNG"}
          </button>
          <button
            onClick={shareCard}
            disabled={downloading}
            className="px-6 py-2.5 text-sm rounded-full border transition-all font-sans font-medium disabled:opacity-50"
            style={{ borderColor: "#5C7A62", color: "#8BAF8E" }}
          >
            Share
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm rounded-full border transition-all font-sans"
            style={{ borderColor: "#554D42", color: "#8C8274" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Square Layout (1080×1080) ──────────────────────────────────

function SquareLayout({
  data, radarSize, enterprises, essencePhrase,
}: {
  data: CanvasData; radarSize: number;
  enterprises: CanvasData["enterprises"]; essencePhrase: string;
}) {
  return (
    <div
      style={{
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "72px 80px 56px",
        position: "relative",
      }}
    >
      {/* TOP: Name + location */}
      <div>
        <div style={{
          fontFamily: "'Cormorant Garamond', 'Cormorant', serif",
          fontSize: "36px", fontWeight: 500, color: COLORS.sandLight,
          letterSpacing: "0.01em", lineHeight: 1.2,
        }}>
          {data.essence.name}
        </div>
        <div style={{
          fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
          fontSize: "16px", fontWeight: 400, color: COLORS.sageLabel,
          marginTop: "8px", letterSpacing: "0.03em",
        }}>
          {data.essence.land}
        </div>
      </div>

      {/* CENTER: Radar chart */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <RadarChart profile={data.capitalProfile} size={radarSize} />
      </div>

      {/* BOTTOM */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        {/* Bottom-left: enterprises */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {enterprises.map((ent) => (
            <div key={ent.name} style={{
              fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
              fontSize: "15px", fontWeight: 400, color: COLORS.sandDark, lineHeight: 1.4,
            }}>
              {ent.name}
            </div>
          ))}
        </div>

        {/* Bottom-right: essence phrase */}
        <div style={{
          fontFamily: "'Cormorant Garamond', 'Cormorant', serif",
          fontSize: "20px", fontStyle: "italic", fontWeight: 400,
          color: COLORS.sandLight, maxWidth: "360px", textAlign: "right", lineHeight: 1.4,
        }}>
          {essencePhrase}
        </div>
      </div>

      {/* FOOTER: HUMA wordmark */}
      <div style={{
        position: "absolute", bottom: "24px", left: "80px", right: "80px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{
          fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
          fontSize: "11px", fontWeight: 600, color: COLORS.sageMuted,
          letterSpacing: "0.2em", textTransform: "uppercase",
        }}>
          HUMA
        </div>
        <div style={{
          fontFamily: "'Cormorant Garamond', 'Cormorant', serif",
          fontSize: "12px", fontStyle: "italic", color: COLORS.sageMuted,
        }}>
          A living canvas
        </div>
      </div>
    </div>
  );
}

// ─── OG Layout (1200×630) ───────────────────────────────────────

function OGLayout({
  data, radarSize, enterprises, essencePhrase,
}: {
  data: CanvasData; radarSize: number;
  enterprises: CanvasData["enterprises"]; essencePhrase: string;
}) {
  return (
    <div
      style={{
        width: "100%", height: "100%",
        display: "flex", position: "relative",
        padding: "48px 56px 40px",
      }}
    >
      {/* LEFT: Radar chart */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        flex: "0 0 auto", width: `${radarSize + 40}px`,
      }}>
        <RadarChart profile={data.capitalProfile} size={radarSize} />
      </div>

      {/* RIGHT: Text content */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        justifyContent: "space-between", paddingLeft: "32px",
      }}>
        {/* Name + location */}
        <div>
          <div style={{
            fontFamily: "'Cormorant Garamond', 'Cormorant', serif",
            fontSize: "32px", fontWeight: 500, color: COLORS.sandLight,
            letterSpacing: "0.01em", lineHeight: 1.2,
          }}>
            {data.essence.name}
          </div>
          <div style={{
            fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
            fontSize: "14px", fontWeight: 400, color: COLORS.sageLabel,
            marginTop: "6px", letterSpacing: "0.03em",
          }}>
            {data.essence.land}
          </div>
        </div>

        {/* Essence phrase */}
        <div style={{
          fontFamily: "'Cormorant Garamond', 'Cormorant', serif",
          fontSize: "20px", fontStyle: "italic", fontWeight: 400,
          color: COLORS.sandLight, lineHeight: 1.5, maxWidth: "420px",
        }}>
          {essencePhrase}
        </div>

        {/* Enterprises */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {enterprises.map((ent) => (
            <div key={ent.name} style={{
              fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
              fontSize: "13px", fontWeight: 400, color: COLORS.sandDark, lineHeight: 1.4,
            }}>
              {ent.name}
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER: HUMA wordmark */}
      <div style={{
        position: "absolute", bottom: "16px", left: "56px", right: "56px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{
          fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
          fontSize: "10px", fontWeight: 600, color: COLORS.sageMuted,
          letterSpacing: "0.2em", textTransform: "uppercase",
        }}>
          HUMA
        </div>
        <div style={{
          fontFamily: "'Cormorant Garamond', 'Cormorant', serif",
          fontSize: "11px", fontStyle: "italic", color: COLORS.sageMuted,
        }}>
          A living canvas
        </div>
      </div>
    </div>
  );
}
