// One provider that owns everything persisted to localStorage:
// favorites, recently viewed, and user-made collections.
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

const LibraryContext = createContext(null);

const KEYS = {
  favorites: "nightfall:favorites",
  recent: "nightfall:recent",
  collections: "nightfall:collections",
};

const readJSON = (k, fallback) => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

// Slim a game down to only what we need to render cards & lists.
export const compactGame = (g) => ({
  id: g.id,
  slug: g.slug,
  name: g.name,
  released: g.released,
  rating: g.rating,
  metacritic: g.metacritic,
  background_image: g.background_image,
  genres: (g.genres || []).slice(0, 3).map((x) => ({ id: x.id, name: x.name, slug: x.slug })),
  parent_platforms: (g.parent_platforms || g.platforms || []).slice(0, 5).map((p) => ({
    platform: {
      id: p.platform?.id ?? p.id,
      name: p.platform?.name ?? p.name,
      slug: p.platform?.slug ?? p.slug,
    },
  })),
});

export const LibraryProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => readJSON(KEYS.favorites, []));
  const [recent, setRecent] = useState(() => readJSON(KEYS.recent, []));
  const [collections, setCollections] = useState(() => readJSON(KEYS.collections, []));

  useEffect(() => localStorage.setItem(KEYS.favorites, JSON.stringify(favorites)), [favorites]);
  useEffect(() => localStorage.setItem(KEYS.recent, JSON.stringify(recent)), [recent]);
  useEffect(() => localStorage.setItem(KEYS.collections, JSON.stringify(collections)), [collections]);

  const isFavorite = useCallback((id) => favorites.some((g) => g.id === id), [favorites]);

  const toggleFavorite = useCallback((game) => {
    setFavorites((prev) => {
      if (prev.some((g) => g.id === game.id)) return prev.filter((g) => g.id !== game.id);
      return [compactGame(game), ...prev];
    });
  }, []);

  const removeFavorite = useCallback((id) => {
    setFavorites((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const trackRecent = useCallback((game) => {
    setRecent((prev) => {
      const trimmed = prev.filter((g) => g.id !== game.id);
      return [compactGame(game), ...trimmed].slice(0, 12);
    });
  }, []);

  const clearRecent = useCallback(() => setRecent([]), []);

  const createCollection = useCallback((name) => {
    if (!name?.trim()) return null;
    const c = { id: `${Date.now()}`, name: name.trim(), games: [] };
    setCollections((prev) => [c, ...prev]);
    return c;
  }, []);

  const deleteCollection = useCallback((id) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const renameCollection = useCallback((id, name) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: name.trim() || c.name } : c))
    );
  }, []);

  const addToCollection = useCallback((id, game) => {
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.games.some((g) => g.id === game.id)) return c;
        return { ...c, games: [compactGame(game), ...c.games] };
      })
    );
  }, []);

  const removeFromCollection = useCallback((id, gameId) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, games: c.games.filter((g) => g.id !== gameId) } : c))
    );
  }, []);

  const value = useMemo(
    () => ({
      favorites,
      recent,
      collections,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      trackRecent,
      clearRecent,
      createCollection,
      deleteCollection,
      renameCollection,
      addToCollection,
      removeFromCollection,
    }),
    [
      favorites,
      recent,
      collections,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      trackRecent,
      clearRecent,
      createCollection,
      deleteCollection,
      renameCollection,
      addToCollection,
      removeFromCollection,
    ]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

export const useLibrary = () => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used inside LibraryProvider");
  return ctx;
};
