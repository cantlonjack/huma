interface Props {
  size?: number;
}

export default function IdentityIllustration({ size = 200 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      {/* Overlapping organic forms converging — fragments becoming whole */}
      <path
        d="M75 105 C70 85, 80 70, 95 68 C105 66, 112 72, 110 82"
        stroke="var(--color-sage-400, #8BAF8E)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="var(--color-sage-400, #8BAF8E)"
        fillOpacity="0.1"
        opacity="0.6"
      />
      <path
        d="M125 105 C130 85, 120 70, 105 68 C95 66, 88 72, 90 82"
        stroke="var(--color-amber-400, #E8935A)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="var(--color-amber-400, #E8935A)"
        fillOpacity="0.1"
        opacity="0.5"
      />
      <path
        d="M85 125 C78 115, 82 100, 95 95 C105 92, 115 95, 118 105"
        stroke="var(--color-earth-400, #8C8274)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="var(--color-earth-400, #8C8274)"
        fillOpacity="0.08"
        opacity="0.5"
      />
      {/* Center convergence point */}
      <circle
        cx="100"
        cy="95"
        r="8"
        fill="var(--color-sage-400, #8BAF8E)"
        opacity="0.2"
      />
      <circle
        cx="100"
        cy="95"
        r="3"
        fill="var(--color-sage-500, #5C7A62)"
        opacity="0.35"
      />
      {/* Outer whisper — the whole holding */}
      <circle
        cx="100"
        cy="98"
        r="35"
        stroke="var(--color-sage-300, #A8C4AA)"
        strokeWidth="1"
        fill="none"
        opacity="0.15"
        strokeDasharray="4 6"
      />
    </svg>
  );
}
