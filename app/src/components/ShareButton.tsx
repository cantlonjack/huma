"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { CanvasData } from "@/engine/canvas-types";

interface ShareButtonProps {
  className?: string;
  canvasData?: CanvasData | null;
}

export default function ShareButton({ className = "", canvasData }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Position the dropdown when opening
  const updatePosition = useCallback(() => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        const dropdown = document.getElementById("share-dropdown-portal");
        if (dropdown && dropdown.contains(e.target as Node)) return;
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Keyboard navigation for dropdown
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
        return;
      }

      const dropdown = dropdownRef.current;
      if (!dropdown) return;

      const buttons = Array.from(dropdown.querySelectorAll<HTMLButtonElement>("button"));
      const focused = document.activeElement as HTMLElement;
      const idx = buttons.indexOf(focused as HTMLButtonElement);

      if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault();
        const next = idx < buttons.length - 1 ? idx + 1 : 0;
        buttons[next]?.focus();
      } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
        e.preventDefault();
        const prev = idx > 0 ? idx - 1 : buttons.length - 1;
        buttons[prev]?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // Focus first item when dropdown opens
  useEffect(() => {
    if (open && dropdownRef.current) {
      const first = dropdownRef.current.querySelector<HTMLButtonElement>("button");
      // Small delay to let portal render
      requestAnimationFrame(() => first?.focus());
    }
  }, [open]);

  // Cleanup toast timer
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const toggleOpen = () => {
    if (!open) updatePosition();
    setOpen(!open);
  };

  const showToast = () => {
    setToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(false), 2000);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setOpen(false);
    showToast();
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
        setOpen(false);
      } catch {
        // User cancelled
      }
    } else {
      copyLink();
    }
  };

  const openShareCard = () => {
    setOpen(false);
    setShowCard(true);
  };

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  // Lazy-load ShareCard only when needed
  const ShareCardLazy = showCard
    ? require("@/components/ShareCard").default
    : null;

  return (
    <>
      <div ref={ref} className={`relative ${className}`}>
        <button
          ref={btnRef}
          onClick={toggleOpen}
          className="px-4 sm:px-5 py-2 text-sm border border-sand-300 rounded-full text-sage-600 hover:border-sage-400 hover:text-sage-700 transition-all whitespace-nowrap flex items-center gap-1.5"
          aria-label="Share this map"
          aria-expanded={open}
          aria-haspopup="true"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
            aria-hidden="true"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Toast — portalled to body for correct stacking */}
      {toast && createPortal(
        <div className="toast" role="status" aria-live="polite">
          Link copied
        </div>,
        document.body
      )}

      {/* Dropdown — portalled to body to escape overflow:hidden */}
      {open && dropdownPos && createPortal(
        <div
          id="share-dropdown-portal"
          ref={dropdownRef}
          role="menu"
          className="fixed bg-sand-50 border border-sand-300 rounded-xl shadow-sm overflow-hidden z-50"
          style={{
            top: `${dropdownPos.top}px`,
            right: `${dropdownPos.right}px`,
            minWidth: "200px",
            animation: "share-dropdown-in 250ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <button
            role="menuitem"
            onClick={copyLink}
            className="w-full px-4 py-3 text-sm text-left text-earth-700 hover:bg-sand-100 transition-colors flex items-center gap-2.5"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-sage-600 shrink-0"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy link
          </button>

          {canvasData && (
            <button
              role="menuitem"
              onClick={openShareCard}
              className="w-full px-4 py-3 text-sm text-left text-earth-700 hover:bg-sand-100 transition-colors flex items-center gap-2.5 border-t border-sand-200"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-sage-600 shrink-0"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              Share your shape
            </button>
          )}

          {hasNativeShare && (
            <button
              role="menuitem"
              onClick={nativeShare}
              className="w-full px-4 py-3 text-sm text-left text-earth-700 hover:bg-sand-100 transition-colors flex items-center gap-2.5 border-t border-sand-200"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-sage-600 shrink-0"
                aria-hidden="true"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Share
            </button>
          )}
        </div>,
        document.body
      )}

      {/* ShareCard modal — portalled to body to escape backdrop-blur containing block */}
      {showCard && canvasData && ShareCardLazy && createPortal(
        <ShareCardLazy
          data={canvasData}
          onClose={() => setShowCard(false)}
        />,
        document.body
      )}
    </>
  );
}
