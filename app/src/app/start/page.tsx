"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { PaletteConcept, ChatMessage, Behavior } from "@/types/v2";
import { parseMarkersV2 as parseMarkers } from "@/lib/parse-markers-v2";
import { useAuth } from "@/components/AuthProvider";
import AuthModal from "@/components/AuthModal";
import { createClient } from "@/lib/supabase";
import { migrateLocalStorageToSupabase } from "@/lib/supabase-v2";
import DecompositionPreview from "@/components/DecompositionPreview";

// ─── Palette Acknowledgments ─────────────────────────────────────────────────

const PALETTE_ACKS = {
  pain: [
    (t: string) => `Noted — "${t}" is part of the picture.`,
    (t: string) => `"${t}" — that connects. We'll factor it in.`,
    (t: string) => `Got it. "${t}" goes on the list.`,
  ],
  aspiration: [
    (t: string) => `"${t}" — good. That shapes things.`,
    (t: string) => `Noted. "${t}" will factor in.`,
    (t: string) => `"${t}" — we'll build that into the system.`,
  ],
};

function getPaletteAcknowledgment(concept: PaletteConcept): string {
  const options = PALETTE_ACKS[concept.category] || PALETTE_ACKS.pain;
  return options[Math.floor(Math.random() * options.length)](concept.text);
}

// ─── Message Component ──────────────────────────────────────────────────────

function MessageBubble({
  message,
  onOptionTap,
  onConfirmBehaviors,
}: {
  message: ChatMessage & {
    options?: string[] | null;
    behaviors?: Behavior[] | null;
    actions?: string[] | null;
  };
  onOptionTap?: (option: string) => void;
  onConfirmBehaviors?: (behaviors: Behavior[]) => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 animate-fade-in`}>
      <div
        className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${
          isUser
            ? "bg-sand-100 text-earth-800"
            : "bg-white text-earth-800"
        }`}
        style={{ lineHeight: "1.7" }}
      >
        <p className={`${isUser ? "font-sans" : "font-serif text-lg"} text-base whitespace-pre-wrap`}>{message.content}</p>

        {/* Tappable Options */}
        {message.options && message.options.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {message.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => onOptionTap?.(opt)}
                className="text-left px-4 py-3 rounded-xl border border-sand-300 bg-sand-50 text-earth-700 font-sans text-sm hover:border-sage-400 hover:bg-sage-50 transition-all duration-200 cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Decomposition Preview (behaviors + actions handled together) */}
        {message.behaviors && message.behaviors.length > 0 && onConfirmBehaviors ? (
          <DecompositionPreview
            behaviors={message.behaviors}
            onConfirm={onConfirmBehaviors}
          />
        ) : message.behaviors && message.behaviors.length > 0 ? (
          <div className="mt-4 space-y-2">
            {message.behaviors.map((b, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-sand-50 border border-sand-200">
                <span className="mt-0.5 w-5 h-5 rounded-full border-2 border-earth-300 flex-shrink-0" />
                <div>
                  <p className="font-sans text-sm text-earth-700 font-medium">{b.text}</p>
                  {b.frequency === "specific-days" && b.days && (
                    <p className="font-sans text-xs text-earth-400 mt-0.5">
                      {b.days.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(", ")}
                    </p>
                  )}
                  {b.detail && (
                    <p className="font-sans text-xs text-earth-400 mt-0.5">{b.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ─── Palette Panel ──────────────────────────────────────────────────────────

function PalettePanel({
  concepts,
  onTap,
  loading,
}: {
  concepts: PaletteConcept[];
  onTap: (concept: PaletteConcept) => void;
  loading: boolean;
}) {
  if (concepts.length === 0 && !loading) return null;

  return (
    <div className="p-6">
      <p className="font-sans text-xs text-earth-400 mb-4 tracking-wide">
        You might also be dealing with...
      </p>
      <div className="flex flex-wrap gap-2">
        {concepts.map((concept) => (
          <button
            key={concept.id}
            onClick={() => onTap(concept)}
            className="px-3.5 py-2 rounded-full bg-sand-100 text-earth-500 border border-sand-300 font-sans text-sm hover:bg-sage-50 hover:text-sage-600 hover:border-sage-300 transition-all duration-200 cursor-pointer"
          >
            {concept.text}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function StartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<
    (ChatMessage & { options?: string[] | null; behaviors?: Behavior[] | null; actions?: string[] | null; contextNote?: boolean })[]
  >([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [paletteConcepts, setPaletteConcepts] = useState<PaletteConcept[]>([]);
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([]);
  const [paletteLoading, setPaletteLoading] = useState(false);
  const [knownContext, setKnownContext] = useState<Record<string, unknown>>({});
  const [decomposedBehaviors, setDecomposedBehaviors] = useState<Behavior[]>([]);
  const [aspirationName, setAspirationName] = useState<string | null>(null);
  const [showPaletteMobile, setShowPaletteMobile] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAspiration, setPendingAspiration] = useState<{
    rawText: string;
    clarifiedText: string;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  // Persist to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("huma-v2-start-messages", JSON.stringify(messages));
      localStorage.setItem("huma-v2-known-context", JSON.stringify(knownContext));
      if (decomposedBehaviors.length > 0) {
        localStorage.setItem("huma-v2-behaviors", JSON.stringify(decomposedBehaviors));
      }
    }
  }, [messages, knownContext, decomposedBehaviors]);

  // Restore from localStorage (unless fresh start requested or conversation already completed)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isFresh = params.get("fresh") === "1";
    if (isFresh) {
      // Clear stale conversation state for a clean start
      localStorage.removeItem("huma-v2-start-messages");
      localStorage.removeItem("huma-v2-behaviors");
      return;
    }
    try {
      // Check if aspirations already exist (conversation was completed before)
      const existingAspirations = localStorage.getItem("huma-v2-aspirations");
      if (existingAspirations) {
        const parsed = JSON.parse(existingAspirations);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Conversation was already completed — start fresh
          localStorage.removeItem("huma-v2-start-messages");
          localStorage.removeItem("huma-v2-behaviors");
          return;
        }
      }
      const saved = localStorage.getItem("huma-v2-start-messages");
      if (saved) setMessages(JSON.parse(saved));
      const ctx = localStorage.getItem("huma-v2-known-context");
      if (ctx) setKnownContext(JSON.parse(ctx));
      const beh = localStorage.getItem("huma-v2-behaviors");
      if (beh) setDecomposedBehaviors(JSON.parse(beh));
    } catch { /* fresh start */ }
  }, []);

  // Fetch palette after user messages
  const fetchPalette = useCallback(async (conversationTexts: string[]) => {
    setPaletteLoading(true);
    try {
      const res = await fetch("/api/palette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationSoFar: conversationTexts,
          selectedConcepts,
        }),
      });
      const data = await res.json();
      setPaletteConcepts(data.concepts || []);
    } catch {
      // Palette is non-critical
    } finally {
      setPaletteLoading(false);
    }
  }, [selectedConcepts]);

  // Send message to HUMA
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

    // Fetch palette in background
    const userTexts = newMessages.filter(m => m.role === "user").map(m => m.content);
    fetchPalette(userTexts);

    try {
      const res = await fetch("/api/v2-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.filter(m => !(m as typeof messages[number]).contextNote).map(m => ({ role: m.role === "huma" ? "assistant" : m.role, content: m.content })),
          knownContext,
          aspirations: [],
        }),
      });

      if (!res.ok) throw new Error("Chat API error");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullResponse = "";

      // Add placeholder for streaming
      const humaMsg: ChatMessage & { options?: string[] | null; behaviors?: Behavior[] | null; actions?: string[] | null } = {
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

        // Update the streaming message with clean text (no markers while streaming)
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

      // Final parse with all markers
      const { cleanText, parsedOptions, parsedBehaviors, parsedActions, parsedContext, parsedAspirationName } = parseMarkers(fullResponse);

      if (parsedContext) {
        setKnownContext(prev => ({ ...prev, ...parsedContext }));
      }

      if (parsedBehaviors) {
        setDecomposedBehaviors(parsedBehaviors);
      }

      if (parsedAspirationName) {
        setAspirationName(parsedAspirationName);
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
      console.error("Chat error:", err);
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
  }, [messages, streaming, knownContext, fetchPalette]);

  // Handle tappable option
  const handleOptionTap = (option: string) => {
    sendMessage(option);
  };

  // Save aspiration to localStorage and trigger auth or redirect
  const saveAndProceed = useCallback(async (filteredBehaviors?: Behavior[]) => {
    const behaviorsToSave = filteredBehaviors || decomposedBehaviors;
    const userMessages = messages.filter(m => m.role === "user").map(m => m.content);
    const rawText = userMessages[0] || "";
    // Use Claude-extracted short name, fall back to first user message
    const clarifiedText = aspirationName || rawText;

    // Always save to localStorage first (fallback)
    if (!localStorage.getItem("huma-v2-start-date")) {
      localStorage.setItem("huma-v2-start-date", new Date().toISOString());
    }
    localStorage.setItem("huma-v2-behaviors", JSON.stringify(behaviorsToSave));
    localStorage.setItem("huma-v2-known-context", JSON.stringify(knownContext));
    localStorage.setItem("huma-v2-aspirations", JSON.stringify([{
      id: crypto.randomUUID(),
      rawText,
      clarifiedText,
      behaviors: behaviorsToSave,
      dimensionsTouched: [],
      status: "active",
      stage: "active",
    }]));

    if (user) {
      // Already authed → migrate to Supabase and go to /today
      try {
        const supabase = createClient();
        if (supabase) {
          await migrateLocalStorageToSupabase(supabase, user.id);
        }
      } catch (err) {
        console.error("Migration error:", err);
        // localStorage is intact as fallback
      }
      setShowTransition(true);
      setTimeout(() => router.push("/today"), 2200);
    } else {
      // Not authed → store pending info and show AuthModal
      setPendingAspiration({ rawText, clarifiedText });
      setShowAuthModal(true);
    }
  }, [messages, decomposedBehaviors, knownContext, aspirationName, user, router]);

  // Called when auth completes (from AuthModal or magic link return)
  const handleAuthenticated = useCallback(async () => {
    setShowAuthModal(false);

    try {
      const supabase = createClient();
      if (supabase) {
        // Poll for auth state instead of fixed 500ms delay
        let freshUser = null;
        for (let i = 0; i < 10; i++) {
          const { data: { user: u } } = await supabase.auth.getUser();
          if (u) { freshUser = u; break; }
          await new Promise(r => setTimeout(r, 300));
        }
        if (freshUser) {
          await migrateLocalStorageToSupabase(supabase, freshUser.id);
        }
      }
    } catch (err) {
      console.error("Post-auth migration error:", err);
    }

    setShowTransition(true);
    setTimeout(() => router.push("/today"), 2200);
  }, [router]);

  // Handle decomposition confirm (from DecompositionPreview)
  const handleConfirmBehaviors = useCallback((behaviors: Behavior[]) => {
    saveAndProceed(behaviors);
  }, [saveAndProceed]);

  // Handle palette tap — accumulate context, don't send as chat message
  const handlePaletteTap = (concept: PaletteConcept) => {
    // 1. Track selection ID (for palette API filtering)
    setSelectedConcepts(prev => [...prev, concept.id]);

    // 2. Remove from displayed palette
    setPaletteConcepts(prev => prev.filter(c => c.id !== concept.id));

    // 3. Add to known context so it influences decomposition
    setKnownContext(prev => ({
      ...prev,
      paletteSelections: [
        ...((prev.paletteSelections as string[]) || []),
        concept.text,
      ],
    }));

    // 4. Show brief acknowledgment (not a full AI response)
    const ack = getPaletteAcknowledgment(concept);
    setMessages(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "huma" as const,
        content: ack,
        createdAt: new Date().toISOString(),
        contextNote: true,
      },
    ]);

    // 5. Refresh palette with new related concepts
    const userTexts = messages.filter(m => m.role === "user").map(m => m.content);
    fetchPalette(userTexts);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const hasMessages = messages.length > 0;

  // Transition screen
  if (showTransition) {
    return (
      <div className="min-h-dvh bg-sand-50 flex items-center justify-center animate-fade-in">
        <div className="text-center px-8">
          <p className="font-serif text-2xl text-sage-700 mb-3">
            Your day starts tomorrow.
          </p>
          <p className="font-sans text-sm text-earth-400">
            I&apos;ll have your sheet ready.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-sand-50 flex flex-col lg:flex-row">
      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthenticated={handleAuthenticated}
      />

      {/* ─── Conversation Panel ─── */}
      <div className="flex-1 flex flex-col min-h-0 lg:w-[60%]">
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <h1 className="font-serif text-sage-700 text-lg tracking-wide">HUMA</h1>
        </div>

        {/* Messages or Prompt */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pb-4">
          {!hasMessages && (
            <div className="flex flex-col items-center justify-center h-full pb-16">
              <h2 className="font-serif text-2xl text-earth-700">
                What&apos;s going on?
              </h2>
            </div>
          )}

          {messages.map((msg) =>
            msg.contextNote ? (
              <div
                key={msg.id}
                className="mb-3 ml-2 font-sans text-[0.82rem] text-sage-600 italic animate-fade-in"
              >
                {msg.content}
              </div>
            ) : (
              <MessageBubble
                key={msg.id}
                message={msg}
                onOptionTap={handleOptionTap}
                onConfirmBehaviors={handleConfirmBehaviors}
              />
            )
          )}

          {streaming && messages[messages.length - 1]?.content === "" && (
            <div className="flex justify-start mb-4">
              <div className="bg-white rounded-2xl px-5 py-3.5">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-earth-300 rounded-full animate-pulse" />
                  <span className="w-2 h-2 bg-earth-300 rounded-full animate-pulse [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-earth-300 rounded-full animate-pulse [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-6 pb-6 pt-2 border-t border-sand-200">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type or just start talking..."
              disabled={streaming}
              className="w-full py-3 pr-12 font-sans text-base text-earth-800 bg-transparent border-b border-sand-300 focus:border-sage-500 focus:outline-none placeholder:text-earth-300 disabled:opacity-50 transition-colors duration-200"
            />
            {input.trim() && (
              <button
                onClick={() => sendMessage(input)}
                disabled={streaming}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-sage-600 hover:text-sage-700 disabled:opacity-50 cursor-pointer transition-colors duration-200"
                aria-label="Send"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            )}
          </div>

          {/* Mobile palette toggle */}
          {paletteConcepts.length > 0 && (
            <button
              onClick={() => setShowPaletteMobile(!showPaletteMobile)}
              className="mt-3 font-sans text-xs text-earth-400 hover:text-sage-600 transition-colors duration-200 lg:hidden cursor-pointer"
            >
              {showPaletteMobile ? "Hide suggestions" : `${paletteConcepts.length} related topics...`}
            </button>
          )}
        </div>

        {/* Mobile palette tray */}
        {showPaletteMobile && (
          <div className="lg:hidden border-t border-sand-200 bg-sand-50">
            <PalettePanel concepts={paletteConcepts} onTap={handlePaletteTap} loading={paletteLoading} />
          </div>
        )}
      </div>

      {/* ─── Desktop Palette Panel ─── */}
      <div className="hidden lg:block lg:w-[40%] border-l border-sand-200 overflow-y-auto">
        <PalettePanel concepts={paletteConcepts} onTap={handlePaletteTap} loading={paletteLoading} />
      </div>
    </div>
  );
}
