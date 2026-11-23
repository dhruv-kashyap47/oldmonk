/**
 * JSON validation built on the formatter's parser. Framework-free: no Solid
 * import, no DOM, no network, no storage. The parser is shared so the three
 * JSON tools agree on every syntax error.
 */

import {
  JSON_SIZE_LIMIT,
  parseJson,
  type JsonError,
  type JsonValue,
} from "../json-formatter/logic";

export const JSON_VALIDATOR_LIMIT = JSON_SIZE_LIMIT;

export interface ValidationSuccess {
  readonly ok: true;
  /** UTF-8 byte length of the input. */
  readonly bytes: number;
  /** Number of lines in the input. */
  readonly lines: number;
  /** A short description such as "object with 3 keys". */
  readonly valueType: string;
  readonly duplicateKeys: readonly string[];
}

export interface ValidationFailure {
  readonly ok: false;
  readonly error: JsonError;
  /** The source line where parsing stopped, without its line ending. */
  readonly lineText: string | null;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function describeValue(value: JsonValue): string {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    return `array with ${value.length} ${value.length === 1 ? "item" : "items"}`;
  }
  if (typeof value === "object") {
    const count = Object.keys(value).length;
    return `object with ${count} ${count === 1 ? "key" : "keys"}`;
  }
  return typeof value;
}

function lineAt(text: string, line: number): string | null {
  const lines = stripBom(text).split("\n");
  const raw = lines[line - 1];
  if (raw === undefined) return null;
  return raw.endsWith("\r") ? raw.slice(0, -1) : raw;
}

/** Validates JSON text and reports the byte count, shape, and error position. */
export function validateJson(
  text: string,
  limitBytes: number = JSON_VALIDATOR_LIMIT,
): ValidationResult {
  const parsed = parseJson(text, limitBytes);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error, lineText: lineAt(text, parsed.error.line) };
  }

  const source = stripBom(text);
  return {
    ok: true,
    bytes: new TextEncoder().encode(source).length,
    lines: source.split("\n").length,
    valueType: describeValue(parsed.value),
    duplicateKeys: parsed.duplicateKeys,
  };
}
