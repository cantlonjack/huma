"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/* ─── Dimension dot colors ─── */
const DIMS: Record<string, string> = {
  Body: "#3A5A40",
  People: "#2E6B8A",
  Money: "#B5621E",
  Home: "#8C8274",
  Growth: "#2A4A30",
  Joy: "#C87A3A",
  Purpose: "#6B5A7A",
  Identity: "#554D42",
};

/* ─── Briefing entries (no checkboxes — this is an intelligence briefing, not a checklist) ─── */
const BRIEFING = [
  {
    headline: "Map out the raised bed layout",
    reasoning:
      "You said 6 beds but only 3 get morning sun. Start with those — sketch it before ordering soil.",
    dims: ["Home", "Body"],
    focus: true,
  },
  {
    headline: "Price the cattle panel trellis",
    reasoning:
      "Tractor Supply has 16ft panels at $32. You need 4 for the bean tunnel. Compare against Tuesday's budget line.",
    dims: ["Money", "Home"],
    focus: false,
  },
  {
    headline: "Move before dinner tonight",
    reasoning:
      "Your back has been better on days you move in late afternoon. This is day four of the pattern.",
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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    refs.current.forEach((el) => {
      if (el) obs.observe(el);
    });
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = () => router.push("/start");

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const reveal = (idx: number) => ({
    ref: setRef(idx),
    className: mounted && !reduced ? "landing-reveal" : "",
    style: !reduced
      ? ({ opacity: mounted ? undefined : 0 } as React.CSSProperties)
      : undefined,
  });

  /* Shared CTA button props */
  const ctaHover = {
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!reduced) {
        e.currentTarget.style.background = "var(--color-amber-500)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow =
          "0 8px 32px rgba(181, 98, 30, 0.2)";
      }
    },
    onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!reduced) {
        e.currentTarget.style.background = "var(--color-amber-600)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 4px 24px rgba(181, 98, 30, 0.14)";
      }
    },
  };

  return (
    <div className="min-h-screen bg-sand-50 overflow-x-hidden">
      {/* ═══ NAV ═══ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 ${
          scrolled
            ? "bg-sand-50 border-b border-sand-200"
            : "bg-transparent"
        }`}
        style={{
          transition: reduced
            ? "none"
            : "background 300ms cubic-bezier(0.22, 1, 0.36, 1), border-color 300ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div className="max-w-[1080px] mx-auto px-6 h-16 flex items-center justify-between">
          <span
            className="font-serif text-ink-900"
            style={{
              fontSize: "1.05rem",
              fontWeight: 400,
              letterSpacing: "0.25em",
            }}
          >
            HUMA
          </span>

          <div className="flex items-center gap-6">
            <button
              onClick={() => scrollTo("how-it-works")}
              className="hidden sm:block font-sans text-earth-500 cursor-pointer"
              style={{
                fontSize: "0.85rem",
                fontWeight: 400,
                transition: reduced
                  ? "none"
                  : "color 200ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
              onMouseEnter={(e) => {
                if (!reduced) e.currentTarget.style.color = "var(--color-ink-700)";
              }}
              onMouseLeave={(e) => {
                if (!reduced) e.currentTarget.style.color = "var(--color-earth-500)";
              }}
            >
              How it works
            </button>

            <button
              onClick={go}
              className="font-sans font-medium text-sand-50 bg-amber-600 rounded-full px-5 py-2 cursor-pointer"
              style={{
                fontSize: "0.85rem",
                transition: reduced
                  ? "none"
                  : "background 200ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
              onMouseEnter={(e) => {
                if (!reduced)
                  e.currentTarget.style.background = "var(--color-amber-500)";
              }}
              onMouseLeave={(e) => {
                if (!reduced)
                  e.currentTarget.style.background = "var(--color-amber-600)";
              }}
            >
              Start&ensp;&rarr;
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-6">
        <div className="max-w-[620px] mx-auto text-center">
          <h1
            className="font-serif text-ink-900 mb-5"
            style={{
              fontSize: "clamp(1.85rem, 4.5vw, 2.8rem)",
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
            }}
          >
            Know what matters today.
          </h1>

          <p
            className="font-sans text-earth-500 mb-10 mx-auto max-w-[480px]"
            style={{
              fontSize: "clamp(0.95rem, 1.6vw, 1.05rem)",
              fontWeight: 300,
              lineHeight: 1.7,
            }}
          >
            HUMA learns your whole context&thinsp;&mdash;&thinsp;money, health,
            home, family, goals&thinsp;&mdash;&thinsp;and each morning gives you
            five actions, each with a reason why.
          </p>

          <button
            onClick={go}
            className="inline-flex items-center justify-center rounded-full bg-amber-600 text-sand-50 font-sans font-medium px-10 py-4 min-h-[48px] cursor-pointer"
            style={{
              fontSize: "1rem",
              boxShadow: "0 4px 24px rgba(181, 98, 30, 0.14)",
              transition: reduced
                ? "none"
                : "all 300ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            {...ctaHover}
          >
            Start a conversation&ensp;&rarr;
          </button>

          <p
            className="font-sans text-earth-300 mt-4"
            style={{ fontSize: "0.8rem", fontWeight: 300 }}
          >
            No account. No forms. Just a conversation.
          </p>
        </div>
      </section>

      {/* ═══ MORNING BRIEFING ═══ */}
      <section className="px-5 pb-20 md:pb-28">
        <div
          {...reveal(0)}
          className={`max-w-[520px] mx-auto ${reveal(0).className}`}
          style={reveal(0).style}
        >
          {/* The card */}
          <div
            className="rounded-xl border border-sand-300 overflow-hidden"
            style={{ background: "#FFFFFF" }}
          >
            {/* Date line */}
            <div className="px-6 pt-6 pb-3 md:px-8 md:pt-8">
              <p
                className="font-sans text-earth-400"
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                }}
              >
                Wednesday, April 9&ensp;&middot;&ensp;Early
                Spring&ensp;&middot;&ensp;Day 23
              </p>
            </div>

            {/* Through-line */}
            <div className="px-6 pb-5 md:px-8">
              <div className="border-l-2 border-l-amber-400 pl-4 py-1">
                <p
                  className="font-serif text-ink-600 italic"
                  style={{ fontSize: "0.95rem", lineHeight: 1.55 }}
                >
                  The garden and the budget are the same project today.
                </p>
              </div>
            </div>

            <div className="mx-6 border-t border-sand-200 md:mx-8" />

            {/* Entries — no checkboxes */}
            {BRIEFING.map((entry, i) => (
              <div
                key={i}
                className={`px-6 md:px-8 py-5 ${
                  i < BRIEFING.length - 1
                    ? "border-b border-sand-100"
                    : ""
                }`}
              >
                {entry.focus && (
                  <p
                    className="font-sans text-amber-600 mb-1.5"
                    style={{
                      fontSize: "0.6rem",
                      fontWeight: 600,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                    }}
                  >
                    Today&apos;s focus
                  </p>
                )}

                <p
                  className={`font-serif leading-snug mb-1.5 ${
                    entry.focus
                      ? "text-ink-900 text-[17px] font-medium"
                      : "text-ink-800 text-[15px]"
                  }`}
                >
                  {entry.headline}
                </p>

                <p
                  className="font-sans text-earth-400 mb-2.5"
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 300,
                    lineHeight: 1.6,
                  }}
                >
                  {entry.reasoning}
                </p>

                <div className="flex gap-2.5">
                  {entry.dims.map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center gap-1 font-sans text-earth-400"
                      style={{ fontSize: "0.7rem", fontWeight: 400 }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: DIMS[d], opacity: 0.7 }}
                      />
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Caption */}
          <p
            className="text-center font-sans text-earth-300 mt-6"
            style={{ fontSize: "0.78rem", fontWeight: 300, lineHeight: 1.5 }}
          >
            Generated from a five-minute conversation. Rebuilt every morning.
          </p>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section
        id="how-it-works"
        className="bg-sand-100 px-6 py-20 md:py-28"
      >
        <div className="max-w-[880px] mx-auto">
          <p
            className="font-sans text-earth-400 text-center mb-3"
            style={{
              fontSize: "0.68rem",
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            How it works
          </p>

          <h2
            className="font-serif text-ink-900 text-center mb-14 md:mb-16"
            style={{
              fontSize: "clamp(1.3rem, 2.5vw, 1.6rem)",
              fontWeight: 400,
              lineHeight: 1.3,
            }}
          >
            Three steps. No forms. No setup.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            {[
              {
                num: "01",
                title: "Have a conversation",
                desc: "Tell HUMA what\u2019s going on. Your goals, your constraints, what keeps you up at night. Talk like you\u2019d talk to a sharp friend who remembers everything.",
              },
              {
                num: "02",
                title: "It maps the whole picture",
                desc: "HUMA organizes what you said across eight dimensions\u2009\u2014\u2009body, money, home, people, growth, joy, purpose, identity. It sees connections you might miss.",
              },
              {
                num: "03",
                title: "Wake up to clarity",
                desc: "Each morning, a briefing tailored to today. It knows your budget, your season, your patterns. Five actions, each with a reason why.",
              },
            ].map((step, i) => (
              <div
                key={i}
                {...reveal(i + 1)}
                className={reveal(i + 1).className}
                style={reveal(i + 1).style}
              >
                <p
                  className="font-sans text-amber-600 mb-3"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                  }}
                >
                  {step.num}
                </p>
                <p
                  className="font-serif text-ink-900 mb-2"
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 500,
                    lineHeight: 1.3,
                  }}
                >
                  {step.title}
                </p>
                <p
                  className="font-sans text-earth-400"
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: 300,
                    lineHeight: 1.65,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHAT MAKES IT DIFFERENT ═══ */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-[600px] mx-auto">
          <p
            className="font-sans text-earth-400 text-center mb-12"
            style={{
              fontSize: "0.68rem",
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            Not another app
          </p>

          <div className="space-y-10">
            {[
              {
                title: "It remembers",
                desc: "Your freezer inventory. Your kid\u2019s school schedule. The back pain that flares up on sedentary days. The budget constraint from three weeks ago. HUMA holds all of it and uses all of it.",
              },
              {
                title: "It connects",
                desc: "The garden project affects the budget. The budget affects your stress. The stress affects whether you move your body. HUMA sees the whole chain and plans around it.",
              },
              {
                title: "It adapts",
                desc: "After a week, it stops suggesting morning routines if you\u2019re a night person. It notices when a dimension of your life hasn\u2019t moved in days. It learns your rhythms without you having to explain them.",
              },
            ].map((item, i) => (
              <div
                key={i}
                {...reveal(i + 4)}
                className={reveal(i + 4).className}
                style={reveal(i + 4).style}
              >
                <p
                  className="font-serif text-ink-900 mb-2"
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 500,
                    lineHeight: 1.3,
                  }}
                >
                  {item.title}
                </p>
                <p
                  className="font-sans text-earth-500"
                  style={{
                    fontSize: "0.92rem",
                    fontWeight: 300,
                    lineHeight: 1.7,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section className="bg-sand-100 px-6 py-20 md:py-28">
        <div
          {...reveal(7)}
          className={`max-w-[480px] mx-auto text-center ${reveal(7).className}`}
          style={reveal(7).style}
        >
          <h2
            className="font-serif text-ink-900 mb-3"
            style={{
              fontSize: "clamp(1.3rem, 2.5vw, 1.6rem)",
              fontWeight: 400,
              lineHeight: 1.3,
            }}
          >
            What&rsquo;s going on in your life?
          </h2>

          <p
            className="font-sans text-earth-400 mb-8"
            style={{ fontSize: "0.92rem", fontWeight: 300, lineHeight: 1.6 }}
          >
            Start talking. HUMA builds your first morning briefing.
          </p>

          <button
            onClick={go}
            className="inline-flex items-center justify-center rounded-full bg-amber-600 text-sand-50 font-sans font-medium px-10 py-4 min-h-[48px] cursor-pointer"
            style={{
              fontSize: "1rem",
              boxShadow: "0 4px 24px rgba(181, 98, 30, 0.14)",
              transition: reduced
                ? "none"
                : "all 300ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            {...ctaHover}
          >
            Start a conversation&ensp;&rarr;
          </button>

          <p
            className="font-sans text-earth-300 mt-4"
            style={{ fontSize: "0.78rem", fontWeight: 300 }}
          >
            No account. No forms. Just a conversation.
          </p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="px-6 py-10 border-t border-sand-200">
        <div className="max-w-[1080px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="font-serif text-ink-900"
              style={{
                fontSize: "0.95rem",
                fontWeight: 400,
                letterSpacing: "0.2em",
              }}
            >
              HUMA
            </span>
            <span
              className="font-sans text-earth-300"
              style={{ fontSize: "0.78rem", fontWeight: 300 }}
            >
              Life infrastructure
            </span>
          </div>
          <p
            className="font-sans text-earth-300"
            style={{ fontSize: "0.72rem", fontWeight: 300 }}
          >
            &copy; {new Date().getFullYear()} HUMA
          </p>
        </div>
      </footer>

      {/* ── Animations ── */}
      <style jsx global>{`
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
