import { createServerSupabase } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import WeeklyReviewFlow from "@/components/operate/WeeklyReviewFlow";
import type { CanvasData } from "@/engine/canvas-types";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ mapId: string }>;
}) {
  const { mapId } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return notFound();

  const { data: map } = await supabase
    .from("maps")
    .select("id, name, location, canvas_data, document_markdown")
    .eq("id", mapId)
    .eq("user_id", user.id)
    .single();

  if (!map) return notFound();

  const canvasData = map.canvas_data as CanvasData | null;
  const validationChecks = canvasData?.validationChecks || [];
  const qolNodes = canvasData?.qolNodes || [];
  const essence = canvasData?.essence || {
    name: map.name || "",
    land: map.location || "",
    phrase: "",
  };

  return (
    <WeeklyReviewFlow
      mapId={mapId}
      operatorName={essence.name}
      location={essence.land}
      validationChecks={validationChecks}
      qolNodes={qolNodes}
    />
  );
}
