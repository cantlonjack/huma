import { ImageResponse } from "next/og";

export const runtime = "edge";

const DIMENSION_COLORS: Record<string, string> = {
  body: "#5C7A62",
  people: "#8BAF8E",
  money: "#B5621E",
  home: "#6B6358",
  growth: "#2E6B8A",
  joy: "#E8935A",
  purpose: "#3A5A40",
  identity: "#A04040",
};

interface SharedEntry {
  behaviorKey: string;
  headline: string;
  dimensions?: string[];
}

interface SharedSheetData {
  operatorName: string;
  date: string;
  opening: string;
  throughLine: string;
  entries: SharedEntry[];
  movedDimensions: string[];
}

async function fetchSheetData(id: string): Promise<SharedSheetData | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/shared_sheets?id=eq.${encodeURIComponent(id)}&is_public=eq.true&select=operator_name,date,opening,through_line,entries,moved_dimensions`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (!rows || rows.length === 0) return null;
    const row = rows[0];
    const entries = typeof row.entries === "string" ? JSON.parse(row.entries) : row.entries;
    const moved = typeof row.moved_dimensions === "string"
      ? JSON.parse(row.moved_dimensions)
      : row.moved_dimensions;
    return {
      operatorName: row.operator_name || "",
      date: row.date || "",
      opening: row.opening || "",
      throughLine: row.through_line || "",
      entries: (entries || []) as SharedEntry[],
      movedDimensions: (moved || []) as string[],
    };
  } catch {
    return null;
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  const data = id ? await fetchSheetData(id) : null;

  // Fallback when no data — generic HUMA daily sheet card
  if (!data) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(180deg, #FAF8F3 0%, #EDE6D8 100%)",
            fontFamily: "Georgia, serif",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 16,
              letterSpacing: "0.35em",
              color: "#3A5A40",
              marginBottom: 32,
            }}
          >
            HUMA
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 40,
              color: "#1A1714",
              textAlign: "center",
            }}
          >
            A day on HUMA
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }

  const entries = data.entries.slice(0, 5);
  const allDims = Array.from(
    new Set([
      ...entries.flatMap((e) => e.dimensions || []),
      ...data.movedDimensions,
    ]),
  ).slice(0, 8);

  const heading = data.operatorName
    ? `${data.operatorName}\u2019s day`
    : "A day on HUMA";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#FAF8F3",
          fontFamily: "Georgia, serif",
          padding: "56px 72px",
          position: "relative",
        }}
      >
        {/* Header row: HUMA + date */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.4em",
              color: "#3A5A40",
            }}
          >
            H U M A
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 14,
              color: "#8C8274",
              letterSpacing: "0.08em",
            }}
          >
            {formatDate(data.date)}
          </div>
        </div>

        {/* Heading */}
        <div
          style={{
            display: "flex",
            fontSize: 38,
            color: "#1A1714",
            marginBottom: 8,
          }}
        >
          {heading}
        </div>

        {/* Dimension ring */}
        {allDims.length > 0 && (
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {allDims.map((d) => (
              <div
                key={d}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  background: DIMENSION_COLORS[d] || "#5C7A62",
                  opacity: data.movedDimensions.includes(d) ? 1 : 0.5,
                  display: "flex",
                }}
              />
            ))}
          </div>
        )}

        {/* Through-line / opening — whichever is present */}
        {(data.throughLine || data.opening) && (
          <div
            style={{
              display: "flex",
              borderLeft: "3px solid #E4B862",
              paddingLeft: 18,
              marginBottom: 28,
              fontSize: 22,
              fontStyle: "italic",
              color: "#3A3732",
              lineHeight: 1.4,
              maxWidth: 980,
            }}
          >
            {data.throughLine || data.opening}
          </div>
        )}

        {/* Entry list */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 24,
          }}
        >
          {entries.map((e, i) => {
            const dim = (e.dimensions && e.dimensions[0]) || "body";
            return (
              <div
                key={e.behaviorKey + i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  fontSize: 20,
                  color: "#2A2521",
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    background: DIMENSION_COLORS[dim] || "#5C7A62",
                    display: "flex",
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    overflow: "hidden",
                    maxWidth: 940,
                  }}
                >
                  {e.headline}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "absolute",
            bottom: 40,
            left: 72,
            right: 72,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 13,
              color: "#8C8274",
              letterSpacing: "0.1em",
            }}
          >
            Life infrastructure
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 13,
              color: "#8C8274",
              letterSpacing: "0.1em",
            }}
          >
            huma-two.vercel.app
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
