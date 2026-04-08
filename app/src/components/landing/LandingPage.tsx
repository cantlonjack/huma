"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// ── Example sheet data (static, no API calls) ──
const SHEET_ENTRIES = [
  {
    action: "Map out the raised bed layout",
    detail: "You mentioned wanting to start seedlings this week — sketch the 4x8 beds along the south fence before ordering soil.",
    capitals: ["Home", "Body"],
  },
  {
    action: "Price out the cattle panel trellis",
    detail: "Three quotes from the feed store plus one online. Compare against the budget line you set last Tuesday.",
    capitals: ["Money", "Home"],
  },
  {
    action: "20-minute walk before dinner",
    detail: "Your back has been better on days you move in the late afternoon. Keep the streak — this is day four.",
    capitals: ["Body", "Joy"],
  },
];

const STATEMENTS = [
  "Talk about what\u2019s going on in your life. HUMA remembers and connects the pieces.",
  "Check off what you did today. HUMA finds the patterns you can\u2019t see.",
  "Come back tomorrow. Your sheet gets more specific every day.",
];

// ── Scroll reveal hook ──
function useScrollReveal() {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      // Make everything visible immediately
      refs.current.forEach((el) => {
        if (el) el.style.opacity = "1";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("landing-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    );

    refs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [reduced]);

  return (idx: number) => (el: HTMLElement | null) => {
    refs.current[idx] = el;
  };
}

export default function LandingPage() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const setRef = useScrollReveal();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const goToStart = () => router.push("/start");

  return (
    <div className="min-h-screen bg-sand-50">
      {/* ═══ SECTION 1: HERO ═══ */}
      <section className="flex flex-col items-center justify-center min-h-screen px-6 bg-sand-50">
        <div className="max-w-[680px] w-full text-center">
          {/* Wordmark */}
          <h1
            className="font-serif tracking-[0.35em] text-ink-900 mb-6"
            style={{
              fontSize: "clamp(2.6rem, 5.5vw, 3.8rem)",
              fontWeight: 400,
              lineHeight: 1.1,
            }}
          >
            H U M A
          </h1>

          {/* Tagline */}
          <p
            className="font-serif text-ink-700 mb-4"
            style={{
              fontSize: "clamp(1.15rem, 2.2vw, 1.375rem)",
              fontWeight: 400,
              lineHeight: 1.4,
            }}
          >
            See the whole. Find the leverage. Practice what works.
          </p>

          {/* Subtitle */}
          <p
            className="font-sans text-earth-500 mb-10 mx-auto max-w-[520px]"
            style={{
              fontSize: "1rem",
              fontWeight: 300,
              lineHeight: 1.7,
            }}
          >
            Life infrastructure&thinsp;&mdash;&thinsp;shows how the parts of your life connect
            and which daily behaviors are the leverage points.
          </p>

          {/* CTA */}
          <button
            onClick={goToStart}
            className="inline-flex items-center justify-center rounded-full bg-amber-600 text-sand-50 font-sans font-medium px-9 py-4 min-h-[44px] min-w-[44px] cursor-pointer"
            style={{
              fontSize: "1rem",
              boxShadow: "0 4px 20px rgba(181, 98, 30, 0.15)",
              transition: reduced ? "none" : "all 300ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            onMouseEnter={(e) => {
              if (!reduced) {
                e.currentTarget.style.background = "var(--color-amber-500)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!reduced) {
                e.currentTarget.style.background = "var(--color-amber-600)";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            Start yours&ensp;&rarr;
          </button>
        </div>
      </section>

      {/* ═══ SECTION 2: EXAMPLE SHEET ═══ */}
      <section className="bg-sand-100 px-6 py-20 md:py-24">
        <div
          ref={setRef(0)}
          className={`max-w-[680px] mx-auto ${mounted && !reduced ? "landing-reveal" : ""}`}
          style={!reduced ? { opacity: mounted ? undefined : 0 } : undefined}
        >
          {/* Section header */}
          <h2
            className="font-serif text-ink-900 text-center mb-10"
            style={{
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              fontWeight: 400,
              lineHeight: 1.2,
            }}
          >
            What HUMA makes for you each morning
          </h2>

          {/* Sheet card */}
          <div
            className="rounded-xl border border-sand-300 p-6 md:p-8 mb-10"
            style={{ background: "#FFFFFF" }}
          >
            {/* Date line */}
            <p
              className="font-sans text-earth-400 mb-1"
              style={{ fontSize: "0.82rem", fontWeight: 500, letterSpacing: "0.02em" }}
            >
              Tuesday, April 8&ensp;&middot;&ensp;Day 23
            </p>

            {/* Through-line */}
            <p
              className="font-serif text-ink-700 mb-6"
              style={{ fontSize: "1.05rem", fontWeight: 400, lineHeight: 1.6, fontStyle: "italic" }}
            >
              The garden and the budget are the same project today.
            </p>

            {/* Divider */}
            <div className="border-t border-sand-300 mb-6" />

            {/* Entries */}
            <div className="space-y-5">
              {SHEET_ENTRIES.map((entry, i) => (
                <div key={i}>
                  {/* Action line */}
                  <div className="flex items-start gap-3">
                    {/* Checkbox circle (unchecked) */}
                    <div
                      className="flex-shrink-0 mt-0.5 rounded-full border-2 border-sand-300"
                      style={{ width: 20, height: 20 }}
                    />
                    <div className="flex-1">
                      <p
                        className="font-sans text-ink-900"
                        style={{ fontSize: "0.95rem", fontWeight: 500, lineHeight: 1.4 }}
                      >
                        {entry.action}
                      </p>
                      <p
                        className="font-sans text-earth-400 mt-1"
                        style={{ fontSize: "0.82rem", fontWeight: 300, lineHeight: 1.6 }}
                      >
                        {entry.detail}
                      </p>
                      {/* Capital pills */}
                      <div className="flex gap-2 mt-2">
                        {entry.capitals.map((cap) => (
                          <span
                            key={cap}
                            className="font-sans text-sage-700 bg-sage-50 border border-sage-200 rounded-full"
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 500,
                              padding: "2px 10px",
                              lineHeight: 1.4,
                            }}
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Context sentence */}
          <p
            className="font-serif text-ink-700 text-center mb-3"
            style={{ fontSize: "1.05rem", fontWeight: 400, lineHeight: 1.7 }}
          >
            It knows your freezer inventory. Your budget. Your back pain. Your season. Your land.
          </p>
          <p
            className="font-sans text-earth-400 text-center"
            style={{ fontSize: "0.9rem", fontWeight: 300, lineHeight: 1.6 }}
          >
            Because you told it&thinsp;&mdash;&thinsp;through conversation, not forms.
          </p>
        </div>
      </section>

      {/* ═══ SECTION 3: THREE STATEMENTS ═══ */}
      <section className="bg-sand-50 px-6 py-20 md:py-24">
        <div className="max-w-[580px] mx-auto space-y-8">
          {STATEMENTS.map((statement, i) => (
            <p
              key={i}
              ref={setRef(i + 1)}
              className={`font-serif text-ink-700 text-center ${mounted && !reduced ? "landing-reveal" : ""}`}
              style={{
                fontSize: "clamp(1.05rem, 1.8vw, 1.15rem)",
                fontWeight: 400,
                lineHeight: 1.7,
                ...(reduced ? {} : { opacity: mounted ? undefined : 0 }),
              }}
            >
              {statement}
            </p>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 4: BOTTOM CTA ═══ */}
      <section className="bg-sand-50 px-6 pt-8 pb-20 md:pb-28">
        <div
          ref={setRef(4)}
          className={`max-w-[580px] mx-auto text-center ${mounted && !reduced ? "landing-reveal" : ""}`}
          style={!reduced ? { opacity: mounted ? undefined : 0 } : undefined}
        >
          <p
            className="font-serif text-ink-900 mb-8"
            style={{
              fontSize: "clamp(1.4rem, 2.5vw, 1.5rem)",
              fontWeight: 400,
              lineHeight: 1.3,
            }}
          >
            What&rsquo;s going on in your life?
          </p>

          <button
            onClick={goToStart}
            className="inline-flex items-center justify-center rounded-full bg-amber-600 text-sand-50 font-sans font-medium px-9 py-4 min-h-[44px] min-w-[44px] cursor-pointer mb-5"
            style={{
              fontSize: "1rem",
              boxShadow: "0 4px 20px rgba(181, 98, 30, 0.15)",
              transition: reduced ? "none" : "all 300ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            onMouseEnter={(e) => {
              if (!reduced) {
                e.currentTarget.style.background = "var(--color-amber-500)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!reduced) {
                e.currentTarget.style.background = "var(--color-amber-600)";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            Start&ensp;&rarr;
          </button>

          <p
            className="font-sans text-earth-400"
            style={{ fontSize: "0.82rem", fontWeight: 300, lineHeight: 1.5 }}
          >
            No account needed. No forms. Just a conversation.
          </p>
        </div>
      </section>

      {/* ── Scroll reveal CSS (injected once) ── */}
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
