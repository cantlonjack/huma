interface Props {
  size?: number;
}

export default function PurposeIllustration({ size = 200 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      aria-hidden="true"
    >
      {/* Layered forms suggesting fog clearing — opacity creates depth */}
      {/* Background fog layer */}
      <path
        d="M30 155 C55 150, 80 160, 105 150 C130 140, 155 148, 180 142 C195 138, 205 132, 215 128"
        stroke="#A8C4AA"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        opacity="0.1"
      />
      {/* Mid fog layer */}
      <path
        d="M35 140 C58 135, 78 145, 100 135 C122 125, 142 132, 165 124 C182 118, 195 112, 210 106"
        stroke="#8BAF8E"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.18"
      />
      {/* The path emerging — clear line through the fog */}
      <path
        d="M42 148 C60 142, 76 150, 95 138 C114 126, 130 132, 150 120 C168 108, 180 100, 195 88"
        stroke="#5C7A62"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      {/* Horizon line — clarity at the destination */}
      <path
        d="M160 80 C175 74, 192 70, 210 68"
        stroke="#2E6B8A"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      {/* Starting point */}
      <circle
        cx="42"
        cy="148"
        r="3.5"
        fill="#5C7A62"
        opacity="0.35"
      />
    </svg>
  );
}
