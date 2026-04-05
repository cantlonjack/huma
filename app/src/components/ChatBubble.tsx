"use client";

interface ChatBubbleProps {
  onClick: () => void;
}

export default function ChatBubble({ onClick }: ChatBubbleProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Open chat"
      className="fixed z-50 cursor-pointer right-4 w-[52px] h-[52px] rounded-full bg-amber-600 border-none shadow-md flex items-center justify-center"
      style={{ bottom: "calc(72px + env(safe-area-inset-bottom, 0px))" }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
