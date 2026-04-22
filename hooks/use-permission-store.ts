import { create } from "zustand";
import type { DiscoverApp } from "@/lib/data/apps";

interface PermissionStore {
  isOpen: boolean;
  app: DiscoverApp | null;
  open: (app: DiscoverApp) => void;
  close: () => void;
}

export const usePermissionStore = create<PermissionStore>()((set) => ({
  isOpen: false,
  app: null,
  open: (app) => set({ isOpen: true, app }),
  close: () => set({ isOpen: false }),
}));
