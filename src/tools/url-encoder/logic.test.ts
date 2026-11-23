import { describe, expect, it } from "vitest";
import {
  buildUrl,
  decodeUrlText,
  encodeUrlText,
  parseUrl,
  type ParsedUrl,
} from "./logic";

function encoded(input: string, scope: "component" | "full" = "component"): string {
  const result = encodeUrlText(input, scope);
  if (!result.ok) throw new Error(result.message);
  return result.output;
}

function decoded(input: string, scope: "component" | "full" = "component"): string {
  const result = decodeUrlText(input, scope);
  if (!result.ok) throw new Error(result.message);
  return result.output;
}

function parsed(input: string): ParsedUrl {
  const result = parseUrl(input);
  if (!result.ok) throw new Error(result.message);
  return result.parsed;
}

describe("encodeUrlText", () => {
  it("encodes a space as %20 in component mode", () => {
    expect(encoded("a b")).toBe("a%20b");
  });

  it("encodes ampersands and equals signs in component mode", () => {
    expect(encoded("a&b=c")).toBe("a%26b%3Dc");
  });

  it("leaves URL structure in full mode", () => {
    expect(encoded("https://example.com/a b?x=1&y=2", "full")).toBe(
      "https://example.com/a%20b?x=1&y=2",
    );
  });

  it("encodes UTF-8 text", () => {
    expect(encoded("café 中")).toBe("caf%C3%A9%20%E4%B8%AD");
  });

  it("returns a failure for an unpaired surrogate", () => {
    const result = encodeUrlText("\uD800", "component");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.message).toContain("surrogate");
  });
});

describe("decodeUrlText", () => {
  it("decodes %20 and plus stays a plus in component mode", () => {
    expect(decoded("a%20b")).toBe("a b");
    expect(decoded("a+b")).toBe("a+b");
  });

  it("decodes ampersands and equals signs in component mode", () => {
    expect(decoded("a%26b%3Dc")).toBe("a&b=c");
  });

  it("decodes UTF-8 escapes", () => {
    expect(decoded("caf%C3%A9%20%E4%B8%AD")).toBe("café 中");
  });

  it("reports a malformed percent escape", () => {
    for (const input of ["%", "%2", "%ZZ", "%E0%A4%A"]) {
      const result = decodeUrlText(input, "component");
      expect(result.ok).toBe(false);
      if (result.ok) continue;
      expect(result.message).toContain("malformed percent escape");
    }
  });

  it("reports a malformed escape in full mode too", () => {
    const result = decodeUrlText("https://example.com/%ZZ", "full");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.message).toContain("malformed percent escape");
  });

  it("round-trips a full URL", () => {
    const url = "https://example.com/a path?q=café & tea&x=1#frag ment";
    const result = decodeUrlText(encoded(url, "full"), "full");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.output).toBe(url);
  });
});

describe("parseUrl", () => {
  it("splits a base, query pairs, and fragment", () => {
    const result = parsed("https://example.com/search?a=1&b=two#top");
    expect(result.base).toBe("https://example.com/search");
    expect(result.hash).toBe("#top");
    expect(result.pairs).toEqual([
      { key: "a", value: "1" },
      { key: "b", value: "two" },
    ]);
  });

  it("decodes percent escapes and treats plus as a space", () => {
    const result = parsed("https://example.com/?q=caf%C3%A9+%26+tea&tag=a%3Db");
    expect(result.pairs).toEqual([
      { key: "q", value: "café & tea" },
      { key: "tag", value: "a=b" },
    ]);
  });

  it("keeps a pair without an equals sign as an empty value", () => {
    const result = parsed("https://example.com/?flag&x=1");
    expect(result.pairs).toEqual([
      { key: "flag", value: "" },
      { key: "x", value: "1" },
    ]);
  });

  it("accepts a URL with no query or fragment", () => {
    const result = parsed("https://example.com/path");
    expect(result.pairs).toEqual([]);
    expect(result.hash).toBe("");
  });

  it("rejects empty input", () => {
    const result = parseUrl("   ");
    expect(result.ok).toBe(false);
  });

  it("rejects a malformed escape in a query value", () => {
    const result = parseUrl("https://example.com/?a=%ZZ");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.message).toContain("malformed percent escape");
  });

  it("rejects a malformed escape in a query key", () => {
    const result = parseUrl("https://example.com/?%E0%A4%A=1");
    expect(result.ok).toBe(false);
  });
});

describe("buildUrl", () => {
  it("rebuilds a URL and normalises the encoding", () => {
    const result = buildUrl(parsed("https://example.com/search?q=caf%C3%A9+%26+tea&tag=a%3Db#top"), [
      { key: "q", value: "café & tea" },
      { key: "tag", value: "a=b" },
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.output).toBe(
      "https://example.com/search?q=caf%C3%A9%20%26%20tea&tag=a%3Db#top",
    );
  });

  it("drops empty rows", () => {
    const result = buildUrl(parsed("https://example.com/?a=1"), [
      { key: "a", value: "1" },
      { key: "", value: "" },
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.output).toBe("https://example.com/?a=1");
  });

  it("removes the query string when no pairs remain and keeps the fragment", () => {
    const result = buildUrl(parsed("https://example.com/?a=1#top"), []);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.output).toBe("https://example.com/#top");
  });

  it("encodes an empty value with a trailing equals sign", () => {
    const result = buildUrl({ base: "https://example.com/", hash: "", pairs: [] }, [
      { key: "flag", value: "" },
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.output).toBe("https://example.com/?flag=");
  });
});
