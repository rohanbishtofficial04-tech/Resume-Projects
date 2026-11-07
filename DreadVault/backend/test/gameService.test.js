const test = require("node:test");
const assert = require("node:assert/strict");
const igdb = require("../src/services/igdb");
const rawg = require("../src/services/rawg");
const gameService = require("../src/services/gameService");

const original = {
  igdbTrending: igdb.fetchTrending,
  rawgTrending: rawg.fetchTrending,
  igdbSearch: igdb.fetchSearch,
  rawgSearch: rawg.fetchSearch,
  igdbDetails: igdb.fetchGameDetails,
  rawgDetails: rawg.fetchGameDetails,
  igdbFeatured: igdb.fetchFeaturedGames,
  rawgFeatured: rawg.fetchFeaturedGames,
  igdbSeries: igdb.fetchGameSeries,
  rawgSeries: rawg.fetchGameSeries,
};

test.afterEach(() => {
  igdb.fetchTrending = original.igdbTrending;
  rawg.fetchTrending = original.rawgTrending;
  igdb.fetchSearch = original.igdbSearch;
  rawg.fetchSearch = original.rawgSearch;
  igdb.fetchGameDetails = original.igdbDetails;
  rawg.fetchGameDetails = original.rawgDetails;
  igdb.fetchFeaturedGames = original.igdbFeatured;
  rawg.fetchFeaturedGames = original.rawgFeatured;
  igdb.fetchGameSeries = original.igdbSeries;
  rawg.fetchGameSeries = original.rawgSeries;
});

test("uses IGDB as the primary provider and returns normalized list results", async () => {
  let rawgCalled = false;
  igdb.fetchTrending = async () => ({
    count: 1,
    results: [{ id: 1, slug: "night-game", name: "Night Game", rating: 80 }],
  });
  rawg.fetchTrending = async () => {
    rawgCalled = true;
    return { results: [] };
  };

  const result = await gameService.getTrending({ page_size: 20 });
  assert.equal(rawgCalled, false);
  assert.equal(result.results[0].id, "igdb-1");
  assert.equal(result.results[0].rating, 4);
  assert.equal(result.count, 1);
});

test("returns curated carousel games in the requested order", async () => {
  igdb.fetchFeaturedGames = async () => [
    { id: 8, slug: "the-evil-within", name: "The Evil Within", first_release_date: 1413244800 },
    { id: 7, slug: "resident-evil-4--1", name: "Resident Evil 4", first_release_date: 1679616000 },
    { id: 5, slug: "resident-evil-7-biohazard", name: "Resident Evil 7: Biohazard" },
    { id: 4, slug: "silent-hill-2--1", name: "Silent Hill 2", first_release_date: 1728345600 },
    { id: 3, slug: "the-dark-pictures-anthology-man-of-medan", name: "The Dark Pictures Anthology: Man of Medan", first_release_date: 1566432000 },
    { id: 2, slug: "dead-by-daylight", name: "Dead by Daylight", first_release_date: 1465948800 },
    { id: 1, slug: "outlast-ii", name: "Outlast II" },
  ];

  const result = await gameService.getFeaturedGames();
  assert.deepEqual(result.results.map((game) => game.name), [
    "Outlast II",
    "Dead by Daylight",
    "The Dark Pictures Anthology: Man of Medan",
    "Silent Hill 2",
    "Resident Evil 4",
    "The Evil Within",
    "Resident Evil 7: Biohazard",
  ]);
  assert.equal(result.results.some((game) => game.name === "Resident Evil 2"), false);
  assert.equal(result.results.some((game) => game.name === "Hellblade: Senua's Sacrifice"), false);
});

test("returns the top nightmares in curated order and selects the requested releases", async () => {
  const nightmareTitles = [
    "Alien: Isolation",
    "Fatal Frame II: Crimson Butterfly",
    "Amnesia: The Dark Descent",
    "Silent Hill 2",
    "Outlast",
    "Resident Evil 7: Biohazard",
    "Dead Space",
    "SOMA",
    "Visage",
    "Left 4 Dead",
  ];
  const releaseDates = {
    "Alien: Isolation": Date.UTC(2014, 0, 1) / 1000,
    "Silent Hill 2": Date.UTC(2024, 0, 1) / 1000,
    "Dead Space": Date.UTC(2023, 0, 1) / 1000,
    "Fatal Frame II: Crimson Butterfly": Date.UTC(2003, 0, 1) / 1000,
  };
  igdb.fetchSearch = async ({ query }) => ([
    {
      id: nightmareTitles.indexOf(query) + 1,
      slug: query.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: query,
      first_release_date: releaseDates[query] || Date.UTC(2010, 0, 1) / 1000,
    },
  ]);

  const result = await gameService.getTopNightmares();
  assert.deepEqual(result.results.map((game) => game.name), nightmareTitles);
  assert.equal(result.count, 10);
});

test("returns the distinct curated trending horror games in order", async () => {
  const trendingGames = [
    { query: "Phasmophobia", name: "Phasmophobia", year: "2020" },
    { query: "The Outlast Trials", name: "The Outlast Trials", year: "2024" },
    { query: "Dead by Daylight", name: "Dead by Daylight", year: "2016" },
    { query: "Lethal Company", name: "Lethal Company", year: "2023" },
    { query: "Little Nightmares III", name: "Little Nightmares III", year: "2025" },
    { query: "Silent Hill f", name: "Silent Hill f", year: "2025" },
    { query: "Resident Evil Village", name: "Resident Evil Village", year: "2021" },
    { query: "Five Nights at Freddy's: Into the Pit", name: "Five Nights at Freddy's: Into the Pit", year: "2024" },
    { query: "Mouthwashing", name: "Mouthwashing", year: "2024" },
    { query: "Dying Light: The Beast", name: "Dying Light: The Beast", year: "2025" },
    { query: "Resident Evil Requiem", name: "Resident Evil Requiem", year: "2026" },
    { query: "Alan Wake 2", name: "Alan Wake 2", year: "2023" },
  ];
  igdb.fetchSearch = async ({ query }) => {
    const game = trendingGames.find((item) => item.query === query);
    return [{
      id: trendingGames.indexOf(game) + 1,
      slug: query.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: game.name,
      first_release_date: Date.UTC(Number(game.year), 0, 1) / 1000,
    }];
  };

  const result = await gameService.getTrendingHorror();
  assert.deepEqual(result.results.map((game) => game.name), trendingGames.map((game) => game.name));
  assert.equal(result.count, 12);
});

test("falls back to RAWG when IGDB returns an empty search", async () => {
  igdb.fetchSearch = async () => ({ count: 0, results: [] });
  rawg.fetchSearch = async () => ({
    count: 1,
    results: [{ id: 2, slug: "fallback-game", name: "Fallback Game" }],
  });

  const result = await gameService.getSearch({ query: "Fallback Game" });
  assert.equal(result.results[0].id, 2);
  assert.equal(result.results[0].provider, "rawg");
});

test("keeps a successful empty IGDB response if RAWG is unavailable", async () => {
  igdb.fetchSearch = async () => ({ count: 0, results: [] });
  rawg.fetchSearch = async () => {
    throw new Error("RAWG unavailable");
  };

  const result = await gameService.getSearch({ query: "Unknown Game" });
  assert.deepEqual(result.results, []);
});

test("keeps RAWG detail fallback horror-filtered except for curated carousel titles", async () => {
  igdb.fetchGameDetails = async () => null;
  rawg.fetchGameDetails = async () => ({
    id: 3,
    slug: "action-game",
    name: "Action Game",
    genres: [{ slug: "action", name: "Action" }],
  });

  assert.equal(await gameService.getDetails("action-game"), null);

  rawg.fetchGameDetails = async () => ({
    id: 4,
    slug: "resident-evil-4--1",
    name: "Resident Evil 4",
    released: "2023-03-24",
    genres: [{ slug: "adventure", name: "Adventure" }],
  });
  assert.equal((await gameService.getDetails("resident-evil-4--1")).id, 4);
});

test("falls back to RAWG when IGDB throws, and surfaces dual provider failures", async () => {
  igdb.fetchTrending = async () => {
    throw new Error("IGDB unavailable");
  };
  rawg.fetchTrending = async () => ({
    count: 1,
    results: [{ id: 2, slug: "fallback-game", name: "Fallback Game" }],
  });
  const recovered = await gameService.getTrending();
  assert.equal(recovered.results[0].provider, "rawg");

  rawg.fetchTrending = async () => {
    throw new Error("RAWG unavailable");
  };
  await assert.rejects(gameService.getTrending(), {
    message: "IGDB and RAWG are both unavailable.",
    status: 502,
  });
});

test("returns normalized game series results", async () => {
  igdb.fetchGameSeries = async () => [
    { id: 2, slug: "later-game", name: "Later Game", first_release_date: 1609459200 },
    { id: 1, slug: "earlier-game", name: "Earlier Game", first_release_date: 946684800 },
  ];

  const result = await gameService.getSeries("later-game");
  assert.deepEqual(result.results.map((game) => game.id), ["igdb-2", "igdb-1"]);
  assert.equal(result.results[0].released, "2021-01-01");
});
