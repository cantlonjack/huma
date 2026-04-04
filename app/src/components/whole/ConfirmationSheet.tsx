"use client";

import { useEffect, useRef } from "react";

interface ConfirmationSheetProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationSheet({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = "Keep it",
  onConfirm,
  onCancel,
}: ConfirmationSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on backdrop tap
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };
    // Delay listener to avoid immediate close from the triggering click
    const timer = setTimeout(() => document.addEventListener("mousedown", handler), 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handler);
    };
  }, [open, onCancel]);

  if (!open) return null;

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
          animation: "confirmation-slide-up 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        }}
      >
        <h3
          className="font-serif font-medium"
          style={{ fontSize: "20px", color: "#3D3B36", lineHeight: "1.3" }}
        >
          {title}
        </h3>

        <p
          className="font-sans"
          style={{ fontSize: "14px", color: "#6B6358", lineHeight: "1.5", marginTop: "8px" }}
        >
          {body}
        </p>

        <div className="flex gap-3" style={{ marginTop: "20px" }}>
          <button
            onClick={onCancel}
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
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 font-sans font-medium cursor-pointer"
            style={{
              fontSize: "14px",
              padding: "12px",
              borderRadius: "12px",
              background: "#E57373",
              color: "#FAF8F3",
              border: "none",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes confirmation-slide-up {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
