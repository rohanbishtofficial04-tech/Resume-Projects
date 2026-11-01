const RMS_GATE = 0.003;
const MIN_FREQUENCY = 30;
const MAX_FREQUENCY = 1200;
const YIN_THRESHOLD = 0.14;
const MAX_YIN_CONFIDENCE = 0.28;

export function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  const sampleCount = Math.floor(buffer.length / 2);
  if (sampleCount < 1024 || !Number.isFinite(sampleRate) || sampleRate <= 0) return -1;

  let energy = 0;
  for (let i = 0; i < buffer.length; i += 1) energy += buffer[i] * buffer[i];
  if (Math.sqrt(energy / buffer.length) < RMS_GATE) return -1;

  const effectiveSampleRate = sampleRate / 2;
  const minLag = Math.max(2, Math.floor(effectiveSampleRate / MAX_FREQUENCY));
  const maxLag = Math.min(
    Math.floor(effectiveSampleRate / MIN_FREQUENCY),
    sampleCount - 1,
  );
  const normalizedDifference = new Float64Array(maxLag + 1);

  let cumulativeDifference = 0;
  let bestLag = -1;
  let bestConfidence = Number.POSITIVE_INFINITY;
  let thresholdCrossed = false;
  let valleyValue = Number.POSITIVE_INFINITY;
  for (let lag = 1; lag <= maxLag; lag += 1) {
    let sum = 0;
    const limit = sampleCount - lag;
    for (let i = 0; i < limit; i += 1) {
      const current = (buffer[i * 2] + buffer[i * 2 + 1]) * 0.5;
      const delayed = (buffer[(i + lag) * 2] + buffer[(i + lag) * 2 + 1]) * 0.5;
      const delta = current - delayed;
      sum += delta * delta;
    }
    cumulativeDifference += sum;
    normalizedDifference[lag] = cumulativeDifference === 0
      ? 1
      : (sum * lag) / cumulativeDifference;

    if (lag < minLag) continue;
    const confidence = normalizedDifference[lag];
    if (!thresholdCrossed) {
      if (confidence < bestConfidence) {
        bestConfidence = confidence;
        bestLag = lag;
      }
      if (confidence < YIN_THRESHOLD) {
        thresholdCrossed = true;
        bestLag = lag;
        valleyValue = confidence;
      }
    } else if (confidence < valleyValue) {
      bestLag = lag;
      valleyValue = confidence;
    } else {
      break;
    }
  }

  if (bestLag < minLag || normalizedDifference[bestLag] > MAX_YIN_CONFIDENCE) return -1;

  const previous = normalizedDifference[bestLag - 1];
  const current = normalizedDifference[bestLag];
  const next = normalizedDifference[Math.min(bestLag + 1, maxLag)];
  const denominator = previous - 2 * current + next;
  const refinedLag = denominator === 0
    ? bestLag
    : bestLag + 0.5 * (previous - next) / denominator;
  const frequency = effectiveSampleRate / refinedLag;
  if (!Number.isFinite(frequency) || frequency < MIN_FREQUENCY || frequency > MAX_FREQUENCY) return -1;
  return frequency;
}
