import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
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
