"use client";

import { useTheme, type ThemePreference } from "@/components/shared/ThemeProvider";

/* Compact sun/moon icon button. Single tap flips between light and dark. */
export function ThemeToggleIcon({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      title={dark ? "Light mode" : "Dark mode"}
      className={
        "inline-flex items-center justify-center rounded-full cursor-pointer text-ink-400 hover:text-sage-500 transition-colors duration-200 " +
        (className ?? "size-9")
      }
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

/* Three-state control (System / Light / Dark) for settings surfaces. */
export function ThemePreferenceControl() {
  const { preference, setPreference } = useTheme();
  const options: { value: ThemePreference; label: string }[] = [
    { value: "system", label: "System" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Theme preference"
      className="inline-flex rounded-full border border-sand-300 bg-sand-50 p-0.5"
    >
      {options.map((o) => {
        const active = preference === o.value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            onClick={() => setPreference(o.value)}
            className={
              "font-sans text-xs px-3 py-1.5 rounded-full transition-colors duration-200 cursor-pointer " +
              (active
                ? "bg-sage-700 text-white"
                : "text-ink-500 hover:text-sage-600")
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
