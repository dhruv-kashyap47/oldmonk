import { readStoredJson, writeStoredJson } from "../../lib/storage";

export interface ScoreRecord {
  readonly best: number;
  readonly at: string;
}

function key(name: string): string {
  return `score:${name}`;
}

/** Best score for a test, or null when none was recorded. */
export function readBest(name: string): number | null {
  const record = readStoredJson<ScoreRecord | null>(key(name), null);
  return record && Number.isFinite(record.best) ? record.best : null;
}

/**
 * Saves a score when it beats the stored one. `higherIsBetter` is false for
 * reaction time, where a smaller number wins.
 */
export function recordScore(
  name: string,
  value: number,
  higherIsBetter = true,
): { best: number; isBest: boolean } {
  const current = readBest(name);
  const isBest =
    current === null || (higherIsBetter ? value > current : value < current);
  const best = isBest ? value : (current as number);
  if (isBest) {
    writeStoredJson(key(name), { best: value, at: new Date().toISOString() });
  }
  return { best, isBest };
}

/** Clears the score for one test. */
export function clearBest(name: string): void {
  writeStoredJson(key(name), null);
}
