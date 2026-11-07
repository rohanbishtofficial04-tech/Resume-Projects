import { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext({ theme: "fog", setTheme: () => {}, toggleTheme: () => {} });

const KEY = "nightfall:theme";
const THEMES = ["fog", "blood", "eldritch"];

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === "undefined") return "fog";
    const savedTheme = localStorage.getItem(KEY);
    return THEMES.includes(savedTheme) ? savedTheme : "fog";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const setTheme = useCallback((t) => {
    setThemeState(THEMES.includes(t) ? t : "fog");
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
