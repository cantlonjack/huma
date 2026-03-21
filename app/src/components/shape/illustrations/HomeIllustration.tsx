interface Props {
  size?: number;
}

export default function HomeIllustration({ size = 200 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      aria-hidden="true"
    >
      {/* Nested arch — shelter form, warm earth tones */}
      <path
        d="M60 175 C62 148, 72 120, 88 100 C100 86, 112 78, 120 72 C128 78, 140 86, 152 100 C168 120, 178 148, 180 175"
        stroke="#554D42"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.65"
      />
      {/* Inner arch — the held space */}
      <path
        d="M82 170 C84 150, 90 130, 102 116 C110 106, 118 100, 120 96 C122 100, 130 106, 138 116 C150 130, 156 150, 158 170"
        stroke="#8C8274"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="#8C8274"
        fillOpacity="0.06"
        opacity="0.55"
      />
      {/* Growth at the peak — sage accent */}
      <path
        d="M116 78 C118 68, 120 58, 122 48"
        stroke="#8BAF8E"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />
      <path
        d="M122 48 C126 56, 130 62, 128 70"
        stroke="#A8C4AA"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />
      {/* Ground line */}
      <path
        d="M44 178 C80 174, 160 174, 196 178"
        stroke="#554D42"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.25"
      />
    </svg>
  );
}
