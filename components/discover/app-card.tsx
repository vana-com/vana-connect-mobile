import { cn } from "@/lib/utils";
import type { DiscoverApp } from "@/lib/data/apps";

interface AppCardProps {
  app: DiscoverApp;
  lotNumber: number;
  onTap: (app: DiscoverApp) => void;
}

export function AppCard({ app, lotNumber, onTap }: AppCardProps) {
  return (
    <button
      onClick={() => onTap(app)}
      className={cn(
        "flex w-full items-center gap-3 border-[3px] border-real-black bg-background p-3 text-left",
        "shadow-hard-sm transition-[transform,box-shadow] duration-[80ms] ease-[var(--ease-press)]",
        "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      )}
    >
      {/* App icon — sticker treatment */}
      <div
        className="flex size-[52px] shrink-0 items-center justify-center border-[2px] border-real-black bg-muted text-[26px] leading-none"
        style={{ transform: `rotate(${lotNumber % 2 === 0 ? "-4" : "4"}deg)` }}
      >
        {app.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-1.5 mb-0.5 flex-wrap">
          <span className="font-display font-black text-button uppercase leading-none">
            {app.name}
          </span>
          {app.verified && (
            <span className="font-mono text-[9px] font-bold bg-acid-green text-real-black border-[1px] border-real-black px-1 py-0.5 uppercase tracking-wide shrink-0">
              VERIFIED
            </span>
          )}
        </div>
        <p className="text-small text-muted-foreground line-clamp-1 mb-0.5">
          {app.description}
        </p>
        <p className="font-mono text-mono text-muted-foreground uppercase tracking-wide">
          USES {app.scopes.length} {app.scopes.length === 1 ? "SCOPE" : "SCOPES"}
        </p>
      </div>

      {/* Lot number — merch energy */}
      <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-wide text-right shrink-0 leading-tight">
        <div>LOT NO.</div>
        <div className="font-bold">{String(lotNumber).padStart(3, "0")}</div>
      </div>
    </button>
  );
}
