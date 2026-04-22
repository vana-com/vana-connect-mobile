"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CanvasNode, CanvasCluster } from "@/lib/data/canvas-types";
import { NODE_ITEMS, type NodeItem } from "@/lib/data/node-items";

interface ClusterDetailViewProps {
  node: CanvasNode;
  cluster: CanvasCluster;
  clusterColor: string;
  onClose: () => void;
}

const spring = { type: "spring" as const, stiffness: 400, damping: 35 };

export function ClusterDetailView({ node, cluster, clusterColor, onClose }: ClusterDetailViewProps) {
  const baseItems = NODE_ITEMS[node.id] ?? [];

  // Local editable state — copy of items so edits stay in session
  const [items, setItems] = useState<NodeItem[]>(() => baseItems.map(i => ({ ...i })));
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [draft, setDraft] = useState<{ title: string; content: string }>({ title: "", content: "" });

  function startEdit(i: number) {
    setDraft({ title: items[i].title, content: items[i].content });
    setEditingIdx(i);
  }

  function saveEdit(i: number) {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, ...draft } : item));
    setEditingIdx(null);
  }

  function cancelEdit() {
    setEditingIdx(null);
  }

  return (
    <AnimatePresence>
      <motion.div
        key={node.id}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={spring}
        style={{
          position: "absolute",
          left: 0, right: 0, bottom: 0, top: 48,
          backgroundColor: clusterColor,
          border: "3px solid #000",
          borderBottom: "none",
          zIndex: 40,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ borderBottom: "3px solid #000", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.55, color: "#000" }}>
              {cluster.name}
            </p>
            <p style={{ fontFamily: "var(--font-display, sans-serif)", fontWeight: 700, fontSize: 28, textTransform: "uppercase", lineHeight: 1, color: "#000", marginTop: 2 }}>
              {node.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ width: 36, height: 36, border: "3px solid #000", backgroundColor: "#000", color: clusterColor, fontFamily: "var(--font-display, sans-serif)", fontWeight: 700, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Stats */}
        <div style={{ borderBottom: "3px solid #000", padding: "10px 16px", display: "flex", gap: 24, flexShrink: 0 }}>
          <Stat label="ITEMS" value={node.itemCount?.toLocaleString() ?? "—"} />
          <Stat label="CLUSTER" value={cluster.name} />
          <Stat label="SIZE" value={node.size.toUpperCase()} />
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
          {items.length === 0 ? (
            <p style={{ paddingTop: 40, textAlign: "center", fontFamily: "var(--font-mono, monospace)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#000", opacity: 0.4 }}>
              No items synced yet.
            </p>
          ) : (
            items.map((item, i) => (
              <ItemRow
                key={i}
                item={item}
                isEditing={editingIdx === i}
                draft={draft}
                clusterColor={clusterColor}
                onEdit={() => startEdit(i)}
                onSave={() => saveEdit(i)}
                onCancel={cancelEdit}
                onDraftChange={setDraft}
              />
            ))
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface ItemRowProps {
  item: NodeItem;
  isEditing: boolean;
  draft: { title: string; content: string };
  clusterColor: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDraftChange: (d: { title: string; content: string }) => void;
}

function ItemRow({ item, isEditing, draft, clusterColor, onEdit, onSave, onCancel, onDraftChange }: ItemRowProps) {
  return (
    <div style={{ borderBottom: "2px solid rgba(0,0,0,0.18)", paddingTop: 12, paddingBottom: 12 }}>
      {isEditing ? (
        /* Edit mode */
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <input
            autoFocus
            value={draft.title}
            onChange={e => onDraftChange({ ...draft, title: e.target.value })}
            style={{
              width: "100%",
              fontFamily: "var(--font-sans, sans-serif)",
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.02em",
              color: "#000",
              backgroundColor: "rgba(0,0,0,0.08)",
              border: "2px solid #000",
              padding: "5px 8px",
              outline: "none",
            }}
          />
          <textarea
            value={draft.content}
            rows={3}
            onChange={e => onDraftChange({ ...draft, content: e.target.value })}
            style={{
              width: "100%",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 11,
              color: "#000",
              backgroundColor: "rgba(0,0,0,0.08)",
              border: "2px solid #000",
              padding: "5px 8px",
              outline: "none",
              resize: "vertical",
              lineHeight: 1.5,
            }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
            <button
              onClick={onSave}
              style={{ padding: "4px 12px", fontFamily: "var(--font-mono, monospace)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", backgroundColor: "#000", color: clusterColor, border: "2px solid #000", cursor: "pointer" }}
            >
              SAVE
            </button>
            <button
              onClick={onCancel}
              style={{ padding: "4px 12px", fontFamily: "var(--font-mono, monospace)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", backgroundColor: "transparent", color: "#000", border: "2px solid rgba(0,0,0,0.4)", cursor: "pointer" }}
            >
              CANCEL
            </button>
          </div>
        </div>
      ) : (
        /* Read mode */
        <div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
            <p style={{ fontFamily: "var(--font-sans, sans-serif)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em", color: "#000", lineHeight: 1.2 }}>
              {item.title}
            </p>
            <button
              onClick={onEdit}
              title="Edit"
              style={{ flexShrink: 0, marginTop: 1, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.1)", border: "1.5px solid rgba(0,0,0,0.25)", cursor: "pointer", color: "#000", fontSize: 11 }}
            >
              ✎
            </button>
          </div>
          <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, color: "#000", opacity: 0.65, lineHeight: 1.4, marginBottom: 5 }}>
            {item.content}
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
            {item.meta && (
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: "#000", opacity: 0.4 }}>
                {item.meta}
              </span>
            )}
            {item.source && (
              <button
                onClick={() => {/* demo: no-op navigation */}}
                style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#000", backgroundColor: "rgba(0,0,0,0.12)", border: "1.5px solid rgba(0,0,0,0.3)", padding: "2px 6px", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
              >
                {item.source} ↗
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.45, color: "#000" }}>{label}</p>
      <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 13, fontWeight: 700, color: "#000", marginTop: 1 }}>{value}</p>
    </div>
  );
}
