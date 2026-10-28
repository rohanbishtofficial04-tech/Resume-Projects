/** Note / frequency math and guitar tuning profiles. */

export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
export const FLAT_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"] as const;

/** A4 = 440Hz, MIDI 69. */
export function freqFromMidi(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function midiFromFreq(freq: number): number {
  return 69 + 12 * Math.log2(freq / 440);
}

export function pitchClass(midi: number): number {
  return ((Math.round(midi) % 12) + 12) % 12;
}

export function centsFromFreq(freq: number, target: number): number {
  return 1200 * Math.log2(freq / target);
}

export function noteName(midi: number, flats = false): string {
  const names = flats ? FLAT_NAMES : NOTE_NAMES;
  return names[pitchClass(midi)];
}

export function noteLabel(midi: number, flats = false): string {
  const rounded = Math.round(midi);
  return `${noteName(rounded, flats)}${Math.floor(rounded / 12) - 1}`;
}

export interface TuningString {
  /** 0 = lowest (low E) → 5 = highest (high e) */
  index: number;
  midi: number;
  label: string;
}

export interface Tuning {
  id: string;
  name: string;
  short: string;
  strings: TuningString[];
}

function buildTuning(id: string, name: string, short: string, midis: number[], flats = false): Tuning {
  return {
    id,
    name,
    short,
    strings: midis.map((midi, index) => ({ index, midi, label: noteLabel(midi, flats) })),
  };
}

export const TUNINGS: Tuning[] = [
  buildTuning("standard", "Standard", "E A D G B E", [40, 45, 50, 55, 59, 64]),
  buildTuning("drop-d", "Drop D", "D A D G B E", [38, 45, 50, 55, 59, 64]),
  buildTuning("half-step", "Half-Step Down", "Eb Ab Db Gb Bb Eb", [39, 44, 49, 54, 58, 63], true),
  buildTuning("dadgad", "DADGAD", "D A D G A D", [38, 45, 50, 55, 57, 62]),
  buildTuning("double-drop-d", "Double Drop D", "D A D G B D", [38, 45, 50, 55, 59, 62]),
  buildTuning("open-d", "Open D", "D A D F# A D", [38, 45, 50, 54, 57, 62]),
  buildTuning("open-g", "Open G", "D G D G B D", [38, 43, 50, 55, 59, 62]),
  buildTuning("open-a", "Open A", "E A E A C# E", [40, 45, 52, 57, 61, 64]),
  buildTuning("open-e", "Open E", "E B E G# B E", [40, 47, 52, 56, 59, 64]),
  buildTuning("open-c", "Open C", "C G C G C E", [36, 43, 48, 55, 60, 64]),
  buildTuning("open-d-minor", "Open D Minor", "D A D F A D", [38, 45, 50, 53, 57, 62]),
  buildTuning("drop-c-sharp", "Drop C#", "C# G# C# F# A# D#", [37, 44, 49, 54, 58, 63], true),
  buildTuning("drop-c", "Drop C", "C G C F A D", [36, 43, 48, 53, 57, 62]),
  buildTuning("c-standard", "C Standard", "C F Bb Eb G C", [36, 41, 46, 51, 55, 60], true),
  buildTuning("baritone-b", "Baritone B", "B E A D F# B", [35, 40, 45, 50, 54, 59]),
];

export const DEFAULT_TUNING_ID = "standard";

export function findTuning(id: string): Tuning {
  return TUNINGS.find((tuning) => tuning.id === id) ?? TUNINGS[0];
}

/** Nearest editable note to a raw detected frequency, with cents deviation. */
export interface PitchReading {
  frequency: number;
  midi: number;
  note: string;
  octave: number;
  cents: number;
}

export function readingFromFrequency(frequency: number, flats = false): PitchReading {
  const exact = midiFromFreq(frequency);
  const midi = Math.round(exact);
  const cents = 1200 * Math.log2(frequency / freqFromMidi(midi));
  return {
    frequency,
    midi,
    note: noteName(midi, flats),
    octave: Math.floor(midi / 12) - 1,
    cents,
  };
}

/** Index of the tuning string a detected pitch is closest to. */
export function closestStringIndex(midi: number, tuning: Tuning): number {
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  tuning.strings.forEach((string) => {
    const distance = Math.abs(string.midi - midi);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = string.index;
    }
  });
  return best;
}

export const IN_TUNE_CENTS = 5;
export const CENTS_RANGE = 50;
