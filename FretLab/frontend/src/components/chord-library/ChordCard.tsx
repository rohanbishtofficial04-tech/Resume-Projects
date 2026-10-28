import { Heart, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FretboardDiagram from "@/components/chord-library/FretboardDiagram";
import type { Chord } from "@/lib/chords";
import { cn } from "@/lib/utils";

interface ChordCardProps {
  chord: Chord;
  favorite: boolean;
  onOpen: (chord: Chord) => void;
  onToggleFavorite: (chord: Chord) => void;
  onPlay: (chord: Chord) => void;
}

export default function ChordCard({ chord, favorite, onOpen, onToggleFavorite, onPlay }: ChordCardProps) {
  const voicing = chord.voicings[0];

  return (
    <div
      data-testid={`chord-card-${chord.id}`}
      className="fl-rise group flex flex-col rounded-2xl border border-border bg-card p-4 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_10px_30px_-18px_var(--primary)]"
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onOpen(chord)}
          className="text-left"
          aria-label={`View voicings for ${chord.name}`}
        >
          <span className="block font-heading text-xl font-bold tracking-tight">{chord.symbol}</span>
          <span className="block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {chord.qualityLabel}
          </span>
        </button>
        <button
          type="button"
          data-testid={`chord-favorite-${chord.id}`}
          aria-pressed={favorite}
          aria-label={favorite ? `Remove ${chord.name} from favorites` : `Add ${chord.name} to favorites`}
          onClick={() => onToggleFavorite(chord)}
          className={cn(
            "rounded-full border p-1.5 transition-[color,background-color,border-color,transform] duration-150 active:scale-95",
            favorite
              ? "border-primary/60 bg-primary/15 text-primary"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary",
          )}
        >
          <Heart className="h-4 w-4" fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onOpen(chord)}
        className="mt-3 flex justify-center"
        aria-label={`Open diagram for ${chord.name}`}
      >
        {voicing ? (
          <FretboardDiagram
            frets={voicing.frets}
            fingers={voicing.fingers}
            startFret={voicing.startFret}
            barre={voicing.barre}
            title={chord.symbol}
            className="max-w-[190px]"
            testId={`chord-diagram-${chord.id}`}
          />
        ) : (
          <span className="py-8 text-xs text-muted-foreground">No voicing available</span>
        )}
      </button>

      <div className="mt-3 flex items-center justify-between gap-2">
        <Badge variant="secondary" className="text-[10px] uppercase tracking-[0.12em]">
          {chord.voicings.length} voicing{chord.voicings.length === 1 ? "" : "s"}
        </Badge>
        <button
          type="button"
          data-testid={`chord-play-${chord.id}`}
          onClick={() => onPlay(chord)}
          aria-label={`Play ${chord.name} chord`}
          className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-[color,border-color,background-color] duration-150 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
        >
          <Play className="h-3.5 w-3.5" />
          Play
        </button>
      </div>
    </div>
  );
}
