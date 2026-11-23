import type { ToolCategory } from "../tools/types";

/**
 * One catalog category. Categories carry their own intro and SEO copy so the
 * home page, category page, and sitemap read from a single source.
 *
 * There is no `icon` field: the category marker is a 6px dot plus an 8 percent
 * tint chip drawn from `--cat-*`, per design/REFERENCES.md §6. No icon
 * library is installed.
 */
export interface ToolCategoryInfo {
  /** Category id, shared with `ToolMeta.category` and the `--cat-*` tokens. */
  readonly slug: ToolCategory;
  /** Root-level route path for the category page. */
  readonly path: `/${string}`;
  /** Sentence-case heading used in the catalog and page H1. */
  readonly name: string;
  /** SEO title without the brand suffix. */
  readonly title: string;
  /** Meta description, 120 to 165 characters. */
  readonly description: string;
  /** One short sentence shown beside the heading. */
  readonly intro: string;
  /** Catalog order, ascending. */
  readonly order: number;
}

export const categories: readonly ToolCategoryInfo[] = [
  {
    slug: "developer",
    path: "/developer-tools",
    name: "Developer tools",
    title: "Developer tools for JSON, JWT, and data",
    description:
      "Format JSON, decode JWTs, and inspect developer data in a tab that stays on your machine. Nothing you paste is uploaded or stored on a server.",
    intro: "Inspect, format, and decode developer data without sending it anywhere.",
    order: 1,
  },
  {
    slug: "text",
    path: "/text-tools",
    name: "Text tools",
    title: "Text tools for fonts, symbols, and styles",
    description:
      "Style plain text with bold, script, and symbol variants, then copy what you need for social posts, bios, and captions. No extra fonts to install.",
    intro: "Unicode styles and symbols that paste cleanly into posts, bios, and captions.",
    order: 2,
  },
  {
    slug: "random",
    path: "/random-tools",
    name: "Random tools",
    title: "Random tools for pickers, wheels, and dice",
    description:
      "Pick a name, spin a wheel, or roll dice using the browser's cryptographic random source. Each draw is fair, and the history shows what came up.",
    intro: "Fair picks, rolls, and draws from the browser's own random source.",
    order: 3,
  },
  {
    slug: "timer",
    path: "/timer-tools",
    name: "Timer tools",
    title: "Timer tools for Pomodoro and countdowns",
    description:
      "Run a Pomodoro cycle or a countdown that keeps time while the tab sits in the background. Presets, a finish chime, and no account to create.",
    intro: "Timers that stay accurate when the tab moves to the background.",
    order: 4,
  },
  {
    slug: "test",
    path: "/test-tools",
    name: "Test tools",
    title: "Test tools for typing, reaction, and memory",
    description:
      "Measure typing speed, reaction time, memory, and clicks in short, repeatable runs. Each result shows the raw numbers, so you can replay and compare.",
    intro: "Short, repeatable measurements that show the numbers behind the score.",
    order: 5,
  },
];

const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));

export function getCategory(slug: string): ToolCategoryInfo | undefined {
  return categoryBySlug.get(slug as ToolCategory);
}
