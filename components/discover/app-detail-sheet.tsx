"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { usePermissionStore } from "@/hooks/use-permission-store";
import type { DiscoverApp } from "@/lib/data/apps";

interface AppDetailSheetProps {
  app: DiscoverApp | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AppDetailSheet({ app, isOpen, onClose }: AppDetailSheetProps) {
  const openPermission = usePermissionStore((s) => s.open);

  if (!app) return null;

  function handleLaunch() {
    onClose();
    setTimeout(() => openPermission(app!), 150);
  }

  return (
    <Drawer open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-[56px] shrink-0 items-center justify-center rounded-[16px] bg-muted text-[28px] leading-none">
              {app.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <DrawerTitle>{app.name}</DrawerTitle>
                {app.verified && (
                  <span className="text-fine font-semibold text-accent bg-accent-surface rounded-pill px-2 py-0.5">
                    Verified
                  </span>
                )}
              </div>
              <DrawerDescription className="mt-0.5">{app.publisher}</DrawerDescription>
            </div>
          </div>
          <p className="text-small text-muted-foreground mt-3">{app.description}</p>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-3">
          <p className="text-small font-semibold">Wants access to:</p>
          <ul className="space-y-2">
            {app.scopes.map((scope) => (
              <li key={scope.name} className="flex items-start gap-2">
                <div className="mt-1.5 size-1.5 rounded-full bg-foreground/30 shrink-0" />
                <div>
                  <p className="text-small font-medium">{scope.name}</p>
                  <p className="text-fine text-muted-foreground">{scope.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <DrawerFooter>
          <Button fullWidth onClick={handleLaunch}>
            Launch {app.name}
          </Button>
          <Button fullWidth variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
