import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Pause, Play, Plus, Volume2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import RangeSlider from "@/components/controls/RangeSlider";
import { MetronomeEngine, SUBDIVISIONS, TIME_SIGNATURES } from "@/lib/audio/metronome";
import { STORAGE_KEYS } from "@/lib/storage";
import { usePersistentState } from "@/hooks/usePersistentState";
import { cn } from "@/lib/utils";

interface MetronomePrefs {
  bpm: number;
  signature: string;
  subdivision: number;
  volume: number;
  accents: Record<string, number[]>;
}

const DEFAULT_PREFS: MetronomePrefs = {
  bpm: 100,
  signature: "4/4",
  subdivision: 1,
  volume: 0.7,
  accents: { "4/4": [2, 1, 1, 1] },
};

const MIN_BPM = 30;
const MAX_BPM = 300;

function defaultAccents(beats: number): number[] {
  return Array.from({ length: beats }, (_, index) => (index === 0 ? 2 : 1));
}

const ACCENT_STATES = [
  { level: 2, label: "Accent" },
  { level: 1, label: "Normal" },
  { level: 0, label: "Muted" },
];

export default function Metronome() {
  const [prefs, setPrefs] = usePersistentState<MetronomePrefs>(STORAGE_KEYS.metronome, DEFAULT_PREFS);
  const [playing, setPlaying] = useState(false);
  const [activeBeat, setActiveBeat] = useState(-1);
  const [pulse, setPulse] = useState(0);
  const [tapCount, setTapCount] = useState(0);

  const engineRef = useRef<MetronomeEngine | null>(null);
  const tapsRef = useRef<number[]>([]);
  const frameRef = useRef<number | null>(null);

  const signature = TIME_SIGNATURES.find((item) => item.id === prefs.signature) ?? TIME_SIGNATURES[2];
  const beats = signature.beats;

  const accents = useMemo(() => {
    const stored = prefs.accents[prefs.signature];
    return stored && stored.length === beats ? stored : defaultAccents(beats);
  }, [prefs.accents, prefs.signature, beats]);

  function updatePref<K extends keyof MetronomePrefs>(key: K, value: MetronomePrefs[K]) {
    setPrefs((previous) => ({ ...previous, [key]: value }));
  }

  const setBpm = useCallback(
    (value: number) => {
      const next = Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(value)));
      setPrefs((previous) => ({ ...previous, bpm: next }));
    },
    [setPrefs],
  );

  // Engine lives for the life of the page and closes its AudioContext on unmount.
  useEffect(() => {
    const engine = new MetronomeEngine();
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.bpm = prefs.bpm;
    engine.beatsPerBar = beats;
    engine.subdivision = prefs.subdivision;
    engine.accents = accents;
    engine.setVolume(prefs.volume);
  }, [prefs.bpm, prefs.subdivision, prefs.volume, beats, accents]);

  const togglePlay = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.isRunning) {
      engine.stop();
      setPlaying(false);
      setActiveBeat(-1);
    } else {
      engine.start();
      setPlaying(true);
    }
  }, []);

  // Visual beat tracking: drain events whose scheduled audio time has arrived.
  useEffect(() => {
    if (!playing) {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      return;
    }
    const tick = () => {
      const engine = engineRef.current;
      if (engine) {
        const due = engine.drain(engine.contextTime);
        for (const event of due) {
          setActiveBeat(event.beat);
          setPulse((value) => value + 1);
        }
      }
      frameRef.current = window.requestAnimationFrame(tick);
    };
    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [playing]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
      } else if (event.code === "ArrowUp") {
        event.preventDefault();
        setBpm(prefs.bpm + (event.shiftKey ? 5 : 1));
      } else if (event.code === "ArrowDown") {
        event.preventDefault();
        setBpm(prefs.bpm - (event.shiftKey ? 5 : 1));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prefs.bpm, setBpm, togglePlay]);

  const handleTap = useCallback(() => {
    const now = performance.now();
    const taps = tapsRef.current;
    if (taps.length > 0 && now - taps[taps.length - 1] > 2500) taps.length = 0;
    taps.push(now);
    if (taps.length > 5) taps.shift();
    setTapCount(taps.length);

    if (taps.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < taps.length; i += 1) intervals.push(taps[i] - taps[i - 1]);
      const average = intervals.reduce((total, value) => total + value, 0) / intervals.length;
      setBpm(60000 / average);
    }
  }, [setBpm]);

  const changeSignature = useCallback(
    (id: string) => {
      const next = TIME_SIGNATURES.find((item) => item.id === id);
      if (!next) return;
      setPrefs((previous) => ({
        ...previous,
        signature: id,
        accents: {
          ...previous.accents,
          [id]: previous.accents[id]?.length === next.beats ? previous.accents[id] : defaultAccents(next.beats),
        },
      }));
    },
    [setPrefs],
  );

  const cycleAccent = useCallback(
    (beatIndex: number) => {
      setPrefs((previous) => {
        const current = previous.accents[previous.signature] ?? defaultAccents(beats);
        const next = ACCENT_STATES.find((state) => state.level === current[beatIndex]);
        const level = next ? ACCENT_STATES[(ACCENT_STATES.indexOf(next) + 1) % ACCENT_STATES.length].level : 2;
        const updated = current.slice();
        updated[beatIndex] = level;
        return { ...previous, accents: { ...previous.accents, [previous.signature]: updated } };
      });
    },
    [beats, setPrefs],
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="fl-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Sample-accurate Web Audio timing
          </p>
          <h1 className="mt-1 font-heading text-4xl font-bold tracking-tight sm:text-5xl">Metronome</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            30 to 300 BPM with tap tempo, time signatures, per-beat accents and subdivisions. Press
            <span className="mx-1 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-xs">Space</span>
            to start and stop.
          </p>
        </div>
        <Badge variant="outline" data-testid="metronome-status-badge" data-running={playing} className="font-mono">
          {playing ? "RUNNING" : "STOPPED"}
        </Badge>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <Card className="fl-rise fl-rise-1">
          <CardHeader>
            <CardTitle className="text-base">Tempo</CardTitle>
            <CardDescription>Drag the slider, nudge with the buttons, or tap in a feel.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="icon-lg"
                data-testid="metronome-bpm-decrease"
                aria-label="Decrease tempo by one BPM"
                onClick={() => setBpm(prefs.bpm - 1)}
              >
                <Minus className="h-5 w-5" />
              </Button>
              <div className="flex flex-col items-center">
                <span
                  data-testid="metronome-bpm-display"
                  aria-live="polite"
                  className="font-mono text-6xl font-bold leading-none tabular-nums sm:text-7xl"
                >
                  {prefs.bpm}
                </span>
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  BPM
                </span>
              </div>
              <Button
                variant="outline"
                size="icon-lg"
                data-testid="metronome-bpm-increase"
                aria-label="Increase tempo by one BPM"
                onClick={() => setBpm(prefs.bpm + 1)}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            <RangeSlider
              min={MIN_BPM}
              max={MAX_BPM}
              value={prefs.bpm}
              onChange={setBpm}
              ariaLabel="Tempo in beats per minute"
              testId="metronome-bpm-slider"
            />
            <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
              <span>{MIN_BPM}</span>
              <span>Largo</span>
              <span>Andante</span>
              <span>Allegro</span>
              <span>{MAX_BPM}</span>
            </div>

            <Button
              variant="secondary"
              size="lg"
              data-testid="metronome-tap-button"
              onClick={handleTap}
              className="w-full font-mono tracking-[0.14em]"
            >
              TAP TEMPO{tapCount > 1 ? ` · ${tapCount}` : ""}
            </Button>
          </CardContent>
        </Card>

        <Card className="fl-rise fl-rise-2">
          <CardHeader>
            <CardTitle className="text-base">Meter &amp; feel</CardTitle>
            <CardDescription>Time signature, accent map, and note subdivision.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Time signature
              </Label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3">
                {TIME_SIGNATURES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    data-testid={`metronome-signature-${item.id.replace("/", "-")}`}
                    aria-pressed={prefs.signature === item.id}
                    onClick={() => changeSignature(item.id)}
                    className={cn(
                      "rounded-lg border px-2 py-2 font-mono text-sm font-semibold transition-colors duration-150",
                      prefs.signature === item.id
                        ? "border-primary/60 bg-primary/15 text-primary"
                        : "border-border bg-surface text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Beat accents — click to cycle
              </Label>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: beats }).map((_, index) => {
                  const level = accents[index] ?? 1;
                  return (
                    <button
                      key={index}
                      type="button"
                      data-testid={`metronome-accent-${index}`}
                      data-level={level}
                      aria-label={`Beat ${index + 1}: ${ACCENT_STATES.find((s) => s.level === level)?.label}`}
                      onClick={() => cycleAccent(index)}
                      className={cn(
                        "flex h-12 w-12 flex-col items-center justify-center rounded-xl border font-mono text-sm font-bold transition-colors duration-150",
                        level === 2 && "border-primary/70 bg-primary/20 text-primary",
                        level === 1 && "border-border bg-surface text-foreground",
                        level === 0 && "border-flat/50 bg-flat/10 text-flat",
                      )}
                    >
                      {index + 1}
                      <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-wide">
                        {level === 2 ? "acc" : level === 1 ? "nrm" : "mut"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Subdivision
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {SUBDIVISIONS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    data-testid={`metronome-subdivision-${item.ticks}`}
                    aria-pressed={prefs.subdivision === item.ticks}
                    title={item.name}
                    onClick={() => updatePref("subdivision", item.ticks)}
                    className={cn(
                      "rounded-lg border px-2 py-2 font-mono text-sm font-semibold transition-colors duration-150",
                      prefs.subdivision === item.ticks
                        ? "border-primary/60 bg-primary/15 text-primary"
                        : "border-border bg-surface text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="fl-rise fl-rise-3">
        <CardContent className="flex flex-col gap-5 py-6">
          <div className="flex flex-wrap items-center gap-4">
            <Button
              data-testid="metronome-play-toggle"
              onClick={togglePlay}
              aria-label={playing ? "Pause metronome" : "Play metronome"}
              size="icon-lg"
              className="h-16 w-16 rounded-full shadow-[0_0_28px_-6px_var(--primary)]"
            >
              {playing ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
            </Button>

            <div className="min-w-[92px]">
              <p data-testid="metronome-beat-count" className="font-mono text-2xl font-bold tabular-nums">
                {playing ? activeBeat + 1 : "–"} / {beats}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Beat</p>
            </div>

            <div className="ml-auto flex min-w-[190px] flex-1 items-center gap-3 sm:max-w-xs">
              <Volume2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <RangeSlider
                min={0}
                max={1}
                step={0.01}
                value={prefs.volume}
                onChange={(value) => updatePref("volume", value)}
                ariaLabel="Metronome volume"
                testId="metronome-volume-slider"
              />
              <span className="w-9 shrink-0 text-right font-mono text-xs text-muted-foreground">
                {Math.round(prefs.volume * 100)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2" role="group" aria-label="Beat indicator">
            {Array.from({ length: beats }).map((_, index) => {
              const isActive = activeBeat === index;
              const level = accents[index] ?? 1;
              return (
                <div key={index} data-testid={`metronome-beat-led-${index}`} data-active={isActive} className="flex-1">
                  <div
                    key={isActive ? pulse : "idle"}
                    className={cn(
                      "h-3 w-full rounded-full transition-colors duration-150",
                      isActive
                        ? level === 2
                          ? "bg-primary fl-beat"
                          : level === 0
                            ? "bg-flat fl-beat"
                            : "bg-primary/55 fl-beat"
                        : level === 0
                          ? "bg-flat/20"
                          : "bg-secondary",
                    )}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-4 border-t border-border pt-4 font-mono text-[11px] text-muted-foreground">
            <span>INTERVAL {Math.round(60000 / prefs.bpm)} ms</span>
            <span>{signature.id} · {beats} beats</span>
            <span>
              {SUBDIVISIONS.find((item) => item.ticks === prefs.subdivision)?.name ?? "Quarter notes"} ·{" "}
              {prefs.subdivision} per beat
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}