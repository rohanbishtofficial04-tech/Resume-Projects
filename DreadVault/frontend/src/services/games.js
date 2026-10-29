// Wrapper that switches between live RAWG API and mock data
// depending on whether an API key is configured.
import * as rawg from "./rawgApi";
import MOCK from "./mockData";

const usingMock = !rawg.RAWG_KEY_PRESENT;
export const isMockMode = () => usingMock;

const safe = async (live, mock) => {
  if (usingMock) return mock();
  return live();
};

export const getTrending = (p) =>
  safe(() => rawg.fetchTrending(p), () => MOCK.trending());
export const getTopRated = (p) =>
  safe(() => rawg.fetchTopRated(p), () => MOCK.topRated());
export const getRecent = (p) =>
  safe(() => rawg.fetchRecent(p), () => MOCK.recent());
export const getUpcoming = (p) =>
  safe(() => rawg.fetchUpcoming(p), () => MOCK.upcoming());

const SPORTS_NAME_PATTERN = /\b(?:efootball|fifa|football|soccer|foosball|basketball|baseball|hockey|tennis|golf|rugby|wrestling|motorsport|racing|formula [1-9]|pes)\b/i;

const normalizeSearch = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const rankSearchResults = (data, query) => {
  const normalizedQuery = normalizeSearch(query);
  const results = [...(data?.results || [])].sort((a, b) => {
    const aName = normalizeSearch(a.name);
    const bName = normalizeSearch(b.name);
    const aExact = aName === normalizedQuery ? 0 : 1;
    const bExact = bName === normalizedQuery ? 0 : 1;
    if (aExact !== bExact) return aExact - bExact;

    const aStarts = aName.startsWith(normalizedQuery) ? 0 : 1;
    const bStarts = bName.startsWith(normalizedQuery) ? 0 : 1;
    return aStarts - bStarts;
  });

  return { ...(data || {}), count: results.length, results };
};

const removeSportsGames = (data) => {
  const results = (data?.results || []).filter((game) => {
    const genres = [...(game.genres || []), ...(game.tags || [])];
    const hasSportsCategory = genres.some((item) =>
      [item?.slug, item?.name].some((value) =>
        String(value || "").toLowerCase().includes("sport")
      )
    );
    return !hasSportsCategory && !SPORTS_NAME_PATTERN.test(game.name || "");
  });

  return { ...(data || {}), count: results.length, results };
};

export const getSearch = (p) =>
  safe(
    () => rawg.searchGames(p).then(removeSportsGames).then((data) => rankSearchResults(data, p.query)),
    () => rankSearchResults(removeSportsGames(MOCK.browse({ search: p.query, page_size: p.page_size })), p.query)
  );
export const getBrowse = (p) =>
  safe(() => rawg.browseGames(p), () => MOCK.browse(p));
export const getDetails = (slug) =>
  safe(() => rawg.fetchGameDetails(slug), () => MOCK.details(slug));
export const getScreenshots = (slug) =>
  safe(() => rawg.fetchScreenshots(slug), () => MOCK.screenshots(slug));
export const getMovies = (slug) =>
  safe(() => rawg.fetchMovies(slug), () => MOCK.movies());
const dateEra = (release) => Math.floor(Number(String(release || "").slice(0, 4)) / 5);

const rankRelated = (games, game) => {
  const genreIds = new Set((game?.genres || []).map((item) => item.slug || item.name));
  const platformIds = new Set((game?.parent_platforms || game?.platforms || []).map((item) =>
    item.platform?.id ?? item.platform?.slug ?? item.id
  ).filter(Boolean));
  const targetEra = dateEra(game?.released);

  return [...games]
    .filter((item) => item.id !== game?.id && item.slug !== game?.slug)
    .map((item, index) => {
      const genres = (item.genres || []).map((genre) => genre.slug || genre.name);
      const platforms = (item.parent_platforms || item.platforms || []).map((entry) =>
        entry.platform?.id ?? entry.platform?.slug ?? entry.id
      ).filter(Boolean);
      const genreScore = genres.filter((genre) => genreIds.has(genre)).length;
      const platformScore = platforms.filter((platform) => platformIds.has(platform)).length;
      const eraScore = targetEra && dateEra(item.released) === targetEra ? 1 : 0;
      return { item, score: genreScore * 10 + platformScore * 3 + eraScore, index };
    })
    .sort((a, b) => b.score - a.score || b.item.rating - a.item.rating || a.index - b.index)
    .map(({ item }) => item);
};

export const getRelated = (slug, game) =>
  safe(async () => {
    const primary = await rawg.fetchRelated(slug);
    const genre = game?.genres?.[0]?.slug;
    const fallback = genre
      ? await rawg.browseGames({ genres: genre, ordering: "-rating", page_size: 30 })
      : { results: [] };
    const gamesById = new Map();
    for (const item of [...(primary?.results || []), ...(fallback?.results || [])]) {
      gamesById.set(item.id, item);
    }
    return { results: rankRelated([...gamesById.values()], game).slice(0, 8) };
  }, () => ({ results: rankRelated(MOCK.related(game)?.results || [], game).slice(0, 8) }));
export const getGenres = () =>
  safe(() => rawg.fetchGenres(), () => MOCK.genres());
export const getPlatforms = () =>
  safe(() => rawg.fetchPlatforms(), () => MOCK.platforms());
