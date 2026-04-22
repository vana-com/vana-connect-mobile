import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ConnectionState } from "@/lib/data/connections";

interface ConnectionStore {
  connections: Record<string, ConnectionState>;
  setConnection: (sourceId: string, state: ConnectionState) => void;
  getState: (sourceId: string) => ConnectionState;
}

export const useConnectionStore = create<ConnectionStore>()(
  persist(
    (set, get) => ({
      connections: {
        spotify: "lite",
        github: "lite",
      },
      setConnection: (sourceId, state) =>
        set((prev) => ({
          connections: { ...prev.connections, [sourceId]: state },
        })),
      getState: (sourceId) => get().connections[sourceId] ?? "none",
    }),
    { name: "vana-connect-connections" }
  )
);
