const RMS_GATE = 0.008;
const CLARITY_GATE = 0.6;

export function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  const size = buffer.length;
  let rms = 0;
  for (let i = 0; i < size; i += 1) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / size);
  if (rms < RMS_GATE) return -1;

  let start = 0;
  let end = size - 1;
  const threshold = 0.2;
  for (let i = 0; i < size / 2; i += 1) {
    if (Math.abs(buffer[i]) < threshold) {
      start = i;
      break;
    }
  }
  for (let i = 1; i < size / 2; i += 1) {
    if (Math.abs(buffer[size - i]) < threshold) {
      end = size - i;
      break;
    }
  }

  const window = buffer.slice(start, end);
  const windowSize = window.length;
  if (windowSize < 128) return -1;

  const correlation = new Float32Array(windowSize);
  for (let lag = 0; lag < windowSize; lag += 1) {
    let sum = 0;
    for (let i = 0; i < windowSize - lag; i += 1) sum += window[i] * window[i + lag];
    correlation[lag] = sum;
  }

  let offset = 0;
  while (offset + 1 < windowSize && correlation[offset] > correlation[offset + 1]) offset += 1;

  let bestLag = -1;
  let bestValue = -1;
  for (let lag = offset; lag < windowSize; lag += 1) {
    if (correlation[lag] > bestValue) {
      bestValue = correlation[lag];
      bestLag = lag;
    }
  }
  if (bestLag <= 0) return -1;

  const clarity = bestValue / correlation[0];
  if (clarity < CLARITY_GATE) return -1;

  const x1 = correlation[bestLag - 1] ?? 0;
  const x2 = correlation[bestLag];
  const x3 = correlation[bestLag + 1] ?? 0;
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  let refined = bestLag;
  if (a !== 0) refined = bestLag - b / (2 * a);

  const frequency = sampleRate / refined;
  if (!Number.isFinite(frequency) || frequency < 55 || frequency > 1500) return -1;
  return frequency;
}