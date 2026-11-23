/**
 * Percent encoding and query string parsing. Framework-free: no Solid import,
 * no DOM, no network, no storage. Uses the platform's encodeURIComponent,
 * encodeURI, and their decode counterparts.
 */

export type UrlScope = "component" | "full";

export interface UrlTextSuccess {
  readonly ok: true;
  readonly output: string;
}

export interface UrlTextFailure {
  readonly ok: false;
  readonly message: string;
}

export type UrlTextResult = UrlTextSuccess | UrlTextFailure;

const MALFORMED_ESCAPE =
  "The input contains a malformed percent escape. A percent sign must be followed by two hexadecimal digits.";

function malformed(): UrlTextFailure {
  return { ok: false, message: MALFORMED_ESCAPE };
}

/** Encodes a component, or a whole URL when scope is "full". */
export function encodeUrlText(text: string, scope: UrlScope): UrlTextResult {
  try {
    const output = scope === "component" ? encodeURIComponent(text) : encodeURI(text);
    return { ok: true, output };
  } catch {
    return {
      ok: false,
      message:
        "The input contains an unpaired surrogate, which cannot be percent-encoded. Check for a broken emoji or paste the text again.",
    };
  }
}

/** Decodes percent escapes, or a whole URL when scope is "full". */
export function decodeUrlText(text: string, scope: UrlScope): UrlTextResult {
  try {
    const output = scope === "component" ? decodeURIComponent(text) : decodeURI(text);
    return { ok: true, output };
  } catch {
    return malformed();
  }
}

export interface QueryPair {
  readonly key: string;
  readonly value: string;
}

export interface ParsedUrl {
  /** Everything before the query string and fragment. */
  readonly base: string;
  /** Fragment including the leading #, or an empty string. */
  readonly hash: string;
  /** Decoded key and value pairs, in source order. */
  readonly pairs: readonly QueryPair[];
}

export type ParseUrlResult =
  | { readonly ok: true; readonly parsed: ParsedUrl }
  | { readonly ok: false; readonly message: string };

function decodeFormPart(raw: string): string {
  return decodeURIComponent(raw.replace(/\+/gu, " "));
}

/**
 * Splits a URL into a base, a fragment, and decoded query pairs. A plus sign in
 * a query value is treated as a space, following form encoding. Rebuilding
 * encodes spaces as %20, so the output can differ from the input encoding
 * while carrying the same values.
 */
export function parseUrl(raw: string): ParseUrlResult {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { ok: false, message: "Paste a URL to parse." };
  }

  const hashIndex = trimmed.indexOf("#");
  const hash = hashIndex === -1 ? "" : trimmed.slice(hashIndex);
  const withoutHash = hashIndex === -1 ? trimmed : trimmed.slice(0, hashIndex);

  const queryIndex = withoutHash.indexOf("?");
  const base = queryIndex === -1 ? withoutHash : withoutHash.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : withoutHash.slice(queryIndex + 1);

  const pairs: QueryPair[] = [];
  if (query.length > 0) {
    for (const part of query.split("&")) {
      if (part.length === 0) continue;
      const equalsIndex = part.indexOf("=");
      const rawKey = equalsIndex === -1 ? part : part.slice(0, equalsIndex);
      const rawValue = equalsIndex === -1 ? "" : part.slice(equalsIndex + 1);
      try {
        pairs.push({ key: decodeFormPart(rawKey), value: decodeFormPart(rawValue) });
      } catch {
        return { ok: false, message: MALFORMED_ESCAPE };
      }
    }
  }

  return { ok: true, parsed: { base, hash, pairs } };
}

/**
 * Rebuilds a URL from a parsed base and an edited pair list. Pairs with an
 * empty key and an empty value are dropped. Removing every pair removes the
 * query string, including its question mark.
 */
export function buildUrl(parsed: ParsedUrl, pairs: readonly QueryPair[]): UrlTextResult {
  try {
    const query = pairs
      .filter((pair) => pair.key.length > 0 || pair.value.length > 0)
      .map((pair) => `${encodeURIComponent(pair.key)}=${encodeURIComponent(pair.value)}`)
      .join("&");
    const output = `${parsed.base}${query.length > 0 ? `?${query}` : ""}${parsed.hash}`;
    return { ok: true, output };
  } catch {
    return {
      ok: false,
      message:
        "A parameter contains an unpaired surrogate, which cannot be percent-encoded.",
    };
  }
}
