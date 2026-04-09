"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/* ─── Dimension colors (fill hex values for SVG) ─── */
const DIMS = [
  { name: "Body",     fill: "#3A5A40", light: "#EBF3EC" },
  { name: "People",   fill: "#2E6B8A", light: "#E8F2F7" },
  { name: "Money",    fill: "#B5621E", light: "#FFF4EC" },
  { name: "Home",     fill: "#8C8274", light: "#EDE6D8" },
  { name: "Growth",   fill: "#2A4A30", light: "#E0EDE1" },
  { name: "Joy",      fill: "#C87A3A", light: "#FFF8F0" },
  { name: "Purpose",  fill: "#6B5A7A", light: "#EDE8F2" },
  { name: "Identity", fill: "#554D42", light: "#F6F1E9" },
];

/* ─── Dimension tag for sheet entries ─── */
const DIM_STYLE: Record<string, { bg: string; border: string; text: string }> = {
  Body:    { bg: "bg-sage-50",   border: "border-sage-200",   text: "text-sage-700" },
  Home:    { bg: "bg-sand-200",  border: "border-sand-300",   text: "text-earth-600" },
  Money:   { bg: "bg-amber-100", border: "border-amber-200",  text: "text-amber-700" },
  People:  { bg: "bg-[#E8F2F7]", border: "border-[#C8DEE8]",  text: "text-[#2E6B8A]" },
  Joy:     { bg: "bg-[#FFF8F0]", border: "border-[#F0DCC8]",  text: "text-amber-600" },
  Growth:  { bg: "bg-sage-100",  border: "border-sage-300",   text: "text-sage-800" },
  Purpose: { bg: "bg-[#EDE8F2]", border: "border-[#D5CDE0]",  text: "text-[#6B5A7A]" },
  Identity:{ bg: "bg-sand-100",  border: "border-sand-300",   text: "text-ink-600" },
};

function DimTag({ name }: { name: string }) {
  const s = DIM_STYLE[name] ?? DIM_STYLE.Body;
  return (
    <span className={`inline-block font-sans text-[11px] font-medium leading-none rounded-full px-2.5 py-1 border ${s.bg} ${s.border} ${s.text}`}>
      {name}
    </span>
  );
}

/* ═══════════════════════════════════════════
   SVG: Dimension Constellation
   8 dimension dots with organic connections.
   The visual identity of "the whole picture."
═══════════════════════════════════════════ */
function DimensionConstellation({ reduced }: { reduced: boolean }) {
  // Positions arranged in a loose organic cluster, not a perfect circle
  const nodes = [
    { x: 150, y: 62,  r: 7,  dim: 0 }, // Body — top
    { x: 218, y: 88,  r: 5,  dim: 1 }, // People — top right
    { x: 245, y: 150, r: 6,  dim: 2 }, // Money — right
    { x: 215, y: 212, r: 5,  dim: 3 }, // Home — bottom right
    { x: 150, y: 238, r: 7,  dim: 4 }, // Growth — bottom
    { x: 82,  y: 210, r: 5,  dim: 5 }, // Joy — bottom left
    { x: 55,  y: 148, r: 6,  dim: 6 }, // Purpose — left
    { x: 85,  y: 88,  r: 5,  dim: 7 }, // Identity — top left
  ];

  // Organic connections (not every node to every node — selective)
  const edges = [
    [0, 1], [0, 7], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7],
    [0, 4], [1, 5], [2, 6], [3, 7], // cross connections
  ];

  return (
    <svg
      viewBox="0 0 300 300"
      className="w-[220px] h-[220px] md:w-[280px] md:h-[280px] mx-auto"
      aria-hidden="true"
    >
      {/* Connection lines */}
      {edges.map(([a, b], i) => {
        const na = nodes[a], nb = nodes[b];
        // Slight curve via quadratic bezier through center offset
        const mx = (na.x + nb.x) / 2 + (i % 2 === 0 ? 8 : -8);
        const my = (na.y + nb.y) / 2 + (i % 3 === 0 ? 6 : -6);
        return (
          <path
            key={`e${i}`}
            d={`M${na.x},${na.y} Q${mx},${my} ${nb.x},${nb.y}`}
            fill="none"
            stroke="#A8C4AA"
            strokeWidth="1"
            opacity="0.3"
            className={!reduced ? "landing-line" : ""}
            style={!reduced ? { animationDelay: `${i * 80}ms` } : undefined}
          />
        );
      })}

      {/* Dimension dots */}
      {nodes.map((n, i) => (
        <g key={`n${i}`}>
          {/* Glow ring */}
          <circle
            cx={n.x} cy={n.y} r={n.r + 8}
            fill={DIMS[n.dim].light}
            opacity="0.5"
            className={!reduced ? "landing-glow" : ""}
            style={!reduced ? { animationDelay: `${i * 150}ms` } : undefined}
          />
          {/* Core dot */}
          <circle
            cx={n.x} cy={n.y} r={n.r}
            fill={DIMS[n.dim].fill}
            opacity="0.8"
            className={!reduced ? "landing-dot" : ""}
            style={!reduced ? { animationDelay: `${i * 100 + 200}ms` } : undefined}
          />
          {/* Label */}
          <text
            x={n.x} y={n.y + n.r + 14}
            textAnchor="middle"
            fill="#A89E90"
            fontSize="8"
            fontFamily="var(--font-sans)"
            fontWeight="500"
            letterSpacing="0.05em"
          >
            {DIMS[n.dim].name}
          </text>
        </g>
      ))}

      {/* Center essence dot — the "you" */}
      <circle
        cx="150" cy="150" r="3"
        fill="#B5621E"
        opacity="0.6"
        className={!reduced ? "landing-breathe" : ""}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   SVG: Growth Diagrams for the 3 beats
   Day 1: sparse dots
   Week 2: dots with some connections
   Month 2: dense connected pattern
═══════════════════════════════════════════ */
function GrowthDiagram({ stage }: { stage: 0 | 1 | 2 }) {
  const configs = [
    // Day 1: 3 dots, 1 connection
    {
      dots: [
        { x: 24, y: 30, r: 4, c: "#3A5A40" },
        { x: 46, y: 22, r: 3, c: "#B5621E" },
        { x: 36, y: 46, r: 3, c: "#2E6B8A" },
      ],
      lines: [[0, 2]],
    },
    // Week 2: 5 dots, 4 connections
    {
      dots: [
        { x: 18, y: 26, r: 4, c: "#3A5A40" },
        { x: 42, y: 18, r: 3, c: "#B5621E" },
        { x: 52, y: 38, r: 4, c: "#2E6B8A" },
        { x: 30, y: 48, r: 3, c: "#C87A3A" },
        { x: 12, y: 44, r: 3, c: "#6B5A7A" },
      ],
      lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
    },
    // Month 2: 8 dots, 10 connections — the full picture
    {
      dots: [
        { x: 30, y: 12, r: 4, c: "#3A5A40" },
        { x: 50, y: 16, r: 3, c: "#2E6B8A" },
        { x: 56, y: 32, r: 3, c: "#B5621E" },
        { x: 50, y: 48, r: 3, c: "#8C8274" },
        { x: 30, y: 52, r: 4, c: "#2A4A30" },
        { x: 12, y: 46, r: 3, c: "#C87A3A" },
        { x: 8,  y: 30, r: 3, c: "#6B5A7A" },
        { x: 16, y: 16, r: 3, c: "#554D42" },
      ],
      lines: [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
        [0, 4], [2, 6],
      ],
    },
  ];

  const c = configs[stage];

  return (
    <svg viewBox="0 0 64 64" className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-3" aria-hidden="true">
      {c.lines.map(([a, b], i) => (
        <line
          key={i}
          x1={c.dots[a].x} y1={c.dots[a].y}
          x2={c.dots[b].x} y2={c.dots[b].y}
          stroke="#A8C4AA"
          strokeWidth="0.8"
          opacity="0.4"
        />
      ))}
      {c.dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.c} opacity="0.7" />
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════
   SVG: Contrast diagrams for differentiation
═══════════════════════════════════════════ */
function ContrastDiagram({ type }: { type: "tracker" | "todo" | "chatbot" }) {
  if (type === "tracker") {
    // Flat checkboxes — lifeless
    return (
      <svg viewBox="0 0 80 48" className="w-20 h-12 mx-auto mb-3 opacity-30" aria-hidden="true">
        {[0, 1, 2, 3].map(i => (
          <g key={i}>
            <rect x="8" y={4 + i * 11} width="8" height="8" rx="1.5" fill="none" stroke="#A89E90" strokeWidth="1" />
            <rect x="22" y={6 + i * 11} width={30 + (i % 2) * 10} height="4" rx="2" fill="#DDD4C0" />
          </g>
        ))}
      </svg>
    );
  }
  if (type === "todo") {
    // Disconnected items
    return (
      <svg viewBox="0 0 80 48" className="w-20 h-12 mx-auto mb-3 opacity-30" aria-hidden="true">
        {[0, 1, 2].map(i => (
          <g key={i}>
            <circle cx="12" cy={10 + i * 14} r="3" fill="none" stroke="#A89E90" strokeWidth="1" />
            <rect x="22" y={8 + i * 14} width={35 + i * 5} height="4" rx="2" fill="#DDD4C0" />
          </g>
        ))}
      </svg>
    );
  }
  // chatbot — fading messages
  return (
    <svg viewBox="0 0 80 48" className="w-20 h-12 mx-auto mb-3 opacity-30" aria-hidden="true">
      {[0, 1, 2].map(i => (
        <rect
          key={i}
          x={i % 2 === 0 ? 6 : 24}
          y={4 + i * 15}
          width={i % 2 === 0 ? 50 : 44}
          height="10"
          rx="5"
          fill="#DDD4C0"
          opacity={1 - i * 0.3}
        />
      ))}
    </svg>
  );
}

/* ─── Static example sheet data ─── */
const EXAMPLE_ENTRIES = [
  {
    headline: "Map out the raised bed layout",
    detail: "You said 6 beds but only 3 get morning sun. Start with those — sketch it before ordering soil.",
    dims: ["Home", "Body"],
    trigger: true,
    checked: false,
  },
  {
    headline: "Price out the cattle panel trellis",
    detail: "Tractor Supply has 16ft panels at $32. You need 4 for the bean tunnel. Compare against Tuesday's budget line.",
    dims: ["Money", "Home"],
    trigger: false,
    checked: false,
  },
  {
    headline: "20-minute walk before dinner",
    detail: "Your back has been better on days you move in the late afternoon. This is day four of the streak.",
    dims: ["Body", "Joy"],
    trigger: false,
    checked: true, // one checked to show interactivity
  },
];

/* ─── Scroll reveal ─── */
function useScrollReveal() {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      refs.current.forEach((el) => { if (el) el.style.opacity = "1"; });
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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    refs.current.forEach((el) => { if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [reduced]);

  return (idx: number) => (el: HTMLElement | null) => {
    refs.current[idx] = el;
  };
}

/* ════════════════════════════════════════════════════ */

export default function LandingPage() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const setRef = useScrollReveal();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const go = () => router.push("/start");

  const reveal = (idx: number) => ({
    ref: setRef(idx),
    className: mounted && !reduced ? "landing-reveal" : "",
    style: !reduced ? { opacity: mounted ? undefined : 0 } as React.CSSProperties : undefined,
  });

  return (
    <div className="min-h-screen bg-sand-50 overflow-x-hidden">

      {/* ═══ SECTION 1 — HERO ═══ */}
      <section className="flex flex-col items-center justify-center min-h-[100dvh] px-6 pb-12">
        <div className="max-w-[600px] w-full text-center">

          {/* Wordmark */}
          <h1
            className="font-serif text-ink-900 mb-8"
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.4rem)",
              fontWeight: 400,
              letterSpacing: "0.35em",
              lineHeight: 1,
            }}
          >
            H U M A
          </h1>

          {/* Dimension constellation */}
          <div className="mb-6">
            <DimensionConstellation reduced={reduced} />
          </div>

          {/* The hook */}
          <p
            className="font-serif text-ink-700 mb-4 mx-auto max-w-[520px]"
            style={{
              fontSize: "clamp(1.15rem, 2.2vw, 1.35rem)",
              fontWeight: 400,
              lineHeight: 1.55,
            }}
          >
            You already know what matters. You just can&rsquo;t hold
            all the pieces at once.
          </p>

          {/* UVP */}
          <p
            className="font-sans text-earth-500 mb-10 mx-auto max-w-[460px]"
            style={{ fontSize: "0.95rem", fontWeight: 300, lineHeight: 1.7 }}
          >
            HUMA holds the whole picture&thinsp;&mdash;&thinsp;your money,
            your health, your land, your people&thinsp;&mdash;&thinsp;and
            each morning shows you the few things that actually matter today.
          </p>

          {/* CTA */}
          <button
            onClick={go}
            className="inline-flex items-center justify-center rounded-full bg-amber-600 text-sand-50 font-sans font-medium px-10 py-4 min-h-[48px] cursor-pointer"
            style={{
              fontSize: "1rem",
              letterSpacing: "0.01em",
              boxShadow: "0 4px 24px rgba(181, 98, 30, 0.14)",
              transition: reduced ? "none" : "all 300ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            onMouseEnter={(e) => {
              if (!reduced) {
                e.currentTarget.style.background = "var(--color-amber-500)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(181, 98, 30, 0.2)";
              }
            }}
            onMouseLeave={(e) => {
              if (!reduced) {
                e.currentTarget.style.background = "var(--color-amber-600)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 24px rgba(181, 98, 30, 0.14)";
              }
            }}
          >
            Start with a conversation&ensp;&rarr;
          </button>

          {/* Scroll hint */}
          <div
            className="mt-12 text-earth-300"
            style={{
              fontSize: "0.72rem",
              fontWeight: 400,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            See what it makes
          </div>
        </div>
      </section>


      {/* ═══ SECTION 2 — THE SHEET ═══ */}
      <section className="bg-sand-100 px-5 py-14 md:py-28">
        <div
          {...reveal(0)}
          className={`max-w-[580px] mx-auto ${reveal(0).className}`}
          style={reveal(0).style}
        >
          <p
            className="font-sans text-earth-400 text-center mb-3"
            style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase" }}
          >
            Your morning sheet
          </p>

          <h2
            className="font-serif text-ink-900 text-center mb-8 md:mb-12"
            style={{ fontSize: "clamp(1.35rem, 2.8vw, 1.75rem)", fontWeight: 400, lineHeight: 1.25 }}
          >
            This is what tomorrow morning looks like.
          </h2>

          {/* Sheet card */}
          <div className="rounded-xl border border-sand-300 overflow-hidden" style={{ background: "#FFFFFF" }}>
            {/* Date header */}
            <div className="px-6 pt-6 pb-0 md:px-8 md:pt-8">
              <p className="font-sans text-earth-400" style={{ fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.02em" }}>
                Tuesday, April 8&ensp;&middot;&ensp;Early Spring&ensp;&middot;&ensp;Day 23
              </p>
            </div>

            {/* Through-line */}
            <div className="px-6 pt-4 pb-5 md:px-8">
              <div className="border-l-2 border-l-amber-400 pl-4 py-1">
                <p className="font-serif text-ink-600 italic" style={{ fontSize: "1rem", lineHeight: 1.55 }}>
                  The garden and the budget are the same project today.
                </p>
              </div>
            </div>

            <div className="mx-6 border-t border-sand-200 md:mx-8" />

            {/* Entries */}
            <div className="divide-y divide-sand-100">
              {EXAMPLE_ENTRIES.map((entry, i) => (
                <div
                  key={i}
                  className={`px-6 md:px-8 ${
                    entry.trigger
                      ? "border-l-[3px] border-l-amber-600 bg-sand-50 py-5"
                      : "border-l-[3px] border-l-transparent py-5"
                  }`}
                >
                  {entry.trigger && (
                    <p className="font-sans text-amber-600 mb-1.5" style={{ fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                      The move
                    </p>
                  )}

                  <div className="flex items-start gap-3">
                    {/* Checkbox visual */}
                    <div className="flex-shrink-0 mt-1">
                      {entry.checked ? (
                        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                          <circle cx="9" cy="9" r="8" fill="#3A5A40" opacity="0.15" />
                          <path d="M5.5 9.5L7.5 11.5L12.5 6.5" stroke="#3A5A40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                          <circle cx="9" cy="9" r="8" fill="none" stroke="#DDD4C0" strokeWidth="1.5" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1">
                      <p className={`font-serif leading-snug ${
                        entry.checked
                          ? "text-ink-300 line-through decoration-ink-200"
                          : entry.trigger
                            ? "text-ink-900 text-[18px] font-semibold"
                            : "text-ink-800 text-[16px] font-medium"
                      }`}>
                        {entry.headline}
                      </p>

                      {!entry.checked && (
                        <p className="font-sans text-earth-400 mt-1.5" style={{ fontSize: "0.82rem", fontWeight: 300, lineHeight: 1.6 }}>
                          {entry.detail}
                        </p>
                      )}

                      {!entry.checked && (
                        <div className="flex gap-1.5 mt-2.5">
                          {entry.dims.map((d) => <DimTag key={d} name={d} />)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Capital pulse mini-grid at bottom of sheet */}
            <div className="px-6 py-4 md:px-8 border-t border-sand-200">
              <div className="flex items-center gap-3">
                <p className="font-sans text-earth-300" style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  Moved today
                </p>
                <div className="flex gap-1.5">
                  {["Body", "Home", "Money", "Joy"].map((d) => {
                    const dim = DIMS.find(dd => dd.name === d);
                    return (
                      <div key={d} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: dim?.fill, opacity: 0.7 }} />
                        <span className="font-sans text-earth-400" style={{ fontSize: "0.6rem" }}>{d}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Caption */}
          <div className="mt-8 md:mt-10 text-center">
            <p className="font-serif text-ink-700 mb-2" style={{ fontSize: "1.05rem", fontWeight: 400, lineHeight: 1.6 }}>
              It knows your budget. Your back pain. Your soil. Your&nbsp;season.
            </p>
            <p className="font-sans text-earth-400" style={{ fontSize: "0.85rem", fontWeight: 300, lineHeight: 1.6 }}>
              Because you told it&thinsp;&mdash;&thinsp;through conversation, not forms.
            </p>
          </div>
        </div>
      </section>


      {/* ═══ SECTION 3 — DIFFERENTIATION ═══ */}
      <section className="bg-sand-50 px-6 py-14 md:py-28">
        <div
          {...reveal(1)}
          className={`max-w-[540px] mx-auto ${reveal(1).className}`}
          style={reveal(1).style}
        >
          <p
            className="font-sans text-earth-300 text-center mb-10"
            style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase" }}
          >
            Not another app
          </p>

          <div className="space-y-8">
            {([
              { type: "tracker" as const, not: "A habit tracker counts what you did.", is: "HUMA shows why it mattered, and what to do next." },
              { type: "todo" as const, not: "A to-do list holds tasks.", is: "HUMA holds your whole context and connects the tasks to what\u2019s actually moving." },
              { type: "chatbot" as const, not: "A chatbot forgets.", is: "HUMA remembers your freezer inventory, your budget, your kid's school schedule, and uses all of it — every morning." },
            ]).map((pair, i) => (
              <div key={i} className="text-center">
                <ContrastDiagram type={pair.type} />
                <p
                  className="font-sans text-earth-300 mb-1"
                  style={{ fontSize: "0.88rem", fontWeight: 300, lineHeight: 1.6, textDecoration: "line-through", textDecorationColor: "var(--color-sand-300)" }}
                >
                  {pair.not}
                </p>
                <p className="font-sans text-ink-700" style={{ fontSize: "0.92rem", fontWeight: 400, lineHeight: 1.6 }}>
                  {pair.is}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══ SECTION 4 — THREE BEATS ═══ */}
      <section className="bg-sand-100 px-6 py-12 md:py-28">
        <div className="max-w-[520px] mx-auto space-y-8 md:space-y-14">
          {([
            { beat: "Day 1", stage: 0 as const, line: "Tell HUMA what\u2019s going on. It asks a few questions, and by the end you have a sheet for tomorrow." },
            { beat: "Week 2", stage: 1 as const, line: "The sheet knows your rhythms. It stops suggesting mornings when you\u2019re a night person. It notices your Body dimension hasn\u2019t moved in six days." },
            { beat: "Month 2", stage: 2 as const, line: "HUMA shows you that your best weeks all start the same way. A pattern you never would have spotted." },
          ]).map((item, i) => (
            <div
              key={i}
              {...reveal(i + 2)}
              className={`text-center ${reveal(i + 2).className}`}
              style={reveal(i + 2).style}
            >
              <GrowthDiagram stage={item.stage} />
              <p
                className="font-sans text-earth-300 mb-2"
                style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase" }}
              >
                {item.beat}
              </p>
              <p
                className="font-serif text-ink-700"
                style={{ fontSize: "clamp(1.05rem, 1.8vw, 1.15rem)", fontWeight: 400, lineHeight: 1.7 }}
              >
                {item.line}
              </p>
            </div>
          ))}
        </div>
      </section>


      {/* ═══ SECTION 5 — BOTTOM CTA ═══ */}
      <section className="bg-sand-50 px-6 pt-10 pb-16 md:pt-28 md:pb-32">
        <div
          {...reveal(5)}
          className={`max-w-[520px] mx-auto text-center ${reveal(5).className}`}
          style={reveal(5).style}
        >
          {/* Mini constellation — callback to hero */}
          <svg viewBox="0 0 64 64" className="w-12 h-12 mx-auto mb-6 opacity-50" aria-hidden="true">
            {[
              { x: 32, y: 10, c: "#3A5A40" }, { x: 52, y: 20, c: "#2E6B8A" },
              { x: 56, y: 40, c: "#B5621E" }, { x: 42, y: 54, c: "#8C8274" },
              { x: 22, y: 54, c: "#2A4A30" }, { x: 8, y: 40, c: "#C87A3A" },
              { x: 12, y: 20, c: "#6B5A7A" }, { x: 32, y: 32, c: "#B5621E" },
            ].map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={i === 7 ? 2 : 3} fill={d.c} opacity={i === 7 ? 0.5 : 0.6} />
            ))}
          </svg>

          <p
            className="font-serif text-ink-900 mb-3"
            style={{ fontSize: "clamp(1.35rem, 2.5vw, 1.6rem)", fontWeight: 400, lineHeight: 1.3 }}
          >
            What&rsquo;s going on in your life?
          </p>

          <p
            className="font-sans text-earth-400 mb-10 mx-auto max-w-[380px]"
            style={{ fontSize: "0.88rem", fontWeight: 300, lineHeight: 1.6 }}
          >
            No account, no&nbsp;forms. You talk,
            HUMA builds your first sheet.
          </p>

          <button
            onClick={go}
            className="inline-flex items-center justify-center rounded-full bg-amber-600 text-sand-50 font-sans font-medium px-10 py-4 min-h-[48px] cursor-pointer mb-6"
            style={{
              fontSize: "1rem",
              letterSpacing: "0.01em",
              boxShadow: "0 4px 24px rgba(181, 98, 30, 0.14)",
              transition: reduced ? "none" : "all 300ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            onMouseEnter={(e) => {
              if (!reduced) {
                e.currentTarget.style.background = "var(--color-amber-500)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(181, 98, 30, 0.2)";
              }
            }}
            onMouseLeave={(e) => {
              if (!reduced) {
                e.currentTarget.style.background = "var(--color-amber-600)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 24px rgba(181, 98, 30, 0.14)";
              }
            }}
          >
            Start&ensp;&rarr;
          </button>

          <p className="font-sans text-earth-300" style={{ fontSize: "0.75rem", fontWeight: 300, lineHeight: 1.5 }}>
            Takes about five minutes. You&rsquo;ll have a sheet by the end.
          </p>
        </div>
      </section>

      {/* ── Animations ── */}
      <style jsx global>{`
        /* Scroll reveal */
        .landing-reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 800ms cubic-bezier(0.22, 1, 0.36, 1),
                      transform 800ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .landing-visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

        /* Constellation: breathing center dot */
        @keyframes landing-breathe-kf {
          0%, 100% { transform-origin: center; r: 3; opacity: 0.4; }
          50% { r: 4; opacity: 0.7; }
        }
        .landing-breathe {
          animation: landing-breathe-kf 5s ease-in-out infinite;
        }

        /* Constellation: dot entrance */
        @keyframes landing-dot-kf {
          from { opacity: 0; r: 0; }
          to { opacity: 0.8; }
        }
        .landing-dot {
          animation: landing-dot-kf 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* Constellation: glow entrance */
        @keyframes landing-glow-kf {
          from { opacity: 0; }
          to { opacity: 0.5; }
        }
        .landing-glow {
          animation: landing-glow-kf 800ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* Constellation: line draw */
        @keyframes landing-line-kf {
          from { stroke-dashoffset: 200; opacity: 0; }
          to { stroke-dashoffset: 0; opacity: 0.3; }
        }
        .landing-line {
          stroke-dasharray: 200;
          animation: landing-line-kf 1000ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .landing-reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
          .landing-breathe { animation: none; opacity: 0.5; }
          .landing-dot { animation: none; opacity: 0.8; }
          .landing-glow { animation: none; opacity: 0.5; }
          .landing-line { animation: none; stroke-dasharray: none; opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
