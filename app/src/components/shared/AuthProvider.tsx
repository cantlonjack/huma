"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { flushWal, getPendingCount } from "@/lib/db/store";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signInWithMagicLink: async () => ({ error: null }),
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthCtx);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- unblock render once we know Supabase isn't configured; feature detection on mount
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) { setLoading(false); return; }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Flush pending WAL entries when user signs in
      if (session?.user && getPendingCount() > 0) {
        flushWal(session.user.id).catch(() => {});
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Flush WAL on app focus (network recovery). The ref mirrors `user` so the
  // focus handler (which is attached once) always reads the latest value.
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);
  useEffect(() => {
    const handleFocus = () => {
      if (userRef.current && getPendingCount() > 0) {
        flushWal(userRef.current.id).catch(() => {});
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const signInWithMagicLink = async (email: string) => {
    const supabase = createClient();
    if (!supabase) return { error: "Authentication is not configured" };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/today`,
      },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
  };

  return (
    <AuthCtx.Provider value={{ user, session, loading, signInWithMagicLink, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}
