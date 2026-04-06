"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/shared/AuthProvider";
import { createClient } from "@/lib/supabase";
import { getKnownContext } from "@/lib/supabase-v2";
import { getLocalDate } from "@/lib/date-utils";
import type { NotificationPreferences } from "@/types/v2";

type ReflectionType = "solid" | "shifted" | "hard";

const REFLECTION_OPTIONS: { type: ReflectionType; label: string }[] = [
  { type: "solid", label: "Solid day." },
  { type: "shifted", label: "Something shifted." },
  { type: "hard", label: "Hard one." },
];

/**
 * Evening reflection overlay — half-sheet that appears after 5pm
 * if the operator checked off at least 1 behavior today.
 *
 * Single text input + 3 tap options. Response flows into known_context.
 */
export default function EveningReflection() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [selected, setSelected] = useState<ReflectionType | null>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const today = getLocalDate();
  const storageKey = `huma-v2-reflection-${today}`;

  useEffect(() => {
    if (!user) return;

    // Already reflected today
    if (localStorage.getItem(storageKey)) return;

    let cancelled = false;

    async function checkEveningEligibility() {
      // Load notification preferences to respect opt-out and custom hour
      let eveningHour = 17;
      try {
        const supabase = createClient();
        if (!supabase) throw new Error("no client");
        const ctx = await getKnownContext(supabase, user!.id);
        const notif = (ctx.notifications || {}) as NotificationPreferences;
        if (notif.evening?.enabled === false) return; // opted out
        if (typeof notif.evening?.hour === "number") eveningHour = notif.evening.hour;
      } catch {
        // Use default hour on failure
      }

      if (cancelled) return;

      // Check if it's evening (at or past the configured hour)
      const hour = new Date().getHours();
      if (hour < eveningHour) return;

      // Check if operator has at least 1 check-off today
      let hasCheckoff = false;

      const sheetKey = `huma-v2-sheet-${today}`;
      const sheetRaw = localStorage.getItem(sheetKey);
      if (sheetRaw) {
        try {
          const sheet = JSON.parse(sheetRaw);
          const entries = sheet.entries || sheet;
          if (Array.isArray(entries)) {
            hasCheckoff = entries.some(
              (e: { checked?: boolean }) => e.checked === true
            );
          }
        } catch {
          // ignore parse errors
        }
      }

      // Also check compiled sheet cache
      if (!hasCheckoff) {
        const compiledKey = `huma-v2-compiled-sheet-${today}`;
        const compiledRaw = localStorage.getItem(compiledKey);
        if (compiledRaw) {
          try {
            const compiled = JSON.parse(compiledRaw);
            const entries = compiled.entries || compiled;
            if (Array.isArray(entries)) {
              hasCheckoff = entries.some(
                (e: { checked?: boolean }) => e.checked === true
              );
            }
          } catch {
            // ignore
          }
        }
      }

      if (!hasCheckoff || cancelled) return;

      // Delay appearance
      setTimeout(() => {
        if (!cancelled) setVisible(true);
      }, 4000);
    }

    checkEveningEligibility();

    return () => { cancelled = true; };
  }, [user, today, storageKey]);

  if (!visible || dismissed) return null;

  const handleSelect = (type: ReflectionType) => {
    setSelected(type);
    // Focus the text input for elaboration (optional)
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleSubmit = async () => {
    if (!selected || submitting) return;

    setSubmitting(true);

    // Gather today's sheet headlines for context
    let todaysSheet = "";
    const compiledKey = `huma-v2-compiled-sheet-${today}`;
    const compiledRaw = localStorage.getItem(compiledKey);
    if (compiledRaw) {
      try {
        const compiled = JSON.parse(compiledRaw);
        const entries = compiled.entries || [];
        todaysSheet = entries
          .map(
            (e: { headline?: string; behaviorText?: string; checked?: boolean }) =>
              `${e.checked ? "[x]" : "[ ]"} ${e.headline || e.behaviorText || ""}`
          )
          .join("\n");
      } catch {
        // ignore
      }
    }

    try {
      const res = await fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selected,
          text: text.trim() || null,
          todaysSheet,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data.response);

        // Clear cached sheet if context was updated (tomorrow's sheet should reflect new context)
        if (data.contextUpdated) {
          const tomorrowDate = new Date();
          tomorrowDate.setDate(tomorrowDate.getDate() + 1);
          const tomorrowKey = `huma-v2-compiled-sheet-${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, "0")}-${String(tomorrowDate.getDate()).padStart(2, "0")}`;
          localStorage.removeItem(tomorrowKey);
        }
      } else {
        setResponse("Something went sideways. Your reflection still counts.");
      }
    } catch {
      setResponse("Couldn't connect. Your reflection still counts.");
    } finally {
      setSubmitting(false);
      localStorage.setItem(storageKey, "true");
    }
  };

  const handleDismiss = () => {
    setClosing(true);
    setTimeout(() => {
      setDismissed(true);
      // Don't mark as reflected — they can still see it if they revisit tonight
    }, 280);
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => setDismissed(true), 280);
  };

  return (
    <div
      role="dialog"
      aria-label="Evening reflection"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 85,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={response ? handleClose : handleDismiss}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.25)",
          animation: closing
            ? "reflect-backdrop-out 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards"
            : "reflect-backdrop-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
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
          padding: "24px 20px calc(20px + env(safe-area-inset-bottom, 0px))",
          animation: closing
            ? "reflect-slide-down 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards"
            : "reflect-slide-up 0.36s cubic-bezier(0.22, 1, 0.36, 1) both",
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

        {response ? (
          /* ─── Response state ─── */
          <div aria-live="polite">
            <p
              className="font-serif"
              style={{
                fontSize: 17,
                lineHeight: 1.55,
                color: "#2C2620",
                margin: 0,
              }}
            >
              {response}
            </p>
            <button
              onClick={handleClose}
              className="font-sans"
              style={{
                marginTop: 20,
                width: "100%",
                padding: "12px 16px",
                fontSize: 14,
                fontWeight: 500,
                color: "#FAF8F3",
                background: "#3A5A40",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Good night
            </button>
          </div>
        ) : (
          /* ─── Input state ─── */
          <div>
            <p
              className="font-serif"
              style={{
                fontSize: 19,
                lineHeight: 1.35,
                color: "#1A1714",
                margin: "0 0 20px",
              }}
            >
              How was today?
            </p>

            {/* 3 tap options */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {REFLECTION_OPTIONS.map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => handleSelect(type)}
                  className="font-sans"
                  style={{
                    flex: 1,
                    padding: "10px 8px",
                    fontSize: 14,
                    fontWeight: 500,
                    color: selected === type ? "#FAF8F3" : "#3D3830",
                    background: selected === type ? "#3A5A40" : "transparent",
                    border: `1px solid ${selected === type ? "#3A5A40" : "#DDD4C0"}`,
                    borderRadius: 8,
                    cursor: "pointer",
                    transition:
                      "background 0.2s cubic-bezier(0.22, 1, 0.36, 1), color 0.2s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Text input (visible after selection, or always) */}
            <div
              style={{
                opacity: selected ? 1 : 0.4,
                transition: "opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                aria-label="Reflection notes"
                placeholder={
                  selected === "shifted"
                    ? "What changed?"
                    : selected === "hard"
                      ? "What pulled the weight down?"
                      : "Anything to add?"
                }
                rows={2}
                className="font-sans"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: "#3D3830",
                  background: "#F6F1E9",
                  border: "1px solid #E8E2D6",
                  borderRadius: 10,
                  resize: "none",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  (e.target as HTMLTextAreaElement).style.borderColor = "#A8C4AA";
                }}
                onBlur={(e) => {
                  (e.target as HTMLTextAreaElement).style.borderColor = "#E8E2D6";
                }}
              />
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 16,
                alignItems: "center",
              }}
            >
              <button
                onClick={handleSubmit}
                disabled={!selected || submitting}
                className="font-sans"
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#FAF8F3",
                  background: selected ? "#3A5A40" : "#A8C4AA",
                  border: "none",
                  borderRadius: 8,
                  cursor: selected ? "pointer" : "default",
                  opacity: submitting ? 0.6 : 1,
                  transition:
                    "background 0.2s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s",
                }}
              >
                {submitting ? "..." : "Done"}
              </button>
              <button
                onClick={handleDismiss}
                className="font-sans"
                style={{
                  padding: "12px 16px",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#8A7D6B",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Not now
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes reflect-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes reflect-slide-down {
          from { transform: translateY(0); }
          to { transform: translateY(100%); }
        }
        @keyframes reflect-backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes reflect-backdrop-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
