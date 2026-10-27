import { Star } from "lucide-react";
import { ratingColor, metacriticColor } from "@/utils/format";

export const RatingBadge = ({ value, metacritic, compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-black/70 backdrop-blur-md border border-white/10">
        {metacritic ? (
          <span
            className="font-brand text-[10px] font-medium tracking-[0.1em]"
            style={{ color: metacriticColor(metacritic) }}
          >
            {metacritic}
          </span>
        ) : null}
        {value ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-brand text-white/90">
            <Star className="h-2.5 w-2.5" fill="currentColor" style={{ color: ratingColor(value) }} />
            {value.toFixed(1)}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-3 border border-[color:var(--nf-border)] px-4 py-2 bg-[color:var(--nf-surface)]">
      {metacritic ? (
        <div className="flex items-baseline gap-2">
          <span className="font-brand text-[10px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Metacritic</span>
          <span
            className="font-display text-2xl font-semibold"
            style={{ color: metacriticColor(metacritic) }}
          >
            {metacritic}
          </span>
        </div>
      ) : null}
      {value ? (
        <div className="flex items-baseline gap-2">
          <span className="font-brand text-[10px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">RAWG</span>
          <span className="inline-flex items-center gap-1 font-display text-2xl" style={{ color: ratingColor(value) }}>
            <Star className="h-4 w-4" fill="currentColor" />
            {value.toFixed(1)}
          </span>
        </div>
      ) : null}
    </div>
  );
};
