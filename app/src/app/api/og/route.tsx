import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name");
  const location = url.searchParams.get("location") || "";
  const enterprises = url.searchParams.get("enterprises") || "";

  // Homepage OG image (no params)
  const isHomepage = !name;

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
