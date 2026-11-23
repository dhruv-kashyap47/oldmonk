/**
 * Click speed statistics. Framework-free: no Solid import, no DOM, no network,
 * no storage.
 */

export const CLICK_WINDOW_MS = 10_000;

/**
 * Two click events closer than this are treated as one. It removes a
 * duplicated synthetic tap or a bounce without rejecting a human cadence.
 */
export const MIN_CLICK_GAP_MS = 40;

export interface ClickResult {
  readonly count: number;
  readonly cps: number;
  readonly durationMs: number;
  readonly intervals: readonly number[];
  readonly averageIntervalMs: number | null;
  readonly fastestIntervalMs: number | null;
  /** Steadiness of the gaps between clicks, 0 to 100. */
  readonly consistency: number;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clicksPerSecond(count: number, durationMs: number): number {
  if (!Number.isFinite(count) || count < 0) return 0;
  if (!Number.isFinite(durationMs) || durationMs <= 0) return 0;
  return round1(count / (durationMs / 1000));
}

/**
 * Steadiness of the gaps between clicks: `100 * (1 - standard deviation /
 * mean)`. It needs at least two gaps, otherwise there is nothing to compare
 * and the score is zero.
 */
export function intervalConsistency(intervals: readonly number[]): number {
  if (intervals.length < 2) return 0;
  let total = 0;
  for (const interval of intervals) total += interval;
  const average = total / intervals.length;
  if (average <= 0) return 0;

  let variance = 0;
  for (const interval of intervals) {
    const delta = interval - average;
    variance += delta * delta;
  }
  variance /= intervals.length;
  const deviation = Math.sqrt(variance);
  return round1(clamp(100 * (1 - deviation / average), 0, 100));
}

export function summarizeClicks(
  timestamps: readonly number[],
  durationMs: number = CLICK_WINDOW_MS,
): ClickResult {
  const valid = timestamps
    .filter((time) => Number.isFinite(time) && time >= 0)
    .slice()
    .sort((a, b) => a - b);
  const duration = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0;
  const count = valid.length;

  const intervals: number[] = [];
  for (let index = 1; index < valid.length; index += 1) {
    intervals.push((valid[index] as number) - (valid[index - 1] as number));
  }

  let total = 0;
  for (const interval of intervals) total += interval;
  const averageIntervalMs = intervals.length > 0 ? total / intervals.length : null;
  const fastestIntervalMs = intervals.length > 0 ? Math.min(...intervals) : null;

  return {
    count,
    cps: clicksPerSecond(count, duration),
    durationMs: duration,
    intervals,
    averageIntervalMs,
    fastestIntervalMs,
    consistency: intervalConsistency(intervals),
  };
}

/** False when the new click is too close to the previous accepted click. */
export function shouldAcceptClick(
  elapsedMs: number,
  lastAcceptedMs: number | null,
): boolean {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) return false;
  if (lastAcceptedMs === null) return true;
  if (!Number.isFinite(lastAcceptedMs) || lastAcceptedMs < 0) return true;
  return elapsedMs - lastAcceptedMs >= MIN_CLICK_GAP_MS;
}
