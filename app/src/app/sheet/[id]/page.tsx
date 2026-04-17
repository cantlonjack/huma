import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SheetView, { type SharedSheet } from "./SheetView";

interface SheetPageProps {
  params: Promise<{ id: string }>;
}

async function fetchSharedSheet(id: string): Promise<SharedSheet | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/shared_sheets?id=eq.${encodeURIComponent(id)}&is_public=eq.true&select=id,date,operator_name,opening,through_line,state_sentence,entries,moved_dimensions,day_count,created_at`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        // Shared sheets are immutable snapshots; cache briefly.
        next: { revalidate: 300 },
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
      id: row.id,
      date: row.date,
      operatorName: row.operator_name || "",
      opening: row.opening || "",
      throughLine: row.through_line || "",
      stateSentence: row.state_sentence || "",
      entries: (entries || []) as SharedSheet["entries"],
      movedDimensions: (moved || []) as string[],
      dayCount: row.day_count ?? null,
      createdAt: row.created_at,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: SheetPageProps): Promise<Metadata> {
  const { id } = await params;
  const sheet = await fetchSharedSheet(id);

  const title = sheet?.operatorName
    ? `${sheet.operatorName}\u2019s day \u2014 HUMA`
    : "A day on HUMA";
  const description = sheet?.throughLine
    || sheet?.opening
    || "See how one day's actions connect across a whole life.";
  const ogImage = `/api/og/sheet?id=${encodeURIComponent(id)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "HUMA",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function SharedSheetPage({ params }: SheetPageProps) {
  const { id } = await params;
  const sheet = await fetchSharedSheet(id);
  if (!sheet) notFound();
  return <SheetView sheet={sheet} />;
}
