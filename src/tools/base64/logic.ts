/**
 * Base64 encoding and decoding over bytes, with text helpers built on
 * TextEncoder and TextDecoder. Framework-free: no Solid import, no DOM, no
 * network, no storage.
 */

export const BASE64_SIZE_LIMIT = 10 * 1024 * 1024;

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const URL_SAFE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

const DECODE_TABLE = new Map<string, number>();
for (let index = 0; index < ALPHABET.length; index += 1) {
  DECODE_TABLE.set(ALPHABET.charAt(index), index);
}

export type Base64ErrorCode = "empty" | "size" | "invalid-base64" | "invalid-utf8";

export interface Base64Failure {
  readonly ok: false;
  readonly code: Base64ErrorCode;
  readonly message: string;
}

export type Base64TextResult =
  | { readonly ok: true; readonly output: string; readonly bytes: number }
  | Base64Failure;

export type Base64BytesResult =
  | { readonly ok: true; readonly bytes: Uint8Array }
  | Base64Failure;

function failure(code: Base64ErrorCode, message: string): Base64Failure {
  return { ok: false, code, message };
}

function sizeFailure(limitBytes: number): Base64Failure {
  const megabytes = limitBytes / (1024 * 1024);
  const label = megabytes >= 1 ? `${Math.round(megabytes)} MB` : `${limitBytes} bytes`;
  return failure("size", `The input is larger than the ${label} limit.`);
}

function utf8Length(text: string): number {
  return new TextEncoder().encode(text).length;
}

/** Encodes raw bytes. URL-safe mode uses - and _ and drops the padding. */
export function encodeBase64Bytes(
  bytes: Uint8Array,
  urlSafe = false,
  limitBytes: number = BASE64_SIZE_LIMIT,
): Base64TextResult {
  if (bytes.length > limitBytes) return sizeFailure(limitBytes);

  const alphabet = urlSafe ? URL_SAFE_ALPHABET : ALPHABET;
  let output = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index] ?? 0;
    const second = bytes[index + 1] ?? 0;
    const third = bytes[index + 2] ?? 0;
    output += alphabet.charAt(first >> 2);
    output += alphabet.charAt(((first & 0x03) << 4) | (second >> 4));
    output +=
      index + 1 < bytes.length
        ? alphabet.charAt(((second & 0x0f) << 2) | (third >> 6))
        : "=";
    output += index + 2 < bytes.length ? alphabet.charAt(third & 0x3f) : "=";
  }

  if (urlSafe) output = output.replace(/=+$/u, "");
  return { ok: true, output, bytes: bytes.length };
}

/** Encodes UTF-8 text. An empty string encodes to an empty string. */
export function encodeBase64Text(
  text: string,
  urlSafe = false,
  limitBytes: number = BASE64_SIZE_LIMIT,
): Base64TextResult {
  const bytes = new TextEncoder().encode(text);
  return encodeBase64Bytes(bytes, urlSafe, limitBytes);
}

/**
 * Decodes standard or URL-safe Base64. Whitespace is ignored and padding is
 * optional, so tokens copied from a URL or a JWT decode without repair.
 */
export function decodeBase64Bytes(
  input: string,
  limitBytes: number = BASE64_SIZE_LIMIT,
): Base64BytesResult {
  if (utf8Length(input) > limitBytes) return sizeFailure(limitBytes);

  const normalized = input.replace(/\s+/gu, "").replace(/-/gu, "+").replace(/_/gu, "/");
  if (normalized.length === 0) {
    return failure("empty", "Paste Base64 text to decode.");
  }

  let padding = 0;
  let end = normalized.length;
  while (end > 0 && normalized.charAt(end - 1) === "=") {
    padding += 1;
    end -= 1;
  }

  if (padding > 2) {
    return failure("invalid-base64", "Base64 padding uses at most two equals signs, at the end.");
  }

  const core = normalized.slice(0, end);
  if (core.includes("=")) {
    return failure("invalid-base64", "Padding is only allowed at the end of Base64 text.");
  }

  const remainder = core.length % 4;
  if (remainder === 1) {
    return failure("invalid-base64", "This Base64 text has an impossible length.");
  }
  if (padding > 0) {
    if ((core.length + padding) % 4 !== 0) {
      return failure("invalid-base64", "The padding does not match the length of this Base64 text.");
    }
    if (padding !== (4 - remainder) % 4) {
      return failure("invalid-base64", "The padding does not match the length of this Base64 text.");
    }
  }

  for (let index = 0; index < core.length; index += 1) {
    const character = core.charAt(index);
    if (!DECODE_TABLE.has(character)) {
      return failure(
        "invalid-base64",
        `${JSON.stringify(character)} is not a Base64 character. Use A to Z, a to z, 0 to 9, plus, and slash.`,
      );
    }
  }

  const output = new Uint8Array(Math.floor((core.length * 6) / 8));
  let buffer = 0;
  let bits = 0;
  let written = 0;
  for (let index = 0; index < core.length; index += 1) {
    const value = DECODE_TABLE.get(core.charAt(index)) ?? 0;
    buffer = ((buffer << 6) | value) & 0xffffff;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output[written] = (buffer >> bits) & 0xff;
      written += 1;
    }
  }

  if (output.length > limitBytes) return sizeFailure(limitBytes);
  return { ok: true, bytes: output };
}

/** Decodes Base64 to UTF-8 text and rejects byte sequences that are not UTF-8. */
export function decodeBase64Text(
  input: string,
  limitBytes: number = BASE64_SIZE_LIMIT,
): Base64TextResult {
  const decoded = decodeBase64Bytes(input, limitBytes);
  if (!decoded.ok) return decoded;

  try {
    const output = new TextDecoder("utf-8", { fatal: true }).decode(decoded.bytes);
    return { ok: true, output, bytes: decoded.bytes.length };
  } catch {
    return failure(
      "invalid-utf8",
      "The decoded bytes are not valid UTF-8 text. This looks like a binary file rather than text.",
    );
  }
}
