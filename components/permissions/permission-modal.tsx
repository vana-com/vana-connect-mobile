"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/components/ui/drawer";
import { usePermissionStore } from "@/hooks/use-permission-store";
import { useDemoStore } from "@/hooks/use-demo-store";

const DURATION = "30 days";

export function PermissionModal() {
  const { isOpen, app, close } = usePermissionStore();
  const addLog = useDemoStore((s) => s.addLog);
  const [approved, setApproved] = useState(false);

  if (!app) return null;

  function handleApprove() {
    addLog({
      app_name: app!.name,
      scopes: app!.scopes.map((s) => s.name),
      duration: DURATION,
      outcome: "approve",
    });
    setApproved(true);
    setTimeout(() => {
      setApproved(false);
      close();
    }, 1500);
  }

  function handleDeny() {
    addLog({
      app_name: app!.name,
      scopes: app!.scopes.map((s) => s.name),
      duration: DURATION,
      outcome: "deny",
    });
    close();
  }

  return (
    <Drawer open={isOpen} onOpenChange={(o) => !o && close()}>
      <DrawerContent overlayClassName="bg-black/60" className="border-t-[4px] border-real-black">
        {approved ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 gap-4">
            <div className="flex size-16 items-center justify-center border-[3px] border-real-black bg-acid-green shadow-hard-sm">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <polyline points="4,14 11,21 24,7" stroke="#000" strokeWidth="3" strokeLinecap="square" />
              </svg>
            </div>
            <p className="font-display font-black text-heading uppercase">ACCESS GRANTED</p>
            <p className="text-small text-muted-foreground text-center font-mono uppercase tracking-wide">
              {app.name} can access your data for {DURATION}.
            </p>
          </div>
        ) : (
          <>
            {/* Eyebrow bar */}
            <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b-[3px] border-real-black bg-sticker-red">
              <div
                className="size-2 rounded-full bg-newsprint"
                style={{ animation: "pulseDot 1.5s ease-in-out infinite" }}
              />
              <span className="font-mono text-fine font-bold uppercase tracking-widest [color:var(--background)]">
                PERMISSION REQUEST
              </span>
            </div>

            {/* App identity */}
            <div className="flex items-center gap-3 px-4 pt-3 pb-4 border-b-[3px] border-real-black">
              <div
                className="flex size-[52px] shrink-0 items-center justify-center border-[2px] border-real-black bg-muted text-[26px] leading-none"
                style={{ transform: "rotate(-5deg)", boxShadow: "3px 3px 0 #000" }}
              >
                {app.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-display font-black text-heading uppercase leading-none block">
                  {app.name}
                </span>
                <p className="font-mono text-fine uppercase tracking-wide text-muted-foreground">
                  {app.publisher}
                  {app.verified && (
                    <span className="ml-2 text-acid-green font-bold">✓ VERIFIED</span>
                  )}
                </p>
              </div>
              <div
                className="font-mono text-fine font-bold border-[2px] border-real-black px-2 py-1 uppercase tracking-wide bg-sticker-red [color:var(--background)] shrink-0"
                style={{ transform: "rotate(-2deg)" }}
              >
                {DURATION}
              </div>
            </div>

            {/* Ask */}
            <div className="px-4 py-3 border-b-[3px] border-real-black">
              <p className="text-small leading-relaxed">
                <span className="font-bold">{app.name}</span> wants your{" "}
                <span className="bg-highlighter text-real-black px-0.5 font-bold">
                  {app.scopes
                    .map((s) => s.name.toLowerCase())
                    .join(", ")
                    .replace(/, ([^,]*)$/, " and $1")}
                </span>{" "}
                for the next {DURATION}.
              </p>
            </div>

            {/* Scopes */}
            <div className="px-4 py-3 border-b-[3px] border-real-black space-y-2">
              {app.scopes.map((scope) => (
                <div key={scope.name} className="flex items-start gap-2.5">
                  <div className="mt-1 size-2 rounded-full bg-sticker-red border border-real-black shrink-0" />
                  <div>
                    <p className="text-small font-bold uppercase leading-snug">{scope.name}</p>
                    <p className="text-fine text-muted-foreground">{scope.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <DrawerFooter className="pt-3">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDeny}
                >
                  DENY
                </Button>
                <Button
                  className="flex-[1.35]"
                  onClick={handleApprove}
                >
                  APPROVE
                </Button>
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="font-mono text-fine text-muted-foreground flex items-center gap-1.5 uppercase tracking-wide">
                  <span
                    className="size-1.5 rounded-full bg-acid-green border border-real-black inline-block"
                    style={{ animation: "pulseDot 2s ease-in-out infinite" }}
                  />
                  Logged to audit trail
                </p>
                <button className="font-mono text-fine text-muted-foreground underline underline-offset-2 uppercase tracking-wide">
                  Adjust scopes
                </button>
              </div>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
