import { cn } from "@/lib/utils";

const STRING_GAP = 26;
const FRET_GAP = 42;
const LEFT = 26;
const TOP = 34;
const RIGHT = 16;
const BOTTOM = 12;
const FRET_COUNT = 5;
const WIDTH = LEFT + 5 * STRING_GAP + RIGHT;
const HEIGHT = TOP + FRET_COUNT * FRET_GAP + BOTTOM;

export interface VoicingDiagramData {
  frets: number[];
  fingers: number[];
  startFret: number;
  barre: { fret: number; fromString: number; toString: number } | null;
}

interface FretboardDiagramProps extends VoicingDiagramData {
  title: string;
  className?: string;
  /** 0 = highest string index drawn on the left (standard diagram orientation). */
  testId?: string;
}

export function describeFrets(frets: number[]): string {
  const parts = frets.map((fret) => (fret < 0 ? "muted" : fret === 0 ? "open" : `fret ${fret}`));
  return ["low E", "A", "D", "G", "B", "high e"]
    .map((name, index) => `${name}: ${parts[index]}`)
    .join(", ");
}

export default function FretboardDiagram({
  frets,
  fingers,
  startFret,
  barre,
  title,
  className,
  testId,
}: FretboardDiagramProps) {
  const stringX = (index: number) => LEFT + index * STRING_GAP;
  const wireY = (index: number) => TOP + index * FRET_GAP;
  const dotY = (fret: number) => TOP + (fret - startFret + 0.5) * FRET_GAP;

  const inlayMarkers: { fret: number; dots: number[] }[] = [];
  for (let i = 0; i < FRET_COUNT; i += 1) {
    const absolute = startFret + i;
    if (absolute === 12 || absolute === 24) inlayMarkers.push({ fret: absolute, dots: [-0.5, 0.5] });
    else if ([3, 5, 7, 9, 15, 17, 19, 21].includes(absolute)) inlayMarkers.push({ fret: absolute, dots: [0] });
  }

  const ariaLabel = `${title} guitar chord diagram. ${describeFrets(frets)}.`;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={ariaLabel}
      data-testid={testId}
      className={cn("h-auto w-full", className)}
    >
      {/* inlay markers */}
      {inlayMarkers.map(({ fret, dots }) =>
        dots.map((offset, i) => (
          <circle
            key={`${fret}-${i}`}
            cx={LEFT + 2.5 * STRING_GAP + offset * STRING_GAP}
            cy={dotY(fret)}
            r={4}
            fill="var(--fret-wire)"
            opacity="0.5"
          />
        )),
      )}

      {/* fret wires */}
      {Array.from({ length: FRET_COUNT + 1 }).map((_, i) => (
        <line
          key={`wire-${i}`}
          x1={LEFT}
          y1={wireY(i)}
          x2={LEFT + 5 * STRING_GAP}
          y2={wireY(i)}
          stroke="var(--fret-wire)"
          strokeWidth={startFret === 1 && i === 0 ? 5 : 1.5}
          strokeLinecap={startFret === 1 && i === 0 ? "round" : "butt"}
        />
      ))}

      {/* strings */}
      {Array.from({ length: 6 }).map((_, string) => (
        <line
          key={`string-${string}`}
          x1={stringX(string)}
          y1={TOP}
          x2={stringX(string)}
          y2={wireY(FRET_COUNT)}
          stroke="var(--string-line)"
          strokeWidth={string === 0 ? 2 : string === 5 ? 1 : 1.5}
        />
      ))}

      {/* barre */}
      {barre && (
        <rect
          x={stringX(barre.fromString) - 9}
          y={dotY(barre.fret) - 9}
          width={stringX(barre.toString) - stringX(barre.fromString) + 18}
          height={18}
          rx={9}
          fill="var(--primary)"
        />
      )}

      {/* open / muted markers */}
      {frets.map((fret, string) => {
        if (fret > 0) return null;
        const x = stringX(string);
        const y = TOP - 15;
        return fret === 0 ? (
          <circle
            key={`marker-${string}`}
            cx={x}
            cy={y}
            r={5}
            fill="none"
            stroke="var(--in-tune)"
            strokeWidth="1.6"
          />
        ) : (
          <g key={`marker-${string}`} stroke="var(--flat)" strokeWidth="1.6" strokeLinecap="round">
            <line x1={x - 4} y1={y - 4} x2={x + 4} y2={y + 4} />
            <line x1={x + 4} y1={y - 4} x2={x - 4} y2={y + 4} />
          </g>
        );
      })}

      {/* finger dots */}
      {frets.map((fret, string) => {
        if (fret <= 0) return null;
        const isBarre = barre !== null && barre.fret === fret;
        return (
          <g key={`dot-${string}`}>
            <circle
              cx={stringX(string)}
              cy={dotY(fret)}
              r={isBarre && barre.fromString !== barre.toString ? 7 : 9}
              fill="var(--primary)"
            />
            {!isBarre && (
              <text
                x={stringX(string)}
                y={dotY(fret) + 3.5}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="var(--primary-foreground)"
                className="font-mono"
              >
                {fingers[string] > 0 ? fingers[string] : ""}
              </text>
            )}
          </g>
        );
      })}

      {/* position label when the nut is off-screen */}
      {startFret > 1 && (
        <text
          x={LEFT - 8}
          y={wireY(0) + 14}
          textAnchor="end"
          fontSize="12"
          fontWeight="700"
          className="font-mono"
          fill="var(--muted-foreground)"
        >
          {startFret}
        </text>
      )}
    </svg>
  );
}
