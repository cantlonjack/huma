interface Props {
  size?: number;
}

export default function BodyIllustration({ size = 200 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      aria-hidden="true"
    >
      {/* Main stem — organic, varied stroke-width, hand-drawn feel */}
      <path
        d="M120 195 C118 178, 114 162, 116 145 C118 128, 115 112, 118 95 C121 78, 125 62, 132 48 C138 36, 146 28, 155 24"
        stroke="#5C7A62"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      {/* Second stem — mirrors first, slightly thinner */}
      <path
        d="M120 195 C122 176, 126 160, 124 142 C122 125, 125 108, 122 92 C119 76, 114 60, 106 46 C100 36, 90 28, 80 26"
        stroke="#5C7A62"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.65"
      />
      {/* Leaf suggestion — small unfurling from right stem */}
      <path
        d="M128 88 C134 82, 142 80, 148 84 C144 88, 136 90, 128 88"
        stroke="#8BAF8E"
        strokeWidth="2"
        strokeLinecap="round"
        fill="#8BAF8E"
        fillOpacity="0.12"
        opacity="0.6"
      />
      {/* Small leaf from left stem */}
      <path
        d="M114 106 C108 100, 98 98, 92 102 C98 106, 106 108, 114 106"
        stroke="#A8C4AA"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="#A8C4AA"
        fillOpacity="0.1"
        opacity="0.5"
      />
      {/* Root suggestion at base — earth tones */}
      <path
        d="M120 195 C112 200, 104 204, 96 202"
        stroke="#8C8274"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />
      <path
        d="M120 195 C128 202, 138 206, 146 203"
        stroke="#8C8274"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />
    </svg>
  );
}
