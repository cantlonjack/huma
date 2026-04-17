"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { PaletteConcept, ChatMessage, Behavior, DimensionKey } from "@/types/v2";
import type { SheetPreviewEntry } from "@/components/onboarding/SheetPreview";
import { parseMarkersV2 as parseMarkers, type DecompositionData, type ParsedPractice } from "@/lib/parse-markers-v2";
import { useAuth } from "@/components/shared/AuthProvider";
import { createClient } from "@/lib/supabase";
import { migrateLocalStorageToSupabase } from "@/lib/supabase-v2";
import { extractPatternsFromAspirations } from "@/lib/pattern-extraction";
import { prePopulateFromArchetypes } from "@/data/archetype-templates";
import { paletteConcepts as staticPaletteConcepts } from "@/data/palette-concepts";
import { getArchetypeOpener, getTemplateAspirationNames } from "@/lib/archetype-openers";
import { mergeContext, dimensionsTouched, contextCompleteness } from "@/lib/context-model";
import type { HumaContext } from "@/types/context";
import { createEmptyContext } from "@/types/context";
import { storeSaveHumaContext } from "@/lib/db/store";
import { trackEvent } from "@/lib/analytics";

// ---- Palette Acknowledgments ------------------------------------------------

export const PALETTE_ACKS = {
  pain: [
    (t: string) => `Noted \u2014 "${t}" is part of the picture.`,
    (t: string) => `"${t}" \u2014 that connects. We'll factor it in.`,
    (t: string) => `Got it. "${t}" goes on the list.`,
  ],
  aspiration: [
    (t: string) => `"${t}" \u2014 good. That shapes things.`,
    (t: string) => `Noted. "${t}" will factor in.`,
    (t: string) => `"${t}" \u2014 we'll build that into the system.`,
  ],
};

export function getPaletteAcknowledgment(concept: PaletteConcept): string {
  const options = PALETTE_ACKS[concept.category] || PALETTE_ACKS.pain;
  return options[Math.floor(Math.random() * options.length)](concept.text);
}

// ---- Extended message type --------------------------------------------------

export type StartMessage = ChatMessage & {
  options?: string[] | null;
  behaviors?: Behavior[] | null;
  actions?: string[] | null;
  decomposition?: DecompositionData | null;
  contextNote?: boolean;
  /** Snapshot of all known dimensions + which are newly extracted */
  contextSnapshot?: {
    allKnown: string[];   // all dimension labels with data
    justLearned: string[]; // dimension labels from this extraction
  };
};

// ---- Hook return type -------------------------------------------------------

export interface UseStartReturn {
  // State
  onboardingStep: "archetype" | "conversation";
  transitioning: boolean;
  stepReady: boolean;
  messages: StartMessage[];
  input: string;
  setInput: (value: string) => void;
  streaming: boolean;
  paletteConcepts: PaletteConcept[];
  paletteLoading: boolean;
  showPaletteMobile: boolean;
  setShowPaletteMobile: (value: boolean) => void;
  showTransition: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (value: boolean) => void;
  hasMessages: boolean;

  // Context feedback
  recentDimensions: string[];          // dimensions just captured (fades after 4s)
  knownDimensionLabels: string[];      // all dimensions with data so far
  contextPercentage: number;           // 0-100, overall completeness
  humaContext: HumaContext;            // full structured context for profile display
  exchangeCount: number;               // number of user messages sent
  isFirstConversation: boolean;        // true if no prior context exists

  // Refs
  scrollRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;

  // Handlers
  sendMessage: (text: string) => void;
  handleOptionTap: (option: string) => void;
  handleConfirmBehaviors: (behaviors: Behavior[]) => void;
  handlePaletteTap: (concept: PaletteConcept) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleAuthenticated: () => Promise<void>;
  handleArchetypeContinueWithTemplate: (
    selected: { domains: string[]; orientations: string[] },
    capitalSketch?: Record<DimensionKey, number>,
  ) => void;
  handleArchetypeContinueBlank: (selected: { domains: string[]; orientations: string[] }) => void;
  handleArchetypeSkip: () => void;

  // Sheet preview (time-to-value — shows a sample of tomorrow's sheet
  // once enough context has been gathered; read-only, non-committal)
  sheetPreviewEntries: SheetPreviewEntry[] | null;
  sheetPreviewSource: "decomposition" | "template";
  refreshSheetPreview: () => void;
}

// ---- Sheet Preview helpers --------------------------------------------------

/** Pick up to `count` entries from `pool`, rotated by `seed`. */
function pickEntries<T>(pool: T[], count: number, seed: number): T[] {
  if (pool.length <= count) return pool.slice();
  // Deterministic rotation so repeated renders at same seed match,
  // but refresh (seed++) produces a visibly different subset.
  const offset = seed % pool.length;
  const rotated = [...pool.slice(offset), ...pool.slice(0, offset)];
  return rotated.slice(0, count);
}

/** Read template-sourced aspirations stored from archetype pre-population. */
function readTemplateBehaviorsFromStorage(): Behavior[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("huma-v2-aspirations");
    if (!raw) return [];
    const aspirations = JSON.parse(raw) as Array<{
      source?: string;
      behaviors?: Behavior[];
    }>;
    const out: Behavior[] = [];
    for (const asp of aspirations) {
      if (asp.source !== "template") continue;
      for (const b of asp.behaviors || []) {
        if (b.enabled === false) continue;
        out.push(b);
      }
    }
    return out;
  } catch {
    return [];
  }
}

function behaviorToPreviewEntry(b: Behavior): SheetPreviewEntry {
  const dims = Array.isArray(b.dimensions)
    ? b.dimensions
        .map((d) => (d && typeof d === "object" && "dimension" in d
          ? (d as { dimension: DimensionKey }).dimension
          : null))
        .filter((d): d is DimensionKey => !!d)
    : [];
  return {
    key: b.key,
    text: b.text,
    detail: b.detail,
    dimensions: dims,
  };
}

// ---- Hook -------------------------------------------------------------------

export function useStart(): UseStartReturn {
  const router = useRouter();
  const { user } = useAuth();
  const [onboardingStep, setOnboardingStep] = useState<"archetype" | "conversation">("conversation");
  const [transitioning, setTransitioning] = useState(false);
  const [stepReady, setStepReady] = useState(false);
  const [messages, setMessages] = useState<StartMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [paletteConcepts, setPaletteConcepts] = useState<PaletteConcept[]>([]);
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([]);
  const [paletteLoading, setPaletteLoading] = useState(false);
  const [knownContext, setKnownContext] = useState<Record<string, unknown>>({});
  const [humaContext, setHumaContext] = useState<HumaContext>(createEmptyContext());
  const [recentDimensions, setRecentDimensions] = useState<string[]>([]);
  const [decomposedBehaviors, setDecomposedBehaviors] = useState<Behavior[]>([]);
  const [decompositionData, setDecompositionData] = useState<DecompositionData | null>(null);
  const [aspirationName, setAspirationName] = useState<string | null>(null);
  const [practiceProvenance, setPracticeProvenance] = useState<ParsedPractice | null>(null);
  const [showPaletteMobile, setShowPaletteMobile] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAspiration, setPendingAspiration] = useState<{
    rawText: string;
    clarifiedText: string;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefillSentRef = useRef(false);

  // Sheet preview state — latches on once the threshold is first met so the
  // preview doesn't flicker out if template behaviors change underneath it.
  const [previewTriggered, setPreviewTriggered] = useState(false);
  const [previewSeed, setPreviewSeed] = useState(0);
  const [previewStorageVersion, setPreviewStorageVersion] = useState(0);

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
  // Also determine whether to show archetype selection or skip to conversation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefillMsg = params.get("msg");
    const isFresh = params.get("fresh") === "1";
    if (isFresh || prefillMsg) {
      // Clear stale conversation state for a clean start
      localStorage.removeItem("huma-v2-start-messages");
      localStorage.removeItem("huma-v2-behaviors");
      // When arriving from landing page with a message, skip archetype selection
      if (prefillMsg) {
        setOnboardingStep("conversation");
      }
      setStepReady(true);
      return;
    }
    try {
      // Check if archetypes already selected — skip straight to conversation
      const ctx = localStorage.getItem("huma-v2-known-context");
      if (ctx) {
        const parsed = JSON.parse(ctx);
        if (parsed.archetypes && Array.isArray(parsed.archetypes) && parsed.archetypes.length > 0) {
          setOnboardingStep("conversation");
          setKnownContext(parsed);
        }
      }

      // Check if aspirations already exist (conversation was completed before)
      const existingAspirations = localStorage.getItem("huma-v2-aspirations");
      if (existingAspirations) {
        const parsed = JSON.parse(existingAspirations);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Conversation was already completed — start fresh conversation
          localStorage.removeItem("huma-v2-start-messages");
          localStorage.removeItem("huma-v2-behaviors");
          setOnboardingStep("conversation");
          setStepReady(true);
          return;
        }
      }
      const saved = localStorage.getItem("huma-v2-start-messages");
      if (saved) {
        setMessages(JSON.parse(saved));
        setOnboardingStep("conversation"); // Resume mid-conversation
      }
      if (!ctx) {
        // No context at all — check if ctx was already set above
      } else {
        setKnownContext(JSON.parse(ctx));
      }
      const beh = localStorage.getItem("huma-v2-behaviors");
      if (beh) setDecomposedBehaviors(JSON.parse(beh));
    } catch { /* fresh start */ }
    setStepReady(true);
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
      if (!res.ok) throw new Error("palette-api");
      const data = await res.json();
      setPaletteConcepts(data.concepts || []);
    } catch {
      // Fallback: sample 4-6 static concepts, excluding already-selected
      const available = staticPaletteConcepts.filter(c => !selectedConcepts.includes(c.id));
      const count = 4 + Math.floor(Math.random() * 3); // 4-6
      const shuffled = available.sort(() => Math.random() - 0.5);
      setPaletteConcepts(shuffled.slice(0, count));
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

    // Track onboarding start on first user message
    if (messages.filter(m => m.role === "user").length === 0) {
      const ctx = knownContext as Record<string, unknown>;
      const archetypes = ctx.archetypes as string[] | undefined;
      trackEvent("onboarding_start", {
        archetype_selected: !!(archetypes && archetypes.length > 0),
        ...(archetypes && archetypes.length > 0 ? { archetype_name: archetypes.join(", ") } : {}),
      });
    }

    const newMessages = [...messages, userMsg];
    setMessages(newMessages as StartMessage[]);
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
          messages: newMessages.filter(m => !(m as StartMessage).contextNote).map(m => ({ role: m.role === "huma" ? "assistant" : m.role, content: m.content })),
          knownContext,
          aspirations: [],
          isFirstConversation,
          exchangeCount: newMessages.filter(m => m.role === "user").length,
        }),
      });

      if (!res.ok) throw new Error("Chat API error");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullResponse = "";

      // Add placeholder for streaming
      const humaMsg: StartMessage = {
        id: crypto.randomUUID(),
        role: "huma",
        content: "",
        createdAt: new Date().toISOString(),
      };
      setMessages([...newMessages, humaMsg] as StartMessage[]);

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
      const { cleanText, parsedOptions, parsedBehaviors, parsedActions, parsedContext, parsedAspirationName, parsedDecomposition, parsedReplaceAspiration, parsedPractice } = parseMarkers(fullResponse);

      if (parsedPractice) {
        setPracticeProvenance(parsedPractice);
      }

      if (parsedContext) {
        setKnownContext(prev => ({ ...prev, ...parsedContext }));
        // Update structured context model + show dimension indicator
        let updatedContext: HumaContext | null = null;
        setHumaContext(prev => {
          const updated = mergeContext(prev, parsedContext as Partial<HumaContext>, "conversation");
          storeSaveHumaContext(user?.id ?? null, updated);
          updatedContext = updated;
          return updated;
        });
        const touched = dimensionsTouched(parsedContext as Partial<HumaContext>);
        if (touched.length > 0) {
          setRecentDimensions(touched);
          setTimeout(() => setRecentDimensions([]), 4000);
          // Inject understanding moment into conversation
          const allKnown = updatedContext
            ? contextCompleteness(updatedContext).strongDimensions
            : touched;
          setMessages(prev => {
            const momentMsg: StartMessage = {
              id: `understanding-${Date.now()}`,
              role: "huma",
              content: "",
              createdAt: new Date().toISOString(),
              contextNote: true,
              contextSnapshot: { allKnown, justLearned: touched },
            };
            return [...prev, momentMsg];
          });
        }
      }

      // Handle template aspiration replacement
      if (parsedReplaceAspiration) {
        try {
          const existing = JSON.parse(localStorage.getItem("huma-v2-aspirations") || "[]");
          // Find and replace the first template-sourced aspiration
          const templateIdx = existing.findIndex((a: Record<string, unknown>) => a.source === "template");
          if (templateIdx !== -1) {
            existing[templateIdx] = {
              ...existing[templateIdx],
              rawText: parsedReplaceAspiration,
              clarifiedText: parsedReplaceAspiration,
              source: "conversation",
            };
            localStorage.setItem("huma-v2-aspirations", JSON.stringify(existing));
          }
        } catch { /* non-critical */ }
      }

      if (parsedBehaviors) {
        setDecomposedBehaviors(parsedBehaviors);
      }

      if (parsedDecomposition) {
        setDecompositionData(parsedDecomposition);
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
            decomposition: parsedDecomposition,
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
    const aspirations = [{
      id: crypto.randomUUID(),
      rawText,
      clarifiedText,
      title: decompositionData?.aspiration_title || clarifiedText,
      summary: decompositionData?.summary || "",
      behaviors: behaviorsToSave,
      comingUp: decompositionData?.coming_up || [],
      longerArc: decompositionData?.longer_arc || [],
      dimensionsTouched: [],
      status: "active" as const,
      stage: "active" as const,
      ...(decompositionData?.validation && {
        validationQuestion: decompositionData.validation.question,
        validationTarget: decompositionData.validation.target,
        validationFrequency: decompositionData.validation.frequency,
        failureResponse: decompositionData.validation.failure_response,
      }),
    }];
    localStorage.setItem("huma-v2-aspirations", JSON.stringify(aspirations));

    trackEvent("aspiration_created", {
      aspiration_count: aspirations.length,
      behavior_count: behaviorsToSave.length,
    });

    // Extract patterns from aspirations that have a trigger behavior.
    // If Claude emitted a [[PRACTICE:{rpplId:"..."}]] marker, stamp its
    // provenance onto the patterns so /grow and /whole can show "Where
    // this comes from" with real content.
    const extractedPatterns = extractPatternsFromAspirations(aspirations);
    const patterns = practiceProvenance
      ? extractedPatterns.map(p => ({
          ...p,
          provenance: {
            ...p.provenance,
            rpplId: practiceProvenance.rpplId,
            ...(practiceProvenance.sourceTradition
              ? { sourceTradition: practiceProvenance.sourceTradition }
              : {}),
            ...(practiceProvenance.keyReference
              ? { keyReference: practiceProvenance.keyReference }
              : {}),
            ...(practiceProvenance.originalContext
              ? { originalContext: practiceProvenance.originalContext }
              : {}),
          },
        }))
      : extractedPatterns;
    if (patterns.length > 0) {
      localStorage.setItem("huma-v2-patterns", JSON.stringify(patterns));
    }

    if (user) {
      // Already authed -> migrate to Supabase and go to /today
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
      // Not authed -> store pending info and show AuthModal
      setPendingAspiration({ rawText, clarifiedText });
      setShowAuthModal(true);
    }
  }, [messages, decomposedBehaviors, decompositionData, knownContext, aspirationName, practiceProvenance, user, router]);

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

  // Smooth crossfade from archetype screen to conversation
  const transitionToConversation = useCallback(() => {
    setTransitioning(true);
    setTimeout(() => {
      setOnboardingStep("conversation");
      setTransitioning(false);
    }, 300);
  }, []);

  // Archetype selection handlers
  const handleArchetypeContinueWithTemplate = useCallback(
    (selected: { domains: string[]; orientations: string[] }, capitalSketch?: Record<DimensionKey, number>) => {
      const archetypes = [...selected.domains, ...selected.orientations];

      // Pre-populate from templates
      const { aspirations, patterns, contextHints } = prePopulateFromArchetypes(
        selected.domains,
        selected.orientations
      );

      // Build updated context: archetype names + context hints + optional capital sketch
      const updatedContext: Record<string, unknown> = { ...knownContext, ...contextHints, archetypes };
      if (capitalSketch) {
        updatedContext.capitalSketch = capitalSketch;
      }
      setKnownContext(updatedContext);

      // Persist everything to localStorage
      localStorage.setItem("huma-v2-known-context", JSON.stringify(updatedContext));
      if (aspirations.length > 0) {
        // Merge with any existing aspirations (shouldn't be any at this point)
        const existing = (() => {
          try {
            const raw = localStorage.getItem("huma-v2-aspirations");
            return raw ? JSON.parse(raw) : [];
          } catch { return []; }
        })();
        localStorage.setItem("huma-v2-aspirations", JSON.stringify([...existing, ...aspirations]));
        // Signal preview derivation that the template pool changed
        setPreviewStorageVersion((v) => v + 1);
      }
      if (patterns.length > 0) {
        localStorage.setItem("huma-v2-patterns", JSON.stringify(patterns));
      }

      // Inject archetype-aware opening message
      const templateNames = getTemplateAspirationNames(selected.domains);
      const opener = getArchetypeOpener(archetypes, true, templateNames);
      if (opener) {
        setMessages([{
          id: crypto.randomUUID(),
          role: "huma",
          content: opener,
          createdAt: new Date().toISOString(),
        }]);
      }

      transitionToConversation();
    },
    [knownContext, transitionToConversation]
  );

  const handleArchetypeContinueBlank = useCallback(
    (selected: { domains: string[]; orientations: string[] }) => {
      const archetypes = [...selected.domains, ...selected.orientations];
      const updatedContext = { ...knownContext, archetypes };
      setKnownContext(updatedContext);
      localStorage.setItem("huma-v2-known-context", JSON.stringify(updatedContext));

      // Inject archetype-aware opening message (blank slate)
      const opener = getArchetypeOpener(archetypes, false);
      if (opener) {
        setMessages([{
          id: crypto.randomUUID(),
          role: "huma",
          content: opener,
          createdAt: new Date().toISOString(),
        }]);
      }

      transitionToConversation();
    },
    [knownContext, transitionToConversation]
  );

  const handleArchetypeSkip = useCallback(() => {
    transitionToConversation();
  }, [transitionToConversation]);

  const hasMessages = messages.length > 0;

  // Exchange count = number of user messages sent so far
  const exchangeCount = messages.filter(m => m.role === "user").length;

  // First conversation = no existing aspirations and no prior structured context
  const isFirstConversation = (() => {
    try {
      const existingAspirations = localStorage.getItem("huma-v2-aspirations");
      if (existingAspirations) {
        const parsed = JSON.parse(existingAspirations);
        if (Array.isArray(parsed) && parsed.length > 0) return false;
      }
    } catch { /* treat as first conversation */ }
    return !humaContext._version;
  })();

  // Auto-send prefill message from landing page entry (?msg=...)
  useEffect(() => {
    if (!stepReady || prefillSentRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const prefillMsg = params.get("msg");
    if (prefillMsg && onboardingStep === "conversation") {
      prefillSentRef.current = true;
      sendMessage(prefillMsg);
    }
  }, [stepReady, onboardingStep, sendMessage]);

  // Suppress unused variable warning — pendingAspiration is kept in state
  // for future use when AuthModal needs pre-fill data
  void pendingAspiration;

  // ── Sheet Preview derivation ─────────────────────────────────────────────
  // Threshold: either the first decomposition has landed (highest signal), or
  // we have ≥2 exchanges AND archetype templates have seeded ≥3 behaviors.
  // Once triggered, stays on so the preview doesn't flicker if the source
  // pool shrinks (e.g. user unchecks behaviors). Refresh cycles the subset.
  const templatePool = useMemo(
    () => readTemplateBehaviorsFromStorage(),
    // previewStorageVersion is incremented when archetype handlers write to
    // localStorage, so the pool refreshes without a global listener.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [previewStorageVersion],
  );

  const previewSourceBehaviors = useMemo<Behavior[]>(() => {
    if (decomposedBehaviors.length >= 3) return decomposedBehaviors;
    return templatePool;
  }, [decomposedBehaviors, templatePool]);

  const previewSource: "decomposition" | "template" =
    decomposedBehaviors.length >= 3 ? "decomposition" : "template";

  // Latch trigger once threshold is met
  useEffect(() => {
    if (previewTriggered) return;
    const exchanges = messages.filter((m) => m.role === "user").length;
    const decompReady = decomposedBehaviors.length >= 3;
    const templateReady = exchanges >= 2 && templatePool.length >= 3;
    if (decompReady || templateReady) {
      setPreviewTriggered(true);
    }
  }, [previewTriggered, messages, decomposedBehaviors.length, templatePool.length]);

  const sheetPreviewEntries = useMemo<SheetPreviewEntry[] | null>(() => {
    if (!previewTriggered) return null;
    if (previewSourceBehaviors.length === 0) return null;
    const picked = pickEntries(previewSourceBehaviors, 4, previewSeed);
    return picked.map(behaviorToPreviewEntry);
  }, [previewTriggered, previewSourceBehaviors, previewSeed]);

  const refreshSheetPreview = useCallback(() => {
    // Also re-read storage in case archetype pool changed
    setPreviewStorageVersion((v) => v + 1);
    setPreviewSeed((s) => s + 1);
  }, []);

  return {
    onboardingStep,
    transitioning,
    stepReady,
    messages,
    input,
    setInput,
    streaming,
    paletteConcepts,
    paletteLoading,
    showPaletteMobile,
    setShowPaletteMobile,
    showTransition,
    showAuthModal,
    setShowAuthModal,
    hasMessages,
    recentDimensions,
    knownDimensionLabels: contextCompleteness(humaContext).strongDimensions,
    contextPercentage: contextCompleteness(humaContext).overall,
    humaContext,
    exchangeCount,
    isFirstConversation,
    scrollRef,
    inputRef,
    sendMessage,
    handleOptionTap,
    handleConfirmBehaviors,
    handlePaletteTap,
    handleKeyDown,
    handleAuthenticated,
    handleArchetypeContinueWithTemplate,
    handleArchetypeContinueBlank,
    handleArchetypeSkip,
    sheetPreviewEntries,
    sheetPreviewSource: previewSource,
    refreshSheetPreview,
  };
}
