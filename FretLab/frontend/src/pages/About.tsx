import { Code2, ExternalLink, Gamepad2, Guitar, Headphones, Waves } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Headphones,
    title: "Microphone Tuning",
    description: "Use your microphone to tune your guitar, or play reference notes for ear training.",
  },
  {
    icon: Waves,
    title: "Explore harmony",
    description: "Hear chords in the Circle of Fifths and browse scales across the fretboard.",
  },
  {
    icon: Guitar,
    title: "Practice your way",
    description: "Use the metronome and explore chord voicings with clear guitar diagrams.",
  },
  {
    icon: Gamepad2,
    title: "Games",
    description: "Practice your musical ear with Chord Guess levels covering open chords, power chords, sevenths, and more.",
  },
];

const STACK = ["React 18", "TypeScript", "Vite", "Tailwind CSS", "Web Audio API"];

export default function About() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <section className="fl-rise">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">About the project</p>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight sm:text-4xl">About FretLab</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
          FretLab is a browser-based toolkit for guitar practice and musical exploration. It brings a chromatic tuner,
          metronome, Circle of Fifths, scale library, and playable chord library together in one place.
        </p>
      </section>

      <section aria-label="FretLab features" className="grid gap-3 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="fl-rise fl-rise-1">
            <CardContent className="flex items-start gap-4 p-4 sm:p-5">
              <span className="rounded-xl border border-primary/30 bg-primary/10 p-2.5 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-heading text-lg font-semibold">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Built with</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {STACK.map((item) => (
                <li key={item} className="rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium">
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Project links</h2>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <a
                href="https://github.com/rohanbishtofficial04-tech/Resume-Projects/tree/main/FretLab"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-foreground transition-colors hover:text-primary"
              >
                <Code2 className="h-4 w-4" aria-hidden="true" />
                GitHub repository
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
