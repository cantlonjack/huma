import { createServerSupabase } from "@/lib/supabase-server";
import { isRateLimited } from "@/lib/rate-limit";
import { rateLimited, badRequest } from "@/lib/api-error";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  if (await isRateLimited(ip)) {
    return rateLimited();
  }

  let body: { session_id?: string; name?: string; properties?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON.");
  }

  if (!body.session_id || !body.name) {
    return badRequest("session_id and name are required.");
  }

  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("events").insert({
      session_id: body.session_id,
      name: body.name,
      properties: body.properties ?? {},
      user_id: user?.id ?? null,
    });

    return new Response(null, { status: 204 });
  } catch {
    // Fire-and-forget — don't fail loudly
    return new Response(null, { status: 204 });
  }
}
