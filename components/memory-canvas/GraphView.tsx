import type { CanvasData } from "@/lib/data/canvas-types";
import { useForceLayout } from "./hooks/useForceLayout";
import { STICKER_SIZES } from "./utils/stickerSizes";

interface GraphViewProps {
  data: CanvasData;
  clusterColors: Record<string, string>;
  onNodeTap: (nodeId: string) => void;
  active: boolean;
}

export function GraphView({ data, clusterColors, onNodeTap, active }: GraphViewProps) {
  const positions = useForceLayout(data.nodes, data.edges, active);
  const nodeById = Object.fromEntries(data.nodes.map(n => [n.id, n]));

  return (
    <svg
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        overflow: "visible",
      }}
    >
      {/* Edges */}
      {data.edges.map(edge => {
        const fromPos = positions.get(edge.from);
        const toPos = positions.get(edge.to);
        if (!fromPos || !toPos) return null;
        return (
          <line
            key={edge.id}
            x1={fromPos.x}
            y1={fromPos.y}
            x2={toPos.x}
            y2={toPos.y}
            stroke="#000"
            strokeWidth={edge.strength * 0.7 + 0.3}
            strokeOpacity={0.18}
          />
        );
      })}

      {/* Nodes */}
      {data.nodes.map(node => {
        const pos = positions.get(node.id);
        if (!pos) return null;
        const { w, h } = STICKER_SIZES[node.size];
        const color = clusterColors[node.cluster] ?? "#ddd";
        const fontSize = w >= 140 ? 13 : w >= 100 ? 11 : 9;

        return (
          <g
            key={node.id}
            transform={`translate(${pos.x}, ${pos.y})`}
            style={{ cursor: "pointer" }}
            onClick={(e) => { e.stopPropagation(); onNodeTap(node.id); }}
          >
            {/* Hard shadow */}
            <rect
              x={-w / 2 + 3}
              y={-h / 2 + 3}
              width={w}
              height={h}
              fill="#000"
            />
            {/* Main card */}
            <rect
              x={-w / 2}
              y={-h / 2}
              width={w}
              height={h}
              fill={color}
              stroke="#000"
              strokeWidth={2.5}
            />
            {/* Name */}
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              y={node.itemCount != null && w >= 100 ? -6 : 0}
              style={{
                fontFamily: "var(--font-display, sans-serif)",
                fontWeight: 700,
                fontSize,
                textTransform: "uppercase",
                fill: "#000",
                pointerEvents: "none",
              }}
            >
              {node.name}
            </text>
            {/* Item count */}
            {node.itemCount != null && w >= 100 && (
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                y={fontSize + 4}
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 8,
                  fill: "#000",
                  opacity: 0.5,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  pointerEvents: "none",
                }}
              >
                {node.itemCount.toLocaleString()}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
