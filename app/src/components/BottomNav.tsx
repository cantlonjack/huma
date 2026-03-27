"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/today",
    label: "Today",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#3A5A40" : "#8C8274"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: "/system",
    label: "System",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#3A5A40" : "#8C8274"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="5" r="1" fill={active ? "#3A5A40" : "#8C8274"} stroke="none" />
        <circle cx="19" cy="12" r="1" fill={active ? "#3A5A40" : "#8C8274"} stroke="none" />
        <circle cx="12" cy="19" r="1" fill={active ? "#3A5A40" : "#8C8274"} stroke="none" />
        <circle cx="5" cy="12" r="1" fill={active ? "#3A5A40" : "#8C8274"} stroke="none" />
      </svg>
    ),
  },
  {
    href: "/chat",
    label: "Talk",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#3A5A40" : "#8C8274"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Don't show on landing page or /start (entry flow)
  if (pathname === "/" || pathname === "/start") return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-sand-50 border-t border-sand-300"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto" style={{ padding: "8px 0" }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center px-4 py-1"
            >
              {/* Active dot indicator above icon */}
              {isActive && (
                <span
                  className="rounded-full bg-sage-700"
                  style={{ width: "4px", height: "4px", marginBottom: "6px" }}
                />
              )}
              {!isActive && <span style={{ height: "10px" }} />}
              {item.icon(isActive)}
              <span
                className="font-sans font-medium"
                style={{ fontSize: "11px", color: isActive ? "#3A5A40" : "#8C8274", lineHeight: "1" }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
