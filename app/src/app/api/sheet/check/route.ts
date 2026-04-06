import { createServerSupabase } from "@/lib/supabase-server";
import { sheetCheckSchema } from "@/lib/schemas";
import { parseBody } from "@/lib/schemas/parse";

export async function POST(request: Request) {
  const parsed = await parseBody(request, sheetCheckSchema);
  if (parsed.error) return parsed.error;
  const { entryId, checked } = parsed.data;

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
