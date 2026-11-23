import { describe, expect, it } from "vitest";
import {
  DECIMAL_PLACES_MAX,
  NUMBER_COUNT_MAX,
  NUMBER_HISTORY_LIMIT,
  formatNumber,
  generateNumbers,
  pushNumberHistory,
} from "./logic";

function values(options: Parameters<typeof generateNumbers>[0]): readonly string[] {
  const result = generateNumbers(options);
  if (!result.ok) throw new Error(result.error);
  return result.values;
}

function errorOf(options: Parameters<typeof generateNumbers>[0]): string {
  const result = generateNumbers(options);
  if (result.ok) throw new Error("Expected an error");
  return result.error;
}

describe("generateNumbers", () => {
  it("stays inside the integer bounds over many draws", () => {
    for (const [min, max] of [
      [1, 6],
      [-5, 5],
      [0, 0],
      [-100, -90],
      [10, 10_000],
    ] as const) {
      for (let draw = 0; draw < 300; draw += 1) {
        const [value] = values({ min, max, count: 1, decimals: 0, unique: false });
        const number = Number(value);
        expect(number).toBeGreaterThanOrEqual(min);
        expect(number).toBeLessThanOrEqual(max);
        expect(Number.isInteger(number)).toBe(true);
      }
    }
  });

  it("returns the requested number of values", () => {
    expect(values({ min: 0, max: 9, count: 25, decimals: 0, unique: false })).toHaveLength(25);
    expect(values({ min: 0, max: 9, count: NUMBER_COUNT_MAX, decimals: 0, unique: false })).toHaveLength(
      NUMBER_COUNT_MAX,
    );
  });

  it("can return both ends of a small range", () => {
    const seen = new Set<string>();
    for (let draw = 0; draw < 300; draw += 1) {
      const [value] = values({ min: 3, max: 5, count: 1, decimals: 0, unique: false });
      if (value) seen.add(value);
    }
    expect([...seen].sort()).toEqual(["3", "4", "5"]);
  });

  it("returns distinct values in unique mode", () => {
    const result = generateNumbers({ min: 1, max: 20, count: 20, decimals: 0, unique: true });
    if (!result.ok) throw new Error(result.error);
    expect(result.values).toHaveLength(20);
    expect(new Set(result.values).size).toBe(20);
    expect([...result.values].map(Number).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 20 }, (_, index) => index + 1),
    );
  });

  it("keeps unique decimal values distinct", () => {
    const result = generateNumbers({ min: 0, max: 0.5, count: 6, decimals: 1, unique: true });
    if (!result.ok) throw new Error(result.error);
    expect(new Set(result.values).size).toBe(6);
    for (const value of result.values) {
      const number = Number(value);
      expect(number).toBeGreaterThanOrEqual(0);
      expect(number).toBeLessThanOrEqual(0.5);
    }
  });

  it("rejects unique when the range is too small", () => {
    const message = errorOf({ min: 1, max: 3, count: 4, decimals: 0, unique: true });
    expect(message).toContain("distinct");
    expect(message).toContain("Turn off unique");
  });

  it("rejects impossible decimal ranges", () => {
    expect(errorOf({ min: 0.01, max: 0.02, count: 3, decimals: 1, unique: true })).toContain(
      "No value fits",
    );
  });

  it("rejects an inverted range", () => {
    expect(errorOf({ min: 10, max: 1, count: 4, decimals: 0, unique: false })).toContain(
      "minimum must be less than or equal",
    );
  });

  it("rejects non-finite bounds", () => {
    expect(errorOf({ min: Number.NaN, max: 10, count: 1, decimals: 0, unique: false })).toContain(
      "finite",
    );
    expect(
      errorOf({ min: 0, max: Number.POSITIVE_INFINITY, count: 1, decimals: 0, unique: false }),
    ).toContain("finite");
  });

  it("rejects a bad count and bad decimal places", () => {
    expect(errorOf({ min: 0, max: 10, count: 0, decimals: 0, unique: false })).toContain("count");
    expect(errorOf({ min: 0, max: 10, count: 1001, decimals: 0, unique: false })).toContain("count");
    expect(errorOf({ min: 0, max: 10, count: 1, decimals: 7, unique: false })).toContain(
      "Decimal places",
    );
    expect(errorOf({ min: 0, max: 10, count: 1, decimals: -1, unique: false })).toContain(
      "Decimal places",
    );
  });

  it("rejects a range too wide for one draw", () => {
    const message = errorOf({
      min: -1_000_000,
      max: 1_000_000,
      count: 1,
      decimals: 4,
      unique: false,
    });
    expect(message).toContain("too wide");
  });
});

describe("decimal formatting", () => {
  it("prints the requested number of places", () => {
    expect(formatNumber(1, 0)).toBe("1");
    expect(formatNumber(1, 2)).toBe("1.00");
    expect(formatNumber(-0.5, 3)).toBe("-0.500");
    expect(formatNumber(2.5, DECIMAL_PLACES_MAX)).toBe("2.500000");
  });

  it("formats every generated value at the chosen precision", () => {
    const result = values({ min: -1.5, max: 1.5, count: 40, decimals: 3, unique: false });
    for (const value of result) {
      expect(value).toMatch(/^-?\d+\.\d{3}$/);
    }
  });

  it("rejects invalid decimal places", () => {
    expect(() => formatNumber(1, 7)).toThrow(RangeError);
    expect(() => formatNumber(1, 1.5)).toThrow(RangeError);
  });
});

describe("pushNumberHistory", () => {
  it("keeps the newest batch first and caps the list", () => {
    let history: ReturnType<typeof pushNumberHistory> = [];
    for (let index = 0; index < NUMBER_HISTORY_LIMIT + 5; index += 1) {
      history = pushNumberHistory(history, {
        values: [String(index)],
        range: `0 to ${index}`,
      });
    }
    expect(history).toHaveLength(NUMBER_HISTORY_LIMIT);
    expect(history[0]?.values).toEqual([String(NUMBER_HISTORY_LIMIT + 4)]);
  });
});
