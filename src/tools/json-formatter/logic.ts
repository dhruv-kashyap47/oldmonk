/**
 * JSON parsing and formatting with line and column errors. Framework-free:
 * no Solid import, no DOM, no network, no storage.
 */

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface JsonError {
  readonly message: string;
  /** Zero-based offset in the input, after a leading BOM is removed. */
  readonly offset: number;
  /** One-based line. */
  readonly line: number;
  /** One-based column. */
  readonly column: number;
}

export type JsonParseResult =
  | { readonly ok: true; readonly value: JsonValue; readonly duplicateKeys: readonly string[] }
  | { readonly ok: false; readonly error: JsonError };

export type JsonIndent = 2 | 4 | "tab";

export interface FormatOptions {
  readonly indent: JsonIndent;
  readonly sortKeys: boolean;
  /** Override for tests. Production uses the 5 MB default. */
  readonly limitBytes?: number;
}

export type JsonFormatResult =
  | {
      readonly ok: true;
      readonly output: string;
      readonly bytesBefore: number;
      readonly bytesAfter: number;
      readonly duplicateKeys: readonly string[];
    }
  | { readonly ok: false; readonly error: JsonError };

export type JsonMinifyResult =
  | { readonly ok: true; readonly output: string; readonly bytesBefore: number; readonly bytesAfter: number }
  | { readonly ok: false; readonly error: JsonError };

export const JSON_SIZE_LIMIT = 5 * 1024 * 1024;

class JsonSyntaxError extends Error {
  constructor(
    readonly offset: number,
    message: string,
  ) {
    super(message);
    this.name = "JsonSyntaxError";
  }
}

function byteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

function lineColumn(text: string, offset: number): { line: number; column: number } {
  const clamped = Math.min(Math.max(offset, 0), text.length);
  let line = 1;
  let lineStart = 0;
  for (let index = 0; index < clamped; index += 1) {
    if (text.charAt(index) === "\n") {
      line += 1;
      lineStart = index + 1;
    }
  }
  return { line, column: clamped - lineStart + 1 };
}

function toFailure(text: string, error: unknown): { ok: false; error: JsonError } {
  if (error instanceof JsonSyntaxError) {
    const position = lineColumn(text, error.offset);
    return {
      ok: false,
      error: { message: error.message, offset: error.offset, ...position },
    };
  }
  return {
    ok: false,
    error: {
      message: "The input could not be parsed as JSON.",
      offset: 0,
      line: 1,
      column: 1,
    },
  };
}

function parseSource(source: string): JsonParseResult {
  let index = 0;
  const duplicates: string[] = [];

  function fail(message: string, at = index): never {
    throw new JsonSyntaxError(at, message);
  }

  function skipWhitespace(): void {
    while (index < source.length) {
      const character = source.charAt(index);
      if (character === " " || character === "\t" || character === "\n" || character === "\r") {
        index += 1;
      } else {
        break;
      }
    }
  }

  function parseString(): string {
    index += 1;
    let output = "";
    while (index < source.length) {
      const character = source.charAt(index);
      if (character === '"') {
        index += 1;
        return output;
      }
      if (character === "\\") {
        index += 1;
        const escape = source.charAt(index);
        if (escape === '"') output += '"';
        else if (escape === "\\") output += "\\";
        else if (escape === "/") output += "/";
        else if (escape === "b") output += "\b";
        else if (escape === "f") output += "\f";
        else if (escape === "n") output += "\n";
        else if (escape === "r") output += "\r";
        else if (escape === "t") output += "\t";
        else if (escape === "u") {
          const hex = source.slice(index + 1, index + 5);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
            fail("A unicode escape needs four hexadecimal digits.", index);
          }
          output += String.fromCharCode(Number.parseInt(hex, 16));
          index += 4;
        } else {
          fail(`Unknown escape sequence \\${escape}.`, index);
        }
        index += 1;
        continue;
      }
      if (character.charCodeAt(0) < 0x20) {
        fail("Control characters must be escaped inside a string.", index);
      }
      output += character;
      index += 1;
    }
    fail("This string is not closed.", source.length);
  }

  function parseNumber(): number {
    const start = index;
    const match = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(source.slice(index));
    if (!match) fail("Expected a number.", index);
    const raw = match[0];
    index += raw.length;
    const next = source.charAt(index);
    if (next === "." || (next >= "0" && next <= "9") || next === "e" || next === "E" || next === "+") {
      fail("This number is not valid JSON.", start);
    }
    const value = Number(raw);
    if (!Number.isFinite(value)) fail("This number is outside the supported range.", start);
    return value;
  }

  function parseLiteral(word: string, value: JsonValue): JsonValue {
    if (!source.startsWith(word, index)) fail(`Expected ${word}.`, index);
    index += word.length;
    return value;
  }

  function parseArray(): JsonValue[] {
    index += 1;
    const output: JsonValue[] = [];
    skipWhitespace();
    if (source.charAt(index) === "]") {
      index += 1;
      return output;
    }
    while (true) {
      skipWhitespace();
      output.push(parseValue());
      skipWhitespace();
      const character = source.charAt(index);
      if (character === ",") {
        index += 1;
        continue;
      }
      if (character === "]") {
        index += 1;
        return output;
      }
      fail("Expected a comma or a closing bracket.", index);
    }
  }

  function parseObject(): { [key: string]: JsonValue } {
    index += 1;
    const output: { [key: string]: JsonValue } = Object.create(null) as {
      [key: string]: JsonValue;
    };
    const seen = new Set<string>();
    skipWhitespace();
    if (source.charAt(index) === "}") {
      index += 1;
      return output;
    }
    while (true) {
      skipWhitespace();
      if (source.charAt(index) !== '"') {
        fail("Object keys must be strings in double quotes.", index);
      }
      const key = parseString();
      skipWhitespace();
      if (source.charAt(index) !== ":") {
        fail("Expected a colon after an object key.", index);
      }
      index += 1;
      skipWhitespace();
      output[key] = parseValue();
      if (seen.has(key)) duplicates.push(key);
      seen.add(key);
      skipWhitespace();
      const character = source.charAt(index);
      if (character === ",") {
        index += 1;
        continue;
      }
      if (character === "}") {
        index += 1;
        return output;
      }
      fail("Expected a comma or a closing brace.", index);
    }
  }

  function parseValue(): JsonValue {
    skipWhitespace();
    const character = source.charAt(index);
    if (character === "{") return parseObject();
    if (character === "[") return parseArray();
    if (character === '"') return parseString();
    if (character === "t") return parseLiteral("true", true);
    if (character === "f") return parseLiteral("false", false);
    if (character === "n") return parseLiteral("null", null);
    if (character === "-" || (character >= "0" && character <= "9")) return parseNumber();
    if (index >= source.length) {
      fail("Expected a JSON value, but the input ended.", index);
    }
    fail(`Unexpected character ${JSON.stringify(character)}.`, index);
  }

  skipWhitespace();
  if (index >= source.length) fail("The input is empty.", 0);
  const value = parseValue();
  skipWhitespace();
  if (index < source.length) {
    fail("Unexpected text after the JSON value.", index);
  }
  return { ok: true, value, duplicateKeys: duplicates };
}

/** Parses JSON with a byte cap and a leading BOM stripped. */
export function parseJson(text: string, limitBytes: number = JSON_SIZE_LIMIT): JsonParseResult {
  const source = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  if (byteLength(source) > limitBytes) {
    return {
      ok: false,
      error: {
        message: `Input is larger than the ${(limitBytes / (1024 * 1024)).toFixed(0)} MB limit.`,
        offset: 0,
        line: 1,
        column: 1,
      },
    };
  }
  try {
    return parseSource(source);
  } catch (error) {
    return toFailure(source, error);
  }
}

function sortValue(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value !== null && typeof value === "object") {
    const sorted: { [key: string]: JsonValue } = Object.create(null) as {
      [key: string]: JsonValue;
    };
    for (const key of Object.keys(value).sort()) {
      sorted[key] = sortValue(value[key] as JsonValue);
    }
    return sorted;
  }
  return value;
}

export function formatJson(text: string, options: FormatOptions): JsonFormatResult {
  const parsed = parseJson(text, options.limitBytes);
  if (!parsed.ok) return parsed;

  const value = options.sortKeys ? sortValue(parsed.value) : parsed.value;
  const indent = options.indent === "tab" ? "\t" : options.indent;
  const output = JSON.stringify(value, null, indent);

  return {
    ok: true,
    output,
    bytesBefore: byteLength(text),
    bytesAfter: byteLength(output),
    duplicateKeys: parsed.duplicateKeys,
  };
}

export function minifyJson(text: string, limitBytes: number = JSON_SIZE_LIMIT): JsonMinifyResult {
  const parsed = parseJson(text, limitBytes);
  if (!parsed.ok) return parsed;

  const output = JSON.stringify(parsed.value);
  return {
    ok: true,
    output,
    bytesBefore: byteLength(text),
    bytesAfter: byteLength(output),
  };
}
