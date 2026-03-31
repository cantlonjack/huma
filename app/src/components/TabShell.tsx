"use client";

import { useState, useEffect } from "react";
import ChatBubble from "@/components/ChatBubble";
import ChatSheet from "@/components/ChatSheet";

interface TabShellProps {
  contextPrompt?: string;
  children: React.ReactNode;
  /** Programmatically open the chat sheet */
  forceOpen?: boolean;
  /** Called when the chat sheet closes (for programmatic open tracking) */
  onChatClose?: () => void;
}

/**
 * Wraps a tab page with the ChatBubble + ChatSheet overlay.
 * BottomNav is rendered in the root layout — this only adds the chat layer.
 */
export default function TabShell({ contextPrompt, children, forceOpen, onChatClose }: TabShellProps) {
  const [chatOpen, setChatOpen] = useState(false);

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
      {children}
      <ChatBubble onClick={() => setChatOpen(true)} />
      <ChatSheet
        open={chatOpen}
        onClose={handleClose}
        contextPrompt={contextPrompt}
      />
    </>
  );
}
