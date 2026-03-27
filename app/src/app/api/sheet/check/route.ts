import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const entryId = body.entryId as string;
  const checked = body.checked as boolean;

  if (!entryId || typeof checked !== "boolean") {
    return Response.json({ error: "entryId and checked required" }, { status: 400 });
  }

  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { error } = await supabase
      .from("sheet_entries")
      .update({
        checked,
        checked_at: checked ? new Date().toISOString() : null,
      })
      .eq("id", entryId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Sheet check update error:", error);
      return Response.json({ error: "Failed to update" }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Sheet check error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
