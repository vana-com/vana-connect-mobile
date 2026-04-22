export type StickerSize = "xxl" | "xl" | "md" | "sm";

export interface CanvasNode {
  id:        string;
  name:      string;
  cluster:   string;
  size:      StickerSize;
  position:  { x: number; y: number };
  itemCount?: number;
}

export interface CanvasCluster {
  id:    string;
  name:  string;
  color: string;
}

export interface CanvasEdge {
  id:       string;
  from:     string;
  to:       string;
  strength: 1 | 2 | 3;
  label?:   string;
}

export interface CanvasData {
  nodes:    CanvasNode[];
  clusters: CanvasCluster[];
  edges:    CanvasEdge[];
}
