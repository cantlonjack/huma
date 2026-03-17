import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

interface MapPayload {
  markdown: string;
  canvasData?: unknown;
  name: string;
  location: string;
  enterpriseCount: number;
  createdAt: string;
}

export async function POST(request: Request) {
  let body: MapPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.markdown || typeof body.markdown !== "string") {
    return NextResponse.json({ error: "markdown required" }, { status: 400 });
  }
  const totalSize = body.markdown.length + (body.canvasData ? JSON.stringify(body.canvasData).length : 0);
  if (totalSize > 200_000) {
    return NextResponse.json({ error: "Map too large" }, { status: 400 });
  }

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const data: Record<string, unknown> = {
    markdown: body.markdown,
    name: body.name || "",
    location: body.location || "",
    enterpriseCount: body.enterpriseCount || 0,
    createdAt: body.createdAt || new Date().toISOString(),
  };
  if (body.canvasData) {
    data.canvasData = body.canvasData;
  }

  const redis = getRedis();
  if (!redis) {
    // KV not configured — return ID for localStorage-only fallback
    return NextResponse.json({ id, stored: false });
  }

  try {
    // 90-day TTL (7,776,000 seconds)
    await redis.set(`map:${id}`, JSON.stringify(data), { ex: 7_776_000 });
    return NextResponse.json({ id, stored: true });
  } catch (err) {
    console.error("Failed to store map:", err);
    // Still return ID so localStorage fallback works
    return NextResponse.json({ id, stored: false });
  }
}
