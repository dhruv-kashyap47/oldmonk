/**
 * Line diff with Myers, inline word diff, side-by-side rows, and unified hunks.
 * Framework-free: no Solid import, no DOM, no network, no storage.
 */

import { formatBytes } from "../../lib/format";

export const DIFF_MAX_LINES = 2000;
export const DIFF_MAX_BYTES = 200 * 1024;

const CONTEXT_LINES = 3;

export interface DiffOptions {
  readonly ignoreWhitespace: boolean;
  readonly ignoreCase: boolean;
  /** Test override for the line cap. */
  readonly maxLines?: number;
  /** Test override for the byte cap. */
  readonly maxBytes?: number;
}

export interface DiffError {
  readonly title: string;
  readonly message: string;
}

export interface DiffStats {
  readonly additions: number;
  readonly deletions: number;
  readonly unchanged: number;
}

export interface LineChange {
  readonly type: "equal" | "insert" | "delete";
  readonly text: string;
}

export interface DiffSideLine {
  readonly line: number;
  readonly text: string;
}

export interface DiffRow {
  readonly kind: "equal" | "replace" | "insert" | "delete";
  readonly left: DiffSideLine | null;
  readonly right: DiffSideLine | null;
}

export interface UnifiedLine {
  readonly kind: "equal" | "insert" | "delete" | "header";
  readonly text: string;
  readonly oldLine: number | null;
  readonly newLine: number | null;
}

export interface WordToken {
  readonly text: string;
  readonly changed: boolean;
}

export interface WordDiff {
  readonly left: readonly WordToken[];
  readonly right: readonly WordToken[];
}

export type DiffResult =
  | {
      readonly ok: true;
      readonly stats: DiffStats;
      readonly changes: readonly LineChange[];
      readonly rows: readonly DiffRow[];
      readonly unified: readonly UnifiedLine[];
    }
  | { readonly ok: false; readonly error: DiffError };

interface RawOp {
  readonly type: "equal" | "insert" | "delete";
  readonly oldIndex: number;
  readonly newIndex: number;
}

interface TraceSnapshot {
  readonly start: number;
  readonly values: Int32Array;
}

function lookup(snapshot: TraceSnapshot, index: number): number {
  return snapshot.values[index - snapshot.start] ?? 0;
}

function backtrack(
  trace: readonly TraceSnapshot[],
  a: readonly string[],
  b: readonly string[],
  found: number,
  offset: number,
): RawOp[] {
  const ops: RawOp[] = [];
  let x = a.length;
  let y = b.length;

  for (let distance = found; distance > 0; distance -= 1) {
    const snapshot = trace[distance];
    if (!snapshot) break;
    const k = x - y;
    const prevK =
      k === -distance ||
      (k !== distance &&
        lookup(snapshot, offset + k - 1) < lookup(snapshot, offset + k + 1))
        ? k + 1
        : k - 1;
    const prevX = lookup(snapshot, offset + prevK);
    const prevY = prevX - prevK;

    while (x > prevX && y > prevY) {
      ops.push({ type: "equal", oldIndex: x - 1, newIndex: y - 1 });
      x -= 1;
      y -= 1;
    }

    if (x === prevX) {
      ops.push({ type: "insert", oldIndex: -1, newIndex: y - 1 });
      y -= 1;
    } else {
      ops.push({ type: "delete", oldIndex: x - 1, newIndex: -1 });
      x -= 1;
    }
  }

  while (x > 0 && y > 0) {
    ops.push({ type: "equal", oldIndex: x - 1, newIndex: y - 1 });
    x -= 1;
    y -= 1;
  }
  while (x > 0) {
    ops.push({ type: "delete", oldIndex: x - 1, newIndex: -1 });
    x -= 1;
  }
  while (y > 0) {
    ops.push({ type: "insert", oldIndex: -1, newIndex: y - 1 });
    y -= 1;
  }

  ops.reverse();
  return ops;
}

function middleDiff(a: readonly string[], b: readonly string[]): RawOp[] {
  const n = a.length;
  const m = b.length;
  if (n === 0) {
    return b.map((_, index) => ({ type: "insert" as const, oldIndex: -1, newIndex: index }));
  }
  if (m === 0) {
    return a.map((_, index) => ({ type: "delete" as const, oldIndex: index, newIndex: -1 }));
  }

  const max = n + m;
  const offset = max;
  const v = new Int32Array(2 * max + 1);
  const trace: TraceSnapshot[] = [];

  for (let distance = 0; distance <= max; distance += 1) {
    const start = Math.max(0, offset - distance - 1);
    const end = Math.min(v.length, offset + distance + 2);
    trace.push({ start, values: v.slice(start, end) });

    for (let k = -distance; k <= distance; k += 2) {
      let x: number;
      if (
        k === -distance ||
        (k !== distance && (v[offset + k - 1] as number) < (v[offset + k + 1] as number))
      ) {
        x = v[offset + k + 1] as number;
      } else {
        x = (v[offset + k - 1] as number) + 1;
      }
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x += 1;
        y += 1;
      }
      v[offset + k] = x;
      if (x >= n && y >= m) return backtrack(trace, a, b, distance, offset);
    }
  }

  return [];
}

/** Myers diff of two string arrays, with common prefix and suffix trimmed. */
export function diffLines(a: readonly string[], b: readonly string[]): readonly RawOp[] {
  let prefix = 0;
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix += 1;

  let suffix = 0;
  while (
    suffix < a.length - prefix &&
    suffix < b.length - prefix &&
    a[a.length - 1 - suffix] === b[b.length - 1 - suffix]
  ) {
    suffix += 1;
  }

  const ops: RawOp[] = [];
  for (let index = 0; index < prefix; index += 1) {
    ops.push({ type: "equal", oldIndex: index, newIndex: index });
  }

  const middleA = a.slice(prefix, a.length - suffix);
  const middleB = b.slice(prefix, b.length - suffix);
  for (const op of middleDiff(middleA, middleB)) {
    ops.push({
      type: op.type,
      oldIndex: op.oldIndex >= 0 ? op.oldIndex + prefix : -1,
      newIndex: op.newIndex >= 0 ? op.newIndex + prefix : -1,
    });
  }

  for (let index = 0; index < suffix; index += 1) {
    ops.push({
      type: "equal",
      oldIndex: a.length - suffix + index,
      newIndex: b.length - suffix + index,
    });
  }

  return ops;
}

export function splitLines(text: string): readonly string[] {
  if (text.length === 0) return [];
  return text.replace(/\r\n?/g, "\n").split("\n");
}

function normalizedLine(line: string, options: DiffOptions): string {
  let value = line;
  if (options.ignoreWhitespace) value = value.trim().replace(/\s+/g, " ");
  if (options.ignoreCase) value = value.toLowerCase();
  return value;
}

export function checkDiffInput(
  text: string,
  side: "left" | "right",
  options: Pick<DiffOptions, "maxLines" | "maxBytes"> = {},
): DiffError | null {
  const maxBytes = options.maxBytes ?? DIFF_MAX_BYTES;
  const maxLines = options.maxLines ?? DIFF_MAX_LINES;
  const bytes = new TextEncoder().encode(text).length;
  if (bytes > maxBytes) {
    return {
      title: "Input too large",
      message: `The ${side} text is ${formatBytes(bytes)}. Each side is limited to ${formatBytes(maxBytes)} and ${maxLines.toLocaleString("en")} lines.`,
    };
  }
  const lines = splitLines(text).length;
  if (lines > maxLines) {
    return {
      title: "Too many lines",
      message: `The ${side} text has ${lines.toLocaleString("en")} lines. Each side is limited to ${maxLines.toLocaleString("en")} lines and ${formatBytes(maxBytes)}.`,
    };
  }
  return null;
}

function rowsFromOps(
  ops: readonly RawOp[],
  a: readonly string[],
  b: readonly string[],
): DiffRow[] {
  const rows: DiffRow[] = [];
  let index = 0;
  while (index < ops.length) {
    const op = ops[index];
    if (!op) break;
    if (op.type === "equal") {
      rows.push({
        kind: "equal",
        left: { line: op.oldIndex + 1, text: a[op.oldIndex] ?? "" },
        right: { line: op.newIndex + 1, text: b[op.newIndex] ?? "" },
      });
      index += 1;
      continue;
    }

    const deletes: number[] = [];
    const inserts: number[] = [];
    while (index < ops.length) {
      const change = ops[index];
      if (!change || change.type === "equal") break;
      if (change.type === "delete") deletes.push(change.oldIndex);
      else inserts.push(change.newIndex);
      index += 1;
    }

    const pairs = Math.max(deletes.length, inserts.length);
    for (let pair = 0; pair < pairs; pair += 1) {
      const oldIndex = deletes[pair];
      const newIndex = inserts[pair];
      const left = oldIndex === undefined ? null : { line: oldIndex + 1, text: a[oldIndex] ?? "" };
      const right = newIndex === undefined ? null : { line: newIndex + 1, text: b[newIndex] ?? "" };
      rows.push({
        kind: left && right ? "replace" : left ? "delete" : "insert",
        left,
        right,
      });
    }
  }
  return rows;
}

interface NumberedUnified {
  readonly kind: "equal" | "insert" | "delete";
  readonly text: string;
  readonly oldLine: number | null;
  readonly newLine: number | null;
}

function buildUnified(
  ops: readonly RawOp[],
  a: readonly string[],
  b: readonly string[],
): UnifiedLine[] {
  const lines: NumberedUnified[] = ops.map((op) => ({
    kind: op.type,
    text: op.type === "insert" ? (b[op.newIndex] ?? "") : (a[op.oldIndex] ?? ""),
    oldLine: op.type === "insert" ? null : op.oldIndex + 1,
    newLine: op.type === "delete" ? null : op.newIndex + 1,
  }));

  const changed: number[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index]?.kind !== "equal") changed.push(index);
  }
  if (changed.length === 0) return [];

  const ranges: { start: number; end: number }[] = [];
  for (const index of changed) {
    const start = Math.max(0, index - CONTEXT_LINES);
    const end = Math.min(lines.length, index + CONTEXT_LINES + 1);
    const last = ranges[ranges.length - 1];
    if (last && start <= last.end) {
      last.end = Math.max(last.end, end);
    } else {
      ranges.push({ start, end });
    }
  }

  const output: UnifiedLine[] = [];
  for (const range of ranges) {
    const slice = lines.slice(range.start, range.end);
    let oldBefore = 0;
    let newBefore = 0;
    for (let index = 0; index < range.start; index += 1) {
      const line = lines[index];
      if (!line) continue;
      if (line.kind !== "insert") oldBefore += 1;
      if (line.kind !== "delete") newBefore += 1;
    }
    const oldCount = slice.filter((line) => line.kind !== "insert").length;
    const newCount = slice.filter((line) => line.kind !== "delete").length;
    const oldStart = slice.find((line) => line.oldLine !== null)?.oldLine ?? oldBefore + 1;
    const newStart = slice.find((line) => line.newLine !== null)?.newLine ?? newBefore + 1;
    output.push({
      kind: "header",
      text: `@@ -${oldStart},${oldCount} +${newStart},${newCount} @@`,
      oldLine: null,
      newLine: null,
    });
    output.push(...slice);
  }
  return output;
}

/** Plain text for a unified view, with headers, prefixes, and no line numbers. */
export function unifiedToText(lines: readonly UnifiedLine[]): string {
  return lines
    .map((line) => {
      if (line.kind === "header") return line.text;
      const prefix = line.kind === "insert" ? "+" : line.kind === "delete" ? "-" : " ";
      return `${prefix}${line.text}`;
    })
    .join("\n");
}

function tokenizeLine(text: string): readonly string[] {
  return text.match(/\s+|[^\s]+/g) ?? [];
}

/** Word-level diff for a replaced row. Whitespace runs are tokens too. */
export function wordDiff(left: string, right: string): WordDiff {
  const a = tokenizeLine(left);
  const b = tokenizeLine(right);
  const leftTokens: WordToken[] = [];
  const rightTokens: WordToken[] = [];

  for (const op of diffLines(a, b)) {
    if (op.type === "equal") {
      leftTokens.push({ text: a[op.oldIndex] ?? "", changed: false });
      rightTokens.push({ text: b[op.newIndex] ?? "", changed: false });
    } else if (op.type === "delete") {
      leftTokens.push({ text: a[op.oldIndex] ?? "", changed: true });
    } else {
      rightTokens.push({ text: b[op.newIndex] ?? "", changed: true });
    }
  }

  return { left: leftTokens, right: rightTokens };
}

/** Full comparison with stats and both views. */
export function diffText(left: string, right: string, options: DiffOptions): DiffResult {
  const leftError = checkDiffInput(left, "left", options);
  if (leftError) return { ok: false, error: leftError };
  const rightError = checkDiffInput(right, "right", options);
  if (rightError) return { ok: false, error: rightError };

  const a = splitLines(left);
  const b = splitLines(right);
  const comparedA = a.map((line) => normalizedLine(line, options));
  const comparedB = b.map((line) => normalizedLine(line, options));
  const ops = diffLines(comparedA, comparedB);

  let additions = 0;
  let deletions = 0;
  let unchanged = 0;
  const changes: LineChange[] = [];

  for (const op of ops) {
    if (op.type === "insert") additions += 1;
    else if (op.type === "delete") deletions += 1;
    else unchanged += 1;
    changes.push({
      type: op.type,
      text:
        op.type === "insert"
          ? (b[op.newIndex] ?? "")
          : op.type === "delete"
            ? (a[op.oldIndex] ?? "")
            : (a[op.oldIndex] ?? ""),
    });
  }

  return {
    ok: true,
    stats: { additions, deletions, unchanged },
    changes,
    rows: rowsFromOps(ops, a, b),
    unified: buildUnified(ops, a, b),
  };
}
