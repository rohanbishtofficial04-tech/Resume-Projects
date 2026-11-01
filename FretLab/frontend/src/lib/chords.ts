
import { freqFromMidi, NOTE_NAMES } from "./music.ts";

const STRING_OPEN_MIDI = [40, 45, 50, 55, 59, 64];
const MAX_FRET = 15;
const WINDOW = 3;
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

export interface VoicingBarre {
  fret: number;
  fromString: number;
  toString: number;
}

export interface ChordVoicing {
  frets: number[];
  fingers: number[];
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

function findBarres(frets: number[]): VoicingBarre[] {
  const barres: VoicingBarre[] = [];
  const fretsUsed = Array.from(new Set(frets.filter((fret) => fret > 0))).sort((a, b) => a - b);

  for (const fret of fretsUsed) {
    const strings = frets.flatMap((position, string) => (position === fret ? [string] : []));
    if (strings.length < 2) continue;

    const fromString = strings[0];
    const toString = strings[strings.length - 1];
    const canBarre = frets
      .slice(fromString, toString + 1)
      .every((position) => position >= fret);
    if (canBarre) barres.push({ fret, fromString, toString });
  }

  return barres;
}

function fingerGroupCount(frets: number[], barres = findBarres(frets)): number {
  const barreStrings = new Set<number>();
  barres.forEach(({ fromString, toString }) => {
    for (let string = fromString; string <= toString; string += 1) {
      if (frets[string] === frets[fromString]) barreStrings.add(string);
    }
  });

  return barres.length + frets.filter((fret, string) => fret > 0 && !barreStrings.has(string)).length;
}

function scoreVoicing(
  frets: number[],
  rootPc: number,
  startFret: number,
  requiredTones: Set<number>,
): number {
  const sounding = soundingStrings(frets);
  if (sounding.length < 4) return Number.NEGATIVE_INFINITY;

  const fretted = sounding.map((s) => frets[s]).filter((fret) => fret > 0);
  if (fretted.length > 0 && Math.max(...fretted) - Math.min(...fretted) > WINDOW) {
    return Number.NEGATIVE_INFINITY;
  }
  const barres = findBarres(frets);
  if (fingerGroupCount(frets, barres) > 4) return Number.NEGATIVE_INFINITY;

  const bassString = sounding[0];
  const bassIsRoot = stringPitchClass(bassString, frets[bassString]) === rootPc;
  const pitchClasses = new Set(sounding.map((s) => stringPitchClass(s, frets[s])));
  if ([...requiredTones].some((tone) => !pitchClasses.has(tone))) return Number.NEGATIVE_INFINITY;
  const duplicates = sounding.length - pitchClasses.size;

  return (bassIsRoot ? 30 : -18) + sounding.length * 3 - startFret * 3 - duplicates * 3;
}

function collectVoicings(
  rootPc: number,
  intervals: number[],
  requiredIntervals: number[],
  startFret: number,
): Candidate[] {
  const tones = new Set(intervals.map((interval) => (rootPc + interval) % 12));
  const requiredTones = new Set(requiredIntervals.map((interval) => (rootPc + interval) % 12));

  const options: number[][] = [];
  for (let s = 0; s < 6; s += 1) {
    const frets: number[] = [];
    if (tones.has(stringPitchClass(s, 0))) frets.push(0);
    for (let fret = Math.max(1, startFret); fret <= Math.min(MAX_FRET, startFret + WINDOW); fret += 1) {
      if (tones.has(stringPitchClass(s, fret))) frets.push(fret);
    }
    frets.push(-1);
    options.push(frets);
  }

  const results: Candidate[] = [];
  const current = [-1, -1, -1, -1, -1, -1];
  let lowest = Number.POSITIVE_INFINITY;
  let highest = Number.NEGATIVE_INFINITY;

  const walk = (s: number): void => {
    if (highest - lowest > WINDOW) return;
    if (s === 6) {
      const score = scoreVoicing(current, rootPc, startFret, requiredTones);
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
  const barres = findBarres(frets);
  const barreForString = new Map<number, VoicingBarre>();
  barres.forEach((barre) => {
    for (let string = barre.fromString; string <= barre.toString; string += 1) {
      if (frets[string] === barre.fret) barreForString.set(string, barre);
    }
  });

  const groups = new Map<string, { fret: number; strings: number[] }>();
  frets.forEach((fret, string) => {
    if (fret <= 0) return;
    const barre = barreForString.get(string);
    const key = barre ? `barre-${barre.fret}-${barre.fromString}-${barre.toString}` : `note-${string}`;
    const group = groups.get(key) ?? { fret, strings: [] };
    group.strings.push(string);
    groups.set(key, group);
  });

  const fingerByString = new Map<number, number>();
  [...groups.values()]
    .sort((a, b) => a.fret - b.fret || a.strings[0] - b.strings[0])
    .forEach((group, index) => group.strings.forEach((string) => fingerByString.set(string, index + 1)));

  const fingers = frets.map((fret, string) => (fret <= 0 ? fret : fingerByString.get(string) ?? 4));

  const label =
    fretted.length === 0
      ? "Open position"
      : barres.length > 0
        ? `Barre · fret ${barres[0].fret}`
        : `Position · fret ${startFret}`;

  return { frets, fingers, startFret, barre: barres[0] ?? null, barres, label };
}

function buildMajorVoicings(rootPc: number): ChordVoicing[] {
  const voicings: ChordVoicing[] = [];
  const openVoicings: Record<number, { frets: number[]; fingers: number[] }> = {
    0: { frets: [-1, 3, 2, 0, 1, 0], fingers: [-1, 3, 2, 0, 1, 0] },
    2: { frets: [-1, -1, 0, 2, 3, 2], fingers: [-1, -1, 0, 1, 3, 2] },
    4: { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
    7: { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
    9: { frets: [-1, 0, 2, 2, 2, 0], fingers: [-1, 0, 1, 2, 3, 0] },
  };
  const open = openVoicings[rootPc];
  if (open) {
    voicings.push({
      ...open,
      startFret: 1,
      barre: null,
      barres: [],
      label: "Open position",
    });
  }

  const eFormFret = ((rootPc - 4 + 12) % 12) || 12;
  const aFormFret = ((rootPc - 9 + 12) % 12) || 12;
  voicings.push({
    frets: [eFormFret, eFormFret + 2, eFormFret + 2, eFormFret + 1, eFormFret, eFormFret],
    fingers: [1, 3, 4, 2, 1, 1],
    startFret: eFormFret,
    barre: { fret: eFormFret, fromString: 0, toString: 5 },
    barres: [{ fret: eFormFret, fromString: 0, toString: 5 }],
    label: `Barre · fret ${eFormFret}`,
  });
  voicings.push({
    frets: [-1, aFormFret, aFormFret + 2, aFormFret + 2, aFormFret + 2, aFormFret],
    fingers: [-1, 1, 3, 3, 3, 1],
    startFret: aFormFret,
    barre: { fret: aFormFret, fromString: 1, toString: 5 },
    barres: [{ fret: aFormFret, fromString: 1, toString: 5 }],
    label: `Barre · fret ${aFormFret}`,
  });

  return voicings;
}

function requiredChordIntervals(qualityId: string, intervals: number[]): number[] {
  const requiredByQuality: Record<string, number[]> = {
    "9": [0, 2, 4, 10],
    maj9: [0, 2, 4, 11],
    min9: [0, 2, 3, 10],
    "11": [0, 4, 5, 10],
    "13": [0, 4, 9, 10],
  };
  return requiredByQuality[qualityId] ?? intervals;
}

function buildVoicings(rootPc: number, quality: ChordQuality): ChordVoicing[] {
  if (quality.id === "maj") return buildMajorVoicings(rootPc);
  const { intervals } = quality;
  const starts = Array.from(new Set([0, ((rootPc - 4) % 12 + 12) % 12, ((rootPc - 9) % 12 + 12) % 12])).filter(
    (fret) => fret <= 11,
  );

  const candidates: Candidate[] = [];
  starts.forEach((startFret) => {
    candidates.push(...collectVoicings(rootPc, intervals, requiredChordIntervals(quality.id, intervals), startFret));
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
        voicings: buildVoicings(rootPc, quality),
      });
    }
  }
  libraryCache = chords;
  return chords;
}

export function voicingFrequencies(frets: number[]): number[] {
  const frequencies: number[] = [];
  frets.forEach((fret, s) => {
    if (fret < 0) return;
    const midi = STRING_OPEN_MIDI[s] + fret;
    frequencies.push(440 * Math.pow(2, (midi - 69) / 12));
  });
  return frequencies;
}

export function chordToneFrequencies(chord: Pick<Chord, "rootPc" | "qualityId">): number[] {
  const quality = CHORD_QUALITIES.find(({ id }) => id === chord.qualityId);
  const intervals = quality?.intervals ?? (chord.qualityId === "power" ? [0, 7] : null);
  if (!intervals) throw new Error(`Unknown chord quality: ${chord.qualityId}`);
  return intervals.map((interval) => freqFromMidi(60 + chord.rootPc + interval));
}
