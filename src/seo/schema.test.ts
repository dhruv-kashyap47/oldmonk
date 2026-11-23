import { describe, expect, it } from "vitest";
import {
  breadcrumbSchema,
  faqSchema,
  serializeJsonLd,
  webApplicationSchema,
  websiteSchema,
} from "./schema";
import type { ToolMeta } from "../tools/types";

const tool: ToolMeta = {
  slug: "json-formatter",
  name: "JSON Formatter",
  title: "JSON Formatter",
  description: "x".repeat(140),
  summary: "Pretty-print JSON.",
  category: "developer",
  topics: ["json"],
  keywords: [],
  related: [],
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: async () => ({ default: () => null }),
  loadContent: async () => ({ default: () => null, faq: [] }),
};

describe("serializeJsonLd", () => {
  it("escapes a closing script tag", () => {
    const output = serializeJsonLd({ value: "</script><script>alert(1)</script>" });
    expect(output).not.toContain("</script>");
    expect(output).toContain("\\u003c");
    expect(JSON.parse(output).value).toContain("</script>");
  });
});

describe("schemas", () => {
  it("describes the site in absolute terms", () => {
    const schema = websiteSchema();
    expect(schema["@type"]).toBe("WebSite");
    expect(schema.url).toBe("https://oldmonk.dev");
  });

  it("describes a free web application", () => {
    const schema = webApplicationSchema(tool) as Record<string, unknown>;
    expect(schema["@type"]).toBe("WebApplication");
    expect(schema.url).toBe("https://oldmonk.dev/json-formatter");
    expect(schema.isAccessibleForFree).toBe(true);
    expect((schema.offers as { price: string }).price).toBe("0");
  });

  it("numbers breadcrumbs from one", () => {
    const schema = breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "JSON tools", path: "/json-tools" },
    ]) as { itemListElement: { position: number; item: string }[] };
    expect(schema.itemListElement.map((item) => item.position)).toEqual([1, 2]);
    expect(schema.itemListElement[0]?.item).toBe("https://oldmonk.dev");
  });

  it("turns every FAQ item into a question", () => {
    const schema = faqSchema([{ question: "Q?", answer: "A." }]) as {
      mainEntity: { name: string }[];
    };
    expect(schema.mainEntity).toHaveLength(1);
    expect(schema.mainEntity[0]?.name).toBe("Q?");
  });
});
