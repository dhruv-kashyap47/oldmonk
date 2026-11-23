import type { Component } from "solid-js";

/**
 * Tool categories, in catalog order. The strings are the category ids used by
 * `ToolMeta.category`, `src/content/categories.ts`, and the `--cat-*` tokens.
 */
export const TOOL_CATEGORIES = ["developer", "text", "random", "timer", "test"] as const;

export type ToolCategory = (typeof TOOL_CATEGORIES)[number];

export interface FAQItem {
  readonly question: string;
  readonly answer: string;
}

/** One fact in the tool spec grid: input, output, limit, storage, keyboard. */
export interface SpecItem {
  readonly label: string;
  readonly value: string;
}

/** Shape of a tool's `Tool.tsx` module, loaded lazily by the tool route. */
export interface ToolComponentModule {
  readonly default: Component;
}

/** Shape of a tool's `Content.tsx` module, loaded lazily and prerendered. */
export interface ToolContentModule {
  readonly default: Component;
  readonly faq: readonly FAQItem[];
}

/**
 * Registry metadata for one tool. Kept free of JSX and long prose so the home
 * catalog, search, sitemap, and prerender can read it without pulling in a
 * tool chunk.
 *
 * `title` is the SEO title without the brand suffix. `description` is the meta
 * description, checked at registry load for the 120 to 165 character bound in
 * Plan.md §5.7. `related` may be empty while the catalog is small; the build
 * link check enforces 3 to 6 once the graph is complete.
 */
export interface ToolMeta {
  readonly slug: string;
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly summary: string;
  readonly category: ToolCategory;
  readonly topics: readonly string[];
  readonly keywords: readonly string[];
  readonly related: readonly string[];
  /** Facts shown in the two-column spec grid. Four to six entries. */
  readonly specs?: readonly SpecItem[];
  /** ISO date, `YYYY-MM-DD`. */
  readonly added: string;
  /** ISO date, `YYYY-MM-DD`, never earlier than `added`. */
  readonly updated: string;
  /** Wide workbench for side-by-side panes. Standard is 880px, wide is 1200px. */
  readonly layout?: "standard" | "wide";
  readonly loadTool: () => Promise<ToolComponentModule>;
  readonly loadContent: () => Promise<ToolContentModule>;
}
