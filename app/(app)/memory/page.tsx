"use client";

import { Canvas } from "@/components/memory-canvas/Canvas";
import SEED from "@/lib/data/seed-memory";

export default function MemoryPage() {
  return (
    <div className="flex-1 min-h-0 overflow-hidden relative">
      <Canvas data={SEED} />
    </div>
  );
}
