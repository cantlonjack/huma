"use client";

import { useState, useEffect } from "react";
import { subscribeSyncStatus, type SyncState } from "@/lib/db/store";

/**
 * Small sync status indicator — only visible when there's pending data.
 * Shows "Saved locally, syncing..." → "All synced"
 */
export default function SyncStatus() {
  const [state, setState] = useState<SyncState>("synced");
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    return subscribeSyncStatus((s, c) => {
      setState(s);
      setCount(c);
    });
  }, []);

  // Show when pending/syncing/error, auto-hide 2s after synced
  useEffect(() => {
    if (state === "pending" || state === "syncing" || state === "error") {
      setVisible(true);
      setFadingOut(false);
    } else if (state === "synced" && visible) {
      // Brief "All synced" then fade
      const timer = setTimeout(() => {
        setFadingOut(true);
        const hideTimer = setTimeout(() => {
          setVisible(false);
          setFadingOut(false);
        }, 500);
        return () => clearTimeout(hideTimer);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state, visible]);

  if (!visible) return null;

  const label = (() => {
    switch (state) {
      case "pending":
        return `${count} unsaved — waiting to sync`;
      case "syncing":
        return "Syncing...";
      case "error":
        return `${count} failed to sync`;
      case "synced":
        return "All synced";
    }
  })();

  const dotColor = (() => {
    switch (state) {
      case "pending": return "bg-amber-400";
      case "syncing": return "bg-amber-400 animate-pulse";
      case "error": return "bg-rose-400";
      case "synced": return "bg-emerald-400";
    }
  })();

  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-2 px-3 py-1.5
        bg-earth-800/90 text-sand-100 text-xs font-sans rounded-full
        shadow-lg backdrop-blur-sm
        transition-opacity duration-500
        ${fadingOut ? "opacity-0" : "opacity-100"}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      {label}
    </div>
  );
}
