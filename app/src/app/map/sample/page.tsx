import type { Metadata } from "next";
import SampleMapClient from "./SampleMapClient";

export const metadata: Metadata = {
  title: "Sample Regenerative Enterprise Map — HUMA",
  description:
    "See what a Regenerative Enterprise Map looks like. A sample map for Sarah Chen, 12 acres in Southern Oregon.",
  openGraph: {
    title: "Sample Regenerative Enterprise Map — HUMA",
    description: "See what HUMA produces: a complete enterprise map with real numbers, capital profiles, and nodal interventions.",
    images: [{ url: "/api/og?name=Sarah%20Chen&location=Southern%20Oregon&enterprises=4", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sample Regenerative Enterprise Map — HUMA",
    images: ["/api/og?name=Sarah%20Chen&location=Southern%20Oregon&enterprises=4"],
  },
};

export default function SampleMapPage() {
  return <SampleMapClient />;
}
