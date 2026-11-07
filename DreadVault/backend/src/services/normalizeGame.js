const slugify = (value) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const imageUrl = (image, size = "t_1080p") => {
  if (!image?.url) return null;
  const url = image.url.startsWith("//") ? `https:${image.url}` : image.url;
  return url.replace(/\/t_[^/]+\//, `/${size}/`);
};

const releaseDate = (timestamp) => {
  if (timestamp == null || !Number.isFinite(Number(timestamp))) return null;
  return new Date(Number(timestamp) * 1000).toISOString().slice(0, 10);
};

const ageRating = (ratings = []) => {
  const esrb = {
    1: "Rating Pending",
    2: "Early Childhood",
    3: "Everyone",
    4: "Everyone 10+",
    5: "Teen",
    6: "Mature 17+",
    7: "Adults Only 18+",
  };
  const match = ratings.find((rating) =>
    rating.organization?.name === "ESRB" || (rating.category === 1 && esrb[rating.rating])
  );
  if (!match) return null;
  const rating = match.rating_category?.rating || esrb[match.rating];
  return rating ? { id: match.rating_category?.id || match.rating, name: `ESRB ${rating}` } : null;
};

const normalizeRelations = (items = []) =>
  items
    .filter((item) => item?.name)
    .map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug || slugify(item.name),
      released: releaseDate(item.first_release_date),
      background_image: imageUrl(item.cover),
    }));

const normalizeWebsite = (website) => {
  const type = website.type?.type || website.type?.name;
  const normalizedType = String(type || "").toLowerCase();
  const category = normalizedType === "official website"
    ? "official"
    : ["steam", "epic", "gog", "playstation", "xbox", "nintendo", "google play",
      "app store (iphone)", "app store (ipad)", "itch", "meta", "gamejolt"]
      .includes(normalizedType)
      ? "store"
      : ["community wiki", "twitch", "twitter", "facebook", "instagram",
        "subreddit", "youtube", "discord", "bluesky"]
        .includes(normalizedType)
        ? "community"
        : "other";

  return {
    id: website.id,
    name: type || "Website",
    category,
    url: /^https?:\/\//i.test(website.url || "") ? website.url : null,
    trusted: Boolean(website.trusted),
  };
};

const normalizeIgdb = (game) => {
  const cover = imageUrl(game.cover, "t_cover_big");
  const artworks = (game.artworks || []).map((image) => imageUrl(image)).filter(Boolean);
  const screenshots = (game.screenshots || []).map((image) => imageUrl(image)).filter(Boolean);
  const platforms = (game.platforms || []).map((platform) => ({
    platform: {
      id: `igdb-${platform.id}`,
      name: platform.name,
      slug: platform.slug || slugify(platform.name),
    },
  }));
  const normalizeCategory = (genre) => ({
    id: `igdb-${genre.id}`,
    name: genre.name,
    slug: genre.slug || slugify(genre.name),
  });
  const themes = (game.themes || []).map(normalizeCategory);
  const genres = [...(game.genres || []), ...(game.themes || [])].map(normalizeCategory);
  const involvedCompanies = game.involved_companies || [];
  const rating = typeof game.rating === "number" && game.rating > 0
    ? Math.round((game.rating / 20) * 10) / 10
    : null;
  const ratingCount = Number.isFinite(game.rating_count) ? game.rating_count : null;
  const totalRatingCount = Number.isFinite(game.total_rating_count)
    ? game.total_rating_count
    : ratingCount;
  const ageRatings = (game.age_ratings || []).map((rating) => ({
    organization: rating.organization?.name || null,
    rating: rating.rating_category?.rating || null,
    synopsis: rating.synopsis || null,
    descriptors: (rating.rating_content_descriptions || rating.content_descriptions || [])
      .map((description) => description.description)
      .filter(Boolean),
  }));
  const releaseDates = (game.release_dates || [])
    .map((release) => ({
      date: releaseDate(release.date),
      human: release.human || releaseDate(release.date),
      platform: release.platform?.name || null,
      status: release.status?.name || null,
      category: release.category ?? null,
    }))
    .filter((release) => release.human || release.platform || release.status);
  const languageSupports = (game.language_supports || [])
    .filter((support) => support.language?.name)
    .map((support) => ({
      language: support.language.name,
      type: support.language_support_type?.name || null,
    }));

  return {
    id: `igdb-${game.id}`,
    igdb_id: game.id,
    provider: "igdb",
    slug: game.slug || slugify(game.name),
    name: game.name || null,
    description_raw: game.summary || game.storyline || null,
    background_image: artworks[0] || screenshots[0] || cover,
    background_image_additional: artworks[1] || screenshots[1] || null,
    cover_image: cover,
    released: releaseDate(game.first_release_date),
    rating,
    rating_count: ratingCount,
    ratings_count: totalRatingCount,
    metacritic: null,
    critic_rating:
      typeof game.aggregated_rating === "number" ? Math.round(game.aggregated_rating) : null,
    critic_rating_count: Number.isFinite(game.aggregated_rating_count)
      ? game.aggregated_rating_count
      : null,
    playtime: null,
    esrb_rating: ageRating(game.age_ratings),
    age_ratings: ageRatings,
    release_dates: releaseDates,
    release_status: game.status?.name || null,
    game_type: game.game_type?.name || null,
    themes,
    multiplayer_modes: (game.multiplayer_modes || []).map((mode) => ({
      campaign_coop: Boolean(mode.campaigncoop),
      drop_in: Boolean(mode.dropin),
      lan_coop: Boolean(mode.lancoop),
      offline_coop: Boolean(mode.offlinecoop),
      offline_coop_max: mode.offlinecoopmax || null,
      offline_max: mode.offlinemax || null,
      online_coop: Boolean(mode.onlinecoop),
      online_coop_max: mode.onlinecoopmax || null,
      online_max: mode.onlinemax || null,
      split_screen: Boolean(mode.splitscreen),
      split_screen_online: Boolean(mode.splitscreenonline),
      platform: mode.platform?.name || null,
    })),
    game_engines: (game.game_engines || []).map(({ id, name, description, url }) => ({
      id,
      name,
      description: description || null,
      url: /^https?:\/\//i.test(url || "") ? url : null,
    })).filter((engine) => engine.name),
    ports: normalizeRelations(game.ports),
    remakes: normalizeRelations(game.remakes),
    remasters: normalizeRelations(game.remasters),
    keywords: (game.keywords || []).map(({ id, name }) => ({
      id,
      name,
      slug: slugify(name),
    })),
    franchises: normalizeRelations(game.franchises),
    collections: normalizeRelations(game.collections),
    dlcs: normalizeRelations(game.dlcs),
    expansions: normalizeRelations(game.expansions),
    expanded_games: normalizeRelations(game.expanded_games),
    standalone_expansions: normalizeRelations(game.standalone_expansions),
    parent_game: game.parent_game ? normalizeRelations([game.parent_game])[0] || null : null,
    language_supports: languageSupports,
    accessibility_features: Array.isArray(game.accessibility_features)
      ? game.accessibility_features
      : [],
    websites: (game.websites || []).map(normalizeWebsite).filter((website) => website.url),
    genres,
    platforms,
    parent_platforms: platforms,
    developers: involvedCompanies
      .filter((entry) => entry.developer && entry.company?.name)
      .map((entry) => ({ id: entry.company.id, name: entry.company.name })),
    publishers: involvedCompanies
      .filter((entry) => entry.publisher && entry.company?.name)
      .map((entry) => ({ id: entry.company.id, name: entry.company.name })),
    game_modes: (game.game_modes || []).map(({ id, name }) => ({ id, name })),
    player_perspectives: (game.player_perspectives || []).map(({ id, name }) => ({ id, name })),
    website:
      game.websites?.find((website) =>
        website.type?.id === 1 || website.type?.type === "Official Website"
      )?.url ||
      null,
    stores: [],
    short_screenshots: screenshots.map((image, index) => ({
      id: `${game.id}-screenshot-${index}`,
      image,
    })),
    movies: (game.videos || [])
      .filter((video) => video.video_id)
      .map((video) => ({
        id: video.id,
        name: video.name || "Game trailer",
        data: {
          max: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.video_id)}`,
        },
      })),
  };
};

const normalizeRawg = (game) => ({
  ...game,
  provider: "rawg",
  critic_rating: null,
  critic_rating_count: null,
  themes: game.themes || [],
  multiplayer_modes: game.multiplayer_modes || [],
  game_engines: game.game_engines || [],
  ports: game.ports || [],
  remakes: game.remakes || [],
  remasters: game.remasters || [],
  age_ratings: game.age_ratings || [],
  release_dates: game.release_dates || [],
  release_status: game.status?.name || game.released_status || null,
  game_type: game.game_type || null,
  keywords: game.tags || [],
  franchises: game.franchises || [],
  collections: game.collections || [],
  dlcs: game.dlcs || [],
  expansions: game.expansions || [],
  expanded_games: game.expanded_games || [],
  standalone_expansions: game.standalone_expansions || [],
  parent_game: game.parent_game || null,
  language_supports: game.language_supports || [],
  accessibility_features: game.accessibility_features || [],
  websites: [
    ...(game.websites || []),
    ...(game.stores || [])
      .filter((store) => /^https?:\/\//i.test(store.url || ""))
      .map((store) => ({
        id: store.id,
        name: store.store?.name || "Store",
        category: "store",
        url: store.url,
        trusted: true,
      })),
  ],
  genres: game.genres || [],
  platforms: game.platforms || [],
  parent_platforms: game.parent_platforms || game.platforms || [],
  developers: game.developers || [],
  publishers: game.publishers || [],
  short_screenshots: game.short_screenshots || [],
  movies: game.movies || [],
  stores: game.stores || [],
});

const normalizeGame = (game, provider) =>
  provider === "igdb" ? normalizeIgdb(game) : normalizeRawg(game);

const dedupeGames = (games) => {
  const seen = new Set();
  return games.filter((game) => {
    const key = slugify(game.slug || game.name);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

module.exports = { normalizeGame, normalizeIgdb, normalizeRawg, dedupeGames, slugify };
