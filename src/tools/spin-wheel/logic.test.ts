import { describe, expect, it } from "vitest";
import {
  WHEEL_MARGIN,
  normalizeRotation,
  parseWheelEntries,
  sectorBounds,
  sectorSize,
  spinWheel,
  stopAngle,
} from "./logic";

describe("parseWheelEntries", () => {
  it("keeps one trimmed entry per line", () => {
    expect(parseWheelEntries("  Ada  \nGrace\n\n\tAlan\t\n")).toEqual(["Ada", "Grace", "Alan"]);
  });

  it("does not split on commas, because an entry may contain one", () => {
    expect(parseWheelEntries("Smith, Ada\nGrace Hopper")).toEqual([
      "Smith, Ada",
      "Grace Hopper",
    ]);
  });

  it("returns an empty list for blank input", () => {
    expect(parseWheelEntries(" \n\t\r\n")).toEqual([]);
  });

  it("handles Windows line endings", () => {
    expect(parseWheelEntries("Ada\r\nGrace\r\n")).toEqual(["Ada", "Grace"]);
  });
});

describe("sector geometry", () => {
  it("splits the circle evenly", () => {
    expect(sectorSize(4)).toBe(90);
    expect(sectorSize(3)).toBe(120);
    expect(sectorSize(1)).toBe(360);
  });

  it("returns adjacent bounds that cover the circle", () => {
    const count = 7;
    let covered = 0;
    for (let index = 0; index < count; index += 1) {
      const bounds = sectorBounds(index, count);
      expect(bounds.end).toBeGreaterThan(bounds.start);
      covered += bounds.end - bounds.start;
    }
    expect(covered).toBeCloseTo(360, 10);
    expect(sectorBounds(0, count).start).toBe(0);
    expect(sectorBounds(count - 1, count).end).toBeCloseTo(360, 10);
  });

  it("rejects invalid counts and indexes", () => {
    expect(() => sectorSize(0)).toThrow(RangeError);
    expect(() => sectorSize(2.5)).toThrow(RangeError);
    expect(() => sectorBounds(-1, 4)).toThrow(RangeError);
    expect(() => sectorBounds(4, 4)).toThrow(RangeError);
  });
});

describe("stopAngle", () => {
  it("keeps an eight percent margin at both edges", () => {
    const count = 5;
    const width = sectorSize(count);
    for (let index = 0; index < count; index += 1) {
      const low = stopAngle(index, count, 0);
      const high = stopAngle(index, count, 1);
      const bounds = sectorBounds(index, count);
      expect(low).toBeCloseTo(bounds.start + width * WHEEL_MARGIN, 10);
      expect(high).toBeCloseTo(bounds.end - width * WHEEL_MARGIN, 10);
      expect(low).toBeGreaterThan(bounds.start);
      expect(high).toBeLessThan(bounds.end);
    }
  });

  it("maps the middle of the fraction range to the middle of the sector", () => {
    const middle = stopAngle(2, 4, 0.5);
    expect(middle).toBe(225);
  });

  it("rejects a fraction outside zero to one", () => {
    expect(() => stopAngle(0, 4, -0.01)).toThrow(RangeError);
    expect(() => stopAngle(0, 4, 1.01)).toThrow(RangeError);
    expect(() => stopAngle(0, 4, Number.NaN)).toThrow(RangeError);
  });
});

describe("spinWheel", () => {
  it("returns null for an empty wheel", () => {
    expect(spinWheel([])).toBeNull();
  });

  it("always lands on the only entry", () => {
    for (let index = 0; index < 50; index += 1) {
      const spin = spinWheel(["Ada"]);
      expect(spin?.index).toBe(0);
      expect(spin?.label).toBe("Ada");
      if (!spin) throw new Error("Expected a spin");
      expect(spin.stopAngle).toBeGreaterThanOrEqual(360 * WHEEL_MARGIN);
      expect(spin.stopAngle).toBeLessThanOrEqual(360 * (1 - WHEEL_MARGIN));
    }
  });

  it("selects a valid index and keeps the stop inside its sector", () => {
    const entries = ["Ada", "Grace", "Alan", "Katherine", "Margaret"];
    const seen = new Set<number>();
    for (let draw = 0; draw < 500; draw += 1) {
      const spin = spinWheel(entries);
      if (!spin) throw new Error("Expected a spin");
      expect(spin.index).toBeGreaterThanOrEqual(0);
      expect(spin.index).toBeLessThan(entries.length);
      expect(spin.label).toBe(entries[spin.index]);
      seen.add(spin.index);

      const bounds = sectorBounds(spin.index, entries.length);
      const width = bounds.end - bounds.start;
      expect(spin.stopAngle).toBeGreaterThanOrEqual(bounds.start + width * WHEEL_MARGIN);
      expect(spin.stopAngle).toBeLessThanOrEqual(bounds.end - width * WHEEL_MARGIN);
    }
    expect(seen.size).toBe(entries.length);
  });

  it("maps the stop angle back to the top with its rotation", () => {
    for (let draw = 0; draw < 200; draw += 1) {
      const spin = spinWheel(["a", "b", "c", "d", "e", "f"]);
      if (!spin) throw new Error("Expected a spin");
      expect(spin.rotation).toBeGreaterThanOrEqual(0);
      expect(spin.rotation).toBeLessThan(360);
      expect(normalizeRotation(spin.rotation + spin.stopAngle)).toBeCloseTo(0, 8);
    }
  });
});

describe("normalizeRotation", () => {
  it("wraps degrees into one positive turn", () => {
    expect(normalizeRotation(0)).toBe(0);
    expect(normalizeRotation(360)).toBe(0);
    expect(normalizeRotation(-90)).toBe(270);
    expect(normalizeRotation(725)).toBe(5);
  });
});
