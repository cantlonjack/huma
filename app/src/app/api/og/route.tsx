import { ImageResponse } from "next/og";

export const runtime = "edge";

// ─── Dimension colors (mirrored from types/v2.ts for edge runtime) ──────

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

const DIMENSION_LABELS: Record<string, string> = {
  body: "Body",
  people: "People",
  money: "Money",
  home: "Home",
  growth: "Growth",
  joy: "Joy",
  purpose: "Purpose",
  identity: "Identity",
};

// Sample map data for static rendering (no DB call needed)
const SAMPLE_MAPS: Record<string, { name: string; location: string; phrase: string; enterprises: string[] }> = {
  sample: {
    name: "Sarah Chen",
    location: "Southern Oregon, Rogue Valley",
    phrase: "A builder who works through living systems",
    enterprises: ["No-Dig Market Garden", "Farm Education", "Preserved Foods", "Native Plant Nursery"],
  },
};

async function fetchMapData(id: string) {
  // Check static samples first
  if (SAMPLE_MAPS[id]) return SAMPLE_MAPS[id];

  // Try Supabase REST API directly (edge-compatible)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/maps?id=eq.${encodeURIComponent(id)}&select=name,location,canvas_data`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (!rows || rows.length === 0) return null;

    const row = rows[0];
    const canvas = typeof row.canvas_data === "string" ? JSON.parse(row.canvas_data) : row.canvas_data;

    return {
      name: row.name || canvas?.essence?.name || "an Operator",
      location: row.location || canvas?.essence?.land || "",
      phrase: canvas?.essence?.phrase || "",
      enterprises: (canvas?.enterprises || []).slice(0, 4).map((e: { name: string }) => e.name),
    };
  } catch {
    return null;
  }
}

async function fetchInsightData(insightId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/insights?id=eq.${encodeURIComponent(insightId)}&select=insight_text,dimensions_involved,data_basis`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (!rows || rows.length === 0) return null;

    const row = rows[0];
    return {
      text: row.insight_text as string,
      dimensions: (row.dimensions_involved as string[]) || [],
      dataBasis: row.data_basis as { correlation: number; dataPoints: number },
    };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const insightId = url.searchParams.get("insight");
  const insightOperator = url.searchParams.get("operator") || "";
  const name = url.searchParams.get("name");
  const location = url.searchParams.get("location") || "";
  const enterprises = url.searchParams.get("enterprises") || "";

  // ─── Insight card OG image ────────────────────────────────────────────
  if (insightId) {
    const insightData = await fetchInsightData(insightId);

    if (insightData) {
      const dims = insightData.dimensions.slice(0, 6);

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
              background: "#1A1714",
              fontFamily: "Georgia, serif",
              padding: "48px 72px",
              position: "relative",
            }}
          >
            {/* Subtle sage radial glow */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "600px",
                height: "600px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(138,175,142,0.08) 0%, transparent 70%)",
                transform: "translate(-50%, -50%)",
                display: "flex",
              }}
            />

            {/* HUMA SEES label */}
            <div
              style={{
                display: "flex",
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.45em",
                color: "#8BAF8E",
                marginBottom: 36,
              }}
            >
              HUMA SEES
            </div>

            {/* Dimension circles */}
            <div
              style={{
                display: "flex",
                gap: 16,
                marginBottom: 12,
              }}
            >
              {dims.map((dim) => (
                <div
                  key={dim}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    background: DIMENSION_COLORS[dim] || "#5C7A62",
                    opacity: 0.85,
                    display: "flex",
                  }}
                />
              ))}
            </div>

            {/* Dimension labels */}
            <div
              style={{
                display: "flex",
                gap: 16,
                marginBottom: 40,
              }}
            >
              {dims.map((dim) => (
                <div
                  key={dim}
                  style={{
                    fontSize: 11,
                    color: "#A89E90",
                    letterSpacing: "0.05em",
                    width: 36,
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {DIMENSION_LABELS[dim] || dim}
                </div>
              ))}
            </div>

            {/* Divider */}
            <div
              style={{
                width: 48,
                height: 1,
                background: "rgba(168, 196, 170, 0.2)",
                marginBottom: 40,
                display: "flex",
              }}
            />

            {/* Insight text */}
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 400,
                fontStyle: "italic",
                color: "#EDE6D8",
                textAlign: "center",
                lineHeight: 1.5,
                maxWidth: 900,
                marginBottom: 40,
              }}
            >
              {insightData.text}
            </div>

            {/* Operator name */}
            {insightOperator && (
              <div
                style={{
                  display: "flex",
                  fontSize: 15,
                  fontWeight: 300,
                  color: "#A89E90",
                  letterSpacing: "0.08em",
                  marginBottom: 32,
                }}
              >
                {insightOperator}
              </div>
            )}

            {/* HUMA footer */}
            <div
              style={{
                display: "flex",
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.35em",
                color: "#5C7A62",
                position: "absolute",
                bottom: 36,
              }}
            >
              HUMA
            </div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    // Fallback: insight ID provided but not found — render generic below
  }

  // Per-map OG image
  if (id) {
    const mapData = await fetchMapData(id);

    if (mapData) {
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
              padding: "48px 64px",
            }}
          >
            {/* HUMA wordmark */}
            <div
              style={{
                display: "flex",
                fontSize: 16,
                fontWeight: 500,
                letterSpacing: "0.35em",
                color: "#3A5A40",
                marginBottom: 32,
              }}
            >
              HUMA
            </div>

            {/* Operator name */}
            <div
              style={{
                display: "flex",
                fontSize: 52,
                fontWeight: 400,
                color: "#1A1714",
                textAlign: "center",
                lineHeight: 1.15,
                marginBottom: 12,
              }}
            >
              {mapData.name}
            </div>

            {/* Location */}
            {mapData.location && (
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  fontWeight: 300,
                  color: "#8C8274",
                  marginBottom: 16,
                }}
              >
                {mapData.location}
              </div>
            )}

            {/* Essence phrase */}
            {mapData.phrase && (
              <div
                style={{
                  display: "flex",
                  fontSize: 22,
                  fontWeight: 300,
                  fontStyle: "italic",
                  color: "#3A5A40",
                  textAlign: "center",
                  maxWidth: 800,
                  marginBottom: 36,
                }}
              >
                {`"${mapData.phrase}"`}
              </div>
            )}

            {/* Enterprise pills */}
            {mapData.enterprises.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  marginBottom: 40,
                }}
              >
                {mapData.enterprises.map((ent: string) => (
                  <div
                    key={ent}
                    style={{
                      display: "flex",
                      padding: "8px 20px",
                      borderRadius: 100,
                      border: "1px solid #C4D9C6",
                      background: "#EBF3EC",
                      fontSize: 15,
                      fontWeight: 500,
                      color: "#3A5A40",
                    }}
                  >
                    {ent}
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div
              style={{
                display: "flex",
                fontSize: 14,
                color: "#8C8274",
                letterSpacing: "0.08em",
              }}
            >
              Living Canvas — HUMA
            </div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    // Fallback: id provided but no data found — render generic
  }

  // Legacy/generic OG image (no id, uses name/location/enterprises params)
  const isHomepage = !name && !id;

  const subtitleParts = [];
  if (location) subtitleParts.push(location);
  if (enterprises) subtitleParts.push(enterprises + " enterprises");
  const subtitle = subtitleParts.join(" \u00B7 ");

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
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: "0.3em",
            color: "#3A5A40",
            marginBottom: 40,
          }}
        >
          HUMA
        </div>

        <div
          style={{
            display: "flex",
            fontSize: isHomepage ? 44 : 48,
            fontWeight: 400,
            color: "#1A1714",
            textAlign: "center",
            lineHeight: 1.2,
            maxWidth: 900,
            marginBottom: 16,
          }}
        >
          {isHomepage
            ? "Everything in your life is connected. Now you can see how."
            : "Living Canvas"}
        </div>

        {isHomepage ? (
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 300,
              color: "#8C8274",
              textAlign: "center",
              maxWidth: 700,
              marginBottom: 12,
            }}
          >
            Map your whole situation. See the specific moves that change everything.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              fontSize: 32,
              fontWeight: 300,
              fontStyle: "italic",
              color: "#3A5A40",
              marginBottom: 12,
            }}
          >
            for {name || "an Operator"}
          </div>
        )}

        {!isHomepage && subtitle ? (
          <div
            style={{
              display: "flex",
              fontSize: 20,
              color: "#8C8274",
              marginBottom: 40,
            }}
          >
            {subtitle}
          </div>
        ) : (
          <div style={{ display: "flex", marginBottom: 40 }} />
        )}

        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div style={{ width: 32, height: 32, borderRadius: 16, background: "#3A5A40", opacity: 0.85, display: "flex" }} />
          <div style={{ width: 26, height: 26, borderRadius: 13, background: "#3A5A40", opacity: 0.7, display: "flex" }} />
          <div style={{ width: 38, height: 38, borderRadius: 19, background: "#3A5A40", opacity: 1, display: "flex" }} />
          <div style={{ width: 32, height: 32, borderRadius: 16, background: "#3A5A40", opacity: 0.85, display: "flex" }} />
          <div style={{ width: 26, height: 26, borderRadius: 13, background: "#3A5A40", opacity: 0.7, display: "flex" }} />
          <div style={{ width: 20, height: 20, borderRadius: 10, background: "#3A5A40", opacity: 0.55, display: "flex" }} />
          <div style={{ width: 32, height: 32, borderRadius: 16, background: "#3A5A40", opacity: 0.85, display: "flex" }} />
          <div style={{ width: 26, height: 26, borderRadius: 13, background: "#3A5A40", opacity: 0.7, display: "flex" }} />
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 14,
            color: "#8C8274",
            letterSpacing: "0.1em",
          }}
        >
          A living systems design tool
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
