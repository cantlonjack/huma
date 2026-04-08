"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

const SESSION_TRACKED_KEY = "huma-v2-session-tracked";

export default function SessionTracker() {
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_TRACKED_KEY)) return;
    sessionStorage.setItem(SESSION_TRACKED_KEY, "1");

    trackEvent("session_start", {
      referrer: document.referrer || "direct",
      viewport_width: window.innerWidth,
    });
  }, []);

  return null;
}
