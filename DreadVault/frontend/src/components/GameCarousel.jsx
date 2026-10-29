import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { GameCard } from "./GameCard";
import { SkeletonCard } from "./SkeletonCard";

export const GameCarousel = ({ title, subtitle, games, loading, error, tid, viewAllTo }) => {
  const scrollerRef = useRef(null);

  const scroll = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = el.clientWidth * 0.85 * (dir === "next" ? 1 : -1);
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section data-testid={tid} className="max-w-[1440px] mx-auto px-6 md:px-10 mt-16">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          {subtitle && (
            <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">{subtitle}</p>
          )}
          <h2 className="font-display text-3xl md:text-4xl tracking-tight mt-1">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {viewAllTo && (
            <Link
              to={viewAllTo}
              className="hidden sm:inline-flex font-brand text-[10px] tracking-[0.2em] text-[color:var(--nf-text-dim)] hover:text-[color:var(--nf-accent-strong)]"
            >
              View all →
            </Link>
          )}
          <button
            onClick={() => scroll("prev")}
            aria-label="Scroll previous"
            className="p-2 border border-[color:var(--nf-border)] hover:border-[color:var(--nf-accent)] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("next")}
            aria-label="Scroll next"
            className="p-2 border border-[color:var(--nf-border)] hover:border-[color:var(--nf-accent)] transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      {error ? (
        <p role="status" className="py-8 text-sm text-[color:var(--nf-text-dim)]">
          {error}
        </p>
      ) : <div
        ref={scrollerRef}
        className="flex gap-3 sm:gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 md:mx-0 md:px-0"
      >
        {loading && (!games || games.length === 0)
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-[72vw] max-w-[220px] shrink-0 snap-start sm:w-[220px]">
                <SkeletonCard />
              </div>
            ))
          : (games || []).map((g) => (
              <div key={g.id} className="w-[72vw] max-w-[220px] shrink-0 snap-start sm:w-[220px]">
                <GameCard game={g} />
              </div>
            ))}
      </div>}
    </section>
  );
};
