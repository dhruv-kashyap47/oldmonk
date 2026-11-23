import { describe, expect, it } from "vitest";
import { matchesTool, normalize, scoreTool, searchTools, tokenize } from "./search";
import type { ToolMeta } from "../tools/types";

function tool(overrides: Partial<ToolMeta>): ToolMeta {
  return {
    slug: "sample",
    name: "Sample tool",
    title: "Sample tool",
    description: "x".repeat(140),
    summary: "A sample summary.",
    category: "developer",
    topics: ["sample"],
    keywords: [],
    related: [],
    added: "2026-11-23",
    updated: "2026-11-23",
    loadTool: async () => ({ default: () => null }),
    loadContent: async () => ({ default: () => null, faq: [] }),
    ...overrides,
  };
}

describe("normalize", () => {
  it("lowercases, strips accents, and collapses whitespace", () => {
    expect(normalize("  Région   JSON  ")).toBe("region json");
  });
});

describe("tokenize", () => {
  it("splits on whitespace and returns nothing for an empty string", () => {
    expect(tokenize("json  format")).toEqual(["json", "format"]);
    expect(tokenize("   ")).toEqual([]);
  });
});

describe("matchesTool", () => {
  const json = tool({
    slug: "json-formatter",
    name: "JSON Formatter",
    summary: "Pretty-print JSON.",
    keywords: ["beautifier"],
    topics: ["json"],
  });

  it("matches every token across name, summary, category, keywords, and topics", () => {
    expect(matchesTool(json, "json")).toBe(true);
    expect(matchesTool(json, "developer")).toBe(true);
    expect(matchesTool(json, "beautifier")).toBe(true);
    expect(matchesTool(json, "json pretty")).toBe(true);
  });

  it("fails when one token is missing", () => {
    expect(matchesTool(json, "json regex")).toBe(false);
  });

  it("treats an empty query as a match", () => {
    expect(matchesTool(json, "")).toBe(true);
  });
});

describe("scoreTool", () => {
  it("ranks an exact name above a keyword and a summary match", () => {
    const exact = tool({ name: "Base64", summary: "Encode text.", keywords: [] });
    const keyword = tool({ name: "Other", summary: "A tool.", keywords: ["base64"] });
    const summary = tool({ name: "Third", summary: "Runs base64 locally.", keywords: [] });

    expect(scoreTool(exact, "base64")).toBeGreaterThan(scoreTool(keyword, "base64"));
    expect(scoreTool(keyword, "base64")).toBeGreaterThan(scoreTool(summary, "base64"));
  });
});

describe("searchTools", () => {
  it("keeps registry order on ties and filters non-matches", () => {
    const first = tool({ slug: "first", name: "Alpha timer" });
    const second = tool({ slug: "second", name: "Beta timer" });
    const other = tool({ slug: "other", name: "JSON" });

    expect(searchTools([first, second, other], "timer").map((entry) => entry.slug)).toEqual([
      "first",
      "second",
    ]);
  });

  it("returns every entry for an empty query", () => {
    const entries = [tool({ slug: "a" }), tool({ slug: "b" })];
    expect(searchTools(entries, " ")).toEqual(entries);
  });
});
