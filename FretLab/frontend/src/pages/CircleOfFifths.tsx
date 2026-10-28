import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { playStrum, stopAllTones } from "@/lib/audio/tones";
import { freqFromMidi, NOTE_NAMES } from "@/lib/music";

const FIFTHS_ORDER = ["C", "G", "D", "A", "E", "B", "F#", "C#", "G#", "D#", "A#", "F"];
const MODES = [
  { name: "Ionian", formula: "1 2 3 4 5 6 7", intervals: [0, 2, 4, 5, 7, 9, 11], numerals: ["I", "ii", "iii", "IV", "V", "vi", "vii°"] },
  { name: "Dorian", formula: "1 2 b3 4 5 6 b7", intervals: [0, 2, 3, 5, 7, 9, 10], numerals: ["i", "ii", "bIII", "IV", "v", "vi°", "bVII"] },
  { name: "Phrygian", formula: "1 b2 b3 4 5 b6 b7", intervals: [0, 1, 3, 5, 7, 8, 10], numerals: ["i", "bII", "bIII", "iv", "v°", "bVI", "bvii"] },
  { name: "Lydian", formula: "1 2 3 #4 5 6 7", intervals: [0, 2, 4, 6, 7, 9, 11], numerals: ["I", "II", "iii", "#iv°", "V", "vi", "vii"] },
  { name: "Mixolydian", formula: "1 2 3 4 5 6 b7", intervals: [0, 2, 4, 5, 7, 9, 10], numerals: ["I", "ii", "iii°", "IV", "v", "vi", "bVII"] },
  { name: "Aeolian", formula: "1 2 b3 4 5 b6 b7", intervals: [0, 2, 3, 5, 7, 8, 10], numerals: ["i", "ii°", "bIII", "iv", "v", "bVI", "bVII"] },
  { name: "Locrian", formula: "1 b2 b3 4 b5 b6 b7", intervals: [0, 1, 3, 5, 6, 8, 10], numerals: ["i°", "bII", "biii", "iv", "bV", "bVI", "bvii"] },
] as const;

const CENTER = 200;
const OUTER_INNER_RADIUS = 128;
const OUTER_RADIUS = 184;
const INNER_RADIUS = 80;
const MODE_RADIUS = 127;
const VIEW_SIZE = CENTER * 2;

function pointAt(radius: number, degrees: number): [number, number] {
  const radians = (degrees * Math.PI) / 180;
  return [CENTER + radius * Math.cos(radians), CENTER + radius * Math.sin(radians)];
}

function annularSectorPath(innerRadius: number, outerRadius: number, startAngle: number, endAngle: number): string {
  const [outerStartX, outerStartY] = pointAt(outerRadius, startAngle);
  const [outerEndX, outerEndY] = pointAt(outerRadius, endAngle);
  const [innerEndX, innerEndY] = pointAt(innerRadius, endAngle);
  const [innerStartX, innerStartY] = pointAt(innerRadius, startAngle);
  return [
    `M ${outerStartX} ${outerStartY}`,
    `A ${outerRadius} ${outerRadius} 0 0 1 ${outerEndX} ${outerEndY}`,
    `L ${innerEndX} ${innerEndY}`,
    `A ${innerRadius} ${innerRadius} 0 0 0 ${innerStartX} ${innerStartY}`,
    "Z",
  ].join(" ");
}

export default function CircleOfFifths() {
  const [root, setRoot] = useState("C");
  const [modeName, setModeName] = useState<string>("Ionian");
  const mode = MODES.find((item) => item.name === modeName) ?? MODES[0];
  const rootPitchClass = NOTE_NAMES.indexOf(root as (typeof NOTE_NAMES)[number]);
  const rootMidi = 60 + rootPitchClass;
  const notes = useMemo(
    () => mode.intervals.map((interval) => NOTE_NAMES[(rootPitchClass + interval) % NOTE_NAMES.length]),
    [mode, rootPitchClass],
  );
  const chords = useMemo(
    () =>
      mode.intervals.map((_, degree) => {
        const third = mode.intervals[(degree + 2) % mode.intervals.length] + (degree > 4 ? 12 : 0);
        const fifth = mode.intervals[(degree + 4) % mode.intervals.length] + (degree > 2 ? 12 : 0);
        const intervals = [0, third - mode.intervals[degree], fifth - mode.intervals[degree]];
        const quality = intervals[1] === 3 && intervals[2] === 6 ? "dim" : intervals[1] === 3 ? "m" : "";
        return `${notes[degree]}${quality}`;
      }),
    [mode, notes],
  );
  const chordFrequencies = (degree: number) => {
    const thirdIndex = degree + 2;
    const fifthIndex = degree + 4;
    const third = mode.intervals[thirdIndex % mode.intervals.length] + (thirdIndex >= mode.intervals.length ? 12 : 0);
    const fifth = mode.intervals[fifthIndex % mode.intervals.length] + (fifthIndex >= mode.intervals.length ? 12 : 0);
    return [
      rootMidi + mode.intervals[degree],
      rootMidi + third,
      rootMidi + fifth,
    ].map(freqFromMidi);
  };
  const playChord = (degree: number) => {
    const frequencies = chordFrequencies(degree);
    stopAllTones();
    playStrum(frequencies);
  };

  return (
    <div className="-mb-4 -mt-4 flex flex-col gap-2 sm:gap-3">
      <section className="fl-rise text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Key relationships</p>
        <h1 className="mt-0.5 font-heading text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">Circle of Fifths</h1>
        <p className="mx-auto mt-0.5 max-w-2xl text-xs text-muted-foreground sm:text-sm">
          Explore key signatures, modal scale notes, and diatonic chords.
        </p>
      </section>

      <Card className="fl-rise fl-rise-1" data-testid="circle-of-fifths">
        <CardContent className="grid items-center gap-4 p-3 sm:p-4 md:grid-cols-[minmax(320px,1.1fr)_minmax(0,1fr)] md:gap-5 lg:p-5">
          <div className="mx-auto w-full max-w-[460px]">
            <svg
              viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
              role="group"
              aria-label={`Circle of fifths, selected ${root} ${mode.name}`}
              data-testid="circle-wheel"
              className="h-auto w-full"
            >
              {FIFTHS_ORDER.map((note, index) => {
                const start = -105 + index * 30;
                const end = start + 30;
                const mid = start + 15;
                const [labelX, labelY] = pointAt((OUTER_RADIUS + OUTER_INNER_RADIUS) / 2, mid);
                const selected = note === root;
                return (
                  <g
                    key={note}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select key ${note}`}
                    aria-pressed={selected}
                    data-testid={`circle-key-${note}`}
                    className="group cursor-pointer select-none outline-none focus-visible:[&>path]:stroke-foreground focus-visible:[&>path]:stroke-[3]"
                    onClick={() => setRoot(note)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setRoot(note);
                      }
                    }}
                  >
                    <path
                      d={annularSectorPath(OUTER_INNER_RADIUS, OUTER_RADIUS, start, end)}
                      fill={selected ? "var(--primary)" : index < 3 || index > 9 ? "var(--surface-raised)" : "var(--secondary)"}
                      stroke="var(--border)"
                      strokeWidth="1.5"
                    />
                    <text
                      x={labelX}
                      y={labelY + 7}
                      textAnchor="middle"
                      fontSize="18"
                      fontWeight={selected ? "700" : "500"}
                      fill={selected ? "var(--primary-foreground)" : "var(--foreground)"}
                      className="font-mono pointer-events-none"
                    >
                      {note}
                    </text>
                    <title>{`Select ${note} major`}</title>
                  </g>
                );
              })}

              {mode.numerals.map((numeral, index) => {
                const start = -90 + index * (360 / mode.numerals.length);
                const end = start + 360 / mode.numerals.length;
                const mid = (start + end) / 2;
                const [labelX, labelY] = pointAt((INNER_RADIUS + MODE_RADIUS) / 2, mid);
                const chord = chords[index];
                return (
                  <g
                    key={`${mode.name}-${numeral}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Play ${chord} chord (${numeral})`}
                    data-testid={`circle-chord-${index}`}
                    className="cursor-pointer select-none outline-none focus-visible:[&>path]:stroke-foreground focus-visible:[&>path]:stroke-[3]"
                    onClick={() => playChord(index)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        playChord(index);
                      }
                    }}
                  >
                    <path
                      d={annularSectorPath(INNER_RADIUS, MODE_RADIUS, start, end)}
                      fill={index % 2 === 0 ? "var(--secondary)" : "var(--surface-raised)"}
                      stroke="var(--border)"
                      strokeWidth="1.5"
                      className="transition-[fill,stroke,stroke-width] duration-150 group-hover:fill-primary/15 group-hover:stroke-primary/60 group-active:fill-primary/30 group-active:stroke-primary group-active:stroke-[3]"
                    />
                    <text
                      x={labelX}
                      y={labelY + 4}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="700"
                      fill="var(--foreground)"
                      className="font-mono pointer-events-none"
                    >
                      {numeral}
                    </text>
                    <title>{`${numeral}: ${chord}`}</title>
                  </g>
                );
              })}

              <circle cx={CENTER} cy={CENTER} r={INNER_RADIUS - 1} fill="var(--card)" />
              <text
                x={CENTER}
                y={CENTER - 10}
                textAnchor="middle"
                fontSize="22"
                fontWeight="700"
                fill="var(--foreground)"
                className="font-heading"
              >
                {root}
              </text>
              <text
                x={CENTER}
                y={CENTER + 14}
                textAnchor="middle"
                fontSize="11"
                fill="var(--muted-foreground)"
                className="font-mono"
              >
                {mode.name}
              </text>
            </svg>
          </div>

          <div className="flex min-w-0 flex-col gap-3 text-center sm:gap-4">
            <div className="flex flex-col items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Selected key and mode</p>
              <h2 className="font-heading text-lg font-bold sm:text-xl">{root} {mode.name}</h2>
              <p className="text-xs text-muted-foreground">
                Formula: <span className="font-mono text-foreground">{mode.formula}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Notes: <span className="font-mono text-foreground">{notes.join(", ")}</span>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <span className="mr-1">Chords:</span>
                {chords.map((chord, index) => (
                  <button
                    key={`${chord}-${index}`}
                    type="button"
                    aria-label={`Play ${chord} chord`}
                    data-testid={`circle-chord-summary-${index}`}
                    onClick={() => playChord(index)}
                    className="min-h-8 cursor-pointer select-none rounded-md border border-border bg-secondary px-2.5 font-mono text-xs font-semibold text-foreground transition-[color,background-color,border-color,transform] duration-150 hover:border-primary/60 hover:bg-primary/15 hover:text-primary active:scale-95 active:border-primary active:bg-primary/30 active:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {chord}
                  </button>
                ))}
              </div>
            </div>

          <section aria-label="Select key" className="w-full">
            <div className="grid grid-cols-4 overflow-hidden rounded-lg border border-border sm:grid-cols-6">
              {NOTE_NAMES.map((note) => (
                <button
                  key={note}
                  type="button"
                  aria-pressed={root === note}
                  onClick={() => setRoot(note)}
                  className={`min-h-9 border-r border-border font-mono text-xs font-semibold transition-colors last:border-r-0 ${
                    root === note
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-primary/15 hover:text-foreground"
                  }`}
                >
                  {note}
                </button>
              ))}
            </div>
          </section>

          <section aria-label="Select mode" className="w-full">
            <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border sm:grid-cols-4">
              {MODES.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  aria-pressed={modeName === item.name}
                  onClick={() => setModeName(item.name)}
                  className={`min-h-9 border-r border-t border-border px-1.5 text-xs font-medium transition-colors sm:border-t-0 ${
                    modeName === item.name
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-primary/15 hover:text-foreground"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
