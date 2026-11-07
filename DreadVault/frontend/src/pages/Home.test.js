import {
  prioritizePopularItems,
  selectPopularGenres,
  selectPopularPlatforms,
} from "../utils/popularCatalog";

describe("popular homepage catalog selections", () => {
  it("shows familiar horror-related genres in curated order", () => {
    const genres = [
      { id: "point-and-click", slug: "point-and-click", name: "Point-and-click" },
      { id: "strategy", slug: "strategy", name: "Strategy" },
      { id: "action", slug: "action", name: "Action" },
      { id: "horror", slug: "horror", name: "Horror" },
      { id: "adventure", slug: "adventure", name: "Adventure" },
      { id: "shooter", slug: "shooter", name: "Shooter" },
      { id: "survival", slug: "survival", name: "Survival" },
      { id: "rpg", slug: "role-playing-games-rpg", name: "Role-playing (RPG)" },
      { id: "puzzle", slug: "puzzle", name: "Puzzle" },
      { id: "indie", slug: "indie", name: "Indie" },
      { id: "platform", slug: "platform", name: "Platform" },
    ];

    expect(selectPopularGenres(genres).map((genre) => genre.name)).toEqual([
      "Horror",
      "Action",
      "Adventure",
      "Shooter",
      "Survival",
      "Role-playing (RPG)",
      "Puzzle",
      "Indie",
      "Platform",
      "Strategy",
    ]);
  });

  it("shows well-known gaming platforms in curated order", () => {
    const platforms = [
      { id: "pc", slug: "pc", name: "PC (Microsoft Windows)" },
      { id: "ps5", slug: "ps5", name: "PlayStation 5" },
      { id: "series", slug: "series-x-s", name: "Xbox Series X|S" },
      { id: "switch2", slug: "switch-2", name: "Nintendo Switch 2" },
      { id: "ps4", slug: "ps4", name: "PlayStation 4" },
      { id: "xboxone", slug: "xbox-one", name: "Xbox One" },
      { id: "switch", slug: "switch", name: "Nintendo Switch" },
      { id: "ps3", slug: "ps3", name: "PlayStation 3" },
      { id: "xbox360", slug: "xbox360", name: "Xbox 360" },
      { id: "ps2", slug: "ps2", name: "PlayStation 2" },
      { id: "obscure", slug: "obscure-console", name: "Obscure Console" },
    ];

    expect(selectPopularPlatforms(platforms).map((platform) => platform.name)).toEqual([
      "PC (Microsoft Windows)",
      "PlayStation 5",
      "Xbox Series X|S",
      "Nintendo Switch 2",
      "PlayStation 4",
      "Xbox One",
      "Nintendo Switch",
      "PlayStation 3",
      "Xbox 360",
      "PlayStation 2",
    ]);
  });

  it("keeps all browse filters while placing popular items first", () => {
    const items = [
      { id: "obscure", name: "Obscure" },
      { id: "action", name: "Action" },
      { id: "adventure", name: "Adventure" },
    ];
    const popular = [items[2], items[1]];

    expect(prioritizePopularItems(items, popular).map((item) => item.name)).toEqual([
      "Adventure",
      "Action",
      "Obscure",
    ]);
  });
});
