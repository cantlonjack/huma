interface Props {
  size?: number;
}

export default function JoyIllustration({ size = 200 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      {/* Center warm glow */}
      <circle
        cx="100"
        cy="100"
        r="16"
        fill="var(--color-amber-400, #E8935A)"
        opacity="0.4"
      />
      <circle
        cx="100"
        cy="100"
        r="28"
        fill="var(--color-amber-400, #E8935A)"
        opacity="0.15"
      />
      {/* Soft rays emanating outward — organic, not geometric */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 100 + Math.cos(rad) * 24;
        const y1 = 100 + Math.sin(rad) * 24;
        const x2 = 100 + Math.cos(rad) * (48 + (i % 3) * 10);
        const y2 = 100 + Math.sin(rad) * (48 + (i % 3) * 10);
        // Offset midpoint for organic curve
        const mx = (x1 + x2) / 2 + Math.sin(rad) * (i % 2 === 0 ? 4 : -4);
        const my = (y1 + y2) / 2 + Math.cos(rad) * (i % 2 === 0 ? -4 : 4);
        return (
          <path
            key={angle}
            d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`}
            stroke="var(--color-amber-200, #F5D4B3)"
            strokeWidth={2.5 - (i % 3) * 0.5}
            strokeLinecap="round"
            fill="none"
            opacity={0.35 + (i % 2) * 0.1}
          />
        );
      })}
      {/* Outermost subtle halo */}
      <circle
        cx="100"
        cy="100"
        r="50"
        stroke="var(--color-sage-300, #A8C4AA)"
        strokeWidth="1"
        fill="none"
        opacity="0.15"
      />
    </svg>
  );
}
