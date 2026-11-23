import { describe, expect, it } from "vitest";
import {
  canonicalFlags,
  compileRegex,
  highlightSegments,
  REGEX_PRESETS,
  replaceRegex,
  testRegex,
} from "./logic";

function search(pattern: string, flags: string, input: string, limit?: number) {
  const result = testRegex(pattern, flags, input, limit);
  if (!result.ok) throw new Error(`Expected matches, got ${result.error}`);
  return result;
}

describe("canonicalFlags", () => {
  it("orders known flags and removes duplicates", () => {
    expect(canonicalFlags("ig")).toBe("gi");
    expect(canonicalFlags("gg")).toBe("g");
    expect(canonicalFlags("yusmig")).toBe("gimsuy");
  });

  it("keeps unknown flags so the compiler rejects them", () => {
    expect(canonicalFlags("gz")).toBe("gz");
  });
});

describe("compileRegex", () => {
  it("compiles a valid pattern", () => {
    const result = compileRegex("a+", "gi");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.regex.flags).toBe("gi");
  });

  it("reports an invalid pattern", () => {
    const result = compileRegex("(", "");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.length).toBeGreaterThan(0);
  });

  it("reports an invalid flag", () => {
    expect(compileRegex("a", "z").ok).toBe(false);
  });
});

describe("testRegex", () => {
  it("finds every global match with its index", () => {
    const result = search("cat", "g", "cat and cat");
    expect(result.matches.map((match) => match.index)).toEqual([0, 8]);
    expect(result.matches.map((match) => match.text)).toEqual(["cat", "cat"]);
    expect(result.truncated).toBe(false);
  });

  it("stops at the first match without the g flag", () => {
    const result = search("cat", "", "cat and cat");
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0]?.index).toBe(0);
  });

  it("returns capture groups and unmatched groups as null", () => {
    const result = search("(a)(b)?", "", "a");
    expect(result.matches[0]?.groups).toEqual(["a", null]);
  });

  it("returns named groups", () => {
    const result = search("(?<year>\\d{4})-(?<month>\\d{2})", "", "2026-11");
    expect(result.matches[0]?.namedGroups).toEqual([
      { name: "year", value: "2026" },
      { name: "month", value: "11" },
    ]);
  });

  it("honours the ignore case flag", () => {
    expect(search("cat", "gi", "Cat cat").matches).toHaveLength(2);
    expect(search("cat", "g", "Cat cat").matches).toHaveLength(1);
  });

  it("honours the multiline flag", () => {
    expect(search("^b", "gm", "a\nb").matches[0]?.index).toBe(2);
    expect(search("^b", "g", "a\nb").matches).toHaveLength(0);
  });

  it("honours the dot all flag", () => {
    expect(search("a.b", "gs", "a\nb").matches).toHaveLength(1);
    expect(search("a.b", "g", "a\nb").matches).toHaveLength(0);
  });

  it("treats an emoji as one match in unicode mode", () => {
    expect(search(".", "gu", "😀x").matches.map((match) => match.text)).toEqual(["😀", "x"]);
    expect(search(".", "g", "😀x").matches).toHaveLength(3);
  });

  it("advances through zero-length matches", () => {
    expect(search("(?=a)", "g", "aaa").matches.map((match) => match.index)).toEqual([0, 1, 2]);
    expect(search("", "g", "abc").matches).toHaveLength(4);
  });

  it("keeps sticky matching anchored to the last index", () => {
    const result = search("\\d+", "y", "12ab34");
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0]?.text).toBe("12");
  });

  it("marks a result truncated at the match limit", () => {
    const result = search("a", "g", "aaaa", 2);
    expect(result.matches).toHaveLength(2);
    expect(result.truncated).toBe(true);
  });

  it("does not mark a result truncated when the limit is exact", () => {
    const result = search("a", "g", "aa", 2);
    expect(result.matches).toHaveLength(2);
    expect(result.truncated).toBe(false);
  });
});

describe("replaceRegex", () => {
  it("replaces every match with the g flag", () => {
    const result = replaceRegex("(\\w+)@(\\w+)", "g", "a@b c@d", "$2@$1");
    expect(result).toEqual({ ok: true, output: "b@a d@c" });
  });

  it("replaces only the first match without the g flag", () => {
    const result = replaceRegex("cat", "", "cat and cat", "dog");
    expect(result).toEqual({ ok: true, output: "dog and cat" });
  });

  it("supports named group references", () => {
    const result = replaceRegex(
      "(?<user>\\w+)@(?<host>\\w+)",
      "g",
      "ana@example",
      "$<user> at $<host>",
    );
    expect(result).toEqual({ ok: true, output: "ana at example" });
  });

  it("reports an invalid pattern", () => {
    expect(replaceRegex("(", "", "x", "y").ok).toBe(false);
  });
});

describe("highlightSegments", () => {
  it("splits plain and matched runs", () => {
    const matches = search("cat", "g", "a cat and a cat").matches;
    const segments = highlightSegments("a cat and a cat", matches);
    expect(segments).toEqual([
      { text: "a ", matched: false },
      { text: "cat", matched: true },
      { text: " and a ", matched: false },
      { text: "cat", matched: true },
    ]);
  });

  it("skips zero-length matches and keeps the rest of the text", () => {
    const matches = search("(?=a)", "g", "aaa").matches;
    expect(highlightSegments("aaa", matches)).toEqual([{ text: "aaa", matched: false }]);
  });

  it("returns one plain run when there are no matches", () => {
    expect(highlightSegments("hello", [])).toEqual([{ text: "hello", matched: false }]);
  });
});

describe("REGEX_PRESETS", () => {
  it("ships five presets whose patterns compile", () => {
    expect(REGEX_PRESETS).toHaveLength(5);
    for (const preset of REGEX_PRESETS) {
      expect(compileRegex(preset.pattern, preset.flags).ok).toBe(true);
    }
  });

  it("has a preset that matches its own sample", () => {
    const email = REGEX_PRESETS.find((preset) => preset.id === "email");
    expect(email).toBeDefined();
    if (!email) return;
    expect(search(email.pattern, email.flags, email.sample).matches.length).toBeGreaterThan(0);
  });
});
