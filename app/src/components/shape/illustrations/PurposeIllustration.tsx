interface Props {
  size?: number;
}

export default function PurposeIllustration({ size = 200 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      {/* Organic path finding its way — river through landscape */}
      <path
        d="M40 145 C55 140, 65 130, 75 122 C88 112, 95 105, 108 98 C122 90, 135 82, 150 72 C158 66, 162 60, 165 52"
        stroke="var(--color-sage-500, #5C7A62)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      {/* Broader path wash */}
      <path
        d="M38 150 C55 144, 68 135, 78 126 C92 115, 100 108, 112 100 C128 90, 140 80, 155 68 C162 62, 166 55, 168 48"
        stroke="var(--color-sage-300, #A8C4AA)"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        opacity="0.2"
      />
      {/* Horizon suggestion — sky accent */}
      <path
        d="M130 55 C145 48, 160 44, 175 42"
        stroke="var(--color-sky, #2E6B8A)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />
      {/* Faint horizon line */}
      <path
        d="M120 50 C140 46, 165 42, 185 40"
        stroke="var(--color-sky, #2E6B8A)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.1"
      />
      {/* Starting point marker */}
      <circle
        cx="40"
        cy="145"
        r="3"
        fill="var(--color-sage-500, #5C7A62)"
        opacity="0.4"
      />
    </svg>
  );
}
