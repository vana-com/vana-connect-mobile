import type { CanvasData } from "@/lib/data/canvas-types";
import { computeClusterBlob } from "./utils/clusterBlob";
import { getWobblyPath } from "./utils/wobbleLine";
import { STICKER_SIZES } from "./utils/stickerSizes";

interface SVGLayerProps {
  data: CanvasData;
  clusterColors: Record<string, string>;
}

export function SVGLayer({ data, clusterColors }: SVGLayerProps) {
  const nodeById = Object.fromEntries(data.nodes.map(n => [n.id, n]));

  return (
    <svg
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        overflow: "visible",
        width: 0,
        height: 0,
        pointerEvents: "none",
      }}
    >
      {/* Cluster blobs */}
      {data.clusters.map(cluster => {
        const clusterNodes = data.nodes.filter(n => n.cluster === cluster.id);
        const positions = clusterNodes.map(n => n.position);
        const path = computeClusterBlob(positions, cluster.id);
        if (!path) return null;
        const color = clusterColors[cluster.id] ?? "#ccc";
        return (
          <path
            key={cluster.id}
            d={path}
            fill={color}
            fillOpacity={0.13}
            stroke={color}
            strokeWidth={2}
            strokeOpacity={0.55}
            strokeDasharray="7 5"
          />
        );
      })}

      {/* Cluster name labels (above each blob) */}
      {data.clusters.map(cluster => {
        const clusterNodes = data.nodes.filter(n => n.cluster === cluster.id);
        if (clusterNodes.length === 0) return null;
        const minY = Math.min(...clusterNodes.map(n => n.position.y - STICKER_SIZES[n.size].h / 2));
        const cx = clusterNodes.reduce((s, n) => s + n.position.x, 0) / clusterNodes.length;
        const color = clusterColors[cluster.id] ?? "#000";
        return (
          <text
            key={`lbl-${cluster.id}`}
            x={cx}
            y={minY - 28}
            textAnchor="middle"
            style={{
              fontFamily: "var(--font-display, sans-serif)",
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fill: color,
              opacity: 0.75,
            }}
          >
            {cluster.name}
          </text>
        );
      })}

      {/* Relationship lines */}
      {data.edges.map(edge => {
        const from = nodeById[edge.from];
        const to = nodeById[edge.to];
        if (!from || !to) return null;
        const path = getWobblyPath(
          from.position.x, from.position.y,
          to.position.x, to.position.y,
          edge.id
        );
        return (
          <path
            key={edge.id}
            d={path}
            stroke="#000"
            strokeWidth={edge.strength * 0.8 + 0.4}
            strokeOpacity={0.2}
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
