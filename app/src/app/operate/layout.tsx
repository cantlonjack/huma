import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HUMA — Operate",
  description: "Weekly reviews, morning briefings, and seasonal rhythms for your operation.",
};

export default function OperateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
