"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage, Behavior, Aspiration, ReorganizationPlan } from "@/types/v2";
import type { HumaContext } from "@/types/context";
import { createEmptyContext } from "@/types/context";
import { mergeContext, dimensionsTouched, migrateFromKnownContext } from "@/lib/context-model";
import { parseMarkersV2 as parseMarkers } from "@/lib/parse-markers-v2";
import { MAX_MESSAGE_LENGTH } from "@/lib/constants";
import { useAuth } from "@/components/shared/AuthProvider";
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
import { getDomainTemplate, type StarterAspiration } from "@/data/archetype-templates";

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
  /** Chat mode — "new-aspiration" starts a focused aspiration-creation conversation */
  mode?: "default" | "new-aspiration";
}

export default function ChatSheet({ open, onClose, contextPrompt, sourceTab, tabContext, initialMessage, mode = "default" }: ChatSheetProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<RichMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [knownContext, setKnownContext] = useState<Record<string, unknown>>({});
  const [humaContext, setHumaContext] = useState<HumaContext>(createEmptyContext());
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  // Dimensions that were just updated — shown briefly as a growth indicator
  const [recentDimensions, setRecentDimensions] = useState<string[]>([]);
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

      // Hydrate HumaContext: check for stored structured context, or migrate from old format
      try {
        const storedHuma = localStorage.getItem("huma-v2-huma-context");
        if (storedHuma) {
          setHumaContext(JSON.parse(storedHuma));
        } else {
          // Migrate from old KnownContext format
          const oldCtx = localStorage.getItem("huma-v2-known-context");
          if (oldCtx) {
            const parsed = JSON.parse(oldCtx);
            // Detect if it's already HumaContext-shaped (has _version) or old flat format
            if (parsed._version) {
              setHumaContext(parsed as HumaContext);
            } else {
              const migrated = migrateFromKnownContext(parsed);
              setHumaContext(migrated);
              localStorage.setItem("huma-v2-huma-context", JSON.stringify(migrated));
            }
          }
        }
      } catch { /* fresh context */ }

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
      localStorage.setItem("huma-v2-huma-context", JSON.stringify(humaContext));
    }
  }, [messages, knownContext, humaContext, loaded]);

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
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    if (trimmed.length > MAX_MESSAGE_LENGTH) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
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
          humaContext,
          aspirations: aspirations.map(a => ({ rawText: a.rawText, clarifiedText: a.clarifiedText, status: a.status })),
          sourceTab,
          tabContext,
          dayCount,
          ...(mode === "new-aspiration" && { chatMode: "new-aspiration" }),
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

      const { cleanText, parsedOptions, parsedBehaviors, parsedActions, parsedContext, parsedReorganization, parsedDecision } = parseMarkers(fullResponse);

      const finalHumaMsg: ChatMessage = { ...humaMsg, content: cleanText, contextExtracted: parsedContext || undefined };
      if (user) {
        const supabase = createClient();
        if (supabase) saveChatMessage(supabase, user.id, finalHumaMsg).catch(() => {});
      }

      if (parsedContext) {
        // Legacy flat merge for backward compat
        const newContext = { ...knownContext, ...parsedContext };
        setKnownContext(newContext);

        // Deep merge into structured HumaContext
        const touched = dimensionsTouched(parsedContext as Partial<HumaContext>);
        const updatedHuma = mergeContext(humaContext, parsedContext as Partial<HumaContext>, "conversation");
        setHumaContext(updatedHuma);

        // Show which dimensions grew — visible for 4 seconds
        if (touched.length > 0) {
          setRecentDimensions(touched);
          setTimeout(() => setRecentDimensions([]), 4000);
        }

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

      // Handle decision output — save to context model
      if (parsedDecision) {
        const today = new Date();
        const followUpDate = new Date(today);
        followUpDate.setDate(followUpDate.getDate() + 42); // ~6 weeks

        const decision = {
          id: crypto.randomUUID(),
          date: today.toISOString().split("T")[0],
          description: parsedDecision.description,
          reasoning: parsedDecision.reasoning,
          frameworksSurfaced: parsedDecision.frameworks_surfaced,
          followUpDue: followUpDate.toISOString().split("T")[0],
        };

        const updatedHuma = {
          ...humaContext,
          decisions: [...(humaContext.decisions || []), decision],
          _lastUpdated: today.toISOString(),
        };
        setHumaContext(updatedHuma);
        localStorage.setItem("huma-v2-huma-context", JSON.stringify(updatedHuma));
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
  }, [messages, streaming, knownContext, humaContext, aspirations, user]);

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

  // Template quick-add cards for new-aspiration mode
  const templateSuggestions: { archetype: string; aspiration: StarterAspiration }[] = [];
  if (mode === "new-aspiration" && loaded && recentMessages.length === 0) {
    const archetypes = (tabContext?.archetypes as string[]) || [];
    const existingTexts = new Set(aspirations.map(a => (a.clarifiedText || a.rawText).toLowerCase().trim()));
    for (const arch of archetypes) {
      const template = getDomainTemplate(arch);
      if (!template) continue;
      for (const starter of template.starterAspirations) {
        if (!existingTexts.has(starter.text.toLowerCase().trim())) {
          templateSuggestions.push({ archetype: arch, aspiration: starter });
        }
      }
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 animate-[chatsheet-backdrop-in_320ms_cubic-bezier(0.22,1,0.36,1)_forwards]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Chat with HUMA"
        className="absolute left-0 right-0 flex flex-col bg-sand-50 rounded-t-[20px] animate-[chatsheet-slide-up_320ms_cubic-bezier(0.22,1,0.36,1)_forwards]"
        style={{
          bottom: keyboardOffset > 0 ? `${keyboardOffset}px` : "0",
          maxHeight: keyboardOffset > 0 ? `calc(100vh - ${keyboardOffset}px)` : "85vh",
        }}
      >
        {/* Drag handle */}
        <div
          className="flex items-center justify-center cursor-grab pt-4 pb-1 min-h-11"
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
        >
          <div className="w-9 h-1 rounded-sm bg-sand-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3">
          <span className="font-sans font-medium text-[11px] tracking-[0.4em] text-sage-450">
            HUMA
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-11 h-11 bg-transparent border-none text-lg text-earth-400 -mr-2 cursor-pointer"
            aria-label="Close chat"
          >
            &times;
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          aria-live="polite"
          aria-relevant="additions"
          className="flex-1 overflow-y-auto px-5 pb-3"
        >
          {!loaded ? (
            <div className="flex items-center justify-center h-[120px]">
              <span className="w-2 h-2 rounded-full bg-sage-450 animate-dot-pulse" />
            </div>
          ) : recentMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center min-h-[120px]">
              <p className="font-serif text-ink-700 text-lg leading-[1.4]">
                {mode === "new-aspiration" ? "What are you trying to make work?" : "What\u0027s on your mind?"}
              </p>
              {mode === "new-aspiration" && (
                <p className="font-sans text-sage-400 text-[13px] mt-1.5 max-w-[280px]">
                  Describe what you want to build, change, or protect. HUMA will turn it into something operational.
                </p>
              )}
              {/* Template quick-add cards */}
              {templateSuggestions.length > 0 && (
                <div className="mt-5 w-full text-left">
                  <p className="font-sans text-[11px] font-semibold tracking-[0.14em] text-sage-300 mb-2.5 text-center">
                    FROM YOUR ARCHETYPES
                  </p>
                  <div className="flex flex-col gap-2">
                    {templateSuggestions.slice(0, 4).map((t, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(t.aspiration.text)}
                        className="text-left cursor-pointer bg-sand-50 border border-sand-250 rounded-xl px-4 py-3 w-full"
                      >
                        <span className="font-serif text-[15px] leading-[1.4] text-earth-650 block">
                          {t.aspiration.text}
                        </span>
                        <span className="font-sans text-xs text-sage-300 mt-0.5 block">
                          {t.archetype} &middot; {t.aspiration.behaviors.length} behavior{t.aspiration.behaviors.length !== 1 ? "s" : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            recentMessages.map((msg, idx) => {
              const isLast = idx === recentMessages.length - 1;
              if (msg.role === "user") {
                return (
                  <div key={msg.id} className="flex justify-end mb-3">
                    <div className="max-w-[80%] bg-sand-200/70 rounded-xl px-4 py-3">
                      <p className="font-sans text-sm leading-relaxed text-earth-500">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                );
              }
              const rich = msg as RichMessage;
              return (
                <div key={msg.id} className="mb-3 max-w-[680px]">
                  <p className="font-serif whitespace-pre-wrap text-base leading-[1.7] text-earth-650">
                    {msg.content}
                  </p>

                  {msg.contextExtracted && Object.keys(msg.contextExtracted).length > 0 && (
                    <div className="mt-2 inline-flex items-center rounded-full px-3 py-1 bg-sage-50">
                      <span className="font-sans font-medium text-xs text-sage-700">
                        Context added: {Object.entries(msg.contextExtracted).map(([k, v]) => `${k}: ${v}`).join(", ")}
                      </span>
                    </div>
                  )}

                  {/* Tappable options */}
                  {isLast && rich.options?.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(opt)}
                      className="mt-2 mr-2 text-left font-sans cursor-pointer px-4 py-3 text-sm text-earth-650 rounded-xl border border-sand-300 bg-sand-50"
                    >
                      {opt}
                    </button>
                  ))}

                  {/* Behaviors */}
                  {isLast && rich.behaviors?.map((b, i) => (
                    <div key={i} className="mt-2 flex items-start gap-3 px-4 py-3 rounded-xl border border-sand-250 bg-sand-50">
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 border-sand-300" />
                      <div>
                        <p className="font-sans font-medium text-sm text-earth-650">{b.text}</p>
                        {b.detail && <p className="font-sans text-xs text-earth-400 mt-0.5">{b.detail}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })
          )}

          {/* Context growth indicator */}
          {recentDimensions.length > 0 && (
            <div className="flex items-center gap-1.5 py-2 animate-[fade-in_300ms_ease-out]">
              <span className="font-sans text-[11px] font-medium tracking-wide text-sage-400">
                HUMA now knows: {recentDimensions.map(d => d.toLowerCase()).join(", ")}
              </span>
            </div>
          )}

          {/* Streaming indicator */}
          {streaming && recentMessages.length > 0 &&
            recentMessages[recentMessages.length - 1]?.role === "huma" &&
            recentMessages[recentMessages.length - 1]?.content === "" && (
            <div className="pt-3" role="status" aria-label="HUMA is thinking">
              <span className="block w-2 h-2 rounded-full bg-sage-450 animate-dot-pulse" />
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
              className="font-sans cursor-pointer inline-flex items-center gap-1.5 mt-2 px-4 py-2 text-[13px] text-amber-600 bg-amber-100 border border-amber-200 rounded-full"
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
        <div className="px-4 pt-2 border-t border-sand-250" style={{ paddingBottom: keyboardOffset > 0 ? "8px" : "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-sand-300">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={contextPrompt || "What's on your mind?"}
              aria-label="Message"
              disabled={streaming}
              enterKeyHint="send"
              autoComplete="off"
              className="flex-1 font-sans bg-transparent focus:outline-none disabled:opacity-50 text-base leading-[1.4] text-earth-650"
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
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
