const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeIgdb, normalizeRawg, dedupeGames } = require("../src/services/normalizeGame");

test("normalizes IGDB metadata into the existing game card shape", () => {
  const game = normalizeIgdb({
    id: 21,
    slug: "horror-title",
    name: "Horror Title",
    summary: "A short summary.",
    first_release_date: 1700000000,
    rating: 80,
    rating_count: 12,
    total_rating_count: 34,
    aggregated_rating: 83.6,
    aggregated_rating_count: 27,
    cover: { url: "//images.igdb.com/igdb/image/upload/t_thumb/cover.jpg" },
    artworks: [{ url: "//images.igdb.com/igdb/image/upload/t_thumb/art.jpg" }],
    screenshots: [{ url: "//images.igdb.com/igdb/image/upload/t_thumb/shot.jpg" }],
    genres: [{ id: 5, name: "Adventure", slug: "adventure" }],
    themes: [{ id: 19, name: "Horror", slug: "horror" }],
    platforms: [{ id: 6, name: "PC", slug: "pc" }],
    keywords: [{ id: 31, name: "Psychological horror" }],
    franchises: [{ id: 51, name: "Horror Saga" }],
    dlcs: [{ id: 61, name: "The Expansion", slug: "the-expansion", first_release_date: 1735689600 }],
    status: { name: "Released" },
    age_ratings: [{
      category: 1,
      rating: 6,
      organization: { name: "ESRB" },
      rating_category: { id: 6, rating: "M" },
      synopsis: "Mature content.",
      rating_content_descriptions: [{ description: "Violence" }],
    }],
    release_dates: [{
      date: 1735689600,
      human: "Jan 1, 2025",
      platform: { name: "PC" },
      status: { name: "Released" },
    }],
    language_supports: [{
      language: { name: "English" },
      language_support_type: { name: "Subtitles" },
    }],
    involved_companies: [
      { developer: true, company: { id: 10, name: "Studio" } },
      { publisher: true, company: { id: 11, name: "Publisher" } },
    ],
    websites: [
      { id: 7, type: { id: 1, type: "Official Website" }, trusted: true, url: "https://example.test" },
      { id: 8, type: { id: 13, type: "Steam" }, trusted: true, url: "https://store.steampowered.com/app/1" },
      { id: 9, type: { id: 5, type: "Twitter" }, trusted: true, url: "https://x.com/example" },
      { id: 10, type: { id: 1, type: "Official Website" }, trusted: false, url: "javascript:alert(1)" },
    ],
    game_engines: [{ id: 90, name: "Test Engine", description: "Engine info", url: "https://example.test/engine" }],
    multiplayer_modes: [{
      campaigncoop: true,
      onlinecoop: true,
      onlinecoopmax: 4,
      platform: { name: "PC" },
    }],
    ports: [{ id: 91, slug: "horror-port", name: "Horror Port", first_release_date: 1735689600 }],
    remakes: [{ id: 92, slug: "horror-remake", name: "Horror Remake" }],
    remasters: [{ id: 93, slug: "horror-remaster", name: "Horror Remaster" }],
    videos: [{ id: 4, name: "Trailer", video_id: "abc_DEF-123" }],
  });

  assert.equal(game.id, "igdb-21");
  assert.equal(game.description_raw, "A short summary.");
  assert.equal(game.rating, 4);
  assert.equal(game.rating_count, 12);
  assert.equal(game.ratings_count, 34);
  assert.equal(game.metacritic, null);
  assert.equal(game.critic_rating, 84);
  assert.equal(game.critic_rating_count, 27);
  assert.match(game.background_image, /t_1080p\/art\.jpg$/);
  assert.match(game.cover_image, /t_cover_big\/cover\.jpg$/);
  assert.equal(game.genres.length, 2);
  assert.equal(game.themes[0].name, "Horror");
  assert.equal(game.platforms[0].platform.slug, "pc");
  assert.equal(game.developers[0].name, "Studio");
  assert.equal(game.publishers[0].name, "Publisher");
  assert.equal(game.keywords[0].name, "Psychological horror");
  assert.equal(game.franchises[0].name, "Horror Saga");
  assert.equal(game.dlcs[0].released, "2025-01-01");
  assert.equal(game.release_status, "Released");
  assert.equal(game.age_ratings[0].descriptors[0], "Violence");
  assert.equal(game.age_ratings[0].synopsis, "Mature content.");
  assert.equal(game.age_ratings[0].organization, "ESRB");
  assert.equal(game.age_ratings[0].rating, "M");
  assert.equal(game.esrb_rating.name, "ESRB M");
  assert.equal(game.age_ratings[0].descriptors[0], "Violence");
  assert.equal(game.game_engines[0].name, "Test Engine");
  assert.deepEqual(game.multiplayer_modes[0], {
    campaign_coop: true,
    drop_in: false,
    lan_coop: false,
    offline_coop: false,
    offline_coop_max: null,
    offline_max: null,
    online_coop: true,
    online_coop_max: 4,
    online_max: null,
    split_screen: false,
    split_screen_online: false,
    platform: "PC",
  });
  assert.equal(game.ports[0].name, "Horror Port");
  assert.equal(game.remakes[0].name, "Horror Remake");
  assert.equal(game.remasters[0].name, "Horror Remaster");
  assert.deepEqual(game.release_dates[0], {
    date: "2025-01-01",
    human: "Jan 1, 2025",
    platform: "PC",
    status: "Released",
    category: null,
  });
  assert.deepEqual(game.language_supports[0], { language: "English", type: "Subtitles" });
  assert.equal(game.website, "https://example.test");
  assert.deepEqual(game.websites[0], {
    id: 7,
    name: "Official Website",
    category: "official",
    url: "https://example.test",
    trusted: true,
  });
  assert.deepEqual(game.websites.map(({ name, category }) => ({ name, category })), [
    { name: "Official Website", category: "official" },
    { name: "Steam", category: "store" },
    { name: "Twitter", category: "community" },
  ]);
  assert.equal(game.movies[0].data.max, "https://www.youtube-nocookie.com/embed/abc_DEF-123");
  assert.equal(game.playtime, null);
  assert.equal(game.metacritic, null);
});

test("retains RAWG fields and supplies safe collection defaults", () => {
  const rawg = { id: 3, name: "RAWG game", genres: [{ id: 1, name: "Horror" }] };
  assert.deepEqual(normalizeRawg(rawg), {
    ...rawg,
    provider: "rawg",
    critic_rating: null,
    critic_rating_count: null,
    themes: [],
    multiplayer_modes: [],
    game_engines: [],
    ports: [],
    remakes: [],
    remasters: [],
    age_ratings: [],
    release_dates: [],
    release_status: null,
    game_type: null,
    keywords: [],
    franchises: [],
    collections: [],
    dlcs: [],
    expansions: [],
    expanded_games: [],
    standalone_expansions: [],
    parent_game: null,
    language_supports: [],
    accessibility_features: [],
    websites: [],
    platforms: [],
    parent_platforms: [],
    developers: [],
    publishers: [],
    short_screenshots: [],
    movies: [],
    stores: [],
  });
});

test("deduplicates equivalent provider results by slug", () => {
  assert.deepEqual(
    dedupeGames([{ slug: "silent-hill-2" }, { slug: "silent-hill-2" }, { name: "Alan Wake" }]),
    [{ slug: "silent-hill-2" }, { name: "Alan Wake" }]
  );
});
