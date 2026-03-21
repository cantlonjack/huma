interface Props {
  size?: number;
}

export default function GrowthIllustration({ size = 200 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      aria-hidden="true"
    >
      {/* Fiddlehead fern — tight spiral unfurling outward, sage-to-sky gradient feel */}
      <path
        d="M120 155 C120 142, 126 132, 134 126 C144 118, 146 106, 138 98 C130 90, 118 92, 114 102 C110 114, 116 124, 128 128 C144 134, 158 124, 160 108 C162 90, 148 76, 130 74 C110 72, 98 84, 96 102 C94 124, 108 142, 132 148 C160 154, 178 138, 178 112"
        stroke="#5C7A62"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      {/* Extension whisp upward — where growth reaches */}
      <path
        d="M178 112 C180 94, 168 76, 150 66"
        stroke="#2E6B8A"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      {/* Inner whisp */}
      <path
        d="M96 102 C88 86, 92 68, 108 60"
        stroke="#A8C4AA"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />
      {/* Seed point */}
      <circle
        cx="120"
        cy="155"
        r="3.5"
        fill="#5C7A62"
        opacity="0.4"
      />
    </svg>
  );
}
