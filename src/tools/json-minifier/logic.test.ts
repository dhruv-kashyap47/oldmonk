import { describe, expect, it } from "vitest";
import { minifyText, percentSaved } from "./logic";

describe("percentSaved", () => {
  it("guards a zero or negative original size", () => {
    expect(percentSaved(0, 0)).toBe(0);
    expect(percentSaved(0, 10)).toBe(0);
  });

  it("returns the exact ratio rounded to one decimal", () => {
    expect(percentSaved(100, 50)).toBe(50);
    expect(percentSaved(3, 2)).toBe(33.3);
    expect(percentSaved(200, 199)).toBe(0.5);
  });

  it("reports a negative value when the output grows", () => {
    expect(percentSaved(100, 110)).toBe(-10);
  });
});

describe("minifyText", () => {
  it("removes indentation and keeps the same value", () => {
    const input = '{\n  "a": 1,\n  "b": [1, 2]\n}';
    const result = minifyText(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.output).toBe('{"a":1,"b":[1,2]}');
    expect(JSON.parse(result.output)).toEqual(JSON.parse(input));
    expect(result.bytesBefore).toBe(new TextEncoder().encode(input).length);
    expect(result.bytesAfter).toBe(new TextEncoder().encode(result.output).length);
    expect(result.removedBytes).toBe(result.bytesBefore - result.bytesAfter);
    expect(result.percentSaved).toBe(
      percentSaved(result.bytesBefore, result.bytesAfter),
    );
  });

  it("rejects invalid JSON and returns the parser error", () => {
    const result = minifyText('{"a":1,}');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.line).toBe(1);
    expect(result.error.column).toBe(8);
    expect(result.error.message).toContain("Object keys");
  });

  it("rejects empty input", () => {
    const result = minifyText("");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.message).toContain("empty");
  });

  it("minifies an empty object to two bytes", () => {
    const result = minifyText("{ }");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.output).toBe("{}");
    expect(result.bytesBefore).toBe(3);
    expect(result.bytesAfter).toBe(2);
    expect(result.removedBytes).toBe(1);
    expect(result.percentSaved).toBe(33.3);
  });

  it("counts UTF-8 bytes for non-ASCII strings", () => {
    const input = '{ "café": "☕" }';
    const result = minifyText(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.output).toBe('{"café":"☕"}');
    expect(result.bytesBefore).toBe(new TextEncoder().encode(input).length);
    expect(result.bytesAfter).toBe(new TextEncoder().encode(result.output).length);
    expect(result.bytesAfter).toBeLessThan(result.bytesBefore);
  });

  it("returns identical bytes for already compact input", () => {
    const result = minifyText('{"a":1}');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.output).toBe('{"a":1}');
    expect(result.bytesBefore).toBe(result.bytesAfter);
    expect(result.removedBytes).toBe(0);
    expect(result.percentSaved).toBe(0);
  });

  it("honours a small byte limit", () => {
    const result = minifyText('{"a":1}', 1);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.message).toContain("limit");
  });
});
