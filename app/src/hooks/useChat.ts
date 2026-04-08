"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage, Behavior, Aspiration } from "@/types/v2";
import { parseMarkersV2 as parseMarkers } from "@/lib/parse-markers-v2";
import { useAuth } from "@/components/shared/AuthProvider";
import {
  storeLoadChatMessages,
  storeLoadAspirations,
  storeLoadContext,
  storeSaveChatMessage,
  storeWriteLocalMessages,
  storeSaveAspiration,
  storeSaveContext,
  clearTodaySheetCache,
} from "@/lib/db/store";

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

  // Load state via unified store
  useEffect(() => {
    const userId = user?.id ?? null;
    async function loadState() {
      const [msgs, asps, ctx] = await Promise.all([
        storeLoadChatMessages(userId),
        storeLoadAspirations(userId),
        storeLoadContext(userId),
      ]);
      if (msgs.length > 0) setMessages(msgs);
      if (asps.length > 0) setAspirations(asps);
      if (Object.keys(ctx).length > 0) setKnownContext(ctx);
      setLoaded(true);
    }
    loadState();
  }, [user]);

  // Persist to localStorage via store
  useEffect(() => {
    if (!loaded || messages.length === 0) return;
    storeWriteLocalMessages(messages, "chat");
  }, [messages, loaded]);

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

    storeSaveChatMessage(user?.id ?? null, userMsg, "chat").catch(() => {});

    try {
      // Drain any queued messages from previous offline failures
      let queuedContext: Array<{ role: string; content: string }> = [];
      try {
        const raw = localStorage.getItem("huma-v2-pending-messages");
        if (raw) {
          queuedContext = JSON.parse(raw);
          localStorage.removeItem("huma-v2-pending-messages");
        }
      } catch { /* ignore */ }

      const allMessages = [...queuedContext.map(q => ({ role: q.role, content: q.content })), ...newMessages.map(m => ({ role: m.role === "huma" ? "assistant" : m.role, content: m.content }))];

      const res = await fetch("/api/v2-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages,
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

      const { cleanText, parsedOptions, parsedBehaviors, parsedActions, parsedContext, parsedDecomposition } = parseMarkers(fullResponse);

      const finalHumaMsg: ChatMessage = { ...humaMsg, content: cleanText, contextExtracted: parsedContext || undefined };
      storeSaveChatMessage(user?.id ?? null, finalHumaMsg, "chat").catch(() => {});

      if (parsedContext) {
        const newContext = { ...knownContext, ...parsedContext };
        setKnownContext(newContext);
        storeSaveContext(user?.id ?? null, newContext).catch(() => {});
        clearTodaySheetCache();
      }

      if (parsedBehaviors) {
        const newAspiration: Aspiration = {
          id: crypto.randomUUID(),
          rawText: text,
          clarifiedText: parsedDecomposition?.aspiration_title || "",
          title: parsedDecomposition?.aspiration_title,
          summary: parsedDecomposition?.summary,
          behaviors: parsedBehaviors,
          comingUp: parsedDecomposition?.coming_up,
          longerArc: parsedDecomposition?.longer_arc,
          dimensionsTouched: [],
          status: "active",
          stage: "active",
          ...(parsedDecomposition?.validation && {
            validationQuestion: parsedDecomposition.validation.question,
            validationTarget: parsedDecomposition.validation.target,
            validationFrequency: parsedDecomposition.validation.frequency,
            failureResponse: parsedDecomposition.validation.failure_response,
          }),
        };
        const updatedAsps = [...aspirations, newAspiration];
        setAspirations(updatedAsps);
        storeSaveAspiration(user?.id ?? null, newAspiration).catch(() => {});
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
      // Queue the user's message for retry on next successful call
      try {
        const pending = JSON.parse(localStorage.getItem("huma-v2-pending-messages") || "[]");
        pending.push({ role: "user", content: text.trim(), pending: true, queuedAt: new Date().toISOString() });
        localStorage.setItem("huma-v2-pending-messages", JSON.stringify(pending));
      } catch { /* storage full */ }

      setMessages(prev => [
        ...prev.filter(m => m.content !== ""),
        { id: crypto.randomUUID(), role: "huma" as const, content: "Saved your message. HUMA will process it when connection returns.", createdAt: new Date().toISOString() },
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
