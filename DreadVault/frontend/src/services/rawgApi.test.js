jest.mock("axios", () => {
  const mockClient = {
    interceptors: { request: { use: jest.fn() } },
    get: jest.fn(),
  };
  return { create: jest.fn(() => mockClient), mockClient };
});

describe("RAWG response cache", () => {
  let axios;
  let rawgApi;

  beforeEach(() => {
    jest.resetModules();
    axios = require("axios");
    axios.mockClient.get.mockReset();
    axios.mockClient.get.mockResolvedValue({ data: { results: [] } });
    rawgApi = require("./rawgApi");
  });

  it("reuses a cached response for an identical request", async () => {
    const first = await rawgApi.fetchTrending({ page_size: 2 });
    const second = await rawgApi.fetchTrending({ page_size: 2 });

    expect(axios.mockClient.get).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
  });

  it("shares an in-flight request between identical calls", async () => {
    let resolveRequest;
    axios.mockClient.get.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );

    const firstRequest = rawgApi.fetchGenres();
    const secondRequest = rawgApi.fetchGenres();

    expect(axios.mockClient.get).toHaveBeenCalledTimes(1);
    resolveRequest({ data: { results: [{ id: 1 }] } });

    const [first, second] = await Promise.all([firstRequest, secondRequest]);
    expect(second).toBe(first);
  });

  it("does not cache failed requests", async () => {
    const requestError = new Error("Network error");
    axios.mockClient.get
      .mockRejectedValueOnce(requestError)
      .mockResolvedValueOnce({ data: { results: [{ id: 1 }] } });

    await expect(rawgApi.fetchTrending()).rejects.toBe(requestError);
    await expect(rawgApi.fetchTrending()).resolves.toEqual({ results: [{ id: 1 }] });

    expect(axios.mockClient.get).toHaveBeenCalledTimes(2);
  });
});
