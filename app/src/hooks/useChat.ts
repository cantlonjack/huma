"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage, Behavior, Aspiration } from "@/types/v2";
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
} from "@/lib/supabase-v2";
import { getLocalDate } from "@/lib/date-utils";

// ─── Types ──────────────────────────────────────────────────────────────────

export type RichMessage = ChatMessage & {
  options?: string[] | null;
  behaviors?: Behavior[] | null;
  actions?: string[] | null;
};

export interface ConversationGroup {
  id: string;
  startTime: Date;
  messages: ChatMessage[];
  summary: string;
  messageCount: number;
}

// ─── Helper Functions ───────────────────────────────────────────────────────

export function summarizeText(text: string, maxLen: number = 60): string {
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated) + "...";
}

export function relativeDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function groupIntoConversations(messages: ChatMessage[], gapMinutes: number = 10): ConversationGroup[] {
  if (messages.length === 0) return [];

  const sorted = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const groups: ConversationGroup[] = [];
  let current: ChatMessage[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].createdAt).getTime();
    const curr = new Date(sorted[i].createdAt).getTime();
    if (curr - prev > gapMinutes * 60 * 1000) {
      groups.push(buildGroup(current));
      current = [sorted[i]];
    } else {
      current.push(sorted[i]);
    }
  }
  if (current.length > 0) groups.push(buildGroup(current));

  return groups;
}

export function buildGroup(messages: ChatMessage[]): ConversationGroup {
  const userMessages = messages.filter(m => m.role === "user");
  const firstUserMsg = userMessages[0]?.content || "";

  return {
    id: messages[0].id || String(Date.now()),
    startTime: new Date(messages[0].createdAt),
    messages,
    summary: summarizeText(firstUserMsg),
    messageCount: messages.length,
  };
}

// ─── Hook Return Type ───────────────────────────────────────────────────────

export interface UseChatReturn {
  messages: RichMessage[];
  input: string;
  setInput: (value: string) => void;
  streaming: boolean;
  knownContext: Record<string, unknown>;
  aspirations: Aspiration[];
  loaded: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  sendMessage: (text: string) => Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  conversations: ConversationGroup[];
  latestConversation: ConversationGroup | null;
  pastConversations: ConversationGroup[];
  behaviorCount: number;
  dayNum: number;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useChat(): UseChatReturn {
  const { user } = useAuth();
  const [messages, setMessages] = useState<RichMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [knownContext, setKnownContext] = useState<Record<string, unknown>>({});
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  // Load state
  useEffect(() => {
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
  }, [user]);

  // Persist to localStorage
  useEffect(() => {
    if (!loaded) return;
    if (messages.length > 0) {
      localStorage.setItem("huma-v2-chat-messages", JSON.stringify(messages));
      localStorage.setItem("huma-v2-known-context", JSON.stringify(knownContext));
    }
  }, [messages, knownContext, loaded]);

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

    if (user) {
      const supabase = createClient();
      if (supabase) saveChatMessage(supabase, user.id, userMsg).catch(() => {});
    }

    try {
      const res = await fetch("/api/v2-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role === "huma" ? "assistant" : m.role, content: m.content })),
          knownContext,
          aspirations: aspirations.map(a => ({ rawText: a.rawText, clarifiedText: a.clarifiedText, status: a.status })),
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

      const { cleanText, parsedOptions, parsedBehaviors, parsedActions, parsedContext } = parseMarkers(fullResponse);

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

      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === "huma") {
          updated[updated.length - 1] = { ...last, content: cleanText, options: parsedOptions, behaviors: parsedBehaviors, actions: parsedActions };
        }
        return updated;
      });
    } catch {
      setMessages(prev => [
        ...prev.filter(m => m.content !== ""),
        { id: crypto.randomUUID(), role: "huma" as const, content: "Something went wrong. Try again in a moment.", createdAt: new Date().toISOString() },
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

  // Group messages into conversations (by 10-minute time gap)
  const conversations = groupIntoConversations(messages);
  const latestConversation = conversations.length > 0 ? conversations[conversations.length - 1] : null;
  const pastConversations = conversations.slice(0, -1).reverse(); // most recent first

  const behaviorCount = aspirations.reduce((sum, a) => sum + a.behaviors.length, 0);
  const dayNum = (() => {
    try {
      const start = localStorage.getItem("huma-v2-start-date");
      if (start) {
        const diff = Math.ceil((Date.now() - new Date(start).getTime()) / 86400000);
        return diff > 0 ? diff : 1;
      }
    } catch { /* fresh */ }
    return 1;
  })();

  return {
    messages,
    input,
    setInput,
    streaming,
    knownContext,
    aspirations,
    loaded,
    scrollRef,
    sendMessage,
    handleKeyDown,
    conversations,
    latestConversation,
    pastConversations,
    behaviorCount,
    dayNum,
  };
}
