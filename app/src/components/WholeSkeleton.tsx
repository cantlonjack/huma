/** Skeleton loader for the Whole tab — mimics ProfileBanner + WholeShape */
export default function WholeSkeleton() {
  return (
    <div aria-hidden="true" role="presentation">
      {/* Profile banner skeleton */}
      <div style={{ padding: "0 24px", marginTop: "16px" }}>
        {/* Name */}
        <div className="skeleton" style={{ width: "40%", height: "22px", marginBottom: "8px" }} />
        {/* Archetypes */}
        <div className="skeleton" style={{ width: "55%", height: "14px", marginBottom: "12px" }} />
        {/* WHY statement */}
        <div className="skeleton" style={{ width: "80%", height: "14px", marginBottom: "4px" }} />
        <div className="skeleton" style={{ width: "60%", height: "14px" }} />
      </div>

      {/* Shape placeholder — concentric circles */}
      <div
        className="flex items-center justify-center"
        style={{ marginTop: "24px", width: "100%", height: "280px" }}
      >
        <svg width="280" height="280" viewBox="0 0 280 280" fill="none">
          {/* Foundation ring */}
          <circle
            cx="140" cy="140" r="130"
            stroke="var(--color-sand-200)"
            strokeWidth="1"
            strokeDasharray="8 6"
            opacity="0.5"
          />
          {/* Patterns ring */}
          <circle
            cx="140" cy="140" r="90"
            stroke="var(--color-sand-200)"
            strokeWidth="1"
            strokeDasharray="6 4"
            opacity="0.6"
          />
          {/* Identity nucleus */}
          <circle
            cx="140" cy="140" r="36"
            fill="var(--color-sand-200)"
            className="skeleton-circle"
          />
          {/* Satellite node placeholders */}
          {[45, 120, 200, 280, 340].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const r = i < 3 ? 90 : 130;
            const cx = 140 + r * Math.cos(rad);
            const cy = 140 + r * Math.sin(rad);
            const size = i < 3 ? 22 : 16;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={size}
                fill="var(--color-sand-200)"
                className="skeleton-circle"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
