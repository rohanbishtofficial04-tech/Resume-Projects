
export const STORAGE_KEYS = {
  theme: "fretlab.theme",
  favorites: "fretlab.favorites",
  metronome: "fretlab.metronome",
  tuning: "fretlab.tuning",
  navigationScrollLeft: "fretlab.navigation.scrollLeft",
  chordGuessHighScores: "fretlab.chordGuess.highScores",
  chordPlayHighScores: "fretlab.chordPlay.highScores",
} as const;

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
}