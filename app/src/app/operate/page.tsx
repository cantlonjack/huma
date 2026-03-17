import { createServerSupabase } from "@/lib/supabase-server";
import OperateDashboard from "@/components/operate/OperateDashboard";

export default async function OperatePage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Middleware should catch this, but just in case
    return null;
  }

  const { data: maps } = await supabase
    .from("maps")
    .select("id, name, location, enterprise_count, canvas_data, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return <OperateDashboard maps={maps || []} />;
}
