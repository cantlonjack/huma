"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/shared/AuthProvider";
import { usePush } from "@/lib/use-push";

/**
 * HUMA-voiced notification permission prompt.
 *
 * Shows once, after the operator has used the app for at least 2 days.
 * Dismissable — never nags. Stored in localStorage so it only appears once.
 */
export default function NotificationPrompt() {
  const { user } = useAuth();
  const { state, subscribe } = usePush(user?.id ?? null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (state !== "prompt") return;

    // Don't show if already dismissed
    const key = "huma-v2-push-prompt-dismissed";
    if (localStorage.getItem(key)) return;

    // Only show after 2+ days of use
    const startDate = localStorage.getItem("huma-v2-start-date");
    if (startDate) {
      const daysSince = Math.floor(
        (Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSince < 2) return;
    }

    // Delay appearance so it doesn't fight with page load
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [user, state]);

  if (!visible || dismissed || state === "subscribed" || state === "denied" || state === "unsupported") {
    return null;
  }

  const handleEnable = async () => {
    await subscribe();
    dismiss();
  };

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem("huma-v2-push-prompt-dismissed", "true");
  };

  return (
    <div
      role="dialog"
      aria-label="Enable notifications"
      style={{
        position: "fixed",
        bottom: 80,
        left: 16,
        right: 16,
        maxWidth: 400,
        margin: "0 auto",
        zIndex: 90,
        background: "#FAF8F3",
        border: "1px solid #E8E0D0",
        borderRadius: 12,
        padding: "20px 20px 16px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        animation: "notif-prompt-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
      }}
    >
      <p
        className="font-serif"
        style={{
          fontSize: 17,
          lineHeight: 1.45,
          color: "#2C2417",
          margin: 0,
        }}
      >
        Your sheet builds fresh each morning. Want a heads-up when it&apos;s ready?
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button
          onClick={handleEnable}
          className="font-sans"
          style={{
            flex: 1,
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 500,
            color: "#FAF8F3",
            background: "#3A5A40",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Sure
        </button>
        <button
          onClick={dismiss}
          className="font-sans"
          style={{
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 500,
            color: "#8A7D6B",
            background: "transparent",
            border: "1px solid #E8E0D0",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
