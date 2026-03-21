interface Props {
  size?: number;
}

export default function JoyIllustration({ size = 200 }: Props) {
  // Organic rays — each hand-positioned with slight asymmetry
  const rays = [
    { d: "M120 82 C122 68, 118 54, 120 42", sw: 2.8, op: 0.5 },
    { d: "M142 90 C154 80, 164 72, 174 66", sw: 2.4, op: 0.45 },
    { d: "M148 112 C162 114, 176 110, 188 108", sw: 2.6, op: 0.4 },
    { d: "M142 134 C154 144, 162 156, 168 168", sw: 2.2, op: 0.35 },
    { d: "M120 142 C118 158, 122 172, 120 184", sw: 2.8, op: 0.45 },
    { d: "M98 134 C86 144, 78 154, 72 166", sw: 2.2, op: 0.35 },
    { d: "M92 112 C78 114, 64 110, 52 108", sw: 2.4, op: 0.4 },
    { d: "M98 90 C86 80, 76 72, 66 66", sw: 2.6, op: 0.45 },
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      aria-hidden="true"
    >
      {/* Warm center glow */}
      <circle
        cx="120"
        cy="112"
        r="18"
        fill="#E8935A"
        opacity="0.35"
      />
      <circle
        cx="120"
        cy="112"
        r="32"
        fill="#E8935A"
        opacity="0.12"
      />
      {/* Radiating rays — organic curves, amber-to-sage */}
      {rays.map((ray, i) => (
        <path
          key={i}
          d={ray.d}
          stroke={i % 2 === 0 ? "#E8935A" : "#8BAF8E"}
          strokeWidth={ray.sw}
          strokeLinecap="round"
          fill="none"
          opacity={ray.op}
        />
      ))}
    </svg>
  );
}
