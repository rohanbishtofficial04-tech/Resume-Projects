import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Mic, MicOff, RotateCcw, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FretboardDiagram from "@/components/chord-library/FretboardDiagram";
import { ChordGameAudioEngine, type ChordGameAudioError } from "@/lib/audio/chordGame";
import {
  identifyPlayedChord,
  matchesPlayedChord,
  PLAY_CHORD_LEVELS,
  type PlayChord,
  type PlayChordLevel,
} from "@/lib/games/chordPlay";
import { usePersistentState } from "@/hooks/usePersistentState";
import { STORAGE_KEYS } from "@/lib/storage";
import { cn } from "@/lib/utils";

type GameStatus = "idle" | "requesting" | "playing" | "finished" | "error";
const STARTING_SECONDS = 30;
const BONUS_SECONDS = 5;
const EVIDENCE_FRAME_COUNT = 6;
const EVIDENCE_FRAMES_REQUIRED = 2;
const PITCH_CLASS_NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];

function nextChord(level: PlayChordLevel, previous: PlayChord | null): PlayChord {
  const options = level.chords.filter((chord) => chord.label !== previous?.label);
  const pool = options.length > 0 ? options : level.chords;
  return pool[Math.floor(Math.random() * pool.length)];
}

function randomChord(level: PlayChordLevel): PlayChord {
  return level.chords[Math.floor(Math.random() * level.chords.length)];
}

function countPitchEvidence(frames: Set<number>[]): Map<number, number> {
  const counts = new Map<number, number>();
  frames.forEach((frame) => {
    frame.forEach((pitchClass) => counts.set(pitchClass, (counts.get(pitchClass) ?? 0) + 1));
  });
  return counts;
}

export default function ChordPlay() {
  const [level, setLevel] = useState<PlayChordLevel | null>(null);
  const [target, setTarget] = useState<PlayChord | null>(null);
  const [status, setStatus] = useState<GameStatus>("idle");
  const [error, setError] = useState<{ kind: ChordGameAudioError; message: string } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(STARTING_SECONDS);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("Choose a level, then play the chord shown.");
  const [highScores, setHighScores] = usePersistentState<Record<string, number>>(
    STORAGE_KEYS.chordPlayHighScores,
    {},
  );

  const engineRef = useRef<ChordGameAudioEngine | null>(null);
  const levelRef = useRef(level);
  const targetRef = useRef(target);
  const deadlineRef = useRef(0);
  const scoreRef = useRef(0);
  const pitchEvidenceRef = useRef<Set<number>[]>([]);
  const waitingForStrumRef = useRef(false);
  const activeStrumRef = useRef(false);
  const matchedStrumRef = useRef(false);
  const lastFeedbackAtRef = useRef(0);
  const handlerRef = useRef<(
    pitchClasses: Set<number> | null,
    strumStarted: boolean,
    captureActive: boolean,
  ) => void>(() => {});

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  const handlePitchClasses = useCallback((
    pitchClasses: Set<number> | null,
    strumStarted: boolean,
    captureActive: boolean,
  ) => {
    if (status !== "playing") return;
    if (strumStarted) {
      activeStrumRef.current = true;
      matchedStrumRef.current = false;
      pitchEvidenceRef.current = [];
      waitingForStrumRef.current = false;
    }
    if (!captureActive) {
      if (activeStrumRef.current) {
        if (!matchedStrumRef.current) {
          setFeedback("Incorrect chord. Try the shown shape again.");
        }
        activeStrumRef.current = false;
        matchedStrumRef.current = false;
      }
      pitchEvidenceRef.current = [];
      return;
    }
    if (waitingForStrumRef.current) return;
    if (!pitchClasses) {
      pitchEvidenceRef.current.push(new Set());
      if (pitchEvidenceRef.current.length > EVIDENCE_FRAME_COUNT) pitchEvidenceRef.current.shift();
      return;
    }

    pitchEvidenceRef.current.push(new Set(pitchClasses));
    if (pitchEvidenceRef.current.length > EVIDENCE_FRAME_COUNT) pitchEvidenceRef.current.shift();
    const evidenceCounts = countPitchEvidence(pitchEvidenceRef.current);
    const stablePitchClasses = new Set(
      [...evidenceCounts].filter(([, count]) => count >= EVIDENCE_FRAMES_REQUIRED).map(([pitchClass]) => pitchClass),
    );

    const currentTarget = targetRef.current;
    const currentLevel = levelRef.current;
    if (!currentTarget || !currentLevel) return;

    if (matchesPlayedChord(currentTarget, stablePitchClasses)) {
      pitchEvidenceRef.current = [];
      waitingForStrumRef.current = true;
      matchedStrumRef.current = true;
      const nextScore = scoreRef.current + 1;
      scoreRef.current = nextScore;
      setScore(nextScore);
      setHighScores((previous) => ({
        ...previous,
        [currentLevel.id]: Math.max(previous[currentLevel.id] ?? 0, nextScore),
      }));

      const earnedBonus = nextScore % 3 === 0;
      if (earnedBonus) {
        deadlineRef.current += BONUS_SECONDS * 1000;
        setSecondsLeft((remaining) => remaining + BONUS_SECONDS);
      }

      const upcoming = nextChord(currentLevel, currentTarget);
      targetRef.current = upcoming;
      setTarget(upcoming);
      setFeedback(
        earnedBonus
          ? `${nextScore} chords played! +${BONUS_SECONDS} seconds. Strum ${upcoming.label} next.`
          : `Correct! Strum ${upcoming.label} next.`,
      );
      return;
    }

    const now = performance.now();
    if (now - lastFeedbackAtRef.current > 500) {
      lastFeedbackAtRef.current = now;
      const heard = [...stablePitchClasses].sort((a, b) => a - b);
      const missing = [...currentTarget.intervals]
        .map((interval) => (currentTarget.rootPc + interval) % 12)
        .filter((pitchClass) => !stablePitchClasses.has(pitchClass));
      const heardText = heard.length ? heard.map((pitchClass) => PITCH_CLASS_NAMES[pitchClass]).join(", ") : "notes not clear yet";
      const missingText = missing.map((pitchClass) => PITCH_CLASS_NAMES[pitchClass]).join(", ");
      const guessedChord = identifyPlayedChord(currentLevel, stablePitchClasses);
      if (guessedChord && guessedChord.label !== currentTarget.label) {
        setFeedback(
          missingText
            ? `That sounds like ${guessedChord.label}, not ${currentTarget.label}. Hint: add ${missingText}.`
            : `That sounds like ${guessedChord.label}, not ${currentTarget.label}. Check the chord shape.`,
        );
      } else {
        setFeedback(
          missingText
            ? `Not quite ${currentTarget.label}. Hearing ${heardText}. Hint: add ${missingText}.`
            : `Hearing ${heardText}. Let the chord ring clearly.`,
        );
      }
    }
  }, [scoreRef, setHighScores, status]);

  useEffect(() => {
    handlerRef.current = handlePitchClasses;
  }, [handlePitchClasses]);

  useEffect(() => {
    const engine = new ChordGameAudioEngine();
    engine.onPitchClasses = (pitchClasses, strumStarted, captureActive) =>
      handlerRef.current(pitchClasses, strumStarted, captureActive);
    engineRef.current = engine;
    return () => {
      engine.stop();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (status !== "playing") return;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadlineRef.current - performance.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        engineRef.current?.stop();
        setStatus("finished");
        setFeedback("Time is up! Start another round and beat your score.");
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [status]);

  const stopRound = useCallback(() => {
    engineRef.current?.stop();
    setStatus("idle");
    setSecondsLeft(STARTING_SECONDS);
    pitchEvidenceRef.current = [];
    waitingForStrumRef.current = false;
    activeStrumRef.current = false;
    matchedStrumRef.current = false;
    deadlineRef.current = 0;
    setFeedback(targetRef.current ? `Ready — play ${targetRef.current.label}.` : "Choose a level to begin.");
  }, []);

  const chooseLevel = (nextLevel: PlayChordLevel) => {
    engineRef.current?.stop();
    const first = randomChord(nextLevel);
    setLevel(nextLevel);
    levelRef.current = nextLevel;
    setTarget(first);
    targetRef.current = first;
    setStatus("idle");
    setError(null);
    setSecondsLeft(STARTING_SECONDS);
    setScore(0);
    scoreRef.current = 0;
    pitchEvidenceRef.current = [];
    waitingForStrumRef.current = false;
    activeStrumRef.current = false;
    matchedStrumRef.current = false;
    setFeedback(`Allow microphone access, then play ${first.label} before time runs out.`);
  };

  const startRound = async () => {
    const selectedLevel = levelRef.current;
    if (!selectedLevel) return;
    const engine = engineRef.current;
    if (!engine) {
      setStatus("error");
      setError({ kind: "unknown", message: "The chord-game audio engine is unavailable. Reload the page and try again." });
      return;
    }

    setError(null);
    setScore(0);
    scoreRef.current = 0;
    pitchEvidenceRef.current = [];
    waitingForStrumRef.current = false;
    activeStrumRef.current = false;
    matchedStrumRef.current = false;
    setStatus("requesting");
    const result = await engine.start();
    if (result.cancelled) return;
    if (!result.ok) {
      setStatus("error");
      setError({
        kind: result.kind ?? "unknown",
        message: result.message ?? "Unable to start the microphone.",
      });
      return;
    }

    pitchEvidenceRef.current = [];
    waitingForStrumRef.current = false;
    activeStrumRef.current = false;
    matchedStrumRef.current = false;
    deadlineRef.current = performance.now() + STARTING_SECONDS * 1000;
    setSecondsLeft(STARTING_SECONDS);
    setFeedback(`Strum ${targetRef.current?.label ?? "the chord"} clearly.`);
    setStatus("playing");
  };

  const backToLevels = () => {
    engineRef.current?.stop();
    levelRef.current = null;
    targetRef.current = null;
    setLevel(null);
    setTarget(null);
    setStatus("idle");
    setError(null);
    setSecondsLeft(STARTING_SECONDS);
    setScore(0);
    scoreRef.current = 0;
    pitchEvidenceRef.current = [];
    waitingForStrumRef.current = false;
    setFeedback("Choose a level, then play the chord shown.");
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

      {!level ? (
        <section>
          <div className="mb-5 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Play your instrument</p>
            <h1 className="mt-1 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">Chord Sprint</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Read the chord shape and strum it on your guitar. Get 5 bonus seconds for every three correctly played
              chords in a round.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {PLAY_CHORD_LEVELS.map((item) => (
              <button
                key={item.id}
                type="button"
                data-testid={`chord-play-level-${item.id}`}
                onClick={() => chooseLevel(item)}
                className="rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Badge variant="outline">{item.id}</Badge>
                <h2 className="mt-3 font-heading text-lg font-bold">{item.title}</h2>
                <p className="mt-1 min-h-10 text-sm text-muted-foreground">{item.description}</p>
                <p className="mt-3 text-xs text-muted-foreground">{item.chords.map(({ label }) => label).join(" · ")}</p>
                <p className="mt-3 text-xs font-semibold text-primary">Best: {highScores[item.id] ?? 0}</p>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <>
          <section>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Instrument challenge</p>
            <h1 className="mt-1 font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">Chord Sprint</h1>
            <p className="mt-2 text-sm text-muted-foreground">{level.title} · {level.description}</p>
          </section>

          {error && (
            <div role="alert" className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm">
              <p className="font-semibold text-destructive">
                {error.kind === "permission-denied" ? "Microphone permission denied" : "Could not start the microphone"}
              </p>
              <p className="mt-1 text-muted-foreground">{error.message}</p>
            </div>
          )}

          <Card data-testid="chord-play-game">
            <CardContent className="flex flex-col gap-5 p-4 sm:p-6">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-border bg-background/70 p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Time</p>
                  <p data-testid="chord-play-timer" aria-live="polite" className={cn(
                    "mt-1 flex items-center justify-center gap-1 font-mono text-2xl font-bold tabular-nums",
                    secondsLeft <= 10 && status === "playing" && "text-destructive",
                  )}>
                    <Timer className="h-4 w-4" aria-hidden="true" />
                    {secondsLeft}s
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background/70 p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Chords</p>
                  <p data-testid="chord-play-score" className="mt-1 font-mono text-2xl font-bold tabular-nums">{score}</p>
                </div>
                <div
                  className="rounded-xl border border-border bg-background/70 p-3 text-center"
                  aria-label={`Bonus combo progress: ${score % 3} of 3 chords`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Combo</p>
                  <div
                    role="progressbar"
                    aria-label="Progress toward bonus time"
                    aria-valuemin={0}
                    aria-valuemax={3}
                    aria-valuenow={score % 3}
                    className="mt-2 flex items-center justify-center gap-1.5"
                  >
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        aria-hidden="true"
                        className={cn(
                          "h-2.5 w-2.5 rounded-full transition-colors",
                          dot < score % 3 ? "bg-primary" : "bg-muted",
                        )}
                      />
                    ))}
                    <span className="ml-1 text-[10px] tabular-nums text-muted-foreground">+{BONUS_SECONDS}s</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-primary/30 bg-primary/5 px-4 py-5 text-center sm:py-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Play this chord</p>
                <h2 data-testid="chord-play-target" className="mt-1 font-heading text-5xl font-extrabold tracking-tight sm:text-6xl">
                  {target?.label}
                </h2>
                {target && (
                  <FretboardDiagram
                    title={`${target.label} chord`}
                    frets={target.frets}
                    fingers={target.fingers}
                    startFret={Math.max(1, Math.min(...target.frets.filter((fret) => fret > 0)))}
                    barre={target.barre}
                    className="mx-auto mt-3 max-w-64"
                    testId="chord-play-diagram"
                  />
                )}
                <p
                  data-testid="chord-play-feedback"
                  aria-live="polite"
                  className="mx-auto mt-3 min-h-6 max-w-xl text-center text-sm font-medium text-muted-foreground"
                >
                  {feedback}
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {status === "playing" ? (
                  <Button type="button" variant="outline" onClick={stopRound} data-testid="chord-play-stop">
                    <MicOff className="h-4 w-4" aria-hidden="true" />
                    Stop game
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => void startRound()}
                    disabled={status === "requesting"}
                    data-testid="chord-play-start"
                  >
                    <Mic className="h-4 w-4" aria-hidden="true" />
                    {status === "requesting" ? "Requesting microphone…" : status === "finished" ? "Play again" : "Enable mic & start"}
                  </Button>
                )}
                <Button type="button" variant="ghost" onClick={backToLevels} data-testid="chord-play-levels">
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Choose level
                </Button>
              </div>

              {status === "finished" && (
                <p className="flex items-center justify-center gap-2 text-sm font-semibold text-primary">
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Final score: {score} · Best: {highScores[level.id] ?? 0}
                </p>
              )}
              {status !== "playing" && (
                <p className="text-center text-xs text-muted-foreground">
                  Allow microphone access and strum once for each chord. Recognition listens for a new strum, so you
                  can play the next chord without waiting for the strings to go silent.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
