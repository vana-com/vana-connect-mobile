"use client";

import { useState } from "react";
import { ScreenHeader } from "@/components/layout/screen-header";
import { SourceTile } from "@/components/connections/source-tile";
import { SourceDetailSheet } from "@/components/connections/source-detail-sheet";
import { DeepConnectSheet } from "@/components/connections/deep-connect-sheet";
import { useConnectionStore } from "@/hooks/use-connection-store";
import { DATA_SOURCES, type DataSource } from "@/lib/data/connections";

export default function ConnectionsPage() {
  const { getState, setConnection } = useConnectionStore();
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deepOpen, setDeepOpen] = useState(false);

  function openSource(source: DataSource) {
    setSelectedSource(source);
    setDetailOpen(true);
  }

  function handleConnect() {
    if (!selectedSource) return;
    setConnection(selectedSource.id, "lite");
    setDetailOpen(false);
  }

  function handleDeepConnect() {
    setDetailOpen(false);
    setTimeout(() => setDeepOpen(true), 150);
  }

  const connectedCount = DATA_SOURCES.filter((s) => getState(s.id) !== "none").length;

  return (
    <>
      <ScreenHeader title="SOURCES" eyebrow="WHERE YOUR STUFF LIVES" />

      <main className="flex-1 overflow-y-auto px-inset py-4">
        {/* Hero line */}
        <p className="font-display font-black text-subtitle uppercase leading-[1] tracking-tight mb-1">
          {connectedCount > 0
            ? `${connectedCount} PLUGGED IN.`
            : "NOTHING PLUGGED IN."}
        </p>
        <p className="font-mono text-fine text-muted-foreground uppercase tracking-wide mb-5">
          {connectedCount > 0
            ? "Your data is flowing."
            : "Tap a source to connect it."}
        </p>

        <div className="grid grid-cols-3 gap-3">
          {DATA_SOURCES.map((source) => (
            <SourceTile
              key={source.id}
              source={source}
              state={getState(source.id)}
              onTap={openSource}
            />
          ))}
        </div>
      </main>

      <SourceDetailSheet
        source={selectedSource}
        currentState={selectedSource ? getState(selectedSource.id) : "none"}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onConnect={handleConnect}
        onDeepConnect={handleDeepConnect}
      />

      <DeepConnectSheet
        source={selectedSource}
        isOpen={deepOpen}
        onClose={() => setDeepOpen(false)}
      />
    </>
  );
}
