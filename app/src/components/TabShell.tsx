"use client";

import { useState, useEffect } from "react";
import ChatBubble from "@/components/ChatBubble";
import ChatSheet from "@/components/ChatSheet";
import NotificationPrompt from "@/components/NotificationPrompt";
import { useNetworkStatus } from "@/lib/use-network-status";

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
}

/**
 * Wraps a tab page with the ChatBubble + ChatSheet overlay.
 * BottomNav is rendered in the root layout — this only adds the chat layer.
 */
export default function TabShell({ contextPrompt, children, forceOpen, onChatClose, hideBubble, sourceTab, tabContext }: TabShellProps) {
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
      {!hideBubble && <ChatBubble onClick={() => setChatOpen(true)} />}
      <ChatSheet
        open={chatOpen}
        onClose={handleClose}
        contextPrompt={contextPrompt}
        sourceTab={sourceTab}
        tabContext={tabContext}
      />
    </>
  );
}
