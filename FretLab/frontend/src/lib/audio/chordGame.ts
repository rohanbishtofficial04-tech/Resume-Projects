const MIN_NOTE_MIDI = 33;
const MAX_NOTE_MIDI = 88;
const MAX_ANALYSIS_FREQUENCY = 1100;
const PEAK_FLOOR_DB = -68;
const PEAK_RELATIVE_THRESHOLD_DB = 40;
const MAX_NOTE_CENTS = 45;
const HARMONIC_SUPPRESSION_DB = 6;
const HARMONIC_TOLERANCE_CENTS = 36;
const STRUM_RMS_FLOOR = 0.002;
const STRUM_RMS_MULTIPLIER = 2.2;
const STRUM_ONSET_MULTIPLIER = 1.35;
const STRUM_CAPTURE_MS = 500;
const STRUM_COOLDOWN_MS = 250;
const NOISE_CALIBRATION_MS = 250;

interface SpectralPeak {
  frequency: number;
  level: number;
}

export type ChordGameAudioError = "permission-denied" | "no-microphone" | "insecure-context" | "unknown";

export interface ChordGameAudioStartResult {
  ok: boolean;
  cancelled?: boolean;
  kind?: ChordGameAudioError;
  message?: string;
}

type AudioContextCtor = new () => AudioContext;

function audioContextCtor(): AudioContextCtor {
  const win = window as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  const Ctor = win.AudioContext ?? win.webkitAudioContext;
  if (!Ctor) throw new Error("Web Audio API is not available in this browser.");
  return Ctor;
}

export function detectPlayedPitchClasses(
  spectrum: Float32Array,
  sampleRate: number,
  fftSize: number,
): Set<number> {
  const maxBin = Math.min(
    Math.floor((MAX_ANALYSIS_FREQUENCY * fftSize) / sampleRate),
    spectrum.length - 2,
  );
  let peakDb = Number.NEGATIVE_INFINITY;
  for (let bin = 2; bin <= maxBin; bin += 1) peakDb = Math.max(peakDb, spectrum[bin]);
  if (peakDb < PEAK_FLOOR_DB) return new Set();

  const thresholdDb = Math.max(PEAK_FLOOR_DB, peakDb - PEAK_RELATIVE_THRESHOLD_DB);
  const peaks: SpectralPeak[] = [];
  for (let bin = 2; bin <= maxBin; bin += 1) {
    const level = spectrum[bin];
    if (level < thresholdDb || level < spectrum[bin - 1] || level < spectrum[bin + 1]) continue;

    const left = spectrum[bin - 1];
    const right = spectrum[bin + 1];
    const denominator = left - 2 * level + right;
    const offset = denominator === 0 ? 0 : Math.max(-0.5, Math.min(0.5, 0.5 * (left - right) / denominator));
    const frequency = ((bin + offset) * sampleRate) / fftSize;
    if (frequency > 0) peaks.push({ frequency, level });
  }

  peaks.sort((a, b) => a.frequency - b.frequency);
  const pitchClasses = new Set<number>();
  peaks.forEach((peak, index) => {
    const exactMidi = 69 + 12 * Math.log2(peak.frequency / 440);
    const midi = Math.round(exactMidi);
    const cents = (exactMidi - midi) * 100;
    if (midi < MIN_NOTE_MIDI || midi > MAX_NOTE_MIDI || Math.abs(cents) > MAX_NOTE_CENTS) return;

    const isStrongHarmonic = peaks.slice(0, index).some((lowerPeak) => {
      if (lowerPeak.level < peak.level + HARMONIC_SUPPRESSION_DB) return false;
      const harmonic = Math.round(peak.frequency / lowerPeak.frequency);
      if (harmonic < 2 || harmonic > 8) return false;
      const harmonicCents = 1200 * Math.log2(peak.frequency / (lowerPeak.frequency * harmonic));
      return Math.abs(harmonicCents) <= HARMONIC_TOLERANCE_CENTS;
    });
    if (!isStrongHarmonic) pitchClasses.add(((midi % 12) + 12) % 12);
  });
  return pitchClasses;
}

export class ChordGameAudioEngine {
  private context: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private highPass: BiquadFilterNode | null = null;
  private lowPass: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;
  private frame: number | null = null;
  private generation = 0;
  private active = false;
  private lastAnalysisAt = 0;
  private lastStrumAt = Number.NEGATIVE_INFINITY;
  private captureUntil = 0;
  private noiseRms = 0.001;
  private previousRms = 0;
  private startedAt = 0;

  onPitchClasses: ((
    pitchClasses: Set<number> | null,
    strumStarted: boolean,
    captureActive: boolean,
  ) => void) | null = null;

  async start(): Promise<ChordGameAudioStartResult> {
    if (this.active) return { ok: true };
    const generation = ++this.generation;
    if (typeof window !== "undefined" && !window.isSecureContext) {
      return { ok: false, kind: "insecure-context", message: "Microphone input needs a secure (https) connection." };
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      return { ok: false, kind: "no-microphone", message: "This browser does not expose microphone input." };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      if (generation !== this.generation) {
        stream.getTracks().forEach((track) => track.stop());
        return { ok: false, cancelled: true };
      }

      this.stream = stream;
      const context = new (audioContextCtor())();
      this.context = context;
      const source = context.createMediaStreamSource(stream);
      this.source = source;
      const highPass = context.createBiquadFilter();
      highPass.type = "highpass";
      highPass.frequency.value = 35;
      highPass.Q.value = Math.SQRT1_2;
      this.highPass = highPass;
      const lowPass = context.createBiquadFilter();
      lowPass.type = "lowpass";
      lowPass.frequency.value = 1100;
      lowPass.Q.value = Math.SQRT1_2;
      this.lowPass = lowPass;
      const analyser = context.createAnalyser();
      analyser.fftSize = 8192;
      analyser.smoothingTimeConstant = 0;
      this.analyser = analyser;

      source.connect(highPass);
      highPass.connect(lowPass);
      lowPass.connect(analyser);
      if (context.state === "suspended") await context.resume();
      if (generation !== this.generation) {
        this.stop();
        return { ok: false, cancelled: true };
      }

      this.active = true;
      const timeData = new Float32Array(analyser.fftSize);
      const frequencyData = new Float32Array(analyser.frequencyBinCount);
      this.lastStrumAt = Number.NEGATIVE_INFINITY;
      this.captureUntil = 0;
      this.noiseRms = 0.001;
      this.previousRms = 0;
      this.startedAt = performance.now();
      const interval = 30;
      const tick = (timestamp: number) => {
        if (!this.active || !this.analyser) return;
        if (timestamp - this.lastAnalysisAt >= interval) {
          this.lastAnalysisAt = timestamp;
          analyser.getFloatTimeDomainData(timeData);
          let energy = 0;
          const onsetSampleCount = Math.min(2048, timeData.length);
          for (let index = timeData.length - onsetSampleCount; index < timeData.length; index += 1) {
            energy += timeData[index] * timeData[index];
          }
          const rms = Math.sqrt(energy / onsetSampleCount);
          const calibrating = timestamp - this.startedAt < NOISE_CALIBRATION_MS;
          let strumStarted = false;
          if (calibrating) {
            this.noiseRms = this.noiseRms * 0.9 + rms * 0.1;
          } else if (timestamp >= this.captureUntil) {
            if (rms < Math.max(STRUM_RMS_FLOOR, this.noiseRms * 1.5)) {
              this.noiseRms = this.noiseRms * 0.95 + rms * 0.05;
            }
            const isStrumOnset =
              rms > Math.max(STRUM_RMS_FLOOR, this.noiseRms * STRUM_RMS_MULTIPLIER) &&
              rms > this.previousRms * STRUM_ONSET_MULTIPLIER &&
              timestamp - this.lastStrumAt >= STRUM_COOLDOWN_MS;
            if (isStrumOnset) {
              this.lastStrumAt = timestamp;
              this.captureUntil = timestamp + STRUM_CAPTURE_MS;
              strumStarted = true;
            }
          }
          this.previousRms = rms;
          const captureActive = !calibrating && timestamp < this.captureUntil;
          if (!captureActive) {
            this.onPitchClasses?.(null, false, false);
          } else {
            analyser.getFloatFrequencyData(frequencyData);
            const detected = detectPlayedPitchClasses(frequencyData, context.sampleRate, analyser.fftSize);
            this.onPitchClasses?.(detected.size > 0 ? detected : null, strumStarted, true);
          }
        }
        this.frame = window.requestAnimationFrame(tick);
      };
      this.frame = window.requestAnimationFrame(tick);
      return { ok: true };
    } catch (error) {
      if (generation !== this.generation) return { ok: false, cancelled: true };
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
    this.generation += 1;
    this.active = false;
    this.lastAnalysisAt = 0;
    this.captureUntil = 0;
    this.lastStrumAt = Number.NEGATIVE_INFINITY;
    this.previousRms = 0;
    if (this.frame !== null) window.cancelAnimationFrame(this.frame);
    this.frame = null;
    this.source?.disconnect();
    this.highPass?.disconnect();
    this.lowPass?.disconnect();
    this.analyser?.disconnect();
    this.source = null;
    this.highPass = null;
    this.lowPass = null;
    this.analyser = null;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    if (this.context && this.context.state !== "closed") void this.context.close();
    this.context = null;
    this.onPitchClasses?.(null, false, false);
  }
}
