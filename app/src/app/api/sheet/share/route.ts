import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { sheetShareSchema } from "@/lib/schemas";
import { parseBody } from "@/lib/schemas/parse";

export async function POST(request: Request) {
  const parsed = await parseBody(request, sheetShareSchema);
  if (parsed.error) return parsed.error;
  const body = parsed.data;

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("shared_sheets")
    .insert({
      user_id: user.id,
      date: body.date,
      operator_name: body.operatorName || null,
      opening: body.opening || null,
      through_line: body.throughLine || null,
      state_sentence: body.stateSentence || null,
      entries: body.entries,
      moved_dimensions: body.movedDimensions,
      day_count: body.dayCount ?? null,
      is_public: true,
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Failed to create share" },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data.id, url: `/sheet/${data.id}` });
}
