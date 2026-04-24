import { createServerSupabase } from "@/lib/supabase-server";
import { sheetCheckSchema } from "@/lib/schemas";
import { parseBody } from "@/lib/schemas/parse";
import { isFallow } from "@/lib/fallow";
import { getLocalDate } from "@/lib/date-utils";

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

    // REGEN-05 (Plan 02-04): reject new checkoffs on fallow days.
    // Mid-day fallow preserves existing sheet_entries (the toggle route never
    // touches them) but new checks submitted after the mark must not land.
    // This targeted context read (~15-40ms) prevents behavior_log writes
    // that would pollute the operator's historical truth. Optimization
    // candidate: batch with the sheet_entries update via RPC if needed.
    const { data: ctxRow } = await supabase
      .from("contexts")
      .select("huma_context")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    const humaContext = (ctxRow?.huma_context ?? {}) as Record<string, unknown>;
    if (isFallow(humaContext, getLocalDate())) {
      return Response.json(
        { error: "Today is marked fallow", code: "FALLOW_DAY" },
        { status: 409 },
      );
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
