import { simpleHash } from "./hash";

type Point = [number, number];

function cross(O: Point, A: Point, B: Point): number {
  return (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]);
}

function convexHull(pts: Point[]): Point[] {
  if (pts.length < 2) return pts;
  const sorted = [...pts].sort((a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]);
  const lower: Point[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper: Point[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

export function computeClusterBlob(
  positions: Array<{ x: number; y: number }>,
  clusterId: string,
  padding = 85
): string {
  if (positions.length === 0) return "";
  if (positions.length === 1) {
    const { x, y } = positions[0];
    const r = padding;
    return `M ${x - r} ${y} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0 Z`;
  }

  const pts: Point[] = positions.map(p => [p.x, p.y]);
  const hull = convexHull(pts);
  if (hull.length < 2) return "";

  const cx = hull.reduce((s, p) => s + p[0], 0) / hull.length;
  const cy = hull.reduce((s, p) => s + p[1], 0) / hull.length;

  const h = simpleHash(clusterId);

  const expanded: Point[] = hull.map((p, i) => {
    const dx = p[0] - cx;
    const dy = p[1] - cy;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const jitter = (((h * (i + 1) * 7919) >>> 0) % 32) - 16;
    return [
      p[0] + (dx / len) * (padding + jitter),
      p[1] + (dy / len) * (padding + jitter),
    ];
  });

  if (expanded.length === 0) return "";

  const n = expanded.length;
  let d = `M ${(expanded[0][0] + expanded[n - 1][0]) / 2} ${(expanded[0][1] + expanded[n - 1][1]) / 2}`;
  for (let i = 0; i < n; i++) {
    const p = expanded[i];
    const next = expanded[(i + 1) % n];
    const mx = (p[0] + next[0]) / 2;
    const my = (p[1] + next[1]) / 2;
    d += ` Q ${p[0]} ${p[1]} ${mx} ${my}`;
  }
  d += " Z";
  return d;
}
