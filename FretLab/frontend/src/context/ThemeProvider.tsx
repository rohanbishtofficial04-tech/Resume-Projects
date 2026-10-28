import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { STORAGE_KEYS, readJSON, writeJSON } from "@/lib/storage";

export type ThemeId = "midnight" | "studio" | "amethyst";

export const THEMES: { id: ThemeId; name: string; description: string; swatch: string }[] = [
  { id: "midnight", name: "Midnight", description: "Charcoal + amber", swatch: "#F59E0B" },
  { id: "studio", name: "Studio", description: "Dark gray + lime", swatch: "#84CC16" },
  { id: "amethyst", name: "Amethyst", description: "Deep violet + lavender", swatch: "#A78BFA" },
];

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function initialTheme(): ThemeId {
  const stored = readJSON<string>(STORAGE_KEYS.theme, "midnight");
  return THEMES.find(({ id }) => id === stored)?.id ?? "midnight";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(initialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.dataset.theme = theme;
    writeJSON(STORAGE_KEYS.theme, theme);
  }, [theme]);

  const setTheme = useCallback((next: ThemeId) => setThemeState(next), []);
  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
