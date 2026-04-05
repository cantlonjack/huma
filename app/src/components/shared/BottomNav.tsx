"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WholeMiniIndicator from "@/components/whole/WholeMiniIndicator";

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
      className="fixed bottom-0 left-0 right-0 z-50 bg-sand-50 border-t border-sand-300"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-14">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const isWhole = item.href === "/whole";

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 gap-0.5 min-h-[44px] h-14"
            >
              {isWhole && <WholeMiniIndicator />}
              <span
                className={`font-sans uppercase tracking-wider
                  ${isWhole ? "text-[10px]" : "text-[13px]"}
                  ${isActive ? "font-semibold text-sage-700" : "font-normal text-sage-300"}`}
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
