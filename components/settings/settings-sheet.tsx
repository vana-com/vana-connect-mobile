"use client";

import { Copy, LogOut, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useSettingsStore } from "@/hooks/use-settings-store";
import { useDemoStore, type PermissionLog, type ConnectionEvent } from "@/hooks/use-demo-store";
import { deriveWalletAddress } from "@/lib/wallet";
import { cn } from "@/lib/utils";

interface DemoUser {
  id: string;
  email?: string | null;
  phone?: string | null;
}

interface SettingsSheetProps {
  user: DemoUser | null;
}

function ComingSoonRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-button text-muted-foreground">{label}</span>
      <span className="text-fine text-muted-foreground/60 bg-muted rounded-pill px-2 py-0.5">
        Coming soon
      </span>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function PermissionEntry({ log }: { log: PermissionLog }) {
  const approved = log.outcome === "approve";
  return (
    <div className="px-4 py-3 border-b border-border last:border-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-small font-medium">{log.app_name}</span>
        <span className={cn(
          "text-fine font-semibold px-2 py-0.5 rounded-pill",
          approved ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
        )}>
          {approved ? "Approved" : "Denied"}
        </span>
      </div>
      <p className="text-fine text-muted-foreground truncate">{log.scopes.join(", ")} · {log.duration}</p>
      <p className="text-fine text-muted-foreground/60 mt-0.5">{formatDate(log.created_at)}</p>
    </div>
  );
}

function ConnectionEntry({ event }: { event: ConnectionEvent }) {
  const label = `${event.access_level === "deep" ? "Deep" : "Lite"} ${event.source_name} data ${event.action} from ${event.via}`;
  return (
    <div className="px-4 py-3 border-b border-border last:border-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-small font-medium">{label}</span>
      </div>
      <p className="text-fine text-muted-foreground/60">{formatDate(event.created_at)}</p>
    </div>
  );
}

export function SettingsSheet({ user }: SettingsSheetProps) {
  const { isOpen, close } = useSettingsStore();
  const clearDemo = useDemoStore((s) => s.clear);
  const logs = useDemoStore((s) => s.logs);
  const connectionEvents = useDemoStore((s) => s.connectionEvents);
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const walletAddress = user ? deriveWalletAddress(user.id) : null;
  const displayEmail = user?.email ?? user?.phone ?? "";

  type AnyEvent = { created_at: string; type: "permission"; log: PermissionLog } | { created_at: string; type: "connection"; event: ConnectionEvent };

  const historyItems = useMemo<AnyEvent[]>(() => {
    const items: AnyEvent[] = [
      ...logs.map((log) => ({ created_at: log.created_at, type: "permission" as const, log })),
      ...connectionEvents.map((event) => ({ created_at: event.created_at, type: "connection" as const, event })),
    ];
    return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [logs, connectionEvents]);

  function handleLogout() {
    clearDemo();
    close();
    router.push("/");
  }

  function copyWallet() {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Drawer open={isOpen} onOpenChange={(o) => !o && close()}>
      <DrawerContent className="max-h-[92vh]">
        <div className="flex items-center justify-between px-4 pt-1 pb-4">
          <span className="text-heading font-semibold">Settings</span>
          <button
            onClick={close}
            className="flex size-button items-center justify-center rounded-button text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-4 pb-8 space-y-6">
          {/* Account */}
          <section>
            <p className="text-fine font-semibold uppercase tracking-[0.05em] text-muted-foreground mb-3">
              Account
            </p>
            <div className="rounded-squish border border-border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-small text-muted-foreground">Signed in as</span>
                <span className="text-small font-medium truncate max-w-[180px]">{displayEmail}</span>
              </div>
              {walletAddress && (
                <button
                  onClick={copyWallet}
                  className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted transition-colors"
                >
                  <span className="text-small text-muted-foreground">Wallet</span>
                  <div className="flex items-center gap-2">
                    <span className="text-fine font-mono text-muted-foreground truncate max-w-[120px]">
                      {walletAddress}
                    </span>
                    <Copy size={13} className={cn("shrink-0", copied && "text-success")} />
                  </div>
                </button>
              )}
            </div>
          </section>

          {/* Coming soon sections */}
          <section>
            <p className="text-fine font-semibold uppercase tracking-[0.05em] text-muted-foreground mb-3">
              More
            </p>
            <div className="rounded-squish border border-border overflow-hidden px-4">
              <ComingSoonRow label="Billing" />
              <ComingSoonRow label="Device sync" />
              <ComingSoonRow label="Export my data" />
              <ComingSoonRow label="Account recovery" />
            </div>
          </section>

          {/* Access History */}
          <section>
            <p className="text-fine font-semibold uppercase tracking-[0.05em] text-muted-foreground mb-3">
              Access History
            </p>
            <div className="rounded-squish border border-border overflow-hidden">
              {historyItems.length === 0 ? (
                <p className="px-4 py-3 text-small text-muted-foreground">
                  No activity yet.
                </p>
              ) : (
                historyItems.map((item) =>
                  item.type === "permission"
                    ? <PermissionEntry key={item.log.id} log={item.log} />
                    : <ConnectionEntry key={item.event.id} event={item.event} />
                )
              )}
            </div>
          </section>

          {/* Logout */}
          <Button
            variant="outline"
            fullWidth
            onClick={handleLogout}
            className="text-destructive border-destructive/30 hover:bg-destructive/5"
          >
            <LogOut size={16} />
            Sign out
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
