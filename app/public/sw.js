// HUMA Service Worker — push notifications + offline shell
// Version: 1.0.0

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// ─── Push ───────────────────────────────────────────────────────────────────

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: "HUMA",
      body: event.data.text(),
      url: "/today",
    };
  }

  const title = payload.title || "HUMA";
  const options = {
    body: payload.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: payload.tag || "huma-default",
    renotify: !!payload.renotify,
    data: {
      url: payload.url || "/today",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ─── Notification click ─────────────────────────────────────────────────────

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/today";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing tab if one is open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Otherwise open new tab
        return self.clients.openWindow(url);
      })
  );
});
