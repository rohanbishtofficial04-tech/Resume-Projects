import { autoCorrelate } from "./pitch";

export type TunerErrorKind = "permission-denied" | "no-microphone" | "insecure-context" | "unknown";

export interface TunerStartResult {
  ok: boolean;
  cancelled?: boolean;
  kind?: TunerErrorKind;
  message?: string;
}

type AudioContextCtor = new () => AudioContext;

function audioContextCtor(): AudioContextCtor {
  const w = window as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  const Ctor = w.AudioContext ?? w.webkitAudioContext;
  if (!Ctor) throw new Error("Web Audio API is not available in this browser.");
  return Ctor;
}

export class TunerEngine {
  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private frame: number | null = null;
  private active = false;
  private startGeneration = 0;
  private lastAnalysisAt = 0;
  private recentFrequencies: number[] = [];

  onFrequency: ((frequency: number) => void) | null = null;

  get listening(): boolean {
    return this.active;
  }

  async start(): Promise<TunerStartResult> {
    if (this.active) return { ok: true };
    const generation = ++this.startGeneration;

    if (typeof window !== "undefined" && window.isSecureContext === false) {
      return {
        ok: false,
        kind: "insecure-context",
        message: "Microphone input needs a secure (https) connection.",
      };
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      return { ok: false, kind: "no-microphone", message: "This browser does not expose microphone input." };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      if (generation !== this.startGeneration) {
        stream.getTracks().forEach((track) => track.stop());
        return { ok: false, cancelled: true };
      }
      this.stream = stream;
      const context = new (audioContextCtor())();
      this.context = context;
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 8192;
      analyser.smoothingTimeConstant = 0;
      source.connect(analyser);

      this.source = source;
      this.analyser = analyser;

      if (context.state === "suspended") await context.resume();
      if (generation !== this.startGeneration) {
        this.stop();
        return { ok: false, cancelled: true };
      }
      this.active = true;

      const buffer = new Float32Array(analyser.fftSize);
      const sampleRate = context.sampleRate;

      const tick = (timestamp: number) => {
        if (!this.active || !this.analyser) return;
        if (timestamp - this.lastAnalysisAt >= 40) {
          this.lastAnalysisAt = timestamp;
          this.analyser.getFloatTimeDomainData(buffer);
          const frequency = autoCorrelate(buffer, sampleRate);
          if (frequency > 0) {
            this.recentFrequencies.push(frequency);
            if (this.recentFrequencies.length > 5) this.recentFrequencies.shift();
            const sortedFrequencies = [...this.recentFrequencies].sort((a, b) => a - b);
            this.onFrequency?.(sortedFrequencies[Math.floor(sortedFrequencies.length / 2)]);
          } else {
            this.recentFrequencies = [];
            this.onFrequency?.(-1);
          }
        }
        this.frame = window.requestAnimationFrame(tick);
      };
      this.frame = window.requestAnimationFrame(tick);

      return { ok: true };
    } catch (error) {
      if (generation !== this.startGeneration) return { ok: false, cancelled: true };
      this.stop();
      const name = error instanceof DOMException ? error.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        return {
          ok: false,
          kind: "permission-denied",
          message: "Microphone blocked. Allow access for this site in your browser settings, then try again.",
        };
      }
      if (name === "NotFoundError" || name === "OverconstrainedError" || name === "NotReadableError") {
        return { ok: false, kind: "no-microphone", message: "No usable microphone was found on this device." };
      }
      return {
        ok: false,
        kind: "unknown",
        message: error instanceof Error ? error.message : "Unable to start the microphone.",
      };
    }
  }

  stop(): void {
    this.startGeneration += 1;
    this.active = false;
    this.recentFrequencies = [];
    this.lastAnalysisAt = 0;
    if (this.frame !== null) {
      window.cancelAnimationFrame(this.frame);
      this.frame = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    void this.releaseStream();
    if (this.context && this.context.state !== "closed") void this.context.close();
    this.context = null;
    this.onFrequency?.(-1);
  }

  private async releaseStream(): Promise<void> {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }
}
