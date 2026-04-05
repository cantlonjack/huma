"use client";

interface SpatialEssenceProps {
  cx: number;
  cy: number;
  name: string;
  land: string;
  phrase: string;
  animate?: boolean;
}

export default function SpatialEssence({
  cx,
  cy,
  name,
  land,
  phrase,
  animate = true,
}: SpatialEssenceProps) {
  const glowRadius = 70;

  return (
    <g
      className={animate ? "spatial-essence-enter" : ""}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      {/* Breathing glow */}
      <circle
        cx={cx}
        cy={cy}
        r={glowRadius}
        fill="url(#essenceGlow)"
        className="spatial-essence-breathe"
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* Inner subtle ring */}
      <circle
        cx={cx}
        cy={cy}
        r={glowRadius * 0.6}
        fill="none"
        stroke="var(--color-sage-200)"
        strokeWidth="1"
        opacity="0.5"
      />

      {/* Name */}
      <text
        x={cx}
        y={cy - 14}
        textAnchor="middle"
        className="font-serif text-[1.1rem] font-medium fill-sage-800"
      >
        {name}
      </text>

      {/* Land */}
      <text
        x={cx}
        y={cy + 6}
        textAnchor="middle"
        className="font-sans text-[0.7rem] font-normal fill-earth-500"
      >
        {land}
      </text>

      {/* Phrase */}
      <text
        x={cx}
        y={cy + 26}
        textAnchor="middle"
        className="font-serif text-[0.75rem] font-light italic fill-sage-600"
      >
        {phrase}
      </text>

      {/* Gradient definition */}
      <defs>
        <radialGradient id="essenceGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-sage-100)" stopOpacity="0.9" />
          <stop offset="50%" stopColor="var(--color-sage-50)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--color-sage-50)" stopOpacity="0" />
        </radialGradient>
      </defs>
    </g>
  );
}
