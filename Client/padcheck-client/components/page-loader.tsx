import { cn } from "@/lib/utils";

type PageLoaderProps = {
  label?: string;
  fullscreen?: boolean;
  className?: string;
};

export function PageLoader({
  label = "Loading…",
  fullscreen = true,
  className,
}: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-background",
        fullscreen ? "min-h-screen w-full" : "w-full py-16",
        className,
      )}
    >
      {/* soft ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 45%, color-mix(in oklab, var(--primary) 10%, transparent), transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-7">
        {/* House mark with concentric pulse rings */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-border/60 [animation:pl-ring_2.4s_ease-out_infinite]" />
          <span className="absolute inset-0 rounded-full border border-border/40 [animation:pl-ring_2.4s_ease-out_infinite] [animation-delay:0.8s]" />
          <span className="absolute inset-0 rounded-full border border-border/30 [animation:pl-ring_2.4s_ease-out_infinite] [animation-delay:1.6s]" />

          <span
            className="absolute inset-3 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 50% 40%, color-mix(in oklab, var(--primary) 18%, var(--background)), var(--background) 75%)",
            }}
          />

          <svg
            viewBox="0 0 48 48"
            className="relative h-10 w-10 text-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path
              d="M8 22 L24 9 L40 22 V39 H8 Z"
              className="[stroke-dasharray:120] [stroke-dashoffset:120] [animation:pl-draw_2.4s_ease-in-out_infinite]"
            />
            <path
              d="M20 39 V28 H28 V39"
              className="opacity-80 [stroke-dasharray:40] [stroke-dashoffset:40] [animation:pl-draw_2.4s_ease-in-out_infinite] [animation-delay:0.4s]"
            />
          </svg>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <span className="font-serif text-2xl tracking-tight text-foreground">
            PadCheck
          </span>
          <span className="flex items-center gap-1.5 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <span className="inline-block h-px w-6 bg-border" />
            {label}
            <span className="inline-block h-px w-6 bg-border" />
          </span>
        </div>
      </div>

      <style>{`
        @keyframes pl-ring {
          0%   { transform: scale(0.6); opacity: 0.7; }
          80%  { opacity: 0; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes pl-draw {
          0%   { stroke-dashoffset: 120; }
          50%  { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -120; }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="pl-ring"], [class*="pl-draw"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

export default PageLoader;