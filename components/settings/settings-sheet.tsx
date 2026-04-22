"use client";

import { Copy, LogOut, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useSettingsStore } from "@/hooks/use-settings-store";
import { useDemoStore } from "@/hooks/use-demo-store";
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

export function SettingsSheet({ user }: SettingsSheetProps) {
  const { isOpen, close } = useSettingsStore();
  const clearDemo = useDemoStore((s) => s.clear);
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const walletAddress = user ? deriveWalletAddress(user.id) : null;
  const displayEmail = user?.email ?? user?.phone ?? "";

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
