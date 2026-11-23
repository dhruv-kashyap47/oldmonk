import { describe, expect, it } from "vitest";
import {
  ALL_SYMBOLS,
  SYMBOL_CATEGORIES,
  categoryName,
  type SymbolCategoryId,
} from "./data";
import {
  CATEGORY_OPTIONS,
  RECENT_LIMIT,
  addRecent,
  copyAllText,
  filterSymbols,
  findSymbol,
  resolveRecent,
  visibleCount,
} from "./logic";

describe("symbol data", () => {
  it("uses a unique character for every symbol", () => {
    const seen = new Set<string>();
    for (const entry of ALL_SYMBOLS) {
      expect(seen.has(entry.char), `${entry.char} appears twice`).toBe(false);
      seen.add(entry.char);
    }
    expect(seen.size).toBe(ALL_SYMBOLS.length);
  });

  it("gives every symbol a name and at least one keyword", () => {
    for (const entry of ALL_SYMBOLS) {
      expect(entry.name.trim().length).toBeGreaterThan(0);
      expect(entry.keywords.length).toBeGreaterThan(0);
      expect(entry.keywords.every((keyword) => keyword.trim().length > 0)).toBe(true);
    }
  });

  it("has entries in every category", () => {
    const expected: readonly SymbolCategoryId[] = [
      "hearts",
      "stars",
      "arrows",
      "currency",
      "math",
      "punctuation",
      "aesthetic",
      "games",
    ];
    for (const id of expected) {
      const category = SYMBOL_CATEGORIES.find((entry) => entry.id === id);
      expect(category, `missing category ${id}`).toBeDefined();
      expect(category?.symbols.length ?? 0).toBeGreaterThanOrEqual(8);
    }
  });
});

describe("search and filters", () => {
  it("finds hearts by name", () => {
    const results = filterSymbols("heart");
    expect(results.length).toBeGreaterThan(5);
    expect(results.every((entry) => entry.category === "hearts")).toBe(true);
  });

  it("matches keywords, not only names", () => {
    const results = filterSymbols("love");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((entry) => entry.char === "♥")).toBe(true);
  });

  it("ignores case and surrounding spaces", () => {
    const lower = filterSymbols("arrow");
    const upper = filterSymbols("  ARROW  ");
    expect(upper.map((entry) => entry.char)).toEqual(lower.map((entry) => entry.char));
  });

  it("requires every word in a multi word query", () => {
    const results = filterSymbols("white star");
    expect(results.length).toBeGreaterThan(0);
    for (const entry of results) {
      const text = `${entry.name} ${entry.keywords.join(" ")}`.toLowerCase();
      expect(text).toContain("white");
      expect(text).toContain("star");
    }
  });

  it("searches by category name", () => {
    const results = filterSymbols("games");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((entry) => entry.category === "games")).toBe(true);
  });

  it("filters by category", () => {
    const results = filterSymbols("", "hearts");
    expect(results.length).toBe(SYMBOL_CATEGORIES[0]?.symbols.length);
    expect(results.every((entry) => entry.category === "hearts")).toBe(true);
  });

  it("returns nothing when a filter and a query do not meet", () => {
    expect(filterSymbols("infinity", "hearts")).toHaveLength(0);
  });

  it("offers an all option plus one per category", () => {
    expect(CATEGORY_OPTIONS).toHaveLength(SYMBOL_CATEGORIES.length + 1);
    expect(CATEGORY_OPTIONS[0]?.id).toBe("all");
  });

  it("names every category", () => {
    for (const category of SYMBOL_CATEGORIES) {
      expect(categoryName(category.id)).toBe(category.name);
    }
  });
});

describe("recents and copy", () => {
  it("puts the newest symbol first and removes duplicates", () => {
    const once = addRecent([], "★");
    const twice = addRecent(once, "♥");
    const again = addRecent(twice, "★");
    expect(again).toEqual(["★", "♥"]);
  });

  it("keeps at most eight entries", () => {
    let recent: readonly string[] = [];
    for (const entry of ALL_SYMBOLS.slice(0, 12)) {
      recent = addRecent(recent, entry.char);
    }
    expect(recent).toHaveLength(RECENT_LIMIT);
    expect(recent[0]).toBe(ALL_SYMBOLS[11]?.char);
  });

  it("resolves stored characters and drops unknown ones", () => {
    const resolved = resolveRecent(["♥", "not-a-symbol", "★"]);
    expect(resolved.map((entry) => entry.char)).toEqual(["♥", "★"]);
  });

  it("finds a symbol by character", () => {
    expect(findSymbol("€")?.name).toBe("Euro sign");
    expect(findSymbol("x")).toBeUndefined();
  });

  it("joins visible symbols for one copy action", () => {
    const entries = filterSymbols("", "hearts").slice(0, 3);
    expect(copyAllText(entries)).toBe(entries.map((entry) => entry.char).join(" "));
    expect(visibleCount(entries)).toBe(3);
  });
});
