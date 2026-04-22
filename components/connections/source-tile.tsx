import { cn } from "@/lib/utils";
import type { ConnectionState, DataSource } from "@/lib/data/connections";

const SOURCE_COLORS: Record<string, { bg: string; fg: string }> = {
  "spotify":      { bg: "#1DB954", fg: "#000000" },
  "gmail":        { bg: "#EA4335", fg: "#F7F5EE" },
  "instagram":    { bg: "#E1306C", fg: "#F7F5EE" },
  "strava":       { bg: "#FC4C02", fg: "#F7F5EE" },
  "notion":       { bg: "#000000", fg: "#F7F5EE" },
  "x":            { bg: "#000000", fg: "#F7F5EE" },
  "github":       { bg: "#24292E", fg: "#F7F5EE" },
  "youtube":      { bg: "#FF0000", fg: "#F7F5EE" },
  "kindle":       { bg: "#FF9900", fg: "#000000" },
  "substack":     { bg: "#FF6719", fg: "#F7F5EE" },
  "apple-health": { bg: "#FA2D48", fg: "#F7F5EE" },
  "linkedin":     { bg: "#0A66C2", fg: "#F7F5EE" },
};
const FALLBACK = { bg: "#ECEAE2", fg: "#000000" };

interface SourceTileProps {
  source: DataSource;
  state: ConnectionState;
  onTap: (source: DataSource) => void;
}

export function SourceTile({ source, state, onTap }: SourceTileProps) {
  const isConnected = state !== "none";
  const colors = SOURCE_COLORS[source.id] ?? FALLBACK;
  const bgColor = isConnected ? colors.bg : "#ECEAE2";
  const fgColor = isConnected ? colors.fg : "#666660";

  return (
    <button
      onClick={() => onTap(source)}
      style={{
        backgroundColor: bgColor,
        boxShadow: "4px 4px 0 #000",
        color: fgColor,
      }}
      className={cn(
        "relative flex flex-col items-center justify-center gap-1.5 border-[3px] border-real-black aspect-square p-2",
        "transition-[transform,box-shadow] duration-[80ms] ease-[var(--ease-press)]",
        "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      )}
    >
      {/* DESKTOP banner for deep state */}
      {state === "deep" && (
        <div
          className="absolute top-2 left-[-4px] right-[-4px] bg-electric-blue [color:var(--background)] font-mono text-[8px] font-bold uppercase tracking-widest text-center py-0.5 border-y-[2px] border-real-black"
          style={{ transform: "rotate(-3deg)" }}
        >
          DESKTOP
        </div>
      )}

      <span className="text-[26px] leading-none">{source.emoji}</span>
      <span className="font-mono text-mono font-bold uppercase tracking-wide leading-none text-center">
        {source.name}
      </span>

      {/* Live badge */}
      {isConnected && state !== "deep" && (
        <div className="flex items-center gap-1">
          <div
            className="size-1.5 rounded-full bg-acid-green border border-real-black"
            style={{ animation: "pulseDot 2s ease-in-out infinite" }}
          />
          <span className="font-mono text-[8px] font-bold uppercase tracking-wide">LIVE</span>
        </div>
      )}
    </button>
  );
}
