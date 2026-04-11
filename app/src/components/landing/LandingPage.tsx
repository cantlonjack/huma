"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/* ─── Dimension config ─── */
const DIMS: { name: string; color: string; label: string; icon: string }[] = [
  { name: "Body", color: "#3A5A40", label: "Back has been better on afternoon-movement days", icon: "M12 3c-1.5 2-4 4-4 7s2 5 4 7c2-2 4-4 4-7s-2.5-5-4-7z" },
  { name: "People", color: "#2E6B8A", label: "Kids need pickup by 3:30 on Tuesdays", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" },
  { name: "Money", color: "#B5621E", label: "Budget tight until the 15th", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" },
  { name: "Home", color: "#8C8274", label: "Garden beds need layout before soil order", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
  { name: "Growth", color: "#2A4A30", label: "Reading 20min/day streak — 11 days", icon: "M12 20V10M18 20V4M6 20v-4" },
  { name: "Joy", color: "#C87A3A", label: "Haven't played guitar since last Thursday", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  { name: "Purpose", color: "#6B5A7A", label: "Side project blocked on API decision", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
  { name: "Identity", color: "#554D42", label: "Morning person shifting to early riser", icon: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" },
];

/* ─── Dimension connections (which dimensions link to each other) ─── */
const DIM_CONNECTIONS = [
  [0, 5], // Body ↔ Joy
  [0, 4], // Body ↔ Growth
  [1, 3], // People ↔ Home
  [1, 5], // People ↔ Joy
  [2, 3], // Money ↔ Home
  [2, 6], // Money ↔ Purpose
  [3, 7], // Home ↔ Identity
  [4, 6], // Growth ↔ Purpose
  [5, 7], // Joy ↔ Identity
  [6, 7], // Purpose ↔ Identity
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
  { name: "Systems Thinking", origin: "Meadows, Senge", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
  { name: "Holonic Philosophy", origin: "Koestler", icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 16a4 4 0 100-8 4 4 0 000 8z" },
  { name: "Capital Theory", origin: "Bourdieu", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" },
  { name: "Behavioral Design", origin: "Fogg, Kahneman", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0" },
  { name: "Ikigai", origin: "Okinawan tradition", icon: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" },
  { name: "Integral Theory", origin: "Wilber", icon: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" },
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
/*  DIMENSION CONSTELLATION — Interactive SVG visualization      */
/* ══════════════════════════════════════════════════════════════ */

function DimensionConstellation({ reduced, mounted }: { reduced: boolean; mounted: boolean }) {
  const [hoveredDim, setHoveredDim] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || reduced) { setIsVisible(true); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setIsVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [reduced]);

  const cx = 220, cy = 220, radius = 155;
  const points = DIMS.map((d, i) => {
    const angle = (i * 45 - 90) * (Math.PI / 180);
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle), ...d, idx: i };
  });

  const isConnected = (dimIdx: number) =>
    hoveredDim !== null && DIM_CONNECTIONS.some(([a, b]) => (a === hoveredDim && b === dimIdx) || (b === hoveredDim && a === dimIdx));

  return (
    <div ref={containerRef} className="flex justify-center">
      <div className="relative w-full" style={{ maxWidth: 440 }}>
        <svg viewBox="0 0 440 440" className="w-full h-auto">
          {/* Background circles */}
          <circle cx={cx} cy={cy} r={radius + 30} fill="none" stroke="var(--color-sand-200)" strokeWidth="0.5" strokeDasharray="4 4" opacity={0.5} />
          <circle cx={cx} cy={cy} r={radius * 0.5} fill="none" stroke="var(--color-sand-200)" strokeWidth="0.5" strokeDasharray="4 4" opacity={0.3} />

          {/* Connection lines */}
          {DIM_CONNECTIONS.map(([a, b], i) => {
            const pa = points[a], pb = points[b];
            const active = hoveredDim !== null && (a === hoveredDim || b === hoveredDim);
            return (
              <line
                key={`conn-${i}`}
                x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke={active ? points[hoveredDim!].color : "var(--color-sand-300)"}
                strokeWidth={active ? 2 : 1}
                opacity={isVisible ? (hoveredDim === null ? 0.35 : active ? 0.7 : 0.1) : 0}
                style={{
                  transition: reduced ? "none" : "all 400ms cubic-bezier(0.22, 1, 0.36, 1)",
                  transitionDelay: !reduced && isVisible && hoveredDim === null ? `${i * 60}ms` : "0ms",
                }}
              />
            );
          })}

          {/* Center label */}
          <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--color-earth-400)" fontSize="9" fontFamily="var(--font-sans)" fontWeight="500" letterSpacing="0.15em">
            YOUR
          </text>
          <text x={cx} y={cy + 8} textAnchor="middle" fill="var(--color-earth-400)" fontSize="9" fontFamily="var(--font-sans)" fontWeight="500" letterSpacing="0.15em">
            LIFE
          </text>
          <circle cx={cx} cy={cy} r={22} fill="none" stroke="var(--color-sand-300)" strokeWidth="1" opacity={0.5} />

          {/* Dimension nodes */}
          {points.map((p, i) => {
            const isHovered = hoveredDim === i;
            const connected = isConnected(i);
            const dimmed = hoveredDim !== null && !isHovered && !connected;
            return (
              <g
                key={p.name}
                onMouseEnter={() => setHoveredDim(i)}
                onMouseLeave={() => setHoveredDim(null)}
                style={{
                  cursor: "pointer",
                  opacity: isVisible ? (dimmed ? 0.3 : 1) : 0,
                  transition: reduced ? "none" : `opacity 400ms ease ${i * 80}ms, transform 400ms ease`,
                }}
              >
                {/* Outer glow ring */}
                <circle
                  cx={p.x} cy={p.y}
                  r={isHovered ? 36 : 30}
                  fill={p.color}
                  opacity={isHovered ? 0.08 : 0.04}
                  style={{ transition: reduced ? "none" : "all 300ms ease" }}
                />
                {/* Main circle */}
                <circle
                  cx={p.x} cy={p.y}
                  r={isHovered ? 22 : 18}
                  fill="white"
                  stroke={p.color}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  opacity={isHovered ? 1 : 0.9}
                  style={{ transition: reduced ? "none" : "all 300ms cubic-bezier(0.22, 1, 0.36, 1)" }}
                />
                {/* Icon inside circle */}
                <g transform={`translate(${p.x - 8}, ${p.y - 8}) scale(0.667)`}>
                  <path
                    d={p.icon}
                    fill="none"
                    stroke={p.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={isHovered ? 1 : 0.7}
                    style={{ transition: reduced ? "none" : "opacity 300ms ease" }}
                  />
                </g>
                {/* Label */}
                <text
                  x={p.x}
                  y={p.y + (isHovered ? 36 : 32)}
                  textAnchor="middle"
                  fill={isHovered ? p.color : "var(--color-earth-500)"}
                  fontSize={isHovered ? "11" : "10"}
                  fontFamily="var(--font-sans)"
                  fontWeight={isHovered ? "600" : "500"}
                  style={{ transition: reduced ? "none" : "all 300ms ease" }}
                >
                  {p.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover detail card */}
        {hoveredDim !== null && (
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-0 bg-white rounded-lg border border-sand-200 px-4 py-3 pointer-events-none"
            style={{
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              animation: !reduced ? "msg-in 250ms cubic-bezier(0.22,1,0.36,1) both" : "none",
              maxWidth: 280,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ background: DIMS[hoveredDim].color }} />
              <span className="font-sans text-ink-800" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                {DIMS[hoveredDim].name}
              </span>
            </div>
            <p className="font-sans text-earth-400" style={{ fontSize: "0.75rem", fontWeight: 300, lineHeight: 1.45 }}>
              {DIMS[hoveredDim].label}
            </p>
          </div>
        )}
      </div>
    </div>
  );
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
        <div className="max-w-[1120px] mx-auto px-6 py-5">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-3">
            {DIMS.map((d) => (
              <span
                key={d.name}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sand-200 font-sans text-earth-600"
                style={{ fontSize: "0.78rem", fontWeight: 500 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={d.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.75">
                  <path d={d.icon} />
                </svg>
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
              <div className="pt-3 border-t border-sand-100">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span className="font-sans text-earth-400" style={{ fontSize: "0.7rem", fontWeight: 500 }}>
                    Context extracted
                  </span>
                </div>
                <div className="flex gap-2">
                  {[
                    { name: "Money", color: "#B5621E" },
                    { name: "Home", color: "#8C8274" },
                  ].map((d) => (
                    <span key={d.name} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sand-50 border border-sand-200">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: d.color }} />
                      <span className="font-sans text-earth-500" style={{ fontSize: "0.68rem", fontWeight: 500 }}>{d.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── #02 The Map ── */}
          <div
            ref={setRef(3)}
            className={`mb-24 ${mounted && !reduced ? "landing-reveal" : ""}`}
            style={!reduced ? { opacity: mounted ? undefined : 0 } : undefined}
          >
            <div className="text-center mb-10">
              <p className="font-sans text-sage-600 mb-2" style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em" }}>
                #02 / THE MAP
              </p>
              <h3 className="font-serif text-ink-900 mb-3" style={{ fontSize: "1.5rem", fontWeight: 400, lineHeight: 1.2 }}>
                Eight dimensions. One picture.
              </h3>
              <p className="font-sans text-earth-500 max-w-[540px] mx-auto" style={{ fontSize: "0.92rem", fontWeight: 300, lineHeight: 1.7 }}>
                HUMA doesn&apos;t silo your life into separate apps. It maps everything onto eight dimensions and shows you how they connect.
              </p>
            </div>

            {/* Interactive constellation */}
            <DimensionConstellation reduced={reduced} mounted={mounted} />

            <p className="font-sans text-earth-400 text-center mt-8 max-w-[480px] mx-auto" style={{ fontSize: "0.85rem", fontWeight: 300, lineHeight: 1.65 }}>
              The garden project touches Home and Money. Your back pain connects Body to Joy. HUMA sees these chains and plans around them.
            </p>
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
                color: "#3A5A40",
                icon: (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3A5A40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 110 20 10 10 0 010-20z" opacity="0.15" fill="#3A5A40" />
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                    <circle cx="12" cy="12" r="2" fill="#3A5A40" opacity="0.3" />
                  </svg>
                ),
              },
              {
                title: "It sees connections",
                desc: "The garden affects the budget. The budget affects stress. Stress affects whether you move. HUMA traces the chain and plans around it.",
                color: "#2E6B8A",
                icon: (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2E6B8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="6" cy="6" r="3" />
                    <circle cx="18" cy="6" r="3" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="18" r="3" />
                    <line x1="8.5" y1="7.5" x2="15.5" y2="16.5" />
                    <line x1="15.5" y1="7.5" x2="8.5" y2="16.5" />
                    <line x1="6" y1="9" x2="6" y2="15" />
                    <line x1="18" y1="9" x2="18" y2="15" />
                  </svg>
                ),
              },
              {
                title: "It learns your rhythm",
                desc: "After a week, it notices you\u2019re a night person. It flags when a dimension goes dormant. It adapts without you configuring anything.",
                color: "#C87A3A",
                icon: (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C87A3A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 17l3-3 4 4 6-8 5 5" />
                    <circle cx="20" cy="15" r="2" fill="#C87A3A" opacity="0.3" />
                    <path d="M2 21h20" opacity="0.3" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div
                key={i}
                ref={setRef(i + 7)}
                className={`rounded-xl border border-sand-200 bg-sand-50 p-6 ${mounted && !reduced ? "landing-reveal" : ""}`}
                style={!reduced ? { opacity: mounted ? undefined : 0 } : undefined}
              >
                <div className="mb-4">{item.icon}</div>
                <div className="w-8 h-[2px] rounded-full mb-4" style={{ background: item.color, opacity: 0.5 }} />
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
              <div key={f.name} className="py-4 px-5 rounded-lg border border-sand-200 bg-white flex items-start gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" opacity="0.6">
                  <path d={f.icon} />
                </svg>
                <div>
                  <p className="font-serif text-ink-800 mb-0.5" style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                    {f.name}
                  </p>
                  <p className="font-sans text-earth-300" style={{ fontSize: "0.75rem", fontWeight: 300 }}>
                    {f.origin}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div
            ref={setRef(12)}
            className={`flex flex-col md:flex-row items-start md:items-center gap-3 pt-8 border-t border-sand-200 ${mounted && !reduced ? "landing-reveal" : ""}`}
            style={!reduced ? { opacity: mounted ? undefined : 0 } : undefined}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 md:mt-0" opacity="0.5">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
            </svg>
            <p className="font-sans text-earth-400" style={{ fontSize: "0.88rem", fontWeight: 300, lineHeight: 1.6 }}>
              Proudly created in the Great Lake State.
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
            &copy; {new Date().getFullYear()} HUMA
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
