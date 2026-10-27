import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { TID } from "@/constants/testIds";
import { useLibrary } from "@/context/LibraryContext";
import { RatingBadge } from "./RatingBadge";
import { PlatformBadges } from "./PlatformBadges";
import { formatYear } from "@/utils/format";

export const GameCard = ({ game, index = 0, priority = false }) => {
  const { isFavorite, toggleFavorite } = useLibrary();
  const fav = isFavorite(game.id);

  return (
    <motion.article
      data-testid={TID.gameCard}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.4) }}
      className="group relative border border-[color:var(--nf-border)] bg-[color:var(--nf-surface)] nf-card-hover"
    >
      <Link to={`/game/${game.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-black">
          {game.background_image ? (
            <img
              src={game.background_image}
              alt={game.name}
              loading={priority ? "eager" : "lazy"}
              className="h-full w-full object-cover grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-[transform,filter] duration-[600ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
            />
          ) : (
            <div className="h-full w-full nf-skeleton" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
          <div className="absolute top-2 right-2">
            <RatingBadge value={game.rating} metacritic={game.metacritic} compact />
          </div>
          <button
            data-testid={TID.favoriteBtn}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(game);
            }}
            className={`absolute top-2 left-2 h-8 w-8 grid place-items-center border border-[color:var(--nf-border)] backdrop-blur-md bg-black/40 hover:border-[color:var(--nf-accent)] transition-colors ${
              fav ? "text-[color:var(--nf-accent-strong)]" : "text-white/80"
            }`}
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={fav}
          >
            <Heart className="h-4 w-4" fill={fav ? "currentColor" : "none"} strokeWidth={1.6} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-brand text-[10px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">
              {formatYear(game.released)}
            </p>
            <PlatformBadges platforms={game.parent_platforms} max={4} />
          </div>
          <h3 className="mt-2 font-display text-xl leading-tight tracking-tight text-[color:var(--nf-text)] group-hover:text-[color:var(--nf-accent-strong)] transition-colors">
            {game.name}
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(game.genres || []).slice(0, 2).map((g) => (
              <span key={g.id} className="text-[10px] font-brand tracking-[0.18em] text-[color:var(--nf-text-dim)]">
                {g.name}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.article>
  );
};
