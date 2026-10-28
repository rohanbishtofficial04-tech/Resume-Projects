/** Web Audio lookahead-scheduled metronome: rock-solid timing, sample-accurate beats. */

export interface TickEvent {
  /** AudioContext time the click was scheduled for. */
  time: number;
  beat: number;
  sub: number;
  /** 2 = accented, 1 = normal, 0 = muted, -1 = subdivision tick */
  level: number;
  isSubdivision: boolean;
}

export const SUBDIVISIONS = [
  { ticks: 1, label: "1/4", name: "Quarter notes" },
  { ticks: 2, label: "1/8", name: "Eighth notes" },
  { ticks: 4, label: "1/16", name: "Sixteenth notes" },
  { ticks: 3, label: "1/8T", name: "Eighth triplets" },
] as const;

export const TIME_SIGNATURES = [
  { id: "2/4", beats: 2 },
  { id: "3/4", beats: 3 },
  { id: "4/4", beats: 4 },
  { id: "5/4", beats: 5 },
  { id: "6/8", beats: 6 },
  { id: "7/8", beats: 7 },
] as const;

function audioContextCtor(): typeof AudioContext {
  const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  const Ctor = w.AudioContext ?? w.webkitAudioContext;
  if (!Ctor) throw new Error("Web Audio API is not available in this browser.");
  return Ctor;
}

const SCHEDULE_AHEAD = 0.12;
const SCHEDULER_INTERVAL_MS = 25;
const START_DELAY = 0.08;

export class MetronomeEngine {
  bpm = 100;
  beatsPerBar = 4;
  /** Clicks per beat: 1 = quarter, 2 = eighths, 3 = triplets, 4 = sixteenths. */
  subdivision = 1;
  /** Accent level per beat index: 2 = accented, 1 = normal, 0 = muted. */
  accents: number[] = [2, 1, 1, 1];

  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  private nextTickTime = 0;
  private beat = 0;
  private sub = 0;
  private queue: TickEvent[] = [];
  private volumeLevel = 0.7;
  private running = false;

  get isRunning(): boolean {
    return this.running;
  }

  get contextTime(): number {
    return this.context?.currentTime ?? 0;
  }

  setVolume(value: number): void {
    this.volumeLevel = Math.min(1, Math.max(0, value));
    if (this.master && this.context) {
      this.master.gain.setTargetAtTime(this.volumeLevel, this.context.currentTime, 0.01);
    }
  }

  start(): void {
    if (this.running) return;
    const Ctor = audioContextCtor();
    if (!this.context) {
      this.context = new Ctor();
      this.master = this.context.createGain();
      this.master.gain.value = this.volumeLevel;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === "suspended") void this.context.resume();

    this.running = true;
    this.beat = 0;
    this.sub = 0;
    this.queue = [];
    this.nextTickTime = this.context.currentTime + START_DELAY;
    this.scheduler();
    this.timer = window.setInterval(() => this.scheduler(), SCHEDULER_INTERVAL_MS);
  }

  stop(): void {
    this.running = false;
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    this.queue = [];
    this.beat = 0;
    this.sub = 0;
  }

  /** Events whose audio time has arrived — drains the queue for visual sync. */
  drain(now: number): TickEvent[] {
    if (this.queue.length === 0) return [];
    const due: TickEvent[] = [];
    while (this.queue.length > 0 && this.queue[0].time <= now) {
      const event = this.queue.shift();
      if (event) due.push(event);
    }
    return due;
  }

  dispose(): void {
    this.stop();
    if (this.context && this.context.state !== "closed") void this.context.close();
    this.context = null;
    this.master = null;
  }

  private scheduler(): void {
    if (!this.running || !this.context) return;
    while (this.nextTickTime < this.context.currentTime + SCHEDULE_AHEAD) {
      this.scheduleTick(this.nextTickTime, this.beat, this.sub);
      this.advance();
    }
  }

  private advance(): void {
    const beats = Math.max(1, this.beatsPerBar);
    const ticks = Math.max(1, this.subdivision);
    this.sub += 1;
    if (this.sub >= ticks) {
      this.sub = 0;
      this.beat = (this.beat + 1) % beats;
    }
    this.nextTickTime += 60 / Math.max(30, this.bpm) / ticks;
  }

  private scheduleTick(time: number, beat: number, sub: number): void {
    const beats = Math.max(1, this.beatsPerBar);
    const isDownbeat = sub === 0;
    const beatLevel = isDownbeat ? Math.min(2, Math.max(0, this.accents[beat % beats] ?? 1)) : -1;

    if (isDownbeat && beatLevel > 0) {
      this.click(time, beatLevel === 2 ? 1760 : 1120, beatLevel === 2 ? 0.85 : 0.55, 0.055);
    } else if (isDownbeat && beatLevel === 0) {
      // muted beat: no click at all
    } else {
      this.click(time, 760, 0.22, 0.035);
    }

    this.queue.push({ time, beat, sub, level: beatLevel, isSubdivision: !isDownbeat });
  }

  private click(time: number, frequency: number, level: number, decay: number): void {
    if (!this.context || !this.master) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(frequency, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(level, time + 0.0015);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(time);
    osc.stop(time + decay + 0.02);
  }
}