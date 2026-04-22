"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PermissionLog {
  id: string;
  app_name: string;
  scopes: string[];
  duration: string;
  outcome: "approve" | "deny";
  created_at: string;
}

interface DemoStore {
  email: string;
  setEmail: (email: string) => void;
  logs: PermissionLog[];
  addLog: (log: Omit<PermissionLog, "id" | "created_at">) => void;
  clear: () => void;
}

export const useDemoStore = create<DemoStore>()(
  persist(
    (set) => ({
      email: "",
      setEmail: (email) => set({ email }),
      logs: [],
      addLog: (log) =>
        set((s) => ({
          logs: [
            { ...log, id: crypto.randomUUID(), created_at: new Date().toISOString() },
            ...s.logs,
          ],
        })),
      clear: () => set({ email: "", logs: [] }),
    }),
    { name: "vana-connect-demo" }
  )
);
