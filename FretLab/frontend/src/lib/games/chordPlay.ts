import type { VoicingBarre } from "@/lib/chords";

const STANDARD_OPEN_MIDI = [40, 45, 50, 55, 59, 64];

export interface PlayChord {
  label: string;
  rootPc: number;
  intervals: number[];
  frets: number[];
  fingers: number[];
  barre: VoicingBarre | null;
}

export interface PlayChordLevel {
  id: string;
  title: string;
  description: string;
  chords: PlayChord[];
}

function makeChord(
  label: string,
  rootPc: number,
  intervals: number[],
  frets: number[],
  barre: VoicingBarre | null = null,
): PlayChord {
  const fingerByFret = new Map<number, number>();
  frets.filter((fret) => fret > 0).sort((a, b) => a - b).forEach((fret) => {
    if (!fingerByFret.has(fret)) fingerByFret.set(fret, Math.min(fingerByFret.size + 1, 4));
  });
  return {
    label,
    rootPc,
    intervals,
    frets,
    fingers: frets.map((fret) => (fret < 0 ? -1 : fret === 0 ? 0 : fingerByFret.get(fret) ?? 1)),
    barre,
  };
}

const openChords = [
  makeChord("C", 0, [0, 4, 7], [-1, 3, 2, 0, 1, 0]),
  makeChord("G", 7, [0, 4, 7], [3, 2, 0, 0, 0, 3]),
  makeChord("D", 2, [0, 4, 7], [-1, -1, 0, 2, 3, 2]),
  makeChord("A", 9, [0, 4, 7], [-1, 0, 2, 2, 2, 0]),
  makeChord("E", 4, [0, 4, 7], [0, 2, 2, 1, 0, 0]),
  makeChord("Am", 9, [0, 3, 7], [-1, 0, 2, 2, 1, 0]),
  makeChord("Em", 4, [0, 3, 7], [0, 2, 2, 0, 0, 0]),
  makeChord("Dm", 2, [0, 3, 7], [-1, -1, 0, 2, 3, 1]),
  makeChord("F", 5, [0, 4, 7], [-1, -1, 3, 2, 1, 1], { fret: 1, fromString: 4, toString: 5 }),
];

const seventhChords = [
  makeChord("A7", 9, [0, 4, 7, 10], [-1, 0, 2, 0, 2, 0]),
  makeChord("D7", 2, [0, 4, 7, 10], [-1, -1, 0, 2, 1, 2]),
  makeChord("E7", 4, [0, 4, 7, 10], [0, 2, 0, 1, 0, 0]),
  makeChord("Am7", 9, [0, 3, 7, 10], [-1, 0, 2, 0, 1, 0]),
  makeChord("Dm7", 2, [0, 3, 7, 10], [-1, -1, 0, 2, 1, 1]),
  makeChord("G7", 7, [0, 4, 7, 10], [3, 2, 0, 0, 0, 1]),
  makeChord("Cmaj7", 0, [0, 4, 7, 11], [-1, 3, 2, 0, 0, 0]),
  makeChord("B7", 11, [0, 4, 7, 10], [-1, 2, 1, 2, 0, 2]),
];

const barreChords = [
  makeChord("F", 5, [0, 4, 7], [1, 3, 3, 2, 1, 1], { fret: 1, fromString: 0, toString: 5 }),
  makeChord("Bm", 11, [0, 3, 7], [-1, 2, 4, 4, 3, 2], { fret: 2, fromString: 1, toString: 5 }),
  makeChord("F#m", 6, [0, 3, 7], [2, 4, 4, 2, 2, 2], { fret: 2, fromString: 0, toString: 5 }),
  makeChord("Bb", 10, [0, 4, 7], [-1, 1, 3, 3, 3, 1], { fret: 1, fromString: 1, toString: 5 }),
  makeChord("C#m", 1, [0, 3, 7], [-1, 4, 6, 6, 5, 4], { fret: 4, fromString: 1, toString: 5 }),
  makeChord("G#m", 8, [0, 3, 7], [4, 6, 6, 4, 4, 4], { fret: 4, fromString: 0, toString: 5 }),
];

export const PLAY_CHORD_LEVELS: PlayChordLevel[] = [
  {
    id: "beginner",
    title: "Beginner · Open chords",
    description: "Essential open-position major and minor chords",
    chords: openChords,
  },
  {
    id: "intermediate",
    title: "Intermediate · 7th chords",
    description: "Common dominant, major, and minor seventh chords",
    chords: seventhChords,
  },
  {
    id: "advanced",
    title: "Advanced · Barre chords",
    description: "Major and minor barre shapes across the neck",
    chords: barreChords,
  },
];

export function chordPitchClasses(chord: PlayChord): Set<number> {
  return new Set(
    chord.intervals.map((interval) => (chord.rootPc + interval) % 12),
  );
}

export function matchesPlayedChord(chord: PlayChord, detectedPitchClasses: Iterable<number>): boolean {
  const detected = new Set(detectedPitchClasses);
  return [...chordPitchClasses(chord)].every((pitchClass) => detected.has(pitchClass));
}

export function identifyPlayedChord(level: PlayChordLevel, detectedPitchClasses: Iterable<number>): PlayChord | null {
  const detected = new Set(detectedPitchClasses);
  return level.chords
    .filter((chord) => matchesPlayedChord(chord, detected))
    .sort((left, right) => {
      const leftExtras = detected.size - chordPitchClasses(left).size;
      const rightExtras = detected.size - chordPitchClasses(right).size;
      return leftExtras - rightExtras;
    })[0] ?? null;
}

export function voicingPitchClasses(chord: PlayChord): number[] {
  return chord.frets.flatMap((fret, stringIndex) =>
    fret < 0 ? [] : [((STANDARD_OPEN_MIDI[stringIndex] + fret) % 12 + 12) % 12],
  );
}
