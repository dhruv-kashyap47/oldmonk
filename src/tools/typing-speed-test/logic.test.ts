import { describe, expect, it } from "vitest";
import {
  accuracyPercent,
  buildTestText,
  characterStates,
  computeTypingResult,
  consistencyScore,
  countCorrect,
  countCorrectChars,
  rawWpm,
  wpm,
  wpmSamples,
  type TypingChange,
} from "./logic";
import { PASSAGES } from "./passages";

describe("characterStates", () => {
  it("marks pending, correct, and wrong characters in order", () => {
    expect(characterStates("abc", "ax")).toEqual(["correct", "wrong", "pending"]);
  });

  it("marks every typed character as extra past the passage end", () => {
    expect(characterStates("abc", "abcd")).toEqual([
      "correct",
      "correct",
      "correct",
      "extra",
    ]);
    expect(characterStates("ab", "abXYZ")).toHaveLength(5);
    expect(characterStates("ab", "abXYZ").slice(2)).toEqual(["extra", "extra", "extra"]);
  });

  it("keeps an untouched passage entirely pending", () => {
    expect(characterStates("hello", "")).toEqual(Array(5).fill("pending"));
  });

  it("counts only correct states", () => {
    expect(countCorrect(["correct", "wrong", "extra", "correct", "pending"])).toBe(2);
    expect(countCorrect([])).toBe(0);
  });
});

describe("accuracy", () => {
  it("is correct characters over characters typed", () => {
    expect(accuracyPercent("abc", "abd")).toBe(66.7);
    expect(accuracyPercent("abc", "abc")).toBe(100);
    expect(accuracyPercent("abc", "abdX")).toBe(50);
  });

  it("counts an empty input as 100", () => {
    expect(accuracyPercent("abc", "")).toBe(100);
  });

  it("counts extra characters as errors", () => {
    expect(countCorrectChars("abc", "abcd")).toBe(3);
    expect(accuracyPercent("abc", "abcd")).toBe(75);
    expect(accuracyPercent("abc", "abXYZ")).toBe(40);
  });
});

describe("speed", () => {
  it("uses five characters per word", () => {
    expect(wpm(250, 60_000)).toBe(50);
    expect(wpm(100, 30_000)).toBe(40);
    expect(wpm(50, 30_000)).toBe(20);
  });

  it("returns zero for a zero or missing duration", () => {
    expect(wpm(50, 0)).toBe(0);
    expect(wpm(50, -100)).toBe(0);
    expect(rawWpm(50, 0)).toBe(0);
  });

  it("counts all typed characters in raw speed, including extras", () => {
    expect(rawWpm(300, 60_000)).toBe(60);
    expect(rawWpm(11, 6_000)).toBe(22);
  });
});

describe("consistency", () => {
  it("scores a flat series at 100", () => {
    expect(consistencyScore([60, 60, 60, 60])).toBe(100);
  });

  it("scores an empty or stopped series at zero", () => {
    expect(consistencyScore([])).toBe(0);
    expect(consistencyScore([0, 0, 0])).toBe(0);
  });

  it("falls as the samples spread out", () => {
    expect(consistencyScore([30, 60])).toBe(66.7);
    expect(consistencyScore([60, 60, 0])).toBe(29.3);
  });

  it("never drops below zero", () => {
    expect(consistencyScore([0, 0, 100])).toBe(0);
  });
});

describe("wpmSamples", () => {
  it("turns each full second of typed characters into raw WPM", () => {
    const changes: TypingChange[] = [
      { at: 0, length: 0 },
      { at: 500, length: 10 },
      { at: 2_000, length: 30 },
    ];
    expect(wpmSamples(changes, 2_000)).toEqual([120, 240]);
  });

  it("returns one sample per full second and ignores a partial second", () => {
    expect(wpmSamples([{ at: 0, length: 0 }], 15_000)).toHaveLength(15);
    expect(wpmSamples([{ at: 0, length: 0 }], 1_500)).toHaveLength(1);
    expect(wpmSamples([{ at: 0, length: 0 }], 999)).toEqual([]);
  });

  it("uses the net input length reached inside each second", () => {
    const changes: TypingChange[] = [
      { at: 0, length: 0 },
      { at: 500, length: 10 },
      { at: 700, length: 4 },
    ];
    expect(wpmSamples(changes, 1_000)).toEqual([48]);
  });

  it("sorts out-of-order changes and keeps the last one per boundary", () => {
    const changes: TypingChange[] = [
      { at: 1_000, length: 5 },
      { at: 200, length: 2 },
    ];
    expect(wpmSamples(changes, 1_000)).toEqual([60]);
  });
});

describe("computeTypingResult", () => {
  it("combines net speed, raw speed, accuracy, and consistency", () => {
    const result = computeTypingResult({
      expected: "hello world",
      typed: "hello wurld",
      elapsedMs: 3_000,
      changes: [
        { at: 0, length: 0 },
        { at: 1_000, length: 4 },
        { at: 2_000, length: 8 },
        { at: 3_000, length: 11 },
      ],
    });
    expect(result.wpm).toBe(40);
    expect(result.rawWpm).toBe(44);
    expect(result.accuracy).toBe(90.9);
    expect(result.correctChars).toBe(10);
    expect(result.typedChars).toBe(11);
    expect(result.errors).toBe(1);
    expect(result.durationMs).toBe(3_000);
    expect(result.consistency).toBeGreaterThan(0);
  });

  it("reports a zero run without dividing by zero", () => {
    const result = computeTypingResult({
      expected: "hello",
      typed: "",
      elapsedMs: 0,
    });
    expect(result).toEqual({
      wpm: 0,
      rawWpm: 0,
      accuracy: 100,
      consistency: 0,
      correctChars: 0,
      typedChars: 0,
      errors: 0,
      durationMs: 0,
    });
  });

  it("counts extra characters as typed errors without inflating net speed", () => {
    const result = computeTypingResult({
      expected: "abc",
      typed: "abcdef",
      elapsedMs: 1_000,
    });
    expect(result.correctChars).toBe(3);
    expect(result.typedChars).toBe(6);
    expect(result.errors).toBe(3);
    expect(result.wpm).toBe(36);
    expect(result.rawWpm).toBe(72);
    expect(result.accuracy).toBe(50);
  });
});

describe("buildTestText", () => {
  it("repeats whole passages until it reaches the minimum length", () => {
    const text = buildTestText(["abc", "de"], 10);
    expect(text).toBe("abc de abc");
    expect(text.length).toBeGreaterThanOrEqual(10);
  });

  it("starts at the requested passage and wraps around", () => {
    expect(buildTestText(["one", "two", "six"], 10, 1)).toBe("two six one");
  });

  it("returns an empty string when there are no passages", () => {
    expect(buildTestText([], 100)).toBe("");
    expect(buildTestText(["  "], 100)).toBe("");
  });
});

describe("practice passages", () => {
  it("ships three distinct passages in a reasonable length band", () => {
    expect(PASSAGES).toHaveLength(3);
    expect(new Set(PASSAGES).size).toBe(3);
    for (const passage of PASSAGES) {
      expect(passage.length).toBeGreaterThanOrEqual(150);
      expect(passage.length).toBeLessThanOrEqual(250);
    }
  });

  it("covers every mode with enough text for a fast typist", () => {
    for (const seconds of [15, 30, 60]) {
      const text = buildTestText(PASSAGES, seconds * 20);
      expect(text.length).toBeGreaterThanOrEqual(seconds * 20);
    }
  });
});
