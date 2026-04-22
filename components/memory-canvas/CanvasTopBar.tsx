"use client";

export type CanvasView = "map" | "graph";

interface CanvasTopBarProps {
  view: CanvasView;
  onViewChange: (v: CanvasView) => void;
}

export function CanvasTopBar({ view, onViewChange }: CanvasTopBarProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        borderBottom: "3px solid #000",
        backgroundColor: "var(--background)",
        zIndex: 20,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display, sans-serif)",
          fontWeight: 700,
          fontSize: 17,
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          color: "var(--foreground)",
        }}
      >
        VANA
      </span>

      {/* MAP / WEB toggle */}
      <div style={{ display: "flex", border: "2px solid #000" }}>
        {(["map", "graph"] as CanvasView[]).map((v, i) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            style={{
              padding: "5px 13px",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              cursor: "pointer",
              border: "none",
              borderLeft: i > 0 ? "2px solid #000" : "none",
              backgroundColor: view === v ? "#000" : "transparent",
              color: view === v ? "var(--background)" : "#000",
            }}
          >
            {v === "map" ? "MAP" : "WEB"}
          </button>
        ))}
      </div>
    </div>
  );
}
