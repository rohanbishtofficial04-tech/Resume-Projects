import { GameCard } from "./GameCard";
import { SkeletonCard } from "./SkeletonCard";
import { TID } from "@/constants/testIds";

export const GameGrid = ({ games, loading, error, skeletonCount = 10, emptyLabel = "No games found." }) => {
  if (error && (!games || games.length === 0)) {
    return (
      <div role="status" className="py-24 text-center">
        <p className="font-brand text-xs tracking-[0.2em] text-[color:var(--nf-text-dim)]">{error}</p>
      </div>
    );
  }

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
      {error && (
        <p role="status" className="col-span-full py-4 text-sm text-[color:var(--nf-text-dim)]">
          {error}
        </p>
      )}
      {games.map((g) => (
        <GameCard key={g.id} game={g} />
      ))}
      {loading &&
        Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={`s-${i}`} />)}
    </div>
  );
};
