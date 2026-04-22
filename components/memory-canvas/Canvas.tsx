"use client";

import { useRef, useState, useCallback } from "react";
import { useGesture } from "@use-gesture/react";
import type { CanvasData, CanvasNode } from "@/lib/data/canvas-types";
import { Sticker } from "./Sticker";
import { SVGLayer } from "./SVGLayer";
import { GraphView } from "./GraphView";
import { CanvasTopBar, type CanvasView } from "./CanvasTopBar";
import { ClusterDetailView } from "./ClusterDetailView";

const MIN_ZOOM = 0.18;
const MAX_ZOOM = 3.5;

interface CanvasProps {
  data: CanvasData;
}

type PinchMemo = { startZoom: number; cx: number; cy: number };

export function Canvas({ data }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const panRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(0.85);
  const [transform, setTransform] = useState({ x: 0, y: 0, z: 0.85 });

  const [view, setView] = useState<CanvasView>("map");
  const [selectedNode, setSelectedNode] = useState<CanvasNode | null>(null);

  const clusterById = Object.fromEntries(data.clusters.map(c => [c.id, c]));
  const clusterColorMap = Object.fromEntries(data.clusters.map(c => [c.id, c.color]));

  function applyTransform(x: number, y: number, z: number) {
    panRef.current = { x, y };
    zoomRef.current = z;
    setTransform({ x, y, z });
  }

  function handleViewChange(v: CanvasView) {
    setView(v);
    setSelectedNode(null);
    // Reset to centered view when switching
    applyTransform(0, 0, v === "graph" ? 1 : 0.85);
  }

  const bind = useGesture(
    {
      onDrag: ({ delta: [dx, dy], event }) => {
        (event as Event).preventDefault?.();
        applyTransform(
          panRef.current.x + dx,
          panRef.current.y + dy,
          zoomRef.current
        );
      },
      onPinch: ({ origin: [ox, oy], offset: [scale], first, memo, event }) => {
        (event as Event).preventDefault?.();
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return memo as PinchMemo;
        const cx = ox - rect.left - rect.width / 2;
        const cy = oy - rect.top - rect.height / 2;
        const m: PinchMemo = first
          ? { startZoom: zoomRef.current, cx, cy }
          : (memo as PinchMemo);
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, m.startZoom * scale));
        const ratio = newZoom / zoomRef.current;
        applyTransform(
          m.cx + (panRef.current.x - m.cx) * ratio,
          m.cy + (panRef.current.y - m.cy) * ratio,
          newZoom
        );
        return m;
      },
      onWheel: ({ delta: [, dy], event }) => {
        const e = event as WheelEvent;
        e.preventDefault();
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = e.clientX - rect.left - rect.width / 2;
        const cy = e.clientY - rect.top - rect.height / 2;
        const factor = dy > 0 ? 0.92 : 1 / 0.92;
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomRef.current * factor));
        const ratio = newZoom / zoomRef.current;
        applyTransform(
          cx + (panRef.current.x - cx) * ratio,
          cy + (panRef.current.y - cy) * ratio,
          newZoom
        );
      },
    },
    {
      drag: { filterTaps: true, pointer: { buttons: [1, 4] } },
      pinch: { scaleBounds: { min: MIN_ZOOM, max: MAX_ZOOM }, rubberband: true },
      wheel: { eventOptions: { passive: false } },
    }
  );

  const handleNodeTap = useCallback((nodeId: string) => {
    const node = data.nodes.find(n => n.id === nodeId);
    if (node) setSelectedNode(node);
  }, [data.nodes]);

  const handleStickerTap = useCallback((node: CanvasNode) => {
    setSelectedNode(node);
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <CanvasTopBar view={view} onViewChange={handleViewChange} />

      <div
        ref={containerRef}
        {...bind()}
        style={{
          position: "absolute",
          inset: 0,
          top: 48,
          touchAction: "none",
          overflow: "hidden",
          backgroundColor: "var(--background)",
          cursor: "grab",
        }}
      >
        {/* Dot grid */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.13) 1px, transparent 1px)",
            backgroundSize: `${20 * transform.z}px ${20 * transform.z}px`,
            backgroundPosition: `${transform.x % (20 * transform.z)}px ${transform.y % (20 * transform.z)}px`,
            pointerEvents: "none",
          }}
        />

        {/* Canvas world */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transformOrigin: "0 0",
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.z})`,
            willChange: "transform",
          }}
        >
          {view === "map" ? (
            <>
              <SVGLayer data={data} clusterColors={clusterColorMap} />
              {data.nodes.map(node => (
                <Sticker
                  key={node.id}
                  node={node}
                  clusterColor={clusterColorMap[node.cluster] ?? "#ddd"}
                  onTap={handleStickerTap}
                  isSelected={selectedNode?.id === node.id}
                />
              ))}
            </>
          ) : (
            <GraphView
              data={data}
              clusterColors={clusterColorMap}
              onNodeTap={handleNodeTap}
              active={view === "graph"}
            />
          )}
        </div>
      </div>

      {selectedNode && (
        <ClusterDetailView
          node={selectedNode}
          cluster={clusterById[selectedNode.cluster]!}
          clusterColor={clusterColorMap[selectedNode.cluster] ?? "#ddd"}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
