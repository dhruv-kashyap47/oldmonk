/**
 * JWT decoding, claim inspection, and optional HMAC verification.
 * Framework-free: no Solid import, no DOM, no network, no storage.
 */

const BASE64URL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const BASE64URL_VALUES = new Map<string, number>(
  Array.from(BASE64URL_ALPHABET, (character, index) => [character, index]),
);

export type Base64UrlResult =
  | { readonly ok: true; readonly bytes: Uint8Array }
  | { readonly ok: false; readonly message: string };

export interface JwtError {
  readonly title: string;
  readonly message: string;
}

export type JwtDecodeResult =
  | {
      readonly ok: true;
      readonly header: Record<string, unknown>;
      readonly payload: Record<string, unknown>;
      readonly signature: string;
      readonly headerJson: string;
      readonly payloadJson: string;
    }
  | { readonly ok: false; readonly error: JwtError };

/** Decodes base64url with or without `=` padding. */
export function base64UrlToBytes(input: string): Base64UrlResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) return { ok: true, bytes: new Uint8Array(0) };

  let body = trimmed;
  let padding = 0;
  while (body.endsWith("=")) {
    body = body.slice(0, -1);
    padding += 1;
  }
  if (padding > 2) {
    return { ok: false, message: "The base64url text has more than two padding characters." };
  }
  if (body.includes("=")) {
    return { ok: false, message: "Padding is only allowed at the end of the base64url text." };
  }
  if (body.length % 4 === 1) {
    return { ok: false, message: "The base64url text has an impossible length." };
  }
  if (padding > 0 && (body.length + padding) % 4 !== 0) {
    return {
      ok: false,
      message: "The padding does not match the length of the base64url text.",
    };
  }

  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const character of body) {
    const value = BASE64URL_VALUES.get(character);
    if (value === undefined) {
      return {
        ok: false,
        message: `The text contains "${character}", which is not a base64url character.`,
      };
    }
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }

  return { ok: true, bytes: new Uint8Array(bytes) };
}

/** Encodes bytes as base64url without padding. */
export function bytesToBase64Url(bytes: Uint8Array): string {
  let output = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index] as number;
    const second = index + 1 < bytes.length ? (bytes[index + 1] as number) : -1;
    const third = index + 2 < bytes.length ? (bytes[index + 2] as number) : -1;

    output += BASE64URL_ALPHABET.charAt(first >> 2);
    output += BASE64URL_ALPHABET.charAt(((first & 0x03) << 4) | (second < 0 ? 0 : second >> 4));
    if (second >= 0) {
      output += BASE64URL_ALPHABET.charAt(((second & 0x0f) << 2) | (third < 0 ? 0 : third >> 6));
    }
    if (third >= 0) {
      output += BASE64URL_ALPHABET.charAt(third & 0x3f);
    }
  }
  return output;
}

function decodeSegment(segment: string): { ok: true; text: string } | { ok: false; message: string } {
  const decoded = base64UrlToBytes(segment);
  if (!decoded.ok) return decoded;
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(decoded.bytes);
    return { ok: true, text };
  } catch {
    return { ok: false, message: "The segment is not valid UTF-8 text." };
  }
}

export interface JwtParts {
  readonly header: string;
  readonly payload: string;
  readonly signature: string;
}

export type JwtPartsResult =
  | { readonly ok: true; readonly parts: JwtParts }
  | { readonly ok: false; readonly error: JwtError };

/** Splits a bearer token into its three segments. */
export function splitJwt(token: string): JwtPartsResult {
  let value = token.trim();
  if (value.toLowerCase().startsWith("bearer ")) value = value.slice(7).trim();
  if (value.length === 0) {
    return {
      ok: false,
      error: { title: "Empty token", message: "Paste a JSON Web Token to decode it." },
    };
  }
  const segments = value.split(".");
  if (segments.length !== 3) {
    return {
      ok: false,
      error: {
        title: "A JWT has three parts",
        message: `This token has ${segments.length} part${segments.length === 1 ? "" : "s"}. A signed JWT separates the header, payload, and signature with two dots.`,
      },
    };
  }
  const [header, payload, signature] = segments as [string, string, string];
  if (header.length === 0) {
    return {
      ok: false,
      error: { title: "Empty header", message: "The first segment, the header, is empty." },
    };
  }
  if (payload.length === 0) {
    return {
      ok: false,
      error: { title: "Empty payload", message: "The second segment, the payload, is empty." },
    };
  }
  return { ok: true, parts: { header, payload, signature } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Decodes the header and payload JSON. The signature is returned untouched. */
export function decodeJwt(token: string): JwtDecodeResult {
  const split = splitJwt(token);
  if (!split.ok) return split;

  const headerText = decodeSegment(split.parts.header);
  if (!headerText.ok) {
    return {
      ok: false,
      error: { title: "Invalid header encoding", message: headerText.message },
    };
  }

  let header: unknown;
  try {
    header = JSON.parse(headerText.text);
  } catch {
    return {
      ok: false,
      error: {
        title: "Header is not JSON",
        message: "The header segment decoded, but its text is not valid JSON.",
      },
    };
  }
  if (!isRecord(header)) {
    return {
      ok: false,
      error: { title: "Header is not an object", message: "The JWT header must be a JSON object." },
    };
  }

  const payloadText = decodeSegment(split.parts.payload);
  if (!payloadText.ok) {
    return {
      ok: false,
      error: { title: "Invalid payload encoding", message: payloadText.message },
    };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(payloadText.text);
  } catch {
    return {
      ok: false,
      error: {
        title: "Payload is not JSON",
        message: "The payload segment decoded, but its text is not valid JSON.",
      },
    };
  }
  if (!isRecord(payload)) {
    return {
      ok: false,
      error: {
        title: "Payload is not an object",
        message: "The JWT payload must be a JSON object of claims.",
      },
    };
  }

  return {
    ok: true,
    header,
    payload,
    signature: split.parts.signature,
    headerJson: JSON.stringify(header, null, 2),
    payloadJson: JSON.stringify(payload, null, 2),
  };
}

const CLAIM_LABELS: Readonly<Record<string, string>> = {
  iss: "Issuer",
  sub: "Subject",
  aud: "Audience",
  exp: "Expires at",
  nbf: "Not before",
  iat: "Issued at",
  jti: "JWT ID",
};

const TIME_CLAIMS = new Set(["exp", "nbf", "iat"]);

export interface ClaimRow {
  readonly name: string;
  readonly label: string;
  readonly value: string;
}

function formatTimestamp(seconds: number): string {
  const date = new Date(seconds * 1000);
  if (Number.isNaN(date.getTime())) return String(seconds);
  return `${seconds} (${date.toISOString()})`;
}

function isoFromSeconds(seconds: number): string | null {
  const date = new Date(seconds * 1000);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function formatClaim(name: string, value: unknown): string {
  if (typeof value === "number" && TIME_CLAIMS.has(name) && Number.isFinite(value)) {
    return formatTimestamp(value);
  }
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === null) return "null";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

const CLAIM_ORDER = ["iss", "sub", "aud", "exp", "nbf", "iat", "jti"] as const;

/** Claims in a stable order: registered claims first, then anything else. */
export function claimRows(payload: Record<string, unknown>): readonly ClaimRow[] {
  const rows: ClaimRow[] = [];
  const seen = new Set<string>();
  for (const name of CLAIM_ORDER) {
    if (!Object.hasOwn(payload, name)) continue;
    seen.add(name);
    rows.push({
      name,
      label: CLAIM_LABELS[name] ?? name,
      value: formatClaim(name, payload[name]),
    });
  }
  for (const [name, value] of Object.entries(payload)) {
    if (seen.has(name)) continue;
    rows.push({ name, label: name, value: formatClaim(name, value) });
  }
  return rows;
}

export type TimeClaimState = "valid" | "expired" | "not-yet-valid" | "invalid";

export interface TimeClaimStatus {
  readonly state: TimeClaimState;
  readonly label: string;
  readonly detail: string;
}

export interface JwtTiming {
  readonly exp: TimeClaimStatus | null;
  readonly nbf: TimeClaimStatus | null;
}

/**
 * Checks `exp` and `nbf`, both seconds since the Unix epoch. A token is valid
 * strictly before `exp` and at or after `nbf`.
 */
export function claimTiming(
  payload: Record<string, unknown>,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): JwtTiming {
  let exp: TimeClaimStatus | null = null;
  let nbf: TimeClaimStatus | null = null;

  if (Object.hasOwn(payload, "exp")) {
    const value = payload.exp;
    if (typeof value !== "number" || !Number.isFinite(value)) {
      exp = {
        state: "invalid",
        label: "Invalid exp claim",
        detail: "exp must be a number of seconds since the Unix epoch.",
      };
    } else {
      const iso = isoFromSeconds(value);
      if (!iso) {
        exp = {
          state: "invalid",
          label: "Invalid exp claim",
          detail: "exp is outside the representable date range.",
        };
      } else {
        exp =
          nowSeconds >= value
            ? { state: "expired", label: "Expired", detail: `Expired at ${iso}.` }
            : { state: "valid", label: "Not expired", detail: `Expires at ${iso}.` };
      }
    }
  }

  if (Object.hasOwn(payload, "nbf")) {
    const value = payload.nbf;
    if (typeof value !== "number" || !Number.isFinite(value)) {
      nbf = {
        state: "invalid",
        label: "Invalid nbf claim",
        detail: "nbf must be a number of seconds since the Unix epoch.",
      };
    } else {
      const iso = isoFromSeconds(value);
      if (!iso) {
        nbf = {
          state: "invalid",
          label: "Invalid nbf claim",
          detail: "nbf is outside the representable date range.",
        };
      } else {
        nbf =
          nowSeconds < value
            ? { state: "not-yet-valid", label: "Not yet valid", detail: `Valid from ${iso}.` }
            : { state: "valid", label: "Active", detail: `Valid from ${iso}.` };
      }
    }
  }

  return { exp, nbf };
}

export type HmacAlgorithm = "HS256" | "HS384" | "HS512";

const HMAC_HASHES: Readonly<Record<HmacAlgorithm, string>> = {
  HS256: "SHA-256",
  HS384: "SHA-384",
  HS512: "SHA-512",
};

export function isHmacAlgorithm(value: unknown): value is HmacAlgorithm {
  return value === "HS256" || value === "HS384" || value === "HS512";
}

export type HmacVerifyResult =
  | { readonly ok: true; readonly valid: boolean }
  | { readonly ok: false; readonly message: string };

function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= (left[index] as number) ^ (right[index] as number);
  }
  return difference === 0;
}

/**
 * Recomputes the HMAC over `header.payload` with WebCrypto and compares it to
 * the signature segment. This proves the token matches the secret. It does
 * not validate the issuer, audience, or any other claim.
 */
export async function verifyHmacSignature(
  token: string,
  secret: string,
  algorithm: HmacAlgorithm,
): Promise<HmacVerifyResult> {
  const split = splitJwt(token);
  if (!split.ok) return { ok: false, message: split.error.message };
  if (secret.length === 0) return { ok: false, message: "Enter the secret used to sign the token." };

  const headerText = decodeSegment(split.parts.header);
  if (headerText.ok) {
    try {
      const header: unknown = JSON.parse(headerText.text);
      if (isRecord(header) && typeof header.alg === "string" && header.alg !== algorithm) {
        if (isHmacAlgorithm(header.alg)) {
          return {
            ok: false,
            message: `The token header declares ${header.alg}. Choose ${header.alg} to match it.`,
          };
        }
        return {
          ok: false,
          message: `The token header declares ${header.alg}. This tool verifies HMAC signatures only (HS256, HS384, HS512), so this token cannot be checked here.`,
        };
      }
    } catch {
      // A broken header JSON is reported by decodeJwt. The signature can still be compared.
    }
  }

  const signature = base64UrlToBytes(split.parts.signature);
  if (!signature.ok) {
    return { ok: false, message: `The signature is not base64url: ${signature.message}` };
  }

  const encoder = new TextEncoder();
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: { name: HMAC_HASHES[algorithm] } },
      false,
      ["sign"],
    );
    const signingInput = `${split.parts.header}.${split.parts.payload}`;
    const computed = await crypto.subtle.sign("HMAC", key, encoder.encode(signingInput));
    return { ok: true, valid: bytesEqual(new Uint8Array(computed), signature.bytes) };
  } catch {
    return {
      ok: false,
      message: "WebCrypto is not available here, so the signature cannot be checked.",
    };
  }
}
