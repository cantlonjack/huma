interface Props {
  size?: number;
}

export default function MoneyIllustration({ size = 200 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      aria-hidden="true"
    >
      {/* Main flowing line — water finding its path, amber tones */}
      <path
        d="M32 140 C52 132, 68 148, 90 130 C112 112, 128 124, 150 108 C170 94, 182 102, 208 88"
        stroke="#C87A3A"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      {/* Secondary current — softer, wider */}
      <path
        d="M28 150 C50 142, 72 158, 94 140 C116 122, 134 134, 156 118 C176 104, 190 110, 212 98"
        stroke="#E8935A"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />
      {/* Upper ripple — thin, delicate */}
      <path
        d="M52 126 C68 120, 82 130, 96 122"
        stroke="#C87A3A"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      {/* Wash underneath — the depth */}
      <path
        d="M36 155 C60 148, 80 166, 100 148 C120 130, 140 142, 164 126 C182 114, 196 118, 214 106"
        stroke="#E8935A"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        opacity="0.12"
      />
    </svg>
  );
}
