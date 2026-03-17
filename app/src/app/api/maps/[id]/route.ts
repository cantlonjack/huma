import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. Try Supabase first (source of truth)
  try {
    const supabase = await createServerSupabase();
    const { data: map } = await supabase
      .from("maps")
      .select("document_markdown, canvas_data, name, location, enterprise_count, created_at")
      .eq("id", id)
      .single();

    if (map) {
      return NextResponse.json({
        markdown: map.document_markdown,
        canvasData: map.canvas_data,
        name: map.name,
        location: map.location,
        enterpriseCount: map.enterprise_count,
        createdAt: map.created_at,
      });
    }
  } catch {
    // Supabase not configured — fall through to Redis
  }

  // 2. Fall back to Redis (for pre-migration maps)
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Map not found" }, { status: 404 });
  }

  try {
    const raw = await redis.get<string>(`map:${id}`);
    if (!raw) {
      return NextResponse.json({ error: "Map not found" }, { status: 404 });
    }

    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to retrieve map:", err);
    return NextResponse.json({ error: "Failed to retrieve map" }, { status: 500 });
  }
}
