"use client";

import { useSettingsStore } from "@/hooks/use-settings-store";
import { cn } from "@/lib/utils";

interface ScreenHeaderProps {
  title: string;
  eyebrow?: string;
  className?: string;
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M10 2v2M10 16v2M2 10h2M16 10h2M4.1 4.1l1.4 1.4M14.5 14.5l1.4 1.4M4.1 15.9l1.4-1.4M14.5 5.5l1.4-1.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function ScreenHeader({ title, eyebrow, className }: ScreenHeaderProps) {
  const openSettings = useSettingsStore((s) => s.open);

  return (
    <header
      className={cn(
        "flex h-header items-center justify-between px-inset",
        "border-b-[3px] border-foreground bg-background",
        "sticky top-0 z-20 safe-area-top",
        className
      )}
    >
      <div className="flex flex-col gap-0">
        {eyebrow && (
          <span className="font-mono text-mono uppercase tracking-widest text-muted-foreground leading-none mb-0.5">
            {eyebrow}
          </span>
        )}
        <span className="font-display font-black text-heading uppercase tracking-tight leading-none">
          {title}
        </span>
      </div>
      <button
        onClick={openSettings}
        className="flex size-[40px] items-center justify-center border-[2px] border-foreground shadow-hard-xs text-foreground transition-[transform,box-shadow] duration-[80ms] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
        aria-label="Open settings"
      >
        <SettingsIcon />
      </button>
    </header>
  );
}
