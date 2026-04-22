export function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function deterministicJitter(seed: string, index: number, range: number): number {
  const h = simpleHash(seed + index.toString());
  return (h % range) - range / 2;
}
