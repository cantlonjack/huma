import webpush from "web-push";
import { createServerSupabase } from "@/lib/supabase-server";

// Configure VAPID keys from environment
const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:hello@huma.earth";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  renotify?: boolean;
}

/**
 * Send a push notification to all of a user's subscribed devices.
 * Automatically cleans up expired/invalid subscriptions.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    console.warn("Push: VAPID keys not configured, skipping");
    return 0;
  }

  const supabase = await createServerSupabase();

  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error || !subscriptions?.length) return 0;

  const payloadStr = JSON.stringify(payload);
  let sent = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payloadStr
      );
      sent++;
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number })?.statusCode;
      // 404 or 410 = subscription expired/invalid — clean up
      if (statusCode === 404 || statusCode === 410) {
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      } else {
        console.error(`Push failed for ${sub.endpoint.slice(0, 50)}:`, err);
      }
    }
  }

  return sent;
}
