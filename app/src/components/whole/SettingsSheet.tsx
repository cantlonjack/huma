"use client";

import { useState, useEffect, useRef } from "react";
import { ThemePreferenceControl } from "@/components/shared/ThemeToggle";

type ResetOption = "clear-chat" | "clear-context" | "start-fresh";
type SettingsTab = "profile" | "data";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  onAction: (action: ResetOption) => void;
  // Profile props
  operatorName?: string;
  archetypes?: string[];
  whyStatement?: string | null;
  onArchetypeTap?: () => void;
  onWhySave?: (value: string) => void;
}

const RESET_OPTIONS: {
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
  operatorName,
  archetypes,
  whyStatement,
  onArchetypeTap,
  onWhySave,
}: SettingsSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [selectedOption, setSelectedOption] = useState<ResetOption | null>(null);
  const [tab, setTab] = useState<SettingsTab>("profile");
  const [editingWhy, setEditingWhy] = useState(false);
  const [draftOverride, setDraftOverride] = useState<string | null>(null);
  const whyDraft = draftOverride ?? (whyStatement || "");
  const whyInputRef = useRef<HTMLInputElement>(null);

  // Reset sheet state when it closes. Setting state during render (from the
  // canonical "resetting state when a prop changes" React pattern) avoids the
  // extra render that a useEffect would produce.
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setSelectedOption(null);
      setTab("profile");
      setEditingWhy(false);
      setDraftOverride(null);
    }
  }

  useEffect(() => {
    if (editingWhy && whyInputRef.current) whyInputRef.current.focus();
  }, [editingWhy]);

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

  const handleWhySave = () => {
    const trimmed = whyDraft.trim();
    setEditingWhy(false);
    setDraftOverride(null);
    if (trimmed && trimmed !== (whyStatement || "") && onWhySave) {
      onWhySave(trimmed);
    }
  };

  const archetypeDisplay = archetypes && archetypes.length > 0
    ? archetypes.join(" \u00B7 ")
    : null;

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25">
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        className="w-full max-w-[440px] bg-sand-50 rounded-t-2xl px-5 pt-6 pb-8 max-h-[85dvh] overflow-y-auto"
        style={{
          animation:
            "settings-slide-up 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-4">
          <div className="w-9 h-1 rounded-sm bg-sand-300" />
        </div>

        {!selectedOption ? (
          <>
            <h3 className="font-serif font-medium text-[20px] text-earth-650 leading-tight mb-4">
              Settings
            </h3>

            {/* Tab switcher */}
            <div className="flex gap-1 bg-sand-200 rounded-lg p-0.5 mb-5">
              <button
                onClick={() => setTab("profile")}
                className={`flex-1 font-sans cursor-pointer text-[13px] font-medium py-2 rounded-md border-none transition-colors duration-200 ${
                  tab === "profile"
                    ? "bg-sand-50 text-earth-650 shadow-sm"
                    : "bg-transparent text-earth-350"
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setTab("data")}
                className={`flex-1 font-sans cursor-pointer text-[13px] font-medium py-2 rounded-md border-none transition-colors duration-200 ${
                  tab === "data"
                    ? "bg-sand-50 text-earth-650 shadow-sm"
                    : "bg-transparent text-earth-350"
                }`}
              >
                Data
              </button>
            </div>

            {tab === "profile" ? (
              <div className="flex flex-col gap-4">
                {/* Name */}
                <div className="bg-sand-100 rounded-xl p-4">
                  <span className="font-sans text-[11px] tracking-[0.12em] uppercase text-sage-400 block mb-1">Name</span>
                  <span className="font-serif text-[17px] text-earth-650">
                    {operatorName || "Not set"}
                  </span>
                </div>

                {/* Archetype */}
                <button
                  onClick={onArchetypeTap}
                  className="relative bg-sand-100 cursor-pointer rounded-xl p-4 pr-10 text-left border-none w-full transition-colors duration-200 hover:bg-sand-200"
                >
                  <span className="font-sans text-[11px] tracking-[0.12em] uppercase text-sage-400 block mb-1">Archetype</span>
                  <span className={`font-sans text-[14px] font-medium ${archetypeDisplay ? "text-earth-650" : "text-sand-350"}`}>
                    {archetypeDisplay || "Tap to set"}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <path d="M6 4l4 4-4 4" stroke="#948B7D" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* WHY statement */}
                <div className="bg-sand-100 rounded-xl p-4">
                  <span className="font-sans text-[11px] tracking-[0.12em] uppercase text-sage-400 block mb-1">WHY</span>
                  {editingWhy ? (
                    <input
                      ref={whyInputRef}
                      type="text"
                      value={whyDraft}
                      onChange={(e) => setDraftOverride(e.target.value)}
                      onBlur={handleWhySave}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleWhySave();
                        if (e.key === "Escape") { setEditingWhy(false); setDraftOverride(null); }
                      }}
                      aria-label="WHY statement"
                      className="font-serif w-full text-[15px] italic text-sage-700 bg-white border border-sage-450 rounded-lg py-2 px-3 outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => { setDraftOverride(whyStatement || ""); setEditingWhy(true); }}
                      className="cursor-pointer bg-transparent border-none p-0 text-left w-full"
                    >
                      <span className={`font-serif text-[15px] italic leading-snug ${whyStatement ? "text-sage-600" : "text-sand-350"}`}>
                        {whyStatement || "Tap to add your WHY"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Data tab — appearance + reset options */
              <div className="flex flex-col gap-4">
                {/* Appearance */}
                <div className="bg-sand-100 rounded-xl p-4">
                  <span className="font-sans text-[11px] tracking-[0.12em] uppercase text-sage-400 block mb-2">
                    Appearance
                  </span>
                  <ThemePreferenceControl />
                  <p className="font-sans text-[12px] text-earth-400 leading-snug mt-2">
                    System follows your device&rsquo;s light / dark setting.
                  </p>
                </div>

                {RESET_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setSelectedOption(opt.key)}
                    className="flex items-start gap-3 cursor-pointer text-left w-full p-3.5 px-4 bg-sand-100 border-none rounded-xl transition-colors duration-200 hover:bg-sand-200"
                  >
                    <div className="shrink-0 mt-px">
                      {opt.icon}
                    </div>
                    <div>
                      <span className="font-sans font-medium block text-sm text-earth-650">
                        {opt.label}
                      </span>
                      <span className="font-sans block text-xs text-earth-350 leading-snug mt-0.5">
                        {opt.description}
                      </span>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="shrink-0 mt-0.5 ml-auto"
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
            )}
          </>
        ) : (
          /* Confirmation step */
          <>
            <h3 className="font-serif font-medium text-[20px] text-earth-650 leading-tight">
              {confirmMessages[selectedOption].title}
            </h3>

            <p className="font-sans text-sm text-earth-500 leading-normal mt-2">
              {confirmMessages[selectedOption].body}
            </p>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setSelectedOption(null)}
                className="flex-1 font-sans font-medium cursor-pointer text-sm py-3 rounded-xl bg-sand-300 text-earth-500 border-none"
              >
                Go back
              </button>
              <button
                onClick={() => {
                  onAction(selectedOption);
                  setSelectedOption(null);
                }}
                className={`flex-1 font-sans font-medium cursor-pointer text-sm py-3 rounded-xl text-sand-50 border-none ${
                  selectedOption === "start-fresh" ? "bg-rose" : "bg-amber-350"
                }`}
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
