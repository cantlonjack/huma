import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { createServerSupabase } from "@/lib/supabase-server";
import { mapSaveSchema } from "@/lib/schemas";
import { parseBody } from "@/lib/schemas/parse";

export async function POST(request: Request) {
  const parsed = await parseBody(request, mapSaveSchema);
  if (parsed.error) return parsed.error;
  const body = parsed.data;

  const id = crypto.randomUUID();

  // Try Supabase first (permanent storage)
  let storedToSupabase = false;
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("maps").insert({
      id,
      user_id: user?.id ?? null,
      document_markdown: body.markdown,
      canvas_data: body.canvasData ?? null,
      name: body.name || "",
      location: body.location || "",
      enterprise_count: body.enterpriseCount || 0,
      is_public: true,
    });

    if (!error) storedToSupabase = true;
  } catch {
    // Supabase not configured or error — fall through to Redis
  }

  // Also write to Redis as cache layer
  const redis = getRedis();
  if (redis) {
    try {
      const redisData: Record<string, unknown> = {
        markdown: body.markdown,
        name: body.name || "",
        location: body.location || "",
        enterpriseCount: body.enterpriseCount || 0,
        createdAt: body.createdAt || new Date().toISOString(),
      };
      if (body.canvasData) redisData.canvasData = body.canvasData;
      await redis.set(`map:${id}`, JSON.stringify(redisData), { ex: 7_776_000 });
    } catch (err) {
      console.error("Failed to cache map in Redis:", err);
    }
  }

  return NextResponse.json({ id, stored: storedToSupabase || !!redis });
}
