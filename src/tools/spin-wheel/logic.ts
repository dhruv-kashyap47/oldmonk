import { secureRandomInt } from "../../lib/random";

/**
 * Fraction of a sector kept clear at each edge when the wheel stops. With an
 * even split, a stop can land anywhere in the middle 84 percent of a sector,
 * so the needle never rests on a divider.
 */
export const WHEEL_MARGIN = 0.08;

/** Parses one entry per line. Blank lines are ignored. */
export function parseWheelEntries(input: string): string[] {
  const entries: string[] = [];
  for (const line of input.split(/\r?\n/)) {
    const entry = line.trim();
    if (entry.length > 0) entries.push(entry);
  }
  return entries;
}

export function sectorSize(count: number): number {
  if (!Number.isSafeInteger(count) || count < 1) {
    throw new RangeError("count must be a positive safe integer.");
  }
  return 360 / count;
}

/** Sector bounds in degrees, with 0 at the top and clockwise motion. */
export function sectorBounds(
  index: number,
  count: number,
): { readonly start: number; readonly end: number } {
  const size = sectorSize(count);
  if (!Number.isSafeInteger(index) || index < 0 || index >= count) {
    throw new RangeError("index must be a sector of the wheel.");
  }
  return { start: index * size, end: (index + 1) * size };
}

/**
 * A stop angle inside the winning sector. `fraction` is in [0, 1] and maps
 * to the allowed middle band, never to the sector edges.
 */
export function stopAngle(index: number, count: number, fraction: number): number {
  if (!Number.isFinite(fraction) || fraction < 0 || fraction > 1) {
    throw new RangeError("fraction must be between 0 and 1.");
  }
  const bounds = sectorBounds(index, count);
  const width = bounds.end - bounds.start;
  return bounds.start + width * (WHEEL_MARGIN + fraction * (1 - 2 * WHEEL_MARGIN));
}

export function normalizeRotation(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

export interface WheelSpin {
  readonly index: number;
  readonly label: string;
  /** Degrees clockwise from the top where the needle should rest. */
  readonly stopAngle: number;
  /** Wheel rotation in [0, 360) that puts the stop angle at the top. */
  readonly rotation: number;
}

/**
 * Picks a winner with the crypto source first, then draws a stop angle inside
 * that sector. Both numbers come from `crypto.getRandomValues` through
 * `secureRandomInt`, which uses rejection sampling for an even distribution.
 */
export function spinWheel(entries: readonly string[]): WheelSpin | null {
  if (entries.length === 0) return null;
  const index = secureRandomInt(entries.length);
  const fraction = secureRandomInt(10_000) / 10_000;
  const angle = stopAngle(index, entries.length, fraction);
  const label = entries[index];
  if (label === undefined) return null;
  return {
    index,
    label,
    stopAngle: angle,
    rotation: normalizeRotation(360 - angle),
  };
}

/** Absolute rotation after `turns` full turns plus the stop rotation. */
export function rotationForSpin(spin: WheelSpin, turns: number): number {
  const safeTurns = Number.isFinite(turns) ? Math.max(0, Math.floor(turns)) : 0;
  return safeTurns * 360 + spin.rotation;
}
