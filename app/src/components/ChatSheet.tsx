"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage, Behavior, Aspiration, ReorganizationPlan } from "@/types/v2";
import { parseMarkersV2 as parseMarkers } from "@/lib/parse-markers-v2";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import {
  getChatMessages,
  saveChatMessage,
  getAspirations,
  saveAspiration,
  getKnownContext,
  updateKnownContext,
  updateAspirationStatus,
  updateAspirationBehaviors,
} from "@/lib/supabase-v2";
import { getLocalDate } from "@/lib/date-utils";

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Apply a reorganization plan: pause released aspirations, update revised behaviors.
 * Runs async, non-blocking. Updates both Supabase and local state.
 */
async function applyReorganization(
  supabase: SupabaseClient,
  userId: string,
  plan: ReorganizationPlan,
  aspirations: Aspiration[],
  setAspirations: React.Dispatch<React.SetStateAction<Aspiration[]>>,
) {
  // Release — pause these aspirations
  for (const item of plan.release) {
    updateAspirationStatus(supabase, userId, item.aspirationId, "paused").catch(() => {});
  }

  // Revise — update behaviors for these aspirations
  for (const item of plan.revise) {
    const behaviors: Behavior[] = item.revisedBehaviors.map(b => ({
      key: b.key,
      text: b.text || b.name,
      frequency: b.frequency || "weekly",
      dimensions: (b.dimensions || []).map(d => ({
        dimension: d as Behavior["dimensions"][0]["dimension"],
        direction: "builds" as const,
        reasoning: "",
      })),
      detail: b.detail,
      enabled: true,
      is_trigger: b.is_trigger,
    })) as (Behavior & { is_trigger?: boolean })[];

    updateAspirationBehaviors(supabase, userId, item.aspirationId, behaviors).catch(() => {});
  }

  // Update local state
  const releaseIds = new Set(plan.release.map(r => r.aspirationId));
  const reviseMap = new Map(plan.revise.map(r => [r.aspirationId, r]));

  const updated = aspirations.map(asp => {
    if (releaseIds.has(asp.id)) {
      return { ...asp, status: "paused" as const };
    }
    const revision = reviseMap.get(asp.id);
    if (revision) {
      const newBehaviors: Behavior[] = revision.revisedBehaviors.map(b => ({
        key: b.key,
        text: b.text || b.name,
        frequency: b.frequency || "weekly",
        dimensions: (b.dimensions || []).map(d => ({
          dimension: d as Behavior["dimensions"][0]["dimension"],
          direction: "builds" as const,
          reasoning: "",
        })),
        detail: b.detail,
        enabled: true,
      }));
      return { ...asp, behaviors: newBehaviors };
    }
    return asp;
  });

  setAspirations(updated);
  localStorage.setItem("huma-v2-aspirations", JSON.stringify(updated));

  // Clear today's cached sheet so it recompiles with new behaviors
  const today = getLocalDate();
  localStorage.removeItem(`huma-v2-sheet-${today}`);
  localStorage.removeItem(`huma-v2-compiled-sheet-${today}`);
}

type RichMessage = ChatMessage & {
  options?: string[] | null;
  behaviors?: Behavior[] | null;
  actions?: string[] | null;
};

interface ChatSheetProps {
  open: boolean;
  onClose: () => void;
  contextPrompt?: string;
  /** Which tab the chat was opened from */
  sourceTab?: "today" | "whole" | "grow";
  /** Structured context from the current tab */
  tabContext?: Record<string, unknown>;
  /** Pre-loaded HUMA opener message (e.g. pattern investigation). Shown once on first open. */
  initialMessage?: string;
}

export default function ChatSheet({ open, onClose, contextPrompt, sourceTab, tabContext, initialMessage }: ChatSheetProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<RichMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [knownContext, setKnownContext] = useState<Record<string, unknown>>({});
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef(0);
  const dragStartTime = useRef(0);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  // Track whether user is near bottom of scroll
  const isNearBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }, []);

  // Auto-scroll on new messages — only if already near bottom
  useEffect(() => {
    if (scrollRef.current && isNearBottom()) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, streaming, isNearBottom]);

  // Handle virtual keyboard on mobile via visualViewport API
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      // Calculate keyboard height from viewport difference
      const offset = window.innerHeight - vv.height - vv.offsetTop;
      setKeyboardOffset(Math.max(0, offset));
      // Keep scroll at bottom when keyboard opens
      if (offset > 0 && scrollRef.current) {
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
        });
      }
    };

    vv.addEventListener("resize", handleResize);
    vv.addEventListener("scroll", handleResize);
    return () => {
      vv.removeEventListener("resize", handleResize);
      vv.removeEventListener("scroll", handleResize);
      setKeyboardOffset(0);
    };
  }, [open]);

  // Load state when sheet opens
  useEffect(() => {
    if (!open || loaded) return;

    async function loadState() {
      let foundMessages = false;

      if (user) {
        const supabase = createClient();
        if (supabase) {
          try {
            const [dbMessages, dbAspirations, dbContext] = await Promise.all([
              getChatMessages(supabase, user.id),
              getAspirations(supabase, user.id),
              getKnownContext(supabase, user.id),
            ]);
            if (dbMessages.length > 0) { setMessages(dbMessages); foundMessages = true; }
            if (dbAspirations.length > 0) setAspirations(dbAspirations);
            if (Object.keys(dbContext).length > 0) setKnownContext(dbContext);
          } catch { /* fallback */ }
        }
      }

      if (!foundMessages) {
        try {
          const savedMessages = localStorage.getItem("huma-v2-chat-messages");
          const startMessages = localStorage.getItem("huma-v2-start-messages");
          if (savedMessages) setMessages(JSON.parse(savedMessages));
          else if (startMessages) setMessages(JSON.parse(startMessages));
        } catch { /* fresh */ }
      }

      if (!user) {
        try {
          const ctx = localStorage.getItem("huma-v2-known-context");
          if (ctx) setKnownContext(JSON.parse(ctx));
          const asp = localStorage.getItem("huma-v2-aspirations");
          if (asp) setAspirations(JSON.parse(asp));
        } catch { /* fresh */ }
      }

      setLoaded(true);
    }
    loadState();
  }, [open, loaded, user]);

  // Inject initial HUMA opener (e.g. "What changed?" for dropping patterns)
  const initialMessageInjected = useRef<string | null>(null);
  useEffect(() => {
    if (!loaded || !open || !initialMessage) return;
    // Only inject once per unique initialMessage value
    if (initialMessageInjected.current === initialMessage) return;
    initialMessageInjected.current = initialMessage;
    const opener: RichMessage = {
      id: crypto.randomUUID(),
      role: "huma",
      content: initialMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, opener]);
  }, [loaded, open, initialMessage]);

  // Persist to localStorage
  useEffect(() => {
    if (!loaded) return;
    if (messages.length > 0) {
      localStorage.setItem("huma-v2-chat-messages", JSON.stringify(messages));
      localStorage.setItem("huma-v2-known-context", JSON.stringify(knownContext));
    }
  }, [messages, knownContext, loaded]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Send message
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages as RichMessage[]);
    setInput("");
    setStreaming(true);
    setLastFailedMessage(null);

    if (user) {
      const supabase = createClient();
      if (supabase) saveChatMessage(supabase, user.id, userMsg).catch(() => {});
    }

    try {
      // Compute dayCount from start date
      let dayCount: number | undefined;
      try {
        const start = localStorage.getItem("huma-v2-start-date");
        if (start) {
          const diff = Math.ceil((Date.now() - new Date(start).getTime()) / 86400000);
          dayCount = diff > 0 ? diff : 1;
        }
      } catch { /* fresh operator */ }

      const res = await fetch("/api/v2-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role === "huma" ? "assistant" : m.role, content: m.content })),
          knownContext,
          aspirations: aspirations.map(a => ({ rawText: a.rawText, clarifiedText: a.clarifiedText, status: a.status })),
          sourceTab,
          tabContext,
          dayCount,
        }),
      });

      if (!res.ok) throw new Error("Chat API error");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No body");

      const decoder = new TextDecoder();
      let fullResponse = "";

      const humaMsg: RichMessage = {
        id: crypto.randomUUID(),
        role: "huma",
        content: "",
        createdAt: new Date().toISOString(),
      };
      setMessages([...newMessages, humaMsg] as RichMessage[]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += decoder.decode(value, { stream: true });
        const { cleanText } = parseMarkers(fullResponse);
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === "huma") updated[updated.length - 1] = { ...last, content: cleanText };
          return updated;
        });
      }

      const { cleanText, parsedOptions, parsedBehaviors, parsedActions, parsedContext, parsedReorganization } = parseMarkers(fullResponse);

      const finalHumaMsg: ChatMessage = { ...humaMsg, content: cleanText, contextExtracted: parsedContext || undefined };
      if (user) {
        const supabase = createClient();
        if (supabase) saveChatMessage(supabase, user.id, finalHumaMsg).catch(() => {});
      }

      if (parsedContext) {
        const newContext = { ...knownContext, ...parsedContext };
        setKnownContext(newContext);
        if (user) {
          const supabase = createClient();
          if (supabase) updateKnownContext(supabase, user.id, newContext).catch(() => {});
        }
        const today = getLocalDate();
        localStorage.removeItem(`huma-v2-sheet-${today}`);
      }

      if (parsedBehaviors) {
        const newAspiration: Aspiration = {
          id: crypto.randomUUID(),
          rawText: text,
          clarifiedText: "",
          behaviors: parsedBehaviors,
          dimensionsTouched: [],
          status: "active",
          stage: "active",
        };
        const updatedAsps = [...aspirations, newAspiration];
        setAspirations(updatedAsps);
        localStorage.setItem("huma-v2-aspirations", JSON.stringify(updatedAsps));
        if (user) {
          const supabase = createClient();
          if (supabase) saveAspiration(supabase, user.id, newAspiration).catch(() => {});
        }
      }

      // Handle reorganization output — release, protect, revise aspirations
      if (parsedReorganization && user) {
        const supabase = createClient();
        if (supabase) {
          applyReorganization(supabase, user.id, parsedReorganization, aspirations, setAspirations);
        }
      }

      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === "huma") {
          updated[updated.length - 1] = { ...last, content: cleanText, options: parsedOptions, behaviors: parsedBehaviors, actions: parsedActions };
        }
        return updated;
      });
    } catch {
      setLastFailedMessage(text);
      setMessages(prev => [
        ...prev.filter(m => m.content !== ""),
        {
          id: crypto.randomUUID(),
          role: "huma" as const,
          content: navigator.onLine
            ? "Something went wrong. Try again in a moment."
            : "You seem to be offline. Check your connection and try again.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setStreaming(false);
    }
  }, [messages, streaming, knownContext, aspirations, user]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Drag-to-dismiss handlers (velocity-aware)
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    const y = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragStartY.current = y;
    dragCurrentY.current = 0;
    dragStartTime.current = Date.now();
    if (sheetRef.current) sheetRef.current.style.transition = "none";
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (dragStartY.current === null) return;
    const y = "touches" in e ? e.touches[0].clientY : e.clientY;
    const delta = Math.max(0, y - dragStartY.current);
    dragCurrentY.current = delta;
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }
  };

  const handleDragEnd = () => {
    if (sheetRef.current) {
      sheetRef.current.style.transition = "transform 200ms cubic-bezier(0.22, 1, 0.36, 1)";
    }

    const elapsed = Date.now() - dragStartTime.current;
    const velocity = dragCurrentY.current / Math.max(elapsed, 1); // px/ms

    // Dismiss if dragged far enough OR fast swipe down
    if (dragCurrentY.current > 100 || (velocity > 0.5 && dragCurrentY.current > 30)) {
      onClose();
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = "translateY(0)";
    }
    dragStartY.current = null;
    dragCurrentY.current = 0;
  };

  // Render the latest messages (most recent conversation)
  const recentMessages = messages.slice(-50);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(0,0,0,0.3)",
          animation: "chatsheet-backdrop-in 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="absolute left-0 right-0 flex flex-col"
        style={{
          bottom: keyboardOffset > 0 ? `${keyboardOffset}px` : "0",
          maxHeight: keyboardOffset > 0 ? `calc(100vh - ${keyboardOffset}px)` : "85vh",
          background: "#FAF8F3",
          borderRadius: "20px 20px 0 0",
          animation: "chatsheet-slide-up 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        }}
      >
        {/* Drag handle */}
        <div
          className="flex items-center justify-center cursor-grab"
          style={{ padding: "16px 0 4px", minHeight: "44px" }}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
        >
          <div
            style={{
              width: "36px",
              height: "4px",
              borderRadius: "2px",
              background: "#DDD4C0",
            }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: "8px 20px 12px" }}>
          <span
            className="font-sans font-medium"
            style={{ fontSize: "11px", letterSpacing: "0.4em", color: "#6B8F71" }}
          >
            HUMA
          </span>
          <button
            onClick={onClose}
            className="cursor-pointer"
            style={{
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              fontSize: "18px",
              color: "#8C8274",
              marginRight: "-8px",
            }}
            aria-label="Close chat"
          >
            &times;
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto"
          style={{ padding: "0 20px 12px" }}
        >
          {!loaded ? (
            <div className="flex items-center justify-center" style={{ height: "120px" }}>
              <span
                className="rounded-full animate-dot-pulse"
                style={{ width: "8px", height: "8px", background: "#6B8F71" }}
              />
            </div>
          ) : recentMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center" style={{ height: "120px" }}>
              <p className="font-serif text-ink-700" style={{ fontSize: "18px", lineHeight: "1.4" }}>
                What&apos;s on your mind?
              </p>
            </div>
          ) : (
            recentMessages.map((msg, idx) => {
              const isLast = idx === recentMessages.length - 1;
              if (msg.role === "user") {
                return (
                  <div key={msg.id} className="flex justify-end mb-3">
                    <div style={{ maxWidth: "80%", background: "#F0EDE4", borderRadius: "12px", padding: "12px 16px" }}>
                      <p className="font-sans" style={{ fontSize: "14px", lineHeight: "1.6", color: "#52504A" }}>
                        {msg.content}
                      </p>
                    </div>
                  </div>
                );
              }
              const rich = msg as RichMessage;
              return (
                <div key={msg.id} className="mb-3" style={{ maxWidth: "680px" }}>
                  <p className="font-serif whitespace-pre-wrap" style={{ fontSize: "16px", lineHeight: "1.7", color: "#3D3B36" }}>
                    {msg.content}
                  </p>

                  {msg.contextExtracted && Object.keys(msg.contextExtracted).length > 0 && (
                    <div className="mt-2 inline-flex items-center rounded-full" style={{ padding: "4px 12px", background: "#EDF3ED" }}>
                      <span className="font-sans font-medium" style={{ fontSize: "12px", color: "#3A5A40" }}>
                        Context added: {Object.entries(msg.contextExtracted).map(([k, v]) => `${k}: ${v}`).join(", ")}
                      </span>
                    </div>
                  )}

                  {/* Tappable options */}
                  {isLast && rich.options?.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(opt)}
                      className="mt-2 mr-2 text-left font-sans cursor-pointer"
                      style={{
                        padding: "12px 16px",
                        fontSize: "14px",
                        color: "#3D3B36",
                        borderRadius: "12px",
                        border: "1px solid #DDD4C0",
                        background: "#FAF8F3",
                      }}
                    >
                      {opt}
                    </button>
                  ))}

                  {/* Behaviors */}
                  {isLast && rich.behaviors?.map((b, i) => (
                    <div key={i} className="mt-2 flex items-start gap-3" style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid #E8E2D6", background: "#FAF8F3" }}>
                      <span className="mt-0.5 flex-shrink-0 rounded-full" style={{ width: "20px", height: "20px", border: "2px solid #DDD4C0" }} />
                      <div>
                        <p className="font-sans font-medium" style={{ fontSize: "14px", color: "#3D3B36" }}>{b.text}</p>
                        {b.detail && <p className="font-sans" style={{ fontSize: "12px", color: "#8C8274", marginTop: "2px" }}>{b.detail}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })
          )}

          {/* Streaming indicator */}
          {streaming && recentMessages.length > 0 &&
            recentMessages[recentMessages.length - 1]?.role === "huma" &&
            recentMessages[recentMessages.length - 1]?.content === "" && (
            <div style={{ paddingTop: "12px" }}>
              <span
                className="rounded-full animate-dot-pulse"
                style={{ width: "8px", height: "8px", background: "#6B8F71", display: "block" }}
              />
            </div>
          )}

          {/* Retry button after error */}
          {!streaming && lastFailedMessage && (
            <button
              onClick={() => {
                const msg = lastFailedMessage;
                setLastFailedMessage(null);
                // Remove the error message before retrying
                setMessages(prev => prev.filter((m, i) => !(i === prev.length - 1 && m.role === "huma" && m.content.includes("went wrong" ))));
                sendMessage(msg);
              }}
              className="font-sans cursor-pointer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "8px",
                padding: "8px 16px",
                fontSize: "13px",
                color: "#B5621E",
                background: "var(--color-amber-100)",
                border: "1px solid #F5D4B3",
                borderRadius: "20px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Try again
            </button>
          )}
        </div>

        {/* Input bar */}
        <div style={{ padding: "8px 16px", paddingBottom: keyboardOffset > 0 ? "8px" : "calc(12px + env(safe-area-inset-bottom, 0px))", borderTop: "1px solid #E8E2D6" }}>
          <div className="flex items-center gap-3" style={{ background: "white", borderRadius: "16px", padding: "12px 16px", border: "1px solid #DDD4C0" }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={contextPrompt || "What's on your mind?"}
              disabled={streaming}
              enterKeyHint="send"
              autoComplete="off"
              className="flex-1 font-sans bg-transparent focus:outline-none disabled:opacity-50"
              style={{ fontSize: "16px", lineHeight: "1.4", color: "#3D3B36" }}
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

      {/* Keyframe animations injected via style tag */}
      <style>{`
        @keyframes chatsheet-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes chatsheet-backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
