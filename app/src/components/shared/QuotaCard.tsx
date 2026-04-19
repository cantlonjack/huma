"use client";

/**
 * QuotaCard.tsx — SEC-02 client overlay rendered when a 429 RATE_LIMITED
 * response body arrives. Copy is Voice-Bible-compliant (§02): no "unlock",
 * no "upgrade now", no shame framing, no rush tactics.
 *
 * Blocker 5 resolution: the free-tier copy says "fifty" to match the
 * 50-req/day spec documented in CONTEXT.md's 2026-04-18 clarification.
 *
 * Tier copy (locked per CONTEXT.md):
 *   • anonymous — "The free ground holds five conversations a day..."
 *   • free      — "You've worked through today's fifty..."
 *   • operate   — "You've hit today's ceiling. Reach out..."
 *
 * The "Add email" CTA for anonymous dispatches the same custom event the
 * existing AuthModal listens for (`huma:open-auth-modal`), preserving the
 * magic-link path from SEC-01's anon→email upgrade flow.
 */

import type { CSSProperties } from "react";

export type QuotaTier = "anonymous" | "free" | "operate";
export type QuotaSuggestion = "sign_in" | "upgrade_operate" | "wait";

export interface QuotaCardProps {
  tier: QuotaTier;
  resetAt: string;
  suggest?: QuotaSuggestion;
  onDismiss?: () => void;
}

interface TierCopy {
  title: string;
  body: string;
  cta?: string;
}

const COPY: Record<QuotaTier, TierCopy> = {
  anonymous: {
    title: "The free ground holds five conversations a day.",
    body: "Drop your email and the rest opens. Everything here so far stays.",
    cta: "Add email",
  },
  free: {
    // "fifty" matches the 50/day spec (CONTEXT.md clarification 2026-04-18).
    title: "You've worked through today's fifty.",
    body: "Tomorrow restarts — or Operate lifts the line.",
    cta: "See Operate",
  },
  operate: {
    title: "You've hit today's ceiling.",
    body: "Reach out — we'll figure it out together.",
  },
};

/** Format resetAt as "at 3:42 PM"; fallback to "in the next day" if invalid. */
function formatReset(resetAt: string): string {
  const reset = new Date(resetAt);
  if (isNaN(reset.getTime())) return "in the next day";
  return `at ${reset.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

function handleCta(suggest: QuotaSuggestion | undefined) {
  if (suggest === "sign_in") {
    // Signal AuthModal to open. SEC-01 ships linkIdentity flow for anon→email.
    document.dispatchEvent(new Event("huma:open-auth-modal"));
  }
  if (suggest === "upgrade_operate") {
    // Pricing lives in Phase 6 — until then this route renders a placeholder.
    window.location.href = "/pricing";
  }
  // "wait" has no CTA — operate tier copy doesn't include a button.
}

export function QuotaCard({ tier, resetAt, suggest, onDismiss }: QuotaCardProps) {
  const copy = COPY[tier] ?? COPY.free;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Daily conversation limit reached"
      style={overlay}
      onClick={(e) => {
        // Click outside the card closes the overlay.
        if (e.target === e.currentTarget) onDismiss?.();
      }}
    >
      <div style={card}>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close"
          style={dismissBtn}
        >
          ×
        </button>
        <p style={title}>{copy.title}</p>
        <p style={body}>{copy.body}</p>
        <p style={meta}>Resets {formatReset(resetAt)}.</p>
        {copy.cta && suggest && suggest !== "wait" && (
          <button
            type="button"
            onClick={() => {
              handleCta(suggest);
              onDismiss?.();
            }}
            style={ctaBtn}
          >
            {copy.cta}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Styles — match /today and /whole card patterns ─────────────────────────
// Kept inline so this component has zero CSS-module dependency and can drop
// into any page that imports it.

const overlay: CSSProperties = {
  position: "fixed",
  inset: 0,
  display: "grid",
  placeItems: "center",
  background: "rgba(0, 0, 0, 0.25)",
  zIndex: 50,
  padding: 24,
};

const card: CSSProperties = {
  background: "#faf8f3",
  border: "1px solid #e7e1d4",
  borderRadius: 16,
  padding: "28px 24px",
  maxWidth: 420,
  width: "100%",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
  position: "relative",
  fontFamily: "Cormorant Garamond, serif",
};

const title: CSSProperties = {
  fontSize: 22,
  lineHeight: 1.2,
  margin: 0,
  color: "#2a2a2a",
};

const body: CSSProperties = {
  marginTop: 12,
  fontSize: 16,
  lineHeight: 1.5,
  color: "#4a4a4a",
  fontFamily: "system-ui, sans-serif",
};

const meta: CSSProperties = {
  marginTop: 10,
  fontSize: 13,
  color: "#888",
  fontFamily: "system-ui, sans-serif",
};

const ctaBtn: CSSProperties = {
  marginTop: 18,
  background: "#2a2a2a",
  color: "#faf8f3",
  border: 0,
  padding: "10px 18px",
  borderRadius: 8,
  fontFamily: "system-ui, sans-serif",
  fontSize: 14,
  cursor: "pointer",
};

const dismissBtn: CSSProperties = {
  position: "absolute",
  top: 8,
  right: 12,
  background: "transparent",
  border: 0,
  fontSize: 22,
  cursor: "pointer",
  color: "#999",
  lineHeight: 1,
};
