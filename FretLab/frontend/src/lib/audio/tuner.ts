import { autoCorrelate } from "./pitch";

export type TunerErrorKind = "permission-denied" | "no-microphone" | "insecure-context" | "unknown";

export interface TunerStartResult {
  ok: boolean;
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

/**
 * Owns the microphone stream, the analyser, and the detection loop.
 * `stop()` releases every audio resource it created.
 */
export class TunerEngine {
  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private frame: number | null = null;
  private active = false;

  /** Called with a detected frequency in Hz, or -1 when nothing is heard. */
  onFrequency: ((frequency: number) => void) | null = null;

  get listening(): boolean {
    return this.active;
  }

  async start(): Promise<TunerStartResult> {
    if (this.active) return { ok: true };

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
      const context = new (audioContextCtor())();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0;
      source.connect(analyser);

      this.context = context;
      this.stream = stream;
      this.source = source;
      this.analyser = analyser;
      this.active = true;

      if (context.state === "suspended") await context.resume();

      const buffer = new Float32Array(analyser.fftSize);
      const sampleRate = context.sampleRate;

      const tick = () => {
        if (!this.active || !this.analyser) return;
        this.analyser.getFloatTimeDomainData(buffer);
        this.onFrequency?.(autoCorrelate(buffer, sampleRate));
        this.frame = window.requestAnimationFrame(tick);
      };
      this.frame = window.requestAnimationFrame(tick);

      return { ok: true };
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      await this.releaseStream();
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
    this.active = false;
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
