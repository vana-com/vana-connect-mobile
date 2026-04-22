"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/components/ui/drawer";
import type { DataSource } from "@/lib/data/connections";

const DEEP_CONNECTOR_URL = "https://vana.com/connect/desktop";

interface DeepConnectSheetProps {
  source: DataSource | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeepConnectSheet({ source, isOpen, onClose }: DeepConnectSheetProps) {
  const [emailSent, setEmailSent] = useState(false);

  if (!source) return null;

  function handleEmailLink() {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  }

  return (
    <Drawer open={isOpen} onOpenChange={o => !o && onClose()}>
      <DrawerContent>
        {/* Red eyebrow bar */}
        <div className="bg-sticker-red border-b-[3px] border-real-black px-4 py-3">
          <p className="font-display font-black text-heading uppercase leading-tight tracking-tight [color:var(--background)]">
            DESKTOP REQUIRED.
          </p>
        </div>

        <div className="px-4 pt-5 pb-2 space-y-5">
          {/* Context */}
          <div>
            <p className="font-mono text-small font-bold uppercase tracking-wide mb-1">
              {source.name} deep connection
            </p>
            <p className="font-mono text-fine text-muted-foreground leading-relaxed">
              {source.deepDescription ?? `Deep ${source.name} access requires the Vana desktop app to process your full data export.`}
            </p>
          </div>

          {/* Deep scopes — show source-specific ones, or generic fallback */}
          <div>
            <p className="font-mono text-fine font-bold uppercase tracking-widest text-muted-foreground mb-2">
              UNLOCKS
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(source.deepScopes ?? ["Full data export", "Extended history", "Raw metadata"]).map(scope => (
                <span
                  key={scope}
                  className="font-mono text-fine uppercase tracking-wide border-[2px] border-electric-blue text-electric-blue px-2 py-0.5"
                >
                  {scope}
                </span>
              ))}
            </div>
          </div>

          {/* QR + instructions */}
          <div className="border-[3px] border-real-black p-4 flex flex-col items-center gap-4 shadow-hard-sm">
            <p className="font-mono text-fine uppercase tracking-widest text-muted-foreground self-start">
              SCAN TO DOWNLOAD
            </p>
            <div className="border-[2px] border-real-black p-3 bg-background">
              <QRCodeSVG
                value={DEEP_CONNECTOR_URL}
                size={140}
                bgColor="transparent"
                fgColor="currentColor"
                className="text-foreground"
              />
            </div>
            <p className="font-mono text-fine text-muted-foreground text-center">
              Or open on your computer:
            </p>
            <p className="font-mono text-fine font-bold tracking-wide border-b-[2px] border-real-black pb-0.5">
              vana.com/connect/desktop
            </p>
          </div>

          {/* Email link */}
          <button
            onClick={handleEmailLink}
            className="w-full py-3 font-mono text-small font-bold uppercase tracking-wide border-[2px] border-real-black bg-transparent cursor-pointer transition-colors hover:bg-muted"
          >
            {emailSent ? "✓ LINK SENT TO YOUR EMAIL" : "EMAIL ME THE LINK"}
          </button>
        </div>

        <DrawerFooter className="border-t-[3px] border-real-black pt-3">
          <Button fullWidth variant="outline" onClick={onClose}>
            DONE FOR NOW
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
