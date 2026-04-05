"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import type { DimensionKey } from "@/types/v2";
import { DIMENSION_COLORS } from "@/types/v2";

interface AspirationSummary {
  status?: string;
  stage?: string;
  dimensionsTouched?: DimensionKey[];
  behaviors?: { dimensions?: DimensionKey[] }[];
}

function getDotColor(asp: AspirationSummary): string {
  const s = asp.status || asp.stage || "active";
  if (s === "archived" || s === "paused") return "#6B6358"; // earth-500
  if (s === "finding" || s === "no_path") return "#B5621E"; // amber-600

  // Active — use first dimension color, fall back to sage
  const dims = asp.dimensionsTouched?.length
    ? asp.dimensionsTouched
    : asp.behaviors?.flatMap((b) => b.dimensions || []) || [];
  return dims[0] ? DIMENSION_COLORS[dims[0]] : "#8BAF8E"; // sage-300 fallback
}

/**
 * Tiny 28px SVG showing a membrane outline + colored dots for each aspiration.
 * Lives in BottomNav above the "Whole" label. Reactive to aspiration changes.
 */
export default function WholeMiniIndicator() {
  const { user } = useAuth();
  const [dots, setDots] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let aspirations: AspirationSummary[] = [];

      if (user) {
        try {
          const supabase = createClient();
          if (supabase) {
            const { data } = await supabase
              .from("aspirations")
              .select("status, stage, dimensions_touched, behaviors")
              .eq("user_id", user.id)
              .not("status", "eq", "archived");
            if (data) {
              aspirations = data.map((a) => ({
                status: a.status,
                stage: a.stage,
                dimensionsTouched: a.dimensions_touched,
                behaviors: a.behaviors,
              }));
            }
          }
        } catch {
          // Fall through to localStorage
        }
      }

      // Fallback to localStorage
      if (aspirations.length === 0) {
        try {
          const raw = localStorage.getItem("huma-v2-aspirations");
          if (raw) aspirations = JSON.parse(raw);
        } catch {
          /* empty */
        }
      }

      if (!cancelled) {
        setDots(aspirations.slice(0, 6).map(getDotColor));
      }
    }

    load();

    // Listen for storage changes (cross-tab or same-tab updates)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "huma-v2-aspirations") load();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
    };
  }, [user]);

  const size = 28;
  const cx = size / 2;
  const cy = size / 2;
  const membraneR = 11;
  const orbitR = 7;
  const nodeR = 2.5;
  const hasDots = dots.length > 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      {/* Membrane outline */}
      <circle
        cx={cx}
        cy={cy}
        r={membraneR}
        stroke="currentColor"
        strokeWidth={1}
        fill="none"
        opacity={hasDots ? 0.5 : 0.25}
        style={{
          transition: "opacity 600ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />

      {/* Center nucleus */}
      <circle cx={cx} cy={cy} r={1.5} fill="currentColor" opacity={0.35} />

      {/* Aspiration dots */}
      {dots.map((color, i) => {
        const angle =
          (i / Math.max(dots.length, 1)) * Math.PI * 2 - Math.PI / 2;
        const nx = cx + Math.cos(angle) * orbitR;
        const ny = cy + Math.sin(angle) * orbitR;
        return (
          <circle
            key={i}
            cx={nx}
            cy={ny}
            r={nodeR}
            fill={color}
            opacity={0.7}
            style={{
              transition: "all 600ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        );
      })}
    </svg>
  );
}
