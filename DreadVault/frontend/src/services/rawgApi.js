import axios from "axios";

const KEY = process.env.REACT_APP_RAWG_API_KEY || "";
const BASE = "https://api.rawg.io/api";

export const RAWG_KEY_PRESENT = Boolean(KEY);

const client = axios.create({
  baseURL: BASE,
  timeout: 15000,
});

// Attach key to every request
client.interceptors.request.use((config) => {
  config.params = { ...(config.params || {}), key: KEY };
  return config;
});

// RAWG exposes horror as a tag, not as a genre.
const HORROR_TAG = "horror";

const withHorror = (params = {}) => ({
  tags: HORROR_TAG,
  ...params,
});

// ------------------------------------------------------------------
// Games
// ------------------------------------------------------------------
export const fetchTrending = ({ page = 1, page_size = 12 } = {}) =>
  client
    .get("/games", { params: withHorror({ ordering: "-added", page, page_size }) })
    .then((r) => r.data);

export const fetchTopRated = ({ page = 1, page_size = 12 } = {}) =>
  client
    .get("/games", {
      params: withHorror({ ordering: "-rating", page, page_size, metacritic: "70,100" }),
    })
    .then((r) => r.data);

export const fetchRecent = ({ page = 1, page_size = 12 } = {}) => {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 12);
  const iso = (d) => d.toISOString().split("T")[0];
  return client
    .get("/games", {
      params: withHorror({
        ordering: "-released",
        dates: `${iso(from)},${iso(to)}`,
        page,
        page_size,
      }),
    })
    .then((r) => r.data);
};

export const fetchUpcoming = ({ page = 1, page_size = 12 } = {}) => {
  const from = new Date();
  const to = new Date();
  to.setFullYear(to.getFullYear() + 3);
  const iso = (d) => d.toISOString().split("T")[0];
  return client
    .get("/games", {
      params: withHorror({
        ordering: "released",
        dates: `${iso(from)},${iso(to)}`,
        page,
        page_size,
      }),
    })
    .then((r) => r.data);
};

export const searchGames = ({ query, page = 1, page_size = 20 }) =>
  client
    .get("/games", {
      params: { search: query, search_precise: true, tags: HORROR_TAG, page, page_size },
    })
    .then((r) => r.data);

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
  return client.get("/games", { params }).then((r) => r.data);
};

export const fetchGameDetails = (slug) =>
  client.get(`/games/${slug}`).then((r) => r.data);

export const fetchScreenshots = (slug) =>
  client.get(`/games/${slug}/screenshots`).then((r) => r.data);

export const fetchMovies = (slug) =>
  client.get(`/games/${slug}/movies`).then((r) => r.data);

export const fetchRelated = (slug) =>
  client.get(`/games/${slug}/game-series`).then((r) => r.data);

export const fetchStores = (slug) =>
  client.get(`/games/${slug}/stores`).then((r) => r.data);

// ------------------------------------------------------------------
// Meta
// ------------------------------------------------------------------
export const fetchGenres = () => client.get("/genres").then((r) => r.data);
export const fetchPlatforms = () =>
  client.get("/platforms").then((r) => r.data);

// ------------------------------------------------------------------
// Mock fallback (used when no API key present)
// ------------------------------------------------------------------
export { default as MOCK } from "./mockData";
