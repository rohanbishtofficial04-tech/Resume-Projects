import axios from "axios";

const KEY = process.env.REACT_APP_RAWG_API_KEY || "";
const BASE = "https://api.rawg.io/api";

export const RAWG_KEY_PRESENT = Boolean(KEY);

const client = axios.create({
  baseURL: BASE,
  timeout: 15000,
});

const responseCache = new Map();
const pendingRequests = new Map();
const MAX_CACHE_ENTRIES = 150;
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;
const DETAIL_CACHE_TTL = 30 * 60 * 1000;
const REFERENCE_CACHE_TTL = 24 * 60 * 60 * 1000;

client.interceptors.request.use((config) => {
  config.params = { ...(config.params || {}), key: KEY };
  return config;
});

const getCached = (path, params = {}, ttl = DEFAULT_CACHE_TTL) => {
  const cacheKey = `${path}:${JSON.stringify(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .sort(([a], [b]) => a.localeCompare(b))
  )}`;
  const now = Date.now();
  const cached = responseCache.get(cacheKey);

  if (cached?.expiresAt > now) {
    responseCache.delete(cacheKey);
    responseCache.set(cacheKey, cached);
    return Promise.resolve(cached.data);
  }
  if (cached) responseCache.delete(cacheKey);
  if (pendingRequests.has(cacheKey)) return pendingRequests.get(cacheKey);

  const request = client
    .get(path, { params })
    .then(({ data }) => {
      responseCache.set(cacheKey, { data, expiresAt: Date.now() + ttl });
      while (responseCache.size > MAX_CACHE_ENTRIES) {
        responseCache.delete(responseCache.keys().next().value);
      }
      return data;
    })
    .finally(() => pendingRequests.delete(cacheKey));

  pendingRequests.set(cacheKey, request);
  return request;
};

const HORROR_TAG = "horror";

const withHorror = (params = {}) => ({
  tags: HORROR_TAG,
  ...params,
});

export const fetchTrending = ({ page = 1, page_size = 12 } = {}) =>
  getCached("/games", withHorror({ ordering: "-added", page, page_size }));

export const fetchTopRated = ({ page = 1, page_size = 12 } = {}) =>
  getCached("/games", withHorror({ ordering: "-rating", page, page_size, metacritic: "70,100" }));

export const fetchRecent = ({ page = 1, page_size = 12 } = {}) => {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 12);
  const iso = (d) => d.toISOString().split("T")[0];
  return getCached(
    "/games",
    withHorror({ ordering: "-released", dates: `${iso(from)},${iso(to)}`, page, page_size })
  );
};

export const fetchUpcoming = ({ page = 1, page_size = 12 } = {}) => {
  const from = new Date();
  const to = new Date();
  to.setFullYear(to.getFullYear() + 3);
  const iso = (d) => d.toISOString().split("T")[0];
  return getCached(
    "/games",
    withHorror({ ordering: "released", dates: `${iso(from)},${iso(to)}`, page, page_size })
  );
};

export const searchGames = ({ query, page = 1, page_size = 20 }) =>
  getCached("/games", { search: query, page, page_size }, 2 * 60 * 1000);

export const browseGames = ({
  page = 1,
  page_size = 20,
  genres,
  platforms,
  year,
  ordering = "-added",
  search,
} = {}) => {
  const params = withHorror({ page, page_size, ordering });
  if (search) params.search = search;
  if (genres && genres !== HORROR_TAG) params.genres = genres;
  if (platforms) params.platforms = platforms;
  if (year) params.dates = `${year}-01-01,${year}-12-31`;
  return getCached("/games", params);
};

export const fetchGameDetails = (slug) =>
  getCached(`/games/${slug}`, {}, DETAIL_CACHE_TTL);

export const fetchScreenshots = (slug) =>
  getCached(`/games/${slug}/screenshots`, {}, DETAIL_CACHE_TTL);

export const fetchMovies = (slug) =>
  getCached(`/games/${slug}/movies`, {}, DETAIL_CACHE_TTL);

export const fetchRelated = (slug) =>
  getCached(`/games/${slug}/game-series`, {}, DETAIL_CACHE_TTL);

export const fetchStores = (slug) =>
  getCached(`/games/${slug}/stores`, {}, DETAIL_CACHE_TTL);

export const fetchGenres = () => getCached("/genres", {}, REFERENCE_CACHE_TTL);
export const fetchPlatforms = () => getCached("/platforms", {}, REFERENCE_CACHE_TTL);

export { default as MOCK } from "./mockData";
