"use client";

import { useState, useEffect, useCallback } from "react";

type PushState = "unsupported" | "prompt" | "granted" | "denied" | "subscribing" | "subscribed";

/**
 * Hook for service worker registration + push notification subscription.
 *
 * Returns the current push state and a function to request permission + subscribe.
 * Sends the PushSubscription to /api/push/subscribe for server-side storage.
 */
export function usePush(userId: string | null) {
  const [state, setState] = useState<PushState>("unsupported");
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Register service worker + check current permission state
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }

    const perm = Notification.permission;
    if (perm === "denied") {
      setState("denied");
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        setRegistration(reg);

        // Check if already subscribed
        return reg.pushManager.getSubscription().then((sub) => {
          if (sub) {
            setState("subscribed");
          } else if (perm === "granted") {
            // Permission granted but not subscribed — will subscribe on next call
            setState("granted");
          } else {
            setState("prompt");
          }
        });
      })
      .catch(() => {
        setState("unsupported");
      });
  }, []);

  const subscribe = useCallback(async () => {
    if (!registration || !userId) return false;

    setState("subscribing");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState("denied");
        return false;
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setState("granted");
        return false;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
      });

      // Send subscription to server
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          subscription: subscription.toJSON(),
        }),
      });

      if (!res.ok) {
        setState("granted");
        return false;
      }

      setState("subscribed");
      return true;
    } catch {
      setState("granted");
      return false;
    }
  }, [registration, userId]);

  return { state, subscribe };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}
