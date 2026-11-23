import { describe, expect, it } from "vitest";
import {
  DIFF_MAX_BYTES,
  DIFF_MAX_LINES,
  diffLines,
  diffText,
  splitLines,
  unifiedToText,
  wordDiff,
  type DiffOptions,
  type DiffResult,
} from "./logic";

const BASE: DiffOptions = { ignoreWhitespace: false, ignoreCase: false };

function run(left: string, right: string, options: Partial<DiffOptions> = {}) {
  const result = diffText(left, right, { ...BASE, ...options });
  if (!result.ok) throw new Error(`Expected a diff, got ${result.error.title}`);
  return result;
}

function runError(left: string, right: string, options: Partial<DiffOptions> = {}) {
  const result: DiffResult = diffText(left, right, { ...BASE, ...options });
  if (result.ok) throw new Error("Expected a diff error");
  return result.error;
}

describe("diffLines", () => {
  it.each([
    [["a", "b", "c"], ["a", "x", "b", "c"]],
    [["a", "b", "c"], ["b", "c"]],
    [["a", "b", "a", "b"], ["a", "b"]],
    [["x", "a", "b", "x"], ["y", "a", "b", "y"]],
    [["a", "a", "a"], ["a", "a"]],
    [[], ["a"]],
    [["a"], []],
    [[], []],
  ])("rebuilds the right side from %j to %j", (left, right) => {
    const rebuilt: string[] = [];
    for (const op of diffLines(left, right)) {
      if (op.type === "equal") {
        expect(left[op.oldIndex]).toBe(right[op.newIndex]);
        rebuilt.push(left[op.oldIndex] ?? "");
      } else if (op.type === "insert") {
        rebuilt.push(right[op.newIndex] ?? "");
      }
    }
    expect(rebuilt).toEqual(right);
  });
});

describe("diffText", () => {
  it("reports identical text with no changes", () => {
    const result = run("alpha\nbeta\ngamma", "alpha\nbeta\ngamma");
    expect(result.stats).toEqual({ additions: 0, deletions: 0, unchanged: 3 });
    expect(result.rows.map((row) => row.kind)).toEqual(["equal", "equal", "equal"]);
    expect(result.unified).toHaveLength(0);
  });

  it("detects an inserted line", () => {
    const result = run("a\nb", "a\nx\nb");
    expect(result.stats).toEqual({ additions: 1, deletions: 0, unchanged: 2 });
    expect(result.rows.map((row) => row.kind)).toEqual(["equal", "insert", "equal"]);
    expect(result.rows[1]?.left).toBeNull();
    expect(result.rows[1]?.right).toEqual({ line: 2, text: "x" });
  });

  it("detects a deleted line", () => {
    const result = run("a\nx\nb", "a\nb");
    expect(result.stats).toEqual({ additions: 0, deletions: 1, unchanged: 2 });
    expect(result.rows.map((row) => row.kind)).toEqual(["equal", "delete", "equal"]);
    expect(result.rows[1]?.right).toBeNull();
    expect(result.rows[1]?.left).toEqual({ line: 2, text: "x" });
  });

  it("pairs a changed line as a replace row", () => {
    const result = run("a\nb\nc", "a\nB\nc");
    expect(result.stats).toEqual({ additions: 1, deletions: 1, unchanged: 2 });
    expect(result.rows.map((row) => row.kind)).toEqual(["equal", "replace", "equal"]);
    expect(result.rows[1]?.left).toEqual({ line: 2, text: "b" });
    expect(result.rows[1]?.right).toEqual({ line: 2, text: "B" });
  });

  it("handles a replacement that changes the line count", () => {
    const result = run("a\nb\nc\nd", "a\nc\nx\nyd");
    expect(result.stats.additions).toBeGreaterThan(0);
    expect(result.stats.deletions).toBeGreaterThan(0);
    expect(result.rows.length).toBeGreaterThan(0);
  });

  it("ignores whitespace when asked", () => {
    const left = "one  two\nthree";
    const right = "one two\nthree";
    expect(run(left, right, { ignoreWhitespace: true }).stats.additions).toBe(0);
    expect(run(left, right, { ignoreWhitespace: true }).stats.deletions).toBe(0);
    expect(run(left, right).stats.deletions).toBe(1);
  });

  it("ignores case when asked", () => {
    const left = "Hello\nWorld";
    const right = "hello\nworld";
    expect(run(left, right, { ignoreCase: true }).stats.deletions).toBe(0);
    expect(run(left, right).stats.deletions).toBe(2);
  });

  it("keeps unicode text intact", () => {
    const result = run("héllo 😀", "héllo 😃");
    expect(result.stats).toEqual({ additions: 1, deletions: 1, unchanged: 0 });
    expect(result.rows[0]?.left?.text).toBe("héllo 😀");
    expect(result.rows[0]?.right?.text).toBe("héllo 😃");
  });

  it("normalises CRLF input", () => {
    const result = run("a\r\nb\r\nc", "a\nb\nc");
    expect(result.stats).toEqual({ additions: 0, deletions: 0, unchanged: 3 });
  });

  it("handles empty inputs", () => {
    const both = run("", "");
    expect(both.stats).toEqual({ additions: 0, deletions: 0, unchanged: 0 });
    expect(both.rows).toHaveLength(0);

    const added = run("", "a");
    expect(added.stats).toEqual({ additions: 1, deletions: 0, unchanged: 0 });
    expect(added.rows[0]?.kind).toBe("insert");
    expect(added.rows[0]?.left).toBeNull();
  });

  it("keeps a trailing newline visible as an empty last line", () => {
    const result = run("a\n", "a");
    expect(result.stats.deletions).toBe(1);
    expect(result.rows.at(-1)?.left?.text).toBe("");
  });
});

describe("unified view", () => {
  it("builds a hunk with context lines", () => {
    const result = run("a\nb", "a\nx\nb");
    expect(result.unified[0]).toEqual({
      kind: "header",
      text: "@@ -1,2 +1,3 @@",
      oldLine: null,
      newLine: null,
    });
    expect(result.unified.slice(1).map((line) => line.kind)).toEqual([
      "equal",
      "insert",
      "equal",
    ]);
  });

  it("limits context on a longer file", () => {
    const left = Array.from({ length: 10 }, (_, index) => `line ${index + 1}`).join("\n");
    const right = left.replace("line 6", "line six");
    const result = run(left, right);
    expect(result.unified[0]?.text).toBe("@@ -3,7 +3,7 @@");
  });

  it("produces plain unified text", () => {
    const result = run("a\nb", "a\nx\nb");
    expect(unifiedToText(result.unified)).toBe("@@ -1,2 +1,3 @@\n a\n+x\n b");
  });
});

describe("wordDiff", () => {
  it("marks only the changed words", () => {
    const result = wordDiff("the quick fox", "the slow fox");
    expect(result.left.map((token) => token.text).join("")).toBe("the quick fox");
    expect(result.right.map((token) => token.text).join("")).toBe("the slow fox");
    expect(result.left.filter((token) => token.changed).map((token) => token.text)).toEqual([
      "quick",
    ]);
    expect(result.right.filter((token) => token.changed).map((token) => token.text)).toEqual([
      "slow",
    ]);
  });

  it("returns no changed tokens for equal text", () => {
    const result = wordDiff("same words", "same words");
    expect(result.left.every((token) => !token.changed)).toBe(true);
    expect(result.right.every((token) => !token.changed)).toBe(true);
  });

  it("keeps spaces attached to the tokens around them", () => {
    const result = wordDiff("a b", "a  b");
    expect(result.left.map((token) => token.text).join("")).toBe("a b");
    expect(result.right.map((token) => token.text).join("")).toBe("a  b");
  });
});

describe("splitLines", () => {
  it("splits on LF and CRLF", () => {
    expect(splitLines("a\nb")).toEqual(["a", "b"]);
    expect(splitLines("a\r\nb\rc")).toEqual(["a", "b", "c"]);
  });

  it("returns no lines for empty text", () => {
    expect(splitLines("")).toEqual([]);
  });
});

describe("limits", () => {
  it("ships the documented caps", () => {
    expect(DIFF_MAX_LINES).toBe(2000);
    expect(DIFF_MAX_BYTES).toBe(204_800);
  });

  it("rejects more than 2,000 lines per side", () => {
    const large = Array.from({ length: 2001 }, (_, index) => `line ${index}`).join("\n");
    expect(runError(large, "small").title).toBe("Too many lines");
  });

  it("rejects a side over the byte cap", () => {
    expect(runError("x".repeat(20), "y", { maxBytes: 10 }).title).toBe("Input too large");
  });

  it("names the side that is too large", () => {
    expect(runError("ok", "x".repeat(20), { maxBytes: 10 }).message).toContain("right text");
  });
});
