import { ArrowDown, ArrowRight, AudioLines, CircleDot, Gamepad2, Gauge, Guitar, Library, Music2, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const TOOLS = [
  {
    to: "/tuner",
    label: "Tuner",
    description: "Tune by microphone or use a reference tone for your strings.",
    icon: Gauge,
    testId: "home-tool-tuner",
  },
  {
    to: "/metronome",
    label: "Metronome",
    description: "Set a steady pulse and shape your practice tempo.",
    icon: Timer,
    testId: "home-tool-metronome",
  },
  {
    to: "/circle-of-fifths",
    label: "Circle of Fifths",
    description: "Explore keys, modes, and chords you can hear.",
    icon: CircleDot,
    testId: "home-tool-circle",
  },
  {
    to: "/scales",
    label: "Scale Library",
    description: "Find scale patterns and see them across the fretboard.",
    icon: Music2,
    testId: "home-tool-scales",
  },
  {
    to: "/chords",
    label: "Chord Library",
    description: "Discover chord shapes, voicings, and chord sounds.",
    icon: Library,
    testId: "home-tool-chords",
  },
  {
    to: "/games",
    label: "Games",
    description: "Train your ear with quick musical challenges.",
    icon: Gamepad2,
    testId: "home-tool-games",
  },
];

const STRINGS = ["E", "A", "D", "G", "B", "E"];
const FRETS = [0, 1, 2, 3, 4, 5];

export default function Home() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 sm:gap-16">
      <section
        data-testid="home-hero"
        className="fl-rise relative isolate overflow-hidden rounded-3xl border border-border bg-card"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at 82% 45%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 48%)",
          }}
        />
        <div className="grid items-center gap-8 p-6 sm:p-10 md:grid-cols-[1.1fr_0.9fr] md:gap-10 lg:p-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              <AudioLines className="h-3.5 w-3.5" aria-hidden="true" />
              Your guitar practice toolkit
            </p>
            <h1 className="mt-5 max-w-xl font-heading text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Make every note <span className="text-primary">count.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              Tune up, find your rhythm, and explore chords and scales — all in one place, right in your browser.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/tuner"
                data-testid="home-start-tuning"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-[transform,opacity] hover:opacity-90 active:scale-[0.98]"
              >
                Start tuning
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="#practice-tools"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background/70 px-5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Explore tools
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              No account needed. Your preferences stay on this device.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-[2rem] bg-primary/5 blur-2xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-2xl border border-border bg-background/80 p-4 shadow-2xl sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Fretboard</p>
                  <p className="mt-1 font-heading text-lg font-semibold">Find your next note</p>
                </div>
                <Guitar className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <svg
                viewBox="0 0 360 224"
                role="img"
                aria-label="Illustration of guitar strings and fret markers"
                className="mt-5 h-auto w-full overflow-visible"
              >
                <rect x="34" y="24" width="298" height="174" rx="12" fill="var(--surface-raised)" stroke="var(--border)" />
                {FRETS.map((fret, index) => {
                  const x = 48 + index * 54;
                  return (
                    <g key={fret}>
                      <line
                        x1={x}
                        y1="30"
                        x2={x}
                        y2="192"
                        stroke={index === 0 ? "var(--primary)" : "var(--fret-wire)"}
                        strokeWidth={index === 0 ? 3 : 1.5}
                      />
                      {index < FRETS.length - 1 && (
                        <circle
                          cx={x + 27}
                          cy="110"
                          r="4"
                          fill="var(--primary)"
                          opacity={index === 2 || index === 4 ? 0.9 : 0.25}
                        />
                      )}
                    </g>
                  );
                })}
                {STRINGS.map((string, index) => {
                  const y = 52 + index * 26;
                  const noteX = [102, 156, 210, 156, 264, 210][index];
                  const noteY = [y, y, y, y, y, y][index];
                  return (
                    <g key={`${string}-${index}`}>
                      <line
                        x1="36"
                        y1={y}
                        x2="330"
                        y2={y}
                        stroke="var(--string-line)"
                        strokeWidth={1 + index * 0.28}
                      />
                      <text
                        x="18"
                        y={y + 4}
                        textAnchor="middle"
                        fontSize="11"
                        fontFamily="monospace"
                        fill="var(--muted-foreground)"
                      >
                        {string}
                      </text>
                      <circle cx={noteX} cy={noteY} r="10" fill="var(--primary)" />
                      <circle cx={noteX} cy={noteY} r="3" fill="var(--primary-foreground)" />
                    </g>
                  );
                })}
              </svg>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <span>Listen</span>
                <span className="h-px flex-1 mx-3 bg-border" />
                <span>Learn</span>
                <span className="h-px flex-1 mx-3 bg-border" />
                <span>Play</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="practice-tools" aria-labelledby="practice-tools-heading" className="scroll-mt-28">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Pick up where you are</p>
            <h2 id="practice-tools-heading" className="mt-1 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Tools for your next session
            </h2>
          </div>
          <p className="max-w-sm text-xs leading-5 text-muted-foreground sm:text-right">
            From getting in tune to exploring a new progression, start with what you need.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map(({ to, label, description, icon: Icon, testId }) => (
            <Link
              key={to}
              to={to}
              data-testid={testId}
              className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="h-full transition-[border-color,background-color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/50 group-hover:bg-secondary/60">
                <CardContent className="flex h-full items-start gap-4 p-4 sm:p-5">
                  <span className="rounded-xl border border-primary/25 bg-primary/10 p-2.5 text-primary transition-colors group-hover:bg-primary/15">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center justify-between gap-2 font-heading text-lg font-semibold">
                      {label}
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">{description}</span>
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
