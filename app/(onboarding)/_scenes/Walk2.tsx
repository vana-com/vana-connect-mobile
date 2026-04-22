interface SceneProps {
  onNext: () => void;
  onSkip: () => void;
}

export function Walk2({ onNext, onSkip }: SceneProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Split background */}
      <div className="absolute inset-0 flex">
        <div className="flex-1 bg-highlighter" />
        <div className="flex-1 bg-electric-blue" />
      </div>

      {/* Skip */}
      <div className="absolute top-4 right-4 z-20" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <button
          onClick={onSkip}
          className="font-mono text-fine font-bold uppercase tracking-widest border-[2px] border-real-black bg-newsprint text-real-black px-2.5 py-1.5 shadow-[2px_2px_0_#000]"
        >
          SKIP
        </button>
      </div>

      {/* Eyebrow */}
      <div className="absolute top-16 left-inset z-10" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <span className="font-mono text-mono uppercase tracking-widest text-real-black/60">
          02 / 03 · WHAT YOUR CONTEXT CAN DO
        </span>
      </div>

      {/* Giant headline crossing the split */}
      <div
        className="absolute left-0 right-0 z-10 px-inset"
        style={{ top: "22%" }}
      >
        <h1
          className="font-display font-black text-real-black leading-[0.85] tracking-[-0.05em] uppercase"
          style={{ fontSize: "clamp(100px, 32vw, 180px)" }}
        >
          POWER.
        </h1>
      </div>

      {/* Small media object — bottom left of yellow area */}
      <div
        className="absolute border-[3px] border-real-black bg-newsprint flex items-center justify-center"
        style={{
          top: "62%",
          left: "5%",
          width: "38%",
          aspectRatio: "1",
          boxShadow: "5px 5px 0 #000",
          transform: "rotate(3deg)",
        }}
      >
        <span style={{ fontSize: 52 }}>💿</span>
      </div>

      {/* Speech bubble */}
      <div
        className="absolute border-[3px] border-real-black bg-sticker-red [color:var(--background)] font-mono text-fine font-bold uppercase tracking-wide px-2.5 py-1.5"
        style={{
          bottom: "22%",
          left: "5%",
          transform: "rotate(-4deg)",
          boxShadow: "3px 3px 0 #000",
        }}
      >
        this is yours →
      </div>

      {/* Sunburst badge */}
      <div
        className="absolute border-[3px] border-real-black bg-highlighter text-real-black font-display font-black text-small uppercase text-center px-3 py-2"
        style={{
          bottom: "24%",
          right: "4%",
          transform: "rotate(-15deg)",
          boxShadow: "4px 4px 0 #000",
        }}
      >
        <div className="text-heading leading-none">★</div>
        <div className="font-mono text-fine tracking-widest">NEW!</div>
      </div>

      {/* CTA */}
      <div
        className="absolute bottom-0 left-0 right-0 px-inset"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 32px)" }}
      >
        <button
          onClick={onNext}
          className="w-full h-[52px] bg-real-black [color:var(--background)] border-[3px] border-real-black font-display font-black uppercase text-button tracking-wide shadow-[4px_4px_0_rgba(0,0,0,0.3)] transition-[transform,box-shadow] duration-[80ms] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
        >
          CONTINUE →
        </button>
      </div>
    </div>
  );
}
