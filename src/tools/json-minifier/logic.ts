/**
 * JSON minification built on the formatter's parser. Framework-free: no Solid
 * import, no DOM, no network, no storage.
 */

import { JSON_SIZE_LIMIT, minifyJson, type JsonError } from "../json-formatter/logic";

export const JSON_MINIFIER_LIMIT = JSON_SIZE_LIMIT;

export interface MinifySuccess {
  readonly ok: true;
  readonly output: string;
  readonly bytesBefore: number;
  readonly bytesAfter: number;
  /** Bytes removed. Negative only if the parser normalises a value to more bytes. */
  readonly removedBytes: number;
  /** Percentage of the original byte count, rounded to one decimal. */
  readonly percentSaved: number;
}

export interface MinifyFailure {
  readonly ok: false;
  readonly error: JsonError;
}

export type MinifyResult = MinifySuccess | MinifyFailure;

/** Percentage saved with a zero guard, rounded to one decimal. */
export function percentSaved(before: number, after: number): number {
  if (before <= 0) return 0;
  const value = ((before - after) / before) * 100;
  return Math.round(value * 10) / 10;
}

/** Removes insignificant whitespace and reports honest byte counts. */
export function minifyText(
  text: string,
  limitBytes: number = JSON_MINIFIER_LIMIT,
): MinifyResult {
  const result = minifyJson(text, limitBytes);
  if (!result.ok) return result;

  return {
    ok: true,
    output: result.output,
    bytesBefore: result.bytesBefore,
    bytesAfter: result.bytesAfter,
    removedBytes: result.bytesBefore - result.bytesAfter,
    percentSaved: percentSaved(result.bytesBefore, result.bytesAfter),
  };
}
