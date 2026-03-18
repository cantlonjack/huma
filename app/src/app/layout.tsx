import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import AuthProvider from "@/components/AuthProvider";
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://huma.earth"),
  title: "HUMA — See your whole life as one connected system",
  description:
    "HUMA maps your whole situation — money, energy, relationships, purpose — and shows you the specific moves that change everything. Not another app. A new way of seeing.",
  openGraph: {
    title: "HUMA — Everything is connected. Now you can see how.",
    description:
      "Map your whole life. See the hidden connections. Get the specific moves for your situation.",
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
        <AuthProvider>
          <a href="#main-content" className="skip-nav">Skip to main content</a>
          <main id="main-content">
          {children}
          </main>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
