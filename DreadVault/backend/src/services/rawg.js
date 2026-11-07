const axios = require("axios");
const config = require("../config/env");

const client = axios.create({
  baseURL: "https://api.rawg.io/api",
  timeout: 12000,
});

const responseCache = new Map();
const pendingRequests = new Map();
const MAX_CACHE_SIZE = 100;

const withHorror = (params = {}) => ({ tags: "horror", ...params });

const request = (path, params = {}, ttl = 5 * 60 * 1000) => {
  if (!config.rawgApiKey) {
    const error = new Error("RAWG fallback is not configured on the backend.");
    error.status = 503;
    throw error;
  }
  const requestParams = { ...params, key: config.rawgApiKey };
  const cacheKey = `${path}:${JSON.stringify(
    Object.entries(requestParams).sort(([a], [b]) => a.localeCompare(b))
  )}`;
  const cached = responseCache.get(cacheKey);
  if (cached?.expiresAt > Date.now()) return Promise.resolve(cached.data);
  if (pendingRequests.has(cacheKey)) return pendingRequests.get(cacheKey);

  const pending = client
    .get(path, { params: requestParams })
    .then(({ data }) => data)
    .then((data) => {
      responseCache.set(cacheKey, { data, expiresAt: Date.now() + ttl });
      while (responseCache.size > MAX_CACHE_SIZE) {
        responseCache.delete(responseCache.keys().next().value);
      }
      return data;
    })
    .finally(() => pendingRequests.delete(cacheKey));
  pendingRequests.set(cacheKey, pending);
  return pending;
};

const dateRange = (from, to) => `${from.toISOString().slice(0, 10)},${to.toISOString().slice(0, 10)}`;
const featuredGameQueries = [
  { query: "Outlast 2", title: "outlast 2" },
  { query: "Dead by Daylight", title: "dead by daylight", year: "2016" },
  { query: "The Dark Pictures Anthology Man of Medan", title: "the dark pictures anthology man of medan", year: "2019" },
  { query: "Silent Hill 2", title: "silent hill 2", year: "2024" },
  { query: "Resident Evil 4", title: "resident evil 4", year: "2023" },
  { query: "The Evil Within", title: "the evil within", year: "2014" },
  { query: "Resident Evil 7", title: "resident evil 7" },
];

const normalizeTitle = (value) => String(value || "")
  .toLowerCase()
  .replace(/\bii\b/g, "2")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const fetchFeaturedGames = async () => {
  const games = await Promise.all(featuredGameQueries.map(async ({ query, title, year }) => {
    const data = await request("/games", {
      search: query,
      page: 1,
      page_size: 20,
    }, 30 * 60 * 1000);
    return (data.results || []).find((game) =>
      normalizeTitle(game.name) === title &&
      (!year || String(game.released || "").startsWith(year))
    );
  }));
  return games.filter(Boolean);
};

const normalizePlatform = async (value) => {
  if (!value) return undefined;
  if (/^\d+$/.test(String(value))) return value;
  const knownAliases = {
    ps5: "playstation-5",
    ps4: "playstation-4",
    ps3: "playstation-3",
    xboxseriesx: "xbox-series-x",
    xboxseries: "xbox-series-x",
    xboxone: "xbox-one",
  };
  const wanted = knownAliases[String(value).toLowerCase()] || String(value).toLowerCase();
  const catalog = await request("/platforms", { page_size: 100 }, 24 * 60 * 60 * 1000);
  const slugify = (text) => String(text || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const platform = (catalog.results || []).find((item) =>
    slugify(item.slug) === slugify(wanted) ||
    slugify(item.name) === slugify(wanted)
  );
  return platform ? String(platform.id) : "-1";
};

const fetchRecent = (params = {}) => {
  const to = new Date();
  const from = new Date();
  from.setFullYear(from.getFullYear() - 1);
  return request("/games", withHorror({
    ordering: "-released",
    dates: dateRange(from, to),
    page: params.page || 1,
    page_size: params.page_size || 20,
  }));
};

const fetchUpcoming = (params = {}) => {
  const from = new Date();
  const to = new Date();
  to.setFullYear(to.getFullYear() + 3);
  return request("/games", withHorror({
    ordering: "released",
    dates: dateRange(from, to),
    page: params.page || 1,
    page_size: params.page_size || 20,
  }));
};

module.exports = {
  fetchFeaturedGames,
  fetchTrending: (params = {}) => request("/games", withHorror({
    ordering: "-added",
    page: params.page || 1,
    page_size: params.page_size || 20,
  })),
  fetchTopRated: (params = {}) => request("/games", withHorror({
    ordering: "-rating",
    metacritic: "70,100",
    page: params.page || 1,
    page_size: params.page_size || 20,
  })),
  fetchRecent,
  fetchUpcoming,
  fetchBrowse: async (params = {}) => {
    const query = withHorror({
      page: params.page || 1,
      page_size: params.page_size || 20,
      ordering: params.ordering || "-added",
    });
    if (params.search) query.search = params.search;
    const genre = params.genre || params.genres;
    if (genre && genre !== "horror") query.genres = genre;
    if (params.platform || params.platforms) {
      query.platforms = await normalizePlatform(params.platform || params.platforms);
    }
    if (params.year) query.dates = `${params.year}-01-01,${params.year}-12-31`;
    return request("/games", query);
  },
  fetchSearch: ({ query, page = 1, page_size = 20 } = {}) =>
    request("/games", withHorror({ search: query, page, page_size }), 2 * 60 * 1000),
  fetchGameDetails: async (slug) => {
    try {
      return await request(`/games/${encodeURIComponent(slug)}`, {}, 30 * 60 * 1000);
    } catch (error) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },
  fetchGameSeries: async (slug) => {
    const game = await module.exports.fetchGameDetails(slug);
    if (!game?.id) return [];
    const data = await request(
      `/games/${encodeURIComponent(game.id)}/game-series`,
      { page_size: 50, ordering: "released" },
      30 * 60 * 1000
    );
    return data.results || [];
  },
  fetchScreenshots: async (slug) => {
    try {
      return await request(`/games/${encodeURIComponent(slug)}/screenshots`, {}, 30 * 60 * 1000);
    } catch (error) {
      if (error.response?.status === 404) return { results: [] };
      throw error;
    }
  },
  fetchTrailers: async (slug) => {
    try {
      return await request(`/games/${encodeURIComponent(slug)}/movies`, {}, 30 * 60 * 1000);
    } catch (error) {
      if (error.response?.status === 404) return { results: [] };
      throw error;
    }
  },
  fetchRelated: async (slug) => {
    try {
      const data = await request(
        `/games/${encodeURIComponent(slug)}/game-series`,
        {},
        30 * 60 * 1000
      );
      return {
        ...data,
        results: (data.results || []).filter((game) =>
          [...(game.genres || []), ...(game.tags || [])].some((genre) =>
            String(genre.slug || genre.name || "").toLowerCase().includes("horror")
          )
        ),
      };
    } catch (error) {
      if (error.response?.status === 404) return { results: [] };
      throw error;
    }
  },
  fetchGenres: () => request("/genres", {}, 24 * 60 * 60 * 1000),
  fetchPlatforms: () => request("/platforms", {}, 24 * 60 * 60 * 1000),
};
