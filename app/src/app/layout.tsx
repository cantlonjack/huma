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
  title: "HUMA — See the pattern in your life",
  description:
    "8 questions. 90 seconds. Your whole life in one shape.",
  openGraph: {
    title: "HUMA — See the pattern in your life",
    description:
      "8 questions. 90 seconds. Your whole life in one shape.",
    images: ["/api/og"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HUMA — See the pattern in your life",
    description:
      "8 questions. 90 seconds. Your whole life in one shape.",
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
