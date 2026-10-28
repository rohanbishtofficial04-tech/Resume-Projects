import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Square } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { playNoteSequence, playReferenceTone, stopAllTones } from "@/lib/audio/tones";
import { DEFAULT_TUNING_ID, freqFromMidi, NOTE_NAMES, TUNINGS } from "@/lib/music";

const OPEN_STRING_MIDI = [40, 45, 50, 55, 59, 64];
const STRING_NAMES = ["E", "A", "D", "G", "B", "e"];
const BOARD_LEFT = 42;
const BOARD_TOP = 40;
const FRET_WIDTH = 70;
const STRING_GAP = 42;
const BOARD_HEIGHT = BOARD_TOP + (STRING_NAMES.length - 1) * STRING_GAP + 38;

const SCALES = [
  { name: "Major", formula: "1 2 3 4 5 6 7", intervals: [0, 2, 4, 5, 7, 9, 11], rarity: "common" },
  { name: "Harmonic Minor", formula: "1 2 b3 4 5 b6 7", intervals: [0, 2, 3, 5, 7, 8, 11], rarity: "rare" },
  { name: "Melodic Minor", formula: "1 2 b3 4 5 6 7", intervals: [0, 2, 3, 5, 7, 9, 11], rarity: "rare" },
  { name: "Natural Minor", formula: "1 2 b3 4 5 b6 b7", intervals: [0, 2, 3, 5, 7, 8, 10], rarity: "common" },
  { name: "Pentatonic Major", formula: "1 2 3 5 6", intervals: [0, 2, 4, 7, 9], rarity: "common" },
  { name: "Pentatonic Minor", formula: "1 b3 4 5 b7", intervals: [0, 3, 5, 7, 10], rarity: "common" },
  { name: "Pentatonic Blues", formula: "1 b3 4 b5 5 b7", intervals: [0, 3, 5, 6, 7, 10], rarity: "common" },
  { name: "Pentatonic Neutral", formula: "1 2 4 5 b7", intervals: [0, 2, 5, 7, 10], rarity: "exotic" },
  { name: "Ionian", formula: "1 2 3 4 5 6 7", intervals: [0, 2, 4, 5, 7, 9, 11], rarity: "common" },
  { name: "Dorian", formula: "1 2 b3 4 5 6 b7", intervals: [0, 2, 3, 5, 7, 9, 10], rarity: "common" },
  { name: "Phrygian", formula: "1 b2 b3 4 5 b6 b7", intervals: [0, 1, 3, 5, 7, 8, 10], rarity: "rare" },
  { name: "Lydian", formula: "1 2 3 #4 5 6 7", intervals: [0, 2, 4, 6, 7, 9, 11], rarity: "rare" },
  { name: "Mixolydian", formula: "1 2 3 4 5 6 b7", intervals: [0, 2, 4, 5, 7, 9, 10], rarity: "common" },
  { name: "Aeolian", formula: "1 2 b3 4 5 b6 b7", intervals: [0, 2, 3, 5, 7, 8, 10], rarity: "common" },
  { name: "Locrian", formula: "1 b2 b3 4 b5 b6 b7", intervals: [0, 1, 3, 5, 6, 8, 10], rarity: "rare" },
  { name: "Diatonic", formula: "1 2 3 4 5 6 7", intervals: [0, 2, 4, 5, 7, 9, 11], rarity: "common" },
  { name: "Diminished", formula: "1 2 b3 4 b5 b6 6 7", intervals: [0, 2, 3, 5, 6, 8, 9, 11], rarity: "rare" },
  { name: "Diminished, Half Whole", formula: "1 b2 #2 3 #4 5 6 b7", intervals: [0, 1, 3, 4, 6, 7, 9, 10], rarity: "exotic" },
  { name: "Diminished Whole", formula: "1 2 b3 4 b5 b6 6 7", intervals: [0, 2, 3, 5, 6, 8, 9, 11], rarity: "exotic" },
  { name: "Diminished Whole Tone", formula: "1 2 3 #4 b6 b7", intervals: [0, 2, 4, 6, 8, 10], rarity: "exotic" },
  { name: "Dominant 7th", formula: "1 2 3 4 5 6 b7", intervals: [0, 2, 4, 5, 7, 9, 10], rarity: "common" },
  { name: "Lydian Augmented", formula: "1 2 3 #4 #5 6 7", intervals: [0, 2, 4, 6, 8, 9, 11], rarity: "rare" },
  { name: "Lydian Minor", formula: "1 2 3 #4 5 b6 b7", intervals: [0, 2, 4, 6, 7, 8, 10], rarity: "rare" },
  { name: "Lydian Diminished", formula: "1 2 3 #4 5 b6 7", intervals: [0, 2, 4, 6, 7, 8, 11], rarity: "exotic" },
] as const;

const LAYOUTS = ["Full", "Vertical", "Diagonal"] as const;
const RARITIES = ["common", "rare", "exotic"] as const;

export default function ScaleLibrary() {
  const [root, setRoot] = useState("C");
  const [scaleName, setScaleName] = useState<string>(SCALES[0].name);
  const [tuningId, setTuningId] = useState(DEFAULT_TUNING_ID);
  const [layout, setLayout] = useState<(typeof LAYOUTS)[number]>("Full");
  const [rarity, setRarity] = useState<(typeof RARITIES)[number]>("common");
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackTimerRef = useRef<number | null>(null);
  const scale = SCALES.find((item) => item.name === scaleName) ?? SCALES[0];
  const notes = useMemo(() => {
    const rootIndex = NOTE_NAMES.indexOf(root as (typeof NOTE_NAMES)[number]);
    return scale.intervals.map((interval) => NOTE_NAMES[(rootIndex + interval) % NOTE_NAMES.length]);
  }, [root, scale]);
  const rootPitchClass = NOTE_NAMES.indexOf(root as (typeof NOTE_NAMES)[number]);
  const tuning = TUNINGS.find((item) => item.id === tuningId) ?? TUNINGS[0];
  const openStringMidi = tuning.strings.map((string) => string.midi);
  const stringNames = tuning.strings.map((string) => string.label);
  const scaleToneSet = useMemo(() => new Set<number>(scale.intervals), [scale]);
  const intervalLabels = scale.formula.split(" ");
  const rootFret = (rootPitchClass - openStringMidi[0] % NOTE_NAMES.length + NOTE_NAMES.length) % NOTE_NAMES.length;
  const boardStartFret = layout === "Full" ? 0 : rootFret;
  const boardEndFret = layout === "Full" ? 20 : layout === "Vertical" ? rootFret + 4 : rootFret + 12;
  const boardFretCount = boardEndFret - boardStartFret;
  const boardWidth = BOARD_LEFT + boardFretCount * FRET_WIDTH + 12;
  const rootMidi = openStringMidi[0] + rootFret;

  const stopPlayback = useCallback(() => {
    stopAllTones();
    if (playbackTimerRef.current !== null) {
      window.clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  useEffect(
    () => () => {
      stopAllTones();
      if (playbackTimerRef.current !== null) window.clearTimeout(playbackTimerRef.current);
    },
    [],
  );

  const toggleScalePlayback = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }
    stopAllTones();
    const frequencies = [...scale.intervals, 12].map((interval) => freqFromMidi(rootMidi + interval));
    const duration = playNoteSequence(frequencies);
    setIsPlaying(true);
    playbackTimerRef.current = window.setTimeout(() => {
      playbackTimerRef.current = null;
      setIsPlaying(false);
    }, duration);
  };

  const playFretboardNote = (midi: number) => {
    stopPlayback();
    playReferenceTone(freqFromMidi(midi), 1.2);
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="fl-rise">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Guitar scale reference
        </p>
        <h1 className="mt-1 font-heading text-4xl font-bold tracking-tight sm:text-5xl">Scale Library</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Explore {SCALES.length} guitar scales by root, with their notes, formulas, and fretboard patterns.
        </p>
      </section>

      <Card className="fl-rise fl-rise-1">
        <CardContent className="flex flex-col gap-6 py-6">
          <section aria-labelledby="scale-root-heading" className="flex flex-col gap-3">
            <h2 id="scale-root-heading" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Root note
            </h2>
            <div className="flex flex-wrap gap-2">
              {NOTE_NAMES.map((note) => (
                <button
                  key={note}
                  type="button"
                  aria-pressed={root === note}
                  onClick={() => {
                    stopPlayback();
                    setRoot(note);
                  }}
                  className={`min-w-11 rounded-lg border px-3 py-1.5 font-mono text-sm font-semibold transition-colors ${
                    root === note
                      ? "border-primary/60 bg-primary/15 text-primary"
                      : "border-border bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {note}
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="scale-tuning-heading" className="flex flex-col gap-3">
            <h2 id="scale-tuning-heading" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Guitar tuning
            </h2>
            <label className="flex max-w-sm flex-col gap-1.5">
              <span className="sr-only">Select guitar tuning</span>
              <select
                data-testid="scale-tuning-select"
                aria-label="Select guitar tuning"
                value={tuningId}
                onChange={(event) => {
                  stopPlayback();
                  setTuningId(event.target.value);
                }}
                className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
              >
                {TUNINGS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {item.short}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section aria-labelledby="scale-layout-heading" className="flex flex-col gap-3">
            <h2 id="scale-layout-heading" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Fretboard layout
            </h2>
            <div className="flex flex-wrap gap-2">
              {LAYOUTS.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={layout === item}
                  onClick={() => {
                    stopPlayback();
                    setLayout(item);
                  }}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                    layout === item
                      ? "border-primary/60 bg-primary/15 text-primary"
                      : "border-border bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item[0].toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="scale-rarity-heading" className="flex flex-col gap-3">
            <h2 id="scale-rarity-heading" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Scale collection
            </h2>
            <div className="flex flex-wrap gap-2">
              {RARITIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={rarity === item}
                  onClick={() => {
                    stopPlayback();
                    setRarity(item);
                    const nextScale = SCALES.find((candidate) => candidate.rarity === item);
                    if (nextScale) setScaleName(nextScale.name);
                  }}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    rarity === item
                      ? "border-primary/60 bg-primary/15 text-primary"
                      : "border-border bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item[0].toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="scale-type-heading" className="flex flex-col gap-3">
            <h2 id="scale-type-heading" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Scale
            </h2>
            <div className="flex flex-wrap gap-2">
              {SCALES.filter((item) => item.rarity === rarity).map((item) => (
                <button
                  key={item.name}
                  type="button"
                  aria-pressed={scaleName === item.name}
                  onClick={() => {
                    stopPlayback();
                    setScaleName(item.name);
                  }}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    scaleName === item.name
                      ? "border-primary/60 bg-primary/15 text-primary"
                      : "border-border bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </section>
        </CardContent>
      </Card>

      <Card data-testid="scale-result">
        <CardContent className="flex flex-col gap-5 py-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Selected scale</p>
            <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight">
              {root} {scale.name}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2" aria-label={`${root} ${scale.name} notes`}>
            {notes.map((note, index) => (
              <span
                key={`${note}-${index}`}
                className="rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm font-semibold"
              >
                {note}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Formula: <span className="font-mono text-foreground">{scale.formula}</span>
          </p>
        </CardContent>
      </Card>

      <Card data-testid="scale-fretboard-card">
        <CardContent className="flex flex-col gap-5 py-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {tuning.name} tuning · frets {boardStartFret}–{boardEndFret}
              </p>
              <h2 className="mt-1 font-heading text-xl font-bold tracking-tight">
                {root} {scale.name} · {layout}
              </h2>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-primary" />
                Root
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border border-primary bg-surface-raised" />
                Scale note
              </span>
            </div>
            <Button
              type="button"
              data-testid="scale-play-button"
              aria-label={isPlaying ? "Stop scale playback" : `Play ${root} ${scale.name} scale`}
              onClick={toggleScalePlayback}
              className="sm:ml-auto"
            >
              {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? "Stop" : "Play scale"}
            </Button>
          </div>

          <div className="scale-fretboard-scroll mx-auto w-full min-w-0 overflow-x-auto rounded-xl border border-border bg-surface p-3 sm:p-5 md:max-w-[936px]">
            <svg
              viewBox={`0 0 ${boardWidth} ${BOARD_HEIGHT}`}
              role="group"
              aria-label={`${root} ${scale.name} scale notes on the guitar fretboard, frets ${boardStartFret} through ${boardEndFret}, ${layout.toLowerCase()} layout, ${tuning.name} tuning`}
              data-testid="scale-fretboard"
              className="scale-fretboard-svg h-auto w-full"
              style={{ "--board-width": `${boardWidth}px` } as React.CSSProperties}
            >
              <rect
                x={BOARD_LEFT}
                y={BOARD_TOP}
                width={boardFretCount * FRET_WIDTH}
                height={(STRING_NAMES.length - 1) * STRING_GAP}
                rx={4}
                fill="var(--surface-raised)"
              />

              {Array.from({ length: boardFretCount + 1 }, (_, fretOffset) => {
                const fret = boardStartFret + fretOffset;
                const x = BOARD_LEFT + fretOffset * FRET_WIDTH;
                return (
                  <g key={`fret-${fret}`}>
                    <line
                      x1={x}
                      y1={BOARD_TOP}
                      x2={x}
                      y2={BOARD_TOP + (STRING_NAMES.length - 1) * STRING_GAP}
                      stroke="var(--fret-wire)"
                      strokeWidth={fret === 0 ? 5 : 1.5}
                    />
                    <text
                      x={fret === 0 ? BOARD_LEFT - 19 : x - FRET_WIDTH / 2}
                      y={BOARD_TOP + (STRING_NAMES.length - 1) * STRING_GAP + 24}
                      textAnchor="middle"
                      fontSize="12"
                      fill="var(--muted-foreground)"
                      className="font-mono"
                    >
                      {fret}
                    </text>
                  </g>
                );
              })}

              {stringNames.map((stringName, stringIndex) => {
                const y = BOARD_TOP + (stringNames.length - 1 - stringIndex) * STRING_GAP;
                return (
                  <g key={`string-${stringName}-${stringIndex}`}>
                    <line
                      x1={BOARD_LEFT}
                      y1={y}
                      x2={BOARD_LEFT + boardFretCount * FRET_WIDTH}
                      y2={y}
                      stroke="var(--string-line)"
                      strokeWidth={1 + stringIndex * 0.18}
                    />
                    <text
                      x={BOARD_LEFT - 26}
                      y={y + 4}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="700"
                      fill="var(--muted-foreground)"
                      className="font-mono"
                    >
                      {stringName}
                    </text>
                  </g>
                );
              })}

              {openStringMidi.map((openMidi, stringIndex) => {
                const y = BOARD_TOP + (stringNames.length - 1 - stringIndex) * STRING_GAP;
                return Array.from({ length: boardFretCount + 1 }, (_, fretOffset) => {
                  const fret = boardStartFret + fretOffset;
                  const pitchClass = (openMidi + fret) % NOTE_NAMES.length;
                  const interval = (pitchClass - rootPitchClass + NOTE_NAMES.length) % NOTE_NAMES.length;
                  if (!scaleToneSet.has(interval)) return null;
                  const midi = openMidi + fret;
                  if (layout === "Diagonal" && (midi < rootMidi || midi > rootMidi + 12)) return null;

                  const isRoot = interval === 0;
                  const x = fret === 0 ? BOARD_LEFT - 19 : BOARD_LEFT + (fretOffset - 0.5) * FRET_WIDTH;
                  const note = NOTE_NAMES[pitchClass];
                  const scaleDegreeIndex = scale.intervals.findIndex((scaleInterval) => scaleInterval === interval);
                  const label = `${note} · ${intervalLabels[scaleDegreeIndex]}`;
                  return (
                    <g
                      key={`note-${stringIndex}-${fret}`}
                      data-root={isRoot || undefined}
                      role="button"
                      tabIndex={0}
                      aria-label={`Play ${label}${isRoot ? ", root" : ""} on ${stringNames[stringIndex]} string, fret ${fret}`}
                      className="cursor-pointer outline-none focus-visible:[&>circle]:stroke-foreground focus-visible:[&>circle]:stroke-[3]"
                      onClick={() => playFretboardNote(midi)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          playFretboardNote(midi);
                        }
                      }}
                    >
                      <title>{`${label}${isRoot ? " (root)" : ""}, ${STRING_NAMES[stringIndex]} string, fret ${fret}`}</title>
                      <circle
                        cx={x}
                        cy={y}
                        r={15}
                        fill={isRoot ? "var(--primary)" : "var(--surface-raised)"}
                        stroke={isRoot ? "var(--primary)" : "var(--primary)"}
                        strokeWidth={isRoot ? 2 : 1.5}
                      />
                      <text
                        x={x}
                        y={y + 3.5}
                        textAnchor="middle"
                        fontSize="9.5"
                        fontWeight="700"
                        fill={isRoot ? "var(--primary-foreground)" : "var(--foreground)"}
                        className="font-mono"
                      >
                        {note}
                      </text>
                    </g>
                  );
                });
              })}
            </svg>
          </div>
          <p className="text-xs text-muted-foreground">
            {layout === "Full"
              ? "Full layout shows frets 0–20. Scroll horizontally to explore frets beyond 12."
              : layout === "Vertical"
                ? "Vertical layout focuses on a five-fret position around the root."
                : "Diagonal layout follows scale tones from the root up to its octave across the strings."}{" "}
            String labels show the selected tuning from low string at the bottom to high string at the top. Root notes are highlighted.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
