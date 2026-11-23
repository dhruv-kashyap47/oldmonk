/**
 * Typing test scoring and character state. Framework-free: no Solid import,
 * no DOM, no network, no storage.
 */

export const WORD_CHARS = 5;
export const TYPING_MODES = [15, 30, 60] as const;

export type TypingMode = (typeof TYPING_MODES)[number];

export type CharState = "pending" | "correct" | "wrong" | "extra";

/** One recorded change in the input length, in milliseconds since the start. */
export interface TypingChange {
  readonly at: number;
  readonly length: number;
}

export interface TypingResult {
  /** Net words per minute: correct characters divided by five, per minute. */
  readonly wpm: number;
  /** Raw words per minute: every typed character divided by five, per minute. */
  readonly rawWpm: number;
  /** Correct characters as a share of characters typed, 0 to 100. */
  readonly accuracy: number;
  /** Steadiness of per-second speed, 0 to 100. */
  readonly consistency: number;
  readonly correctChars: number;
  readonly typedChars: number;
  /** Wrong and extra characters together. */
  readonly errors: number;
  readonly durationMs: number;
}

export interface TypingResultInput {
  readonly expected: string;
  readonly typed: string;
  readonly elapsedMs: number;
  /** Input length over time, used for the consistency samples. */
  readonly changes?: readonly TypingChange[];
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function mean(values: readonly number[]): number {
  if (values.length === 0) return 0;
  let total = 0;
  for (const value of values) total += value;
  return total / values.length;
}

/**
 * One state per passage character, plus one `extra` entry for each character
 * typed past the end of the passage. A blank typed slot is `pending`.
 */
export function characterStates(expected: string, typed: string): CharState[] {
  const length = Math.max(expected.length, typed.length);
  const states: CharState[] = [];
  for (let index = 0; index < length; index += 1) {
    if (index >= expected.length) {
      states.push("extra");
      continue;
    }
    const typedChar = typed.charAt(index);
    if (typedChar === "") {
      states.push("pending");
    } else if (typedChar === expected.charAt(index)) {
      states.push("correct");
    } else {
      states.push("wrong");
    }
  }
  return states;
}

export function countCorrect(states: readonly CharState[]): number {
  let correct = 0;
  for (const state of states) {
    if (state === "correct") correct += 1;
  }
  return correct;
}

export function countCorrectChars(expected: string, typed: string): number {
  const limit = Math.min(expected.length, typed.length);
  let correct = 0;
  for (let index = 0; index < limit; index += 1) {
    if (typed.charAt(index) === expected.charAt(index)) correct += 1;
  }
  return correct;
}

/** Correct characters over characters typed. An empty input counts as 100. */
export function accuracyPercent(expected: string, typed: string): number {
  if (typed.length === 0) return 100;
  return round1((countCorrectChars(expected, typed) / typed.length) * 100);
}

/** Net words per minute at five characters per word. */
export function wpm(correctChars: number, elapsedMs: number): number {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0 || correctChars <= 0) return 0;
  return round1(correctChars / WORD_CHARS / (elapsedMs / 60_000));
}

/** Raw words per minute, counting every typed character including extras. */
export function rawWpm(typedChars: number, elapsedMs: number): number {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0 || typedChars <= 0) return 0;
  return round1(typedChars / WORD_CHARS / (elapsedMs / 60_000));
}

/**
 * Steadiness of a sample series: `100 * (1 - standard deviation / mean)`.
 * A flat series scores 100, a series with no speed scores 0, and the result is
 * clamped so a single wild second cannot push it below zero.
 */
export function consistencyScore(samples: readonly number[]): number {
  if (samples.length === 0) return 0;
  const average = mean(samples);
  if (average <= 0) return 0;
  let variance = 0;
  for (const sample of samples) {
    const delta = sample - average;
    variance += delta * delta;
  }
  variance /= samples.length;
  const deviation = Math.sqrt(variance);
  return round1(clamp(100 * (1 - deviation / average), 0, 100));
}

/**
 * Per-second raw WPM from input length changes. Each completed second becomes
 * one sample: characters added during that second times twelve. The final
 * partial second is left out so a stopped clock cannot fake a slow last bar.
 */
export function wpmSamples(
  changes: readonly TypingChange[],
  durationMs: number,
): number[] {
  if (!Number.isFinite(durationMs) || durationMs < 1000 || changes.length === 0) {
    return [];
  }
  const sorted = [...changes].sort((a, b) => a.at - b.at);
  const fullSeconds = Math.floor(durationMs / 1000);
  const samples: number[] = [];
  let changeIndex = 0;
  let currentLength = 0;
  let previousLength = 0;

  for (let second = 1; second <= fullSeconds; second += 1) {
    const boundary = second * 1000;
    while (changeIndex < sorted.length) {
      const change = sorted[changeIndex];
      if (!change || change.at > boundary) break;
      currentLength = Math.max(0, change.length);
      changeIndex += 1;
    }
    const added = Math.max(0, currentLength - previousLength);
    samples.push(round1(added * 12));
    previousLength = currentLength;
  }
  return samples;
}

export function computeTypingResult(input: TypingResultInput): TypingResult {
  const elapsed = Number.isFinite(input.elapsedMs) ? Math.max(0, input.elapsedMs) : 0;
  const correctChars = countCorrectChars(input.expected, input.typed);
  const typedChars = input.typed.length;

  return {
    wpm: wpm(correctChars, elapsed),
    rawWpm: rawWpm(typedChars, elapsed),
    accuracy: accuracyPercent(input.expected, input.typed),
    consistency: consistencyScore(wpmSamples(input.changes ?? [], elapsed)),
    correctChars,
    typedChars,
    errors: Math.max(0, typedChars - correctChars),
    durationMs: elapsed,
  };
}

/**
 * Repeats the practice passages, separated by one space, until the text is at
 * least `minChars` long. A 60 second run needs more text than one passage.
 */
export function buildTestText(
  passages: readonly string[],
  minChars: number,
  startIndex = 0,
): string {
  const clean = passages.map((passage) => passage.trim()).filter((passage) => passage.length > 0);
  if (clean.length === 0) return "";
  const target = Math.max(0, Math.floor(minChars));
  const start = ((startIndex % clean.length) + clean.length) % clean.length;
  const parts: string[] = [];
  let length = 0;
  let index = 0;

  while (length < target) {
    const passage = clean[(start + index) % clean.length] ?? "";
    parts.push(passage);
    length += passage.length + (parts.length > 1 ? 1 : 0);
    index += 1;
  }
  return parts.join(" ");
}
