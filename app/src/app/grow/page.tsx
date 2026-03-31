"use client";

import TabShell from "@/components/TabShell";

export default function GrowPage() {
  return (
    <TabShell contextPrompt="What do you want to work on next?">
      <div className="min-h-dvh bg-sand-50 flex flex-col items-center justify-center" style={{ paddingBottom: "80px" }}>
        <p
          className="font-sans font-medium"
          style={{ fontSize: "13px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#A8C4AA" }}
        >
          Grow &middot; coming next
        </p>
      </div>
    </TabShell>
  );
}
