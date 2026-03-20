import type { Metadata } from "next";
import SampleMapClient from "./SampleMapClient";

export const metadata: Metadata = {
  title: "Sample Living Canvas — HUMA",
  description:
    "See what a Living Canvas looks like. Two examples: Sarah Chen (land operator, 12 acres) and Maya Okafor (UX designer, single parent, Chicago).",
  openGraph: {
    title: "Sample Living Canvas — HUMA",
    description: "See what HUMA produces: complete Living Canvases for a land operator and an urban life designer.",
    images: [{ url: "/api/og?id=sample", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sample Living Canvas — HUMA",
    images: ["/api/og?id=sample"],
  },
};

export default function SampleMapPage() {
  return <SampleMapClient />;
}
