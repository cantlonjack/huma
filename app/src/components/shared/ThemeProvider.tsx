"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   Theme (light / dark / system).

   Storage: localStorage["huma-v2-theme"] — "light" | "dark" | "system".
   Effect:  writes `data-theme="light"` or `"dark"` on <html> when the user
            picks an explicit preference. "system" removes the attribute so
            the `@media (prefers-color-scheme: dark)` rule in globals.css
            takes over.

   A tiny inline script in layout.tsx runs the same logic before hydration
   to avoid a light→dark flash on first paint.
   ═══════════════════════════════════════════════════════════════════════════ */

export type ThemePreference = "light" | "dark" | "system";
export type EffectiveTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "huma-v2-theme";

interface ThemeContextValue {
  preference: ThemePreference;
  theme: EffectiveTheme;
  setPreference: (p: ThemePreference) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readSystem(): EffectiveTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readStored(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const v = window.localStorage.getItem(THEME_STORAGE_KEY);
  return v === "light" || v === "dark" || v === "system" ? v : "system";
}

function applyDocumentTheme(pref: ThemePreference) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (pref === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", pref);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [systemTheme, setSystemTheme] = useState<EffectiveTheme>("light");

  // Hydrate from storage + system on mount, and reapply the <html>
  // attribute. The inline script in layout.tsx handles the pre-hydration
  // paint; this guards against any hydration pass that cleared it.
  // The sync setState-in-effect is intentional: SSR has no access to
  // localStorage / matchMedia, so the first client pass has to pull them
  // in. A single cascade render is the correct cost to avoid a hydration
  // mismatch on the <html data-theme> attribute.
  useEffect(() => {
    const p = readStored();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreferenceState(p);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSystemTheme(readSystem());
    applyDocumentTheme(p);
  }, []);

  // Track system preference so `preference === "system"` stays live.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) =>
      setSystemTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const theme: EffectiveTheme =
    preference === "system" ? systemTheme : preference;

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, p);
    } catch {
      /* storage can fail in private mode; the attribute update still works */
    }
    applyDocumentTheme(p);
  }, []);

  const toggle = useCallback(() => {
    // Two-state toggle that collapses "system" → its current effective
    // value before flipping, so clicking once always changes appearance.
    const current: EffectiveTheme =
      preference === "system" ? systemTheme : preference;
    setPreference(current === "dark" ? "light" : "dark");
  }, [preference, systemTheme, setPreference]);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, theme, setPreference, toggle }),
    [preference, theme, setPreference, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Sensible fallback for components rendered outside the provider
    // (e.g., in Storybook or server-rendered static shells).
    return {
      preference: "system",
      theme: "light",
      setPreference: () => {},
      toggle: () => {},
    };
  }
  return ctx;
}

/** Script body injected into <head> to set the theme before hydration. */
export const themeInitScript = `(function(){try{var p=localStorage.getItem('${THEME_STORAGE_KEY}');if(p==='light'||p==='dark'){document.documentElement.setAttribute('data-theme',p);}}catch(e){}})();`;
