const IMG = {
  fog: "https://images.pexels.com/photos/16166873/pexels-photo-16166873.jpeg",
  forest: "https://images.pexels.com/photos/29287033/pexels-photo-29287033.jpeg",
  corridor: "https://images.pexels.com/photos/27015942/pexels-photo-27015942.jpeg",
  woods: "https://images.pexels.com/photos/29547573/pexels-photo-29547573.jpeg",
  abstract: "https://images.pexels.com/photos/16851158/pexels-photo-16851158.jpeg",
  grain: "https://images.pexels.com/photos/18599094/pexels-photo-18599094.jpeg",
};

const g = (id, slug, name, released, rating, metacritic, bg, genres, platforms) => ({
  id,
  slug,
  name,
  released,
  rating,
  metacritic,
  ratings_count: 18000 + id * 430,
  playtime: 2 + (id % 6),
  esrb_rating: { id: 1 + (id % 3), name: ["Teen", "Mature 17+", "Everyone"][id % 3] },
  background_image: bg,
  genres: genres.map((n) => ({ id: n.toLowerCase(), name: n, slug: n.toLowerCase() })),
  platforms: platforms.map((p) => ({ platform: { id: p, name: p, slug: p.toLowerCase() } })),
  parent_platforms: platforms.map((p) => ({ platform: { id: p, name: p, slug: p.toLowerCase() } })),
  short_screenshots: [
    { id: 1, image: bg },
    { id: 2, image: IMG.abstract },
    { id: 3, image: IMG.grain },
    { id: 4, image: IMG.corridor },
  ],
});

const games = [
  g(1, "silent-hill-2", "Silent Hill 2", "2001-09-24", 4.7, 89, IMG.fog, ["Horror", "Adventure"], ["PC", "PlayStation"]),
  g(2, "resident-evil-4", "Resident Evil 4", "2023-03-24", 4.8, 93, IMG.corridor, ["Horror", "Action"], ["PC", "PlayStation", "Xbox"]),
  g(3, "dead-space", "Dead Space", "2023-01-27", 4.6, 88, IMG.abstract, ["Horror", "Action"], ["PC", "PlayStation", "Xbox"]),
  g(4, "alan-wake-2", "Alan Wake 2", "2023-10-27", 4.7, 89, IMG.forest, ["Horror", "Adventure"], ["PC", "PlayStation", "Xbox"]),
  g(5, "amnesia-the-bunker", "Amnesia: The Bunker", "2023-06-06", 4.1, 78, IMG.woods, ["Horror"], ["PC", "PlayStation"]),
  g(6, "phasmophobia", "Phasmophobia", "2020-09-18", 4.4, 82, IMG.grain, ["Horror", "Indie"], ["PC"]),
  g(7, "outlast-2", "Outlast 2", "2017-04-25", 4.0, 75, IMG.forest, ["Horror"], ["PC", "PlayStation", "Xbox"]),
  g(8, "the-callisto-protocol", "The Callisto Protocol", "2022-12-02", 3.9, 69, IMG.abstract, ["Horror", "Action"], ["PC", "PlayStation", "Xbox"]),
  g(9, "layers-of-fear", "Layers of Fear", "2023-06-15", 3.8, 72, IMG.corridor, ["Horror", "Adventure"], ["PC", "PlayStation"]),
  g(10, "the-medium", "The Medium", "2021-01-28", 3.7, 71, IMG.fog, ["Horror", "Adventure"], ["PC", "PlayStation", "Xbox"]),
  g(11, "visage", "Visage", "2020-10-30", 4.2, 78, IMG.corridor, ["Horror", "Indie"], ["PC", "PlayStation", "Xbox"]),
  g(12, "signalis", "SIGNALIS", "2022-10-27", 4.5, 84, IMG.abstract, ["Horror", "Indie"], ["PC", "PlayStation", "Xbox"]),
  g(13, "silent-hill-2-2024", "Silent Hill 2 Remake", "2024-10-08", 4.6, 86, IMG.fog, ["Horror", "Adventure"], ["PC", "PlayStation"]),
  g(14, "eternal-darkness-sanitys-requiem", "Eternal Darkness: Sanity's Requiem", "2002-06-21", 4.5, 92, IMG.fog, ["Horror", "Adventure"], ["Nintendo GameCube"]),
];

const featuredGames = [
  {
    ...g(7, "outlast-2", "Outlast 2", "2017-04-25", 4.0, 75, IMG.forest, ["Horror"], ["PC", "PlayStation", "Xbox"]),
    description_raw: "Investigative journalist Blake Langermann searches for his missing wife in a remote Arizona town gripped by a terrifying religious cult.",
  },
  {
    ...g(21, "dead-by-daylight", "Dead by Daylight", "2016-06-14", 4.2, 71, IMG.grain, ["Horror", "Action"], ["PC", "PlayStation", "Xbox"]),
    description_raw: "Four survivors must work together to escape a relentless killer in this asymmetrical multiplayer horror game.",
  },
  {
    ...g(22, "the-dark-pictures-anthology-man-of-medan", "The Dark Pictures Anthology: Man of Medan", "2019-08-30", 3.8, 69, IMG.corridor, ["Horror", "Adventure"], ["PC", "PlayStation", "Xbox"]),
    description_raw: "A group of friends encounter a nightmare aboard an abandoned World War II ship, where every choice can decide who survives.",
  },
  {
    ...g(19, "silent-hill-2-2024", "Silent Hill 2", "2024-10-08", 4.6, 86, IMG.fog, ["Horror", "Adventure"], ["PC", "PlayStation"]),
    description_raw: "James Sunderland returns to the fog-covered town of Silent Hill after receiving a letter from his deceased wife.",
  },
  {
    ...g(23, "resident-evil-4", "Resident Evil 4", "2023-03-24", 4.5, 93, IMG.corridor, ["Horror", "Action"], ["PC", "PlayStation", "Xbox"]),
    description_raw: "Agent Leon S. Kennedy travels to a remote European village to rescue the president's daughter from a terrifying cult.",
  },
  {
    ...g(24, "the-evil-within", "The Evil Within", "2014-10-14", 4.0, 75, IMG.forest, ["Horror", "Action"], ["PC", "PlayStation", "Xbox"]),
    description_raw: "Detective Sebastian Castellanos is pulled into a nightmarish world while investigating a gruesome crime scene.",
  },
  {
    ...g(17, "resident-evil-7-biohazard", "Resident Evil 7: Biohazard", "2017-01-24", 4.4, 86, IMG.corridor, ["Horror", "Action"], ["PC", "PlayStation", "Xbox"]),
    description_raw: "Ethan Winters follows a message from his missing wife to a decaying Louisiana plantation and the dangerous Baker family.",
  },
];

const topNightmareGames = [
  ["alien-isolation", "Alien: Isolation", "2014-10-07", IMG.corridor],
  ["fatal-frame-ii-crimson-butterfly", "Fatal Frame II: Crimson Butterfly", "2003-11-27", IMG.woods],
  ["amnesia-the-dark-descent", "Amnesia: The Dark Descent", "2010-09-08", IMG.fog],
  ["silent-hill-2-2024", "Silent Hill 2", "2024-10-08", IMG.forest],
  ["outlast", "Outlast", "2013-09-04", IMG.woods],
  ["resident-evil-7-biohazard", "Resident Evil 7: Biohazard", "2017-01-24", IMG.corridor],
  ["dead-space-2023", "Dead Space", "2023-01-27", IMG.abstract],
  ["soma", "SOMA", "2015-09-22", IMG.grain],
  ["visage", "Visage", "2020-10-30", IMG.fog],
  ["left-4-dead", "Left 4 Dead", "2008-11-17", IMG.corridor],
].map(([slug, name, released, image], index) => ({
  ...g(31 + index, slug, name, released, 0, 0, image, ["Horror"], ["PC", "PlayStation"]),
  rating: null,
  metacritic: null,
  ratings_count: 0,
}));

const trendingHorrorGames = [
  ["phasmophobia", "Phasmophobia", "2020-09-18", IMG.grain],
  ["the-outlast-trials", "The Outlast Trials", "2024-03-05", IMG.woods],
  ["dead-by-daylight", "Dead by Daylight", "2016-06-14", IMG.fog],
  ["lethal-company", "Lethal Company", "2023-10-23", IMG.corridor],
  ["little-nightmares-iii", "Little Nightmares III", "2025-10-10", IMG.abstract],
  ["silent-hill-f", "Silent Hill f", "2025-09-25", IMG.forest],
  ["resident-evil-village", "Resident Evil Village", "2021-05-07", IMG.corridor],
  ["five-nights-at-freddys-into-the-pit", "Five Nights at Freddy's: Into the Pit", "2024-08-07", IMG.grain],
  ["mouthwashing", "Mouthwashing", "2024-09-26", IMG.abstract],
  ["dying-light-the-beast", "Dying Light: The Beast", "2025-09-18", IMG.woods],
  ["resident-evil-requiem", "Resident Evil Requiem", "2026-02-27", IMG.fog],
  ["alan-wake-2", "Alan Wake 2", "2023-10-27", IMG.forest],
].map(([slug, name, released, image], index) => ({
  ...g(51 + index, slug, name, released, null, null, image, ["Horror"], ["PC", "PlayStation", "Xbox"]),
  rating: null,
  metacritic: null,
  ratings_count: 0,
}));

const listResp = (arr) => ({ count: arr.length, next: null, previous: null, results: arr });

export default {
  IMG,
  trending: () => listResp(games),
  trendingHorror: () => listResp(trendingHorrorGames),
  featuredGames: () => listResp(featuredGames),
  topNightmares: () => listResp(topNightmareGames),
  topRated: () => listResp([...games].sort((a, b) => b.metacritic - a.metacritic)),
  recent: () => listResp([...games].sort((a, b) => b.released.localeCompare(a.released))),
  upcoming: () => listResp(games.slice(0, 6)),
  browse: (params = {}) => {
    let arr = [...games];
    if (params.search) {
      const search = params.search.toLowerCase();
      arr = arr.filter((x) => x.name.toLowerCase().includes(search));
    }
    if (params.genres) arr = arr.filter((x) => x.genres.some((gg) => gg.slug === params.genres));
    if (params.platforms) {
      const platformSlugs = {
        14: "xbox",
        15: "playstation",
        16: "playstation",
        1: "xbox",
        4: "pc",
        7: "nintendo switch",
        18: "playstation",
        186: "xbox",
        187: "playstation",
      };
      const selectedPlatform = platformSlugs[params.platforms] || String(params.platforms).toLowerCase();
      arr = arr.filter((x) =>
        x.platforms.some(({ platform }) => platform.slug === selectedPlatform)
      );
    }
    if (params.year) arr = arr.filter((x) => x.released.startsWith(String(params.year)));
    if (params.rating) arr = arr.filter((x) => x.rating >= Number(params.rating));

    const sorters = {
      "-added": () => 0,
      "-rating": (a, b) => b.rating - a.rating,
      "-released": (a, b) => b.released.localeCompare(a.released),
      released: (a, b) => a.released.localeCompare(b.released),
      name: (a, b) => a.name.localeCompare(b.name),
      "-name": (a, b) => b.name.localeCompare(a.name),
    };
    arr.sort(sorters[params.ordering] || sorters["-added"]);

    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.max(1, Number(params.page_size) || 20);
    const start = (page - 1) * pageSize;
    return {
      count: arr.length,
      next: start + pageSize < arr.length ? `mock://games?page=${page + 1}` : null,
      previous: page > 1 ? `mock://games?page=${page - 1}` : null,
      results: arr.slice(start, start + pageSize),
    };
  },
  details: (slug) => {
    const found = featuredGames.find((x) => x.slug === slug) ||
      topNightmareGames.find((x) => x.slug === slug) ||
      games.find((x) => x.slug === slug) ||
      games[0];
    return {
      ...found,
      description_raw: found.description_raw || "Explore a memorable journey through a world of terror, mystery, and survival.",
      developers: [{ id: 1, name: "Team Silent" }],
      publishers: [{ id: 1, name: "Konami" }],
      website: "https://example.com",
      metacritic_url: "https://example.com",
      ratings_count: 28470,
      playtime: 9,
      esrb_rating: { id: 1, name: "Mature 17+" },
      background_image_additional: IMG.grain,
      stores: [
        { id: 1, store: { id: 1, name: "Steam", slug: "steam" }, url: "https://store.steampowered.com" },
        { id: 2, store: { id: 2, name: "PlayStation Store", slug: "playstation" }, url: "#" },
      ],
    };
  },
  screenshots: (slug) => {
    const found = games.find((x) => x.slug === slug) || games[0];
    return listResp(found.short_screenshots);
  },
  movies: () => listResp([]),
  related: (game) => {
    const targetGenres = new Set((game?.genres || []).map((genre) => genre.slug || genre.name));
    const targetPlatforms = new Set((game?.parent_platforms || game?.platforms || []).map((entry) =>
      entry.platform?.slug || entry.platform?.name || entry.slug || entry.name
    ).filter(Boolean));
    const related = games
      .filter((item) => item.id !== game?.id && item.slug !== game?.slug)
      .map((item) => {
        const genreMatches = item.genres.filter((genre) => targetGenres.has(genre.slug)).length;
        const platformMatches = item.platforms.filter(({ platform }) => targetPlatforms.has(platform.slug)).length;
        return { item, score: genreMatches * 10 + platformMatches * 3 };
      })
      .sort((a, b) => b.score - a.score || b.item.rating - a.item.rating)
      .map(({ item }) => item);
    return listResp(related);
  },
  genres: () =>
    listResp([
      { id: "horror", slug: "horror", name: "Horror" },
      { id: "shooter", slug: "shooter", name: "Shooter" },
      { id: "survival", slug: "survival", name: "Survival" },
      { id: "adventure", slug: "adventure", name: "Adventure" },
      { id: "action", slug: "action", name: "Action" },
      { id: "indie", slug: "indie", name: "Indie" },
      { id: "platform", slug: "platform", name: "Platform" },
      { id: "puzzle", slug: "puzzle", name: "Puzzle" },
      { id: "rpg", slug: "role-playing-games-rpg", name: "RPG" },
      { id: "strategy", slug: "strategy", name: "Strategy" },
    ]),
  platforms: () =>
    listResp([
      { id: 4, slug: "pc", name: "PC" },
      { id: 187, slug: "playstation5", name: "PlayStation 5" },
      { id: 186, slug: "xbox-series-x", name: "Xbox Series X|S" },
      { id: "switch-2", slug: "switch-2", name: "Nintendo Switch 2" },
      { id: 18, slug: "playstation4", name: "PlayStation 4" },
      { id: 1, slug: "xbox-one", name: "Xbox One" },
      { id: 7, slug: "nintendo-switch", name: "Nintendo Switch" },
      { id: 16, slug: "playstation3", name: "PlayStation 3" },
      { id: 14, slug: "xbox360", name: "Xbox 360" },
      { id: 15, slug: "playstation2", name: "PlayStation 2" },
    ]),
};
