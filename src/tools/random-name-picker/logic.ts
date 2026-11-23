import { secureRandomInt, secureShuffle } from "../../lib/random";

/** Hard cap on parsed names, so a pasted file cannot lock up the tab. */
export const NAME_LIMIT = 10_000;

/** Number of recent winners kept in the history list. */
export const HISTORY_LIMIT = 50;

export type ParseNamesResult =
  | { readonly ok: true; readonly names: readonly string[] }
  | { readonly ok: false; readonly error: string };

/**
 * Splits on line breaks and commas, trims each entry, and drops blanks.
 * Repeated labels are kept as separate entries, so two people named Alex
 * each get their own chance to be picked.
 */
export function parseNames(input: string): ParseNamesResult {
  const names: string[] = [];
  for (const piece of input.split(/[\r\n,]/)) {
    const name = piece.trim();
    if (name.length > 0) names.push(name);
  }
  if (names.length > NAME_LIMIT) {
    return {
      ok: false,
      error: `The list is limited to ${NAME_LIMIT.toLocaleString("en")} names. Shorten it and try again.`,
    };
  }
  return { ok: true, names };
}

/**
 * A name plus a stable id. Ids make duplicate labels distinct, so removing
 * one Alex from a no-repeat pool leaves the other Alex in place.
 */
export interface NameEntry {
  readonly id: number;
  readonly label: string;
}

export function createEntries(names: readonly string[]): NameEntry[] {
  return names.map((label, index) => ({ id: index, label }));
}

/** Uniformly picks one entry, or null when the pool is empty. */
export function pickEntry(pool: readonly NameEntry[]): NameEntry | null {
  if (pool.length === 0) return null;
  return pool[secureRandomInt(pool.length)] ?? null;
}

export function removeEntry(pool: readonly NameEntry[], id: number): NameEntry[] {
  return pool.filter((entry) => entry.id !== id);
}

export function resetPool(names: readonly string[]): NameEntry[] {
  return createEntries(names);
}

/** Most recent winner first, capped at HISTORY_LIMIT. */
export function pushHistory(history: readonly string[], label: string): string[] {
  return [label, ...history].slice(0, HISTORY_LIMIT);
}

export interface Team {
  readonly name: string;
  readonly members: readonly string[];
}

/**
 * Deals names round-robin after a shuffle. With `count` teams, sizes differ
 * by at most one. `shuffle` is injectable so tests can keep the order stable.
 */
export function buildTeams(
  names: readonly string[],
  teamCount: number,
  shuffle: (items: readonly string[]) => string[] = secureShuffle,
): Team[] {
  if (names.length === 0) return [];
  const requested = Number.isFinite(teamCount) ? Math.floor(teamCount) : 1;
  const count = Math.max(1, Math.min(requested, names.length));
  const teams: Team[] = Array.from({ length: count }, (_, index) => ({
    name: `Team ${index + 1}`,
    members: [],
  }));

  const order = shuffle(names);
  for (let index = 0; index < order.length; index += 1) {
    const team = teams[index % count];
    const name = order[index];
    if (team && name !== undefined) (team.members as string[]).push(name);
  }
  return teams;
}
