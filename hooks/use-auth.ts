"use client";

import { useDemoStore } from "./use-demo-store";

export function useAuth() {
  const email = useDemoStore((s) => s.email);
  const user = email ? { id: "demo-user", email, phone: null as string | null } : null;
  return { user, loading: false };
}
