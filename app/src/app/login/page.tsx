"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const { signInWithMagicLink, user } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already logged in — redirect
  if (user) {
    if (typeof window !== "undefined") {
      window.location.href = "/operate";
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setError(null);

    const result = await signInWithMagicLink(email.trim());
    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-sage-50/30 via-transparent to-transparent pointer-events-none" />

      <a
        href="/"
        className="absolute top-6 left-6 z-10 text-sm text-earth-400 hover:text-earth-600 transition-colors"
      >
        &larr; Back
      </a>

      <div className="relative z-10 max-w-md w-full text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-sage-600 mb-14 font-medium">
          HUMA
        </p>

        {sent ? (
          <>
            <h1 className="font-serif text-3xl text-earth-900 mb-6">
              Check your email
            </h1>
            <p className="text-earth-600 leading-relaxed mb-8">
              We sent a sign-in link to <strong>{email}</strong>.
              Click the link in your email to continue.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="text-sm text-sage-600 hover:text-sage-700 transition-colors underline underline-offset-2"
            >
              Try a different email
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <h1 className="font-serif text-3xl md:text-4xl text-earth-900 mb-4">
              Sign in to Operate
            </h1>
            <p className="text-earth-600 text-sm mb-10">
              Weekly reviews, morning briefings, and seasonal rhythms.
            </p>

            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b-2 border-sand-300 focus:border-sage-500 text-center font-serif text-lg text-earth-800 py-3 outline-none transition-colors placeholder:text-earth-400"
              placeholder="your@email.com"
              required
              autoFocus
            />

            {error && (
              <p className="text-sm text-amber-600 mt-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !email.trim()}
              className="mt-10 px-10 py-4 bg-amber-600 text-white text-lg font-medium rounded-full hover:bg-amber-700 transition-all hover:shadow-lg hover:shadow-amber-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending..." : "Send magic link"}
            </button>

            <p className="mt-6 text-xs text-earth-400">
              No password needed. We&apos;ll send a sign-in link to your email.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
