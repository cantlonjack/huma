"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { type Message, type Phase, PHASES } from "@/engine/types";

const INPUT_PLACEHOLDERS: Record<Phase, string> = {
  ikigai: "Share what comes to mind\u2026",
  "holistic-context": "Describe the life you are moving toward\u2026",
  landscape: "Tell me about your situation\u2026",
  "enterprise-map": "What resonates with you?",
  "nodal-interventions": "What feels most alive in this picture?",
  "operational-design": "How does this rhythm feel for your week?",
  complete: "Ask a follow-up question\u2026",
};

interface ChatProps {
  messages: Message[];
  currentPhase: Phase;
  isLoading: boolean;
  streamingContent: string;
  onSend: (content: string) => void;
  errorBar?: { content: string; retryWith: string } | null;
  onRetry?: () => void;
  phaseTransitions?: Record<string, string>;
}

export default function Chat({
  messages,
  currentPhase,
  isLoading,
  streamingContent,
  onSend,
  errorBar,
  onRetry,
  phaseTransitions = {},
}: ChatProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [isLoading]);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsScrolledDown(el.scrollTop > 60);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="relative flex-1 overflow-y-auto px-5 md:px-8 py-8"
      >
        {isScrolledDown && (
          <div className="sticky top-0 left-0 right-0 h-8 bg-gradient-to-b from-sand-50 to-transparent pointer-events-none z-10" />
        )}

        <div className="max-w-none space-y-6">
          {messages.map((msg) => (
            <div key={msg.id}>
              <MessageBlock message={msg} />
              {phaseTransitions[msg.id] && (
                <PhaseDivider phaseId={phaseTransitions[msg.id]} />
              )}
            </div>
          ))}

          {/* Streaming response */}
          {isLoading && streamingContent && (
            <div aria-live="polite">
              <div className="rounded-xl p-4 bg-sand-100 max-w-[85%]">
                <div className="font-serif text-[1.05rem] leading-[1.8] text-earth-700 whitespace-pre-wrap">
                  {streamingContent}
                  <span
                    className="inline-block w-0.5 h-5 bg-sage-400 animate-pulse ml-0.5 align-text-bottom"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Pulsing sage circle typing indicator */}
          {isLoading && !streamingContent && (
            <div className="flex items-center" role="status">
              <span className="sr-only">HUMA is thinking...</span>
              <div
                className="w-3 h-3 rounded-full animate-[typing-pulse_1.5s_ease-in-out_infinite] bg-[radial-gradient(circle,var(--color-sage-400),var(--color-sage-300))]"
                aria-hidden="true"
              />
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Error bar */}
      {errorBar && (
        <div role="alert" className="bg-sand-100 border-t border-sand-300 px-5 md:px-8 py-3 no-print">
          <div className="flex items-center justify-between">
            <p className="text-sm text-earth-700">
              {errorBar.content}
            </p>
            <button
              onClick={onRetry}
              className="px-4 py-1.5 text-sm bg-amber-600 rounded-full hover:bg-amber-700 text-white transition-all"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-sand-200 bg-sand-50 px-5 md:px-8 py-4 no-print">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-3"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={INPUT_PLACEHOLDERS[currentPhase] || "Share what comes to mind\u2026"}
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none bg-white border border-sand-200 rounded-lg px-4 py-3 text-earth-800 placeholder:text-earth-400 focus:outline-none focus:border-sage-400 focus:ring-1 focus:ring-sage-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 bg-amber-600 text-white rounded-full font-medium hover:bg-amber-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

function MessageBlock({ message }: { message: Message }) {
  if (message.role === "assistant") {
    return (
      <div className="rounded-xl p-4 bg-sand-100 max-w-[85%]">
        <div className="font-serif text-[1.05rem] leading-[1.8] text-earth-700 whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="border-l-2 border-sage-300 pl-3 text-earth-600 leading-relaxed whitespace-pre-wrap max-w-[85%] ml-auto">

      {message.content}
    </div>
  );
}

function PhaseDivider({ phaseId }: { phaseId: string }) {
  const phaseInfo = PHASES.find((p) => p.id === phaseId);
  if (!phaseInfo) return null;

  return (
    <div className="flex items-center my-8 animate-[fadeIn_0.6s_ease]">
      <div className="flex-1 h-px bg-sage-200" />
      <span className="mx-4 px-3 py-1 rounded-full bg-sage-50 text-sage-500 uppercase text-[0.65rem] tracking-[0.15em] font-sans">

        {phaseInfo.label}
      </span>
      <div className="flex-1 h-px bg-sage-200" />
    </div>
  );
}
