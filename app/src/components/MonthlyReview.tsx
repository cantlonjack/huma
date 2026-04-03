"use client";

import type { MonthlyReviewData, WeekConsistency } from "@/types/v2";
import { DIMENSION_COLORS } from "@/types/v2";

// ─── Cell color mapping ────────────────────────────────────────────────────
// Sage = consistent, amber = intermittent, blank (sand-50) = absent

function cellStyle(consistency: WeekConsistency): { bg: string; border: string } {
  if (consistency === "consistent") return { bg: "#E0EDE1", border: "#C4D9C6" }; // sage-100/sage-200
  if (consistency === "intermittent") return { bg: "#FFF4EC", border: "#E8935A" }; // amber-100/amber-400
  return { bg: "transparent", border: "#EDE6D8" }; // sand-200 border only
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function MonthlyReview({ data }: { data: MonthlyReviewData }) {
  return (
    <div
      style={{
        background: "#FAF8F3",
        borderRadius: "12px",
        border: "1px solid #EDE6D8",
        padding: "20px 16px",
      }}
    >
      {/* Header */}
      <p
        className="font-sans"
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#8BAF8E", // sage-400
          marginBottom: "4px",
        }}
      >
        MONTHLY REVIEW
      </p>
      <h3
        className="font-serif"
        style={{
          fontSize: "20px",
          fontWeight: 400,
          color: "#3A5A40", // sage-700
          lineHeight: "1.3",
          marginBottom: "20px",
        }}
      >
        {data.month}
      </h3>

      {/* Grid */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0",
          }}
        >
          {/* Week column headers */}
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: "0 8px 10px 0",
                  width: "40%",
                }}
              />
              {data.weekRanges.map((range, i) => (
                <th
                  key={i}
                  className="font-sans"
                  style={{
                    fontSize: "11px",
                    fontWeight: 400,
                    color: "#8C8274", // ink-400
                    textAlign: "center",
                    padding: "0 2px 10px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {range}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.rows.map((row) => (
              <tr key={row.behaviorKey}>
                {/* Behavior name + dimension dots */}
                <td
                  style={{
                    padding: "6px 8px 6px 0",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {/* Dimension dots */}
                    {row.dimensions.length > 0 && (
                      <div style={{ display: "flex", gap: "3px", flexShrink: 0 }}>
                        {row.dimensions.slice(0, 3).map((dim) => (
                          <span
                            key={dim}
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: DIMENSION_COLORS[dim] || "#8C8274",
                              display: "inline-block",
                            }}
                          />
                        ))}
                      </div>
                    )}
                    <span
                      className="font-sans"
                      style={{
                        fontSize: "13px",
                        color: "#3D3830", // ink-700
                        lineHeight: "1.3",
                      }}
                    >
                      {row.behaviorName}
                    </span>
                  </div>
                </td>

                {/* Week cells */}
                {row.weeks.map((consistency, i) => {
                  const style = cellStyle(consistency);
                  return (
                    <td
                      key={i}
                      style={{
                        padding: "4px 2px",
                        verticalAlign: "middle",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "24px",
                          borderRadius: "4px",
                          background: style.bg,
                          border: `1px solid ${style.border}`,
                          minWidth: "36px",
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginTop: "16px",
          paddingTop: "12px",
          borderTop: "1px solid #EDE6D8",
        }}
      >
        <LegendItem color="#E0EDE1" border="#C4D9C6" label="Consistent" />
        <LegendItem color="#FFF4EC" border="#E8935A" label="Intermittent" />
        <LegendItem color="transparent" border="#EDE6D8" label="Absent" />
      </div>
    </div>
  );
}

function LegendItem({
  color,
  border,
  label,
}: {
  color: string;
  border: string;
  label: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div
        style={{
          width: "12px",
          height: "12px",
          borderRadius: "3px",
          background: color,
          border: `1px solid ${border}`,
        }}
      />
      <span
        className="font-sans"
        style={{ fontSize: "11px", color: "#8C8274" }}
      >
        {label}
      </span>
    </div>
  );
}
