"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ConnectionThreads } from "@/components/shared/ConnectionThreads";
import type { DimensionKey } from "@/types/v2";

/* ─── Demo data ─── */

const DEMO_MESSAGES = [
  { role: "huma" as const, text: "What\u2019s going on in your life right now?" },
  {
    role: "user" as const,
    text: "Freelance is picking up but I\u2019m burning out. Two big clients, a side project, and I haven\u2019t cooked a real meal in weeks.",
  },
];

const DEMO_DIMS_AFTER_MSG: DimensionKey[][] = [
  [], // after huma message
  ["body", "money", "home", "purpose"], // after user message
];

const CONTEXT_LINES = [
  { section: "WHO YOU ARE", detail: "Freelance designer, 2 clients" },
  { section: "WHAT YOU HAVE", detail: "Income variable \u00b7 Kitchen unused 2 weeks" },
  { section: "HOW YOUR TIME WORKS", detail: "Deadline-driven \u00b7 Evenings unstructured" },
];

const BRIEFING_KEYSTONE = {
  label: "Cook dinner tonight",
  badge: "Keystone",
  reasoning:
    "This touches Body, Money, People, Home, and Joy \u2014 five dimensions from one behavior.",
};

const BRIEFING_ACTIONS = [
  "Finish Acme deliverable by 3pm",
  "20-minute walk before cooking",
];

const BRIEFING_WATCHING =
  "Sleep hasn\u2019t recovered in 4 days. Body follows Home in your pattern.";

const INSIGHT_TEXT =
  "On days you cook dinner, everything else follows. This is your keystone.";

/* ─── Scroll reveal ─── */

function useScrollReveal() {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      refs.current.forEach((el) => {
        if (el) el.style.opacity = "1";
      });
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("landing-visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
    );
    refs.current.forEach((el) => {
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [reduced]);

  return useCallback(
    (idx: number) => (el: HTMLElement | null) => {
      refs.current[idx] = el;
    },
    [],
  );
}

/* ─── Typing animation ─── */

function useTypingText(text: string, active: boolean, speed = 25) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!active) {
      setDisplayed("");
      setDone(false);
      return;
    }
    if (reduced) {
      setDisplayed(text);
      setDone(true);
      return;
    }
    let i = 0;
    setDisplayed("");
    setDone(false);
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [active, text, speed, reduced]);

  return { displayed, done };
}

/* ══════════════════════════════════════════════════════════════ */
/*  SECTION 2 — Interactive Demo                                  */
/* ══════════════════════════════════════════════════════════════ */

type DemoPhase = "conversation" | "context" | "briefing" | "insight";

function DemoSection({ reduced }: { reduced: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<DemoPhase>("conversation");
  const [msgIndex, setMsgIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [activeDims, setActiveDims] = useState<DimensionKey[]>([]);

  const currentMsg = DEMO_MESSAGES[msgIndex];
  const typing = useTypingText(
    currentMsg?.text || "",
    showMessage && phase === "conversation",
    currentMsg?.role === "user" ? 18 : 22,
  );

  // Start on scroll into view
  useEffect(() => {
    if (reduced) {
      setStarted(true);
      setVisibleMessages([0, 1]);
      setActiveDims(DEMO_DIMS_AFTER_MSG[1]);
      setPhase("insight");
      return;
    }
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduced]);

  // Kick off first message
  useEffect(() => {
    if (!started || reduced) return;
    const t = setTimeout(() => setShowMessage(true), 600);
    return () => clearTimeout(t);
  }, [started, reduced]);

  // Track when conversation finishes typing (separate from phase changes
  // to avoid cleanup racing — typing.done resets when phase leaves "conversation")
  const [conversationDone, setConversationDone] = useState(false);

  // Advance conversation messages
  useEffect(() => {
    if (!typing.done || !showMessage || reduced || conversationDone) return;

    setVisibleMessages((prev) => (prev.includes(msgIndex) ? prev : [...prev, msgIndex]));

    if (DEMO_DIMS_AFTER_MSG[msgIndex]?.length) {
      setActiveDims(DEMO_DIMS_AFTER_MSG[msgIndex]);
    }

    if (msgIndex < DEMO_MESSAGES.length - 1) {
      const t = setTimeout(() => {
        setMsgIndex((i) => i + 1);
        setShowMessage(false);
        setTimeout(() => setShowMessage(true), 400);
      }, 800);
      return () => clearTimeout(t);
    } else {
      // Mark conversation as complete — phase transitions handled separately
      const t = setTimeout(() => setConversationDone(true), 800);
      return () => clearTimeout(t);
    }
  }, [typing.done, showMessage, msgIndex, reduced, conversationDone]);

  // Phase auto-advancement (decoupled from typing to avoid cleanup races)
  useEffect(() => {
    if (!conversationDone || reduced) return;
    const t1 = setTimeout(() => {
      setPhase("context");
      setActiveDims(["body", "money", "home", "purpose", "people"]);
    }, 400);
    const t2 = setTimeout(() => setPhase("briefing"), 3700);
    const t3 = setTimeout(() => setPhase("insight"), 7000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [conversationDone, reduced]);

  // Reduced motion: static vertical layout
  if (reduced) {
    return (
      <section ref={sectionRef} className="px-6 py-16 md:py-20">
        <div className="max-w-[680px] mx-auto space-y-8">
          <DemoConversation
            visibleMessages={[0, 1]}
            msgIndex={1}
            showMessage={false}
            typingDone={true}
            typingDisplayed=""
            activeDims={DEMO_DIMS_AFTER_MSG[1]}
            reduced={true}
          />
          <DemoContextPanel reduced={true} />
          <DemoBriefing reduced={true} />
          <DemoInsight reduced={true} />
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="px-6 py-16 md:py-24">
      <div className="max-w-[680px] mx-auto lg:max-w-[960px]">
        {/* Phase: Conversation */}
        <div
          style={{
            opacity: phase === "conversation" ? 1 : 0,
            maxHeight: phase === "conversation" ? 600 : 0,
            overflow: "hidden",
            transition: "opacity 500ms cubic-bezier(0.22,1,0.36,1), max-height 500ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <DemoConversation
            visibleMessages={visibleMessages}
            msgIndex={msgIndex}
            showMessage={showMessage}
            typingDone={typing.done}
            typingDisplayed={typing.displayed}
            activeDims={activeDims}
            reduced={false}
          />
        </div>

        {/* Phase: Context Assembly */}
        <div
          style={{
            opacity: phase === "context" ? 1 : 0,
            maxHeight: phase === "context" ? 600 : 0,
            overflow: "hidden",
            transition: "opacity 600ms cubic-bezier(0.22,1,0.36,1), max-height 500ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <DemoContextPanel reduced={false} />
        </div>

        {/* Phase: Briefing */}
        <div
          style={{
            opacity: phase === "briefing" ? 1 : 0,
            maxHeight: phase === "briefing" ? 600 : 0,
            overflow: "hidden",
            transition: "opacity 600ms cubic-bezier(0.22,1,0.36,1), max-height 500ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <DemoBriefing reduced={false} />
        </div>

        {/* Phase: Insight */}
        <div
          style={{
            opacity: phase === "insight" ? 1 : 0,
            maxHeight: phase === "insight" ? 600 : 0,
            overflow: "hidden",
            transition: "opacity 600ms cubic-bezier(0.22,1,0.36,1), max-height 500ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <DemoInsight reduced={false} />
        </div>

        {/* Phase dots */}
        <div className="flex justify-center gap-2 mt-8">
          {(["conversation", "context", "briefing", "insight"] as DemoPhase[]).map((p) => (
            <div
              key={p}
              className="w-1.5 h-1.5 rounded-full transition-colors duration-500"
              style={{
                background: p === phase ? "#B5621E" : "#DDD4C0",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Demo sub-components ── */

function DemoConversation({
  visibleMessages,
  msgIndex,
  showMessage,
  typingDone,
  typingDisplayed,
  activeDims,
  reduced,
}: {
  visibleMessages: number[];
  msgIndex: number;
  showMessage: boolean;
  typingDone: boolean;
  typingDisplayed: string;
  activeDims: DimensionKey[];
  reduced: boolean;
}) {
  return (
    <div className="lg:flex lg:gap-10 lg:items-start">
      {/* Conversation bubbles */}
      <div className="flex-1 space-y-3 max-w-[480px]">
        {visibleMessages.map((idx) => {
          const msg = DEMO_MESSAGES[idx];
          const isCurrentlyTyping = idx === msgIndex && showMessage && !typingDone;
          const text = idx === msgIndex && showMessage ? typingDisplayed : msg.text;

          return (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              style={!reduced ? { animation: "msg-in 400ms cubic-bezier(0.22,1,0.36,1) both" } : undefined}
            >
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
                  msg.role === "user" ? "bg-sage-50 text-ink-800" : "bg-sand-100 text-ink-700"
                }`}
                style={{ fontSize: "0.88rem", lineHeight: 1.55 }}
              >
                <span className="font-sans">{text}</span>
                {isCurrentlyTyping && !reduced && (
                  <span
                    className="inline-block w-[2px] h-[0.85em] bg-sage-400 ml-0.5 align-text-bottom"
                    style={{ animation: "cursor-blink 0.8s step-end infinite" }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ConnectionThreads — lights up as conversation progresses */}
      <div className="hidden lg:flex lg:items-center lg:justify-center lg:pt-4">
        <ConnectionThreads activeDimensions={activeDims} size="compact" animate={!reduced} />
      </div>

      {/* Mobile: inline ConnectionThreads below conversation */}
      <div className="flex justify-center mt-4 lg:hidden">
        <ConnectionThreads activeDimensions={activeDims} size="compact" animate={!reduced} />
      </div>
    </div>
  );
}

function DemoContextPanel({ reduced }: { reduced: boolean }) {
  return (
    <div className="max-w-[480px] mx-auto lg:mx-0">
      <div
        className="rounded-xl border border-sand-200 bg-sand-50 overflow-hidden"
        style={!reduced ? { animation: "msg-in 500ms cubic-bezier(0.22,1,0.36,1) both" } : undefined}
      >
        {/* Header */}
        <div className="px-5 py-3 border-b border-sand-200">
          <p
            className="font-sans text-earth-400"
            style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" }}
          >
            Your life &mdash; what HUMA sees
          </p>
        </div>

        {/* Context lines */}
        <div className="px-5 py-4 space-y-4">
          {CONTEXT_LINES.map((line, i) => (
            <div key={i}>
              <p
                className="font-sans text-earth-400 mb-0.5"
                style={{
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {line.section}
              </p>
              <p className="font-sans text-ink-700" style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>
                {line.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="px-5 py-3 border-t border-sand-200 flex items-center gap-2">
          <div className="flex gap-0.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="w-4 h-1 rounded-full"
                style={{ background: i < 5 ? "#5C7A62" : "#DDD4C0" }}
              />
            ))}
          </div>
          <span className="font-sans text-earth-300" style={{ fontSize: "0.7rem" }}>
            5 of 8 dimensions seen
          </span>
        </div>
      </div>
    </div>
  );
}

function DemoBriefing({ reduced }: { reduced: boolean }) {
  return (
    <div className="max-w-[480px] mx-auto lg:mx-0">
      <div
        className="rounded-xl border border-sand-200 bg-sand-50 overflow-hidden"
        style={!reduced ? { animation: "msg-in 500ms cubic-bezier(0.22,1,0.36,1) both" } : undefined}
      >
        {/* Keystone */}
        <div className="px-5 pt-5 pb-4">
          <p
            className="font-sans text-earth-400 mb-2"
            style={{ fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" }}
          >
            Your keystone
          </p>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="font-serif text-ink-900" style={{ fontSize: "1.05rem", fontWeight: 500, lineHeight: 1.3 }}>
                {BRIEFING_KEYSTONE.label}
              </p>
              <p className="font-sans text-earth-400 mt-1" style={{ fontSize: "0.8rem", lineHeight: 1.5 }}>
                {BRIEFING_KEYSTONE.reasoning}
              </p>
            </div>
            <span
              className="shrink-0 px-2 py-0.5 rounded-full font-sans text-amber-600 bg-amber-100"
              style={{ fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.08em" }}
            >
              {BRIEFING_KEYSTONE.badge}
            </span>
          </div>
        </div>

        <div className="mx-5 border-t border-sand-100" />

        {/* Field report */}
        <div className="px-5 py-4">
          <p
            className="font-sans text-earth-400 mb-2"
            style={{ fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" }}
          >
            Field report
          </p>
          <div className="space-y-2">
            {BRIEFING_ACTIONS.map((action, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border border-sand-300 shrink-0"
                  aria-hidden="true"
                />
                <span className="font-sans text-ink-700" style={{ fontSize: "0.85rem" }}>
                  {action}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-5 border-t border-sand-100" />

        {/* Watching */}
        <div className="px-5 py-4">
          <p
            className="font-sans text-earth-400 mb-2"
            style={{ fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" }}
          >
            Watching
          </p>
          <p className="font-sans text-ink-600" style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>
            {BRIEFING_WATCHING}
          </p>
        </div>
      </div>
    </div>
  );
}

function DemoInsight({ reduced }: { reduced: boolean }) {
  return (
    <div className="max-w-[360px] mx-auto">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "#1A1714",
          ...(reduced ? {} : { animation: "msg-in 600ms cubic-bezier(0.22,1,0.36,1) both" }),
        }}
      >
        <div className="flex flex-col items-center px-6 py-8">
          <ConnectionThreads
            activeDimensions={["body", "money", "home", "purpose", "people", "joy"]}
            size="signature"
            darkMode={true}
            animate={!reduced}
          />
          <p
            className="font-serif text-center mt-5"
            style={{ fontSize: "0.95rem", lineHeight: 1.6, color: "#EDE6D8" }}
          >
            &ldquo;{INSIGHT_TEXT}&rdquo;
          </p>
          <p
            className="font-sans text-center mt-3"
            style={{ fontSize: "0.65rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8C8274" }}
          >
            From your structure
          </p>

          {/* Share button */}
          <button
            className="mt-5 flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#3D3830] cursor-pointer"
            style={{
              background: "transparent",
              transition: reduced ? "none" : "border-color 300ms cubic-bezier(0.22,1,0.36,1)",
            }}
            aria-label="Share insight"
            tabIndex={-1}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8C8274" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span className="font-sans" style={{ fontSize: "0.75rem", color: "#8C8274" }}>
              Share
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/*  SECTION 3 — Three Truths with mini constellations             */
/* ══════════════════════════════════════════════════════════════ */

const THREE_TRUTHS: {
  statement: string;
  explanation: string;
  dims: DimensionKey[];
}[] = [
  {
    statement: "Your life isn\u2019t separate buckets.",
    explanation:
      "Money, sleep, relationships, purpose \u2014 they move together. HUMA shows you the connections you\u2019re already living.",
    dims: ["body", "people", "money", "home", "growth", "joy", "purpose", "identity"],
  },
  {
    statement: "One behavior holds more than you think.",
    explanation:
      "Cooking dinner isn\u2019t about food. It\u2019s Body, Money, People, Home, and Joy in one decision. HUMA finds your keystone.",
    dims: ["home", "body", "money", "people", "joy"],
  },
  {
    statement: "Your patterns are already there.",
    explanation:
      "You don\u2019t need motivation. You need to see what\u2019s already working \u2014 and what quietly stopped.",
    dims: ["body", "growth", "purpose"],
  },
];

/* ══════════════════════════════════════════════════════════════ */
/*  MAIN LANDING PAGE                                              */
/* ══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const setRef = useScrollReveal();
  const [mounted, setMounted] = useState(false);
  const [entryInput, setEntryInput] = useState("");
  const [scrollCueVisible, setScrollCueVisible] = useState(true);

  useEffect(() => setMounted(true), []);

  // Hide scroll cue on first scroll
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 20) {
        setScrollCueVisible(false);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goWithMessage = useCallback(
    (msg?: string) => {
      if (msg && msg.trim()) {
        router.push(`/start?msg=${encodeURIComponent(msg.trim())}`);
      } else {
        router.push("/start");
      }
    },
    [router],
  );

  const handleEntrySubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      goWithMessage(entryInput);
    },
    [entryInput, goWithMessage],
  );

  return (
    <div className="min-h-screen bg-sand-50 overflow-x-hidden">
      {/* ═══ SECTION 1: Hero — The Hook ═══ */}
      <section className="min-h-dvh flex flex-col items-center justify-center px-6 relative">
        <div className="max-w-[680px] mx-auto text-center">
          <h1
            className="font-serif text-ink-900 mb-6"
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
            }}
          >
            See the whole.{" "}
            <span className="text-sage-600">Find the leverage.</span>
          </h1>

          {/* ConnectionThreads — the "before" state: all dims at low opacity, disconnected */}
          <div className="flex justify-center mb-6 opacity-30">
            <ConnectionThreads
              activeDimensions={["body", "people", "money", "home", "growth", "joy", "purpose", "identity"]}
              connections={[]}
              size="compact"
              animate={!reduced}
            />
          </div>

          <p
            className="font-sans text-ink-500 mx-auto mb-8"
            style={{
              fontSize: "clamp(1rem, 2vw, 1.15rem)",
              fontWeight: 300,
              lineHeight: 1.7,
              maxWidth: "480px",
            }}
          >
            Most people manage their life in pieces.
            <br />
            HUMA shows you how the pieces connect &mdash;
            <br />
            and which one holds everything together.
          </p>

          <button
            onClick={() => {
              const demo = document.getElementById("demo");
              demo?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
            }}
            className="inline-flex items-center gap-1 font-sans text-earth-400 hover:text-earth-500 cursor-pointer"
            style={{
              fontSize: "0.85rem",
              fontWeight: 400,
              background: "none",
              border: "none",
              transition: reduced ? "none" : "color 200ms",
            }}
          >
            Watch it work
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Scroll cue */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          style={{
            opacity: scrollCueVisible ? 0.4 : 0,
            transition: reduced ? "none" : "opacity 600ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div
            className="w-px h-8 bg-earth-300 mx-auto"
            style={
              !reduced
                ? { animation: "scroll-bounce 2s cubic-bezier(0.22,1,0.36,1) infinite" }
                : undefined
            }
          />
        </div>
      </section>

      {/* ═══ SECTION 2: The Demo ═══ */}
      <div id="demo">
        <DemoSection reduced={reduced} />
      </div>

      {/* ═══ SECTION 3: Three Truths ═══ */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-[600px] mx-auto space-y-16 md:space-y-20">
          {THREE_TRUTHS.map((truth, i) => (
            <div
              key={i}
              ref={setRef(i)}
              className={`flex flex-col items-center text-center ${mounted && !reduced ? "landing-reveal" : ""}`}
              style={!reduced && mounted ? undefined : !reduced ? { opacity: 0 } : undefined}
            >
              <ConnectionThreads
                activeDimensions={truth.dims}
                size="badge"
                animate={!reduced}
                className="mb-5"
              />

              <h3
                className="font-serif text-ink-900 mb-3"
                style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)", fontWeight: 500, lineHeight: 1.3 }}
              >
                {truth.statement}
              </h3>

              <p
                className="font-sans text-earth-500"
                style={{ fontSize: "0.95rem", fontWeight: 300, lineHeight: 1.7, maxWidth: "420px" }}
              >
                {truth.explanation}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 4: Entry — Type Your First Message ═══ */}
      <section className="px-6 py-20 md:py-28 bg-sand-100">
        <div
          ref={setRef(3)}
          className={`max-w-[480px] mx-auto text-center ${mounted && !reduced ? "landing-reveal" : ""}`}
          style={!reduced && mounted ? undefined : !reduced ? { opacity: 0 } : undefined}
        >
          <h2
            className="font-serif text-ink-900 mb-8"
            style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 400, lineHeight: 1.3 }}
          >
            What&rsquo;s going on in your life right now?
          </h2>

          <form onSubmit={handleEntrySubmit} className="relative mb-4">
            <input
              type="text"
              value={entryInput}
              onChange={(e) => setEntryInput(e.target.value)}
              placeholder="Start typing..."
              className="w-full bg-sand-50 border border-sand-300 rounded-xl px-5 py-4 pr-14 font-sans text-ink-800 placeholder:text-earth-300 focus:outline-none focus:border-sage-400"
              style={{
                fontSize: "1.05rem",
                height: "56px",
                transition: reduced ? "none" : "border-color 200ms cubic-bezier(0.22,1,0.36,1)",
              }}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-amber-600 hover:bg-amber-500 flex items-center justify-center cursor-pointer"
              style={{
                transition: reduced ? "none" : "background-color 200ms cubic-bezier(0.22,1,0.36,1)",
              }}
              aria-label="Start"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FAF8F3" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          <p className="font-sans text-earth-300" style={{ fontSize: "0.82rem", fontWeight: 300 }}>
            No account needed. Start talking.
          </p>
        </div>
      </section>

      {/* ═══ SECTION 5: Footer ═══ */}
      <footer className="px-6 py-8 bg-sand-50 border-t border-sand-200">
        <div className="max-w-[680px] mx-auto text-center">
          <p
            className="font-serif text-ink-900 mb-1"
            style={{ fontSize: "0.9rem", fontWeight: 400, letterSpacing: "0.2em" }}
          >
            HUMA
          </p>
          <p className="font-sans text-earth-300" style={{ fontSize: "0.75rem", fontWeight: 300 }}>
            Life infrastructure
          </p>
          <p className="font-sans text-earth-300 mt-3" style={{ fontSize: "0.65rem", fontWeight: 300 }}>
            &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>

      {/* ── Animations ── */}
      <style jsx global>{`
        .landing-reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .landing-visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes msg-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scroll-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(8px); opacity: 0.7; }
        }
        @media (prefers-reduced-motion: reduce) {
          .landing-reveal {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
