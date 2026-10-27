import { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext({ theme: "fog", setTheme: () => {}, toggleTheme: () => {} });

const KEY = "nightfall:theme";

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === "undefined") return "fog";
    return localStorage.getItem(KEY) || "fog";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const setTheme = useCallback((t) => setThemeState(t === "blood" ? "blood" : "fog"), []);
  const toggleTheme = useCallback(
    () => setThemeState((t) => (t === "fog" ? "blood" : "fog")),
    []
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
