interface Props {
  size?: number;
}

export default function MoneyIllustration({ size = 200 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      {/* Flowing curve — river/stream, thin to wide */}
      <path
        d="M30 120 C50 110, 70 130, 100 105 C130 80, 150 95, 175 85"
        stroke="var(--color-amber-500, #C87A3A)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      {/* Secondary flow — wider, softer */}
      <path
        d="M25 128 C50 118, 75 140, 100 115 C125 90, 155 100, 180 92"
        stroke="var(--color-amber-300, #F0B88A)"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        opacity="0.25"
      />
      {/* Upper accent ripple */}
      <path
        d="M45 108 C65 100, 80 112, 95 100"
        stroke="var(--color-amber-500, #C87A3A)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />
      {/* Wider base wash */}
      <path
        d="M20 135 C55 125, 85 148, 105 122 C125 96, 160 108, 185 98"
        stroke="var(--color-amber-300, #F0B88A)"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
        opacity="0.12"
      />
    </svg>
  );
}
