/**
 * Sequence memory rules. Framework-free: no Solid import, no DOM, no network,
 * no storage. The only randomness comes from the shared crypto helper.
 */

import { secureRandomInt } from "../../lib/random";

export const GRID_SIZE = 9;
export const BASE_FLASH_MS = 460;
export const MIN_FLASH_MS = 260;
export const FLASH_STEP_MS = 20;
export const GAP_MS = 450;

export type DrawInt = (maxExclusive: number) => number;

export type MemoryPhase = "idle" | "playback" | "input" | "over";

export interface MemoryRun {
  /** One-based level, equal to the sequence length while playing. */
  readonly level: number;
  /** Levels fully cleared so far. */
  readonly cleared: number;
  readonly sequence: readonly number[];
  /** Next expected position in the sequence. */
  readonly cursor: number;
  readonly phase: MemoryPhase;
}

export type MemoryInputOutcome = "correct" | "wrong" | "complete" | "ignored";

export interface MemoryInputResult {
  readonly run: MemoryRun;
  readonly outcome: MemoryInputOutcome;
}

/**
 * Draws one tile, never equal to the previous tile. `draw` is called with
 * `GRID_SIZE - 1` choices and the skipped value is filled by shifting up, so
 * every other tile keeps the same probability.
 */
export function nextTile(previous: number | null, draw: DrawInt = secureRandomInt): number {
  const choices = GRID_SIZE - 1;
  const value = draw(choices);
  if (!Number.isInteger(value) || value < 0 || value >= choices) {
    throw new RangeError(`draw must return an integer from 0 to ${choices - 1}.`);
  }
  const validPrevious =
    previous !== null &&
    Number.isInteger(previous) &&
    previous >= 0 &&
    previous < GRID_SIZE
      ? previous
      : null;
  if (validPrevious !== null && value >= validPrevious) return value + 1;
  return value;
}

/** Appends steps to a sequence, skipping an immediate repeat each time. */
export function extendSequence(
  sequence: readonly number[],
  steps: number,
  draw: DrawInt = secureRandomInt,
): readonly number[] {
  if (!Number.isSafeInteger(steps) || steps < 0) {
    throw new RangeError("steps must be a non-negative safe integer.");
  }
  const output = [...sequence];
  for (let index = 0; index < steps; index += 1) {
    const previous = output.length > 0 ? (output[output.length - 1] as number) : null;
    output.push(nextTile(previous, draw));
  }
  return output;
}

export function startMemoryRun(draw: DrawInt = secureRandomInt): MemoryRun {
  return {
    level: 1,
    cleared: 0,
    sequence: extendSequence([], 1, draw),
    cursor: 0,
    phase: "playback",
  };
}

export function beginInput(run: MemoryRun): MemoryRun {
  if (run.phase === "over") return run;
  return { ...run, phase: "input", cursor: 0 };
}

/** Starts the next level after a completed sequence. */
export function advanceLevel(run: MemoryRun, draw: DrawInt = secureRandomInt): MemoryRun {
  if (run.phase === "over") return run;
  return {
    level: run.level + 1,
    cleared: run.level,
    sequence: extendSequence(run.sequence, 1, draw),
    cursor: 0,
    phase: "playback",
  };
}

export function applyMemoryInput(run: MemoryRun, tile: number): MemoryInputResult {
  if (run.phase !== "input") return { run, outcome: "ignored" };
  if (!Number.isInteger(tile) || tile < 0 || tile >= GRID_SIZE) {
    return { run, outcome: "ignored" };
  }
  const expected = run.sequence[run.cursor];
  if (expected === undefined) return { run, outcome: "ignored" };

  if (tile !== expected) {
    return { run: { ...run, phase: "over" }, outcome: "wrong" };
  }

  const cursor = run.cursor + 1;
  if (cursor >= run.sequence.length) {
    return { run: { ...run, cursor: 0 }, outcome: "complete" };
  }
  return { run: { ...run, cursor }, outcome: "correct" };
}

/** Levels cleared, which is the score stored as the best run. */
export function memoryScore(run: MemoryRun): number {
  return run.cleared;
}

/** Playback flash gets shorter as levels rise, then stops at 260 ms. */
export function flashDurationMs(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return Math.max(MIN_FLASH_MS, BASE_FLASH_MS - (safeLevel - 1) * FLASH_STEP_MS);
}

export interface PlaybackTiming {
  readonly flashMs: number;
  readonly gapMs: number;
}

/** Reduced motion shortens both the flash and the gap between tiles. */
export function playbackTiming(level: number, reducedMotion: boolean): PlaybackTiming {
  const flash = flashDurationMs(level);
  if (!reducedMotion) return { flashMs: flash, gapMs: GAP_MS };
  return {
    flashMs: Math.max(140, Math.round(flash * 0.5)),
    gapMs: Math.round(GAP_MS * 0.5),
  };
}

/** Keys 1 to 9 map to the nine tiles in reading order. */
export function keyToTile(key: string): number | null {
  if (key.length !== 1) return null;
  const code = key.charCodeAt(0);
  if (code >= 49 && code <= 57) return code - 49;
  return null;
}
