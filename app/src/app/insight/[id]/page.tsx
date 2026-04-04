import { Metadata } from "next";
import { redirect } from "next/navigation";

// ─── Dynamic OG metadata for shared insight cards ────────────────────────

interface Props {
  params: Promise<{ id: string }>;
}

async function fetchInsight(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/insights?id=eq.${encodeURIComponent(id)}&select=insight_text,dimensions_involved,user_id`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (!rows || rows.length === 0) return null;

    // Fetch operator name from context
    const userId = rows[0].user_id;
    let operatorName = "";
    if (userId) {
      const ctxRes = await fetch(
        `${supabaseUrl}/rest/v1/contexts?user_id=eq.${encodeURIComponent(userId)}&select=known_context&limit=1`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          next: { revalidate: 3600 },
        }
      );
      if (ctxRes.ok) {
        const ctxRows = await ctxRes.json();
        if (ctxRows?.[0]?.known_context) {
          const ctx = ctxRows[0].known_context;
          operatorName = ctx.operator_name || ctx.name || "";
        }
      }
    }

    return {
      text: rows[0].insight_text as string,
      dimensions: (rows[0].dimensions_involved as string[]) || [],
      operatorName,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const insight = await fetchInsight(id);

  const title = insight
    ? "A connection HUMA revealed"
    : "HUMA";
  const description = insight?.text || "Everything in your life is connected. Now you can see how.";

  const ogParams = new URLSearchParams({ insight: id });
  if (insight?.operatorName) ogParams.set("operator", insight.operatorName);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [`/api/og?${ogParams.toString()}`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?${ogParams.toString()}`],
    },
  };
}

export default async function InsightPage({ params }: Props) {
  const { id } = await params;
  // This page exists solely for OG metadata. Redirect to /whole.
  redirect(`/whole?insight=${encodeURIComponent(id)}`);
}
