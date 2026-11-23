import { describe, expect, it } from "vitest";
import { validateJson } from "./logic";

function failure(input: string) {
  const result = validateJson(input);
  if (result.ok) throw new Error("Expected the input to be invalid.");
  return result;
}

describe("validateJson", () => {
  it("rejects empty input", () => {
    const result = failure("");
    expect(result.error.message).toContain("empty");
    expect(result.error.line).toBe(1);
    expect(result.error.column).toBe(1);
  });

  it("accepts a nested document and reports its shape", () => {
    const text = '{"name":"oldmonk","tools":["json"],"meta":{"private":true}}';
    const result = validateJson(text);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.valueType).toBe("object with 3 keys");
    expect(result.lines).toBe(1);
    expect(result.bytes).toBe(new TextEncoder().encode(text).length);
    expect(result.duplicateKeys).toEqual([]);
  });

  it("accepts a top-level array and counts items", () => {
    const result = validateJson("[1, 2, 3]");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.valueType).toBe("array with 3 items");
    expect(result.lines).toBe(1);
  });

  it("rejects a trailing comma and points at the closing brace", () => {
    const result = failure('{"a":1,}');
    expect(result.error.message).toContain("Object keys must be strings");
    expect(result.error.line).toBe(1);
    expect(result.error.column).toBe(8);
    expect(result.lineText).toBe('{"a":1,}');
  });

  it("rejects a comment inside an object", () => {
    const text = '{\n  // note\n  "a": 1\n}';
    const result = failure(text);
    expect(result.error.line).toBe(2);
    expect(result.lineText).toBe("  // note");
  });

  it("rejects single-quoted keys", () => {
    const result = failure("{'a':1}");
    expect(result.error.line).toBe(1);
    expect(result.error.column).toBe(2);
    expect(result.lineText).toBe("{'a':1}");
  });

  it("reports duplicate keys without treating them as a syntax error", () => {
    const result = validateJson('{"a":1,"b":2,"a":3}');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.duplicateKeys).toEqual(["a"]);
    expect(result.valueType).toBe("object with 2 keys");
  });

  it("accepts a leading byte order mark", () => {
    const result = validateJson('\uFEFF{"a":1}');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bytes).toBe(new TextEncoder().encode('{"a":1}').length);
  });

  it("reports the exact line, column, and offending line", () => {
    const text = '{\n  "a": 1,\n  "b": ,\n  "c": 3\n}';
    const result = failure(text);
    expect(result.error.line).toBe(3);
    expect(result.error.column).toBe(8);
    expect(result.lineText).toBe('  "b": ,');
    expect(result.error.message).toContain("Unexpected character");
  });

  it("handles CRLF input without keeping the carriage return", () => {
    const result = failure('{\r\n  "a": ,\r\n}');
    expect(result.error.line).toBe(2);
    expect(result.lineText).toBe('  "a": ,');
  });

  it("honours a small byte limit", () => {
    const limited = validateJson("{}", 1);
    expect(limited.ok).toBe(false);
    if (limited.ok) return;
    expect(limited.error.message).toContain("limit");
  });

  it("counts UTF-8 bytes rather than characters", () => {
    const text = '{"café":"☕"}';
    const result = validateJson(text);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.bytes).toBe(new TextEncoder().encode(text).length);
    expect(result.bytes).toBeGreaterThan(text.length);
  });
});
