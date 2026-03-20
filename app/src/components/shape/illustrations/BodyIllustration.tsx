interface Props {
  size?: number;
}

export default function BodyIllustration({ size = 200 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      {/* Vertical organic stroke — spine/stem, weighted at bottom, opens at top */}
      <path
        d="M100 175 C96 150, 88 130, 92 110 C96 90, 94 70, 100 50 C106 30, 120 20, 130 18"
        stroke="var(--color-sage-500, #5C7A62)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      <path
        d="M100 175 C104 150, 112 130, 108 110 C104 90, 106 70, 100 50 C94 30, 80 20, 70 18"
        stroke="var(--color-sage-500, #5C7A62)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      {/* Secondary glow — softer, wider */}
      <path
        d="M100 170 C90 140, 82 110, 90 80 C98 50, 110 30, 125 22"
        stroke="var(--color-sage-300, #A8C4AA)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />
      <path
        d="M100 170 C110 140, 118 110, 110 80 C102 50, 90 30, 75 22"
        stroke="var(--color-sage-300, #A8C4AA)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />
      {/* Root weight at bottom */}
      <ellipse
        cx="100"
        cy="178"
        rx="12"
        ry="5"
        fill="var(--color-sage-500, #5C7A62)"
        opacity="0.2"
      />
    </svg>
  );
}
