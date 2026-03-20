interface Props {
  size?: number;
}

export default function PeopleIllustration({ size = 200 }: Props) {
  const circles = [
    { cx: 80, cy: 90, r: 18, fill: 'var(--color-sage-400, #8BAF8E)', opacity: 0.6 },
    { cx: 120, cy: 85, r: 22, fill: 'var(--color-sage-400, #8BAF8E)', opacity: 0.7 },
    { cx: 100, cy: 115, r: 16, fill: 'var(--color-earth-500, #6B6358)', opacity: 0.5 },
    { cx: 65, cy: 120, r: 12, fill: 'var(--color-amber-400, #E8935A)', opacity: 0.5 },
    { cx: 135, cy: 110, r: 14, fill: 'var(--color-amber-400, #E8935A)', opacity: 0.4 },
    { cx: 105, cy: 70, r: 10, fill: 'var(--color-sage-400, #8BAF8E)', opacity: 0.45 },
    { cx: 140, cy: 75, r: 8, fill: 'var(--color-earth-500, #6B6358)', opacity: 0.35 },
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      {circles.map((c, i) => (
        <circle key={i} {...c} />
      ))}
      {/* Subtle connection lines between close circles */}
      <line x1="80" y1="90" x2="120" y2="85" stroke="var(--color-sage-300, #A8C4AA)" strokeWidth="1" opacity="0.25" />
      <line x1="100" y1="115" x2="120" y2="85" stroke="var(--color-sage-300, #A8C4AA)" strokeWidth="1" opacity="0.2" />
      <line x1="80" y1="90" x2="100" y2="115" stroke="var(--color-sage-300, #A8C4AA)" strokeWidth="1" opacity="0.2" />
    </svg>
  );
}
