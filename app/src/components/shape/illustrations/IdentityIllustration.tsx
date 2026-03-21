interface Props {
  size?: number;
}

export default function IdentityIllustration({ size = 200 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      aria-hidden="true"
    >
      {/* Mosaic fragments converging toward center — sage with earth accents */}
      {/* Upper-left fragment */}
      <path
        d="M82 88 C76 74, 84 60, 98 58 C108 56, 116 64, 112 76 C108 86, 92 94, 82 88"
        stroke="#5C7A62"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="#8BAF8E"
        fillOpacity="0.1"
        opacity="0.65"
      />
      {/* Upper-right fragment */}
      <path
        d="M158 88 C164 74, 156 60, 142 58 C132 56, 124 64, 128 76 C132 86, 148 94, 158 88"
        stroke="#8BAF8E"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="#A8C4AA"
        fillOpacity="0.08"
        opacity="0.55"
      />
      {/* Lower fragment */}
      <path
        d="M100 148 C90 140, 92 124, 106 118 C118 112, 132 118, 136 130 C140 142, 128 152, 116 150 C108 148, 102 150, 100 148"
        stroke="#8C8274"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="#8C8274"
        fillOpacity="0.06"
        opacity="0.5"
      />
      {/* Center convergence — where the fragments meet */}
      <circle
        cx="120"
        cy="102"
        r="10"
        fill="#8BAF8E"
        opacity="0.15"
      />
      <circle
        cx="120"
        cy="102"
        r="4"
        fill="#5C7A62"
        opacity="0.35"
      />
      {/* Holding circle — dashed, the whole */}
      <circle
        cx="120"
        cy="105"
        r="48"
        stroke="#A8C4AA"
        strokeWidth="1.2"
        fill="none"
        opacity="0.15"
        strokeDasharray="5 7"
      />
    </svg>
  );
}
