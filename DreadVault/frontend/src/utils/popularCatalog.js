const POPULAR_GENRES = [
  ["horror"],
  ["action"],
  ["adventure"],
  ["shooter"],
  ["survival"],
  ["role playing rpg", "role playing games rpg", "rpg"],
  ["puzzle"],
  ["indie"],
  ["platform"],
  ["strategy"],
];

const POPULAR_PLATFORMS = [
  ["pc", "windows"],
  ["playstation 5"],
  ["xbox series x s", "xbox series s x", "xbox series x", "xbox series s"],
  ["nintendo switch 2", "switch 2"],
  ["playstation 4", "ps4"],
  ["xbox one"],
  ["nintendo switch", "switch"],
  ["playstation 3", "ps3"],
  ["xbox 360"],
  ["playstation 2", "ps2"],
];

const normalizeCatalogName = (value) =>
  String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const selectCatalogItems = (items = [], preferredNames) =>
  preferredNames
    .map((aliases) => items.find((item) =>
      aliases.includes(normalizeCatalogName(item.name)) ||
      aliases.includes(normalizeCatalogName(item.slug))
    ))
    .filter(Boolean);

export const selectPopularGenres = (genres) => selectCatalogItems(genres, POPULAR_GENRES);
export const selectPopularPlatforms = (platforms) => selectCatalogItems(platforms, POPULAR_PLATFORMS);

export const prioritizePopularItems = (items = [], popularItems = []) => {
  const popularIds = new Set(popularItems.map((item) => item.id ?? item.slug));
  return [
    ...popularItems,
    ...items.filter((item) => !popularIds.has(item.id ?? item.slug)),
  ];
};
