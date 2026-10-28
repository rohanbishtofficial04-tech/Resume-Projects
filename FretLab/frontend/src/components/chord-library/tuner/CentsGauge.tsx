import { cn } from "@/lib/utils";
import { CENTS_RANGE, IN_TUNE_CENTS } from "@/lib/music";

interface CentsGaugeProps {
  cents: number | null;
  className?: string;
}

const WIDTH = 360;
const HEIGHT = 132;
const CENTER = WIDTH / 2;
const HALF = 148;

export default function CentsGauge({ cents, className }: CentsGaugeProps) {
  const clamped = cents === null ? 0 : Math.max(-CENTS_RANGE, Math.min(CENTS_RANGE, cents));
  const x = CENTER + (clamped / CENTS_RANGE) * HALF;
  const inTune = cents !== null && Math.abs(cents) <= IN_TUNE_CENTS;
  const direction = cents === null ? "muted" : inTune ? "tuned" : cents < 0 ? "flat" : "sharp";
  const color =
    direction === "tuned" ? "var(--in-tune)" : direction === "flat" ? "var(--flat)" : direction === "sharp" ? "var(--sharp)" : "var(--muted-foreground)";

  const ticks = [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50];
  const zoneWidth = (IN_TUNE_CENTS / CENTS_RANGE) * HALF;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label="Pitch deviation in cents"
      aria-valuenow={cents === null ? undefined : Math.round(cents)}
      aria-valuemin={-CENTS_RANGE}
      aria-valuemax={CENTS_RANGE}
      data-testid="tuner-cents-gauge"
      data-direction={direction}
    >
      <defs>
        <linearGradient id="fl-gauge-track" x1="0" x2="1">
          <stop offset="0%" stopColor="var(--flat)" stopOpacity="0.55" />
          <stop offset="50%" stopColor="var(--in-tune)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--sharp)" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <rect x={CENTER - HALF} y={78} width={HALF * 2} height={14} rx={7} fill="url(#fl-gauge-track)" />
      <rect
        x={CENTER - zoneWidth}
        y={74}
        width={zoneWidth * 2}
        height={22}
        rx={6}
        fill="none"
        stroke="var(--in-tune)"
        strokeOpacity="0.8"
        strokeWidth="1.5"
      />

      {ticks.map((tick) => {
        const tickX = CENTER + (tick / CENTS_RANGE) * HALF;
        const major = tick % 25 === 0;
        return (
          <g key={tick}>
            <line
              x1={tickX}
              y1={major ? 58 : 64}
              x2={tickX}
              y2={70}
              stroke={major ? "var(--muted-foreground)" : "var(--fret-wire)"}
              strokeWidth={major ? 1.6 : 1}
            />
            {major && (
              <text
                x={tickX}
                y={52}
                textAnchor="middle"
                className="font-mono"
                fontSize="11"
                fill="var(--muted-foreground)"
              >
                {tick > 0 ? `+${tick}` : tick}
              </text>
            )}
          </g>
        );
      })}

      <g
        style={{
          transform: `translateX(${x - CENTER}px)`,
          transition: "transform 130ms cubic-bezier(0.22, 0.61, 0.36, 1)",
        }}
      >
        <line x1={CENTER} y1={22} x2={CENTER} y2={88} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={CENTER} cy={98} r={7} fill={color} />
        {inTune && <circle cx={CENTER} cy={98} r={14} fill="none" stroke={color} strokeOpacity="0.45" strokeWidth="2" />}
      </g>
    </svg>
  );
}

export { IN_TUNE_CENTS };
