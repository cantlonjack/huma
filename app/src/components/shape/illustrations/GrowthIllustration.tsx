interface Props {
  size?: number;
}

export default function GrowthIllustration({ size = 200 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      {/* Fiddlehead fern spiral — tight center opening outward */}
      <path
        d="M100 130 C100 120, 105 112, 110 108 C118 102, 120 92, 115 85 C108 78, 98 80, 94 88 C88 98, 92 108, 102 112 C115 118, 128 110, 130 96 C132 80, 120 68, 105 66 C88 64, 76 76, 74 92 C72 112, 84 128, 105 132 C130 136, 148 120, 148 98"
        stroke="var(--color-sage-500, #5C7A62)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      {/* Secondary wisps */}
      <path
        d="M148 98 C150 82, 140 65, 120 58"
        stroke="var(--color-sage-300, #A8C4AA)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      <path
        d="M74 92 C68 78, 72 62, 85 55"
        stroke="var(--color-sage-300, #A8C4AA)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />
      {/* Center dot — the seed */}
      <circle
        cx="100"
        cy="130"
        r="3"
        fill="var(--color-sage-500, #5C7A62)"
        opacity="0.5"
      />
    </svg>
  );
}
