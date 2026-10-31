import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TID } from "@/constants/testIds";
import {
  getTrending,
  getTopRated,
  getRecent,
  getUpcoming,
  getGenres,
  getPlatforms,
  getDetails,
  getSearch,
} from "@/services/games";
import { GameCarousel } from "@/components/GameCarousel";
import { RatingBadge } from "@/components/RatingBadge";
import { PlatformBadges } from "@/components/PlatformBadges";
import { formatYear, stripHtml } from "@/utils/format";
import { ChevronRight, Flame, Play } from "lucide-react";

const getSilentHill2Remake = async () => {
  try {
    const game = await getDetails("silent-hill-2-2024");
    if (String(game.released || "").startsWith("2024")) {
      return { ...game, name: "Silent Hill 2" };
    }
  } catch (error) {
    console.warn("Unable to load Silent Hill 2 by its expected slug; searching RAWG.", error);
  }

  const search = await getSearch({ query: "Silent Hill 2", page_size: 40 });
  const remake = (search.results || []).find((game) =>
    String(game.released || "").startsWith("2024") &&
    String(game.name || "").toLowerCase().includes("silent hill 2")
  );
  if (!remake?.slug) {
    throw new Error("RAWG search did not return the 2024 Silent Hill 2 remake.");
  }

  const game = await getDetails(remake.slug);
  if (!String(game.released || "").startsWith("2024")) {
    throw new Error(`RAWG returned ${game.name || remake.slug} instead of the 2024 Silent Hill 2 remake.`);
  }
  return { ...game, name: "Silent Hill 2" };
};

const getResidentEvil2Remake = async () => {
  try {
    const game = await getDetails("resident-evil-2");
    if (String(game.released || "").startsWith("2019")) {
      return { ...game, name: "Resident Evil 2" };
    }
  } catch (error) {
    console.warn("Unable to load Resident Evil 2 by its expected slug; searching RAWG.", error);
  }

  const search = await getSearch({ query: "Resident Evil 2", page_size: 40 });
  const remake = (search.results || []).find((game) =>
    String(game.released || "").startsWith("2019") &&
    String(game.name || "").toLowerCase().includes("resident evil 2")
  );
  if (!remake?.slug) {
    throw new Error("RAWG search did not return the 2019 Resident Evil 2 remake.");
  }

  const game = await getDetails(remake.slug);
  if (!String(game.released || "").startsWith("2019")) {
    throw new Error(`RAWG returned ${game.name || remake.slug} instead of the 2019 Resident Evil 2 remake.`);
  }
  return { ...game, name: "Resident Evil 2" };
};

const Hero = ({ games, error }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [timerReset, setTimerReset] = useState(0);
  const reduceMotion = useReducedMotion();
  const activeGame = games[activeIndex];

  useEffect(() => {
    if (games.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % games.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [activeIndex, games.length, timerReset]);

  if (!activeGame) {
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
      <AnimatePresence initial={false}>
        <motion.div
          key={activeGame.id}
          initial={{ x: reduceMotion ? 0 : "100%" }}
          animate={{ x: 0 }}
          exit={{ x: reduceMotion ? 0 : "-100%" }}
          transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <img
            src={activeGame.background_image}
            alt={activeGame.name}
            fetchpriority={activeIndex === 0 ? "high" : "auto"}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 nf-hero-fade" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
          <div className="nf-fog" />

          <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-6 md:px-10 min-h-[90vh] min-h-[90svh] flex flex-col justify-end pb-12 sm:pb-16 md:pb-24">
            <p className="font-brand nf-overline text-[10px] sm:text-[11px] text-[color:var(--nf-accent)]">
              <Flame className="inline h-3 w-3 mr-2 -mt-0.5" /> Featured · {activeGame.genres?.map((genre) => genre.name).join(" · ") || "Game"}
            </p>
            <h1 className="font-display nf-hero-title text-[clamp(2.75rem,12vw,4rem)] sm:text-6xl md:text-7xl lg:text-[7rem] mt-4 max-w-4xl leading-[0.9] sm:leading-[0.82]">
              {activeGame.name}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <RatingBadge value={activeGame.rating} metacritic={activeGame.metacritic} />
              <PlatformBadges platforms={activeGame.parent_platforms} max={6} />
              <span className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">
                · {formatYear(activeGame.released)}
              </span>
              {activeGame.esrb_rating?.name && (
                <span className="font-brand text-[11px] tracking-[0.15em] text-[color:var(--nf-text-dim)]">
                  · {activeGame.esrb_rating.name}
                </span>
              )}
            </div>
            <p className="mt-6 max-w-2xl line-clamp-3 text-base md:text-lg text-[color:var(--nf-text-dim)] leading-relaxed">
              {stripHtml(activeGame.description_raw || "Descend into a curated vault of games - each one a doorway into a new world.")
                .replace(/#{1,6}\s*/g, "")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link data-testid={TID.heroCta} to={`/game/${activeGame.slug}`} className="nf-btn nf-btn-primary">
                <Play className="h-3.5 w-3.5" /> View Details
              </Link>
              <Link to="/browse" className="nf-btn">
                Explore Vault <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      {games.length > 1 && (
        <div role="group" aria-label="Featured games" className="absolute bottom-5 right-5 z-20 flex gap-2 sm:bottom-8 sm:right-8">
          {games.map((game, index) => (
            <button
              key={game.id}
              type="button"
              onClick={() => {
                setActiveIndex(index);
                setTimerReset((reset) => reset + 1);
              }}
              aria-label={`Show ${game.name}`}
              aria-current={index === activeIndex ? "true" : undefined}
              className={`h-2 cursor-pointer select-none caret-transparent rounded-full transition-all duration-300 ${
                index === activeIndex ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

const GenrePlatformStrip = ({ genres, platforms, errors }) => (
  <section className="max-w-[1440px] mx-auto px-6 md:px-10 mt-24 grid gap-12 md:grid-cols-2">
    <div data-testid={TID.sectionGenres}>
      <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Popular Genres</p>
      <h3 className="font-display text-3xl mt-1">Choose your descent</h3>
      <div className="mt-6 flex flex-wrap gap-2">
        {errors.genres ? (
          <p role="status" className="text-sm text-[color:var(--nf-text-dim)]">{errors.genres}</p>
        ) : (genres || []).slice(0, 10).map((g) => (
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
        {errors.platforms ? (
          <p role="status" className="text-sm text-[color:var(--nf-text-dim)]">{errors.platforms}</p>
        ) : (platforms || []).slice(0, 10).map((p) => (
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
          getTrending({ page_size: 12 }),
          getTopRated({ page_size: 12 }),
          getRecent({ page_size: 12 }),
          getUpcoming({ page_size: 12 }),
          getGenres(),
          getPlatforms(),
          Promise.allSettled([
            getDetails("outlast-2"),
            getSilentHill2Remake(),
            getDetails("resident-evil-7-biohazard"),
            getDetails("until-dawn"),
            getResidentEvil2Remake(),
            getDetails("hellblade-senuas-sacrifice"),
          ]).then((heroResults) => {
            const games = heroResults.flatMap((result, index) => {
              if (result.status === "fulfilled") return [result.value];
              console.error(`Unable to load homepage featured game ${index + 1}.`, result.reason);
              return [];
            });
            if (games.length === 0) throw new Error("Unable to load any featured games.");
            return games;
          }),
        ]);
        if (!mounted) return;
        const setters = [
          (data) => setTrending(data?.results || []),
          (data) => setTop(data?.results || []),
          (data) => setRecent(data?.results || []),
          (data) => setUpcoming(data?.results || []),
          (data) => setGenres(data?.results || []),
          (data) => setPlatforms(data?.results || []),
          setHeroGames,
        ];
        const keys = ["trending", "top", "recent", "upcoming", "genres", "platforms", "hero"];
        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            setters[index](result.value);
          } else {
            console.error(`Unable to load homepage ${keys[index]} data.`, result.reason);
            setErrors((previous) => ({
              ...previous,
              [keys[index]]: "Unable to load this section. Please try again later.",
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
      <GenrePlatformStrip genres={genres} platforms={platforms} errors={errors} />
      <FeaturedCollection games={top} />
    </div>
  );
}
