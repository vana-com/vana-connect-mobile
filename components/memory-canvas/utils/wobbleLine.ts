import { simpleHash } from "./hash";

export function getWobblyPath(
  x1: number, y1: number,
  x2: number, y2: number,
  edgeId: string
): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const jitter = (simpleHash(edgeId) % 24) - 12;
  const cx = mx + px * jitter;
  const cy = my + py * jitter;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}
