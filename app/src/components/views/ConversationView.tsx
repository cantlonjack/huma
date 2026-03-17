"use client";

import { useState, useEffect } from "react";
import type { Message, Phase, ConversationContext } from "@/engine/types";
import Chat from "@/components/Chat";
import PhaseIndicator from "@/components/PhaseIndicator";
import MapPreview from "@/components/MapPreview";

interface ConversationViewProps {
  messages: Message[];
  currentPhase: Phase;
  isLoading: boolean;
  streamingContent: string;
  lastError: { content: string; retryWith: string } | null;
  contextSnapshot: Partial<ConversationContext>;
  contextToast: string | null;
  onSend: (content: string) => void;
  onRetry: () => void;
  onExit: () => void;
}

export default function ConversationView({
  messages,
  currentPhase,
  isLoading,
  streamingContent,
  lastError,
  contextSnapshot,
  contextToast,
  onSend,
  onRetry,
  onExit,
}: ConversationViewProps) {
  const [confirmExit, setConfirmExit] = useState(false);

  // Auto-focus textarea on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const textarea = document.querySelector<HTMLTextAreaElement>("textarea");
      textarea?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <header className="no-print border-b border-sand-200 px-6 md:px-16 lg:px-24 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setConfirmExit(true)}
            className="text-sm uppercase tracking-[0.3em] text-sage-600 font-medium hover:text-sage-800 transition-colors"
            aria-label="Return to home"
          >
            HUMA
          </button>
          {confirmExit && (
            <span className="flex items-center gap-2 text-sm animate-fade-in">
              <span className="text-earth-600">Leave conversation?</span>
              <button
                onClick={() => { setConfirmExit(false); onExit(); }}
                className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmExit(false)}
                className="text-earth-400 hover:text-earth-600 transition-colors"
              >
                No
              </button>
            </span>
          )}
        </div>
        <PhaseIndicator currentPhase={currentPhase} />
      </header>
      <Chat
        messages={messages}
        currentPhase={currentPhase}
        isLoading={isLoading}
        streamingContent={streamingContent}
        onSend={onSend}
        errorBar={lastError}
        onRetry={onRetry}
      />
      <MapPreview context={contextSnapshot} />

      {contextToast && (
        <div className="fixed bottom-32 lg:bottom-8 left-1/2 -translate-x-1/2 z-30 bg-sage-600 text-white text-sm px-5 py-2.5 rounded-lg shadow-lg animate-fade-in no-print">
          {contextToast}
        </div>
      )}
    </div>
  );
}
