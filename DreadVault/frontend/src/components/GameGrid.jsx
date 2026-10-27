import { GameCard } from "./GameCard";
import { SkeletonCard } from "./SkeletonCard";
import { TID } from "@/constants/testIds";

export const GameGrid = ({ games, loading, skeletonCount = 10, emptyLabel = "No games found." }) => {
  if (loading && (!games || games.length === 0)) {
    return (
      <div data-testid={TID.gameGrid} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-brand text-xs tracking-[0.2em] text-[color:var(--nf-text-dim)]">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div data-testid={TID.gameGrid} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
      {games.map((g) => (
        <GameCard key={g.id} game={g} />
      ))}
      {loading &&
        Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={`s-${i}`} />)}
    </div>
  );
};
