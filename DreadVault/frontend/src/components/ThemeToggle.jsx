import { useTheme } from "@/context/ThemeContext";
import { TID } from "@/constants/testIds";
import { Cloud, Droplet, Sparkles } from "lucide-react";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = { fog: "Blood", blood: "Eldritch", eldritch: "Fog" }[theme] || "Blood";
  const themeName = theme.charAt(0).toUpperCase() + theme.slice(1);
  return (
    <button
      data-testid={TID.themeToggle}
      onClick={toggleTheme}
      className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-[color:var(--nf-border)] hover:border-[color:var(--nf-accent)] transition-colors"
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Theme: ${themeName} — click to switch`}
    >
      {theme === "blood" ? (
        <Droplet className="h-3.5 w-3.5 text-[color:var(--nf-accent)]" strokeWidth={1.6} />
      ) : theme === "eldritch" ? (
        <Sparkles className="h-3.5 w-3.5 text-[color:var(--nf-accent)]" strokeWidth={1.6} />
      ) : (
        <Cloud className="h-3.5 w-3.5 text-[color:var(--nf-accent)]" strokeWidth={1.6} />
      )}
      <span className="font-brand text-[10px] tracking-[0.2em]">{themeName}</span>
    </button>
  );
};
