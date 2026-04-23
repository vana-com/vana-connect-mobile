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

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const h = (n: number) => n * 60 * 60 * 1000;
const d = (n: number) => n * 24 * h(1);

const SEED_CONNECTION_EVENTS: ConnectionEvent[] = [
  {
    id: "seed-apple-notes-deep",
    source_name: "Apple Notes",
    access_level: "deep",
    action: "added",
    via: "desktop",
    created_at: ago(h(3)),
  },
  {
    id: "seed-strava-lite",
    source_name: "Strava",
    access_level: "lite",
    action: "added",
    via: "mobile",
    created_at: ago(d(3)),
  },
  {
    id: "seed-spotify-lite",
    source_name: "Spotify",
    access_level: "lite",
    action: "added",
    via: "mobile",
    created_at: ago(d(5)),
  },
];

const SEED_PERMISSION_LOGS: PermissionLog[] = [
  {
    id: "seed-dumb-bitch-approve",
    app_name: "Dumb Bitch Index",
    scopes: ["Spotify listening history", "Instagram activity", "X post history"],
    duration: "30 days",
    outcome: "approve",
    created_at: ago(h(1)),
  },
  {
    id: "seed-portrait-approve",
    app_name: "Portrait",
    scopes: ["Spotify listening history", "Kindle highlights", "GitHub repos"],
    duration: "90 days",
    outcome: "approve",
    created_at: ago(d(2)),
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
      logs: SEED_PERMISSION_LOGS,
      addLog: (log) =>
        set((s) => ({
          logs: [
            { ...log, id: crypto.randomUUID(), created_at: new Date().toISOString() },
            ...s.logs,
          ],
        })),
      connectionEvents: SEED_CONNECTION_EVENTS,
      clear: () => set({ email: "", logs: SEED_PERMISSION_LOGS, connectionEvents: SEED_CONNECTION_EVENTS }),
    }),
    { name: "vana-connect-demo" }
  )
);
