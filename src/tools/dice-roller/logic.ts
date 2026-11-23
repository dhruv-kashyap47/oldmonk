import { secureRandomInt } from "../../lib/random";

export const DICE_SIDES = [4, 6, 8, 10, 12, 20, 100] as const;
export type DieSides = (typeof DICE_SIDES)[number];

export const DICE_COUNT_MAX = 100;
export const DICE_MODIFIER_MAX = 100;
export const ROLL_HISTORY_LIMIT = 20;

export interface DiceRoll {
  readonly sides: DieSides;
  readonly count: number;
  readonly modifier: number;
  /** Individual die results, each from 1 to `sides`. */
  readonly rolls: readonly number[];
  /** Sum of the individual dice, before the modifier. */
  readonly sum: number;
  /** Sum plus the modifier. */
  readonly total: number;
}

function isDieSides(value: number): value is DieSides {
  return (DICE_SIDES as readonly number[]).includes(value);
}

export function validateDiceRequest(sides: number, count: number, modifier: number): string | null {
  if (!isDieSides(sides)) {
    return `Choose a die with ${DICE_SIDES.join(", ")} sides.`;
  }
  if (!Number.isSafeInteger(count) || count < 1 || count > DICE_COUNT_MAX) {
    return `The number of dice must be a whole number from 1 to ${DICE_COUNT_MAX}.`;
  }
  if (
    !Number.isSafeInteger(modifier) ||
    modifier < -DICE_MODIFIER_MAX ||
    modifier > DICE_MODIFIER_MAX
  ) {
    return `The modifier must be a whole number from -${DICE_MODIFIER_MAX} to ${DICE_MODIFIER_MAX}.`;
  }
  return null;
}

/**
 * Rolls `count` dice of one size. Every face comes from `secureRandomInt`,
 * which reads `crypto.getRandomValues` and uses rejection sampling.
 */
export function rollDice(sides: DieSides, count = 1, modifier = 0): DiceRoll {
  const problem = validateDiceRequest(sides, count, modifier);
  if (problem) throw new RangeError(problem);

  const rolls: number[] = [];
  for (let index = 0; index < count; index += 1) {
    rolls.push(secureRandomInt(sides) + 1);
  }
  const sum = rolls.reduce((total, value) => total + value, 0);
  return { sides, count, modifier, rolls, sum, total: sum + modifier };
}

export type DiceNotation =
  | {
      readonly ok: true;
      readonly sides: DieSides;
      readonly count: number;
      readonly modifier: number;
      readonly notation: string;
    }
  | { readonly ok: false; readonly error: string };

const NOTATION_PATTERN = /^\s*(?:(\d+)\s*)?d\s*(\d+)\s*(?:([+-])\s*(\d+)\s*)?$/i;

/** Normalized notation such as `2d6+1`, or `1d20` when the modifier is zero. */
export function formatNotation(sides: DieSides, count = 1, modifier = 0): string {
  const base = `${count}d${sides}`;
  if (modifier === 0) return base;
  return `${base}${modifier > 0 ? "+" : ""}${modifier}`;
}

/**
 * Parses `2d6+1`, `1d20`, `3d8-2`, or a bare `d20`. The count may be left
 * out and defaults to one die.
 */
export function parseNotation(input: string): DiceNotation {
  const text = input.trim();
  if (text.length === 0) {
    return { ok: false, error: "Enter a roll such as 2d6+1." };
  }
  const match = NOTATION_PATTERN.exec(text);
  if (!match) {
    return { ok: false, error: "Use a roll such as 2d6+1, 1d20, or 3d8-2." };
  }

  const count = match[1] === undefined ? 1 : Number(match[1]);
  const sides = Number(match[2]);
  const sign = match[3];
  const modifierValue = match[4] === undefined ? 0 : Number(match[4]);
  const modifier = sign === "-" ? -modifierValue : modifierValue;

  if (!isDieSides(sides)) {
    return { ok: false, error: `Choose a die with ${DICE_SIDES.join(", ")} sides.` };
  }
  const problem = validateDiceRequest(sides, count, modifier);
  if (problem) return { ok: false, error: problem };
  return {
    ok: true,
    sides,
    count,
    modifier,
    notation: formatNotation(sides, count, modifier),
  };
}

export type NotationRoll =
  | { readonly ok: true; readonly roll: DiceRoll; readonly notation: string }
  | { readonly ok: false; readonly error: string };

export function rollNotation(input: string): NotationRoll {
  const parsed = parseNotation(input);
  if (!parsed.ok) return parsed;
  return {
    ok: true,
    roll: rollDice(parsed.sides, parsed.count, parsed.modifier),
    notation: parsed.notation,
  };
}

export interface RollHistoryEntry {
  readonly notation: string;
  readonly total: number;
}

/** Newest roll first, capped at twenty entries. */
export function pushRollHistory(
  history: readonly RollHistoryEntry[],
  entry: RollHistoryEntry,
): RollHistoryEntry[] {
  return [entry, ...history].slice(0, ROLL_HISTORY_LIMIT);
}
