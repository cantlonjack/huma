"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/* ─── Dimension config ─── */
const DIMS: { name: string; color: string; label: string; icon: string }[] = [
  { name: "Body", color: "#3A5A40", label: "Sleep tanks when deadlines stack up", icon: "M12 3c-1.5 2-4 4-4 7s2 5 4 7c2-2 4-4 4-7s-2.5-5-4-7z" },
  { name: "People", color: "#2E6B8A", label: "Haven\u2019t seen Mia since the project started", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" },
  { name: "Money", color: "#B5621E", label: "Invoices out, but cash won\u2019t land until the 20th", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" },
  { name: "Home", color: "#8C8274", label: "Kitchen\u2019s been takeout-only for two weeks", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
  { name: "Growth", color: "#2A4A30", label: "Reading 20min/day streak \u2014 11 days", icon: "M12 20V10M18 20V4M6 20v-4" },
  { name: "Joy", color: "#C87A3A", label: "Haven\u2019t played guitar since last Thursday", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  { name: "Purpose", color: "#6B5A7A", label: "The side project that actually matters keeps waiting", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
  { name: "Identity", color: "#554D42", label: "Used to be a morning person \u2014 trying to get back", icon: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" },
];

/* ─── Hero conversation sequence ─── */
const HERO_MESSAGES = [
  { role: "huma" as const, text: "What\u2019s going on in your life right now?" },
  { role: "user" as const, text: "Freelance is picking up but I\u2019m burning out. Two big clients, a side project I care about, and I haven\u2019t cooked a real meal in weeks. Money\u2019s fine but everything else is slipping." },
  { role: "huma" as const, text: "When everything slips at once, there\u2019s usually one thing holding it all down. What stopped first?" },
  { role: "user" as const, text: "Cooking, honestly. Once we stopped making dinner, the evenings fell apart \u2014 screens until midnight, bad sleep, then dragging through the next day." },
];

/* Dimensions that "light up" as conversation progresses */
const DIM_REVEAL_SCHEDULE = [
  [], // after msg 0
  [0, 2, 3, 6], // after msg 1: Body, Money, Home, Purpose
  [0, 2, 3, 6], // after msg 2: same
  [0, 1, 2, 3, 5, 6], // after msg 3: + People, Joy
];

/* ─── Briefing entries ─── */
const BRIEFING = [
  {
    headline: "Cook dinner tonight",
    reasoning: "This is your keystone. It touches Body, Money, People, Home, and Joy \u2014 five dimensions from one behavior. Everything else gets easier when this one happens.",
    dims: ["Home", "Body", "People"],
    focus: true,
  },
  {
    headline: "Finish the Acme deliverable by 3pm",
    reasoning: "You said evenings fall apart when work bleeds past dinner. Hard stop at 3 gives you the kitchen window.",
    dims: ["Money", "Purpose"],
    focus: false,
  },
  {
    headline: "20-minute walk before you start cooking",
    reasoning: "On days you move in the afternoon, you sleep an hour longer. Day three of the pattern.",
    dims: ["Body", "Joy"],
    focus: false,
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
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
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
    []
  );
}

/* ─── Typing animation for a single message ─── */
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
/*  HERO — Interactive product demo                              */
/* ══════════════════════════════════════════════════════════════ */

function HeroProductDemo({ reduced }: { reduced: boolean }) {
  const [phase, setPhase] = useState<"conversation" | "extracting" | "briefing">("conversation");
  const [msgIndex, setMsgIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [revealedDims, setRevealedDims] = useState<number[]>([]);
  const [briefingVisible, setBriefingVisible] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);

  // Message typing
  const currentMsg = HERO_MESSAGES[msgIndex];
  const typing = useTypingText(
    currentMsg?.text || "",
    showMessage && phase === "conversation",
    currentMsg?.role === "user" ? 18 : 22
  );

  // Sequence the conversation
  useEffect(() => {
    if (reduced) {
      setVisibleMessages([0, 1, 2, 3]);
      setRevealedDims([0, 2, 3, 4]);
      setPhase("briefing");
      setBriefingVisible(true);
      return;
    }

    // Start first message after delay
    const t = setTimeout(() => {
      setShowMessage(true);
    }, 600);
    return () => clearTimeout(t);
  }, [reduced]);

  // When typing finishes, advance
  useEffect(() => {
    if (!typing.done || !showMessage || reduced) return;

    // Add this message to visible
    setVisibleMessages((prev) => {
      if (prev.includes(msgIndex)) return prev;
      return [...prev, msgIndex];
    });

    // Reveal dims for this stage
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
      // Conversation done → extracting → briefing
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
      {/* Product frame */}
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
            <span
              className="font-serif text-ink-800"
              style={{ fontSize: "0.85rem", fontWeight: 500, letterSpacing: "0.15em" }}
            >
              HUMA
            </span>
            <span className="text-earth-300" style={{ fontSize: "0.7rem" }}>&middot;</span>
            <span className="font-sans text-earth-300" style={{ fontSize: "0.7rem" }}>
              {phase === "conversation" ? "Listening..." : phase === "extracting" ? "Mapping context..." : "Your briefing"}
            </span>
          </div>

          {/* Mini dimension dots */}
          <div className="flex gap-1.5">
            {DIMS.slice(0, 8).map((d, i) => (
              <span
                key={d.name}
                className="w-2 h-2 rounded-full"
                style={{
                  background: revealedDims.includes(i) ? d.color : "var(--color-sand-200)",
                  opacity: revealedDims.includes(i) ? 0.85 : 0.4,
                  transition: reduced ? "none" : "all 600ms cubic-bezier(0.22, 1, 0.36, 1)",
                  transform: revealedDims.includes(i) ? "scale(1.2)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="relative" style={{ minHeight: 340 }}>
          {/* ── Conversation view ── */}
          <div
            style={{
              opacity: phase === "briefing" ? 0 : 1,
              transition: reduced ? "none" : "opacity 500ms ease",
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
                    style={
                      !reduced
                        ? { animation: `msg-in 400ms cubic-bezier(0.22,1,0.36,1) both` }
                        : undefined
                    }
                  >
                    <div
                      className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-sage-50 text-ink-800"
                          : "bg-sand-100 text-ink-700"
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

              {/* Typing indicator between messages */}
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
                <div className="text-center">
                  <div className="flex justify-center gap-2 mb-4">
                    {DIMS.map((d, i) => (
                      <div
                        key={d.name}
                        className="flex flex-col items-center gap-1"
                        style={
                          !reduced
                            ? { animation: `dim-pop 500ms cubic-bezier(0.22,1,0.36,1) ${i * 80}ms both` }
                            : undefined
                        }
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ background: d.color, opacity: 0.85 }}
                        />
                        <span className="font-sans text-earth-400" style={{ fontSize: "0.55rem" }}>
                          {d.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="font-sans text-earth-400" style={{ fontSize: "0.8rem", fontWeight: 400 }}>
                    Mapping across 8 dimensions...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Briefing view ── */}
          {phase === "briefing" && (
            <div
              style={{
                opacity: briefingVisible ? 1 : 0,
                transition: reduced ? "none" : "opacity 600ms ease",
              }}
            >
              {/* Date line */}
              <div className="px-5 pt-4 pb-2">
                <p className="font-sans text-earth-400" style={{ fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.02em" }}>
                  Wednesday, April 9&ensp;&middot;&ensp;Week 3&ensp;&middot;&ensp;Day 16
                </p>
              </div>

              {/* Through-line */}
              <div className="px-5 pb-3">
                <div className="border-l-2 border-l-amber-400 pl-3.5 py-0.5">
                  <p className="font-serif text-ink-600 italic" style={{ fontSize: "0.88rem", lineHeight: 1.5 }}>
                    The evening starts in the kitchen. Get there by 5:30.
                  </p>
                </div>
              </div>

              <div className="mx-5 border-t border-sand-100" />

              {/* Entries */}
              {BRIEFING.map((entry, i) => (
                <div
                  key={i}
                  className={`px-5 py-3.5 ${i < BRIEFING.length - 1 ? "border-b border-sand-50" : ""}`}
                  style={
                    !reduced
                      ? { animation: `msg-in 400ms cubic-bezier(0.22,1,0.36,1) ${i * 150}ms both` }
                      : undefined
                  }
                >
                  {entry.focus && (
                    <p className="font-sans text-amber-600 mb-1" style={{ fontSize: "0.55rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                      Today&apos;s focus
                    </p>
                  )}
                  <p className={`font-serif leading-snug mb-1 ${entry.focus ? "text-ink-900 text-[15px] font-medium" : "text-ink-800 text-[14px]"}`}>
                    {entry.headline}
                  </p>
                  <p className="font-sans text-earth-400 mb-1.5" style={{ fontSize: "0.76rem", fontWeight: 300, lineHeight: 1.5 }}>
                    {entry.reasoning}
                  </p>
                  <div className="flex gap-2">
                    {entry.dims.map((d) => {
                      const dim = DIMS.find((x) => x.name === d);
                      return (
                        <span key={d} className="inline-flex items-center gap-1 font-sans text-earth-400" style={{ fontSize: "0.65rem" }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: dim?.color || "#8C8274", opacity: 0.7 }} />
                          {d}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom input bar */}
        <div className="px-5 py-3 border-t border-sand-100 flex items-center gap-3">
          <div
            className="flex-1 rounded-full bg-sand-50 px-4 py-2 font-sans text-earth-300"
            style={{ fontSize: "0.8rem" }}
          >
            Tell HUMA what&apos;s going on...
          </div>
          <div className="w-8 h-8 rounded-full bg-sage-600 flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Phase label below the card */}
      <div className="mt-5 text-center">
        <p className="font-sans text-earth-300" style={{ fontSize: "0.78rem", fontWeight: 300, lineHeight: 1.5 }}>
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

  useEffect(() => setMounted(true), []);

  const go = () => router.push("/start");

  return (
    <div className="min-h-screen bg-sand-50 overflow-x-hidden">
      {/* ═══ NAV ═══ */}
      <nav className="sticky top-0 z-50 bg-sand-50/90 backdrop-blur-md border-b border-sand-200/60">
        <div className="max-w-[1120px] mx-auto px-6 h-14 flex items-center justify-between">
          <span
            className="font-serif text-ink-900"
            style={{ fontSize: "1rem", fontWeight: 400, letterSpacing: "0.25em" }}
          >
            HUMA
          </span>

          <button
            onClick={go}
            className="font-sans font-medium text-sand-50 bg-sage-700 hover:bg-sage-600 rounded-full px-5 py-2 cursor-pointer"
            style={{ fontSize: "0.84rem", transition: reduced ? "none" : "all 200ms cubic-bezier(0.22, 1, 0.36, 1)" }}
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
                  lineHeight: 1.08,
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
                className="font-sans text-earth-500 mb-8 max-w-[420px]"
                style={{ fontSize: "1.05rem", fontWeight: 300, lineHeight: 1.7 }}
              >
                Your money, sleep, relationships, and work aren&rsquo;t separate problems. HUMA shows you how they connect &mdash; and which one daily behavior holds everything else together.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <button
                  onClick={go}
                  className="inline-flex items-center justify-center rounded-full bg-sage-700 hover:bg-sage-600 text-sand-50 font-sans font-medium px-8 py-3.5 min-h-[48px] cursor-pointer"
                  style={{
                    fontSize: "0.95rem",
                    boxShadow: "0 4px 20px rgba(58,90,64,0.15)",
                    transition: reduced ? "none" : "all 300ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  Start a conversation&ensp;&rarr;
                </button>
                <span className="font-sans text-earth-300 self-center" style={{ fontSize: "0.8rem", fontWeight: 300 }}>
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

      {/* ═══ THE DIFFERENCE — tight, inline ═══ */}
      <section className="px-6 py-16 md:py-20 border-t border-sand-200">
        <div className="max-w-[720px] mx-auto">
          <h2
            ref={setRef(0)}
            className={`font-serif text-ink-900 mb-12 text-center ${mounted && !reduced ? "landing-reveal" : ""}`}
            style={{
              fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
              fontWeight: 400,
              lineHeight: 1.3,
              opacity: !reduced && mounted ? undefined : !reduced ? 0 : undefined,
            }}
          >
            It reasons about your life.{" "}
            <span className="text-earth-400">It doesn&apos;t just organize it.</span>
          </h2>

          <div className="space-y-10">
            {[
              {
                label: "It remembers everything",
                text: "Your cash flow timing. Your partner\u2019s schedule. The client deadline from three weeks ago. HUMA holds your full context and uses all of it, every morning.",
                color: "#3A5A40",
              },
              {
                label: "It sees connections",
                text: "Cooking dinner improves your sleep. Sleep improves your focus. Focus gets you done by 3pm. Getting done by 3pm gives you your evening back. HUMA traces the chain \u2014 and finds the one move.",
                color: "#2E6B8A",
              },
              {
                label: "It learns your rhythm",
                text: "After a week, it notices your best creative days follow an evening walk. It sees when a part of your life goes quiet. It adapts without you configuring anything.",
                color: "#C87A3A",
              },
            ].map((item, i) => (
              <div
                key={i}
                ref={setRef(i + 1)}
                className={`flex items-start gap-5 ${mounted && !reduced ? "landing-reveal" : ""}`}
                style={!reduced ? { opacity: mounted ? undefined : 0 } : undefined}
              >
                <div
                  className="w-1 shrink-0 rounded-full mt-1"
                  style={{ background: item.color, opacity: 0.6, height: "2.8rem" }}
                />
                <div>
                  <p className="font-serif text-ink-900 mb-1.5" style={{ fontSize: "1.05rem", fontWeight: 500, lineHeight: 1.3 }}>
                    {item.label}
                  </p>
                  <p className="font-sans text-earth-500" style={{ fontSize: "0.9rem", fontWeight: 300, lineHeight: 1.7 }}>
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section className="px-6 py-24 md:py-32 bg-sand-100">
        <div
          ref={setRef(4)}
          className={`max-w-[520px] mx-auto text-center ${mounted && !reduced ? "landing-reveal" : ""}`}
          style={!reduced ? { opacity: mounted ? undefined : 0 } : undefined}
        >
          <h2 className="font-serif text-ink-900 mb-4" style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 400, lineHeight: 1.25 }}>
            What&rsquo;s going on in your life?
          </h2>
          <p className="font-sans text-earth-400 mb-8" style={{ fontSize: "0.95rem", fontWeight: 300, lineHeight: 1.6 }}>
            Start a conversation. HUMA builds your first morning briefing in five minutes.
          </p>
          <button
            onClick={go}
            className="inline-flex items-center justify-center rounded-full bg-sage-700 hover:bg-sage-600 text-sand-50 font-sans font-medium px-10 py-4 min-h-[52px] cursor-pointer"
            style={{
              fontSize: "1rem",
              boxShadow: "0 4px 24px rgba(58,90,64,0.15)",
              transition: reduced ? "none" : "all 300ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            Start a conversation&ensp;&rarr;
          </button>
          <p className="font-sans text-earth-300 mt-4" style={{ fontSize: "0.8rem", fontWeight: 300 }}>
            No account. No forms. Just a conversation.
          </p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="px-6 py-8 border-t border-sand-200 bg-sand-50">
        <div className="max-w-[1120px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-serif text-ink-900" style={{ fontSize: "0.9rem", fontWeight: 400, letterSpacing: "0.2em" }}>
              HUMA
            </span>
            <span className="font-sans text-earth-300" style={{ fontSize: "0.75rem", fontWeight: 300 }}>
              Life infrastructure
            </span>
          </div>
          <p className="font-sans text-earth-300" style={{ fontSize: "0.7rem", fontWeight: 300 }}>
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
        @keyframes dim-pop {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
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
