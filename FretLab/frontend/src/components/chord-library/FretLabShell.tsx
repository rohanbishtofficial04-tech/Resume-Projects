import { NavLink, Outlet } from "react-router-dom";
import { Gauge, Timer, Library, Music2, CircleDot, Palette } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { THEMES, useTheme } from "@/context/ThemeProvider";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/tuner", label: "Tuner", icon: Gauge, testId: "app-nav-tuner" },
  { to: "/metronome", label: "Metronome", icon: Timer, testId: "app-nav-metronome" },
  { to: "/circle-of-fifths", label: "Circle of Fifths", icon: CircleDot, testId: "app-nav-circle" },
  { to: "/scales", label: "Scale Library", icon: Music2, testId: "app-nav-scales" },
  { to: "/chords", label: "Chord Library", icon: Library, testId: "app-nav-chords" },
];

function BrandMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <rect x="2" y="6" width="28" height="20" rx="4" fill="var(--surface-raised)" stroke="var(--border)" />
      {[9, 14, 19, 24].map((y) => (
        <line key={y} x1="5" y1={y} x2="27" y2={y} stroke="var(--fret-wire)" strokeWidth="1" />
      ))}
      {[8, 12.4, 16.8, 21.2, 25.6].map((x, i) => (
        <line key={x} x1={x} y1="6" x2={x} y2="26" stroke="var(--primary)" strokeWidth={i === 0 || i === 4 ? 1.6 : 1} opacity="0.9" />
      ))}
      <circle cx="12.4" cy="11.5" r="1.6" fill="var(--primary)" />
    </svg>
  );
}

export default function FretLabShell() {
  const { theme, setTheme } = useTheme();
  const activeTheme = THEMES.find((option) => option.id === theme) ?? THEMES[0];
  const nextTheme = THEMES[(THEMES.findIndex((option) => option.id === theme) + 1) % THEMES.length];

  return (
    <div className="relative flex min-h-svh flex-col bg-background text-foreground">
      <div aria-hidden="true" className="fl-fret-motif pointer-events-none fixed inset-0 opacity-30" />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-80"
        style={{
          background:
            "radial-gradient(ellipse at top, color-mix(in oklab, var(--primary) 15%, transparent), transparent 68%)",
        }}
      />

      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
          <NavLink
            to="/tuner"
            data-testid="app-brand"
            className="flex items-center gap-2.5 transition-transform duration-150 hover:scale-[1.02]"
          >
            <BrandMark />
            <span className="flex flex-col leading-none">
              <span className="font-heading text-lg font-bold tracking-tight">FretLab</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Guitar Utility
              </span>
            </span>
          </NavLink>

          <nav
            aria-label="FretLab features"
            className="fretlab-nav-scroll order-3 flex w-full items-center gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 sm:order-none sm:ml-4 sm:w-auto"
          >
            {NAV_ITEMS.map(({ to, label, icon: Icon, testId }) => (
              <NavLink
                key={to}
                to={to}
                data-testid={testId}
                className={({ isActive }) =>
                  cn(
                    "flex flex-none items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )
                }
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:flex">
              <Palette className="h-3.5 w-3.5" />
              Theme
            </span>
            <button
              type="button"
              data-testid="theme-toggle"
              aria-label={`Switch to ${nextTheme.name} theme`}
              title={`Switch to ${nextTheme.name} theme — ${nextTheme.description}`}
              onClick={() => setTheme(nextTheme.id)}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold transition-colors duration-150 hover:bg-secondary"
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: activeTheme.swatch, boxShadow: `0 0 10px ${activeTheme.swatch}` }}
              />
              <span>{activeTheme.name}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <Outlet />
      </main>

      <footer className="relative z-10 border-t border-border px-4 py-5 sm:px-6">
        <p className="mx-auto max-w-6xl text-xs text-muted-foreground">
          FretLab runs entirely in your browser — microphone audio and preferences stay on this device.
        </p>
      </footer>

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
