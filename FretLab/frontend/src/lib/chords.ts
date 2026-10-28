
import { freqFromMidi, NOTE_NAMES } from "@/lib/music";

const STRING_OPEN_MIDI = [40, 45, 50, 55, 59, 64]; // low E → high e
const MAX_FRET = 15;
const WINDOW = 3; // playable span in frets
const MAX_VOICINGS = 3;

export type ChordCategory = "major" | "minor" | "sevenths" | "suspended" | "diminished" | "extended";

export interface ChordQuality {
  id: string;
  label: string;
  symbol: string;
  intervals: number[];
  category: ChordCategory;
}

export const CHORD_QUALITIES: ChordQuality[] = [
  { id: "maj", label: "Major", symbol: "", intervals: [0, 4, 7], category: "major" },
  { id: "min", label: "Minor", symbol: "m", intervals: [0, 3, 7], category: "minor" },
  { id: "7", label: "Dominant 7th", symbol: "7", intervals: [0, 4, 7, 10], category: "sevenths" },
  { id: "maj7", label: "Major 7th", symbol: "maj7", intervals: [0, 4, 7, 11], category: "sevenths" },
  { id: "min7", label: "Minor 7th", symbol: "m7", intervals: [0, 3, 7, 10], category: "sevenths" },
  { id: "sus2", label: "Suspended 2nd", symbol: "sus2", intervals: [0, 2, 7], category: "suspended" },
  { id: "sus4", label: "Suspended 4th", symbol: "sus4", intervals: [0, 5, 7], category: "suspended" },
  { id: "dim", label: "Diminished", symbol: "dim", intervals: [0, 3, 6], category: "diminished" },
  { id: "dim7", label: "Diminished 7th", symbol: "dim7", intervals: [0, 3, 6, 9], category: "diminished" },
  { id: "aug", label: "Augmented", symbol: "aug", intervals: [0, 4, 8], category: "diminished" },
  { id: "6", label: "Major 6th", symbol: "6", intervals: [0, 4, 7, 9], category: "extended" },
  { id: "m6", label: "Minor 6th", symbol: "m6", intervals: [0, 3, 7, 9], category: "extended" },
  { id: "add9", label: "Added 9th", symbol: "add9", intervals: [0, 2, 4, 7], category: "extended" },
  { id: "m7b5", label: "Half Diminished", symbol: "m7b5", intervals: [0, 3, 6, 10], category: "extended" },
  { id: "9", label: "Dominant 9th", symbol: "9", intervals: [0, 2, 4, 7, 10], category: "extended" },
  { id: "maj9", label: "Major 9th", symbol: "maj9", intervals: [0, 2, 4, 7, 11], category: "extended" },
  { id: "min9", label: "Minor 9th", symbol: "m9", intervals: [0, 2, 3, 7, 10], category: "extended" },
  { id: "11", label: "Dominant 11th", symbol: "11", intervals: [0, 2, 4, 5, 7, 10], category: "extended" },
  { id: "13", label: "Dominant 13th", symbol: "13", intervals: [0, 2, 4, 7, 9, 10], category: "extended" },
];

export const CHORD_CATEGORIES: { id: ChordCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "major", label: "Major" },
  { id: "minor", label: "Minor" },
  { id: "sevenths", label: "7ths" },
  { id: "suspended", label: "Suspended" },
  { id: "diminished", label: "Dim / Aug" },
  { id: "extended", label: "Extended" },
];

/** A run of adjacent strings pressed by one finger (a real barre segment). */
export interface VoicingBarre {
  fret: number;
  fromString: number;
  toString: number;
}

export interface ChordVoicing {
  /** 6 entries low E → high e; -1 = muted, 0 = open. */
  frets: number[];
  /** 0 = open, -1 = muted, 1-4 = finger (1 = index). */
  fingers: number[];
  /** Fret drawn at the top of the diagram (1 means the nut is shown). */
  startFret: number;
  barre: VoicingBarre | null;
  barres: VoicingBarre[];
  label: string;
}

export interface Chord {
  id: string;
  root: string;
  rootPc: number;
  qualityId: string;
  qualityLabel: string;
  name: string;
  symbol: string;
  category: ChordCategory;
  voicings: ChordVoicing[];
}

function stringPitchClass(stringIndex: number, fret: number): number {
  return ((STRING_OPEN_MIDI[stringIndex] + fret) % 12 + 12) % 12;
}

function fretSum(frets: number[]): number {
  return frets.reduce((total, fret) => total + Math.max(0, fret), 0);
}

function soundingStrings(frets: number[]): number[] {
  const result: number[] = [];
  for (let s = 0; s < 6; s += 1) if (frets[s] >= 0) result.push(s);
  return result;
}

interface Candidate {
  frets: number[];
  score: number;
}

/**
 * Playability score. Rewards a root in the bass, more sounding strings, a low
 * position, and distinct chord tones (so a voicing does not collapse into the
 * same note repeated across every string).
 */
function scoreVoicing(frets: number[], rootPc: number, startFret: number): number {
  const sounding = soundingStrings(frets);
  if (sounding.length < 4) return Number.NEGATIVE_INFINITY;

  const fretted = sounding.map((s) => frets[s]).filter((fret) => fret > 0);
  if (fretted.length > 0 && Math.max(...fretted) - Math.min(...fretted) > WINDOW) {
    return Number.NEGATIVE_INFINITY;
  }
  if (new Set(fretted).size > 4) return Number.NEGATIVE_INFINITY;

  const bassString = sounding[0];
  const bassIsRoot = stringPitchClass(bassString, frets[bassString]) === rootPc;
  const pitchClasses = new Set(sounding.map((s) => stringPitchClass(s, frets[s])));
  const duplicates = sounding.length - pitchClasses.size;

  return (bassIsRoot ? 30 : -18) + sounding.length * 3 - startFret * 3 - duplicates * 3;
}

function collectVoicings(rootPc: number, intervals: number[], startFret: number): Candidate[] {
  const tones = new Set(intervals.map((interval) => (rootPc + interval) % 12));

  const options: number[][] = [];
  for (let s = 0; s < 6; s += 1) {
    const frets: number[] = [];
    if (tones.has(stringPitchClass(s, 0))) frets.push(0);
    for (let fret = Math.max(1, startFret); fret <= Math.min(MAX_FRET, startFret + WINDOW); fret += 1) {
      if (tones.has(stringPitchClass(s, fret))) frets.push(fret);
    }
    frets.push(-1); // muting is always an option
    options.push(frets);
  }

  const results: Candidate[] = [];
  const current = [-1, -1, -1, -1, -1, -1];
  let lowest = Number.POSITIVE_INFINITY;
  let highest = Number.NEGATIVE_INFINITY;

  const walk = (s: number): void => {
    if (highest - lowest > WINDOW) return; // prune unplayable spans early
    if (s === 6) {
      const score = scoreVoicing(current, rootPc, startFret);
      if (score > Number.NEGATIVE_INFINITY) results.push({ frets: [...current], score });
      return;
    }
    const previousLow = lowest;
    const previousHigh = highest;
    for (const fret of options[s]) {
      current[s] = fret;
      if (fret > 0) {
        lowest = Math.min(lowest, fret);
        highest = Math.max(highest, fret);
      }
      walk(s + 1);
      lowest = previousLow;
      highest = previousHigh;
    }
  };

  walk(0);
  return results;
}

function describeVoicing(frets: number[]): ChordVoicing {
  const fretted = frets.filter((fret) => fret > 0);
  const startFret = fretted.length > 0 ? Math.min(...fretted) : 1;

  const distinct = Array.from(new Set(fretted)).sort((a, b) => a - b);
  const fingerByFret = new Map<number, number>();
  distinct.forEach((fret, index) => fingerByFret.set(fret, Math.min(index + 1, 4)));

  const fingers = frets.map((fret) => {
    if (fret === -1) return -1;
    if (fret === 0) return 0;
    return fingerByFret.get(fret) ?? 1;
  });

  // A barre is only ever a run of *adjacent* strings held at the lowest fret —
  // adjacent means the finger really covers them (no open string in between).
  const barres: VoicingBarre[] = [];
  if (distinct.length > 0) {
    const lowestFret = distinct[0];
    const held = frets.map((fret, s) => (fret === lowestFret ? s : -1)).filter((s) => s >= 0);
    for (let i = 0; i < held.length; i += 1) {
      let end = held[i];
      let j = i;
      while (j + 1 < held.length && held[j + 1] === held[j] + 1) {
        j += 1;
        end = held[j];
      }
      if (end > held[i]) barres.push({ fret: lowestFret, fromString: held[i], toString: end });
      i = j;
    }
  }

  const label =
    fretted.length === 0
      ? "Open position"
      : barres.length > 0
        ? `Barre · fret ${startFret}`
        : `Position · fret ${startFret}`;

  return { frets, fingers, startFret, barre: barres[0] ?? null, barres, label };
}

function buildVoicings(rootPc: number, intervals: number[]): ChordVoicing[] {
  const starts = Array.from(new Set([0, ((rootPc - 4) % 12 + 12) % 12, ((rootPc - 9) % 12 + 12) % 12])).filter(
    (fret) => fret <= 11,
  );

  const candidates: Candidate[] = [];
  starts.forEach((startFret) => {
    candidates.push(...collectVoicings(rootPc, intervals, startFret));
  });

  candidates.sort(
    (a, b) =>
      b.score - a.score ||
      soundingStrings(b.frets).length - soundingStrings(a.frets).length ||
      fretSum(a.frets) - fretSum(b.frets),
  );

  const seen = new Set<string>();
  const voicings: ChordVoicing[] = [];
  for (const candidate of candidates) {
    const signature = candidate.frets.join(",");
    if (seen.has(signature)) continue;
    seen.add(signature);
    voicings.push(describeVoicing(candidate.frets));
    if (voicings.length >= MAX_VOICINGS) break;
  }
  return voicings;
}

let libraryCache: Chord[] | null = null;

export function getChordLibrary(): Chord[] {
  if (libraryCache) return libraryCache;
  const chords: Chord[] = [];
  for (let rootPc = 0; rootPc < 12; rootPc += 1) {
    const root = NOTE_NAMES[rootPc];
    for (const quality of CHORD_QUALITIES) {
      chords.push({
        id: `${root}-${quality.id}`,
        root,
        rootPc,
        qualityId: quality.id,
        qualityLabel: quality.label,
        name: `${root} ${quality.label}`,
        symbol: `${root}${quality.symbol}`,
        category: quality.category,
        voicings: buildVoicings(rootPc, quality.intervals),
      });
    }
  }
  libraryCache = chords;
  return chords;
}

/** Sounding frequencies of a voicing, low string → high string. */
export function voicingFrequencies(frets: number[]): number[] {
  const frequencies: number[] = [];
  frets.forEach((fret, s) => {
    if (fret < 0) return;
    const midi = STRING_OPEN_MIDI[s] + fret;
    frequencies.push(440 * Math.pow(2, (midi - 69) / 12));
  });
  return frequencies;
}

/** Chord tones voiced from the same octave as the Circle of Fifths previews. */
export function chordToneFrequencies(chord: Pick<Chord, "rootPc" | "qualityId">): number[] {
  const quality = CHORD_QUALITIES.find(({ id }) => id === chord.qualityId);
  if (!quality) throw new Error(`Unknown chord quality: ${chord.qualityId}`);
  return quality.intervals.map((interval) => freqFromMidi(60 + chord.rootPc + interval));
}
