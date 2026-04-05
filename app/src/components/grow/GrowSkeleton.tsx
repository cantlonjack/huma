/** Skeleton loader for the Grow tab — mimics pattern card layout */
export default function GrowSkeleton() {
  return (
    <div aria-hidden="true" role="presentation" style={{ padding: "0 16px" }}>
      {/* Header placeholder */}
      <div style={{ padding: "0 0 16px" }}>
        <div className="skeleton" style={{ width: "120px", height: "14px", marginBottom: "8px" }} />
        <div className="skeleton" style={{ width: "200px", height: "22px" }} />
      </div>

      {/* Two pattern card skeletons */}
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            background: "white",
            border: "1px solid #DDD4C0",
            borderRadius: "16px",
            marginBottom: "16px",
            overflow: "hidden",
          }}
        >
          {/* Card header with status pill */}
          <div
            style={{
              padding: "14px 16px 12px",
              borderBottom: "1px solid #F0EBE3",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div className="skeleton" style={{ width: "55%", height: "18px" }} />
            <div className="skeleton" style={{ width: "60px", height: "20px", borderRadius: "10px" }} />
          </div>

          {/* Trigger + steps */}
          <div style={{ padding: "12px 16px" }}>
            <div className="skeleton" style={{ width: "80px", height: "10px", marginBottom: "8px" }} />
            <div className="skeleton" style={{ width: "70%", height: "14px", marginBottom: "12px" }} />
            {[0, 1].map((j) => (
              <div key={j} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div className="skeleton-circle" style={{ width: "6px", height: "6px", flexShrink: 0 }} />
                <div className="skeleton" style={{ width: j === 0 ? "65%" : "50%", height: "13px" }} />
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid #F0EBE3" }}>
            <div className="skeleton" style={{ width: "100%", height: "6px", borderRadius: "3px" }} />
            <div className="skeleton" style={{ width: "80px", height: "11px", marginTop: "6px" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
