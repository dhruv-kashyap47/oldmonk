import { describe, expect, it } from "vitest";
import {
  BASE64_SIZE_LIMIT,
  decodeBase64Bytes,
  decodeBase64Text,
  encodeBase64Bytes,
  encodeBase64Text,
} from "./logic";

describe("encodeBase64Text", () => {
  it("encodes ASCII", () => {
    const result = encodeBase64Text("hello");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.output).toBe("aGVsbG8=");
    expect(result.bytes).toBe(5);
  });

  it("encodes an empty string to an empty string", () => {
    const result = encodeBase64Text("");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.output).toBe("");
    expect(result.bytes).toBe(0);
  });

  it("encodes an emoji as four UTF-8 bytes", () => {
    const result = encodeBase64Text("😀");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.output).toBe("8J+YgA==");
    expect(result.bytes).toBe(4);
  });

  it("encodes CJK text", () => {
    const result = encodeBase64Text("中文");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.output).toBe("5Lit5paH");
    expect(result.bytes).toBe(6);
  });

  it("honours the size cap", () => {
    const result = encodeBase64Text("abcd", false, 3);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("size");
    expect(result.message).toContain("3 bytes");
  });

  it("uses the documented default of 10 MB", () => {
    expect(BASE64_SIZE_LIMIT).toBe(10 * 1024 * 1024);
  });
});

describe("decodeBase64Text", () => {
  it("decodes ASCII", () => {
    const result = decodeBase64Text("aGVsbG8=");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.output).toBe("hello");
    expect(result.bytes).toBe(5);
  });

  it("round-trips emoji and CJK", () => {
    for (const text of ["😀", "中文", "café ☕", "line\nbreak"]) {
      const encoded = encodeBase64Text(text);
      expect(encoded.ok).toBe(true);
      if (!encoded.ok) continue;
      const decoded = decodeBase64Text(encoded.output);
      expect(decoded.ok).toBe(true);
      if (!decoded.ok) continue;
      expect(decoded.output).toBe(text);
    }
  });

  it("accepts missing padding and surrounding whitespace", () => {
    const result = decodeBase64Text("  aGVs bG8  ");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.output).toBe("hello");
  });

  it("rejects empty input", () => {
    const result = decodeBase64Text("   ");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("empty");
  });

  it("rejects an impossible length", () => {
    const result = decodeBase64Text("A");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid-base64");
  });

  it("rejects characters outside the alphabet", () => {
    const result = decodeBase64Text("aGV!bG8=");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid-base64");
    expect(result.message).toContain("not a Base64 character");
  });

  it("rejects padding in the middle and excess padding", () => {
    const middle = decodeBase64Text("aGV=sbG8");
    expect(middle.ok).toBe(false);
    if (middle.ok) return;
    expect(middle.code).toBe("invalid-base64");

    const excess = decodeBase64Text("aGVsbG8===");
    expect(excess.ok).toBe(false);
    if (excess.ok) return;
    expect(excess.code).toBe("invalid-base64");
  });

  it("rejects bytes that are not UTF-8", () => {
    const encoded = encodeBase64Bytes(new Uint8Array([0xff, 0xfe]));
    expect(encoded.ok).toBe(true);
    if (!encoded.ok) return;
    const result = decodeBase64Text(encoded.output);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid-utf8");
    expect(result.message).toContain("not valid UTF-8");
  });

  it("honours the size cap on the encoded input", () => {
    const result = decodeBase64Text("aGVsbG8=", 4);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("size");
  });
});

describe("URL-safe Base64", () => {
  const bytes = new Uint8Array([0xfb, 0xff, 0xbf]);

  it("replaces plus and slash and strips padding", () => {
    const standard = encodeBase64Bytes(bytes);
    const safe = encodeBase64Bytes(bytes, true);
    expect(standard.ok).toBe(true);
    expect(safe.ok).toBe(true);
    if (!standard.ok || !safe.ok) return;
    expect(standard.output).toBe("+/+/");
    expect(safe.output).toBe("-_-_");
    expect(safe.output).not.toContain("=");
  });

  it("decodes both variants to the same bytes", () => {
    const standard = decodeBase64Bytes("+/+/");
    const safe = decodeBase64Bytes("-_-_");
    expect(standard.ok).toBe(true);
    expect(safe.ok).toBe(true);
    if (!standard.ok || !safe.ok) return;
    expect(Array.from(standard.bytes)).toEqual([251, 255, 191]);
    expect(Array.from(safe.bytes)).toEqual([251, 255, 191]);
  });

  it("round-trips URL-safe text with padding removed", () => {
    const encoded = encodeBase64Text("hello?", true);
    expect(encoded.ok).toBe(true);
    if (!encoded.ok) return;
    expect(encoded.output).not.toContain("=");
    const decoded = decodeBase64Text(encoded.output);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.output).toBe("hello?");
  });
});
