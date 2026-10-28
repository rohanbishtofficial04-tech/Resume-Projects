import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff, Radio, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CentsGauge from "@/components/tuner/CentsGauge";
import { TunerEngine } from "@/lib/audio/tuner";
import type { TunerErrorKind } from "@/lib/audio/tuner";
import { playReferenceTone, stopAllTones } from "@/lib/audio/tones";
import {
  DEFAULT_TUNING_ID,
  IN_TUNE_CENTS,
  TUNINGS,
  closestStringIndex,
  findTuning,
  freqFromMidi,
  readingFromFrequency,
} from "@/lib/music";
import type { PitchReading, TuningString } from "@/lib/music";
import { STORAGE_KEYS } from "@/lib/storage";
import { usePersistentState } from "@/hooks/usePersistentState";
import { cn } from "@/lib/utils";

type TunerStatus = "idle" | "requesting" | "listening" | "error";

interface TunerErrorState {
  kind: TunerErrorKind;
  message: string;
}

const STRING_LABELS = ["6th · low E", "5th · A", "4th · D", "3rd · G", "2nd · B", "1st · high e"];

export default function Tuner() {
  const [tuningId, setTuningId] = usePersistentState<string>(STORAGE_KEYS.tuning, DEFAULT_TUNING_ID);
  const tuning = useMemo(() => findTuning(tuningId), [tuningId]);

  const [status, setStatus] = useState<TunerStatus>("idle");
  const [error, setError] = useState<TunerErrorState | null>(null);
  const [reading, setReading] = useState<PitchReading | null>(null);
  const [activeString, setActiveString] = useState<number | null>(null);
  const [playingString, setPlayingString] = useState<number | null>(null);

  const engineRef = useRef<TunerEngine | null>(null);
  const tuningRef = useRef(tuning);
  const handlerRef = useRef<(frequency: number) => void>(() => {});
  const lastPaintRef = useRef(0);
  const toneTimerRef = useRef<number | null>(null);

  useEffect(() => {
    tuningRef.current = tuning;
  }, [tuning]);

  const handleFrequency = useCallback((frequency: number) => {
    const now = performance.now();
    if (now - lastPaintRef.current < 70) return; // throttle readout repaints
    lastPaintRef.current = now;

    if (frequency <= 0) {
      setReading(null);
      setActiveString(null);
      return;
    }
    const next = readingFromFrequency(frequency, tuningRef.current.id === "half-step");
    setReading(next);
    setActiveString(closestStringIndex(next.midi, tuningRef.current));
  }, []);

  useEffect(() => {
    handlerRef.current = handleFrequency;
  }, [handleFrequency]);

  useEffect(() => {
    const engine = new TunerEngine();
    engine.onFrequency = (frequency) => handlerRef.current(frequency);
    engineRef.current = engine;
    return () => {
      engine.stop();
      engineRef.current = null;
      stopAllTones();
      if (toneTimerRef.current !== null) window.clearTimeout(toneTimerRef.current);
    };
  }, []);

  const stopListening = useCallback(() => {
    engineRef.current?.stop();
    setStatus("idle");
    setReading(null);
    setActiveString(null);
  }, []);

  const startListening = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) return;
    setError(null);
    setStatus("requesting");
    const result = await engine.start();
    if (!result.ok) {
      setStatus("error");
      setError({ kind: result.kind ?? "unknown", message: result.message ?? "Microphone unavailable." });
      toast.error(result.message ?? "Microphone unavailable.");
      return;
    }
    setStatus("listening");
    toast.success("Listening — play a string");
  }, []);

  const playString = useCallback((string: TuningString) => {
    stopAllTones();
    playReferenceTone(freqFromMidi(string.midi));
    setPlayingString(string.index);
    if (toneTimerRef.current !== null) window.clearTimeout(toneTimerRef.current);
    toneTimerRef.current = window.setTimeout(() => setPlayingString(null), 2000);
  }, []);

  const cents = reading?.cents ?? null;
  const inTune = cents !== null && Math.abs(cents) <= IN_TUNE_CENTS;
  const direction = cents === null ? "idle" : inTune ? "in-tune" : cents < 0 ? "flat" : "sharp";
  const statusText = cents === null ? "No signal" : inTune ? "In tune" : cents < 0 ? "Flat" : "Sharp";
  const statusTone =
    direction === "in-tune"
      ? "border-in-tune/60 bg-in-tune/15 text-in-tune"
      : direction === "flat"
        ? "border-flat/50 bg-flat/10 text-flat"
        : direction === "sharp"
          ? "border-sharp/50 bg-sharp/10 text-sharp"
          : "border-border bg-secondary text-muted-foreground";

  const listening = status === "listening";

  return (
    <div className="flex flex-col gap-6">
      <section className="fl-rise">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Real-time pitch detection
        </p>
        <h1 className="mt-1 font-heading text-4xl font-bold tracking-tight sm:text-5xl">Guitar Tuner</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Play a string and hold it — FretLab reads the pitch from your microphone and shows the note, the exact
          frequency it is sounding, and how many cents sharp or flat it sits from perfect.
        </p>
      </section>

      {error && (
        <div
          data-testid="tuner-error-banner"
          data-error-kind={error.kind}
          role="alert"
          className="fl-rise flex flex-wrap items-start gap-3 rounded-2xl border border-destructive/50 bg-destructive/10 p-4"
        >
          <span className="rounded-full bg-destructive/20 p-2 text-destructive">
            <MicOff className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-bold text-destructive">
              {error.kind === "permission-denied" ? "Microphone permission denied" : "Microphone unavailable"}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">{error.message}</p>
          </div>
          <Button variant="outline" size="sm" data-testid="tuner-retry-button" onClick={() => void startListening()}>
            Try again
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <Card className="fl-rise fl-rise-1 overflow-hidden">
          <CardContent className="relative flex flex-col items-center gap-4 py-8">
            <div className="fl-fret-motif pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />
            <div className="relative flex flex-col items-center">
              <div
                data-testid="tuner-note-readout"
                aria-live="polite"
                className={cn(
                  "font-heading text-7xl font-bold leading-none tracking-tight tabular-nums transition-colors duration-200 sm:text-8xl",
                  direction === "in-tune" && "text-in-tune",
                  direction === "flat" && "text-flat",
                  direction === "sharp" && "text-sharp",
                  direction === "idle" && "text-muted-foreground/60",
                )}
              >
                {reading ? `${reading.note}${reading.octave}` : "--"}
              </div>
              <div className="mt-3 flex items-center gap-3 font-mono text-sm text-muted-foreground">
                <span data-testid="tuner-frequency-readout">
                  {reading ? reading.frequency.toFixed(1) : "--.-"} Hz
                </span>
                <span className="text-border">|</span>
                <span data-testid="tuner-cents-readout">
                  {cents === null ? "0.0" : `${cents > 0 ? "+" : ""}${cents.toFixed(1)}`} cents
                </span>
              </div>
            </div>

            <Badge
              data-testid="tuner-status-badge"
              data-status={direction}
              variant="outline"
              className={cn("px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]", statusTone)}
            >
              {statusText}
            </Badge>

            <CentsGauge cents={cents} className="max-w-md" />

            <p className="relative text-center text-xs text-muted-foreground">
              {!listening
                ? "Microphone is off — start listening to tune."
                : reading
                  ? `${inTune ? "Locked in" : "Adjust the peg"} · target ${
                      activeString !== null ? tuning.strings[activeString].label : ""
                    }`
                  : "Pluck a string and let it ring…"}
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="fl-rise fl-rise-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Radio className="h-4 w-4 text-primary" />
                Input
              </CardTitle>
              <CardDescription>
                FretLab uses your browser&apos;s microphone only while listening. Nothing is recorded or uploaded.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button
                data-testid="tuner-mic-toggle-button"
                onClick={() => (listening ? stopListening() : void startListening())}
                disabled={status === "requesting"}
                variant={listening ? "outline" : "default"}
                size="lg"
                className="w-full"
              >
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {status === "requesting" ? "Requesting access…" : listening ? "Stop listening" : "Start listening"}
              </Button>
              <div className="rounded-xl border border-border bg-surface p-3">
                <p
                  data-testid="tuner-signal-state"
                  data-state={listening ? "listening" : status}
                  className="flex items-center gap-2 font-mono text-xs text-muted-foreground"
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      listening ? "bg-in-tune fl-glow" : status === "error" ? "bg-flat" : "bg-muted-foreground/40",
                    )}
                  />
                  {listening ? "signal live" : status === "requesting" ? "awaiting permission" : "signal idle"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="fl-rise fl-rise-3">
            <CardHeader>
              <CardTitle className="text-base">Tuning</CardTitle>
              <CardDescription>Choose a tuning — scroll to explore all available profiles.</CardDescription>
            </CardHeader>
            <CardContent
              data-testid="tuner-tuning-list"
              aria-label="Available guitar tunings"
              className="tuner-tuning-scroll flex max-h-56 flex-col gap-2 overflow-y-auto overscroll-contain"
            >
              {TUNINGS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  data-testid={`tuner-tuning-${option.id}-button`}
                  aria-pressed={option.id === tuning.id}
                  onClick={() => setTuningId(option.id)}
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-[border-color,background-color,color] duration-150",
                    option.id === tuning.id
                      ? "border-primary/60 bg-primary/10 text-foreground"
                      : "border-border bg-surface text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  <span className="text-sm font-semibold">{option.name}</span>
                  <span className="font-mono text-xs">{option.short}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="fl-rise">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Volume2 className="h-4 w-4 text-primary" />
            Reference tones
          </CardTitle>
          <CardDescription>
            Tap any string to hear its target pitch — useful for tuning by ear. The live string is highlighted while
            you play.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {tuning.strings.map((string) => {
              const isActive = activeString === string.index;
              const isPlaying = playingString === string.index;
              return (
                <button
                  key={string.index}
                  type="button"
                  data-testid={`tuner-string-${string.index}-button`}
                  data-active={isActive}
                  aria-label={`Play reference tone for ${string.label}`}
                  onClick={() => playString(string)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border px-3 py-3 transition-[border-color,background-color,transform] duration-150 active:scale-[0.97]",
                    isPlaying
                      ? "border-primary bg-primary/20"
                      : isActive
                        ? "border-in-tune/60 bg-in-tune/10"
                        : "border-border bg-surface hover:border-primary/40",
                  )}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {STRING_LABELS[string.index]}
                  </span>
                  <span className={cn("font-mono text-2xl font-bold", isActive && "text-in-tune")}>{string.label}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {freqFromMidi(string.midi).toFixed(1)} Hz
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Tip: tune up to pitch (rather than down) so the string settles and stays in tune longer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
