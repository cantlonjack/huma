import { createServerSupabase } from "@/lib/supabase-server";

interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function POST(request: Request) {
  let body: { userId?: string; subscription?: PushSubscriptionJSON };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { userId, subscription } = body;

  if (!userId || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return Response.json({ error: "userId and subscription required" }, { status: 400 });
  }

  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Upsert: one subscription per endpoint per user
    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,endpoint" }
      );

    if (error) {
      console.error("Push subscription save error:", error);
      return Response.json({ error: "Failed to save subscription" }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Push subscribe error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
