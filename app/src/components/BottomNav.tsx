"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/today", label: "Today" },
  { href: "/whole", label: "Whole" },
  { href: "/grow", label: "Grow" },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Only show on the three main tabs
  if (pathname === "/" || pathname === "/start") return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        height: "56px",
        background: "#FAF8F3",
        borderTop: "1px solid #DDD4C0",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-center justify-around h-full max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-center flex-1 h-full"
            >
              <span
                className="font-sans"
                style={{
                  fontSize: "13px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase" as const,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#3A5A40" : "#A8C4AA",
                }}
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
