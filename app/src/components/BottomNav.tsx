"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/chat",
    label: "Talk",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#5C7A62" : "#8C8274"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: "/today",
    label: "Today",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#5C7A62" : "#8C8274"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "More",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#5C7A62" : "#8C8274"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="5" r="1" />
        <circle cx="12" cy="19" r="1" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Don't show on landing page or /start (first visit)
  if (pathname === "/" || pathname === "/start") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sand-50 border-t border-sand-200 lg:top-0 lg:bottom-auto lg:border-t-0 lg:border-b">
      <div className="flex items-center justify-around max-w-lg mx-auto py-2 lg:justify-center lg:gap-12 lg:py-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href ||
            (item.href === "/chat" && pathname === "/start");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors duration-200 ${
                isActive ? "text-sage-500" : "text-earth-400"
              }`}
            >
              {item.icon(isActive)}
              <span className="font-sans text-xs font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
