"use client";

import { useState, useEffect } from "react";
import ChatSheet from "@/components/chat/ChatSheet";
import NotificationPrompt from "@/components/today/NotificationPrompt";
import EveningReflection from "@/components/today/EveningReflection";
import { useNetworkStatus } from "@/lib/use-network-status";

// ── Inlined: ChatBubble ──
function ChatBubble({ onClick }: { onClick: () => void }) {
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

interface TabShellProps {
  contextPrompt?: string;
  children: React.ReactNode;
  /** Programmatically open the chat sheet */
  forceOpen?: boolean;
  /** Called when the chat sheet closes (for programmatic open tracking) */
  onChatClose?: () => void;
  /** Hide the floating chat bubble (e.g. when page has its own prompt bar) */
  hideBubble?: boolean;
  /** Which tab this shell is rendered on — passed to ChatSheet for context awareness */
  sourceTab?: "today" | "whole" | "grow";
  /** Structured context data from the current tab to pass to the conversation engine */
  tabContext?: Record<string, unknown>;
  /** Pre-loaded HUMA opener message for ChatSheet (e.g. pattern investigation) */
  initialMessage?: string;
  /** Chat mode — "new-aspiration" starts aspiration-creation conversation */
  chatMode?: "default" | "new-aspiration";
}

/**
 * Wraps a tab page with the ChatBubble + ChatSheet overlay.
 * BottomNav is rendered in the root layout — this only adds the chat layer.
 */
export default function TabShell({ contextPrompt, children, forceOpen, onChatClose, hideBubble, sourceTab, tabContext, initialMessage, chatMode }: TabShellProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const online = useNetworkStatus();

  // Sync forceOpen from parent
  useEffect(() => {
    if (forceOpen) setChatOpen(true);
  }, [forceOpen]);

  const handleClose = () => {
    setChatOpen(false);
    onChatClose?.();
  };

  return (
    <>
      {!online && (
        <div
          role="alert"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: "var(--color-amber-100)",
            borderBottom: "1px solid #F5D4B3",
            padding: "8px 16px",
            textAlign: "center",
          }}
        >
          <span className="font-sans" style={{ fontSize: "13px", color: "#B5621E" }}>
            You&apos;re offline. Some features won&apos;t work until you reconnect.
          </span>
        </div>
      )}
      {children}
      <NotificationPrompt />
      <EveningReflection />
      {!hideBubble && <ChatBubble onClick={() => setChatOpen(true)} />}
      <ChatSheet
        open={chatOpen}
        onClose={handleClose}
        contextPrompt={contextPrompt}
        sourceTab={sourceTab}
        tabContext={tabContext}
        initialMessage={initialMessage}
        mode={chatMode}
      />
    </>
  );
}
