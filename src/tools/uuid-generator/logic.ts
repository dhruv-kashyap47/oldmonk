/**
 * UUID generation and display formatting. Framework-free: no Solid import,
 * no DOM, no network, no storage. Randomness comes from `src/lib/random.ts`.
 */

import { randomUuidV4, randomUuidV7 } from "../../lib/random";

export const UUID_MIN_COUNT = 1;
export const UUID_MAX_COUNT = 1000;

export type UuidVersion = 4 | 7;

export interface UuidFormatOptions {
  readonly uppercase?: boolean;
  readonly hyphens?: boolean;
}

export type UuidGenerateResult =
  | { readonly ok: true; readonly uuids: readonly string[] }
  | { readonly ok: false; readonly error: string };

/** Applies case and hyphen settings to a canonical UUID. */
export function formatUuid(uuid: string, options: UuidFormatOptions = {}): string {
  const cased = options.uppercase ? uuid.toUpperCase() : uuid.toLowerCase();
  return options.hyphens === false ? cased.replaceAll("-", "") : cased;
}

/**
 * Generates 1 to 1,000 UUIDs. Version 7 uses the supplied millisecond
 * timestamp so tests and callers can pin the time field.
 */
export function generateUuids(
  version: UuidVersion,
  count: number,
  options: UuidFormatOptions = {},
  timestamp: number = Date.now(),
): UuidGenerateResult {
  if (version !== 4 && version !== 7) {
    return { ok: false, error: "Choose version 4 or version 7." };
  }
  if (!Number.isSafeInteger(count) || count < UUID_MIN_COUNT || count > UUID_MAX_COUNT) {
    return {
      ok: false,
      error: `Enter a whole number from ${UUID_MIN_COUNT} to ${UUID_MAX_COUNT.toLocaleString("en")}.`,
    };
  }
  if (version === 7 && (!Number.isSafeInteger(timestamp) || timestamp < 0)) {
    return { ok: false, error: "The version 7 timestamp must be a non-negative whole number." };
  }

  const uuids: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const uuid = version === 4 ? randomUuidV4() : randomUuidV7(timestamp);
    uuids.push(formatUuid(uuid, options));
  }
  return { ok: true, uuids };
}
