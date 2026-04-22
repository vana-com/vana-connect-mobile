"use client";

import type { CanvasNode } from "@/lib/data/canvas-types";
import { STICKER_SIZES, STICKER_FONT } from "./utils/stickerSizes";

interface StickerProps {
  node: CanvasNode;
  clusterColor: string;
  onTap: (node: CanvasNode) => void;
  isSelected?: boolean;
}

export function Sticker({ node, clusterColor, onTap, isSelected }: StickerProps) {
  const { w, h } = STICKER_SIZES[node.size];
  const fontSize = STICKER_FONT[node.size];

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onTap(node); }}
      style={{
        position: "absolute",
        left: node.position.x - w / 2,
        top: node.position.y - h / 2,
        width: w,
        height: h,
        backgroundColor: clusterColor,
        border: "3px solid #000",
        boxShadow: isSelected ? "0 0 0 4px #000, 6px 6px 0 #000" : "4px 4px 0 #000",
        cursor: "pointer",
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 6,
        transition: "box-shadow 0.08s",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display, sans-serif)",
          fontWeight: 700,
          fontSize,
          lineHeight: 1.05,
          textAlign: "center",
          textTransform: "uppercase",
          wordBreak: "break-word",
          overflowWrap: "break-word",
          color: "#000",
        }}
      >
        {node.name}
      </span>
      {node.itemCount !== undefined && node.size !== "sm" && (
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 9,
            color: "#000",
            opacity: 0.55,
            marginTop: 5,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {node.itemCount.toLocaleString()}
        </span>
      )}
    </div>
  );
}
