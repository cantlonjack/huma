import type { Message, Phase, ConversationContext } from "@/engine/types";

const CONVERSATION_KEY = "huma-conversation";

export interface SavedConversation {
  messages: Message[];
  phase: Phase;
  context: Partial<ConversationContext>;
  operatorName: string;
  operatorLocation: string;
  savedAt: string;
}

export function saveConversation(data: SavedConversation): void {
  try {
    localStorage.setItem(CONVERSATION_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function loadConversation(): SavedConversation | null {
  try {
    const raw = localStorage.getItem(CONVERSATION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedConversation;
    if (!data.messages?.length || !data.operatorName) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearConversation(): void {
  try {
    localStorage.removeItem(CONVERSATION_KEY);
  } catch {
    // silently fail
  }
}
