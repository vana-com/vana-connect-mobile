"use client";

import Link from "next/link";
import { useDemoStore } from "@/hooks/use-demo-store";

export default function AuditPage() {
  const logs = useDemoStore((s) => s.logs);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dev" className="text-small text-muted-foreground hover:text-foreground">
          ← Dev
        </Link>
        <h1 className="text-heading font-semibold">Audit trail</h1>
      </div>

      {!logs.length ? (
        <p className="text-small text-muted-foreground">No permission events yet. Try approving or denying an app.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="rounded-card border border-border p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-button font-semibold">{log.app_name}</span>
                <span className={`text-fine font-semibold px-2 py-0.5 rounded-pill ${log.outcome === "approve" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {log.outcome}
                </span>
              </div>
              <p className="text-fine text-muted-foreground mb-1">
                {log.scopes.join(", ")} · {log.duration}
              </p>
              <p className="text-fine text-muted-foreground/60">
                {new Date(log.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
