import { describe, expect, it } from "vitest";
import {
  CURSIVE_STYLES,
  CURSIVE_SUPPORT,
  cursivePassthrough,
  generateAllCursive,
  generateCursive,
  signatureBlock,
} from "./logic";
import { applyStyle, hasLoneSurrogate } from "../_shared/unicode";
import { getUnicodeStyle } from "../_shared/unicode-fonts.data";

function style(id: string) {
  const found = getUnicodeStyle(id);
  if (!found) throw new Error(`Missing style ${id}`);
  return found;
}

describe("cursive style set", () => {
  it("keeps the curated order", () => {
    expect(CURSIVE_STYLES.map((entry) => entry.id)).toEqual([
      "script",
      "bold-script",
      "italic",
      "bold-italic",
    ]);
  });

  it("has one support row per style", () => {
    expect(CURSIVE_SUPPORT).toHaveLength(CURSIVE_STYLES.length);
    for (const row of CURSIVE_SUPPORT) {
      expect(row.name.length).toBeGreaterThan(0);
      expect(row.uppercase.length).toBeGreaterThan(0);
      expect(row.lowercase.length).toBeGreaterThan(0);
      expect(row.digits.length).toBeGreaterThan(0);
      expect(row.missingGlyph.length).toBeGreaterThan(0);
    }
  });

  it("uses the expected script glyphs", () => {
    expect(applyStyle("B", style("script")).text).toBe("\u212c");
    expect(applyStyle("e", style("script")).text).toBe("\u212f");
    expect(applyStyle("A", style("bold-script")).text).toBe("\u{1d4d0}");
    expect(applyStyle("h", style("italic")).text).toBe("\u210e");
    expect(applyStyle("a", style("bold-italic")).text).toBe("\u{1d482}");
  });
});

describe("uppercase gaps and fallback", () => {
  it("fills script uppercase gaps with the Letterlike Symbols letters", () => {
    const output = applyStyle("BEFHILMR", style("script")).text;
    expect(Array.from(output)).toEqual([
      "\u212c",
      "\u2130",
      "\u2131",
      "\u210b",
      "\u2110",
      "\u2112",
      "\u2133",
      "\u211b",
    ]);
  });

  it("leaves digits plain in every cursive style", () => {
    for (const entry of CURSIVE_STYLES) {
      expect(applyStyle("2026", entry).text).toBe("2026");
    }
  });

  it("reports a digit as passthrough rather than mangling it", () => {
    const result = applyStyle("Ana 7", style("script"));
    expect(result.text.endsWith("7")).toBe(true);
    expect(result.passthrough).toContain("7");
  });

  it("keeps emoji whole and reports them as passthrough", () => {
    const result = applyStyle("Ana \u{1f338}", style("script"));
    expect(result.text).toContain("\u{1f338}");
    expect(result.passthrough).toContain("\u{1f338}");
    expect(hasLoneSurrogate(result.text)).toBe(false);
  });
});

describe("page helpers", () => {
  it("builds previews in the curated order", () => {
    const previews = generateAllCursive("Ana");
    expect(previews.map((preview) => preview.id)).toEqual([
      "script",
      "bold-script",
      "italic",
      "bold-italic",
    ]);
    expect(previews.every((preview) => preview.mappedCount === 3)).toBe(true);
  });

  it("returns null for a style outside the cursive set", () => {
    expect(generateCursive("Ana", "fraktur")).toBeNull();
  });

  it("collects characters that stay plain across styles", () => {
    const previews = generateAllCursive("Ana 7 \u{1f338}");
    const plain = cursivePassthrough(previews);
    expect(plain).toContain("7");
    expect(plain).toContain("\u{1f338}");
  });

  it("keeps line breaks in a preview", () => {
    const preview = generateCursive("Ana\nDesign", "script");
    expect(preview?.text.split("\n")).toHaveLength(2);
  });

  it("builds a signature block with a plain role line", () => {
    expect(signatureBlock("Ana", "Ceramist", "script")).toBe(
      "\u{1d49c}\u{1d4c3}\u{1d4b6}\nCeramist",
    );
    expect(signatureBlock("Ana", "   ", "script")).toBe(
      "\u{1d49c}\u{1d4c3}\u{1d4b6}",
    );
    expect(signatureBlock("Ana", "Ceramist", "fraktur")).toBe("");
  });
});
