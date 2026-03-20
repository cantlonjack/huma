interface Props {
  size?: number;
}

export default function HomeIllustration({ size = 200 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      {/* Grounded shape — wide base, tapering upward, like roots and shelter */}
      <path
        d="M50 160 C55 140, 65 120, 80 105 C90 95, 95 80, 100 60 C105 80, 110 95, 120 105 C135 120, 145 140, 150 160"
        stroke="var(--color-earth-600, #554D42)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      {/* Fill wash */}
      <path
        d="M55 158 C60 140, 68 122, 82 108 C92 98, 96 82, 100 65 C104 82, 108 98, 118 108 C132 122, 140 140, 145 158 Z"
        fill="var(--color-earth-600, #554D42)"
        opacity="0.08"
      />
      {/* Accent — sage growth on the shelter */}
      <path
        d="M90 100 C92 88, 96 78, 100 65 C104 78, 108 88, 110 100"
        stroke="var(--color-sage-400, #8BAF8E)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      {/* Base ground line */}
      <path
        d="M35 162 C65 158, 135 158, 165 162"
        stroke="var(--color-earth-600, #554D42)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />
    </svg>
  );
}
