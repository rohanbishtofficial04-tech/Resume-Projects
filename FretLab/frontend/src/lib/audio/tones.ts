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
    }
  });
}

export function stopAllTones(): void {
  if (!sharedContext) return;
  const at = sharedContext.currentTime;
  releaseVoices(activeVoices, at);
  activeVoices = [];
}

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

export function playStrum(frequencies: number[], strumGap = 0.045): void {
  if (frequencies.length === 0) return;
  const context = getAudioContext();
  const startTime = context.currentTime + 0.04;
  const level = Math.min(0.16, 0.5 / frequencies.length);
  frequencies.forEach((frequency, i) => {
    activeVoices.push(pluck(context, frequency, startTime + i * strumGap, 1.9, level));
  });
}

export function playNoteSequence(
  frequencies: number[],
  noteDuration = 0.4,
  noteGap = 0.43,
  pauseAfterIndex = -1,
  pauseDuration = 0,
): number {
  if (frequencies.length === 0) return 0;
  const context = getAudioContext();
  const startTime = context.currentTime + 0.04;
  const partials = [
    { multiple: 1, level: 0.11, decay: 1 },
    { multiple: 2, level: 0.035, decay: 0.68 },
    { multiple: 3, level: 0.014, decay: 0.46 },
    { multiple: 4, level: 0.006, decay: 0.32 },
  ];
  frequencies.forEach((frequency, index) => {
    const pauseOffset = index > pauseAfterIndex ? pauseDuration : 0;
    const noteStart = startTime + index * noteGap + pauseOffset;
    partials.forEach(({ multiple, level, decay }) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      const noteEnd = noteStart + noteDuration * decay;
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency * multiple, noteStart);
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.linearRampToValueAtTime(level, noteStart + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(noteStart);
      osc.stop(noteEnd + 0.03);
      activeVoices.push({ osc, gain });
    });
  });
  const sequencePause = frequencies.length - 1 > pauseAfterIndex ? pauseDuration : 0;
  return Math.ceil(((frequencies.length - 1) * noteGap + sequencePause + noteDuration) * 1000);
}
