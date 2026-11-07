const igdb = require("./igdb");
const rawg = require("./rawg");
const { normalizeGame, dedupeGames } = require("./normalizeGame");

const isEmptyList = (data) => !((data?.results || data || []).length);

const runWithFallback = async (operation, params, emptyCheck = isEmptyList) => {
  let igdbData;
  let igdbError;
  try {
    igdbData = await igdb[operation](params);
    if (!emptyCheck(igdbData)) return { data: igdbData, provider: "igdb" };
  } catch (error) {
    if (error.code === "INVALID_INPUT") throw error;
    igdbError = error;
  }

  try {
    const rawgData = await rawg[operation](params);
    if (!emptyCheck(rawgData)) return { data: rawgData, provider: "rawg" };
    if (igdbData !== undefined) return { data: igdbData, provider: "igdb" };
    return { data: rawgData, provider: "rawg" };
  } catch (rawgError) {
    if (igdbData !== undefined) return { data: igdbData, provider: "igdb" };
    const error = new Error("IGDB and RAWG are both unavailable.");
    error.status = 502;
    error.providers = {
      ...(igdbError ? { igdb: igdbError } : {}),
      rawg: rawgError,
    };
    throw error;
  }
};

const normalizeList = (data, provider, params = {}) => {
  const results = dedupeGames(
    (data?.results || data || []).map((game) => normalizeGame(game, provider))
  );
  const pageSize = Number(params.page_size) || 20;
  const page = Number(params.page) || 1;
  const count = Number.isFinite(data?.count) ? data.count : results.length;
  return {
    count,
    next: data?.next || (results.length === pageSize ? `?page=${page + 1}` : null),
    previous: data?.previous || (page > 1 ? `?page=${page - 1}` : null),
    results,
  };
};

const isHorrorGame = (game) =>
  [...(game.genres || []), ...(game.tags || [])].some((category) =>
    String(category.slug || category.name || "").toLowerCase().includes("horror")
  );

const normalizeTitle = (value) => String(value || "")
  .toLowerCase()
  .replace(/\bii\b/g, "2")
  .replace(/['’]/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const releaseYear = (game) => {
  if (game.released) return String(game.released).slice(0, 4);
  if (Number.isFinite(game.first_release_date)) {
    return String(new Date(game.first_release_date * 1000).getUTCFullYear());
  }
  return "";
};

const featuredOrder = [
  { title: "outlast 2" },
  { title: "dead by daylight", year: "2016" },
  { title: "the dark pictures anthology man of medan", year: "2019" },
  { title: "silent hill 2", year: "2024" },
  { title: "resident evil 4", year: "2023" },
  { title: "the evil within", year: "2014" },
  { title: "resident evil 7" },
];

const topNightmareOrder = [
  { title: "alien isolation", query: "Alien: Isolation" },
  { title: "fatal frame 2 crimson butterfly", query: "Fatal Frame II: Crimson Butterfly", year: "2003" },
  { title: "amnesia the dark descent", query: "Amnesia: The Dark Descent" },
  { title: "silent hill 2", query: "Silent Hill 2", year: "2024" },
  { title: "outlast", query: "Outlast" },
  { title: "resident evil 7 biohazard", query: "Resident Evil 7: Biohazard" },
  { title: "dead space", query: "Dead Space", year: "2023" },
  { title: "soma", query: "SOMA" },
  { title: "visage", query: "Visage" },
  { title: "left 4 dead", query: "Left 4 Dead" },
];

const trendingHorrorOrder = [
  { title: "phasmophobia", query: "Phasmophobia" },
  { title: "the outlast trials", query: "The Outlast Trials" },
  { title: "dead by daylight", query: "Dead by Daylight", year: "2016" },
  { title: "lethal company", query: "Lethal Company" },
  { title: "little nightmares iii", query: "Little Nightmares III", year: "2025" },
  { title: "silent hill f", query: "Silent Hill f", year: "2025" },
  { title: "resident evil village", query: "Resident Evil Village", year: "2021" },
  { title: "five nights at freddys into the pit", query: "Five Nights at Freddy's: Into the Pit", year: "2024" },
  { title: "mouthwashing", query: "Mouthwashing", year: "2024" },
  { title: "dying light the beast", query: "Dying Light: The Beast", year: "2025" },
  { title: "resident evil requiem", query: "Resident Evil Requiem", year: "2026" },
  { title: "alan wake 2", query: "Alan Wake 2", year: "2023" },
];

const isFeaturedGame = (game) => featuredOrder.some(({ title, year }) => {
  const gameTitle = normalizeTitle(game.name);
  return (gameTitle === title || gameTitle.startsWith(`${title} `)) &&
    (!year || String(game.released || "").startsWith(year));
});

const list = async (operation, params) => {
  const { data, provider } = await runWithFallback(operation, params);
  return normalizeList(data, provider, params);
};

const getFeaturedGames = async () => {
  const { data, provider } = await runWithFallback(
    "fetchFeaturedGames",
    {},
    (games) => !(games || []).length
  );
  const results = dedupeGames(
    (data || []).map((game) => normalizeGame(game, provider))
  );
  results.sort((a, b) => {
    const indexOf = (game) => {
      const index = featuredOrder.findIndex(({ title, year }) => {
        const gameTitle = normalizeTitle(game.name);
        return (gameTitle === title || gameTitle.startsWith(`${title} `)) &&
          (!year || String(game.released || "").startsWith(year));
      });
      return index < 0 ? featuredOrder.length : index;
    };
    return indexOf(a) - indexOf(b);
  });
  return { count: results.length, results };
};

const getCuratedGames = async (order) => {
  const results = await Promise.all(order.map(async ({ title, query, year }) => {
    const { data, provider } = await runWithFallback(
      "fetchSearch",
      { query, page: 1, page_size: 20 }
    );
    const match = (data?.results || data || []).find((game) =>
      normalizeTitle(game.name) === title &&
      (!year || releaseYear(game) === year)
    );
    return match ? normalizeGame(match, provider) : null;
  }));
  const games = dedupeGames(results.filter(Boolean));
  return { count: games.length, results: games };
};

const getTopNightmares = () => getCuratedGames(topNightmareOrder);
const getTrendingHorror = () => getCuratedGames(trendingHorrorOrder);

const getSearch = async (params) => {
  const { data, provider } = await runWithFallback("fetchSearch", params);
  return normalizeList(data, provider, params);
};

const getDetails = async (slug) => {
  const { data, provider } = await runWithFallback(
    "fetchGameDetails",
    slug,
    (game) => !game
  );
  if (!data) return null;
  const game = normalizeGame(data, provider);
  return provider === "rawg" && !isHorrorGame(game) && !isFeaturedGame(game) ? null : game;
};

const getMedia = async (operation, slug, mediaField) => {
  const { data, provider } = await runWithFallback(
    operation,
    slug,
    isEmptyList
  );
  const items = data?.results || data || [];
  let results;
  if (mediaField === "related") {
    results = dedupeGames(items.map((game) => normalizeGame(game, provider)));
  } else if (provider === "rawg") {
    results = items;
  } else if (mediaField === "screenshots") {
    results = items.map((item, index) => {
      const url = item.url?.startsWith("//") ? `https:${item.url}` : item.url;
      const image = url?.replace(/\/t_[^/]+\//, "/t_1080p/");
      return image ? { id: `${slug}-screenshot-${index}`, image } : null;
    }).filter(Boolean);
  } else {
    results = items.map((item) => ({
      id: item.id,
      name: item.name || "Game trailer",
      data: item.video_id
        ? { max: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(item.video_id)}` }
        : {},
    }));
  }
  return { count: results.length, results };
};

const getGenres = async () => {
  const { data, provider } = await runWithFallback(
    "fetchGenres",
    {},
    isEmptyList
  );
  const results = provider === "igdb"
    ? data.map((genre) => ({
      id: `${genre.category || "genre"}-${genre.id}`,
      slug: genre.slug,
      name: genre.name,
    }))
    : data.results || [];
  return { count: results.length, results };
};

const getPlatforms = async () => {
  const { data, provider } = await runWithFallback(
    "fetchPlatforms",
    {},
    (platforms) => !(platforms?.results || platforms || []).length
  );
  const results = provider === "igdb"
    ? data.map((platform) => ({
      id: platform.slug,
      slug: platform.slug,
      name: platform.name,
    }))
    : data.results || [];
  return { count: results.length, results };
};

module.exports = {
  getFeaturedGames,
  getTopNightmares,
  getTrendingHorror,
  getTrending: (params) => list("fetchTrending", params),
  getTopRated: (params) => list("fetchTopRated", params),
  getRecent: (params) => list("fetchRecent", params),
  getUpcoming: (params) => list("fetchUpcoming", params),
  getBrowse: (params) => list("fetchBrowse", params),
  getSearch,
  getDetails,
  getScreenshots: (slug) => getMedia("fetchScreenshots", slug, "screenshots"),
  getTrailers: (slug) => getMedia("fetchTrailers", slug, "trailers"),
  getRelated: (slug) => getMedia("fetchRelated", slug, "related"),
  getSeries: (slug) => getMedia("fetchGameSeries", slug, "related"),
  getGenres,
  getPlatforms,
};
