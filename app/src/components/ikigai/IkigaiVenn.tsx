"use client";

import { motion } from "framer-motion";
import { HUMA_EASE } from "@/lib/constants";

interface IkigaiVennProps {
  love: string[];
  good: string[];
  need: string[];
  size?: number;
  animate?: boolean;
}

export default function IkigaiVenn({
  love,
  good,
  need,
  size = 300,
  animate = true,
}: IkigaiVennProps) {
  const isEmpty = love.length === 0 && good.length === 0 && need.length === 0;

  // Circle centers (in 300x280 viewBox)
  const circles = [
    { cx: 150, cy: 95, label: "Love", items: love, color: "#C5D86D" },
    { cx: 95, cy: 185, label: "Good at", items: good, color: "#5C7A62" },
    { cx: 205, cy: 185, label: "Need", items: need, color: "#2E6B8A" },
  ];

  const r = 70;

  return (
    <svg
      viewBox="0 0 300 280"
      width={size}
      height={(size * 280) / 300}
      role="img"
      aria-label="Ikigai Venn diagram"
    >
      {/* Circle fills */}
      {circles.map((c, i) => (
        <motion.circle
          key={c.label}
          cx={c.cx}
          cy={c.cy}
          r={r}
          fill={c.color}
          fillOpacity={isEmpty ? 0.1 : 0.2}
          stroke={c.color}
          strokeWidth={1.5}
          strokeOpacity={isEmpty ? 0.25 : 0.4}
          initial={animate ? { r: 0, fillOpacity: 0 } : undefined}
          animate={animate ? { r, fillOpacity: isEmpty ? 0.1 : 0.2 } : undefined}
          transition={
            animate
              ? { duration: 0.6, delay: i * 0.15, ease: HUMA_EASE }
              : undefined
          }
        />
      ))}

      {/* Intersection overlays for visual depth */}
      <clipPath id="clip-love">
        <circle cx={150} cy={95} r={r} />
      </clipPath>
      <clipPath id="clip-good">
        <circle cx={95} cy={185} r={r} />
      </clipPath>
      <clipPath id="clip-need">
        <circle cx={205} cy={185} r={r} />
      </clipPath>

      {/* Love ∩ Good */}
      <circle
        cx={95}
        cy={185}
        r={r}
        fill="#5C7A62"
        fillOpacity={isEmpty ? 0.05 : 0.12}
        clipPath="url(#clip-love)"
      />
      {/* Love ∩ Need */}
      <circle
        cx={205}
        cy={185}
        r={r}
        fill="#2E6B8A"
        fillOpacity={isEmpty ? 0.05 : 0.12}
        clipPath="url(#clip-love)"
      />
      {/* Good ∩ Need */}
      <circle
        cx={205}
        cy={185}
        r={r}
        fill="#2E6B8A"
        fillOpacity={isEmpty ? 0.05 : 0.12}
        clipPath="url(#clip-good)"
      />

      {/* Labels */}
      {circles.map((c) => (
        <text
          key={`label-${c.label}`}
          x={c.cx}
          y={c.label === "Love" ? c.cy - 40 : c.cy + 50}
          textAnchor="middle"
          fill={c.color}
          fillOpacity={0.8}
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "0.75rem",
            fontWeight: 500,
          }}
        >
          {c.label}
        </text>
      ))}

      {/* Entry pills inside circles */}
      {circles.map((c) => {
        const startY = c.label === "Love" ? c.cy - 20 : c.cy - 10;
        const maxShow = 4;
        const shown = c.items.slice(0, maxShow);
        return shown.map((item, j) => (
          <text
            key={`${c.label}-${j}`}
            x={c.cx}
            y={startY + j * 16}
            textAnchor="middle"
            fill="#1A1714"
            fillOpacity={0.7}
            style={{
              fontFamily: "var(--font-source-sans)",
              fontSize: "0.55rem",
              fontWeight: 400,
            }}
          >
            {item.length > 14 ? item.slice(0, 12) + "..." : item}
          </text>
        ));
      })}

      {/* Overflow indicators */}
      {circles.map((c) => {
        if (c.items.length <= 4) return null;
        return (
          <text
            key={`overflow-${c.label}`}
            x={c.cx}
            y={
              (c.label === "Love" ? c.cy - 20 : c.cy - 10) +
              4 * 16
            }
            textAnchor="middle"
            fill="#A89E90"
            style={{
              fontFamily: "var(--font-source-sans)",
              fontSize: "0.5rem",
            }}
          >
            +{c.items.length - 4} more
          </text>
        );
      })}
    </svg>
  );
}
