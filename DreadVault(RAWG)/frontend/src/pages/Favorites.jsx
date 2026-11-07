import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLibrary } from "@/context/LibraryContext";
import { GameGrid } from "@/components/GameGrid";
import { TID } from "@/constants/testIds";
import { Ghost, Trash2 } from "lucide-react";

export default function Favorites() {
  const { favorites, recent, clearRecent } = useLibrary();

  return (
    <div data-testid={TID.favoritesPage} className="max-w-[1440px] mx-auto px-6 md:px-10 pt-14 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Your Vault</p>
        <h1 className="font-display text-5xl md:text-6xl mt-1 tracking-tight">Favorites</h1>
        <p className="mt-3 text-[color:var(--nf-text-dim)] text-sm">
          {favorites.length} game{favorites.length === 1 ? "" : "s"} preserved for the long night.
        </p>
      </motion.div>

      {favorites.length === 0 ? (
        <div data-testid={TID.favoritesEmpty} className="border border-dashed border-[color:var(--nf-border)] p-16 text-center">
          <Ghost className="mx-auto h-10 w-10 text-[color:var(--nf-text-dim)]" strokeWidth={1.3} />
          <h2 className="font-display text-3xl mt-4">Nothing here yet…</h2>
          <p className="mt-2 text-sm text-[color:var(--nf-text-dim)] max-w-md mx-auto">
            When a title haunts you, tap the heart on any game card. Your list lives in this browser.
          </p>
          <Link to="/browse" className="mt-6 inline-flex nf-btn nf-btn-primary">
            Explore the Vault
          </Link>
        </div>
      ) : (
        <GameGrid games={favorites} loading={false} />
      )}

      {recent.length > 0 && (
        <section className="mt-24">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Trail</p>
              <h2 className="font-display text-3xl md:text-4xl mt-1">Recently Viewed</h2>
            </div>
            <button onClick={clearRecent} className="nf-btn text-xs">
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
          <GameGrid games={recent} loading={false} />
        </section>
      )}
    </div>
  );
}
