import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "symbols",
  name: "Symbols",
  title: "Copy and paste symbols: hearts, stars, arrows",
  description:
    "Search hearts, stars, arrows, currency, math, punctuation, aesthetic, and game symbols by name. Click one to copy it, or copy every symbol in the filtered set.",
  summary:
    "Search a curated symbol set by name or category, copy one with a click, and keep eight recent picks.",
  category: "text",
  topics: ["symbols", "unicode", "copy paste"],
  keywords: [
    "symbols copy paste",
    "heart symbol",
    "star symbol",
    "arrow symbols",
    "text symbols",
  ],
  related: ["fancy-text-generator", "cursive-text-generator", "instagram-fonts", "json-formatter"],
  specs: [
    { label: "Symbols", value: "Eight categories with more than 150 characters" },
    { label: "Search", value: "Matches names, keywords, and the category name" },
    { label: "Copy", value: "One click per symbol, or every visible symbol at once" },
    { label: "Recents", value: "The last eight copied symbols, kept in this browser" },
    { label: "Storage", value: "localStorage for recents only, never for search text" },
    { label: "Network", value: "None. The catalog ships with the page." },
  ],
  added: "2026-11-23",
  updated: "2026-11-23",
  loadTool: () => import("./Tool"),
  loadContent: () => import("./Content"),
};
