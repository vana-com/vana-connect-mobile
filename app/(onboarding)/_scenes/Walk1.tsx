import Image from "next/image";

interface SceneProps {
  onNext: () => void;
  onSkip: () => void;
}

export function Walk1({ onNext, onSkip }: SceneProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-sticker-red">
      {/* Skip */}
      <div className="absolute top-4 right-4 z-20" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <button
          onClick={onSkip}
          className="font-mono text-fine font-bold uppercase tracking-widest border-[2px] border-real-black bg-newsprint text-real-black px-2.5 py-1.5 shadow-[2px_2px_0_#000]"
        >
          SKIP
        </button>
      </div>

      {/* Photo cutouts — scattered on the red field */}
      <div
        className="absolute border-[3px] border-real-black overflow-hidden"
        style={{
          top: "6%",
          left: "-6%",
          width: "58%",
          aspectRatio: "3/4",
          transform: "rotate(-9deg)",
          boxShadow: "6px 6px 0 #000",
        }}
      >
        <Image src="/onboarding/slide1.png" alt="" fill className="object-cover" priority />
      </div>

      <div
        className="absolute border-[3px] border-real-black overflow-hidden"
        style={{
          top: "22%",
          right: "0%",
          width: "46%",
          aspectRatio: "2/3",
          transform: "rotate(7deg)",
          boxShadow: "6px 6px 0 #000",
        }}
      >
        <Image src="/onboarding/slide2.png" alt="" fill className="object-cover" />
      </div>

      {/* Hand-drawn arrow pointing at slide2 */}
      <svg
        className="absolute pointer-events-none"
        style={{ top: "36%", right: "43%", width: 80, height: 60, zIndex: 10 }}
        viewBox="0 0 80 60"
        fill="none"
      >
        <path
          d="M10 50 C20 30, 50 20, 68 8"
          stroke="#000" strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray="0"
        />
        <polyline points="62,5 70,10 63,16" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <span
        className="absolute font-mono text-fine font-bold text-real-black uppercase tracking-wide"
        style={{ top: "36%", right: "43%", transform: "rotate(-8deg)", zIndex: 10 }}
      >
        who owns this?
      </span>

      {/* Bottom area: headline + CTA */}
      <div
        className="absolute bottom-0 left-0 right-0 px-inset"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 32px)" }}
      >
        <h1
          className="font-display font-black uppercase text-real-black leading-[0.9] tracking-[-0.04em] mb-6"
          style={{ fontSize: "clamp(56px, 16vw, 88px)" }}
        >
          YOUR LIFE IS IN PIECES.
        </h1>

        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-mono text-real-black/50 uppercase tracking-widest">01 / 03</span>
        </div>
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
