// Wrapper that switches between live RAWG API and mock data
// depending on whether an API key is configured.
import * as rawg from "./rawgApi";
import MOCK from "./mockData";

const usingMock = !rawg.RAWG_KEY_PRESENT;
export const isMockMode = () => usingMock;

const safe = async (live, mock) => {
  if (usingMock) return mock();
  try {
    return await live();
  } catch (e) {
    console.warn("[RAWG] request failed, falling back to mock:", e?.message);
    return mock();
  }
};

export const getTrending = (p) =>
  safe(() => rawg.fetchTrending(p), () => MOCK.trending());
export const getTopRated = (p) =>
  safe(() => rawg.fetchTopRated(p), () => MOCK.topRated());
export const getRecent = (p) =>
  safe(() => rawg.fetchRecent(p), () => MOCK.recent());
export const getUpcoming = (p) =>
  safe(() => rawg.fetchUpcoming(p), () => MOCK.upcoming());
export const getSearch = (p) =>
  safe(() => rawg.searchGames(p), () => MOCK.browse({ search: p.query }));
export const getBrowse = (p) =>
  safe(() => rawg.browseGames(p), () => MOCK.browse(p));
export const getDetails = (slug) =>
  safe(() => rawg.fetchGameDetails(slug), () => MOCK.details(slug));
export const getScreenshots = (slug) =>
  safe(() => rawg.fetchScreenshots(slug), () => MOCK.screenshots(slug));
export const getMovies = (slug) =>
  safe(() => rawg.fetchMovies(slug), () => MOCK.movies());
export const getRelated = (slug) =>
  safe(() => rawg.fetchRelated(slug), () => MOCK.related());
export const getGenres = () =>
  safe(() => rawg.fetchGenres(), () => MOCK.genres());
export const getPlatforms = () =>
  safe(() => rawg.fetchPlatforms(), () => MOCK.platforms());
