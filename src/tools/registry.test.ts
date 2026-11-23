import { describe, expect, it } from "vitest";
import {
  COPY_LIMITS,
  countTools,
  findMissingRelated,
  getTool,
  getToolsByCategory,
  resolveRelated,
  tools,
  validateTools,
} from "./registry";
import type { ToolCategory, ToolMeta } from "./types";

const VALID_DESCRIPTION =
  "Format, validate, and inspect JSON in your browser. The tool reads the text you paste and never sends any of it to a server.";

function makeTool(overrides: Partial<ToolMeta> = {}): ToolMeta {
  return {
    slug: "sample-tool",
    name: "Sample tool",
    title: "Sample tool",
    description: VALID_DESCRIPTION,
    summary: "A short summary of what the sample tool does.",
    category: "developer",
    topics: ["sample"],
    keywords: ["sample"],
    related: [],
    added: "2026-11-23",
    updated: "2026-11-23",
    loadTool: async () => ({ default: () => null }),
    loadContent: async () => ({ default: () => null, faq: [] }),
    ...overrides,
  };
}

function messages(entries: readonly ToolMeta[]): string[] {
  return validateTools(entries).map((issue) => `${issue.slug}: ${issue.message}`);
}

describe("validateTools", () => {
  it("accepts a complete tool with no issue", () => {
    expect(validateTools([makeTool()])).toEqual([]);
  });

  it("reports duplicate slugs on the second entry", () => {
    const result = messages([makeTool(), makeTool({ name: "Other tool" })]);
    expect(result).toContain("sample-tool: slug is used by more than one tool.");
  });

  it.each([
    ["JSON-Formatter", "uppercase"],
    ["-json", "leading hyphen"],
    ["json-", "trailing hyphen"],
    ["json--formatter", "double hyphen"],
    ["json formatter", "space"],
    ["json_formatter", "underscore"],
    ["", "empty"],
  ])("rejects the slug %j (%s)", (slug) => {
    const result = messages([makeTool({ slug })]);
    expect(result.some((message) => message.includes("slug must be lowercase"))).toBe(true);
  });

  it("rejects a category that is not part of the taxonomy", () => {
    const category = "marketing" as ToolCategory;
    const result = messages([makeTool({ category })]);
    expect(result.some((message) => message.includes('"marketing" is not a known category'))).toBe(true);
  });

  it("rejects a title over the length limit", () => {
    const title = "t".repeat(COPY_LIMITS.title.max + 1);
    const result = messages([makeTool({ title })]);
    expect(result.some((message) => message.startsWith("sample-tool: title must be"))).toBe(true);
  });

  it("rejects a description under and over the length limits", () => {
    expect(messages([makeTool({ description: "Too short." })])).not.toEqual([]);

    const description = "d".repeat(COPY_LIMITS.description.max + 1);
    expect(messages([makeTool({ description })])).not.toEqual([]);
  });

  it("rejects a summary over the length limit", () => {
    const summary = "s".repeat(COPY_LIMITS.summary.max + 1);
    expect(messages([makeTool({ summary })])).not.toEqual([]);
  });

  it("rejects leading or trailing whitespace in copy", () => {
    const result = messages([makeTool({ title: " Sample tool" })]);
    expect(result.some((message) => message.includes("leading or trailing whitespace"))).toBe(true);
  });

  it("rejects empty and duplicated list entries", () => {
    expect(messages([makeTool({ topics: [""] })])).not.toEqual([]);
    expect(
      messages([makeTool({ keywords: ["json", "json"] })]).some((message) =>
        message.includes('"json" twice'),
      ),
    ).toBe(true);
  });

  it("rejects duplicate related slugs and self references", () => {
    expect(
      messages([makeTool({ related: ["other", "other"] })]).some((message) =>
        message.includes('"other" twice'),
      ),
    ).toBe(true);
    expect(
      messages([makeTool({ related: ["sample-tool"] })]).some((message) =>
        message.includes("must not include the tool itself"),
      ),
    ).toBe(true);
  });

  it.each(["2026-02-30", "23-11-2026", "2026-11-23T00:00:00Z", ""])(
    "rejects the date %j",
    (added) => {
      const result = messages([makeTool({ added, updated: added })]);
      expect(result.some((message) => message.includes("real ISO date"))).toBe(true);
    },
  );

  it("rejects updated earlier than added", () => {
    const result = messages([makeTool({ added: "2026-11-23", updated: "2026-11-22" })]);
    expect(result.some((message) => message.includes("earlier than added"))).toBe(true);
  });
});

describe("findMissingRelated", () => {
  it("reports a related slug that no tool resolves", () => {
    const result = findMissingRelated([makeTool({ related: ["missing-tool"] })]);
    expect(result).toEqual([
      { slug: "sample-tool", message: 'related slug "missing-tool" does not exist.' },
    ]);
  });

  it("accepts related slugs that resolve", () => {
    const entries = [makeTool(), makeTool({ slug: "other-tool", name: "Other tool" })];
    expect(findMissingRelated(entries)).toEqual([]);
  });
});

describe("lookups", () => {
  const developerA = makeTool({ slug: "developer-a", name: "Developer A" });
  const textTool = makeTool({ slug: "text-a", name: "Text A", category: "text" });
  const developerB = makeTool({ slug: "developer-b", name: "Developer B" });
  const entries = [developerB, textTool, developerA];

  it("returns undefined for a slug that is not registered", () => {
    expect(getTool("nope")).toBeUndefined();
  });

  it("filters by category and keeps the curated order", () => {
    expect(getToolsByCategory("developer", entries).map((tool) => tool.slug)).toEqual([
      "developer-b",
      "developer-a",
    ]);
    expect(getToolsByCategory("timer", entries)).toEqual([]);
  });

  it("counts tools per category", () => {
    expect(countTools("developer", entries)).toBe(2);
    expect(countTools("test", entries)).toBe(0);
  });

  it("resolves related tools in the order the meta lists them", () => {
    const tool = makeTool({ related: ["developer-a", "missing", "developer-b"] });
    expect(resolveRelated(tool, entries).map((related) => related.slug)).toEqual([
      "developer-a",
      "developer-b",
    ]);
  });
});

describe("shipped registry", () => {
  it("has no structural issues", () => {
    expect(validateTools(tools)).toEqual([]);
  });

  it("has no broken related slugs", () => {
    expect(findMissingRelated(tools)).toEqual([]);
  });

  it("uses a unique slug for every tool", () => {
    const slugs = tools.map((tool) => tool.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
