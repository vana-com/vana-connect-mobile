"use client";

import { cn } from "@/lib/utils";
import type { Cluster } from "@/lib/data/clusters";

const CLUSTER_COLORS: Record<string, { bg: string; fg: string; badge?: string }> = {
  "music-q1-2026": { bg: "#F9F000", fg: "#000000", badge: "847 PLAYS" },
  "nyc-trip":       { bg: "#0051FF", fg: "#F7F5EE", badge: "TRIP INCOMING" },
  "books-systems":  { bg: "#FF2D9F", fg: "#F7F5EE" },
  "side-projects":  { bg: "#39FF14", fg: "#000000", badge: "3 ACTIVE" },
  "health-sleep":   { bg: "#E63946", fg: "#F7F5EE" },
  "substack-reads": { bg: "#00A7E1", fg: "#F7F5EE" },
};
const FALLBACK = { bg: "#ECEAE2", fg: "#000000" };

interface ClusterCardProps {
  cluster: Cluster;
  onTap: (cluster: Cluster) => void;
}

export function ClusterCard({ cluster, onTap }: ClusterCardProps) {
  const colors = CLUSTER_COLORS[cluster.id] ?? FALLBACK;

  return (
    <button
      onClick={() => onTap(cluster)}
      style={{ backgroundColor: colors.bg, boxShadow: "5px 5px 0 #000" }}
      className={cn(
        "relative w-full text-left border-[3px] border-real-black p-4",
        "transition-[transform,box-shadow] duration-[80ms] ease-[var(--ease-press)]",
        "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      )}
    >
      {/* Sticker badge */}
      {colors.badge && (
        <div
          className="absolute top-3 right-3 font-mono text-fine font-bold px-1.5 py-0.5 border-[2px] border-real-black bg-newsprint text-real-black uppercase tracking-wide"
          style={{ transform: "rotate(-3deg)" }}
        >
          {colors.badge}
        </div>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between gap-8 mb-2">
        <h3
          style={{ color: colors.fg }}
          className="font-display font-black text-heading uppercase leading-[1] tracking-tight"
        >
          {cluster.title}
        </h3>
      </div>

      {/* Item count chip */}
      <div className="inline-flex items-center gap-1 mb-3">
        <span className="font-mono text-fine font-bold border-[2px] border-real-black bg-newsprint text-real-black px-1.5 py-0.5 uppercase tracking-wide">
          {cluster.itemCount.toLocaleString()} ITEMS
        </span>
      </div>

      <p
        style={{ color: colors.fg }}
        className="text-small mb-3 leading-snug opacity-80"
      >
        {cluster.summary}
      </p>

      {/* Preview items */}
      <div className="space-y-1">
        {cluster.previewItems.slice(0, 3).map((item) => (
          <div
            key={item.id}
            style={{ color: colors.fg }}
            className="flex items-center gap-1.5 text-fine opacity-70 truncate"
          >
            <span className="font-mono uppercase tracking-wide shrink-0">—</span>
            <span className="truncate">{item.title}</span>
            {item.meta && (
              <span className="shrink-0 opacity-60 font-mono">{item.meta}</span>
            )}
          </div>
        ))}
      </div>

      {/* Source label */}
      <div className="mt-3 font-mono text-mono uppercase tracking-widest" style={{ color: colors.fg, opacity: 0.5 }}>
        VIA {cluster.sourceLabel}
      </div>
    </button>
  );
}
