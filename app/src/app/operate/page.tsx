import { createServerSupabase } from "@/lib/supabase-server";
import OperateDashboard from "@/components/operate/OperateDashboard";

export default async function OperatePage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Proxy should catch this, but just in case
    return null;
  }

  const { data: maps } = await supabase
    .from("maps")
    .select("id, name, location, enterprise_count, canvas_data, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  // Fetch recent reviews for history display
  let recentReviews: Array<{ week_start: string; map_id: string }> = [];
  try {
    const { data } = await supabase
      .from("weekly_reviews")
      .select("week_start, map_id")
      .eq("user_id", user.id)
      .order("week_start", { ascending: false })
      .limit(8);
    if (data) recentReviews = data;
  } catch {
    // Table may not exist yet
  }

  return (
    <OperateDashboard
      maps={maps || []}
      recentReviews={recentReviews}
    />
  );
}
