import { describe, expect, it } from "vitest";
import {
  CLICK_WINDOW_MS,
  MIN_CLICK_GAP_MS,
  clicksPerSecond,
  intervalConsistency,
  shouldAcceptClick,
  summarizeClicks,
} from "./logic";

describe("clicksPerSecond", () => {
  it("divides clicks by the window length", () => {
    expect(clicksPerSecond(50, 10_000)).toBe(5);
    expect(clicksPerSecond(25, 5_000)).toBe(5);
    expect(clicksPerSecond(73, 10_000)).toBe(7.3);
  });

  it("returns zero for a zero or negative duration", () => {
    expect(clicksPerSecond(10, 0)).toBe(0);
    expect(clicksPerSecond(10, -1)).toBe(0);
    expect(clicksPerSecond(0, 10_000)).toBe(0);
  });
});

describe("click window", () => {
  it("defaults to ten seconds", () => {
    expect(CLICK_WINDOW_MS).toBe(10_000);
  });

  it("reports the duration it was given", () => {
    expect(summarizeClicks([100], 4_000).durationMs).toBe(4_000);
    expect(summarizeClicks([100]).durationMs).toBe(CLICK_WINDOW_MS);
  });
});

describe("summarizeClicks", () => {
  it("counts clicks and reports CPS", () => {
    const result = summarizeClicks([100, 250, 400, 550], 10_000);
    expect(result.count).toBe(4);
    expect(result.cps).toBe(0.4);
  });

  it("computes the gaps between clicks", () => {
    const result = summarizeClicks([0, 100, 200, 300], 10_000);
    expect(result.intervals).toEqual([100, 100, 100]);
    expect(result.averageIntervalMs).toBe(100);
    expect(result.fastestIntervalMs).toBe(100);
    expect(result.consistency).toBe(100);
  });

  it("sorts timestamps before taking gaps", () => {
    const result = summarizeClicks([300, 100, 200], 10_000);
    expect(result.intervals).toEqual([100, 100]);
  });

  it("reports an uneven cadence with lower consistency", () => {
    const result = summarizeClicks([0, 100, 300], 10_000);
    expect(result.averageIntervalMs).toBe(150);
    expect(result.fastestIntervalMs).toBe(100);
    expect(result.consistency).toBe(66.7);
  });

  it("handles the zero click case", () => {
    const result = summarizeClicks([], 10_000);
    expect(result.count).toBe(0);
    expect(result.cps).toBe(0);
    expect(result.intervals).toEqual([]);
    expect(result.averageIntervalMs).toBeNull();
    expect(result.fastestIntervalMs).toBeNull();
    expect(result.consistency).toBe(0);
  });

  it("handles a single click without inventing gaps", () => {
    const result = summarizeClicks([500], 10_000);
    expect(result.count).toBe(1);
    expect(result.cps).toBe(0.1);
    expect(result.intervals).toEqual([]);
    expect(result.averageIntervalMs).toBeNull();
    expect(result.consistency).toBe(0);
  });

  it("ignores invalid timestamps", () => {
    const result = summarizeClicks([100, Number.NaN, -5, 200], 10_000);
    expect(result.count).toBe(2);
    expect(result.intervals).toEqual([100]);
  });
});

describe("intervalConsistency", () => {
  it("needs two gaps", () => {
    expect(intervalConsistency([])).toBe(0);
    expect(intervalConsistency([100])).toBe(0);
  });

  it("scores an even cadence at 100", () => {
    expect(intervalConsistency([100, 100, 100, 100])).toBe(100);
  });

  it("never drops below zero", () => {
    expect(intervalConsistency([0, 0, 200])).toBe(0);
  });
});

describe("shouldAcceptClick", () => {
  it("accepts the first click", () => {
    expect(shouldAcceptClick(0, null)).toBe(true);
  });

  it("rejects a duplicate inside the gap", () => {
    expect(MIN_CLICK_GAP_MS).toBe(40);
    expect(shouldAcceptClick(110, 100)).toBe(false);
    expect(shouldAcceptClick(139, 100)).toBe(false);
  });

  it("accepts a click once the gap has passed", () => {
    expect(shouldAcceptClick(140, 100)).toBe(true);
    expect(shouldAcceptClick(200, 100)).toBe(true);
  });

  it("rejects a negative or non-finite time", () => {
    expect(shouldAcceptClick(-1, null)).toBe(false);
    expect(shouldAcceptClick(Number.NaN, null)).toBe(false);
  });
});
