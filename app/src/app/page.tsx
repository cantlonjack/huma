"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/shared/AuthProvider";
import LandingView from "@/components/views/LandingView";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Also check localStorage for pre-auth aspirations
      try {
        const saved = localStorage.getItem("huma-v2-aspirations");
        if (saved) {
          const aspirations = JSON.parse(saved);
          if (Array.isArray(aspirations) && aspirations.length > 0) {
            router.push("/today");
            return;
          }
        }
      } catch { /* continue to landing */ }
      setChecked(true);
      return;
    }

    // Authenticated: check for V2 aspirations
    (async () => {
      try {
        const { createClient } = await import("@/lib/supabase");
        const supabase = createClient();
        if (supabase) {
          const { data } = await supabase
            .from("aspirations")
            .select("id")
            .eq("user_id", user.id)
            .eq("status", "active")
            .limit(1);
          if (data && data.length > 0) {
            router.push("/today");
            return;
          }
        }
      } catch { /* fall through */ }

      // Supabase empty or failed — check localStorage as fallback
      try {
        const saved = localStorage.getItem("huma-v2-aspirations");
        if (saved) {
          const aspirations = JSON.parse(saved);
          if (Array.isArray(aspirations) && aspirations.length > 0) {
            router.push("/today");
            return;
          }
        }
      } catch { /* continue to /start */ }

      // No aspirations anywhere — go to /start
      router.push("/start");
    })();
  }, [user, authLoading, router]);

  // Show landing page for unauthenticated users without aspirations
  if (!checked) return null;

  return <LandingView onStart={() => router.push("/start")} />;
}
