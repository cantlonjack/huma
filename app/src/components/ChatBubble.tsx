"use client";

interface ChatBubbleProps {
  onClick: () => void;
}

export default function ChatBubble({ onClick }: ChatBubbleProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Open chat"
      className="fixed z-50 cursor-pointer"
      style={{
        bottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
        right: "16px",
        width: "52px",
        height: "52px",
        borderRadius: "50%",
        background: "#B5621E",
        border: "none",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
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
