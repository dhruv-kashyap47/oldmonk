import { categories } from "../content/categories";
import type { ToolCategory, ToolMeta } from "../tools/types";

const categoryLabels = new Map<ToolCategory, string>(
  categories.map((category) => [category.slug, category.name]),
);

/** Lowercase, strip accents, and collapse whitespace so "JSON" and "json" match. */
export function normalize(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(input: string): string[] {
  const normalized = normalize(input);
  return normalized.length === 0 ? [] : normalized.split(" ");
}

function haystack(tool: ToolMeta): string {
  return normalize(
    [
      tool.name,
      tool.summary,
      tool.description,
      tool.slug.replaceAll("-", " "),
      categoryLabels.get(tool.category) ?? tool.category,
      ...tool.keywords,
      ...tool.topics,
    ].join(" "),
  );
}

/** Every whitespace token must appear somewhere in the tool's indexed text. */
export function matchesTool(tool: ToolMeta, query: string): boolean {
  const tokens = tokenize(query);
  if (tokens.length === 0) return true;
  const text = haystack(tool);
  return tokens.every((token) => text.includes(token));
}

export function scoreTool(tool: ToolMeta, query: string): number {
  const tokens = tokenize(query);
  if (tokens.length === 0) return 0;

  const name = normalize(tool.name);
  const keywords = tool.keywords.map(normalize);
  let score = 0;

  for (const token of tokens) {
    if (name === token) score += 100;
    else if (name.startsWith(token)) score += 60;
    else if (name.includes(token)) score += 40;
    else if (keywords.some((keyword) => keyword === token)) score += 25;
    else if (keywords.some((keyword) => keyword.includes(token))) score += 15;
    else if (normalize(tool.summary).includes(token)) score += 10;
    else score += 2;
  }

  return score;
}

/** Matching tools, best match first. Ties keep the curated registry order. */
export function searchTools(entries: readonly ToolMeta[], query: string): readonly ToolMeta[] {
  if (tokenize(query).length === 0) return entries;
  return entries
    .filter((tool) => matchesTool(tool, query))
    .map((tool, index) => ({ tool, index, score: scoreTool(tool, query) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.tool);
}
