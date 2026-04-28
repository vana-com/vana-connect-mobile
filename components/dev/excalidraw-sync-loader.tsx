"use client";

import dynamic from "next/dynamic";

const ExcalidrawSyncCanvas = dynamic(() => import("@/components/dev/excalidraw-sync-canvas"), {
  ssr: false,
});

export function ExcalidrawSyncLoader() {
  return <ExcalidrawSyncCanvas />;
}
