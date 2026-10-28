import { useState } from "react";
import { ArrowLeft, Check, CircleHelp, Headphones, RotateCcw, Volume2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { chordToneFrequencies } from "@/lib/chords";
import { playStrum, stopAllTones } from "@/lib/audio/tones";
import { usePersistentState } from "@/hooks/usePersistentState";
import { STORAGE_KEYS } from "@/lib/storage";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

interface ChordChoice {
  label: string;
  rootPc: number;
  qualityId: string;
}

interface ChordLevel {
  id: string;
  title: string;
  difficulty: Difficulty;
  chords: ChordChoice[];
}

interface Round {
  answer: ChordChoice;
  choices: ChordChoice[];
}

const CHORD_LEVELS: ChordLevel[] = [
  {
    id: "open-major",
    title: "Open Major",
    difficulty: "Beginner",
    chords: [
      { label: "G", rootPc: 7, qualityId: "maj" },
      { label: "D", rootPc: 2, qualityId: "maj" },
      { label: "C", rootPc: 0, qualityId: "maj" },
      { label: "A", rootPc: 9, qualityId: "maj" },
      { label: "E", rootPc: 4, qualityId: "maj" },
    ],
  },
  {
    id: "open-minor",
    title: "Open Minor",
    difficulty: "Beginner",
    chords: [
      { label: "Em", rootPc: 4, qualityId: "min" },
      { label: "Am", rootPc: 9, qualityId: "min" },
      { label: "Dm", rootPc: 2, qualityId: "min" },
      { label: "Bm", rootPc: 11, qualityId: "min" },
    ],
  },
  {
    id: "power-chords",
    title: "Power Chords",
    difficulty: "Beginner",
    chords: [
      { label: "G5", rootPc: 7, qualityId: "power" },
      { label: "D5", rootPc: 2, qualityId: "power" },
      { label: "E5", rootPc: 4, qualityId: "power" },
      { label: "C5", rootPc: 0, qualityId: "power" },
      { label: "A5", rootPc: 9, qualityId: "power" },
    ],
  },
  {
    id: "seventh",
    title: "Seventh",
    difficulty: "Intermediate",
    chords: [
      { label: "G7", rootPc: 7, qualityId: "7" },
      { label: "A7", rootPc: 9, qualityId: "7" },
      { label: "E7", rootPc: 4, qualityId: "7" },
      { label: "D7", rootPc: 2, qualityId: "7" },
      { label: "B7", rootPc: 11, qualityId: "7" },
    ],
  },
  {
    id: "major-7th",
    title: "Major 7th",
    difficulty: "Intermediate",
    chords: [
      { label: "Cmaj7", rootPc: 0, qualityId: "maj7" },
      { label: "Fmaj7", rootPc: 5, qualityId: "maj7" },
      { label: "Amaj7", rootPc: 9, qualityId: "maj7" },
      { label: "Dmaj7", rootPc: 2, qualityId: "maj7" },
      { label: "Gmaj7", rootPc: 7, qualityId: "maj7" },
    ],
  },
  {
    id: "minor-7th",
    title: "Minor 7th",
    difficulty: "Intermediate",
    chords: [
      { label: "Am7", rootPc: 9, qualityId: "min7" },
      { label: "Em7", rootPc: 4, qualityId: "min7" },
      { label: "Dm7", rootPc: 2, qualityId: "min7" },
      { label: "Bm7", rootPc: 11, qualityId: "min7" },
      { label: "Cm7", rootPc: 0, qualityId: "min7" },
    ],
  },
  {
    id: "sus-add",
    title: "Sus & Add",
    difficulty: "Intermediate",
    chords: [
      { label: "Dsus4", rootPc: 2, qualityId: "sus4" },
      { label: "Asus2", rootPc: 9, qualityId: "sus2" },
      { label: "Cadd9", rootPc: 0, qualityId: "add9" },
      { label: "Dsus2", rootPc: 2, qualityId: "sus2" },
      { label: "Gsus4", rootPc: 7, qualityId: "sus4" },
    ],
  },
  {
    id: "barre-major",
    title: "Barre Major",
    difficulty: "Advanced",
    chords: [
      { label: "F", rootPc: 5, qualityId: "maj" },
      { label: "Bb", rootPc: 10, qualityId: "maj" },
      { label: "B", rootPc: 11, qualityId: "maj" },
      { label: "C", rootPc: 0, qualityId: "maj" },
      { label: "D", rootPc: 2, qualityId: "maj" },
    ],
  },
  {
    id: "mixed",
    title: "Mixed",
    difficulty: "Intermediate",
    chords: [
      { label: "G", rootPc: 7, qualityId: "maj" },
      { label: "Am", rootPc: 9, qualityId: "min" },
      { label: "F", rootPc: 5, qualityId: "maj" },
      { label: "C", rootPc: 0, qualityId: "maj" },
      { label: "Dm", rootPc: 2, qualityId: "min" },
      { label: "E7", rootPc: 4, qualityId: "7" },
      { label: "A", rootPc: 9, qualityId: "maj" },
      { label: "Em", rootPc: 4, qualityId: "min" },
    ],
  },
];

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function makeRound(level: ChordLevel): Round {
  const answer = level.chords[Math.floor(Math.random() * level.chords.length)];
  return { answer, choices: shuffle(level.chords) };
}

function choiceLabel(choice: ChordChoice): string {
  return choice.label;
}

export default function ChordGuess() {
  const [activeLevel, setActiveLevel] = useState<ChordLevel | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [selected, setSelected] = useState<ChordChoice | null>(null);
  const [score, setScore] = useState({ correct: 0, answered: 0 });
  const [highScores, setHighScores] = usePersistentState<Record<string, number>>(
    STORAGE_KEYS.chordGuessHighScores,
    {},
  );

  const playAnswer = (answer: ChordChoice) => {
    const frequencies = chordToneFrequencies(answer);
    stopAllTones();
    playStrum(frequencies);
  };

  const startRound = () => {
    if (!activeLevel) return;
    const nextRound = makeRound(activeLevel);
    setRound(nextRound);
    setSelected(null);
    playAnswer(nextRound.answer);
  };

  const startLevel = (level: ChordLevel) => {
    setActiveLevel(level);
    setScore({ correct: 0, answered: 0 });
    const nextRound = makeRound(level);
    setRound(nextRound);
    setSelected(null);
    playAnswer(nextRound.answer);
  };

  const chooseLevel = () => {
    setActiveLevel(null);
    setRound(null);
    setSelected(null);
    setScore({ correct: 0, answered: 0 });
    stopAllTones();
  };

  const answerRound = (choice: ChordChoice) => {
    if (!round || selected) return;
    setSelected(choice);
    const correct = choice.label === round.answer.label;
    const nextCorrect = score.correct + Number(correct);
    setScore({ correct: nextCorrect, answered: score.answered + 1 });
    if (activeLevel) {
      setHighScores((previous) => ({
        ...previous,
        [activeLevel.id]: Math.max(previous[activeLevel.id] ?? 0, nextCorrect),
      }));
    }
  };

  const resetGame = () => {
    setRound(null);
    setSelected(null);
    setScore({ correct: 0, answered: 0 });
    stopAllTones();
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        to="/games"
        className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All games
      </Link>

      {!activeLevel ? (
        <section className="mx-auto w-full max-w-2xl">
          <div className="mb-5 text-center">
            <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">Choose a Level</h1>
            <p className="mt-3 text-sm text-muted-foreground">From sound</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CHORD_LEVELS.map((level) => (
              <button
                key={level.id}
                type="button"
                data-testid={`chord-guess-level-${level.id}`}
                onClick={() => startLevel(level)}
                className="min-h-[94px] rounded-2xl border border-transparent bg-secondary px-4 py-4 text-center transition-[background-color,border-color,transform] hover:border-primary/40 hover:bg-primary/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="font-heading text-base font-bold">{level.title}</span>
                  <span className="rounded-full border border-border bg-background/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    {level.difficulty}
                  </span>
                </span>
                <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                  {level.chords.map(choiceLabel).join(", ")}
                </span>
                <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                  Best: {highScores[level.id] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <>
          <section className="fl-rise">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Ear training · {activeLevel.difficulty}</p>
            <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight sm:text-4xl">{activeLevel.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Listen to the chord, then choose its name. Replay the sound as often as you need.
            </p>
          </section>

          <Card>
            <CardContent className="flex flex-col gap-5 p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/70 p-3 sm:p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Your score</p>
                  <p data-testid="chord-guess-score" className="mt-1 font-mono text-lg font-bold">
                    {score.correct} <span className="text-sm font-medium text-muted-foreground">/ {score.answered}</span>
                  </p>
                  <p data-testid="chord-guess-high-score" className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                    Best: {highScores[activeLevel.id] ?? 0}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" disabled={!round} onClick={() => round && playAnswer(round.answer)}>
                    <Volume2 className="h-4 w-4" aria-hidden="true" />
                    Replay chord
                  </Button>
                  <Button type="button" onClick={startRound}>
                    <Headphones className="h-4 w-4" aria-hidden="true" />
                    Next chord
                  </Button>
                </div>
              </div>

              <div aria-live="polite" className="min-h-6 text-sm">
                {!round ? (
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <CircleHelp className="h-4 w-4" aria-hidden="true" />
                    Press “Next chord” to begin.
                  </span>
                ) : selected ? (
                  selected.label === round.answer.label ? (
                    <span className="inline-flex items-center gap-2 font-semibold text-in-tune">
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Correct — it was {choiceLabel(round.answer)}.
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 font-semibold text-destructive">
                      <X className="h-4 w-4" aria-hidden="true" />
                      Not quite — it was {choiceLabel(round.answer)}.
                    </span>
                  )
                ) : (
                  <span className="text-muted-foreground">Which chord did you hear?</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {round?.choices.map((choice) => {
                  const isCorrect = choice.label === round.answer.label;
                  const isSelected = choice.label === selected?.label;
                  const resultStyle = selected && isCorrect
                    ? "border-in-tune/60 bg-in-tune/10 text-in-tune"
                    : selected && isSelected
                      ? "border-destructive/60 bg-destructive/10 text-destructive"
                      : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary/10";

                  return (
                    <button
                      key={choice.label}
                      type="button"
                      disabled={selected !== null}
                      data-testid={`chord-guess-option-${choice.label}`}
                      aria-label={`Guess ${choice.label}`}
                      onClick={() => answerRound(choice)}
                      className={`min-h-16 rounded-xl border text-lg font-bold transition-[border-color,background-color,transform] active:scale-[0.98] disabled:cursor-default ${resultStyle}`}
                    >
                      {choiceLabel(choice)}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <Button type="button" variant="outline" size="sm" onClick={chooseLevel}>
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  Choose another level
                </Button>
                {score.answered > 0 && (
                  <Button type="button" variant="ghost" size="sm" onClick={resetGame}>
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Reset score
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
