export function deriveWalletAddress(userId: string): string {
  const cleaned = userId.replace(/-/g, "");
  return `0x${cleaned.padEnd(40, "0").slice(0, 40)}`;
}
