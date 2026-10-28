#!/bin/sh
# Rewrites the "@/lib/music" alias so Node can run the files directly (type-stripping).
set -e
T=$(mktemp -d)
sed 's#@/lib/music#./music.ts#' src/lib/chords.ts > "$T/chords.ts"
cp src/lib/music.ts "$T/music.ts"
cp scripts/validate-chords.ts "$T/validate.ts"
node --experimental-strip-types "$T/validate.ts"
