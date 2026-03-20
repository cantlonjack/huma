import type { Metadata } from "next";
import { createServerSupabase } from "@/lib/supabase-server";
import MapClient from "./MapClient";

interface MapPageProps {
  params: Promise<{ id: string }>;
}

async function getMapMeta(id: string): Promise<{
  name: string;
  location: string;
  phrase: string;
} | null> {
  try {
    const supabase = await createServerSupabase();
    const { data: map } = await supabase
      .from("maps")
      .select("name, location, canvas_data")
      .eq("id", id)
      .single();

    if (!map) return null;

    const canvas = typeof map.canvas_data === "string"
      ? JSON.parse(map.canvas_data)
      : map.canvas_data;

    return {
      name: map.name || canvas?.essence?.name || "an Operator",
      location: map.location || canvas?.essence?.land || "",
      phrase: canvas?.essence?.phrase || "",
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: MapPageProps): Promise<Metadata> {
  const { id } = await params;

  const meta = await getMapMeta(id);
  const name = meta?.name || "an Operator";
  const phrase = meta?.phrase || "";

  const title = `${name}\u2019s Living Canvas \u2014 HUMA`;
  const ogTitle = `${name}\u2019s Living Canvas`;
  const description = phrase
    ? phrase
    : `A living map of ${name}\u2019s whole situation \u2014 enterprises, capitals, and the moves that change everything.`;
  const ogImage = `/api/og?id=${encodeURIComponent(id)}`;

  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description,
      type: "article",
      siteName: "HUMA",
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [ogImage],
    },
  };
}

export default async function MapPage({ params }: MapPageProps) {
  const { id } = await params;
  return <MapClient id={id} />;
}
