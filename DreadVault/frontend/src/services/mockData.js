// Fallback data used when REACT_APP_RAWG_API_KEY is missing.
// Lets the entire UI/UX be explored offline.

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

const listResp = (arr) => ({ count: arr.length, next: null, previous: null, results: arr });

export default {
  IMG,
  trending: () => listResp(games),
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
    const found = games.find((x) => x.slug === slug) || games[0];
    return {
      ...found,
      description_raw:
        "In the fog-drenched streets of a forgotten town, whispers of the dead call to the living. A haunting descent into psychological terror where every shadow hides a story and every silence screams.",
      developers: [{ id: 1, name: "Team Silent" }],
      publishers: [{ id: 1, name: "Konami" }],
      website: "https://example.com",
      metacritic_url: "https://example.com",
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
      { id: "adventure", slug: "adventure", name: "Adventure" },
      { id: "action", slug: "action", name: "Action" },
      { id: "indie", slug: "indie", name: "Indie" },
      { id: "rpg", slug: "role-playing-games-rpg", name: "RPG" },
    ]),
  platforms: () =>
    listResp([
      { id: 4, slug: "pc", name: "PC" },
      { id: 187, slug: "playstation5", name: "PlayStation 5" },
      { id: 18, slug: "playstation4", name: "PlayStation 4" },
      { id: 1, slug: "xbox-one", name: "Xbox One" },
      { id: 186, slug: "xbox-series-x", name: "Xbox Series S/X" },
      { id: 7, slug: "nintendo-switch", name: "Nintendo Switch" },
    ]),
};
