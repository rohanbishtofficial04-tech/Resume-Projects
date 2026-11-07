import axios from "axios";

const configuredBackendUrl = (process.env.REACT_APP_BACKEND_URL || "").trim().replace(/\/+$/, "");
const backendUrl = (() => {
  if (!configuredBackendUrl || typeof window === "undefined") return configuredBackendUrl;

  try {
    const url = new URL(configuredBackendUrl);
    const localHosts = ["localhost", "127.0.0.1", "::1"];
    if (localHosts.includes(url.hostname) && !localHosts.includes(window.location.hostname)) {
      url.hostname = window.location.hostname;
    }
    return url.toString().replace(/\/+$/, "");
  } catch {
    return configuredBackendUrl;
  }
})();
const API_BASE = `${backendUrl}/api`;

const request = async (path, params) => {
  if (!backendUrl) {
    throw new Error("REACT_APP_BACKEND_URL is not configured.");
  }
  const { data } = await axios.get(`${API_BASE}${path}`, { params, timeout: 15000 });
  return data;
};

const dateEra = (release) => Math.floor(Number(String(release || "").slice(0, 4)) / 5);

const rankRelated = (games, game) => {
  const genreIds = new Set((game?.genres || []).map((item) => item.slug || item.name));
  const platformIds = new Set((game?.parent_platforms || game?.platforms || []).map((item) =>
    item.platform?.id ?? item.platform?.slug ?? item.id
  ).filter(Boolean));
  const targetEra = dateEra(game?.released);

  return [...games]
    .filter((item) => item.id !== game?.id && item.slug !== game?.slug)
    .map((item, index) => {
      const genres = (item.genres || []).map((genre) => genre.slug || genre.name);
      const platforms = (item.parent_platforms || item.platforms || []).map((entry) =>
        entry.platform?.id ?? entry.platform?.slug ?? entry.id
      ).filter(Boolean);
      const genreScore = genres.filter((genre) => genreIds.has(genre)).length;
      const platformScore = platforms.filter((platform) => platformIds.has(platform)).length;
      const eraScore = targetEra && dateEra(item.released) === targetEra ? 1 : 0;
      return {
        item,
        score: genreScore * 10 + platformScore * 3 + eraScore,
        index,
      };
    })
    .sort((a, b) =>
      b.score - a.score ||
      Number(b.item.rating || 0) - Number(a.item.rating || 0) ||
      a.index - b.index
    )
    .map(({ item }) => item);
};

export const getTrending = (params = {}) => request("/games/trending", params);
export const getTrendingHorror = () => request("/games/trending-horror");
export const getTopRated = (params = {}) => request("/games/top-rated", params);
export const getTopNightmares = () => request("/games/top-nightmares");
export const getRecent = (params = {}) => request("/games/recent", params);
export const getUpcoming = (params = {}) => request("/games/upcoming", params);
export const getFeaturedGames = () => request("/games/featured");
export const getSearch = (params = {}) => request("/games/search", params);
export const getBrowse = (params = {}) => request("/games/browse", params);
export const getDetails = (slug) => request(`/games/${encodeURIComponent(slug)}`);
export const getScreenshots = (slug) =>
  request(`/games/${encodeURIComponent(slug)}/screenshots`);
export const getMovies = (slug) =>
  request(`/games/${encodeURIComponent(slug)}/movies`);
export const getRelated = async (slug, game) => {
  const data = await request(`/games/${encodeURIComponent(slug)}/related`);
  return { ...data, results: rankRelated(data?.results || [], game).slice(0, 8) };
};
export const getSeries = (slug) => request(`/games/${encodeURIComponent(slug)}/series`);
export const getGenres = () => request("/genres");
export const getPlatforms = () => request("/platforms");
