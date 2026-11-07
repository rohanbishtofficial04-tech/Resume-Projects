import { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext({ theme: "fog", setTheme: () => {}, toggleTheme: () => {} });

const KEY = "nightfall:theme";
const THEMES = ["fog", "blood", "eldritch"];

const getDefaultTheme = () => {
  if (typeof window === "undefined") return "fog";
  const isMobile = window.matchMedia
    ? window.matchMedia("(max-width: 767px)").matches
    : window.innerWidth < 768;
  return isMobile ? "blood" : "fog";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const defaultTheme = getDefaultTheme();
    if (typeof window === "undefined") return defaultTheme;
    const savedTheme = localStorage.getItem(KEY);
    return THEMES.includes(savedTheme) ? savedTheme : defaultTheme;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const setTheme = useCallback((t) => {
    setThemeState(THEMES.includes(t) ? t : getDefaultTheme());
  }, []);
  const toggleTheme = useCallback(
    () => setThemeState((t) => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length]),
    []
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
