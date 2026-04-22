"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConnectionStore } from "@/hooks/use-connection-store";
import { useDemoStore } from "@/hooks/use-demo-store";

export default function ResetPage() {
  const router = useRouter();
  const setConnection = useConnectionStore((s) => s.setConnection);
  const clearDemo = useDemoStore((s) => s.clear);

  useEffect(() => {
    localStorage.removeItem("vana-connect-connections");
    localStorage.removeItem("vana-connect-demo");
    ["spotify","gmail","linkedin","instagram","strava","notion","x","github","youtube","kindle","substack","apple-health"].forEach(
      (id) => setConnection(id, "none")
    );
    clearDemo();
    setTimeout(() => router.push("/dev"), 500);
  }, [router, setConnection, clearDemo]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <p className="text-small text-muted-foreground">Resetting local data...</p>
    </div>
  );
}
