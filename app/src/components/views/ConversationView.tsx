"use client";

import { useState, useEffect, useRef } from "react";
import type { Message, Phase, ConversationContext, ProgressiveCanvasData } from "@/engine/types";
import { PHASES } from "@/engine/types";
import Chat from "@/components/Chat";
import PhaseIndicator from "@/components/PhaseIndicator";
import ProgressiveCanvas from "@/components/ProgressiveCanvas";
import ErrorBoundary from "@/components/ErrorBoundary";

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
  canvasData: Partial<ProgressiveCanvasData>;
  completedPhases: Phase[];
  phaseTransitions: Record<string, string>;
  operatorName: string;
  operatorLocation: string;
  isComplete?: boolean;
  mapUrl?: string;
  isGeneratingMap?: boolean;
}

export default function ConversationView({
  messages,
  currentPhase,
  isLoading,
  streamingContent,
  lastError,
  contextToast,
  onSend,
  onRetry,
  onExit,
  canvasData,
  completedPhases,
  phaseTransitions,
  operatorName,
  operatorLocation,
  isComplete = false,
  mapUrl,
  isGeneratingMap,
}: ConversationViewProps) {
  const [confirmExit, setConfirmExit] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showMobileCanvas, setShowMobileCanvas] = useState(false);
  const prevMessageCount = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const textarea = document.querySelector<HTMLTextAreaElement>("textarea");
      textarea?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (messages.length > prevMessageCount.current && messages.length > 1) {
      const last = messages[messages.length - 1];
      if (last.role === "assistant") {
        setShowSaved(true);
        const timer = setTimeout(() => setShowSaved(false), 2000);
        return () => clearTimeout(timer);
      }
    }
    prevMessageCount.current = messages.length;
  }, [messages.length]);

  const completedCount = completedPhases.length;

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-2">
      {/* ═══ LEFT PANEL: Conversation ═══ */}
      <div className="flex flex-col h-screen border-r border-sand-300">
        {/* Header */}
        <header className="no-print px-5 md:px-8 py-3 flex items-center justify-between border-b border-sand-200">
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
                <span className="text-earth-600">Leave?</span>
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
          {showSaved && (
            <span className="text-xs text-sage-500 animate-fade-in">
              Saved
            </span>
          )}
        </header>

        {/* Phase indicator */}
        <PhaseIndicator currentPhase={currentPhase} />

        {/* Chat */}
        <ErrorBoundary context="conversation">
          <Chat
            messages={messages}
            currentPhase={currentPhase}
            isLoading={isLoading}
            streamingContent={streamingContent}
            onSend={onSend}
            errorBar={lastError}
            onRetry={onRetry}
            phaseTransitions={phaseTransitions}
          />
        </ErrorBoundary>
      </div>

      {/* ═══ RIGHT PANEL: Progressive Canvas (desktop only) ═══ */}
      <div className="hidden md:block h-screen overflow-hidden">
        <ProgressiveCanvas
          completedPhases={completedPhases}
          canvasData={canvasData}
          isThinking={isLoading}
          isComplete={isComplete}
          operatorName={operatorName}
          operatorLocation={operatorLocation}
          mapUrl={mapUrl}
          isGeneratingMap={isGeneratingMap}
        />
      </div>

      {/* ═══ MOBILE: Floating pill button ═══ */}
      <button
        className="md:hidden fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-2 bg-white border border-sand-300 rounded-full shadow-lg text-sm text-sage-700 hover:bg-sage-50 transition-all no-print"
        onClick={() => setShowMobileCanvas(true)}
      >
        See your canvas
        <span className="text-xs text-sage-400">·</span>
        <span className="text-xs text-sage-400">{completedCount}/6</span>
      </button>

      {/* ═══ MOBILE: Bottom sheet ═══ */}
      {showMobileCanvas && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-earth-900/30"
            onClick={() => setShowMobileCanvas(false)}
          />
          {/* Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-sand-50 rounded-t-2xl shadow-2xl"
            style={{ height: "80vh" }}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-sand-200">
              <span className="text-sm text-sage-500 font-medium">Your Canvas</span>
              <button
                onClick={() => setShowMobileCanvas(false)}
                className="text-sm text-sage-600 hover:text-sage-800 transition-colors"
              >
                Back to conversation
              </button>
            </div>
            <div className="h-full overflow-hidden pb-12">
              <ProgressiveCanvas
                completedPhases={completedPhases}
                canvasData={canvasData}
                isThinking={isLoading}
                isComplete={isComplete}
                operatorName={operatorName}
                operatorLocation={operatorLocation}
                mapUrl={mapUrl}
                isGeneratingMap={isGeneratingMap}
              />
            </div>
          </div>
        </div>
      )}

      {/* Context toast */}
      {contextToast && (
        <div className="fixed bottom-[7rem] md:bottom-8 left-1/2 -translate-x-1/2 z-30 bg-sage-600 text-white text-sm px-5 py-2.5 rounded-lg shadow-lg animate-fade-in no-print">
          {contextToast}
        </div>
      )}
    </div>
  );
}
