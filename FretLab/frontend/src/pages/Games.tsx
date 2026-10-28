import { ArrowRight, Gamepad2, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

export default function Games() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 caret-transparent">
      <section className="fl-rise">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Practice by playing</p>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight sm:text-4xl">Games</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Build your musical ear with quick, interactive challenges. More games are on the way.
        </p>
      </section>

      <Link
        to="/games/chord-guess"
        data-testid="game-card-chord-guess"
        className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Card className="transition-[border-color,background-color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/50 group-hover:bg-secondary/60">
          <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex items-start gap-4">
              <span className="rounded-2xl border border-primary/30 bg-primary/10 p-3 text-primary">
                <Headphones className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Ear training</p>
                <h2 className="mt-1 font-heading text-2xl font-bold">Chord Guess</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  Choose a chord group, listen to each sound, and identify chords from open shapes to sevenths and beyond.
                </p>
              </div>
            </div>
            <span className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity group-hover:opacity-90">
              Play game
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </CardContent>
        </Card>
      </Link>

      <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        <Gamepad2 className="h-4 w-4" aria-hidden="true" />
        Currently available: 1 game
      </p>
    </div>
  );
}
