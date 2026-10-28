/** Shared Web Audio tone sources: reference pitches, chord strums, metronome clicks. */

let sharedContext: AudioContext | null = null;

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

/** Lazily created, shared for the session — always called from a user gesture. */
export function getAudioContext(): AudioContext {
  const context = sharedContext ?? new (audioContextCtor())();
  sharedContext = context;
  if (context.state === "suspended") void context.resume();
  return context;
}

interface ActiveVoice {
  osc: OscillatorNode;
  gain: GainNode;
}

let activeVoices: ActiveVoice[] = [];

function pluck(context: AudioContext, frequency: number, startTime: number, duration: number, level: number): ActiveVoice {
  const osc = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();

  osc.type = "triangle";
  osc.frequency.value = frequency;
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(Math.min(7000, frequency * 7), startTime);
  filter.frequency.exponentialRampToValueAtTime(Math.max(220, frequency * 2), startTime + duration);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(level, startTime + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
  return { osc, gain };
}

function releaseVoices(voices: ActiveVoice[], at: number): void {
  voices.forEach(({ osc, gain }) => {
    try {
      gain.gain.cancelScheduledValues(at);
      gain.gain.setTargetAtTime(0.0001, at, 0.02);
      osc.stop(at + 0.12);
    } catch {
      /* already stopped */
    }
  });
}

/** Fades out anything still ringing (used before a new preview / on unmount). */
export function stopAllTones(): void {
  if (!sharedContext) return;
  const at = sharedContext.currentTime;
  releaseVoices(activeVoices, at);
  activeVoices = [];
}

/** Plucked-string reference pitch with upper harmonics that decay quickly. */
export function playReferenceTone(frequency: number, duration = 2): void {
  const context = getAudioContext();
  const startTime = context.currentTime + 0.02;
  const harmonics = [
    { multiple: 1, level: frequency < 110 ? 0.15 : 0.12, decay: 1 },
    { multiple: 2, level: frequency < 110 ? 0.09 : 0.045, decay: 0.72 },
    { multiple: 3, level: frequency < 110 ? 0.045 : 0.02, decay: 0.5 },
    { multiple: 4, level: frequency < 110 ? 0.018 : 0.01, decay: 0.36 },
    { multiple: 5, level: frequency < 110 ? 0.008 : 0.005, decay: 0.25 },
  ];

  harmonics.forEach(({ multiple, level, decay }) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    const noteDuration = Math.max(0.1, duration * decay);
    osc.type = "sine";
    osc.frequency.value = frequency * multiple;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(level, startTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + noteDuration);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(startTime);
    osc.stop(startTime + noteDuration + 0.05);
    activeVoices.push({ osc, gain });
  });
}

/** Staggered strum of a set of frequencies (chord preview). */
export function playStrum(frequencies: number[], strumGap = 0.045): void {
  if (frequencies.length === 0) return;
  const context = getAudioContext();
  const startTime = context.currentTime + 0.04;
  const level = Math.min(0.16, 0.5 / frequencies.length);
  frequencies.forEach((frequency, i) => {
    activeVoices.push(pluck(context, frequency, startTime + i * strumGap, 1.9, level));
  });
}

/** Plays notes in order and returns the scheduled sequence duration in milliseconds. */
export function playNoteSequence(frequencies: number[], noteDuration = 0.32, noteGap = 0.38): number {
  if (frequencies.length === 0) return 0;
  const context = getAudioContext();
  const startTime = context.currentTime + 0.04;
  frequencies.forEach((frequency, index) => {
    activeVoices.push(pluck(context, frequency, startTime + index * noteGap, noteDuration, 0.14));
  });
  return Math.ceil(((frequencies.length - 1) * noteGap + noteDuration) * 1000);
}
