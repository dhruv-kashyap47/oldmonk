/**
 * Search, filtering, and recents for the symbol catalog. Framework-free: no
 * Solid, no DOM, no storage. The page owns the localStorage write.
 */

import {
  ALL_SYMBOLS,
  SYMBOL_CATEGORIES,
  categoryName,
  type SymbolCategoryId,
  type SymbolEntry,
} from "./data";

export type CategoryFilter = SymbolCategoryId | "all";

export interface CategoryOption {
  readonly id: CategoryFilter;
  readonly name: string;
}

export const RECENT_LIMIT = 8;

export const CATEGORY_OPTIONS: readonly CategoryOption[] = [
  { id: "all", name: "All" },
  ...SYMBOL_CATEGORIES.map((entry) => ({ id: entry.id, name: entry.name })),
];

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function haystack(entry: SymbolEntry): string {
  return [
    entry.char,
    entry.name,
    entry.category,
    categoryName(entry.category),
    ...entry.keywords,
  ]
    .join(" ")
    .toLowerCase();
}

/** Symbols matching every word in the query and the active category. */
export function filterSymbols(
  query: string,
  category: CategoryFilter = "all",
): readonly SymbolEntry[] {
  const tokens = normalizeQuery(query).split(/\s+/).filter((token) => token.length > 0);
  return ALL_SYMBOLS.filter((entry) => {
    if (category !== "all" && entry.category !== category) return false;
    if (tokens.length === 0) return true;
    const text = haystack(entry);
    return tokens.every((token) => text.includes(token));
  });
}

export function findSymbol(char: string): SymbolEntry | undefined {
  return ALL_SYMBOLS.find((entry) => entry.char === char);
}

/** Most recent first, deduplicated, capped at eight. */
export function addRecent(recent: readonly string[], char: string): readonly string[] {
  if (char.length === 0) return recent;
  return [char, ...recent.filter((entry) => entry !== char)].slice(0, RECENT_LIMIT);
}

/** Maps stored characters back to catalog entries, dropping unknown entries. */
export function resolveRecent(recent: readonly string[]): readonly SymbolEntry[] {
  const output: SymbolEntry[] = [];
  for (const char of recent) {
    const entry = findSymbol(char);
    if (entry && !output.some((known) => known.char === char)) output.push(entry);
  }
  return output.slice(0, RECENT_LIMIT);
}

/** A single copyable line with the visible symbols separated by spaces. */
export function copyAllText(entries: readonly SymbolEntry[]): string {
  return entries.map((entry) => entry.char).join(" ");
}

export function visibleCount(entries: readonly SymbolEntry[]): number {
  return entries.length;
}
