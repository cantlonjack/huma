"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./AuthProvider";

const HUMA_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export default function AuthModal({ open, onClose, onAuthenticated }: AuthModalProps) {
  const { signInWithMagicLink, user } = useAuth();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, trigger immediately
  if (open && user) {
    // Use microtask to avoid setState during render
    Promise.resolve().then(onAuthenticated);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || sending) return;

    setSending(true);
    setError(null);

    const { error: authError } = await signInWithMagicLink(email.trim());
    setSending(false);

    if (authError) {
      setError(authError);
    } else {
      setSent(true);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-earth-900/40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-sand-50 rounded-2xl shadow-lg max-w-sm w-full p-8"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.4, ease: HUMA_EASE }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-earth-400 hover:text-earth-600 transition-colors"
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            {sent ? (
              /* Check your email state */
              <div className="text-center">
                <p className="font-serif text-earth-800 text-xl mb-3">
                  Check your email
                </p>
                <p className="font-sans text-earth-500 text-sm leading-relaxed">
                  We sent a link to <span className="text-earth-700">{email}</span>.
                  <br />
                  Tap it to save your shape.
                </p>
              </div>
            ) : (
              /* Email input state */
              <>
                <p className="font-serif text-earth-800 text-xl text-center mb-2">
                  Save your shape
                </p>
                <p className="font-sans text-earth-500 text-sm text-center mb-6">
                  So you can come back.
                </p>

                <form onSubmit={handleSubmit}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    autoFocus
                    className="w-full px-4 py-3 rounded-lg border border-sand-300 bg-white text-earth-800 font-sans text-base placeholder:text-earth-300 focus:outline-none focus:border-sage-400 focus:ring-1 focus:ring-sage-400 transition-colors"
                  />

                  {error && (
                    <p className="mt-2 text-rose-600 text-sm font-sans">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={sending || !email.trim()}
                    className="w-full mt-4 px-6 py-3 rounded-full bg-sage-600 text-white font-sans text-sm font-medium hover:bg-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? "Sending..." : "Send magic link"}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
