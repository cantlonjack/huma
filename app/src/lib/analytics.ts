import { track } from "@vercel/analytics";

const SESSION_KEY = "huma-v2-session-id";

function getSessionId(): string {
  if (typeof sessionStorage === "undefined") return "ssr";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function trackEvent(name: string, properties?: Record<string, string | number | boolean>) {
  // Existing Vercel Analytics call
  try {
    track(name, properties);
  } catch {
    // Analytics should never break the app
  }

  // Supabase event tracking
  try {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: getSessionId(),
        name,
        properties: properties ?? {},
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Never block UI
  }
}
