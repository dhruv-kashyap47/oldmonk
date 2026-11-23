import { describe, expect, it } from "vitest";
import {
  JSON_SIZE_LIMIT,
  formatJson,
  minifyJson,
  parseJson,
  type JsonValue,
} from "./logic";

const NESTED = '{"name":"oldmonk","tools":["json","jwt"],"meta":{"version":1,"ok":true,"none":null}}';

function parseOk(text: string): { value: JsonValue; duplicateKeys: readonly string[] } {
  const result = parseJson(text);
  if (!result.ok) throw new Error(`Expected success, got ${result.error.message}`);
  return result;
}

function parseError(text: string) {
  const result = parseJson(text);
  if (result.ok) throw new Error("Expected a parse error");
  return result.error;
}

function formatted(text: string, indent: 2 | 4 | "tab" = 2, sortKeys = false): string {
  const result = formatJson(text, { indent, sortKeys });
  if (!result.ok) throw new Error(`Expected success, got ${result.error.message}`);
  return result.output;
}

describe("parseJson", () => {
  it.each([
    ["null", "null"],
    ["true", "true"],
    ["false", "false"],
    ["42", "42"],
    ["-1.5e3", "-1500"],
    ['"hello"', '"hello"'],
    ["[]", "[]"],
    ["{}", "{}"],
  ])("parses the top-level value %s", (input, expected) => {
    expect(JSON.stringify(parseOk(input).value)).toBe(expected);
  });

  it("parses a nested document", () => {
    expect(JSON.stringify(parseOk(NESTED).value)).toBe(JSON.stringify(JSON.parse(NESTED)));
  });

  it("keeps unicode and escaped characters", () => {
    const value = parseOk('{"emoji":"😀","accent":"\\u00e9","tab":"\\t"}').value as {
      emoji: string;
      accent: string;
      tab: string;
    };
    expect(value.emoji).toBe("😀");
    expect(value.accent).toBe("é");
    expect(value.tab).toBe("\t");
  });

  it("keeps the last value for a duplicate key and reports the key", () => {
    const result = parseOk('{"a":1,"b":2,"a":3}');
    expect((result.value as { a: number }).a).toBe(3);
    expect(result.duplicateKeys).toEqual(["a"]);
  });

  it("strips a leading byte order mark", () => {
    expect(parseOk("\uFEFF{}").value).toEqual({});
  });

  it("rejects input over the byte cap", () => {
    const capped = parseJson('{"a":1}', 4);
    expect(capped.ok).toBe(false);
    if (!capped.ok) expect(capped.error.message).toContain("limit");
  });

  it("uses a 5 MB default cap", () => {
    expect(JSON_SIZE_LIMIT).toBe(5 * 1024 * 1024);
  });

  it.each([
    ["", "empty", 1, 1],
    ["{", "keys must be strings", 1, 2],
    ["{a:1}", "keys must be strings", 1, 2],
    ["{'a':1}", "keys must be strings", 1, 2],
    ['{"a" 1}', "colon", 1, 6],
    ["[1,]", "unexpected character", 1, 4],
    ['{"a":1,}', "keys must be strings", 1, 8],
    ["01", "not valid json", 1, 1],
    ['{"a":1} extra', "unexpected text", 1, 9],
    ['{"a":"x}', "not closed", 1, 9],
    ["[1 2]", "comma or a closing bracket", 1, 4],
  ])("reports a position for %j", (input, message, line, column) => {
    const error = parseError(input);
    expect(error.message.toLowerCase()).toContain(message);
    expect(error.line).toBe(line);
    expect(error.column).toBe(column);
    expect(error.message).not.toContain("undefined");
  });

  it("reports the right line for an error on a later line", () => {
    const error = parseError('{\n  "a": 1,\n  "b": ,\n}');
    expect(error.line).toBe(3);
    expect(error.column).toBe(8);
  });

  it("rejects comments", () => {
    expect(parseError('{"a":1} // note').message).toContain("Unexpected text");
  });

  it("rejects a single-quoted string", () => {
    expect(parseError("'hello'").message).toContain("Unexpected character");
  });
});

describe("formatJson", () => {
  it("pretty-prints with two spaces", () => {
    expect(formatted('{"a":1,"b":[2]}')).toBe(
      ['{', '  "a": 1,', '  "b": [', "    2", "  ]", "}"].join("\n"),
    );
  });

  it("supports four spaces and a tab", () => {
    expect(formatted('{"a":1}', 4)).toContain('    "a": 1');
    expect(formatted('{"a":1}', "tab")).toContain('\t"a": 1');
  });

  it("sorts keys at every depth without reordering arrays", () => {
    const output = formatted('{"b":1,"a":{"d":2,"c":[{"z":1,"y":2}]}}', 2, true);
    expect(output).toBe(
      [
        "{",
        '  "a": {',
        '    "c": [',
        "      {",
        '        "y": 2,',
        '        "z": 1',
        "      }",
        "    ],",
        '    "d": 2',
        "  },",
        '  "b": 1',
        "}",
      ].join("\n"),
    );
  });

  it("reports input and output byte sizes", () => {
    const result = formatJson('{"a":1}', { indent: 2, sortKeys: false });
    if (!result.ok) throw new Error(result.error.message);
    expect(result.bytesBefore).toBe(7);
    expect(result.bytesAfter).toBeGreaterThan(result.bytesBefore);
    expect(result.output).toContain('"a": 1');
  });

  it("round-trips through JSON.parse", () => {
    const output = formatted(NESTED, 4, true);
    expect(JSON.parse(output)).toEqual(JSON.parse(NESTED));
  });

  it("returns the parse error unchanged", () => {
    const result = formatJson("{", { indent: 2, sortKeys: false });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.line).toBe(1);
  });
});

describe("minifyJson", () => {
  it("removes whitespace and reports the new size", () => {
    const result = minifyJson('{\n  "a": 1\n}');
    if (!result.ok) throw new Error(result.error.message);
    expect(result.output).toBe('{"a":1}');
    expect(result.bytesAfter).toBeLessThan(result.bytesBefore);
  });

  it("returns the parse error for invalid input", () => {
    const result = minifyJson("{");
    expect(result.ok).toBe(false);
  });
});
