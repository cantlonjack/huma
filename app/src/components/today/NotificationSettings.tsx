"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/shared/AuthProvider";
import { createClient } from "@/lib/supabase";
import { getKnownContext, updateKnownContext } from "@/lib/supabase-v2";
import type { NotificationPreferences } from "@/types/v2";

interface NotificationSettingsProps {
  open: boolean;
  onClose: () => void;
}

const MORNING_HOURS = [5, 6, 7, 8, 9, 10];
const EVENING_HOURS = [17, 18, 19, 20, 21, 22];

function formatHour(h: number): string {
  if (h === 0) return "12am";
  if (h < 12) return `${h}am`;
  if (h === 12) return "12pm";
  return `${h - 12}pm`;
}

/**
 * Notification preferences half-sheet.
 *
 * Morning/evening toggles with hour selection.
 * Stored in known_context.notifications. HUMA voice throughout.
 */
export default function NotificationSettings({ open, onClose }: NotificationSettingsProps) {
  const { user } = useAuth();
  const [closing, setClosing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Preference state
  const [morningEnabled, setMorningEnabled] = useState(true);
  const [morningHour, setMorningHour] = useState(7);
  const [eveningEnabled, setEveningEnabled] = useState(true);
  const [eveningHour, setEveningHour] = useState(21);

  // Load current preferences from known_context
  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    setSaved(false);

    const supabase = createClient();
    if (!supabase) { setLoading(false); return; }
    getKnownContext(supabase, user.id).then((ctx) => {
      const notif = (ctx.notifications || {}) as NotificationPreferences;
      if (notif.morning) {
        setMorningEnabled(notif.morning.enabled !== false);
        if (typeof notif.morning.hour === "number") setMorningHour(notif.morning.hour);
      }
      if (notif.evening) {
        setEveningEnabled(notif.evening.enabled !== false);
        if (typeof notif.evening.hour === "number") setEveningHour(notif.evening.hour);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [open, user]);

  const handleSave = useCallback(async () => {
    if (!user || saving) return;
    setSaving(true);

    try {
      const supabase = createClient();
      if (!supabase) return;
      const existing = await getKnownContext(supabase, user.id);

      const notifications: NotificationPreferences = {
        morning: { enabled: morningEnabled, hour: morningHour },
        evening: { enabled: eveningEnabled, hour: eveningHour },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      await updateKnownContext(supabase, user.id, {
        ...existing,
        notifications,
      });

      setSaved(true);
      setTimeout(() => {
        handleClose();
      }, 800);
    } catch {
      // Fail silently — preferences will use defaults
    } finally {
      setSaving(false);
    }
  }, [user, saving, morningEnabled, morningHour, eveningEnabled, eveningHour]);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 280);
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Notification settings"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 88,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.25)",
          animation: closing
            ? "ns-backdrop-out 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards"
            : "ns-backdrop-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      />

      {/* Half-sheet */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 440,
          background: "#FAF8F3",
          borderRadius: "20px 20px 0 0",
          padding: "24px 20px calc(24px + env(safe-area-inset-bottom, 0px))",
          animation: closing
            ? "ns-slide-down 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards"
            : "ns-slide-up 0.36s cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: "#DDD4C0",
            margin: "0 auto 20px",
          }}
        />

        <p
          className="font-serif"
          style={{
            fontSize: 19,
            lineHeight: 1.35,
            color: "#1A1714",
            margin: "0 0 24px",
          }}
        >
          When HUMA shows up
        </p>

        {loading ? (
          <div style={{ padding: "20px 0" }}>
            <p className="font-sans text-sage-400" style={{ fontSize: 14 }}>
              Loading...
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Morning sheet */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <p
                    className="font-sans"
                    style={{ fontSize: 15, fontWeight: 500, color: "#2C2620", margin: 0 }}
                  >
                    Morning sheet
                  </p>
                  <p
                    className="font-sans"
                    style={{ fontSize: 13, color: "#8A7D6B", margin: "2px 0 0" }}
                  >
                    Your day, compiled fresh
                  </p>
                </div>
                <button
                  onClick={() => setMorningEnabled(!morningEnabled)}
                  aria-label={morningEnabled ? "Disable morning notifications" : "Enable morning notifications"}
                  className="cursor-pointer"
                  style={{
                    width: 44,
                    height: 26,
                    borderRadius: 13,
                    border: "none",
                    background: morningEnabled ? "#3A5A40" : "#DDD4C0",
                    position: "relative",
                    transition: "background 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 3,
                      left: morningEnabled ? 21 : 3,
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      background: "#FAF8F3",
                      transition: "left 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                  />
                </button>
              </div>

              {/* Hour selector */}
              {morningEnabled && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                  {MORNING_HOURS.map(h => (
                    <button
                      key={h}
                      onClick={() => setMorningHour(h)}
                      className="font-sans cursor-pointer"
                      style={{
                        padding: "6px 12px",
                        fontSize: 13,
                        fontWeight: morningHour === h ? 500 : 400,
                        color: morningHour === h ? "#FAF8F3" : "#3D3830",
                        background: morningHour === h ? "#3A5A40" : "transparent",
                        border: `1px solid ${morningHour === h ? "#3A5A40" : "#DDD4C0"}`,
                        borderRadius: 6,
                        transition: "all 0.15s cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                    >
                      {formatHour(h)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "#E8E2D6" }} />

            {/* Evening reflection */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <p
                    className="font-sans"
                    style={{ fontSize: 15, fontWeight: 500, color: "#2C2620", margin: 0 }}
                  >
                    Evening check-in
                  </p>
                  <p
                    className="font-sans"
                    style={{ fontSize: 13, color: "#8A7D6B", margin: "2px 0 0" }}
                  >
                    How today landed
                  </p>
                </div>
                <button
                  onClick={() => setEveningEnabled(!eveningEnabled)}
                  aria-label={eveningEnabled ? "Disable evening check-in" : "Enable evening check-in"}
                  className="cursor-pointer"
                  style={{
                    width: 44,
                    height: 26,
                    borderRadius: 13,
                    border: "none",
                    background: eveningEnabled ? "#3A5A40" : "#DDD4C0",
                    position: "relative",
                    transition: "background 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 3,
                      left: eveningEnabled ? 21 : 3,
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      background: "#FAF8F3",
                      transition: "left 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                  />
                </button>
              </div>

              {/* Hour selector */}
              {eveningEnabled && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                  {EVENING_HOURS.map(h => (
                    <button
                      key={h}
                      onClick={() => setEveningHour(h)}
                      className="font-sans cursor-pointer"
                      style={{
                        padding: "6px 12px",
                        fontSize: 13,
                        fontWeight: eveningHour === h ? 500 : 400,
                        color: eveningHour === h ? "#FAF8F3" : "#3D3830",
                        background: eveningHour === h ? "#3A5A40" : "transparent",
                        border: `1px solid ${eveningHour === h ? "#3A5A40" : "#DDD4C0"}`,
                        borderRadius: 6,
                        transition: "all 0.15s cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                    >
                      {formatHour(h)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="font-sans cursor-pointer"
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: 14,
                fontWeight: 500,
                color: "#FAF8F3",
                background: saved ? "#5C7A62" : "#3A5A40",
                border: "none",
                borderRadius: 8,
                opacity: saving ? 0.6 : 1,
                transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
                marginTop: 4,
              }}
            >
              {saved ? "Saved" : saving ? "..." : "Save"}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes ns-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes ns-slide-down {
          from { transform: translateY(0); }
          to { transform: translateY(100%); }
        }
        @keyframes ns-backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes ns-backdrop-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
