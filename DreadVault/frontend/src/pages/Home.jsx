import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { TID } from "@/constants/testIds";
import {
  getTrendingHorror,
  getTopNightmares,
  getRecent,
  getUpcoming,
  getGenres,
  getPlatforms,
  getFeaturedGames,
} from "@/services/games";
import { GameCarousel } from "@/components/GameCarousel";
import { RatingBadge } from "@/components/RatingBadge";
import { PlatformBadges } from "@/components/PlatformBadges";
import { formatYear, stripHtml } from "@/utils/format";
import { selectPopularGenres, selectPopularPlatforms } from "@/utils/popularCatalog";
import { ChevronRight, Flame, Play } from "lucide-react";

const HERO_SLIDE_DURATION = 5000;

const Hero = ({ games, error }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [timerReset, setTimerReset] = useState(0);
  const [isPageVisible, setIsPageVisible] = useState(
    () => typeof document === "undefined" || document.visibilityState === "visible"
  );
  const game = games[activeIndex];

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (games.length < 2 || !isPageVisible) return undefined;
    const timer = setTimeout(() => {
      setActiveIndex((index) => (index + 1) % games.length);
    }, HERO_SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [games.length, activeIndex, isPageVisible, timerReset]);

  if (!game) {
    return error ? (
      <div role="status" className="grid min-h-[90vh] w-full place-items-center text-sm text-[color:var(--nf-text-dim)]">
        {error}
      </div>
    ) : <div className="relative min-h-[90vh] w-full nf-skeleton" />;
  }
  return (
    <section
      data-testid={TID.heroBanner}
      className="relative min-h-[90vh] min-h-[90svh] w-full overflow-hidden"
    >
      <AnimatePresence initial={false} mode="sync">
        <motion.img
          key={`hero-image-${game.id}`}
          src={game.background_image}
          alt={game.name}
          fetchpriority="high"
          decoding="async"
          initial={{ opacity: 0, scale: 1.025 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute inset-0 nf-hero-fade" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
      <div className="nf-fog" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-6 md:px-10 min-h-[90vh] min-h-[90svh] flex flex-col justify-end pb-12 sm:pb-16 md:pb-24">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={game.id}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="font-brand nf-overline text-[10px] sm:text-[11px] text-[color:var(--nf-accent)]">
              <Flame className="inline h-3 w-3 mr-2 -mt-0.5" /> Featured · {game.genres?.slice(0, 3).map((genre) => genre.name).join(" · ") || "Game"}
            </p>
            <h1 className="font-display nf-hero-title text-[clamp(2.75rem,12vw,4rem)] sm:text-6xl md:text-7xl lg:text-[7rem] mt-4 max-w-4xl leading-[0.9] sm:leading-[0.82]">
              {game.name}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <RatingBadge
                value={game.rating}
                metacritic={game.metacritic}
                criticRating={game.critic_rating}
                provider={game.provider}
              />
              <PlatformBadges platforms={game.parent_platforms} max={6} />
              <span className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">
                · {formatYear(game.released)}
              </span>
              {game.esrb_rating?.name && (
                <span className="font-brand text-[11px] tracking-[0.15em] text-[color:var(--nf-text-dim)]">
                  · {game.esrb_rating.name}
                </span>
              )}
            </div>
            <p className="mt-6 max-w-2xl line-clamp-3 text-base md:text-lg text-[color:var(--nf-text-dim)] leading-relaxed">
              {stripHtml(game.description_raw || "Descend into a curated vault of games - each one a doorway into a new world.")
                .replace(/#{1,6}\s*/g, "")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link data-testid={TID.heroCta} to={`/game/${game.slug}`} className="nf-btn nf-btn-primary">
                <Play className="h-3.5 w-3.5" /> View Details
              </Link>
              <Link to="/browse" className="nf-btn">
                Explore Vault <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="relative z-20 mt-4 flex items-center justify-end gap-1" role="group" aria-label="Featured game slides">
          {games.map((featured, index) => (
            <button
              key={featured.id}
              type="button"
              data-testid={`hero-slide-${index}`}
              aria-label={`Show ${featured.name}`}
              aria-pressed={activeIndex === index}
              onClick={() => {
                setActiveIndex(index);
                setTimerReset((value) => value + 1);
              }}
              className={`h-2 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--nf-accent)] ${
                activeIndex === index
                  ? "w-8 bg-[color:var(--nf-accent)]"
                  : "w-2 bg-white/50 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>
      )}
    </section>
  );
};

const SECTION_ERROR = "Unable to load section. Please try again later.";

const GenrePlatformStrip = ({ genres, platforms, errors, loading }) => (
  <section className="max-w-[1440px] mx-auto px-6 md:px-10 mt-24 grid gap-12 md:grid-cols-2">
    <div data-testid={TID.sectionGenres}>
      <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Popular Genres</p>
      <h3 className="font-display text-3xl mt-1">Choose your descent</h3>
      <div className="mt-6 flex flex-wrap gap-2">
        {errors.genres || (!loading && genres.length === 0) ? (
          <p role="status" className="text-sm text-[color:var(--nf-text-dim)]">{errors.genres || SECTION_ERROR}</p>
        ) : selectPopularGenres(genres).map((g) => (
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
        {errors.platforms || (!loading && platforms.length === 0) ? (
          <p role="status" className="text-sm text-[color:var(--nf-text-dim)]">{errors.platforms || SECTION_ERROR}</p>
        ) : selectPopularPlatforms(platforms).map((p) => (
          <Link key={p.id} to={`/browse?platform=${p.id}`} className="nf-chip">
            {p.name}
          </Link>
        ))}
      </div>
    </div>
  </section>
);

const FeaturedCollection = ({ games, error }) => {
  const pick = (games || []).slice(0, 5);
  return (
    <section data-testid={TID.sectionFeatured} className="max-w-[1440px] mx-auto px-6 md:px-10 mt-24">
      <div className="mb-6">
        <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Featured Collection</p>
        <h2 className="font-display text-3xl md:text-4xl mt-1">Masters of Survival Horror</h2>
      </div>
      {error || pick.length < 3 ? (
        <p role="status" className="py-8 text-sm text-[color:var(--nf-text-dim)]">
          {error || SECTION_ERROR}
        </p>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-12">
          <Link
            to={`/game/${pick[0].slug}`}
            className="md:col-span-7 relative aspect-[16/10] md:aspect-auto md:min-h-[420px] overflow-hidden group border border-[color:var(--nf-border)]"
          >
            <img
              src={pick[0].background_image}
              alt={pick[0].name}
              loading="lazy"
              decoding="async"
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
                  loading="lazy"
                  decoding="async"
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
      )}
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
  const [heroGames, setHeroGames] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const results = await Promise.allSettled([
          getTrendingHorror(),
          getTopNightmares(),
          getRecent({ page_size: 12 }),
          getUpcoming({ page_size: 12 }),
          getGenres(),
          getPlatforms(),
          getFeaturedGames(),
        ]);
        if (!mounted) return;
        const setters = [
          (data) => setTrending(data?.results || []),
          (data) => setTop(data?.results || []),
          (data) => setRecent(data?.results || []),
          (data) => setUpcoming(data?.results || []),
          (data) => setGenres(data?.results || []),
          (data) => setPlatforms(data?.results || []),
          (data) => setHeroGames(data?.results || []),
        ];
        const keys = ["trending", "top", "recent", "upcoming", "genres", "platforms", "hero"];
        results.forEach((result, index) => {
          if (
            result.status === "fulfilled" &&
            Array.isArray(result.value?.results) &&
            result.value.results.length > 0
          ) {
            setters[index](result.value);
          } else {
            const reason = result.status === "rejected"
              ? result.reason
              : new Error("The API returned no data.");
            console.error(`Unable to load homepage ${keys[index]} data.`, reason);
            setErrors((previous) => ({
              ...previous,
              [keys[index]]: SECTION_ERROR,
            }));
          }
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div data-testid={TID.home}>
      <Hero games={heroGames} error={errors.hero} />
      <GameCarousel
        title="Trending in the Dark"
        subtitle="Trending Now"
        games={trending}
        loading={loading}
        error={errors.trending}
        tid={TID.sectionTrending}
        viewAllTo="/browse?sort=-added"
      />
      <GameCarousel
        title="Top Rated Nightmares"
        subtitle="Top Rated"
        games={top}
        loading={loading}
        error={errors.top}
        tid={TID.sectionTopRated}
        viewAllTo="/browse?sort=-rating"
      />
      <GameCarousel
        title="Recently Released"
        subtitle="Last 12 Months"
        games={recent}
        loading={loading}
        error={errors.recent}
        tid={TID.sectionRecent}
        viewAllTo="/browse?sort=-released"
      />
      <GameCarousel
        title="Upcoming Terrors"
        subtitle="Coming Soon"
        games={upcoming}
        loading={loading}
        error={errors.upcoming}
        tid={TID.sectionUpcoming}
        viewAllTo="/browse?sort=released"
      />
      <GenrePlatformStrip genres={genres} platforms={platforms} errors={errors} loading={loading} />
      <FeaturedCollection games={top} error={errors.top} />
    </div>
  );
}
