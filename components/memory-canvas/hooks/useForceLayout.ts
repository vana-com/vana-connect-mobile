"use client";

import { useEffect, useRef, useState } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type Simulation,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import type { CanvasNode, CanvasEdge } from "@/lib/data/canvas-types";
import { STICKER_SIZES } from "../utils/stickerSizes";

export interface SimNode extends SimulationNodeDatum {
  id: string;
  name: string;
  cluster: string;
  size: CanvasNode["size"];
  itemCount?: number;
}

export interface SimLink extends SimulationLinkDatum<SimNode> {
  id: string;
  strength: number;
}

export type NodePositions = Map<string, { x: number; y: number }>;

export function useForceLayout(nodes: CanvasNode[], edges: CanvasEdge[], active: boolean): NodePositions {
  const [positions, setPositions] = useState<NodePositions>(() =>
    new Map(nodes.map(n => [n.id, { x: n.position.x * 0.5, y: n.position.y * 0.5 }]))
  );

  const simRef = useRef<Simulation<SimNode, SimLink> | null>(null);

  useEffect(() => {
    if (!active) return;

    const simNodes: SimNode[] = nodes.map(n => ({
      id: n.id,
      name: n.name,
      cluster: n.cluster,
      size: n.size,
      itemCount: n.itemCount,
      // seed with canvas positions so it doesn't start from (0,0)
      x: n.position.x * 0.5,
      y: n.position.y * 0.5,
    }));

    const simLinks: SimLink[] = edges.map(e => ({
      id: e.id,
      source: e.from,
      target: e.to,
      strength: e.strength,
    }));

    const sim = forceSimulation<SimNode>(simNodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(simLinks)
          .id(d => d.id)
          .distance(d => 180 - d.strength * 25)
          .strength(d => d.strength * 0.25)
      )
      .force("charge", forceManyBody<SimNode>().strength(-280))
      .force("center", forceCenter(0, 0).strength(0.06))
      .force(
        "collide",
        forceCollide<SimNode>(d => STICKER_SIZES[d.size].w / 2 + 18)
      )
      .alphaDecay(0.04)
      .velocityDecay(0.45);

    sim.on("tick", () => {
      const next = new Map<string, { x: number; y: number }>();
      simNodes.forEach(n => {
        if (n.x != null && n.y != null) next.set(n.id, { x: n.x, y: n.y });
      });
      setPositions(new Map(next));
    });

    simRef.current = sim;
    return () => { sim.stop(); simRef.current = null; };
  }, [active]); // restart when activated

  return positions;
}
