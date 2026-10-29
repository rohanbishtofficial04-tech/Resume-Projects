import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  getDetails,
  getScreenshots,
  getMovies,
  getRelated,
  getBrowse,
} from "@/services/games";
import { useLibrary } from "@/context/LibraryContext";
import { RatingBadge } from "@/components/RatingBadge";
import { PlatformBadges } from "@/components/PlatformBadges";
import { GameCard } from "@/components/GameCard";
import { formatDate, stripHtml } from "@/utils/format";
import { TID } from "@/constants/testIds";
import {
  Heart,
  Share2,
  ExternalLink,
  Play,
  Globe,
  ArrowLeft,
  FolderPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const TrailerVideo = ({ src, poster, autoPlay = false, className = "" }) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    videoRef.current?.play().catch(() => toast("Unable to play trailer."));
  };

  return (
    <div className={`relative aspect-video overflow-hidden bg-black ${className}`} onClick={(event) => event.stopPropagation()}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls={playing}
        autoPlay={autoPlay}
        preload="metadata"
        className="h-full w-full border border-[color:var(--nf-border)] object-contain"
        aria-label="Game trailer"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      {!playing && (
        <button
          type="button"
          onClick={play}
          className="absolute inset-0 grid place-items-center bg-black/25 text-white transition-colors hover:bg-black/40"
          aria-label="Play trailer"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full border border-white/70 bg-black/60 backdrop-blur-sm">
            <Play className="h-6 w-6 fill-current" />
          </span>
        </button>
      )}
    </div>
  );
};

export default function GameDetails() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, trackRecent, collections, createCollection, addToCollection } = useLibrary();

  const [game, setGame] = useState(null);
  const [screens, setScreens] = useState([]);
  const [movies, setMovies] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [screensError, setScreensError] = useState("");
  const [moviesError, setMoviesError] = useState("");
  const [relatedError, setRelatedError] = useState("");
  const [lightbox, setLightbox] = useState(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const visibleScreens = screens.slice(0, 6);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setGame(null);
    setScreens([]);
    setMovies([]);
    setRelated([]);
    setPageError("");
    setScreensError("");
    setMoviesError("");
    setRelatedError("");
    (async () => {
      let currentGame;
      try {
        currentGame = await getDetails(slug);
      } catch (requestError) {
        console.error(`Unable to load details for ${slug}.`, requestError);
        if (mounted) {
          setPageError("Unable to load this game. Please try again later.");
          setLoading(false);
        }
        return;
      }

      if (!mounted) return;
      if (!currentGame) {
        setPageError("This game could not be found.");
        setLoading(false);
        return;
      }
      setGame(currentGame);
      setLoading(false);
      if (currentGame) trackRecent(currentGame);

      const results = await Promise.allSettled([
        getScreenshots(slug),
        getMovies(slug),
        getRelated(slug, currentGame),
      ]);
      if (!mounted) return;

      if (results[0].status === "fulfilled") {
        setScreens(results[0].value?.results || []);
      } else {
        console.error(`Unable to load screenshots for ${slug}.`, results[0].reason);
        setScreensError("Unable to load screenshots right now.");
      }

      if (results[1].status === "fulfilled") {
        setMovies(results[1].value?.results || []);
      } else {
        console.error(`Unable to load the trailer for ${slug}.`, results[1].reason);
        setMoviesError("Unable to load the trailer right now.");
      }

      if (results[2].status === "rejected") {
        console.error(`Unable to load related games for ${slug}.`, results[2].reason);
        setRelatedError("Unable to load related games right now.");
        return;
      }

      let rel = results[2].value?.results || [];
      if (rel.length < 4 && currentGame?.genres?.length) {
        try {
          const fallback = await getBrowse({
            page_size: 8,
            genres: currentGame.genres[0].slug,
            ordering: "-rating",
          });
          rel = (fallback?.results || []).filter((item) => item.id !== currentGame.id).slice(0, 8);
        } catch (requestError) {
          console.error(`Unable to load additional related games for ${slug}.`, requestError);
          if (rel.length === 0) setRelatedError("Unable to load related games right now.");
        }
      }
      if (mounted) setRelated(rel);
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (lightbox === null) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft" && visibleScreens.length > 1) {
        setLightbox((index) => (index - 1 + visibleScreens.length) % visibleScreens.length);
      }
      if (event.key === "ArrowRight" && visibleScreens.length > 1) {
        setLightbox((index) => (index + 1) % visibleScreens.length);
      }
      if (event.key === "Escape") setLightbox(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox, visibleScreens.length]);

  if (loading) {
    return (
      <div data-testid={TID.detailsPage} className="min-h-screen">
        <div className="h-[70vh] w-full nf-skeleton" />
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 mt-10 space-y-4">
          <div className="h-10 w-1/2 nf-skeleton" />
          <div className="h-4 w-1/3 nf-skeleton" />
          <div className="h-24 w-full nf-skeleton" />
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div data-testid={TID.detailsPage} className="min-h-screen px-6 pt-20 text-center">
        <p role="status" className="text-sm text-[color:var(--nf-text-dim)]">
          {pageError || "Unable to load this game. Please try again later."}
        </p>
      </div>
    );
  }

  const formatRatingCount = (value) => {
    if (value == null || Number(value) <= 0) return "—";
    return new Intl.NumberFormat("en-US").format(Number(value));
  };

  const formatPlaytime = (value) => {
    if (value == null || Number(value) <= 0) return "—";
    return `${Number(value)} hr${Number(value) === 1 ? "" : "s"}`;
  };

  const formatEsrb = (value) => {
    if (!value) return "Not available";
    if (typeof value === "string") return value;
    return value.name || "Not available";
  };

  const fav = isFavorite(game.id);
  const share = async () => {
    const shareData = {
      title: `${game.name} — DreadVault`,
      text: `Check out ${game.name} on DreadVault`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast("Link copied to clipboard");
      }
    } catch {
      /* dismissed */
    }
  };

  const addGameToCollection = (collection) => {
    if (collection.games.some((item) => item.id === game.id)) {
      toast(`${game.name} is already in ${collection.name}`);
      return;
    }
    addToCollection(collection.id, game);
    toast(`${game.name} added to ${collection.name}`);
    setCollectionOpen(false);
  };

  const createAndAddCollection = (event) => {
    event.preventDefault();
    const collection = createCollection(collectionName);
    if (!collection) return;
    addToCollection(collection.id, game);
    toast(`${game.name} added to ${collection.name}`);
    setCollectionName("");
    setCollectionOpen(false);
  };

  const trailer = movies[0]?.data?.max || movies[0]?.data?.["480"];

  const showPreviousScreenshot = () => {
    setLightbox((index) => (index - 1 + visibleScreens.length) % visibleScreens.length);
  };
  const showNextScreenshot = () => {
    setLightbox((index) => (index + 1) % visibleScreens.length);
  };

  return (
    <div data-testid={TID.detailsPage}>
      {/* Hero */}
      <section className="relative flex min-h-[75vh] flex-col overflow-hidden">
        <img
          src={game.background_image}
          alt={game.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 nf-hero-fade" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
        <div className="relative z-20 mx-auto w-full max-w-[1440px] px-4 pt-4 sm:px-6 md:px-10">
          <button
            type="button"
            onClick={() =>
              navigate(location.key === "default" ? "/browse" : -1)
            }
            className="nf-btn min-h-11 min-w-11 px-3 sm:px-5 shadow-lg"
            style={{ backgroundColor: "var(--nf-bg)" }}
            aria-label="Back to browse"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 items-end px-6 pt-8 pb-2 sm:px-6 sm:pt-4 sm:pb-4 md:px-10 md:pb-6">
          <div className="max-w-4xl">
            <p className="font-brand text-[11px] tracking-[0.3em] text-[color:var(--nf-accent)]">
              {(game.genres || []).slice(0, 3).map((g) => g.name).join(" · ")}
            </p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display text-4xl sm:text-6xl md:text-7xl tracking-tight leading-[0.95] mt-2 sm:mt-4"
            >
              {game.name}
            </motion.h1>
            <div className="mt-3 sm:mt-6 flex flex-wrap items-center gap-3">
              <RatingBadge value={game.rating} metacritic={game.metacritic} />
              <PlatformBadges platforms={game.parent_platforms} max={6} />
              <span className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">
                Released {formatDate(game.released)}
              </span>
            </div>
            <div className="mt-4 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
              <button
                data-testid={TID.detailsFavorite}
                onClick={() => toggleFavorite(game)}
                className={`nf-btn ${fav ? "nf-btn-primary" : ""}`}
                aria-pressed={fav}
              >
                <Heart className="h-3.5 w-3.5" fill={fav ? "currentColor" : "none"} />
                {fav ? "Favorited" : "Add to Favorites"}
              </button>
              <button
                data-testid={TID.detailsCollection}
                onClick={() => setCollectionOpen(true)}
                className="nf-btn"
              >
                <FolderPlus className="h-3.5 w-3.5" /> Add to Collection
              </button>
              <button data-testid={TID.detailsShare} onClick={share} className="nf-btn">
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
              {trailer && (
                <button
                  data-testid={TID.detailsTrailer}
                  onClick={() => setTrailerOpen(true)}
                  className="nf-btn"
                >
                  <Play className="h-3.5 w-3.5" /> Play Trailer
                </button>
              )}
              {game.website && (
                <a
                  href={game.website}
                  target="_blank"
                  rel="noreferrer"
                  className="nf-btn"
                >
                  <Globe className="h-3.5 w-3.5" /> Official site <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-10 mt-16 grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">About</p>
          <h2 className="font-display text-3xl md:text-4xl mt-1">The whispers say…</h2>
          <p className="mt-6 text-[color:var(--nf-text-dim)] leading-relaxed whitespace-pre-line">
            {stripHtml(game.description_raw || game.description || "No description available.")}
          </p>
        </div>

        <aside className="space-y-6">
          <div className="border border-[color:var(--nf-border)] p-5">
            <p className="font-brand text-[10px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Developer</p>
            <p className="mt-1 text-sm">
              {(game.developers || []).map((d) => d.name).join(", ") || "—"}
            </p>
          </div>
          <div className="border border-[color:var(--nf-border)] p-5">
            <p className="font-brand text-[10px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Publisher</p>
            <p className="mt-1 text-sm">
              {(game.publishers || []).map((d) => d.name).join(", ") || "—"}
            </p>
          </div>
          <div className="border border-[color:var(--nf-border)] p-5">
            <p className="font-brand text-[10px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Platforms</p>
            <p className="mt-1 text-sm">
              {(game.platforms || []).map((p) => p.platform?.name || p.name).join(", ") || "—"}
            </p>
          </div>
          <div className="border border-[color:var(--nf-border)] p-5">
            <p className="font-brand text-[10px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Rating Count</p>
            <p className="mt-1 text-sm">{formatRatingCount(game.ratings_count)}</p>
          </div>
          <div className="border border-[color:var(--nf-border)] p-5">
            <p className="font-brand text-[10px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Playtime</p>
            <p className="mt-1 text-sm">{formatPlaytime(game.playtime)}</p>
          </div>
          <div className="border border-[color:var(--nf-border)] p-5">
            <p className="font-brand text-[10px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">ESRB Rating</p>
            <p className="mt-1 text-sm">{formatEsrb(game.esrb_rating)}</p>
          </div>
          {game.stores?.length ? (
            <div className="border border-[color:var(--nf-border)] p-5">
              <p className="font-brand text-[10px] tracking-[0.2em] text-[color:var(--nf-text-dim)] mb-3">
                Where to buy
              </p>
              <div className="flex flex-col gap-2">
                {game.stores.map((s) => (
                  <a
                    key={s.id}
                    href={s.url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-between text-sm hover:text-[color:var(--nf-accent-strong)]"
                  >
                    {s.store?.name || "Store"} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </section>

      {/* Trailer */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-10 mt-20">
        <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Game Trailer</p>
        <h2 className="font-display text-3xl md:text-4xl mt-1">{game.name}</h2>
        {trailer ? (
          <TrailerVideo
            src={trailer}
            poster={game.background_image}
            className="mt-6 w-full"
          />
        ) : (
          <p role={moviesError ? "status" : undefined} className="mt-6 border border-[color:var(--nf-border)] p-5 text-sm text-[color:var(--nf-text-dim)]">
            {moviesError || "Not available"}
          </p>
        )}
      </section>

      {/* Screenshots */}
      {(screens.length > 0 || screensError) && (
        <section data-testid={TID.detailsScreenshots} className="max-w-[1440px] mx-auto px-6 md:px-10 mt-20">
          <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Screenshots</p>
          <h2 className="font-display text-3xl md:text-4xl mt-1">Fragments</h2>
          {screensError ? (
            <p role="status" className="mt-6 text-sm text-[color:var(--nf-text-dim)]">{screensError}</p>
          ) : <div className="mt-6 grid gap-3 grid-cols-2 md:grid-cols-3">
            {visibleScreens.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setLightbox(i)}
                className={`relative overflow-hidden border border-[color:var(--nf-border)] group ${
                  i === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <img
                  src={s.image}
                  alt={`Screenshot ${i + 1}`}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-[600ms] ease-out"
                  loading="lazy"
                />
              </button>
            ))}
          </div>}
        </section>
      )}

      {/* Related */}
      {(related.length > 0 || relatedError) && (
        <section data-testid={TID.detailsRelated} className="max-w-[1440px] mx-auto px-6 md:px-10 mt-20 mb-20">
          <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">Related</p>
          <h2 className="font-display text-3xl md:text-4xl mt-1">Kindred Nightmares</h2>
          {relatedError ? (
            <p role="status" className="mt-6 text-sm text-[color:var(--nf-text-dim)]">{relatedError}</p>
          ) : <div className="mt-6 grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {related.slice(0, 8).map((g, i) => (
              <GameCard key={g.id} game={g} index={i} />
            ))}
          </div>}
        </section>
      )}

      <AnimatePresence>
        {collectionOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl grid place-items-center px-6"
            onClick={() => setCollectionOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="collection-dialog-title"
              className="w-full max-w-md max-h-[80vh] overflow-y-auto bg-[color:var(--nf-surface)] border border-[color:var(--nf-border)] p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <p id="collection-dialog-title" className="font-display text-2xl">
                Add to collection
              </p>
              {collections.length > 0 ? (
                <div className="mt-5 space-y-2">
                  {collections.map((collection) => {
                    const alreadyAdded = collection.games.some((item) => item.id === game.id);
                    return (
                      <button
                        key={collection.id}
                        type="button"
                        onClick={() => addGameToCollection(collection)}
                        disabled={alreadyAdded}
                        className="nf-btn w-full justify-between disabled:cursor-default disabled:opacity-50"
                      >
                        <span className="truncate">{collection.name}</span>
                        <span className="text-[10px] uppercase tracking-widest text-[color:var(--nf-text-dim)]">
                          {alreadyAdded ? "Already added" : `${collection.games.length} games`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 text-sm text-[color:var(--nf-text-dim)]">
                  Create a collection to save this game.
                </p>
              )}

              <form onSubmit={createAndAddCollection} className="mt-5 border-t border-[color:var(--nf-border)] pt-5">
                <label className="block text-xs uppercase tracking-[0.18em] text-[color:var(--nf-text-dim)]">
                  New collection
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    value={collectionName}
                    onChange={(event) => setCollectionName(event.target.value)}
                    placeholder="Collection name…"
                    className="min-w-0 flex-1 bg-black/40 border border-[color:var(--nf-border)] px-3 py-2 text-sm outline-none focus:border-[color:var(--nf-accent)]"
                    autoFocus
                  />
                  <button type="submit" className="nf-btn nf-btn-primary" disabled={!collectionName.trim()}>
                    Create
                  </button>
                </div>
              </form>

              <div className="mt-5 flex justify-end">
                <button type="button" onClick={() => setCollectionOpen(false)} className="nf-btn">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      {lightbox !== null && visibleScreens[lightbox] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl grid place-items-center p-6"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Screenshot viewer"
        >
          <img
            src={visibleScreens[lightbox].image}
            alt={`Screenshot ${lightbox + 1} of ${visibleScreens.length}`}
            className="max-h-[90vh] max-w-full object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          {visibleScreens.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPreviousScreenshot();
                }}
                className="absolute left-4 md:left-8 grid h-11 w-11 place-items-center border border-white/20 bg-black/70 text-white hover:bg-black"
                aria-label="Previous screenshot"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNextScreenshot();
                }}
                className="absolute right-4 md:right-8 grid h-11 w-11 place-items-center border border-white/20 bg-black/70 text-white hover:bg-black"
                aria-label="Next screenshot"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-brand text-xs tracking-[0.2em] text-white">
                {lightbox + 1} / {visibleScreens.length}
              </p>
            </>
          )}
        </div>
      )}

      {/* Trailer */}
      {trailerOpen && trailer && (
        <div
          className="fixed inset-0 z-50 bg-black/95 grid place-items-center p-6"
          onClick={() => setTrailerOpen(false)}
        >
          <TrailerVideo
            src={trailer}
            poster={game.background_image}
            autoPlay
            className="w-full max-w-5xl max-h-[90vh]"
          />
        </div>
      )}
    </div>
  );
}
