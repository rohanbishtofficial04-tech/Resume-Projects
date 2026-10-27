import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTrending, getTopRated, getRecent } from "@/services/games";
import { TID } from "@/constants/testIds";
import { Skull, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { RatingBadge } from "@/components/RatingBadge";
import { PlatformBadges } from "@/components/PlatformBadges";
import { formatYear, stripHtml, clampText } from "@/utils/format";

export default function Random() {
  const [rolling, setRolling] = useState(false);
  const [game, setGame] = useState(null);

  const roll = async () => {
    setRolling(true);
    // Build a pool by combining trending/top/recent
    const [t, r, n] = await Promise.all([
      getTrending({ page_size: 40 }),
      getTopRated({ page_size: 40 }),
      getRecent({ page_size: 40 }),
    ]);
    const pool = [
      ...(t?.results || []),
      ...(r?.results || []),
      ...(n?.results || []),
    ];
    const unique = Array.from(new Map(pool.map((g) => [g.id, g])).values());
    // Suspenseful delay
    await new Promise((res) => setTimeout(res, 1400));
    const picked = unique[Math.floor(Math.random() * unique.length)] || null;
    setGame(picked);
    setRolling(false);
  };

  return (
    <div data-testid={TID.randomPage} className="max-w-[1440px] mx-auto px-6 md:px-10 pt-14 pb-24">
      <div className="mb-10">
        <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Dare</p>
        <h1 className="font-display text-5xl md:text-6xl mt-1 tracking-tight">Random Horror</h1>
        <p className="mt-3 text-[color:var(--nf-text-dim)] text-sm max-w-xl">
          Let the vault choose for you. Close your eyes. Press the button. Meet your next fear.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[420px] border border-[color:var(--nf-border)] bg-[color:var(--nf-surface)] p-8 md:p-16 text-center relative overflow-hidden">
        <div className="nf-fog" />
        <AnimatePresence mode="wait">
          {rolling ? (
            <motion.div
              key="rolling"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <motion.div
                animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Skull className="h-24 w-24 mx-auto text-[color:var(--nf-accent)]" strokeWidth={1.2} />
              </motion.div>
              <p className="mt-6 font-brand text-xs tracking-[0.4em] text-[color:var(--nf-text-dim)]">
                Summoning…
              </p>
            </motion.div>
          ) : game ? (
            <motion.div
              key={game.id}
              data-testid={TID.randomResult}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="relative w-full max-w-2xl"
            >
              <div className="relative aspect-[16/9] mb-6 overflow-hidden border border-[color:var(--nf-border)]">
                <img src={game.background_image} alt={game.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              </div>
              <p className="font-brand text-[11px] tracking-[0.3em] text-[color:var(--nf-accent)]">
                Your fate · {formatYear(game.released)}
              </p>
              <h2 className="font-display text-4xl md:text-5xl mt-2">{game.name}</h2>
              <div className="mt-4 flex flex-wrap items-center gap-3 justify-center">
                <RatingBadge value={game.rating} metacritic={game.metacritic} compact />
                <PlatformBadges platforms={game.parent_platforms} />
              </div>
              <p className="mt-4 text-sm text-[color:var(--nf-text-dim)] max-w-lg mx-auto">
                {clampText(stripHtml(game.description_raw || ""), 200) ||
                  (game.genres || []).map((g) => g.name).join(" · ")}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <Link to={`/game/${game.slug}`} className="nf-btn nf-btn-primary">
                  <Play className="h-3.5 w-3.5" /> View details
                </Link>
                <button onClick={roll} className="nf-btn">
                  Roll again
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="idle"
              data-testid={TID.randomRollBtn}
              onClick={roll}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative nf-btn nf-btn-primary text-base px-8 py-4"
            >
              <Skull className="h-4 w-4" /> Dare to Play
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
