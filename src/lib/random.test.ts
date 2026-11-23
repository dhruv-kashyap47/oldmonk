import {
  randomUuidV4,
  randomUuidV7,
  secureRandomInt,
  secureRandomRange,
  secureShuffle,
  selectUnique,
  uuidV7Timestamp,
} from "./random";
import { describe, expect, it } from "vitest";

describe("secureRandomInt", () => {
  it("stays inside the bound", () => {
    for (let index = 0; index < 500; index += 1) {
      const value = secureRandomInt(6);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(6);
    }
  });

  it("can return every value of a small range", () => {
    const seen = new Set<number>();
    for (let index = 0; index < 500; index += 1) seen.add(secureRandomInt(3));
    expect([...seen].sort()).toEqual([0, 1, 2]);
  });

  it("handles a bound of one", () => {
    expect(secureRandomInt(1)).toBe(0);
  });

  it.each([0, -1, 1.5, Number.NaN, 2 ** 32 + 1])("rejects the bound %s", (bound) => {
    expect(() => secureRandomInt(bound)).toThrow(RangeError);
  });
});

describe("secureRandomRange", () => {
  it("includes both ends", () => {
    const seen = new Set<number>();
    for (let index = 0; index < 1000; index += 1) seen.add(secureRandomRange(1, 3));
    expect([...seen].sort()).toEqual([1, 2, 3]);
  });

  it("rejects an inverted range", () => {
    expect(() => secureRandomRange(5, 1)).toThrow(RangeError);
  });
});

describe("secureShuffle", () => {
  it("keeps every item and does not mutate the input", () => {
    const input = [1, 2, 3, 4, 5];
    const output = secureShuffle(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect([...output].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("changes order at least once across draws", () => {
    const input = Array.from({ length: 8 }, (_, index) => index);
    const orders = new Set<string>();
    for (let index = 0; index < 20; index += 1) orders.add(secureShuffle(input).join(","));
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe("selectUnique", () => {
  it("returns distinct items and caps at the pool size", () => {
    const picked = selectUnique([1, 2, 3], 5);
    expect(picked.length).toBe(3);
    expect(new Set(picked).size).toBe(3);
  });

  it("rejects a negative count", () => {
    expect(() => selectUnique([1], -1)).toThrow(RangeError);
  });
});

describe("UUID v4", () => {
  it("matches the v4 shape and variant", () => {
    for (let index = 0; index < 50; index += 1) {
      const uuid = randomUuidV4();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    }
  });

  it("does not repeat", () => {
    const set = new Set(Array.from({ length: 200 }, () => randomUuidV4()));
    expect(set.size).toBe(200);
  });
});

describe("UUID v7", () => {
  it("encodes the timestamp in the first 48 bits", () => {
    const timestamp = 1_764_000_000_000;
    const uuid = randomUuidV7(timestamp);
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(uuidV7Timestamp(uuid)).toBe(timestamp);
  });

  it("rejects a negative timestamp", () => {
    expect(() => randomUuidV7(-1)).toThrow(RangeError);
  });
});
