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

export interface ConnectionEvent {
  id: string;
  source_name: string;
  access_level: "lite" | "deep";
  action: "added" | "removed";
  via: "desktop" | "mobile";
  created_at: string;
}

const SEED_CONNECTION_EVENTS: ConnectionEvent[] = [
  {
    id: "seed-apple-notes-deep",
    source_name: "Apple Notes",
    access_level: "deep",
    action: "added",
    via: "desktop",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
];

interface DemoStore {
  email: string;
  setEmail: (email: string) => void;
  logs: PermissionLog[];
  addLog: (log: Omit<PermissionLog, "id" | "created_at">) => void;
  connectionEvents: ConnectionEvent[];
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
      connectionEvents: SEED_CONNECTION_EVENTS,
      clear: () => set({ email: "", logs: [], connectionEvents: SEED_CONNECTION_EVENTS }),
    }),
    { name: "vana-connect-demo" }
  )
);
