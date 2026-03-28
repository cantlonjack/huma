"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage, Behavior, Aspiration } from "@/types/v2";
import { parseMarkersV2 as parseMarkers } from "@/lib/parse-markers-v2";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import {
  saveChatMessage,
  updateKnownContext,
  saveAspiration,
} from "@/lib/supabase-v2";
import { getLocalDate } from "@/lib/date-utils";

interface ConversationSheetProps {
  open: boolean;
  onClose: () => void;
  initialMessage?: string;
  knownContext: Record<string, unknown>;
  aspirations: Aspiration[];
  onContextUpdate?: (context: Record<string, unknown>) => void;
  onAspirationAdded?: (aspiration: Aspiration) => void;
  onSheetInvalidated?: () => void;
}

export default function ConversationSheet({
  open,
  onClose,
  initialMessage,
  knownContext,
  aspirations,
  onContextUpdate,
  onAspirationAdded,
  onSheetInvalidated,
}: ConversationSheetProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<
    (ChatMessage & { options?: string[] | null; behaviors?: Behavior[] | null; actions?: string[] | null })[]
  >([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [closing, setClosing] = useState(false);
  const [contextToast, setContextToast] = useState<string | null>(null);
  const [sheetToast, setSheetToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sentInitial = useRef(false);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [open]);

  // Send initial message if provided
  useEffect(() => {
    if (open && initialMessage && !sentInitial.current && messages.length === 0) {
      sentInitial.current = true;
      sendMessage(initialMessage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialMessage]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setMessages([]);
      setInput("");
      setContextToast(null);
      setSheetToast(null);
      sentInitial.current = false;
      setClosing(false);
    }
  }, [open]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages as typeof messages);
    setInput("");
    setStreaming(true);

    // Persist user message
    if (user) {
      const supabase = createClient();
      if (supabase) {
        saveChatMessage(supabase, user.id, userMsg).catch(() => {});
      }
    }

    try {
      const res = await fetch("/api/v2-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role === "huma" ? "assistant" : m.role,
            content: m.content,
          })),
          knownContext,
          aspirations: aspirations.map(a => ({
            rawText: a.rawText,
            clarifiedText: a.clarifiedText,
            status: a.status,
          })),
        }),
      });

      if (!res.ok) throw new Error("Chat API error");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No body");

      const decoder = new TextDecoder();
      let fullResponse = "";

      const humaMsg: typeof messages[0] = {
        id: crypto.randomUUID(),
        role: "huma",
        content: "",
        createdAt: new Date().toISOString(),
      };
      setMessages([...newMessages, humaMsg] as typeof messages);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += decoder.decode(value, { stream: true });
        const { cleanText } = parseMarkers(fullResponse);
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === "huma") {
            updated[updated.length - 1] = { ...last, content: cleanText };
          }
          return updated;
        });
      }

      const { cleanText, parsedOptions, parsedBehaviors, parsedActions, parsedContext, parsedAspirationName } = parseMarkers(fullResponse);

      // Save HUMA response
      const finalHumaMsg: ChatMessage = {
        ...humaMsg,
        content: cleanText,
        contextExtracted: parsedContext || undefined,
      };
      if (user) {
        const supabase = createClient();
        if (supabase) {
          saveChatMessage(supabase, user.id, finalHumaMsg).catch(() => {});
        }
      }

      // Handle context extraction
      if (parsedContext) {
        const newContext = { ...knownContext, ...parsedContext };
        onContextUpdate?.(newContext);

        // Show context toast
        const newKeys = Object.entries(parsedContext)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        setContextToast(`Context added: ${newKeys}`);

        // Persist context
        if (user) {
          const supabase = createClient();
          if (supabase) {
            updateKnownContext(supabase, user.id, newContext).catch(() => {});
          }
        }

        // Invalidate sheet cache
        const today = getLocalDate();
        localStorage.removeItem(`huma-v2-sheet-${today}`);
        onSheetInvalidated?.();
        setSheetToast("Tomorrow's sheet updated");
      }

      // Handle new aspiration from behaviors
      if (parsedBehaviors) {
        const newAspiration: Aspiration = {
          id: crypto.randomUUID(),
          rawText: text,
          clarifiedText: parsedAspirationName || "",
          behaviors: parsedBehaviors,
          dimensionsTouched: [],
          status: "active",
          stage: "active",
        };
        onAspirationAdded?.(newAspiration);

        if (user) {
          const supabase = createClient();
          if (supabase) {
            saveAspiration(supabase, user.id, newAspiration).catch(() => {});
          }
        }

        setSheetToast("Added to your system");
      }

      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === "huma") {
          updated[updated.length - 1] = {
            ...last,
            content: cleanText,
            options: parsedOptions,
            behaviors: parsedBehaviors,
            actions: parsedActions,
          };
        }
        return updated;
      });
    } catch (err) {
      console.error("ConversationSheet error:", err);
      setMessages(prev => [
        ...prev.filter(m => m.content !== ""),
        {
          id: crypto.randomUUID(),
          role: "huma" as const,
          content: "Something went wrong. Try again in a moment.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setStreaming(false);
    }
  }, [messages, streaming, knownContext, aspirations, user, onContextUpdate, onAspirationAdded, onSheetInvalidated]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] animate-overlay-in"
        style={{ background: "rgba(0,0,0,0.3)", opacity: closing ? 0 : undefined, transition: "opacity 200ms" }}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[70] bg-sand-50 rounded-t-2xl border-t border-sand-300 ${
          closing ? "animate-slide-down" : "animate-slide-up"
        }`}
        style={{ height: "70dvh" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center" style={{ paddingTop: "12px", paddingBottom: "8px" }}>
          <div
            className="bg-sand-300 cursor-pointer"
            style={{ width: "36px", height: "4px", borderRadius: "2px" }}
            onClick={handleClose}
          />
        </div>

        {/* Messages area */}
        <div ref={scrollRef} className="overflow-y-auto px-6 pb-4" style={{ height: "calc(70dvh - 80px)" }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-4`}>
              {msg.role === "user" ? (
                <div
                  className="ml-auto"
                  style={{ maxWidth: "80%", background: "var(--color-sand-200)", borderRadius: "12px", padding: "12px 16px" }}
                >
                  <p className="font-sans text-ink-600" style={{ fontSize: "14px", lineHeight: "1.6" }}>{msg.content}</p>
                </div>
              ) : (
                <div style={{ maxWidth: "680px" }}>
                  <p className="font-serif text-ink-700 whitespace-pre-wrap" style={{ fontSize: "15px", lineHeight: "1.7" }}>{msg.content}</p>

                  {/* Tappable options */}
                  {msg.options && msg.options.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2">
                      {msg.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(opt)}
                          className="text-left rounded-xl border border-sand-300 bg-sand-50 font-sans hover:border-sage-400 hover:bg-sage-50 transition-all duration-200 cursor-pointer"
                          style={{ padding: "12px 16px", fontSize: "14px", color: "var(--color-ink-700)" }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Behaviors */}
                  {msg.behaviors && msg.behaviors.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.behaviors.map((b, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-xl bg-sand-50 border border-sand-200" style={{ padding: "12px 16px" }}>
                          <span className="mt-0.5 flex-shrink-0 rounded-full" style={{ width: "20px", height: "20px", border: "2px solid var(--color-sand-300)" }} />
                          <div>
                            <p className="font-sans font-medium" style={{ fontSize: "14px", color: "var(--color-ink-700)" }}>{b.text}</p>
                            {b.detail && <p className="font-sans" style={{ fontSize: "12px", color: "var(--color-ink-400)", marginTop: "2px" }}>{b.detail}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Context toast */}
                  {contextToast && msg === messages[messages.length - 1] && msg.role === "huma" && (
                    <div className="mt-3 inline-flex items-center rounded-full bg-sage-50 animate-fade-in" style={{ padding: "4px 12px" }}>
                      <span className="font-sans font-medium text-sage-600" style={{ fontSize: "12px" }}>{contextToast}</span>
                    </div>
                  )}

                  {/* Sheet update toast */}
                  {sheetToast && msg === messages[messages.length - 1] && msg.role === "huma" && (
                    <div style={{ marginTop: "8px" }}>
                      <button
                        onClick={() => { /* could navigate */ }}
                        className="font-sans font-medium text-sage-500 hover:text-sage-700 transition-colors cursor-pointer"
                        style={{ fontSize: "12px" }}
                      >
                        {sheetToast} &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {streaming && messages[messages.length - 1]?.content === "" && (
            <div className="flex justify-start mb-4" style={{ paddingTop: "4px" }}>
              <span
                className="rounded-full animate-dot-pulse"
                style={{ width: "8px", height: "8px", background: "var(--color-sage-400)" }}
              />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="absolute bottom-0 left-0 right-0 bg-sand-50" style={{ padding: "8px 16px 16px" }}>
          <div className="flex items-center gap-3 bg-white border border-sand-300" style={{ borderRadius: "16px", padding: "12px 16px" }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell HUMA something..."
              disabled={streaming}
              className="flex-1 font-sans bg-transparent focus:outline-none placeholder:text-ink-300 disabled:opacity-50"
              style={{ fontSize: "14px", lineHeight: "1.4", color: "var(--color-ink-800)" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={streaming || !input.trim()}
              className="p-1 cursor-pointer disabled:opacity-30 transition-opacity"
              aria-label="Send"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#3A5A40" : "#8BAF8E"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
