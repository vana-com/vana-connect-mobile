import type { StickerSize } from "@/lib/data/canvas-types";

export const STICKER_SIZES: Record<StickerSize, { w: number; h: number }> = {
  xxl: { w: 180, h: 180 },
  xl:  { w: 140, h: 140 },
  md:  { w: 100, h: 100 },
  sm:  { w: 72,  h: 72  },
};

export const STICKER_FONT: Record<StickerSize, number> = {
  xxl: 30,
  xl:  24,
  md:  17,
  sm:  12,
};
