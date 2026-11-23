/**
 * Regular expression matching, replacement previews, and highlight segments.
 * Framework-free: no Solid import, no DOM, no network, no storage.
 *
 * Catastrophic backtracking can block for a long time, so the UI runs these
 * helpers in a worker with a timeout. The helpers themselves stay pure.
 */

export const REGEX_FLAGS = ["g", "i", "m", "s", "u", "y"] as const;

export type RegexFlag = (typeof REGEX_FLAGS)[number];

export const REGEX_MAX_MATCHES = 1000;

export interface RegexMatch {
  readonly index: number;
  readonly text: string;
  /** Capturing groups, in order. Unmatched groups are null. */
  readonly groups: readonly (string | null)[];
  readonly namedGroups: readonly { readonly name: string; readonly value: string | null }[];
}

export type RegexCompileResult =
  | { readonly ok: true; readonly regex: RegExp }
  | { readonly ok: false; readonly error: string };

export type RegexSearchResult =
  | { readonly ok: true; readonly matches: readonly RegexMatch[]; readonly truncated: boolean }
  | { readonly ok: false; readonly error: string };

export type RegexReplaceResult =
  | { readonly ok: true; readonly output: string }
  | { readonly ok: false; readonly error: string };

export interface HighlightSegment {
  readonly text: string;
  readonly matched: boolean;
}

/** Known flags in canonical order, then any unknown flags so RegExp can report them. */
export function canonicalFlags(flags: string): string {
  const unique = new Set(flags);
  const known = REGEX_FLAGS.filter((flag) => unique.has(flag));
  const unknown = [...unique].filter(
    (flag) => !(REGEX_FLAGS as readonly string[]).includes(flag),
  );
  return `${known.join("")}${unknown.join("")}`;
}

export function compileRegex(pattern: string, flags: string): RegexCompileResult {
  try {
    return { ok: true, regex: new RegExp(pattern, canonicalFlags(flags)) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "The pattern could not be compiled.",
    };
  }
}

/** Advances past one code point so zero-length matches in unicode mode terminate. */
function advanceIndex(regex: RegExp, input: string, index: number): number {
  if (index >= input.length) return index + 1;
  if (!regex.unicode) return index + 1;
  const first = input.charCodeAt(index);
  if (first >= 0xd800 && first <= 0xdbff && index + 1 < input.length) {
    const second = input.charCodeAt(index + 1);
    if (second >= 0xdc00 && second <= 0xdfff) return index + 2;
  }
  return index + 1;
}

function toMatch(match: RegExpExecArray): RegexMatch {
  const namedGroups = match.groups
    ? Object.entries(match.groups).map(([name, value]) => ({ name, value: value ?? null }))
    : [];
  return {
    index: match.index,
    text: match[0],
    groups: match.slice(1).map((group) => group ?? null),
    namedGroups,
  };
}

/**
 * Finds matches with their indices, capture groups, and named groups. A global
 * or sticky expression is walked to the end, with a limit so a pathological
 * pattern cannot build an enormous result.
 */
export function testRegex(
  pattern: string,
  flags: string,
  input: string,
  maxMatches: number = REGEX_MAX_MATCHES,
): RegexSearchResult {
  const compiled = compileRegex(pattern, flags);
  if (!compiled.ok) return compiled;
  const regex = compiled.regex;
  const matches: RegexMatch[] = [];
  const limit = Math.max(0, Math.floor(maxMatches));

  if (!regex.global && !regex.sticky) {
    const match = regex.exec(input);
    if (match) matches.push(toMatch(match));
    return { ok: true, matches, truncated: false };
  }

  regex.lastIndex = 0;
  let truncated = false;
  for (;;) {
    const match = regex.exec(input);
    if (!match) break;
    if (matches.length >= limit) {
      truncated = true;
      break;
    }
    matches.push(toMatch(match));
    if (match[0].length === 0) {
      regex.lastIndex = advanceIndex(regex, input, regex.lastIndex);
    }
    if (regex.lastIndex > input.length) break;
  }

  return { ok: true, matches, truncated };
}

/** Replace preview. Without the g flag only the first match is replaced. */
export function replaceRegex(
  pattern: string,
  flags: string,
  input: string,
  replacement: string,
): RegexReplaceResult {
  const compiled = compileRegex(pattern, flags);
  if (!compiled.ok) return compiled;
  try {
    return { ok: true, output: input.replace(compiled.regex, replacement) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "The replacement could not be built.",
    };
  }
}

/**
 * Splits the input into plain and matched runs for rendering with text nodes.
 * Zero-length matches carry no text, so they are skipped here and still counted
 * in the match list.
 */
export function highlightSegments(
  input: string,
  matches: readonly RegexMatch[],
): readonly HighlightSegment[] {
  const segments: HighlightSegment[] = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.text.length === 0) continue;
    if (match.index < cursor) continue;
    if (match.index > cursor) {
      segments.push({ text: input.slice(cursor, match.index), matched: false });
    }
    segments.push({ text: match.text, matched: true });
    cursor = match.index + match.text.length;
  }
  if (cursor < input.length) {
    segments.push({ text: input.slice(cursor), matched: false });
  }
  return segments;
}

export interface RegexPreset {
  readonly id: string;
  readonly name: string;
  readonly pattern: string;
  readonly flags: string;
  readonly sample: string;
  readonly replacement: string;
}

export const REGEX_PRESETS: readonly RegexPreset[] = [
  {
    id: "email",
    name: "Email address",
    pattern: String.raw`[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}`,
    flags: "g",
    sample: "Write to ana@example.com or sam@oldmonk.dev for a reply.",
    replacement: "[email]",
  },
  {
    id: "url",
    name: "URL",
    pattern: String.raw`https?:\/\/[^\s<>"']+`,
    flags: "g",
    sample: "Docs live at https://example.com/guide and the repo is at http://git.example.org/x.",
    replacement: "[link]",
  },
  {
    id: "date",
    name: "ISO date",
    pattern: String.raw`\b(\d{4})-(\d{2})-(\d{2})\b`,
    flags: "g",
    sample: "Released 2026-11-23 and reviewed 2026-12-01.",
    replacement: "$3/$2/$1",
  },
  {
    id: "whitespace",
    name: "Whitespace runs",
    pattern: String.raw`\s+`,
    flags: "g",
    sample: "one   two\nthree\t\tfour",
    replacement: " ",
  },
  {
    id: "digits",
    name: "Digits",
    pattern: String.raw`\d+`,
    flags: "g",
    sample: "Order 42 has 7 items and costs 1299 cents.",
    replacement: "#",
  },
];
