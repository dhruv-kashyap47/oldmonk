/**
 * Cryptographic randomness. Framework-free and network-free. Every function
 * here uses `crypto.getRandomValues`, never Math.random.
 */

const UINT32_RANGE = 0x1_0000_0000;

function randomUint32(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] as number;
}

/** Uniform integer in [0, maxExclusive), with rejection sampling. */
export function secureRandomInt(maxExclusive: number): number {
  if (!Number.isSafeInteger(maxExclusive) || maxExclusive < 1) {
    throw new RangeError("maxExclusive must be a positive safe integer.");
  }
  if (maxExclusive > UINT32_RANGE) {
    throw new RangeError("maxExclusive must not exceed 2^32.");
  }
  if (maxExclusive === 1) return 0;

  const limit = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive;
  let value = randomUint32();
  while (value >= limit) value = randomUint32();
  return value % maxExclusive;
}

/** Uniform integer in [min, max], inclusive on both ends. */
export function secureRandomRange(min: number, max: number): number {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min > max) {
    throw new RangeError("min and max must be safe integers with min <= max.");
  }
  const span = max - min + 1;
  if (span > UINT32_RANGE) throw new RangeError("The range is too wide for one draw.");
  return min + secureRandomInt(span);
}

/** Fisher-Yates shuffle on a copy. */
export function secureShuffle<T>(items: readonly T[]): T[] {
  const output = [...items];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swap = secureRandomInt(index + 1);
    const current = output[index] as T;
    output[index] = output[swap] as T;
    output[swap] = current;
  }
  return output;
}

/** Up to `count` distinct items, in random order. */
export function selectUnique<T>(items: readonly T[], count: number): T[] {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new RangeError("count must be a non-negative safe integer.");
  }
  return secureShuffle(items).slice(0, Math.min(count, items.length));
}

/** RFC 4122 version 4 UUID. */
export function randomUuidV4(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = ((bytes[6] as number) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] as number) & 0x3f) | 0x80;
  return formatUuid(bytes);
}

/** RFC 9562 version 7 UUID from a millisecond timestamp. */
export function randomUuidV7(timestamp: number = Date.now()): string {
  if (!Number.isSafeInteger(timestamp) || timestamp < 0) {
    throw new RangeError("timestamp must be a non-negative safe integer.");
  }
  const bytes = new Uint8Array(16);
  let remaining = timestamp;
  for (let index = 5; index >= 0; index -= 1) {
    bytes[index] = remaining % 256;
    remaining = Math.floor(remaining / 256);
  }
  const random = new Uint8Array(10);
  crypto.getRandomValues(random);
  bytes.set(random, 6);
  bytes[6] = ((bytes[6] as number) & 0x0f) | 0x70;
  bytes[8] = ((bytes[8] as number) & 0x3f) | 0x80;
  return formatUuid(bytes);
}

function formatUuid(bytes: Uint8Array): string {
  const hex: string[] = [];
  for (const byte of bytes) hex.push(byte.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

/** Reads the millisecond timestamp back out of a UUID v7. */
export function uuidV7Timestamp(uuid: string): number | null {
  const compact = uuid.replaceAll("-", "");
  if (compact.length !== 32 || !/^[0-9a-f]{32}$/i.test(compact)) return null;
  if (Number.parseInt(compact.slice(12, 13), 16) !== 7) return null;
  return Number.parseInt(compact.slice(0, 12), 16);
}
