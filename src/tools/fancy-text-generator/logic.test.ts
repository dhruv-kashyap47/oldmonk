import { describe, expect, it } from "vitest";
import {
  FANCY_STYLES,
  PREVIEW_SAMPLE,
  formatAllStyles,
  generateAll,
  generateStyle,
  hasStyledCharacters,
  passthroughCharacters,
} from "./logic";
import { applyStyle, codePointLength, hasLoneSurrogate } from "../_shared/unicode";
import { getUnicodeStyle } from "../_shared/unicode-fonts.data";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SAMPLE = "Emoji 😀🎉, cafe, 日本語 42";

function style(id: string) {
  const found = getUnicodeStyle(id);
  if (!found) throw new Error(`Missing style ${id}`);
  return found;
}

describe("style maps", () => {
  it("lists the fifteen fancy styles", () => {
    expect(FANCY_STYLES).toHaveLength(15);
    expect(new Set(FANCY_STYLES.map((entry) => entry.id)).size).toBe(15);
  });

  it("covers every upper and lower case letter in every map style", () => {
    for (const entry of FANCY_STYLES) {
      if (entry.mode !== "map") continue;
      for (const letter of LETTERS) {
        expect(entry.map.has(letter), `${entry.id} is missing ${letter}`).toBe(true);
      }
    }
  });

  it("changes every letter in every style", () => {
    for (const entry of FANCY_STYLES) {
      const output = applyStyle(LETTERS, entry).text;
      expect(output, `${entry.id} left the alphabet unchanged`).not.toBe(LETTERS);
    }
  });

  it("styles digits only where the style has digit glyphs", () => {
    for (const entry of FANCY_STYLES) {
      if (entry.mode !== "map") continue;
      const output = applyStyle(DIGITS, entry).text;
      if (entry.styledDigits) {
        expect(output, `${entry.id} should style digits`).not.toBe(DIGITS);
        for (const digit of DIGITS) {
          expect(output.includes(digit), `${entry.id} leaks plain digit ${digit}`).toBe(false);
        }
      } else {
        expect(output, `${entry.id} should pass digits through`).toBe(DIGITS);
      }
    }
  });

  it("uses the documented mathematical glyphs", () => {
    expect(applyStyle("A", style("bold")).text).toBe("\u{1d400}");
    expect(applyStyle("h", style("italic")).text).toBe("\u210e");
    expect(applyStyle("B", style("script")).text).toBe("\u212c");
    expect(applyStyle("Z", style("fraktur")).text).toBe("\u2128");
    expect(applyStyle("R", style("double-struck")).text).toBe("\u211d");
    expect(applyStyle("1", style("circled")).text).toBe("\u2460");
    expect(applyStyle("1", style("fullwidth")).text).toBe("\uff11");
  });
});

describe("conversion", () => {
  it("keeps emoji and other surrogate pairs whole in every style", () => {
    for (const entry of FANCY_STYLES) {
      const output = applyStyle("😀🎉", entry).text;
      expect(output).toContain("😀");
      expect(output).toContain("🎉");
      expect(hasLoneSurrogate(output), `${entry.id} broke a surrogate`).toBe(false);
    }
  });

  it("never leaves a lone surrogate on mixed input", () => {
    for (const entry of FANCY_STYLES) {
      const output = applyStyle(SAMPLE, entry).text;
      expect(hasLoneSurrogate(output), `${entry.id} broke a surrogate`).toBe(false);
      expect(codePointLength(output)).toBeGreaterThan(0);
    }
  });

  it("passes unmapped characters through unchanged", () => {
    expect(applyStyle("日本語", style("bold")).text).toBe("日本語");
    expect(applyStyle("日本語", style("script")).text).toBe("日本語");
  });

  it("keeps punctuation and spaces in map styles", () => {
    const output = applyStyle("hello, world!", style("bold")).text;
    expect(output).toContain(", ");
    expect(output.endsWith("!")).toBe(true);
  });

  it("preserves line breaks in every style", () => {
    for (const entry of FANCY_STYLES) {
      const output = applyStyle("one\ntwo", entry).text;
      expect(output.split("\n")).toHaveLength(2);
    }
  });

  it("returns an empty string for empty input", () => {
    for (const entry of FANCY_STYLES) {
      expect(applyStyle("", entry).text).toBe("");
    }
  });

  it("reports digits that fall back in script", () => {
    const result = applyStyle("Kai 42", style("script"));
    expect(result.passthrough).toContain("4");
    expect(result.passthrough).toContain("2");
    expect(result.text).toContain("42");
  });
});

describe("page helpers", () => {
  it("builds a preview for every style", () => {
    const previews = generateAll(PREVIEW_SAMPLE);
    expect(previews).toHaveLength(FANCY_STYLES.length);
    expect(previews.every((preview) => preview.text.length > 0)).toBe(true);
    expect(previews.every((preview) => preview.name.length > 0)).toBe(true);
  });

  it("returns null for an unknown style id", () => {
    expect(generateStyle("abc", "not-a-style")).toBeNull();
  });

  it("labels each line in the copy all block", () => {
    const previews = generateAll("test");
    const block = formatAllStyles(previews);
    for (const preview of previews) {
      expect(block).toContain(`${preview.name}: ${preview.text}`);
    }
  });

  it("collects passthrough characters", () => {
    const previews = generateAll("A1 😀");
    expect(passthroughCharacters(previews)).toContain("1");
    expect(passthroughCharacters(previews)).toContain("😀");
    expect(hasStyledCharacters(previews)).toBe(true);
  });
});
