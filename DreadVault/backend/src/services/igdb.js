const axios = require("axios");
const config = require("../config/env");

const IGDB_BASE_URL = "https://api.igdb.com/v4";
const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const TIMEOUT_MS = 12000;
const CATALOG_TTL_MS = 12 * 60 * 60 * 1000;
const tokenState = { value: null, expiresAt: 0, pending: null };
const catalogCache = new Map();
const requestCache = new Map();
const pendingRequests = new Map();
const MAX_CACHE_SIZE = 100;
const FEATURED_GAME_SLUGS = [
  "outlast-ii",
  "dead-by-daylight",
  "the-dark-pictures-anthology-man-of-medan",
  "silent-hill-2--1",
  "resident-evil-4--1",
  "the-evil-within",
  "resident-evil-7-biohazard",
];

const GAME_FIELDS = [
  "id", "name", "slug", "summary", "storyline", "first_release_date",
  "cover.url", "artworks.url", "screenshots.url",
  "genres.id", "genres.name", "genres.slug",
  "themes.id", "themes.name", "themes.slug",
  "platforms.id", "platforms.name", "platforms.slug",
  "rating", "rating_count", "total_rating_count",
  "aggregated_rating", "aggregated_rating_count",
  "involved_companies.company.id", "involved_companies.company.name",
  "involved_companies.developer", "involved_companies.publisher",
  "game_modes.id", "game_modes.name",
  "player_perspectives.id", "player_perspectives.name",
  "age_ratings.category", "age_ratings.rating",
  "videos.id", "videos.video_id", "videos.name",
  "similar_games.id", "similar_games.name", "similar_games.slug",
  "similar_games.cover.url", "similar_games.artworks.url",
  "similar_games.first_release_date", "similar_games.rating",
  "similar_games.rating_count", "similar_games.platforms.id",
  "similar_games.aggregated_rating", "similar_games.aggregated_rating_count",
  "similar_games.platforms.name", "similar_games.platforms.slug",
  "similar_games.genres.id", "similar_games.genres.name", "similar_games.genres.slug",
  "similar_games.themes.id", "similar_games.themes.name", "similar_games.themes.slug",
].join(",");

const DETAIL_FIELDS = [
  "keywords.id", "keywords.name",
  "age_ratings.organization.name", "age_ratings.rating_category.rating",
  "age_ratings.rating_content_descriptions.description", "age_ratings.synopsis",
  "multiplayer_modes.campaigncoop", "multiplayer_modes.dropin",
  "multiplayer_modes.lancoop", "multiplayer_modes.offlinecoop",
  "multiplayer_modes.offlinecoopmax", "multiplayer_modes.offlinemax",
  "multiplayer_modes.onlinecoop", "multiplayer_modes.onlinecoopmax",
  "multiplayer_modes.onlinemax", "multiplayer_modes.splitscreen",
  "multiplayer_modes.splitscreenonline", "multiplayer_modes.platform.name",
  "game_engines.id", "game_engines.name", "game_engines.description", "game_engines.url",
  "websites.url", "websites.type.type", "websites.trusted",
  "franchises.id", "franchises.name",
  "collections.id", "collections.name",
  "expansions.id", "expansions.name", "expansions.slug",
  "expansions.first_release_date", "expansions.cover.url",
  "dlcs.id", "dlcs.name", "dlcs.slug", "dlcs.first_release_date", "dlcs.cover.url",
  "expanded_games.id", "expanded_games.name", "expanded_games.slug",
  "expanded_games.first_release_date", "expanded_games.cover.url",
  "standalone_expansions.id", "standalone_expansions.name", "standalone_expansions.slug",
  "standalone_expansions.first_release_date", "standalone_expansions.cover.url",
  "ports.id", "ports.name", "ports.slug", "ports.first_release_date", "ports.cover.url",
  "remakes.id", "remakes.name", "remakes.slug", "remakes.first_release_date", "remakes.cover.url",
  "remasters.id", "remasters.name", "remasters.slug", "remasters.first_release_date", "remasters.cover.url",
  "parent_game.id", "parent_game.name", "parent_game.slug",
  "parent_game.first_release_date", "parent_game.cover.url",
  "category", "game_type", "status",
  "release_dates.date", "release_dates.human", "release_dates.platform.name",
  "release_dates.status.name", "release_dates.category",
  "language_supports.language.name", "language_supports.language_support_type.name",
].join(",");

const cleanSearch = (value) =>
  String(value || "")
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s&'.:-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);

const inputError = (message) => {
  const error = new Error(message);
  error.status = 400;
  error.code = "INVALID_INPUT";
  return error;
};

const slugify = (value) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const getAccessToken = async (forceRefresh = false) => {
  if (!config.twitchClientId || !config.twitchClientSecret) {
    const error = new Error("IGDB is not configured on the backend.");
    error.status = 503;
    throw error;
  }
  if (!forceRefresh && tokenState.value && tokenState.expiresAt > Date.now() + 60000) {
    return tokenState.value;
  }
  if (tokenState.pending) return tokenState.pending;

  tokenState.pending = axios
    .post(
      TWITCH_TOKEN_URL,
      new URLSearchParams({
        client_id: config.twitchClientId,
        client_secret: config.twitchClientSecret,
        grant_type: "client_credentials",
      }),
      { timeout: TIMEOUT_MS, headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    )
    .then(({ data }) => {
      if (!data?.access_token || !Number.isFinite(Number(data.expires_in))) {
        const error = new Error("Twitch returned an invalid token response.");
        error.status = 502;
        throw error;
      }
      tokenState.value = data.access_token;
      tokenState.expiresAt = Date.now() + Number(data.expires_in) * 1000;
      return tokenState.value;
    })
    .finally(() => {
      tokenState.pending = null;
    });

  return tokenState.pending;
};

const requestIgdb = async (endpoint, query, retryAuth = true) => {
  const token = await getAccessToken();
  try {
    const response = await axios.post(`${IGDB_BASE_URL}/${endpoint}`, query, {
      timeout: TIMEOUT_MS,
      headers: {
        "Client-ID": config.twitchClientId,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401 && retryAuth) {
      tokenState.value = null;
      tokenState.expiresAt = 0;
      await getAccessToken(true);
      return requestIgdb(endpoint, query, false);
    }
    throw error;
  }
};

const cachedRequest = (key, action, ttl = 5 * 60 * 1000) => {
  const cached = requestCache.get(key);
  if (cached?.expiresAt > Date.now()) return Promise.resolve(cached.data);
  if (pendingRequests.has(key)) return pendingRequests.get(key);

  const pending = action()
    .then((data) => {
      requestCache.set(key, { data, expiresAt: Date.now() + ttl });
      while (requestCache.size > MAX_CACHE_SIZE) {
        requestCache.delete(requestCache.keys().next().value);
      }
      return data;
    })
    .finally(() => pendingRequests.delete(key));
  pendingRequests.set(key, pending);
  return pending;
};

const fetchCatalog = async (kind) => {
  const cached = catalogCache.get(kind);
  if (cached?.expiresAt > Date.now()) return cached.data;
  const data = await cachedRequest(
    `catalog:${kind}`,
    () => requestIgdb(kind, "fields id,name,slug; limit 500;"),
    CATALOG_TTL_MS
  );
  catalogCache.set(kind, { data, expiresAt: Date.now() + CATALOG_TTL_MS });
  return data;
};

const fetchGenres = async () => {
  const [genres, themes] = await Promise.all([fetchCatalog("genres"), fetchCatalog("themes")]);
  return [
    ...genres.map((item) => ({ ...item, category: "genre" })),
    ...themes.map((item) => ({ ...item, category: "theme" })),
  ];
};

const horrorTheme = async () =>
  (await fetchCatalog("themes")).find((item) =>
    slugify(item.slug || item.name) === "horror"
  );

const findGenre = async (slug) => {
  const normalized = slugify(slug);
  const genres = await fetchGenres();
  return genres.find((item) => slugify(item.slug || item.name) === normalized);
};

const findPlatform = async (slug) => {
  const normalized = slugify(slug);
  const platforms = await fetchCatalog("platforms");
  return platforms.find((item) => slugify(item.slug || item.name) === normalized);
};

const boundedInteger = (value, fallback, max) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
};

const buildWhere = async (params = {}) => {
  const conditions = ["version_parent = null"];
  const horror = await horrorTheme();
  if (horror) conditions.push(`themes = (${horror.id})`);
  else conditions.push("id = 0");

  if (params.genre && params.genre !== "horror") {
    if (!/^[a-z0-9-]{1,80}$/i.test(params.genre)) {
      throw inputError("Invalid genre filter.");
    }
    const genre = await findGenre(params.genre);
    if (!genre) conditions.push("id = 0");
    else conditions.push(`${genre.category === "theme" ? "themes" : "genres"} = (${genre.id})`);
  }
  if (params.platform) {
    if (!/^[a-z0-9-]{1,80}$/i.test(params.platform)) {
      throw inputError("Invalid platform filter.");
    }
    const platform = await findPlatform(params.platform);
    if (!platform) conditions.push("id = 0");
    else conditions.push(`platforms = (${platform.id})`);
  }
  if (params.year) {
    if (!/^\d{4}$/.test(String(params.year))) {
      throw inputError("Year must be a four-digit year.");
    }
    const start = Date.UTC(Number(params.year), 0, 1) / 1000;
    const end = Date.UTC(Number(params.year) + 1, 0, 1) / 1000;
    conditions.push(`first_release_date >= ${start}`, `first_release_date < ${end}`);
  }
  if (params.rating !== undefined && params.rating !== "") {
    const rating = Number(params.rating);
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      throw inputError("Rating filter must be between 0 and 5.");
    }
    conditions.push(`rating >= ${Math.round(rating * 20)}`);
  }
  return conditions;
};

const sortClause = (ordering) => ({
  "-added": "total_rating_count desc",
  "-rating": "rating desc",
  "-released": "first_release_date desc",
  released: "first_release_date asc",
  name: "name asc",
  "-name": "name desc",
}[ordering] || "total_rating_count desc");

const fetchGames = async (action, params = {}) => {
  const page = boundedInteger(params.page, 1, 251);
  const pageSize = boundedInteger(params.page_size, 20, 40);
  const offset = (page - 1) * pageSize;
  const where = await buildWhere(params);
  let sort = sortClause(params.ordering);

  if (action === "recent") {
    const now = Math.floor(Date.now() / 1000);
    where.push(`first_release_date >= ${now - 365 * 24 * 60 * 60}`, `first_release_date <= ${now}`);
    sort = "first_release_date desc";
  } else if (action === "upcoming") {
    const now = Math.floor(Date.now() / 1000);
    const future = now + 3 * 365 * 24 * 60 * 60;
    where.push(`first_release_date > ${now}`, `first_release_date <= ${future}`);
    sort = "first_release_date asc";
  } else if (params.ordering && !["-added", "-rating", "-released", "released", "name", "-name"].includes(params.ordering)) {
    throw inputError("Unsupported ordering.");
  }

  const search = cleanSearch(params.search || "");
  const searchClause = search ? `search "${search}"; ` : "";
  const sortQuery = search ? "" : `sort ${sort}; `;
  const query = `${searchClause}fields ${GAME_FIELDS}; where ${where.join(" & ")}; ${sortQuery}limit ${pageSize}; offset ${offset};`;
  return cachedRequest(`games:${action}:${JSON.stringify(params)}`, () => requestIgdb("games", query));
};

const fetchGameDetails = async (slug) => {
  if (!/^[a-z0-9-]{1,120}$/i.test(String(slug || ""))) {
    throw inputError("Invalid game slug.");
  }
  const isFeatured = FEATURED_GAME_SLUGS.includes(slug);
  const horror = isFeatured ? null : await horrorTheme();
  if (!isFeatured && !horror) return null;
  const conditions = [`slug = "${slug}"`, "version_parent = null"];
  if (horror) conditions.push(`themes = (${horror.id})`);
  const query = `fields ${GAME_FIELDS},${DETAIL_FIELDS}; where ${conditions.join(" & ")}; limit 1;`;
  const data = await cachedRequest(`details:${slug}`, () => requestIgdb("games", query), 30 * 60 * 1000);
  const game = data[0];
  if (!game) return null;

  const resolveReference = async (id, endpoint, field) => {
    if (id == null) return null;
    try {
      const entries = await cachedRequest(
        `catalog:${endpoint}`,
        () => requestIgdb(endpoint, `fields id,${field}; limit 100;`),
        CATALOG_TTL_MS
      );
      return entries.find((entry) => entry.id === id)?.[field] || null;
    } catch (error) {
      console.warn(`[igdb] Unable to resolve ${endpoint} label: ${error.message}`);
      return null;
    }
  };
  const [gameType, status] = await Promise.all([
    resolveReference(game.game_type, "game_types", "type"),
    resolveReference(game.status, "game_statuses", "status"),
  ]);
  game.game_type = gameType ? { id: game.game_type, name: gameType } : null;
  game.status = status ? { id: game.status, name: status } : null;
  return game;
};

const fetchGameSeries = async (slug) => {
  const game = await fetchGameDetails(slug);
  const franchiseIds = (game?.franchises || []).map(({ id }) => id).filter(Number.isInteger);
  const collectionIds = (game?.collections || []).map(({ id }) => id).filter(Number.isInteger);
  const relation = franchiseIds.length
    ? `franchises = (${franchiseIds.join(",")})`
    : collectionIds.length
      ? `collections = (${collectionIds.join(",")})`
      : null;
  if (!relation) return [];

  const query = `fields ${GAME_FIELDS}; where ${relation} & version_parent = null; sort first_release_date asc; limit 50;`;
  return cachedRequest(`series:${relation}`, () => requestIgdb("games", query));
};

const fetchFeaturedGames = () => {
  const query = `fields ${GAME_FIELDS}; where slug = (${FEATURED_GAME_SLUGS.map((slug) => `"${slug}"`).join(",")}) & version_parent = null; limit ${FEATURED_GAME_SLUGS.length};`;
  return cachedRequest("games:featured", () => requestIgdb("games", query), 30 * 60 * 1000);
};

const fetchSearch = (params = {}) => {
  const search = cleanSearch(params.query);
  if (!search) {
    throw inputError("Search query is required.");
  }
  return fetchGames("search", { ...params, search });
};

const fetchRelated = async (slug) => {
  const game = await fetchGameDetails(slug);
  const horror = await horrorTheme();
  return (game?.similar_games || []).filter((similar) =>
    (similar.themes || []).some((theme) =>
      theme.id === horror?.id || slugify(theme.slug || theme.name) === "horror"
    )
  );
};

const getHealth = () => ({
  provider: "igdb",
  configured: Boolean(config.twitchClientId && config.twitchClientSecret),
});

module.exports = {
  fetchTrending: (params) => fetchGames("trending", params),
  fetchTopRated: (params) => fetchGames("top", params),
  fetchRecent: (params) => fetchGames("recent", params),
  fetchUpcoming: (params) => fetchGames("upcoming", params),
  fetchFeaturedGames,
  fetchBrowse: (params) => fetchGames("browse", params),
  fetchSearch,
  fetchGameDetails,
  fetchGameSeries,
  fetchScreenshots: async (slug) => (await fetchGameDetails(slug))?.screenshots || [],
  fetchTrailers: async (slug) => (await fetchGameDetails(slug))?.videos || [],
  fetchRelated,
  fetchGenres,
  fetchPlatforms: () => fetchCatalog("platforms"),
  getHealth,
};
