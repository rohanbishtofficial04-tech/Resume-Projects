jest.mock("axios", () => ({ get: jest.fn() }));

describe("games API facade", () => {
  const originalBackendUrl = process.env.REACT_APP_BACKEND_URL;

  afterEach(() => {
    if (originalBackendUrl === undefined) delete process.env.REACT_APP_BACKEND_URL;
    else process.env.REACT_APP_BACKEND_URL = originalBackendUrl;
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("requests game lists from the configured Express backend", async () => {
    process.env.REACT_APP_BACKEND_URL = "https://api.example.test/";
    jest.resetModules();
    const { getTrending } = require("./games");
    const axios = require("axios");
    axios.get.mockResolvedValue({ data: { count: 0, results: [] } });

    await expect(getTrending({ page: 2 })).resolves.toEqual({ count: 0, results: [] });
    expect(axios.get).toHaveBeenCalledWith(
      "https://api.example.test/api/games/trending",
      { params: { page: 2 }, timeout: 15000 }
    );
  });

  it("requests curated carousel games from the backend", async () => {
    process.env.REACT_APP_BACKEND_URL = "https://api.example.test";
    jest.resetModules();
    const { getFeaturedGames } = require("./games");
    const axios = require("axios");
    axios.get.mockResolvedValue({ data: { count: 6, results: [] } });

    await expect(getFeaturedGames()).resolves.toMatchObject({ count: 6 });
    expect(axios.get).toHaveBeenCalledWith(
      "https://api.example.test/api/games/featured",
      { params: undefined, timeout: 15000 }
    );
  });

  it("requests curated trending horror games from the backend", async () => {
    process.env.REACT_APP_BACKEND_URL = "https://api.example.test";
    jest.resetModules();
    const { getTrendingHorror } = require("./games");
    const axios = require("axios");
    axios.get.mockResolvedValue({ data: { count: 12, results: [] } });

    await expect(getTrendingHorror()).resolves.toMatchObject({ count: 12 });
    expect(axios.get).toHaveBeenCalledWith(
      "https://api.example.test/api/games/trending-horror",
      { params: undefined, timeout: 15000 }
    );
  });

  it("requests the curated top nightmare games from the backend", async () => {
    process.env.REACT_APP_BACKEND_URL = "https://api.example.test";
    jest.resetModules();
    const { getTopNightmares } = require("./games");
    const axios = require("axios");
    axios.get.mockResolvedValue({ data: { count: 10, results: [] } });

    await expect(getTopNightmares()).resolves.toMatchObject({ count: 10 });
    expect(axios.get).toHaveBeenCalledWith(
      "https://api.example.test/api/games/top-nightmares",
      { params: undefined, timeout: 15000 }
    );
  });

  it("encodes game slugs and forwards search terms", async () => {
    process.env.REACT_APP_BACKEND_URL = "https://api.example.test";
    jest.resetModules();
    const { getDetails, getSearch } = require("./games");
    const axios = require("axios");
    axios.get.mockResolvedValue({ data: { results: [] } });

    await getDetails("silent hill/2");
    await getSearch({ query: "Silent Hill", page_size: 12 });
    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      "https://api.example.test/api/games/silent%20hill%2F2",
      { params: undefined, timeout: 15000 }
    );
    expect(axios.get).toHaveBeenNthCalledWith(
      2,
      "https://api.example.test/api/games/search",
      { params: { query: "Silent Hill", page_size: 12 }, timeout: 15000 }
    );
  });

  it("requests a game's series timeline from the backend", async () => {
    process.env.REACT_APP_BACKEND_URL = "https://api.example.test";
    jest.resetModules();
    const { getSeries } = require("./games");
    const axios = require("axios");
    axios.get.mockResolvedValue({ data: { count: 1, results: [] } });

    await expect(getSeries("outlast-ii")).resolves.toMatchObject({ count: 1 });
    expect(axios.get).toHaveBeenCalledWith(
      "https://api.example.test/api/games/outlast-ii/series",
      { params: undefined, timeout: 15000 }
    );
  });

  it("does not return demo data when the backend URL is unset", async () => {
    process.env.REACT_APP_BACKEND_URL = "";
    jest.resetModules();
    const { getTrending } = require("./games");
    const axios = require("axios");

    await expect(getTrending()).rejects.toThrow("REACT_APP_BACKEND_URL is not configured.");
    expect(axios.get).not.toHaveBeenCalled();
  });
});
