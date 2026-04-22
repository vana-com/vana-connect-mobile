"use client";

import { useAuth } from "@/hooks/use-auth";
import { SettingsSheet } from "./settings-sheet";

export function SettingsSheetWrapper() {
  const { user } = useAuth();
  return <SettingsSheet user={user} />;
}
