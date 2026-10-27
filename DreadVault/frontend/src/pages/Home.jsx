import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TID } from "@/constants/testIds";
import {
  getTrending,
  getTopRated,
  getRecent,
  getUpcoming,
  getGenres,
  getPlatforms,
} from "@/services/games";
import { GameCarousel } from "@/components/GameCarousel";
import { RatingBadge } from "@/components/RatingBadge";
import { PlatformBadges } from "@/components/PlatformBadges";
import { clampText, stripHtml, formatYear } from "@/utils/format";
import { ChevronRight, Flame, Play } from "lucide-react";

const Hero = ({ game }) => {
  if (!game) {
    return <div className="relative min-h-[90vh] w-full nf-skeleton" />;
  }
  return (
    <section
      data-testid={TID.heroBanner}
      className="relative min-h-[90vh] w-full overflow-hidden"
    >
      <motion.img
        initial={{ scale: 1.08, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
        src={game.background_image}
        alt={game.name}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 nf-hero-fade" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
      <div className="nf-fog" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-10 min-h-[90vh] flex flex-col justify-end pb-16 md:pb-24">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="font-brand nf-overline text-[10px] sm:text-[11px] text-[color:var(--nf-accent)]"
        >
          <Flame className="inline h-3 w-3 mr-2 -mt-0.5" /> Featured · Horror
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7 }}
          className="font-display nf-hero-title text-5xl sm:text-6xl md:text-7xl lg:text-[7rem] mt-4 max-w-4xl leading-[0.82]"
        >
          {game.name}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-6 flex flex-wrap items-center gap-3"
        >
          <RatingBadge value={game.rating} metacritic={game.metacritic} />
          <PlatformBadges platforms={game.parent_platforms} max={6} />
          <span className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">
            · {formatYear(game.released)}
          </span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="mt-6 max-w-2xl text-base md:text-lg text-[color:var(--nf-text-dim)] leading-relaxed"
        >
          {clampText(stripHtml(game.description_raw || ""), 220) ||
            "Descend into a curated vault of horror titles — each one a doorway into dread."}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Link data-testid={TID.heroCta} to={`/game/${game.slug}`} className="nf-btn nf-btn-primary">
            <Play className="h-3.5 w-3.5" /> View Details
          </Link>
          <Link to="/browse" className="nf-btn">
            Explore Vault <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

const GenrePlatformStrip = ({ genres, platforms }) => (
  <section className="max-w-[1440px] mx-auto px-6 md:px-10 mt-24 grid gap-12 md:grid-cols-2">
    <div data-testid={TID.sectionGenres}>
      <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Popular Genres</p>
      <h3 className="font-display text-3xl mt-1">Choose your descent</h3>
      <div className="mt-6 flex flex-wrap gap-2">
        {(genres || []).slice(0, 10).map((g) => (
          <Link key={g.id} to={`/browse?genre=${g.slug}`} className="nf-chip">
            {g.name}
          </Link>
        ))}
      </div>
    </div>
    <div data-testid={TID.sectionPlatforms}>
      <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Popular Platforms</p>
      <h3 className="font-display text-3xl mt-1">Pick your device</h3>
      <div className="mt-6 flex flex-wrap gap-2">
        {(platforms || []).slice(0, 10).map((p) => (
          <Link key={p.id} to={`/browse?platform=${p.id}`} className="nf-chip">
            {p.name}
          </Link>
        ))}
      </div>
    </div>
  </section>
);

const FeaturedCollection = ({ games }) => {
  const pick = (games || []).slice(0, 5);
  if (pick.length < 3) return null;
  return (
    <section data-testid={TID.sectionFeatured} className="max-w-[1440px] mx-auto px-6 md:px-10 mt-24">
      <div className="mb-6">
        <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Featured Collection</p>
        <h2 className="font-display text-3xl md:text-4xl mt-1">Masters of Survival Horror</h2>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-12">
        <Link
          to={`/game/${pick[0].slug}`}
          className="md:col-span-7 relative aspect-[16/10] md:aspect-auto md:min-h-[420px] overflow-hidden group border border-[color:var(--nf-border)]"
        >
          <img
            src={pick[0].background_image}
            alt={pick[0].name}
            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-[700ms] ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute bottom-0 p-6">
            <p className="font-brand text-[10px] tracking-[0.2em] text-[color:var(--nf-accent)]">Cornerstone</p>
            <h3 className="font-display text-4xl mt-1">{pick[0].name}</h3>
          </div>
        </Link>
        <div className="md:col-span-5 grid grid-cols-2 gap-4">
          {pick.slice(1, 5).map((g) => (
            <Link
              key={g.id}
              to={`/game/${g.slug}`}
              className="relative aspect-square overflow-hidden group border border-[color:var(--nf-border)]"
            >
              <img
                src={g.background_image}
                alt={g.name}
                className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-[700ms] ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-0 p-3">
                <h4 className="font-display text-lg leading-tight">{g.name}</h4>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [top, setTop] = useState([]);
  const [recent, setRecent] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [genres, setGenres] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [tr, tp, rc, up, gn, pf] = await Promise.all([
          getTrending({ page_size: 12 }),
          getTopRated({ page_size: 12 }),
          getRecent({ page_size: 12 }),
          getUpcoming({ page_size: 12 }),
          getGenres(),
          getPlatforms(),
        ]);
        if (!mounted) return;
        setTrending(tr?.results || []);
        setTop(tp?.results || []);
        setRecent(rc?.results || []);
        setUpcoming(up?.results || []);
        setGenres(gn?.results || []);
        setPlatforms(pf?.results || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const hero = top[0] || trending[0];

  return (
    <div data-testid={TID.home}>
      <Hero game={hero} />
      <GameCarousel
        title="Trending in the Dark"
        subtitle="Trending Now"
        games={trending}
        loading={loading}
        tid={TID.sectionTrending}
        viewAllTo="/browse?sort=-added"
      />
      <GameCarousel
        title="Top Rated Nightmares"
        subtitle="Top Rated"
        games={top}
        loading={loading}
        tid={TID.sectionTopRated}
        viewAllTo="/browse?sort=-rating"
      />
      <GameCarousel
        title="Recently Released"
        subtitle="Last 12 Months"
        games={recent}
        loading={loading}
        tid={TID.sectionRecent}
        viewAllTo="/browse?sort=-released"
      />
      <GameCarousel
        title="Upcoming Terrors"
        subtitle="Coming Soon"
        games={upcoming}
        loading={loading}
        tid={TID.sectionUpcoming}
        viewAllTo="/browse?sort=released"
      />
      <GenrePlatformStrip genres={genres} platforms={platforms} />
      <FeaturedCollection games={top} />
    </div>
  );
}
