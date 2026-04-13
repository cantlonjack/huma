"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ConnectionThreads } from "@/components/shared/ConnectionThreads";
import type { DimensionKey } from "@/types/v2";

/* ─── Hero conversation sequence ─── */
const HERO_MESSAGES = [
  { role: "huma" as const, text: "What\u2019s going on in your life right now?" },
  { role: "user" as const, text: "Freelance is picking up but I\u2019m burning out. Two big clients, a side project I care about, and I haven\u2019t cooked a real meal in weeks. Money\u2019s fine but everything else is slipping." },
  { role: "huma" as const, text: "When everything slips at once, there\u2019s usually one thing holding it all down. What stopped first?" },
  { role: "user" as const, text: "Cooking, honestly. Once we stopped making dinner, the evenings fell apart \u2014 screens until midnight, bad sleep, then dragging through the next day." },
];

/* Dimensions that light up as conversation progresses */
const DIM_REVEAL_SCHEDULE: number[][] = [
  [],
  [0, 2, 3, 6],
  [0, 2, 3, 6],
  [0, 1, 2, 3, 5, 6],
];

const IDX_TO_KEY: DimensionKey[] = [
  "body", "people", "money", "home", "growth", "joy", "purpose", "identity",
];

/* ─── Briefing entries ─── */
const BRIEFING = [
  {
    headline: "Cook dinner tonight",
    reasoning: "This is your keystone. It touches Body, Money, People, Home, and Joy \u2014 five dimensions from one behavior.",
    dims: ["home", "body", "people", "money", "joy"] as DimensionKey[],
    focus: true,
  },
  {
    headline: "Finish the Acme deliverable by 3pm",
    reasoning: "Evenings fall apart when work bleeds past dinner. Hard stop at 3 gives you the kitchen window.",
    dims: ["money", "purpose"] as DimensionKey[],
    focus: false,
  },
  {
    headline: "20-minute walk before you start cooking",
    reasoning: "On days you move in the afternoon, you sleep an hour longer. Day three of the pattern.",
    dims: ["body", "joy"] as DimensionKey[],
    focus: false,
  },
];

/* ─── Value propositions ─── */
const VALUE_PROPS = [
  {
    label: "It remembers everything",
    text: "Your cash flow timing. Your partner\u2019s schedule. The client deadline from three weeks ago. HUMA holds your full context and uses all of it, every morning.",
    color: "#3A5A40",
    dims: ["money", "people", "purpose"] as DimensionKey[],
  },
  {
    label: "It sees connections",
    text: "Cooking dinner improves your sleep. Sleep improves your focus. Focus gets you done by 3pm. HUMA traces the chain \u2014 and finds the one move.",
    color: "#2E6B8A",
    dims: ["home", "body", "growth", "money"] as DimensionKey[],
  },
  {
    label: "It learns your rhythm",
    text: "After a week, it notices your best creative days follow an evening walk. It sees when a part of your life goes quiet. It adapts without you configuring anything.",
    color: "#C87A3A",
    dims: ["body", "joy", "growth"] as DimensionKey[],
  },
];

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
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
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
    if (!active) { setDisplayed(""); setDone(false); return; }
    if (reduced) { setDisplayed(text); setDone(true); return; }
    let i = 0;
    setDisplayed("");
    setDone(false);
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(interval); setDone(true); }
    }, speed);
    return () => clearInterval(interval);
  }, [active, text, speed, reduced]);

  return { displayed, done };
}

/* ══════════════════════════════════════════════════════════════ */
/*  HERO — Interactive product demo card                         */
/* ══════════════════════════════════════════════════════════════ */

function HeroProductDemo({ reduced }: { reduced: boolean }) {
  const [phase, setPhase] = useState<"conversation" | "extracting" | "briefing">("conversation");
  const [msgIndex, setMsgIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [revealedDims, setRevealedDims] = useState<number[]>([]);
  const [briefingVisible, setBriefingVisible] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);

  const currentMsg = HERO_MESSAGES[msgIndex];
  const typing = useTypingText(
    currentMsg?.text || "",
    showMessage && phase === "conversation",
    currentMsg?.role === "user" ? 18 : 20,
  );

  // Sequence the conversation
  useEffect(() => {
    if (reduced) {
      setVisibleMessages([0, 1, 2, 3]);
      setRevealedDims([0, 1, 2, 3, 4, 5, 6, 7]);
      setPhase("briefing");
      setBriefingVisible(true);
      return;
    }
    const t = setTimeout(() => setShowMessage(true), 600);
    return () => clearTimeout(t);
  }, [reduced]);

  // When typing finishes, advance
  useEffect(() => {
    if (!typing.done || !showMessage || reduced) return;

    setVisibleMessages((prev) =>
      prev.includes(msgIndex) ? prev : [...prev, msgIndex],
    );

    if (DIM_REVEAL_SCHEDULE[msgIndex]) {
      setRevealedDims(DIM_REVEAL_SCHEDULE[msgIndex]);
    }

    if (msgIndex < HERO_MESSAGES.length - 1) {
      const t = setTimeout(() => {
        setMsgIndex((i) => i + 1);
        setShowMessage(false);
        setTimeout(() => setShowMessage(true), 400);
      }, 800);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setPhase("extracting");
        setRevealedDims([0, 1, 2, 3, 4, 5, 6, 7]);
        setTimeout(() => {
          setPhase("briefing");
          setTimeout(() => setBriefingVisible(true), 300);
        }, 1800);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [typing.done, showMessage, msgIndex, reduced]);

  return (
    <div className="relative w-full max-w-[560px]">
      <div
        className="rounded-2xl overflow-hidden border border-sand-200"
        style={{
          background: "#FFFFFF",
          boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 4px 20px rgba(0,0,0,0.04)",
        }}
      >
        {/* Top bar */}
        <div className="px-5 py-3 border-b border-sand-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-ink-800" style={{ fontSize: "0.85rem", fontWeight: 500, letterSpacing: "0.15em" }}>
              HUMA
            </span>
            <span className="text-earth-300" style={{ fontSize: "0.7rem" }}>&middot;</span>
            <span className="font-sans text-earth-400" style={{ fontSize: "0.7rem" }}>
              {phase === "conversation" ? "Listening..." : phase === "extracting" ? "Mapping context..." : "Your briefing"}
            </span>
          </div>
          <ConnectionThreads
            activeDimensions={revealedDims.map(i => IDX_TO_KEY[i])}
            size="micro"
            animate={!reduced}
          />
        </div>

        {/* Content area */}
        <div className="relative" style={{ minHeight: 340 }}>
          {/* Conversation view */}
          <div
            style={{
              opacity: phase === "briefing" ? 0 : 1,
              transition: reduced ? "none" : "opacity 500ms cubic-bezier(0.22,1,0.36,1)",
              position: phase === "briefing" ? "absolute" : "relative",
              inset: 0,
              pointerEvents: phase === "briefing" ? "none" : "auto",
            }}
          >
            <div className="px-5 py-4 space-y-3" style={{ minHeight: 280 }}>
              {visibleMessages.map((idx) => {
                const msg = HERO_MESSAGES[idx];
                const isCurrentlyTyping = idx === msgIndex && showMessage && !typing.done;
                const text = idx === msgIndex && showMessage ? typing.displayed : msg.text;

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
                      style={{ fontSize: "0.85rem", lineHeight: 1.55 }}
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

              {/* Typing indicator */}
              {phase === "conversation" && !showMessage && msgIndex > 0 && (
                <div className="flex justify-start">
                  <div className="bg-sand-100 rounded-2xl px-4 py-2.5 flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-earth-300" style={{ animation: "typing-dot 1.2s ease-in-out infinite" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-earth-300" style={{ animation: "typing-dot 1.2s ease-in-out 0.2s infinite" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-earth-300" style={{ animation: "typing-dot 1.2s ease-in-out 0.4s infinite" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Extraction overlay */}
            {phase === "extracting" && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  background: "rgba(250,248,243,0.92)",
                  animation: !reduced ? "fade-in-fast 400ms ease both" : "none",
                }}
              >
                <div className="flex flex-col items-center gap-3">
                  <ConnectionThreads
                    activeDimensions={revealedDims.map(i => IDX_TO_KEY[i])}
                    size="compact"
                    animate={!reduced}
                  />
                  <p className="font-sans text-earth-500" style={{ fontSize: "0.8rem", fontWeight: 400 }}>
                    Mapping across 8 dimensions...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Briefing view */}
          {phase === "briefing" && (
            <div
              style={{
                opacity: briefingVisible ? 1 : 0,
                transition: reduced ? "none" : "opacity 600ms cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              <div className="px-5 pt-4 pb-2">
                <p className="font-sans text-earth-500" style={{ fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.02em" }}>
                  Wednesday, April 9&ensp;&middot;&ensp;Week 3&ensp;&middot;&ensp;Day 16
                </p>
              </div>

              <div className="px-5 pb-3">
                <div className="border-l-2 border-l-amber-400 pl-3.5 py-0.5">
                  <p className="font-serif text-ink-600 italic" style={{ fontSize: "0.88rem", lineHeight: 1.5 }}>
                    The evening starts in the kitchen. Get there by 5:30.
                  </p>
                </div>
              </div>

              <div className="mx-5 border-t border-sand-100" />

              {BRIEFING.map((entry, i) => (
                <div
                  key={i}
                  className={`px-5 py-3.5 ${i < BRIEFING.length - 1 ? "border-b border-sand-50" : ""}`}
                  style={!reduced ? { animation: `msg-in 400ms cubic-bezier(0.22,1,0.36,1) ${i * 150}ms both` } : undefined}
                >
                  {entry.focus && (
                    <p className="font-sans text-amber-600 mb-1" style={{ fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                      Your keystone
                    </p>
                  )}
                  <p className={`font-serif leading-snug mb-1 ${entry.focus ? "text-ink-900 text-[15px] font-medium" : "text-ink-800 text-[14px]"}`}>
                    {entry.headline}
                  </p>
                  <p className="font-sans text-earth-500 mb-1.5" style={{ fontSize: "0.76rem", fontWeight: 300, lineHeight: 1.5 }}>
                    {entry.reasoning}
                  </p>
                  <ConnectionThreads
                    activeDimensions={entry.dims}
                    size="micro"
                    animate={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom input bar */}
        <div className="px-5 py-3 border-t border-sand-100 flex items-center gap-3">
          <div className="flex-1 rounded-full bg-sand-50 px-4 py-2 font-sans text-earth-350" style={{ fontSize: "0.8rem" }}>
            Tell HUMA what&apos;s going on...
          </div>
          <div className="w-8 h-8 rounded-full bg-sage-600 flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Phase label */}
      <div className="mt-5 text-center">
        <p className="font-sans text-earth-400" style={{ fontSize: "0.78rem", fontWeight: 300, lineHeight: 1.5 }}>
          {phase === "conversation" && "A five-minute conversation. That\u2019s all it takes."}
          {phase === "extracting" && "HUMA maps what you said across eight life dimensions."}
          {phase === "briefing" && "Your first morning briefing \u2014 generated, not templated."}
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/*  MAIN LANDING PAGE                                            */
/* ══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const setRef = useScrollReveal();
  const [mounted, setMounted] = useState(false);
  const [entryInput, setEntryInput] = useState("");

  useEffect(() => setMounted(true), []);

  const go = useCallback(
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
      go(entryInput);
    },
    [entryInput, go],
  );

  return (
    <div className="min-h-screen bg-sand-50 overflow-x-hidden">
      {/* ═══ NAV ═══ */}
      <nav className="sticky top-0 z-50 bg-sand-50/90 backdrop-blur-md border-b border-sand-200/60">
        <div className="max-w-[1120px] mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-serif text-ink-900" style={{ fontSize: "1rem", fontWeight: 400, letterSpacing: "0.25em" }}>
            HUMA
          </span>
          <button
            onClick={() => go()}
            className="font-sans font-medium text-sand-50 bg-sage-700 hover:bg-sage-600 active:bg-sage-800 rounded-full px-5 py-2 min-h-[44px] cursor-pointer"
            style={{ fontSize: "0.84rem", transition: reduced ? "none" : "all 200ms cubic-bezier(0.22,1,0.36,1)" }}
          >
            Get started
          </button>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-[1120px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_560px] gap-12 lg:gap-16 items-start">
            {/* Left — copy */}
            <div className="pt-4 md:pt-12 lg:pt-16">
              <p
                className="font-sans text-sage-600 mb-4"
                style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" }}
              >
                Life infrastructure
              </p>

              <h1
                className="font-serif text-ink-900 mb-5"
                style={{
                  fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
                  fontWeight: 400,
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                }}
              >
                See how your life
                <br />
                actually connects.
                <br />
                <span className="text-sage-600">Find the leverage.</span>
              </h1>

              <p
                className="font-sans text-earth-600 mb-8 max-w-[420px]"
                style={{ fontSize: "1.05rem", fontWeight: 300, lineHeight: 1.7 }}
              >
                Your money, sleep, relationships, and work aren&rsquo;t separate problems. HUMA shows you how they connect &mdash; and which one daily behavior holds everything else together.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <button
                  onClick={() => go()}
                  className="inline-flex items-center justify-center rounded-full bg-sage-700 hover:bg-sage-600 active:bg-sage-800 text-sand-50 font-sans font-medium px-8 py-3.5 min-h-[48px] cursor-pointer"
                  style={{
                    fontSize: "0.95rem",
                    boxShadow: "0 4px 20px rgba(58,90,64,0.15)",
                    transition: reduced ? "none" : "all 300ms cubic-bezier(0.22,1,0.36,1)",
                  }}
                >
                  Start a conversation&ensp;&rarr;
                </button>
                <span className="font-sans text-earth-400 self-center" style={{ fontSize: "0.8rem", fontWeight: 300 }}>
                  No account needed &middot; 5 minutes
                </span>
              </div>
            </div>

            {/* Right — interactive product demo */}
            <div className="flex justify-center lg:justify-end">
              <HeroProductDemo reduced={reduced} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ THE DIFFERENCE ═══ */}
      <section className="px-6 py-20 md:py-28 border-t border-sand-200">
        <div className="max-w-[720px] mx-auto">
          <p
            className="font-sans text-sage-600 mb-4 text-center"
            style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" }}
          >
            How it works
          </p>

          <h2
            ref={setRef(0)}
            className={`font-serif text-ink-900 mb-14 text-center ${mounted && !reduced ? "landing-reveal" : ""}`}
            style={{
              fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
              fontWeight: 400,
              lineHeight: 1.3,
              opacity: !reduced && mounted ? undefined : !reduced ? 0 : undefined,
            }}
          >
            It reasons about your life.{" "}
            <span className="text-earth-500">It doesn&apos;t just organize it.</span>
          </h2>

          <div className="space-y-12">
            {VALUE_PROPS.map((item, i) => (
              <div
                key={i}
                ref={setRef(i + 1)}
                className={`flex items-start gap-5 ${mounted && !reduced ? "landing-reveal" : ""}`}
                style={!reduced ? { opacity: mounted ? undefined : 0 } : undefined}
              >
                <div
                  className="w-1 shrink-0 rounded-full mt-1"
                  style={{ background: item.color, opacity: 0.7, height: "2.8rem" }}
                />
                <div className="flex-1">
                  <p className="font-serif text-ink-900 mb-1.5" style={{ fontSize: "1.05rem", fontWeight: 500, lineHeight: 1.3 }}>
                    {item.label}
                  </p>
                  <p className="font-sans text-earth-600 mb-3" style={{ fontSize: "0.9rem", fontWeight: 300, lineHeight: 1.7 }}>
                    {item.text}
                  </p>
                  <ConnectionThreads
                    activeDimensions={item.dims}
                    size="badge"
                    animate={false}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BOTTOM CTA — with entry input ═══ */}
      <section className="px-6 py-24 md:py-32 bg-sand-100">
        <div
          ref={setRef(4)}
          className={`max-w-[480px] mx-auto text-center ${mounted && !reduced ? "landing-reveal" : ""}`}
          style={!reduced ? { opacity: mounted ? undefined : 0 } : undefined}
        >
          <h2 className="font-serif text-ink-900 mb-4" style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 400, lineHeight: 1.25 }}>
            What&rsquo;s going on in your life?
          </h2>
          <p className="font-sans text-earth-500 mb-8" style={{ fontSize: "0.95rem", fontWeight: 300, lineHeight: 1.6 }}>
            Start a conversation. HUMA builds your first morning briefing in five minutes.
          </p>

          <form onSubmit={handleEntrySubmit} className="relative mb-4">
            <label htmlFor="huma-entry" className="sr-only">
              What&rsquo;s going on in your life?
            </label>
            <input
              id="huma-entry"
              type="text"
              value={entryInput}
              onChange={(e) => setEntryInput(e.target.value)}
              placeholder="Start typing..."
              className="w-full bg-sand-50 border border-sand-300 rounded-xl px-5 py-4 pr-14 font-sans text-ink-800 placeholder:text-earth-350 focus:border-sage-500"
              style={{
                fontSize: "1.05rem",
                height: "56px",
                transition: reduced ? "none" : "border-color 200ms cubic-bezier(0.22,1,0.36,1)",
              }}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 size-11 rounded-lg bg-amber-600 hover:bg-amber-500 active:bg-amber-700 flex items-center justify-center cursor-pointer"
              style={{ transition: reduced ? "none" : "background-color 200ms cubic-bezier(0.22,1,0.36,1)" }}
              aria-label="Start"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FAF8F3" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          <p className="font-sans text-earth-400 mb-6" style={{ fontSize: "0.82rem", fontWeight: 300 }}>
            No account. No forms. Just a conversation.
          </p>

          <button
            onClick={() => go()}
            className="inline-flex items-center justify-center rounded-full bg-sage-700 hover:bg-sage-600 active:bg-sage-800 text-sand-50 font-sans font-medium px-10 py-4 min-h-[52px] cursor-pointer"
            style={{
              fontSize: "1rem",
              boxShadow: "0 4px 24px rgba(58,90,64,0.15)",
              transition: reduced ? "none" : "all 300ms cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            Start a conversation&ensp;&rarr;
          </button>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="px-6 py-10 border-t border-sand-200 bg-sand-50">
        <div className="max-w-[1120px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-serif text-ink-900" style={{ fontSize: "0.9rem", fontWeight: 400, letterSpacing: "0.2em" }}>
              HUMA
            </span>
            <span className="font-sans text-earth-400" style={{ fontSize: "0.75rem", fontWeight: 300 }}>
              Life infrastructure
            </span>
          </div>
          <p className="font-sans text-earth-400" style={{ fontSize: "0.7rem", fontWeight: 300 }}>
            Proudly created in the Great Lake State &middot; &copy; {new Date().getFullYear()} HUMA
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
        @keyframes typing-dot {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes fade-in-fast {
          from { opacity: 0; }
          to { opacity: 1; }
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
