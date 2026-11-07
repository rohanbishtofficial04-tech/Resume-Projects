import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getBrowse, getGenres, getPlatforms } from "@/services/games";
import { GameGrid } from "@/components/GameGrid";
import { TID } from "@/constants/testIds";
import { Filter, X } from "lucide-react";

const SORTS = [
  { value: "-added", label: "Trending" },
  { value: "-rating", label: "Top Rated" },
  { value: "-released", label: "Newest" },
  { value: "released", label: "Oldest" },
  { value: "name", label: "A → Z" },
  { value: "-name", label: "Z → A" },
];

const YEARS = Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i);
const RATINGS = [4.5, 4.0, 3.5, 3.0];

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const genre = params.get("genre") || "";
  const platform = params.get("platform") || "";
  const year = params.get("year") || "";
  const rating = params.get("rating") || "";
  const sort = params.get("sort") || "-added";
  const search = params.get("q") || "";

  const [genres, setGenres] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [games, setGames] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getGenres(), getPlatforms()]).then(([genresResult, platformsResult]) => {
      if (!active) return;
      if (genresResult.status === "fulfilled") setGenres(genresResult.value?.results || []);
      else {
        console.error("Unable to load browse genres.", genresResult.reason);
        setFilterError("Unable to load filters. Please try again later.");
      }
      if (platformsResult.status === "fulfilled") setPlatforms(platformsResult.value?.results || []);
      else {
        console.error("Unable to load browse platforms.", platformsResult.reason);
        setFilterError("Unable to load filters. Please try again later.");
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const load = useCallback(
    async (targetPage, replace) => {
      const currentRequest = ++requestId.current;
      setLoading(true);
      setError("");
      try {
        let nextPage = targetPage;
        let data;
        let results = [];
        let scannedPages = 0;
        do {
          data = await getBrowse({
            page: nextPage,
            page_size: rating ? 40 : 20,
            genres: genre || undefined,
            platforms: platform || undefined,
            year: year || undefined,
            ordering: sort,
            search: search || undefined,
          });
          results = (data?.results || []).filter(
            (game) => !rating || Number(game.rating) >= Number(rating)
          );
          nextPage += 1;
          scannedPages += 1;
        } while (rating && results.length === 0 && data?.next && scannedPages < 5);

        if (currentRequest !== requestId.current) return;
        setHasMore(Boolean(data?.next));
        setGames((prev) => (replace ? results : [...prev, ...results]));
        setPage(nextPage);
      } catch (requestError) {
        if (currentRequest !== requestId.current) return;
        console.error("Unable to load browse results.", requestError);
        setError("Unable to load games. Please try again later.");
        if (replace) {
          setGames([]);
          setHasMore(false);
        }
      } finally {
        if (currentRequest === requestId.current) setLoading(false);
      }
    },
    [genre, platform, year, rating, sort, search]
  );

  useEffect(() => {
    setPage(1);
    load(1, true);
    return () => {
      requestId.current += 1;
    };
  }, [load]);

  const loadMore = () => {
    load(page, false);
  };

  const update = (key, value) => {
    const p = new URLSearchParams(params);
    if (!value) p.delete(key);
    else p.set(key, value);
    setParams(p, { replace: true });
  };

  const clearAll = () => setParams({}, { replace: true });

  const activeCount = useMemo(
    () => [genre, platform, year, rating, search].filter(Boolean).length,
    [genre, platform, year, rating, search]
  );

  const FiltersInner = (
    <div className="space-y-8">
    {filterError && (
      <p role="status" className="text-sm text-[color:var(--nf-text-dim)]">{filterError}</p>
    )}
      <div>
        <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)] mb-3">Sort by</p>
        <select
          data-testid={TID.filterSort}
          value={sort}
          onChange={(e) => update("sort", e.target.value)}
          className="w-full bg-[color:var(--nf-surface)] border border-[color:var(--nf-border)] px-3 py-2 text-sm focus:border-[color:var(--nf-accent)] outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)] mb-3">Genre</p>
        <div data-testid={TID.filterGenre} className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
          {genres.map((g) => (
            <button
              type="button"
              key={g.id}
              data-active={genre === g.slug}
              aria-pressed={genre === g.slug}
              onClick={() => update("genre", genre === g.slug ? "" : g.slug)}
              className="nf-chip"
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)] mb-3">Platform</p>
        <div data-testid={TID.filterPlatform} className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
          {platforms.map((p) => (
            <button
              type="button"
              key={p.id}
              data-active={String(platform) === String(p.id)}
              aria-pressed={String(platform) === String(p.id)}
              onClick={() => update("platform", String(platform) === String(p.id) ? "" : p.id)}
              className="nf-chip"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)] mb-3">Release year</p>
        <select
          data-testid={TID.filterYear}
          value={year}
          onChange={(e) => update("year", e.target.value)}
          className="w-full bg-[color:var(--nf-surface)] border border-[color:var(--nf-border)] px-3 py-2 text-sm focus:border-[color:var(--nf-accent)] outline-none"
        >
          <option value="">Any year</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)] mb-3">Min rating</p>
        <div data-testid={TID.filterRating} className="flex flex-wrap gap-2">
          {RATINGS.map((r) => (
            <button
              type="button"
              key={r}
              data-active={String(rating) === String(r)}
              aria-pressed={String(rating) === String(r)}
              onClick={() => update("rating", String(rating) === String(r) ? "" : String(r))}
              className="nf-chip"
            >
              {r.toFixed(1)}+
            </button>
          ))}
        </div>
      </div>

      {activeCount > 0 && (
        <button type="button" data-testid={TID.filterClear} onClick={clearAll} className="nf-btn w-full justify-center">
          <X className="h-3.5 w-3.5" /> Clear all
        </button>
      )}
    </div>
  );

  return (
    <div data-testid={TID.browsePage} className="max-w-[1440px] mx-auto px-6 md:px-10 pt-14">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 flex items-end justify-between gap-4 flex-wrap"
      >
        <div>
          <p className="font-brand text-[11px] tracking-[0.2em] text-[color:var(--nf-text-dim)]">The Vault</p>
          <h1 className="font-display text-5xl md:text-6xl mt-1 tracking-tight">Browse Horror</h1>
        </div>
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden nf-btn"
          aria-label="Open filters"
          aria-expanded={mobileFiltersOpen}
        >
          <Filter className="h-3.5 w-3.5" /> Filters ({activeCount})
        </button>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside data-testid={TID.filterPanel} className="hidden lg:block sticky top-24 self-start">
          {FiltersInner}
        </aside>

        <div>
          <GameGrid
            games={games}
            loading={loading}
            error={error}
            emptyLabel={
              rating
                ? "No matching games on this page. Load more to continue searching."
                : "No games match these filters."
            }
          />
          {hasMore && (
            <div className="mt-10 flex justify-center">
              <button data-testid={TID.loadMore} onClick={loadMore} disabled={loading} className="nf-btn nf-btn-primary disabled:opacity-50">
                {loading ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl lg:hidden" onClick={() => setMobileFiltersOpen(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-[color:var(--nf-bg)] border-l border-[color:var(--nf-border)] p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <p className="font-display text-2xl">Filters</p>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 border border-[color:var(--nf-border)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {FiltersInner}
          </div>
        </div>
      )}
    </div>
  );
}
