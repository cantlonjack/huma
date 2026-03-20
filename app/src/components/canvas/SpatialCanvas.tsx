"use client";

import { useEffect, useRef, useState } from "react";
import type { CanvasData } from "@/engine/canvas-types";
import { computeLayout } from "@/lib/canvas-layout";
import SpatialEssence from "./SpatialEssence";
import SpatialRing from "./SpatialRing";
import CapitalRadar from "./CapitalRadar";

interface SpatialCanvasProps {
  data: CanvasData;
}

export default function SpatialCanvas({ data }: SpatialCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 750 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const layout = computeLayout(data, dimensions.width, dimensions.height);
  const { viewBox, center, rings, capitalPositions } = layout;

  // Stagger timing: essence → qol → production → resource → capitals
  const essenceDelay = 0;
  const qolDelay = 700; // after essence entrance
  const productionDelay = qolDelay + rings.qol.length * 50 + 300;
  const resourceDelay = productionDelay + rings.production.length * 50 + 100;
  const capitalDelay = resourceDelay + rings.resource.length * 50 + 300;

  // Mobile: compact height (only QoL ring). Desktop: full height (all 3 rings).
  const isMobile = dimensions.width < 768;
  const containerHeight = isMobile ? "min(50vh, 380px)" : "min(80vh, 700px)";

  return (
    <div
      ref={containerRef}
      className="spatial-canvas-container relative w-full mx-auto"
      style={{
        height: containerHeight,
        maxWidth: "1080px",
        background: "var(--color-sand-50)",
      }}
    >
      <svg
        viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Ring guide circles (very subtle) */}
        {rings.production.length > 0 && (
          <>
            <circle
              cx={center.x}
              cy={center.y}
              r={Math.hypot(
                rings.qol[0]?.position.x - center.x || 0,
                rings.qol[0]?.position.y - center.y || 0,
              ) || 100}
              fill="none"
              stroke="var(--color-sage-200)"
              strokeWidth="0.5"
              opacity="0.2"
              strokeDasharray="4 6"
            />
            <circle
              cx={center.x}
              cy={center.y}
              r={Math.hypot(
                rings.production[0]?.position.x - center.x || 0,
                rings.production[0]?.position.y - center.y || 0,
              ) || 200}
              fill="none"
              stroke="var(--color-sage-200)"
              strokeWidth="0.5"
              opacity="0.15"
              strokeDasharray="4 6"
            />
          </>
        )}

        {/* Capital Radar — behind essence, replacing Ring 3 circles */}
        {!isMobile && data.capitalProfile.length > 0 && (
          <CapitalRadar
            profile={data.capitalProfile}
            size={280}
            animated
            animationDelay={capitalDelay}
            asGroup
            cx={center.x}
            cy={center.y}
            scale={1}
          />
        )}

        {/* Essence Core */}
        <SpatialEssence
          cx={center.x}
          cy={center.y}
          name={data.essence.name}
          land={data.essence.land}
          phrase={data.essence.phrase}
        />

        {/* Ring 1: QoL */}
        <SpatialRing
          pills={rings.qol}
          variant="qol"
          baseDelay={qolDelay}
          stagger={50}
        />

        {/* Ring 2: Production */}
        <SpatialRing
          pills={rings.production}
          variant="production"
          baseDelay={productionDelay}
          stagger={50}
        />

        {/* Ring 2: Resource */}
        <SpatialRing
          pills={rings.resource}
          variant="resource"
          baseDelay={resourceDelay}
          stagger={50}
        />

        {/* Ring 3 capital circles replaced by CapitalRadar at center */}
      </svg>
    </div>
  );
}
