"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/* ─── Dimension config ─── */
const DIMS: { name: string; color: string; label: string }[] = [
  { name: "Body", color: "#3A5A40", label: "Back has been better on afternoon-movement days" },
  { name: "People", color: "#2E6B8A", label: "Kids need pickup by 3:30 on Tuesdays" },
  { name: "Money", color: "#B5621E", label: "Budget tight until the 15th" },
  { name: "Home", color: "#8C8274", label: "Garden beds need layout before soil order" },
  { name: "Growth", color: "#2A4A30", label: "Reading 20min/day streak — 11 days" },
  { name: "Joy", color: "#C87A3A", label: "Haven't played guitar since last Thursday" },
  { name: "Purpose", color: "#6B5A7A", label: "Side project blocked on API decision" },
  { name: "Identity", color: "#554D42", label: "Morning person shifting to early riser" },
];

/* ─── Hero conversation sequence ─── */
const HERO_MESSAGES = [
  { role: "huma" as const, text: "What\u2019s going on in your life right now?" },
  { role: "user" as const, text: "We just bought a place with land. Trying to start a garden but the budget is tight and I\u2019ve got back issues that flare up." },
  { role: "huma" as const, text: "Tell me about the land \u2014 what are you working with?" },
  { role: "user" as const, text: "Six raised beds planned, but only three get morning sun. I need to figure out layout before ordering soil. Also have a cattle panel trellis idea for beans." },
];

/* Dimensions that "light up" as conversation progresses */
const DIM_REVEAL_SCHEDULE = [
  [], // after msg 0
  [0, 2, 3], // after msg 1: Body, Money, Home
  [0, 2, 3], // after msg 2: same
  [0, 2, 3, 4], // after msg 3: + Growth
];

/* ─── Briefing entries ─── */
const BRIEFING = [
  {
    headline: "Map out the raised bed layout",
    reasoning: "You said 6 beds but only 3 get morning sun. Start with those \u2014 sketch it before ordering soil.",
    dims: ["Home", "Body"],
    focus: true,
  },
  {
    headline: "Price the cattle panel trellis",
    reasoning: "Tractor Supply has 16ft panels at $32. You need 4 for the bean tunnel.",
    dims: ["Money", "Home"],
    focus: false,
  },
  {
    headline: "Move before dinner tonight",
    reasoning: "Your back has been better on days you move in late afternoon. Day four of the pattern.",
    dims: ["Body", "Joy"],
    focus: false,
  },
];

/* ─── Schools of thought / frameworks ─── */
const FRAMEWORKS = [
  { name: "Systems Thinking", origin: "Meadows, Senge" },
  { name: "Holonic Philosophy", origin: "Koestler" },
  { name: "Capital Theory", origin: "Bourdieu" },
  { name: "Behavioral Design", origin: "Fogg, Kahneman" },
  { name: "Ikigai", origin: "Okinawan tradition" },
  { name: "Integral Theory", origin: "Wilber" },
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
                  Wednesday, April 9&ensp;&middot;&ensp;Early Spring&ensp;&middot;&ensp;Day 1
                </p>
              </div>

              {/* Through-line */}
              <div className="px-5 pb-3">
                <div className="border-l-2 border-l-amber-400 pl-3.5 py-0.5">
                  <p className="font-serif text-ink-600 italic" style={{ fontSize: "0.88rem", lineHeight: 1.5 }}>
                    The garden and the budget are the same project today.
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

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const reveal = (idx: number) => ({
    ref: setRef(idx),
    className: mounted && !reduced ? "landing-reveal" : "",
    style: !reduced ? ({ opacity: mounted ? undefined : 0 } as React.CSSProperties) : undefined,
  });

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

          <div className="flex items-center gap-6">
            <button
              onClick={() => scrollTo("how-it-works")}
              className="hidden sm:block font-sans text-earth-400 hover:text-ink-700 cursor-pointer"
              style={{ fontSize: "0.84rem", fontWeight: 400, transition: reduced ? "none" : "color 200ms" }}
            >
              How it works
            </button>
            <button
              onClick={() => scrollTo("foundations")}
              className="hidden sm:block font-sans text-earth-400 hover:text-ink-700 cursor-pointer"
              style={{ fontSize: "0.84rem", fontWeight: 400, transition: reduced ? "none" : "color 200ms" }}
            >
              Foundations
            </button>
            <button
              onClick={go}
              className="font-sans font-medium text-sand-50 bg-sage-700 hover:bg-sage-600 rounded-full px-5 py-2 cursor-pointer"
              style={{ fontSize: "0.84rem", transition: reduced ? "none" : "all 200ms cubic-bezier(0.22, 1, 0.36, 1)" }}
            >
              Get started
            </button>
          </div>
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
                Your whole life.
                <br />
                One model.
                <br />
                <span className="text-sage-600">Daily clarity.</span>
              </h1>

              <p
                className="font-sans text-earth-500 mb-8 max-w-[420px]"
                style={{ fontSize: "1.05rem", fontWeight: 300, lineHeight: 1.7 }}
              >
                HUMA holds your full context &mdash; money, health, home, family, goals &mdash; and each morning tells you the five things that matter most, with a reason why.
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

      {/* ═══ DIMENSION STRIP ═══ */}
      <section className="border-y border-sand-200 bg-white">
        <div className="max-w-[1120px] mx-auto px-6 py-6">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
            {DIMS.map((d) => (
              <span key={d.name} className="inline-flex items-center gap-2 font-sans text-earth-500" style={{ fontSize: "0.82rem", fontWeight: 400 }}>
                <span className="w-2 h-2 rounded-full" style={{ background: d.color, opacity: 0.75 }} />
                {d.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — Numbered explainer ═══ */}
      <section id="how-it-works" className="px-6 py-24 md:py-32 bg-sand-50">
        <div className="max-w-[1000px] mx-auto">
          <p
            {...reveal(0)}
            className={`font-sans text-sage-600 mb-3 ${reveal(0).className}`}
            style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", ...reveal(0).style }}
          >
            How it works
          </p>
          <h2
            {...reveal(1)}
            className={`font-serif text-ink-900 mb-20 max-w-[500px] ${reveal(1).className}`}
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 400, lineHeight: 1.2, ...reveal(1).style }}
          >
            Five minutes to your first briefing.
          </h2>

          {/* ── #01 The Conversation ── */}
          <div
            ref={setRef(2)}
            className={`grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-10 md:gap-16 mb-24 ${mounted && !reduced ? "landing-reveal" : ""}`}
            style={!reduced ? { opacity: mounted ? undefined : 0 } : undefined}
          >
            <div>
              <p className="font-sans text-sage-600 mb-2" style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em" }}>
                #01 / THE CONVERSATION
              </p>
              <h3 className="font-serif text-ink-900 mb-3" style={{ fontSize: "1.5rem", fontWeight: 400, lineHeight: 1.2 }}>
                Talk. Don&apos;t fill out forms.
              </h3>
              <p className="font-sans text-earth-500 mb-4" style={{ fontSize: "0.92rem", fontWeight: 300, lineHeight: 1.7 }}>
                Tell HUMA what&apos;s going on like you&apos;d tell a sharp friend who remembers everything. Your budget stress, the garden project, the kid&apos;s schedule, the back pain &mdash; all of it matters, and none of it requires a dropdown menu.
              </p>
              <p className="font-sans text-earth-400" style={{ fontSize: "0.85rem", fontWeight: 300, lineHeight: 1.65 }}>
                As you talk, HUMA extracts context across eight dimensions of your life. You&apos;ll see your profile building in real time &mdash; no data entry, no onboarding wizard.
              </p>
            </div>
            {/* Visual: conversation snippet */}
            <div
              className="rounded-xl border border-sand-200 bg-white p-5 space-y-3"
              style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}
            >
              {[
                { role: "huma", text: "What\u2019s on your mind today?" },
                { role: "user", text: "Budget is tight until the 15th and I need to order garden soil before the weekend." },
                { role: "huma", text: "Got it. How much are you looking at for soil, and is the weekend a hard deadline?" },
              ].map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-3.5 py-2 rounded-2xl font-sans ${
                      msg.role === "user" ? "bg-sage-50 text-ink-800" : "bg-sand-100 text-ink-700"
                    }`}
                    style={{ fontSize: "0.82rem", lineHeight: 1.5 }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {/* Context extraction indicator */}
              <div className="pt-2 border-t border-sand-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-500" style={{ opacity: 0.6 }} />
                <span className="font-sans text-earth-300" style={{ fontSize: "0.7rem" }}>
                  Context captured: <span className="text-earth-500">Money</span>, <span className="text-earth-500">Home</span>
                </span>
              </div>
            </div>
          </div>

          {/* ── #02 The Map ── */}
          <div
            ref={setRef(3)}
            className={`grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-10 md:gap-16 mb-24 ${mounted && !reduced ? "landing-reveal" : ""}`}
            style={!reduced ? { opacity: mounted ? undefined : 0 } : undefined}
          >
            <div className="md:order-2">
              <p className="font-sans text-sage-600 mb-2" style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em" }}>
                #02 / THE MAP
              </p>
              <h3 className="font-serif text-ink-900 mb-3" style={{ fontSize: "1.5rem", fontWeight: 400, lineHeight: 1.2 }}>
                Eight dimensions. One picture.
              </h3>
              <p className="font-sans text-earth-500 mb-4" style={{ fontSize: "0.92rem", fontWeight: 300, lineHeight: 1.7 }}>
                HUMA doesn&apos;t silo your life into separate apps. It maps everything onto eight dimensions &mdash; Body, People, Money, Home, Growth, Joy, Purpose, Identity &mdash; and shows you how they connect.
              </p>
              <p className="font-sans text-earth-400" style={{ fontSize: "0.85rem", fontWeight: 300, lineHeight: 1.65 }}>
                The garden project touches Home and Money. Your back pain connects Body to Joy (because you skip movement when it flares). HUMA sees these chains and accounts for them.
              </p>
            </div>
            {/* Visual: dimension map */}
            <div
              className="rounded-xl border border-sand-200 bg-white p-6 md:order-1"
              style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}
            >
              <div className="space-y-2.5">
                {DIMS.map((d) => (
                  <div key={d.name} className="flex items-start gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                      style={{ background: d.color, opacity: 0.8 }}
                    />
                    <div>
                      <p className="font-sans text-ink-700" style={{ fontSize: "0.82rem", fontWeight: 500 }}>
                        {d.name}
                      </p>
                      <p className="font-sans text-earth-400" style={{ fontSize: "0.75rem", fontWeight: 300, lineHeight: 1.45 }}>
                        {d.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── #03 The Briefing ── */}
          <div
            ref={setRef(4)}
            className={`grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-10 md:gap-16 ${mounted && !reduced ? "landing-reveal" : ""}`}
            style={!reduced ? { opacity: mounted ? undefined : 0 } : undefined}
          >
            <div>
              <p className="font-sans text-sage-600 mb-2" style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em" }}>
                #03 / THE BRIEFING
              </p>
              <h3 className="font-serif text-ink-900 mb-3" style={{ fontSize: "1.5rem", fontWeight: 400, lineHeight: 1.2 }}>
                Five actions. Each with a reason.
              </h3>
              <p className="font-sans text-earth-500 mb-4" style={{ fontSize: "0.92rem", fontWeight: 300, lineHeight: 1.7 }}>
                Every morning, HUMA compiles a production sheet &mdash; not a generic to-do list, but five specific actions grounded in your full context. Budget, season, patterns, constraints &mdash; all factored.
              </p>
              <p className="font-sans text-earth-400" style={{ fontSize: "0.85rem", fontWeight: 300, lineHeight: 1.65 }}>
                Each action comes with a reason why it matters today. You can check things off, push back, or update your context. The system learns and adapts.
              </p>
            </div>
            {/* Visual: briefing snippet */}
            <div
              className="rounded-xl border border-sand-200 bg-white overflow-hidden"
              style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}
            >
              <div className="px-5 pt-4 pb-2">
                <p className="font-sans text-earth-400" style={{ fontSize: "0.68rem", fontWeight: 500, letterSpacing: "0.02em" }}>
                  Wednesday, April 9&ensp;&middot;&ensp;Day 23
                </p>
              </div>
              <div className="px-5 pb-3">
                <div className="border-l-2 border-l-amber-400 pl-3 py-0.5">
                  <p className="font-serif text-ink-600 italic" style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>
                    The garden and the budget are the same project today.
                  </p>
                </div>
              </div>
              <div className="mx-5 border-t border-sand-100" />
              {BRIEFING.map((entry, i) => (
                <div key={i} className={`px-5 py-3 ${i < BRIEFING.length - 1 ? "border-b border-sand-50" : ""}`}>
                  {entry.focus && (
                    <p className="font-sans text-amber-600 mb-0.5" style={{ fontSize: "0.55rem", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                      Focus
                    </p>
                  )}
                  <p className={`font-serif leading-snug mb-0.5 ${entry.focus ? "text-ink-900 text-[14px] font-medium" : "text-ink-800 text-[13.5px]"}`}>
                    {entry.headline}
                  </p>
                  <p className="font-sans text-earth-400" style={{ fontSize: "0.74rem", fontWeight: 300, lineHeight: 1.45 }}>
                    {entry.reasoning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHAT MAKES IT DIFFERENT ═══ */}
      <section className="px-6 py-24 md:py-32 bg-white border-y border-sand-200">
        <div className="max-w-[1000px] mx-auto">
          <p
            {...reveal(5)}
            className={`font-sans text-sage-600 mb-3 ${reveal(5).className}`}
            style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", ...reveal(5).style }}
          >
            Not another productivity app
          </p>
          <h2
            {...reveal(6)}
            className={`font-serif text-ink-900 mb-14 max-w-[480px] ${reveal(6).className}`}
            style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 400, lineHeight: 1.2, ...reveal(6).style }}
          >
            It reasons about your life.
            <br />
            <span className="text-earth-400">It doesn&apos;t just organize it.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "It remembers everything",
                desc: "Your freezer inventory. Your kid\u2019s schedule. The budget constraint from three weeks ago. HUMA holds your full context and uses all of it, every morning.",
                border: "#3A5A40",
              },
              {
                title: "It sees connections",
                desc: "The garden affects the budget. The budget affects stress. Stress affects whether you move. HUMA traces the chain and plans around it.",
                border: "#2E6B8A",
              },
              {
                title: "It learns your rhythm",
                desc: "After a week, it notices you\u2019re a night person. It flags when a dimension goes dormant. It adapts without you configuring anything.",
                border: "#C87A3A",
              },
            ].map((item, i) => (
              <div
                key={i}
                ref={setRef(i + 7)}
                className={`${mounted && !reduced ? "landing-reveal" : ""}`}
                style={!reduced ? { opacity: mounted ? undefined : 0 } : undefined}
              >
                <div className="w-full h-[3px] rounded-full mb-5" style={{ background: item.border, opacity: 0.5 }} />
                <p className="font-serif text-ink-900 mb-2" style={{ fontSize: "1.1rem", fontWeight: 500, lineHeight: 1.3 }}>
                  {item.title}
                </p>
                <p className="font-sans text-earth-500" style={{ fontSize: "0.88rem", fontWeight: 300, lineHeight: 1.7 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOUNDATIONS ═══ */}
      <section id="foundations" className="px-6 py-24 md:py-32 bg-sand-50">
        <div className="max-w-[800px] mx-auto">
          <div
            ref={setRef(10)}
            className={`${mounted && !reduced ? "landing-reveal" : ""}`}
            style={!reduced ? { opacity: mounted ? undefined : 0 } : undefined}
          >
            <p className="font-sans text-sage-600 mb-3" style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase" }}>
              Standing on the shoulders of giants
            </p>
            <h2 className="font-serif text-ink-900 mb-4" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 400, lineHeight: 1.2 }}>
              Built on frameworks that have stood
              <br className="hidden md:block" />
              the test of time.
            </h2>
            <p className="font-sans text-earth-500 mb-12 max-w-[560px]" style={{ fontSize: "0.95rem", fontWeight: 300, lineHeight: 1.7 }}>
              HUMA doesn&apos;t invent a new philosophy. It synthesizes established schools of thought into a system that fits in your pocket and works every morning.
            </p>
          </div>

          <div
            ref={setRef(11)}
            className={`grid grid-cols-2 md:grid-cols-3 gap-4 mb-16 ${mounted && !reduced ? "landing-reveal" : ""}`}
            style={!reduced ? { opacity: mounted ? undefined : 0 } : undefined}
          >
            {FRAMEWORKS.map((f) => (
              <div key={f.name} className="py-4 px-5 rounded-lg border border-sand-200 bg-white">
                <p className="font-serif text-ink-800 mb-0.5" style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                  {f.name}
                </p>
                <p className="font-sans text-earth-300" style={{ fontSize: "0.75rem", fontWeight: 300 }}>
                  {f.origin}
                </p>
              </div>
            ))}
          </div>

          <div
            ref={setRef(12)}
            className={`flex flex-col md:flex-row items-start md:items-center gap-3 pt-8 border-t border-sand-200 ${mounted && !reduced ? "landing-reveal" : ""}`}
            style={!reduced ? { opacity: mounted ? undefined : 0 } : undefined}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-sage-500 shrink-0 mt-1 md:mt-0" style={{ opacity: 0.6 }} />
            <p className="font-sans text-earth-400" style={{ fontSize: "0.88rem", fontWeight: 300, lineHeight: 1.6 }}>
              Built with love in Northern Michigan.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section className="px-6 py-24 md:py-32 bg-white border-t border-sand-200">
        <div
          ref={setRef(13)}
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
            &copy; {new Date().getFullYear()} HUMA &middot; NoMi, Michigan
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
