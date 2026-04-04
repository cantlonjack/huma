"use client";

import { useState, useEffect, useRef } from "react";

type ResetOption = "clear-chat" | "clear-context" | "start-fresh";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  onAction: (action: ResetOption) => void;
}

const OPTIONS: {
  key: ResetOption;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "clear-chat",
    label: "Clear chat history",
    description:
      "Removes your conversation history. Context, aspirations, and patterns stay.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17 4.5H3M8 8.5v5M12 8.5v5M15.5 4.5v11a1.5 1.5 0 01-1.5 1.5H6a1.5 1.5 0 01-1.5-1.5v-11M7 4.5V3a1 1 0 011-1h4a1 1 0 011 1v1.5"
          stroke="#A8C4AA"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "clear-context",
    label: "Clear context",
    description:
      "Removes what HUMA knows about you \u2014 place, work, people, archetypes. Your aspirations stay.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 2a8 8 0 100 16 8 8 0 000-16zM7 10h6"
          stroke="#A8C4AA"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "start-fresh",
    label: "Start fresh",
    description:
      "Clean slate. Context, aspirations, patterns, history \u2014 everything goes. Your account stays.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3.5 3.5v5h5M16.5 16.5v-5h-5"
          stroke="#A8C4AA"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.8 7.5A5.5 5.5 0 004.2 6L3.5 8.5M5.2 12.5a5.5 5.5 0 0010.6 1.5l.7-2.5"
          stroke="#A8C4AA"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function SettingsSheet({
  open,
  onClose,
  onAction,
}: SettingsSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [selectedOption, setSelectedOption] = useState<ResetOption | null>(null);

  // Reset selection when sheet opens/closes
  useEffect(() => {
    if (!open) setSelectedOption(null);
  }, [open]);

  // Close on backdrop tap
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(
      () => document.addEventListener("mousedown", handler),
      50,
    );
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handler);
    };
  }, [open, onClose]);

  if (!open) return null;

  const confirmMessages: Record<ResetOption, { title: string; body: string; confirm: string }> = {
    "clear-chat": {
      title: "Clear chat history?",
      body: "This removes your conversation history. Your context, aspirations, and patterns stay.",
      confirm: "Clear history",
    },
    "clear-context": {
      title: "Clear context?",
      body: "This removes what HUMA knows about you \u2014 place, work, people, archetypes. Your aspirations stay.",
      confirm: "Clear context",
    },
    "start-fresh": {
      title: "Start fresh?",
      body: "Clean slate. Context, aspirations, patterns, history \u2014 everything goes. Your account stays.",
      confirm: "Yes, start fresh",
    },
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.25)" }}
    >
      <div
        ref={sheetRef}
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#FAF8F3",
          borderRadius: "16px 16px 0 0",
          padding: "24px 20px 32px",
          animation:
            "settings-slide-up 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center" style={{ marginBottom: "16px" }}>
          <div
            style={{
              width: "36px",
              height: "4px",
              borderRadius: "2px",
              background: "#D4CFC6",
            }}
          />
        </div>

        {!selectedOption ? (
          <>
            <h3
              className="font-serif font-medium"
              style={{
                fontSize: "20px",
                color: "#3D3B36",
                lineHeight: "1.3",
                marginBottom: "4px",
              }}
            >
              Settings
            </h3>
            <p
              className="font-sans"
              style={{
                fontSize: "13px",
                color: "#948B7D",
                lineHeight: "1.4",
                marginBottom: "20px",
              }}
            >
              Manage your data
            </p>

            <div className="flex flex-col gap-2">
              {OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSelectedOption(opt.key)}
                  className="flex items-start gap-3 cursor-pointer text-left"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: "#F5F1EA",
                    border: "none",
                    borderRadius: "12px",
                    transition: "background 200ms",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#EDE8DF")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#F5F1EA")
                  }
                >
                  <div
                    style={{ flexShrink: 0, marginTop: "1px" }}
                  >
                    {opt.icon}
                  </div>
                  <div>
                    <span
                      className="font-sans font-medium block"
                      style={{ fontSize: "14px", color: "#3D3B36" }}
                    >
                      {opt.label}
                    </span>
                    <span
                      className="font-sans block"
                      style={{
                        fontSize: "12px",
                        color: "#948B7D",
                        lineHeight: "1.4",
                        marginTop: "2px",
                      }}
                    >
                      {opt.description}
                    </span>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{ flexShrink: 0, marginTop: "2px", marginLeft: "auto" }}
                  >
                    <path
                      d="M6 4l4 4-4 4"
                      stroke="#948B7D"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </>
        ) : (
          /* Confirmation step */
          <>
            <h3
              className="font-serif font-medium"
              style={{
                fontSize: "20px",
                color: "#3D3B36",
                lineHeight: "1.3",
              }}
            >
              {confirmMessages[selectedOption].title}
            </h3>

            <p
              className="font-sans"
              style={{
                fontSize: "14px",
                color: "#6B6358",
                lineHeight: "1.5",
                marginTop: "8px",
              }}
            >
              {confirmMessages[selectedOption].body}
            </p>

            <div className="flex gap-3" style={{ marginTop: "20px" }}>
              <button
                onClick={() => setSelectedOption(null)}
                className="flex-1 font-sans font-medium cursor-pointer"
                style={{
                  fontSize: "14px",
                  padding: "12px",
                  borderRadius: "12px",
                  background: "#E8E2D6",
                  color: "#6B6358",
                  border: "none",
                }}
              >
                Go back
              </button>
              <button
                onClick={() => {
                  onAction(selectedOption);
                  setSelectedOption(null);
                }}
                className="flex-1 font-sans font-medium cursor-pointer"
                style={{
                  fontSize: "14px",
                  padding: "12px",
                  borderRadius: "12px",
                  background:
                    selectedOption === "start-fresh" ? "#E57373" : "#D4A574",
                  color: "#FAF8F3",
                  border: "none",
                }}
              >
                {confirmMessages[selectedOption].confirm}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes settings-slide-up {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
