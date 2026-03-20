"use client";

import { useRouter } from "next/navigation";
import ShapeBuilder from "@/components/shape/ShapeBuilder";

export default function BeginPage() {
  const router = useRouter();

  return (
    <ShapeBuilder
      onClose={() => router.push("/")}
      onComplete={(shape) => {
        // Future: persist shape and navigate to map
        console.log("Shape complete:", shape);
      }}
    />
  );
}
