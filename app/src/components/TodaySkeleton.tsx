/** Skeleton loader for the Today tab — mimics PatternRouteCard layout */
export default function TodaySkeleton() {
  return (
    <div aria-hidden="true" role="presentation">
      {/* Aspiration ribbon placeholder */}
      <div className="flex gap-2" style={{ padding: "0 16px 12px" }}>
        {[80, 100, 72].map((w, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ width: `${w}px`, height: "32px", borderRadius: "20px", flexShrink: 0 }}
          />
        ))}
      </div>

      {/* Two pattern-route card skeletons */}
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            background: "white",
            border: "1px solid #DDD4C0",
            borderRadius: "16px",
            margin: "0 16px 12px",
            overflow: "hidden",
          }}
        >
          {/* Card header */}
          <div
            style={{
              padding: "14px 16px 10px",
              borderBottom: "1px solid #F0EBE3",
            }}
          >
            <div className="skeleton" style={{ width: "55%", height: "18px" }} />
          </div>

          {/* Behavior rows */}
          <div style={{ padding: "4px 0" }}>
            {[0, 1, 2].map((j) => (
              <div
                key={j}
                style={{
                  padding: "10px 14px 10px 48px",
                  position: "relative",
                }}
              >
                <div
                  className="skeleton-circle"
                  style={{
                    position: "absolute",
                    left: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "20px",
                    height: "20px",
                  }}
                />
                <div
                  className="skeleton"
                  style={{
                    width: j === 0 ? "70%" : j === 1 ? "85%" : "60%",
                    height: "14px",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Footer strip */}
          <div
            style={{
              padding: "10px 14px",
              borderTop: "1px solid #F0EBE3",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div className="skeleton" style={{ width: "80px", height: "12px" }} />
            <div className="skeleton" style={{ width: "60px", height: "12px" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
