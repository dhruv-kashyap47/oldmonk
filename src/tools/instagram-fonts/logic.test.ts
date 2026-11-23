import { describe, expect, it } from "vitest";
import {
  BIO_LIMIT,
  INSTAGRAM_STYLES,
  countBio,
  fieldAdvice,
  generateBioStyle,
  generateBioStyles,
  lineCount,
  trimToBioLimit,
} from "./logic";
import { hasLoneSurrogate } from "../_shared/unicode";

describe("bio counter", () => {
  it("counts an empty bio", () => {
    expect(countBio("")).toEqual({ used: 0, remaining: BIO_LIMIT, over: false, limit: BIO_LIMIT });
  });

  it("counts at the limit without going over", () => {
    const text = "a".repeat(BIO_LIMIT);
    const result = countBio(text);
    expect(result.used).toBe(BIO_LIMIT);
    expect(result.remaining).toBe(0);
    expect(result.over).toBe(false);
  });

  it("flags one character over the limit", () => {
    const result = countBio("a".repeat(BIO_LIMIT + 1));
    expect(result.over).toBe(true);
    expect(result.used).toBe(BIO_LIMIT + 1);
    expect(result.remaining).toBe(0);
  });

  it("counts code points rather than UTF-16 units", () => {
    const result = countBio("\u{1f338}\u{1f338}");
    expect(result.used).toBe(2);
    expect(result.over).toBe(false);
  });

  it("counts line breaks as characters", () => {
    expect(countBio("one\ntwo").used).toBe(7);
    expect(lineCount("one\ntwo")).toBe(2);
    expect(lineCount("")).toBe(0);
  });

  it("gives advice based on the remaining room", () => {
    expect(fieldAdvice(countBio("short"))).toContain("left for the bio");
    expect(fieldAdvice(countBio("a".repeat(BIO_LIMIT + 3)))).toContain("Cut 3 characters");
    expect(fieldAdvice(countBio("a".repeat(BIO_LIMIT - 5)))).toContain("caption");
  });
});

describe("trimming", () => {
  it("leaves text under the limit alone", () => {
    expect(trimToBioLimit("short")).toBe("short");
  });

  it("cuts to the limit", () => {
    expect(trimToBioLimit("abcdef", 3)).toBe("abc");
  });

  it("never splits an emoji", () => {
    const text = "\u{1f338}".repeat(4);
    const trimmed = trimToBioLimit(text, 2);
    expect(trimmed).toBe("\u{1f338}\u{1f338}");
    expect(hasLoneSurrogate(trimmed)).toBe(false);
  });
});

describe("bio styles", () => {
  it("ships nine styles", () => {
    expect(INSTAGRAM_STYLES).toHaveLength(9);
    expect(INSTAGRAM_STYLES.map((entry) => entry.id)).toEqual([
      "bold",
      "italic",
      "bold-italic",
      "script",
      "bold-script",
      "sans-bold",
      "double-struck",
      "monospace",
      "fullwidth",
    ]);
  });

  it("changes every letter in every style", () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for (const style of INSTAGRAM_STYLES) {
      const result = generateBioStyle(letters, style.id);
      expect(result).not.toBeNull();
      expect(result?.text).not.toBe(letters);
      expect(result?.characters).toBe(letters.length);
      expect(hasLoneSurrogate(result?.text ?? "")).toBe(false);
    }
  });

  it("preserves line breaks in every style", () => {
    const bio = "Ana\nCeramist\nLisbon";
    for (const preview of generateBioStyles(bio)) {
      expect(preview.text.split("\n")).toHaveLength(3);
      expect(preview.text.split("\n")).toHaveLength(lineCount(bio));
    }
  });

  it("returns null for a style outside the bio set", () => {
    expect(generateBioStyle("Ana", "circled")).toBeNull();
  });

  it("keeps emoji whole", () => {
    for (const preview of generateBioStyles("Ana \u{1f338}")) {
      expect(preview.text).toContain("\u{1f338}");
      expect(hasLoneSurrogate(preview.text)).toBe(false);
    }
  });
});
