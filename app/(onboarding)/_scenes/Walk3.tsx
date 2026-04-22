interface SceneProps {
  onGetStarted: () => void;
}

const STICKER_COLORS = [
  { bg: "#F9F000", fg: "#000000" },
  { bg: "#E63946", fg: "#F7F5EE" },
  { bg: "#0051FF", fg: "#F7F5EE" },
  { bg: "#39FF14", fg: "#000000" },
  { bg: "#FF2D9F", fg: "#F7F5EE" },
  { bg: "#00A7E1", fg: "#F7F5EE" },
  { bg: "#F9F000", fg: "#000000" },
  { bg: "#000000", fg: "#F7F5EE" },
  { bg: "#E63946", fg: "#F7F5EE" },
];

const ROTATIONS = [-3, 2, -1, 4, -2, 3, -4, 1, -3];

export function Walk3({ onGetStarted }: SceneProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-newsprint">
      {/* Barbara Kruger red bar at top */}
      <div
        className="absolute top-0 left-0 right-0 z-20 bg-sticker-red px-inset"
        style={{ paddingTop: "max(env(safe-area-inset-top), 16px)", paddingBottom: 12 }}
      >
        <span
          className="font-display font-black uppercase [color:var(--background)] leading-tight"
          style={{ fontSize: "clamp(24px, 7vw, 36px)", letterSpacing: "-0.02em" }}
        >
          UNDER YOUR CONTROL
        </span>
      </div>

      {/* 3×3 sticker grid */}
      <div
        className="absolute left-inset right-inset grid grid-cols-3 gap-3"
        style={{ top: "18%" }}
      >
        {STICKER_COLORS.map((color, i) => (
          <div
            key={i}
            className="aspect-square border-[3px] border-real-black flex items-center justify-center"
            style={{
              backgroundColor: color.bg,
              color: color.fg,
              boxShadow: "4px 4px 0 #000",
              transform: `rotate(${ROTATIONS[i]}deg)`,
              ...(i === 4 ? { transform: "rotate(8deg) scaleY(0.85)", transformOrigin: "bottom center" } : {}),
            }}
          >
            {i === 4 && (
              <span
                className="font-mono text-fine font-bold uppercase tracking-wide"
                style={{ color: color.fg }}
              >
                PEELED
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Arrow + annotation */}
      <svg
        className="absolute pointer-events-none"
        style={{ top: "64%", left: "36%", width: 100, height: 50 }}
        viewBox="0 0 100 50"
        fill="none"
      >
        <path
          d="M10 40 C30 35, 60 25, 85 10"
          stroke="#000" strokeWidth="2.5" strokeLinecap="round"
        />
        <polyline
          points="79,6 87,12 80,18"
          stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
        />
      </svg>
      <span
        className="absolute font-mono text-fine font-bold text-real-black uppercase tracking-wide"
        style={{ top: "65%", left: "5%", transform: "rotate(-3deg)" }}
      >
        you pick →
      </span>

      {/* Barcode + lot number — bottom-left corner */}
      <div
        className="absolute bottom-40 left-inset font-mono text-[9px] text-muted-foreground uppercase tracking-widest leading-tight"
      >
        <div className="flex gap-0.5 mb-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="bg-real-black"
              style={{ width: i % 3 === 0 ? 2 : 1, height: 18 }}
            />
          ))}
        </div>
        <div>LOT NO. 03</div>
      </div>

      {/* CTA button */}
      <div
        className="absolute bottom-0 left-0 right-0 px-inset"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 32px)" }}
      >
        <button
          onClick={onGetStarted}
          style={{ transform: "rotate(-1.5deg)", transformOrigin: "center" }}
          className="w-full h-[52px] bg-real-black [color:var(--background)] border-[3px] border-real-black font-display font-black uppercase text-button tracking-wide shadow-[4px_4px_0_rgba(0,0,0,0.3)] transition-[transform,box-shadow] duration-[80ms] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
        >
          GET STARTED →
        </button>
      </div>
    </div>
  );
}
