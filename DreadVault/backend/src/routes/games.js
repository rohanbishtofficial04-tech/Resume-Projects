const express = require("express");
const gameService = require("../services/gameService");

const router = express.Router();

const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

const getListParams = (query) => {
  const params = {
    page: query.page || 1,
    page_size: query.page_size || 20,
    ordering: query.ordering,
  };
  for (const key of ["genre", "platform", "year", "rating", "search"]) {
    if (query[key] !== undefined) params[key] = query[key];
  }
  if (query.genres !== undefined) params.genre = query.genres;
  if (query.platforms !== undefined) params.platform = query.platforms;
  return params;
};

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    providers: {
      igdb: require("../services/igdb").getHealth().configured,
      rawgFallback: Boolean(require("../config/env").rawgApiKey),
    },
  });
});

router.get("/games/trending", asyncRoute(async (req, res) => {
  res.json(await gameService.getTrending(getListParams(req.query)));
}));
router.get("/games/trending-horror", asyncRoute(async (_req, res) => {
  res.json(await gameService.getTrendingHorror());
}));
router.get("/games/top-rated", asyncRoute(async (req, res) => {
  res.json(await gameService.getTopRated(getListParams(req.query)));
}));
router.get("/games/top-nightmares", asyncRoute(async (_req, res) => {
  res.json(await gameService.getTopNightmares());
}));
router.get("/games/recent", asyncRoute(async (req, res) => {
  res.json(await gameService.getRecent(getListParams(req.query)));
}));
router.get("/games/upcoming", asyncRoute(async (req, res) => {
  res.json(await gameService.getUpcoming(getListParams(req.query)));
}));
router.get("/games/featured", asyncRoute(async (_req, res) => {
  res.json(await gameService.getFeaturedGames());
}));
router.get("/games/search", asyncRoute(async (req, res) => {
  res.json(await gameService.getSearch({
    ...getListParams(req.query),
    query: req.query.query || req.query.search,
  }));
}));
router.get("/games/browse", asyncRoute(async (req, res) => {
  res.json(await gameService.getBrowse(getListParams(req.query)));
}));
router.get("/genres", asyncRoute(async (_req, res) => {
  res.json(await gameService.getGenres());
}));
router.get("/platforms", asyncRoute(async (_req, res) => {
  res.json(await gameService.getPlatforms());
}));
router.get("/games/:slug/screenshots", asyncRoute(async (req, res) => {
  res.json(await gameService.getScreenshots(req.params.slug));
}));
router.get("/games/:slug/movies", asyncRoute(async (req, res) => {
  res.json(await gameService.getTrailers(req.params.slug));
}));
router.get("/games/:slug/related", asyncRoute(async (req, res) => {
  res.json(await gameService.getRelated(req.params.slug));
}));
router.get("/games/:slug/series", asyncRoute(async (req, res) => {
  res.json(await gameService.getSeries(req.params.slug));
}));
router.get("/games/:slug", asyncRoute(async (req, res) => {
  const game = await gameService.getDetails(req.params.slug);
  if (!game) return res.status(404).json({ error: "Game not found." });
  return res.json(game);
}));

module.exports = router;
