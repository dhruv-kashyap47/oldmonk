import { describe, expect, it } from "vitest";
import {
  DICE_COUNT_MAX,
  DICE_MODIFIER_MAX,
  DICE_SIDES,
  ROLL_HISTORY_LIMIT,
  formatNotation,
  parseNotation,
  pushRollHistory,
  rollDice,
  rollNotation,
  validateDiceRequest,
} from "./logic";

describe("rollDice", () => {
  it.each(DICE_SIDES)("keeps d%i results on the die", (sides) => {
    for (let draw = 0; draw < 100; draw += 1) {
      for (const value of rollDice(sides, 5).rolls) {
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(sides);
      }
    }
  });

  it("can reach every face of a d6", () => {
    const seen = new Set<number>();
    for (let draw = 0; draw < 400; draw += 1) {
      for (const value of rollDice(6, 5).rolls) seen.add(value);
    }
    expect([...seen].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("rolls the requested number of dice", () => {
    expect(rollDice(6, 1).rolls).toHaveLength(1);
    expect(rollDice(6, DICE_COUNT_MAX).rolls).toHaveLength(DICE_COUNT_MAX);
  });

  it("adds the sum and the modifier into the total", () => {
    const roll = rollDice(6, 10, 3);
    expect(roll.sum).toBe(roll.rolls.reduce((total, value) => total + value, 0));
    expect(roll.total).toBe(roll.sum + 3);
    expect(roll.modifier).toBe(3);
  });

  it("handles negative modifiers and a zero result", () => {
    const roll = rollDice(4, 1, -100);
    expect(roll.total).toBe(roll.rolls[0]! - 100);
    expect(roll.total).toBeLessThan(0);
  });

  it("rejects a count outside one to one hundred", () => {
    expect(() => rollDice(6, 0)).toThrow(RangeError);
    expect(() => rollDice(6, DICE_COUNT_MAX + 1)).toThrow(RangeError);
    expect(() => rollDice(6, 2.5)).toThrow(RangeError);
  });

  it("rejects an unsupported die and a large modifier", () => {
    expect(() => rollDice(7 as never)).toThrow(RangeError);
    expect(() => rollDice(6, 1, DICE_MODIFIER_MAX + 1)).toThrow(RangeError);
    expect(() => rollDice(6, 1, -DICE_MODIFIER_MAX - 1)).toThrow(RangeError);
  });

  it("reports the same problems through the validator", () => {
    expect(validateDiceRequest(6, 1, 0)).toBeNull();
    expect(validateDiceRequest(7, 1, 0)).toContain("sides");
    expect(validateDiceRequest(6, 101, 0)).toContain("1 to 100");
    expect(validateDiceRequest(6, 1, 101)).toContain("modifier");
  });
});

describe("parseNotation", () => {
  it.each([
    ["2d6+1", 6, 2, 1, "2d6+1"],
    ["1d20", 20, 1, 0, "1d20"],
    ["3d8-2", 8, 3, -2, "3d8-2"],
    ["d12", 12, 1, 0, "1d12"],
    [" 2 d 10 + 4 ", 10, 2, 4, "2d10+4"],
    ["4D6", 6, 4, 0, "4d6"],
    ["100d100-100", 100, 100, -100, "100d100-100"],
  ])("parses %j", (input, sides, count, modifier, notation) => {
    const parsed = parseNotation(input);
    if (!parsed.ok) throw new Error(parsed.error);
    expect(parsed.sides).toBe(sides);
    expect(parsed.count).toBe(count);
    expect(parsed.modifier).toBe(modifier);
    expect(parsed.notation).toBe(notation);
  });

  it.each([
    ["", "Enter a roll"],
    ["hello", "Use a roll"],
    ["2d", "Use a roll"],
    ["d", "Use a roll"],
    ["2d6+", "Use a roll"],
    ["2d6+1+2", "Use a roll"],
    ["2d6*2", "Use a roll"],
    ["0d6", "1 to 100"],
    ["101d6", "1 to 100"],
    ["2d7", "sides"],
    ["2d0", "sides"],
    ["2d6+101", "modifier"],
    ["2d6-101", "modifier"],
  ])("rejects %j", (input, message) => {
    const parsed = parseNotation(input);
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.error).toContain(message);
  });

  it("rolls the parsed notation", () => {
    const result = rollNotation("2d6+1");
    if (!result.ok) throw new Error(result.error);
    expect(result.roll.count).toBe(2);
    expect(result.roll.sides).toBe(6);
    expect(result.roll.rolls).toHaveLength(2);
    expect(result.roll.total).toBe(result.roll.sum + 1);
    expect(result.notation).toBe("2d6+1");
  });

  it("returns a parse error without rolling", () => {
    const result = rollNotation("2d6+999");
    expect(result.ok).toBe(false);
  });
});

describe("formatNotation", () => {
  it("leaves out a zero modifier and signs the rest", () => {
    expect(formatNotation(6, 1, 0)).toBe("1d6");
    expect(formatNotation(8, 3, 2)).toBe("3d8+2");
    expect(formatNotation(20, 1, -5)).toBe("1d20-5");
  });
});

describe("pushRollHistory", () => {
  it("keeps the newest roll first and caps the list", () => {
    let history: ReturnType<typeof pushRollHistory> = [];
    for (let index = 0; index < ROLL_HISTORY_LIMIT + 3; index += 1) {
      history = pushRollHistory(history, { notation: `${index}d6`, total: index });
    }
    expect(history).toHaveLength(ROLL_HISTORY_LIMIT);
    expect(history[0]?.total).toBe(ROLL_HISTORY_LIMIT + 2);
  });
});
