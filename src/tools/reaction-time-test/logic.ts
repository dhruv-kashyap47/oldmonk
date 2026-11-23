/**
 * Reaction test state and statistics. Framework-free: no Solid import, no DOM,
 * no network, no storage. Random delays come from the shared crypto helper.
 */

import { secureRandomInt } from "../../lib/random";

export const REACTION_ROUNDS = 5;
export const MIN_DELAY_MS = 1500;
export const MAX_DELAY_MS = 4500;

/** A round slower than twice the median gets a plain outlier note. */
export const OUTLIER_FACTOR = 2;

export type ReactionPhase =
  | "idle"
  | "waiting"
  | "ready"
  | "tooSoon"
  | "result"
  | "summary";

export interface ReactionRun {
  readonly phase: ReactionPhase;
  /** One-based round in play, from 1 to 5. */
  readonly round: number;
  /** Completed reaction times in milliseconds, in the order they were recorded. */
  readonly times: readonly number[];
}

export interface ReactionStats {
  readonly count: number;
  readonly mean: number;
  readonly median: number;
  readonly best: number;
  readonly worst: number;
  /** Zero-based indexes of rounds that were much slower than the median. */
  readonly outliers: readonly number[];
}

export const initialReactionRun: ReactionRun = {
  phase: "idle",
  round: 1,
  times: [],
};

/** Uniform delay between the start of a round and the signal. */
export function randomReactionDelay(): number {
  return MIN_DELAY_MS + secureRandomInt(MAX_DELAY_MS - MIN_DELAY_MS + 1);
}

export function beginWaiting(run: ReactionRun): ReactionRun {
  return { ...run, phase: "waiting" };
}

export function markReady(run: ReactionRun): ReactionRun {
  if (run.phase !== "waiting") return run;
  return { ...run, phase: "ready" };
}

/**
 * A click before the signal. The round stays at the same number and no time is
 * recorded, so an early click costs an attempt but not a data point.
 */
export function markTooSoon(run: ReactionRun): ReactionRun {
  if (run.phase !== "waiting") return run;
  return { ...run, phase: "tooSoon" };
}

export function recordReaction(run: ReactionRun, timeMs: number): ReactionRun {
  if (run.phase !== "ready") return run;
  if (!Number.isFinite(timeMs) || timeMs < 0) return run;

  const times = [...run.times, timeMs];
  if (times.length >= REACTION_ROUNDS) {
    return { phase: "summary", round: REACTION_ROUNDS, times };
  }
  return { phase: "result", round: run.round + 1, times };
}

export function summarizeReaction(times: readonly number[]): ReactionStats | null {
  const valid = times.filter((time) => Number.isFinite(time) && time >= 0);
  const count = valid.length;
  if (count === 0) return null;

  const sorted = [...valid].sort((a, b) => a - b);
  let total = 0;
  for (const time of valid) total += time;
  const mean = total / count;
  const middle = Math.floor(count / 2);
  const median =
    count % 2 === 1
      ? (sorted[middle] as number)
      : ((sorted[middle - 1] as number) + (sorted[middle] as number)) / 2;

  const outliers: number[] = [];
  for (let index = 0; index < valid.length; index += 1) {
    const time = valid[index] as number;
    if (isSlowRound(time, median)) outliers.push(index);
  }

  return {
    count,
    mean,
    median,
    best: sorted[0] as number,
    worst: sorted[count - 1] as number,
    outliers,
  };
}

export function isSlowRound(timeMs: number, medianMs: number): boolean {
  return Number.isFinite(timeMs) && Number.isFinite(medianMs) && medianMs > 0
    ? timeMs > medianMs * OUTLIER_FACTOR
    : false;
}
