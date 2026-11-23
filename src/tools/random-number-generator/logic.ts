import { secureRandomRange } from "../../lib/random";

export const NUMBER_COUNT_MAX = 1_000;
export const DECIMAL_PLACES_MAX = 6;

const UINT32_RANGE = 0x1_0000_0000;

export interface NumberOptions {
  readonly min: number;
  readonly max: number;
  readonly count: number;
  /** Digits after the decimal point, from 0 to 6. Zero means integers. */
  readonly decimals: number;
  readonly unique: boolean;
}

export type GenerateNumbersResult =
  | {
      readonly ok: true;
      readonly values: readonly string[];
      readonly numbers: readonly number[];
    }
  | { readonly ok: false; readonly error: string };

/** Prints a value with exactly `decimals` digits after the point. */
export function formatNumber(value: number, decimals: number): string {
  if (!Number.isSafeInteger(decimals) || decimals < 0 || decimals > DECIMAL_PLACES_MAX) {
    throw new RangeError("decimals must be a whole number from 0 to 6.");
  }
  return decimals === 0 ? String(value) : value.toFixed(decimals);
}

function scaledBounds(
  min: number,
  max: number,
  factor: number,
): { readonly min: number; readonly max: number } {
  return {
    min: Math.ceil(min * factor),
    max: Math.floor(max * factor),
  };
}

/**
 * Draws `count` values between `min` and `max` with `secureRandomRange`,
 * which uses `crypto.getRandomValues` and rejection sampling. Decimal draws
 * work in scaled integers, so every value has an exactly even chance.
 */
export function generateNumbers(options: NumberOptions): GenerateNumbersResult {
  const { min, max, count, decimals, unique } = options;

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { ok: false, error: "Enter a finite minimum and maximum." };
  }
  if (min > max) {
    return { ok: false, error: "The minimum must be less than or equal to the maximum." };
  }
  if (!Number.isSafeInteger(count) || count < 1 || count > NUMBER_COUNT_MAX) {
    return {
      ok: false,
      error: `The count must be a whole number from 1 to ${NUMBER_COUNT_MAX.toLocaleString("en")}.`,
    };
  }
  if (!Number.isSafeInteger(decimals) || decimals < 0 || decimals > DECIMAL_PLACES_MAX) {
    return { ok: false, error: `Decimal places must be a whole number from 0 to ${DECIMAL_PLACES_MAX}.` };
  }

  const factor = 10 ** decimals;
  const bounds = scaledBounds(min, max, factor);
  if (!Number.isSafeInteger(bounds.min) || !Number.isSafeInteger(bounds.max)) {
    return { ok: false, error: "The range is too large to draw exact values at this precision." };
  }
  if (bounds.min > bounds.max) {
    return {
      ok: false,
      error: "No value fits inside this range at the chosen decimal places. Widen the range or lower the precision.",
    };
  }

  const span = bounds.max - bounds.min + 1;
  if (span > UINT32_RANGE) {
    return {
      ok: false,
      error: "The range is too wide for one crypto draw. Narrow it or lower the decimal places.",
    };
  }
  if (unique && span < count) {
    const available = span.toLocaleString("en");
    return {
      ok: false,
      error: `Only ${available} distinct ${span === 1 ? "value fits" : "values fit"} in this range. Turn off unique, reduce the count, or widen the range.`,
    };
  }

  const scaled: number[] = [];
  if (unique) {
    const seen = new Set<number>();
    while (scaled.length < count) {
      const value = secureRandomRange(bounds.min, bounds.max);
      if (seen.has(value)) continue;
      seen.add(value);
      scaled.push(value);
    }
  } else {
    for (let index = 0; index < count; index += 1) {
      scaled.push(secureRandomRange(bounds.min, bounds.max));
    }
  }

  const numbers = scaled.map((value) => value / factor);
  return {
    ok: true,
    values: numbers.map((value) => formatNumber(value, decimals)),
    numbers,
  };
}

export const NUMBER_HISTORY_LIMIT = 20;

export interface NumberHistoryEntry {
  readonly values: readonly string[];
  readonly range: string;
}

/** Newest batch first, capped at twenty batches. */
export function pushNumberHistory(
  history: readonly NumberHistoryEntry[],
  entry: NumberHistoryEntry,
): NumberHistoryEntry[] {
  return [entry, ...history].slice(0, NUMBER_HISTORY_LIMIT);
}
