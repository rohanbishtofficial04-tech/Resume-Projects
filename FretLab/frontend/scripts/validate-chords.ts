import { CHORD_QUALITIES, getChordLibrary } from "../src/lib/chords.ts";
import { TUNINGS } from "../src/lib/music.ts";

const tuning = TUNINGS[0];
const requiredIntervals: Record<string, number[]> = {
  "9": [0, 2, 4, 10],
  maj9: [0, 2, 4, 11],
  min9: [0, 2, 3, 10],
  "11": [0, 4, 5, 10],
  "13": [0, 4, 9, 10],
};
const errors: string[] = [];

for (const chord of getChordLibrary()) {
  const quality = CHORD_QUALITIES.find(({ id }) => id === chord.qualityId);
  if (!quality) {
    errors.push(`${chord.name}: missing chord quality`);
    continue;
  }
  if (chord.voicings.length === 0) errors.push(`${chord.name}: no playable voicings`);
  const chordTones = new Set(quality.intervals.map((interval) => (chord.rootPc + interval) % 12));
  const requiredTones = (requiredIntervals[quality.id] ?? quality.intervals).map(
    (interval) => (chord.rootPc + interval) % 12,
  );

  for (const [index, voicing] of chord.voicings.entries()) {
    const label = `${chord.name}, voicing ${index + 1}`;
    if (voicing.frets.length !== 6 || voicing.fingers.length !== 6) {
      errors.push(`${label}: expected six strings`);
      continue;
    }

    const sounding: number[] = [];
    const fretted: number[] = [];
    const fretByFinger = new Map<number, number>();
    voicing.frets.forEach((fret, string) => {
      const finger = voicing.fingers[string];
      if (!Number.isInteger(fret) || fret < -1 || fret > 15) errors.push(`${label}: invalid fret ${fret}`);
      if (!Number.isInteger(finger) || finger < -1 || finger > 4) errors.push(`${label}: invalid finger ${finger}`);
      if (fret === -1) {
        if (finger !== -1) errors.push(`${label}: muted string must not have a finger`);
        return;
      }
      if (fret === 0 && finger !== 0) errors.push(`${label}: open string must not have a fretting finger`);
      if (fret > 0) {
        if (finger === 0) errors.push(`${label}: fretted string is missing a finger`);
        const previousFret = fretByFinger.get(finger);
        if (previousFret !== undefined && previousFret !== fret) {
          errors.push(`${label}: finger ${finger} is assigned to multiple frets`);
        }
        fretByFinger.set(finger, fret);
      }

      const pitchClass = ((tuning.strings[string].midi + fret) % 12 + 12) % 12;
      sounding.push(pitchClass);
      if (fret > 0) fretted.push(fret);
      if (!chordTones.has(pitchClass)) errors.push(`${label}: string ${string + 1} plays a non-chord tone`);
    });

    if (sounding.length < 4) errors.push(`${label}: fewer than four strings sound`);
    if (fretted.length > 0 && Math.max(...fretted) - Math.min(...fretted) > 3) {
      errors.push(`${label}: fret span is wider than four frets`);
    }
    for (const tone of requiredTones) {
      if (!sounding.includes(tone)) errors.push(`${label}: missing required chord tone ${tone}`);
    }

    if (voicing.barre) {
      const { fret, fromString, toString } = voicing.barre;
      if (
        fromString < 0 ||
        toString > 5 ||
        fromString >= toString ||
        voicing.frets[fromString] !== fret ||
        voicing.frets[toString] !== fret ||
        !voicing.frets.slice(fromString, toString + 1).every((position) => position >= fret)
      ) {
        errors.push(`${label}: barre does not match the fretted strings`);
      }
    }
  }

  if (chord.qualityId === "maj") {
    const eFormFret = ((chord.rootPc - 4 + 12) % 12) || 12;
    const aFormFret = ((chord.rootPc - 9 + 12) % 12) || 12;
    const hasEForm = chord.voicings.some(
      ({ frets, barre }) =>
        frets.join(",") ===
          [eFormFret, eFormFret + 2, eFormFret + 2, eFormFret + 1, eFormFret, eFormFret].join(",") &&
        barre?.fromString === 0 &&
        barre.toString === 5,
    );
    const hasAForm = chord.voicings.some(
      ({ frets, barre }) =>
        frets.join(",") ===
          [-1, aFormFret, aFormFret + 2, aFormFret + 2, aFormFret + 2, aFormFret].join(",") &&
        barre?.fromString === 1 &&
        barre.toString === 5,
    );
    if (!hasEForm || !hasAForm) errors.push(`${chord.name}: missing an E- or A-form barre voicing`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`${getChordLibrary().length} chords and all voicings validated`);
