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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/25"
    >
      <div
        ref={sheetRef}
        className="w-full max-w-[440px] bg-sand-50 rounded-t-2xl px-5 pt-6 pb-8"
        style={{
          animation: "confirmation-slide-up 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        }}
      >
        <h3 className="font-serif font-medium text-[20px] text-earth-650 leading-tight">
          {title}
        </h3>

        <p className="font-sans text-sm text-earth-500 leading-normal mt-2">
          {body}
        </p>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 font-sans font-medium cursor-pointer text-sm py-3 rounded-xl bg-sand-300 text-earth-500 border-none"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 font-sans font-medium cursor-pointer text-sm py-3 rounded-xl bg-rose text-sand-50 border-none"
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
