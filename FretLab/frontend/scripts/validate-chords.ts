import { CHORDS, validateChord } from "./chords.ts";

let bad = 0;
for (const c of CHORDS) {
  const errs = validateChord(c);
  if (errs.length) { bad++; console.log(c.name, errs); }
}
console.log(`${CHORDS.length} chords checked, ${bad} invalid`);
process.exit(bad ? 1 : 0);
