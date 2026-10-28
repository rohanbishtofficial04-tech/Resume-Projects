import { useCallback, useEffect, useMemo, useState } from "react";
import { Heart, Play, Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import ChordCard from "@/components/chord-library/ChordCard";
import FretboardDiagram from "@/components/chord-library/FretboardDiagram";
import { CHORD_CATEGORIES, chordToneFrequencies, getChordLibrary, voicingFrequencies } from "@/lib/chords";
import type { Chord } from "@/lib/chords";
import { NOTE_NAMES, midiFromFreq, noteName } from "@/lib/music";
import { playStrum, stopAllTones } from "@/lib/audio/tones";
import { STORAGE_KEYS } from "@/lib/storage";
import { usePersistentState } from "@/hooks/usePersistentState";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 36;

function strumChord(chord: Chord): void {
  stopAllTones();
  playStrum(chordToneFrequencies(chord));
}

export default function ChordLibrary() {
  const library = useMemo(() => getChordLibrary(), []);
  const [query, setQuery] = useState("");
  const [rootFilter, setRootFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = usePersistentState<string[]>(STORAGE_KEYS.favorites, []);
  const [selected, setSelected] = useState<Chord | null>(null);
  const [voicingIndex, setVoicingIndex] = useState(0);
  const [limit, setLimit] = useState(PAGE_SIZE);

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase().replace(/\s+/g, "");
    return library.filter((chord) => {
      if (rootFilter !== "all" && chord.root !== rootFilter) return false;
      if (categoryFilter !== "all" && chord.category !== categoryFilter) return false;
      if (favoritesOnly && !favoriteSet.has(chord.id)) return false;
      if (!needle) return true;
      const haystack = `${chord.symbol}|${chord.name}|${chord.root}${chord.qualityId}`
        .toLowerCase()
        .replace(/\s+/g, "");
      return haystack.includes(needle);
    });
  }, [library, query, rootFilter, categoryFilter, favoritesOnly, favoriteSet]);

  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [query, rootFilter, categoryFilter, favoritesOnly]);

  const visible = filtered.slice(0, limit);

  const toggleFavorite = useCallback(
    (chord: Chord) => {
      setFavorites((previous) =>
        previous.includes(chord.id) ? previous.filter((id) => id !== chord.id) : [...previous, chord.id],
      );
    },
    [setFavorites],
  );

  const openChord = useCallback((chord: Chord) => {
    setSelected(chord);
    setVoicingIndex(0);
  }, []);

  const handlePlay = useCallback(
    (chord: Chord) => {
      strumChord(chord);
    },
    [],
  );

  const activeVoicing = selected?.voicings[voicingIndex] ?? null;

  return (
    <div className="flex flex-col gap-6">
      <section className="fl-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {library.length} chords · 12 roots · 19 qualities
          </p>
          <h1 className="mt-1 font-heading text-4xl font-bold tracking-tight sm:text-5xl">Chord Library</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Major, minor, seventh, suspended, diminished, augmented and extended chords — each with accurate fretboard
            diagrams, finger numbers and multiple voicings. Save the ones you use most.
          </p>
        </div>
        <button
          type="button"
          data-testid="chord-favorites-filter"
          aria-pressed={favoritesOnly}
          onClick={() => setFavoritesOnly((value) => !value)}
          className={cn(
            "flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-[border-color,background-color,color] duration-150",
            favoritesOnly
              ? "border-primary/60 bg-primary/15 text-primary"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          <Heart className="h-4 w-4" fill={favoritesOnly ? "currentColor" : "none"} />
          Favorites
          <span className="font-mono text-xs">{favorites.length}</span>
        </button>
      </section>

      <Card className="fl-rise fl-rise-1">
        <CardContent className="flex flex-col gap-5 py-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              data-testid="chord-search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search chords — try Cmaj7, F#m, Ddim, E7sus4…"
              aria-label="Search chords"
              className="h-12 pl-10 pr-10 font-mono text-base"
            />
            {query.length > 0 && (
              <button
                type="button"
                data-testid="chord-search-clear"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors duration-150 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Root</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                data-testid="chord-root-all"
                aria-pressed={rootFilter === "all"}
                onClick={() => setRootFilter("all")}
                className={cn(
                  "min-w-11 rounded-lg border px-3 py-1.5 font-mono text-sm font-semibold transition-colors duration-150",
                  rootFilter === "all"
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "border-border bg-surface text-muted-foreground hover:text-foreground",
                )}
              >
                All
              </button>
              {NOTE_NAMES.map((root) => (
                <button
                  key={root}
                  type="button"
                  data-testid={`chord-root-${root}`}
                  aria-pressed={rootFilter === root}
                  onClick={() => setRootFilter(root)}
                  className={cn(
                    "min-w-11 rounded-lg border px-3 py-1.5 font-mono text-sm font-semibold transition-colors duration-150",
                    rootFilter === root
                      ? "border-primary/60 bg-primary/15 text-primary"
                      : "border-border bg-surface text-muted-foreground hover:text-foreground",
                  )}
                >
                  {root}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Quality</span>
            <div className="flex flex-wrap gap-2">
              {CHORD_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  data-testid={`chord-category-${category.id}`}
                  aria-pressed={categoryFilter === category.id}
                  onClick={() => setCategoryFilter(category.id)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150",
                    categoryFilter === category.id
                      ? "border-primary/60 bg-primary/15 text-primary"
                      : "border-border bg-surface text-muted-foreground hover:text-foreground",
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <p data-testid="chord-result-count" className="font-mono text-xs text-muted-foreground">
          Showing {visible.length} of {filtered.length} matching chords
        </p>
        {filtered.length > visible.length && (
          <Button
            variant="outline"
            size="sm"
            data-testid="chord-show-more"
            onClick={() => setLimit((value) => value + PAGE_SIZE)}
          >
            Show more
          </Button>
        )}
      </div>

      {visible.length === 0 ? (
        <Card data-testid="chord-empty-state" className="fl-rise">
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <p className="font-heading text-lg font-bold">No chords match those filters</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Try clearing the search box, picking a different root, or turning off the favorites filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                setQuery("");
                setRootFilter("all");
                setCategoryFilter("all");
                setFavoritesOnly(false);
              }}
            >
              Reset filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div data-testid="chord-grid" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((chord) => (
            <ChordCard
              key={chord.id}
              chord={chord}
              favorite={favoriteSet.has(chord.id)}
              onOpen={openChord}
              onToggleFavorite={toggleFavorite}
              onPlay={handlePlay}
            />
          ))}
        </div>
      )}

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-w-lg" data-testid="chord-dialog">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 font-heading text-2xl">
                  {selected.symbol}
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-[0.14em]">
                    {selected.qualityLabel}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  {selected.voicings.length} voicing{selected.voicings.length === 1 ? "" : "s"} — tap one to see its
                  guitar diagram, then preview the chord.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-wrap gap-2">
                {selected.voicings.map((voicing, index) => (
                  <button
                    key={`${voicing.frets.join("-")}-${index}`}
                    type="button"
                    data-testid={`chord-voicing-${index}`}
                    aria-pressed={index === voicingIndex}
                    onClick={() => setVoicingIndex(index)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors duration-150",
                      index === voicingIndex
                        ? "border-primary/60 bg-primary/15 text-primary"
                        : "border-border bg-surface text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {voicing.label}
                  </button>
                ))}
              </div>

              {activeVoicing && (
                <div className="flex flex-col items-center gap-4">
                  <FretboardDiagram
                    frets={activeVoicing.frets}
                    fingers={activeVoicing.fingers}
                    startFret={activeVoicing.startFret}
                    barre={activeVoicing.barre}
                    title={selected.symbol}
                    className="max-w-[260px]"
                    testId="chord-dialog-diagram"
                  />
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {voicingFrequencies(activeVoicing.frets).map((frequency, index) => (
                      <span
                        key={`${frequency}-${index}`}
                        className="rounded-md border border-border bg-surface px-2 py-1 font-mono text-[11px] text-muted-foreground"
                      >
                        {noteName(midiFromFreq(frequency))}
                      </span>
                    ))}
                  </div>
                  <Button
                    data-testid="chord-dialog-play"
                    onClick={() => {
                      stopAllTones();
                      playStrum(chordToneFrequencies(selected));
                    }}
                    className="w-full"
                  >
                    <Play className="h-4 w-4" />
                    Play {selected.symbol}
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
