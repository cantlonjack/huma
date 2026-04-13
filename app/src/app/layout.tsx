import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import AuthProvider from "@/components/shared/AuthProvider";
import QueryProvider from "@/components/shared/QueryProvider";
import BottomNav from "@/components/shared/BottomNav";
import SyncStatus from "@/components/shared/SyncStatus";
import SessionTracker from "@/components/shared/SessionTracker";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://huma.earth"),
  title: "HUMA — Design the life you actually want",
  description:
    "Your daily patterns were inherited, not chosen. HUMA helps you see the ones you\u2019re running, choose proven ones that match what you want, and validate they work with your own data.",
  manifest: "/manifest.json",
  openGraph: {
    title: "HUMA — Life Design Partner",
    description:
      "Stop running on autopilot. HUMA helps you consciously design your life \u2014 one proven pattern at a time.",
    images: ["/api/og"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HUMA — Life Design Partner",
    description:
      "Stop running on autopilot. HUMA helps you consciously design your life \u2014 one proven pattern at a time.",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${sourceSans.variable} font-sans antialiased`}>
        <QueryProvider>
        <AuthProvider>
          <a href="#main-content" className="skip-nav">Skip to main content</a>
          <main id="main-content">
          {children}
          </main>
          <BottomNav />
          <SyncStatus />
        </AuthProvider>
        </QueryProvider>
        <Analytics />
        <SessionTracker />
      </body>
    </html>
  );
}
