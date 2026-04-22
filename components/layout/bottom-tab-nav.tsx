"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

function MemoryIcon({ active }: { active: boolean }) {
  const w = active ? 2.5 : 2;
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="18" height="5" stroke="currentColor" strokeWidth={w} />
      <rect x="2" y="10" width="18" height="5" stroke="currentColor" strokeWidth={w} />
      <rect x="2" y="17" width="12" height="3" stroke="currentColor" strokeWidth={w} />
    </svg>
  );
}

function ConnectionsIcon({ active }: { active: boolean }) {
  const w = active ? 2.5 : 2;
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="1" y="8" width="8" height="6" stroke="currentColor" strokeWidth={w} />
      <rect x="13" y="8" width="8" height="6" stroke="currentColor" strokeWidth={w} />
      <line x1="9" y1="11" x2="13" y2="11" stroke="currentColor" strokeWidth={w} />
    </svg>
  );
}

function DiscoverIcon({ active }: { active: boolean }) {
  const w = active ? 2.5 : 2;
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <line x1="11" y1="2" x2="11" y2="20" stroke="currentColor" strokeWidth={w} />
      <line x1="2" y1="11" x2="20" y2="11" stroke="currentColor" strokeWidth={w} />
      <line x1="4.7" y1="4.7" x2="17.3" y2="17.3" stroke="currentColor" strokeWidth={w} />
      <line x1="17.3" y1="4.7" x2="4.7" y2="17.3" stroke="currentColor" strokeWidth={w} />
    </svg>
  );
}

const tabs = [
  { href: "/memory",      label: "MEMORY",      Icon: MemoryIcon },
  { href: "/connections", label: "SOURCES",      Icon: ConnectionsIcon },
  { href: "/discover",    label: "DISCOVER",     Icon: DiscoverIcon },
] as const;

export function BottomTabNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 inset-x-0 z-30",
        "sm:absolute",
        "h-tab safe-area-bottom",
        "bg-background border-t-[3px] border-foreground",
        "flex items-stretch"
      )}
    >
      {tabs.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-1 py-2",
              "font-mono text-mono uppercase tracking-widest",
              active ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {active && (
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-sticker-red" />
            )}
            <Icon active={active} />
            <span className={cn("leading-none", active ? "font-bold" : "font-normal")}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
